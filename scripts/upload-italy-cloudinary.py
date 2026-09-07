#!/usr/bin/env python3
"""
Upload Italy hero images to Cloudinary, then patch the MDX that uses them.

Sources are Wikimedia Commons files named in a manifest; the script pulls the
licence metadata from Commons itself rather than trusting the manifest, writes
the credit into src/data/image-credits.json, and only then rewrites heroImage.
That order matters: a hero whose credit is missing is a licence problem, not a
cosmetic one.

Uploads go to account #3 (bwppi9gc), per 99_Системное/CLOUDINARY_ROUTING.md.
Account #2 is read-only legacy and must never receive an upload.

    python3 scripts/upload-italy-cloudinary.py --manifest scripts/italy-hero-manifest.json
    python3 scripts/upload-italy-cloudinary.py --manifest ... --dry-run
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import ssl
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
ROOT = SCRIPTS.parent
MORE_GROUP = ROOT.parent

if str(MORE_GROUP / "scripts/lib") not in sys.path:
    sys.path.insert(0, str(MORE_GROUP / "scripts/lib"))
from cloudinary_routing import load_cloudinary_credentials  # noqa: E402

ssl._create_default_https_context = ssl._create_unverified_context

UA = {"User-Agent": "MOREGroup-editorial/1.0 (https://italian-estate.com; hero sourcing)"}
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
SOURCE_WIDTH = 2000
HERO_TRANSFORM = "w_1200,q_85,f_webp"
CREDITS = ROOT / "src/data/image-credits.json"


def fetch(url: str, timeout: int = 60) -> bytes:
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout).read()


def commons_file(title: str) -> dict:
    """Image bytes plus the licence fields Commons actually publishes for it."""
    query = urllib.parse.urlencode({
        "action": "query", "titles": f"File:{title}", "prop": "imageinfo",
        "iiprop": "url|extmetadata|size", "iiurlwidth": str(SOURCE_WIDTH), "format": "json",
    })
    pages = json.loads(fetch(f"{COMMONS_API}?{query}"))["query"]["pages"]
    page = next(iter(pages.values()))
    if "imageinfo" not in page:
        raise SystemExit(f"Commons has no file named {title!r}")
    info = page["imageinfo"][0]
    meta = info.get("extmetadata", {})
    plain = lambda k: re.sub(r"<[^>]+>", "", meta.get(k, {}).get("value", "")).strip()

    def artist() -> str:
        """
        Commons puts free text in the Artist field, and some authors fill it with a
        request rather than a name ("I would appreciate being notified..."). Stripping
        the tags then credits the request instead of the person, so prefer the
        username the field links to and fall back to the plain text.
        """
        raw = meta.get("Artist", {}).get("value", "")
        for pattern in (r"Special:EmailUser/([^\"\']+)", r"/wiki/User:([^\"\'#]+)"):
            hit = re.search(pattern, raw)
            if hit:
                return urllib.parse.unquote(hit.group(1)).replace("_", " ").strip()
        text = plain("Artist")
        # Commons repeats the name inside a display:none span, so the stripped text
        # arrives doubled ("Unknown authorUnknown author"). Collapse an exact repeat.
        half = len(text) // 2
        if text and len(text) % 2 == 0 and text[:half] == text[half:]:
            text = text[:half]
        return text if len(text) <= 60 else text[:60].rstrip()
    licence = plain("LicenseShortName")
    if not licence or any(b in licence.lower() for b in ("non-free", "fair use")):
        raise SystemExit(f"{title!r} is not under a free licence ({licence!r}); refusing to upload")
    return {
        "bytes": fetch(info.get("thumburl") or info["url"]),
        "file": title.replace(" ", "_"),
        "source": info["descriptionurl"],
        "artist": artist(),
        "license": licence,
        "licenseUrl": meta.get("LicenseUrl", {}).get("value", ""),
    }


def cloudinary_upload(data: bytes, public_id: str, cloud: str, key: str, secret: str) -> str:
    timestamp = int(time.time())
    signature = hashlib.sha1(
        f"overwrite=true&public_id={public_id}&timestamp={timestamp}{secret}".encode()
    ).hexdigest()
    boundary = "----MOREGroupHero"

    def field(name: str, value: str) -> bytes:
        return (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n"
                f"{value}\r\n").encode()

    body = b"".join([
        field("public_id", public_id), field("overwrite", "true"),
        field("timestamp", str(timestamp)), field("api_key", key), field("signature", signature),
        (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; "
         f"filename=\"upload.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n").encode(),
        data, f"\r\n--{boundary}--\r\n".encode(),
    ])
    req = urllib.request.Request(
        f"https://api.cloudinary.com/v1_1/{cloud}/image/upload", data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    return json.loads(urllib.request.urlopen(req, timeout=120).read())["secure_url"]


def record_credit(entry: dict, page: str) -> None:
    credits = json.loads(CREDITS.read_text(encoding="utf-8"))
    for row in credits:
        if row["file"] == entry["file"]:
            if page not in row["pages"]:
                row["pages"].append(page)
            break
    else:
        credits.append({
            "file": entry["file"], "source": entry["source"], "artist": entry["artist"],
            "license": entry["license"], "licenseUrl": entry["licenseUrl"], "pages": [page],
        })
    credits.sort(key=lambda r: r["file"])
    CREDITS.write_text(json.dumps(credits, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def patch_hero(collection: str, slug: str, url: str) -> None:
    path = ROOT / f"src/content/{collection}/{slug}.mdx"
    text = path.read_text(encoding="utf-8")
    patched, n = re.subn(r'^heroImage:\s*".*?"$', f'heroImage: "{url}"', text, count=1, flags=re.M)
    if n != 1:
        raise SystemExit(f"no heroImage line to patch in {path}")
    path.write_text(patched, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--slug", action="append", default=[],
                        help="Only process these slugs. Re-uploading a hero costs plan credits, so a top-up run should name what it needs.")
    args = parser.parse_args()

    cloud, key, secret = load_cloudinary_credentials(ROOT)
    if cloud != "bwppi9gc":
        raise SystemExit(f"refusing to upload to {cloud!r}: new heroes go to bwppi9gc only")

    for item in json.loads(Path(args.manifest).read_text(encoding="utf-8"))["heroes"]:
        slug, collection = item["slug"], item.get("collection", "guides")
        if args.slug and slug not in args.slug:
            continue
        entry = commons_file(item["commons"])
        public_id = f"more-group/italy/{collection}/{slug}/hero"
        page = f"/{collection}/{slug}/"
        print(f"{slug}\n  {entry['license']} · {entry['artist'] or 'unattributed'}")
        if args.dry_run:
            print(f"  would upload -> {public_id}\n")
            continue
        cloudinary_upload(entry["bytes"], public_id, cloud, key, secret)
        url = f"https://res.cloudinary.com/{cloud}/image/upload/{HERO_TRANSFORM}/{public_id}"
        record_credit(entry, page)
        patch_hero(collection, slug, url)
        print(f"  uploaded and patched -> {url}\n")


if __name__ == "__main__":
    main()

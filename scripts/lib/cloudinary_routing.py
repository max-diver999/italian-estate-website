"""Cloudinary routing — MORE Group (Phuket + niche legacy + niche active)."""
from __future__ import annotations

import os
import re
from pathlib import Path

CLOUDINARY_PHUKET = "dphvjbqb4"
CLOUDINARY_NICHE_LEGACY = "dlrrtf6bq"
CLOUDINARY_NICHE_ACTIVE = "bwppi9gc"
CLOUDINARY_NICHE = CLOUDINARY_NICHE_ACTIVE

ALL_ALLOWED_CLOUDS = frozenset(
    {CLOUDINARY_PHUKET, CLOUDINARY_NICHE_LEGACY, CLOUDINARY_NICHE_ACTIVE}
)

PHUKET_SITE_DIRS = frozenset({"more-group-website", "moregroupestate-ru"})

TRANSFORMS = {
    "hero": "w_1200,q_85,f_webp",
    "inline": "w_960,q_85,f_webp",
    "thumb": "w_640,h_360,c_fill,q_80,f_webp",
    "og": "w_1200,q_85,f_webp",
}

UPLOAD_ROLES = frozenset({"hero", "inline-1", "inline-2"})
UPLOAD_MAX_DIMENSION = 1920
UPLOAD_JPEG_QUALITY = 78

_TRANSFORM_TOKEN = re.compile(r"^(w_|h_|c_|f_|q_|g_|e_|b_|dpr_|fl_|a_)")


def load_env_file(path: Path) -> None:
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        if key and key not in os.environ:
            os.environ[key] = value.strip().strip('"').strip("'")


def _repo_root(site_root: Path) -> Path:
    return site_root.parent


def _niche_active_env_paths(repo_root: Path) -> tuple[Path, ...]:
    base = repo_root / "99_Системное"
    return (
        base / ".env.cloudinary-niche-active",
        base / ".env.cloudinary-niche-active.local",
    )


def cloud_name_for_site_dir(site_dir_name: str) -> str:
    if site_dir_name in PHUKET_SITE_DIRS:
        return CLOUDINARY_PHUKET
    return CLOUDINARY_NICHE_ACTIVE


def load_cloudinary_credentials(site_root: Path) -> tuple[str, str, str]:
    """
    Credentials for UPLOAD.
    Niche sites → account #3 (bwppi9gc) via 99_Системное/.env.cloudinary-niche-active.
    Phuket → site .env.local (dphvjbqb4).
    """
    site_root = Path(site_root)
    repo_root = _repo_root(site_root)
    site_dir = site_root.name

    load_env_file(site_root / ".env.local")
    load_env_file(site_root / ".env")

    if site_dir not in PHUKET_SITE_DIRS:
        for path in _niche_active_env_paths(repo_root):
            load_env_file(path)

    cloud = os.environ.get("CLOUDINARY_CLOUD_NAME") or cloud_name_for_site_dir(site_dir)
    key = os.environ.get("CLOUDINARY_API_KEY") or ""
    secret = os.environ.get("CLOUDINARY_API_SECRET") or ""

    if not key or not secret:
        raise SystemExit(
            "Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET.\n"
            "Niche upload: 99_Системное/.env.cloudinary-niche-active (cloud bwppi9gc).\n"
            "Phuket: more-group-website/.env.local.\n"
            "Claude Code cloud: set CLOUDINARY_* in MORE Group Content env."
        )

    return cloud, key, secret


def has_delivery_transform(url: str) -> bool:
    if not url or "res.cloudinary.com/" not in url:
        return False
    after = url.split("/image/upload/", 1)[-1]
    for seg in after.split("/"):
        if re.match(r"^v\d+$", seg):
            continue
        if "," in seg or _TRANSFORM_TOKEN.match(seg):
            return True
        break
    return False


def extract_public_id(url: str) -> str | None:
    m = re.search(r"/image/upload/(.+)$", url)
    if not m:
        return None
    parts = m.group(1).split("?")[0].split("/")
    while len(parts) > 1:
        head = parts[0]
        if re.match(r"^v\d+$", head) or "," in head or _TRANSFORM_TOKEN.match(head):
            parts.pop(0)
            continue
        break
    pid = "/".join(parts)
    return re.sub(r"\.(jpg|jpeg|png|webp|gif)$", "", pid, flags=re.I)


def build_cloudinary_image_url(cloud_name: str, public_path: str, transform: str = "") -> str:
    t = f"{transform.strip('/')}/" if transform else ""
    return f"https://res.cloudinary.com/{cloud_name}/image/upload/{t}{public_path.lstrip('/')}"


def delivery_url(url_or_public_id: str, role: str = "hero") -> str:
    transform = TRANSFORMS.get(role, TRANSFORMS["hero"])
    if not url_or_public_id:
        return url_or_public_id
    if url_or_public_id.startswith("http"):
        if has_delivery_transform(url_or_public_id):
            return url_or_public_id
        m = re.search(r"res\.cloudinary\.com/([a-z0-9]+)/", url_or_public_id)
        cloud = m.group(1) if m else CLOUDINARY_NICHE_ACTIVE
        pid = extract_public_id(url_or_public_id)
        if not pid:
            return url_or_public_id
        return build_cloudinary_image_url(cloud, pid, transform)
    return build_cloudinary_image_url(CLOUDINARY_NICHE_ACTIVE, url_or_public_id, transform)

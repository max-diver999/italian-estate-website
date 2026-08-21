#!/usr/bin/env node
/**
 * Wave 2 — move hotlinked hero images onto Cloudinary.
 *
 * 111 of 252 pages set `heroImage` to upload.wikimedia.org. 42 of those point at
 * the full-resolution original (no /thumb/, no width cap), and responsiveCloudinary()
 * only rewrites Cloudinary URLs — so those heroes ship with no srcset, no sizes and
 * no format conversion, as the LCP element. Wikimedia also rate-limits hotlinking:
 * 8 of 14 sampled URLs returned HTTP 429, i.e. real visitors get a broken hero.
 *
 * This script, per slug:
 *   1. reads the Commons API for license + author (these are CC-licensed images and
 *      the site currently credits nobody),
 *   2. downloads a width-capped rendition rather than the original,
 *   3. uploads to Cloudinary as more-group/italy/{collection}/{slug}/hero,
 *   4. rewrites `heroImage` in frontmatter, and with --inline the markdown image
 *      URLs in the body too (URL swap only — alt text and prose untouched),
 *   5. writes scripts/reports/hero-migration-manifest.json with the attribution.
 *
 * Wikimedia's User-Agent policy requires a descriptive UA with contact info, and
 * requests are serialised with a delay because the 429s are why we are here.
 *
 * Usage:
 *   node scripts/migrate-heroes-to-cloudinary.mjs --collection areas [--dry] [--limit N]
 *   node scripts/migrate-heroes-to-cloudinary.mjs --inline --collection projects
 *   node scripts/migrate-heroes-to-cloudinary.mjs --all --dry
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const REPORTS = join(ROOT, 'scripts/reports');
const MANIFEST = join(REPORTS, 'hero-migration-manifest.json');

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const valOf = (f, d) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};

const DRY = has('--dry');
/** Migrate inline body images (markdown ![alt](url)) instead of the frontmatter hero. */
const INLINE = has('--inline');
const COLLECTION = valOf('--collection', null);
const LIMIT = Number(valOf('--limit', '0')) || Infinity;
/** Wikimedia asks for a descriptive UA with contact details. */
const UA = 'italian-estate.com hero-migration/1.0 (https://italian-estate.com; info@italian-estate.com)';
/** Serialised, with a pause — hotlink rate limiting is the defect being fixed. */
const REQUEST_DELAY_MS = 1200;
/** Cap the rendition we pull; nothing on the page renders wider than 1200. */
const TARGET_WIDTH = 1600;

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;
if (!DRY && (!CLOUD || !KEY || !SECRET)) {
  console.error('Missing CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET in the environment.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function listTargets() {
  const out = [];
  for (const coll of readdirSync(CONTENT)) {
    if (COLLECTION && coll !== COLLECTION) continue;
    const dir = join(CONTENT, coll);
    for (const f of readdirSync(dir).filter((x) => /\.mdx?$/.test(x))) {
      const path = join(dir, f);
      const raw = readFileSync(path, 'utf8');
      const slug = f.replace(/\.mdx?$/, '');
      if (INLINE) {
        // Markdown images in the body render as a bare <img>: no srcset, no
        // dimensions, and the same hotlink rate limiting as the heroes.
        const seen = new Set();
        let n = 0;
        for (const m of raw.matchAll(/!\[[^\]]*\]\((https?:\/\/upload\.wikimedia\.org[^)\s]+)\)/g)) {
          if (seen.has(m[1])) continue;
          seen.add(m[1]);
          n += 1;
          out.push({ coll, slug, path, hero: m[1], role: `inline_${n}` });
        }
      } else {
        const m = raw.match(/^heroImage:\s*["']?(https?:\/\/[^"'\s]+)["']?\s*$/m);
        if (!m || !m[1].includes('upload.wikimedia.org')) continue;
        out.push({ coll, slug, path, hero: m[1], role: 'hero' });
      }
    }
  }
  return out;
}

/** "…/commons/a/ab/Foo_bar.jpg" or "…/commons/thumb/a/ab/Foo_bar.jpg/1280px-Foo_bar.jpg" */
function commonsFileName(url) {
  const clean = url.split('?')[0];
  if (clean.includes('/thumb/')) {
    const parts = clean.split('/');
    return decodeURIComponent(parts[parts.length - 2]);
  }
  return decodeURIComponent(clean.split('/').pop());
}

async function wikimedia(url, { json = false } = {}) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: json ? 'application/json' : '*/*' } });
    if (res.status === 429 || res.status === 503) {
      const wait = REQUEST_DELAY_MS * 2 ** (attempt + 1);
      console.log(`      ${res.status} from Wikimedia — waiting ${wait}ms`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return json ? res.json() : Buffer.from(await res.arrayBuffer());
  }
  throw new Error('rate limited after 4 attempts');
}

const stripHtml = (s) => (s ? String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '');

/** License + author + a width-capped download URL, straight from the Commons API. */
async function commonsInfo(fileName) {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo' +
    `&iiprop=url|extmetadata&iiurlwidth=${TARGET_WIDTH}&titles=${encodeURIComponent(`File:${fileName}`)}`;
  const data = await wikimedia(api, { json: true });
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info) throw new Error('no imageinfo returned');
  const meta = info.extmetadata ?? {};
  return {
    downloadUrl: info.thumburl || info.url,
    descriptionUrl: info.descriptionurl,
    license: stripHtml(meta.LicenseShortName?.value) || 'unknown',
    licenseUrl: stripHtml(meta.LicenseUrl?.value) || '',
    artist: stripHtml(meta.Artist?.value) || 'unknown',
    credit: stripHtml(meta.Credit?.value) || '',
  };
}

function cloudinarySignature(params) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(toSign + SECRET).digest('hex');
}

async function uploadToCloudinary(buffer, publicId, fileName) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { overwrite: 'true', public_id: publicId, timestamp: String(timestamp) };
  const form = new FormData();
  form.append('file', new Blob([buffer]), fileName);
  for (const [k, v] of Object.entries(params)) form.append(k, v);
  form.append('api_key', KEY);
  form.append('signature', cloudinarySignature(params));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: form });
  const body = await res.json();
  if (!res.ok) throw new Error(`Cloudinary ${res.status}: ${body?.error?.message ?? 'unknown'}`);
  return body;
}

const targets = listTargets().slice(0, LIMIT);
console.log(`\n=== HERO MIGRATION — Wikimedia to Cloudinary ===`);
console.log(
  `Scope: ${COLLECTION ?? 'all collections'} | ${INLINE ? 'inline body images' : 'frontmatter heroes'}` +
    ` | targets: ${targets.length}${DRY ? ' | DRY RUN' : ''}\n`,
);
if (!targets.length) {
  console.log('Nothing to migrate.\n');
  process.exit(0);
}

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { updated: null, heroes: {} };
const done = [];
const failed = [];

for (const [i, t] of targets.entries()) {
  const id = `${t.coll}/${t.slug}`;
  const publicId = `more-group/italy/${t.coll}/${t.slug}/${t.role}`;
  process.stdout.write(`[${String(i + 1).padStart(3)}/${targets.length}] ${id} … `);
  try {
    const fileName = commonsFileName(t.hero);
    const info = await commonsInfo(fileName);
    if (DRY) {
      console.log(`would upload ${fileName} (${info.license}) -> ${publicId}`);
      done.push({ id, publicId, ...info, sourceFile: fileName });
      await sleep(REQUEST_DELAY_MS);
      continue;
    }
    await sleep(REQUEST_DELAY_MS);
    const buffer = await wikimedia(info.downloadUrl);
    const uploaded = await uploadToCloudinary(buffer, publicId, fileName);
    const newUrl = `https://res.cloudinary.com/${CLOUD}/image/upload/${uploaded.public_id}`;

    const raw = readFileSync(t.path, 'utf8');
    // URL swap only — alt text and surrounding prose are never touched.
    const next = INLINE
      ? raw.split(t.hero).join(newUrl)
      : raw.replace(/^heroImage:\s*["']?https?:\/\/[^"'\s]+["']?\s*$/m, `heroImage: "${newUrl}"`);
    if (next === raw) throw new Error('image URL rewrite matched nothing');
    writeFileSync(t.path, next);

    manifest.heroes[`${id}#${t.role}`] = {
      cloudinary: newUrl,
      publicId: uploaded.public_id,
      bytes: uploaded.bytes,
      width: uploaded.width,
      height: uploaded.height,
      source: t.hero,
      sourceFile: fileName,
      descriptionUrl: info.descriptionUrl,
      license: info.license,
      licenseUrl: info.licenseUrl,
      artist: info.artist,
    };
    done.push({ id, publicId, ...info });
    console.log(`ok ${(uploaded.bytes / 1024).toFixed(0)}KB ${uploaded.width}x${uploaded.height} [${info.license}]`);
  } catch (err) {
    failed.push({ id, hero: t.hero, error: String(err.message ?? err) });
    console.log(`FAILED — ${err.message ?? err}`);
  }
  await sleep(REQUEST_DELAY_MS);
}

if (!DRY && done.length) {
  mkdirSync(REPORTS, { recursive: true });
  manifest.updated = process.env.MIGRATION_DATE || manifest.updated;
  manifest.note =
    'Hero images migrated off hotlinked upload.wikimedia.org (Wave 2). Attribution is kept here ' +
    'because these are CC-licensed Commons files and the site credited nobody.';
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nManifest: ${MANIFEST.replace(ROOT, '.')}`);
}

console.log(`\nMigrated: ${done.length} | failed: ${failed.length}`);
for (const f of failed) console.log(`  ✗ ${f.id}: ${f.error}`);
process.exit(failed.length ? 1 : 0);

/**
 * Cloudinary delivery gate — image-URL checks shared by the content gates.
 *
 * Restored 2026-08-20 (Wave 0). This module was imported by more-content-gate.mjs
 * from '../../../scripts/lib/cloudinary-gate.mjs' — a path resolving two levels
 * ABOVE the repository root — and existed in neither repo, so `validate:content`
 * and every script importing it crashed with ERR_MODULE_NOT_FOUND.
 *
 * Contract (unchanged from the original call site):
 *   runCloudinaryDeliveryChecks({ prefix, text, errors, legacyExempt })
 *   - pushes human-readable strings onto `errors`
 *   - `legacyExempt` suppresses the stylistic/migration checks, never the
 *     hard-breakage ones
 */

/** Hosts we deliberately deliver images from. */
const CLOUDINARY_HOST = 'res.cloudinary.com';

/**
 * External hosts currently present in the corpus that are NOT self-hosted.
 * Wikimedia is tracked separately: it is a migration backlog (Wave 2), not a
 * per-PR blocker, so it is reported as a soft finding unless it is a new file.
 */
const BANNED_IMAGE_HOSTS = [
  { host: 'images.unsplash.com', why: 'stock hero — use the Cloudinary pipeline' },
  { host: 'unsplash.com', why: 'stock hero — use the Cloudinary pipeline' },
  { host: 'source.unsplash.com', why: 'random stock hero — never ships' },
  { host: 'via.placeholder.com', why: 'placeholder image left in content' },
  { host: 'placehold.co', why: 'placeholder image left in content' },
  { host: 'example.com', why: 'placeholder image left in content' },
];

const SOFT_IMAGE_HOSTS = [
  { host: 'upload.wikimedia.org', why: 'hotlinked from Wikimedia (rate-limited, no srcset) — migrate to Cloudinary' },
];

const IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|gif|avif)(\?|#|$)/i;

/** Every http(s) URL that looks like an image, from frontmatter and body alike. */
export function extractImageUrls(text) {
  const urls = new Set();
  const re = /https?:\/\/[^\s"')>\]}]+/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const url = m[0].replace(/[.,;:]+$/, '');
    if (url.includes(CLOUDINARY_HOST) || IMAGE_EXT_RE.test(url) || SOFT_IMAGE_HOSTS.some((h) => url.includes(h.host))) {
      urls.add(url);
    }
  }
  return [...urls];
}

/**
 * @param {object} opts
 * @param {string} opts.prefix        log prefix, e.g. "[guides/foo]"
 * @param {string} opts.text          full file text (frontmatter + body)
 * @param {string[]} opts.errors      mutated in place
 * @param {boolean} [opts.legacyExempt]
 * @param {string[]} [opts.warnings]  optional soft-finding channel
 */
export function runCloudinaryDeliveryChecks({ prefix, text, errors, legacyExempt = false, warnings }) {
  if (!text) return;
  const soft = Array.isArray(warnings) ? warnings : errors;
  const urls = extractImageUrls(text);

  for (const url of urls) {
    // Hard breakage — always an error, legacy or not.
    if (url.startsWith('http://')) {
      errors.push(`${prefix} insecure http:// image URL (mixed content): ${url.slice(0, 90)}`);
    }

    for (const { host, why } of BANNED_IMAGE_HOSTS) {
      if (url.includes(host)) errors.push(`${prefix} banned image host ${host} — ${why}`);
    }

    if (url.includes(CLOUDINARY_HOST)) {
      // res.cloudinary.com/<cloud>/image/upload/<transform?>/<publicId>
      const m = url.match(/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.*)$/);
      if (!m) {
        errors.push(`${prefix} malformed Cloudinary delivery URL: ${url.slice(0, 90)}`);
      } else {
        const [, cloud, rest] = m;
        if (!cloud || cloud.includes('${') || cloud === 'undefined') {
          errors.push(`${prefix} Cloudinary URL with unresolved cloud name: ${url.slice(0, 90)}`);
        }
        if (!rest || rest.includes('${') || rest === 'undefined') {
          errors.push(`${prefix} Cloudinary URL with unresolved public id: ${url.slice(0, 90)}`);
        }
      }
      continue;
    }

    if (legacyExempt) continue;

    for (const { host, why } of SOFT_IMAGE_HOSTS) {
      if (url.includes(host)) soft.push(`${prefix} external image host ${host} — ${why}`);
    }
  }
}

/**
 * Standalone host classification, reused by audit-p0-quality.mjs so the hero
 * check is not limited to /unsplash/i.
 * @returns {'cloudinary'|'banned'|'soft-external'|'relative'|'external'|'none'}
 */
export function classifyImageHost(url) {
  if (!url) return 'none';
  if (!/^https?:\/\//.test(url)) return 'relative';
  if (url.includes(CLOUDINARY_HOST)) return 'cloudinary';
  if (BANNED_IMAGE_HOSTS.some((h) => url.includes(h.host))) return 'banned';
  if (SOFT_IMAGE_HOSTS.some((h) => url.includes(h.host))) return 'soft-external';
  return 'external';
}

export { BANNED_IMAGE_HOSTS, SOFT_IMAGE_HOSTS, CLOUDINARY_HOST };

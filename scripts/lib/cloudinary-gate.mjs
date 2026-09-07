/**
 * Cloudinary delivery optimization — prevent bandwidth over-limit.
 * Import from rollout scripts, more-content-gate, validate.
 */
import {
  CLOUDINARY_PHUKET,
  CLOUDINARY_NICHE,
  CLOUDINARY_NICHE_ACTIVE,
  ALL_ALLOWED_CLOUDS,
  buildCloudinaryImageUrl,
} from './cloudinary-routing.mjs';

export const ALLOWED_CLOUDS = ALL_ALLOWED_CLOUDS;

/** Single transform chain per role — fewer derived variants in storage. */
export const TRANSFORMS = {
  hero: 'w_1200,q_85,f_webp',
  inline: 'w_960,q_85,f_webp',
  thumb: 'w_640,h_360,c_fill,q_80,f_webp',
  og: 'w_1200,q_85,f_webp',
};

const CLOUDINARY_URL_RE =
  /https:\/\/res\.cloudinary\.com\/([a-z0-9]+)\/image\/upload\/([^"'`\s\)]+)/g;

const TRANSFORM_TOKEN_RE = /^(w_|h_|c_|f_|q_|g_|e_|b_|dpr_|fl_|a_)/;

/**
 * URL has resize/format transform (not bare original delivery).
 */
export function hasDeliveryTransform(url) {
  if (!url || !url.includes('res.cloudinary.com/')) return false;
  const after = url.split('/image/upload/')[1];
  if (!after) return false;
  const segments = after.split('/');
  for (const seg of segments) {
    if (/^v\d+$/.test(seg)) continue;
    if (seg.includes(',') || TRANSFORM_TOKEN_RE.test(seg)) return true;
    break;
  }
  return false;
}

export function isAllowedCloudinaryCloud(url) {
  const m = url?.match(/res\.cloudinary\.com\/([a-z0-9]+)\//);
  return m && ALLOWED_CLOUDS.has(m[1]);
}

export function extractPublicId(url) {
  const m = url.match(/\/image\/upload\/(.+)$/);
  if (!m) return null;
  let rest = m[1].split('?')[0];
  const parts = rest.split('/');
  while (parts.length > 1) {
    const head = parts[0];
    if (/^v\d+$/.test(head)) {
      parts.shift();
      continue;
    }
    if (head.includes(',') || TRANSFORM_TOKEN_RE.test(head)) {
      parts.shift();
      continue;
    }
    break;
  }
  return parts.join('/').replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
}

/**
 * Ensure delivery URL uses standard transform (bandwidth-safe).
 * @param {string} urlOrPublicId
 * @param {'hero'|'inline'|'thumb'|'og'} [role]
 */
export function deliveryUrl(urlOrPublicId, role = 'hero') {
  if (!urlOrPublicId) return urlOrPublicId;
  const transform = TRANSFORMS[role] || TRANSFORMS.hero;

  if (urlOrPublicId.startsWith('http')) {
    if (hasDeliveryTransform(urlOrPublicId)) return urlOrPublicId;
    const cloud = urlOrPublicId.match(/res\.cloudinary\.com\/([a-z0-9]+)\//)?.[1];
    const pid = extractPublicId(urlOrPublicId);
    if (!cloud || !pid) return urlOrPublicId;
    return buildCloudinaryImageUrl(cloud, pid, transform);
  }

  const cloud = CLOUDINARY_NICHE;
  return buildCloudinaryImageUrl(cloud, urlOrPublicId.replace(/^\//, ''), transform);
}

/**
 * Validate heroImage URL — account + optimized delivery.
 */
export function validateHeroImageUrl(url, { allowLocal = false } = {}) {
  const errors = [];
  if (!url) return errors;
  if (allowLocal && url.startsWith('/images/')) return errors;
  if (!url.includes('cloudinary.com')) {
    errors.push('heroImage must use Cloudinary or allowed local /images/ path');
    return errors;
  }
  if (!isAllowedCloudinaryCloud(url)) {
    errors.push(
      `heroImage must use dphvjbqb4 (Phuket), dlrrtf6bq (legacy niche), or bwppi9gc (active niche)`,
    );
  }
  if (!hasDeliveryTransform(url)) {
    errors.push(
      `heroImage bare Cloudinary URL (delivers full original → bandwidth). Use transform: ${TRANSFORMS.hero}`,
    );
  }
  return errors;
}

/**
 * Scan MDX/markdown for bare Cloudinary URLs in body + frontmatter.
 */
export function findBareCloudinaryUrls(text) {
  const bare = [];
  let m;
  CLOUDINARY_URL_RE.lastIndex = 0;
  while ((m = CLOUDINARY_URL_RE.exec(text))) {
    const url = m[0];
    if (!hasDeliveryTransform(url)) bare.push(url);
  }
  return bare;
}

export function runCloudinaryDeliveryChecks({ prefix, text, errors, legacyExempt = false }) {
  if (legacyExempt) return;
  const bare = findBareCloudinaryUrls(text);
  if (bare.length) {
    errors.push(
      `${prefix} ${bare.length} bare Cloudinary URL(s) — add ${TRANSFORMS.hero} (bandwidth). First: ${bare[0].slice(0, 90)}…`,
    );
  }
}

/**
 * HTTP Basic auth for internal-only routes.
 *
 * Plain JS on purpose: src/middleware.ts imports it, and
 * scripts/test-internal-auth.mjs imports the same module directly, so the tested
 * code is the shipped code rather than a transformed copy.
 *
 * Context: /site-report published internal analytics — GSC clicks, impressions,
 * CTR and average position, GA4 sessions, the confirmed-lead count, Kommo and
 * Telegram plumbing notes, the growth roadmap — with no authentication and no
 * `noindex`, reachable by anyone holding the URL.
 *
 * robots.txt made that worse rather than better. `Disallow: /site-report/`
 *   - does NOT prevent indexing: Google still indexes a disallowed URL it finds
 *     linked or shared, listing it as "No information is available",
 *   - actively PREVENTS de-indexing, because a crawler that may not fetch the
 *     page can never see a `noindex` on it,
 *   - and, robots.txt being public, advertises the path to anyone who reads it.
 *
 * So the Disallow was removed and the route locked instead. Google drops URLs
 * that consistently answer 401.
 */
import { timingSafeEqual } from 'node:crypto';

export const PROTECTED_PREFIXES = ['/site-report'];
const REALM = 'Italian Estate internal';

export function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Constant-time compare that does not leak length through an early return. */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function challenge() {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

/**
 * @returns {boolean} true when the request carries valid credentials.
 *
 * Fails closed: with no configured password nothing can match, so the route
 * stays locked rather than falling open.
 */
export function isAuthorised(request, { user, password } = {}) {
  if (!password) return false;

  const header = request.headers.get('authorization') || '';
  const sepIdx = header.indexOf(' ');
  const scheme = sepIdx < 0 ? '' : header.slice(0, sepIdx);
  const encoded = sepIdx < 0 ? '' : header.slice(sepIdx + 1);
  if (!encoded || scheme.toLowerCase() !== 'basic') return false;

  let decoded = '';
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8');
  } catch {
    return false;
  }

  const sep = decoded.indexOf(':');
  if (sep < 0) return false;

  // Both are always compared, so a wrong username cannot short-circuit.
  const userOk = safeEqual(decoded.slice(0, sep), user || 'maxim');
  const passOk = safeEqual(decoded.slice(sep + 1), password);
  return userOk && passOk;
}

export function credentialsFromEnv(env = {}) {
  return {
    user: env.SITE_REPORT_USER || process.env.SITE_REPORT_USER || 'maxim',
    password: env.SITE_REPORT_PASSWORD || process.env.SITE_REPORT_PASSWORD || '',
  };
}

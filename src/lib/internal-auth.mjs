/**
 * HTTP Basic auth for internal-only routes.
 *
 * Plain JS on purpose: src/middleware.ts imports it, and
 * scripts/test-internal-auth.mjs imports the same module directly, so the tested
 * code is the shipped code rather than a transformed copy.
 *
 * Context: /site-report is a noindex portfolio dashboard. It stays public
 * (like other MORE Group site reports). Middleware remains available for
 * future internal routes if needed.
 */
import { timingSafeEqual } from 'node:crypto';

export const PROTECTED_PREFIXES = [];
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

import type { MiddlewareHandler } from 'astro';
import { challenge, credentialsFromEnv, isAuthorised, isProtectedPath } from './lib/internal-auth.mjs';

/**
 * Optional HTTP Basic auth for internal-only routes (none configured today).
 *
 * /site-report is prerendered and public like other portfolio site reports.
 */
export const onRequest: MiddlewareHandler = async (context, next) => {
  if (!isProtectedPath(context.url.pathname)) return next();

  const creds = credentialsFromEnv(import.meta.env);
  if (!isAuthorised(context.request, creds)) return challenge();

  const response = await next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  response.headers.set('Cache-Control', 'no-store, private');
  return response;
};

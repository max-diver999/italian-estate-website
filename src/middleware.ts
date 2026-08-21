import type { MiddlewareHandler } from 'astro';
import { challenge, credentialsFromEnv, isAuthorised, isProtectedPath } from './lib/internal-auth.mjs';

/**
 * Gates internal-only routes behind HTTP Basic auth.
 *
 * The logic lives in src/lib/internal-auth.mjs so that
 * scripts/test-internal-auth.mjs can import and test exactly the code that
 * ships. See that module for why robots.txt was the wrong tool here.
 *
 * Middleware only runs for on-demand routes, so any page listed in
 * PROTECTED_PREFIXES must set `export const prerender = false`.
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

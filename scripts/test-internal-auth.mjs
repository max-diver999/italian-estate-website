#!/usr/bin/env node
/**
 * Regression test for the /site-report access gate.
 *
 * The page shipped publicly with internal analytics on it. This asserts it
 * cannot regress to that state: every unauthenticated shape must be refused,
 * and an unconfigured password must fail CLOSED rather than open.
 *
 * `astro preview` cannot exercise this — the Vercel adapter does not run the
 * serverless function locally — so the shipped module is imported directly.
 *
 * Usage: node scripts/test-internal-auth.mjs
 */
import { challenge, isAuthorised, isProtectedPath } from '../src/lib/internal-auth.mjs';

const USER = 'maxim';
const PASSWORD = 'test-password-123';

const req = (auth) =>
  new Request('https://italian-estate.com/site-report/', {
    headers: auth ? { authorization: `Basic ${Buffer.from(auth).toString('base64')}` } : {},
  });

let failures = 0;
const check = (name, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(46)} ${actual}`);
};

console.log('\n=== INTERNAL AUTH GATE ===\n');
console.log('Path matching:');
for (const [path, expected] of [
  ['/site-report', true],
  ['/site-report/', true],
  ['/site-report/anything/', true],
  ['/site-reporting/', false],
  ['/guides/', false],
  ['/', false],
]) {
  check(`isProtectedPath("${path}")`, isProtectedPath(path), expected);
}

console.log('\nCredentials (password configured):');
const creds = { user: USER, password: PASSWORD };
for (const [name, auth, expected] of [
  ['no authorization header', null, false],
  ['wrong password', `${USER}:wrong`, false],
  ['wrong user', `admin:${PASSWORD}`, false],
  ['empty password', `${USER}:`, false],
  ['malformed header', 'garbage', false],
  ['bearer instead of basic', null, false],
  ['password as prefix of real one', `${USER}:${PASSWORD.slice(0, -1)}`, false],
  ['correct credentials', `${USER}:${PASSWORD}`, true],
  ['password containing a colon', `${USER}:${PASSWORD}`, true],
]) {
  check(name, isAuthorised(req(auth), creds), expected);
}

// A password with a colon in it must survive the user:pass split.
check(
  'colon inside the password',
  isAuthorised(req(`${USER}:pa:ss:word`), { user: USER, password: 'pa:ss:word' }),
  true,
);

console.log('\nFail-closed (no password configured):');
for (const [name, auth] of [
  ['no credentials', null],
  ['any credentials', `${USER}:${PASSWORD}`],
  ['empty credentials', ':'],
]) {
  check(name, isAuthorised(req(auth), { user: USER, password: '' }), false);
}
check('…and with the whole config missing', isAuthorised(req(`${USER}:x`), {}), false);

console.log('\nChallenge response:');
const c = challenge();
check('status', c.status, 401);
check('WWW-Authenticate present', c.headers.get('www-authenticate')?.startsWith('Basic'), true);
check('X-Robots-Tag noindex', c.headers.get('x-robots-tag')?.includes('noindex'), true);
check('not cacheable', c.headers.get('cache-control'), 'no-store');

if (failures) {
  console.error(`\n❌ ${failures} assertion(s) failed\n`);
  process.exit(1);
}
console.log('\n✅ PASS — /site-report cannot be reached without credentials.\n');

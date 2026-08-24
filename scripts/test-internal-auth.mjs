#!/usr/bin/env node
/**
 * Regression test for optional internal-route Basic auth.
 *
 * /site-report is public (prerendered, no gate). This test ensures the auth
 * helper still fails closed when a protected prefix is configured later.
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
console.log('Path matching (no protected prefixes configured):');
for (const [path, expected] of [
  ['/site-report', false],
  ['/site-report/', false],
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
  ['correct credentials', `${USER}:${PASSWORD}`, true],
]) {
  check(name, isAuthorised(req(auth), creds), expected);
}

console.log('\nFail-closed (no password configured):');
check('any credentials', isAuthorised(req(`${USER}:${PASSWORD}`), { user: USER, password: '' }), false);

console.log('\nChallenge response:');
const c = challenge();
check('status', c.status, 401);
check('WWW-Authenticate present', c.headers.get('www-authenticate')?.startsWith('Basic'), true);

if (failures) {
  console.error(`\n❌ ${failures} assertion(s) failed\n`);
  process.exit(1);
}
console.log('\n✅ PASS — auth helper OK; /site-report is not gated.\n');

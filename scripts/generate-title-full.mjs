#!/usr/bin/env node
/**
 * Generate full-corpus title rewrites from title-full-audit.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fullTitle } from './lib/title-utils.mjs';
import { rewriteTitle, validateRewrite } from './lib/title-rewrite.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const audit = JSON.parse(readFileSync(join(__dirname, 'title-full-audit.json'), 'utf8'));

const out = {};
const failures = [];
const unchanged = [];

for (const row of audit) {
  const next = rewriteTitle(row);
  if (!next || !validateRewrite(row, next)) {
    failures.push({ slug: row.slug, title: row.title, next, issues: row.issues });
    continue;
  }
  if (next === row.title) {
    unchanged.push(row.slug);
    continue;
  }
  out[row.slug] = {
    old: row.title,
    new: next,
    full: fullTitle(next),
    len: next.length,
    serpLen: fullTitle(next).length,
    issues: row.issues,
  };
}

writeFileSync(join(__dirname, 'title-full-rewrites.json'), JSON.stringify(out, null, 2));
writeFileSync(
  join(__dirname, 'title-full-failures.json'),
  JSON.stringify({ failures, unchanged }, null, 2),
);

console.log('audit rows', audit.length);
console.log('rewrites', Object.keys(out).length);
console.log('unchanged (still bad)', unchanged.length);
console.log('failures', failures.length);
if (failures.length) {
  console.log(JSON.stringify(failures.slice(0, 8), null, 2));
  process.exitCode = failures.length > 50 ? 1 : 0;
}

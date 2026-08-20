#!/usr/bin/env node
/**
 * Generate complete SERP titles for P0 dangling-title repair.
 * Uses shared title-rewrite module (no character slicing).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fullTitle } from './lib/title-utils.mjs';
import { rewriteTitle, validateRewrite } from './lib/title-rewrite.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const audit = JSON.parse(readFileSync(join(__dirname, 'title-p0-audit.json'), 'utf8'));

const out = {};
const failures = [];

for (const row of audit) {
  const next = rewriteTitle(row);
  if (!next || !validateRewrite(row, next)) {
    failures.push({ slug: row.slug, title: row.title, next });
    continue;
  }
  out[row.slug] = { old: row.title, new: next, full: fullTitle(next), len: fullTitle(next).length };
}

writeFileSync(join(__dirname, 'title-p0-rewrites.json'), JSON.stringify(out, null, 2));
console.log('rewrites', Object.keys(out).length);
console.log('failures', failures.length);
if (failures.length) {
  console.log(JSON.stringify(failures.slice(0, 10), null, 2));
  process.exitCode = 1;
}

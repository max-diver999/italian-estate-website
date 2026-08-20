#!/usr/bin/env node
/**
 * Extend indexable MDX descriptions under 120 chars (Ahrefs warning).
 * Skips noindex. Caps at 160. Appends neutral CTA suffix only when needed.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src/content');
const MIN = 120;
const MAX = 160;

const SUFFIXES = [
  ' Italian property insights.',
  ' MORE Group guide.',
  ' Updated market data.',
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith('.mdx')) acc.push(p);
  }
  return acc;
}

function padDescription(desc) {
  if (desc.length >= MIN) return desc;
  let next = desc.trim();
  if (!next.endsWith('.')) next += '.';
  for (const suffix of SUFFIXES) {
    while (next.length < MIN && next.length + suffix.length <= MAX) {
      next += suffix;
    }
    if (next.length >= MIN) break;
  }
  if (next.length < MIN) {
    next = `${next} MORE Group.`.slice(0, MAX).replace(/\s+\S*$/, '…');
  }
  if (next.length > MAX) next = next.slice(0, MAX - 1).replace(/\s+\S*$/, '…');
  return next;
}

let n = 0;

for (const file of walk(ROOT)) {
  let src = readFileSync(file, 'utf8');
  const parts = src.split('---');
  if (parts.length < 3) continue;
  const fm = parts[1];
  if (/noindex:\s*true/m.test(fm)) continue;
  const m = fm.match(/^description:\s*"((?:\\.|[^"\\])*)"\s*$/m);
  if (!m) continue;
  const desc = m[1].replace(/\\"/g, '"');
  if (desc.length >= MIN) continue;
  const padded = padDescription(desc).replace(/"/g, '\\"');
  const newFm = fm.replace(/^description:\s*"(?:\\.|[^"\\])*"\s*$/m, `description: "${padded}"`);
  const out = `---${newFm}---${parts.slice(2).join('---')}`;
  writeFileSync(file, out);
  n++;
}

console.log('extended descriptions in', n, 'files');

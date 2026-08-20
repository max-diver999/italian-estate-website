#!/usr/bin/env node
/** Replace typographic dashes (— –) with ASCII hyphen or comma in MDX + commercial UI strings. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const TARGETS = [
  path.join(ROOT, 'src/content'),
  path.join(ROOT, 'src/data'),
  path.join(ROOT, 'src/lib'),
  path.join(ROOT, 'src/pages'),
  path.join(ROOT, 'src/components'),
  path.join(ROOT, 'src/layouts'),
];

function walk(dir, out = [], ext = '.mdx') {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out, ext);
    else if (name.endsWith(ext) || (ext === 'any' && /\.(astro|ts|tsx|mdx)$/.test(name))) out.push(p);
  }
  return out;
}

function collectFiles(target) {
  if (!fs.existsSync(target)) return [];
  if (fs.statSync(target).isDirectory()) {
    if (target.endsWith('content')) return walk(target, [], '.mdx');
    return walk(target, [], 'any');
  }
  return [target];
}

function normalizeDashes(text, { ui = false } = {}) {
  let s = text;
  s = s.replace(/\u2013/g, '-');
  if (ui) {
    s = s.replace(/\u2014\s+/g, ', ');
    s = s.replace(/\s+\u2014\s+/g, ', ');
    s = s.replace(/\u2014/g, ',');
  } else {
    s = s.replace(/\s+\u2014\s+/g, ', ');
    s = s.replace(/\u2014/g, ',');
  }
  return s;
}

let touched = 0;
for (const target of TARGETS) {
  for (const abs of collectFiles(target)) {
    const raw = fs.readFileSync(abs, 'utf8');
    const ui = !abs.endsWith('.mdx');
    const next = normalizeDashes(raw, { ui });
    if (next !== raw) {
      fs.writeFileSync(abs, next);
      touched++;
    }
  }
}
console.log(`Normalized typographic dashes in ${touched} files`);

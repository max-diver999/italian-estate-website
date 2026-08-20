#!/usr/bin/env node
/** Apply title P0 rewrites from title-p0-rewrites.json */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const rewrites = JSON.parse(readFileSync(join(__dirname, 'title-p0-rewrites.json'), 'utf8'));

function resolveFile(slug) {
  const [category, ...rest] = slug.split('/');
  const name = rest.join('/');
  return join(ROOT, 'src/content', category, `${name}.mdx`);
}

function replaceTitleLine(content, nextTitle) {
  const escaped = nextTitle.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return content.replace(/^title:\s*.+$/m, `title: "${escaped}"`);
}

let applied = 0;
for (const [slug, { new: nextTitle, old }] of Object.entries(rewrites)) {
  const file = resolveFile(slug);
  let content = readFileSync(file, 'utf8');
  const current = content.match(/^title:\s*"((?:\\.|[^"\\])*)"/m)?.[1]?.replace(/\\"/g, '"');
  if (current !== old) {
    console.warn(`WARN ${slug}: expected old title mismatch`);
    console.warn(`  file: ${current}`);
    console.warn(`  json: ${old}`);
  }
  content = replaceTitleLine(content, nextTitle);
  writeFileSync(file, content);
  applied++;
  console.log('OK', slug);
}

console.log(`\nApplied ${applied} title rewrites.`);

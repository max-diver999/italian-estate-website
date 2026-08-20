#!/usr/bin/env node
/** Apply title-full-rewrites.json to MDX frontmatter */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const rewrites = JSON.parse(readFileSync(join(__dirname, 'title-full-rewrites.json'), 'utf8'));
const dryRun = process.argv.includes('--dry-run');

function resolveFile(slug) {
  const [category, ...rest] = slug.split('/');
  return join(ROOT, 'src/content', category, `${rest.join('/')}.mdx`);
}

function replaceTitleLine(content, nextTitle) {
  const escaped = nextTitle.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return content.replace(/^title:\s*.+$/m, `title: "${escaped}"`);
}

function readTitleLine(content) {
  const line = content.match(/^title:\s*.+$/m)?.[0];
  if (!line) return null;
  const quoted = line.match(/^title:\s*"((?:\\.|[^"\\])*)"/);
  if (quoted) return quoted[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  const single = line.match(/^title:\s*'((?:\\.|[^'\\])*)'/);
  if (single) return single[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  return line.replace(/^title:\s*/, '').trim();
}

let applied = 0;
for (const [slug, { new: nextTitle, old }] of Object.entries(rewrites)) {
  const file = resolveFile(slug);
  let content = readFileSync(file, 'utf8');
  const current = readTitleLine(content);
  if (current !== old) {
    console.warn(`WARN ${slug}: title drift`);
    console.warn(`  file: ${current}`);
    console.warn(`  json: ${old}`);
  }
  content = replaceTitleLine(content, nextTitle);
  if (!dryRun) writeFileSync(file, content);
  applied++;
}

console.log(`\n${dryRun ? '[dry-run] ' : ''}Applied ${applied} title rewrites.`);

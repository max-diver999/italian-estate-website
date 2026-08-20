#!/usr/bin/env node
/**
 * Stage 2 — remove leading markdown H1 from news MDX (layout owns H1).
 * Usage: node scripts/fix-heading-news-h1.mjs [--dry-run] [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  parseFrontmatter,
  proseBodyStart,
} from './lib/heading-utils.mjs';

const ROOT = process.cwd();
const NEWS_DIR = path.join(ROOT, 'src/content/news');
const dryRun = process.argv.includes('--dry-run');
const apply = process.argv.includes('--apply');

if (!dryRun && !apply) {
  console.error('Pass --dry-run or --apply');
  process.exit(1);
}

function fixFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = parseFrontmatter(raw);
  if (!parsed) return { changed: false, reason: 'no-frontmatter' };

  const { lines, startIndex } = proseBodyStart(parsed.body);
  if (startIndex >= lines.length) return { changed: false, reason: 'empty-body' };

  const line = lines[startIndex];
  if (!/^#\s+/.test(line) || /^##/.test(line)) return { changed: false, reason: 'no-h1' };

  const nextLines = [...lines.slice(0, startIndex), ...lines.slice(startIndex + 1)];
  while (nextLines[startIndex] === '') nextLines.splice(startIndex, 1);

  const newBody = nextLines.join('\n');
  const fmBlock = raw.match(/^---\n[\s\S]*?\n---\n/)[0];
  return { changed: true, text: fmBlock + newBody, removed: line.trim() };
}

const files = fs.readdirSync(NEWS_DIR).filter((f) => f.endsWith('.mdx')).sort();
let changed = 0;

for (const file of files) {
  const filePath = path.join(NEWS_DIR, file);
  const result = fixFile(filePath);
  if (!result.changed) continue;
  changed += 1;
  console.log(`${dryRun ? '[dry-run] ' : ''}${file}: removed ${result.removed}`);
  if (apply) fs.writeFileSync(filePath, result.text, 'utf8');
}

console.log(`\nNews H1 cleanup: ${changed} file(s)${dryRun ? ' (dry-run)' : ''}`);

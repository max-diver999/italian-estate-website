#!/usr/bin/env node
/**
 * Stage 3 — remove duplicate title H1 from MDX body; demote remaining body H1 to H2.
 * Collections: guides, areas, comparisons, projects (not news — use fix-heading-news-h1.mjs).
 * Usage: node scripts/fix-heading-duplicate-h1.mjs [--dry-run] [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  ARTICLE_COLLECTIONS,
  parseFrontmatter,
  getTitleFromFm,
  stripLeadingDuplicateH1,
  demoteAllMarkdownH1,
  bodyHasMarkdownH1,
} from './lib/heading-utils.mjs';

const ROOT = process.cwd();
const dryRun = process.argv.includes('--dry-run');
const apply = process.argv.includes('--apply');

if (!dryRun && !apply) {
  console.error('Pass --dry-run or --apply');
  process.exit(1);
}

const COLLECTIONS = [...ARTICLE_COLLECTIONS].filter((c) => c !== 'news');

function fixFile(filePath, collection) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = parseFrontmatter(raw);
  if (!parsed) return { changed: false };

  const title = getTitleFromFm(parsed.fm);
  let body = parsed.body;
  let changed = false;
  const actions = [];

  const dup = stripLeadingDuplicateH1(body, title);
  if (dup.changed) {
    body = dup.body;
    changed = true;
    actions.push('removed-duplicate-h1');
  }

  if (bodyHasMarkdownH1(body)) {
    const demote = demoteAllMarkdownH1(body);
    if (demote.changed) {
      body = demote.body;
      changed = true;
      actions.push('demoted-h1-to-h2');
    }
  }

  if (!changed) return { changed: false };

  const fmBlock = raw.match(/^---\n[\s\S]*?\n---\n/)[0];
  const newRaw = `${fmBlock}${body}`;
  return { changed: true, text: newRaw, actions };
}

let total = 0;
for (const collection of COLLECTIONS) {
  const dir = path.join(ROOT, 'src/content', collection);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.mdx')).sort()) {
    const filePath = path.join(dir, file);
    const rel = path.relative(ROOT, filePath);
    const result = fixFile(filePath, collection);
    if (!result.changed) continue;
    total += 1;
    console.log(`${dryRun ? '[dry-run] ' : ''}${rel}: ${result.actions.join(', ')}`);
    if (apply) fs.writeFileSync(filePath, result.text, 'utf8');
  }
}

console.log(`\nDuplicate/demote H1: ${total} file(s)${dryRun ? ' (dry-run)' : ''}`);

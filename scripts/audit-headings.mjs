#!/usr/bin/env node
/**
 * Stage 4 — audit MDX heading structure (layout H1 + body hierarchy).
 * Usage: node scripts/audit-headings.mjs [--json]
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  ARTICLE_COLLECTIONS,
  parseFrontmatter,
  getTitleFromFm,
  bodyHasMarkdownH1,
  hasHeadingLevelSkip,
  titlesMatch,
  firstMarkdownHeading,
  proseBodyStart,
} from './lib/heading-utils.mjs';

const ROOT = process.cwd();
const asJson = process.argv.includes('--json');

const issues = {
  bodyMarkdownH1: [],
  duplicateTitleH1: [],
  headingSkip: [],
};

function auditFile(relPath, collection) {
  const raw = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  const parsed = parseFrontmatter(raw);
  if (!parsed) return;

  const title = getTitleFromFm(parsed.fm);
  const { body } = parsed;

  if (bodyHasMarkdownH1(body)) {
    issues.bodyMarkdownH1.push(relPath);
  }

  const { lines, startIndex } = proseBodyStart(body);
  if (startIndex < lines.length) {
    const m = lines[startIndex].match(/^#\s+(.+)$/);
    if (m && titlesMatch(m[1], title)) {
      issues.duplicateTitleH1.push(relPath);
    }
  }

  const skip = hasHeadingLevelSkip(body);
  if (skip) {
    issues.headingSkip.push({ file: relPath, ...skip });
  }

  const first = firstMarkdownHeading(body);
  if (first && first.level === 3) {
    const skipFromH1 = hasHeadingLevelSkip(body);
    if (skipFromH1) {
      // already in headingSkip
    }
  }
}

for (const collection of ARTICLE_COLLECTIONS) {
  const dir = path.join(ROOT, 'src/content', collection);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    auditFile(path.join('src/content', collection, file), collection);
  }
}

const summary = {
  bodyMarkdownH1: issues.bodyMarkdownH1.length,
  duplicateTitleH1: issues.duplicateTitleH1.length,
  headingSkip: issues.headingSkip.length,
  ok:
    issues.bodyMarkdownH1.length === 0 &&
    issues.duplicateTitleH1.length === 0 &&
    issues.headingSkip.length === 0,
};

if (asJson) {
  console.log(JSON.stringify({ summary, issues }, null, 2));
} else {
  console.log('=== Heading audit ===');
  console.log(`Body markdown H1 (#): ${summary.bodyMarkdownH1}`);
  console.log(`Duplicate title H1:   ${summary.duplicateTitleH1}`);
  console.log(`Heading level skip:   ${summary.headingSkip}`);
  if (issues.bodyMarkdownH1.length) {
    console.log('\nBody H1 files (first 20):');
    for (const f of issues.bodyMarkdownH1.slice(0, 20)) console.log(`  ${f}`);
  }
  if (issues.duplicateTitleH1.length) {
    console.log('\nDuplicate title H1 (first 20):');
    for (const f of issues.duplicateTitleH1.slice(0, 20)) console.log(`  ${f}`);
  }
  if (issues.headingSkip.length) {
    console.log('\nLevel skip:');
    for (const s of issues.headingSkip) {
      console.log(`  ${s.file}: line ${s.line} H${s.from}→H${s.to} ${s.text.trim()}`);
    }
  }
  console.log(summary.ok ? '\nOK — no heading issues' : '\nIssues remain');
}

process.exit(summary.ok ? 0 : 1);

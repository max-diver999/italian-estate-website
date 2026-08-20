#!/usr/bin/env node
/**
 * Audit all MDX titles — dangling, frontmatter length, SERP length.
 * Usage: node scripts/audit-titles-full.mjs [--json]
 */
import { readdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fullTitle, serpLength } from './lib/title-utils.mjs';
import { isDanglingTitle } from './lib/title-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'src/content');
const COLLECTIONS = ['guides', 'areas', 'comparisons', 'markets', 'costs', 'finance', 'legal', 'compare', 'projects', 'news'];

function parseRow(path, category, slug) {
  const raw = readFileSync(path, 'utf8');
  const fm = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
  const title = fm.match(/^title:\s*"([^"]+)"/m)?.[1] || fm.match(/^title:\s*'([^']+)'/m)?.[1];
  if (!title) return null;
  const h1 = raw.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const description = fm.match(/^description:\s*"([^"]+)"/m)?.[1];
  const issues = [];
  if (isDanglingTitle(title)) issues.push('dangling');
  if (title.length < 40) issues.push('too_short');
  if (title.length > 60) issues.push('too_long_fm');
  const maxSerp = category === 'projects' ? 68 : 60;
  if (serpLength(title) > maxSerp) issues.push('serp_long');
  if (!issues.length) return null;
  return {
    slug: `${category}/${slug}`,
    category,
    title,
    h1: h1 || null,
    description: description || null,
    len: title.length,
    serpLen: serpLength(title),
    full: fullTitle(title),
    issues,
  };
}

const rows = [];
for (const category of COLLECTIONS) {
  const dir = join(CONTENT, category);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const row = parseRow(join(dir, file), category, file.replace('.mdx', ''));
    if (row) rows.push(row);
  }
}

const summary = {
  scanned: 0,
  needsFix: rows.length,
  byIssue: {},
  byCategory: {},
};
for (const category of COLLECTIONS) {
  const dir = join(CONTENT, category);
  if (existsSync(dir)) summary.scanned += readdirSync(dir).filter((f) => f.endsWith('.mdx')).length;
}
for (const row of rows) {
  summary.byCategory[row.category] = (summary.byCategory[row.category] || 0) + 1;
  for (const issue of row.issues) {
    summary.byIssue[issue] = (summary.byIssue[issue] || 0) + 1;
  }
}

writeFileSync(join(__dirname, 'title-full-audit.json'), JSON.stringify(rows, null, 2));
writeFileSync(join(__dirname, 'title-full-audit-summary.json'), JSON.stringify(summary, null, 2));

console.log('scanned', summary.scanned);
console.log('needsFix', summary.needsFix);
console.log('byIssue', summary.byIssue);
console.log('byCategory', summary.byCategory);
if (rows.length) {
  console.log('sample', rows.slice(0, 3).map((r) => `${r.slug}: ${r.title}`));
}

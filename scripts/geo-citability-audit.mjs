#!/usr/bin/env node
/**
 * Next-level GEO / AEO citability audit (beyond validate:content).
 * Usage: node scripts/geo-citability-audit.mjs [--today] [--json]
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const jsonOut = process.argv.includes('--json');
const todayOnly = process.argv.includes('--today');

function listMdx() {
  let files = [];
  if (todayOnly) {
    const out = execSync(
      "git log --since='2026-06-15 00:00' --name-only --pretty=format: -- 'src/content/**/*.mdx'",
      { cwd: ROOT, encoding: 'utf8' },
    );
    files = [...new Set(
      out
        .trim()
        .split('\n')
        .filter((f) => f.endsWith('.mdx'))
        .map((f) => join(ROOT, f)),
    )];
    return files;
  }
  for (const coll of readdirSync(CONTENT)) {
    const dir = join(CONTENT, coll);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
      files.push(join(dir, f));
    }
  }
  return files;
}

function parseBody(raw) {
  const m = raw.match(/^---\n[\s\S]*?\n---\n?/);
  return m ? raw.slice(m[0].length) : raw;
}

function firstH2AnswerWords(body, h2Title) {
  const re = new RegExp(`^## ${h2Title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n+([\\s\\S]*?)(?=\\n## |\\n<FaqBlock|$)`, 'm');
  const m = body.match(re);
  if (!m) return 0;
  const para = m[1].split('\n\n')[0].replace(/<[^>]+>/g, '').trim();
  return para.split(/\s+/).filter(Boolean).length;
}

const gaps = [];

for (const path of listMdx()) {
  const rel = path.replace(ROOT + '/', '');
  const raw = readFileSync(path, 'utf8');
  const body = parseBody(raw);
  const slug = path.split('/').pop().replace('.mdx', '');
  const coll = rel.split('/')[2];
  const issues = [];

  if (/## Independent verification notes/.test(body)) {
    issues.push('generic-verification-padding');
  }
  if (/property-investment-guide|inland-property-guide/.test(slug) && coll === 'guides') {
    if (!/MORE Group underwriting snapshot/i.test(body)) issues.push('missing-more-group-snapshot');
  }
  if (!/insider tip/i.test(body) && ['guides', 'areas', 'compare'].includes(coll)) {
    issues.push('missing-insider-tip');
  }
  if (!/<TldrBlock/.test(body) && coll !== 'news') issues.push('missing-tldr');
  const tldr = body.match(/<TldrBlock[^>]*\/?>/);
  if (tldr && !/text=/.test(tldr[0]) && !/children/.test(tldr[0])) {
    /* component may use children — skip */
  }

  const h2s = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  for (const h of h2s.slice(0, 4)) {
    if (/Closing|Faq|Independent verification|MORE Group underwriting/i.test(h)) continue;
    const w = firstH2AnswerWords(body, h);
    if (w > 0 && w < 35) issues.push(`thin-h2-open:${h.slice(0, 40)} (${w}w)`);
  }

  if (issues.length) gaps.push({ file: rel, slug, coll, issues });
}

const llms = readFileSync(join(ROOT, 'public/llms.txt'), 'utf8');
const siteGaps = [];
if (/scaffold|publishing next/i.test(llms)) siteGaps.push('llms.txt-stale-scaffold');
const layout = readFileSync(join(ROOT, 'src/layouts/BaseLayout.astro'), 'utf8');
if (!/wikidata\.org/i.test(layout)) siteGaps.push('base-layout-no-wikidata-sameAs');
if (!/moregroup\.estate/i.test(layout)) siteGaps.push('base-layout-no-parent-brand-sameAs');

const summary = {
  filesScanned: listMdx().length,
  filesWithGaps: gaps.length,
  siteGaps,
  gaps,
};

if (jsonOut) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(gaps.length || siteGaps.length ? 1 : 0);
}

console.log(`\n=== GEO CITABILITY AUDIT (${todayOnly ? 'today' : 'full'}) ===`);
console.log(`Scanned: ${summary.filesScanned} | with gaps: ${summary.filesWithGaps}`);
if (siteGaps.length) {
  console.log('\nSite-level:');
  siteGaps.forEach((g) => console.log(`  - ${g}`));
}
const byIssue = {};
for (const g of gaps) {
  for (const i of g.issues) {
    const k = i.split(':')[0];
    byIssue[k] = (byIssue[k] || 0) + 1;
  }
}
console.log('\nIssue counts:');
Object.entries(byIssue)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, n]) => console.log(`  ${n}× ${k}`));

console.log('\nSample files (first 20):');
gaps.slice(0, 20).forEach((g) => console.log(`  ${g.file}: ${g.issues.join(', ')}`));
if (gaps.length > 20) console.log(`  ... +${gaps.length - 20} more`);

process.exit(gaps.length || siteGaps.length ? 1 : 0);

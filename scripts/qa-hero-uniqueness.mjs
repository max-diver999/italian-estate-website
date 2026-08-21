#!/usr/bin/env node
/**
 * Hero uniqueness gate.
 *
 * The corpus once shipped 49 guides sharing a single project render as their
 * hero — visually obvious on any listing page, invisible to every text gate.
 * This check fails when:
 *   1. two pages share the same heroImage URL (or the same underlying asset
 *      public id, transformations stripped), or
 *   2. a non-project page points at another page's asset folder
 *      (e.g. a tax guide using more-group/italy/projects/<some-project>/hero), or
 *   3. a page has no heroImage at all.
 *
 * Exit 1 on any finding so it can sit in the pre-PR chain.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');

/** "…/upload/w_1200,q_85,f_webp/v123/more-group/x/y/hero.webp" -> "more-group/x/y/hero" */
function assetId(url) {
  let p = url.split('/upload/').pop() ?? url;
  p = p.replace(/^([a-z]+_[^/]+\/)+/, ''); // transformation segments
  p = p.replace(/^v\d+\//, ''); // version
  return p.replace(/\.\w+$/, '').replace(/\?.*$/, '');
}

const pages = [];
for (const coll of readdirSync(CONTENT)) {
  for (const f of readdirSync(join(CONTENT, coll)).filter((x) => /\.mdx?$/.test(x))) {
    const slug = f.replace(/\.mdx?$/, '');
    const raw = readFileSync(join(CONTENT, coll, f), 'utf8');
    const m = raw.match(/^heroImage:\s*["']?(https?:\/\/[^"'\s]+)["']?\s*$/m);
    pages.push({ id: `${coll}/${slug}`, coll, slug, hero: m ? m[1] : null });
  }
}

const problems = [];

for (const p of pages.filter((x) => !x.hero)) {
  problems.push(`${p.id}: no heroImage`);
}

const byAsset = new Map();
for (const p of pages) {
  if (!p.hero) continue;
  const key = assetId(p.hero);
  if (!byAsset.has(key)) byAsset.set(key, []);
  byAsset.get(key).push(p.id);
}
for (const [key, ids] of byAsset) {
  if (ids.length > 1) problems.push(`shared hero (${key}): ${ids.join(', ')}`);
}

// A page borrowing another slug's asset folder: more-group/italy/<coll>/<slug>/…
for (const p of pages) {
  if (!p.hero) continue;
  const m = assetId(p.hero).match(/^more-group\/italy\/([^/]+)\/([^/]+)\//);
  if (!m) continue; // flat/legacy ids (e.g. areas/1280px-…) are covered by the shared check
  const [, ownerColl, ownerSlug] = m;
  if (ownerColl !== p.coll || ownerSlug !== p.slug) {
    problems.push(`${p.id}: hero belongs to ${ownerColl}/${ownerSlug}`);
  }
}

console.log(`Hero uniqueness: ${pages.length} pages scanned`);
if (problems.length) {
  console.log(`\n❌ FAIL — ${problems.length} problem(s):`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log('✅ PASS — every page has its own hero image.');

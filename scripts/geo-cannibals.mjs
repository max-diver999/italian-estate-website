#!/usr/bin/env node
/**
 * Pairs of pages that share too much of their text.
 *
 * The corpus-wide duplication share tells an editor that a page is a template
 * without telling them which other page it is a template of, and the answer is
 * usually one specific neighbour rather than the corpus in general. On the
 * reference site the worst pair shared 1,611 of 3,166 sequences: one page had
 * been written twice with a word swapped.
 *
 *   node scripts/geo-cannibals.mjs            # pairs above the reporting floor
 *   node scripts/geo-cannibals.mjs --json
 *   node scripts/geo-cannibals.mjs --top 40
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildCorpusIndex } from './lib/geo/corpus-signals.mjs';

const CONTENT_ROOT = 'src/content';
const MIN_SHARE = 0.05;

function corpusFiles() {
  const out = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) out.push(full);
    }
  };
  walk(CONTENT_ROOT);
  return out.sort();
}

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const topN = Number(args[args.indexOf('--top') + 1]) || 30;

const files = corpusFiles();
const byId = new Map(files.map((f) => [path.basename(f), f]));
const index = buildCorpusIndex(files.map((f) => ({ id: path.basename(f), raw: fs.readFileSync(f, 'utf8') })));

// Walk the shingle table rather than every pair of documents: a corpus of 272
// files is 36,856 pairs, and almost all of them share nothing at all.
const pairCounts = new Map();
for (const owners of index.shingleOwners.values()) {
  if (owners.size < 2 || owners.size > 40) continue; // a sequence in 40+ files is boilerplate, not a pair
  const ids = [...owners].sort();
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const k = `${ids[i]}${ids[j]}`;
      pairCounts.set(k, (pairCounts.get(k) || 0) + 1);
    }
  }
}

const sizes = new Map(index.prepared.map((d) => [d.id, d.shingles.size]));
const pairs = [];
for (const [k, shared] of pairCounts) {
  const [a, b] = k.split('');
  const smaller = Math.min(sizes.get(a) || 1, sizes.get(b) || 1);
  const share = shared / (smaller || 1);
  if (share >= MIN_SHARE) {
    pairs.push({
      a, b, shared, share,
      aSize: sizes.get(a), bSize: sizes.get(b),
      aPath: byId.get(a), bPath: byId.get(b),
    });
  }
}
pairs.sort((x, y) => y.share - x.share);

if (asJson) {
  console.log(JSON.stringify(pairs, null, 1));
} else {
  console.log(`=== cannibal pairs (9-word sequences shared, as a share of the shorter page) ===`);
  console.log(`${files.length} files, ${pairs.length} pair(s) at or above ${Math.round(MIN_SHARE * 100)}%\n`);
  for (const p of pairs.slice(0, topN)) {
    console.log(`${(p.share * 100).toFixed(0)}%  ${p.shared} of ${Math.min(p.aSize, p.bSize)} sequences`);
    console.log(`      ${p.aPath}`);
    console.log(`      ${p.bPath}\n`);
  }
  if (pairs.length > topN) console.log(`... ${pairs.length - topN} more pair(s) not shown (--top N)`);
}

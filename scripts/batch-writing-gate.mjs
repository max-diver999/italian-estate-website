#!/usr/bin/env node
/**
 * Batch writing gate — GEO score, word count, anti-slop, duplicate paragraphs.
 *
 * Implements `more-group-content-os/policies/geo-aeo-writing-gates.md` locally.
 *
 * History: this file used to be a wrapper that spawned
 * `<siteRoot>/../more-group-content-os/scripts/batch-writing-gate.mjs` — a SIBLING
 * checkout, not the submodule this repo actually declares. That canonical file
 * exists in neither repository, so `npm run validate:batch` crashed with
 * MODULE_NOT_FOUND on every run and never gated anything. Restored 2026-08-20
 * (Wave 0). If the canonical gate is ever published in content-os, this file can
 * go back to delegating — until then the checks live here.
 *
 * Usage:
 *   node scripts/batch-writing-gate.mjs --changed
 *   node scripts/batch-writing-gate.mjs --all
 *   node scripts/batch-writing-gate.mjs --slug italy-rental-yield-guide
 *   node scripts/batch-writing-gate.mjs --changed --min-words 2000
 */
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scorePage, scoreToGrade } from './lib/geo-citability-scorer.mjs';
import { analyzeHumanSignals, EM_DASH_LIMIT, findGluedTables, parseMdx, wordCount } from './lib/human-signals.mjs';
import { findRepeatsWithinFile, findNearDuplicatesWithinFile, CorpusDuplicateIndex } from './lib/duplicate-detect.mjs';
import { writeFileSync } from 'node:fs';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const COLLECTIONS = ['guides', 'compare', 'areas', 'projects', 'developers', 'news'];

/**
 * Quality ratchet.
 *
 * The corpus carries known debt (duplicate paragraphs, sub-90 GEO) that waves 3-8
 * will clear. Failing every PR on it would make the gate unusable during the very
 * cleanup it exists to support — and a gate people bypass is a gate that stops
 * catching regressions.
 *
 * So the gate is a RATCHET: each file is measured against its recorded baseline
 * and fails only when it gets WORSE. A file with no baseline entry (i.e. a new
 * page) must meet the full standard. Baselines can only be lowered — see
 * --update-baseline, which refuses to raise any number.
 */
const BASELINE_PATH = join(ROOT, '.content-os/quality-baseline.json');

function loadBaseline() {
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  } catch {
    return { updated: null, note: 'no baseline yet — every file held to the full standard', files: {} };
  }
}

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const valOf = (f, d) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};

/** Batch policy is 2500; the legacy corpus baseline is 2000. */
const MIN_WORDS = Number(valOf('--min-words', '2500'));
const MIN_GEO = Number(valOf('--min-geo', '90'));
/** Legacy corpus pages predate the batch gates — scored, but not failed, on size. */
const LEGACY_EXEMPT_COLLECTIONS = new Set(['news']);

function listAll() {
  const out = [];
  for (const coll of COLLECTIONS) {
    const dir = join(CONTENT, coll);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (f.endsWith('.mdx') || f.endsWith('.md')) {
        out.push({ coll, slug: f.replace(/\.mdx?$/, ''), path: join(dir, f) });
      }
    }
  }
  return out;
}

function listChanged() {
  let names = [];
  for (const cmd of ['git diff --name-only HEAD', 'git diff --name-only --cached', 'git diff --name-only origin/main...HEAD']) {
    try {
      names.push(...execSync(cmd, { encoding: 'utf8', cwd: ROOT }).split('\n'));
    } catch {
      /* not a repo / no upstream — ignore */
    }
  }
  names = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  return names
    .filter((f) => f.startsWith('src/content/') && /\.mdx?$/.test(f))
    .map((f) => {
      const [, , coll, file] = f.split('/');
      return { coll, slug: file.replace(/\.mdx?$/, ''), path: join(ROOT, f) };
    })
    .filter((f) => existsSync(f.path));
}

let targets;
if (has('--all')) targets = listAll();
else if (has('--slug')) {
  const want = valOf('--slug', '');
  targets = listAll().filter((f) => f.slug === want);
  if (!targets.length) {
    console.error(`No slug matching "${want}"`);
    process.exit(1);
  }
} else targets = listChanged();

if (!targets.length) {
  console.log('=== BATCH WRITING GATE ===');
  console.log('No changed MDX files — nothing to gate.\n');
  process.exit(0);
}

// Cross-file duplicate context always uses the whole corpus, so a changed file is
// compared against everything it could be duplicating.
const index = new CorpusDuplicateIndex();
for (const f of listAll()) {
  index.add(`${f.coll}/${f.slug}`, parseMdx(readFileSync(f.path, 'utf8')).body);
}
const crossExact = new Map(); // id -> [{files, text}]
for (const group of index.exactGroups(2)) {
  for (const id of group.files) {
    const arr = crossExact.get(id) ?? [];
    arr.push(group);
    crossExact.set(id, arr);
  }
}
const crossNear = new Map(); // id -> pairs
for (const pair of index.nearPairs()) {
  for (const id of [pair.a, pair.b]) {
    const arr = crossNear.get(id) ?? [];
    arr.push(pair);
    crossNear.set(id, arr);
  }
}

const baseline = loadBaseline();
const updateBaseline = has('--update-baseline');
const strict = has('--strict'); // ignore the ratchet, hold everything to the full standard

const failures = [];
const rows = [];
const measured = {};

for (const { coll, slug, path } of targets) {
  const id = `${coll}/${slug}`;
  const raw = readFileSync(path, 'utf8');
  const { body } = parseMdx(raw);
  const legacyExempt = LEGACY_EXEMPT_COLLECTIONS.has(coll);
  const base = strict ? null : baseline.files?.[id];
  const fail = (msg) => failures.push({ id, msg });
  /**
   * Ratchet-aware counter check: only fails when `actual` exceeds what this file
   * was already carrying. Nothing regresses; nothing is grandfathered forever.
   */
  const failIfWorse = (metric, actual, describe) => {
    const allowed = base ? (base[metric] ?? 0) : 0;
    if (actual > allowed) {
      fail(`${describe} — ${actual} found, baseline allows ${allowed}`);
      return true;
    }
    return false;
  };

  const words = wordCount(body);
  const geo = scorePage(body, { collection: coll });

  const minWordsHere = base ? Math.min(MIN_WORDS, base.words ?? MIN_WORDS) : MIN_WORDS;
  const minGeoHere = base ? Math.min(MIN_GEO, base.geo ?? MIN_GEO) : MIN_GEO;
  if (!legacyExempt && words < minWordsHere) {
    fail(`word count ${words} < ${minWordsHere}`);
  }
  if (!legacyExempt && geo.score < minGeoHere) {
    fail(`GEO ${geo.score}/100 < ${minGeoHere} (coverage ${geo.coverage}%, citability blocks ${geo.citabilityBlockCount})`);
  }
  if (!base) {
    for (const issue of geo.issues) {
      if (issue.startsWith('citability-blocks') || issue === 'generic-verification-padding') fail(`geo ${issue}`);
    }
  }

  // --- markdown hygiene: the defect class that shipped to production ---
  for (const detail of findGluedTables(body)) fail(`glued table — ${detail}`);

  const human = analyzeHumanSignals(body, { emLimit: EM_DASH_LIMIT[coll] ?? EM_DASH_LIMIT.default });
  for (const issue of human.issues) {
    if (['unclosed-bold', 'corpus-stamp', 'em-dash-heavy'].includes(issue.kind)) fail(`${issue.kind}: ${issue.detail}`);
  }

  // --- duplication: within file, then across the corpus ---
  const repeats = findRepeatsWithinFile(body);
  const near = findNearDuplicatesWithinFile(body);
  const cx = crossExact.get(id) ?? [];
  const cn = crossNear.get(id) ?? [];

  if (failIfWorse('selfRepeats', repeats.length, 'paragraphs repeated inside this file') && repeats[0]) {
    failures.push({ id, msg: `  e.g. x${repeats[0].count}: "${repeats[0].text.slice(0, 90)}…"` });
  }
  if (failIfWorse('nearWithin', near.length, 'near-duplicate paragraph pairs inside this file') && near[0]) {
    failures.push({ id, msg: `  e.g. ${near[0].similarity}: "${near[0].a.slice(0, 70)}…" / "${near[0].b.slice(0, 70)}…"` });
  }
  if (failIfWorse('crossExact', cx.length, 'paragraphs shared verbatim with other pages') && cx[0]) {
    failures.push({ id, msg: `  e.g. shared with ${cx[0].files.filter((f) => f !== id).slice(0, 3).join(', ')}: "${cx[0].text.slice(0, 80)}…"` });
  }
  if (failIfWorse('crossNear', cn.length, 'near-duplicate paragraphs shared with other pages') && cn[0]) {
    const other = cn[0].a === id ? cn[0].b : cn[0].a;
    failures.push({ id, msg: `  e.g. ${cn[0].similarity} with ${other}: "${(cn[0].a === id ? cn[0].textA : cn[0].textB).slice(0, 70)}…"` });
  }

  measured[id] = {
    words,
    geo: geo.score,
    selfRepeats: repeats.length,
    nearWithin: near.length,
    crossExact: cx.length,
    crossNear: cn.length,
  };

  rows.push({
    id,
    words,
    geo: geo.score,
    grade: scoreToGrade(geo.score),
    repeats: repeats.length,
    nearIn: near.length,
    crossEx: cx.length,
    crossNear: cn.length,
  });
}

console.log('\n=== BATCH WRITING GATE ===');
console.log(`Scope: ${has('--all') ? 'full corpus' : has('--slug') ? valOf('--slug', '') : 'changed only'} | files: ${targets.length}`);
console.log(
  `Thresholds: words >= ${MIN_WORDS}, GEO >= ${MIN_GEO}` +
    `${strict ? ' (strict: ratchet ignored)' : ` | ratchet baseline: ${Object.keys(baseline.files ?? {}).length} file(s)`}\n`,
);
for (const r of rows) {
  console.log(
    `  ${String(r.geo).padStart(3)}/100 [${r.grade}] ${String(r.words).padStart(5)}w  ` +
      `dup-in:${r.repeats} near-in:${r.nearIn} dup-x:${r.crossEx} near-x:${r.crossNear}  ${r.id}`,
  );
}

if (updateBaseline) {
  const next = { ...(baseline.files ?? {}) };
  let lowered = 0;
  let added = 0;
  for (const [id, m] of Object.entries(measured)) {
    const prev = next[id];
    if (!prev) {
      next[id] = m;
      added += 1;
      continue;
    }
    // Ratchet: numbers may only improve. Never record a worse value.
    const merged = { ...prev };
    for (const k of ['selfRepeats', 'nearWithin', 'crossExact', 'crossNear']) {
      if (m[k] < (prev[k] ?? Infinity)) {
        merged[k] = m[k];
        lowered += 1;
      }
    }
    for (const k of ['words', 'geo']) {
      if (m[k] > (prev[k] ?? 0)) merged[k] = m[k];
    }
    next[id] = merged;
  }
  writeFileSync(
    BASELINE_PATH,
    `${JSON.stringify(
      {
        updated: process.env.BASELINE_DATE || baseline.updated,
        note: 'Quality ratchet. Recorded debt per file; the gate fails a file only when it gets WORSE. Values may only improve — regenerate with `node scripts/batch-writing-gate.mjs --all --update-baseline`.',
        files: Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b))),
      },
      null,
      2,
    )}\n`,
  );
  console.log(`\nBaseline written: ${added} file(s) added, ${lowered} metric(s) lowered.\n`);
  process.exit(0);
}

if (failures.length) {
  console.log(`\n--- ${failures.length} blocker(s) ---`);
  const byFile = new Map();
  for (const f of failures) byFile.set(f.id, [...(byFile.get(f.id) ?? []), f.msg]);
  for (const [id, msgs] of byFile) {
    console.log(`\n${id}`);
    for (const m of msgs) console.log(`  ✗ ${m}`);
  }
  console.log('\n❌ FAIL — fix in place and re-run. Do not open the PR.\n');
  process.exit(1);
}

console.log('\n✅ PASS — GEO, word count, markdown hygiene and duplication clean.\n');

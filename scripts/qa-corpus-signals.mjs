#!/usr/bin/env node
/**
 * Corpus signal gate — catches what validate:content alone misses.
 * Exit 1 on: em-dash overload, duplicated paragraphs (within and across files),
 * MDX hard-fail patterns, fix-queue blockers.
 *
 * Usage: node scripts/qa-corpus-signals.mjs [--json]
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  EM_DASH_LIMIT,
  analyzeHumanSignals,
} from './lib/human-signals.mjs';
import {
  CorpusDuplicateIndex,
  findRepeatsWithinFile,
} from './lib/duplicate-detect.mjs';


const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'src/content');
const jsonOut = process.argv.includes('--json');

/**
 * Duplicate findings ratchet against .content-os/quality-baseline.json, the same
 * floor validate:batch uses. Known debt is reported but does not fail; a file that
 * gets WORSE than its baseline does. Without this the gate is red from the first
 * run until wave 8, and a permanently red gate gets ignored.
 * Declared AFTER ROOT — referencing it earlier threw a TDZ error that the
 * try/catch swallowed, silently loading an empty baseline.
 * Run with --strict to hold every file to zero.
 */
const STRICT = process.argv.includes('--strict');
let BASELINE = { files: {} };
try {
  BASELINE = JSON.parse(readFileSync(join(ROOT, '.content-os/quality-baseline.json'), 'utf8'));
} catch {
  /* no baseline yet — everything is held to zero */
}
const baselineFor = (id, metric) => (STRICT ? 0 : BASELINE.files?.[id]?.[metric] ?? 0);

const PADDING_H2 = [
  'What to verify next',
  'Closing verification checklist',
  'Red flags and buyer checklist',
  'Buyer scenarios for',
];

const MDX_GREP_CHECKS = [
  { id: 'mdx-angle', pattern: /<[0-9]/, label: 'MDX angle bracket (<5)' },
  { id: 'faqs-prop', pattern: /faqs=\{/, label: 'FaqBlock faqs={ instead of items=' },
  { id: 'draft-marker', pattern: /\[VERIFY\]|TODO|Knowledge base|KB §/, label: 'draft marker' },
  { id: 'fm-import-bug', pattern: /^---import/m, label: '---import frontmatter bug' },
  { id: 'tldr-escape', pattern: /TldrBlock text="[^"]*\\"/, label: 'TldrBlock escaped quotes' },
];

function listAllMdx() {
  const out = [];
  if (!existsSync(CONTENT)) return out;
  for (const coll of readdirSync(CONTENT)) {
    const dir = join(CONTENT, coll);
    try {
      if (!readdirSync(dir).some((f) => f.endsWith('.mdx'))) continue;
    } catch {
      continue;
    }
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
      out.push({ coll, path: join(dir, f), slug: f.replace(/\.mdx$/, '') });
    }
  }
  return out;
}

function parseBody(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  return m ? raw.slice(m[0].length) : raw;
}

function countH2(body, prefix) {
  const re = new RegExp(`^## ${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gm');
  return (body.match(re) || []).length;
}

const failures = [];
/** At-or-below-baseline findings: shown as a debt summary, never a failure. */
const knownDebt = [];
/** id -> fix-queue issue types found this run (for --update-baseline). */
const measuredLegacy = {};
const dupIndex = new CorpusDuplicateIndex();

for (const { coll, path, slug } of listAllMdx()) {
  const raw = readFileSync(path, 'utf8');
  const body = parseBody(raw);
  const rel = `src/content/${coll}/${slug}.mdx`;
  const emLimit = EM_DASH_LIMIT[coll] ?? EM_DASH_LIMIT.default;

  const human = analyzeHumanSignals(body, { emLimit });
  for (const issue of human.issues) {
    failures.push({ kind: issue.kind, file: rel, detail: issue.detail });
  }

  for (const prefix of PADDING_H2) {
    const n = countH2(body, prefix);
    if (n > 1) {
      failures.push({
        kind: 'duplicate-padding-h2',
        file: rel,
        detail: `"## ${prefix}" appears ${n} times (max 1)`,
      });
    }
  }

  // Real paragraph duplication. The PADDING_H2 loop above only counts four
  // hardcoded heading strings, which is why this gate printed
  // "PASS - padding dupes OK" on a corpus with 477 duplicated paragraphs.
  const reps = findRepeatsWithinFile(body);
  const allowedReps = baselineFor(`${coll}/${slug}`, 'selfRepeats');
  if (reps.length > allowedReps) {
    failures.push({
      kind: 'duplicate-paragraph-in-file',
      file: rel,
      detail: `${reps.length} repeated paragraph(s), baseline allows ${allowedReps} — e.g. x${reps[0].count}: "${reps[0].text.slice(0, 90)}"`,
    });
  } else if (reps.length) {
    knownDebt.push({ kind: 'duplicate-paragraph-in-file', file: rel, count: reps.length });
  }
  dupIndex.add(`${coll}/${slug}`, body);

  for (const check of MDX_GREP_CHECKS) {
    if (check.pattern.test(raw)) {
      failures.push({ kind: check.id, file: rel, detail: check.label });
    }
  }
}

for (const group of dupIndex.exactGroups(2)) {
  const overBaseline = group.files.filter((id) => baselineFor(id, 'crossExact') === 0);
  const entry = {
    kind: 'duplicate-paragraph-across-files',
    file: group.files[0],
    detail: `shared verbatim by ${group.files.length} pages (${group.files.slice(0, 4).join(', ')}): "${group.text.slice(0, 90)}"`,
  };
  if (overBaseline.length) failures.push(entry);
  else knownDebt.push({ kind: entry.kind, file: entry.file, count: group.files.length });
}

const fq = spawnSync('node', ['scripts/fix-batch-queue.mjs', '--json', '--not-ready', '--limit', '500'], {
  cwd: ROOT,
  encoding: 'utf8',
});
let notReady = [];
if (fq.status === 0 && fq.stdout) {
  try {
    notReady = JSON.parse(fq.stdout);
  } catch {
    failures.push({ kind: 'fix-queue-parse', file: 'scripts/fix-batch-queue.mjs', detail: 'invalid JSON' });
  }
}
// fix-queue blockers are legacy content debt (title length, thin content,
// missing scenarios) that waves 3-8 clear. Ratchet them the same way: a file
// fails only when it carries an issue type its baseline does not already list.
//
// Note: this check reported nothing before Wave 0 — fix-batch-queue.mjs imports
// more-content-gate.mjs, which crashed on the missing cloudinary-gate module, so
// the subprocess exited non-zero and `notReady` stayed empty. The gate printed
// PASS because the check never ran.
for (const row of notReady) {
  const id = `${row.coll}/${row.slug}`;
  const known = new Set(BASELINE.files?.[id]?.legacyIssues ?? []);
  const issues = row.issues || [];
  const fresh = STRICT ? issues : issues.filter((i) => !known.has(i));
  if (fresh.length) {
    failures.push({
      kind: 'fix-queue-blocker',
      file: `src/content/${row.coll}/${row.slug}.mdx`,
      detail: fresh.join(', '),
    });
  } else if (issues.length) {
    knownDebt.push({ kind: 'fix-queue-blocker', file: `src/content/${row.coll}/${row.slug}.mdx`, count: issues.length });
  }
  measuredLegacy[id] = issues;
}

if (process.argv.includes('--update-baseline')) {
  const next = { ...(BASELINE.files ?? {}) };
  for (const [id, issues] of Object.entries(measuredLegacy)) {
    next[id] = { ...(next[id] ?? {}), legacyIssues: issues };
  }
  // Files that no longer appear in the queue have had their debt cleared.
  for (const id of Object.keys(next)) {
    if (!(id in measuredLegacy) && next[id].legacyIssues) delete next[id].legacyIssues;
  }
  writeFileSync(
    join(ROOT, '.content-os/quality-baseline.json'),
    `${JSON.stringify({ ...BASELINE, files: next }, null, 2)}\n`,
  );
  console.log(`\nBaseline legacyIssues recorded for ${Object.keys(measuredLegacy).length} file(s).\n`);
  process.exit(0);
}

const apiDir = join(ROOT, 'src/pages/api');
if (existsSync(apiDir)) {
  for (const f of readdirSync(apiDir).filter((x) => x.endsWith('.ts'))) {
    const api = readFileSync(join(apiDir, f), 'utf8');
    if (!/export const prerender = false/.test(api)) {
      failures.push({
        kind: 'api-prerender',
        file: `src/pages/api/${f}`,
        detail: 'missing export const prerender = false',
      });
    }
  }
}

const summary = {
  files: listAllMdx().length,
  failures: failures.length,
  byKind: failures.reduce((acc, f) => {
    acc[f.kind] = (acc[f.kind] || 0) + 1;
    return acc;
  }, {}),
  items: failures,
};

if (jsonOut) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log('\n=== CORPUS SIGNALS GATE ===');
  console.log(`MDX scanned: ${summary.files}`);
  if (!failures.length) {
    console.log('✅ PASS — em-dash, paragraph duplication, fix-queue, MDX patterns OK');
    if (knownDebt.length) {
      const byKind = knownDebt.reduce((a, d) => ({ ...a, [d.kind]: (a[d.kind] || 0) + 1 }), {});
      console.log(`   (known debt at or below baseline: ${Object.entries(byKind).map(([k, n]) => `${n}x ${k}`).join(', ')})`);
    }
    console.log('');
  } else {
    console.log(`❌ FAIL — ${failures.length} issue(s)\n`);
    for (const [k, n] of Object.entries(summary.byKind).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${n}× ${k}`);
    }
    console.log('');
    for (const f of failures.slice(0, 30)) {
      console.log(`  ${f.file}: ${f.detail}`);
    }
    if (failures.length > 30) console.log(`  … +${failures.length - 30} more`);
    console.log('');
  }
}

process.exit(failures.length ? 1 : 0);

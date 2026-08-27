#!/usr/bin/env node
/**
 * Calibration harness for the GEO scorer.
 *
 * The point of this file is that a scoring rubric is a hypothesis, and a
 * hypothesis needs a test set. Ours is labelled by history:
 *
 *   bad/  152 files as they stood at commit 9cda569, where an agent was told
 *         "lift the corpus to 90+" and did it by injecting ~5,400 generated
 *         blocks. The old rubric scored these 90/100.
 *   good/ articles written by hand, section by section, in August 2026.
 *   mid/  honest prose rebuilt semi-automatically: should sit between.
 *
 * A rubric is only worth shipping if it separates bad from good. Run:
 *   node scripts/geo-calibrate.mjs --prepare      # rebuild the labelled sets
 *   node scripts/geo-calibrate.mjs                # score them and report separation
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const LAB = '/tmp/geo-lab';

/**
 * The labelling for italian-estate.com, read off this repository's own history.
 *
 * The machine campaign is not inferred, it is in the commit subjects: six
 * commits on 2026-07-27/28 titled "raise 16 more guides to 90+ GEO citability",
 * then bcaf8e7 "GEO upgrade batches 1-10 and full corpus refresh" rewriting all
 * 252 files on 2026-08-20, then 4360b18 finishing the pass. The old rubric
 * scored the result 91/100 and the audit that followed spent five waves undoing
 * it. So 4360b18 is the corpus at maximum machine content: the last commit
 * before 7ed08e8 begins the human-directed cleanup.
 *
 * One honesty note that belongs next to the constants rather than in a report:
 * nobody on this project is a human writer. The contrast being measured is not
 * human against machine, it is ONE ARTICLE WRITTEN AT A TIME against ONE
 * TEMPLATE APPLIED TO EVERY FILE. That is the distinction the scorer has to
 * make, and it is the same distinction the reference site measured.
 */
const GARBAGE_COMMIT = '4360b18';

/**
 * Which files at that snapshot count as garbage, and why not simply all of them.
 *
 * The first attempt took the whole corpus at 4360b18 and it was wrong. bcaf8e7
 * rewrote all 252 files and some of what it produced is decent: the holiday-let
 * licensing guide opens "A worked example makes the layers concrete" and then
 * walks a Florence couple through CIR, CIN and SCIA with real numbers. Labelling
 * that page as garbage teaches the rubric that good writing is garbage, and it
 * was the single reason bad.max sat at 54.
 *
 * So membership is decided by proof rather than by which commit touched a file.
 * A campaign commit's STAMPED LINES are the lines it added to three or more
 * files in one go, because a writer does not produce the same sentence three
 * times in a sitting and a template does nothing else. Across the campaign there
 * are 122 such lines, the worst pasted into 29 files. A file carrying five or
 * more of them at the snapshot is in the set.
 *
 * The criterion is deliberately independent of every signal being calibrated:
 * it reads commit diffs, not the rubric's own measures. Selecting a test set
 * with the signal under test is how a rubric proves itself and measures nothing.
 */
const CAMPAIGN_COMMITS = ['4fcfef0', 'e92c568', 'ff2683b', 'ec23217', '23f3fd6', '72b7b79', '1a0e1cd', 'bcaf8e7', '4360b18'];
const STAMPED_MIN_FILES = 3;
const GARBAGE_MIN_STAMPED_LINES = 5;

/**
 * a0c4a38 ("raise top 10 money guides to 93+") and d90ab7e are NOT in the list
 * above, although their subjects match the campaign. Their diffs contain no line
 * repeated even twice, so on the evidence they are single-article work that
 * happens to share a commit message with the campaign. Including them on the
 * strength of the subject line is exactly the mistake this file is guarding
 * against.
 */

function stampedLineSet() {
  const stamped = new Set();
  for (const c of CAMPAIGN_COMMITS) {
    const diff = execFileSync('git', ['show', '--format=', '-M', c, '--', 'src/content'], { maxBuffer: 256e6 }).toString();
    const perCommit = new Map();
    let file = null;
    for (const line of diff.split('\n')) {
      if (line.startsWith('+++ b/')) { file = line.slice(6); continue; }
      if (!line.startsWith('+') || line.startsWith('+++')) continue;
      const text = line.slice(1).trim();
      if (text.split(/\s+/).length < 10) continue;
      if (!perCommit.has(text)) perCommit.set(text, new Set());
      perCommit.get(text).add(file);
    }
    for (const [text, files] of perCommit) if (files.size >= STAMPED_MIN_FILES) stamped.add(text);
  }
  return stamped;
}

/**
 * Written as individual articles, each researched and drafted on its own, in
 * the two new-article waves of 2026-08-22 (27a5d0a) and 2026-08-26 (4460946).
 * Twelve of the twenty are taken, spread across both waves and both clusters,
 * so the set is not one afternoon's habits.
 */
const HANDWRITTEN = [
  'nuda-proprieta-bare-ownership-italy',
  'rent-to-buy-italy-affitto-con-riscatto',
  'italy-property-auctions-foreigners',
  'transferring-money-to-italy-property',
  'selling-property-italy-foreigner',
  'italy-new-build-warranty-defects',
  'salva-casa-decree-property-buyers',
  'abusi-edilizi-buying-property-italy',
  'condominio-rules-foreign-owners',
  'seismic-zones-italy-property',
  'preliminare-trascritto-italy',
  'agibilita-certificate-italy',
];

/**
 * Legacy pages that lived through the machine era and were then rebuilt by the
 * cleanup waves: real prose, but assembled with a lot of scripted assistance.
 * These are the seven the wave-5 commits rewrote most heavily. They should land
 * between the two, and if they do not, the scale is binary and worth nothing.
 */
const MIDDLE = [
  'liguria-property-investment-guide',
  'italy-investor-visa-requirements-2026',
  'italy-property-investment-guide',
  'best-cities-italy-rental-yield-2026',
  'basilicata-property-investment-guide',
  'italy-property-taxes-foreign-buyers-guide',
  'emilia-romagna-property-investment-guide',
];

/**
 * Slugs are resolved across every collection rather than assumed to live in
 * guides/. The machine campaign here rewrote all six collections in one pass,
 * so a set drawn from guides alone would measure a third of the damage and
 * would silently drop the compare/ pages, which are the worst cannibals on the
 * site.
 */
function findBySlug(slug) {
  const root = 'src/content';
  for (const dir of fs.readdirSync(root)) {
    const p = path.join(root, dir, `${slug}.mdx`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function prepare() {
  for (const d of ['bad', 'good', 'mid']) {
    fs.rmSync(path.join(LAB, d), { recursive: true, force: true });
    fs.mkdirSync(path.join(LAB, d), { recursive: true });
  }
  const listed = execFileSync('git', ['ls-tree', '-r', '--name-only', GARBAGE_COMMIT, 'src/content'])
    .toString().trim().split('\n').filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

  const stamped = stampedLineSet();

  // Document ids are basenames, so a collision between two collections would
  // make one file overwrite the other and shrink the set without saying so.
  const seen = new Map();
  let n = 0;
  let skipped = 0;
  for (const f of listed) {
    const base = path.basename(f);
    if (seen.has(base)) {
      throw new Error(`basename collision in the labelled set: ${f} and ${seen.get(base)} both resolve to ${base}`);
    }
    seen.set(base, f);
    let content;
    try {
      content = execFileSync('git', ['show', `${GARBAGE_COMMIT}:${f}`], { maxBuffer: 32e6 }).toString();
    } catch { continue; /* file did not exist at that commit */ }
    const hits = content.split('\n').map((l) => l.trim())
      .filter((l) => l.split(/\s+/).length >= 10 && stamped.has(l)).length;
    if (hits < GARBAGE_MIN_STAMPED_LINES) { skipped += 1; continue; }
    fs.writeFileSync(path.join(LAB, 'bad', base), content);
    n += 1;
  }
  console.log(`stamped lines in the campaign: ${stamped.size}; files at ${GARBAGE_COMMIT} carrying ${GARBAGE_MIN_STAMPED_LINES}+ of them: ${n} (${skipped} left out)`);

  const missing = [];
  for (const [dir, slugs] of [['good', HANDWRITTEN], ['mid', MIDDLE]]) {
    for (const s of slugs) {
      const src = findBySlug(s);
      if (src) fs.copyFileSync(src, path.join(LAB, dir, `${s}.mdx`));
      else missing.push(`${dir}/${s}`);
    }
  }
  // A silently short set is how a calibration starts lying: eight files instead
  // of twelve still prints a mean.
  if (missing.length) throw new Error(`labelled slugs not found in src/content: ${missing.join(', ')}`);

  console.log(`prepared: bad=${n} good=${HANDWRITTEN.length} mid=${MIDDLE.length} in ${LAB}`);
}

function stats(xs) {
  if (!xs.length) return { n: 0, mean: 0, min: 0, max: 0, p90: 0 };
  const s = [...xs].sort((a, b) => a - b);
  return {
    n: xs.length,
    mean: xs.reduce((a, b) => a + b, 0) / xs.length,
    min: s[0],
    max: s[s.length - 1],
    p90: s[Math.floor(s.length * 0.9)] ?? s[s.length - 1],
  };
}

async function scoreSet(dir, scorer) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx')).map((f) => path.join(dir, f));
  if (!files.length) throw new Error(`labelled set ${dir} is empty; run --prepare`);
  const out = [];
  for (const f of files) out.push({ file: f, ...(await scorer(f, files)) });
  return out;
}

async function main() {
  if (process.argv.includes('--prepare')) return prepare();
  if (!fs.existsSync(path.join(LAB, 'bad'))) prepare();

  const which = process.argv.includes('--old') ? 'old' : 'new';
  let scorer;
  if (which === 'old') {
    const { scorePage } = await import('./lib/geo-citability-scorer.mjs');
    scorer = async (f) => {
      const raw = fs.readFileSync(f, 'utf8');
      const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, '');
      const r = scorePage(body, { collection: 'guides' });
      return { score: r.score };
    };
  } else {
    const mod = await import('./lib/geo/score.mjs').catch(() => null);
    if (!mod) {
      console.error('scripts/lib/geo/score.mjs not implemented yet; run with --old to see the baseline');
      process.exit(2);
    }
    scorer = mod.scoreFileForCalibration;
  }

  const sets = {};
  for (const d of ['bad', 'good', 'mid']) sets[d] = await scoreSet(path.join(LAB, d), scorer);

  console.log(`\n=== GEO calibration (${which} scorer) ===`);
  const summary = {};
  for (const [k, rows] of Object.entries(sets)) {
    const st = stats(rows.map((r) => r.score));
    summary[k] = st;
    console.log(
      `${k.padEnd(5)} n=${String(st.n).padStart(3)}  mean=${st.mean.toFixed(1)}  min=${st.min}  p90=${st.p90}  max=${st.max}`,
    );
  }
  const sep = summary.good.mean - summary.bad.mean;
  console.log(`\nseparation (good.mean - bad.mean) = ${sep.toFixed(1)} points`);
  const overlap = sets.bad.filter((r) => r.score >= Math.min(...sets.good.map((g) => g.score))).length;
  console.log(`garbage files scoring at or above the worst hand-written file: ${overlap}/${sets.bad.length}`);

  // Targets are set against the deterministic stage, which tops out at 75.
  // The remaining twenty points to the 95 ceiling are only reachable through
  // the judge stage, so a deterministic 60 is a good article, not a mediocre one.
  const TARGETS = { badMax: 25, goodMin: 55, separation: 35 };
  const fails = [];
  if (summary.bad.max > TARGETS.badMax) fails.push(`bad.max ${summary.bad.max} > ${TARGETS.badMax}`);
  if (summary.good.min < TARGETS.goodMin) fails.push(`good.min ${summary.good.min} < ${TARGETS.goodMin}`);
  if (sep < TARGETS.separation) fails.push(`separation ${sep.toFixed(1)} < ${TARGETS.separation}`);
  if (which === 'new') {
    console.log(fails.length ? `\n❌ calibration FAILED\n  ${fails.join('\n  ')}` : '\n✅ calibration passed');
    if (fails.length) process.exit(1);
  }
}

main();

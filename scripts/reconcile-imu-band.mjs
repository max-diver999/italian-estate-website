#!/usr/bin/env node
/**
 * Wave 3a — reconcile the IMU rate to one canonical statement.
 *
 * The corpus asserts 14 different IMU bands across 77 pages, and 9 pages
 * contradict themselves within a single page. An answer engine sampling three
 * of our pages for "IMU rate Italy" gets three different answers.
 *
 * Verified rule (L. 160/2019 art. 1 c. 754, cross-checked across three
 * independent searches including the Gazzetta Ufficiale text):
 *   - statutory base rate for non-primary residences: 0.86%
 *   - each comune may reduce it to zero or raise it to 1.06%
 *   - up to 1.14% in comuni that previously applied the 0.08% TASI surcharge
 *   - category D keeps a 0.76% floor (the share reserved to the State)
 *
 * Note this corrects an earlier assumption: 1.14% is NOT stale. It is real, but
 * only for TASI-surcharge comuni, which is why the owner slug quoting
 * "0.46%-1.14%" was closer to right than the 0.4%-0.76% used elsewhere.
 *
 * Registry policy is "one owner_slug per stat cluster; other pages link, do not
 * copy tables", so this rewrites SUPPORTING pages to one short consistent form
 * and leaves the full rule to the owner slug.
 *
 * Every replacement is previewed with surrounding context before anything is
 * written. A blind regex over MDX is what produced the punctuation scars this
 * audit had to clean up, so --apply is deliberately separate from the default
 * dry run.
 *
 * Usage:
 *   node scripts/reconcile-imu-band.mjs                 # preview every change
 *   node scripts/reconcile-imu-band.mjs --apply         # write them
 *   node scripts/reconcile-imu-band.mjs --slugs a,b,c   # limit the batch
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const slugArg = argv.indexOf('--slugs');
const ONLY = slugArg >= 0 && argv[slugArg + 1] ? new Set(argv[slugArg + 1].split(',')) : null;

/** The page that owns the number and states it in full. */
export const OWNER_SLUG = 'imu-property-tax-italy';

/** Short form used on supporting pages. */
const CANON_RANGE = '0.86% to 1.06%';

/**
 * An IMU rate is a fraction of cadastral value; anything above ~1.2% in this
 * position is a yield or a different tax, never an IMU rate.
 */
const isImuBand = (a, b) => Number(a) <= 1.2 && Number(b) <= 1.2 && Number(a) < Number(b);

/** Band written next to the word IMU, either order. */
const PATTERNS = [
  /IMU[^.\n|]{0,55}?(\d\.\d{1,2})\s*%?\s*(?:to|-|–|and|or)\s*(\d\.\d{1,2})\s*%/gi,
  /(\d\.\d{1,2})\s*%?\s*(?:to|-|–|and|or)\s*(\d\.\d{1,2})\s*%(?=[^.\n|]{0,40}?IMU)/gi,
];

function listFiles() {
  const out = [];
  for (const coll of readdirSync(CONTENT)) {
    for (const f of readdirSync(join(CONTENT, coll)).filter((x) => /\.mdx?$/.test(x))) {
      const slug = f.replace(/\.mdx?$/, '');
      if (ONLY && !ONLY.has(slug)) continue;
      out.push({ coll, slug, path: join(CONTENT, coll, f) });
    }
  }
  return out;
}

let changedFiles = 0;
let changedSpots = 0;
const skipped = [];

for (const { coll, slug, path } of listFiles()) {
  if (slug === OWNER_SLUG) {
    skipped.push(`${coll}/${slug} (owner slug — states the full rule, edited by hand)`);
    continue;
  }
  const raw = readFileSync(path, 'utf8');
  let next = raw;
  const edits = [];

  for (const re of PATTERNS) {
    next = next.replace(re, (match, a, b, offset) => {
      if (!isImuBand(a, b)) return match;
      const already = `${a}% to ${b}%` === CANON_RANGE || `${a}-${b}%` === CANON_RANGE;
      if (already) return match;
      // Preserve the separator style the sentence already uses.
      const dash = /–/.test(match) ? '–' : match.includes(' to ') ? ' to ' : '-';
      const replacement = match
        .replace(new RegExp(`${a}\\s*%?\\s*(?:to|-|–|and|or)\\s*${b}\\s*%`), () =>
          dash === ' to ' ? '0.86% to 1.06%' : `0.86${dash}1.06%`,
        );
      edits.push({ from: match.trim(), to: replacement.trim(), offset });
      return replacement;
    });
  }

  if (!edits.length) continue;
  changedFiles += 1;
  changedSpots += edits.length;
  console.log(`\n${coll}/${slug}  (${edits.length} spot${edits.length > 1 ? 's' : ''})`);
  for (const e of edits) {
    console.log(`   -  ${e.from.slice(0, 130)}`);
    console.log(`   +  ${e.to.slice(0, 130)}`);
  }
  if (APPLY) writeFileSync(path, next);
}

console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'} — ${changedSpots} spot(s) in ${changedFiles} file(s)`);
for (const s of skipped) console.log(`  skipped: ${s}`);
if (!APPLY) console.log('\nRe-run with --apply to write.\n');

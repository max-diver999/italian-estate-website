#!/usr/bin/env node
/**
 * Wave 3b — reconcile the non-resident closing-cost stack to one band.
 *
 * The corpus stated seven different bands across 125 pages: 10-12% (68),
 * 10-15% (64), 10-14% (9), 9-11%, 10-13%, 10-11% and 12-15%. Unlike the IMU
 * spread this was never a sourcing problem — the numbers differed because they
 * included different line items.
 *
 * Maxim's decision: the published band is **10-15%, all-in**, i.e. registration
 * or VAT, notary, ipotecaria and catastale, agency commission, sworn translation
 * and independent legal review. That is the wider band and the honest one for a
 * second home bought through an agency: 9% registration on cadastral value alone
 * already consumes most of a 10-12% quote before the agency fee is counted.
 *
 * Registry policy is "one owner_slug per stat cluster; other pages link, do not
 * copy tables", so supporting pages carry the band and
 * italy-property-closing-costs-breakdown keeps the line-by-line breakdown.
 *
 * Every replacement is previewed with context before anything is written.
 *
 * Usage:
 *   node scripts/reconcile-closing-stack.mjs            # preview
 *   node scripts/reconcile-closing-stack.mjs --apply
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const APPLY = process.argv.includes('--apply');

export const OWNER_SLUG = 'italy-property-closing-costs-breakdown';
const LOW = 10;
const HIGH = 15;

/** A closing-cost band: two integer percentages immediately qualified as "closing". */
const PATTERN = /(\d{1,2})\s*%?\s*(to|-|–)\s*(\d{1,2})\s*%(\s*(?:non-resident\s+)?(?:all-in\s+)?closing)/gi;

/** Sanity bounds — anything outside this is not a closing-cost stack. */
const isStack = (a, b) => Number(a) >= 5 && Number(b) <= 25 && Number(a) < Number(b);

let files = 0;
let spots = 0;

for (const coll of readdirSync(CONTENT)) {
  for (const f of readdirSync(join(CONTENT, coll)).filter((x) => /\.mdx?$/.test(x))) {
    const slug = f.replace(/\.mdx?$/, '');
    const path = join(CONTENT, coll, f);
    const raw = readFileSync(path, 'utf8');
    const edits = [];

    const next = raw.replace(PATTERN, (match, a, sep, b, tail) => {
      if (!isStack(a, b)) return match;
      if (Number(a) === LOW && Number(b) === HIGH) return match;
      const joiner = sep === 'to' ? ' to ' : sep;
      const replacement = `${LOW}${joiner === ' to ' ? '% to ' : joiner}${HIGH}%${tail}`;
      edits.push({ from: match.trim(), to: replacement.trim() });
      return replacement;
    });

    if (!edits.length) continue;
    files += 1;
    spots += edits.length;
    console.log(`\n${coll}/${slug}${slug === OWNER_SLUG ? '  (owner slug)' : ''}  (${edits.length})`);
    for (const e of edits) console.log(`   -  ${e.from}\n   +  ${e.to}`);
    if (APPLY) writeFileSync(path, next);
  }
}

console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'} — ${spots} spot(s) in ${files} file(s)`);
if (!APPLY) console.log('Re-run with --apply to write.\n');

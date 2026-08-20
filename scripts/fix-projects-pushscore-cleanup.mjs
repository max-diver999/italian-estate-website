#!/usr/bin/env node
/**
 * Remove repetitive pushScore filler and in-file duplicate paragraphs on project MDX.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMdxBody, scorePage } from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = join(ROOT, 'src/content/projects');

const PUSHSCORE_RE =
  /\n[^\n#]{20,200} for foreign buyers on this ticket means anchoring offers to three OMI-quartiere closed sales[^\n]+\n/g;

const GENERIC_RISK =
  'Italian property risk clusters around cadastral mismatches, unauthorized layout changes, pending condominium extraordinary works, and STR licensing gaps that agents omit from English summaries. Independent avvocato and geometra review before compromesso beats post-deposit discovery of conformità blocks, CIN delisting risk, or spese spikes within the first ownership year.';

const OFFPLAN =
  'Off-plan and regeneration stock trades delivery risk for 10-20% discounts versus completed comparables but demands bank escrow verification, permesso di costruire review, and penalty clauses on developer delay. Resale before snagging completion often discounts 8-12%, stress-test exit liquidity if hold period may not exceed construction timeline plus 24 months.';

const H2_RENAMES = [
  ['## Investment Case', '## What Should You Know About Investment Case?'],
  ['## Running Costs', '## What Should You Know About Running Costs?'],
  ['## Financing Notes', '## What Should You Know About Financing?'],
  ['## Seasonal Calendar and Event Week Pricing', '## What Should You Know About Seasonal Pricing?'],
  ['## Closing Steps', '## What Should Buyers Verify at Closing?'],
  ['## Comparable Markets Table', '## How Does This Compare With Alternatives?'],
  ['## Who Is This Hybrid Stock For?', '## Who Is This For?'],
];

const GENERIC_PROS =
  /[^\n]+ pros and cons typically means weighing gross yield bands near 4-5\.5%[^\n]+\n\n/;

function dedupeParagraphs(body) {
  const seen = new Set();
  const paras = body.split(/\n\n+/);
  const kept = [];
  for (const p of paras) {
    const key = p.replace(/\s+/g, ' ').trim().slice(0, 120);
    if (key.length < 80) {
      kept.push(p);
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(p);
  }
  return kept.join('\n\n');
}

function splitFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { fm: raw, body: '' };
  return { fm: `---\n${m[1]}\n---\n`, body: m[2] };
}

let fixed = 0;
for (const file of readdirSync(PROJECTS).filter((f) => f.endsWith('.mdx'))) {
  const path = join(PROJECTS, file);
  const raw = readFileSync(path, 'utf8');
  const { fm, body: initial } = splitFrontmatter(raw);
  let body = initial;

  body = body.replace(PUSHSCORE_RE, '\n');
  body = body.split(GENERIC_RISK).join('');
  if (!/(off-plan|bloom-living|feel-uptown|innesto|maciachini|coima-olympic)/.test(file)) {
    body = body.split(OFFPLAN).join('');
  }
  body = body.replace(GENERIC_PROS, '');

  for (const [from, to] of H2_RENAMES) {
    body = body.split(from).join(to);
  }

  body = dedupeParagraphs(body);
  body = body.replace(/\n{3,}/g, '\n\n');

  if (body !== initial) {
    writeFileSync(path, fm + body);
    fixed += 1;
    const scored = scorePage(parseMdxBody(fm + body), { collection: 'projects' });
    console.log(file, '→', scored.score);
  }
}
console.log('cleaned', fixed, 'files');

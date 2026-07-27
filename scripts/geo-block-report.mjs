#!/usr/bin/env node
/**
 * Per-H2 diagnostic for the GEO citability rubric.
 *
 * The corpus audit reports one score per file; this prints the reason for that
 * score block by block so a fix targets the weak section instead of the file.
 *
 * Usage: node scripts/geo-block-report.mjs src/content/guides/slug.mdx [...]
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseMdxBody,
  scorePage,
  scoreToGrade,
  extractH2Blocks,
  splitParagraphs,
  stripMdx,
  wordCount,
  countStats,
  findCitabilityBlocks,
} from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = process.argv.slice(2).filter((a) => a.endsWith('.mdx'));
const terse = process.argv.includes('--terse');

const DEFINITION_RE = /\b(is|are|refers to|means|typically|costs|starts at|ranges from|allows|requires)\b/i;
const PRONOUN_START_RE = /^(it|this|they|these|those|however|but|and|also)\b/i;
const QUESTION_H2_RE = /^(what|how|why|when|where|who|which|can|do|does|is|are|should|will)\b/i;
const UNIQUE_RE = /\b(MORE Group|our (analysis|data|clients|underwriting)|insider tip|underwriting snapshot|we (surveyed|analyzed|tracked))\b/i;
const KEYWORD_RE = /\b(case study|methodology|checklist|red flag|buyer scenario)\b/i;

for (const rel of files) {
  const body = parseMdxBody(readFileSync(join(ROOT, rel), 'utf8'));
  const coll = rel.split('/')[2] || 'guides';
  const page = scorePage(body, { collection: coll });
  const blocks = extractH2Blocks(body);

  console.log(`\n=== ${rel}`);
  console.log(
    `${page.score}/100 [${scoreToGrade(page.score)}] blocks ${page.blockCount} | coverage ${page.coverage}% | citability ${page.citabilityBlockCount}/2`,
  );
  console.log(
    `avg answer ${page.categoryAvgs.answer} | self ${page.categoryAvgs.selfContain} | structure ${page.categoryAvgs.structure} | stats ${page.categoryAvgs.stats} | unique ${page.categoryAvgs.unique}`,
  );
  if (page.issues.length) console.log(`issues: ${page.issues.join(' ; ')}`);

  const scored = page.blockScores;
  for (let i = 0; i < blocks.length; i += 1) {
    const b = blocks[i];
    const s = scored[i];
    if (terse && s.overall >= 93) continue;
    const sectionPlain = stripMdx(b.section);
    const words = wordCount(b.plainFirst);
    const stats500 = ((countStats(sectionPlain) / (wordCount(sectionPlain) || 1)) * 500).toFixed(1);
    const paras = splitParagraphs(b.section);
    const longParas = paras.filter((p) => wordCount(stripMdx(p)) > 120).length;

    const need = [];
    if (!(words >= 50 && words <= 60)) need.push(`open ${words}w to 50-60w`);
    if (!DEFINITION_RE.test(b.plainFirst)) need.push('definition verb');
    if (!/\d/.test(b.plainFirst)) need.push('number in opening');
    if (PRONOUN_START_RE.test(b.plainFirst)) need.push('pronoun start');
    if (!QUESTION_H2_RE.test(b.heading) && !/\?$/.test(b.heading.trim())) need.push('question H2');
    if (!/^\|.+\|/m.test(b.section)) need.push('table');
    if (!/^[-*]\s/m.test(b.section) && !/^\d+\.\s/m.test(b.section)) need.push('list');
    if (paras.length && longParas / paras.length > 0.25) need.push(`${longParas} long paras`);
    if (Number(stats500) < 5) need.push(`stats ${stats500}/500`);
    if (!UNIQUE_RE.test(sectionPlain) && !KEYWORD_RE.test(sectionPlain)) need.push('unique signal');

    console.log(
      `  ${String(s.overall).padStart(3)} | a${s.answer} s${s.selfContain} st${s.structure} d${s.stats} u${s.unique} | ${b.heading.slice(0, 62)}`,
    );
    if (need.length) console.log(`        fix: ${need.join(', ')}`);
  }

  const cit = findCitabilityBlocks(body);
  if (cit.length < 2) {
    console.log(`  citability blocks: ${cit.length}/2 (need standalone 130-170w paragraph with a number)`);
  }
}

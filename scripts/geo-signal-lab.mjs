#!/usr/bin/env node
/**
 * Measure candidate signals against the labelled sets.
 *
 * A rule is an opinion until it separates machine text from written text on
 * data somebody labelled. This harness exists so that adding a rule to the
 * rubric costs one measurement rather than one argument, and so that a rule
 * that fails leaves a number behind in docs/GEO-SCORING.md instead of vanishing.
 *
 *   node scripts/geo-signal-lab.mjs <candidates.mjs>
 *
 * The candidates module exports `candidates`: an array of
 *   { name, describe, fn(raw, ctx) -> number }
 * where higher is expected to mean MORE machine-like. A candidate that comes
 * out backwards is reported as backwards rather than quietly flipped, because
 * the reference site shipped three rules that separated in the wrong direction.
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadCorpus, scoreDocument } from './lib/geo/score.mjs';
import { plainText, words, sentences, figurePhrases } from './lib/geo/corpus-signals.mjs';
import { sections, documentSignals } from './lib/geo/document-signals.mjs';

const LAB = '/tmp/geo-lab';
const SETS = ['bad', 'good', 'mid'];

function loadSet(name) {
  const dir = path.join(LAB, name);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx')).map((f) => path.join(dir, f));
  if (!files.length) throw new Error(`labelled set ${name} is empty; run node scripts/geo-calibrate.mjs --prepare`);
  const index = loadCorpus(files);
  return { name, files, index };
}

function stats(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const mean = xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
  return {
    n: xs.length,
    mean,
    median: s[Math.floor(s.length / 2)] ?? 0,
    min: s[0] ?? 0,
    max: s[s.length - 1] ?? 0,
  };
}

/**
 * How well does one number alone tell the two classes apart?
 *
 * AUC is used rather than a difference of means because a signal can move the
 * mean while overlapping completely, which is what "it separates" usually turns
 * out to mean when nobody checked. 0.5 is a coin toss; 1.0 is a clean split.
 */
function auc(badValues, goodValues) {
  let wins = 0;
  let ties = 0;
  for (const b of badValues) {
    for (const g of goodValues) {
      if (b > g) wins += 1;
      else if (b === g) ties += 1;
    }
  }
  const total = badValues.length * goodValues.length || 1;
  return (wins + ties / 2) / total;
}

const target = process.argv[2];
if (!target) {
  console.error('usage: node scripts/geo-signal-lab.mjs <candidates.mjs>');
  process.exit(2);
}

const mod = await import(path.resolve(target));
const candidates = mod.candidates || [];
const sets = SETS.map(loadSet);

const ctx = { plainText, words, sentences, figurePhrases, sections, documentSignals, scoreDocument };

console.log(`\n=== candidate signals, measured on ${sets.map((s) => `${s.name}=${s.files.length}`).join(' ')} ===`);
console.log('higher is expected to mean more machine-like; AUC 0.5 = no information, 1.0 = clean split\n');

const rows = [];
for (const c of candidates) {
  const values = {};
  for (const s of sets) {
    values[s.name] = s.files.map((f) => {
      const raw = fs.readFileSync(f, 'utf8');
      try {
        return Number(c.fn(raw, { ...ctx, docId: path.basename(f), index: s.index, file: f })) || 0;
      } catch (e) {
        return 0;
      }
    });
  }
  const st = Object.fromEntries(SETS.map((k) => [k, stats(values[k])]));
  const a = auc(values.bad, values.good);
  rows.push({ name: c.name, describe: c.describe, st, auc: a });
}

rows.sort((x, y) => Math.abs(y.auc - 0.5) - Math.abs(x.auc - 0.5));

for (const r of rows) {
  const verdict = r.auc >= 0.85 ? 'SEPARATES'
    : r.auc <= 0.15 ? 'SEPARATES BACKWARDS'
      : r.auc >= 0.7 || r.auc <= 0.3 ? 'weak' : 'no information';
  console.log(`${r.name}`);
  if (r.describe) console.log(`  ${r.describe}`);
  for (const k of SETS) {
    const s = r.st[k];
    console.log(`  ${k.padEnd(5)} mean=${s.mean.toFixed(3).padStart(9)}  median=${s.median.toFixed(3).padStart(9)}  min=${s.min.toFixed(3).padStart(9)}  max=${s.max.toFixed(3).padStart(9)}`);
  }
  const midBetween = r.st.mid.mean > Math.min(r.st.bad.mean, r.st.good.mean)
    && r.st.mid.mean < Math.max(r.st.bad.mean, r.st.good.mean);
  console.log(`  AUC(bad>good) = ${r.auc.toFixed(3)}  -> ${verdict}${midBetween ? '' : '   [mid does NOT sit between: scale may be binary]'}\n`);
}

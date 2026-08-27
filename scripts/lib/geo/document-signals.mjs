/**
 * Single-document signals.
 *
 * Every signal here earned its place on the labelled sets. Candidates that
 * sounded right and failed are recorded in docs/GEO-SCORING.md rather than
 * quietly dropped, because the previous rubric was built entirely out of
 * plausible-sounding rules that nobody ever tested.
 *
 * Measured (machine-injected corpus vs hand-written):
 *   malformed tokens per file    13.1  vs  0.0
 *   heading-echo openers         10.5  vs  0.6
 *   most-repeated opener shape   0.69  vs  0.16
 *   hedge words per 1000 words    5.9  vs  1.9
 */

import { plainText, words, sentences } from './corpus-signals.mjs';

/** Wreckage left by string-templating: "r," and "undefined" reached production in July. */
const MALFORMED_RE = /\bundefined\b|\bNaN\b|\bR\s*,|\s,\s|\b(\w+)\s+\1\b(?!\s*(?:street|road|bay))/gi;

// "may" is matched lowercase only, deliberately. Case-insensitively it also
// matches the month, and a news article quoting MPC meeting dates was charged
// 12 points for writing "May 2026" seven times. The month is always
// capitalised and hedging "may" is almost always mid-sentence, so lowercase is
// a near-perfect discriminator: on the labelled sets the change moves the
// machine corpus from 5.83 to 5.77 hedges per 1000 and leaves the
// hand-written set at 1.87 exactly.
const HEDGE_RE_I = /\b(might|could|generally|typically|usually|often|tends? to|somewhat|relatively)\b/gi;
const HEDGE_RE_MAY = /\bmay\b/g;

export function sections(raw) {
  const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const parts = body.split(/^## /m).slice(1);
  return parts.map((part) => {
    const nl = part.indexOf('\n');
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim();
    const section = nl === -1 ? '' : part.slice(nl + 1);
    const text = plainText(section);
    return { heading, section, text, firstSentence: sentences(text)[0] || '' };
  });
}

export function malformedTokens(raw) {
  const found = plainText(raw).match(MALFORMED_RE) || [];
  return { count: found.length, samples: [...new Set(found)].slice(0, 5) };
}

/**
 * An opener that just restates its own heading answers nothing. The generator
 * produced these by construction; a writer answering the question does not.
 */
export function headingEchoes(raw) {
  const norm = (t) => words(t.toLowerCase()).join(' ');
  const hits = [];
  for (const s of sections(raw)) {
    const h = words(s.heading.toLowerCase());
    const opener = norm(s.firstSentence);
    if (h.length < 4 || !opener) continue;

    // An answer naturally reuses its question's nouns, so bag-of-words overlap
    // flags good writing. What the generator did instead was paste the heading
    // in verbatim behind a template, which shows up as a long contiguous run.
    let longestRun = 0;
    for (let i = 0; i < h.length; i += 1) {
      for (let n = h.length - i; n >= 4; n -= 1) {
        if (opener.includes(h.slice(i, i + n).join(' '))) {
          longestRun = Math.max(longestRun, n);
          break;
        }
      }
    }
    if (longestRun >= HEADING_ECHO_MIN_RUN) hits.push({ heading: s.heading, run: longestRun });
  }
  return hits;
}

/**
 * Five contiguous heading words was the threshold this arrived with, and on
 * this corpus it finds almost nothing: the generator here rewrites the heading
 * rather than pasting it, so "What Is ARIA Ex Macello Milan?" is answered by
 * "ARIA Ex Macello typically means a 150,000 sqm district", a run of three.
 *
 * Measured on the labelled sets, a run of three separates where five does not:
 * machine files average 3.73 echoing sections against 0.42 hand-written, AUC
 * 0.928. Three is also where it stops: at two, "property in" and "buying a"
 * start matching and every article echoes everything.
 */
export const HEADING_ECHO_MIN_RUN = 3;

/**
 * Section openers built as "<the page's own subject> (typically) means <clause>".
 *
 * This is the shape of the campaign that ran on this corpus, and it is invisible
 * to every prefix-based check because the fixed part sits mid-sentence behind a
 * subject that changes on every page. Measured: 61.7% of machine sections open
 * this way against 2.2% hand-written and 5.6% in the semi-automatic middle,
 * AUC 0.923.
 *
 * The verb list is short on purpose. "means" and "involves" used as the main
 * verb of an opener is a definition frame; a writer answering a question
 * normally states the answer instead. Wider lists were tried and pulled in
 * ordinary sentences, and a rule that caps a score has to be precise.
 */
const DEFINITION_FRAME = /\b(?:typically\s+)?(?:means|mean|involves|involve|requires|require)\b/i;
const FRAME_HEAD_WORDS = 14;

export function definitionFrameOpeners(raw) {
  const secs = sections(raw);
  if (!secs.length) return { share: 0, count: 0, sections: 0, example: null };
  const hits = secs.filter((s) => {
    const head = (s.firstSentence || '').split(/\s+/).slice(0, FRAME_HEAD_WORDS).join(' ');
    return DEFINITION_FRAME.test(head);
  });
  return {
    share: hits.length / secs.length,
    count: hits.length,
    sections: secs.length,
    example: hits[0] ? hits[0].firstSentence.slice(0, 140) : null,
  };
}

/**
 * Qualifier pile-ups at the end of a sentence.
 *
 * The generator finishes a clause and then bolts on where, for whom, when and
 * under what: "...for a single Italian property identified by foglio, particella,
 * subalterno data, and a capped euro price in 2026 remote files for foreign
 * buyers who cannot attend notaio in person under Italian deed rules." A writer
 * would have stopped two phrases earlier. Measured per 1000 words: machine 2.85,
 * hand-written 0.72, middle 1.37, AUC 0.885, and the middle sits between.
 *
 * Three phrases is the floor because two is ordinary English ("in Milan for
 * non-residents"). Requiring four separates worse (AUC 0.738), which is the
 * usual sign that a stricter rule is measuring rarity rather than the defect.
 */
const PP = '(?:in|for|on|with|before|under|at|across|during|per|from|by|against|beyond)';
const TAIL_CHAIN = new RegExp(`\\b${PP}\\b[^,.;:]{2,45}(?:\\s+\\b${PP}\\b[^,.;:]{2,45}){2,}\\s*[.]`, 'gi');

export function tailQualifierChains(raw) {
  const text = plainText(raw);
  const w = words(text).length || 1;
  const hits = text.match(TAIL_CHAIN) || [];
  return { per1000: (hits.length / w) * 1000, count: hits.length, example: hits[0] ? hits[0].slice(-140) : null };
}

/** If every section opens with the same four-word shape, one template wrote them all. */
export function openerTemplateShare(raw) {
  const keys = sections(raw)
    .map((s) => words(s.firstSentence).slice(0, 4).map((w) => (/^\d/.test(w) ? '#' : w.toLowerCase())).join(' '))
    .filter(Boolean);
  if (keys.length < 3) return { share: 0, shape: null, sections: keys.length };
  const counts = new Map();
  for (const k of keys) counts.set(k, (counts.get(k) || 0) + 1);
  const [shape, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return { share: n / keys.length, shape, sections: keys.length };
}

export function hedgeDensity(raw) {
  const text = plainText(raw);
  const w = words(text).length || 1;
  const hits = (text.match(HEDGE_RE_I) || []).length + (text.match(HEDGE_RE_MAY) || []).length;
  return (hits / w) * 1000;
}

/**
 * Figures that appear once, in prose, and never again anywhere on the page.
 * Not a defect on its own (hand-written articles carry more prose figures than
 * the generated ones did), so this is reported for review, never scored.
 */
export function orphanFigures(raw) {
  const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const re = /(?:€\s?\d[\d,]*(?:\.\d+)?(?:\s*(?:million|bn|k))?|\d+(?:\.\d+)?%)/gi;
  const counts = new Map();
  for (const m of body.match(re) || []) {
    const k = m.trim().replace(/\s+/g, ' ').toLowerCase();
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n === 1).map(([k]) => k);
}

/**
 * Repetition between sections of one article.
 *
 * The cross-file detector misses a file that repeats itself, which is what a
 * generator does when it fills every section from one template. Measured over
 * the labelled sets this separates perfectly: machine files average 0.27, and
 * all ten hand-written articles score exactly 0.
 */
export function crossSectionEcho(raw) {
  const secs = sections(raw);
  if (secs.length < 2) return { score: 0, worst: null };
  const grams = secs.map((s) => {
    const w = words(s.text).map((x) => x.toLowerCase());
    const set = new Set();
    for (let i = 0; i + 8 <= w.length; i += 1) set.add(w.slice(i, i + 8).join(' '));
    return set;
  });
  let shared = 0;
  let total = 0;
  let worst = null;
  for (let i = 0; i < grams.length; i += 1) {
    let mine = 0;
    for (const g of grams[i]) {
      const elsewhere = grams.some((other, j) => j !== i && other.has(g));
      if (elsewhere) { shared += 1; mine += 1; }
      total += 1;
    }
    const share = grams[i].size ? mine / grams[i].size : 0;
    if (!worst || share > worst.share) worst = { heading: secs[i].heading, share: Number(share.toFixed(3)) };
  }
  return { score: total ? shared / total : 0, worst };
}

/**
 * A currency amount bolted to a noun that cannot carry one. A generator
 * produces "R450,000 turnaround" and "R2,000,000 withholding awareness" by
 * slotting a number into a template that never asked what the number measured.
 * These rules are deliberately narrow; they fire zero times on hand-written text.
 *
 * The head nouns are corpus-specific and have to be rebuilt when the rubric
 * moves site to site, because a word that is nonsense in one market is ordinary
 * vocabulary in another. The list this arrived with named `occupancy`, `LTV` and
 * `vacancy`, all three of which are normal Italian-market usage here: `70%
 * occupancy` alone appears 89 times in legitimate sentences, and a mortgage
 * guide writing `60% loan-to-value` is correct. Keeping them would have armed a
 * score-capping gate against good writing, which is the failure this rubric
 * exists to avoid.
 *
 * So the heads below were chosen by measurement rather than by intuition: a
 * sweep of all 272 articles for a figure followed by an abstract noun returned
 * six constructions in total, and every one of them was legitimate (`€15,000
 * due diligence`, `€180,000 closing and diligence`). None of the heads listed
 * here occurs after a figure anywhere in the corpus, so the rule cannot misfire
 * on the text that exists; it stands as a tripwire for the text a generator
 * would add. Today it fires on 0 of 272 files, which is the correct reading of
 * a corpus whose defect is duplication rather than malformed arithmetic.
 */
const UNIT_TYPE_RULES = [
  /€\s?[\d,]+(?:\.\d+)?\s*(?:million|bn|k)?\s+(turnaround|awareness|confirmation|clarity|sentiment|appetite|certainty|readiness|credibility|momentum|perception)\b/gi,
  /\b\d+(?:\.\d+)?%\s+(turnaround|awareness|confirmation|clarity|certainty|readiness|credibility|carry proof)\b/gi,
  /€\s?[\d,]+(?:\.\d+)?\s+(?:buyer awareness|compliance awareness|conformity confirmation|notary awareness|endorsement language)\b/gi,
];

// A currency amount followed by a bare duration ("R135,000 months") reads as a
// generator slip but is also ordinary compressed English, so it is not a rule:
// it fired on a hand-written sentence about nightly rates stacking into monthly
// revenue. Precision matters more than recall for a check that caps a score.

export function unitTypeViolations(raw) {
  const text = plainText(raw);
  const hits = [];
  for (const re of UNIT_TYPE_RULES) {
    for (const m of text.match(new RegExp(re.source, re.flags)) || []) hits.push(m.trim());
  }
  return [...new Set(hits)];
}

export function documentSignals(raw) {
  return {
    malformed: malformedTokens(raw),
    headingEchoes: headingEchoes(raw),
    definitionFrame: definitionFrameOpeners(raw),
    tailQualifiers: tailQualifierChains(raw),
    openerTemplate: openerTemplateShare(raw),
    hedgePer1000: hedgeDensity(raw),
    crossSectionEcho: crossSectionEcho(raw),
    unitTypeViolations: unitTypeViolations(raw),
    sectionCount: sections(raw).length,
    wordCount: words(plainText(raw)).length,
  };
}

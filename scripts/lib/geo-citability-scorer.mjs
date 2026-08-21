/**
 * GEO citability scoring (geo-seo-claude rubric adapted for MORE Group MDX).
 * Weights: answer 30%, self-containment 25%, structure 20%, stats 15%, uniqueness 10%.
 */

export const RUBRIC_WEIGHTS = {
  answer: 0.3,
  selfContain: 0.25,
  structure: 0.2,
  stats: 0.15,
  unique: 0.1,
};

export const CITABILITY_BLOCK_MIN = 130;
export const CITABILITY_BLOCK_MAX = 170;
export const ANSWER_FIRST_MIN = 40;
export const ANSWER_FIRST_MAX = 60;
export const THIN_H2_OPEN = 35;

const DEFINITION_RE =
  /\b(is|are|refers to|means|typically|costs|starts at|ranges from|allows|requires)\b/i;

/** Stat patterns for GEO density — supports ZAR/R prefix, glued %, and "14 business days". */
const STAT_PATTERNS = [
  /\b\d+(?:\.\d+)?%/g,
  /\b\d+(?:\.\d+)?\s*(?:percent|million|bn|billion|thousand|k\b)/gi,
  /\b\d+(?:\.\d+)?\s+(?:business\s+)?(?:years?|months?|weeks?|days?)\b/gi,
  /\b\d+(?:\.\d+)?\s*sqm\b/gi,
  /\b\d+(?:\.\d+)?\s*sq\.?\s*m(?:²|2)?(?!\w)/gi,
  /\b\d+(?:\.\d+)?\s*m[²2](?!\w)/gi,
  /\b\d[\d,]*(?:\.\d+)?\s*(?:USD|EUR|GBP|THB|AED|MXN|ZAR|SAR|SGD|CHF)\b/gi,
  /\b(?:USD|EUR|GBP|THB|AED|MXN|ZAR|SAR|SGD|CHF)\s+[\d,]+(?:\.\d+)?/gi,
  /\bR\s?[\d,]+(?:\.\d+)?(?:\s*(?:million|m\b|k\b|bn\b))?/gi,
  /\$\d[\d,]*(?:\.\d+)?(?:\s*k\b)?/g,
  /€\d[\d,]*(?:\.\d+)?/g,
  /£\d[\d,]*(?:\.\d+)?/g,
  /\d[\d,]*(?:\.\d+)?\s*(?:฿|₽)/g,
];

/** @deprecated Use hasStat() — kept for callers that expect a RegExp. */
export const STAT_RE = /\b\d+(?:\.\d+)?(?:%|\s*(?:percent|million|bn|billion|thousand|k\b|years?|months?|weeks?|days?|sqm|sq\.?\s*m(?:²|2)?|USD|EUR|GBP|THB|AED|MXN|ZAR|SAR|SGD|CHF)\b)|\b(?:USD|EUR|GBP|THB|AED|MXN|ZAR|SAR|SGD|CHF|R)\s*[\d,]+|\$\d|€\d|£\d|\d[\d,]*\s*(?:฿|₽)/i;

export function findStatMatches(text) {
  const spans = [];
  for (const re of STAT_PATTERNS) {
    const r = new RegExp(re.source, re.flags);
    for (const m of text.matchAll(r)) {
      if (m.index == null) continue;
      spans.push([m.index, m.index + m[0].length]);
    }
  }
  spans.sort((a, b) => a[0] - b[0]);
  let count = 0;
  let lastEnd = -1;
  for (const [start, end] of spans) {
    if (start >= lastEnd) {
      count += 1;
      lastEnd = end;
    }
  }
  return count;
}

export function hasStat(text) {
  return findStatMatches(text) > 0;
}
const VAGUE_RE = /\b(many|several|some|often|usually|a lot|significant|various)\b/i;
const PRONOUN_START_RE = /^(it|this|they|these|those|however|but|and|also)\b/i;
const QUESTION_H2_RE = /^(what|how|why|when|where|who|which|can|do|does|is|are|should|will)\b/i;
/**
 * Markers of genuine first-party evidence. These earn a SMALL bonus — they are a
 * weak signal that a section carries original analysis, not a substitute for
 * measuring whether the text is actually distinctive.
 */
const EVIDENCE_RE =
  /\b(our (analysis|data|clients|underwriting)|we (surveyed|analyzed|tracked)|case study|methodology|checklist|red flag|buyer scenario)\b/i;

export function wordCount(text) {
  return (text.match(/\b[\w']+\b/g) || []).length;
}

export function stripMdx(text) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/`[^`]+`/g, ' ')
    .replace(/\{[^}]+\}/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseMdxBody(raw) {
  const m = raw.match(/^---\n[\s\S]*?\n---\n?/);
  return m ? raw.slice(m[0].length) : raw;
}

export function splitParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && !/^#{1,6}\s/.test(p) && !/^[-*]\s/.test(p) && !/^\d+\.\s/.test(p));
}

const SKIP_H2 =
  /Closing|Faq|Independent verification|MORE Group underwriting|who we are \(citable|Get Personal Help/i;

export function extractH2Blocks(body) {
  const blocks = [];
  const re = /^## (.+)$/gm;
  let match;
  const headings = [];
  while ((match = re.exec(body)) !== null) {
    headings.push({ title: match[1], index: match.index });
  }
  for (let i = 0; i < headings.length; i += 1) {
    const { title, index } = headings[i];
    if (SKIP_H2.test(title)) continue;
    const start = index + body.slice(index).indexOf('\n') + 1;
    const end = i + 1 < headings.length ? headings[i + 1].index : body.length;
    const section = body.slice(start, end).trim();
    const firstPara = splitParagraphs(section.replace(/^##[^\n]*\n?/, ''))[0] || '';
    blocks.push({ heading: title, section, firstPara, plainFirst: stripMdx(firstPara) });
  }
  return blocks;
}

function bandScore(value, bands) {
  for (const [min, score] of bands) {
    if (value >= min) return score;
  }
  return bands[bands.length - 1][1];
}

export function scoreAnswerQuality(plainFirst, heading) {
  if (!plainFirst) return 15;
  const words = wordCount(plainFirst);
  let score = 30;
  if (words >= ANSWER_FIRST_MIN && words <= ANSWER_FIRST_MAX) score += 35;
  else if (words >= 25 && words < ANSWER_FIRST_MIN) score += 20;
  else if (words > ANSWER_FIRST_MAX && words <= 90) score += 25;
  else if (words < 15) score -= 20;
  if (DEFINITION_RE.test(plainFirst)) score += 20;
  if (hasStat(plainFirst)) score += 15;
  if (QUESTION_H2_RE.test(heading) || /\?$/.test(heading.trim())) score += 5;
  if (/in this section|we will discuss|let'?s explore|overview of/i.test(plainFirst)) score -= 25;
  return Math.max(0, Math.min(100, score));
}

export function scoreSelfContainment(plainFirst, sectionPlain) {
  if (!plainFirst) return 10;
  let score = 40;
  const words = wordCount(plainFirst);
  if (words >= 50 && words <= 200) score += 25;
  else if (words >= 35) score += 12;
  if (PRONOUN_START_RE.test(plainFirst)) score -= 20;
  if (hasStat(sectionPlain)) score += 15;
  // A paragraph that carries its own figure can be quoted standalone. The
  // previous +10 here was paid for the literal strings "the project", "this
  // market", "the area", "the developer" and "foreign buyers" — the same class
  // of keyword bounty that scoreUniqueness() paid for the brand name, and the
  // reason 1,492 leads ended "… for foreign buyers".
  if (hasStat(plainFirst)) score += 10;
  if (VAGUE_RE.test(plainFirst) && !hasStat(plainFirst)) score -= 10;
  return Math.max(0, Math.min(100, score));
}

export function scoreStructure(section, heading) {
  let score = 35;
  if (QUESTION_H2_RE.test(heading) || /\?$/.test(heading.trim())) score += 20;
  if (/^\|.+\|/m.test(section)) score += 15;
  if (/^[-*]\s/m.test(section) || /^\d+\.\s/m.test(section)) score += 15;
  const paras = splitParagraphs(section);
  const longParas = paras.filter((p) => wordCount(stripMdx(p)) > 120).length;
  if (paras.length && longParas / paras.length <= 0.25) score += 15;
  else if (longParas > 2) score -= 10;
  return Math.max(0, Math.min(100, score));
}

export function countStats(text) {
  return findStatMatches(text);
}

export function scoreStatisticalDensity(sectionPlain) {
  const words = wordCount(sectionPlain) || 1;
  const stats = countStats(sectionPlain);
  const per500 = (stats / words) * 500;
  return bandScore(per500, [
    [5, 100],
    [3, 85],
    [2, 70],
    [1, 55],
    [0.5, 40],
    [0, 15],
  ]);
}

/** 6-gram shingles, the same window the duplicate detector uses. */
function shingleSet(text, k = 6) {
  const w = String(text).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i + k <= w.length; i += 1) out.add(w.slice(i, i + k).join(' '));
  return out;
}

/**
 * How distinctive this section's wording actually is.
 *
 * The previous implementation did not measure uniqueness at all: it awarded +45
 * for the section containing the literal string "MORE Group" (or "insider tip",
 * "our analysis", …). That is the mechanism behind the duplication this audit
 * had to clean up — the rubric told every writer that stamping the brand into
 * each section scored 95/100 on "uniqueness", so they did, 463 redundant
 * paragraph instances later, 48% of which carry that exact trigger phrase.
 *
 * Uniqueness is now shingle novelty: the share of the section's 6-gram windows
 * that appear nowhere else. Measured against the rest of the page always, and
 * against the rest of the corpus when the caller supplies an index — cross-page
 * duplication was previously invisible here, which is how 18 area pages carried
 * one identical paragraph while each scored 90+.
 *
 * @param {string} sectionPlain
 * @param {string} bodyPlain            the rest of this page
 * @param {Set<string>} [corpusShingles] shingles seen on OTHER pages
 */
export function scoreUniqueness(sectionPlain, bodyPlain, corpusShingles) {
  const section = shingleSet(sectionPlain);
  if (section.size === 0) return 50;

  const rest = shingleSet(String(bodyPlain).split(sectionPlain).join(' '));
  let novelInPage = 0;
  let novelInCorpus = 0;
  for (const g of section) {
    if (!rest.has(g)) novelInPage += 1;
    if (!corpusShingles || !corpusShingles.has(g)) novelInCorpus += 1;
  }
  const pageNovelty = novelInPage / section.size;
  const corpusNovelty = novelInCorpus / section.size;

  // Cross-page distinctiveness is the harder and more valuable property, so it
  // carries the larger weight when the caller can supply corpus context.
  const novelty = corpusShingles ? 0.35 * pageNovelty + 0.65 * corpusNovelty : pageNovelty;

  let score = Math.round(novelty * 90);
  if (EVIDENCE_RE.test(sectionPlain)) score += 8;
  if (/according to (the )?(world bank|oecd|istat|omi|nomisma|agenzia delle entrate|official)/i.test(sectionPlain)) {
    score += 5;
  }
  return Math.max(0, Math.min(100, score));
}

export function scoreBlock(block, bodyPlain, corpusShingles) {
  const sectionPlain = stripMdx(block.section);
  const sub = {
    answer: scoreAnswerQuality(block.plainFirst, block.heading),
    selfContain: scoreSelfContainment(block.plainFirst, sectionPlain),
    structure: scoreStructure(block.section, block.heading),
    stats: scoreStatisticalDensity(sectionPlain),
    unique: scoreUniqueness(sectionPlain, bodyPlain, corpusShingles),
  };
  const overall = Math.round(
    sub.answer * RUBRIC_WEIGHTS.answer +
      sub.selfContain * RUBRIC_WEIGHTS.selfContain +
      sub.structure * RUBRIC_WEIGHTS.structure +
      sub.stats * RUBRIC_WEIGHTS.stats +
      sub.unique * RUBRIC_WEIGHTS.unique,
  );
  return { ...sub, overall, heading: block.heading };
}

export function findCitabilityBlocks(body) {
  const bodyPlain = stripMdx(body);
  const paras = splitParagraphs(body);
  return paras
    .map((p) => ({ raw: p, plain: stripMdx(p), words: wordCount(stripMdx(p)) }))
    .filter(
      (p) =>
        p.words >= CITABILITY_BLOCK_MIN &&
        p.words <= CITABILITY_BLOCK_MAX &&
        hasStat(p.plain) &&
        !PRONOUN_START_RE.test(p.plain),
    );
}

export function scorePage(body, { collection, corpusShingles } = {}) {
  const bodyPlain = stripMdx(body);
  const blocks = extractH2Blocks(body);
  const blockScores = blocks.map((b) => scoreBlock(b, bodyPlain, corpusShingles));
  const citabilityBlocks = findCitabilityBlocks(body);

  const avg =
    blockScores.length > 0
      ? Math.round(blockScores.reduce((s, b) => s + b.overall, 0) / blockScores.length)
      : 0;
  const coverage =
    blockScores.length > 0
      ? Math.round((blockScores.filter((b) => b.overall >= 70).length / blockScores.length) * 100)
      : 0;

  const categoryAvgs = {};
  for (const key of ['answer', 'selfContain', 'structure', 'stats', 'unique']) {
    categoryAvgs[key] = blockScores.length
      ? Math.round(blockScores.reduce((s, b) => s + b[key], 0) / blockScores.length)
      : 0;
  }

  const issues = [];
  const commercial = ['guides', 'gajdy', 'comparisons', 'sravneniya', 'areas', 'rajony', 'compare'].includes(
    collection,
  );

  if (commercial && !/<TldrBlock/.test(body)) issues.push('missing-tldr');
  if (commercial && !/insider tip/i.test(body)) issues.push('missing-insider-tip');
  if (/## Independent verification notes/.test(body)) issues.push('generic-verification-padding');

  for (const block of blocks.slice(0, 6)) {
    const w = wordCount(block.plainFirst);
    if (w > 0 && w < THIN_H2_OPEN) {
      issues.push(`thin-h2-open:${block.heading.slice(0, 48)} (${w}w)`);
    }
  }

  if (commercial && citabilityBlocks.length < 2) {
    issues.push(`citability-blocks:${citabilityBlocks.length}/2 (need ${CITABILITY_BLOCK_MIN}-${CITABILITY_BLOCK_MAX}w + stat)`);
  }

  const worst = [...blockScores].sort((a, b) => a.overall - b.overall).slice(0, 3);

  return {
    score: avg,
    coverage,
    categoryAvgs,
    blockCount: blockScores.length,
    citabilityBlockCount: citabilityBlocks.length,
    blockScores,
    worstBlocks: worst,
    issues,
  };
}

export function scoreToGrade(score) {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

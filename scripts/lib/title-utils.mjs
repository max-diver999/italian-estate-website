/**
 * Shared SERP title helpers — no blind slice(0, 60).
 * Used by batch fix scripts, validators, and title rewrite pipeline.
 */

export const STOP_TAIL =
  /\b(and|for|to|in|with|vs|or|the|a|an|by|from|on|at|of|&)\s*$|[&,:]\s*$/i;

export const SERP_SUFFIX = ' | Italian Estate';
export const FM_MIN = 40;
export const FM_MAX = 60;
export const SERP_MAX_DEFAULT = 60;
export const SERP_MAX_PROJECT = 68;

export function isDanglingTitle(title) {
  return STOP_TAIL.test(String(title || '').trim());
}

export function cleanTail(title) {
  let t = String(title || '').trim();
  while (STOP_TAIL.test(t)) {
    t = t.replace(STOP_TAIL, '').trim();
  }
  return t;
}

export function fullTitle(title) {
  const t = String(title || '').trim();
  return t.includes('Italian Estate') ? t : `${t}${SERP_SUFFIX}`;
}

export function serpLength(title) {
  return fullTitle(title).length;
}

export function firstClause(text, maxLen = 46) {
  const head = String(text || '').split(':')[0].trim();
  if (head && head.length <= maxLen) return head;
  return null;
}

export function compactPhrase(text) {
  return String(text || '')
    .replace(/\s*\(2026\)\s*$/i, '')
    .replace(/:\s*Prices, Yield & Investment Analysis.*$/i, ': Prices & Yield')
    .replace(/:\s*Prices, Availability and.*$/i, ': Prices & Availability')
    .replace(/:\s*Step-by-Step Guide.*$/i, ': Step-by-Step Guide')
    .replace(/:\s*Ownership Guide.*$/i, '')
    .replace(/:\s*Complete Guide.*$/i, ': Guide')
    .replace(/:\s*Honest Guide.*$/i, ': Guide')
    .replace(/:\s*Full Comparison.*$/i, ' Compared')
    .replace(/:\s*Investment Comparison.*$/i, ' Compared')
    .replace(/Property Guide/gi, 'Guide')
    .replace(/Investment Guide/gi, 'Guide')
    .replace(/Real Estate/gi, 'Property')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fitsTitle(title, opts = {}) {
  const minLen = opts.minLen ?? FM_MIN;
  const maxLen = opts.maxLen ?? FM_MAX;
  const maxFull = opts.maxFull ?? SERP_MAX_DEFAULT;
  const t = cleanTail(title);
  if (!t || isDanglingTitle(t)) return false;
  if (t.length < minLen || t.length > maxLen) return false;
  if (serpLength(t) > maxFull) return false;
  return true;
}

function trimWordsToFit(title, maxLen, minLen, maxFull = SERP_MAX_DEFAULT) {
  const words = cleanTail(title).split(/\s+/).filter(Boolean);
  while (words.length > 2) {
    words.pop();
    const candidate = cleanTail(words.join(' '));
    if (
      candidate.length >= minLen &&
      candidate.length <= maxLen &&
      serpLength(candidate) <= maxFull &&
      !isDanglingTitle(candidate)
    ) {
      return candidate;
    }
  }
  return null;
}

function shortenLongTitle(title, opts) {
  const minLen = opts.minLen ?? FM_MIN;
  const maxLen = opts.maxLen ?? FM_MAX;
  const maxFull = opts.maxFull ?? SERP_MAX_DEFAULT;
  const effectiveMax = Math.min(maxLen, maxFull - SERP_SUFFIX.length);

  let t = cleanTail(title);
  if (fitsTitle(t, { minLen, maxLen: effectiveMax, maxFull })) return t;

  if (t.includes(':')) {
    const head = t.split(':')[0].trim();
    if (fitsTitle(head, { minLen, maxLen: effectiveMax, maxFull })) return head;
    const compactHead = compactPhrase(head);
    if (fitsTitle(compactHead, { minLen, maxLen: effectiveMax, maxFull })) return compactHead;
  }

  const compact = compactPhrase(t);
  if (fitsTitle(compact, { minLen, maxLen: effectiveMax, maxFull })) return compact;

  const clause = firstClause(t, effectiveMax);
  if (clause && fitsTitle(clause, { minLen, maxLen: effectiveMax, maxFull })) return clause;

  const wordTrimmed = trimWordsToFit(compact || t, effectiveMax, minLen, maxFull);
  if (wordTrimmed) return wordTrimmed;

  return trimWordsToFit(t, effectiveMax, Math.min(minLen, 30), maxFull);
}

function padShortTitle(title, opts) {
  const minLen = opts.minLen ?? FM_MIN;
  const maxLen = opts.maxLen ?? FM_MAX;
  const maxFull = opts.maxFull ?? SERP_MAX_DEFAULT;
  const effectiveMax = Math.min(maxLen, maxFull - SERP_SUFFIX.length);
  const suffixes = opts.padSuffixes ?? [' (2026)', ' Guide', ' | Italy', ' Review'];

  let t = cleanTail(title);
  if (t.length >= minLen) return t;

  for (const suffix of suffixes) {
    const next = cleanTail(`${t.replace(/[,;:\s]+$/, '')}${suffix}`);
    if (fitsTitle(next, { minLen, maxLen: effectiveMax, maxFull })) return next;
  }

  const fallback = cleanTail(`${t} Guide (2026)`);
  if (fitsTitle(fallback, { minLen, maxLen: effectiveMax, maxFull })) return fallback;

  return t.length >= minLen ? t : null;
}

/**
 * Normalize frontmatter title for batch scripts.
 * Never returns dangling tails; avoids character slicing as primary strategy.
 */
export function normalizeTitleLength(val, opts = {}) {
  const kind = opts.kind ?? 'guide';
  const maxFull =
    kind === 'project'
      ? SERP_MAX_PROJECT
      : kind === 'news'
        ? 999
        : opts.maxFull ?? SERP_MAX_DEFAULT;
  const minLen = kind === 'news' ? 45 : opts.minLen ?? FM_MIN;
  const maxLen = kind === 'news' ? 65 : opts.maxLen ?? FM_MAX;
  const padSuffixes =
    opts.padSuffixes ??
    (kind === 'news'
      ? [' | Italy News', ' Update', ' (2026)']
      : kind === 'project'
        ? [' Review 2026', ' Review 2026: Prices & Yield', ' (2026)']
        : kind === 'resale'
          ? [' Resale', ' Listing', ' (2026)']
          : [' Guide', ' (2026)', ' | Italy', ' Review']);

  let t = cleanTail(String(val || '').replace(/,\s*$/, '').trim());
  if (!t) return t;

  if (fitsTitle(t, { minLen, maxLen, maxFull })) return t;

  if (t.length > maxLen || serpLength(t) > maxFull) {
    const shortened = shortenLongTitle(t, { minLen, maxLen, maxFull, padSuffixes });
    if (shortened) return shortened;
  }

  if (t.length < minLen) {
    const padded = padShortTitle(t, { minLen, maxLen, maxFull, padSuffixes });
    if (padded) return padded;
  }

  return shortenLongTitle(t, { minLen, maxLen, maxFull, padSuffixes });
}

export function titleNeedsFix(title, category = 'guides') {
  const t = String(title || '').trim();
  const maxFull = category === 'projects' ? SERP_MAX_PROJECT : SERP_MAX_DEFAULT;
  if (isDanglingTitle(t)) return true;
  if (t.length < FM_MIN || t.length > FM_MAX) return true;
  if (serpLength(t) > maxFull) return true;
  return false;
}

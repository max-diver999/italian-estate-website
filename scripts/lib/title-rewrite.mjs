/**
 * Intelligent SERP title rewrites — no character slicing.
 */
import {
  STOP_TAIL,
  cleanTail,
  compactPhrase,
  firstClause,
  fitsTitle,
  fullTitle,
  normalizeTitleLength,
  FM_MIN,
  FM_MAX,
  SERP_MAX_DEFAULT,
  SERP_MAX_PROJECT,
} from './title-utils.mjs';

function fits(title, maxFull = SERP_MAX_DEFAULT, minLen = FM_MIN) {
  return fitsTitle(title, { minLen, maxLen: FM_MAX, maxFull });
}

function fitsProjectTitle(title) {
  return fitsTitle(title, { minLen: FM_MIN, maxLen: FM_MAX, maxFull: SERP_MAX_PROJECT });
}

function addYear(title, force = false) {
  if (/\(2026\)/.test(title) || /2026/.test(title)) return title;
  if (!force) return title;
  const withYear = `${title} (2026)`;
  return fits(withYear) ? withYear : title;
}

function slugShortTitle(slug) {
  return null;
}

function rewriteGuide(row) {
  const { title, h1, slug } = row;
  const candidates = [];
  const slugTitle = slugShortTitle(slug);
  if (slugTitle) candidates.push(slugTitle);

  if (h1) {
    if (/\?$/.test(h1)) {
      const q = h1.replace(/\s*:\s*.*$/, '').trim();
      candidates.push(q);
      candidates.push(addYear(q, true));
      candidates.push(addYear(q.replace(/ in Thailand$/i, ''), true));
      if (q.length > 46) {
        candidates.push(`${q.split('?')[0]}?`);
        candidates.push(addYear(`${q.split('?')[0]}?`, true));
      }
    }

    if (/ Compared$/i.test(h1) || / Comparison/i.test(h1)) {
      candidates.push(compactPhrase(h1).replace(/ Compared.*/i, ' Compared'));
      candidates.push(firstClause(h1));
    }

    const compact = compactPhrase(h1);
    candidates.push(compact);
    candidates.push(addYear(compact, /2026/.test(h1)));

    const head = firstClause(h1);
    if (head) {
      candidates.push(head);
      candidates.push(addYear(head, /2026/.test(h1)));
    }

    const parts = h1.split(':');
    if (parts.length >= 2 && parts[0].length <= 38) {
      const suffix = parts[1]
        .replace(/ for Foreign Buyers.*/i, '')
        .replace(/ for EU Citizens 2026/i, '')
        .replace(/ and What It Means.*/i, '')
        .replace(/ and What Owners Actually Experience.*/i, '')
        .replace(/ and Liquidity Reality.*/i, '')
        .replace(/ and What Guests Expect.*/i, '')
        .trim();
      if (suffix.length <= 24) {
        candidates.push(`${parts[0].trim()}: ${suffix}`.replace(/\s+/g, ' '));
      }
    }
  }

  candidates.push(cleanTail(title));

  const slugHuman = slug
    .split('/')
    .pop()
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
  candidates.push(`${slugHuman} Guide (2026)`);
  candidates.push(`${slugHuman} (2026)`);

  for (const c of candidates) {
    const t = cleanTail(c);
    if (fits(t)) return t;
  }

  const fallback = normalizeTitleLength(cleanTail(h1 || title), { kind: 'guide' });
  if (fallback && fits(fallback)) return fallback;
  return null;
}

function rewriteComparison(row) {
  const { title, h1 } = row;
  const source = h1 || title;
  const candidates = [];

  if (/ vs /i.test(source)) {
    const m = source.match(/^(.*? vs .*?)(?::|$)/i);
    if (m) {
      candidates.push(`${m[1].trim()} Compared`);
      candidates.push(`${m[1].trim()}: 2026 Guide`);
      candidates.push(`${m[1].trim()}: Which Wins?`);
    }
  }

  candidates.push(compactPhrase(source));
  candidates.push(cleanTail(title));

  for (const c of candidates) {
    const t = cleanTail(c);
    if (fits(t)) return t;
  }
  return rewriteGuide(row);
}

function rewriteArea(row) {
  return rewriteGuide(row);
}

function rewriteProject(row) {
  const { title, h1 } = row;
  let name = title.split(/\sReview 2026/i)[0].trim();
  if (!name && h1) name = h1.split(/\sReview 2026/i)[0].trim();
  if (!name) {
    name = row.slug
      .split('/')
      .pop()
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  name = name.replace(/:\s*$/, '').replace(/\s+,.*$/, '').trim();

  const suffixes = [
    ' Review 2026: Prices & Yield',
    ' Review 2026: Prices & Area',
    ' Review 2026: Buyer Guide',
    ' Review 2026: Rental Yield',
    ' Review 2026',
  ];

  const nameVariants = [name];
  if (name.length > 38) {
    const words = name.split(/\s+/);
    while (words.length > 3) words.pop();
    nameVariants.push(words.join(' '));
  }

  const candidates = [];
  for (const base of nameVariants) {
    for (const suffix of suffixes) {
      candidates.push(`${base}${suffix}`);
    }
  }

  for (const c of candidates) {
    const t = cleanTail(c);
    if (fitsProjectTitle(t)) return t;
  }
  for (const c of candidates) {
    const t = cleanTail(c);
    if (t && !STOP_TAIL.test(t) && fits(t, SERP_MAX_PROJECT, 30)) return t;
  }
  return null;
}

function rewriteNews(row) {
  const { title, h1, description } = row;
  const candidates = [];

  if (h1) {
    candidates.push(compactPhrase(h1));
    candidates.push(firstClause(h1));
    candidates.push(addYear(firstClause(h1) || compactPhrase(h1), true));
  }

  let t = cleanTail(title);
  if (t.length > 46) t = firstClause(t) || t;
  candidates.push(t);
  candidates.push(addYear(t, true));

  if (description) {
    const d = description.split(/[.!]/)[0].trim();
    if (d.length <= 46) candidates.push(d);
    if (d.length <= 40) candidates.push(addYear(d, true));
  }

  for (const c of candidates) {
    const out = cleanTail(c);
    if (fits(out)) return out;
  }
  const fallback = normalizeTitleLength(cleanTail(h1 || title), { kind: 'news' });
  if (fallback && fits(fallback)) return fallback;
  return null;
}

/** Manual overrides where heuristics still fail. */
export const TITLE_MANUAL = {};

export function rewriteTitle(row) {
  if (TITLE_MANUAL[row.slug]) {
    const t = cleanTail(TITLE_MANUAL[row.slug]);
    if (validateRewrite(row, t)) return t;
  }

  let next = null;
  switch (row.category) {
    case 'comparisons':
    case 'compare':
      next = rewriteComparison(row);
      break;
    case 'areas':
      next = rewriteArea(row);
      break;
    case 'projects':
      next = rewriteProject(row);
      break;
    case 'news':
      next = rewriteNews(row);
      break;
    default:
      next = rewriteGuide(row);
  }

  if (next && validateRewrite(row, next)) return next;

  const kind =
    row.category === 'projects' ? 'project' : row.category === 'news' ? 'news' : 'guide';
  const maxFull = row.category === 'projects' ? SERP_MAX_PROJECT : SERP_MAX_DEFAULT;
  const fallback = normalizeTitleLength(cleanTail(row.h1 || row.title), { kind, maxFull });
  if (fallback && validateRewrite(row, fallback)) return fallback;

  return null;
}

export function validateRewrite(row, next) {
  const maxFull = row.category === 'projects' ? SERP_MAX_PROJECT : SERP_MAX_DEFAULT;
  if (!next || STOP_TAIL.test(next)) return false;
  return fits(next, maxFull);
}

export { fullTitle, cleanTail, fits };

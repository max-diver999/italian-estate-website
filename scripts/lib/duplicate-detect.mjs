/**
 * Duplicate + near-duplicate paragraph detection.
 *
 * Added 2026-08-20 (Wave 0). The corpus audit found 88 files repeating their own
 * paragraphs (up to x16) and 3,282 near-duplicate paragraph pairs across 131
 * files, while `audit-p0-quality.mjs` reported 11 and `qa-corpus-signals.mjs`
 * printed "PASS — padding dupes OK".
 *
 * Two blind spots caused that:
 *   1. the cross-file check only fired at >=3 DIFFERENT files and never compared
 *      a file against itself;
 *   2. nothing looked for near-duplicates — the dominant pattern here is one
 *      paragraph reused with a city/nationality/developer name swapped, which an
 *      exact-hash check cannot see.
 *
 * This module implements both, and is the shared source for the audit script,
 * the corpus-signals gate and the batch writing gate.
 */

/** Minimum words for a paragraph to be worth comparing at all. */
export const MIN_EXACT_WORDS = 12;
/** Near-duplicate comparison needs more signal than exact matching. */
export const MIN_NEAR_WORDS = 25;
/** Shingle size for near-duplicate Jaccard. */
export const SHINGLE_K = 6;
/** Jaccard threshold above which two paragraphs are "the same paragraph". */
export const NEAR_THRESHOLD = 0.45;

/** Strip frontmatter. */
export function splitFrontmatter(raw) {
  const m = String(raw).match(/^---\n([\s\S]*?)\n---/);
  return m ? { fm: m[1], body: String(raw).slice(m[0].length) } : { fm: '', body: String(raw) };
}

/** Body with imports, code fences and JSX components removed. */
export function proseOnly(body) {
  let b = String(body);
  b = b.replace(/^import .*$/gm, '');
  b = b.replace(/```[\s\S]*?```/g, '');
  b = b.replace(/<[A-Z][A-Za-z0-9]*\b[^>]*\/>/g, '');
  b = b.replace(/<[A-Z][A-Za-z0-9]*\b[^>]*>[\s\S]*?<\/[A-Z][A-Za-z0-9]*>/g, '');
  return b;
}

/** Comparable paragraphs: prose blocks only, no tables/headings/components. */
export function contentParagraphs(body) {
  return proseOnly(body)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith('|') && !p.startsWith('#') && !p.startsWith('<'));
}

/** Normalise for comparison: drop link targets, punctuation, case, whitespace. */
export function normalizeParagraph(text) {
  return String(text)
    .toLowerCase()
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shingles(normalized, k = SHINGLE_K) {
  const w = normalized.split(' ');
  const set = new Set();
  for (let i = 0; i + k <= w.length; i += 1) set.add(w.slice(i, i + k).join(' '));
  return set;
}

export function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  return inter / (a.size + b.size - inter);
}

/**
 * Paragraphs repeated verbatim INSIDE one document.
 * @returns {{count:number, text:string}[]} most-repeated first
 */
export function findRepeatsWithinFile(body, { minWords = MIN_EXACT_WORDS } = {}) {
  const counts = new Map();
  for (const p of contentParagraphs(body)) {
    const n = normalizeParagraph(p);
    if (n.split(' ').length < minWords) continue;
    const prev = counts.get(n);
    counts.set(n, { count: (prev?.count ?? 0) + 1, text: prev?.text ?? p });
  }
  return [...counts.values()]
    .filter((v) => v.count > 1)
    .sort((a, b) => b.count - a.count);
}

/**
 * Near-duplicate paragraph pairs INSIDE one document (reworded repeats).
 * @returns {{similarity:number, a:string, b:string}[]}
 */
export function findNearDuplicatesWithinFile(body, { threshold = NEAR_THRESHOLD, minWords = MIN_NEAR_WORDS } = {}) {
  const items = [];
  for (const p of contentParagraphs(body)) {
    const n = normalizeParagraph(p);
    if (n.split(' ').length < minWords) continue;
    items.push({ raw: p, norm: n, sh: shingles(n) });
  }
  const out = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (items[i].norm === items[j].norm) continue; // exact — reported separately
      const s = jaccard(items[i].sh, items[j].sh);
      if (s >= threshold) out.push({ similarity: Number(s.toFixed(2)), a: items[i].raw, b: items[j].raw });
    }
  }
  return out.sort((x, y) => y.similarity - x.similarity);
}

/**
 * Cross-file index. Feed every document, then read the duplicate groups.
 */
export class CorpusDuplicateIndex {
  constructor({ threshold = NEAR_THRESHOLD, minExactWords = MIN_EXACT_WORDS, minNearWords = MIN_NEAR_WORDS } = {}) {
    this.threshold = threshold;
    this.minExactWords = minExactWords;
    this.minNearWords = minNearWords;
    this.exact = new Map(); // normalized -> { ids:Set, text }
    this.items = []; // { id, raw, norm, sh }
  }

  add(id, body) {
    for (const p of contentParagraphs(body)) {
      const n = normalizeParagraph(p);
      const len = n.split(' ').length;
      if (len < this.minExactWords) continue;
      const cur = this.exact.get(n) ?? { ids: new Set(), text: p };
      cur.ids.add(id);
      this.exact.set(n, cur);
      if (len >= this.minNearWords) this.items.push({ id, raw: p, norm: n, sh: shingles(n) });
    }
  }

  /**
   * @param {number} minFiles paragraphs shared by at least this many files
   * @returns {{files:string[], text:string}[]}
   */
  exactGroups(minFiles = 2) {
    const out = [];
    for (const { ids, text } of this.exact.values()) {
      if (ids.size >= minFiles) out.push({ files: [...ids].sort(), text });
    }
    return out.sort((a, b) => b.files.length - a.files.length);
  }

  /**
   * Near-duplicate pairs spanning different files. Bucketed by shingle so this
   * stays tractable on a 252-file corpus.
   * @returns {{similarity:number, a:string, b:string, textA:string, textB:string}[]}
   */
  nearPairs() {
    const buckets = new Map();
    this.items.forEach((item, idx) => {
      let n = 0;
      for (const g of item.sh) {
        if (n >= 40) break;
        n += 1;
        const arr = buckets.get(g) ?? [];
        arr.push(idx);
        buckets.set(g, arr);
      }
    });
    const seen = new Set();
    const out = [];
    for (const idxs of buckets.values()) {
      if (idxs.length > 60) continue; // boilerplate shingle — skip
      for (let a = 0; a < idxs.length; a += 1) {
        for (let b = a + 1; b < idxs.length; b += 1) {
          const [i, j] = idxs[a] < idxs[b] ? [idxs[a], idxs[b]] : [idxs[b], idxs[a]];
          const key = `${i}:${j}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const A = this.items[i];
          const B = this.items[j];
          if (A.id === B.id || A.norm === B.norm) continue;
          const s = jaccard(A.sh, B.sh);
          if (s >= this.threshold) {
            out.push({ similarity: Number(s.toFixed(2)), a: A.id, b: B.id, textA: A.raw, textB: B.raw });
          }
        }
      }
    }
    return out.sort((x, y) => y.similarity - x.similarity);
  }
}

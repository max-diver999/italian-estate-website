#!/usr/bin/env node
/**
 * Fix MDX corpus hygiene (Spain pilot — same gates as Cambodia):
 * 1. Headers glued to previous line (.## / |##)
 * 2. Link anchor text equal to URL slug
 * 3. Legacy editorial intro blocks
 * 4. Typically boilerplate paragraphs
 *
 * Usage: node scripts/fix-markdown-glue-and-slug-links.mjs [--dry]
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = decodeURIComponent(new URL('../src/content/', import.meta.url).pathname);
const COLLECTIONS = ['guides', 'compare', 'areas', 'projects', 'news', 'developers'];
const DRY = process.argv.includes('--dry');

function humanizeSlug(slug) {
  return slug
    .split('-')
    .map((word) => {
      if (!word) return word;
      if (/^\d+$/.test(word)) return word;
      const lower = word.toLowerCase();
      if (['vs', 'nie', 'nr', 'ibi', 'iva', 'tm'].includes(lower)) {
        return lower.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function unglueHeaders(text) {
  // Only unglue when ##+ is stuck to prior character on the same line (not valid ### at line start).
  return text.replace(/([^#\n])(#{2,6}\s)/g, '$1\n\n$2');
}

function fixSlugAnchorLinks(text) {
  let next = text.replace(
    /\[([a-z0-9-]+)\]\((\/(?:guides|compare|areas|projects|developers)\/\1\/)\)/gi,
    (_match, slug, path) => `[${humanizeSlug(slug)}](${path})`,
  );
  next = next.replace(
    /\[(\/(?:guides|compare|areas|projects|developers)\/([a-z0-9-]+)\/)\]\(\1\)/gi,
    (_match, path, slug) => `[${humanizeSlug(slug)}](${path})`,
  );
  return next;
}

function removeLegacyEditorialIntro(text) {
  return text.replace(
    /^Invest (?:Cambodia|Spain Property) Editorial guide on \*\*[^*]+\*\*[^\n]*\.\s*\n/gm,
    '',
  );
}

function removeTypicallyBoilerplate(text) {
  return text
    .replace(/^Typically,[^\n]*\n\n/gm, '')
    .replace(/^MORE Group (?:rent comp case study|buyer nationality methodology)[^\n]*\n\n/gm, '')
    .replace(/^Our escrow red flag checklist[^\n]*\n\n/gm, '');
}

function cleanupText(text, { intro = false, slop = false } = {}) {
  let next = text;
  next = unglueHeaders(next);
  next = fixSlugAnchorLinks(next);
  if (intro) next = removeLegacyEditorialIntro(next);
  if (slop) next = removeTypicallyBoilerplate(next);
  return next;
}

let changedFiles = 0;
const stats = { glue: 0, slugLinks: 0, intros: 0 };

for (const collection of COLLECTIONS) {
  const dir = join(ROOT, collection);
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  } catch {
    continue;
  }

  for (const file of files) {
    const path = join(dir, file);
    const raw = readFileSync(path, 'utf8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) continue;

    const [, fm, body] = fmMatch;
    const hadGlue = /[^#\n]#{2,6}\s/.test(fm + body) || /\|#{2,6}\s/.test(fm + body);
    const hadSlugLinks =
      /\[([a-z0-9-]+)\]\(\/(?:guides|compare|areas|projects|developers)\/\1\/\)/i.test(
        fm + body,
      ) ||
      /\[(\/(?:guides|compare|areas|projects|developers)\/[a-z0-9-]+\/)\]\(\1\)/i.test(
        fm + body,
      );
    const hadIntro = /^Invest (?:Cambodia|Spain Property) Editorial guide on/m.test(body);

    const nextFm = cleanupText(fm);
    const nextBody = cleanupText(body, { intro: true, slop: true });
    if (nextBody === body && nextFm === fm) continue;

    changedFiles++;
    if (hadGlue) stats.glue++;
    if (hadSlugLinks) stats.slugLinks++;
    if (hadIntro) stats.intros++;

    if (!DRY) writeFileSync(path, `---\n${nextFm}\n---\n${nextBody}`);
    console.log(`${collection}/${file}`);
  }
}

console.log(
  `${DRY ? '[DRY] ' : ''}Updated ${changedFiles} files (glue: ${stats.glue}, slug-link files: ${stats.slugLinks}, legacy intros: ${stats.intros})`,
);

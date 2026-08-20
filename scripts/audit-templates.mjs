#!/usr/bin/env node
/**
 * Template-layer audit — src/pages, src/layouts, src/components, src/data, src/lib.
 *
 * Added 2026-08-20 (Wave 0). Every content gate in this repo globs `src/content/**`
 * only, so the template layer had never been checked by anything. The 2026-08-20
 * audit found the single most widespread defect there: an em-dash strip that
 * replaced "—" with "," without removing the leading space, shipping on all 278
 * rendered pages including the site-wide meta description, plus Mexico/UAE copy
 * left over from the template repo on four indexable hub pages.
 *
 * Usage: node scripts/audit-templates.mjs [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const DIRS = ['src/pages', 'src/layouts', 'src/components', 'src/data', 'src/lib'];
const EXT = /\.(astro|ts|tsx|js|mjs)$/;
const jsonOut = process.argv.includes('--json');

/** Terms that mean this copy came from another MORE Group site. */
const WRONG_COUNTRY = [
  'Riviera Maya', 'Los Cabos', 'Puerto Vallarta', 'Tulum', 'Playa del Carmen',
  'fideicomiso', 'Mexico real estate', 'Mexican peso',
  'UAE property', 'Dubai property market', 'Abu Dhabi property',
  'Phuket', 'Cambodia', 'Phnom Penh', 'Siem Reap', 'Thailand property',
];

/** The site's own market vocabulary — a page naming none of it is suspect. */
const TITLE_SUFFIX_MAX = 62;

function walk(dir, out = []) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return out;
  const stack = [abs];
  while (stack.length) {
    const cur = stack.pop();
    for (const name of readdirSync(cur)) {
      const p = join(cur, name);
      if (statSync(p).isDirectory()) stack.push(p);
      else if (EXT.test(p)) out.push(p);
    }
  }
  return out;
}

const findings = [];
/** `info` findings are reported but never fail the run. */
const INFO_KINDS = new Set(['title-suffix']);
const add = (kind, file, line, detail) => findings.push({ kind, file, line, detail });

for (const dir of DIRS) {
  for (const abs of walk(dir)) {
    const rel = relative(ROOT, abs);
    const src = readFileSync(abs, 'utf8');
    const lines = src.split('\n');

    lines.forEach((line, i) => {
      const n = i + 1;

      // Punctuation scar: " ," or " ." mid-sentence — the em-dash strip signature.
      for (const m of line.matchAll(/\w( ,| \.)(\s|$)/g)) {
        add('punctuation-scar', rel, n, `"${line.trim().slice(Math.max(0, m.index - 45), m.index + 25)}"`);
      }
      if (/\w\s+,,|,,/.test(line)) add('punctuation-scar', rel, n, `double comma: "${line.trim().slice(0, 80)}"`);

      // Wrong-country copy from the template repo.
      for (const term of WRONG_COUNTRY) {
        if (line.includes(term)) {
          add('wrong-country-copy', rel, n, `"${term}" in ${rel} — this is an Italy site`);
        }
      }

      // Hardcoded empty alt on a CONTENT image. Decorative marks (logo, favicon,
      // icons) are correctly alt="" and are not flagged.
      const decorative = /favicon|logo|icon|aria-hidden/i.test(line);
      if (/<(img|ResponsiveImage)\b/.test(line) && /alt=""/.test(line) && !decorative) {
        add('empty-alt', rel, n, `empty alt on ${line.trim().slice(0, 70)}`);
      }
    });

    // Meta description length + scars.
    for (const m of src.matchAll(/description=["']([^"']{20,})["']/g)) {
      const d = m[1];
      const line = src.slice(0, m.index).split('\n').length;
      if (d.length > 160) add('metadesc-too-long', rel, line, `${d.length} chars (max 160)`);
      if (/ ,|,,/.test(d)) add('metadesc-scar', rel, line, `"${d.slice(0, 90)}"`);
    }

    // Duplicate JSON-LD @type in one file (two FAQPage blocks on one page).
    const types = [...src.matchAll(/'@type':\s*'([A-Za-z]+)'/g)].map((m) => m[1]);
    for (const t of ['FAQPage', 'Article', 'BreadcrumbList']) {
      const c = types.filter((x) => x === t).length;
      if (c > 1) add('duplicate-jsonld', rel, 0, `${c}x '${t}' schema emitted from one file`);
    }

    // A title suffix that pushes titles past the SERP limit.
    for (const m of src.matchAll(/`\$\{title\}([^`]*)`/g)) {
      if (m[1].length > 0) {
        const line = src.slice(0, m.index).split('\n').length;
        add(
          'title-suffix',
          rel,
          line,
          `appends "${m[1]}" (${m[1].length} chars) to every title — verify rendered titles stay <= ${TITLE_SUFFIX_MAX} chars`,
        );
      }
    }
  }
}

const byKind = findings.reduce((acc, f) => {
  acc[f.kind] = (acc[f.kind] || 0) + 1;
  return acc;
}, {});

if (jsonOut) {
  console.log(JSON.stringify({ findings: findings.length, byKind, items: findings }, null, 2));
} else {
  console.log('\n=== TEMPLATE LAYER AUDIT ===');
  console.log(`Scanned: ${DIRS.join(', ')}\n`);
  if (!findings.length) {
    console.log('✅ PASS — no punctuation scars, wrong-country copy, or duplicate schema.\n');
  } else if (findings.every((f) => INFO_KINDS.has(f.kind))) {
    console.log(`✅ PASS — ${findings.length} informational note(s), no blockers\n`);
  } else {
    console.log(`❌ FAIL — ${findings.filter((f) => !INFO_KINDS.has(f.kind)).length} blocking finding(s)\n`);
    for (const [k, n] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(n).padStart(3)}x ${k}`);
    }
    console.log('');
    for (const [k] of Object.entries(byKind)) {
      console.log(`--- ${k} ---`);
      for (const f of findings.filter((x) => x.kind === k).slice(0, 25)) {
        console.log(`  ${f.file}${f.line ? `:${f.line}` : ''}  ${f.detail}`);
      }
      const extra = findings.filter((x) => x.kind === k).length - 25;
      if (extra > 0) console.log(`  … +${extra} more`);
      console.log('');
    }
  }
}

const blocking = findings.filter((f) => !INFO_KINDS.has(f.kind));
process.exit(blocking.length ? 1 : 0);

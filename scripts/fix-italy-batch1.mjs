#!/usr/bin/env node
/**
 * Fix Italy content batch 1 for validate:content — FAQ YAML, Quick answer, TldrBlock,
 * internal links, trim descriptions/titles, reduce bold spam, FaqBlock injection.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = decodeURIComponent(new URL('../src/content/', import.meta.url).pathname);
const ITALY_HUB = 'italy-property-investment-guide';

function parseFile(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  return { fm: m[1], body: m[2] };
}

function allSlugs() {
  const map = new Map();
  for (const c of ['guides', 'compare', 'areas']) {
    const dir = join(ROOT, c);
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
      const raw = readFileSync(join(ROOT, c, f), 'utf8');
      const slug = f.replace(/\.mdx$/, '');
      const tm = raw.match(/^title:\s*["'](.+?)["']/m);
      map.set(slug, { coll: c, title: tm ? tm[1] : slug });
    }
  }
  return map;
}

function convertFaqJsonToYaml(fm) {
  const jsonMatch = fm.match(/^faq:\s*\[\s*\{/ms);
  if (!jsonMatch) return fm;
  const start = fm.indexOf('faq:');
  const end = fm.indexOf('\n]', start);
  if (end === -1) return fm;
  const block = fm.slice(start, end + 2);
  const items = [];
  for (const m of block.matchAll(/question:\s*["'](.+?)["']\s*,\s*answer:\s*["'](.+?)["']/gs)) {
    items.push({ q: m[1], a: m[2] });
  }
  if (!items.length) return fm;
  const yaml =
    'faq:\n' +
    items.map(({ q, a }) => `  - question: "${q.replace(/"/g, '\\"')}"\n    answer: "${a.replace(/"/g, '\\"')}"`).join('\n');
  return fm.slice(0, start) + yaml + fm.slice(end + 2);
}

function trimDescription(fm) {
  return fm.replace(/^description:\s*"([^"]*)"/m, (_, desc) => {
    let d = desc.replace(/ Independent guide for foreign buyers on italian-estate\.com\./g, '').trim();
    if (d.length > 160) d = d.slice(0, 157).replace(/\s+\S*$/, '') + '…';
    if (d.length < 120) {
      d = (d + ' Guide for foreign buyers on italian-estate.com.').slice(0, 160);
    }
    return `description: "${d}"`;
  });
}

const TITLE_FIXES = {
  'due-diligence-italy-property': 'Italy Property Due Diligence: Checklist for Buyers 2026',
  'is-italy-property-good-investment-2026': 'Is Italy Property a Good Investment in 2026? Guide',
  'best-regions-invest-italy-property-2026': 'Best Regions for Italy Property Investment 2026 Guide',
  'polignano-a-mare': 'Polignano a Mare Coastal Property Guide: Yields 2026',
  'valle-d-itria': "Valle d'Itria Trulli Property Investment Guide 2026",
  'puglia-vs-tuscany-property': 'Puglia vs Tuscany Property Investment: Yields 2026',
};

function fixTitle(fm, slug) {
  if (TITLE_FIXES[slug]) {
    return fm.replace(/^title:\s*["'][^"']+["']/m, `title: "${TITLE_FIXES[slug]}"`);
  }
  const tm = fm.match(/^title:\s*["'](.+?)["']/m);
  if (!tm) return fm;
  let t = tm[1].replace(/….*$/, '').replace(/, Italy 202.*$/, '').trim();
  if (t.includes("'") && t.length >= 50 && t.length <= 60) {
    return fm.replace(/^title:\s*["'][^"']+["']/m, `title: "${t}"`);
  }
  if (t.length > 60) t = t.slice(0, 57).replace(/\s+\S*$/, '') + '…';
  if (t.length < 50) t = (t + ' — Italy 2026 guide').slice(0, 60);
  return fm.replace(/^title:\s*["'][^"']+["']/m, `title: "${t}"`);
}

function stripExcessBold(body, maxPairs = 32) {
  let pairs = (body.match(/\*\*/g) || []).length / 2;
  if (pairs <= maxPairs) return body;
  // Remove bold from table cells first
  let next = body.replace(/\*\*([^*|]+)\*\*(?=[^|]*\|)/g, '$1');
  pairs = (next.match(/\*\*/g) || []).length / 2;
  if (pairs <= maxPairs) return next;
  // Remove bold from lines that are label: patterns
  next = next.replace(/^\*\*([^*]+):\*\*\s/gm, '$1: ');
  pairs = (next.match(/\*\*/g) || []).length / 2;
  if (pairs <= maxPairs) return next;
  // Strip remaining bold except Quick answer
  next = next.replace(/\*\*([^*]+)\*\*/g, (full, inner, offset) => {
    if (inner === 'Quick answer:') return full;
    return inner;
  });
  return next;
}

function fixTldrBlock(body) {
  // Wrong child syntax -> self-closing
  const child = body.match(/<TldrBlock>\s*([\s\S]*?)<\/TldrBlock>/);
  if (child) {
    const text = child[1].trim().replace(/\n/g, ' ').replace(/"/g, "'");
    body = body.replace(child[0], `<TldrBlock text="${text}" />`);
  }
  return body;
}

function ensureQuickAnswer(body) {
  if (/quick answer|tl;dr/i.test(body.slice(0, 800))) return body;
  const firstPara = body.match(/^(?!import|#)([^\n#<][^\n]{80,400})/m);
  const text = firstPara
    ? firstPara[1].trim()
    : 'Italy property rules, costs, and yields vary by region — verify net numbers and municipal STR rules before you pay a deposit.';
  return `**Quick answer:** ${text}\n\n${body.replace(/^#\s+.+\n\n?/, '')}`;
}

function getRelatedPaths(fm, slug, slugMap) {
  const rel = [];
  const block = fm.match(/relatedSlugs:[^\n]*\n([\s\S]*?)(?:\n[a-zA-Z_]+:|$)/);
  if (block) {
    for (const m of block[0].matchAll(/["']?([a-z0-9\-]+)["']?/g)) {
      if (m[1] && m[1] !== 'relatedSlugs' && slugMap.has(m[1]) && m[1] !== slug) rel.push(m[1]);
    }
  }
  if (!rel.includes(ITALY_HUB) && slug !== ITALY_HUB && slugMap.has(ITALY_HUB)) rel.unshift(ITALY_HUB);
  const defaults = [
    'puglia-property-investment-guide',
    'italy-property-investment-guide',
    'ostuni',
    'valle-d-itria',
    'buy-property-italy-foreigner',
    'italy-rental-yield-guide',
    'due-diligence-italy-property',
    'cost-of-buying-property-italy',
  ];
  for (const s of defaults) {
    if (rel.length >= 6) break;
    if (s !== slug && slugMap.has(s) && !rel.includes(s)) rel.push(s);
  }
  return rel.slice(0, 6);
}

function ensureInternalLinks(body, fm, slug, slugMap) {
  const existing = [...body.matchAll(/\]\((\/(?:guides|compare)\/[a-z0-9\-]+\/)\)/g)].map((m) => m[1]);
  if (existing.length >= 5) return body;
  const have = new Set(existing);
  const links = [];
  for (const s of getRelatedPaths(fm, slug, slugMap)) {
    const e = slugMap.get(s);
    const p = `/${e.coll}/${s}/`;
    if (have.has(p)) continue;
    const anchor = e.title.split(':')[0].trim().slice(0, 48);
    links.push(`[${anchor}](${p})`);
    have.add(p);
    if (have.size >= 5) break;
  }
  if (!links.length) return body;
  const para = `\n\n## How this guide connects to the rest of the site\n\nThis page is part of the Italian Estate research hub. Continue with ${links.join(', ')}.\n`;
  if (body.includes('<FaqBlock')) return body.replace(/(\n<FaqBlock)/, `${para}$1`);
  return body.trimEnd() + para;
}

function ensureFaqBlock(body, fm) {
  if (/<FaqBlock/.test(body)) return body;
  const items = [];
  for (const m of fm.matchAll(/-\s*question:\s*["'](.+?)["']\s*\n\s*answer:\s*["'](.+?)["']/gs)) {
    items.push({ q: m[1], a: m[2] });
  }
  if (items.length < 5) return body;
  const pick = items.slice(0, 6);
  const lines = pick
    .map(
      ({ q, a }) =>
        `  { question: "${q.replace(/"/g, '\\"')}", answer: "${a.replace(/"/g, '\\"').slice(0, 280)}" }`,
    )
    .join(',\n');
  const block = `\n<FaqBlock items={[\n${lines}\n]} />\n`;
  return body.trimEnd() + block;
}

function ensureImports(body) {
  if (/import TldrBlock/.test(body)) return body;
  return `import TldrBlock from '../../components/TldrBlock.astro';\nimport FaqBlock from '../../components/FaqBlock.astro';\n\n${body}`;
}

const slugMap = allSlugs();
let n = 0;

for (const c of ['guides', 'compare', 'areas']) {
  for (const f of readdirSync(join(ROOT, c)).filter((x) => x.endsWith('.mdx'))) {
    const path = join(ROOT, c, f);
    const slug = f.replace(/\.mdx$/, '');
    let raw = readFileSync(path, 'utf8');
    const parsed = parseFile(raw);
    if (!parsed) continue;
    let { fm, body } = parsed;
    const before = raw;
    fm = convertFaqJsonToYaml(fm);
    fm = trimDescription(fm);
    fm = fixTitle(fm, slug);
    body = ensureImports(body);
    body = fixTldrBlock(body);
    body = ensureQuickAnswer(body);
    body = stripExcessBold(body);
    body = ensureInternalLinks(body, fm, slug, slugMap);
    body = ensureFaqBlock(body, fm);
    const out = `---\n${fm}\n---\n${body}`;
    if (out !== before) {
      writeFileSync(path, out);
      n++;
      console.log(`fixed: ${c}/${slug}`);
    }
  }
}
console.log(`\nDone. ${n} files updated.`);

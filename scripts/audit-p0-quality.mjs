#!/usr/bin/env node
/**
 * P0 editorial quality audit for italian-estate-website (local only, no HTTP).
 * Run: node scripts/audit-p0-quality.mjs [--json] [--collection guides]
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CorpusDuplicateIndex,
  findRepeatsWithinFile,
  findNearDuplicatesWithinFile,
} from './lib/duplicate-detect.mjs';
import { classifyImageHost } from './lib/cloudinary-gate.mjs';
import { findGluedTables } from './lib/human-signals.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, '..');
const CONTENT = join(ROOT, 'src/content');
const REPORT_DIR = join(SCRIPT_DIR, 'reports');

const args = process.argv.slice(2);
const jsonOnly = args.includes('--json');
const collectionFilter = (() => {
  const idx = args.indexOf('--collection');
  return idx === -1 ? null : args[idx + 1];
})();

/** ArticleLayout injects LeadForm + sidebar/sticky CTA for these collections. */
const LAYOUT_PROVIDES_LEAD_FORM = new Set(['guides', 'areas', 'compare', 'projects', 'developers', 'news']);

const COLLECTIONS = {
  guides: { minWords: 2000, minFaq: 5, minLinks: 5, minH2: 4, url: '/guides/' },
  areas: { minWords: 1800, minFaq: 4, minLinks: 5, minH2: 4, url: '/areas/' },
  compare: { minWords: 1800, minFaq: 4, minLinks: 5, minH2: 4, url: '/compare/' },
  projects: { minWords: 1200, minFaq: 3, minLinks: 3, minH2: 3, url: '/projects/' },
  developers: { minWords: 1500, minFaq: 3, minLinks: 3, minH2: 3, url: '/developers/' },
  news: { minWords: 500, minFaq: 0, minLinks: 0, minH2: 2, url: '/news/', light: true },
};

/** Active KEEP slugs — Claude refines in AUDIT-REPORT; seed empty for Italy pilot. */
const KEEP_SLUGS = new Set([
  'buy-property-italy-foreigner',
  'italy-reciprocity-property-foreigners',
  'italy-property-taxes-foreign-buyers-guide',
]);

/** Topic fragments that cannibalize KEEP pages when indexed separately. */
const CANNIBAL_CLUSTERS = [
  {
    keep: 'buy-property-italy-foreigner',
    patterns: [/buy-property-italy-foreigner/i, /how-to-buy-italy-property-step-by-step/i],
  },
  {
    keep: 'italy-reciprocity-property-foreigners',
    patterns: [/italy-reciprocity/i, /reciprocity.*italy/i],
  },
];

const AI_PATTERNS = [
  /\bin today'?s (rapidly )?(evolving|changing) (landscape|world)\b/i,
  /\b(comprehensive framework|operational excellence|future outlook|advanced investment strategies|regional diversification|extended due diligence checklist)\b/i,
  /\b(pivotal|crucial|seamless|game-changer|cutting-edge|revolutionary|robust framework)\b/i,
  /\b(moreover|furthermore|in conclusion|it is important to note)\b/i,
  /\bunlock (the )?potential\b/i,
  /\bnot just .+ but\b/i,
  /\bsophisticated investors\b/i,
  /\bfamily office\b/i,
];

const HARD_MARKERS = ['[VERIFY]', '**VERIFY:**', 'Knowledge base', 'KB §', 'TODO', 'source needed'];

const SEVERITY = {
  'hard-marker': 10,
  'cannibalization': 9,
  'thin-content': 8,
  'repeated-paragraph': 8,
  'self-repeated-paragraph': 9,
  'near-duplicate-paragraph': 7,
  'near-duplicate-cross-page': 6,
  'glued-table': 10,
  'external-hero': 6,
  'duplicate-title': 7,
  'duplicate-description': 7,
  'missing-answer-box': 6,
  'few-internal-links': 6,
  'missing-table': 5,
  'missing-risks': 5,
  'missing-scenarios': 5,
  'ai-language': 4,
  'boilerplate-risk': 4,
  'programmatic-template': 4,
  'missing-lead-form': 4,
  'weak-cta': 3,
  'weak-structure': 3,
  'missing-faq': 3,
  'over-bold': 2,
  'mdx-risk': 10,
  'broken-internal-link': 7,
  'missing-hero': 5,
  'unsplash-hero': 6,
  'noindex-flagged': 0,
};

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fmRaw: '', body: raw, fm: {} };
  const fmRaw = m[1];
  const body = m[2];
  const fm = {};
  let currentArray = null;
  for (const line of fmRaw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const kv = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      currentArray = null;
      const [, key, value] = kv;
      if (value === '') {
        fm[key] = [];
        currentArray = key;
      } else if (value.startsWith('[') && value.endsWith(']')) {
        fm[key] = value
          .slice(1, -1)
          .split(',')
          .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
      } else {
        fm[key] = value.replace(/^['"]|['"]$/g, '');
      }
      continue;
    }
    if (currentArray && trimmed.startsWith('- ')) {
      const item = trimmed.slice(2).trim().replace(/^['"]|['"]$/g, '');
      if (!item.includes(':')) fm[currentArray].push(item);
    }
  }
  return { fmRaw, body, fm };
}

function bodyWordCount(body) {
  return (
    body
      .replace(/^import\s.+$/gm, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\{[\s\S]*?\}/g, ' ')
      .match(/[A-Za-z0-9][A-Za-z0-9'-]*/g)?.length || 0
  );
}

function normalizeParagraph(p) {
  return p
    .replace(/\s+/g, ' ')
    .replace(/\[[^\]]+\]\([^)]+\)/g, '[link]')
    .trim()
    .toLowerCase();
}

function internalLinks(body) {
  const links = new Set();
  for (const match of body.matchAll(/\]\((\/[^)#\s]+\/?)\)/g)) {
    const link = match[1].endsWith('/') ? match[1] : `${match[1]}/`;
    if (!link.startsWith('/api/')) links.add(link);
  }
  return [...links];
}

function countFaq(fmRaw, body) {
  const fmQ = (fmRaw.match(/^\s*-\s*question:/gm) || []).length;
  const compQ = (body.match(/question\s*:/g) || []).length;
  return Math.max(fmQ, compQ);
}

function buildIndex(allFiles) {
  const slugs = new Set();
  const urls = new Set(['/']);
  for (const cfg of Object.values(COLLECTIONS)) urls.add(cfg.url);
  for (const f of allFiles) {
    slugs.add(f.slug);
    urls.add(`${COLLECTIONS[f.coll].url}${f.slug}/`);
  }
  return { slugs, urls };
}

function isProgrammaticTemplate(slug) {
  return /^(studio|1-bedroom|2-bedroom|3-bedroom|villas)-for-sale-.+-phuket$/.test(slug);
}

function cannibalizationHit(slug) {
  for (const cluster of CANNIBAL_CLUSTERS) {
    if (slug === cluster.keep) continue;
    if (cluster.patterns.some((p) => p.test(slug))) return cluster.keep;
  }
  return null;
}

let protectedSlugs = new Set();
try {
  const protectedPath = join(SCRIPT_DIR, 'protected-content-slugs.json');
  const protectedData = JSON.parse(readFileSync(protectedPath, 'utf8'));
  protectedSlugs = new Set(Object.keys(protectedData.slugs));
} catch {
  /* optional */
}

function suggestAction(issues, fm, slug) {
  if (fm.noindex === true || fm.noindex === 'true') return 'ALREADY_NOINDEX';
  if (issues.length === 0) return 'KEEP';
  if (protectedSlugs.has(slug)) return 'PROTECTED_UPGRADE';
  const types = new Set(issues.map((i) => i.type));
  if (types.has('cannibalization')) return 'NOINDEX';
  if (types.has('hard-marker') || types.has('mdx-risk')) return 'FIX_URGENT';
  if (types.has('repeated-paragraph') && isProgrammaticTemplate(slug)) return 'NOINDEX_OR_REWRITE';
  if (types.has('thin-content') && types.has('repeated-paragraph')) return 'NOINDEX_OR_REWRITE';
  if (types.has('thin-content')) return 'REWRITE_OR_NOINDEX';
  if (
    types.has('missing-answer-box') ||
    types.has('few-internal-links') ||
    types.has('missing-table')
  ) {
    return 'UPGRADE';
  }
  return 'REVIEW';
}

function qualityScore(issues) {
  let score = 100;
  for (const issue of issues) {
    score -= SEVERITY[issue.type] ?? 1;
  }
  return Math.max(0, score);
}

function loadFiles() {
  const files = [];
  const cols = collectionFilter ? [collectionFilter] : Object.keys(COLLECTIONS);
  for (const coll of cols) {
    const cfg = COLLECTIONS[coll];
    if (!cfg) continue;
    const dir = join(CONTENT, coll);
    let names = [];
    try {
      names = readdirSync(dir).filter((n) => n.endsWith('.mdx'));
    } catch {
      continue;
    }
    for (const name of names) {
      const slug = name.replace(/\.mdx$/, '');
      const path = join(dir, name);
      const raw = readFileSync(path, 'utf8');
      const { fmRaw, body, fm } = parseFrontmatter(raw);
      files.push({ coll, slug, path, raw, fmRaw, body, fm, cfg });
    }
  }
  return files;
}

const allFiles = loadFiles();
const index = buildIndex(allFiles);
const paragraphs = new Map();
const titles = new Map();
const descriptions = new Map();
const fileReports = [];

for (const file of allFiles) {
  const id = `${file.coll}/${file.slug}`;
  const issues = [];
  const isNoindex = file.fm.noindex === true || file.fm.noindex === 'true';
  const isLight = file.cfg.light === true;

  if (isNoindex) {
    issues.push({ type: 'noindex-flagged', detail: 'already noindex' });
  }

  const title = file.fm.title || '';
  const desc = file.fm.description || '';
  if (title) titles.set(title.toLowerCase(), [...(titles.get(title.toLowerCase()) || []), id]);
  if (desc) descriptions.set(desc.toLowerCase(), [...(descriptions.get(desc.toLowerCase()) || []), id]);

  if (!isNoindex && !isLight) {
    const keepHit = cannibalizationHit(file.slug);
    const linksToKeep =
      keepHit &&
      new RegExp(`/guides/${keepHit}/`).test(file.body);
    if (keepHit && !KEEP_SLUGS.has(file.slug) && !linksToKeep && !protectedSlugs.has(file.slug)) {
      issues.push({ type: 'cannibalization', detail: `competes with KEEP: ${keepHit}` });
    }
    if (isProgrammaticTemplate(file.slug) && !protectedSlugs.has(file.slug) && bodyWordCount(file.body) < file.cfg.minWords) {
      issues.push({ type: 'programmatic-template', detail: 'programmatic page below min words' });
    }
  }

  const allText = `${file.fmRaw}\n${file.body}`;
  for (const marker of HARD_MARKERS) {
    if (allText.includes(marker)) issues.push({ type: 'hard-marker', detail: marker });
  }
  if (/[<>][0-9]/.test(file.raw)) issues.push({ type: 'mdx-risk', detail: 'angle-bracket number pattern' });
  if (/FaqBlock\s+faqs\s*=/.test(file.raw)) issues.push({ type: 'mdx-risk', detail: 'FaqBlock uses faqs prop' });

  if (!file.fm.heroImage && !isLight) {
    issues.push({ type: 'missing-hero', detail: 'no heroImage' });
  } else if (file.fm.heroImage) {
    const host = classifyImageHost(file.fm.heroImage);
    if (host === 'banned') {
      issues.push({ type: 'unsplash-hero', detail: file.fm.heroImage });
    } else if (host === 'soft-external' || host === 'external') {
      issues.push({
        type: 'external-hero',
        detail: `hero not delivered via Cloudinary (${file.fm.heroImage.slice(0, 80)})`,
      });
    }
  }

  if (!isLight) {
    const words = bodyWordCount(file.body);
    if (!isNoindex && words < file.cfg.minWords) {
      issues.push({ type: 'thin-content', detail: `${words} words (min ${file.cfg.minWords})` });
    }

    const aiHits = AI_PATTERNS.flatMap((pattern) => {
      const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
      return [...file.body.matchAll(new RegExp(pattern.source, flags))];
    }).map((m) => m[0]);
    if (aiHits.length) {
      issues.push({ type: 'ai-language', detail: [...new Set(aiHits)].slice(0, 3).join(' | ') });
    }

    const h2s = [...file.body.matchAll(/^##\s+(.+)$/gm)];
    if (!isNoindex && h2s.length < file.cfg.minH2) {
      issues.push({ type: 'weak-structure', detail: `only ${h2s.length} H2s` });
    }

    if (
      !isNoindex &&
      !/(Quick answer|TL;DR|TldrBlock)/i.test(file.body)
    ) {
      issues.push({ type: 'missing-answer-box', detail: 'no Quick answer / TL;DR' });
    }

    if (!isNoindex && file.cfg.minFaq > 0 && countFaq(file.fmRaw, file.body) < file.cfg.minFaq) {
      issues.push({ type: 'missing-faq', detail: `fewer than ${file.cfg.minFaq} FAQ` });
    }

    if (!isNoindex && !/\|.+\|/.test(file.body)) {
      issues.push({ type: 'missing-table', detail: 'no markdown table' });
    }

    if (
      !isNoindex &&
      !/(red flag|checklist|what to check|risks?)/i.test(file.body)
    ) {
      issues.push({ type: 'missing-risks', detail: 'no risks/checklist block' });
    }

    if (
      !isNoindex &&
      !/(scenario|for investors|who this is for|who this suits|who .+ suits|buyer profile)/i.test(file.body)
    ) {
      issues.push({ type: 'missing-scenarios', detail: 'no buyer scenarios' });
    }

    const links = internalLinks(file.body);
    if (!isNoindex && links.length < file.cfg.minLinks) {
      issues.push({ type: 'few-internal-links', detail: `${links.length} links (min ${file.cfg.minLinks})` });
    }

    for (const link of links) {
      if (
        /^\/(guides|areas|comparisons|projects|news|resales)\//.test(link) &&
        !index.urls.has(link)
      ) {
        issues.push({ type: 'broken-internal-link', detail: link });
      }
    }

    if (!LAYOUT_PROVIDES_LEAD_FORM.has(file.coll) && !/<LeadForm\b/.test(file.body)) {
      issues.push({ type: 'missing-lead-form', detail: 'LeadForm absent' });
    }
    const hasCommercialCta =
      LAYOUT_PROVIDES_LEAD_FORM.has(file.coll) ||
      /(<LeadForm|<InlineCta|#lead-form|WhatsApp|consultation|shortlist|consult\b)/i.test(file.body);
    if (!hasCommercialCta) {
      issues.push({ type: 'weak-cta', detail: 'weak commercial CTA' });
    }

    const boldCount = (file.body.match(/\*\*[^*]+\*\*/g) || []).length;
    if (boldCount > 35) issues.push({ type: 'over-bold', detail: `${boldCount} bold spans` });

    if (/## Related resources/i.test(file.body)) {
      issues.push({ type: 'boilerplate-risk', detail: 'generic Related resources block' });
    }

    for (const detail of findGluedTables(file.body)) {
      issues.push({ type: 'glued-table', detail });
    }

    // Repeats INSIDE this file. The cross-file map below only fires at >=3
    // different files and never compared a file against itself, which is why
    // this audit reported 11 repeated-paragraph on a corpus with 88 affected
    // files (up to x16 in one file).
    for (const rep of findRepeatsWithinFile(file.body)) {
      issues.push({
        type: 'self-repeated-paragraph',
        detail: `repeated x${rep.count} in this file: ${rep.text.slice(0, 120)}`,
      });
    }
    for (const nd of findNearDuplicatesWithinFile(file.body).slice(0, 5)) {
      issues.push({
        type: 'near-duplicate-paragraph',
        detail: `similarity ${nd.similarity}: "${nd.a.slice(0, 70)}" / "${nd.b.slice(0, 70)}"`,
      });
    }

    for (const rawPara of file.body.split(/\n{2,}/)) {
      if (rawPara.startsWith('import ') || rawPara.startsWith('|')) continue;
      if (rawPara.includes('<') && rawPara.includes('>')) continue;
      const normalized = normalizeParagraph(rawPara);
      if (normalized.split(/\s+/).filter(Boolean).length < 28) continue;
      paragraphs.set(normalized, [...(paragraphs.get(normalized) || []), id]);
    }
  }

  const actionableIssues = issues.filter((i) => i.type !== 'noindex-flagged');
  fileReports.push({
    id,
    coll: file.coll,
    slug: file.slug,
    title: file.fm.title || '',
    noindex: isNoindex,
    words: bodyWordCount(file.body),
    links: internalLinks(file.body).length,
    score: qualityScore(actionableIssues),
    issues: actionableIssues,
    action: suggestAction(actionableIssues, file.fm, file.slug),
  });
}

const crossIssues = [];

// Near-duplicate paragraphs across pages — the dominant pattern in this corpus is
// one paragraph reused with a city/nationality/developer name swapped, which no
// exact-hash check can see.
const nearIndex = new CorpusDuplicateIndex();
for (const file of allFiles) nearIndex.add(`${file.coll}/${file.slug}`, file.body);
const nearPairs = nearIndex.nearPairs();
const nearByFile = new Map();
for (const pair of nearPairs) {
  for (const id of [pair.a, pair.b]) {
    nearByFile.set(id, [...(nearByFile.get(id) || []), pair]);
  }
}
for (const [id, pairs] of nearByFile.entries()) {
  const report = fileReports.find((f) => f.id === id);
  if (!report || report.noindex) continue;
  const other = pairs[0].a === id ? pairs[0].b : pairs[0].a;
  report.issues.push({
    type: 'near-duplicate-cross-page',
    detail: `${pairs.length} near-duplicate paragraph(s) shared with other pages (e.g. ${other} at ${pairs[0].similarity})`,
  });
  report.score = qualityScore(report.issues);
  report.action = suggestAction(report.issues, { noindex: report.noindex }, report.slug);
}
crossIssues.push({
  type: 'near-duplicate-summary',
  ids: [...nearByFile.keys()].sort(),
  detail: `${nearPairs.length} near-duplicate paragraph pairs across ${nearByFile.size} files`,
});
for (const [title, ids] of titles.entries()) {
  if (ids.length > 1) crossIssues.push({ type: 'duplicate-title', ids, detail: title });
}
for (const [desc, ids] of descriptions.entries()) {
  if (ids.length > 1) crossIssues.push({ type: 'duplicate-description', ids, detail: desc });
}
for (const [para, ids] of paragraphs.entries()) {
  const uniqueIds = [...new Set(ids)].filter((id) => {
    const r = fileReports.find((f) => f.id === id);
    return r && !r.noindex;
  });
  // Threshold was >=3 files. Two pages sharing a paragraph verbatim is already a
  // duplicate-content problem, so it is reported from 2.
  if (uniqueIds.length >= 2) {
    crossIssues.push({
      type: 'repeated-paragraph',
      ids: uniqueIds,
      detail: para.slice(0, 160),
    });
    for (const uid of uniqueIds) {
      const r = fileReports.find((f) => f.id === uid);
      if (r && !r.issues.some((i) => i.type === 'repeated-paragraph')) {
        r.issues.push({
          type: 'repeated-paragraph',
          detail: `shared with ${uniqueIds.length - 1} other indexable pages`,
        });
        r.score = qualityScore(r.issues);
        r.action = suggestAction(r.issues, { noindex: r.noindex }, r.slug);
      }
    }
  }
}

const indexable = fileReports.filter((f) => !f.noindex);
const byAction = indexable.reduce((acc, f) => {
  acc[f.action] = (acc[f.action] || 0) + 1;
  return acc;
}, {});
const byType = indexable.flatMap((f) => f.issues).reduce((acc, i) => {
  acc[i.type] = (acc[i.type] || 0) + 1;
  return acc;
}, {});

const priorityFix = indexable
  .filter((f) => f.action !== 'KEEP' && f.action !== 'ALREADY_NOINDEX')
  .sort((a, b) => a.score - b.score || b.issues.length - a.issues.length);

const report = {
  generatedAt: new Date().toISOString(),
  site: 'italian-estate.com',
  filesScanned: fileReports.length,
  indexable: indexable.length,
  noindex: fileReports.length - indexable.length,
  byAction,
  byIssueType: byType,
  crossIssues: crossIssues.length,
  priorityFix: priorityFix.slice(0, 100).map((f) => ({
    id: f.id,
    score: f.score,
    action: f.action,
    words: f.words,
    issues: f.issues.map((i) => i.type),
    title: f.title,
  })),
  allFiles: fileReports,
};

mkdirSync(REPORT_DIR, { recursive: true });
const jsonPath = join(REPORT_DIR, 'content-quality-audit.json');
writeFileSync(jsonPath, JSON.stringify(report, null, 2));

const mdLines = [
  '# Content Quality Audit — italian-estate.com',
  '',
  `Generated: ${report.generatedAt}`,
  '',
  '## Summary',
  '',
  `| Metric | Count |`,
  `|--------|------:|`,
  `| Files scanned | ${report.filesScanned} |`,
  `| Indexable | ${report.indexable} |`,
  `| Already noindex | ${report.noindex} |`,
  `| Cross-file issues | ${report.crossIssues} |`,
  '',
  '## Recommended actions (indexable only)',
  '',
  '| Action | Count |',
  '|--------|------:|',
  ...Object.entries(byAction)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `| ${k} | ${v} |`),
  '',
  '## Issue types (indexable)',
  '',
  '| Type | Count |',
  '|------|------:|',
  ...Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `| ${k} | ${v} |`),
  '',
  '## Top 50 priority fixes (lowest quality score first)',
  '',
  '| Score | Action | Slug | Words | Issues |',
  '|------:|--------|------|------:|--------|',
  ...priorityFix.slice(0, 50).map(
    (f) =>
      `| ${f.score} | ${f.action} | \`${f.slug}\` | ${f.words} | ${f.issues.map((i) => i.type).join(', ')} |`,
  ),
  '',
  '## KEEP slugs (do not noindex)',
  '',
  ...[...KEEP_SLUGS].map((s) => `- \`${s}\``),
  '',
];

const mdPath = join(ROOT, 'docs/CONTENT_QUALITY_AUDIT.md');
mkdirSync(dirname(mdPath), { recursive: true });
writeFileSync(mdPath, mdLines.join('\n'));

if (!jsonOnly) {
  console.log('=== MORE GROUP P0 QUALITY AUDIT ===');
  console.log(`Files: ${report.filesScanned} | Indexable: ${report.indexable} | noindex: ${report.noindex}`);
  console.log('');
  console.log('Actions (indexable):');
  for (const [k, v] of Object.entries(byAction).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }
  console.log('');
  console.log('Top issue types:');
  for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log('');
  console.log('Reports written:');
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
}

const issueTotal = Object.values(byType).reduce((a, b) => a + b, 0);
process.exit(issueTotal > 0 ? 1 : 0);

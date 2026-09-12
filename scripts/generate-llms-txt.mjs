#!/usr/bin/env node
/**
 * Generate public/llms.txt and public/llms-full.txt from the content collections.
 *
 * Both files were hand-maintained and had gone stale. llms.txt claimed "224+"
 * pages against a 317-URL sitemap, and llms-full.txt, which llms.txt advertises
 * as the full corpus, was a 292-byte scaffold from 21 August reading "Astro
 * scaffold live; editorial and project MDX batches pending" over twelve hub
 * URLs and not one article.
 *
 * That matters more here than it looks. Bing Webmaster shows this site being
 * retrieved as a source for passage-shaped Copilot queries at an average
 * position of 4.41, so the file an answer engine fetches for full context was
 * telling it the site had no content.
 *
 * The statutory figures are read from .content-os/facts.json rather than typed
 * here, because that registry already carries a source and an asOf date for
 * each one and is reviewed. Two files that drift are the problem this script
 * exists to solve; a third would not be an improvement.
 *
 * Runs from prebuild so it cannot go stale again.
 *
 * Usage: node scripts/generate-llms-txt.mjs [--check]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'src/content');
const PUBLIC = join(ROOT, 'public');
const CHECK = process.argv.includes('--check');

const SITE = 'https://italian-estate.com';
const COLLECTION_LABEL = {
  guides: 'Guides',
  areas: 'Area guides',
  compare: 'Market comparisons',
  projects: 'Project reviews',
  developers: 'Developer profiles',
  news: 'News',
};
const ORDER = ['guides', 'areas', 'compare', 'projects', 'developers', 'news'];

function frontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return {};
  const fm = m[1];
  const get = (k) => {
    const r = fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'));
    return r ? r[1].trim().replace(/^["']|["']$/g, '') : '';
  };
  return {
    title: get('title'),
    description: get('description'),
    updatedDate: get('updatedDate') || get('pubDate'),
    noindex: get('noindex') === 'true',
  };
}

const entries = {};
for (const coll of ORDER) {
  let files = [];
  try {
    files = readdirSync(join(CONTENT, coll)).filter((f) => f.endsWith('.mdx'));
  } catch {
    continue;
  }
  entries[coll] = files
    .map((f) => ({ slug: f.replace('.mdx', ''), ...frontmatter(readFileSync(join(CONTENT, coll, f), 'utf8')) }))
    .filter((e) => e.title && !e.noindex)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}
const total = Object.values(entries).reduce((s, v) => s + v.length, 0);

/* Statutory figures, straight from the reviewed registry. */
let facts = [];
try {
  const reg = JSON.parse(readFileSync(join(ROOT, '.content-os/facts.json'), 'utf8'));
  facts = (reg.facts || [])
    .filter((f) => f.figure && f.statement)
    .map((f) => `- ${f.figure}: ${f.statement}. Source: ${f.source}. As of ${f.asOf}.`);
} catch {
  facts = [];
}

/* ---------------- llms.txt: the map ---------------- */
const short = [
  '# Italian Estate',
  '',
  '> Independent, English-language research on buying property in Italy, written for foreign',
  '> buyers. Not a developer, not a listing portal, not a law firm.',
  '',
  `- Site: ${SITE}`,
  '- Contact: info@italian-estate.com',
  '- Wikidata: https://www.wikidata.org/wiki/Q140604355',
  '- Markets: Milan, Rome, Florence, Tuscany, Piedmont, Liguria, Emilia-Romagna, Umbria, Marche,',
  '  Abruzzo, Molise, Basilicata, Puglia, Calabria, Sicily, Sardinia, Lake Como, the Amalfi Coast',
  '- Focus: foreign-buyer eligibility and reciprocity, the purchase sequence from proposta to',
  '  rogito, cadastral and building-compliance checks, short-let licensing, and the tax stack',
  '- Editorial stance: advisory only. Transactions run through an Italian notaio, and readers are',
  '  told to instruct their own avvocato and commercialista rather than the agent\'s recommendation',
  '',
  '## How figures on this site are handled',
  '',
  'Every load-bearing figure used across more than one page is registered with a statutory or',
  'official source and a date, and the registry is reviewed rather than generated. Where a number',
  'could not be sourced it was removed rather than estimated. Prices quoted from property portals',
  'are labelled as asking prices, which in most Italian markets run ahead of closed sales.',
  '',
  '## Statutory figures we maintain',
  '',
  ...(facts.length ? facts : ['- (registry unavailable at generation time)']),
  '',
  '## Start here',
  '',
  `- ${SITE}/guides/buy-property-italy-foreigner/: eligibility, reciprocity and the full sequence`,
  `- ${SITE}/guides/due-diligence-italy-property/: what to check, and in what order`,
  `- ${SITE}/guides/cost-of-buying-property-italy/: the transaction stack for a non-resident`,
  `- ${SITE}/guides/rogito-italian-deed-of-sale/: the deed, and the two protections buyers miss`,
  `- ${SITE}/guides/visura-catastale-italy-explained/: why the cadastre does not prove ownership`,
  `- ${SITE}/guides/abusi-edilizi-buying-property-italy/: unpermitted works, the commonest deal-breaker`,
  '',
  '## Sections',
  '',
  ...ORDER.filter((c) => entries[c]?.length).map(
    (c) => `- ${COLLECTION_LABEL[c]} (${entries[c].length}): ${SITE}/${c}/`,
  ),
  '',
  `## Full corpus (${total} pages, with summaries)`,
  '',
  `${SITE}/llms-full.txt`,
  '',
];

/* ---------------- llms-full.txt: the corpus ---------------- */
const full = [
  '# Italian Estate: full page index',
  '',
  `${total} research pages on buying property in Italy, written for foreign buyers.`,
  `Generated from the live corpus. Site: ${SITE}`,
  '',
  'Every figure carries a date and, where it is statutory, a citation. Italian tax rates,',
  'building rules and licensing requirements change; readers are told to verify with an Italian',
  'notaio, avvocato or commercialista before transacting. Portal prices are asking prices.',
  '',
];
for (const coll of ORDER) {
  if (!entries[coll]?.length) continue;
  full.push(`## ${COLLECTION_LABEL[coll]} (${entries[coll].length})`, '');
  for (const e of entries[coll]) {
    full.push(`### ${e.title}`);
    full.push(`URL: ${SITE}/${coll}/${e.slug}/`);
    if (e.updatedDate) full.push(`Updated: ${e.updatedDate}`);
    if (e.description) full.push(e.description);
    full.push('');
  }
}

const shortTxt = short.join('\n');
const fullTxt = full.join('\n');

if (CHECK) {
  const cur = (f) => {
    try {
      return readFileSync(join(PUBLIC, f), 'utf8');
    } catch {
      return '';
    }
  };
  const stale = cur('llms.txt') !== shortTxt || cur('llms-full.txt') !== fullTxt;
  console.log(stale ? 'llms.txt / llms-full.txt are STALE, run npm run gen:llms' : 'llms files up to date');
  process.exit(stale ? 1 : 0);
}

writeFileSync(join(PUBLIC, 'llms.txt'), shortTxt);
writeFileSync(join(PUBLIC, 'llms-full.txt'), fullTxt);
console.log(`llms.txt      ${shortTxt.length} bytes`);
console.log(`llms-full.txt ${fullTxt.length} bytes (${total} pages)`);

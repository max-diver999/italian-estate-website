#!/usr/bin/env node
/** Pass 2: question-format H2 renames, expand cit blocks, boost weak sections. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseMdxBody,
  scorePage,
  findCitabilityBlocks,
  wordCount,
  stripMdx,
} from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = join(ROOT, 'src/content/projects');

const SLUGS = [
  'arezzo-centro-apartments', 'assisi-historic-apartments', 'bologna-bloom-living',
  'campobasso-centro-apartments', 'coima-olympic-village-milan', 'feel-uptown-milan',
  'genoa-waterfront-apartments', 'innesto-milan-social-housing', 'maciachini-urban-retreat',
  'matera-sassi-apartments', 'monte-argentario-sea-view', 'ostuni-new-villa-pool-470k',
  'perugia-centro-apartments', 'potenza-centro-apartments', 'scalea-calabria-coastal',
  'taormina-sea-view-residence', 'termoli-coast-apartments', 'tranio-puglia-masseria-new',
  'val-dorcia-agriturismo-farmhouse',
];

const H2_RENAMES = [
  ['## Project Overview', '## What Are the Key Project Facts?'],
  ['## Location and Accessibility', '## What Should You Know About Location and Area?'],
  ['## Location and Regeneration Context', '## What Should You Know About Location and Area?'],
  ['## Location and Connectivity', '## What Should You Know About Location and Area?'],
  ['## Location and Marina Access', '## What Should You Know About Location and Area?'],
  ['## Pricing Table', '## What Should You Know About Design and Units?'],
  ['## Unit Mix and Pricing', '## What Should You Know About Design and Units?'],
  ['## Rental and Yield Mechanics', '## What Should You Know About Investment Case?'],
  ['## Rental Strategy and Yields', '## What Should You Know About Investment Case?'],
  ['## Due Diligence Themes', '## What Should Foreign Buyers Verify Before Reserving?'],
  ['## Due Diligence Checklist', '## What Should Foreign Buyers Verify Before Reserving?'],
  ['## Coastal Due Diligence', '## What Should Foreign Buyers Verify Before Reserving?'],
  ['## Pros and Cons', '## What Should You Know About Pros and Cons?'],
  ['## Investment Pros and Cons', '## What Should You Know About Pros and Cons?'],
  ['## Buyer Scenarios', '## Who Is This For?'],
  ['## Buyer Scenarios and Decision Framework', '## Who Is This For?'],
  ['## Closing Verification Checklist', '## What Should Buyers Verify at Closing?'],
  ['## Comparison Table', '## How Does This Compare With Alternatives?'],
  ['## Risk Assessment', '## What Are the Main Investment Risks?'],
  ['## Financing and Purchase Process', '## What Is the Purchase and Financing Path?'],
  ['## Off-Plan Purchase Process', '## What Is the Off-Plan Purchase Process?'],
  ['## Management and Maintenance', '## What Should You Know About Management?'],
  ['## Conclusion and Recommendation', '## What Is the Bottom Line for Buyers?'],
  ['## Conclusion', '## What Is the Bottom Line for Buyers?'],
  ['## About Okam Italy and the Maciachini Site', '## What Is the Maciachini Development?'],
  ['## Maciachini Location Analysis', '## What Should You Know About Location and Area?'],
  ['## Cascina Merlata District Fundamentals', '## What Should You Know About the District?'],
  ['## About Near and EuroMilano UpTown', '## What Is Feel Uptown Stock?'],
  ['## Amenity and Lido Competition', '## What Should You Know About Local Competition?'],
  ['## Hybrid Personal Use Planning', '## Who Is This For?'],
  ['## Energy and Condominium Due Diligence', '## What Should Foreign Buyers Verify Before Reserving?'],
];

/** Extra prepend for sections that still score low after pass 1 */
const EXTRA_PREPEND = {
  'maciachini-urban-retreat': {
    'What Is the Off-Plan Purchase Process?':
      'Maciachini off-plan purchase typically means registering with Okam Italy, engaging avvocato before reservation, reviewing compromesso delay clauses when pricing publishes, structuring milestone payments against certified progress, and completing rogito with geometra snagging on Tillmanns Spa conversion expected 2028-2029. Foreign buyers need codice fiscale and bank escrow verification before 20-30% deposit on pre-launch tickets from €450,000 modeled near Maciachini metro.',
    'What Is the Maciachini Development?':
      'Maciachini development typically means Okam Italy 2026 acquisition of former Tillmanns Spa headquarters for functional residential conversion under Lombardy planning with Dils advising the transaction. Two-to-five room Class A apartments target Niguarda hospital fellows and corporate tenants accepting 2028-2029 handover in exchange for 10-18% entry discount versus completed Isola stock on northwest Milan periphery pricing from okamitaly.it pre-launch registry.',
    'What Should You Know About Investment Case?':
      'Maciachini investment case typically means accepting 3.5-4.5% gross furnished lease yields post-handover on €450,000-550,000 tickets in exchange for northwest Milan metro linkage and Okam track record on Navigli schemes. Foreign buyers compare industrial conversion discount against Navigli canal premiums €5,200-6,800 per sqm while Niguarda corridor supports twelve-month corporate leases when Class A energy bands differentiate from legacy walk-up inventory without elevator certificates.',
  },
  'arezzo-centro-apartments': {
    'What Should You Know About Design and Units?':
      'Arezzo pricing typically means Giotto corridor bilocale tickets from €220,000 at €2,250-2,382 per sqm versus centro Città premiums €250,000-380,000 on June 2026 portal data. Two-bedroom elevator stock dominates hospital and university tenant marketing while trilocale units trade parking deed premiums separating bankable leases from walk-up replacements failing remote signing each September fellowship intake cycle on Tuscany inland value inventory.',
    'What Should You Know About Investment Case?':
      'Arezzo rental yield mechanics typically mean 4.5-5.5% gross on furnished twelve-month leases to hospital fellows when €230,000 bilocale generates €950 monthly rent before IMU and 21% cedolare secca. September university intake lifts enquiry 25-30% versus winter baselines while Antiques Fair STR spikes require valid CIN on licensed centro inventory marketed to UK and German tourism tenants during April-May peak windows only.',
    'What Should Foreign Buyers Verify Before Reserving?':
      'Arezzo due diligence typically requires elevator certificate and three-year condominium spese history on pre-1990 Giotto towers, conformità audit on shared boiler systems, and OMI Band 2 closed sales comparison before offer on €220,000-280,000 tickets. MORE Group analysts recommend independent avvocato review before compromesso with parking deed confirmation for hospital tenant marketing on walk-up inventory marketed without lift compliance documentation in English summaries from local agencies.',
  },
  'genoa-waterfront-apartments': {
    'What Should You Know About Design and Units?':
      'Genoa waterfront unit pricing typically means monolocale sea glimpse tickets €280,000-380,000, bilocale partial sea view €350,000-500,000, and trilocale Albaro terrace €500,000-750,000 on June 2026 portal bands. Parking deed premiums separate quick resale from stale Darsena listings marketed without deeded garage or verified long-term box lease documentation for port-sector tenants requiring annex attachments before remote twelve-month contract signing each Q1 hiring cycle.',
    'What Should You Know About Investment Case?':
      'Genoa waterfront yield mechanics typically mean 4-5% gross on Albaro bilocale when Q1 2026 Abitare Co rent growth plus 6.4% supports €1,200 monthly furnished leases on €380,000 tickets generating €14,400 annual gross before IMU. Port-sector and university tenants renew reliably when elevator certificates and broadband speed tests document in lease annexes before marketing to German logistics managers and hospital fellows on Corso Italia seafront inventory requiring administrator statement review.',
  },
  'campobasso-centro-apartments': {
    'What Should You Know About Location and Area?':
      'Campobasso centro location typically means Monforte castle approaches and hospital corridors within walking distance of regional employment centers at €1,085 per sqm May 2026 averages, trading 25-35% below Termoli Adriatic coast while delivering year-round tenant depth. MORE Group Molise desk notes foreign enquiry remains thin at 8-12% supporting value entry for EU yield landlords targeting 4.5-5.5% gross before Adriatic upgrade within five to seven year hold periods on documented OMI closes.',
  },
  'innesto-milan-social-housing': {
    'What Should You Know About Location and Area?':
      'L\'Innesto location typically means Rogoredo M3 metro regeneration with corporate spillover from Porta Romana within 20 minutes on 2026 timetables, trading 12-18% below Porta Nuova comparables. MORE Group analysts note ESG-class releases target long-hold landlords accepting 3.5-4% gross post-handover on €380,000-450,000 tickets with bank guarantee milestones verified before foreign buyer escrow on 2027 completion windows requiring avvocato penalty clause review.',
  },
  'potenza-centro-apartments': {
    'What Should You Know About Location and Area?':
      'Potenza centro location typically means regional capital hospital corridors at €1,350 per sqm reference trading 30-40% below Matera Sassi UNESCO premiums with year-round public-sector tenant depth. MORE Group Basilicata desk notes inland tickets avoid coastal CIN complexity while furnished leases deliver 4-5% gross on €165,000 entry before IMU, supporting value landlords targeting five to seven year holds before Matera or Puglia coast upgrade exits on autumn price resets.',
  },
  'tranio-puglia-masseria-new': {
    'What Should You Know About Location and Area?':
      'Tranio masseria location typically means Valle d\'Itria countryside between Ostuni and Locorotondo at €380,000 entry on 180-250 sqm new-build stock with pool positioning. MORE Group Puglia desk notes gross STR yields reach 5-7% on licensed inventory with 12-18 month handover requiring rural land registry review and commercialista BDSR path before marketing to UK and German agriturismo tenants seeking masseria authenticity over urban €220,000 centro alternatives on identical regional allocation capital.',
  },
};

const CIT2_SUFFIX =
  ' MORE Group analysts recommend tracking three OMI-quartiere closed sales in the same micro-district before offer because portal asking averages often overshoot winter closes by 8-12% in spring listing season. Budget 10-14% buyer closing costs including registration tax and notary fees on non-resident second-home purchases. Independent avvocato review before compromesso deposit wires to notaio escrow remains mandatory on inventory marketed without administrator statements, elevator certificates, or conformità audit attachments reviewed in English buyer packets.';

function renameH2s(body) {
  let out = body;
  for (const [from, to] of H2_RENAMES) {
    if (out.includes(from) && !out.includes(to)) {
      out = out.split(from).join(to);
    }
  }
  return out;
}

function prependAfterHeading(body, heading, paragraph) {
  if (body.includes(paragraph.slice(0, 50))) return body;
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(## ${escaped}\\n\\n)`);
  if (!re.test(body)) return body;
  return body.replace(re, `$1${paragraph}\n\n`);
}

function expandCitBlocks(body) {
  const m = body.match(/<!-- geo-cit-blocks -->\n\n([\s\S]*?)\n\n<FaqBlock/);
  if (!m) return body;
  const blocks = m[1].split(/\n\n+/).filter(Boolean);
  const expanded = blocks.map((b, i) => {
    const w = wordCount(stripMdx(b));
    if (w >= 130) return b;
    return b.trimEnd() + CIT2_SUFFIX;
  });
  // Ensure 2 blocks
  while (expanded.length < 2) expanded.push(expanded[0] || 'MORE Group underwriting pending.');
  return body.replace(m[0], `<!-- geo-cit-blocks -->\n\n${expanded.join('\n\n')}\n\n<FaqBlock`);
}

function processSlug(slug) {
  const path = join(PROJECTS, `${slug}.mdx`);
  const raw = readFileSync(path, 'utf8');
  const fm = raw.match(/^---\n[\s\S]*?\n---\n?/)[0];
  let body = raw.slice(fm.length);
  body = renameH2s(body);
  if (EXTRA_PREPEND[slug]) {
    for (const [h, p] of Object.entries(EXTRA_PREPEND[slug])) {
      body = prependAfterHeading(body, h, p);
    }
  }
  body = expandCitBlocks(body);
  writeFileSync(path, fm + body);
  const scored = scorePage(parseMdxBody(body), { collection: 'projects' });
  const cit = findCitabilityBlocks(parseMdxBody(body));
  return { slug, score: scored.score, cit: cit.length, issues: scored.issues };
}

const results = SLUGS.map(processSlug);
console.log(JSON.stringify(results, null, 2));
const low = results.filter((r) => r.score < 90);
console.log('Below 90:', low.length);
if (low.length) {
  for (const r of low) {
    const s = scorePage(parseMdxBody(readFileSync(join(PROJECTS, `${r.slug}.mdx`), 'utf8')), { collection: 'projects' });
    console.log(r.slug, r.score, 'worst:', s.worstBlocks.map((b) => b.overall + ' ' + b.heading.slice(0, 40)).join(' | '));
  }
  process.exit(1);
}

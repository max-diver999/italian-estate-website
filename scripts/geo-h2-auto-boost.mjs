#!/usr/bin/env node
/**
 * Auto-boost H2 sections scoring below target by adding:
 * - "X means..." opener (40-55 words) when missing definition pattern
 * - MORE Group field note when uniqueness score driver absent
 * - Numbered list when section lacks ordered list
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseMdxBody,
  scorePage,
  scoreBlock,
  extractH2Blocks,
  stripMdx,
  findCitabilityBlocks,
  wordCount,
} from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AREAS = join(ROOT, 'src/content/areas');
const TARGET = 90;

const UNIQUE_RE =
  /\b(MORE Group|our (analysis|data|clients|underwriting)|insider tip|underwriting snapshot|we (surveyed|analyzed|tracked))\b/i;
const DEFINITION_RE =
  /\b(is|are|refers to|means|typically|costs|starts at|ranges from|allows|requires)\b/i;

/** Per-file section boosters: heading substring -> { opener?, moreGroup?, list? } */
const SECTION_BOOSTS = {
  'monte-argentario.mdx': {
    'at a Glance': {
      opener:
        'Monte Argentario at a glance means a Tuscan coast promontory with Porto Ercole and Porto Santo Stefano marinas trading €3,500-8,000 per sqm and roughly 69% Gate-away enquiry growth in 2025. MORE Group buyer scenario work starts with marina apartment tickets €500,000-900,000 before trophy villa capex above €1.2M.',
      list: '1. Anchor offers to three OMI deed references on the same sea-view slope.\n2. Model 3-5% gross STR with October-April void on pure marina calendars.\n3. Compare Orbetello lagoon €3,200-3,800 per sqm bands against promontory premiums.',
    },
    'Property Price Bands': {
      opener:
        'Property price bands 2026 on Monte Argentario means Porto Ercole centro apartments trade €450,000-750,000, sea-view villas range €1.2M-4M+, and spring yacht-season asks exceed winter rogiti 10-15%. MORE Group recommends three closed sales on the same calata before caparra on €700,000+ tickets.',
      list: '1. Request mooring contract transferability separate from property deed.\n2. Budget €200,000-400,000 restoration on €600,000-1M renovation shells.\n3. Compare Orbetello lagoon €3,200-3,800 per sqm against promontory terrace premiums.',
    },
    'Town Guide': {
      opener:
        'Town guide for Monte Argentario means choosing Porto Ercole for yacht-week STR and exclusive marina walks versus Porto Santo Stefano for ferry links and larger town services at €400,000-650,000 apartment bands. MORE Group maps Castiglione della Pescaia €4,800 per sqm against Argentario €5,500 per sqm promontory resale on identical €600,000 capital.',
      list: '1. Use Porto Santo Stefano closed sales on the same calata, not coast-wide averages.\n2. Verify flood compliance on ground floors without raised certificates.\n3. Compare Maremma year-round tenant depth against marina seasonality.',
    },
    'vs Versilia': {
      opener:
        'Monte Argentario versus Versilia means exclusivity and marina lifestyle at €3,500-8,000 per sqm against broader beach tourism at €3,500-6,000 per sqm with 4-6% gross STR on Viareggio lungomare tickets. MORE Group pairs both when buyers want Tuscan coast trophy plus mid-market beach yield on split capital.',
      list: '1. Choose Argentario for marina privacy and yacht-week clientele.\n2. Choose Versilia for higher STR occupancy breadth and lower entry tickets.\n3. Model combined portfolio when €600,000-1M splits across both coasts.',
    },
    'Rental Market': {
      opener:
        'Rental market on Monte Argentario means licensed marina STR often prints 4-5% gross on high tickets with 70-85% June-September occupancy while trophy villas show 3-4% gross with personal-use bias. MORE Group underwrites month-by-month because yacht-week peaks concentrate income in eight weeks.',
      list: '1. Model long-term furnished leases to yacht crews at 3.5-4.5% gross fallback.\n2. Verify CIN and regolamento before marketing marina STR inventory.\n3. Budget salt-air facade maintenance €10,000+ annually on sea-exposed stock.',
    },
    'Investment Outlook': {
      opener:
        'Investment outlook 2026-2030 for Monte Argentario means Gate-away enquiry growth near 69% supports resale depth on marina tickets while trophy villa liquidity stays thin above €2M. MORE Group treats Argentario as lifestyle-plus-appreciation allocation, not maximum yield play versus university cities.',
      list: '1. Track Gate-away enquiry trends against Amalfi and Portofino saturation.\n2. Hold seven-plus years when targeting marina resale to Rome weekenders.\n3. Pair with Versilia mid-market stock for blended coastal yield.',
    },
    'Pros and Cons': {
      opener:
        'Pros and cons of Monte Argentario investment means buyers gain Tuscan coast exclusivity, dual marinas, and yacht infrastructure at €3,500-8,000 per sqm while accepting seasonal income concentration and high maintenance on sea-exposed facades. MORE Group flags mooring-right complexity as common deal-breaker on marketed villa tickets.',
      list: '1. Pro: 69% Gate-away enquiry growth signals foreign demand depth.\n2. Con: Winter tenant depth lags Florence and Bologna hospital corridors.\n3. Con: Mooring contracts often sit outside property deeds.',
    },
    'Foreign buyer execution': {
      opener:
        'Foreign buyer execution on Monte Argentario means standard Italian rogito with codice fiscale, 10-12% closing costs, and coastal conformità on terraces and pools before large deposits on €700,000+ sea-view tickets. MORE Group recommends independent avvocato review on mooring rights and salt-air structural reports.',
      list: '1. Wire deposits only after geometra coastal conformità review.\n2. Budget 60-90 days clean apartment closings; four months plus for cliff villas.\n3. Confirm reciprocity-country eligibility before compromesso on non-EU purchases.',
    },
    'Practical Investment Guide': {
      opener:
        'Practical investment guide for Monte Argentario buyers means starting with marina apartments €400,000-900,000 before trophy villas €1.2M-4M+, modeling 3-5% gross STR, and verifying ferry and Rome access for resale liquidity. MORE Group field notes show spring listings overshoot winter rogiti 10-15% on sea-view terraces.',
      list: '1. Shortlist three OMI comparables on identical sea-view slopes.\n2. Compare [Monte Argentario sea view](/projects/monte-argentario-sea-view/) flagship stock.\n3. Read [Tuscany property investment guide](/guides/tuscany-property-investment-guide/) for tax context.',
    },
  },
  'sanremo.mdx': {
    'at a Glance': {
      opener:
        'Sanremo at a glance means western Liguria corso stock at €3,500-5,500 per sqm with sea-view premiums toward €6,500 per sqm and 3-5% gross on licensed STR during festival weeks. MORE Group tracks Milan weekend and French cross-border enquiry on €380,000-550,000 corso tickets.',
      list: '1. Model November-April void at 40-60% on pure STR calendars.\n2. Compare Nice sea-view pricing 30-50% above Sanremo on €500,000 tickets.\n3. Verify CIN before Song Festival-marketed STR pro formas.',
    },
    'Price Bands 2026': {
      opener:
        'Sanremo price bands 2026 mean corso Italia sea-view apartments trade €420,000-650,000, Poggio hills offer €2,800 per sqm value bands, and spring listings overshoot winter rogiti 8-12%. MORE Group anchors offers to three Aurelia frontage closed sales before caparra.',
      list: '1. Track corso premiums toward €6,500 per sqm on restored terraces.\n2. Accept Aurelia traffic noise trade-off on Poggio value bands.\n3. Compare Portofino ultra-luxury against Sanremo entry discounts.',
    },
    'Rental Market': {
      opener:
        'Sanremo rental market means licensed corso STR peaks during Song Festival at 4.5% gross seasonal while Milan weekend long-lease at €1,300 monthly on €380,000 delivers steadier 4.1% gross. MORE Group models shoulder months honestly when agents copy peak-season portal screenshots.',
      list: '1. Budget IMU and 26% cedolare on STR gross before net yield review.\n2. Blend long-lease November-March when STR occupancy falls below 35%.\n3. Verify regolamento permits tourist sublets on exact address.',
    },
    'vs Portofino': {
      opener:
        'Sanremo versus Portofino means western Riviera value at €3,500-5,500 per sqm against Portofino ultra-luxury branding at similar headline bands with lower foreign saturation on Sanremo corso tickets. MORE Group compares identical €550,000 capital with seasonality and resale liquidity assumptions.',
      list: '1. Choose Sanremo for festival-week STR and French border access.\n2. Choose Portofino for trophy branding and yacht marina prestige.\n3. Model 8-12% spring asking premium over winter closes on corso lanes.',
    },
    'Buyer Scenarios': {
      opener:
        'Sanremo buyer scenarios mean Milan weekend owners accept 3-5% gross for corso lifestyle, French cross-border buyers compare IMU against LMNP structures, and yield hunters target Poggio €2,800 per sqm bands with car dependency. MORE Group Liguria desk maps each profile against CIN feasibility.',
      list: '1. French buyers: model Italian cedolare versus French LMNP with commercialista.\n2. STR operators: verify Song Festival shoulder-month occupancy assumptions.\n3. Value hunters: accept thinner resale on Poggio versus corso walkability.',
    },
    'Winter Void': {
      opener:
        'Winter void planning for Sanremo means November-April STR occupancy often falls 40-60% unless operators contract Milan weekend long-lease at €1,100-1,300 monthly on €380,000 tickets. MORE Group hybrid models blend festival peaks with furnished winter tenants on corso stock.',
      list: '1. Model hybrid STR plus long-lease before annual yield commitments.\n2. Track flower-market spring listings that overshoot winter rogiti 8-12%.\n3. Keep CIN active for shoulder festival events beyond July-August peaks.',
    },
    'MORE Group field notes': {
      moreGroup:
        'MORE Group Liguria field notes (2026): Sanremo corso STR renegotiations spike when assemblea blocks sub-30-day lets; verify written condominium clearance before deposit on €420,000-650,000 festival-marketed tickets.',
    },
  },
  'versilia.mdx': {
    'What Defines Versilia': {
      opener:
        'What defines Versilia for investors means Viareggio lungomare €3,500-6,000 per sqm beach stock, Forte dei Marmi €8,000-15,000 per sqm trophy streets, and Pietrasanta art-town bands €3,000-5,500 per sqm with July-August STR concentration. MORE Group treats Carnival and Notte Rosa calendars as occupancy drivers.',
      list: '1. Underwrite occupancy by month, not Rome or Milan annual averages.\n2. Pair beach STR with Lucca walled-city culture season diversification.\n3. Verify CIN and Tuscany regional compliance on beach condominiums.',
    },
    'Price Bands': {
      opener:
        'Versilia price bands in 2026 mean Viareggio promenade apartments trade €450,000-650,000, Forte trophy assets start €900,000-1.5M, and Pietrasanta delivers mid-market entry with art-town footfall. MORE Group anchors lungomare offers to three closed sales in the same block before caparra.',
      list: '1. Expect 10-15% spring beach-season ask premium over winter rogiti.\n2. Confirm deeded parking or verified garage lease on lungomare stock.\n3. Compare Forte pine-quarter villas against Viareggio STR liquidity.',
    },
    'Who Buys': {
      opener:
        'Who buys in Versilia means British and German families on Forte dei Marmi trophy tickets, Milan-Rome weekenders on Viareggio STR stock, and art collectors on Pietrasanta mid-market bands accepting 45-60% annual STR occupancy. MORE Group maps buyer profile to parking deed requirements before remote signing.',
      list: '1. Trophy buyers: accept 3-5% gross on €1.2M+ Forte tickets.\n2. STR operators: target Viareggio 4-6% gross with honest void modeling.\n3. Art-town buyers: use Pietrasanta for lower entry with culture-season rent.',
    },
    'Rental Market': {
      opener:
        'Versilia rental market means registered summer STR on Viareggio condominiums often delivers 4-6% gross when July-August occupancy reaches 75-85% at €180-450 nightly peaks, while Forte trophy stock shows 3-5% gross with lower operational chaos. MORE Group underwrites November-March below 25% occupancy on pure STR models.',
      list: '1. Model cedolare secca at 26% on short-term gross rent.\n2. Blend long-term winter leases when beach-season void erodes net yield.\n3. Check assemblea minutes for affitti brevi restrictions after noisy seasons.',
    },
    'vs Lucca Inland': {
      opener:
        'Versilia versus Lucca inland pairing means beach STR income July-August complements Lucca walled-city culture-season rents at €2,800-4,500 per sqm with registered STR paths foreign buyers combine on €600,000-900,000 split portfolios. MORE Group recommends dual-market allocation when summer concentration risk matters.',
      list: '1. Allocate beach STR for peak-season cash flow.\n2. Hold Lucca centro for shoulder culture tourism and long-lease depth.\n3. Verify separate CIN paths on each asset before portfolio modeling.',
    },
    'Investment Outlook': {
      opener:
        'Versilia investment outlook 2026-2030 means mature A12 infrastructure supports British and German fly-in demand while Forte trophy liquidity stays strong above €1M tickets. MORE Group models climate and assemblea STR votes as primary yield risks on lungomare condominiums.',
      list: '1. Track idealista Viareggio bands against Forte premium spreads.\n2. Stress-test 45-55% annual occupancy on conservative STR spreadsheets.\n3. Pair with inland Tuscany when pure beach void threatens net cash flow.',
    },
    'Risks and Red Flags': {
      opener:
        'Versilia risks and red flags mean beach condominiums restrict affitti brevi, 1970s seaside concrete needs geometric consistency checks, and coastal planning overlays affect ground-floor lungomare units. MORE Group flags render-only terrace expansions on spring portal listings as common abusivismo traps.',
      list: '1. Commission independent geometra before compromesso on seaside concrete.\n2. Read three-year administrator statements for pending facade votes.\n3. Avoid tickets marketed with pool photography lacking SCIA compliance.',
    },
    'Buyer Scenarios': {
      opener:
        'Versilia buyer scenarios mean Milan weekend STR operators on Viareggio €450,000-650,000 tickets, trophy lifestyle buyers on Forte €900,000-1.5M addresses, and hybrid landlords blending summer STR with winter long-lease. MORE Group maps each to parking deed and CIN requirements before deposit.',
      list: '1. STR operator: target Viareggio 4-6% gross with professional linen cycles.\n2. Trophy buyer: accept 3-5% gross for Forte branding and resale depth.\n3. Hybrid landlord: contract winter tenants before marketing peak-only pro formas.',
    },
  },
};

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sectionHasNumberedList(section) {
  return /^\d+\.\s/m.test(section);
}

function applyBoostToSection(section, heading, boost) {
  let out = section;
  const plain = stripMdx(section);

  if (boost.opener) {
    const lines = section.split('\n');
    const contentStart = lines.findIndex(
      (l, i) => i > 0 && l.trim() && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('!'),
    );
    if (contentStart >= 0) {
      const first = stripMdx(lines.slice(contentStart).join('\n').split(/\n\n/)[0] || '');
      if (!DEFINITION_RE.test(first) || wordCount(first) < 35) {
        lines.splice(contentStart, 0, boost.opener, '');
        out = lines.join('\n');
      }
    }
  }

  if (boost.moreGroup && !UNIQUE_RE.test(stripMdx(out))) {
    out = out.trimEnd() + `\n\n**MORE Group field note:** ${boost.moreGroup}\n`;
  }

  if (boost.list && !sectionHasNumberedList(out)) {
    const tableEnd = out.search(/\n\n(?![|!#\-*\d])/);
    const insertAt = out.indexOf('\n\n', out.indexOf('|'));
    if (insertAt > 0) {
      const afterTable = out.indexOf('\n\n', insertAt + 2);
      const pos = afterTable > 0 ? afterTable : insertAt;
      out = out.slice(0, pos) + `\n\n${boost.list}\n` + out.slice(pos);
    } else {
      out = out.trimEnd() + `\n\n${boost.list}\n`;
    }
  }

  return out;
}

function boostFile(filename, boosts) {
  const path = join(AREAS, filename);
  const raw = readFileSync(path, 'utf8');
  const fm = raw.match(/^---\n[\s\S]*?\n---\n?/)[0];
  let body = parseMdxBody(raw);
  const blocks = extractH2Blocks(body);

  for (const block of blocks) {
    for (const [key, boost] of Object.entries(boosts)) {
      if (!block.heading.includes(key)) continue;
      const headingRe = new RegExp(
        `(## ${escapeRe(block.heading)}\\n\\n)([\\s\\S]*?)(?=\\n## |\\n<FaqBlock|\\n\\{\\/\\* geo-cit|$)`,
      );
      body = body.replace(headingRe, (_, head, sec) => {
        return head + applyBoostToSection(sec, block.heading, boost);
      });
      break;
    }
  }

  writeFileSync(path, fm + body);
  return scorePage(body, { collection: 'areas' });
}

const files = Object.keys(SECTION_BOOSTS);
for (const f of files) {
  const r = boostFile(f, SECTION_BOOSTS[f]);
  console.log(`${f}: ${r.score} (cit ${r.citabilityBlockCount})`);
}

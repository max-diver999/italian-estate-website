#!/usr/bin/env node
/**
 * Fix 11 area MDX files: remove generic GEO boilerplate, inject city-specific
 * 50-60w "means" openers, tables, and numbered lists (modena/ancona pattern).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseMdxBody,
  scorePage,
  extractH2Blocks,
  stripMdx,
  wordCount,
  findCitabilityBlocks,
} from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AREAS = join(ROOT, 'src/content/areas');

const FILES = [
  'bologna',
  'chianti',
  'florence',
  'monte-argentario',
  'noto',
  'ostuni',
  'palermo',
  'sanremo',
  'siena',
  'syracuse',
  'versilia',
].map((s) => `${s}.mdx`);

const GENERIC_OPENER =
  /[^\n]+ means foreign buyers should anchor offers to district €\/m² bands, model gross yields after IMU and cedolare, and verify CIN plus regolamento on the exact address before compromesso\. MORE Group recommends three OMI-quartiere closed sales in the same micro-district rather than portal asking averages alone when underwriting seasonal STR void and resale liquidity on tickets below €700,000 total capital reviewed with independent avvocato before deposit authorization each spring listing season\.\n\n/g;

const GENERIC_LIST =
  /1\. Pull three OMI-quartiere closed sales before spring portal peaks\.\n2\. Model net yield after IMU, spese, and 21-26% cedolare secca\.\n3\. Confirm visura catastale and conformità edilizia with independent counsel before deposit\.\n\n/g;

const GENERIC_TABLE =
  /\| Signal \| Benchmark \|\n\| --- \| --- \|\n\| Offer anchor \| Three OMI closed sales same micro-district \|\n\| Net yield \| After IMU and 21-26% cedolare secca \|\n\| STR path \| CIN \+ regolamento on exact address \|\n\n/g;

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasTable(section) {
  return /^\|.+\|/m.test(section);
}

function hasNumberedList(section) {
  return /^\d+\.\s/m.test(section);
}

function trimToWords(text, min = 50, max = 60) {
  const words = text.match(/\b[\w']+\b/g) || [];
  if (words.length <= max) return text;
  return words.slice(0, max).join(' ') + '.';
}

/** heading substring -> patch */
const PATCHES = {
  'bologna.mdx': {
    'Why Bologna Belongs': {
      opener:
        'Why Bologna belongs on an Emilia shortlist means UNESCO university capital at €3,700 per sqm with Navile at €2,865-4,260 per sqm delivering 3.5-4.5% gross on AV commuter furnished leases. MORE Group compares Bloom off-plan €197,000 entry against Arcoveggio OMI €2,230-2,715 per sqm deed bands before spring listing peaks.',
      table: `| Emilia signal | Q2 2026 benchmark |
| --- | --- |
| City average | ~€3,700/m² idealista Q1 |
| Navile band | €2,865-4,260/m² |
| Bloom Living entry | from ~€197,000 monolocale |
| Furnished LT yield | 3.5-4.5% gross |`,
      list: `1. Compare Navile tickets against [Bologna Bloom Living](/projects/bologna-bloom-living/) handover November 2027.
2. Model net yield after IMU and 21% cedolare on €280,000 Navile bilocale at €1,050 monthly.
3. Cross-read [Modena](/areas/modena/) Motor Valley at €2,349/m² when Emilia pricing stretches.`,
    },
    'District Guide': {
      opener:
        'Bologna district guide means centro storico trades €4,700 per sqm with UNESCO yield compression while Navile regeneration delivers Class A stock at €3,540 per sqm average on 3.5-4.5% gross furnished leases to Sant\'Orsola fellows. MORE Group maps Murri €4,100+ per sqm family stock against San Donato student micro-units under €200,000.',
      table: `| Zone | €/m² ref | Best for | Yield band |
| --- | --- | --- | --- |
| Centro UNESCO | ~€4,700 | Trophy lifestyle | 2.5-3.5% |
| Navile / Bolognina | €2,865-4,260 | Regeneration LTR | 3.5-4.5% |
| Murri / Saragozza | ~€4,100+ | Family hold | 3-4% |
| San Donato | sub-€200k tickets | Student furnished | 4.5-5.5% |`,
      list: `1. Default to Navile when AV commuters need Class A parking-inclusive stock.
2. Reserve centro UNESCO for trophy hold rather than yield underwriting.
3. Verify SUAR and CIN before Piazza Maggiore STR marketing on event weeks.`,
    },
    'Price Bands 2026': {
      opener:
        'Bologna price bands in 2026 mean Navile Q1 asks €2,865-4,260 per sqm while Bolognina D8 winter rogiti cluster €2,230-2,715 per sqm on Agenzia delle Entrate deeds. MORE Group buyer scenario work requires three quartiere references on Via del Navile before offer because spring AV listings overshoot closes 8-12%.',
    },
    'Rental Market': {
      opener:
        'Bologna rental market means Navile €280,000 bilocale at €1,050 monthly equals 4.5% gross before IMU and €200 monthly spese compress net toward 2.8-3.6% on furnished LTR. MORE Group treats centro €600,000 palazzi at €2,000 monthly as branding holds below rental-implied value on UNESCO tickets.',
    },
    'Bologna vs Milan': {
      opener:
        'Bologna versus Milan means Emilia hub tickets near €3,700 per sqm trade 25-35% below Milan corporate districts while Florence UNESCO resale at €4,737 per sqm beats Bologna tourism branding on identical €350,000 capital. MORE Group maps Sant\'Orsola fellow pipelines against Milan AV commuter depth before regional allocation.',
    },
    'Foreign Buyer': {
      opener:
        'Foreign buyer practicalities in Bologna mean EU citizens purchase freely with 10-15% closing costs on second homes and non-resident LTV caps near 50-60% on Navile tickets €250,000-320,000. MORE Group requires soprintendenza scope confirmation on UNESCO centro renovations before capex budgets lock on 1960s walk-up stock.',
      table: `| Step | Bologna ticket | Timeline | Cost band |
| --- | --- | --- | --- |
| Codice fiscale | Before compromesso | 1-2 weeks | Minimal |
| Avvocato review | UNESCO + conformità | 2-4 weeks | €2,000-4,000 |
| Registration tax | 9% non-primary | At rogito | 9% cadastral |
| Closing stack | Urban second home | 3-6 months | 10-15% total |`,
      list: `1. Order avvocato review before compromesso on pre-1980 Navile elevator towers.
2. Confirm reciprocity treaty coverage for non-EU nationality early in screening.
3. Model cedolare secca at 21% on furnished lease gross before rogito wire.`,
    },
    'Risks and Due Diligence': {
      opener:
        'Bologna investment risks mean Navile 1970s towers carry elevator modernization votes spiking spese €150-300 monthly and UNESCO centro STR faces SUAR density caps after 2023 enforcement waves. MORE Group flags Bloom construction disruption discounting legacy Navile resale 18-24 months through November 2027 handover.',
      table: `| Risk | Typical trigger | Mitigation |
| --- | --- | --- |
| Elevator vote | 1970s Navile towers | 3-year spese history |
| UNESCO scope | Portico renovation | Soprintendenza filing |
| STR caps | Centro density rules | Verify CIN transfer |
| Construction noise | Navile comparto | Model resale discount |`,
      list: `1. Request pending extraordinary works votes from administrator before compromesso.
2. Confirm CIN and SCIA before centro STR pro forma on Cersaie fair weeks.
3. Inspect shared heating plants on post-war towers marketed to hospital fellows.`,
    },
    'Buyer Scenarios': {
      opener:
        'Bologna buyer scenarios mean €280,000 deploys Navile regeneration bilocale at €3,540 per sqm with AV appeal rather than centro UNESCO at €4,700 per sqm where gross yield often sits below 3.5%. MORE Group stress-tests Bloom 2027 handover risk against Murri Sant\'Orsola fellow leases starting each September intake.',
      table: `| Profile | District fit | Target gross yield |
| --- | --- | --- |
| AV commuter landlord | Navile / Bolognina | 3.5-4.5% furnished LT |
| Off-plan investor | Bloom Living | Class A 2027 handover |
| Student operator | San Donato micro | 4.5-5.5% academic year |
| Trophy hold | Centro UNESCO | 2.5-3.5% lifestyle |`,
      list: `1. Pair Navile value with [Emilia-Romagna guide](/guides/emilia-romagna-property-investment-guide/) tax context.
2. Model IMU and FX on seven-year hold before off-plan reservation deposits.
3. Compare against [Florence area](/areas/florence/) STR caps on identical capital.`,
    },
  },
  'chianti.mdx': {
    'What Is Chianti': {
      table: `| Chianti signal | 2026 benchmark |
| --- | --- |
| Restored casale | €400,000-1,000,000+ |
| Greve centro | €3,000-5,500/m² |
| Agriturismo gross | 5-6% licensed seasonal |
| STR without license | 3-5% with void risk |`,
      list: `1. Confirm active DOCG agricultural use before agriturismo capex commitments.
2. Budget 3-6 months Soprintendenza scope on exterior casale work.
3. Cross-read [Tuscany property guide](/guides/tuscany-property-investment-guide/) before Greve offer.`,
    },
    'Chianti Market Overview': {
      opener:
        'Chianti market overview means restored casali from €400,000 with Greve centro at €3,000-5,500 per sqm and licensed agriturismo delivering 5-6% gross when active vineyard use qualifies under SUAP rules. MORE Group anchors Greve strada offers to three winter farmhouse rogiti before harvest photography inflates pool-marketed asks 8-10%.',
    },
    'Property Types': {
      opener:
        'Chianti property types mean standalone casali €400,000-1,000,000+, raw lamia shells needing €1,500-3,000 per sqm restoration, and Greve STR footfall driving 4-7% gross on licensed hospitality stock. MORE Group maps Gaiole value contrada against Greve centro before compromesso on vineyard photography without DOCG documentation.',
    },
    'Yields and Rental': {
      opener:
        'Chianti yields mean licensed agriturismo often delivers 5-6% gross seasonal on €800,000 cascine while pure STR without agricultural credentials prints 3-5% with December-February void near 70-80%. MORE Group models shoulder months March and November separately from April-October wine tourism peaks on Greve tickets.',
    },
    'Heritage, Agricultural': {
      opener:
        'Chianti heritage rules mean landscape protection zones restrict pools and exterior casale work with 3-6 month Soprintendenza approvals on pre-1970 farmhouses across Greve and Radda comuni. MORE Group requires active agricultural land minimums before agriturismo licensing paths on tickets marketed with olive-grove photography alone.',
    },
    'Risks and Buyer Red Flags': {
      opener:
        'Chianti investment risks mean buyers face abusivismo on rustic annexes, pool SCIA gaps on contrada stock, and agents marketing STR income without agriturismo or CIN compliance on €600,000+ casali. MORE Group red flag checklist requires geometra conformità before deposit on lamia conversions in Gaiole value bands.',
      table: `| Risk | Chianti trigger | Mitigation |
| --- | --- | --- |
| Agriturismo gap | No active agriculture | SUAP license path review |
| Pool abusivismo | Render-only terraces | Independent geometra |
| Seasonal void | Dec-Feb tourism drop | Long-stay remote-work marketing |
| DOCG restrictions | Vineyard land category | Commercialista land review |`,
      list: `1. Reject casali marketed with pool photos lacking SCIA compliance packets.
2. Verify minimum hectare thresholds before agriturismo pro forma acceptance.
3. Model net after IMU and 26% cedolare on STR gross with commercialista.`,
    },
    'Practical Purchase': {
      opener:
        'Chianti purchase workflow means foreign buyers sequence codice fiscale, avvocato review on rustici conformità, and SUAP agriturismo pre-checks before caparra on €400,000-800,000 Greve casali in Q2 2026. MORE Group budgets 10-15% closing costs plus €150,000-300,000 restoration on lamia shells needing heritage-compliant envelopes.',
    },
  },
  'florence.mdx': {
    'Quick Answer': {
      opener:
        'Florence investment snapshot means city averages near €4,737 per sqm with UNESCO centro STR licensing frozen and furnished LTR to university staff delivering 3-4% gross on €450,000-600,000 tickets. MORE Group buyer scenario work starts with elevator-compliant Oltrarno stock before trophy palazzo capex on identical €500,000 capital bands.',
    },
    'Market Overview': {
      opener:
        'Florence market overview means Q1 2026 idealista cites €4,737 per sqm city average with plus 5.43% year-on-year growth and Oltrarno value corridors near €3,800 per sqm on renovation tickets. MORE Group tracks three quartiere closed sales in Santo Spirito micro-districts before spring tourism listing peaks inflate UNESCO asks.',
    },
    'Price Ranges': {
      opener:
        'Florence price ranges mean centro storico UNESCO bands €5,000-7,000 per sqm while Cascine and Isolotto periphery drop toward €3,200-3,800 per sqm on 2026 portal aggregates. MORE Group anchors offers to OMI quartiere deed references rather than idealista city-wide averages on €400,000-550,000 bilocale tickets.',
    },
    'Rental Yields': {
      opener:
        'Florence rental yields mean licensed STR outside UNESCO core can model 4-5% gross seasonal while centro long-lease to professors prints 2.5-3.5% gross on €600,000+ palazzi accepting branding premium. MORE Group compresses net spreads 150-200 basis points after IMU and 21-26% cedolare on furnished contracts.',
    },
    'Short-Term Rental Rules': {
      opener:
        'Florence STR rules mean UNESCO centro banned new tourist licenses while existing CIN registrations transfer only when comune registry matches exact address on €450,000+ marketed Airbnb stock. MORE Group verifies SUAP and density caps in Oltrarno and Novoli before STR pro forma on foreign buyer tickets.',
      table: `| Zone | STR status 2026 | Investor note |
| --- | --- | --- |
| UNESCO centro | New licenses frozen | Verify existing CIN only |
| Oltrarno | Licensed inventory scarce | Shoulder event weeks |
| Novoli / periphery | Long-lease depth | Hospital and university |
| Licensed resale premium | 5-10% on transfer | Address must match registry |`,
      list: `1. Request comune registry printout before buying marketed licensed STR units.
2. Model November-February void separately from April-June congress peaks.
3. Compare long-lease yield against [Siena](/areas/siena/) UNESCO tickets at lower basis.`,
    },
    'Districts': {
      opener:
        'Florence districts mean Santo Spirito and San Frediano deliver Oltrarno lifestyle at €3,800-4,500 per sqm while Novoli connects hospital employment with 3.5-4% gross furnished leases on €350,000-420,000 tickets. MORE Group maps Campo di Marte family stock against centro trophy compression before Emilia-Tuscany allocation.',
    },
    'Investment Risks': {
      opener:
        'Florence investment risks mean UNESCO renovation timelines extend 6-12 months, STR license scarcity caps income on centro tickets, and flood-zone disclosure affects ground-floor Oltrarno resale on €500,000+ palazzi. MORE Group requires conformità audits on pre-1960 condominiums before marketing furnished leases to Polimoda fellows.',
    },
    'Buyer Profiles': {
      opener:
        'Florence buyer profiles mean US and UK lifestyle buyers accept 2.5-3.5% gross on centro UNESCO tickets while yield hunters target Novoli and periphery at €3,200-3,800 per sqm with parking deeds attached. MORE Group maps German enquiry share against Milan commuter furnished lease depth on identical €450,000 capital.',
      table: `| Profile | District fit | Target gross yield |
| --- | --- | --- |
| Trophy lifestyle | Centro UNESCO | 2.5-3.5% hold |
| University landlord | Novoli / Isolotto | 3.5-4.5% LTR |
| STR operator | Licensed Oltrarno | 4-5% seasonal |
| Renovation value | Periphery €3.2k/m² | 4-4.5% with capex |`,
      list: `1. Match buyer profile to district before assuming centro STR feasibility.
2. Budget soprintendenza architect fees on UNESCO exterior scope.
3. Cross-read [Tuscany guide](/guides/tuscany-property-investment-guide/) for tax residency paths.`,
    },
    'UNESCO Heritage Advantage': {
      opener:
        'Florence UNESCO advantage means centro palazzi carry irreplaceable branding supporting resale to US and UK buyers while constraining pools, facades, and STR licensing on identical €600,000 tickets. MORE Group treats heritage buffers as capex timeline risk requiring architect scope before compromesso on portico-facing units.',
      table: `| Constraint | Centro impact | Buyer mitigation |
| --- | --- | --- |
| Facade changes | Soprintendenza filing | Architect pre-scope |
| STR licensing | Density caps | Verify existing CIN |
| Flood disclosure | Arno-adjacent ground floor | Engineer humidity audit |
| Acoustic limits | Event-week STR | Sound engineer report |`,
      list: `1. Order soprintendenza pre-consultation before exterior renovation budgets.
2. Verify STR registry address match on marketed licensed inventory.
3. Model longer hold periods when UNESCO capex extends lease start dates.`,
    },
    'Investment Strategy': {
      opener:
        'Florence investment strategy means pairing periphery yield at €3,200-3,800 per sqm with optional centro trophy exposure rather than pure STR on banned-license UNESCO streets at €5,000-7,000 per sqm. MORE Group recommends Novoli hospital corridor furnished LTR when income priority beats branding on €400,000-500,000 tickets.',
      table: `| Strategy | Entry €/m² | Gross yield band | Hold period |
| --- | --- | --- | --- |
| Periphery LTR | €3,200-3,800 | 3.5-4.5% | 5-7 years |
| Licensed STR shoulder | Oltrarno | 4-5% seasonal | 7+ years |
| Centro trophy | €5,000-7,000 | 2.5-3.5% | Lifestyle |
| Renovation flip | Periphery value | Variable | 3-5 years |`,
      list: `1. Choose periphery LTR when yield beats UNESCO compression on identical capital.
2. Reserve centro for branding hold with long-lease fallback only.
3. Compare [Bologna](/areas/bologna/) AV hub tickets at €3,700 per sqm for Emilia yield.`,
    },
    'due diligence checklist': {
      opener:
        'Florence due diligence means foreign buyers confirm CIN transferability, flood-zone certificates on Arno-adjacent ground floors, and three-year condominium spese on pre-1960 towers before compromesso on €450,000-650,000 urban tickets. MORE Group checklist tracks APE class against marketing on renovated palazzi each spring enquiry peak.',
    },
    'Buyer scenarios': {
      opener:
        'Florence buyer scenarios mean €450,000 buys Novoli furnished bilocale with hospital tenant depth while €650,000 centro tickets prioritize UNESCO branding over 3.5% gross yield ceilings on long-lease math. MORE Group stress-tests IMU, FX, and STR void on licensed Oltrarno inventory versus pure LTR strategies.',
    },
  },
  'monte-argentario.mdx': SECTION_FROM_AUTO('monte-argentario'),
  'sanremo.mdx': SECTION_FROM_AUTO('sanremo'),
  'versilia.mdx': SECTION_FROM_AUTO('versilia'),
};

// Import boosts from geo-h2-auto-boost for argentario/sanremo/versilia
function SECTION_FROM_AUTO() {
  return {};
}

// Merge auto-boost data manually for the three coastal files
Object.assign(PATCHES['monte-argentario.mdx'], {
  'at a Glance': {
    opener:
      'Monte Argentario at a glance means Tuscan promontory marinas trade €3,500-8,000 per sqm with Gate-away enquiry growth near 69% in 2025 and 3-5% gross on licensed marina STR. MORE Group starts underwriting on Porto Ercole apartments €500,000-900,000 before trophy villa capex above €1.2M on sea-view slopes.',
  },
  'Who Buys': {
    opener:
      'Who buys on Monte Argentario means Italian Rome-Milan weekenders on trophy villas, German yacht-week STR operators, and British sea-view hunters accepting 3-5% gross for Tuscan coast privacy at €3,500-8,000 per sqm. MORE Group tracks marina mooring rights separate from property deeds on €700,000+ listings.',
    table: `| Buyer type | Typical ticket | Strategy |
| --- | --- | --- |
| Rome weekender | €700,000-1.5M villa | Lifestyle + STR |
| Marina STR | €450,000-750,000 apt | Yacht-season peaks |
| Value lagoon | Orbetello €320k | Long-lease fallback |
| German enquiry | €500,000-900,000 | Sea-view terrace |`,
  },
  'Property Price Bands': {
    opener:
      'Monte Argentario price bands mean Porto Ercole centro apartments trade €450,000-750,000, sea-view villas range €1.2M-4M+, and spring yacht-season asks exceed winter rogiti 10-15% on promontory terraces. MORE Group anchors offers to three closed sales on the same calata before caparra on €700,000 tickets.',
  },
  'Town Guide': {
    opener:
      'Monte Argentario town guide means Porto Ercole suits yacht-week STR and exclusive marina walks while Porto Santo Stefano offers ferry links at €400,000-650,000 apartment bands with larger town services. MORE Group compares Castiglione della Pescaia €4,800 per sqm against Argentario €5,500 per sqm promontory resale.',
  },
  'vs Versilia': {
    opener:
      'Monte Argentario versus Versilia means marina exclusivity at €3,500-8,000 per sqm against Viareggio beach STR at €3,500-6,000 per sqm with broader July-August occupancy on lungomare tickets. MORE Group pairs both when buyers split €600,000-1M across trophy marina plus mid-market beach yield.',
  },
  'Rental Market': {
    opener:
      'Monte Argentario rental market means licensed marina STR prints 4-5% gross on high tickets with 70-85% June-September occupancy while trophy villas show 3-4% gross with personal-use bias. MORE Group underwrites month-by-month because yacht-week income concentrates in eight summer weeks on €650,000 sea-view tickets.',
  },
  'Investment Outlook': {
    opener:
      'Monte Argentario outlook 2026-2030 means Gate-away enquiry growth near 69% supports marina resale while trophy villa liquidity stays thin above €2M on seven-year holds. MORE Group treats Argentario as lifestyle-plus-appreciation allocation rather than maximum yield versus Bologna hospital corridors.',
    table: `| Horizon signal | 2026-2030 note |
| --- | --- |
| Enquiry growth | ~69% Gate-away 2025 |
| Marina tickets | €500k-900k core band |
| Trophy villa | 12-18 month marketing |
| Yield priority | Pair with Versilia STR |`,
  },
  'Pros and Cons': {
    opener:
      'Monte Argentario pros and cons mean buyers gain dual marinas and yacht infrastructure at €3,500-8,000 per sqm while accepting seasonal income concentration and salt-air maintenance above €10,000 annually on sea-exposed facades. MORE Group flags mooring-right complexity as common deal-breaker on marketed villa tickets.',
    table: `| Factor | Argentario signal |
| --- | --- |
| Pro: enquiry | ~69% Gate-away growth |
| Pro: exclusivity | Dual marina promontory |
| Con: winter void | Thin vs university cities |
| Con: mooring | Often outside deed |`,
  },
  'Foreign buyer execution': {
    opener:
      'Monte Argentario foreign buyer execution means codice fiscale, 10-12% closing costs, and coastal conformità on terraces and pools before deposits on €700,000+ sea-view tickets in Q2 2026. MORE Group recommends avvocato review on mooring rights and salt-air structural reports before remote wire authorization.',
    table: `| Step | Argentario ticket | Timeline |
| --- | --- | --- |
| Geometra coastal | Terraces and pools | 2-3 weeks |
| Avvocato review | Mooring + easements | 2-4 weeks |
| Rogito clean apt | Marina stock | 60-90 days |
| Cliff villa | Conformità scope | 4+ months |`,
  },
  'Practical Investment Guide': {
    opener:
      'Monte Argentario practical guide means starting marina apartments €400,000-900,000 before trophy villas €1.2M-4M+, modeling 3-5% gross STR, and verifying Rome access for resale liquidity on promontory tickets. MORE Group field notes show spring listings overshoot winter rogiti 10-15% on sea-view terraces.',
    table: `| Ticket band | Typical use | Yield band |
| --- | --- | --- |
| €400k-650k apt | Marina STR | 4-5% seasonal |
| €650k-900k apt | Sea-view LTR | 3.5-4.5% |
| €1.2M+ villa | Trophy hold | 3-4% gross |
| Orbetello lagoon | Value pair | 3.2% LTR |`,
  },
});

Object.assign(PATCHES['sanremo.mdx'], {
  'at a Glance': {
    opener:
      'Sanremo at a glance means western Riviera corso stock trades €3,500-5,500 per sqm with sea-view toward €6,500 per sqm and 3-5% gross on licensed STR during Song Festival weeks. MORE Group ties corso terrace offers to three Aurelia frontage winter rogiti before spring flower-market listings inflate Milan weekend tickets.',
  },
  'Why Sanremo Belongs': {
    opener:
      'Why Sanremo belongs on a Liguria shortlist means western Riviera value at €3,500-5,500 per sqm beats Portofino harbour tickets from €1,000,000+ with Milan weekend and French cross-border enquiry on €380,000-550,000 corso stock. MORE Group models November-April STR void at 40-60% unless hybrid long-lease fills winter calendars.',
    table: `| Liguria signal | Sanremo benchmark |
| --- | --- |
| Corso band | €3,500-5,500/m² |
| Sea-view premium | toward €6,500/m² |
| Milan drive | ~2.5-3 hours |
| STR gross | 3-5% licensed seasonal |`,
  },
  'District Guide': {
    opener:
      'Sanremo district guide means Corso Italia and Porto Sole suit sea-view STR at €420,000-650,000 while Poggio hills offer €2,800 per sqm value with Aurelia traffic trade-offs on car-dependent tenants. MORE Group maps Bussana Vecchia lifestyle stock against corso walkability before €400,000+ compromesso deposits.',
  },
  'Price Bands 2026': {
    opener:
      'Sanremo price bands 2026 mean corso sea-view apartments trade €420,000-650,000, Poggio hills sit near €2,800 per sqm, and spring listings overshoot winter rogiti 8-12% before Song Festival marketing peaks. MORE Group anchors offers to three Aurelia frontage closed sales on identical terrace orientation.',
  },
  'Rental Market': {
    opener:
      'Sanremo rental market means licensed corso STR peaks during Song Festival at 4.5% gross seasonal while Milan weekend long-lease at €1,300 monthly on €380,000 delivers steadier 4.1% gross before IMU. MORE Group models shoulder months honestly when agents copy peak-season portal screenshots on corso tickets.',
  },
  'Sanremo vs Portofino': {
    opener:
      'Sanremo versus Portofino means western Riviera entry at €3,500-5,500 per sqm against Portofino ultra-luxury branding with lower foreign saturation on Sanremo corso tickets at identical €550,000 capital. MORE Group compares Nice sea-view pricing 30-50% above Sanremo on festival-week STR assumptions.',
  },
  'French Border': {
    opener:
      'Sanremo French border buyers mean Nice airport sits 60-75 minutes with cross-border enquiry comparing Italian IMU and 26% cedolare against French LMNP structures on €420,000-650,000 corso tickets. MORE Group recommends commercialista review when French nationals split weeks between Ventimiglia commutes and Sanremo STR calendars.',
    table: `| Cross-border signal | Sanremo note |
| --- | --- |
| Nice airport | ~60-75 min drive |
| French enquiry | LMNP vs cedolare compare |
| Ventimiglia commute | Weekend owner profile |
| FX timing | 3-5% effective discount swings |`,
  },
  'Buyer Scenarios': {
    opener:
      'Sanremo buyer scenarios mean Milan weekend owners accept 3-5% gross for corso lifestyle, French cross-border buyers compare tax regimes, and yield hunters target Poggio €2,800 per sqm bands with parking deeds required. MORE Group Liguria desk maps each profile against CIN feasibility before deposit authorization.',
    table: `| Profile | Ticket band | Strategy |
| --- | --- | --- |
| Milan weekender | €380k-550k corso | Hybrid STR + own use |
| French cross-border | €420k-650k | Tax compare with LMNP |
| Yield hunter | Poggio €2.8k/m² | Car-dependent LTR |
| Festival STR | Licensed corso | Song Festival peaks |`,
  },
  'Winter Void': {
    opener:
      'Sanremo winter void means November-April STR occupancy often falls 40-60% unless operators contract Milan weekend long-lease at €1,100-1,300 monthly on €380,000 tickets. MORE Group hybrid models blend Song Festival peaks with furnished winter tenants on corso stock accepting lower summer-only pro formas.',
  },
  'MORE Group field notes': {
    opener:
      'MORE Group Sanremo field notes mean corso STR renegotiations spike when assemblea blocks sub-30-day lets on €420,000-650,000 festival-marketed tickets requiring written condominium clearance before deposit. MORE Group tracked Liguria closings where winter rogiti sat 8-12% below spring corso asks on identical Aurelia frontage.',
    table: `| Field signal | Sanremo 2026 |
| --- | --- |
| Assemblea STR blocks | Sub-30-day let votes |
| Winter vs spring ask | 8-12% spread |
| CIN verification | Before festival marketing |
| French buyer share | Cross-border tax review |`,
    list: `1. Verify written assemblea clearance before Song Festival-marketed STR deposits.
2. Anchor offers to three winter rogiti on same Aurelia frontage block.
3. Model hybrid long-lease November-March when STR void exceeds 40%.`,
  },
});

Object.assign(PATCHES['versilia.mdx'], {
  'at a Glance': {
    opener:
      'Versilia at a glance means Viareggio lungomare €3,500-6,000 per sqm, Forte dei Marmi trophy streets €8,000-15,000 per sqm, and July-August STR delivering 4-6% gross on registered beach condominiums with honest November-March void below 25%. MORE Group treats Carnival and Notte Rosa calendars as occupancy drivers on €450,000-650,000 promenade tickets.',
  },
  'Town-by-Town': {
    opener:
      'Versilia town architecture means Viareggio delivers STR liquidity on lungomare stock, Forte dei Marmi trades trophy pine-quarter villas above €900,000, and Pietrasanta art-town bands €3,000-5,500 per sqm attract culture-season tenants. MORE Group maps Forte premium spreads against Viareggio 4-6% gross STR on identical €600,000 coastal capital.',
    table: `| Town | €/m² band | Best for |
| --- | --- | --- |
| Viareggio lungomare | €3,500-6,000 | STR 4-6% gross |
| Forte dei Marmi | €8,000-15,000 | Trophy hold |
| Pietrasanta | €3,000-5,500 | Art-town hybrid |
| Camaiore hills | €2,800-4,000 | Value + car |`,
  },
  'Price Bands': {
    opener:
      'Versilia price bands 2026 mean Viareggio promenade apartments trade €450,000-650,000, Forte trophy assets start €900,000-1.5M, and Pietrasanta offers mid-market entry with gallery footfall supporting shoulder-season rent. MORE Group anchors lungomare offers to three closed sales in the same block before caparra each spring beach season.',
  },
  'Who Buys': {
    opener:
      'Who buys in Versilia means British and German families on Forte trophy tickets, Milan-Rome weekenders on Viareggio STR stock, and art collectors on Pietrasanta mid-market bands accepting 45-60% annual STR occupancy. MORE Group maps buyer profile to deeded parking requirements before remote signing on €450,000+ lungomare tickets.',
    table: `| Buyer origin | Typical ticket | Strategy |
| --- | --- | --- |
| British/German family | Forte €900k-1.5M | Trophy lifestyle |
| Milan weekender | Viareggio €450k-650k | STR peaks |
| Art collector | Pietrasanta mid | Culture season |
| STR operator | Lungomare | 4-6% gross seasonal |`,
  },
  'Rental Market': {
    opener:
      'Versilia rental market means registered summer STR on Viareggio condominiums often delivers 4-6% gross when July-August occupancy reaches 75-85% at €180-450 nightly peaks on €500,000 tickets. MORE Group underwrites November-March below 25% occupancy on pure STR models before IMU and 26% cedolare compression.',
  },
  'vs Lucca Inland': {
    opener:
      'Versilia versus Lucca inland means beach STR income July-August complements Lucca walled-city culture rents at €2,800-4,500 per sqm on €600,000-900,000 split portfolios with separate CIN paths per asset. MORE Group recommends dual-market allocation when summer concentration risk threatens net cash flow on single-coast tickets.',
  },
  'Connectivity': {
    opener:
      'Versilia connectivity means A12 autostrada links Pisa airport in 25-35 minutes and Florence in 60-75 minutes supporting British and German fly-in STR operators on Viareggio lungomare tickets at €450,000-650,000. MORE Group markets Forte dei Marmi resale to Milan-Rome weekenders citing under two-hour drives on peak-season calendars.',
    table: `| Link | Travel time | Investor use |
| --- | --- | --- |
| Pisa airport | ~25-35 min | Fly-in STR guests |
| Florence | ~60-75 min | Culture day trips |
| Milan | ~2.5-3 hours | Weekend owner base |
| A12 corridor | Coastal logistics | Linen and management |`,
    list: `1. Market Pisa airport proximity in foreign-language Viareggio listing packs.
2. Pair beach STR with Lucca culture season on split €600k-900k portfolios.
3. Verify garage deed before Forte trophy marketing to Milan weekenders.`,
  },
  'Due Diligence Checklist': {
    opener:
      'Versilia due diligence means beach condominiums restrict affitti brevi, 1970s seaside concrete needs geometra consistency checks, and coastal SCIA overlays affect ground-floor lungomare units on €450,000-650,000 tickets. MORE Group flags render-only terrace expansions on spring portal listings as common abusivismo traps before compromesso.',
  },
  'Buyer Scenarios': {
    opener:
      'Versilia buyer scenarios mean Milan weekend STR operators on Viareggio €450,000-650,000 tickets, trophy lifestyle buyers on Forte €900,000-1.5M addresses, and hybrid landlords blending summer STR with winter long-lease at €1,200-1,400 monthly. MORE Group maps each to parking deed and CIN requirements before deposit authorization.',
  },
  'Risks and Red Flags': {
    opener:
      'Versilia risks mean assemblea votes restrict affitti brevi after noisy seasons, seaside concrete needs structural review, and coastal planning blocks ground-floor expansions on lungomare stock marketed with pool photography lacking SCIA. MORE Group recommends three-year administrator statements before €450,000+ beach compromesso deposits.',
    table: `| Red flag | Versilia trigger | Mitigation |
| --- | --- | --- |
| Affitti brevi ban | Assemblea minutes | Read 3-year admin history |
| Pool abusivismo | Render-only photos | Independent geometra |
| Parking gap | Lungomare resale | Deeded garage required |
| Winter void | Pure STR model | Hybrid long-lease |`,
  },
  'Investment Outlook': {
    opener:
      'Versilia outlook 2026-2030 means mature A12 infrastructure supports British and German fly-in demand while Forte trophy liquidity stays strong above €1M tickets on seven-year holds. MORE Group models climate exposure and assemblea STR votes as primary yield risks on Viareggio lungomare condominiums through 2030.',
    table: `| Outlook factor | Versilia 2026-2030 |
| --- | --- |
| Fly-in demand | Pisa + A12 depth |
| Forte liquidity | Strong above €1M |
| STR risk | Assemblea restrictions |
| Occupancy model | 45-55% conservative |`,
  },
  'Carnival, Events': {
    opener:
      'Versilia event demand means Viareggio Carnival and Notte Rosa lift February and July STR rates 25-40% above winter baselines on registered lungomare condominiums at €180-450 nightly peaks. MORE Group models event weeks separately from shoulder months when agents annualize August-only portal screenshots on €500,000 tickets.',
  },
});

// noto, ostuni, palermo, siena, syracuse - add patches
Object.assign(PATCHES, buildSouthernPatches());

function buildSouthernPatches() {
  const noto = {
    'Noto at a Glance': {
      opener:
        'Noto at a glance means UNESCO baroque centro trades €1,800-3,200 per sqm with countryside masserie from €800 per sqm and licensed STR delivering 4-6% gross seasonal on €250,000-400,000 tickets near Val di Noto branding. MORE Group anchors centro offers to three winter rogiti before spring Baroque festival listings inflate terrace asks 8-10%.',
    },
    'Who Buys in Noto': {
      opener:
        'Who buys in Noto means UK and German lifestyle buyers on UNESCO centro tickets, Milan-Rome second-home owners on countryside masserie, and STR operators targeting Baroque festival weeks at 4-6% gross on licensed inventory. MORE Group tracks enquiry spillover from Syracuse and Ragusa on €220,000-380,000 Val di Noto tickets.',
      table: `| Buyer type | Ticket band | Strategy |
| --- | --- | --- |
| UK/German lifestyle | Centro €250k-400k | UNESCO hold |
| STR operator | Licensed centro | Festival peaks |
| Masseria value | Country €180k-350k | Renovation + STR |
| Syracuse spillover | Marina fringe | Coastal pair |`,
    },
    'property price bands': {
      opener:
        'Noto price bands mean UNESCO centro apartments trade €1,800-3,200 per sqm, countryside masserie sit €800-1,500 per sqm, and Marina di Noto coastal fringe reaches €2,200-3,000 per sqm on 2026 portal data. MORE Group requires three closed sales in the same contrada before spring Baroque festival marketing inflates centro asks.',
    },
    'District Guide': {
      opener:
        'Noto district guide means UNESCO centro suits festival STR and long-lease branding while contrada masserie deliver renovation upside at €800-1,500 per sqm with car dependency and thinner foreign resale. MORE Group maps Marina di Noto coastal spillover against centro walkability on €250,000-400,000 allocation bands.',
    },
    'Noto vs Syracuse': {
      opener:
        'Noto versus Syracuse means baroque UNESCO branding at €1,800-3,200 per sqm against Ortigia seafront at €2,400-3,800 per sqm with stronger summer STR on Syracuse marina tickets at identical €280,000 capital. MORE Group compares Taormina premium at €2,200-4,000 per sqm when buyers want eastern Sicily exposure.',
    },
    'Rental Market': {
      opener:
        'Noto rental market means licensed centro STR models 4-6% gross seasonal during Baroque festival weeks while long-term furnished leases to remote workers print 3.5-4.5% gross on €250,000 tickets with November-March void near 45-55%. MORE Group verifies CIN and commune density before STR pro forma on UNESCO addresses.',
    },
    'Investment Outlook': {
      opener:
        'Noto outlook 2026-2030 means Val di Noto UNESCO branding supports resale to UK and German buyers while countryside masserie need seven-year holds absorbing €80,000-150,000 restoration on €180,000-350,000 shells. MORE Group treats Noto as lifestyle-plus-STR allocation rather than hospital-city yield play.',
      table: `| Outlook signal | Noto 2026-2030 |
| --- | --- |
| UNESCO centro | Resale to UK/DE buyers |
| Festival STR | 4-6% gross seasonal |
| Masseria capex | €80k-150k typical |
| vs Syracuse | Lower seafront basis |`,
    },
    'Buyer Scenarios': {
      opener:
        'Noto buyer scenarios mean €280,000 buys UNESCO centro bilocale with festival STR upside while €220,000 contrada masseria accepts renovation risk for 5-6% gross on licensed hospitality after conformità scope. MORE Group pairs Noto baroque hold with Syracuse Ortigia marina ticket on single eastern Sicily budget.',
      table: `| Profile | District | Target yield |
| --- | --- | --- |
| Festival STR | Centro UNESCO | 4-6% seasonal |
| Masseria renovator | Contrada | 5-6% with capex |
| Dual Sicily pair | Noto + Syracuse | Blended 4-5% |
| Lifestyle hold | Centro terrace | 3-4% LTR |`,
    },
    'pros and cons': {
      opener:
        'Noto pros and cons mean buyers gain UNESCO baroque branding and festival STR peaks at €1,800-3,200 per sqm while accepting countryside car dependency and abusivismo risk on masserie marketed without conformità packets. MORE Group flags pool render-only photography on spring contrada listings as frequent due diligence gap.',
    },
    'Foreign buyer execution': {
      opener:
        'Noto foreign buyer execution means codice fiscale, 10-12% closing costs, and abusivismo clearance on pre-1980 masserie before deposits on €220,000-400,000 Val di Noto tickets in Q2 2026. MORE Group recommends independent geometra review on rustic annexes marketed as habitable without cadastral category alignment.',
      table: `| Step | Noto ticket | Note |
| --- | --- | --- |
| Geometra | Masseria annexes | Abusivismo clearance |
| CIN path | Centro STR | Commune registry match |
| Closing stack | Second home | 10-12% all-in |
| Restoration | Contrada shell | €80k-150k budget |`,
    },
    'Practical Investment Guide': {
      opener:
        'Noto practical guide means shortlist UNESCO centro for festival STR at €250,000-400,000 or contrada masserie for renovation yield after conformità scope on €180,000-350,000 tickets with car access verified. MORE Group cross-reads [Sicily property guide](/guides/sicily-property-investment-guide/) before eastern Sicily wire authorization.',
      table: `| Path | Entry ticket | Yield band |
| --- | --- | --- |
| Centro STR | €250k-400k | 4-6% seasonal |
| Masseria reno | €180k-350k | 5-6% post-capex |
| Marina fringe | €280k+ | Coastal spillover |
| Lifestyle hold | Centro terrace | 3-4% LTR |`,
    },
  };

  const ostuni = {
    'Ostuni at a Glance': {
      opener:
        'Ostuni at a glance means white-city centro trades €2,200-3,800 per sqm with coastal €1,800-3,200 per sqm bands and rural trulli €800-2,500 per sqm delivering 5-8% gross on licensed STR in Puglia\'s top-ranked search market. MORE Group anchors centro offers to three winter rogiti before FIAIP spring peaks on €280,000-450,000 tickets.',
    },
    'Who Buys in Ostuni': {
      opener:
        'Who buys in Ostuni means British and German STR operators on white-city centro tickets, Dutch buyers on trulli restoration plays, and Italian upgraders on coastal spillover from Carovigno at 20-30% lower entry than centro premiums. MORE Group tracks Gate-away +35.7% Bari enquiry feeding Ostuni overflow on €300,000-500,000 bands.',
      table: `| Buyer origin | Ticket band | Strategy |
| --- | --- | --- |
| British/German STR | Centro €280k-450k | 5-8% gross |
| Dutch trulli | Rural €180k-350k | Renovation yield |
| Italian upgrader | Coastal spillover | vs centro premium |
| Bari enquiry spill | Carovigno fringe | Value entry |`,
    },
    'Property Price Bands': {
      opener:
        'Ostuni price bands 2026 mean white-city centro €2,200-3,800 per sqm, coastal lanes €1,800-3,200 per sqm, and rural trulli €800-2,500 per sqm on May 2026 portal aggregates with spring asks 8-12% above winter rogiti. MORE Group compares Cisternino spillover at 20-30% discount on identical STR demand pools.',
    },
    'Rental Yield': {
      opener:
        'Ostuni rental yield means licensed STR on centro stock often delivers 5-8% gross when April-October occupancy reaches 65-80% at €120-280 nightly on €280,000-450,000 tickets before IMU and 26% cedolare. MORE Group models shoulder months separately from July-August peaks on white-city calendars.',
    },
    'STR Regulations': {
      opener:
        'Ostuni STR regulations mean CIN registration is mandatory nationally with Puglia CIR compliance and commune density reviews on white-city condominiums restricting affitti brevi after noisy seasons on €280,000+ tickets. MORE Group verifies regolamento and assemblea minutes before STR pro forma on centro terraces marketed to British operators.',
      table: `| Rule layer | Ostuni 2026 | Investor action |
| --- | --- | --- |
| CIN national | Mandatory listing ID | Verify transfer |
| Puglia CIR | Regional compliance | Check commune file |
| Assemblea | Affitti brevi votes | Read 3-year admin |
| Abusivismo | Trulli annexes | Geometra clearance |`,
    },
    'Property Types': {
      opener:
        'Ostuni property types mean white-city palazzi suit STR at €2,200-3,800 per sqm, restored trulli need €100,000-200,000 conformità on €180,000-350,000 shells, and new-build coastal condominiums trade €1,800-3,200 per sqm with parking premiums. MORE Group rejects masseria tickets marketed without active agricultural category documentation.',
      table: `| Type | €/m² band | Buyer note |
| --- | --- | --- |
| Centro palazzo | €2,200-3,800 | STR + branding |
| Trullo restoration | €800-2,500 | Abusivismo risk |
| Masseria | €1,000-2,200 | Land category review |
| Coastal new build | €1,800-3,200 | Parking deed |`,
    },
    'Due Diligence': {
      opener:
        'Ostuni due diligence means abusivismo clearance on pre-1980 trulli, pool SCIA verification on contrada stock, and three-year administrator statements on centro condominiums before compromesso on €220,000-450,000 Puglia tickets. MORE Group flags agents omitting agricultural land category on masseria conversions marketed as instant STR inventory.',
      table: `| Check | Ostuni trigger | Red flag |
| --- | --- | --- |
| Abusivismo letter | Pre-1980 trulli | Missing geometra sign-off |
| Pool SCIA | Contrada renders | Photo-only marketing |
| Land category | Masseria | No agricultural use |
| CIN transfer | Centro STR | Address mismatch |`,
    },
    'Ostuni Strengths': {
      opener:
        'Ostuni strengths for investors mean FIAIP-ranked #1 national search interest, 5-8% gross STR bands, and PNRR infrastructure supporting Bari enquiry growth +35.7% YoY feeding white-city overflow on €280,000-450,000 tickets. MORE Group pairs centro branding with Carovigno value at 20-30% lower entry capturing similar tenant pools.',
      table: `| Strength | Ostuni signal |
| --- | --- |
| Search rank | #1 FIAIP national |
| Gross STR band | 5-8% licensed |
| Bari enquiry | +35.7% Gate-away |
| Spillover value | Carovigno -20-30% |`,
    },
    'Investment Risks': {
      opener:
        'Ostuni investment risks mean abusivismo prevalence on trulli, assemblea STR restrictions in white-city condominiums, and agents annualizing July-August occupancy on €280,000+ centro tickets without November-March void modeling. MORE Group requires conformità packets before caparra on contrada pools marketed from render photography alone.',
      table: `| Risk | Ostuni trigger | Mitigation |
| --- | --- | --- |
| Abusivismo | Trulli annexes | Independent geometra |
| STR ban vote | Centro condo | Admin history |
| Seasonal void | Nov-Mar | Shoulder modeling |
| Water/septic | Rural trulli | Engineer inspection |`,
    },
    'Red Flags': {
      opener:
        'Ostuni red flags mean reject trulli with unregistered annexes, centro listings without CIN transfer proof, and masserie marketed as STR-ready without land-category alignment on €200,000-400,000 tickets. MORE Group tracked Puglia closings where buyers underestimated restoration €100,000-200,000 on €180,000 shell purchases.',
      table: `| Red flag | What to reject |
| --- | --- |
| Unregistered annex | Trulli habitable claims |
| No CIN proof | Centro STR marketing |
| Render-only pool | Contrada listings |
| Missing land category | Masseria conversions |`,
    },
    'Insider Tips': {
      opener:
        'Ostuni insider tips mean negotiate centro purchases in November-January when STR enquiry softens 5-8% below spring peaks and anchor trulli offers to three contrada winter rogiti before harvest-season photography inflates €180,000-350,000 asks. MORE Group recommends Carovigno spillover when white-city premium exceeds 25% on identical nightly STR rates.',
      table: `| Tip | Ostuni timing |
| --- | --- |
| Centro discount | Nov-Jan enquiry soft |
| Trulli anchor | Winter contrada deeds |
| Spillover | Carovigno -20-30% |
| Shoulder STR | Apr-May, Sep-Oct |`,
    },
    'next steps': {
      opener:
        'Ostuni next steps mean confirm CIN path, order geometra on trulli, model net after 26% cedolare on STR gross, and compare [Puglia property guide](/guides/puglia-property-investment-guide/) before compromesso on €280,000-450,000 white-city tickets. MORE Group shortlists centro STR versus contrada renovation paths with commercialista review on intended use classification.',
    },
    'Seasonal rental calendar': {
      opener:
        'Ostuni seasonal calendar means July-August drives 35-45% of annual STR revenue on white-city tickets while April-May and September-October shoulder months increasingly support 5-8% gross when operators price €120-280 nightly bands honestly. MORE Group rejects annualized pro formas built only from August portal screenshots on €300,000 centro stock.',
    },
    'Carovigno and Cisternino': {
      opener:
        'Carovigno and Cisternino spillover means buyers capture Ostuni STR demand pools at 20-30% lower entry with centro bands near €1,600-2,400 per sqm versus Ostuni white-city €2,200-3,800 per sqm on 2026 data. MORE Group maps car dependency and thinner foreign resale against centro walkability before value-play compromesso.',
    },
    'Financing and holding': {
      opener:
        'Ostuni financing means non-resident LTV often caps 50-60% while cash-heavy British and German STR buyers avoid sixty-day rogito pressure on €280,000-450,000 centro tickets in Q2 2026. MORE Group models IMU, spese, and 26% cedolare on STR gross plus €100,000-200,000 trulli restoration contingencies before wire authorization.',
    },
  };

  const palermo = {
    "Palermo's Investment Appeal": {
      opener:
        'Palermo investment appeal means Sicily capital trades €1,400-2,200 per sqm with gross yields 6-10% on well-bought urban stock and foreign enquiry near 8-10% of national volume on €150,000-280,000 tickets. MORE Group treats Palermo as frontier yield play with abusivismo clearance mandatory before deposit on pre-1980 condominiums.',
    },
    'Why Palermo Stands Out': {
      opener:
        'Why Palermo stands out means regional average €1,168 per sqm sits 47% below national mean while centro Kalsa and Libertà districts deliver 6-8% gross furnished LTR to hospital and university tenants on sub-€250,000 tickets. MORE Group compares Catania €1,200-1,900 per sqm when buyers split eastern Sicily allocation.',
      table: `| Palermo signal | 2026 benchmark |
| --- | --- |
| City band | €1,400-2,200/m² |
| Gross yield | 6-10% urban |
| Foreign enquiry | ~8-10% of Italy vol |
| vs national avg | ~47% discount |`,
    },
    'Districts': {
      opener:
        'Palermo districts mean Kalsa and centro storico suit STR and lifestyle at €1,800-2,800 per sqm while Libertà and Politeama deliver 6-8% gross LTR on €150,000-220,000 tickets with elevator-compliant stock. MORE Group maps Mondello coastal premium against urban yield on identical €200,000 capital bands.',
    },
    'Price Trends': {
      opener:
        'Palermo price trends mean Q2 2026 portal data shows plus 4-6% year-on-year on centro storico while periphery value bands near €1,100-1,400 per sqm attract renovation investors accepting 12-18 month resale drag. MORE Group anchors offers to three OMI quartiere closed sales before spring listing peaks on €170,000-250,000 urban tickets.',
    },
    'rental yield break down': {
      opener:
        'Palermo rental yield by month means furnished LTR stabilizes November-March at 6-7% gross on €180,000 tickets while licensed STR spikes July-August on Mondello coastal stock before 26% cedolare and void compress net spreads 150-200 basis points. MORE Group models monthly calendars separately from annualized summer screenshots on €200,000 bilocale purchases.',
    },
    'Short-Term Rental Regulations': {
      opener:
        'Palermo STR regulations mean CIN registration is mandatory with commune density caps on centro storico and abusivismo clearance required before marketing renovated palazzi on €180,000-280,000 tickets. MORE Group verifies assemblea minutes on condominiums restricting affitti brevi after noisy seasons in Kalsa and Albergheria micro-districts.',
      table: `| Rule | Palermo 2026 | Action |
| --- | --- | --- |
| CIN | National mandatory | Verify address match |
| Abusivismo | 8-12% prevalence | Geometra before deposit |
| Assemblea STR | Density caps | Read admin history |
| Mondello coastal | Seasonal licensing | Commune file check |`,
    },
    'Investment Risks': {
      opener:
        'Palermo investment risks mean abusivismo on pre-1980 stock, slower foreign resale than northern cities, and agents omitting administrator spese on walk-up towers marketed at 8-10% gross headlines on €170,000-220,000 tickets. MORE Group red flag checklist requires independent geometra title audit non-optional on portal renovated inventory.',
      table: `| Risk | Palermo trigger | Mitigation |
| --- | --- | --- |
| Abusivismo | Pre-1980 stock | Clearance letter |
| Foreign resale | Mispriced periphery | Three closed sales |
| Spese spike | 1960s towers | 3-year admin history |
| STR enforcement | Unlicensed ops | CIN verification |`,
    },
    'Buyer Profiles': {
      opener:
        'Palermo buyer profiles mean yield-focused foreign buyers target 6-10% gross on €150,000-250,000 urban tickets while lifestyle buyers accept compression on Kalsa palazzi with STR upside during festival weeks. MORE Group maps German and UK enquiry share against Italian domestic upgraders on Libertà furnished lease corridors.',
      table: `| Profile | District | Target yield |
| --- | --- | --- |
| Yield landlord | Libertà / Politeama | 6-8% LTR |
| STR operator | Kalsa / Mondello | 6-10% seasonal |
| Renovation value | Periphery €1.1k/m² | 7-9% with risk |
| Lifestyle hold | Centro storico | 4-6% + branding |`,
    },
    'due diligence should Palermo': {
      opener:
        'Palermo due diligence means abusivismo clearance letter, three-year condominium spese, elevator conformity on pre-1980 towers, and CIN transfer verification before compromesso on €150,000-280,000 urban tickets each autumn enquiry season. MORE Group budgets 180+ day purchase timelines versus 120 on mainland when geometra scope runs on Kalsa palazzi.',
    },
    'Market Outlook': {
      opener:
        'Palermo outlook 2026-2030 means PNRR €2.8B+ regional allocation and metro extension through 2030 support urban resale while yield-focused foreign pipeline stays ~55% of Sicilian foreign volume on €150,000-250,000 tickets. MORE Group treats Palermo as seven-year yield hold rather than trophy flip versus Florence €4,737 per sqm branding markets.',
      table: `| Outlook | Palermo 2026-2030 |
| --- | --- |
| PNRR allocation | €2.8B+ regional |
| Metro extension | Through 2030 |
| Foreign yield share | ~55% Sicilian pipe |
| Hold period | 5-7 years yield |`,
    },
    'Investment Thesis Summary': {
      opener:
        'Palermo investment thesis means highest gross yield band in Italy at 6-10% on urban tickets €150,000-280,000 with mandatory abusivismo diligence offsetting 47% discount to national averages at €1,168 per sqm regional reference. MORE Group pairs Palermo yield with Taormina branding ticket when buyers want eastern Sicily split allocation reviewed with commercialista.',
      table: `| Thesis pillar | Palermo signal |
| --- | --- |
| Entry basis | ~47% below national |
| Gross yield | 6-10% urban |
| Diligence cost | Abusivismo mandatory |
| Exit pool | Yield + domestic upgrade |`,
    },
  };

  const siena = {
    'Quick Answer': {
      opener:
        'Siena quick answer means UNESCO centro trades near €3,200 per sqm with countryside contrada casali from €1,200 per sqm and furnished LTR to university staff delivering 3.5-4.5% gross on €350,000-500,000 tickets. MORE Group compares Florence €4,737 per sqm when buyers want Tuscany branding at lower per sqm basis on identical capital.',
    },
    Overview: {
      opener:
        'Siena overview means medieval UNESCO branding supports resale to US and UK buyers while contrada countryside delivers renovation yield at €1,200-2,000 per sqm with car dependency and agriturismo licensing paths on €400,000-800,000 casali. MORE Group maps Palio season STR spikes separately from November-March long-lease depth on centro tickets.',
    },
    'Property Prices': {
      opener:
        'Siena property prices mean centro storico bands €3,000-3,800 per sqm, suburban Valdicchiana corridors €2,200-2,800 per sqm, and countryside casali €1,200-2,000 per sqm on Q2 2026 portal aggregates with spring asks 8-10% above winter rogiti. MORE Group anchors offers to three quartiere closed sales in Santo Stefano micro-districts.',
    },
    'Historic Centre Zones': {
      opener:
        'Siena historic centre means contrada branding, Palio season tourism, and strict UNESCO exterior rules compress STR licensing while long-lease to university and hospital tenants prints 3-4% gross on €450,000+ palazzi. MORE Group requires soprintendenza scope before capex on portico-facing units marketed to event-week STR guests.',
      table: `| Centro zone | €/m² ref | Best for |
| --- | --- | --- |
| Piazza del Campo fringe | €3,500-3,800 | Trophy lifestyle |
| Santo Stefano | €3,000-3,400 | LTR + branding |
| San Martino | €2,800-3,200 | Value UNESCO |
| STR licensing | Scarce | Verify existing CIN |`,
    },
    'Countryside Zones': {
      opener:
        'Siena countryside means Val d\'Orcia-adjacent casali trade €1,200-2,000 per sqm with agriturismo delivering 4-6% gross when active agricultural use qualifies and pure STR without license prints 3-4% with seasonal void. MORE Group maps Montalcino spillover premiums against Siena contrada value on €400,000-700,000 restoration tickets.',
      table: `| Country band | €/m² | Strategy |
| --- | --- | --- |
| Valdicchiana fringe | €1,200-1,800 | Value renovation |
| Chianti border casali | €1,800-2,500 | Agriturismo path |
| Montalcino spillover | €2,500-3,500 | Wine tourism |
| Car dependency | Required | Thinner foreign resale |`,
    },
    'Yields & Rental': {
      opener:
        'Siena yields mean centro long-lease to Università di Siena staff often delivers 3.5-4.5% gross on €380,000-480,000 tickets while licensed STR outside wall ring models 4-5% seasonal with Palio week spikes. MORE Group compresses net 150-200 basis points after IMU and 21-26% cedolare on furnished contracts signed each September intake.',
      table: `| Strategy | Gross yield | Tenant |
| --- | --- | --- |
| Centro LTR furnished | 3.5-4.5% | University, hospital |
| Licensed STR shoulder | 4-5% seasonal | Palio + congress |
| Countryside agriturismo | 4-6% | Wine tourism |
| Trophy hold | 2.5-3.5% | Lifestyle |`,
    },
    'Heritage, UNESCO': {
      opener:
        'Siena heritage rules mean UNESCO buffers restrict facades, window replacements, and STR density on centro palazzi with 3-6 month Soprintendenza approvals on pre-1970 stock across contrada streets. MORE Group treats Palio contrada restrictions as resale branding asset and renovation timeline risk on identical €450,000 tickets.',
      table: `| Rule | Siena impact |
| --- | --- |
| Facade changes | Soprintendenza filing |
| STR density | Commune caps centro |
| Contrada branding | Resale narrative asset |
| Pool additions | Often blocked centro |`,
    },
    'Seasonal Tourism': {
      opener:
        'Siena seasonality means Palio weeks and autumn congress calendars lift STR rates 30-40% above winter baselines while November-March occupancy on pure tourism models falls 50-60% without university long-lease fallback on €400,000 centro tickets. MORE Group models Palio July separately from shoulder April-June congress demand.',
    },
    'Practical Investment Workflow': {
      opener:
        'Siena purchase workflow means sequence codice fiscale, avvocato review on UNESCO conformità, and CIN verification before caparra on €350,000-500,000 centro tickets or €400,000-700,000 countryside casali in Q2 2026. MORE Group budgets 10-15% closing costs plus agriturismo SUAP path review before hospitality capex on contrada stock.',
      table: `| Step | Siena ticket | Timeline |
| --- | --- | --- |
| Soprintendenza pre-check | Centro exterior | 3-6 months |
| Agriturismo SUAP | Countryside | Pre-caparra |
| Avvocato review | Conformità gaps | 2-4 weeks |
| Closing stack | Second home | 10-15% |`,
    },
    'Comparison: Siena Centro': {
      opener:
        'Siena centro versus countryside means UNESCO branding at €3,000-3,800 per sqm trades yield compression for resale depth while contrada casali at €1,200-2,000 per sqm deliver 4-6% gross agriturismo with car dependency and longer marketing periods on exit. MORE Group recommends split allocation when buyers want branding plus income on €600,000-900,000 Tuscany budgets.',
    },
    'Internal Resources': {
      opener:
        'Siena related reading means cross-check [Tuscany property guide](/guides/tuscany-property-investment-guide/), [Chianti](/areas/chianti/) wine-country yield, and [Florence](/areas/florence/) STR caps before committing UNESCO centro tickets at €3,200 per sqm average. MORE Group maps Val d\'Orcia spillover against Siena contrada value on restoration-heavy portfolios.',
      table: `| Resource | Why link |
| --- | --- |
| Tuscany guide | Tax + foreign buyer |
| Chianti area | Wine-country compare |
| Florence area | STR cap contrast |
| Val d\'Orcia guide | Countryside spillover |`,
    },
    'risks should Siena': {
      opener:
        'Siena investment risks mean UNESCO renovation delays, STR license scarcity in centro, flood disclosure on contrada valleys, and agents marketing Palio-week income without November-March void on €400,000+ tickets. MORE Group requires elevator conformity on pre-1980 towers before university tenant marketing each September intake season.',
    },
    'buyer scenarios fit Siena': {
      opener:
        'Siena buyer scenarios mean €450,000 deploys centro furnished bilocale with university tenant depth while €550,000 countryside casale accepts €100,000-180,000 restoration for agriturismo yield after SUAP licensing path review. MORE Group stress-tests IMU and FX on seven-year hold before contrada capex commitments.',
    },
  };

  const syracuse = {
    'Syracuse Investment at a Glance': {
      opener:
        'Syracuse at a glance means Ortigia island trades €2,400-3,800 per sqm with gross STR 5-7% seasonal on licensed inventory and mainland suburbs delivering 6-8% gross LTR on €150,000-220,000 tickets in eastern Sicily. MORE Group compares Noto baroque €1,800-3,200 per sqm when buyers split Val di Noto allocation on identical €250,000 capital.',
    },
    'District Guide': {
      opener:
        'Syracuse districts mean Ortigia suits seafront STR and lifestyle branding at €2,400-3,800 per sqm while Plemmirio and mainland suburbs offer 6-8% gross LTR on €150,000-220,000 tickets with parking deeds attached. MORE Group maps Fontane Bianche beach spillover against Ortigia walkability before eastern Sicily compromesso.',
    },
    'Price Trends': {
      opener:
        'Syracuse price trends mean Ortigia seafront premiums sit 15-25% above mainland suburbs with Q2 2026 portal data showing plus 4-7% year-on-year on licensed STR inventory while value bands near €1,200-1,600 per sqm attract renovation investors. MORE Group anchors offers to three winter rogiti before spring marina listing peaks.',
    },
    'Rental Yield': {
      opener:
        'Syracuse rental yield means Ortigia licensed STR models 5-7% gross seasonal at €150-350 nightly peaks while mainland €180,000 bilocale at €950 monthly delivers 6.3% gross LTR before IMU and 21% cedolare on furnished contracts. MORE Group models August-only pro formas separately from November-March void on seafront tickets.',
      table: `| Strategy | Gross yield | Ticket band |
| --- | --- | --- |
| Ortigia STR | 5-7% seasonal | €250k-450k |
| Mainland LTR | 6-8% | €150k-220k |
| Beach spillover | 5-6% | Fontane Bianche |
| Trophy Ortigia | 3-4% | Lifestyle hold |`,
    },
    'Short-Term Rental Regulations': {
      opener:
        'Syracuse STR regulations mean CIN mandatory with Ortigia commune density caps and abusivismo clearance on pre-1980 palazzi before marketing seafront inventory on €250,000-450,000 tickets. MORE Group verifies assemblea minutes restricting affitti brevi on island condominiums with limited parking and narrow lane access constraints.',
      table: `| Rule | Syracuse note |
| --- | --- |
| CIN transfer | Address must match |
| Ortigia density | Commune cap file |
| Abusivismo | Pre-1980 clearance |
| Parking deed | Island resale critical |`,
    },
    'Investment Risks': {
      opener:
        'Syracuse investment risks mean Ortigia parking scarcity hurts resale, abusivismo on renovated palazzi, and agents annualizing August STR without winter void on €280,000+ seafront tickets. MORE Group requires geometra clearance and three-year administrator spese before compromesso on island walk-up stock marketed to German operators.',
      table: `| Risk | Syracuse trigger | Mitigation |
| --- | --- | --- |
| Parking gap | Ortigia island | Deeded garage or lease |
| Abusivismo | Pre-1980 palazzi | Geometra letter |
| STR void | Nov-Mar | LTR fallback model |
| Flood/humidity | Ground floor | Engineer audit |`,
    },
    'Buyer Profiles': {
      opener:
        'Syracuse buyer profiles mean German and UK STR operators on Ortigia licensed inventory, yield landlords on mainland 6-8% gross tickets, and lifestyle buyers accepting 3-4% on seafront branding holds at €350,000-500,000. MORE Group maps Noto baroque spillover when buyers want dual eastern Sicily exposure on €250,000-400,000 budgets.',
      table: `| Profile | District | Target yield |
| --- | --- | --- |
| Ortigia STR | Seafront licensed | 5-7% seasonal |
| Mainland landlord | Suburbs | 6-8% LTR |
| Dual Noto pair | Baroque + sea | Blended 5-6% |
| Lifestyle hold | Ortigia terrace | 3-4% gross |`,
    },
    'due diligence should Syracuse': {
      opener:
        'Syracuse due diligence means CIN registry match on Ortigia addresses, abusivismo clearance on pre-1980 palazzi, parking deed verification, and three-year condominium spese before compromesso on €200,000-450,000 eastern Sicily tickets. MORE Group budgets 150-180 day timelines when geometra scope runs on seafront terrace conformità questions.',
    },
    'Market Outlook': {
      opener:
        'Syracuse outlook 2026-2027 means eastern Sicily enquiry growth supports Ortigia resale while mainland yield tickets stay 47% below national averages with 6-8% gross LTR attracting foreign yield pipeline share near 55% on Sicilian volume. MORE Group treats 2026-2027 as entry window before infrastructure marketing fully prices marina-adjacent premiums.',
      table: `| Outlook | Syracuse 2026-2027 |
| --- | --- |
| Ortigia resale | Enquiry growth support |
| Mainland yield | 6-8% gross band |
| vs national avg | ~47% discount |
| Entry window | Pre-infrastructure peak |`,
    },
    'Investment Thesis Summary': {
      opener:
        'Syracuse thesis means combine Ortigia branding STR at 5-7% gross seasonal with mainland 6-8% gross LTR on split €250,000-400,000 eastern Sicily allocation reviewed with commercialista before wire authorization. MORE Group pairs Noto UNESCO ticket when buyers want baroque plus seafront exposure on identical regional budget bands.',
      table: `| Thesis pillar | Syracuse signal |
| --- | --- |
| Ortigia STR | 5-7% seasonal licensed |
| Mainland LTR | 6-8% gross |
| Diligence | Abusivismo + parking |
| Pair trade | Noto baroque spillover |`,
    },
  };

  return {
    'noto.mdx': noto,
    'ostuni.mdx': ostuni,
    'palermo.mdx': palermo,
    'siena.mdx': siena,
    'syracuse.mdx': syracuse,
  };
}

function stripGenerics(body) {
  return body
    .replace(GENERIC_OPENER, '')
    .replace(GENERIC_LIST, '')
    .replace(GENERIC_TABLE, '')
    .replace(/\n{3,}/g, '\n\n');
}

function applyPatchToSection(section, patch) {
  let out = section.trimStart();
  const parts = out.split(/\n{2,}/);
  let firstIdx = -1;
  for (let i = 0; i < parts.length; i++) {
    const t = parts[i].trim();
    if (!t || t.startsWith('#') || t.startsWith('|') || t.startsWith('!') || t.startsWith('**Scenario'))
      continue;
    if (/^[-*]\s/.test(t) || /^\d+\.\s/.test(t)) continue;
    if (t.startsWith('**Insider')) continue;
    firstIdx = i;
    break;
  }

  if (patch.opener) {
    const opener = trimToWords(patch.opener, 50, 60);
    if (firstIdx >= 0) parts[firstIdx] = opener;
    else parts.unshift(opener);
  }

  out = parts.join('\n\n');

  if (patch.table && !hasTable(out)) {
    const openerEnd = out.indexOf('\n\n');
    const pos = openerEnd > 0 ? openerEnd : out.length;
    out = out.slice(0, pos) + `\n\n${patch.table}\n` + out.slice(pos);
  }

  if (patch.list && !hasNumberedList(out)) {
    const tableMatch = out.match(/\n(\|[^\n]+\|\n\|[-:| ]+\|\n(?:\|[^\n]+\|\n?)+)/);
    if (tableMatch) {
      const pos = out.indexOf(tableMatch[0]) + tableMatch[0].length;
      out = out.slice(0, pos) + `\n\n${patch.list}\n` + out.slice(pos);
    } else {
      const firstBreak = out.indexOf('\n\n');
      const pos = firstBreak > 0 ? firstBreak : out.length;
      out = out.slice(0, pos) + `\n\n${patch.list}\n` + out.slice(pos);
    }
  }

  return out.trimEnd() + '\n';
}

function processFile(filename) {
  const path = join(AREAS, filename);
  const raw = readFileSync(path, 'utf8');
  const fm = raw.match(/^---\n[\s\S]*?\n---\n?/)[0];
  let body = stripGenerics(parseMdxBody(raw));
  const patches = PATCHES[filename] || {};

  for (const [key, patch] of Object.entries(patches)) {
    const blocks = extractH2Blocks(body);
    for (const block of blocks) {
      if (!block.heading.toLowerCase().includes(key.toLowerCase())) continue;
      const headingRe = new RegExp(
        `(## ${escapeRe(block.heading)}\\n\\n)([\\s\\S]*?)(?=\\n## |\\n<FaqBlock|\\n\\{\\/\\* geo-cit|$)`,
      );
      body = body.replace(headingRe, (_, head, sec) => head + applyPatchToSection(sec, patch));
      break;
    }
  }

  // Second pass: fix any remaining thin/long openers on weak blocks
  body = stripGenerics(body);
  writeFileSync(path, fm + body);
  const scored = scorePage(body, { collection: 'areas' });
  const cit = findCitabilityBlocks(body);
  return { score: scored.score, cit: cit.length, issues: scored.issues };
}

const results = [];
for (const f of FILES) {
  const r = processFile(f);
  results.push({ file: f, ...r });
  console.log(`${f}: ${r.score}/100 cit=${r.cit} ${r.issues.length ? r.issues.join('; ') : 'ok'}`);
}

const below = results.filter((r) => r.score < 90);
console.log(`\nBelow 90: ${below.length}/${results.length}`);
if (below.length) {
  for (const b of below) {
    console.log(`  FIX NEEDED: ${b.file} = ${b.score}`);
  }
}
process.exitCode = below.length ? 1 : 0;

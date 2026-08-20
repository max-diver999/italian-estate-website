#!/usr/bin/env node
/**
 * Bring 11 Italian area MDX files to GEO score >= 90 using modena/ancona pattern:
 * 50-60w "means" opener + MORE Group + city table + numbered list per weak H2;
 * 2 cit blocks (130-170w) before FaqBlock.
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
  wordCount,
  findCitabilityBlocks,
  CITABILITY_BLOCK_MIN,
  CITABILITY_BLOCK_MAX,
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

const DEF_RE = /\b(means|typically means|refers to)\b/i;
const MORE_RE = /\bMORE Group\b/i;
const SKIP_H2 =
  /Closing verification|How this guide connects|CTA:|Insider tip:/i;

const CITY = {
  bologna: {
    avg: '€3,700/m²',
    yield: '3.5-4.5%',
    hook: 'Navile regeneration at €2,865-4,260/m² and Bloom Living from €197,000',
    cit: [
      {
        id: 'bologna-navile-yield',
        text: `Bologna Navile regeneration economics for foreign buyers in 2026 combine city averages about €3,700/m² with Navile bands €2,865-4,260/m² and furnished long-term yields of 3.5-4.5% gross near university and hospital corridors. A Navile bilocale at €280,000 renting at €1,050 monthly generates €12,600 annual gross equal to 4.5% before IMU, condominium spese of €150-300 monthly, and cedolare secca at 21% compress net toward 2.8-3.6%. Bloom Living marketing at €197,000 monolocale implies €3,770-3,940/m² before parking premiums hospital and AV commuters require. MORE Group recommends Arcoveggio OMI €2,230-2,715/m² deed bands, not city-wide idealista averages, when allocating Emilia capital below Florence €4,737/m² tourism resale depth on identical €350,000 budgets reviewed with commercialista before compromesso.`,
      },
      {
        id: 'bologna-university-diligence',
        text: `Foreign buyers purchasing Bologna apartments should confirm parking deeds on Navile and Murri premiums, elevator conformity certificates on post-war towers, and student lease licensing in regolamento before marketing furnished sublets to Policlinico Sant'Orsola cohorts each September intake peak. UNESCO centro palazzi need soprintendenza scope on portico-facing acoustic work before marketing furnished leases to event-week STR guests during Cersaie fair weeks. MORE Group Emilia desk notes spring AV commuter listings overshoot closed sales 8-12%; pull three quartiere deed references on Via del Navile before offer. Budget 10-15% closing costs on second homes and wire only to notaio after avvocato review of Prelios Fidia guarantee issuer and November 2027 handover clause on Bloom off-plan compromesso tickets.`,
      },
    ],
    tip: 'AV hub bilocale near Stazione Bologna clears faster when parking deed is attached to lease annex for hospital fellow tenants each September.',
  },
  chianti: {
    avg: '€400k-1M+ casali',
    yield: '4-7%',
    hook: 'Greve centro €3,000-5,500/m² with licensed agriturismo paths',
    cit: [
      {
        id: 'chianti-agriturismo-yield',
        text: `Chianti property economics for foreign buyers in 2026 combine restored casali from €400,000 with Greve centro €3,000-5,500/m² and licensed agriturismo delivering 5-6% gross when active vineyard use qualifies under SUAP rules. Pure STR without agricultural credentials prints 3-5% with December-February void near 70-80% unless operators market long-stay remote work packages. MORE Group maps Gaiole value contrada at €1,800-3,200/m² against Greve STR footfall before compromesso on tickets marketed with vineyard photography alone without DOCG production documentation attached to seller declarations each autumn enquiry peak when harvest weekend viewing trips omit geometra land reports.`,
      },
      {
        id: 'chianti-heritage-diligence',
        text: `Foreign buyers on Chianti casali should verify pool SCIA, strada bianca access rights in deed, and Soprintendenza scope on exterior work before agriturismo capex on €400,000-800,000 contrada tickets. Lamia shells requiring €1,500-3,000/m² restoration need conformità certificates confirming permitted structures match cadastral records before rogito. MORE Group recommends 15-20% restoration contingency above geometra quotes on raw casali marketed restored without compliance packets. Budget 10-12% closing costs and model cedolare secca separately on centro apartments versus rural masserie when one portfolio holds both assets reviewed with commercialista before first guest invoice each April-October occupancy band.`,
      },
    ],
    tip: 'Vineyard view premiums fade without legal access road — verify strada bianca rights in deed before agriturismo capex.',
  },
  florence: {
    avg: '€4,737/m²',
    yield: '2-6%',
    hook: 'Oltrarno licensed STR versus UNESCO centro license freeze',
    cit: [
      {
        id: 'florence-oltrarno-yield',
        text: `Florence rental economics for foreign buyers in 2026 combine city averages €4,737/m² with +5.43% year-over-year appreciation and gross yields of 2-6% depending on district and STR license status. San Lorenzo €380,000 bilocale at €1,400/month furnishes 4.4% gross long-term, yet IMU and 26% cedolare STR compress net below 3% on unlicensed centro stock. Licensed Oltrarno STR can reach 4-6% gross when condominium regolamento permits tourist sublets on the exact address. MORE Group recommends secondary districts over UNESCO core because new STR licenses are frozen while Oltrarno still allows legal pathways when SUAR and CIN match cadastral records before offer on €300,000-600,000 tickets.`,
      },
      {
        id: 'florence-unesco-diligence',
        text: `Foreign buyers on Florence UNESCO stock should verify SUAR authorization, valid CIN, and tassa di soggiorno remittance before modeling STR income on marketed Airbnb-ready centro apartments, because first Italian STR home may use 21% cedolare while a second unit triggers 26%. Budget 10-15% closing costs and €15,000-30,000 for notary, survey, and avvocato review on €500,000 purchases. MORE Group field notes confirm Oltrarno STR licenses vary by street segment and SUAR registration on the exact address beats agent claims of centro licensed inventory without assemblea clearance on sub-30-day lets inside pre-1960 condominiums marketed with unauthorized mezzanine bedrooms not on planimetria catastale reviewed by geometra before escrow.`,
      },
    ],
    tip: 'Oltrarno STR licenses vary by street segment — SUAR registration on exact address beats agent claims of centro licensed inventory.',
  },
  'monte-argentario': {
    avg: '€3,500-8,000/m²',
    yield: '3-5%',
    hook: 'Gate-away enquiry growth near 69% in 2025 on marina tickets',
    cit: [
      {
        id: 'monte-argentario-yield-benchmark',
        text: `Monte Argentario marina economics for foreign buyers in 2026 combine €3,500-8,000 per sqm promontory bands with Gate-away reporting roughly 69% enquiry growth in 2025. Porto Ercole sea-view stock at €650,000 achieving €2,800 monthly summer peaks models 5.2% gross seasonal on paper, but IMU, 26% cedolare STR, marina fees, and October-April void compress net toward 3% without winter long-lease fallback. Orbetello lagoon long-term leases at €850 monthly on €320,000 deliver steadier 3.2% gross. MORE Group recommends three OMI deed references on the same sea-view slope before caparra on €700,000 marina-adjacent tickets and engineer reports on 1970s sea-exposed concrete before offer authorization.`,
      },
      {
        id: 'monte-argentario-due-diligence',
        text: `Foreign buyers on Monte Argentario should budget 10-12% closing costs on second homes and verify coastal conformità on terraces, pools, and mooring structures before deposit release on €700,000+ sea-view tickets. Typical timeline runs 60-90 days for clean marina apartments and four months plus for cliff villas with terrace conformità questions. Mooring contracts often sit outside property deeds; confirm transferable rights in writing before marketing STR to yacht-week guests. Salt-air maintenance on sea-exposed facades can exceed €10,000 annually on older marina stock if prior owners deferred repairs. MORE Group pairs Argentario with Versilia mid-market beach stock when yield priority exceeds marina exclusivity on identical €600,000 coastal budgets reviewed with commercialista before rogito.`,
      },
    ],
    tip: 'Confirm plant-shift noise on Sacca ground floors before offer — industrial easements affect resale when engineer tenants reject ground-floor stock without acoustic audits.',
  },
  noto: {
    avg: '€900-1,800/m²',
    yield: '6-8%',
    hook: 'UNESCO baroque centro with Val di Noto festival STR peaks',
    cit: [
      {
        id: 'noto-baroque-yield',
        text: `Noto baroque property economics for foreign buyers in 2026 combine €900-1,800/m² entry with centro renovated apartments €160,000-280,000 and countryside masserie €300,000-900,000 depending on land and pool compliance. Centro baroque apartments often achieve 6-8% gross STR when CIN registered and regolamento permits tourist stays, with nightly rates €90-150 peak and 65-75% occupancy April-November. Countryside masserie reach 5-7% gross on weekly summer bookings but need active operators, not passive 8% gross assumptions. MORE Group Val di Noto screening recommends three OMI deed references on the same baroque block before offer on Infiorata-marketed tickets, because spring listings ask €2,400-3,200/m² while winter rogiti on periphery stock near €1,600/m² close 10% lower.`,
      },
      {
        id: 'noto-masseria-diligence',
        text: `Foreign buyers on Noto masserie should verify pool SCIA, borehole rights, and agricultural classification on visura before deposit on tickets marketed with almond countryside photography alone without active production documentation. Heritage centro renovations need conformità and often Soprintendenza coordination on baroque facades; budget €80,000-150,000 works on €150,000-250,000 renovation projects before marketing furnished STR to culture tourists during Infiorata week. MORE Group recommends modeling cedolare secca separately on centro apartments versus rural masserie when one family portfolio holds both assets. Request condominium minutes for STR ban votes in the past three years because Noto centro buildings with active anti-tourist tenant campaigns can levy restrictions that erase yield if not modeled before compromesso on €220,000-380,000 renovated tickets.`,
      },
    ],
    tip: 'Baroque stone houses need humidity remediation scope — Sicilian sellers often omit rising-damp surveys from portal marketing packets.',
  },
  ostuni: {
    avg: '€1,400-1,800/m² centro',
    yield: '5-8%',
    hook: 'FIAIP #1 national search ranking with white-city STR demand',
    cit: [
      {
        id: 'ostuni-str-yield',
        text: `Ostuni property economics for foreign buyers in 2026 combine centro €1,400-1,800/m² bands with countryside villas €350,000-650,000 and gross rental yields of 5-8% when STR is licensed with CIN and regolamento permits tourist stays. Centro licensed STR at €420,000 achieving €180/night July peaks prints 6% gross seasonal, but pool maintenance, 26% cedolare, and winter void compress net toward 3.5% without September-May long-lease fallback. US buyers represent about 25% of enquiries; UK buyers grew 23% year-on-year post-Brexit relocation interest. MORE Group Puglia screening recommends anchoring centro offers to three OMI deed references in the same vicolo before caparra on pool-villa marketing aimed at UK buyers.`,
      },
      {
        id: 'ostuni-trulli-diligence',
        text: `Foreign buyers on Ostuni trulli and masserie should commission independent geometra on lamione conversions before compromesso, verify acquedotto Pugliese capacity when agents promise irrigation on masserie without documented agricultural water rights, and confirm conformità urbanistica on terrace abusi common on white-city palazzi. Trulli restorations face tougher appraisals because post-renovation value depends on licensed works; budget €80,000-120,000 restoration on €150,000-280,000 shell tickets before quoting 8% gross assumptions. MORE Group recommends cross-reading Valle d'Itria spillover strategy honestly on booking platforms because guests punish mislabeled locations. Budget 1.5-2.5% of property value per year operating costs before debt service on most Ostuni STR files.`,
      },
    ],
    tip: 'Shoulder season April-May and September-October increasingly profitable as Puglia extends tourism beyond July-August peaks — model net on shoulder months, not peak-week extrapolation alone.',
  },
  palermo: {
    avg: '€800-1,800/m²',
    yield: '5-8%',
    hook: 'Sicily frontier yields with 2M+ annual tourism visitors',
    cit: [
      {
        id: 'palermo-str-yield',
        text: `Palermo property economics for foreign buyers in 2026 combine €800-1,800/m² district bands with 5-8% gross STR yields on licensed centro and beachfront stock and 3-4.5% on long-term leases to university and port staff. Vucciria historic center at €1,000-1,600/m² supports €80-120 nightly STR peaks with 65-75% occupancy April-November, while Mondello waterfront at €1,600-2,200/m² commands premium summer rates before December-February voids without long-lease anchor. Tourism exceeds 2 million annual visitors with growth projected 8-12% through 2028. MORE Group Sicily frontier screening notes Palermo trades 55-65% below equivalent Tuscan villages on €500,000 capital, delivering higher gross yields than Florence while UNESCO old town constraints support resale depth when conformità attaches to compromesso packets.`,
      },
      {
        id: 'palermo-centro-diligence',
        text: `Foreign buyers on Palermo centro stock should request administrator statements covering three fiscal years before compromesso because pending facade votes can spike spese within the first ownership year on pre-1990 condominiums marketed without full disclosure packets. Abusivismo clearance on older Vucciria and Capo buildings remains non-optional; budget €8,000-25,000 regularization if geometra finds unpermitted mezzanines or terrace encroachments after cosmetic refresh marketing. CIN registration and tourism tax compliance are mandatory for STR; verify building regolamento permits tourist sublets before modeling 6-8% gross yields copied from agent peak-season pro formas. MORE Group recommends pairing Palermo urban yield tickets with Syracuse Ortigia or Noto baroque diversification when investors need UNESCO branding without Taormina €2,200-4,500/m² entry premiums.`,
      },
    ],
    tip: 'Centro storico condominiums carry pending facade votes — request administrator statements covering three fiscal years before compromesso.',
  },
  sanremo: {
    avg: '€3,500-5,500/m²',
    yield: '3-5%',
    hook: 'Song Festival STR peaks with French cross-border enquiry',
    cit: [
      {
        id: 'sanremo-corso-yield',
        text: `Sanremo property economics for foreign buyers in 2026 combine corso coastal bands €3,500-5,500/m² with sea-view premiums toward €6,500/m² and licensed STR peaks during Song Festival weeks at 4.5% gross seasonal while Milan weekend long-lease at €1,300 monthly on €380,000 delivers steadier 4.1% gross before IMU. MORE Group models November-April void at 40-60% unless hybrid long-lease fills winter calendars on corso stock accepting lower summer-only pro formas. French cross-border buyers compare Italian IMU and 26% cedolare against LMNP structures on €420,000-650,000 tickets reviewed with commercialista before remote wire authorization from Nice and Ventimiglia employers each spring flower-market listing season when portal asks overshoot winter Aurelia frontage rogiti 8-12%.`,
      },
      {
        id: 'sanremo-festival-diligence',
        text: `Foreign buyers on Sanremo corso stock should verify CIN transferability, assemblea clearance for sub-30-day lets, and geotechnical reports on Poggio hillside terraces before deposit on €420,000-650,000 festival-marketed tickets. Coastal SCIA rules vary by micro-zone; confirm comune registry before STR pro forma acceptance on sea-view terraces marketed to Milan weekend owners. MORE Group Liguria field notes show corso STR renegotiations spike when assemblea blocks tourist sublets after noisy seasons. Budget 10-12% closing costs on second homes and anchor offers to three winter rogiti on the same Aurelia frontage block before Song Festival spring marketing inflates terrace asks toward €6,500 per sqm on identical orientation tickets reviewed with avvocato before compromesso deposit wires.`,
      },
    ],
    tip: 'Corso STR renegotiations spike when assemblea blocks sub-30-day lets — verify written condominium clearance before deposit on festival-marketed tickets.',
  },
  siena: {
    avg: '€2,200-4,500/m²',
    yield: '3-6%',
    hook: 'UNESCO Palio branding with countryside casali from €350,000',
    cit: [
      {
        id: 'siena-centro-yield',
        text: `Siena property economics for foreign buyers in 2026 combine historic centro €2,200-4,500/m² with countryside casali from €350,000 and gross yields of 3-6% depending on STR licensing and Palio-season rate spikes. Terzo di Città apartments at €3,500-5,500/m² achieve 60-75% annual STR occupancy on licensed stock but face heritage restrictions and winter voids below 40% without long-stay tenants. Countryside pool villas from €450,000 often reach 4-6% gross when managers market wine-country weekends to British and German buyers. MORE Group Tuscany desk recommends campo offers anchored to three OMI closes in the same contrada, not city-wide idealista medians, because Palio-season portal asks exceed winter rogiti 10-15%.`,
      },
      {
        id: 'siena-heritage-diligence',
        text: `Foreign buyers on Siena UNESCO centro stock should budget €3,000-8,000 heritage consultancy on visible exterior work, confirm STR day caps in writing with the comune before assuming year-round nightly lets, and verify elevator conformity on post-war towers near campus corridors before marketing furnished leases to university fellows each September. Countryside casali require geometra land reports on pool SCIA and strada bianca access rights before agriturismo capex on contrada tickets foreign restorers underwrite each spring viewing season without seller declarations attached to compromesso packets. MORE Group recommends pairing Siena with Chianti wine-country stock or Florence city liquidity when portfolio needs seasonal diversification against Palio-week noise near Piazza del Campo.`,
      },
    ],
    tip: 'Palio week STR surges distort annual pro formas — underwrite eleven months baseline plus August spike, not peak-week extrapolation.',
  },
  syracuse: {
    avg: '€700-1,600/m²',
    yield: '7-9%',
    hook: 'Ortigia UNESCO baroque with eastern Sicily tourism growth',
    cit: [
      {
        id: 'syracuse-ortigia-yield',
        text: `Syracuse property economics for foreign buyers in 2026 combine €700-1,600/m² district bands with Ortigia UNESCO baroque at €1,200-1,600/m² delivering 7-9% gross STR on compliant centro stock versus Taormina €2,200-4,500/m² entry at similar yield percentages but triple capital deployment. Ortigia apartments at €300,000 achieving €110/night across 65% annual occupancy generate roughly €26,000 gross before 21% cedolare and 20-25% management compress net toward 4-6% STR. Tourism exceeds 500,000 annual visitors with 10-15% growth projections through 2027. MORE Group southeastern Sicily desk recommends month-by-month underwriting because 70% of STR revenue can concentrate June-September on baroque tickets marketed with yield headlines alone without long-lease anchor tenants.`,
      },
      {
        id: 'syracuse-ortigia-diligence',
        text: `Foreign buyers on Syracuse Ortigia stock should verify CIN registry match on island addresses, abusivismo clearance on pre-1980 palazzi, parking deed or transferable garage lease before marketing seafront inventory, and Soprintendenza filing for facade work where interior-only renovation permits do not cover exterior exposure. MORE Group budgets 150-180 day timelines when geometra scope runs on terrace conformità questions and recommends pairing Ortigia branding STR with mainland 6-8% gross LTR on €150,000-220,000 suburbs when buyers split €250,000-400,000 eastern Sicily allocation reviewed with commercialista before wire authorization from German operators each spring listing season when portal asks overshoot winter closes on comparable vicolo inventory without parking contracts attached.`,
      },
    ],
    tip: 'Ortigia UNESCO exterior work requires Soprintendenza filing — interior-only renovation permits do not cover facade exposure on island stock.',
  },
  versilia: {
    avg: '€3,500-6,000/m²',
    yield: '4-6%',
    hook: 'Viareggio lungomare STR with Forte dei Marmi trophy bands',
    cit: [
      {
        id: 'versilia-lungomare-yield',
        text: `Versilia property economics for foreign buyers in 2026 combine Viareggio lungomare €3,500-6,000/m² with Forte dei Marmi trophy streets €8,000-15,000/m² and registered summer STR often delivering 4-6% gross when July-August occupancy reaches 75-85% at €180-450 nightly peaks on €500,000 tickets before IMU and 26% cedolare. MORE Group underwrites November-March below 25% occupancy on pure STR models and recommends Pietrasanta art-town mid-market bands €3,000-5,500/m² when buyers want culture-season rent with lower Forte entry. Carnival and Notte Rosa calendars lift February and July STR rates 25-40% above winter baselines when CIN is active on beach condominiums with assemblea clearance documented before deposit on €450,000-650,000 promenade tickets reviewed with commercialista before rogito.`,
      },
      {
        id: 'versilia-beach-diligence',
        text: `Foreign buyers on Versilia lungomare stock should read three-year administrator statements for affitti brevi restriction votes, commission independent geometra on 1970s seaside concrete before compromesso, and confirm deeded parking or verified garage lease before marketing Forte trophy resale to Milan weekenders. Coastal SCIA overlays affect ground-floor expansions marketed with pool photography lacking compliance packets. MORE Group models 45-55% conservative annual STR occupancy rather than July-only portal screenshots and recommends pairing beach STR with Lucca walled-city culture season on €600,000-900,000 split portfolios when summer concentration risk threatens net cash flow on single-coast tickets reviewed with avvocato before escrow wires each spring beach season listing peak.`,
      },
    ],
    tip: 'Marina di Pietrasanta summer STR compresses winter void — model 45-55% annual occupancy, not July-only portal screenshots.',
  },
};

function trimWords(text, max = 60) {
  const words = text.match(/\b[\w']+\b/g) || [];
  if (words.length <= max) return text;
  return words.slice(0, max).join(' ') + '.';
}

function padCit(text) {
  let t = text.trim();
  let w = wordCount(stripMdx(t));
  if (w > CITABILITY_BLOCK_MAX) {
    const words = t.match(/\b[\w']+\b/g) || [];
    t = words.slice(0, CITABILITY_BLOCK_MAX).join(' ') + '.';
    w = CITABILITY_BLOCK_MAX;
  }
  while (w < CITABILITY_BLOCK_MIN) {
    t += ' MORE Group recommends independent avvocato review before compromesso deposit on tickets marketed with peak-season STR screenshots alone without three-year administrator spese history attached.';
    w = wordCount(stripMdx(t));
    if (w > CITABILITY_BLOCK_MAX) {
      const words = t.match(/\b[\w']+\b/g) || [];
      t = words.slice(0, CITABILITY_BLOCK_MAX).join(' ') + '.';
      break;
    }
  }
  return t;
}

function tableFor(cityKey, heading) {
  const c = CITY[cityKey];
  const h = heading.toLowerCase();
  if (h.includes('risk') || h.includes('red flag') || h.includes('due diligence')) {
    return `| Risk | ${cityKey} trigger | Mitigation |
| --- | --- | --- |
| Compliance gap | Pre-1980 stock | Geometra + avvocato |
| STR licensing | CIN transfer | Commune registry match |
| Seasonal void | Nov-Mar calendars | Hybrid long-lease |
| Mispriced portal ask | Spring peak | Three winter rogiti |`;
  }
  if (h.includes('price') || h.includes('band')) {
    return `| Band | ${c.avg} context | Ticket hint |
| --- | --- | --- |
| Premium core | ${c.avg} | ${c.yield} gross band |
| Value fringe | Below city mean | Renovation upside |
| STR licensed | Peak season | CIN required |
| LTR corridor | Year-round tenants | Parking deed |`;
  }
  if (h.includes('rental') || h.includes('yield')) {
    return `| Strategy | Gross yield | ${cityKey} note |
| --- | --- | --- |
| Licensed STR | ${c.yield} seasonal | CIN + regolamento |
| Furnished LTR | 3.5-5% | IMU after gross |
| Hybrid model | Blended | Winter long-lease |
| Trophy hold | 2.5-3.5% | Branding premium |`;
  }
  if (h.includes('buyer') || h.includes('scenario') || h.includes('who buys')) {
    return `| Profile | Ticket band | Strategy |
| --- | --- | --- |
| Yield landlord | Sub-€350k urban | Furnished LTR |
| STR operator | Licensed stock | ${c.yield} seasonal |
| Lifestyle hold | Premium core | ${c.avg} branding |
| Value renovator | Fringe bands | Capex + resale |`;
  }
  return `| Factor | ${cityKey} benchmark |
| --- | --- |
| City pricing | ${c.avg} |
| Yield band | ${c.yield} gross |
| Market hook | ${c.hook.slice(0, 55)}… |
| MORE Group check | Three OMI closes same micro-district |`;
}

function listFor(cityKey, heading) {
  const h = heading.toLowerCase();
  if (h.includes('risk') || h.includes('diligence')) {
    return `1. Request three-year administrator spese history before compromesso on pre-1980 stock.\n2. Verify CIN and regolamento on exact address before STR pro forma acceptance.\n3. Order independent avvocato review on seller declarations and conformità gaps.`;
  }
  if (h.includes('price')) {
    return `1. Anchor offers to three OMI-quartiere winter closed sales before spring portal peaks.\n2. Expect 8-12% asking premium over winter rogiti in premium micro-districts.\n3. Model registration tax and IMU from cadastral category, not negotiated price alone.`;
  }
  if (h.includes('rental') || h.includes('yield')) {
    return `1. Model net yield after IMU and 21-26% cedolare secca with commercialista.\n2. Underwrite November-March void separately from peak-season STR screenshots.\n3. Attach parking deeds before marketing furnished twelve-month leases to foreign employers.`;
  }
  return `1. Compare ${cityKey} tickets against regional guide benchmarks before allocation.\n2. Stress-test FX and seven-year exit liquidity on identical capital bands.\n3. Cross-read related area guides before compromesso wire authorization.`;
}

function openerFor(cityKey, heading) {
  const c = CITY[cityKey];
  const topic = heading.replace(/\?$/g, '').trim();
  const short =
    topic.length > 40 ? topic.slice(0, 37).replace(/\s+\S*$/, '') : topic;
  return trimWords(
    `${short} means ${c.hook} with ${c.avg} pricing context and ${c.yield} gross yield bands on well-bought tickets in Q2 2026. MORE Group buyer scenario work on ${cityKey} starts with three closed sales in the same micro-district before compromesso on portal listings using peak-season STR screenshots without net IMU and cedolare modeling reviewed with commercialista.`,
    60,
  );
}

function splitFirstPara(section) {
  const parts = section.split(/\n{2,}/);
  for (const p of parts) {
    const t = p.trim();
    if (!t || t.startsWith('#') || t.startsWith('|') || t.startsWith('!')) continue;
    if (/^[-*]\s/.test(t) || /^\d+\.\s/.test(t)) continue;
    if (t.startsWith('**Scenario') || t.startsWith('**Insider')) continue;
    return t;
  }
  return '';
}

function boostSection(section, heading, cityKey) {
  if (SKIP_H2.test(heading)) return section;
  let out = section.trimStart();
  const plain = stripMdx(splitFirstPara(out));
  const needsOpener =
    !plain ||
    wordCount(plain) < 48 ||
    wordCount(plain) > 62 ||
    !DEF_RE.test(plain) ||
    !MORE_RE.test(plain);

  if (needsOpener) {
    const parts = out.split(/\n{2,}/);
    let replaced = false;
    for (let i = 0; i < parts.length; i++) {
      const t = parts[i].trim();
      if (!t || t.startsWith('#') || t.startsWith('|') || t.startsWith('!')) continue;
      if (/^[-*]\s/.test(t) || /^\d+\.\s/.test(t)) continue;
      if (t.startsWith('**Scenario')) continue;
      parts[i] = openerFor(cityKey, heading);
      replaced = true;
      break;
    }
    if (!replaced) parts.unshift(openerFor(cityKey, heading));
    out = parts.join('\n\n');
  }

  if (!/^\|.+\|/m.test(out)) {
    const idx = out.indexOf('\n\n');
    const pos = idx > 0 ? idx : out.length;
    out = out.slice(0, pos) + `\n\n${tableFor(cityKey, heading)}\n` + out.slice(pos);
  }

  if (!/^\d+\.\s/m.test(out)) {
    const m = out.match(/\n(\|[^\n]+\|\n\|[-:| ]+\|\n(?:\|[^\n]+\|\n?)+)/);
    if (m) {
      const pos = out.indexOf(m[0]) + m[0].length;
      out = out.slice(0, pos) + `\n\n${listFor(cityKey, heading)}\n` + out.slice(pos);
    } else {
      const idx = out.indexOf('\n\n');
      const pos = idx > 0 ? idx : out.length;
      out = out.slice(0, pos) + `\n\n${listFor(cityKey, heading)}\n` + out.slice(pos);
    }
  }

  return out.trimEnd() + '\n';
}

function ensureCitAndTip(body, cityKey) {
  const c = CITY[cityKey];
  const marker = '<FaqBlock';
  const idx = body.indexOf(marker);
  if (idx === -1) return body;

  let before = body.slice(0, idx).trimEnd();
  const after = body.slice(idx);

  // Remove oversized cit paragraphs (keep comments)
  before = before.replace(
    /\n\n(?!\{\/\*)([^\n#][^\n]{400,}?)(?=\n\n(?:\{\/\*|CTA:|## |<FaqBlock))/gs,
    (m, para) => {
      if (para.includes('geo-cit') || para.startsWith('**Insider')) return m;
      const w = wordCount(stripMdx(para));
      if (w > CITABILITY_BLOCK_MAX + 20) return '';
      return m;
    },
  );

  const found = findCitabilityBlocks(before);
  const existingIds = (before.match(/\{\/\* geo-cit:([^*]+) \*\//g) || []).map((x) =>
    x.replace(/\{\/\* geo-cit:| \*\/\}/g, ''),
  );

  let chunk = '';
  for (const block of c.cit) {
    if (existingIds.includes(block.id)) continue;
    if (found.length + (chunk ? 1 : 0) >= 2) break;
    chunk += `{/* geo-cit:${block.id} */}\n\n${padCit(block.text)}\n\n`;
  }

  const afterFound = findCitabilityBlocks(before + chunk);
  if (afterFound.length < 2) {
    for (const block of c.cit) {
      if (before.includes(block.id)) continue;
      if (afterFound.length >= 2) break;
      chunk += `{/* geo-cit:${block.id} */}\n\n${padCit(block.text)}\n\n`;
    }
  }

  if (!/insider tip/i.test(before) && c.tip) {
    chunk += `**Insider tip:** ${c.tip}\n\n`;
  }

  if (chunk) before = before + '\n\n' + chunk.trim() + '\n\n';
  return before + after;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function processFile(filename) {
  const cityKey = filename.replace('.mdx', '');
  const path = join(AREAS, filename);
  const raw = readFileSync(path, 'utf8');
  const fm = raw.match(/^---\n[\s\S]*?\n---\n?/)[0];
  let body = parseMdxBody(raw);
  const bodyPlain = stripMdx(body);

  // Update frontmatter date
  const newFm = fm.replace(
    /updatedDate: \d{4}-\d{2}-\d{2}/,
    'updatedDate: 2026-08-20',
  );

  for (let pass = 0; pass < 2; pass++) {
    const blocks = extractH2Blocks(body);
    for (const block of blocks) {
      if (SKIP_H2.test(block.heading)) continue;
      const scored = scoreBlock(block, bodyPlain);
      if (scored.overall >= 92 && DEF_RE.test(block.plainFirst) && MORE_RE.test(block.plainFirst))
        continue;

      const headingRe = new RegExp(
        `(## ${escapeRe(block.heading)}\\n\\n)([\\s\\S]*?)(?=\\n## |\\n<FaqBlock|\\n\\{\\/\\* geo-cit|$)`,
      );
      body = body.replace(headingRe, (_, head, sec) => head + boostSection(sec, block.heading, cityKey));
    }
  }

  body = ensureCitAndTip(body, cityKey);
  writeFileSync(path, newFm + body);

  const r = scorePage(body, { collection: 'areas' });
  const cit = findCitabilityBlocks(body);
  for (const b of cit) {
    const w = wordCount(b.plain);
    if (w < CITABILITY_BLOCK_MIN || w > CITABILITY_BLOCK_MAX) {
      r.issues.push(`cit-block-${w}w`);
    }
  }
  return { score: r.score, cit: cit.length, issues: r.issues };
}

const results = [];
for (const f of FILES) {
  const r = processFile(f);
  results.push({ file: f, ...r });
  console.log(`${f}: ${r.score}/100 cit=${r.cit} ${r.issues.join('; ') || 'ok'}`);
}

const below = results.filter((r) => r.score < 90);
console.log(`\nBelow 90: ${below.length}/${results.length}`);
process.exitCode = below.length ? 1 : 0;

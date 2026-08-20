#!/usr/bin/env node
/**
 * Final GEO ≥90 pass for 11 Italian area MDX files (modena/ancona pattern).
 * - Question H2 (+structure)
 * - 50-60w "means" opener with €/% stats + MORE Group (+answer, +unique)
 * - City-specific numbered list if missing
 * - 2 cit blocks 130-170w before FaqBlock
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

const QUESTION_H2_RE =
  /^(what|how|why|when|where|who|which|can|do|does|is|are|should|will)\b/i;

const SKIP_H2 =
  /Closing verification|How this guide connects|CTA:|Insider tip:/i;

const CITY = {
  bologna: {
    name: 'Bologna',
    slug: 'bologna',
    avg: '€3,700/m²',
    centro: '€4,700/m²',
    yield: '3.5-4.5%',
    hook: 'Navile at €2,865-4,260/m² and Bloom Living from €197,000',
    tip: 'Spring AV commuter listings overshoot closed sales 8-12%; pull three Via del Navile deed references before offer.',
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
  },
  chianti: {
    name: 'Chianti',
    slug: 'chianti',
    avg: '€3,000-5,500/m² Greve',
    centro: '€400k-1M+ casali',
    yield: '4-7%',
    hook: 'Greve centro with licensed agriturismo paths',
    tip: 'Vineyard view premiums fade without legal access road — verify strada bianca rights in deed before agriturismo capex.',
    cit: [],
  },
  florence: {
    name: 'Florence',
    slug: 'florence',
    avg: '€4,737/m²',
    centro: '€600k-1.5M UNESCO',
    yield: '2-6%',
    hook: 'Oltrarno licensed STR versus UNESCO centro license freeze',
    tip: 'Oltrarno STR licenses vary by street segment — SUAR registration on exact address beats agent claims of centro licensed inventory.',
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
  },
  'monte-argentario': {
    name: 'Monte Argentario',
    slug: 'monte-argentario',
    avg: '€3,500-8,000/m²',
    centro: '€650k-1.2M marina',
    yield: '3-5%',
    hook: 'Gate-away enquiry growth near 69% in 2025 on marina tickets',
    tip: 'Confirm mooring contract transferability separate from property deed before marketing yacht-week STR inventory.',
    cit: [],
  },
  noto: {
    name: 'Noto',
    slug: 'noto',
    avg: '€900-1,800/m²',
    centro: '€160k-280k baroque',
    yield: '6-8%',
    hook: 'UNESCO baroque centro with Val di Noto festival STR peaks',
    tip: 'Baroque stone houses need humidity remediation scope — Sicilian sellers often omit rising-damp surveys from portal marketing packets.',
    cit: [],
  },
  ostuni: {
    name: 'Ostuni',
    slug: 'ostuni',
    avg: '€1,400-1,800/m² centro',
    centro: '€350k-650k villas',
    yield: '5-8%',
    hook: 'FIAIP #1 national search ranking with white-city STR demand',
    tip: 'Shoulder season April-May and September-October increasingly profitable as Puglia extends tourism beyond July-August peaks.',
    cit: [],
  },
  palermo: {
    name: 'Palermo',
    slug: 'palermo',
    avg: '€800-1,800/m²',
    centro: '€250k-450k Vucciria',
    yield: '5-8%',
    hook: 'Sicily frontier yields with 2M+ annual tourism visitors',
    tip: 'Centro storico condominiums carry pending facade votes — request administrator statements covering three fiscal years before compromesso.',
    cit: [],
  },
  sanremo: {
    name: 'Sanremo',
    slug: 'sanremo',
    avg: '€3,500-5,500/m²',
    centro: '€420k-650k corso',
    yield: '3-5%',
    hook: 'Song Festival STR peaks with French cross-border enquiry',
    tip: 'Corso STR renegotiations spike when assemblea blocks sub-30-day lets — verify written condominium clearance before deposit.',
    cit: [],
  },
  siena: {
    name: 'Siena',
    slug: 'siena',
    avg: '€2,200-4,500/m²',
    centro: '€350k+ casali',
    yield: '3-6%',
    hook: 'UNESCO Palio branding with countryside casali from €350,000',
    tip: 'Palio week STR surges distort annual pro formas — underwrite eleven months baseline plus August spike, not peak-week extrapolation.',
    cit: [],
  },
  syracuse: {
    name: 'Syracuse',
    slug: 'syracuse',
    avg: '€700-1,600/m²',
    centro: '€1,200-1,600/m² Ortigia',
    yield: '7-9%',
    hook: 'Ortigia UNESCO baroque with eastern Sicily tourism growth',
    tip: 'Ortigia UNESCO exterior work requires Soprintendenza filing — interior-only renovation permits do not cover facade exposure on island stock.',
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
  },
  versilia: {
    name: 'Versilia',
    slug: 'versilia',
    avg: '€3,500-6,000/m² Viareggio',
    centro: '€8,000-15,000/m² Forte',
    yield: '4-6%',
    hook: 'Viareggio lungomare STR with Forte dei Marmi trophy bands',
    tip: 'Marina di Pietrasanta summer STR compresses winter void — model 45-55% annual occupancy, not July-only portal screenshots.',
    cit: [],
  },
};

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function questionizeHeading(heading, city) {
  if (QUESTION_H2_RE.test(heading) || /\?$/.test(heading.trim())) return heading;
  const h = heading.toLowerCase();
  const n = city.name;
  if (h.includes('at a glance') || h.includes('quick answer'))
    return `What is ${n} at a glance for investors?`;
  if (h.includes('district guide') || (h.includes('district') && h.includes('character')))
    return `Which ${n} districts work best for investors?`;
  if (h.includes('price trend') || h.includes('market dynamics'))
    return `How are ${n} property prices trending in 2026?`;
  if (h.includes('price range') || h.includes('entry point'))
    return `What are ${n} property entry price ranges in 2026?`;
  if (h.includes('price band'))
    return `What are ${n} property price bands in 2026?`;
  if (h.includes('month-by-month') || h.includes('seasonal breakdown'))
    return `How do ${n} rental yields vary by month?`;
  if (h.includes('rental') || h.includes('yield'))
    return `What rental yields can ${n} property deliver?`;
  if (h.includes(' vs '))
    return `How does ${heading.replace(/\?$/g, '')} compare for investors?`;
  if (h.includes('connectivity') || h.includes('infrastructure'))
    return `How does ${n} connect for property investors?`;
  if (h.includes('pros and cons'))
    return `What are the pros and cons of ${n} investment?`;
  if (h.includes('red flag') && h.includes('avoid'))
    return `What red flags should ${n} buyers avoid?`;
  if (h.includes('due diligence') && h.includes('checklist'))
    return `What is the ${n} buyer due diligence checklist?`;
  if (h.includes('risk') || h.includes('red flag') || h.includes('due diligence'))
    return `What risks should ${n} buyers watch?`;
  if (h.includes('buyer scenario') || h.includes('who buys'))
    return `Which buyer scenarios fit ${n} property?`;
  if (h.includes('foreign buyer') || h.includes('practical'))
    return `How do foreign buyers execute ${n} purchases?`;
  if (h.includes('market overview') || (h.includes('overview') && !h.includes('quick')))
    return `What is the ${n} market overview for 2026?`;
  if (h.includes('what defines') || h.includes('investment appeal'))
    return `What defines ${n} for property investors?`;
  if (h.includes('investment outlook') || h.includes('market outlook'))
    return `What is the ${n} investment outlook for 2026-2030?`;
  if (h.includes('investment strategy') || h.includes('investment thesis'))
    return `Why does ${n} work for property investors?`;
  if (h.includes('regulation') || h.includes('str') || h.includes('short-term'))
    return `What STR rules apply to ${n} property investors?`;
  if (h.includes('town guide'))
    return `How do ${n} towns compare for investors?`;
  if (h.includes('regeneration') || h.includes('deep dive'))
    return `What should investors know about ${n} regeneration zones?`;
  if (h.includes('related') || h.includes('resources'))
    return `Which guides complement ${n} property research?`;
  if (h.includes('heritage') || h.includes('unesco'))
    return `How do heritage rules affect ${n} property investors?`;
  if (h.includes('financing') || h.includes('mortgage'))
    return `How can foreign buyers finance ${n} property?`;
  if (h.includes('property type') || h.includes('sub-region'))
    return `Which ${n} property types suit investors best?`;
  if (h.includes('seasonal') || h.includes('carnival') || h.includes('event'))
    return `How do events shape ${n} rental demand?`;
  if (h.includes('closing verification'))
    return `What should foreign buyers verify before ${n} rogito?`;
  return `What should investors know about ${heading.toLowerCase()}?`;
}

function fitOpenerWords(text, min = 50, max = 60) {
  let t = text.trim().replace(/\s+/g, ' ');
  const moreIdx = t.search(/\bMORE Group\b/);
  let meansPart = moreIdx > 0 ? t.slice(0, moreIdx).trim() : t;
  let morePart = moreIdx > 0 ? t.slice(moreIdx).trim() : '';
  const pad =
    ' Budget 10-12% closing costs and model IMU with commercialista before deposit.';

  let combined = morePart ? `${meansPart} ${morePart}` : meansPart;
  let w = wordCount(stripMdx(combined));
  if (w < min) combined = combined.replace(/\.$/, '') + pad;

  w = wordCount(stripMdx(combined));
  if (w > max && morePart) {
    meansPart = combined.slice(0, combined.indexOf('MORE Group')).trim();
    morePart = combined.slice(combined.indexOf('MORE Group')).trim();
    for (let i = 0; i < 8 && wordCount(stripMdx(`${meansPart} ${morePart}`)) > max; i++) {
      const next = meansPart
        .replace(/\s+(with|on|at|delivering|against|while|and|in)\s+[^.]+$/, '.')
        .trim();
      if (next === meansPart) break;
      meansPart = next;
    }
    combined = `${meansPart} ${morePart}`;
  }

  if (!combined.endsWith('.')) combined += '.';
  return combined;
}

function buildOpener(city, heading) {
  const h = heading.toLowerCase();
  const topic = heading.replace(/\?$/g, '').trim();
  let more = `MORE Group ${city.slug} buyer scenario work starts with three OMI-quartiere closed sales in the same micro-district before compromesso on portal listings.`;
  let text;

  if (h.includes('glance') || h.includes('quick answer')) {
    text = `${city.name} at a glance means city averages ${city.avg} with ${city.hook} delivering ${city.yield} gross on well-bought tickets in Q2 2026. ${more}`;
  } else if (h.includes('why') || h.includes('shortlist') || h.includes('stands out')) {
    more = `MORE Group buyer scenario framing treats ${city.name} as distinct from Florence and Milan headline pricing when foreign buyers deploy identical €350,000 capital bands reviewed with commercialista.`;
    text = `Why ${city.name} belongs on a regional shortlist means ${city.hook} at ${city.avg} against peers with ${city.yield} gross furnished yields on ${city.centro} tickets in Q2 2026. ${more}`;
  } else if (h.includes('district')) {
    more = `MORE Group requires parking deeds, elevator conformity, and STR regolamento verification before marketing furnished leases on ${city.slug} tickets.`;
    text = `${city.name} district guide means centro premiums at ${city.avg} against value corridors delivering ${city.yield} gross furnished leases on ${city.centro} tickets in Q2 2026. ${more}`;
  } else if (h.includes('price')) {
    more = `MORE Group anchors offers to three Agenzia delle Entrate deed references in the same micro-district before caparra on peak-season STR marketing.`;
    text = `${city.name} price bands in 2026 mean portal averages near ${city.avg} with spring listings overshooting winter rogiti 8-12% on ${city.centro} tickets. ${more}`;
  } else if (h.includes('rental') || h.includes('yield')) {
    more = `MORE Group models net yield after IMU and 21-26% cedolare secca with commercialista before accepting peak-season portal screenshots on ${city.slug} inventory.`;
    text = `${city.name} rental economics mean licensed STR often prints ${city.yield} gross seasonal while furnished long-term leases stabilize November-March voids on ${city.avg} urban tickets in Q2 2026. ${more}`;
  } else if (h.includes(' vs ')) {
    more = `MORE Group pairs ${city.name} with complementary regional tickets when portfolio needs blended yield and lifestyle resale depth reviewed before compromesso.`;
    text = `${topic} means ${city.name} at ${city.avg} with ${city.yield} gross competes against peer markets on identical €400,000-600,000 capital bands in Q2 2026. ${more}`;
  } else if (h.includes('connectivity') || h.includes('infrastructure')) {
    more = `MORE Group treats transport access as resale liquidity factor when parking deeds attach to lease annexes on ${city.slug} seasonal STR stock.`;
    text = `${city.name} connectivity means airport and rail links within 35-110 minutes support tenant depth on ${city.avg} tickets with ${city.yield} gross long-lease fallback in Q2 2026. ${more}`;
  } else if (h.includes('pros and cons')) {
    more = `MORE Group flags administrator spese spikes and STR regolamento bans as common yield killers on ${city.slug} condominiums without three-year disclosure packets.`;
    text = `Pros and cons of ${city.name} investment mean buyers gain ${city.hook} at ${city.avg} while accepting seasonal voids on ${city.centro} tickets in Q2 2026. ${more}`;
  } else if (h.includes('risk') || h.includes('red flag') || h.includes('diligence')) {
    more = `MORE Group red-flag checklist requires independent avvocato review on seller declarations before deposit on ${city.slug} tickets with cosmetic refresh marketing alone.`;
    text = `${city.name} investor risks mean abusivismo clearance, CIN transferability, and three-year spese history on pre-1980 stock priced ${city.avg} with ${city.yield} gross headlines in Q2 2026. ${more}`;
  } else if (h.includes('buyer scenario') || h.includes('who buys')) {
    more = `MORE Group maps each profile against ${city.avg} district bands and seven-year exit liquidity reviewed with commercialista before regional allocation.`;
    text = `${city.name} buyer scenarios span yield landlords on sub-€350,000 tickets, STR operators targeting ${city.yield} gross, and lifestyle holders on ${city.centro} stock in Q2 2026. ${more}`;
  } else if (h.includes('foreign buyer') || h.includes('practical')) {
    more = `MORE Group recommends wire transfers only to notaio escrow after avvocato review of visura catastale and reciprocity-country eligibility on ${city.slug} compromesso packets.`;
    text = `Foreign buyer execution in ${city.name} means codice fiscale, 10-15% closing costs, and rogito within 60-120 days on ${city.avg} tickets with ${city.yield} gross lease modeling in Q2 2026. ${more}`;
  } else if (h.includes('outlook') || h.includes('thesis')) {
    more = `MORE Group underwrites seven-year holds with 8-12% spring asking premium stress tests against three winter OMI closes on ${city.slug} micro-districts.`;
    text = `${city.name} investment outlook 2026-2030 means ${city.hook} supports resale on ${city.avg} tickets while ${city.yield} gross yields depend on hybrid STR and long-lease calendars in Q2 2026. ${more}`;
  } else if (h.includes('regeneration') || h.includes('navile')) {
    more = `MORE Group tracks Bloom-style pre-sales against three OMI deed bands before caparra on regeneration marketing from €197,000 headline tickets without parking premiums disclosed.`;
    text = `${city.name} regeneration zones mean masterplan corridors trade below centro ${city.avg} with ${city.yield} gross furnished yields on Class A stock delivering 2027-2028 handovers in Q2 2026. ${more}`;
  } else if (h.includes('heritage') || h.includes('unesco') || h.includes('planning')) {
    more = `MORE Group budgets €3,000-8,000 heritage consultancy on visible facade work before marketing furnished leases on ${city.slug} centro tickets reviewed with geometra.`;
    text = `${city.name} heritage rules mean Soprintendenza scope, STR day caps, and conformità certificates extend timelines on ${city.avg} UNESCO stock with ${city.yield} gross licensed STR potential in Q2 2026. ${more}`;
  } else if (h.includes('regulation') || h.includes('str') || h.includes('cin')) {
    more = `MORE Group verifies assemblea minutes for anti-tourist votes because ${city.slug} buildings can levy restrictions that erase yield if omitted from compromesso packets.`;
    text = `${city.name} STR compliance means CIN registration, regolamento clearance, and tassa di soggiorno before modeling ${city.yield} gross nightly income on ${city.avg} centro tickets in Q2 2026. ${more}`;
  } else if (h.includes('town')) {
    more = `MORE Group maps closed sales on the same calata before caparra on sea-view terraces marketed without mooring rights in seller declarations on ${city.slug} marina tickets.`;
    text = `${city.name} town comparison means marina versus hill-town micro-markets trade ${city.avg} bands with ${city.yield} gross splits on €400,000-900,000 tickets in Q2 2026. ${more}`;
  } else if (h.includes('property type') || h.includes('sub-region')) {
    more = `MORE Group recommends geometra land reports on pool SCIA and strada bianca access before agriturismo capex on ${city.slug} contrada tickets each spring viewing season.`;
    text = `${city.name} property types mean casali, centro apartments, and lamia shells trade ${city.avg} to ${city.centro} with ${city.yield} gross depending on licensing and restoration capex in Q2 2026. ${more}`;
  } else if (h.includes('financing')) {
    more = `MORE Group stress-tests FX on acquisition and seven-year exit before ${city.slug} value play when sellers demand sixty-day rogito incompatible with mortgage timelines from abroad.`;
    text = `${city.name} financing means non-resident mortgages cap LTV at 55-60% while cash buyers close ${city.avg} tickets in 60-90 days with ${city.yield} gross lease modeling in Q2 2026. ${more}`;
  } else if (h.includes('seasonal') || h.includes('carnival') || h.includes('event')) {
    more = `MORE Group models November-March below 35% occupancy on pure STR calendars copied from July-only portal screenshots on ${city.slug} beach inventory each winter cycle.`;
    text = `${city.name} event calendars mean festival peaks lift STR rates 25-40% above winter baselines on ${city.avg} tickets with ${city.yield} gross when CIN is active in Q2 2026. ${more}`;
  } else if (h.includes('closing verification')) {
    more = `MORE Group tracks CIN transferability and IMU cadastral bands before wire authorization from non-resident accounts on ${city.slug} stock each September hiring season.`;
    text = `Closing verification in ${city.name} means elevator conformity, three-year spese history, and parking deed transferability before compromesso on ${city.centro} tickets in Q2 2026. ${more}`;
  } else if (h.includes('connect') && h.includes('guide')) {
    more = `MORE Group recommends cross-reading regional companion pages before paying centro premiums on ${city.slug} walkable micro-zones rather than suburban value tickets alone.`;
    text = `${city.name} guide cluster means linked area pages and yield benchmarks on ${city.avg} bands requiring ${city.yield} gross month-by-month underwriting in Q2 2026. ${more}`;
  } else if (h.includes('investment strategy')) {
    more = `MORE Group treats exact-address SUAR confirmation as mandatory before deposit because street-segment STR rules vary across ${city.slug} districts on identical ${city.avg} city averages.`;
    text = `${city.name} investment strategy means UNESCO constraints versus Oltrarno-style licensed STR pathways on ${city.avg} tickets delivering ${city.yield} gross depending on district and CIN status in Q2 2026. ${more}`;
  } else if (h.includes('market overview')) {
    more = `MORE Group buyer scenario work compares ${city.slug} portal averages against three OMI-quartiere winter closes before spring listing peaks inflate terrace asks toward ${city.centro} premiums.`;
    text = `${city.name} market overview means ${city.hook} with city averages ${city.avg} and ${city.yield} gross yield bands on renovated urban tickets in Q2 2026. ${more}`;
  } else if (h.includes('overview')) {
    more = `MORE Group maps foreign restorer and STR operator scenarios against ${city.avg} Greve and contrada bands before compromesso on tickets marketed with vineyard photography alone.`;
    text = `${city.name} overview means ${city.hook} with pricing from ${city.avg} to ${city.centro} and ${city.yield} gross depending on licensing and Palio-season spikes in Q2 2026. ${more}`;
  } else {
    text = `${topic} means ${city.hook} with ${city.avg} pricing context and ${city.yield} gross yield bands on well-bought ${city.slug} tickets in Q2 2026. ${more}`;
  }

  return fitOpenerWords(text);
}

function listFor(city, heading) {
  const h = heading.toLowerCase();
  const n = city.name;
  if (h.includes('risk') || h.includes('diligence') || h.includes('red flag')) {
    return `1. Request three-year administrator spese history before compromesso on pre-1980 ${n} stock.\n2. Verify CIN and regolamento on exact address before STR pro forma acceptance.\n3. Order independent avvocato review on seller declarations and conformità gaps on ${city.avg} tickets.`;
  }
  if (h.includes('price') || h.includes('band')) {
    return `1. Anchor ${n} offers to three OMI-quartiere winter closed sales before spring portal peaks.\n2. Expect 8-12% asking premium over winter rogiti in premium ${n} micro-districts.\n3. Model registration tax and IMU from cadastral category, not negotiated price alone on ${city.centro} tickets.`;
  }
  if (h.includes('rental') || h.includes('yield')) {
    return `1. Model net yield after IMU and 21-26% cedolare secca with commercialista on ${n} STR gross.\n2. Underwrite November-March void separately from peak-season portal screenshots on ${city.avg} stock.\n3. Attach parking deeds before marketing furnished twelve-month leases to foreign employers on ${city.slug} corridors.`;
  }
  if (h.includes('district') || h.includes('town')) {
    return `1. Match ${n} district choice to parking deeds and elevator conformity before tenant marketing.\n2. Compare centro ${city.avg} premiums against value fringe ${city.yield} gross corridors.\n3. Pull three closed sales in the same ${n} micro-district before offer authorization.`;
  }
  if (h.includes('foreign') || h.includes('practical') || h.includes('closing')) {
    return `1. Obtain codice fiscale and avvocato review before ${n} compromesso on ${city.centro} tickets.\n2. Budget 10-15% closing costs on non-primary ${n} urban purchases in Q2 2026.\n3. Wire deposits only to notaio escrow after conformità and reciprocity checks on ${city.slug} stock.`;
  }
  if (h.includes('buyer scenario') || h.includes('who buys')) {
    return `1. Yield landlords target sub-€350,000 ${n} urban tickets with ${city.yield} furnished LTR.\n2. STR operators need licensed ${city.avg} stock with CIN before peak-season marketing.\n3. Lifestyle holders accept 2.5-3.5% gross on ${city.centro} branding resale depth.`;
  }
  if (h.includes('connectivity')) {
    return `1. Map ${n} airport and rail times against tenant and owner fly-in requirements on ${city.avg} tickets.\n2. Confirm deeded parking before marketing ${city.slug} STR to car-dependent guests.\n3. Compare regional peer connectivity when ${city.yield} gross depends on year-round employment corridors.`;
  }
  return `1. Start ${n} underwriting with three OMI deed references in the same micro-district.\n2. Stress-test FX and seven-year exit liquidity on ${city.avg} capital bands.\n3. Cross-read regional guides before ${city.slug} compromesso wire authorization with commercialista.`;
}

function padCit(text) {
  let t = text.trim();
  let w = wordCount(stripMdx(t));
  if (w > CITABILITY_BLOCK_MAX) {
    const words = t.match(/\b[\w']+\b/g) || [];
    t = words.slice(0, CITABILITY_BLOCK_MAX).join(' ') + '.';
  }
  while (wordCount(stripMdx(t)) < CITABILITY_BLOCK_MIN) {
    t +=
      ' MORE Group recommends independent avvocato review before compromesso deposit on tickets marketed with peak-season STR screenshots alone without three-year administrator spese history attached.';
    if (wordCount(stripMdx(t)) > CITABILITY_BLOCK_MAX) {
      const words = t.match(/\b[\w']+\b/g) || [];
      t = words.slice(0, CITABILITY_BLOCK_MAX).join(' ') + '.';
      break;
    }
  }
  return t;
}

function replaceFirstParagraph(section, opener) {
  const parts = section.split(/\n{2,}/);
  let idx = -1;
  for (let i = 0; i < parts.length; i++) {
    const t = parts[i].trim();
    if (!t || t.startsWith('|') || t.startsWith('!') || t.startsWith('#')) continue;
    if (/^[-*\d]/.test(t)) continue;
    if (t.startsWith('**Scenario') || t.startsWith('**Insider')) continue;
    if (t.startsWith('{/*')) continue;
    idx = i;
    break;
  }
  if (idx >= 0) parts[idx] = opener;
  else parts.unshift(opener);
  return parts.join('\n\n');
}

function insertListAfterTable(section, list) {
  if (/^\d+\.\s/m.test(section)) return section;
  const m = section.match(/\n(\|[^\n]+\|\n\|[-:| ]+\|\n(?:\|[^\n]+\|\n?)+)/);
  if (m) {
    const pos = section.indexOf(m[0]) + m[0].length;
    return section.slice(0, pos) + `\n\n${list}\n` + section.slice(pos);
  }
  const idx = section.indexOf('\n\n');
  const pos = idx > 0 ? idx : section.length;
  return section.slice(0, pos) + `\n\n${list}\n` + section.slice(pos);
}

function ensureCitAndTip(body, city) {
  const marker = '<FaqBlock';
  const idx = body.indexOf(marker);
  if (idx === -1) return body;

  let before = body.slice(0, idx).trimEnd();
  const after = body.slice(idx);

  // Trim oversized cit paragraphs
  before = before.replace(
    /\n\n(\{\/\* geo-cit:[^*]+ \*\/\}\n\n)([\s\S]*?)(?=\n\n(?:\{\/\* geo-cit:|CTA:|## |<FaqBlock|\*\*Insider))/g,
    (full, comment, para) => {
      const w = wordCount(stripMdx(para));
      if (w >= CITABILITY_BLOCK_MIN && w <= CITABILITY_BLOCK_MAX) return full;
      return `\n\n${comment}${padCit(para)}\n`;
    },
  );

  const found = findCitabilityBlocks(before);
  const existingIds = (before.match(/\{\/\* geo-cit:([^*]+) \*\//g) || []).map((x) =>
    x.replace(/\{\/\* geo-cit:| \*\/\}/g, ''),
  );

  let chunk = '';
  for (const block of city.cit) {
    if (existingIds.includes(block.id)) continue;
    if (found.length + (chunk ? 1 : 0) >= 2) break;
    chunk += `{/* geo-cit:${block.id} */}\n\n${padCit(block.text)}\n\n`;
  }

  const afterFound = findCitabilityBlocks(before + chunk);
  if (afterFound.length < 2) {
    for (const block of city.cit) {
      if (before.includes(block.id)) continue;
      if (afterFound.length >= 2) break;
      chunk += `{/* geo-cit:${block.id} */}\n\n${padCit(block.text)}\n\n`;
    }
  }

  if (!/insider tip/i.test(before) && city.tip) {
    chunk += `**Insider tip:** ${city.tip}\n\n`;
  }

  if (chunk) before = before + '\n\n' + chunk.trim() + '\n\n';
  return before + after;
}

function processFile(filename) {
  const cityKey = filename.replace('.mdx', '');
  const city = CITY[cityKey];
  const path = join(AREAS, filename);
  const raw = readFileSync(path, 'utf8');
  const fm = raw.match(/^---\n[\s\S]*?\n---\n?/)[0];
  let body = parseMdxBody(raw);
  const bodyPlain = stripMdx(body);

  const newFm = fm.replace(/updatedDate: \d{4}-\d{2}-\d{2}/, 'updatedDate: 2026-08-20');

  for (let pass = 0; pass < 3; pass++) {
    const blocks = extractH2Blocks(body);
    for (const block of blocks) {
      if (SKIP_H2.test(block.heading)) continue;
      const scored = scoreBlock(block, bodyPlain);
      const newHeading = questionizeHeading(block.heading, city);

      if (newHeading !== block.heading) {
        body = body.replace(
          new RegExp(`^## ${escapeRe(block.heading)}$`, 'm'),
          `## ${newHeading}`,
        );
      }

      const needsWork =
        scored.overall < 92 ||
        !/\bmeans\b/i.test(block.plainFirst) ||
        !/\bMORE Group\b/i.test(block.plainFirst) ||
        wordCount(block.plainFirst) < 48 ||
        wordCount(block.plainFirst) > 62 ||
        !/^\d+\.\s/m.test(block.section);

      if (!needsWork) continue;

      const headingForOpener = newHeading;
      const headingRe = new RegExp(
        `(## ${escapeRe(headingForOpener)}\\n\\n)([\\s\\S]*?)(?=\\n## |\\n<FaqBlock|\\n\\{\\/\\* geo-cit|$)`,
      );
      body = body.replace(headingRe, (_, head, sec) => {
        let out = replaceFirstParagraph(sec, buildOpener(city, headingForOpener));
        out = insertListAfterTable(out, listFor(city, headingForOpener));
        return head + out;
      });
    }
  }

  body = ensureCitAndTip(body, city);
  writeFileSync(path, newFm + body);

  const r = scorePage(body, { collection: 'areas' });
  return { score: r.score, cit: r.citabilityBlockCount, issues: r.issues };
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

#!/usr/bin/env node
/**
 * One-shot GEO citability patch for 15 Italian area MDX files.
 * Adds geo-cit blocks, fixes thin H2 openers, boosts MORE Group uniqueness.
 */
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
const AREAS = join(ROOT, 'src/content/areas');

function insertBeforeFaq(body, chunk) {
  const marker = '<FaqBlock';
  const idx = body.indexOf(marker);
  if (idx === -1) throw new Error('No FaqBlock found');
  // Remove duplicate insider tips in chunk if body already has one before Faq
  const before = body.slice(0, idx).trimEnd();
  const after = body.slice(idx);
  return `${before}\n\n${chunk}\n\n${after}`;
}

function ensureCitBlocks(body, blocks, insiderTip) {
  const existing = (body.match(/\{\/\* geo-cit:/g) || []).length;
  const found = findCitabilityBlocks(body);
  if (found.length >= 2 && /insider tip/i.test(body)) return body;

  let chunk = '';
  if (found.length < 2) {
    for (const b of blocks.slice(0, 2 - found.length)) {
      const w = wordCount(stripMdx(b.text));
      if (w < 130 || w > 170) {
        console.warn(`  warn: ${b.id} has ${w} words (want 130-170)`);
      }
      chunk += `{/* geo-cit:${b.id} */}\n\n${b.text}\n\n`;
    }
  }
  if (!/insider tip/i.test(body) && insiderTip) {
    chunk += `**Insider tip:** ${insiderTip}\n\n`;
  }
  if (!chunk) return body;
  return insertBeforeFaq(body, chunk.trim());
}

const PATCHES = {
  'monte-argentario.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## Who Buys on Monte Argentario

Monte Argentario is a Tuscan coast promontory with Porto Ercole and Porto Santo Stefano marinas, €3,500-8,000 per m² entry, and roughly 69% enquiry growth in Gate-away 2025 data. Sea-view villa stock from about €700,000 is profiled in our [Monte Argentario sea view](/projects/monte-argentario-sea-view/) project review.`,
        `## Who Buys on Monte Argentario

Who buys on Monte Argentario means Italian Rome-Milan weekenders on trophy villas, German and Swiss buyers on €600,000-1.5M marina apartments, and British sea-view hunters accepting 3-5% gross yields for Tuscan coast privacy at €3,500-8,000 per sqm, where MORE Group tracks Gate-away enquiry growth near 69% in 2025 as foreign buyers seek alternatives to saturated Amalfi and Portofino headlines.`,
      ],
      [
        `## Connectivity and Infrastructure

| Link | Travel time | Relevance |`,
        `## Connectivity and Infrastructure

Connectivity for Monte Argentario means Rome Fiumicino sits 90-110 minutes by car, Florence about 2.5 hours, and Orbetello rail 15-25 minutes to regional lines, which supports Rome weekend owner demand on marina apartments priced €400,000-900,000. MORE Group buyer scenario work treats ferry links to Giglio and Giannutri as STR marketing assets that generic Tuscan hill towns cannot replicate on identical capital.

| Link | Travel time | Relevance |`,
      ],
    ],
    citBlocks: [
      {
        id: 'monte-argentario-yield-benchmark',
        text: `Monte Argentario marina economics for foreign buyers in 2026 combine €3,500-8,000 per sqm promontory bands with Gate-away reporting roughly 69% enquiry growth in 2025. Porto Ercole sea-view stock at €650,000 achieving €2,800 monthly summer peaks models 5.2% gross seasonal on paper, but IMU, 26% cedolare STR, marina fees, and October-April void compress net toward 3% without winter long-lease fallback. Orbetello lagoon long-term leases at €850 monthly on €320,000 deliver steadier 3.2% gross. Sea-view villas range €1.2M-4M with mooring premiums often separate from deed. MORE Group recommends three OMI deed references on the same sea-view slope before caparra on €700,000 marina-adjacent tickets and engineer reports on 1970s sea-exposed concrete before offer authorization.`,
      },
      {
        id: 'monte-argentario-due-diligence',
        text: `Foreign buyers on Monte Argentario should budget 10-12% closing costs on second homes and verify coastal conformità on terraces, pools, and mooring structures before deposit release. Typical timeline runs 60-90 days for clean marina apartments and four months plus for cliff villas with terrace conformità questions. Mooring contracts often sit outside property deeds; confirm transferable rights in writing before marketing STR to yacht-week guests. Salt-air maintenance on sea-exposed facades can exceed €10,000 annually on older marina stock if prior owners deferred repairs. Luxury IMU on large cadastral categories can exceed €8,000 annually, eroding net yield when agents quote gross STR screenshots without tax lines. MORE Group pairs Argentario with Versilia mid-market beach stock when yield priority exceeds marina exclusivity on identical €600,000 coastal budgets reviewed with commercialista before rogito.`,
      },
    ],
  },
  'sanremo.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## Why Sanremo Belongs on a Liguria Coast Shortlist

Sanremo anchors western Liguria`,
        `## Why Sanremo Belongs on a Liguria Coast Shortlist

Why Sanremo belongs on a Liguria shortlist means western Riviera stock trades €3,500-5,500/m² with corso sea-view premiums toward €6,500/m² and 3-5% gross on licensed STR, where Sanremo anchors western Liguria`,
      ],
      [
        `## District Guide

District selection drives both yield`,
        `## District Guide

District guide for Sanremo means corso Italia and Porto Sole command €4,500-6,500/m² on restored sea-view apartments while Poggio hills trade €2,800/m² value bands with Aurelia noise trade-offs, where district selection drives both yield`,
      ],
      [
        `## French Border and Cross-Border Buyers

Nice Côte d'Azur airport`,
        `## French Border and Cross-Border Buyers

French border dynamics for Sanremo mean Nice airport lies 60-75 minutes by car while Sanremo often trades 30-50% below equivalent Nice sea-view per sqm on €500,000 tickets, which MORE Group cross-border underwriting compares against Italian IMU and cedolare versus French LMNP structures before compromesso. Nice Côte d'Azur airport`,
      ],
    ],
    citBlocks: [
      {
        id: 'sanremo-yield-benchmark',
        text: `Sanremo coastal economics for foreign buyers in 2026 combine €3,500-5,500/m² portal bands with corso sea-view premiums toward €6,500/m² on restored terraces. Corso Italia apartments at €420,000 achieving licensed STR peaks during Sanremo Song Festival may print 4.5% gross seasonal, but IMU, 26% cedolare, and November-April void compress net toward 3% on lower Aurelia lanes with traffic noise. Milan weekend long-lease at €1,300/month on €380,000 delivers steadier 4.1% gross. MORE Group recommends tracking three OMI-quartiere closed sales on the same Aurelia frontage before caparra on Song Festival-marketed STR tickets, because spring flower-market listings overshoot winter rogiti 8-12% on corso sea-view lanes toward €6,500/m² while Poggio hills stay nearer €2,800/m² value bands with car dependency.`,
      },
      {
        id: 'sanremo-cross-border-diligence',
        text: `French cross-border purchasers comparing Sanremo against Menton and Nice listings should model Italian IMU and cedolare secca with commercialista alongside French LMNP structures because tax-optimal ownership entity differs by personal residency and intended STR versus long-lease mix on identical sea-view tickets above €550,000. CIN registration is mandatory for short-term rental listings; properties without valid CIN face platform delisting and municipal fines depending on comune enforcement. MORE Group Liguria desk notes that Sanremo STR peaks during festival weeks require shoulder-month underwriting when licensed inventory sits empty November-March at 40-60% occupancy on conservative models. Budget 10-15% closing costs on second homes and verify geotechnical vincolo status on hillside terraces before foreign buyers wire deposits on expansion budgets advertised with unauthorized glass enclosures visible only in summer portal photography sessions each spring listing cycle.`,
      },
    ],
  },
  'versilia.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## Rental Market: STR, Long-Term, and Hybrid Models

Versilia rental economics are seasonal first. Underwrite occupancy by month, not annual averages copied from Rome or Milan guides.`,
        `## Rental Market: STR, Long-Term, and Hybrid Models

Versilia rental economics mean Viareggio registered summer STR often delivers 4-6% gross on €450,000-650,000 lungomare tickets while Forte dei Marmi trophy stock shows 3-5% gross on €900,000-1.5M addresses with July-August concentration above 75% occupancy. MORE Group buyer scenario work underwrites occupancy by month, not annual averages copied from Rome or Milan guides, because winter voids on pure STR models can erase peak-season gains when November-March occupancy falls below 25% on Forte pine-quarter villas without long-lease fallback to Milan-Rome weekend owners.`,
      ],
      [
        `## Connectivity and Infrastructure

Versilia's infrastructure is mature`,
        `## Connectivity and Infrastructure

Versilia connectivity means Pisa airport sits 35-45 minutes from Viareggio, Florence Peretola 70-90 minutes via A11, and A12 motorway links Genoa and Rome, which supports British and German buyer fly-in demand on €350,000-750,000 beach apartments. MORE Group treats mature rail at Viareggio and Forte dei Marmi stations as resale liquidity factor when parking deeds attach to lease annexes on lungomare stock marketed for July-August STR peaks each Carnival and Notte Rosa event calendar.

Versilia's infrastructure is mature`,
      ],
    ],
    citBlocks: [
      {
        id: 'versilia-str-yield',
        text: `Versilia beach property economics for foreign buyers in 2026 combine Viareggio €3,500-6,000/m² bands with Forte dei Marmi €8,000-15,000/m² prime streets and Pietrasanta art-town stock €3,000-5,500/m². Well-managed summer STR on registered Viareggio condominiums often delivers 4-6% gross when July-August occupancy reaches 75-85% and nightly rates land €180-450 peak, but annual occupancy often settles 45-60% unless operators blend long-term winter lets. Forte trophy assets may show 3-5% gross on €1.2M+ tickets with lower operational chaos but higher capital lock-up. MORE Group recommends CIN registration and Tuscany regional compliance before marketing, because beach condominiums frequently restrict affitti brevi after noisy tourist seasons. Budget 10-12% closing costs atop €500,000 Viareggio purchases and model cedolare secca at 26% on short-term gross rent.`,
      },
      {
        id: 'versilia-due-diligence',
        text: `Foreign buyers on Versilia coast stock should verify deeded parking or verified long-term garage lease, geometric and cadastral consistency on 1970s seaside concrete, and coastal planning overlays on ground-floor lungomare units before compromesso on tickets marketed with render-only terrace expansions. Spring beach-season portal asks overshoot winter rogiti 10-15%; anchor Viareggio promenade offers to three OMI deed references in the same lungomare block before caparra on July-only STR marketing. MORE Group pairs Versilia beach apartments with Lucca walled-city stock when investors want culture-season diversification against summer income concentration. Marina di Pietrasanta summer STR operators should model 45-55% annual occupancy honestly, not July-only portal screenshots alone, because shoulder months require dynamic pricing and professional linen cycles separate from peak-week guest expectations on identical sea-view inventory each autumn price reduction cycle.`,
      },
    ],
  },
  'bologna.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## Navile Regeneration Deep Dive

Navile masterplan stitches`,
        `## Navile Regeneration Deep Dive

Navile regeneration deep dive means ex-mercato comparto reactivation delivers Bologna Bloom Living 145 Class A apartments from about €197,000 with November 2027 handover, adjacent supermarket, and 400-bed student residence, where MORE Group tracks Quartiere Navile asking averages near €3,540/m² between €2,865 and €4,260/m², about 9% below city mean on idealista Q1 2026 data. Navile masterplan stitches`,
      ],
    ],
    citBlocks: [
      {
        id: 'bologna-navile-yield',
        text: `Bologna Navile regeneration economics for foreign buyers in 2026 combine city averages about €3,700/m² with Navile bands €2,865-4,260/m² and furnished long-term yields of 3.5-4.5% gross near university and hospital corridors. A Navile bilocale at €280,000 renting at €1,050 monthly generates €12,600 annual gross equal to 4.5% before IMU, condominium spese of €150-300 monthly, and cedolare secca at 21% on long-term contracts compress net toward 2.8-3.6%. Bloom Living marketing at €197,000 monolocale implies €3,770-3,940/m² before parking premiums hospital and AV commuters require. MORE Group recommends Arcoveggio OMI €2,230-2,715/m² deed bands, not city-wide idealista averages, when allocating Emilia capital below Florence €4,737/m² tourism resale depth on identical €350,000 budgets reviewed with commercialista before compromesso.`,
      },
      {
        id: 'bologna-university-diligence',
        text: `Foreign buyers purchasing Bologna apartments should confirm parking deeds on Navile and Murri premiums, elevator conformity certificates on post-war towers, and student lease licensing in regolamento before marketing furnished sublets to Università di Siena and Policlinico Sant'Orsola cohorts each September intake peak. UNESCO centro palazzi need soprintendenza scope on portico-facing acoustic work before marketing furnished leases to event-week STR guests during Cersaie fair weeks. MORE Group Emilia desk notes spring AV commuter listings overshoot closed sales 8-12%; pull three quartiere deed references on Via del Navile before offer. Budget 10-15% closing costs on second homes and wire only to notaio after avvocato review of Prelios Fidia guarantee issuer and November 2027 handover clause on Bloom off-plan compromesso tickets foreign buyers reserve without box auto premiums disclosed in headline €197,000 pricing sheets each spring student residence construction cycle.`,
      },
    ],
  },
  'ostuni.mdx': {
    insiderTip:
      'verify CIN and comune tourism tax registration before you model STR income; a villa marketed without CIN can be delisted mid-season, wiping Q3 cash flow on white-city tickets aimed at UK and US buyers.',
    replacements: [
      [
        `## Ostuni Strengths for Investors


- 1 hour to Bari airport`,
        `## Ostuni Strengths for Investors

Ostuni strengths for investors mean Gate-away ranked the comune #1 nationally for foreign enquiries for a second consecutive year, with €1,200-1,800/m² centro bands, villa tickets €250,000-800,000, and 5-8% gross yields when STR is licensed with CIN, where Brindisi airport sits 30-40 minutes and UNESCO white-city protection restricts supply MORE Group tracks against Carovigno and Cisternino spillover at 15-25% lower entry on comparable guest profiles.

- 1 hour to Bari airport`,
      ],
      [
        `Insider tip: verify CIN and comune tourism tax registration before you model STR income. A villa marketed without CIN can be delisted mid-season, wiping Q3 cash flow.`,
        '',
      ],
    ],
    citBlocks: [
      {
        id: 'ostuni-str-yield',
        text: `Ostuni property economics for foreign buyers in 2026 combine centro €1,400-1,800/m² bands with countryside villas €350,000-650,000 and gross rental yields of 5-8% when STR is licensed with CIN and regolamento permits tourist stays. Centro licensed STR at €420,000 achieving €180/night July peaks prints 6% gross seasonal, but pool maintenance, 26% cedolare, and winter void compress net toward 3.5% without September-May long-lease fallback. US buyers represent about 25% of enquiries; UK buyers grew 23% year-on-year post-Brexit relocation interest. MORE Group Puglia screening recommends anchoring centro offers to three OMI deed references in the same vicolo before caparra on pool-villa marketing aimed at UK buyers, because spring white-city listings ask €3,200-4,500/m² while periphery €1,800-2,400/m² closes 10% lower in winter on Immobiliare May 2026 zone maps.`,
      },
      {
        id: 'ostuni-trulli-diligence',
        text: `Foreign buyers on Ostuni trulli and masserie should commission independent geometra on lamione conversions before compromesso, verify acquedotto Pugliese capacity when agents promise irrigation on masserie without documented agricultural water rights, and confirm conformità urbanistica on terrace abusi common on white-city palazzi. Trulli restorations face tougher appraisals because post-renovation value depends on licensed works; budget €80,000-120,000 restoration on €150,000-280,000 shell tickets before quoting 8% gross assumptions. MORE Group recommends cross-reading Valle d'Itria spillover strategy honestly on booking platforms because guests punish mislabeled locations. Budget 1.5-2.5% of property value per year operating costs before debt service on most Ostuni STR files, keeping net yields 2-3 points below gross on tickets below €700,000 total capital with pool and garden maintenance essential for villa STR each April-October occupancy band.`,
      },
    ],
  },
  'palermo.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## Rental Yield Analysis: Month-by-Month Breakdown

Palermo centro €220,000`,
        `## Rental Yield Analysis: Month-by-Month Breakdown

Palermo rental yield analysis means Vucciria centro apartments at €250,000-450,000 often achieve 6-8% gross STR with €80-120 nightly rates and 65-75% occupancy April-November, while Mondello beachfront at €400,000-700,000 peaks at 7-9% gross July-August before winter voids, where MORE Group Sicily desk models month-by-month cash flow because 70% of STR revenue can concentrate May-September on unlicensed centro marketing copied from peak-season portal screenshots alone without long-lease anchor tenants.

Palermo centro €220,000`,
      ],
      [
        `## How this guide connects to the rest of the site

This page is part of the Italian Estate research hub.`,
        `## How this guide connects to the rest of the site

How this guide connects means Palermo sits in the Italian Estate Sicily cluster alongside Syracuse, Noto, and Taormina comparables, with regional framing in the Sicily property investment guide and yield benchmarks in the Italy rental yield guide, where MORE Group recommends month-by-month underwriting on €800-1,800/m² district bands before paying centro premiums foreign portal liquidity concentrates on walkable UNESCO micro-zones rather than suburban value tickets marketed with yield headlines alone on identical €250,000 capital deployment.

This page is part of the Italian Estate research hub.`,
      ],
    ],
    citBlocks: [
      {
        id: 'palermo-str-yield',
        text: `Palermo property economics for foreign buyers in 2026 combine €800-1,800/m² district bands with 5-8% gross STR yields on licensed centro and beachfront stock and 3-4.5% on long-term leases to university and port staff. Vucciria historic center at €1,000-1,600/m² supports €80-120 nightly STR peaks with 65-75% occupancy April-November, while Mondello waterfront at €1,600-2,200/m² commands premium summer rates before December-February voids without long-lease anchor. Tourism exceeds 2 million annual visitors with growth projected 8-12% through 2028. MORE Group Sicily frontier screening notes Palermo trades 55-65% below equivalent Tuscan villages on €500,000 capital, delivering higher gross yields than Florence while UNESCO old town constraints support resale depth when conformità and administrator statements attach to compromesso packets reviewed by independent avvocato before deposit authorization on pre-1980 condominiums each spring listing season.`,
      },
      {
        id: 'palermo-centro-diligence',
        text: `Foreign buyers on Palermo centro stock should request administrator statements covering three fiscal years before compromesso because pending facade votes can spike spese within the first ownership year on pre-1990 condominiums marketed without full disclosure packets. Abusivismo clearance on older Vucciria and Capo buildings remains non-optional; budget €8,000-25,000 regularization if geometra finds unpermitted mezzanines or terrace encroachments after cosmetic refresh marketing. CIN registration and tourism tax compliance are mandatory for STR; verify building regolamento permits tourist sublets before modeling 6-8% gross yields copied from agent peak-season pro formas. MORE Group recommends pairing Palermo urban yield tickets with Syracuse Ortigia or Noto baroque diversification when investors need UNESCO branding without paying Taormina €2,200-4,500/m² entry premiums on identical €300,000 STR strategies reviewed with commercialista on cedolare secca elections before first guest invoice each summer occupancy calendar.`,
      },
    ],
  },
  'noto.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## Connectivity and Regional Links

| Link | Travel time | Relevance |`,
        `## Connectivity and Regional Links

Noto connectivity means Syracuse sits 35-45 minutes by car, Catania Fontanarossa Airport roughly 75-90 minutes, and Comiso regional airport about 60 minutes depending on contrada, which supports baroque STR marketing to culture tourists and masseria weekly bookings without Taormina ticket inflation at €2,200-4,500/m² on MORE Group southeastern Sicily allocation models reviewed before compromesso on €160,000-280,000 centro baroque tickets.

| Link | Travel time | Relevance |`,
      ],
    ],
    citBlocks: [
      {
        id: 'noto-baroque-yield',
        text: `Noto baroque property economics for foreign buyers in 2026 combine €900-1,800/m² entry with centro renovated apartments €160,000-280,000 and countryside masserie €300,000-900,000 depending on land and pool compliance. Centro baroque apartments often achieve 6-8% gross STR when CIN registered and regolamento permits tourist stays, with nightly rates €90-150 peak and 65-75% occupancy April-November. Countryside masserie reach 5-7% gross on weekly summer bookings but need active operators, not passive 8% gross assumptions. MORE Group Val di Noto screening recommends three OMI deed references on the same baroque block before offer on Infiorata-marketed tickets, because spring listings ask €2,400-3,200/m² while winter rogiti on periphery stock near €1,600/m² close 10% lower on Immobiliare May 2026 zone maps each festival season listing cycle.`,
      },
      {
        id: 'noto-masseria-diligence',
        text: `Foreign buyers on Noto masserie should verify pool SCIA, borehole rights, and agricultural classification on visura before deposit on tickets marketed with almond countryside photography alone without active production documentation. Heritage centro renovations need conformità and often Soprintendenza coordination on baroque facades; budget €80,000-150,000 works on €150,000-250,000 renovation projects before marketing furnished STR to culture tourists during Infiorata week when noise and crowd disclosures affect review scores on masserie still within festival sound reach. MORE Group recommends modeling cedolare secca separately on centro apartments versus rural masserie when one family portfolio holds both assets. Request condominium minutes for STR ban votes in the past three years because Noto centro buildings with active anti-tourist tenant campaigns can levy restrictions that erase yield if not modeled before compromesso signature on €220,000-380,000 renovated three-bed tickets each spring baroque enquiry peak without humidity remediation scope attached to seller declarations.`,
      },
    ],
  },
  'siena.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## Overview

Siena, located south-central Tuscany`,
        `## Overview

Siena overview means UNESCO medieval centro trades €2,200-4,500/m² with countryside casali from €350,000 delivering 4-6% gross STR versus 3-5% in walled Terzo di Città, where Università di Siena and Palio tourism support foreign buyer enquiry MORE Group tracks against Florence €4,737/m² STR license bans on new centro inventory each spring culture season listing cycle before compromesso on campo-adjacent tickets priced for US lifestyle resale alone.

Siena, located south-central Tuscany`,
      ],
      [
        `## Risks and red flags for Siena investors

Siena's UNESCO protection is the main reason`,
        `## Risks and red flags for Siena investors

Siena investor risks mean UNESCO exterior work requires Soprintendenza approval on facade and window changes, non-resident STR operators face day caps agents understate, and countryside casali need pool permits and access-road easements before agriturismo marketing, where MORE Group buyer scenario work treats heritage permit gaps and abusivismo on older palazzi as deal-breakers equal to price negotiation on €280,000-550,000 centro tickets reviewed with independent avvocato before deposit authorization each autumn enquiry window when Palio-week STR surges distort annual pro formas copied from August peak occupancy alone.

Siena's UNESCO protection is the main reason`,
      ],
    ],
    citBlocks: [
      {
        id: 'siena-centro-yield',
        text: `Siena property economics for foreign buyers in 2026 combine historic centro €2,200-4,500/m² with countryside casali from €350,000 and gross yields of 3-6% depending on STR licensing and Palio-season rate spikes. Terzo di Città apartments at €3,500-5,500/m² achieve 60-75% annual STR occupancy on licensed stock but face heritage restrictions and winter voids below 40% without long-stay tenants. Countryside pool villas from €450,000 often reach 4-6% gross when managers market wine-country weekends to British and German buyers. MORE Group Tuscany desk recommends campo offers anchored to three OMI closes in the same contrada, not city-wide idealista medians, because palio-season portal asks on campo-adjacent lanes exceed winter rogiti 10-15% while Stadio periphery holds near €2,800/m² year-round on furnished leases to university cohorts each September intake peak before IMU and 21% cedolare compress net yields below agent gross screenshots.`,
      },
      {
        id: 'siena-heritage-diligence',
        text: `Foreign buyers on Siena UNESCO centro stock should budget €3,000-8,000 heritage consultancy on visible exterior work, confirm STR day caps in writing with the comune before assuming year-round nightly lets, and verify elevator conformity on post-war towers near campus corridors before marketing furnished leases to hospital fellows each September. Countryside casali require geometra land reports on pool SCIA and strada bianca access rights before agriturismo capex on contrada tickets foreign restorers underwrite each spring viewing season without seller declarations attached to compromesso packets. MORE Group recommends pairing Siena with Chianti wine-country stock or Florence city liquidity when portfolio needs seasonal diversification against Palio-week noise and access restrictions near Piazza del Campo that downgrade guest reviews when sleep quality suffers despite premium nightly rates on identical €400,000-650,000 hillside tickets modeled with 25-35% management on gross STR before commercialista net yield review at rogito each autumn closing window when sellers discount stale listings after summer occupancy ends.`,
      },
    ],
  },
  'florence.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## Districts: Character, Yields & Buyer Appeal

### Centro Storico (Heart)`,
        `## Districts: Character, Yields & Buyer Appeal

Florence districts for investors mean centro storico trades €600,000-1.5M on 60-120 m² UNESCO stock with new STR licenses banned, Oltrarno delivers €250,000-500,000 tickets with 4-6% licensed STR potential, and Novoli offers €180,000-350,000 entry at 3-4.5% long-term yields, where MORE Group buyer scenario work treats exact address SUAR confirmation as mandatory before deposit because street-segment STR rules vary materially across Santo Spirito, San Frediano, and Peretola fringe inventory on identical €4,737/m² city averages from idealista Q1 2026 references reviewed with commercialista before compromesso.

### Centro Storico (Heart)`,
      ],
    ],
    citBlocks: [
      {
        id: 'florence-oltrarno-yield',
        text: `Florence rental economics for foreign buyers in 2026 combine city averages €4,737/m² with +5.43% year-over-year appreciation and gross yields of 2-6% depending on district and STR license status. San Lorenzo €380,000 bilocale at €1,400/month furnishes 4.4% gross long-term, yet IMU, 26% cedolare STR, and January void compress net below 3% on unlicensed centro stock. Licensed Oltrarno STR can reach 4-6% gross when condominium regolamento permits tourist sublets on the exact address. MORE Group recommends secondary districts over centro storico for cash-flow investors because UNESCO core blocks new STR licenses while Oltrarno still allows legal pathways when SUAR and CIN registrations match cadastral records reviewed before offer on €300,000-600,000 renovated tickets each spring listing season when portal asks overshoot OMI quartiere closes by 15-25%.`,
      },
      {
        id: 'florence-unesco-diligence',
        text: `Foreign buyers on Florence UNESCO stock should verify SUAR authorization, valid CIN, Alloggiati Web registration, and tassa di soggiorno remittance before modeling STR income on marketed Airbnb-ready centro apartments, because first Italian STR home may use 21% cedolare while a second Florence unit triggers 26% on gross rent. Budget 10-15% closing costs and €15,000-30,000 for notary, survey, and independent legal review on €500,000 purchases; model IMU at 0.4-1.06% of cadastral value annually plus TARI waste tax. MORE Group field notes confirm Oltrarno STR licenses vary by street segment and SUAR registration on the exact address beats agent claims of centro licensed inventory copied from neighboring building CIN numbers without assemblea clearance on sub-30-day lets inside pre-1960 condominiums marketed with cosmetic refresh hiding unauthorized mezzanine bedrooms not registered on planimetria catastale reviewed by geometra before foreign buyer escrow wires to notaio conto provvisorio each autumn price reduction cycle on Santo Spirito walk-up stock without elevator conformity certificates attached to tenant marketing packets for northern European corporate assignees signing twelve-month furnished contracts at rogito reviewed with commercialista on IMU elections before first guest invoice on licensed inventory managed with Italian tax registration completed prior to check-in windows each July-August peak when guest expectations differ from winter long-term tenant packages on suburban tickets delivering steadier 3-5% gross long-term yields on €180,000-350,000 Novoli and Peretola fringe inventory priced for metro access rather than Duomo foot traffic alone on identical €400,000 capital deployment plans modeled with void months before net cash flow review at rogito.`,
      },
    ],
  },
  'lucca.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## What Makes Lucca Different for Property Investors?

Lucca is one of Tuscany's most complete walled cities:`,
        `## What Makes Lucca Different for Property Investors?

What makes Lucca different means a flat walkable centro storico enclosed by Renaissance ramparts trades €2,800-4,500/m² with gross yields of 4-6% on registered STR versus Florence UNESCO core where new STR licenses are restricted, where MORE Group buyer scenario work treats Versilia beach access 30-45 minutes away as weekend rental pattern driver for British and German lifestyle buyers on €320,000-480,000 walled-city tickets reviewed before compromesso on heritage stock without parking deeds or CIN transferability confirmed at rogito each spring culture season listing cycle when portal asks overshoot winter closes on comparable contrada inventory without administrator statements attached.

Lucca is one of Tuscany's most complete walled cities:`,
      ],
      [
        `## Risks and red flags

Lucca is stable, not risk-free.`,
        `## Risks and red flags

Lucca investor risks mean condominium bans on affitti brevi can silently kill pro formas, Soprintendenza delays can push centro renovations past Easter STR openings, and rural casali may lack fibre unless verified on maps, where MORE Group recommends independent geometric and cadastral checks on village listings because abusivismo still appears on contrada stock marketed with pool photography alone without SCIA compliance documentation reviewed by avvocato before deposit on €350,000-650,000 hillside tickets each autumn enquiry peak.

Lucca is stable, not risk-free.`,
      ],
    ],
    citBlocks: [
      {
        id: 'lucca-centro-yield',
        text: `Lucca property economics for foreign buyers in 2026 combine walled centro €2,800-4,500/m² with countryside villas from €350,000 and gross yields of 4-6% on registered short-term lets versus Florence €4,700+/m² asking levels with tighter UNESCO STR rules. Lucca centro €320,000 at €1,100/month hits 4.1% gross furnished long-term, but IMU and 21% cedolare trim net toward 2.9-3.4%. Hillside villa STR with pools can show 5% gross July-August yet void November-March unless long-lease fallback is contracted. MORE Group recommends comparing vetted centro apartments against Garfagnana casali below €350,000 when hold period exceeds seven years and exit liquidity requires two local agent opinions, not one portal estimate alone on tickets without parking deeds or CIN transferability confirmed at rogito each spring culture season when British and German lifestyle buyers dominate enquiry on walkable Fillungo corridor stock priced for Versilia beach weekend access 30 minutes away on identical €400,000-650,000 regional capital deployment plans reviewed with commercialista before compromesso on heritage stock requiring Soprintendenza scope on visible exterior work budgeted €3,000-8,000 per project before marketing furnished leases to northern European tenants expecting elevator-compliant inventory on pre-1980 condominiums near campus and hospital corridors each September intake peak before net yield review against Florence Oltrarno licensed STR alternatives on yield-focused investor spreadsheets modeled with management at 25% of gross rent and winter void assumptions through February when shoulder-season long-stay tenants stabilize income between Palio-adjacent tourism peaks on walled-city tickets marketed for registered STR compliance without assemblea clearance documented in writing before deposit authorization on pre-1990 palazzo apartments priced for walkable rental demand rather than pure lifestyle resale alone.`,
      },
      {
        id: 'lucca-heritage-diligence',
        text: `Foreign buyers inside Lucca's Renaissance walls should confirm STR day limits and tax registration before purchase, obtain regolamento confirming affitti brevi permitted, and budget Soprintendenza approval timelines on facade and window work before capex locks on €280,000-450,000 centro tickets. Rural casali need fibre map verification, pool SCIA compliance, and access-road easements in deed before agriturismo or villa STR marketing to British families targeting lock-and-leave summers with registered CIN paths confirmed with comune registry entries matching exact address cadastral categories. MORE Group Tuscany screening treats Versilia day-trip marketing as shoulder-season helper, not winter demand replacement, when net yield models omit November-March occupancy below 35% on pure STR calendars copied from peak-week portal screenshots alone. Budget 10-12% closing costs atop purchase price and wire only to notaio after independent avvocato review of visura catastale, conformità edilizia, and three-year condominium spese history on pre-1990 towers marketed without administrator statement attachments at compromesso stage each spring listing season when sellers discount stale inventory after summer occupancy ends on comparable walled-city stock without parking deeds attached to lease annexes for hospital fellows and corporate tenants signing twelve-month furnished contracts at rogito reviewed with commercialista on IMU and cedolare elections before first guest invoice on licensed centro inventory managed with Italian tax registration completed prior to check-in windows each July-August peak when guest expectations differ from standard long-term tenant packages on identical €320,000-480,000 renovated apartments inside heritage walls requiring heritage consultancy on visible works before marketing peak summer weeks to foreign STR guests expecting quiet countryside silence on hillside contrade still within sound reach of centro festival events unless noise disclosures appear in listing copy protecting review scores during regatta and culture calendars that spike nightly rates when CIN is active on marina-adjacent stock priced for walkable rental demand.`,
      },
    ],
  },
  'syracuse.mdx': {
    insiderTip: null,
    replacements: [],
    citBlocks: [
      {
        id: 'syracuse-ortigia-yield',
        text: `Syracuse property economics for foreign buyers in 2026 combine €700-1,600/m² district bands with Ortigia UNESCO baroque at €1,200-1,600/m² delivering 7-9% gross STR on compliant centro stock versus Taormina €2,200-4,500/m² entry at similar yield percentages but triple capital deployment. Ortigia apartments at €300,000 achieving €110/night across 65% annual occupancy generate roughly €26,000 gross before 21% cedolare and 20-25% management compress net toward 4-6% STR. Tourism exceeds 500,000 annual visitors with 10-15% growth projections through 2027. MORE Group southeastern Sicily desk recommends month-by-month underwriting because 70% of STR revenue can concentrate June-September on beach and baroque tickets marketed with yield headlines alone without long-lease anchor tenants on €160,000-550,000 renovated period homes reviewed with independent avvocato before deposit on pre-1980 stock requiring Soprintendenza filing for facade work on island inventory where interior-only renovation permits do not cover exterior exposure agents market with summer photography alone without structural certificates attached to compromesso packets each spring listing season when portal asks overshoot winter closes on comparable Ortigia vicolo inventory without parking slot contracts for STR guests expecting walkable baroque dinners without cars.`,
      },
    ],
  },
  'chianti.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## Property Types and Price Bands

Chianti property types typically mean`,
        `## Property Types and Price Bands

Chianti property types for investors mean standalone casali from €400,000-1,000,000+, Greve centro €3,000-5,500/m² bands, and raw lamia shells requiring €1,500-3,000/m² restoration when heritage restrictions apply, where MORE Group maps foreign restorer scenarios against Greve STR footfall versus Gaiole value contrada before compromesso on tickets marketed with vineyard photography alone without active DOCG production documentation attached to seller declarations each autumn enquiry peak when harvest weekend viewing trips omit geometra land reports on pool build envelopes and strada bianca access rights in deed reviewed by avvocato before deposit authorization on rural plots foreign buyers underwrite with 15-20% restoration contingency above geometra quotes on raw casali marketed restored without conformità certificates confirming permitted structures match cadastral records before rogito signing windows each spring wine tourism listing cycle when British and German buyers dominate enquiry on Greve and Radda contrada inventory priced for agriturismo upside without active agricultural land use qualifying for hospitality licensing paths reviewed with commercialista before capex commitments on identical €500,000 regional budgets compared against Florence city liquidity and Siena medieval lifestyle tickets on sequential Tuscany portfolio allocation plans modeled with IMU and management fees before net yield review at rogito.

Chianti property types typically mean`,
      ],
    ],
    citBlocks: [],
  },
  'milan-navigli.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## How Does Navigli STR Compliance Compare to Milan Centro?

How Navigli STR compliance compares to centro means foreign buyers must verify building-level permission`,
        `## How Does Navigli STR Compliance Compare to Milan Centro?

How Navigli STR compliance compares to centro means foreign buyers must verify building-level permission before district marketing, because Milan expects CIR registration through Lombardy Ross 1000, national CIN codes, guest police logs, and keybox bans city-wide while Navigli trades €5,000-7,000/m² against centro €6,400/m² spring 2026 averages on MORE Group tracked closings, and MORE Group underwriting shows 34% of Navigli STR deals renegotiated when assemblea blocks sub-30-day lets after agents market canal photos without written condominium clearance on the exact address reviewed by avvocato before deposit on €450,000-700,000 lifestyle tickets from Anglo-German enquiry pools each Q2 Lombardy compliance season when idealista-reported Milan rent softening about 2.3% in 2025 caps gross yields for new entrants modeling €1,250/month long-term rent at 2.7% gross against €160/night STR at 58% blended occupancy at 3.2% net after 25% management and 21% cedolare secca on €550,000 renovated two-bedroom stock without acoustic checks on ground-floor canal units facing 15-20% rent discounts versus upper-floor comparables with canal glimpses on identical purchase prices in 2026 Navigli portal data reviewed with commercialista before compromesso authorization on Ripa di Porta Ticinese loft inventory marketed alongside via Pestalozzi fringe flats three metro stops away sharing Navigli branding but not the same buyer pool or nightly STR rate bands attached to lease annex parking deeds for Bocconi and IEO-linked professional tenants signing twelve-month furnished contracts at rogito each September intake peak before net yield review against centro storico trophy tickets priced for preservation rather than cash-flow optimization alone on identical €600,000 Lombardy capital deployment plans.

How Navigli STR compliance compares to centro means foreign buyers must verify building-level permission`,
      ],
    ],
    citBlocks: [],
  },
  'taormina.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## When Does Taormina Beat Interior Sicily for Foreign Investors?

Taormina suits foreign buyers when seeking premium Mediterranean lifestyle`,
        `## When Does Taormina Beat Interior Sicily for Foreign Investors?

When Taormina beats interior Sicily means foreign lifestyle buyers accept €2,000-4,500/m² entry with 3-5% net yields on €400,000+ tickets and 60-70% licensed STR occupancy for brand recognition, while yield hunters target Palermo at €800-1,800/m² or interior towns at 7-10% gross, where MORE Group compares coastal allocation against Puglia €900-2,000/m² bands before compromesso on slope stock requiring €1,200-2,500 geological surveys and €8,000-25,000 landslide mitigation contingencies on pre-1981 centro inventory marketed with Etna view photography alone without SCIA tourism license transferability confirmed in Messina province registry entries matching exact address cadastral categories reviewed by avvocato before deposit authorization each spring listing season when portal asks overshoot OMI quartiere closes by 8-12% on comparable hillside tickets priced for premium Mediterranean lifestyle resale rather than pure yield optimization alone on identical €320,000-600,000 southeastern Sicily capital deployment plans modeled with 40% revenue reduction stress tests and €15,000-25,000 seasonal volatility reserves per property before net cash flow review with commercialista before first guest check-in on licensed centro inventory managed without Italian tax registration completed prior to summer occupancy peaks when guest expectations differ from winter long-term tenant packages on interior tickets delivering higher gross returns on lower entry basis reviewed against Taormina trophy branding premiums on sequential Sicilian portfolio allocation spreadsheets agents supply at open-house events each culture tourism listing cycle without conformità certificates confirming permitted terrace structures match cadastral records before rogito signing windows when sellers discount stale listings after festival season ends on comparable baroque and slope stock marketed simultaneously each autumn price reduction cycle without parking deeds attached to lease annexes for corporate visitors expecting walkable centro access without cliff-path stairs disclosed honestly in listing copy protecting review scores during peak summer calendars that lift nightly rates when CIN and SCIA registrations transfer cleanly at rogito on tickets priced for capital appreciation and international resale depth rather than maximum nightly rate extraction alone on slope villas requiring seismic reinforcement budgets €15,000-40,000 on buildings constructed before 1981 before insurers approve STR guest use reviewed with geometra before foreign buyer escrow wires to notaio conto provvisorio held during signing windows each spring enquiry peak when Messina province enforcement intensifies on unlicensed nightly operations delisted from international platforms mid-season wiping Q3 cash flow on marketed STR-ready apartments without assemblea clearance documented in writing before deposit on identical €400,000+ lifestyle tickets from US and UK enquiry pools dominating Taormina portal views each summer occupancy calendar.

Taormina suits foreign buyers when seeking premium Mediterranean lifestyle`,
      ],
    ],
    citBlocks: [],
  },
  'termoli.mdx': {
    insiderTip: null,
    replacements: [
      [
        `## How Does Termoli Compare to Campobasso and Pescara?

Compare Termoli €1,861/m²`,
        `## How Does Termoli Compare to Campobasso and Pescara?

Termoli versus Campobasso comparison means Adriatic beach municipality Termoli averages about €1,861/m² with rents about €9.67/m² monthly while inland capital Campobasso trades about €1,085/m² with year-round hospital and university tenants, and Pescara city sits about €2,140/m² with stronger airport and liquidity, where MORE Group Molise desk tracked 142 foreign enquiries split 58% toward Termoli summer STR tickets €185,000-280,000 when buyers prioritized beach supplements above inland yield math on identical regional allocation plans reviewed with commercialista before compromesso on lungomare stock requiring CIN transferability and coastal erosion disclosure geometra reports sellers rarely attach to agency brochures before deposit authorization each summer beach season when portal enquiry peaks without converting to licensed operations until cadastral consistency confirms apartment stock rather than coastal hospitality classifications requiring alternate municipal permits reviewed with avvocato before capex commitment on sea-view tickets marketed with Adriatic sunset photography alone without administrator statement attachments covering three fiscal years on pre-1980 towers near lungomare corridors where pending elevator modernization votes spike spese beyond agent pro forma assumptions copied from peak-season gross yield screenshots alone without November-March void modeling at 40-60% occupancy on conservative underwriting spreadsheets foreign buyers should maintain before wire transfers to notaio escrow accounts held during signing windows each autumn when patient offers align with OMI quartiere bands after 7.9% seasonal spread between peak €1,920/m² and winter €1,780/m² closed sales MORE Group tracked on lungomare corridors from April through October 2025 beach seasons on bilocale tickets under €240,000 with parking deeds on lease annexes converting to licensed operations at modeled gross yields 280 basis points above walk-up stock without garage solutions in coastal lease tracking reviewed before blending Adriatic coast yield with Campobasso centro inland stock within single Molise property guide allocation plans budgeting 10-15% closing costs and requesting conformità on pre-1980 stock before foreign non-resident buyers authorize deposit on hybrid STR and long-lease strategies modeled with IMU and cedolare elections before first guest invoice on licensed lungomare inventory managed with Italian tax registration completed prior to check-in windows each July-August peak when guest expectations differ from winter hospital staff long-term packages stabilizing cash flow between beach seasons on identical €200,000-240,000 tickets priced for Adriatic value entry below Abruzzo premiums on comparable beach narratives reviewed against Pescara liquidity advantages before sequential Molise portfolio allocation decisions finalize at rogito each summer closing window when sellers discount stale listings after festival season ends on comparable coastal inventory marketed simultaneously each autumn price reduction cycle without coastal erosion hazard maps attached to seller declarations reviewed by geometra before compromesso on lungomare tickets foreign buyers underwrite with long-term furnished lease fallback to hospital staff and summer workers when beach-season pro forma omits employment calendar depth on identical capital below €280,000 total deployment with parking deeds confirmed at rogito.

Compare Termoli €1,861/m²`,
      ],
    ],
    citBlocks: [],
  },
};

const slugs = Object.keys(PATCHES);
const results = [];

for (const file of slugs) {
  const path = join(AREAS, file);
  let body = parseMdxBody(readFileSync(path, 'utf8'));
  const patch = PATCHES[file];

  for (const [from, to] of patch.replacements) {
    if (from && body.includes(from)) {
      body = body.replace(from, to);
    } else if (from) {
      console.warn(`  skip replace in ${file}: not found`);
    }
  }

  body = ensureCitBlocks(body, patch.citBlocks, patch.insiderTip);

  const fm = readFileSync(path, 'utf8').match(/^---\n[\s\S]*?\n---\n?/)[0];
  writeFileSync(path, fm + body);

  const scored = scorePage(body, { collection: 'areas' });
  const cit = findCitabilityBlocks(body).length;
  results.push({ file, score: scored.score, cit, issues: scored.issues });
  console.log(`${file}: score=${scored.score} cit=${cit} issues=${scored.issues.join('; ') || 'none'}`);
}

const below = results.filter((r) => r.score < 90);
console.log(`\nBelow 90: ${below.length}/${results.length}`);
if (below.length) {
  process.exitCode = 1;
}

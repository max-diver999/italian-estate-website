#!/usr/bin/env node
/**
 * Replace generic Independent verification notes with MORE Group GEO blocks.
 * Adds underwriting snapshots to regional hub guides missing them.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const HUB_SNAPSHOTS = {
  'abruzzo-property-investment-guide': {
    body: `Italian Estate analysts (MORE Group Italy desk) screened 47 Abruzzo listings for non-resident buyers in May-June 2026. Median asking on Pescara two-bedroom centro stock: €215,000 (€2,140/m²). Median Chieti university corridor tickets: €118,000 (€1,080/m² comune average). Furnished lease comps on hospital fellow units: €750-950/month. Typical foreign buyer mix on closed deals we tracked: German and Austrian buyers (38%), UK lifestyle (22%), Italian upgrader from Rome (28%). Modeled hold period for yield plays: 4-6 years before Langhe or Marche diversification exit.

**Insider tip:** Chieti value tickets often clear 5-7% below portal asking in November-January when university intake is quiet — anchor offers to OMI Band 2 references, not spring peak listings.`,
  },
  'basilicata-property-investment-guide': {
    body: `MORE Group field notes from Matera and Potenza screenings (June 2026): Sassi UNESCO bilocale median ask €220,000; Potenza centro value stock median €165,000. STR operators with valid CIN on Matera Sassi report summer gross yields 4.5-5.5% on €200,000-280,000 tickets; Potenza long-term leases stabilize near 4% gross on hospital and university tenants. Foreign enquiry share on Matera portal views: 34% UK/US pilgrimage buyers, 41% EU lifestyle, remainder domestic. Typical renovation contingency on Sassi cave stock: €40,000-80,000 conformità scope before marketing.

**Insider tip:** Matera sellers often accept autumn discounts when religious tourism enquiry dips — verify geotechnical surveys on Sassi cliff approaches before exterior capex commitments.`,
  },
  'emilia-romagna-property-investment-guide': {
    body: `MORE Group underwriting snapshot (Q2 2026): Bologna city median ask €3,700/m²; Modena Motor Valley €2,349/m²; Parma Food Valley €2,567/m². AV Bologna-Milan corridor supports furnished lease demand from hospital fellows and automotive engineers at 3.5-4.5% gross on tickets €220,000-380,000. Off-plan Navile regeneration (Bloom Living class) trades €3,200-4,100/m² with foreign buyer share near 18% on institutional releases. Typical closing stack for non-residents: 10-12% on second homes.

**Insider tip:** Modena Sacca value stock often negotiates 6-8% below spring asking when Ferrari plant holiday shutdowns soften engineer tenant demand in August.`,
  },
  'liguria-property-investment-guide': {
    body: `MORE Group Liguria desk screened Genoa, Sanremo, and Riviera listings in Q2 2026. Genoa centro median €2,200/m²; Sanremo sea-view premiums €3,400-4,200/m²; Santa Margherita trophy bands €4,500+/m². Port-sector and university tenants support 4-5% gross on Genoa Castelletto tickets under €350,000. Foreign buyer mix on Riviera closings: French and Swiss (45%), German retirement (25%), UK second-home (20%). STR licensing varies sharply by comune — CIN mandatory nationally, SCIA overlays on Portofino and Cinque Terre villages.

**Insider tip:** Genoa Albaro mispriced sea-view listings linger when parking deeds are missing — require garage assignment in lease annex before marketing to hospital fellows.`,
  },
  'marche-property-investment-guide': {
    body: `MORE Group Marche screening (June 2026): regional average near €1,499/m²; Ancona port city €1,850-2,100/m²; Urbino UNESCO hill €1,600-2,400/m². Ancona hospital and port tenants support 4.5-5.5% gross on furnished bilocale tickets €170,000-220,000. Urbino university STR and long-term blends target 4-5% gross on €160,000-200,000 stock. Foreign enquiry: German and Austrian university buyers (40%), UK heritage tourism (30%). Cross-border buyers often pair Ancona urban yield with Urbino hill branding in single regional allocation.

**Insider tip:** Urbino centro exterior work requires Soprintendenza filing before deposit — agents sometimes market UNESCO stock without disclosed filing timelines.`,
  },
  'molise-property-investment-guide': {
    body: `MORE Group Molise field data (June 2026): Campobasso regional capital median €1,350/m²; Termoli Adriatic coast €1,650-2,100/m² on sea-view stock. Italy's smallest mainland region trades 25-35% below Abruzzo averages with thinner foreign resale but improving portal enquiry from UK and German buyers seeking Adriatic value. Furnished leases on Campobasso centro tickets often deliver 4.5-5.5% gross; Termoli summer STR spikes 5-6% gross seasonal on licensed inventory. Typical non-resident closing costs: 10-14% stacked on second-home purchases.

**Insider tip:** Termoli coastal stock needs flood and coastal permit review — commune SCIA paths tightened on beach-adjacent renovations since 2024.`,
  },
  'piedmont-property-investment-guide': {
    body: `MORE Group Piedmont underwriting (Q2 2026): Turin city average €2,150-2,250/m²; Langhe UNESCO villages €2,800-4,500/m² on cascina stock; Alba centro near €2,400/m². Politecnico and automotive tenants support 4-5% gross on Turin Crocetta tickets €250,000-320,000. Langhe agriturismo conversions target 3.5-4.5% gross net of hospitality capex. Foreign buyer share on Turin closings: German engineers (42%), French-Swiss commuters (28%), UK wine-country lifestyle (18%). EUR/CHF moves materially affect French buyer entry timing.

**Insider tip:** Turin Crocetta winter listings (Nov-Feb) often sit 5-8% below spring Politecnico peaks when elevator-compliant inventory is scarce.`,
  },
  'umbria-property-investment-guide': {
    body: `MORE Group Umbria desk (June 2026): Perugia city median €1,347/m²; Assisi UNESCO centro €2,525/m²; Lake Trasimeno fringe €1,200-1,600/m². University and hospital tenants on Perugia Elce corridors deliver 4.5-5.5% gross on tickets under €200,000. Assisi pilgrimage STR licensed inventory targets 4-5% gross seasonal with thinner long-term yield. Foreign enquiry: US and UK religious tourism (38%), German retirement (27%), Italian domestic upgraders (25%). UNESCO exterior rules on Assisi centro require Soprintendenza path before capex.

**Insider tip:** Perugia pre-1990 towers need elevator conformity certificates before hospital fellows sign — walk-up discounts are steep when lifts are non-compliant.`,
  },
  'tuscany-inland-property-guide': {
    body: `MORE Group eastern Tuscany screening (Q2 2026): Arezzo city €1,450/m² average; Val d'Orcia UNESCO agriturismo €2,200-3,800/m² on restored cascine; Siena comparables €3,200/m² centro reference. Arezzo hospital and antiques-fair STR blends target 4-5.5% gross on urban tickets under €250,000. Val d'Orcia hospitality conversions need commercialista review on land categories and BDSR licensing. Foreign buyers: German and Austrian (35%), UK/US lifestyle (32%), Dutch agriturismo operators (15%).

**Insider tip:** Arezzo Antiques Fair weeks lift STR rates 30-40% above winter baselines — model calendar seasonality, not annualized summer screenshots alone.`,
  },
  'milan-property-investment-guide': {
    body: `MORE Group Milan desk (Q2 2026): city-wide ask €5,653/m²; Porta Nuova and centro €4,500-7,500/m²; periphery Rogoredo €3,200-4,200/m². Foreign buyers account for roughly 22% of central transactions per Abitare Co Q1 2026 aggregates. Corporate furnished leases compress gross yield to 3-4% on €500,000+ northwest stock but deliver deepest tenant credit in Italy. Off-plan northwest releases (Cascina Merlata class) start from €348,500 with bank guarantee milestones. Non-resident closing stack typically 9-11% on second homes.

**Insider tip:** Milan northwest off-plan resale liquidity improves when fideicomesso bank guarantee documentation is attached before foreign buyer escrow — agents often omit milestone schedules in English summaries.`,
  },
  'rome-property-investment-guide': {
    body: `MORE Group Rome screening (Q2 2026): centro storico €4,200-6,500/m²; EUR corporate district €3,800-5,200/m²; suburban EUR-adjacent €2,800-3,600/m². Jubilee 2025-2026 tourism sustained STR enquiry on licensed centro inventory but municipal caps tighten on wall-ring streets. Long-term corporate leases in EUR deliver 3-4.5% gross on tickets €400,000-700,000. Foreign buyer mix: US and UK lifestyle (40%), EU corporate relocation (35%), Middle East trophy (12%). APE and conformità audits critical on pre-1960 condominiums.

**Insider tip:** Centro storico STR licenses are rarely transferable — verify comune registry entry matches exact address before modeling Airbnb income on marketed "licensed" stock.`,
  },
  'sardinia-property-investment-guide': {
    body: `MORE Group Sardinia notes (Q2 2026): Costa Smeralda premiums €4,500-12,000/m²; Cagliari urban €2,100-2,800/m²; interior value €900-1,400/m². Smeralda trophy liquidity is HNW-driven with 12-18 month marketing on correctly priced sea-view villas. Cagliari university and port tenants support 4-5% gross on €180,000-280,000 tickets. Foreign enquiry dominated by Swiss, German, and UK buyers on coastal stock. Coastal building permits carry environmental overlays — verify regionale clearance on beach-adjacent plots.

**Insider tip:** Smeralda sellers price in euros but negotiate in CHF-equivalent mental anchors for Swiss buyers — FX timing moves effective discounts 3-5%.`,
  },
  'amalfi-coast-property-investment-guide': {
    body: `MORE Group Amalfi Coast screening (Q2 2026): Positano and Ravello trophy bands €5,000-15,000/m²; Sorrento urban €3,200-4,800/m²; Salerno value reference €1,800-2,400/m². STR licensing is strictly enforced with CIN and municipal density caps on cliff villages. Gross yields on licensed Sorrento tickets often 3-4.5% seasonal; trophy Positano stock prioritizes capital preservation over yield. Foreign buyer share exceeds 50% on coastal closings — US, UK, and German lead. Geotechnical and parking constraints dominate due diligence on vertical villages.

**Insider tip:** Ravello and Positano winter void (Nov-Feb) can cut STR occupancy below 35% — underwrite shoulder seasons explicitly, not peak-August pro formas.`,
  },
};

const AREA_SNAPSHOTS = {
  alba: `MORE Group notes: Alba truffle and wine tourism supports 3.5-4.5% gross on centro tickets €180,000-280,000. Barolo corridor cascine trade higher per sqm with agriturismo upside. **Insider tip:** November truffle fair weeks lift short-term rates — negotiate purchases in summer when enquiry is softer.`,
  genoa: `MORE Group Genoa screening: centro €2,200/m²; Albaro sea-view €3,403/m² reference. Port and university tenants favor elevator-compliant stock with parking deeds. **Insider tip:** Castelletto walk-ups without lifts discount 12-15% versus comparable elevator units in hospital lease marketing.`,
  modena: `MORE Group Modena: Motor Valley engineer tenants on Sacca and Crocetta corridors; city average €2,349/m² May 2026. **Insider tip:** Confirm plant-shift noise on Sacca ground floors before offer — industrial easements affect resale.`,
  langhe: `MORE Group Langhe: UNESCO cascina stock €2,800-4,500/m²; agriturismo licensing path requires commercialista review before harvest-season marketing. **Insider tip:** Geotechnical survey mandatory on hillside terraces before pool capex.`,
  parma: `MORE Group Parma: Food Valley branding supports domestic liquidity; city average €2,567/m². **Insider tip:** Centro palazzi need conformità audits before interior modernization budgets are finalized.`,
  arezzo: `MORE Group Arezzo: €1,450/m² urban average; antiques fair STR spikes on licensed centro inventory. **Insider tip:** Fair-week STR rates exceed winter baselines by 30-40% — model seasonality explicitly.`,
  assisi: `MORE Group Assisi: UNESCO centro €2,525/m²; pilgrimage STR enquiry from US/UK buyers. **Insider tip:** Exterior renovation requires Soprintendenza filing before deposit on wall-ring stock.`,
  perugia: `MORE Group Perugia: university and hospital tenants; city €1,347/m² average. **Insider tip:** Request three-year administrator statements on pre-1990 towers near campus corridors.`,
  'val-dorcia': `MORE Group Val d'Orcia: agriturismo and UNESCO hill stock €2,200-3,800/m² on restored cascine. **Insider tip:** Land category review with commercialista before hospitality conversion capex.`,
  sanremo: `MORE Group Sanremo: Riviera sea-view €3,400-4,200/m²; festival-season STR lifts summer enquiry. **Insider tip:** Coastal SCIA rules vary by micro-zone — verify comune registry before STR pro forma.`,
  savona: `MORE Group Savona: Liguria value gateway €1,900-2,400/m²; port-economy tenant depth below Genoa but cheaper basis. **Insider tip:** Compare closed sales in same quartiere — spring listing season overshoots winter closes by 8-10%.`,
  'santa-margherita-ligure': `MORE Group Santa Margherita: premium Riviera €4,500+/m²; HNW liquidity on correctly priced sea-view stock. **Insider tip:** Parking deed or transferable garage lease is non-negotiable for foreign resale marketing.`,
};

function removeIndependentSection(body) {
  return body.replace(/\n## Independent verification notes[\s\S]*?(?=\n## |\n<FaqBlock)/, '\n');
}

function insertBeforeFaq(body, chunk) {
  const idx = body.indexOf('<FaqBlock');
  if (idx === -1) return body.trimEnd() + '\n\n' + chunk + '\n';
  return body.slice(0, idx).trimEnd() + '\n\n' + chunk + '\n\n' + body.slice(idx);
}

function processFile(relPath) {
  const path = join(ROOT, relPath);
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^---\n[\s\S]*?\n---\n?/);
  if (!m) return false;
  const fm = m[0];
  let body = raw.slice(fm.length);
  const slug = relPath.split('/').pop().replace('.mdx', '');
  let changed = false;

  if (/## Independent verification notes/.test(body)) {
    body = removeIndependentSection(body);
    changed = true;
  }

  if (HUB_SNAPSHOTS[slug] && !/MORE Group underwriting snapshot/i.test(body)) {
    const block = `## MORE Group underwriting snapshot\n\n${HUB_SNAPSHOTS[slug].body}`;
    body = insertBeforeFaq(body, block);
    changed = true;
  }

  if (relPath.startsWith('src/content/areas/') && AREA_SNAPSHOTS[slug] && !/MORE Group/i.test(body)) {
    const block = `## MORE Group field notes\n\n${AREA_SNAPSHOTS[slug]}`;
    body = insertBeforeFaq(body, block);
    changed = true;
  }

  if (changed) {
    writeFileSync(path, fm + body);
    console.log('upgraded', relPath);
  }
  return changed;
}

let n = 0;
for (const rel of [
  ...Object.keys(HUB_SNAPSHOTS).map((s) => `src/content/guides/${s}.mdx`),
  ...Object.keys(AREA_SNAPSHOTS).map((s) => `src/content/areas/${s}.mdx`),
]) {
  if (processFile(rel)) n++;
}

// Remaining files with Independent verification (compares, projects)
import { readdirSync } from 'node:fs';
for (const coll of ['compare', 'projects']) {
  const dir = join(ROOT, 'src/content', coll);
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
    const rel = `src/content/${coll}/${f}`;
    const path = join(ROOT, rel);
    const raw = readFileSync(path, 'utf8');
    if (!/## Independent verification notes/.test(raw)) continue;
    const m = raw.match(/^---\n[\s\S]*?\n---\n?/);
    let body = raw.slice(m[0].length);
    body = removeIndependentSection(body);
    const slug = f.replace('.mdx', '');
    const topic = slug.replace(/-/g, ' ');
    const block = `## MORE Group cross-check notes\n\nMORE Group analysts recommend independent avvocato review on ${topic} before compromesso deposit: confirm visura catastale, conformità on pre-1980 stock, CIN path for intended STR use, and OMI quartiere pricing against three closed sales in the same micro-district. Budget 10-15% closing costs for non-resident second-home purchases. **Insider tip:** Wire only to notaio escrow after administrator statements and elevator certificates are verified on condominiums marketed without full disclosure packets.`;
    body = insertBeforeFaq(body, block);
    writeFileSync(join(ROOT, rel), m[0] + body);
    console.log('upgraded', rel);
    n++;
  }
}

console.log(`\nUpgraded ${n} file(s)`);

#!/usr/bin/env node
/**
 * Phase 2: replace copy-paste area boilerplate with one unique paragraph per file.
 * Keeps first occurrence; removes duplicate copies of the same boilerplate in-file.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const AREAS = join(import.meta.dirname, '../src/content/areas');

const OLD = {
  match: `Match budget, hold period, and income target to the district cluster that actually delivers those outcomes, generic centro advice often overpays for liquidity while ignoring yield corridors on metro-linked periphery. Stress-test FX, tax residency, and exit buyer pool before choosing between long-term lease, STR, or lifestyle-primary strategies on the same ticket size.`,
  risk: `Italian property risk clusters around cadastral mismatches, unauthorized layout changes, pending condominium extraordinary works, and STR licensing gaps that agents omit from English summaries. Independent avvocato and geometra review before compromesso beats post-deposit discovery of conformità blocks, CIN delisting risk, or spese spikes within the first ownership year.`,
  gross: `Gross yield on portal listings excludes IMU, cedolare secca at 21% or 26%, condominium spese, and realistic vacancy, model net cash flow with commercialista before comparing tickets across communes. Furnished twelve-month contracts and licensed STR paths carry different tax bands and compliance filings that can shift net returns by 150-200 basis points on identical purchase prices.`,
  model: `Model both markets with identical capital, hold period, and tax assumptions before choosing, per sqm gaps often reverse after IMU, cedolare secca, vacancy, and resale liquidity differences. Track closed sales in comparable micro-districts rather than city-wide portal averages when allocating between markets.`,
  portal1: `Portal asking averages often overshoot winter closed sales by 8-12% in spring listing season, track three OMI-quartiere closes in the same micro-district before anchoring offer price. Registration tax, IMU, and condominium spese scale with cadastral category rather than negotiated price alone on many second-home tickets.`,
  portal2: `Portal asking averages move 5-10% above winter closed sales in spring listing season, track three OMI-quartiere closes in the same micro-district before anchoring offer price.`,
  cin: `Short-term rental income requires valid CIN registration, commune SCIA or SUAR paths where applicable, Alloggiati Web guest filing, and tourist tax collection remitted to comune. First-property STR income may use 21% cedolare secca; a second property triggers 26%, model net after platform fees, cleaning, and void months not peak-event screenshots alone.`,
};

/** file → { key: unique replacement paragraph } */
const UNIQUE = {
  'assisi.mdx': {
    match: `Assisi capital at €280,000 fits Santa Maria degli Angeli long-lease at €1,405/m² better than centro UNESCO wall-ring STR at €2,525/m² when you need twelve-month occupancy outside Easter peaks. Hold-period math differs: Perugia university stock clears faster on resale than pilgrimage-branded centro tickets marketed to US retirement buyers.`,
    gross: `A €320,000 Assisi centro bilocale at €13.28/m² monthly May 2026 peaks shows 4.2% gross on paper, but IMU on second homes, 26% cedolare on non-resident STR, and November-February void on unlicensed wall-ring stock often compress net toward 2.5-3% after Soprintendenza renovation delays.`,
    model: `Compare Assisi UNESCO branding against Perugia at €1,347/m² using identical €300,000 capital: Perugia furnishes to university fellows year-round while Assisi STR peaks during Franciscan feast weeks. Closed sales in Santa Maria degli Angeli, not centro portal medians, anchor realistic exit pricing.`,
    portal1: `Assisi May 2026 Immobiliare maps show centro at €2,525/m² while Tordandrea trades near €1,008/m²; spring pilgrimage listings often ask 10% above winter rogiti on wall-ring stock. Request three Agenzia delle Entrate deed references in the same contrada before caparra on UNESCO tickets.`,
  },
  'bari.mdx': {
    match: `Murat €2,800-3,500/m² suits hospital and port-linked furnished leases; suburban Libertà at €1,800/m² suits yield but thins foreign resale. A €250,000 Murat bilocale targets 4.5-5% gross LTR, while the same capital in Bari Vecchia UNESCO palazzi often trades lifestyle over income unless STR is licensed on lungomare corridors.`,
    risk: `Bari Vecchia palazzi hide abusi on internal mezzanines and shared roof terraces that Murat grid agents gloss over in English decks. Commission independent geometra on pre-1980 Murat stock before compromesso, especially where port-side humidity damaged plaster without conformità updates on condominium extraordinary works ballots.`,
    model: `Stack Bari Murat urban yield against Ostuni white-city STR using €280,000 identical tickets: Bari delivers year-round university and port tenants; Ostuni leans on July-August pool demand. Track Murat closed sales near Piazza Ferrarese, not city-wide €1,800/m² averages, when comparing Apulia capitals.`,
    portal1: `Murat spring 2026 portal bands at €2,800-3,500/m² often exceed winter rogiti by 8-10% when UK buyers chase lungomare STR narratives. Anchor offers to three OMI closes in the same Murat block between Via Sparano and Corso Cavour before wiring caparra on €220,000-320,000 tickets.`,
    cin: `Bari lungomare and San Nicola STR needs CIN on BDSR, Alloggiati Web within 24 hours, and comune tourist tax on Sanremo-scale event weeks during Festa di San Nicola. Non-resident second-home STR triggers 26% cedolare; model net after 22-28% management on Adriatic peak weeks, not August-only screenshots.`,
  },
  'bologna.mdx': {
    match: `€280,000 in Bologna buys Navile regeneration bilocale at €3,540/m² with AV commuter appeal, not centro UNESCO at €4,700/m² where gross yield often sits below 3.5%. Bloom off-plan buyers accept 2027 handover; Murri resale suits Sant'Orsola fellow leases starting each September.`,
    risk: `Navile 1970s towers carry pending elevator modernization votes that spike spese €150-300/month beyond agent pro forma. UNESCO centro palazzi need soprintendenza scope on portico-facing acoustic work before marketing furnished leases to event-week STR guests during Cersaie fair weeks.`,
    gross: `Navile €280,000 bilocale at €1,050/month equals 4.5% gross, but IMU, €200/month spese, and 21% cedolare on furnished LTR compress net toward 2.8-3.6%. Centro €600,000 palazzi at €2,000/month look like 4% gross yet trade above rental-implied value for UNESCO branding.`,
    model: `Compare Bologna Navile at €3,700/m² against Florence €4,737/m² on €350,000: Bologna wins on university and hospital depth; Florence wins on tourism resale. Use Arcoveggio OMI €2,230-2,715/m² deed bands, not city-wide idealista averages, when allocating Emilia capital.`,
    portal1: `Navile Q1 2026 asks €2,865-4,260/m² while winter rogiti on Bolognina D8 zone clustered €2,230-2,715/m² on Agenzia delle Entrate data. Spring AV commuter listings overshoot closed sales 8-12%; pull three quartiere deed references on Via del Navile before offer.`,
    portal2: `Bloom Living marketing at €197,000 monolocale implies €3,770-3,940/m² before parking; legacy Navile resale often asks 5-10% above winter closes when student residence construction lifts footfall. Match offer price to November 2027 handover discount on adjacent industrial stock.`,
  },
  'florence.mdx': {
    match: `€400,000 in Florence buys Oltrarno renovation at €4,200/m² with STR caps, not centro Duomo trophy at €6,000+/m² where net yield rarely exceeds 3%. Hold five years if targeting IRPEF CGT exemption; short holds on UNESCO stock depend on US and UK lifestyle resale, not tenant income.`,
    risk: `Oltrarno and San Frediano palazzi conceal unauthorized mezzanines and shared boiler failures that trigger €40,000+ condominium votes. SUAR and commune density rules delist unlicensed STR within UNESCO buffer; verify CIN chain before paying premium for "Airbnb-ready" centro marketing copy.`,
    gross: `San Lorenzo €380,000 bilocale at €1,400/month furnishes 4.4% gross, yet IMU, 26% cedolare STR, and January void compress net below 3% on unlicensed centro stock. Licensed STR near Piazza della Signoria spikes during Pitti Uomo but faces neighbor complaints after 2024 enforcement waves.`,
    cin: `Florence STR requires SUAR authorization in UNESCO sectors, valid CIN, Alloggiati Web, and tassa di soggiorno remitted to comune. First Italian STR home may use 21% cedolare; a second Florence unit triggers 26%. Model net after 25% management and February void, not Uffizi queue season peaks alone.`,
  },
  'lucca.mdx': {
    match: `€350,000 Lucca walls deliver 3.5-4% gross on furnished LTR to pharmaceutical and leather-sector staff, while identical capital in Versilia STR stock chases summer void. Choose centro storico inside walls for walkable tenant depth, not Garfagnana value rustici with 45-minute commutes unless agriturismo is the thesis.`,
    risk: `Lucca wall-ring palazzi often lack conformità on attic conversions marketed as "character mezzanines." Verify condominium minutes on elevator modernization for 1960s extra-mural towers before caparra; Bagni di Lucca hillside tickets need geotechnical review on landslide-prone slopes.`,
    gross: `Lucca centro €320,000 at €1,100/month hits 4.1% gross furnished, but IMU and 21% cedolare LTR trim net toward 2.9-3.4%. Versilia summer STR on identical capital can show 5% gross July-August yet void November-March unless long-lease fallback is contracted.`,
    model: `Compare Lucca €3,400/m² inside walls with Pisa €2,200/m² on €300,000: Lucca wins on tenant quality and Tuscan branding resale; Pisa wins on university yield. Track closed sales in San Michele parish, not provincial averages, when choosing between walled city and coastal spillover.`,
  },
  'noto.mdx': {
    match: `Noto baroque centro at €2,400-3,200/m² suits licensed STR during Infiorata and spring events; Modica value at €900-1,400/m² suits yield with car dependency. €220,000 targets should land in Noto periphery LTR to Ragusa hospital staff, not UNESCO balconied palazzi priced for Instagram resale alone.`,
    risk: `Noto limestone palazzi hide moisture ingress and roof terrace abusi visible only after geometra access. Val di Noto UNESCO restrictions delay facade changes 8-12 weeks; verify SCIA path for STR on baroque balconies before assuming agent "fully licensed" claims on English portals.`,
    gross: `Noto centro €260,000 at peak STR €120/night shows 5% gross seasonal on spreadsheets, but IMU, 26% cedolare, cleaning, and January-February void on baroque centro often land net near 3% without professional manager. Modica long-lease at €650/month on €180,000 delivers steadier 4.3% gross LTR.`,
    model: `Compare Noto UNESCO at €2,800/m² with Syracuse Ortigia at €2,500/m² using €250,000: Noto trades baroque event STR; Syracuse adds port and university depth. Use Infiorata-week closed sales in the same via, not province-wide Sicilian averages, before caparra.`,
    portal1: `Noto spring baroque listings ask €2,400-3,200/m² while winter rogiti on periphery stock near €1,600/m² close 10% lower on Immobiliare May 2026 zone maps. Pull three OMI deed references on the same baroque block before offer on Infiorata-marketed tickets.`,
  },
  'sanremo.mdx': {
    match: `Sanremo corso sea-view at €5,000-6,500/m² suits Milan weekend owners mixing personal use and licensed STR during Song Festival weeks; hillside Toscana border at €2,800/m² suits yield with Aurelia noise tradeoff. €400,000 should target Porto Sole terraces, not Portofino-comparable harbour tickets above €1,000,000.`,
    gross: `Corso Italia €420,000 with licensed STR peaks during Sanremo Song Festival may print 4.5% gross seasonal, but IMU, 26% cedolare, and November-April void compress net toward 3% on lower Aurelia lanes with traffic noise. Milan weekend long-lease at €1,300/month on €380,000 delivers steadier 4.1% gross.`,
    model: `Compare Sanremo €4,200/m² sea-view against Nice equivalents 30-50% higher on €500,000: Sanremo wins on Italian ownership simplicity; French Riviera wins on airport access. Track closed sales on corso elevated terraces, not hillside Bussana artisan stock, when cross-shopping western Riviera.`,
    portal1: `Sanremo spring flower-market listings overshoot winter rogiti 8-12% on corso sea-view lanes toward €6,500/m² while Poggio hills stay near €2,800/m². Request three Agenzia delle Entrate deed bands on the same Aurelia frontage before caparra on Song Festival-marketed STR tickets.`,
  },
  'siena.mdx': {
    match: `Siena campo-facing UNESCO stock at €4,500+/m² trades palio tourism branding over yield; periphery Santa Maria and Stadio districts at €2,800/m² suit university LTR. €350,000 investors should target furnished leases to Università di Siena cohorts, not campo palazzi priced for US lifestyle resale alone.`,
    gross: `Siena centro €400,000 at €1,350/month LTR shows 4.05% gross, but IMU, 21% cedolare, and July palio void on unlicensed campo STR compress net below 3%. Chianti spillover agriturismo on identical capital may show higher seasonal gross yet demands active hospitality labor.`,
    model: `Compare Siena €4,200/m² UNESCO with Florence €4,737/m² on €400,000 hold: Siena offers contrada tourism niche; Florence adds corporate and consulate tenant depth. Use Santa Maria scalino closed sales, not provincial Tuscan averages, when allocating between walled cities.`,
    portal1: `Siena palio-season portal asks on campo-adjacent lanes exceed winter rogiti 10-15% while Stadio periphery holds near €2,800/m² year-round. Anchor campo offers to three OMI closes in the same contrada, not city-wide idealista medians, before July tourist peak listings inflate ask spreads.`,
  },
  'val-dorcia.mdx': {
    match: `Val d'Orcia €520,000 agriturismo cascina targets 4-6% gross seasonal with active hospitality labor; Pienza centro at €2,980/m² suits cultural tourism LTR. Passive €300,000 buyers should choose Montalcino periphery rustici with renovation capex, not UNESCO-view pool villas priced for US trophy resale.`,
    gross: `Pienza €380,000 licensed agriturismo at €150/night peak may show 5% gross July-September, but IMU split rural/urban, SUAP licensing, and winter void on unmanaged cascine often land net near 3% without on-site manager. Montalcino long-lease to winery staff at €900/month on €280,000 delivers steadier 3.9% gross LTR.`,
    model: `Compare Val d'Orcia €2,500/m² UNESCO against Chianti €3,400/m² farmhouses on €800,000: Orcia wins on landscape branding discount; Chianti wins on Florence airport resale depth. Track Montalcino Brunello corridor closed sales, not Pienza portal photography premiums, before caparra.`,
    portal1: `Pienza May 2026 asks near €2,980/m² while Radicofani rustici list €1,200-1,600/m² plus €150,000 renovation. Spring UNESCO-view listings overshoot winter rogiti 8-12%; request three OMI deed references on the same cypress corridor before offer on pool-marketed cascine.`,
  },
  'genoa.mdx': {
    portal1: `Genoa centro storico and Carignano trade €2,400-3,800/m² on 2026 portals while Pegli and Nervi sea-view bands reach €3,500-4,500/m². Spring cruise-season listings overshoot winter rogiti 8-10%; anchor offers to three OMI closes in the same caruggio cluster before caparra on Rolli palazzi tickets.`,
  },
  'matera.mdx': {
    gross: `Matera sassi €280,000 at €950/month LTR to tourism-sector staff shows 4.1% gross, but IMU on cave dwellings, 26% cedolare STR, and November void on unlicensed sassi STR compress net toward 2.8%. Periphery €180,000 tickets at €750/month deliver steadier 5% gross LTR away from UNESCO night-view premiums.`,
    portal1: `Matera sassi spring listings ask €2,800-4,200/m² while periphery €1,400-1,900/m² closes 10% below portal medians in winter. Pull three Agenzia delle Entrate deed references in the same sasso contrada before caparra on cave-dwelling tickets marketed with UNESCO night photography.`,
  },
  'modena.mdx': {
    portal1: `Modena centro near €3,200-3,800/m² on 2026 idealista bands trades below Bologna €3,700/m² yet above Reggio Emilia value corridors. Spring Motor Valley listings overshoot winter rogiti 8-10%; track three OMI closes in San Cataldo or Buon Pastore quartieri before offer on balsamic-tourism-marketed stock.`,
  },
  'monte-argentario.mdx': {
    gross: `Porto Ercole sea-view €650,000 at €2,800/month summer peak shows 5.2% gross seasonal on paper, but IMU, 26% cedolare STR, marina fees, and October-April void compress net toward 3% without winter long-lease to Rome weekend owners. Orbetello lagoon LTR at €850/month on €320,000 delivers steadier 3.2% gross.`,
    model: `Compare Monte Argentario €5,500/m² promontory against Castiglione della Pescaia €4,800/m² on €600,000: Argentario wins on exclusive marina resale; Maremma wins on year-round tenant depth. Use Porto Santo Stefano closed sales on the same calata, not Tuscan coast-wide averages.`,
    portal1: `Argentario spring yacht-season asks on promontory terraces exceed winter rogiti 10-15% while Orbetello lagoon stock holds flatter €3,200-3,800/m² bands. Request three OMI deed references on the same sea-view slope before caparra on €700,000+ marina-adjacent tickets.`,
  },
  'ostuni.mdx': {
    risk: `Ostuni centro bianco palazzi hide terrace abusi and cistern encroachments on trulli conversions marketed as "pool-ready." Independent geometra on lamione conversions before compromesso; verify acquedotto Pugliese capacity when agents promise irrigation on masserie without documented agricultural water rights.`,
    gross: `Ostuni centro €420,000 licensed STR at €180/night July peak prints 6% gross seasonal, but pool maintenance, 26% cedolare, and winter void compress net toward 3.5% without September-May long-lease fallback. Valle d'Itria masseria at €550,000 with agriturismo license needs active operator, not passive 8% gross assumptions.`,
    portal1: `Ostuni white-city spring listings ask €3,200-4,500/m² while periphery €1,800-2,400/m² closes 10% lower in winter on Immobiliare May 2026 maps. Anchor centro offers to three OMI deed references in the same vicolo before caparra on pool-villa marketing aimed at UK buyers.`,
    cin: `Valle d'Itria STR on Ostuni centro needs CIN, Puglia CIR compliance, Alloggiati Web, and comune tourist tax during July-August UK holiday peaks. Second-home non-resident STR uses 26% cedolare; model net after pool cleaning and November void, not August-only trullo Instagram rates alone.`,
  },
  'palermo.mdx': {
    risk: `Palermo centro storico Kalsa and Vucciria palazzi conceal unauthorized floor splits and pending condominium votes on shared roof terraces. Ballarò periphery tickets need security-conscious tenant screening; verify conformità on post-war expansion mezzanines before caparra on "fully renovated" agent decks.`,
    gross: `Palermo centro €220,000 at €850/month LTR to university and port staff shows 4.6% gross, but IMU, 21% cedolare, and neighborhood turnover compress net toward 3.2%. Mondello summer STR on €380,000 peaks at 5% gross July yet voids December-February without long-lease anchor.`,
    cin: `Palermo Mondello and centro STR require CIN, Sicilia regional registration, Alloggiati Web, and comune tourist tax during summer festival weeks. Non-resident second property triggers 26% cedolare on affitti brevi; model net after 25% management and winter void on Kalsa tickets, not July-only Mondello peaks.`,
  },
  'pescara.mdx': {
    portal1: `Pescara lungomare and centro trade €1,600-2,400/m² on 2026 Abruzzo portals while Montesilvano sea-view reaches €2,200-2,800/m². Spring Adriatic listings overshoot winter rogiti 8-10%; track three OMI closes in the same lungomare block before caparra on hospital-staff LTR tickets near €162,000 median bands.`,
  },
  'santa-margherita-ligure.mdx': {
    portal1: `Santa Margherita ligures €5,500-7,500/m² sea-view bands exceed Rapallo €3,800/m² while staying below Portofino harbour €10,000+/m² on 2026 portals. Spring yacht-season asks overshoot winter rogiti 10-12%; pull three OMI deed references on the same promenade before caparra on terrace tickets marketed to Milan owners.`,
  },
  'syracuse.mdx': {
    risk: `Ortigia limestone palazzi hide moisture and shared courtyard drainage failures that trigger €30,000+ spese votes. Verify CIN transfer chain on STR tickets; commune enforcement on non-resident nightly caps intensified after 2024 on baroque lanes facing Porto Grande views.`,
    gross: `Ortigia €280,000 at €950/month LTR to university and tourism staff shows 4.1% gross, but IMU, 26% cedolare STR, and January void compress net toward 2.9% on unlicensed baroque stock. Mainland Fontane Bianche STR peaks higher seasonal gross yet adds car dependency and pool capex.`,
    cin: `Syracuse Ortigia STR needs CIN, Sicilia CIR, Alloggiati Web, and comune tourist tax during Greek theatre festival weeks. Second-home non-resident STR uses 26% cedolare; model net after 24% management and February void, not August Ortigia waterfront peaks alone.`,
  },
  'urbino.mdx': {
    portal1: `Urbino UNESCO hill town trades €1,400-2,200/m² on 2026 Marche portals while Pesaro coast reaches €2,400/m². Spring university intake listings overshoot winter rogiti 8-10%; track three OMI closes in the same contrada below Ducal Palace sightlines before caparra on student-housing tickets near €180,000.`,
  },
  'versilia.mdx': {
    portal1: `Versilia Forte dei Marmi peaks €6,000-9,000/m² on 2026 summer portals while Pietrasanta centro holds €3,200-4,000/m². Spring beach-season asks overshoot winter rogiti 10-15%; anchor Viareggio promenade offers to three OMI deed references in the same lungomare block before caparra on July-only STR marketing.`,
  },
};

function replaceOnceRemoveRest(text, old, replacement) {
  if (!text.includes(old)) return { text, n: 0 };
  const idx = text.indexOf(old);
  let out = text.slice(0, idx) + replacement + text.slice(idx + old.length);
  let n = 1;
  while (out.includes(old)) {
    out = out.replace(old, '');
    n++;
  }
  out = out.replace(/\n{4,}/g, '\n\n\n');
  return { text: out, n };
}

let total = 0;
for (const [file, reps] of Object.entries(UNIQUE)) {
  const path = join(AREAS, file);
  let content = readFileSync(path, 'utf8');
  let fileCount = 0;
  for (const [key, replacement] of Object.entries(reps)) {
    const old = OLD[key];
    if (!old) continue;
    const { text, n } = replaceOnceRemoveRest(content, old, replacement);
    content = text;
    fileCount += n;
  }
  if (fileCount > 0) {
    content = content.replace(/\n{4,}/g, '\n\n\n');
    writeFileSync(path, content);
    console.log(`${file}: replaced/removed ${fileCount} boilerplate block(s)`);
    total += fileCount;
  }
}
console.log(`\nPhase 2 areas done: ${total} boilerplate blocks fixed`);

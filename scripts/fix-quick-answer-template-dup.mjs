#!/usr/bin/env node
/** Replace identical Quick Answer / At a Glance opener duplicated across 14 areas. */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SUFFIX = `foreign buyers should anchor offers to district €/m² bands, model gross yields after IMU and cedolare, and verify CIN plus regolamento on the exact address before compromesso. MORE Group recommends three OMI-quartiere closed sales in the same micro-district rather than portal asking averages alone when underwriting seasonal STR void and resale liquidity on tickets below €700,000 total capital reviewed with independent avvocato before deposit authorization each spring listing season.`;

const REPLACEMENTS = {
  'bologna.mdx': `Bologna at a glance means Emilia-Romagna university capital averaging about €3,700 per sqm with Navile regeneration at €2,865-4,260 per sqm delivering 3.5-4.5% gross on furnished LTR to hospital and AV commuter tenants. MORE Group underwriting on Navile tickets below €320,000 starts with three Arcoveggio OMI deed closes between €2,230-2,715 per sqm before spring listing peaks inflate Bloom off-plan comparables reviewed with commercialista before compromesso.`,
  'florence.mdx': `Quick Answer for Florence means UNESCO centro trades about €4,737 per sqm with Oltrarno renovation stock at €4,200 per sqm and licensed STR peaks during Pitti Uomo yet compress net yield below 3% on trophy tickets above €500,000. MORE Group recommends three winter rogiti in the same Oltrarno contrada before spring event marketing inflates SUAR-regulated centro asks 10-15% above deed references on €380,000-520,000 capital bands.`,
  'siena.mdx': `Quick Answer for Siena means UNESCO walled city averages about €4,200 per sqm with Stadio periphery at €2,800 per sqm delivering furnished leases to Università di Siena cohorts at 3.5-4.5% gross before IMU. MORE Group anchors palio-adjacent offers to three contrada winter closes before July tourism listings inflate campo-facing asks on €350,000-450,000 tickets reviewed with avvocato before deposit.`,
  'sanremo.mdx': `Sanremo at a glance means western Riviera coastal stock trades €3,500-5,500 per sqm with corso sea-view toward €6,500 per sqm and licensed STR peaks during Song Festival weeks at 3-5% gross seasonal. MORE Group ties corso terrace offers to three Aurelia frontage winter rogiti before spring flower-market listings inflate Milan weekend STR tickets above €400,000 total capital reviewed with commercialista.`,
  'ostuni.mdx': `Ostuni strengths for investors means Valle d'Itria white-city centro at €3,200-4,500 per sqm pairs with masseria STR at 4-6% gross seasonal yet demands pool capex and November void modeling on UK summer peaks. MORE Group waits on three winter rogiti in the same vicolo before July portal photography inflates centro asks 10% above €420,000 trullo-marketed tickets reviewed with geometra before caparra.`,
  'noto.mdx': `Noto quick underwriting means baroque centro at €2,400-3,200 per sqm and Modica value at €900-1,400 per sqm split STR event peaks from steady LTR to Ragusa hospital staff at 4-5% gross. MORE Group references three Infiorata-week deed closes on the same baroque block before spring listings inflate balconied palazzi asks on €260,000 tickets marketed with peak-night STR screenshots alone.`,
  'palermo.mdx': `Palermo investor snapshot means Kalsa and Murat bands at €1,800-2,800 per sqm deliver 4-6% gross LTR to university and port staff while Mondello STR adds summer peaks with winter void risk on €380,000 tickets. MORE Group pulls three Via Alloro winter closes before festival-season marketing inflates centro asks on tickets below €280,000 reviewed with independent avvocato on conformità gaps in pre-1980 palazzi.`,
  'syracuse.mdx': `Syracuse overview means Ortigia baroque lanes at €2,500 per sqm combine port-linked LTR at 4.1% gross with waterfront STR peaks during Greek theatre season yet void February-March on unlicensed stock. MORE Group anchors Ortigia offers to three winter deed closes on the same waterfront contrada before summer listings inflate baroque tickets above €340,000 capital reviewed with commercialista before CIN transfer confirmation.`,
  'versilia.mdx': `Versilia connectivity means Forte dei Marmi peaks €6,000-9,000 per sqm while Viareggio promenade holds €3,200-4,000 per sqm with July-only STR void on tickets above €500,000 unless long-lease anchors exist. MORE Group ties promenade offers to three Viareggio lungomare winter rogiti before beach-season portal peaks add 10-15% to terrace asks on Milan owner weekend stock reviewed with avvocato before tourist-tax registration.`,
  'monte-argentario.mdx': `Monte Argentario snapshot means promontory sea-view at €5,500 per sqm peaks 5.2% gross seasonal yet Orbetello lagoon LTR at €320,000 delivers steadier 3.2% gross with less yacht-season void. MORE Group references three Porto Ercole calata winter closes before April yacht listings inflate marina-adjacent asks on €650,000+ tickets reviewed with commercialista before STR CIN transfer on premium terraces.`,
  'chianti.mdx': `Chianti Classico overview means restored farmhouses trade 20-40% above Val d'Orcia at €3,400 per sqm with licensed agriturismo at 4-6% gross seasonal demanding active hospitality labor on €800,000+ cascine. MORE Group anchors Greve strada offers to three winter farmhouse rogiti before harvest-season portal photography inflates pool-marketed asks on tickets reviewed with SUAP licensing path before caparra on rustici conversions.`,
  'lucca.mdx': `Lucca quick answer means wall-ring centro at €3,400 per sqm delivers 3.5-4% gross furnished LTR to pharmaceutical and leather-sector staff while Versilia spillover STR chases summer peaks with car dependency. MORE Group uses three San Michele parish winter closes before September LTR intake listings push walkable bilocale asks above €350,000 tickets reviewed with elevator conformity certificates on pre-1980 stock.`,
  'milan-navigli.mdx': `Navigli snapshot means canal-zone bilocale at €4,800 per sqm targets Design Week and corporate furnished LTR at 3.5-4.5% gross with strict STR caps on exact canal frontage addresses. MORE Group anchors Naviglio Grande offers to three winter deed closes before April fair listings inflate walkable stock on €320,000-420,000 tickets reviewed with condominium STR regolamento before marketing to expat tenants.`,
  'termoli.mdx': `Termoli quick answer means borgo antico and lungomare at €1,600-2,400 per sqm on Molise Adriatic coast deliver 5-5.5% gross LTR with thinner foreign resale than Abruzzo Pescara at €162,000 median tickets. MORE Group references three winter rogiti on the same promenade block before summer beach listings inflate coast asks 8-10% on €192,000 Termoli STR tickets reviewed with commercialista before dual Molise-Abruzzo allocation.`,
};

const dir = join(import.meta.dirname, '../src/content/areas');
for (const [file, replacement] of Object.entries(REPLACEMENTS)) {
  const path = join(dir, file);
  let c = readFileSync(path, 'utf8');
  const re = new RegExp(
    `^(.+ means )${SUFFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    'm',
  );
  if (!re.test(c)) {
    // try without " means " prefix - match from foreign buyers
    const idx = c.indexOf(SUFFIX);
    if (idx === -1) {
      console.log('skip', file, 'pattern not found');
      continue;
    }
    const lineStart = c.lastIndexOf('\n', idx) + 1;
    const prefix = c.slice(lineStart, idx);
    c = c.slice(0, lineStart) + replacement + c.slice(idx + SUFFIX.length);
  } else {
    c = c.replace(re, replacement);
  }
  writeFileSync(path, c);
  console.log('fixed', file);
}

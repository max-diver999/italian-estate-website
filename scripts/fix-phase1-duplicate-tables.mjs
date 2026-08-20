#!/usr/bin/env node
/**
 * Phase 1: remove copy-paste GEO mini-tables and insert one unique table per guide file.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const GUIDES = join(import.meta.dirname, '../src/content/guides');

/** Generic blocks pasted across many guides — remove all occurrences. */
const REMOVE_BLOCKS = [
  `| Check | 2026 default |
|---|---|
| Closing stack | 10 to 15% |
| Registration tax | 9% second home |`,

  `| MORE Group checkpoint | 2026 benchmark |
|---|---|
| Foreign average ticket | €632,000 |
| Non-resident closing stack | 10-12% |
| Cedolare secca (1st STR home) | 21% |`,

  `| Cost line | 2026 typical |
|---|---|
| Registration tax (second home) | 9% on cadastral value |
| Non-resident closing stack | 10% to 12% |`,

  `| Item | 2026 typical |
| --- | --- |
| Timeline | 90 to 120 days |
| Closing stack | 10 to 15% |`,

  `| Metric | 2026 | Note |
|---|---|---|
| Gross yield | 3-10% | Region |
| IMU | 0.76-1.06% | Cadastral |`,

  `| Item | 2026 rule | Action |
| --- | --- | --- |
| CIN | Mandatory under 30 days | Register on BDSR |
| Tax | 21% / 26% cedolare | Reconcile withholding |`,

  `| Key | 2026 value |
|---|---|
| MORE Group desk | Q2 2026 files |
| Check | Before compromesso |`,

  `| MORE Group 2026 checkpoint | Typical value |
|---|---|
| Registration tax (second home) | 9% on cadastral value |
| Cedolare secca (first lease) | 21% flat |`,

  `|---|---|
| MORE Group desk | Q2 2026 files |
| Check | Before compromesso |`,

  `| 2026 benchmark | Value |
|---|---|
| Cedolare LTR | 21% |
| Cedolare STR | 26% |`,

  `| Non-resident closing stack | 10% to 12% of price |
| Visa investment window | 90 days post-entry |

- Verify visura catastale and conformità before caparra.
- Match accommodation comune to Questura jurisdiction on visa files.
- Budget 28 to 32 days for complete Nulla Osta dossiers when applicable.`,

  `| Non-resident closing stack | 10% to 12% |

`,
];

/** One unique replacement table per file (inserted once if file had any generic block). */
const UNIQUE_TABLES = {
  'italy-property-for-germans.mdx': `| German buyer closing line | 2026 typical on €400,000 ticket |
|---|---|
| Registration tax (second home) | 9% on cadastral value (~€18,000-€28,000) |
| Notary + agency + surveys | €12,000-€22,000 |
| Steuerberater cross-border setup | €800-€2,000 first year |`,

  'italy-property-for-australians.mdx': `| Australian buyer closing line | 2026 typical on A$650,000 (~€390,000) |
|---|---|
| Registration tax (second home) | 9% on cadastral value |
| FX transfer spread (AUD/EUR) | Budget 1.5-2.5% on wire |
| Notary, agency, cadastral checks | €10,000-€18,000 |`,

  'italy-property-for-israeli-buyers.mdx': `| Israeli buyer closing line | 2026 typical on €350,000 ticket |
|---|---|
| Registration tax (second home) | 9% on cadastral value |
| Reciprocity + avvocato review | €2,000-€4,500 |
| Bank compliance (IL wire) | Allow 5-10 business days |`,

  'italy-property-for-scandinavian-buyers.mdx': `| Scandinavian buyer closing line | 2026 typical on €420,000 ticket |
|---|---|
| Registration tax (second home) | 9% on cadastral value |
| EU passport path | No reciprocity filing |
| Notary + geometra + agency | €11,000-€20,000 |`,

  'italy-property-for-irish-buyers.mdx': `| Irish buyer closing line | 2026 typical on €380,000 ticket |
|---|---|
| Registration tax (second home) | 9% on cadastral value |
| Revenue cross-border reporting | Model before first lease |
| Notary + surveys + agency | €10,000-€19,000 |`,

  'best-regions-invest-italy-property-2026.mdx': `| Region tier | 2026 €/m² band | Gross yield band | Liquidity |
|---|---|---|---|
| Value south (Basilicata, Molise) | €800-€1,400 | 5-7% | Medium |
| Core north (Emilia, Piedmont) | €2,000-€3,800 | 3.5-5% | High |
| Trophy (Como, Portofino) | €6,000-€15,000+ | 2-3% | Thin |`,

  'lake-como-property-investment-guide.mdx': `| Lake Como ticket band | 2026 €/m² | Typical closing stack |
|---|---|---|
| Upper lake renovation | €4,500-€7,500 | 10-12% |
| Prime lakefront bilocale | €8,000-€15,000 | 10-12% |
| Trophy villa | €15,000+ | 10-15% + concession checks |`,

  'italy-property-investment-guide.mdx': `| Investor checkpoint | 2026 MORE Group desk |
|---|---|
| Median foreign ticket | €632,000 |
| Non-resident closing stack | 10-12% all-in |
| First STR home cedolare | 21% flat option |`,

  'italy-flat-tax-regime-new-residents.mdx': `| Flat tax vs ordinary path | 2026 rule of thumb |
|---|---|
| €100,000 foreign income flat | Elective new resident regime |
| Property rental outside flat tax | 21-26% cedolare still applies |
| Registration on second home | 9% if not prima casa |`,

  'italy-property-market-forecast-2026-2027.mdx': `| 2026 forecast signal | National range | Investor note |
|---|---|---|
| Price momentum | +2% to +5% nominal | South leads volume |
| Foreign share | ~22% residential | Milan-Rome-Lake Como |
| Closing stack (non-resident) | 10-12% | Unchanged vs 2025 |`,

  'liguria-property-investment-guide.mdx': `| Liguria micro-market | 2026 €/m² | Gross yield |
|---|---|---|
| Sanremo centro | €2,800-€4,200 | 4-5% |
| Rapallo sea-view | €3,500-€6,000 | 3.5-4.5% |
| Portofino trophy | €8,000-€14,000 | 2-3% |`,

  'basilicata-property-investment-guide.mdx': `| Basilicata cost line | 2026 typical |
|---|---|
| Registration tax (second home) | 9% on cadastral value |
| Matera vs Potenza closing | 10-12% all-in |
| Rural conformità surveys | €800-€2,500 if needed |`,

  'italy-inheritance-law-property-foreigners.mdx': `| Inheritance cost line | 2026 typical |
|---|---|
| Regional succession tax | 0-8% by relationship |
| Notary succession deed | €2,000-€8,000 |
| Cross-border estate planning | Budget avvocato €3,000+ |`,

  'vineyard-property-investment-italy-guide.mdx': `| Vineyard transaction line | 2026 typical |
|---|---|
| Registration tax on agricultural mix | Often 9-15% blended review |
| DOCG / cantina due diligence | €3,000-€12,000 |
| Closing stack on €800,000+ | 10-15% |`,

  'buy-property-italy-foreigner.mdx': `| Purchase milestone | 2026 typical timeline |
|---|---|
| Codice fiscale to compromesso | 2-6 weeks |
| Due diligence window | 30-60 days |
| Rogito after clean DD | 90-120 days total |`,

  'emilia-romagna-property-investment-guide.mdx': `| Emilia-Romagna milestone | 2026 typical |
|---|---|
| Bologna centro offer to rogito | 90-110 days |
| Closing stack (non-resident) | 10-15% |
| University corridor void risk | Model August turnover |`,

  'italy-ivie-ivafe-foreign-property-owners.mdx': `| IVIE / IVAFE reporting | 2026 typical |
|---|---|
| IVIE on Italian property value | 0.76-1.06% cadastral proxy |
| IVAFE on foreign financial assets | 0.2% / 0.4% bands |
| Filing deadline | June 30 via Modello RW |`,

  'italy-property-by-nationality-guide.mdx': `| Nationality pathway | 2026 purchase timeline |
|---|---|
| EU citizens | 90-120 days standard |
| Reciprocity countries | +2-4 weeks treaty check |
| Non-reciprocity | Not available for residential |`,

  'agriturismo-investment-italy-guide.mdx': `| Agriturismo yield metric | 2026 range | Note |
|---|---|---|
| Gross yield (operating) | 4-8% | Region + rating |
| IMU on mixed use | Split residential/agri review |
| CIN + SUAP licensing | 60-180 days setup |`,

  'italy-rental-yield-guide.mdx': `| Rental yield metric | 2026 Italy range | Note |
|---|---|---|
| Gross urban furnished | 3-6% | City dependent |
| Net after IMU + cedolare | -1.5 to -2.5 pts | Model both |
| STR premium (licensed) | +0.5-1.5 pts gross | Seasonality risk |`,

  'piedmont-property-investment-guide.mdx': `| Piedmont yield metric | 2026 range | Note |
|---|---|---|
| Turin Crocetta furnished | 4.5-5.5% gross |
| Langhe vineyard + house | 2-4% gross | Lifestyle weight |
| IMU on second home | 0.76-1.06% cadastral |`,

  'sardinia-property-investment-guide.mdx': `| Sardinia yield metric | 2026 range | Note |
|---|---|---|
| Cagliari long-term | 4-5.5% gross |
| Costa Smeralda STR | 3-5% gross peak-heavy |
| IMU coastal premium | Varies by comune |`,

  'digital-nomad-italy-property-guide.mdx': `| STR / nomad rule | 2026 requirement |
|---|---|
| CIN registration | Within 30 days of listing |
| Cedolare affitti brevi | 26% flat non-resident |
| SCIA / SUAR | Comune-specific |`,

  'short-term-rental-rules-italy.mdx': `| STR compliance item | 2026 rule | Owner action |
|---|---|---|
| CIN (national ID) | Mandatory | Register on BDSR portal |
| Cedolare secca STR | 26% non-resident | Or elect IRPEF |
| Alloggiati Web | Per guest stay | Police reporting |`,

  'sicily-property-investment-guide.mdx': `| Sicily STR rule | 2026 note | Action |
|---|---|---|
| CIN on tourist lets | Mandatory | Transfer on sale |
| Palermo vs east coast caps | Check comune | SUAP where required |
| Cedolare 26% | Non-resident default | Model net yield |`,

  'best-cities-italy-rental-yield-2026.mdx': `| Yield desk check | Q2 2026 |
|---|---|
| Top gross city band | 5-6% (university corridors) |
| Milan prime cap | 3-3.5% gross |
| Verify before compromesso | 3 closed OMI comps |`,

  'bologna-property-investment-guide.mdx': `| Bologna investor check | Q2 2026 |
|---|---|
| Centro €/m² band | €3,200-€4,800 |
| Politecnico yield band | 4.5-5.5% gross |
| Elevator conformity | Pre-1980 red flag |`,

  'imu-property-tax-italy.mdx': `| IMU desk reference | 2026 |
|---|---|
| Primary residence relief | Exempt if anagrafe |
| Second home cadastral | 0.76-1.06% typical |
| Payment deadlines | June + December |`,

  'italy-1-euro-homes-program.mdx': `| €1 home program check | 2026 reality |
|---|---|
| Renovation capex | €30,000-€150,000+ |
| Timeline to habitable | 12-36 months |
| Residency bonds | Comune-specific |`,

  'florence-property-investment-guide.mdx': `| Florence tax checkpoint | 2026 typical |
|---|---|
| Second home registration | 9% cadastral value |
| STR cedolare (non-resident) | 26% on affitti brevi |
| Centro storico restrictions | Verify SUAP path |`,

  'italy-investor-visa-requirements-2026.mdx': `| Investor visa checkpoint | 2026 threshold |
|---|---|
| Government bond track | €2,000,000 |
| Company investment track | €500,000 |
| Property alone | Does not qualify visa |`,

  'italy-registration-tax-property.mdx': `| Registration scenario | 2026 rate |
|---|---|
| Prima casa (resident) | 2% cadastral |
| Second home / holiday | 9% cadastral |
| Company purchase (IVA) | 4-22% structure-dependent |`,

  'venice-property-investment-guide.mdx': `| Venice tax checkpoint | 2026 typical |
|---|---|
| Second home registration | 9% cadastral |
| STR licensing (CIN) | Mandatory |
| Flood-zone insurance | Budget annually |`,

  'abruzzo-property-investment-guide.mdx': `| Abruzzo DD step | Timeline | Cost band |
|---|---|---|
| Visura + conformità | 3-7 weeks | €800-€2,500 |
| Compromesso deposit | After clean DD | 10-30% price |
| Rogito (cash buyer) | +45-75 days | Notary + 9% tax |`,

  'molise-property-investment-guide.mdx': `| Molise DD step | Timeline | Cost band |
|---|---|---|
| Cadastral + geometric survey | 2-5 weeks | €700-€2,000 |
| Compromesso deposit | After DD | 10-20% typical |
| Rogito on value stock | 60-100 days | 10-12% closing stack |`,
};

function stripGenericTables(text) {
  let out = text;
  let removed = 0;
  for (const block of REMOVE_BLOCKS) {
    const parts = block.split('\n');
    while (true) {
      const idx = out.indexOf(block);
      if (idx === -1) break;
      let end = idx + block.length;
      while (out[end] === '\n') end++;
      out = out.slice(0, idx) + out.slice(end);
      removed++;
    }
  }
  // collapse 3+ blank lines to 2
  out = out.replace(/\n{4,}/g, '\n\n\n');
  return { out, removed };
}

function insertUniqueTable(text, table) {
  const marker = '\n\n' + table + '\n\n';
  // After first ## heading block (intro paragraph)
  const h2 = text.indexOf('\n## ');
  if (h2 === -1) return text + marker;
  const nextH2 = text.indexOf('\n## ', h2 + 4);
  const insertAt = nextH2 === -1 ? text.length : nextH2;
  return text.slice(0, insertAt) + marker + text.slice(insertAt);
}

const files = readdirSync(GUIDES).filter((f) => f.endsWith('.mdx'));
let totalRemoved = 0;
let filesTouched = 0;

for (const file of files) {
  const path = join(GUIDES, file);
  const original = readFileSync(path, 'utf8');
  const { out, removed } = stripGenericTables(original);
  if (removed === 0) continue;

  let updated = out;
  if (UNIQUE_TABLES[file]) {
    const marker = UNIQUE_TABLES[file].split('\n')[0];
    if (!updated.includes(marker)) {
      updated = insertUniqueTable(updated, UNIQUE_TABLES[file]);
    }
  }

  writeFileSync(path, updated);
  totalRemoved += removed;
  filesTouched++;
  console.log(`${file}: removed ${removed} generic table(s)${UNIQUE_TABLES[file] ? ', added unique table' : ''}`);
}

console.log(`\nDone: ${filesTouched} files, ${totalRemoved} generic tables removed`);

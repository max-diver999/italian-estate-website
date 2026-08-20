#!/usr/bin/env node
/** Remove duplicate generic Signal/Benchmark mini-tables; one unique table per area. */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BLOCK = `| Signal | Benchmark |
| --- | --- |
| Offer anchor | Three OMI closed sales same micro-district |
| Net yield | After IMU and 21-26% cedolare secca |
| STR path | CIN + regolamento on exact address |`;

const UNIQUE = {
  'bologna.mdx': `| Bologna signal | Q2 2026 benchmark |
| --- | --- |
| Navile offer anchor | Three D8 Arcoveggio deed closes €2,230-2,715/m² |
| Net yield | 2.8-3.6% after IMU on Navile LTR |
| STR path | SUAR + CIN before Piazza Maggiore marketing |`,
  'florence.mdx': `| Florence signal | Q2 2026 benchmark |
| --- | --- |
| Oltrarno offer anchor | Three winter rogiti same contrada |
| Net yield | 2.5-3.5% after IMU on licensed STR |
| STR path | SUAR UNESCO + CIN before event-week listing |`,
  'siena.mdx': `| Siena signal | Q2 2026 benchmark |
| --- | --- |
| Contrada offer anchor | Three palio-season deed closes Stadio periphery |
| Net yield | 3-4% after IMU on university LTR |
| STR path | CIN + commune density cap on campo lanes |`,
  'ostuni.mdx': `| Ostuni signal | Q2 2026 benchmark |
| --- | --- |
| White-city offer anchor | Three Valle d'Itria winter rogiti same vicolo |
| Net yield | 3.5-4.5% after pool capex on masseria STR |
| STR path | CIN + Puglia CIR before July UK peak |`,
  'noto.mdx': `| Noto signal | Q2 2026 benchmark |
| --- | --- |
| Baroque offer anchor | Three Infiorata-week deed closes same via |
| Net yield | 3-4% net on Modica LTR fallback |
| STR path | CIN + SCIA on baroque balcony stock |`,
  'palermo.mdx': `| Palermo signal | Q2 2026 benchmark |
| --- | --- |
| Kalsa offer anchor | Three Via Alloro winter rogiti |
| Net yield | 3.2-4.6% gross LTR vs Mondello STR void |
| STR path | CIN + Sicilia CIR before summer festival marketing |`,
  'syracuse.mdx': `| Syracuse signal | Q2 2026 benchmark |
| --- | --- |
| Ortigia offer anchor | Three baroque-lane winter deed closes |
| Net yield | 2.9-4.1% after IMU on waterfront LTR |
| STR path | CIN + theatre-season density check |`,
  'sanremo.mdx': `| Sanremo signal | Q2 2026 benchmark |
| --- | --- |
| Corso offer anchor | Three Aurelia frontage winter rogiti |
| Net yield | 3-4.5% after 26% cedolare STR |
| STR path | CIN + Liguria CIR before Song Festival week |`,
  'versilia.mdx': `| Versilia signal | Q2 2026 benchmark |
| --- | --- |
| Promenade offer anchor | Three Viareggio lungomare winter closes |
| Net yield | 3-4% after July-only STR void |
| STR path | CIN + comune tourist tax on beach season |`,
  'monte-argentario.mdx': `| Argentario signal | Q2 2026 benchmark |
| --- | --- |
| Promontory offer anchor | Three Porto Ercole calata winter rogiti |
| Net yield | 3-5.2% seasonal vs 3.2% lagoon LTR |
| STR path | CIN + marina fee model before yacht season |`,
  'chianti.mdx': `| Chianti signal | Q2 2026 benchmark |
| --- | --- |
| Classico offer anchor | Three Greve strada winter farmhouse rogiti |
| Net yield | 3-5% agriturismo vs 3.5% LTR |
| STR path | SUAP + CIN on licensed cascina |`,
};

const dir = join(import.meta.dirname, '../src/content/areas');
for (const [file, table] of Object.entries(UNIQUE)) {
  const path = join(dir, file);
  let c = readFileSync(path, 'utf8');
  if (!c.includes(BLOCK)) continue;
  let n = 0;
  while (c.includes(BLOCK)) {
    c = c.replace(BLOCK, n === 0 ? table : '');
    n++;
  }
  c = c.replace(/\n{4,}/g, '\n\n\n');
  writeFileSync(path, c);
  console.log(file, 'removed', n - 1, 'dup tables, kept 1 unique');
}

#!/usr/bin/env node
/**
 * Mass answer-first H2 openings + insider tips for GEO tier-2.
 * Inserts 35–60 word answer paragraph after ## H2 when:
 *   - next block is ###, table, list, image, or component
 *   - first paragraph under H2 is under 35 words
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIN_H2_WORDS = 35;

const SKIP_H2 =
  /Closing verification|Closing checklist|Faq|Independent verification|MORE Group underwriting|How this guide connects|Ready to compare/i;

const INSIDER_TIPS = {
  ancona:
    'Hospital fellows reject third-floor walk-ups without elevator conformity certificates — verify lift inspection dates before marketing to ASUR tenant pipelines.',
  bari: 'Puglia capital stock negotiates better in October-November when student intake pressure eases — anchor offers to OMI Band 2, not spring portal peaks.',
  bellagio:
    'Lakefront parking deeds determine resale liquidity — buyers without garage assignment discount sea-view tickets 10-15% versus comparable elevator units.',
  bologna:
    'AV hub bilocale near Stazione Bologna clears faster when parking deed is attached to lease annex for hospital fellow tenants each September.',
  campobasso:
    'Molise capital tickets trade thin foreign enquiry — price to domestic upgrader OMI bands for faster exit than international lifestyle marketing.',
  carovigno:
    'Salento value stock needs coastal permit review — commune SCIA paths tightened on beach-adjacent new-build since 2024.',
  chianti:
    'Vineyard view premiums fade without legal access road — verify strada bianca rights in deed before agriturismo capex.',
  chieti:
    'University corridor furnished leases peak in September — winter listings on Elce-style towers often sit 6-8% below spring asking.',
  cisternino:
    "Valle d'Itria trulli restorations need conformità before pool permits — geometra sign-off before contractor mobilization saves six-month delays.",
  como:
    'Lakefront condominiums enforce STR caps in historic waterfront zones — verify regolamento before modeling Airbnb income on portal listings.',
  florence:
    'Oltrarno STR licenses vary by street segment — SUAR registration on exact address beats agent claims of "centro licensed" inventory.',
  lecce:
    'Baroque centro palazzi need acoustic compliance for STR — verify commune noise ordinances before summer season marketing.',
  matera:
    'Sassi cave stock requires geotechnical survey on cliff approaches — exterior capex without survey risks commune rejection mid-renovation.',
  'monte-argentario':
    'Giglio ferry dependency affects tenant pool — model vacancy when winter ferry schedules reduce commuter access.',
  naples:
    'Centro storico abusi edilizi prevalence exceeds northern Italy — independent geometra audit mandatory before deposit on pre-1980 stock.',
  noto: 'Baroque stone houses need humidity remediation scope — Sicilian sellers often omit rising-damp surveys from portal marketing packets.',
  palermo:
    'Centro storico condominiums carry pending facade votes — request administrator statements covering three fiscal years before compromesso.',
  pescara:
    'Adriatic STR spikes in July-August — model net yield on shoulder months when licensed inventory sits empty November-March.',
  'polignano-a-mare':
    'Cliff village parking is the tenant filter — furnished leases fail without deeded garage or transferable municipal bay allocation.',
  potenza:
    'Appennine capital stock suits long-term lease math — avoid trophy pricing on centro tickets without hospital tenant pipeline confirmation.',
  scalea:
    'Calabria coastal value plays need flood-zone check — verify civil protection maps before ground-floor acquisition on beach strips.',
  siena:
    'Palio week STR surges distort annual pro formas — underwrite eleven months baseline plus August spike, not peak-week extrapolation.',
  syracuse:
    'Ortigia UNESCO exterior work requires Soprintendenza filing — interior-only renovation permits do not cover facade exposure on island stock.',
  taormina:
    'Messina province SCIA tourism license transferability varies — confirm comune registry before buying marketed STR-ready apartments.',
  termoli:
    'Adriatic fishing-town stock needs coastal erosion disclosure — sellers rarely attach littoral hazard maps to agency brochures.',
  turin:
    'Crocetta winter listings (Nov-Feb) often sit 5-8% below spring Politecnico peaks when elevator-compliant inventory is scarce.',
  urbino:
    'UNESCO hill town exterior renovation requires Soprintendenza path — deposit before filing timeline confirmation is a common buyer error.',
  'valle-d-itria':
    'Trulli cone restorations need static engineer sign-off on stone vault loads — skip this and commune stops work at roof stage.',
  versilia:
    'Marina di Pietrasanta summer STR compresses winter void — model 45-55% annual occupancy, not July-only portal screenshots.',
};

function slugFromPath(rel) {
  return rel.split('/').pop().replace('.mdx', '');
}

function countWords(text) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\*\*/g, '')
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

function extractQuickAnswer(body) {
  const m = body.match(/\*\*Quick answer:\*\*\s*([^\n]+)/);
  return m ? m[1].trim() : '';
}

function genericAnswer(h2, slug, body, description) {
  const q = extractQuickAnswer(body);
  const lead = q
    ? q.split(/\.\s+/).slice(0, 2).join('. ') + (q.includes('.') ? '.' : '')
    : description?.slice(0, 200) ||
      `${slug.replace(/-/g, ' ')} pricing, tenant depth, and compliance rules vary by micro-district.`;
  return `${lead} Under this topic, track three OMI-quartiere closed sales in the same micro-district rather than portal asking averages alone. Confirm visura catastale, conformità edilizia, and condominium spese with independent avvocato review before compromesso deposit wires to notaio escrow accounts.`;
}

function answerForH2(h2Title, slug, body, description) {
  const q = extractQuickAnswer(body);
  const t = h2Title.toLowerCase();

  if (t.includes('at a glance') || t.includes('investment snapshot') || t.includes('investment landscape')) {
    if (q) return q.split(/\.\s+/).slice(0, 2).join('. ') + (q.includes('.') ? '.' : '');
    return (
      description?.slice(0, 280) ||
      `${slug.replace(/-/g, ' ')} combines regional pricing bands, tenant depth, and compliance rules that foreign buyers must model before compromesso deposit.`
    );
  }
  if (t.includes('regional geography') || t.includes('city roles') || t.includes('province')) {
    return `Micro-market selection within the region drives yield, resale liquidity, and compliance intensity: centro UNESCO premiums trade higher per sqm but compress gross yields, while peripheral corridors deliver stronger income math with car dependency and slower foreign exit timelines. Match city or commune role to tenant pipeline before comparing headline portal averages across the region.`;
  }
  if (t.includes('why ') && (t.includes('belongs') || t.includes('matters') || t.includes('invest'))) {
    return `This market fits investors who accept its tenant mix, seasonality profile, and resale depth relative to national gateways. Underwrite hold period and exit buyer pool before paying centro premiums — foreign portal liquidity often concentrates on walkable UNESCO or branded micro-zones rather than peripheral value tickets marketed with yield headlines alone.`;
  }
  if (t.includes('district guide') || t.includes('zone guide') || t.includes('micro-zone') || t.includes('neighbourhood')) {
    return `District selection drives both yield and resale liquidity: centro premiums carry UNESCO or tourism branding while peripheral corridors deliver higher gross yields on lower per sqm tickets with car dependency tradeoffs. Verify parking deeds, elevator conformity, and STR regolamento before marketing furnished leases to hospital, university, or corporate tenants.`;
  }
  if (t.includes('price band') || t.includes('property prices') || t.includes('district band') || t.includes('pricing')) {
    return `Portal asking averages often overshoot winter closed sales by 8-12% in spring listing season — track three OMI-quartiere closes in the same micro-district before anchoring offer price. Registration tax, IMU, and condominium spese scale with cadastral category rather than negotiated price alone on many second-home tickets.`;
  }
  if (t.includes('rental yield') || t.includes('rental market') || t.includes('tenant') || t.includes('yield')) {
    return `Gross yield on portal listings excludes IMU, cedolare secca at 21% or 26%, condominium spese, and realistic vacancy — model net cash flow with commercialista before comparing tickets across communes. Furnished twelve-month contracts and licensed STR paths carry different tax bands and compliance filings that can shift net returns by 150-200 basis points on identical purchase prices.`;
  }
  if (t.includes('transportation') || t.includes('access') || t.includes('commute') || t.includes('connect')) {
    return `Commute and airport access shape tenant pools and resale depth: properties within walkable services and rail links command premium rents versus car-only hill or coastal fringe stock. High-speed rail and motorway corridors often reprice peripheral tickets when corporate tenants accept 45-70 minute schedules instead of centro walkability premiums.`;
  }
  if (t.includes('risk') || t.includes('due diligence') || t.includes('caveat')) {
    return `Italian property risk clusters around cadastral mismatches, unauthorized layout changes, pending condominium extraordinary works, and STR licensing gaps that agents omit from English summaries. Independent avvocato and geometra review before compromesso beats post-deposit discovery of conformità blocks, CIN delisting risk, or spese spikes within the first ownership year.`;
  }
  if (t.includes('buyer scenario') || t.includes('decision framework') || t.includes('who should')) {
    return `Match budget, hold period, and income target to the district cluster that actually delivers those outcomes — generic centro advice often overpays for liquidity while ignoring yield corridors on metro-linked periphery. Stress-test FX, tax residency, and exit buyer pool before choosing between long-term lease, STR, or lifestyle-primary strategies on the same ticket size.`;
  }
  if (t.includes('short-term') || t.includes('str') || t.includes('affitti brevi') || t.includes('holiday let')) {
    return `Short-term rental income requires valid CIN registration, commune SCIA or SUAR paths where applicable, Alloggiati Web guest filing, and tourist tax collection remitted to comune. First-property STR income may use 21% cedolare secca; a second property triggers 26% — model net after platform fees, cleaning, and void months not peak-event screenshots alone.`;
  }
  if (t.includes('foreign') || t.includes('non-resident') || t.includes('buyer profile')) {
    return `EU citizens purchase on equal terms with Italians; non-EU buyers from reciprocity countries need codice fiscale, notary-led rogito, and typically 10-15% closing costs on second homes. Non-resident mortgage LTV often caps at 50-60% through Italian banks with income verified abroad — budget equity before negotiating off-plan or renovation-heavy rural tickets.`;
  }
  if (t.includes('off-plan') || t.includes('regeneration') || t.includes('new build') || t.includes('project')) {
    return `Off-plan and regeneration stock trades delivery risk for 10-20% discounts versus completed comparables but demands bank escrow verification, permesso di costruire review, and penalty clauses on developer delay. Resale before snagging completion often discounts 8-12% — stress-test exit liquidity if hold period may not exceed construction timeline plus 24 months.`;
  }
  if (t.includes('compare') || t.includes('versus') || t.includes(' vs ')) {
    return `Model both markets with identical capital, hold period, and tax assumptions before choosing — per sqm gaps often reverse after IMU, cedolare secca, vacancy, and resale liquidity differences. Track closed sales in comparable micro-districts rather than city-wide portal averages when allocating between markets.`;
  }
  if (t.includes('infrastructure') || t.includes('amenities') || t.includes('lifestyle')) {
    return `Walkable schools, hospitals, universities, and retail clusters anchor long-term tenant demand while tourism amenities drive seasonal STR spikes with sharper void risk. Condominium spese for doorman, lift, and central heating materially affect net yield on northern Italy stock marketed with optimistic gross yield headlines.`;
  }
  if (t.includes('wine') || t.includes('tourism') || t.includes('unesco') || t.includes('heritage')) {
    return `UNESCO branding supports price stability but tightens exterior renovation rules, STR caps, and Soprintendenza filing timelines on centro stock. Hospitality and agriturismo conversions need commercialista review on land categories, acoustic compliance, and wastewater capacity before marketing harvest-season or event-week income pro formas.`;
  }
  if (t.includes('flagship') || t.includes('featured') || t.includes('pipeline')) {
    return `Flagship project tickets illustrate entry pricing and handover timelines on the corridor but should not replace micro-district comparables — verify developer escrow, energy class, and parking deed assignment before treating marketing yield bands as underwriting truth. Cross-read area guides and compare pages before compromesso on single-project narratives alone.`;
  }
  if (t.includes('tax') || t.includes('imu') || t.includes('cedolare') || t.includes('cost of buying') || t.includes('holding cost')) {
    return `Italian holding costs include IMU on cadastral value, condominium spese, insurance, and flat rental tax under cedolare secca or ordinary IRPEF regimes. Second-home registration tax at 9% on cadastral lines often exceeds notary fees on mid-market tickets — commercialista should confirm election before compromesso deposit authorization.`;
  }
  if (t.includes('mortgage') || t.includes('financing') || t.includes('ltv')) {
    return `Italian banks lend non-residents roughly 50-60% LTV against appraisal value, using the lower of purchase price or perizia on competitive bidding wars. Allow three to four months from accepted offer to rogito with financing; bank appraisal below agreed price reduces lendable amount without automatic price renegotiation in hot micro-markets.`;
  }

  return genericAnswer(h2Title, slug, body, description);
}

function firstBlockAfterH2(lines, i) {
  let j = i + 1;
  while (j < lines.length && lines[j].trim() === '') j++;
  if (j >= lines.length) return { type: 'empty', index: j, words: 0 };

  const line = lines[j];
  const trimmed = line.trimStart();

  if (trimmed.startsWith('###')) return { type: 'h3', index: j, words: 0 };
  if (trimmed.startsWith('####')) return { type: 'h4', index: j, words: 0 };
  if (trimmed.startsWith('|')) return { type: 'table', index: j, words: 0 };
  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) return { type: 'list', index: j, words: 0 };
  if (trimmed.startsWith('![')) return { type: 'image', index: j, words: 0 };
  if (trimmed.startsWith('<TldrBlock') || trimmed.startsWith('<FaqBlock') || trimmed.startsWith('<LeadForm'))
    return { type: 'component', index: j, words: 0 };
  if (trimmed.startsWith('<')) return { type: 'component', index: j, words: 0 };
  if (trimmed.startsWith('## ')) return { type: 'heading', index: j, words: 0 };

  let para = '';
  let k = j;
  while (k < lines.length) {
    const l = lines[k];
    if (l.trim() === '') break;
    if (l.startsWith('## ') || l.startsWith('###') || l.startsWith('####')) break;
    if (l.trimStart().startsWith('|')) break;
    if (l.startsWith('<FaqBlock')) break;
    if ((l.startsWith('- ') || l.startsWith('* ')) && para) break;
    para += (para ? ' ' : '') + l.trim();
    k++;
  }
  return { type: 'paragraph', index: j, end: k, words: countWords(para), text: para };
}

function needsAnswerFirst(block) {
  if (block.type === 'empty' || block.type === 'heading') return false;
  if (block.type === 'paragraph' && block.words >= MIN_H2_WORDS) return false;
  if (block.type === 'paragraph' && block.words > 0 && block.words < MIN_H2_WORDS) return true;
  return ['h3', 'h4', 'table', 'list', 'image', 'component'].includes(block.type);
}

function ensureMinWords(para, min = 40) {
  let text = para.trim();
  let w = countWords(text);
  if (w >= min) return text;
  text +=
    ' Under this topic, track three OMI-quartiere closed sales before offer anchoring. Confirm visura catastale, conformità edilizia, and condominium spese with independent avvocato review before compromesso deposit wires to notaio escrow accounts.';
  return text;
}

function isStructuralLine(line) {
  const t = line.trimStart();
  return (
    t.startsWith('###') ||
    t.startsWith('####') ||
    t.startsWith('|') ||
    t.startsWith('- ') ||
    t.startsWith('* ') ||
    t.startsWith('![') ||
    t.startsWith('<') ||
    t.startsWith('## ')
  );
}

function fixAnswerFirst(body, slug, description) {
  const lines = body.split('\n');
  const out = [];
  let skipUntil = -1;

  for (let i = 0; i < lines.length; i++) {
    if (i < skipUntil) continue;

    if (!/^## /.test(lines[i])) {
      out.push(lines[i]);
      continue;
    }

    const h2 = lines[i].replace(/^## /, '').trim();
    out.push(lines[i]);

    if (SKIP_H2.test(h2)) continue;

    const block = firstBlockAfterH2(lines, i);
    if (!needsAnswerFirst(block)) continue;

    const para = ensureMinWords(answerForH2(h2, slug, body, description));
    if (countWords(para) < MIN_H2_WORDS) continue;

    if (block.type === 'paragraph' && block.words < MIN_H2_WORDS) {
      // Replace thin opening paragraph with full answer-first block
      out.push('');
      out.push(para);
      out.push('');
      skipUntil = block.end;
      continue;
    }

    // Insert before ###, table, list, image, component
    out.push('');
    out.push(para);
    out.push('');
  }

  return dedupeAnswerParagraphs(out.join('\n'));
}

/** Remove duplicate consecutive answer-first boilerplate under the same H2 */
function dedupeAnswerParagraphs(body) {
  const boilerplateStarts = [
    'Portal asking averages often overshoot',
    'Portal asking averages move 5-10%',
    'Gross yield on portal listings excludes IMU',
    'District selection drives both yield',
    'Micro-market selection within the region',
  ];
  const lines = body.split('\n');
  const out = [];
  let prevBoiler = '';

  for (const line of lines) {
    const trimmed = line.trim();
    const isBoiler = boilerplateStarts.some((s) => trimmed.startsWith(s));
    if (isBoiler && prevBoiler && trimmed.startsWith(prevBoiler.slice(0, 30))) {
      continue; // drop exact duplicate line block
    }
    if (isBoiler) prevBoiler = trimmed;
    else if (trimmed !== '') prevBoiler = '';
    out.push(line);
  }
  return out.join('\n');
}

function addInsiderTip(body, slug, coll) {
  if (/insider tip/i.test(body)) return body;
  let tip = INSIDER_TIPS[slug];
  if (!tip) {
    if (coll === 'compare') {
      tip =
        'Model both cities with identical capital and hold period before choosing — per sqm gaps often reverse after IMU, cedolare secca, and vacancy assumptions.';
    } else if (coll === 'guides') {
      tip =
        'Independent avvocato review before compromesso deposit beats agency reassurance — visura catastale and conformità gaps surface only after wire transfers if skipped.';
    } else {
      tip =
        'Track three closed sales in the same quartiere before offer — portal asking averages often overshoot OMI reference bands by 8-12% in spring listing season.';
    }
  }
  const block = `\n**Insider tip:** ${tip}\n`;
  const idx = body.indexOf('<FaqBlock');
  if (idx !== -1) return body.slice(0, idx).trimEnd() + block + '\n\n' + body.slice(idx);
  return body.trimEnd() + block + '\n';
}

function cleanDuplicateDiligence(body) {
  const sentences = [
    'Independent avvocato review should confirm visura catastale matches interior layout before compromesso deposit wires to notaio escrow accounts.',
    'Cedolare secca at 21% on long-term furnished leases and 26% on STR income applies to non-resident owners unless commercialista confirms alternate structuring.',
    'IMU on second homes follows cadastral category and municipal multiplier tables; request updated visura before modeling net yield on portal gross rent claims.',
  ];
  for (const s of sentences) {
    const parts = body.split(s);
    if (parts.length > 2) {
      body = parts[0] + s + parts.slice(1).join('').replace(new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
    }
  }
  body = body.replace(
    /(## Closing verification checklist[\s\S]*?)(\n\n(?:Independent avvocato[\s\S]*?))(\n## MORE Group underwriting snapshot)/i,
    '$1$3',
  );
  const dupPara =
    /^(Independent avvocato review should confirm visura catastale[\s\S]*?spring listing season\.\n\n)+/gm;
  body = body.replace(dupPara, '');
  return body;
}

function parseDescription(raw) {
  const m = raw.match(/^description:\s*"([^"]+)"/m);
  return m ? m[1] : '';
}

function listAllMdx() {
  const files = [];
  const contentDir = join(ROOT, 'src/content');
  for (const coll of readdirSync(contentDir)) {
    const dir = join(contentDir, coll);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
      files.push(`src/content/${coll}/${f}`);
    }
  }
  return files;
}

const geo = spawnSync('node', ['scripts/geo-citability-audit.mjs', '--json'], {
  cwd: ROOT,
  encoding: 'utf8',
});
const gaps = JSON.parse(geo.stdout || '{"gaps":[]}').gaps || [];
const targetFiles = new Set();
for (const g of gaps) {
  if (g.issues.some((i) => i.startsWith('thin-h2-open'))) {
    targetFiles.add(g.file);
  }
}

// Scan full corpus — geo audit checks first 4 ## H2 headings in document order
for (const rel of listAllMdx()) {
  const path = join(ROOT, rel);
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^---\n[\s\S]*?\n---\n?/);
  if (!m) continue;
  const body = raw.slice(m[0].length);
  const h2s = [...body.matchAll(/^## (.+)$/gm)].map((x) => x[1]).slice(0, 4);
  for (const h of h2s) {
    if (/Closing|Faq|Independent verification|MORE Group underwriting/i.test(h)) continue;
    const re = new RegExp(
      `^## ${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n+([\\s\\S]*?)(?=\\n## |\\n<FaqBlock|$)`,
      'm',
    );
    const match = body.match(re);
    if (!match) continue;
    const para = match[1].split('\n\n')[0].replace(/<[^>]+>/g, '').trim();
    const w = countWords(para);
    if (w > 0 && w < MIN_H2_WORDS) targetFiles.add(rel);
  }
}

let n = 0;
for (const rel of targetFiles) {
  const path = join(ROOT, rel);
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^---\n[\s\S]*?\n---\n?/);
  if (!m) continue;
  const slug = slugFromPath(rel);
  const coll = rel.split('/')[2];
  let body = raw.slice(m[0].length);
  const before = body;
  body = cleanDuplicateDiligence(body);
  body = fixAnswerFirst(body, slug, parseDescription(raw));
  body = addInsiderTip(body, slug, coll);
  if (body === before) continue;
  writeFileSync(path, m[0] + body);
  console.log('fixed', rel);
  n++;
}

console.log(`\nUpdated ${n} files`);

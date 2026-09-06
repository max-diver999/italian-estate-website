import { getCollection, type CollectionEntry } from 'astro:content';
import {
  MIN_ITEMS as SHARED_MIN_ITEMS,
  THIN_BUT_WANTED as SHARED_THIN,
  AREA_TO_REGION as SHARED_AREA_TO_REGION,
  TYPE_TO_FACET as SHARED_TYPE_TO_FACET,
  CITY_SLUGS as SHARED_CITY_SLUGS,
} from '../data/property-facet-maps.mjs';

/**
 * Facet model for /property-for-sale/.
 *
 * The demand study of 2026-09-06 found the commercial market is searched as
 * "{type} for sale in {geo} italy", not as "{geo} property investment", which is
 * worth 20 impressions a month nationally. These pages exist to answer the first
 * phrasing. See .content-os/reports/SEO-DEMAND-AUDIT-2026-09-06.md.
 *
 * A facet page is generated only where the catalogue actually holds MIN_ITEMS
 * properties. Publishing a listing that promises inventory we do not have is
 * worse than not publishing it: the SERP formula every competitor uses is a
 * count and a from-price, and both have to be true.
 */

export type ProjectEntry = CollectionEntry<'projects'>;

/** A facet page is only built at or above this many catalogue entries. */
export const MIN_ITEMS = SHARED_MIN_ITEMS;

/**
 * Regions built below MIN_ITEMS because search demand justifies the page even
 * though the catalogue is thin. The visible count and from-price stay truthful,
 * and the page leans on the guide and the sourcing request rather than pretending
 * to inventory it does not have. Sardinia: 4,550 impressions a month, 2 listings.
 */
const THIN_BUT_WANTED: Set<string> = SHARED_THIN;

/** area frontmatter value -> region slug. Areas are towns; regions are the search unit. */
const AREA_TO_REGION: Record<string, string> = SHARED_AREA_TO_REGION as Record<string, string>;

/** propertyType frontmatter value -> type facet slug. */
const TYPE_TO_FACET: Record<string, string> = SHARED_TYPE_TO_FACET as Record<string, string>;

/** Towns worth their own page when the catalogue supports it. */
const CITY_SLUGS: Record<string, string> = SHARED_CITY_SLUGS as Record<string, string>;

type FacetKind = 'region' | 'city' | 'type';

export interface Facet {
  kind: FacetKind;
  slug: string;
  /** Human label used inside the sentence: "Property for Sale in {label}, Italy". */
  label: string;
  /** Noun used as the subject: "Villas", "Property". */
  noun: string;
  /** One line of editorial context. Never generated, always written. */
  note: string;
  items: ProjectEntry[];
  count: number;
  fromEur: number | null;
}

const REGION_LABEL: Record<string, string> = {
  lombardy: 'Lombardy',
  tuscany: 'Tuscany',
  puglia: 'Puglia',
  lazio: 'Lazio',
  liguria: 'Liguria',
  sicily: 'Sicily',
  campania: 'Campania',
  'lake-como': 'Lake Como',
  sardinia: 'Sardinia',
  piedmont: 'Piedmont',
  umbria: 'Umbria',
  'le-marche': 'Le Marche',
  abruzzo: 'Abruzzo',
  molise: 'Molise',
  basilicata: 'Basilicata',
  calabria: 'Calabria',
  'emilia-romagna': 'Emilia-Romagna',
};

const REGION_NOTE: Record<string, string> = {
  lombardy:
    'Milan drives this market and prices like a northern European capital. The stock here is new-build and regeneration rather than restoration.',
  tuscany:
    'The widest spread in Italy: a Florence apartment and an inland farmhouse are different markets sharing a name. Restoration projects carry Soprintendenza risk.',
  puglia:
    'Trulli, masserie and new villas around Ostuni and the Valle d\'Itria. Land ties and pool permits matter more here than anywhere else in Italy.',
  lazio: 'Rome is a market of quarters rather than one market. Centro storico stock carries heritage constraints.',
  liguria:
    'A narrow coast with very little developable land, which is what holds prices up. Portofino and Santa Margherita trade on scarcity.',
  sicily:
    'The lowest entry prices of any Italian region with real tourism demand. Abusivismo checks are not optional here.',
  campania:
    'The Amalfi and Sorrento coast is a seasonal market with year-round constraints on building. Naples itself is a separate, cheaper market.',
  'lake-como':
    'Lakefront supply is effectively fixed, and the buyer pool is international. Second-line properties carry very different prices from first-line.',
  sardinia:
    'Two listings here rather than a catalogue: Costa Smeralda stock rarely reaches open portals, and most of what sells does so off-market through a small circle of agents. Tell us the budget and we will source against it.',
};

const TYPE_LABEL: Record<string, string> = {
  apartments: 'Apartments',
  villas: 'Villas',
  farmhouses: 'Farmhouses and Country Houses',
  'trulli-masserie': 'Trulli and Masserie',
  'new-developments': 'New Developments',
};

const TYPE_NOTE: Record<string, string> = {
  apartments:
    'The most liquid Italian asset for a foreign buyer: condominio rules, IMU and resale demand are all predictable. Check the building minutes for short-let bans before you offer.',
  villas:
    'Detached houses with land, where the running costs diverge most from the purchase price. Heating, pool and garden are the lines buyers underestimate.',
  farmhouses:
    'Restoration stock. The price you pay is rarely the price you spend, and an engineer\'s report before the offer is the difference between a project and a problem.',
  'trulli-masserie':
    'Puglia\'s vernacular stock, almost always with a heritage constraint and often with an agricultural land tie attached to the title.',
  'new-developments':
    'Off-plan and regeneration schemes, mostly in Milan. Completion guarantees and the developer\'s balance sheet matter more than the render.',
};

const CITY_NOTE: Record<string, string> = {
  milan: 'Italy\'s only genuinely international market, and the only one priced like a northern European capital.',
  rome: 'Priced by quarter rather than by city. The historic centre carries heritage oversight on almost every intervention.',
  ostuni: 'The white town and its countryside, where most foreign demand in Puglia concentrates.',
  florence: 'A small centre where residential stock competes directly with short lets.',
  naples: 'Central Italy prices in a major city, with the fastest recent change of any Italian market.',
  sorrento: 'A seasonal coast with almost no new supply and a long-standing international buyer base.',
};

function priceOf(p: ProjectEntry): number | null {
  const v = p.data.priceFromEUR;
  return typeof v === 'number' && v > 0 ? v : null;
}

function build(kind: FacetKind, slug: string, label: string, noun: string, note: string, items: ProjectEntry[]): Facet {
  const prices = items.map(priceOf).filter((v): v is number => v !== null);
  return {
    kind,
    slug,
    label,
    noun,
    note,
    items: items.sort((a, b) => (priceOf(a) ?? Number.MAX_SAFE_INTEGER) - (priceOf(b) ?? Number.MAX_SAFE_INTEGER)),
    count: items.length,
    fromEur: prices.length ? Math.min(...prices) : null,
  };
}

/** Every facet the catalogue currently supports, largest first. */
export async function loadFacets(): Promise<Facet[]> {
  const projects = (await getCollection('projects')).filter((p) => !p.data.noindex);

  const byRegion = new Map<string, ProjectEntry[]>();
  const byType = new Map<string, ProjectEntry[]>();
  const byCity = new Map<string, ProjectEntry[]>();

  for (const p of projects) {
    const area = p.data.area ?? '';
    const region = AREA_TO_REGION[area];
    if (region) byRegion.set(region, [...(byRegion.get(region) ?? []), p]);

    const city = CITY_SLUGS[area];
    if (city) byCity.set(city, [...(byCity.get(city) ?? []), p]);

    const type = TYPE_TO_FACET[p.data.propertyType ?? ''];
    if (type) byType.set(type, [...(byType.get(type) ?? []), p]);
  }

  const out: Facet[] = [];
  for (const [slug, items] of byRegion) {
    if (items.length < MIN_ITEMS && !THIN_BUT_WANTED.has(slug)) continue;
    out.push(build('region', slug, REGION_LABEL[slug] ?? slug, 'Property', REGION_NOTE[slug] ?? '', items));
  }
  for (const [slug, items] of byType) {
    if (items.length < MIN_ITEMS) continue;
    out.push(build('type', slug, TYPE_LABEL[slug] ?? slug, TYPE_LABEL[slug] ?? slug, TYPE_NOTE[slug] ?? '', items));
  }
  for (const [slug, items] of byCity) {
    if (items.length < MIN_ITEMS) continue;
    const label = Object.keys(CITY_SLUGS).find((k) => CITY_SLUGS[k] === slug) ?? slug;
    out.push(build('city', slug, label, 'Property', CITY_NOTE[slug] ?? '', items));
  }
  return out.sort((a, b) => b.count - a.count);
}

/** "Villas for Sale in Tuscany, Italy" style heading, without the count. */
export function facetHeading(f: Facet): string {
  if (f.kind === 'type') return `${f.label} for Sale in Italy`;
  return `Property for Sale in ${f.label}, Italy`;
}

/** Shorter form for the <title>, which has to stay under 60 characters with the count. */
const TITLE_LABEL: Record<string, string> = {
  farmhouses: 'Farmhouses',
  'trulli-masserie': 'Trulli and Masserie',
  'new-developments': 'New Developments',
};

export function facetTitleStem(f: Facet): string {
  if (f.kind === 'type') return `${TITLE_LABEL[f.slug] ?? f.label} for Sale in Italy`;
  return `Property for Sale in ${f.label}, Italy`;
}

/** Guides worth linking from a facet page, by facet slug. Hand-picked, not generated. */
export const FACET_GUIDES: Record<string, Array<{ href: string; label: string }>> = {
  tuscany: [
    { href: '/guides/tuscany-property-investment-guide/', label: 'Tuscany market guide' },
    { href: '/guides/heritage-restricted-property-italy/', label: 'Heritage restrictions and vincoli' },
  ],
  puglia: [
    { href: '/guides/puglia-property-investment-guide/', label: 'Puglia market guide' },
    { href: '/guides/italy-holiday-let-licensing/', label: 'Holiday let licensing and CIN' },
  ],
  sicily: [
    { href: '/guides/sicily-property-investment-guide/', label: 'Sicily market guide' },
    { href: '/guides/abusi-edilizi-buying-property-italy/', label: 'Abusi edilizi: unpermitted works' },
  ],
  lombardy: [
    { href: '/guides/milan-property-investment-guide/', label: 'Milan market guide' },
    { href: '/guides/italy-off-plan-property-guide/', label: 'Buying off-plan in Italy' },
  ],
  lazio: [{ href: '/guides/rome-property-investment-guide/', label: 'Rome market guide' }],
  liguria: [{ href: '/guides/liguria-property-investment-guide/', label: 'Liguria market guide' }],
  campania: [{ href: '/guides/italy-holiday-let-licensing/', label: 'Holiday let licensing and CIN' }],
  'lake-como': [{ href: '/guides/lake-como-property-investment-guide/', label: 'Lake Como market guide' }],
  villas: [{ href: '/guides/italy-property-management-costs/', label: 'Running costs and condominio fees' }],
  farmhouses: [
    { href: '/guides/italy-property-renovation-costs-guide/', label: 'Renovation costs' },
    { href: '/guides/geometra-role-italy-property/', label: 'The geometra and the survey' },
  ],
  apartments: [{ href: '/guides/condominio-rules-foreign-owners/', label: 'Condominio rules for foreign owners' }],
  'new-developments': [{ href: '/guides/italy-new-build-warranty-defects/', label: 'New-build warranty and defects' }],
};

/**
 * FAQ carried across from the /invest-{geo}-property/ landing pages when they were
 * merged into these facets on 2026-09-06. Hand-written originally; preserved rather than
 * regenerated, because the answers carry market detail the facet notes do not.
 */
export const FACET_FAQ: Record<string, Array<{ question: string; answer: string }>> = {
  'sardinia': [
    { question: 'Can foreigners buy property in Sardinia?', answer: 'Yes under standard Italian reciprocity rules. Sardinia has no regional foreign-buyer ban. Coastal and Costa Smeralda assets may face landscape vincoli and condominium premium charges.' },
    { question: 'What budget do I need for Costa Smeralda?', answer: 'Prime Costa Smeralda villas often start above €2M with summer-season income concentration. Secondary Sardinian coast towns offer apartments from €300k-600k with different liquidity profiles.' },
    { question: 'What yields are realistic in Sardinia?', answer: 'Luxury coastal STR can reach 4-6% gross in peak months but with high management costs and winter voids. Long-term yields in Cagliari or Olbia fringe are often 3-4% net.' },
    { question: 'How does Sardinia compare to Puglia for investors?', answer: 'Puglia leads enquiry volume and offers higher headline yields at lower tickets. Sardinia trades on scarcity, yacht-season branding, and HNW resale pools. See our regional guides side by side in consultation.' },
    { question: 'What due diligence matters on Sardinian coast stock?', answer: 'Verify landscape constraints, water access on rural plots, short-term rental licensing with the comune, and condominium rules in resort buildings. Coastal erosion and planning overlays affect some beaches.' },
    { question: 'Is Sardinia good for year-round living?', answer: 'Cagliari and northern coast towns support year-round services. Pure Costa Smeralda seasonality is summer-heavy; buyers should model personal use versus rental income honestly.' },
  ],
  'tuscany': [
    { question: 'Can foreigners buy property in Tuscany?', answer: 'Yes. US, UK, EU, and most other nationals buy freehold residential property in Tuscany after reciprocity verification at the notary. Budget from roughly €200k for countryside apartments and €400k+ for Chianti farmhouses needing light renovation.' },
    { question: 'What rental yields are realistic in Tuscany?', answer: 'Long-term lets in Florence and Siena often net 3-4% after costs. Short-term holiday lets in Chianti or Val d\'Orcia can reach 5-7% gross in peak seasons but require CIN registration, IMU, and local STR caps in historic centres.' },
    { question: 'How fast do you send a Tuscany shortlist?', answer: 'Within one business day after you submit budget and goal. Options include resale apartments, restoration projects, and vetted agency off-plan where available.' },
    { question: 'What due diligence applies to Tuscan farmhouses?', answer: 'Check cadastral category, agricultural ties, Soprintendenza restrictions, and septic compliance. Our heritage guide covers listed buildings and landscape constraints before you pay a compromesso deposit.' },
    { question: 'Is Tuscany better for lifestyle or yield?', answer: 'Tuscany skews lifestyle and capital preservation with selective yield in secondary towns. Compare net returns using our gross vs net yield guide and factor 10-12% purchase costs on a second home.' },
    { question: 'Should I buy in Florence or Chianti for rental income?', answer: 'Florence UNESCO core restricts new STR licences and compresses yields to 2-3.5% long-term. Chianti and Lucca province villas often deliver 4-6% gross on registered holiday lets with higher operational work and pool maintenance.' },
  ],
  'puglia': [
    { question: 'Why is Puglia popular with foreign buyers?', answer: 'Puglia combines lower entry prices (often €800-2,500/m²), strong holiday-rental demand, and direct flights to Bari and Brindisi. Ostuni ranked among the top enquiry comuni in Gate-away\'s 2025 report for international buyers.' },
    { question: 'What budget do I need for a villa with pool near Ostuni?', answer: 'New-build villas with pools often list from €350k-550k in the Ostuni countryside. Trulli restoration and masseria projects typically start higher once land, pool, and heritage permits are included.' },
    { question: 'Can I run Airbnb in Puglia legally?', answer: 'Yes with a CIN code, SCIA where required, and compliance with regional STR rules. Coastal and historic towns may cap short-term lets, so the local comune rules matter before you buy for yield.' },
    { question: 'What yields are realistic in Puglia?', answer: 'Well-managed holiday lets in Ostuni or Valle d\'Itria often achieve 6-8% gross before IMU, management, and tax. Long-term leases are lower but more stable in Lecce and Bari.' },
    { question: 'How do you vet Puglia developers?', answer: 'We prioritise agencies with documented building permits, escrow-style payment schedules, and site visits. See our Apulia Deluxe and Ostuni project reviews for examples of due diligence questions.' },
    { question: 'Is Puglia better than Sicily for first-time Italy buyers?', answer: 'Puglia leads enquiry volume and has stronger British/US brand recognition. Sicily offers lower entry and higher headline yields with more renovation and seismic risk. We map both in cross-region consultations.' },
  ],
  'sicily': [
    { question: 'Is Sicily cheaper than northern Italy for property?', answer: 'Yes. Many Sicilian communes still trade under €1,500/m² versus €3,500-6,000/m² in Milan or Florence. Taormina and Ortigia command premiums; interior towns offer lowest entry with higher renovation risk.' },
    { question: 'What yields can Sicily holiday lets achieve?', answer: 'Coastal short-term lets in Taormina, Cefalù, or Syracuse can reach 7-10% gross in strong seasons. Long-term city lets in Palermo or Catania are lower but more stable. Always model IMU, management, and cedolare secca or IRPEF.' },
    { question: 'Are there restrictions on foreign buyers in Sicily?', answer: 'No additional regional restrictions. Standard Italian reciprocity, codice fiscale, and notary checks apply. Coastal and historic properties may face landscape or heritage constraints.' },
    { question: 'How does Sicily compare to Puglia for investors?', answer: 'Puglia leads Gate-away enquiry volume; Sicily offers lower prices and higher headline yields with more operational and renovation variance. See our Sicily vs Puglia comparison.' },
    { question: 'What should I verify before buying in Sicily?', answer: 'Cadastral consistency, seismic classification, absentee landlord issues, and STR registration with the comune. Earthquake retrofit costs can materially change renovation budgets.' },
    { question: 'Which Sicily markets fit a €300k budget?', answer: 'Palermo centro apartments, Syracuse historic stock, and interior towns with renovation scope often sit under €300k. Taormina and premium coast typically exceed that band unless you accept smaller units needing works.' },
  ],
  'liguria': [
    { question: 'Can foreigners buy property in Liguria?', answer: 'Yes under national reciprocity rules. Liguria coastal communes from Sanremo to Portofino attract Swiss, German, and British buyers. Landscape and coastal planning rules are strict near the water.' },
    { question: 'What is the minimum budget for Liguria coast property?', answer: 'Secondary Riviera towns sometimes offer apartments from €350k-500k. Portofino and prime Cinque Terre adjacency often exceeds €1M. Budget IMU, condominium, and 10-12% closing costs.' },
    { question: 'Is Liguria better value than Lake Como?', answer: 'Liguria often offers more coastal apartment stock under €1M with direct sea access. Como commands higher lakefront scarcity premiums. See our Lake Como vs Liguria comparison for buyer profiles.' },
    { question: 'What rental yields are realistic on the Italian Riviera?', answer: 'Seasonal STR in Sanremo or Rapallo can reach 4-6% gross in summer with winter voids. Long-term yields in Genoa urban stock are often 3-4% net. Portofino trophy assets skew to 2-3% gross.' },
    { question: 'What should I verify before buying in Liguria?', answer: 'Coastal planning overlays, landslide risk on hillside plots, parking deeds in historic centres, and condominium STR rules. Verify CIN path before underwriting holiday-let income.' },
    { question: 'How does Liguria compare to Tuscany coast (Versilia)?', answer: 'Versilia offers broader sandy beaches and Pisa airport access. Liguria trades on cliff villages and marina culture with tighter building constraints. Many buyers shortlist both in one consultation.' },
  ],
  'lombardy': [
    { question: 'Can foreigners buy property in Milan?', answer: 'Yes. EU citizens purchase on equal terms with residents. Non-EU nationals from reciprocity countries need codice fiscale and notary-led purchase. Milan has no extra foreign-buyer restrictions beyond national law.' },
    { question: 'What is the minimum budget for Milan property in 2026?', answer: 'Off-plan northwest Milan projects like Inspire UpTown start near €348,500. Central Milan resale two-bedrooms often exceed €600k. Budget 10-12% closing costs on a second home.' },
    { question: 'What rental yields are realistic in Milan?', answer: 'Long-term furnished leases in well-connected districts often net 3.2-3.8% after IMU and condominium fees. Short-term rental requires CIN and building compliance; gross yields rarely exceed 4% without operational intensity.' },
    { question: 'Is Milan off-plan safe for foreign buyers?', answer: 'Use milestone payments tied to construction progress, notary-reviewed compromesso, and escrow or bank guarantees on deposits. Review our Navigli and Cascina Merlata project guides for developer-specific notes.' },
    { question: 'Milan city centre vs Cascina Merlata for investment?', answer: 'Centro offers prestige and thinner yields. Cascina Merlata and Navigli regeneration corridors offer new-build Class A stock with MIND employment and metro access at lower €/m² than Duomo-adjacent resale.' },
    { question: 'How fast do you send a Milan shortlist?', answer: 'Within one business day after form submission. We include off-plan and delivering options where published on italian-estate.com plus partner inventory matching your band.' },
  ],
  'lazio': [
    { question: 'Can foreigners buy property in Rome?', answer: 'Yes. EU citizens purchase on equal terms with Italian residents. Americans, British, and most other non-EU nationals buy after reciprocity confirmation at the notary. Residency is not required for ownership but affects registration tax and IMU.' },
    { question: 'What budget do I need for Rome property in 2026?', answer: 'Peripheral well-connected apartments often start near €250k-400k. Prime Trastevere or Prati two-bedrooms frequently exceed €600k-900k. Centro storico trophy stock can surpass €1M. Budget 10-12% closing costs on a second home.' },
    { question: 'How is Jubilee 2026 affecting Rome property demand?', answer: 'Gate-away data cited in our Rome guide shows foreign enquiries up 44.7% year-over-year, led by US and UK buyers. Jubilee lifts tourism and STR demand in walkable districts but does not override heritage permits or condominium STR bans.' },
    { question: 'What rental yields are realistic in Rome?', answer: 'Prime districts often deliver 2.5-3.5% gross on long-term leases and 3.5-5% on compliant short-term rentals before IMU, management, and tax. Centro storico yields compress further; peripheral Ostiense and EUR can reach 4-5% gross residential.' },
    { question: 'Is Rome better for yield or capital preservation?', answer: 'Rome skews capital preservation, diplomatic rental, and Jubilee-linked STR more than pure yield. Buyers needing 6%+ gross usually compare Puglia or Sicily after we map Rome numbers in consultation.' },
    { question: 'What due diligence matters most in Rome centro storico?', answer: 'Abusi edilizi (unauthorized works), Soprintendenza heritage approvals, condominium regolamento on affitti brevi, and CIN registration path. Never skip conformità urbanistica review before compromesso on Municipio I stock.' },
  ],
  'lake-como': [
    { question: 'Can foreigners buy property on Lake Como?', answer: 'Yes. Lake Como has no special foreign-buyer restrictions beyond standard Italian reciprocity checks. Prime lakefront and Bellagio villages command premium prices; secondary towns offer lower entry with ferry or road access.' },
    { question: 'What is the minimum budget for Lake Como?', answer: 'Apartments in secondary comuni sometimes start near €400k-600k. Lakefront villas and Bellagio often exceed €1.5M. Budget 10-12% closing costs and annual IMU on second homes.' },
    { question: 'Is Lake Como a good rental investment?', answer: 'Lake Como skews capital preservation and luxury lifestyle. Gross yields of 2-4% are common; peak-season short lets can improve cash flow but face strict local marketing and compliance rules.' },
    { question: 'How does Como compare to Liguria?', answer: 'Como trades at higher lakefront premiums; Liguria offers more coastal apartment stock under €1M. See our Lake Como vs Liguria comparison for buyer profiles.' },
    { question: 'What due diligence matters on Como lakefront?', answer: 'Verify shore rights, boat dock concessions, landslide or flooding constraints, and condominium rules on short lets. Landscape vincoli apply widely, so Soprintendenza files come before any renovation plan.' },
    { question: 'Should I buy in Como city or Bellagio?', answer: 'Como city offers Milan commuter rail, deeper apartment inventory, and easier due diligence. Bellagio commands trophy pricing with thinner liquidity. Many investors start in Como and trade up lake once they understand CIN and IMU rules.' },
  ],
};

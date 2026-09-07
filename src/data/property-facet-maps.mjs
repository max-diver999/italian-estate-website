/**
 * Pure facet mappings for /property-for-sale/.
 *
 * Kept as plain ESM with no Astro imports so that both the Astro page
 * (src/lib/propertyFacets.ts) and the node-side link checker
 * (scripts/check-links.mjs) read the same source of truth. Duplicating these
 * maps is how a route inventory drifts out of sync with the routes that
 * actually build.
 */

/** A facet page is only built at or above this many catalogue entries. */
export const MIN_ITEMS = 3;

/**
 * Regions built below MIN_ITEMS because search demand justifies the page even
 * though the catalogue is thin. The visible count and from-price stay truthful.
 */
export const THIN_BUT_WANTED = new Set(['sardinia']);

/** area frontmatter value -> region slug. Areas are towns; regions are the search unit. */
export const AREA_TO_REGION = {
  Milan: 'lombardy',
  Como: 'lake-como',
  Bellagio: 'lake-como',
  Rome: 'lazio',
  Florence: 'tuscany',
  Siena: 'tuscany',
  Lucca: 'tuscany',
  Arezzo: 'tuscany',
  Chianti: 'tuscany',
  "Val d'Orcia": 'tuscany',
  Tuscany: 'tuscany',
  'Monte Argentario': 'tuscany',
  Ostuni: 'puglia',
  Lecce: 'puglia',
  Carovigno: 'puglia',
  "Valle d'Itria": 'puglia',
  Bari: 'puglia',
  Naples: 'campania',
  Sorrento: 'campania',
  Ravello: 'campania',
  Palermo: 'sicily',
  Noto: 'sicily',
  Taormina: 'sicily',
  'Costa Smeralda': 'sardinia',
  Genoa: 'liguria',
  Portofino: 'liguria',
  'Santa Margherita Ligure': 'liguria',
  Sanremo: 'liguria',
  Turin: 'piedmont',
  Langhe: 'piedmont',
  Bologna: 'emilia-romagna',
  Perugia: 'umbria',
  Assisi: 'umbria',
  Ancona: 'le-marche',
  Urbino: 'le-marche',
  Matera: 'basilicata',
  Potenza: 'basilicata',
  Campobasso: 'molise',
  Termoli: 'molise',
  Chieti: 'abruzzo',
  Pescara: 'abruzzo',
  Scalea: 'calabria',
};

/** propertyType frontmatter value -> type facet slug. */
export const TYPE_TO_FACET = {
  apartment: 'apartments',
  villa: 'villas',
  farmhouse: 'farmhouses',
  masseria: 'farmhouses',
  'stone house': 'farmhouses',
  'village house': 'farmhouses',
  trulli: 'trulli-masserie',
  'mixed-use district': 'new-developments',
  'mixed-use': 'new-developments',
  'student housing': 'new-developments',
};

/** Towns worth their own page when the catalogue supports it. */
export const CITY_SLUGS = {
  Milan: 'milan',
  Rome: 'rome',
  Ostuni: 'ostuni',
  Florence: 'florence',
  Naples: 'naples',
  Sorrento: 'sorrento',
};

/**
 * Facet slugs the catalogue currently supports, given a list of
 * `{ area, propertyType }` records read from project frontmatter.
 * Used by the link checker to know which /property-for-sale/* routes exist.
 */
export function facetSlugsFrom(projects) {
  const tally = (map, key) => {
    const m = new Map();
    for (const p of projects) {
      const v = map[p[key] ?? ''];
      if (v) m.set(v, (m.get(v) ?? 0) + 1);
    }
    return m;
  };
  const out = new Set();
  for (const [slug, n] of tally(AREA_TO_REGION, 'area')) {
    if (n >= MIN_ITEMS || THIN_BUT_WANTED.has(slug)) out.add(slug);
  }
  for (const [slug, n] of tally(TYPE_TO_FACET, 'propertyType')) if (n >= MIN_ITEMS) out.add(slug);
  for (const [slug, n] of tally(CITY_SLUGS, 'area')) if (n >= MIN_ITEMS) out.add(slug);
  return out;
}

/**
 * Intent routing for Italian Estate sticky mobile CTAs.
 */

/**
 * @param {{ collection: string, slug: string, title?: string }} ctx
 * @returns {{ variant: string }}
 */
export function resolveCtaRoute({ collection, slug, title = '' }) {
  const s = `${slug} ${title}`.toLowerCase();

  if (/investor-visa|elective-residence|digital-nomad|residenza|visa-property|non-lucrative|golden-visa/.test(s)) {
    return route('visa');
  }

  if (/mortgage|finance|loan|codice-fiscale|capital-gains|imu|inheritance-tax|notary-fees|cost-of-buying|uk-tax|cadastral/.test(s)) {
    return route('finance');
  }

  if (/reciprocity|foreigners-buy|due-diligence|compromesso|title-deed|cadastre|heritage-restricted/.test(s)) {
    return route('legal');
  }

  if (/rental-yield|holiday-let|short-term|airbnb|yield|rental-income|cim-registration|holiday-home/.test(s)) {
    return route('yield');
  }

  if (collection === 'compare' || /\bvs-|-vs-|comparison|compare-/.test(slug)) {
    return route('compare');
  }

  if (collection === 'areas' || /best-areas|where-to-buy/.test(s)) {
    if (/tuscany|chianti|florence|siena|val-d-orcia|montalcino/.test(s)) return route('tuscany');
    if (/milan|lombardy|como|lake-como|bergamo|brianza/.test(s)) return route('milan');
    if (/puglia|ostuni|lecce|alberobello|salento|polignano/.test(s)) return route('puglia');
    if (/rome|lazio|umbria|frascati/.test(s)) return route('rome');
    if (/sardinia|costa-smeralda|olbia|alghero/.test(s)) return route('sardinia');
    if (/sicily|sicilia|taormina|noto|palermo|cefalu/.test(s)) return route('sicily');
    if (/liguria|cinque-terre|portofino|santa-margherita/.test(s)) return route('liguria');
    return route('area');
  }

  if (collection === 'projects' || collection === 'developers') {
    return route('project');
  }

  if (/tuscany|chianti|florence/.test(s)) return route('tuscany');
  if (/milan|lombardy|como/.test(s)) return route('milan');
  if (/puglia|ostuni|lecce/.test(s)) return route('puglia');
  if (/rome|lazio/.test(s)) return route('rome');
  if (/sardinia/.test(s)) return route('sardinia');
  if (/sicily|sicilia/.test(s)) return route('sicily');
  if (/liguria|cinque-terre/.test(s)) return route('liguria');

  return route('generic');
}

/** @returns {{ variant: string }} */
function route(variant) {
  return { variant };
}

/**
 * @param {string} slug
 * @param {string} prefix
 */
export function makeCtaId(prefix, slug) {
  const tail = slug.replace(/[^a-z0-9]+/g, '-').slice(0, 24);
  return `${prefix}_cta_${tail}`;
}

const STICKY_COPY = {
  visa: {
    title: 'Italy investor visa shortlist',
    subtitle: '€250k+ qualifying options',
    buttonText: 'Visa options',
  },
  finance: {
    title: 'Italy finance checklist',
    subtitle: 'Mortgage + tax matched',
    buttonText: 'Get shortlist',
  },
  legal: {
    title: 'Buy legally in Italy',
    subtitle: 'Reciprocity + due diligence',
    buttonText: 'Free shortlist',
  },
  yield: {
    title: 'Italy rental yield shortlist',
    subtitle: 'Net yield, not brochure gross',
    buttonText: 'Yield options',
  },
  compare: {
    title: 'Compare Italy regions',
    subtitle: 'One brief, matched options',
    buttonText: 'Book consult',
  },
  tuscany: {
    title: 'Tuscany property shortlist',
    subtitle: 'Chianti · Florence · Siena',
    buttonText: 'Tuscany options',
  },
  milan: {
    title: 'Milan & Como shortlist',
    subtitle: 'Off-plan + resale matched',
    buttonText: 'Milan options',
  },
  puglia: {
    title: 'Puglia property shortlist',
    subtitle: 'Ostuni · Lecce · pool villas',
    buttonText: 'Puglia options',
  },
  rome: {
    title: 'Rome property shortlist',
    subtitle: 'Historic + commuter zones',
    buttonText: 'Rome options',
  },
  sardinia: {
    title: 'Sardinia property shortlist',
    subtitle: 'Coastal + inland matched',
    buttonText: 'Sardinia options',
  },
  sicily: {
    title: 'Sicily property shortlist',
    subtitle: 'Taormina · Noto · Palermo',
    buttonText: 'Sicily options',
  },
  liguria: {
    title: 'Liguria property shortlist',
    subtitle: 'Coastal yield zones',
    buttonText: 'Liguria options',
  },
  area: {
    title: 'Italy area shortlist',
    subtitle: 'Matched to your region',
    buttonText: 'Get shortlist',
  },
  project: {
    title: 'Italy project shortlist',
    subtitle: 'Vetted developer options',
    buttonText: 'Project enquiry',
  },
  generic: {
    title: 'Italy property shortlist',
    subtitle: 'Free · one business day',
    buttonText: 'Get shortlist',
  },
};

/**
 * @param {{ collection: string, slug: string, title?: string }} ctx
 */
export function resolveStickyCta(ctx) {
  const { variant } = resolveCtaRoute(ctx);
  const copy = STICKY_COPY[variant] || STICKY_COPY.generic;
  return {
    title: copy.title,
    subtitle: copy.subtitle,
    buttonText: copy.buttonText,
    buttonHref: '#lead-form',
    ctaId: makeCtaId(`sticky_${variant}`, ctx.slug || 'page'),
  };
}

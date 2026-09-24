/** Editorial picks for homepage featured grids (order preserved). */
export const FEATURED_PROJECT_SLUGS = [
  'ostuni-trulli-modern-villa-apuliadeluxe',
  'ostuni-new-villa-pool-470k',
  'prandina-navigli-milan',
  'inspire-uptown-milan',
  'feel-uptown-milan',
  'maciachini-urban-retreat',
] as const;

/** Hero spotlight — links to full project review from homepage banner. */
export const HOMEPAGE_HERO_PROJECT_SLUG = 'ostuni-trulli-modern-villa-apuliadeluxe' as const;

/** «Start here» на главной и в хабе гайдов. До 24.09.2026 список был пуст с первого дня сайта,
 *  и блок на главной печатал заглушку вместо карточек. */
export const FEATURED_GUIDE_SLUGS = [
  'buy-property-italy-foreigner',
  'how-to-buy-italy-property-step-by-step',
  'cost-of-buying-property-italy',
  'italy-golden-visa',
] as const;

/** «Investment areas» на главной: по одному рынку из четырёх, названных в первом экране. */
export const FEATURED_AREA_SLUGS = [
  'chianti',
  'milan-navigli',
  'polignano-a-mare',
  'como',
] as const;

/** Homepage hero fallback until project MDX ship. */
export const HOMEPAGE_HERO_IMAGE =
  'https://media.oper-stack.com/more-group/italy/projects/ostuni-trulli-modern-villa-apuliadeluxe/hero.webp';

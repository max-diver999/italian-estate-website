const TRANSFORM_TOKEN_RE = /^(w_|h_|c_|f_|q_|g_|e_|b_|dpr_|fl_|a_)/;

export type CloudinaryRole = 'hero' | 'inline' | 'thumb';

/*
 * g_auto говорит Cloudinary, какую часть кадра оставить ПРИ ОБРЕЗКЕ. Без режима обрезки он
 * бессмыслен, и Cloudinary отвечает 400, а не игнорирует его.
 *
 * Он стоял во всех наборах, включая те, где обрезки нет. Из-за этого не грузилась ни одна главная
 * картинка статьи и ни одна картинка внутри текста: пустое место наверху страницы. Живы были только
 * карточки, потому что там единственный вариант с c_fill, и поэтому беда выглядела точечной.
 * Та же поломка найдена 16.09.2026 на invest-spain-property.com и оттуда проверена здесь.
 */
const ECO = 'q_auto:eco,f_auto';
/** Только там, где есть c_fill: тогда g_auto действительно выбирает, что оставить в кадре. */
const ECO_CROP = 'q_auto:eco,g_auto,f_auto';

const ROLE_WIDTHS: Record<CloudinaryRole, string[]> = {
  hero: [`w_360,${ECO}`, `w_640,${ECO}`, `w_960,${ECO}`, `w_1200,${ECO}`],
  inline: [`w_640,${ECO}`, `w_960,${ECO}`],
  thumb: [`w_320,${ECO}`, `w_400,${ECO}`, `w_640,h_360,c_fill,${ECO_CROP}`],
};

const ROLE_SIZES: Record<CloudinaryRole, string> = {
  hero: '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px',
  inline: '(max-width: 768px) 100vw, 960px',
  thumb: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px',
};

export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com/') && url.includes('/image/upload/');
}

export function extractPublicId(url: string): string | null {
  const m = url.match(/\/image\/upload\/(.+)$/);
  if (!m) return null;
  let rest = m[1].split('?')[0];
  const parts = rest.split('/');
  while (parts.length > 1) {
    const head = parts[0];
    if (/^v\d+$/.test(head)) {
      parts.shift();
      continue;
    }
    if (head.includes(',') || TRANSFORM_TOKEN_RE.test(head)) {
      parts.shift();
      continue;
    }
    break;
  }
  return parts.join('/').replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
}

export function cloudinaryDeliveryUrl(url: string, transform: string): string {
  if (!isCloudinaryUrl(url)) return url;
  const cloud = url.match(/res\.cloudinary\.com\/([a-z0-9]+)\//)?.[1];
  const publicId = extractPublicId(url);
  if (!cloud || !publicId) return url;
  return `https://res.cloudinary.com/${cloud}/image/upload/${transform}/${publicId}`;
}

export function responsiveCloudinary(
  url: string,
  role: CloudinaryRole = 'inline',
): { src: string; srcset?: string; sizes?: string } {
  if (!isCloudinaryUrl(url)) {
    return { src: url };
  }

  const transforms = ROLE_WIDTHS[role];
  const entries = transforms.map((transform) => {
    const delivery = cloudinaryDeliveryUrl(url, transform);
    const width = transform.match(/w_(\d+)/)?.[1] ?? '960';
    return `${delivery} ${width}w`;
  });

  return {
    src: cloudinaryDeliveryUrl(url, transforms[transforms.length - 1]),
    srcset: entries.join(', '),
    sizes: ROLE_SIZES[role],
  };
}

/** Smallest variant for LCP preload (mobile-first). */
export function lcpPreloadFromCloudinary(url: string, role: CloudinaryRole = 'hero') {
  const img = responsiveCloudinary(url, role);
  let href = img.src;
  if (img.srcset) {
    const firstEntry = img.srcset.split(/,\s+/)[0]?.trim() ?? '';
    href = firstEntry.replace(/\s+\d+w$/, '') || href;
  }
  return {
    src: href,
    srcset: img.srcset,
    sizes: img.sizes,
  };
}

import r2Widths from '../data/r2-image-widths.json';
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

/**
 * Адрес хранилища картинок. С 24.09.2026 картинки отдаёт свой домен media.oper-stack.com: у старого
 * адреса r2.dev лимит частоты запросов и нет кэша. Файлы те же, другое только начало адреса.
 * Старый адрес код понимает, пока все статьи и загрузчик не переехали; размеры в srcset
 * всегда строятся с нового.
 */
const R2_HOST = 'media.oper-stack.com';
const R2_HOSTS = [R2_HOST, 'pub-2855c73eea384110b510f25966292c37.r2.dev'];
type R2Entry = { w: number; h: number; variants: number[] };

/**
 * Картинки, переехавшие на Cloudflare R2.
 *
 * Раньше эта функция на любом не-Cloudinary адресе возвращала просто { src } и молча теряла и
 * список ширин, и размеры кадра: замер 22.09.2026 показал ноль картинок с выбором размера из 49
 * на списке районов, телефон качал 10 272 КБ, столько же, сколько компьютер.
 *
 * Какие ширины реально залиты, знает манифест (scripts/r2-add-widths.mjs). Гадать нельзя: браузер
 * попросит несуществующий файл и получит 404 вместо картинки.
 */
export function r2Responsive(
  url: string,
  role: CloudinaryRole = 'inline',
): { src: string; srcset?: string; sizes?: string; width?: number; height?: number } | null {
  const iHost = R2_HOSTS.find((h) => url.includes(h)) ?? R2_HOST;
  const i = url.indexOf(iHost);
  if (i < 0) return null;
  const key = url.slice(i + iHost.length).replace(/^\//, '').split('?')[0];
  const entry = (r2Widths as Record<string, R2Entry>)[key];
  if (!entry) return null;

  const variants = (entry.variants || []).filter((w) => w < entry.w).sort((a, b) => a - b);
  const base = `https://${R2_HOST}/${key}`;
  const srcset = variants.length
    ? [...variants.map((w) => `${base.replace(/\.webp$/i, `-w${w}.webp`)} ${w}w`), `${base} ${entry.w}w`].join(', ')
    : undefined;

  return { src: url, srcset, sizes: srcset ? ROLE_SIZES[role] : undefined, width: entry.w, height: entry.h };
}

export function responsiveCloudinary(
  url: string,
  role: CloudinaryRole = 'inline',
): { src: string; srcset?: string; sizes?: string; width?: number; height?: number } {
  const fromR2 = r2Responsive(url, role);
  if (fromR2) return fromR2;

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

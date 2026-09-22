import { r2Responsive } from './cloudinary';

/**
 * Карточка в списке с выбором размера.
 *
 * Ширина слота померена на живой странице 22.09.2026: при экране 375 карточка занимает 325 точек,
 * при 900 ровно 402, при 1440 ровно 310. Круглое 100vw здесь врёт и заставляет браузер брать файл
 * шире нужного.
 */
export const CARD_SIZES =
  '(max-width: 599px) calc(100vw - 50px), (max-width: 1023px) calc(50vw - 48px), 310px';

export type CardImage = { src: string; srcset?: string; sizes?: string; width?: number; height?: number };

export function getCardImage(src: string | undefined, size: 'card' | 'hero' = 'card'): CardImage | null {
  if (!src?.trim()) return null;
  const fromR2 = r2Responsive(src.trim(), 'thumb');
  if (fromR2) return { ...fromR2, sizes: size === 'card' ? CARD_SIZES : fromR2.sizes };
  const url = getCardImageUrl(src, size);
  return url ? { src: url } : null;
}

/**
 * Card thumbnail URLs — Cloudinary crop when available; external CDN as-is.
 */
export function getCardImageUrl(src: string | undefined, size: 'card' | 'hero' = 'card'): string {
  if (!src?.trim()) return '';

  const trimmed = src.trim();

  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/upload/')) {
    const dims = size === 'hero' ? 'w_640,h_560,c_fill,q_auto:eco,g_auto,f_auto' : 'w_640,h_360,c_fill,q_auto:eco,g_auto,f_auto';
    return trimmed.replace(/\/upload\/(?:v\d+\/)?/, `/upload/${dims}/`);
  }

  return trimmed;
}

export function formatAreaLabel(area?: string): string {
  if (!area) return '';
  return area
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatEur(price?: number): string {
  if (!price || price <= 0) return '';
  if (price >= 1_000_000) return `€${(price / 1_000_000).toFixed(1)}M`;
  return `€${Math.round(price / 1000)}K`;
}

export function formatUsd(price?: number): string {
  if (!price || price <= 0) return '';
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(price / 1000)}K`;
}

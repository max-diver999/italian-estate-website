# Волна 5.1 — уникальные hero-обложки для всего корпуса (2026-08-21)

## Проблема

Текстовые гейты не видели слой картинок. На листингах это выглядело как одна
и та же новостройка на десятках карточек:

- 49 гайдов делили один рендер `prandina-navigli-milan/hero.webp`
- ещё ~66 страниц сидели на 6 других рендерах (ostuni-new-villa, inspire/feel
  uptown, ostuni-trulli, maciachini)
- свои обложки были только у 23 региональных гайдов, 18 compare, большинства
  areas и части projects
- итого затронуто 115 страниц: 68 guides, 14 projects, 13 compare,
  12 developers, 5 areas (вкл. chianti/ostuni), 4 news

## Что сделано

1. Для каждой из 115 страниц вручную подобрано тематическое фото на
   Wikimedia Commons (город/район/тип объекта страницы; JPEG ≥1200px,
   альбомная ориентация; отсев карт, гравюр, картин, интерьеров,
   мемориальных табличек — три раунда ручной редакторской ревизии).
2. Прогон через существующий конвейер `migrate-heroes-to-cloudinary.mjs`:
   лицензия + автор с Commons API → рендиция 1600px → Cloudinary
   `more-group/italy/{collection}/{slug}/hero` → перезапись frontmatter →
   атрибуция в `scripts/reports/hero-migration-manifest.json`.
   115/115 мигрировано, 0 ошибок; лицензии CC BY / CC BY-SA / CC0.
3. Новый гейт **`npm run check-heroes`** (`scripts/qa-hero-uniqueness.mjs`):
   падает, если (а) две страницы делят один asset, (б) страница указывает на
   чужую папку `{collection}/{slug}`, (в) у страницы нет heroImage.
   Сейчас: **252 страницы — 252 уникальные обложки, PASS.**

## Проверки после

- `validate:content` — 252/252 clean
- `npm run build` — 0 P0 / 0 P1
- `check-heroes` — PASS
- `fix:markdown-glue --dry` — 0

Deploy НЕ выполнялся — по регламенту merge/deploy за Максимом и Cursor.

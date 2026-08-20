# Аудит скорости / техники (после блока 7)

Exit: **OK**

## Что исправили
- Шрифты DM Sans — локально через `@fontsource` (убрали Google Fonts из `<head>`)
- GA и PostHog — в конце `<body>`, загрузка через 3 с после load
- Hero LCP — preload + `ResponsiveImage` с webp srcset в `ArticleLayout`
- Cloudinary — `preconnect` + `dns-prefetch` в `<head>`
- `scripts/batch-writing-gate.mjs` + `validate:batch` в package.json
- `PostHog.astro` (работает при `PUBLIC_POSTHOG_KEY` в Vercel)

## Предупреждения (не блокируют legacy)
- ⚠ Missing recommended: scripts/lib/cloudinary-gate.mjs
- ⚠ Missing recommended: scripts/lib/sitemap-exclusions.mjs
- ⚠ Missing recommended: scripts/validate-sitemap-exclusions.mjs

Пробная сборка + postbuild smoke: **0 ошибок** на 252 страницах.

Эталон: `more-group-content-os/templates/new-site/tech-files-manifest.md`

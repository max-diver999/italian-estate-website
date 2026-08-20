# Аудит скорости / техники

Exit: есть проблемы

## Обязательно исправить
- ✗ Missing required: src/lib/cloudinary.ts
- ✗ Missing required: src/components/ResponsiveImage.astro
- ✗ Cannot check Cloudinary webp quality transforms: src/lib/cloudinary.ts missing

## Предупреждения (шрифты — можно позже на legacy)
- ⚠ Missing (legacy, не блокирует): scripts/batch-writing-gate.mjs
- ⚠ Missing recommended: src/components/PostHog.astro
- ⚠ Missing recommended: scripts/lib/cloudinary-gate.mjs
- ⚠ Missing recommended: scripts/lib/sitemap-exclusions.mjs
- ⚠ Missing recommended: scripts/validate-sitemap-exclusions.mjs
- ⚠ Check failed (self-hosted fonts (@fontsource in global.css)): src/styles/global.css
- ⚠ Check failed (GA deferred 3s after load): src/components/GoogleAnalytics.astro
- ⚠ package.json missing script: validate:batch
- ⚠ package.json: no @fontsource/* dependency (fonts may load from Google)

Эталон: `more-group-content-os/templates/new-site/tech-files-manifest.md`
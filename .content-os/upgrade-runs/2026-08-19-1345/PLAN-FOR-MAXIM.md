# Апгрейд-пакет — план для Максима

| | |
|---|---|
| Сайт | italian-estate-website (italian-estate.com) |
| Run ID | `2026-08-19-1345` |
| Папка | `.content-os/upgrade-runs/2026-08-19-1345/` |

## Что уже сделано автоматически

- **0. Снимок «до»** — ✅
- **1. Механика корпуса** — ✅
- **2. Title Findrix** — ❌ fail
- **3. H1 / иерархия** — ❌ fail
- **4. Meta / descriptions** — ✅
- **5. Очередь GEO top-50** — ✅
- **6. GEO доработка (агенты)** — ✅
- **7. Скорость / техника** — ❌ fail
- **8. Инфра / краулеры** — ✅
- **6. GEO доработка (агенты)** — ✅ (только ТЗ, без переписывания)

## Скорость / техника (блок 7)

- **tech-preflight: есть проблемы** — 3 обязательных пунктов.
  - ✗ Missing required: src/lib/cloudinary.ts
  - ✗ Missing required: src/components/ResponsiveImage.astro
  - ✗ Cannot check Cloudinary webp quality transforms: src/lib/cloudinary.ts missing
- Предупреждений: **9** (часто шрифты @fontsource — можно позже на legacy).
  - ⚠ Missing (legacy, не блокирует): scripts/batch-writing-gate.mjs
  - ⚠ Missing recommended: src/components/PostHog.astro
  - ⚠ Missing recommended: scripts/lib/cloudinary-gate.mjs
  - ⚠ Missing recommended: scripts/lib/sitemap-exclusions.mjs
  - ⚠ Missing recommended: scripts/validate-sitemap-exclusions.mjs
- Подробно: `PERF-AUDIT.md`

## Цифры (аудит)

- GEO ниже 90: **143** файлов (средний балл **75**, всего commercial **233**).
- H1: audit headings не запускался (скрипт отсутствует на сайте).

## Скриптовые правки

Запуск был с **--apply**: заголовки / H1 / meta применены там, где есть скрипты на сайте.

## После скриптов (если есть after.json)

| | До | После |
|---|---|---|
| GEO &lt; 90 | 143 | 143 |
| Title needs fix | — | — |

## GEO очередь (ручная доработка)

- В очереди: **50** URL (top GSC).
- Нужна ручная доработка: **50** статей.
- Батчей по 5 файлов: **10** (см. AGENT-TZ.md).

Примеры URL:
- italian-estate.com/projects/coima-via-carcani-trastevere/ — GEO 48, показы 0
- italian-estate.com/projects/lendlease-mind-milan/ — GEO 54, показы 0
- italian-estate.com/projects/ostuni-trulli-modern-villa/ — GEO 54, показы 0
- italian-estate.com/projects/meli-navigli-milan/ — GEO 55, показы 0
- italian-estate.com/areas/turin/ — GEO 56, показы 0

## ТЗ для батчей (ещё не выполнено)

- Файл: `AGENT-TZ.md`
- Готово батчей: **0/10**

---

## СТОП — нужен твой «ок»

**Не начинать переписывание статей (batch 1…N)**, пока не ответишь, например:

- «ок, batch 1»
- «продолжай апгрейд batch 1»

Cursor после «ок» читает `batches/batch-01-agent-brief.md` и правит **только 5 файлов** этого батча.

На сайт не выкладывал. Деплой только по «выложи».

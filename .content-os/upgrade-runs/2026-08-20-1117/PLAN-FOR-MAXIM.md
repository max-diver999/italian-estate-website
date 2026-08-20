# Апгрейд-пакет — план для Максима

| | |
|---|---|
| Сайт | italian-estate-website (italian-estate.com) |
| Run ID | `2026-08-20-1117` |
| Папка | `.content-os/upgrade-runs/2026-08-20-1117/` |

## Что уже сделано автоматически

- **0. Снимок «до»** — ✅
- **1. Механика корпуса** — ✅
- **2. Title Findrix** — ✅
- **3. H1 / иерархия** — ✅
- **4. Meta / descriptions** — ✅
- **5. Очередь GEO top-50** — ✅
- **6. GEO доработка (агенты)** — ⏳ pending
- **7. Скорость / техника** — ✅
- **8. Инфра / краулеры** — ✅
- **6. GEO доработка (агенты)** — ⏳ pending (только ТЗ, без переписывания)

## Скорость / техника (блок 7)

- **tech-preflight: OK** (Cloudinary, analytics +3s, smoke-скрипты на месте).
- Предупреждений: **3** (часто шрифты @fontsource — можно позже на legacy).
  - ⚠ Missing recommended: scripts/lib/cloudinary-gate.mjs
  - ⚠ Missing recommended: scripts/lib/sitemap-exclusions.mjs
  - ⚠ Missing recommended: scripts/validate-sitemap-exclusions.mjs
- Подробно: `PERF-AUDIT.md`

## Цифры (аудит)

- GEO ниже 90: **124** файлов (средний балл **81**, всего commercial **233**).
- Заголовки (title): **4** нуждаются в правке из **237** (dangling: 0).
- H1 / иерархия: проверено, см. audit в run-папке.

## Скриптовые правки

Запуск **без --apply**: только аудит и очередь. Повтори с `npm run upgrade-pack` (с apply) для title/H1/meta.

## GEO очередь (ручная доработка)

- В очереди: **50** URL (top GSC).
- Нужна ручная доработка: **50** статей.
- Батчей по 5 файлов: **10** (см. AGENT-TZ.md).

Примеры URL:
- italian-estate.com/compare/italy-vs-portugal-property-investment/ — GEO 58, показы 0
- italian-estate.com/compare/italy-vs-france-property-investment/ — GEO 61, показы 0
- italian-estate.com/projects/tranio-rome-eur-apartment/ — GEO 62, показы 0
- italian-estate.com/projects/unapavia-pavia-residential/ — GEO 62, показы 0
- italian-estate.com/areas/ancona/ — GEO 63, показы 0

---

## СТОП — нужен твой «ок»

**Не начинать переписывание статей (batch 1…N)**, пока не ответишь, например:

- «ок, batch 1»
- «продолжай апгрейд batch 1»

Cursor после «ок» читает `batches/batch-01-agent-brief.md` и правит **только 5 файлов** этого батча.

На сайт не выкладывал. Деплой только по «выложи».

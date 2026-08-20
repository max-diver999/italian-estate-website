# Апгрейд-пакет — план для Максима

| | |
|---|---|
| Сайт | italian-estate-website (italian-estate.com) |
| Run ID | `2026-08-19-1415` |
| Папка | `.content-os/upgrade-runs/2026-08-19-1415/` |

## Что уже сделано автоматически

- **0. Снимок «до»** — ✅
- **1. Механика корпуса** — ✅
- **2. Title Findrix** — ✅
- **3. H1 / иерархия** — ✅
- **4. Meta / descriptions** — ✅
- **5. Очередь GEO top-50** — ✅
- **6. GEO доработка (агенты)** — ✅
- **7. Скорость / техника** — ✅
- **8. Инфра / краулеры** — ✅
- **6. GEO доработка (агенты)** — ✅ (только ТЗ, без переписывания)

## Скорость / техника (блок 7)

- **tech-preflight: OK** (Cloudinary, analytics +3s, smoke-скрипты на месте).
- Предупреждений: **8** (часто шрифты @fontsource — можно позже на legacy).
  - ⚠ Missing (legacy, не блокирует): scripts/batch-writing-gate.mjs
  - ⚠ Missing recommended: src/components/PostHog.astro
  - ⚠ Missing recommended: scripts/lib/cloudinary-gate.mjs
  - ⚠ Missing recommended: scripts/lib/sitemap-exclusions.mjs
  - ⚠ Missing recommended: scripts/validate-sitemap-exclusions.mjs
- Подробно: `PERF-AUDIT.md`

## Цифры (аудит)

- GEO ниже 90: **116** файлов (средний балл **82**, всего commercial **233**).
- Заголовки (title): **231** нуждаются в правке из **237** (dangling: 0).
- H1 / иерархия: проверено, см. audit в run-папке.

## Скриптовые правки

Запуск был с **--apply**: заголовки / H1 / meta применены там, где есть скрипты на сайте.

## После скриптов (если есть after.json)

| | До | После |
|---|---|---|
| GEO &lt; 90 | 116 | 116 |
| Title needs fix | 231 | 231 |

## GEO очередь (ручная доработка)

- В очереди: **50** URL (top GSC).
- Нужна ручная доработка: **50** статей.
- Батчей по 5 файлов: **10** (см. AGENT-TZ.md).

Примеры URL:
- italian-estate.com/compare/italy-vs-portugal-property-investment/ — GEO 56, показы 0
- italian-estate.com/compare/italy-vs-france-property-investment/ — GEO 61, показы 0
- italian-estate.com/projects/tranio-rome-eur-apartment/ — GEO 62, показы 0
- italian-estate.com/projects/unapavia-pavia-residential/ — GEO 62, показы 0
- italian-estate.com/areas/ancona/ — GEO 63, показы 0

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

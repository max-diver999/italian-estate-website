# Content status — italian-estate.com

> **Единственный файл «где мы сейчас».** Claude Code и Cursor читают его первым после `git pull origin main`.

## Источник правды

- Репозиторий: `max-diver999/italian-estate-website`, ветка **`main`**
- Процесс: `docs/WORKFLOW-GITHUB.md`
- **Content OS pilot:** тот же каркас, что **moregroup.estate (Пхукет EN)** — **аудит → волны починки → потом новые статьи**
- **Не Камбоджа:** без roadmap волн 1–8 до завершения аудита
- **Автономия Claude:** `more-group-content-os/policies/claude-autonomous-decisions.md` + `corpus-cleanup-mode.md`

## База на main (2026-08-20)

Сегодня на сайте уже выложено:

| Коммит | Что |
|---|---|
| `bcaf8e7` | GEO upgrade batches 1–10, полный refresh **252 MDX** |
| `4360b18` | Dedupe boilerplate, GEO refresh phases 2–5, **142 файла** |

После этого: **avg GEO commercial 91**, **21 файл ниже 90** (худший: `compare/florence-vs-rome-property-investment` — 76).

Claude **не** запускает повторный bulk GEO по всему корпусу. Задача — **аудит остатка** и точечные волны.

## Фаза 0 — полный аудит (⏳ следующий шаг)

Content OS pilot подключён **2026-08-20**.

| Вход для анализа | Путь |
|---|---|
| Machine audit (252 files) | `docs/CONTENT_QUALITY_AUDIT.md` |
| GSC snapshot | `more-group-content-os/analytics-snapshots/italian-estate-website/2026-08-20.json` |
| CTR / lead приоритеты | `docs/PRIORITY-CTR-LEADS.md` |
| Seed roadmap | `.content-os/batches/corpus-cleanup-roadmap-2026-08-20.md` |
| Legacy upgrade runs | `.content-os/upgrade-runs/` (2026-08-19 … 2026-08-20) |

**Топ проблемы (machine audit, indexable):** 28 thin-content · 11 repeated-paragraph · 17 ai-language · 46 missing-scenarios · 4 broken-internal-link · 1 cannibalization · 26 REWRITE_OR_NOINDEX

**Claude:** `AUDIT-REPORT-{date}.md` + уточнённый `corpus-cleanup-roadmap-{date}.md` → **СТОП** → ждать «ок» от Максима → fix-batch по волнам.

**Максим:** после roadmap — «ок, волна 1» (или правки приоритетов). Новые статьи — **только после** «ок» на аудит-план (как Пхукет).

## Волны (черновик — lock после «ок»)

| Wave | Фокус | Ориентир |
|---:|---|---|
| 1 | Broken internal links + cannibalization | 4 links + `how-to-buy-italy-property-step-by-step` vs hub |
| 2 | Thin + repeated paragraphs | 28 + 11 |
| 3 | AI-language + missing-scenarios on GSC lead pages | PRIORITY doc + 17 ai-language |
| 4 | REWRITE_OR_NOINDEX decisions | 26 + 2 NOINDEX_OR_REWRITE + 1 NOINDEX |
| 5 | GEO tail below 90 (surgical, not bulk) | 21 files |

## Фаза 1 — новые статьи (после аудита)

Topic discovery → proposal JSON → **стоп** → batch как Испания/Камбоджа. До «ок» на аудит **новые slug запрещены**.

## Не использовать

- `geo-fix-corpus-all.mjs` без одобренной волны
- Массовый regex по всему корпусу
- Cambodia-style wave roadmap как первый шаг
- Deploy / index из Claude Code

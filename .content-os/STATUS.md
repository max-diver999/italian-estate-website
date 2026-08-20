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

## Где мы сейчас (2026-08-20, вечер)

| Фаза | Статус |
|---|---|
| Фаза 0 — аудит | ✅ `.content-os/reports/AUDIT-REPORT-2026-08-20.md` |
| Roadmap волн | ✅ `.content-os/batches/corpus-cleanup-roadmap-2026-08-20.md` |
| **Wave 0** — детекторы + починка гейтов | ✅ **сделано** |
| **Wave 1** — слой шаблонов | ✅ **сделано** |
| Wave 2 — hero с Wikimedia на Cloudinary | ⏳ ждёт «ок» |
| Waves 3–8 — контент | ⏳ ждёт «ок» |

**Wave 0+1 итог (проверено на собранном билде, не на исходниках):**

- `validate:content` и `validate:batch` **падали** на модулях, которых нет ни в одном репо — починены
- 252 страницы отдавали **два** блока `FAQPage` → теперь один; 65 project-страниц показывали FAQ **дважды**
- 90 шрамов ` , ` от старой зачистки тире в 32 файлах `src/` → 0 на всех 278 страницах
- `<title>` >62 символов: 187 → 0; hero без `alt`: 252 → 0
- Заголовки хабов `/projects` «Mexico Real Estate Projects», `/guides` «Spain Property Investment Guides»,
  `/compare` «Spain…», `/areas` «Italian **Estatement** Areas» → исправлены
- Таблицы, рендерившиеся палками: 2 → 0; приклеенных таблиц в корпусе: 9 → 0
- Битые внутренние ссылки: 4 → 0; страницы без входящих ссылок: 24 → 13 (заработал `<RelatedGuides>`)
- Новые гейты: `check-links`, `audit:templates`; все 8 гейтов зелёные

**Ратчет качества:** `.content-os/quality-baseline.json` фиксирует долг по каждому файлу. Все контентные
гейты падают только если файл стал **хуже** базы, а числа в базе могут только уменьшаться. Текущий долг:
125 самоповторов · 816 near-dup внутри страниц · 66 точных межстраничных дублей · 6 564 near-dup пар ·
36 файлов ниже GEO 90 · 96 короче 2 500 слов · 138 файлов с legacy-блокерами. Волны 3–8 обнуляют это.

## Фаза 0 — полный аудит (✅ завершена)

Content OS pilot подключён **2026-08-20**.

| Вход для анализа | Путь |
|---|---|
| Machine audit (252 files) | `docs/CONTENT_QUALITY_AUDIT.md` |
| GSC snapshot | `more-group-content-os/analytics-snapshots/italian-estate-website/2026-08-20.json` |
| CTR / lead приоритеты | `docs/PRIORITY-CTR-LEADS.md` |
| Seed roadmap | `.content-os/batches/corpus-cleanup-roadmap-2026-08-20.md` |
| Legacy upgrade runs | `.content-os/upgrade-runs/` (2026-08-19 … 2026-08-20) |

**Топ проблемы (machine audit, indexable):** 28 thin-content · 11 repeated-paragraph · 17 ai-language · 46 missing-scenarios · 4 broken-internal-link · 1 cannibalization · 26 REWRITE_OR_NOINDEX

**Claude:** аудит и roadmap сданы; Wave 0+1 выполнены и в PR.

**Максим:** следующее решение — «ок, волна 2» (hero-картинки, 111 страниц, только frontmatter) или сразу
волна 3 (реестр фактов + IMU). Новые статьи — **только после** прохода волн (как Пхукет).

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

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

## Где мы сейчас (2026-08-21, волна 5 завершена)

**`validate:batch` зелёный впервые за весь аудит.** Отчёт: `.content-os/reports/WAVE5-COMPLETION-2026-08-21.md`.

| Гейт | Статус |
|---|---|
| `validate:batch` (блокирует PR) | ✅ PASS |
| `validate:content` | ✅ 252/252 |
| `npm run build` | ✅ 0 P0 / 0 P1 |
| `check-links` | ✅ |
| `qa-corpus-signals` | ✅ |
| `geo-citability-audit` | ✅ |
| `qa:full:quick` | 5/6 (HTTP smoke — нет сетевого доступа к живому сайту из контейнера) |

Ключевое за волну:

- **1 492 машинных лида `X means … for foreign buyers` → 0.** Всё переписано вручную под страницу.
- **Найдена причина, а не симптом:** `scoreSelfContainment()` платил +10 за буквальные строки `the project` / `this market` / `the area` / `the developer` / `foreign buyers` — тот же класс бага, что волна 4 нашла в `scoreUniqueness()`. Исправлено на «есть ли в абзаце цифра». Корпус: avg GEO 87.5 → **89.8**, страниц ниже порога 132 → **0**.
- **Фактические ошибки исправлены по источникам:** IVAFE (описывался как налог на итальянский объект нерезидента), IVIE 0.76% → 1.06%, IMU второго жилья 0.4-0.76% → 0.76-1.06%, греческая Golden Visa €250k → €400k/€800k, flat tax приведён к трём тирам с €300k от 2026.
- **`cedolare-secca-vs-irpef`** был построен на ложной посылке, что частный арендодатель вычитает IMU/ремонт/управление из базы IRPEF. База — 95% полученной аренды. Механика, таблица и все четыре сценария переписаны.
- **Цитируемые блоки:** 105 страниц из 252 не имели ни одного до аудита → **0**, среднее 2.06 на страницу.
- **MORE Group в тексте: 0** (остались только пути ассетов Cloudinary — по договорённости).

Дальше: ревью PR в Cursor → «выложи» → деплой и переиндексация. Новые статьи — только после «ок» на roadmap.

## Волна 1 новых статей (2026-08-22, «Деньги и сделка») — готова к ревью

Maxim дал «ок» на roadmap 50 статей (`.content-os/batches/new-articles-roadmap-2026-08-22.md`). Волна 1 написана и прошла гейты:

- **10 новых гайдов** (SRL, аукционы, nuda proprietà, rent-to-buy, перевод денег, продажа, 90/180, proposta, гарантии новостроек, viewing trip) — все вручную, **GEO 92–94**, 3 цитируемых блока и вопросные H2 на каждом, 2 длинных тире прозы на все 10 файлов.
- **Факты волны верифицированы онлайн** (interesse legale 1,6% / пол 2,5% для узуфрукта, superbonus-платеж 26% в 10-летнем окне, EES с 10.04.2026, ETIAS → 2027, IRES 24%).
- **Hero**: 10 уникальных тематических фото (Commons → Cloudinary, атрибуция в манифесте), `check-heroes` PASS на 262 страницах.
- **SERP-брифы**: ветка `claude/italy-wave1-briefs` в more-group-content-os (10 новых + 7 ретро-стабов для legacy). **Мержить content-os PR первым**, потом site PR.
- Гейты: validate:content 262/262, batch-writing-gate --all PASS, corpus-signals PASS, preflight 0 errors, fact-check 0 errors, build 0 P0/P1, links clean.

Попутно закрыт хвост прошлой волны: «two%»-регрессия (8 файлов), устаревший flat tax на prima-casa, ссылки и описания на 7 legacy-страницах.



## Где мы сейчас (2026-08-20, вечер)

| Фаза | Статус |
|---|---|
| Фаза 0 — аудит | ✅ `.content-os/reports/AUDIT-REPORT-2026-08-20.md` |
| Roadmap волн | ✅ `.content-os/batches/corpus-cleanup-roadmap-2026-08-20.md` |
| **Wave 0** — детекторы + починка гейтов | ✅ **сделано** |
| **Wave 1** — слой шаблонов | ✅ **сделано** |
| **Wave 2** — hero с Wikimedia на Cloudinary | ✅ **сделано** |
| Waves 3–8 — контент | ⏳ ждёт «ок» |

**Wave 2 итог:** 166 картинок (111 hero + 55 внутри текста) со 111 страниц переехали на Cloudinary.
`grep -r upload.wikimedia src/` → **0**. Замеры: половина hero отдавала **429** (битая картинка у
посетителя), у загружавшихся медиана **2 252 КБ** (Генуя — **4 685 КБ**) как LCP без srcset. Стало:
медиана **191 КБ** webp, мобильные ~47 КБ, srcset у 252 из 252. Новая страница `/image-credits` —
62 из 68 файлов под CC BY/BY-SA требуют атрибуции, которой не было.

**Причина шрамов ` , ` найдена:** `humanizeBodyLines()` делал `replace(/—/g, ', ')` не съедая пробел
перед тире. `fix-human-corpus-signals.mjs` вызывает его — повторный запуск «гуманизатора» вернул бы
все шрамы обратно. Починено.

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

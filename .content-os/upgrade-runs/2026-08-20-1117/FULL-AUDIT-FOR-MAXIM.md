# Полный аудит апгрейд-пакета — показать Максиму

**Сайт:** italian-estate-website | **Run-id:** `2026-08-20-1117`

> Агент **обязан** вставить эту таблицу в чат. После — **СТОП**. Не править MDX. Не GEO. Не subagents.

| # | Блок | Статус | Что нашли / что дальше |
|---|------|--------|-------------------------|
| 0 | Снимок «до» | ✅ готово | GEO: 233 commercial, avg 81, ниже 90: 124. Titles: 4/237 нуждаются в правке. H1: audit выполнен. Типографика: OK по встроенному scan. Fix-batch: 0/0 not-ready. Markdown glue: 11 files, Typically: ? |
| 1 | Механика корпуса | ✅ готово | Просканировано 237 статей — типографика OK |
| 2 | Title Findrix | ✅ готово | Просканировано (встроенный audit). 4/237 title нуждаются в правке. serp_long:4. авто-apply Findrix если --apply |
| 3 | H1 / иерархия | ✅ готово | H1/иерархия OK по всем статьям |
| 4 | Meta / descriptions | ✅ готово | Meta descriptions обработаны |
| 5 | Очередь GEO top-50 | ✅ готово | Очередь 50 URL, ручная доработка: 50 статей |
| 6 | GEO доработка (агенты) | ⏳ не запускался | ТЗ batch не создано |
| 7 | Скорость / техника | ✅ готово | Tech-preflight OK. 3 предупреждений (часто шрифты). Исправления — после «продолжай» |
| 8 | Инфра / краулеры | ✅ готово | healthcheck прошёл |
| 9 | Финал | ⏳ не запускался | verify: markdown glue 0 + fix-batch 0 not-ready + qa:full exit 0 |
| 10 | Отчёт | ⏳ не запускался | UPGRADE-REPORT + verification summary в run-папке |
| 11 | Markdown glue / slug | ⏳ не запускался | Glue/slug/Typically: 11 files need fix. Блок 11 в continue |
| 12 | Fix-batch корпус | ⏳ не запускался | Fix-batch: 0/0 not-ready. Tier A→B→C вручную. GEO только при 0 |

## Очередь работ после «продолжай» (строго по порядку)

⏳ **1.** механика корпуса (тире, типографика)
⏳ **11.** markdown glue / slug / Typically
⏳ **2.** title / Findrix
⏳ **12.** fix-batch tier A→B→C
⏳ **3.** H1 / иерархия
⏳ **4.** meta / descriptions
⏳ **7.** скорость / техника
⏳ **8.** smoke / sitemap
⏳ **6.** GEO batch — после блоков 1–4, 7–8
⏳ **9–10.** finalize

**Следующая команда:** `npm run upgrade-pack:continue -- --run-id …`

**Запрещено:** GEO / bulk «Typically» / auto geo-fix до fix-batch = 0 и glue = 0.

**Максим пишет:** «продолжай апгрейд run-id …» — только тогда фаза 2.

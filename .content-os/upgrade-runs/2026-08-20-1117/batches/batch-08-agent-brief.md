# Batch 8 — GEO rewrite (5 files)

> Запускать **только** если Максим уже сказал «ок, batch 8» **и** fix-batch = 0 not-ready.

**Site:** italian-estate-website  
**Run:** `/Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website/.content-os/upgrade-runs/2026-08-20-1117`  
**Done marker:** `batches/batch-08.done`

**Политика:** `more-group-content-os/policies/geo-aeo-writing-gates.md`

---

## Запрещено (урок Spain/Cambodia)

- Абзацы «**Typically, {heading} means** modeling $480/month…» — удалить, не генерировать
- Одинаковый stat-table в каждом H2
- Bulk `geo-fix-corpus-all.mjs`, `geo-fix-90-target.mjs`, `geo-fix-deep-90.mjs`
- Удаление текста так, что `##` склеивается с предыдущей строкой
- Slug как текст ссылки: `[off-plan-guide](/guides/off-plan-guide/)`

Перед PR: `npm run fix:markdown-glue -- --dry` → **0 files**.

---

## Project reviews (если есть в batch)

(none this batch)

### Шаблон project review

1. `serpExempt: true`, `updatedDate: сегодня`
2. Удалить: Quick answer boilerplate, дубли внизу (`Who this project suits`, повторные Risks/Due diligence/Area context)
3. Убрать фразы «matching … tenant demand»
4. **Стандартные H2:** What Is…, Key Facts, Location and Area, Design and Units, Investment Case, Who Is This For, Pros and Cons, What Should Foreign Buyers Verify Before Reserving?
5. Первый абзац **каждого H2:** 40–60 слов, **прямой ответ**, цифры (%, валюта сайта, years), **foreign buyers** — уникальный текст под секцию
6. **Одна** investment benchmark table (не в каждом H2)
7. Due diligence **перед** FAQ, ≥6 internal links, ≥1200 слов
8. Сохранить полезный FaqBlock

Эталон: `more-group-website/src/content/projects/garrya-residences.mdx`

---

## Guides / comparisons / areas (если есть в batch)

- `src/content/areas/parma.mdx` (GEO 65, imp 0) — https://italian-estate.com/areas/parma/
- `src/content/areas/savona.mdx` (GEO 65, imp 0) — https://italian-estate.com/areas/savona/
- `src/content/areas/valle-d-itria.mdx` (GEO 65, imp 0) — https://italian-estate.com/areas/valle-d-itria/
- `src/content/compare/genoa-vs-florence-property.mdx` (GEO 65, imp 0) — https://italian-estate.com/compare/genoa-vs-florence-property/
- `src/content/compare/puglia-vs-tuscany-property.mdx` (GEO 65, imp 0) — https://italian-estate.com/compare/puglia-vs-tuscany-property/

### Шаблон commercial guide

1. H2 openers **40–60 слов** + stats + foreign buyers — **разный текст** в каждой секции
2. **2 citability blocks** 130–170 слов перед FAQ, маркер `{/* geo-cit:slug-part */}`
3. Insider tip / MORE Group field note если нет
4. Без boilerplate «matching tenant demand»
5. Таблица или numbered list в каждом scored H2

---

## Проверка batch

```bash
cd /Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website
npm run fix:markdown-glue -- --dry
node scripts/validate-content-quality.mjs --changed
npm run validate:batch
```

Каждый файл ≥ 90 GEO. Затем:

```bash
touch /Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website/.content-os/upgrade-runs/2026-08-20-1117/batches/batch-08.done
```

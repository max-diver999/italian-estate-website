# Batch 5 — GEO rewrite (5 files)

> Запускать **только** если Максим уже сказал «ок, batch 5».

**Site:** italian-estate-website  
**Run:** `/Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website/.content-os/upgrade-runs/2026-08-19-1345`  
**Done marker:** `batches/batch-05.done`

---

## Project reviews (если есть в batch)

- `src/content/projects/tranio-florence-historic-center.mdx` (GEO 58, imp 0) — https://italian-estate.com/projects/tranio-florence-historic-center/
- `src/content/projects/fivizzano-village-property.mdx` (GEO 59, imp 0) — https://italian-estate.com/projects/fivizzano-village-property/
- `src/content/projects/inspire-uptown-milan.mdx` (GEO 59, imp 0) — https://italian-estate.com/projects/inspire-uptown-milan/

### Шаблон project review

1. `serpExempt: true`, `updatedDate: сегодня`
2. Удалить: Quick answer boilerplate, дубли внизу (`Who this project suits`, повторные Risks/Due diligence/Area context)
3. Убрать фразы «matching … tenant demand»
4. **Стандартные H2:** What Is…, Key Facts, Location and Area, Design and Units, Investment Case, Who Is This For, Pros and Cons, What Should Foreign Buyers Verify Before Reserving?
5. Первый абзац **каждого H2:** 50–60 слов, «typically means», цифры (%, валюта сайта, years), **foreign buyers**
6. **Одна** investment benchmark table (не в каждом H2)
7. Due diligence **перед** FAQ, ≥6 internal links, ≥1200 слов
8. Сохранить полезный FaqBlock

Эталон: `more-group-website/src/content/projects/garrya-residences.mdx`

---

## Guides / comparisons / areas (если есть в batch)

- `src/content/areas/cisternino.mdx` (GEO 59, imp 0) — https://italian-estate.com/areas/cisternino/
- `src/content/compare/perugia-vs-assisi-property.mdx` (GEO 59, imp 0) — https://italian-estate.com/compare/perugia-vs-assisi-property/

### Шаблон commercial guide

1. H2 openers 40–60 слов + stats + foreign buyers
2. **2 citability blocks** 130–170 слов перед FAQ, маркер `{/* geo-cit:slug-part */}`
3. Insider tip / MORE Group field note если нет
4. Без boilerplate «matching tenant demand»

---

## Проверка batch

```bash
cd /Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website
node scripts/validate-content-quality.mjs --changed
```

Каждый файл ≥ 90 GEO. Затем:

```bash
touch /Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website/.content-os/upgrade-runs/2026-08-19-1345/batches/batch-05.done
```

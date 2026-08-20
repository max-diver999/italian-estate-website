# Batch 4 — GEO rewrite (5 files)

> Запускать **только** если Максим уже сказал «ок, batch 4».

**Site:** italian-estate-website  
**Run:** `/Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website/.content-os/upgrade-runs/2026-08-19-1415`  
**Done marker:** `batches/batch-04.done`

---

## Project reviews (если есть в batch)

- `src/content/projects/porto-cervo-villa-development.mdx` (GEO 63, imp 0) — https://italian-estate.com/projects/porto-cervo-villa-development/
- `src/content/projects/semproniano-farmhouse-restoration.mdx` (GEO 63, imp 0) — https://italian-estate.com/projects/semproniano-farmhouse-restoration/
- `src/content/projects/tranio-sicily-noto-stone-house.mdx` (GEO 63, imp 0) — https://italian-estate.com/projects/tranio-sicily-noto-stone-house/
- `src/content/projects/valle-d-itria-trulli-restoration.mdx` (GEO 63, imp 0) — https://italian-estate.com/projects/valle-d-itria-trulli-restoration/

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

- `src/content/areas/campobasso.mdx` (GEO 64, imp 0) — https://italian-estate.com/areas/campobasso/

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
touch /Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website/.content-os/upgrade-runs/2026-08-19-1415/batches/batch-04.done
```

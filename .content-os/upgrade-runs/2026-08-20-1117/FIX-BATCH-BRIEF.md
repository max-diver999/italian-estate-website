# Fix-batch — очередь правок (блок 12)

**Site:** italian-estate-website
**Run:** `/Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website/.content-os/upgrade-runs/2026-08-20-1117`

## Порядок (железно)

1. **Tier A** — критичные blockers (thin, missing FAQ, bad titles)
2. **Tier B** — title length 50–60 символов, descriptions
3. **Tier C** — projects/developers: TLDR, Quick answer, pros/cons

## Команды

```bash
cd /Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website
node scripts/fix-batch-queue.mjs --tier A --limit 30
node scripts/fix-batch-queue.mjs --tier B --limit 50
node scripts/fix-batch-queue.mjs --tier C --limit 30
node scripts/fix-batch-queue.mjs --json --limit 9999 | jq "[.[] | select(.ready==false)] | length"
# должно быть 0 перед GEO
```

## Правила

- Править **вручную** или точечными site-скриптами — не bulk geo-fix
- **Запрещено:** абзацы «Typically, … means modeling $480/month…»
- После удаления boilerplate — проверить что каждый `##` на отдельной строке
- Политика: `more-group-content-os/policies/geo-aeo-writing-gates.md`

## Снимок аудита

- В очереди: 0, готово: 0, **не готово: 0**
- По tier: {}

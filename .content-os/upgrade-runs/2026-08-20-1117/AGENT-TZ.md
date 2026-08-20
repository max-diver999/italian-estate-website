# Апгрейд-пакет — ТЗ для Cursor / Claude (v1.6)

> **ФАЗА 1 — СТОП:** покажи `FULL-AUDIT-FOR-MAXIM.md` в чат и **закончи turn**.  
> **Не** правь MDX, **не** GEO, **не** subagents — до «продолжай апгрейд run-id» от Максима.

Эталон качества: **more-group-website** после run 2026-08-19 (top-50 GSC, GEO ≥90).

## Запрещено

- Начинать GEO / править MDX в **фазе 1** (до «продолжай»)
- Параллельные subagents на несколько batch
- `geo-fix-corpus-all.mjs`, `geo-fix-90-target.mjs`, `geo-fix-deep-90.mjs`
- Абзацы «Typically, {H2} means modeling $480/month…» и copy-paste stat tables
- Деплой без слова «выложи» от Максима
- Em dash (—)
- Цены в формате `5.37M THB` — только **«5.37 million THB»** (rubric stats)

## Политика GEO (обязательно Read)

`more-group-content-os/policies/geo-aeo-writing-gates.md`

## После каждого batch

1. `npm run fix:markdown-glue -- --dry` — **0 files**
2. `node scripts/validate-content-quality.mjs --changed` — exit 0
3. `npm run validate:batch` — exit 0
4. GEO score ≥ 90 на каждый файл (scorer ниже)
5. `touch batches/batch-NN.done` в папке run

## Scorer (на site repo)

```bash
node --input-type=module -e "
import {readFileSync} from 'fs';
import {parseMdxBody,scorePage} from './scripts/lib/geo-citability-scorer.mjs';
const f='FILE';
const c=f.includes('/projects/')?'projects':'guides';
console.log(scorePage(parseMdxBody(readFileSync(f,'utf8')),{collection:c}).score);
"
```


Run: `/Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website/.content-os/upgrade-runs/2026-08-20-1117`
Site: italian-estate-website (https://italian-estate.com/)
Batches: 10 × 5 files

## Forbidden
- Do NOT run geo-fix-corpus-all.mjs, geo-fix-90-target.mjs, geo-fix-deep-90.mjs
- Do NOT insert «Typically, {H2} means…» boilerplate or copy-paste stat tables
- Do NOT deploy unless Maxim says «выложи»
- Read more-group-content-os/policies/geo-aeo-writing-gates.md before MDX edits

### Batch 1
- Brief: `batches/batch-01-agent-brief.md`
- Done marker: touch `batches/batch-01.done` after validate + GEO ≥90

### Batch 2
- Brief: `batches/batch-02-agent-brief.md`
- Done marker: touch `batches/batch-02.done` after validate + GEO ≥90

### Batch 3
- Brief: `batches/batch-03-agent-brief.md`
- Done marker: touch `batches/batch-03.done` after validate + GEO ≥90

### Batch 4
- Brief: `batches/batch-04-agent-brief.md`
- Done marker: touch `batches/batch-04.done` after validate + GEO ≥90

### Batch 5
- Brief: `batches/batch-05-agent-brief.md`
- Done marker: touch `batches/batch-05.done` after validate + GEO ≥90

### Batch 6
- Brief: `batches/batch-06-agent-brief.md`
- Done marker: touch `batches/batch-06.done` after validate + GEO ≥90

### Batch 7
- Brief: `batches/batch-07-agent-brief.md`
- Done marker: touch `batches/batch-07.done` after validate + GEO ≥90

### Batch 8
- Brief: `batches/batch-08-agent-brief.md`
- Done marker: touch `batches/batch-08.done` after validate + GEO ≥90

### Batch 9
- Brief: `batches/batch-09-agent-brief.md`
- Done marker: touch `batches/batch-09.done` after validate + GEO ≥90

### Batch 10
- Brief: `batches/batch-10-agent-brief.md`
- Done marker: touch `batches/batch-10.done` after validate + GEO ≥90

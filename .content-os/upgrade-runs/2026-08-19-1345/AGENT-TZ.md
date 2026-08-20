# Апгрейд-пакет — ТЗ для Cursor / Claude (GEO block 6)

> **СТОП:** переписывание MDX начинается **только** после «ок, batch N» от Максима.
> Сначала покажи ему `PLAN-FOR-MAXIM.md` из этой run-папки.

Эталон качества: **more-group-website** после run 2026-08-19 (top-50 GSC, GEO ≥90).

## Запрещено

- Начинать batch до команды Максима
- `geo-fix-corpus-all.mjs`, `geo-fix-90-target.mjs`, `geo-fix-deep-90.mjs`
- Деплой без слова «выложи» от Максима
- Em dash (—)
- Цены в формате `5.37M THB` — только **«5.37 million THB»** (rubric stats)

## После каждого batch

1. `node scripts/validate-content-quality.mjs --changed` — exit 0
2. GEO score ≥ 90 на каждый файл (scorer ниже)
3. `touch batches/batch-NN.done` в папке run

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


Run: `/Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website/.content-os/upgrade-runs/2026-08-19-1345`
Site: italian-estate-website (https://italian-estate.com/)
Batches: 10 × 5 files

## Forbidden
- Do NOT run geo-fix-corpus-all.mjs, geo-fix-90-target.mjs, geo-fix-deep-90.mjs
- Do NOT deploy unless Maxim says «выложи»

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

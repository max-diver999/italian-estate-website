# Единый процесс: только GitHub — italian-estate.com

> **Один источник правды — репозиторий на GitHub.**  
> Content OS pilot: **corpus cleanup audit** (как **moregroup.estate / Пхукет EN**).  
> **Не** Cambodia wave roadmap как первый шаг.

## Роли

| Кто | Где работает | Что делает |
|---|---|---|
| **Claude Code (облако)** | [claude.ai/code](https://claude.ai/code), repo `italian-estate-website`, env **MORE Group Content** | Аудит → roadmap → **стоп до «ок»** → fix-batch по волнам → PR |
| **Cursor** | Локально | Ревью PR → merge → по «выложи»: деплой + индексация |
| **Максим** | Чат | «ок» на план / волну → «проверь PR» → «выложи» |

## Цикл пилота

```text
GitHub main (GEO refresh уже на сайте)
       ↓
Claude: pull → STATUS → corpus audit (CONTENT_QUALITY_AUDIT + GSC + PRIORITY)
       ↓
AUDIT-REPORT + roadmap → СТОП → Максим «ок»
       ↓
Fix-batch волна (≤~25 slug) → gates → PR
       ↓
Cursor ревью → merge → «выложи» → индексация
       ↓
(после аудита) Topic discovery → новые статьи → тот же цикл
```

## Файлы (читать по порядку)

| Файл | Назначение |
|---|---|
| `.content-os/STATUS.md` | Где мы сейчас |
| `.content-os/site-passport.yaml` | Режим corpus_cleanup, пути, analytics |
| `docs/CONTENT_QUALITY_AUDIT.md` | Machine audit 252 MDX |
| `.content-os/batches/corpus-cleanup-roadmap-*.md` | План волн |
| `.content-os/lock.json` | Одобренная волна |
| `docs/PRIORITY-CTR-LEADS.md` | CTR / lead приоритеты |
| `CLAUDE-CODE-START.md` | Фраза для нового чата |

## Content OS submodule

```bash
git submodule update --init --recursive
```

## Качество (fix-batch)

- `npm run fix:markdown-glue -- --dry` → 0 files would change
- `npm run validate:content:changed` exit 0
- `npm run validate:batch -- --changed` exit 0
- Правила: `more-group-content-os/policies/geo-aeo-writing-gates.md`

## PR в content-os (редко)

Только если правишь `legal-core.json`, `market-stats.json` или analytics snapshot. Merge content-os **до** site PR.

## Запрещено

- Fix-batch без одобрённого roadmap / lock
- `geo-fix-corpus-all.mjs` на весь корпус
- Mass regex delete
- Новые slug до «ок» на аудит-план
- Deploy / index из Claude Code

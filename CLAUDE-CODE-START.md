# Claude Code — старт одной фразой (Italy EN — italian-estate.com)

> **Только облако:** [claude.ai/code](https://claude.ai/code)  
> Environment: **MORE Group Content**  
> Repo: **max-diver999/italian-estate-website**  
> Источник правды: **GitHub `main`** — см. `docs/WORKFLOW-GITHUB.md`

## Каждая новая сессия

```bash
git pull origin main
git submodule update --init --recursive
```

Прочитать **в этом порядке**:

1. `.content-os/STATUS.md` — где мы сейчас
2. `.content-os/site-passport.yaml` — пути, analytics, правила
3. `more-group-content-os/policies/claude-autonomous-decisions.md`
4. `more-group-content-os/policies/corpus-cleanup-mode.md`
5. `docs/CONTENT_QUALITY_AUDIT.md` + `docs/PRIORITY-CTR-LEADS.md`
6. Analytics snapshot (passport → `analytics.snapshot`)
7. `CLAUDE.md`

**Задача в чате от Максима** решает фазу: аудит, починка волны, или (после «ок» на аудит) новые статьи.

## Проверка Cloudinary (один раз за сессию)

```bash
python3 scripts/verify-cloudinary-env.py
```

## Полный аудит (скопируй в новый чат)

```text
Pull main. italian-estate.com — Content OS pilot (как Пхукет EN). Прочитай STATUS, site-passport, docs/CONTENT_QUALITY_AUDIT.md, PRIORITY-CTR-LEADS, policies в content-os, baseline GEO после коммитов bcaf8e7 и 4360b18.

Задача: полный аудит корпуса — отчёт AUDIT-REPORT + план волн в .content-os/. Сам найди проблемы в файлах, не спрашивай меня про мелочи. НЕ bulk GEO по всему корпусу. СТОП до моего «ок». Правки и PR — только после «ок».
```

## Новые статьи (только после «ок» на аудит)

```text
Pull main. Италия — аудит уже одобрен. Topic discovery → roadmap → СТОП до «ок» → batch как Испания/Камбоджа.
```

## После «ок» на волну починки

```text
Pull main. Волна одобрена — scope из lock.json / roadmap. Fix-batch → fix:markdown-glue --dry → validate → PR. Блокеры сам.
```

## Cursor после PR

```text
Проверь PR Италии
```

```text
Выложи
```

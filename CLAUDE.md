# italian-estate.com — Claude Code entry

Content OS pilot: **corpus cleanup audit** (как **moregroup.estate / Пхукет EN**). **GitHub `main` = единственный источник правды.** Read **`docs/WORKFLOW-GITHUB.md`** and **`.content-os/STATUS.md`** first.

One-line prompts: **`CLAUDE-CODE-START.md`**.

**Pilot goal:** полный аудит после GEO refresh на main → волны починки → потом новые статьи (только после «ок» на аудит).

## Paths

| What | Where |
|---|---|
| Passport | `.content-os/site-passport.yaml` |
| Content OS | `more-group-content-os/` (submodule) |
| Machine audit | `docs/CONTENT_QUALITY_AUDIT.md` |
| Cleanup policy | `more-group-content-os/policies/corpus-cleanup-mode.md` |
| Fact registries | `more-group-content-os/content-engine/fact-registries/italian-estate-website/` |
| Rules | `.claude/rules/content.generated.md` |
| CTR / lead priorities | `docs/PRIORITY-CTR-LEADS.md` |
| Legacy runs | `.content-os/upgrade-runs/` |

## Workflow (GitHub only — Claude Code cloud)

1. `git pull origin main` → read **`.content-os/STATUS.md`**
2. **Phase 0:** AUDIT-REPORT + refine roadmap → **stop for Maxim «ок»**
3. After wave approval: `batch-shared-context` → surgical fix-batch (≤~25 slugs)
4. `npm run fix:markdown-glue -- --dry` → `validate:content:changed` → **validate:batch --changed** → PR
5. Cursor: review PR → merge → deploy + indexing (Maxim «выложи»)
6. **New articles:** only after audit roadmap approved — topic discovery like Spain/Cambodia

## Cloud environment

**MORE Group Content** with `CLOUDINARY_*`.

Verify: `python3 scripts/verify-cloudinary-env.py`

## Forbidden

- push main, deploy, index without Maxim + Cursor
- new MDX slugs before audit «ок»
- `geo-fix-corpus-all.mjs` or mass regex on full corpus
- Cambodia-first wave roadmap before audit complete
- invent roadmap only in chat — commit to `.content-os/batches/` and `.content-os/reports/`

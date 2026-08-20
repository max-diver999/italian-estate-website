# Content rules (Italy EN — corpus cleanup pilot)

> Source: `more-group-content-os/policies/content-quality-10.md` + Italy fact registries + `corpus-cleanup-mode.md`

## Collections

- Guides: `src/content/guides/{slug}.mdx`
- Also: projects, areas, compare, developers, news — cleanup waves may touch any collection

## Before any fix-batch (mandatory)

1. Read skill **`content-quality-10`**
2. Read `more-group-content-os/policies/corpus-cleanup-mode.md`
3. Read `more-group-content-os/content-engine/fact-registries/italian-estate-website/legal-core.json`
4. Read `docs/PRIORITY-CTR-LEADS.md` — lead pages first
5. Write `.content-os/batches/batch-shared-context-{date}.md`
6. Confirm approval in `lock.json`

## Editing existing pages

1. **No new slugs** until Maxim ok on audit roadmap (then topic discovery rules apply)
2. Fix links — verify target exists before href change
3. Thin content: expand with Italy-specific facts, tables, FAQ — not filler
4. Repeated paragraphs: dedupe, keep stronger version
5. **Legal:** reciprocity, codice fiscale, no property Golden Visa, heritage vincoli — see legal-core.json
6. Do **not** re-run bulk GEO on full corpus; surgical upgrades only in approved wave

## Before PR (mandatory)

```bash
npm run fix:markdown-glue -- --dry
npm run validate:content:changed
npm run validate:batch -- --changed
```

## Forbidden

- `geo-fix-corpus-all.mjs` on full corpus without wave approval
- Mass regex that strips newlines or whole sections
- Thailand / Cambodia / Spain legal wording (wrong country)
- push main, deploy, index from Claude Code

## PR to content-os (rare)

Only when updating `legal-core.json`, `market-stats.json`, or analytics snapshot. Merge content-os PR before site PR.

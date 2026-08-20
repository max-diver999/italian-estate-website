# Corpus cleanup roadmap — italian-estate.com (seed)

> **Seed from `docs/CONTENT_QUALITY_AUDIT.md` (2026-08-20) + post-GEO baseline on main.** Claude refines after spot-checks and GSC priorities. **Stop for Maxim «ок» before Wave 1.**

## Goal

Fix **remaining** quality issues after today's GEO refresh (252 MDX). Do **not** re-run bulk GEO on the full corpus. Protect lead pages in `docs/PRIORITY-CTR-LEADS.md`.

## Post-publish baseline

| Metric | Value |
|---|---|
| MDX on main | 252 |
| Avg GEO (commercial) | 91 |
| Below GEO 90 | 21 |
| Machine audit REWRITE_OR_NOINDEX | 26 |

## Issue summary (machine audit)

| Issue | Count |
|---|---:|
| missing-scenarios | 46 |
| thin-content | 28 |
| ai-language | 17 |
| repeated-paragraph | 11 |
| few-internal-links | 8 |
| broken-internal-link | 4 |
| cannibalization | 1 |
| REWRITE_OR_NOINDEX | 26 |

## Wave 1 — Links + cannibalization

**Scope:** 4 broken-internal-link + cannibalization on `how-to-buy-italy-property-step-by-step` vs hub `buy-property-italy-foreigner`.

**Method:** Surgical per file. Read both pages before merge/noindex decision.

**Exit:** `npm run fix:markdown-glue -- --dry` → 0 · `validate:content:changed` · PR `cc/italy-wave1-links`

## Wave 2 — Thin + repeated paragraphs

**Scope:** 28 thin-content + 11 repeated-paragraph.

**Priority:** GSC Tier A in PRIORITY-CTR-LEADS + audit score ≤85.

**Exit:** Same gates as Wave 1.

## Wave 3 — AI language + missing scenarios (lead pages)

**Scope:** 17 ai-language + 46 missing-scenarios on pages with clicks/impressions.

**Priority order:**

1. `guides/italy-reciprocity-property-foreigners`
2. `guides/heritage-restricted-property-italy`
3. `guides/italy-capital-gains-tax-property`
4. `guides/italy-property-closing-costs-breakdown`

**Legal:** Read `legal-core.json` before reciprocity / Golden Visa / tax blocks.

## Wave 4 — REWRITE_OR_NOINDEX decisions

**Scope:** 26 REWRITE_OR_NOINDEX + 2 NOINDEX_OR_REWRITE + 1 NOINDEX.

**Method:** Per slug decision in AUDIT-REPORT. **Note in PR** for each noindex.

**Examples:** `how-to-buy-italy-property-step-by-step` (cannibalization), `areas/taormina` (thin + repeat)

## Wave 5 — GEO tail (surgical)

**Scope:** 21 commercial files still below GEO 90 — **not** `geo-fix-corpus-all`.

**Worst:** `compare/florence-vs-rome-property-investment` (76).

## After all waves — new content

Topic discovery → `.content-os/batches/topics-proposal.json` → Maxim «ок» → SERP briefs in content-os PR → MDX batch (Cambodia/Spain workflow).

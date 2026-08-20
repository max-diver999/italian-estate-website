# Corpus cleanup roadmap — italian-estate.com

**Date:** 2026-08-20 · **Source:** `.content-os/reports/AUDIT-REPORT-2026-08-20.md`
**Status:** Waves 0 and 1 **DONE** (approved 2026-08-20, `lock.json` → `wave-0+1`). Waves 2–8 awaiting «ок».
**Rule:** ≤25 slugs per wave / per PR. Gates on every PR:
`npm run fix:markdown-glue -- --dry` (0 files) → `npm run validate:content:changed` → `npm run validate:batch -- --changed`.

> ✅ **Both gates are repaired (Wave 0).** The full suite now runs green:
> `fix:markdown-glue --dry` · `validate:content:changed` · `validate:batch --changed` ·
> `check-links` · `audit:templates` · `qa:corpus` · `audit:images` · `audit-rendered-live --local --fail`.
>
> All four content gates ratchet against **`.content-os/quality-baseline.json`**: a file fails only when it
> gets *worse* than its recorded debt, and baseline numbers may only go down. Run any gate with `--strict`
> to hold every file to zero, and `--update-baseline` after a wave lands to lower the floor.

## Why this order differs from the draft in `STATUS.md`

The draft roadmap starts with broken links (4 pages) and thin content. That is the right *content*
order, but it leaves the biggest defects untouched: the worst problems on this site are **not in the
MDX**, they are in the template layer and in the detectors. Waves 0–2 each fix **252 pages with a
handful of file edits** and cost almost nothing to review. Content waves start at Wave 3.

| Wave | Focus | Scope | Pages fixed | MDX touched? |
|---:|---|---|---:|---|
| ~~0~~ | ~~Detector gaps + broken gates~~ | **DONE** — 11 scripts, 3 new | — (prevents recurrence) | no |
| ~~1~~ | ~~Template-layer P0~~ | **DONE** — 41 files | **278** | 16 files, whitespace/href/title only |
| 2 | Hero images | 63 image URLs + frontmatter | **111** | frontmatter only |
| 3 | Fact registry + IMU reconciliation | ≤25 slugs | 25 | yes |
| 4 | Within-file duplicate paragraphs | ≤25 slugs ×3 batches | 88 | yes |
| 5 | Template openers + Quick-answer echo | ≤25 slugs ×2 batches | 47 | yes |
| 6 | Links, orphans, cannibalization | ≤25 slugs | 28 | yes |
| 7 | Cross-page near-duplicates | ≤25 slugs ×3 batches | 131 | yes |
| 8 | Thin content + noindex decisions | ≤25 slugs ×2 batches | 37 | yes |

---

## ~~Wave 0~~ — Close the detector gaps ✅ DONE 2026-08-20

**Why first:** every gate currently reports PASS on the defects in this report. Fixing content before
fixing detectors guarantees this happens again on the next refresh — which is exactly the history here.

| # | File | Change |
|---|---|---|
| **0.0** | `scripts/lib/more-content-gate.mjs:13`, `scripts/batch-writing-gate.mjs:10` | **Repair the two broken gates first.** Both import files that exist in neither repo (`scripts/lib/cloudinary-gate.mjs`, canonical `batch-writing-gate.mjs`) via paths that resolve *outside* the repo root. Restore/reimplement both modules in-repo and make the imports repo-relative. **Until this lands, `validate:content` and `validate:batch` cannot gate anything.** |
| 0.1 | `scripts/audit-p0-quality.mjs` | Add **within-file** repeated-paragraph detection (currently only fires at ≥3 *different* files). Add a near-duplicate check (6-gram Jaccard ≥0.45) for both within- and cross-file. |
| 0.2 | `scripts/qa-corpus-signals.mjs` | Replace the 4-string `PADDING_H2` check with real paragraph-hash duplication over the whole body. |
| 0.3 | `scripts/audit-p0-quality.mjs` | Extend the hero check beyond `/unsplash/i` to any non-Cloudinary external host. |
| 0.4 | **new** `scripts/check-links.mjs` + `"check-links"` in `package.json` | The script referenced in the workflow docs does not exist. Build the route inventory from content collections + `src/pages` + `public/`, fail on unresolvable internal hrefs. |
| 0.5 | **new** `scripts/audit-templates.mjs` | Lint `src/pages`, `src/layouts`, `src/components`, `src/data` for: punctuation scars (` ,`), wrong-country terms, duplicate JSON-LD `@type`, `<title>` length after suffix. **No audit has ever covered these directories.** |
| 0.6 | `scripts/fix-markdown-glue-and-slug-links.mjs` | Detect a table whose first row follows a list item or paragraph with no blank line (it reported `glue: 0` on two pages that render broken). |
| 0.7 | `scripts/qa-full.mjs` | Add a post-build assertion: exactly one `FAQPage` per rendered page; `<h1>` count == 1. |

**Exit:** re-running the gates reproduces the counts in the audit report (88 files, 111 heroes, 4 links, 252 double-FAQPage).

---

## ~~Wave 1~~ — Template-layer P0 ✅ DONE 2026-08-20

**Slugs: 0. Files: 34.** Highest value-per-line-changed in the whole roadmap.

| # | Fix | Files | Ref |
|---|---|---|---|
| 1.1 | Pass `noSchema` to every inline `<FaqBlock>` so only `ArticleLayout` emits `FAQPage`. Verify in `dist/` that every page has exactly 1. | `FaqBlock.astro` usage + the 6 collection `[...slug].astro` | P0-1 |
| 1.2 | Repair the 90 ` , ` em-dash scars across 32 files in `src/` — **manually, per occurrence**, no bulk regex. Start with `ArticleLayout.astro:167`, `Footer.astro:29`, `site.ts:6` (these three cover all 278 pages). | 32 files in `src/` | P0-2 |
| 1.3 | Rewrite the wrong-country meta descriptions and body copy: `/guides` (Mexico/fideicomiso), `/areas` (Riviera Maya), `/projects` (Riviera Maya, both meta + visible line 23), `/methodology` (UAE). | 4 files | P0-3 |
| 1.4 | Shorten `<title>` output — either trim the ` \| Italian Estate` suffix logic in `BaseLayout.astro:50` or cap frontmatter titles. 187 pages currently exceed ~62 chars. | 1 file (+ optional frontmatter pass) | P2-1 |
| 1.5 | Render a real `alt` on the hero instead of the hardcoded `alt=""`; add `width`/`height` where missing. | `ArticleLayout.astro`, `ResponsiveImage.astro` | P2-2/3 |
| 1.6 | **Decide + build:** either render `relatedSlugs` (declared on all 252 files, rendered nowhere) as a related-articles component, or remove it from the schema. Building it fixes internal linking on 252 pages in one component. | 1 new component + layout | P1-4 |

**Exit:** `dist/` shows 1 `FAQPage`/page, 0 ` , ` in rendered text, 0 Mexican/UAE terms in meta, `<title>` ≤62 chars.

---

## Wave 2 — Hero images off Wikimedia (fixes 111 pages)

63 distinct Wikimedia URLs, 42 of them full-resolution originals, currently **429-ing**.

1. `python3 scripts/verify-cloudinary-env.py`
2. Pull the 63 originals, push through the existing Cloudinary pipeline (`npm run images:upload:guides` / `:areas` / `:content`).
3. Repoint `heroImage` in frontmatter — **frontmatter only, no body edits**.
4. Record CC BY-SA attribution for any image that needs it.
5. `npm run audit:images` + confirm `srcset` is present on every hero in `dist/`.

Split by collection to stay ≤25 slugs per PR:
**2a** projects (46) → 2 PRs · **2b** guides (22) · **2c** areas (22) · **2d** compare (18) + developers (3).

**Priority inside the wave:** `costa-smeralda-property-investment-guide` (Tier A),
`italy-property-renovation-costs-guide` (Tier C), `porto-cervo-villa-development` (Tier B) first.

---

## Wave 3 — Fact registry + IMU reconciliation (≤25 slugs)

**PR order: `more-group-content-os` first, then site.**

1. Populate `market-stats.json` with real values, `as_of`, source tier and `owner_slug` for at least:
   `imu_second_home_band`, `italy_avg_price_sqm`, `milan_avg_price_sqm`, `closing_cost_stack_non_resident`,
   `cedolare_secca_rates`, `registration_tax_bands`. It currently contains **zero numeric values**.
2. Set the canonical IMU band on `guides/imu-property-tax-italy` (owner slug), then reconcile the 25
   highest-traffic pages that state a conflicting band.

**Batch 3a (25 slugs) — IMU / tax / cost pages, lead pages first:**
`imu-property-tax-italy`, `italy-property-management-costs` *(Tier A — self-contradicts on one screen)*,
`italy-property-closing-costs-breakdown` *(Tier C)*, `italy-capital-gains-tax-property` *(Tier A)*,
`italy-property-taxes-foreign-buyers-guide`, `buy-property-italy-foreigner`,
`can-foreigners-buy-property-italy`, `gross-vs-net-yield-italy`, `italy-rental-yield-guide`,
`cost-of-buying-property-italy`, `hidden-costs-buying-property-italy`, `italy-registration-tax-property`,
`italy-prima-casa-vs-second-home-tax`, `cadastral-value-vs-market-price-italy`,
`italy-ivie-ivafe-foreign-property-owners`, `italy-retirement-property-guide`,
`airbnb-investment-italy-guide`, `basilicata-property-investment-guide`,
`italy-property-for-irish-buyers`, `vineyard-property-investment-italy-guide`,
`italy-inheritance-law-property-foreigners`, `compare/cedolare-secca-vs-irpef-italy-rental`,
`compare/italy-vs-spain-property-investment`, `compare/italy-vs-malta-property-investment`,
`compare/italy-vs-croatia-property-investment`.

**Rule for the wave:** supporting pages get **one sentence + a link to the owner slug**, never a copy of
the table (this is already the stated `market-stats.json` policy, currently unenforced).

---

## Wave 4 — Within-file duplicate paragraphs (88 files, 3 batches)

Delete redundant instances **by hand**; re-read every file after editing (a regex delete is what produced
the site-wide P0-2 scar).

**4a — worst 25** (max repeats ×16 → ×7):
`liguria-property-investment-guide`, `best-cities-italy-rental-yield-2026`, `italy-property-investment-guide`,
`vineyard-property-investment-italy-guide`, `italy-residency-by-investment-guide`,
`italy-property-taxes-foreign-buyers-guide`, `digital-nomad-italy-property-guide`, `areas/lucca`,
`italy-property-for-scandinavian-buyers`, `italy-property-for-australians`,
`italy-inheritance-law-property-foreigners`, `italy-1-euro-homes-program`,
`agriturismo-investment-italy-guide`, `basilicata-property-investment-guide`,
`italy-property-for-israeli-buyers`, `italy-ivie-ivafe-foreign-property-owners`,
`piedmont-property-investment-guide`, `how-to-buy-italy-property-step-by-step`,
`imu-property-tax-italy`, `italy-flat-tax-regime-new-residents`, `notaio-italy-property-role`,
`hidden-costs-buying-property-italy`, `buy-property-italy-foreigner`, `areas/siena`, `areas/milan-navigli`.

**4b — next 25** · **4c — remaining 38** (mostly `areas/*` and `developers/*`, ×2–×5).

Note `guides/best-cities-italy-rental-yield-2026` and `guides/italy-1-euro-homes-program` also carry the
**P0-4 broken tables** — fix those in 4a, not separately.

---

## Wave 5 — Template openers and Quick-answer echo (47 files, 2 batches)

Rewrite the **134** `{H2 heading} means …` openers as genuine 40–60-word answers with a number, per
`geo-aeo-writing-gates.md`. Remove the **816** within-page near-duplicate pairs, starting with the
`**Quick answer:**` paragraph restated verbatim as the paragraph below it.

**5a — 25 slugs, worst first:** `areas/lucca` (×11), `guides/florence-property-investment-guide` (×11),
`guides/italy-investor-visa-requirements-2026` (×11), `guides/venice-property-investment-guide` (×11),
`guides/how-to-buy-italy-property-step-by-step` (×9), `guides/italy-property-taxes-foreign-buyers-guide` (×9),
`guides/italy-residency-by-investment-guide` (×9), `areas/chieti` (×5),
`guides/hidden-costs-buying-property-italy` (×5), `areas/ostuni` (×4), `areas/sanremo` (×4),
`areas/siena` (×4), `guides/italy-registration-tax-property` (×4), `areas/arezzo`, `areas/langhe`,
`areas/milan-navigli`, `areas/palermo`, `areas/potenza`, `areas/valle-d-itria`, `areas/versilia`,
`compare/cedolare-secca-vs-irpef-italy-rental`, `compare/flat-tax-vs-investor-visa-italy`,
`areas/assisi`, `areas/bologna`, `areas/monte-argentario`.

**5c — P1-7, raw slug text in visible prose: 240 occurrences / 52 files.** A template slotted the
lowercase URL slug into body sentences — *"Bolzano city apartments for **italy property for dutch buyers
buyers** trade roughly €3,800-5,500/m²"*, *"**Red flag:** On **emilia romagna property investment guide**
tickets…"*, *"Use this **vineyard property investment italy guide** buyer checklist…"*. Worst:
`emilia-romagna-property-investment-guide` (14), `italy-property-for-germans` (12),
`italy-property-for-dutch-buyers` (11), `italy-property-for-irish-buyers` (11),
`italy-property-for-french-buyers` (10), `italy-property-for-scandinavian-buyers` (10). Rewrite each
sentence to use the natural noun phrase, never the slug.

**5b — remaining 22 files**, plus the Quick-answer echo on
`is-italy-property-good-investment-2026`, `best-regions-invest-italy-property-2026`,
`airbnb-investment-italy-guide`, `mistakes-foreign-buyers-italy`, `italy-vs-spain-property-investment`,
`italy-rental-yield-guide`.

---

## Wave 6 — Links, orphans, cannibalization (≤25 slugs)

1. **4 broken links** (P1-5): 3 wrong-collection href fixes + `/areas/positano/` which has no target.
2. **Orphans — 24 → 13** after Wave 1 shipped `<RelatedGuides>`. Remaining zero-inbound pages:
   `italy-property-management-costs` (Tier A), `italy-property-market-forecast-2026-2027`,
   `italy-residency-by-investment-guide`, `italy-retirement-property-guide`, `mistakes-foreign-buyers-italy`,
   `vineyard-property-investment-italy-guide`, `bologna-property-investment-guide`,
   `compare/italy-vs-malta-property-investment`, `compare/venice-vs-milan-property-investment`,
   `developers/engel-volkers-italy`, and all 3 `news/*`.
   Fix by adding `relatedSlugs` entries on the pages that *should* point at them, plus in-body links from
   the matching hub. Verify with `npm run check-links -- --orphans`.
3. **Cannibalization** (P1-6) — **no noindex**:
   - `can-foreigners-buy-property-italy` → trim to eligibility scope; hand reciprocity to
     `italy-reciprocity-property-foreigners` (Tier A), tax to `italy-property-taxes-foreign-buyers-guide`,
     STR/exit to their owners. Rename the competing H2s.
   - `how-to-buy-italy-property-step-by-step` → keep the process spine; reduce "total costs", "regions",
     "mortgages" to one sentence + link each.
   - `buy-property-italy-foreigner` stays canonical per `legal-core.json`.
4. `guides/molise-property-investment-guide` — run `fix:markdown-glue` (only remaining `--dry` failure).

**Gate:** `npm run check-links` (built in Wave 0) must exit 0.

---

## Wave 7 — Cross-page near-duplicates (131 files, 3 batches)

3,282 near-duplicate pairs. Apply the `market-stats.json` owner-slug rule: one page owns the paragraph,
the rest get one sentence + link.

**7a — 25 slugs, highest pair counts:** `italy-property-investment-guide` (677),
`liguria-property-investment-guide` (593), `italy-property-market-forecast-2026-2027` (459),
`italy-flat-tax-regime-new-residents` (332), `florence-property-investment-guide` (290),
`italy-investor-visa-requirements-2026` (286), `venice-property-investment-guide` (286),
`italy-property-for-irish-buyers` (238), `vineyard-property-investment-italy-guide` (219),
`italy-inheritance-law-property-foreigners` (201), `italy-registration-tax-property` (133),
`basilicata-property-investment-guide` (130), + the 13 `developers/*` pages sharing the
"{Developer} buyers should match ticket size…" paragraph.

**7b** — nationality cluster (`italy-property-for-*`: americans / australians / canadians / germans /
dutch / scandinavian / french / swiss / israeli / uk), which share paragraphs at j=0.88–0.95 with only
the nationality swapped.
**7c** — `areas/*` and `compare/*` remainder.

Also here: **P2-6** stacked duplicate tables (40 sections / 26 files) and **P2-4/5** currency + unit style.

---

## Wave 8 — Thin content and noindex decisions (37 files, 2 batches)

Only after Waves 3–7, because de-duplication changes word counts and several "thin" pages are thin
*because* their unique content was buried under repeated boilerplate.

**8a** — projects (22 under 1,500 words) + developers (5): expand with project-specific facts, or
consolidate sibling projects into the parent area guide.
**8b** — news (4, all under 800 words), areas (3), compare (2). Decide expand / consolidate / noindex
**per slug with written rationale in the PR body** — no bulk noindex.

Only at the end of 8b should any `noindex: true` be set, and only for pages that consolidation could not
save.

---

## Not in scope until the audit is signed off

- New MDX slugs / topic discovery (Phase 1 — after «ок» on this roadmap)
- `geo-fix-corpus-all.mjs` or any bulk GEO pass over the full corpus
- Mass regex edits — explicitly the cause of the P0-2 and P2-8 scars
- Deploy / indexing (Cursor + «выложи» only)

## Next approval

**Wave 2 — hero images off Wikimedia.** 111 pages, frontmatter only, no body edits. It is the largest
remaining Core Web Vitals win and the only wave that fixes *visually broken* pages (Wikimedia is returning
429 on hotlinked heroes today).

After that, **Wave 3** (fact registry + IMU) is the highest-value content wave: five contradictory IMU
bands is the single biggest AEO/GEO liability in the corpus, and `market-stats.json` still holds no
numeric values at all.

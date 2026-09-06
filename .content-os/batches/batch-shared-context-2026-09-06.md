# Batch shared context — 2026-09-06

**Wave:** A, batch 1a. Visa cluster repositioning.
**Branch:** `cc/italy-visa-20260906`
**Evidence:** `.content-os/reports/SEO-DEMAND-AUDIT-2026-09-06.md` (full demand study, 10 Semrush databases, 112 SERP snapshots, 6 competitors)

## Why these two files

Wave A is the reference-demand cluster: 53,870 impressions a month across visa, relocation, one-euro homes, process and market news, and it is the only large cluster where no portal holds a top-10 position. Portals own the commercial listings; content sites own this.

Inside it, `italy-investor-visa-property` already collects 283 impressions across ~30 queries in Search Console, at positions 49 to 90. It holds the cluster; it just holds it badly.

## What was changed, and what was not

| Slug | GEO before | GEO after | Change |
|---|---:|---:|---|
| `guides/italy-investor-visa-property` | 31 | **36** | H1 dropped "Property Guide"; one H2 dropped "property"; new H2 comparing Italy with Portugal, Spain, Greece and Malta on whether property qualifies; opener rewritten to answer rather than restate its heading; self-reference removed from relatedSlugs |
| `guides/italy-elective-residence-visa-property` | 22 | **42** | H1 reframed to the income/documents/refusals intent the SERP rewards; three section openers rewritten from defining their own title to answering it |

Not changed, and why: the €31,160 income figure, the €250k/€500k/€1M/€2M investor tiers and the "Italy has no property golden visa" wording all come from `legal-core.json` and `facts.json` and were already correct. This batch changed framing and openers, not facts.

## Fact registry

`.content-os/facts.json` gained one entry: **0.86%**, the statutory IMU base rate on non-primary residences, sourced to L. 160/2019 art. 1 c. 754 (Gazzetta Ufficiale 19G00165). The 1.06% comune ceiling from the same rule was already registered; the base rate had been missed. This lifts every article that cites it, roughly 104 files, by 4 GEO points.

No other figure was registered. "15%" appears in 131 articles, "5%" in 122, "20%" in 93, each meaning something different in each context. Those are not one fact and must not be registered as one.

## Pulled from this batch

`digital-nomad-italy-property-guide` and `italy-retirement-property-guide` were reframed and then reverted. Both sit on the hard `template-corpus` gate: 8.4% and 6.7% of their sentence shapes recur in three or more other articles, against a threshold near 0.6%. Clearing that means rewriting the shared tables and structures, not editing a title. Scheduled as its own batch with that work scoped.

## Corpus finding that came out of this batch

`validate:batch` only measures files you touch, so the corpus-wide picture had never been taken. Running it across all 272 files: **154 are below the GEO floor of 34, and 57 sit on a hard template gate.** By collection: projects 54/65, developers 12/15, guides 53/110, compare 14/30, areas 19/48, news 2/4.

Consequence for the roadmap: any wave that touches one of those 154 files must pay down its template debt in the same PR. "Retitle 72 pages" is not a retitle job. This needs a decision from Maxim before wave B is scoped.

## Deferred to batch 1b

`guides/cost-of-living-italy` (4,590/mo) and `guides/moving-to-italy-from-usa` (3,300/mo). Both are new slugs and both need a unique hero image; `CLOUDINARY_*` is not present in the local environment, so the hero pipeline has to run in the cloud environment or through Cursor.

## Gates

```
fix:markdown-glue --dry   0 files
validate:content:changed  PASS 2/2
validate:batch --changed  PASS, GEO 36 and 42, both above the floor of 34
check-links:changed       PASS, no broken internal links
check-heroes              PASS, 272 pages, every page has its own hero
```

---

# Batch 1b — living and relocation cluster

**Branch:** `cc/italy-living-20260906`, stacked on `cc/italy-visa-20260906`.

Two new guides, both in SERPs where no property portal holds a top-10 position:

| Slug | Demand | GEO | Words | Who holds the SERP today |
|---|---:|---:|---:|---|
| `guides/cost-of-living-italy` | 4,590/mo | **56/75 (A)** | 3,262 | numbeo, internationalliving, westernunion, reddit, internations |
| `guides/moving-to-italy-from-usa` | 3,300/mo | **59/75 (A)** | 2,939 | reddit, italiancitizenshipassistance, taxesforexpats, usembassy |

Both score above every file touched in 1a, and above the corpus median. SERP briefs written to `more-group-content-os/content-engine/serp-briefs/italian-estate-website/`.

## The angle neither SERP covers

Cost of living: every competitor prices renting. None prices owning, and none connects the monthly budget to the €31,160 Elective Residence income floor, which is the number that decides whether a US or UK reader may legally stay at all.

Moving from the USA: taxesforexpats owns the tax angle and the consulates own the procedure. Nobody sequences the housing decision against the visa, and the requirement for a documented Italian address *before* the consular interview is the step that catches people.

## Temporary hero images

Both pages borrow an existing area asset (`areas/turin/inline_1` and `areas/langhe/inline_1`), approved by Maxim as temporary. They are real, relevant, loading images rather than a canonical path that would 404 until upload.

`check-heroes` reports exactly two problems as a result, both of them these, and nothing else. Replace with purpose-made heroes at `more-group/italy/guides/{slug}/hero` in the next PR once the Cloudinary pipeline runs, and the gate returns to green with no other change.

## Inbound links

Both new pages were orphans on creation. Links were added from `italy-elective-residence-visa-property` and `italy-investor-visa-property`, and both slugs added to their relatedSlugs.

## Gates

```
validate:content:changed  PASS 4/4
validate:batch --changed  PASS, GEO 56, 59, 42, 36, floor 34
check-links:changed       PASS, no broken internal links
qa:corpus                 new files clean (exit 1 is pre-existing legacy debt elsewhere)
npm run build             274 pages, 0 errors, 0 P0, 0 P1
check-heroes              2 known temporary borrows, documented above
em dashes                 0 in both new files
```

---

# Batch 1c — one-euro houses, best places to live, citizenship by descent

**Branch:** `cc/italy-euro-20260906`, stacked on `cc/italy-living-20260906`.

| Slug | Demand | GEO | Words | Action |
|---|---:|---:|---:|---|
| `guides/italy-1-euro-homes-program` | 6,590/mo | **0 → 40** | 4,327 | repaired and retitled |
| `guides/best-places-to-live-italy` | 1,320/mo | **62/75 (A)** | 2,563 | new |
| `guides/italy-citizenship-by-descent` | 1,290/mo | **57/75 (A)** | 2,543 | new |

## The one-euro page was worse than a gate failure

It sat on the hard `echo-openers` gate, but the reason mattered more than the score. Four section openers restated their own heading, one entire paragraph was duplicated verbatim between two sections, and the file carried fabricated statistics with fake precision:

- "Track 68% of foreign files using geometra surveys before auction deposits"
- "Reports 76% bond refund success when engineers signed milestone reports on schedule"
- "Route 89% of non-EU buyers through avvocato review"
- "Approves fewer than 12% of enquiry files"
- "Median 47 days from award to rogito ... rejected at 22% rate in competitive Sicilian cohorts"
- "Foreign buyers who used local project managers cleared first structural inspection 2.3 months faster than remote-only owners in the same comune cohorts"

None of these has a source and none could have. They were sentence fragments beginning with a verb, which is what machine-generated filler looks like when it is asked for authority it does not have. All removed. The title was also broken English ("Italy 1 Euro Homes Program: 2026 Complete for Buyers") and is now "1 Euro Houses in Italy 2026: Towns, Bonds, Real Costs", which matches the query.

**This is worth checking for elsewhere in the corpus.** The same fragment pattern (`^(Track|Reports|Route|Approves) \d+%`) may exist in other files that nobody has touched since they were generated.

## Citizenship by descent: verified, not remembered

This is a legal-status topic that changed inside 18 months, so it was checked against two independent sources on 6 September 2026 rather than written from memory. The check changed the article: the Constitutional Court **dismissed** the challenges on 12 March 2026 and upheld the restrictions, where a great deal of published guidance still assumes they might fall.

Four claims registered in `.content-os/external-claims.json`: the Law 74/2025 generation limit, the Constitutional Court ruling and date, the two-year naturalisation track for excluded descendants, and the minor-child deadlines. The page carries an explicit instruction to confirm with the competent consulate.

## Gates

```
validate:content:changed  PASS 5/5
validate:batch --changed  PASS — 62, 59, 57, 56, 42, 40, 36 against a floor of 34
check-links:changed       PASS, no broken internal links
qa:corpus                 all five clean
em dashes                 0
```

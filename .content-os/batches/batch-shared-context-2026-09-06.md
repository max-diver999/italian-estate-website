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

---

# Batch 1d — factual corrections

**Branch:** `cc/italy-facts-20260906`, stacked on `cc/italy-euro-20260906`.

Not a content wave. A correction wave, triggered by what the 1 euro repair turned up.

## The national foreign-buyer share was wrong on four pages

Verified externally on 6 September 2026: foreign citizens bought about **39,000** Italian homes in 2025, **5.1%** of 766,756 normalised residential transactions (Gate-away data cross-referenced with OMI totals). The arithmetic is internally consistent.

The site said **15.2%** on four pages, three times the real figure, including two core decision pages. One page said 5.1% and was right. Nobody had noticed the site contradicting itself.

| File | Was | Now | Status |
|---|---|---|---|
| `guides/is-italy-property-good-investment-2026` | 15.2% in 7 places, plus "average tickets near €632,000" | 5.1%, ticket claim removed | fixed, GEO 34 |
| `guides/costa-smeralda-property-investment-guide` | "15.2% Italy-wide on Nomisma 2026 aggregates" | 5.1% attributed to OMI and Gate-away | fixed, GEO 34 |
| `compare/italy-vs-portugal-property-investment` | 5.1%, correct but unsourced | 5.1% with the source and the underlying counts | fixed, GEO 37 |
| `guides/cost-of-buying-property-italy` | "roughly 15.2% of purchases at average tickets near €632,000" | **unfixed** | blocked, GEO 10 |
| `guides/sardinia-property-investment-guide` | "15.2% Italy national average", three places | **unfixed** | blocked, GEO 22 |

The €632,000 average ticket is also wrong on its face: our own news page puts foreign turnover at €5.5bn, which across 39,000 homes is nearer €141,000. Removed where it could be removed.

`5.1%` is now registered in `.content-os/facts.json` with its source.

## Invented enquiry shares removed

- `buy-property-italy-under-500000`: "data shows mid-tier enquiries at 58% of foreign search volume" — no data exists
- `puglia-property-investment-guide`: "USA buyers maintaining 25% share of foreign enquiries"
- `italy-investor-visa-requirements-2026`: table row "€250,000 startup tier share: 41% of enquiries"
- `costa-smeralda`: German 30-34%, Swiss 16-20%, Italian 22-28%, UK/Nordic 15-18%, Gallura 35-42%, German/Swiss 46-54%

Qualitative claims kept where they are well attested (German and Swiss dominance of Costa Smeralda since the 1960s). Only the invented precision was removed.

## What the site cannot support

There is no enquiry dataset. Search Console shows 73 clicks in 90 days. A statement that "US buyers are 25% of enquiries in Ostuni" cannot come from anywhere.

## Still carrying invented enquiry shares, blocked by GEO debt

25 claims across 14 files, all below the GEO floor, so a correction-only edit cannot pass the gate: ostuni, polignano-a-mare, sorrento, taormina, valle-d-itria, sardinia, sicily, marche, italy-property-investment-guide, italy-real-estate-market-data-2025, best-regions-invest-italy-property-2026, italy-vs-malta, puglia-vs-tuscany, gate-away-international-buyers-report-2025, cost-of-buying-property-italy.

**This is a gate design question for Maxim.** GEO is an absolute floor rather than a ratchet, so the gate blocks a PR that only removes a false statement from an already-failing file. Removing a falsehood cannot make a file worse. Either those corrections ride along with the debt wave, or the gate needs a documented exception for correction-only changes.

---

# Wave C — the /property-for-sale/ route tree

**Branch:** `cc/italy-routes-20260906`. Code, not MDX.

## Bug found first, and it blocked everything

`ProjectCard`, `homeProjects.ts`, the homepage and `/projects/` all read `priceFromUsd`. That field exists in **zero** of 65 project cards; all 51 priced cards carry `priceFromEUR`. **No price was rendering anywhere on the site**, silently, including the homepage.

The SERP formula every winning competitor uses is a count plus a from-price, so this had to be fixed before any listing page could exist. Added `formatEur` and repointed all five call sites. `/projects/` now reads "65 projects, from €130K" and 51 cards show a price.

## What was built

`/property-for-sale/` plus **16 facet pages**, generated from project frontmatter rather than hand-written:

| Kind | Pages | Examples |
|---|---|---|
| region | 9 | tuscany 10, puglia 9, lombardy 12, sicily 4, lazio 4, liguria 4, campania 3, lake-como 3, sardinia 2 |
| type | 4 | apartments 38, villas 13, farmhouses 8, new-developments 5 |
| town | 3 | milan 12, ostuni 6, rome 4 |

Addressable demand across the tree: roughly **95,000 impressions a month**, against 27,700 for everything in waves A and B combined.

Titles carry the formula: "Property for Sale in Tuscany, Italy: 10 Homes from €130K", "Villas for Sale in Italy: 13 from €350K", "Farmhouses for Sale in Italy: 8 from €130K".

## Honesty rules built into the generator

- A facet is generated only at `MIN_ITEMS = 3` or above. No page promises inventory that does not exist.
- One documented exception, `THIN_BUT_WANTED`: Sardinia, 4,550 impressions a month against 2 listings. Its title says "2 Homes from €600K" and its note says the stock is off-market. The count stays true.
- Every facet note is hand-written, never generated.

## The merge, done properly

The eight `/invest-{geo}-property/` landings sat on the pattern the demand study measured at zero. They were not simply deleted: their **42 hand-written FAQ answers were carried across** into the seven facets that inherit them, plus six more for Sardinia, and now render with FAQPage schema. Then 301s in `vercel.json` and the pages removed. All internal links repointed across 7 files.

## check-links was blind to the new routes

`scripts/check-links.mjs` skips dynamic routes on the assumption they are all collection-backed. `/property-for-sale/[...slug]` is facet-backed, so its 16 routes were invisible and links to them reported as broken.

Fixed at the root rather than with an allowlist: the facet maps moved to `src/data/property-facet-maps.mjs`, plain ESM with no Astro imports, and both `propertyFacets.ts` and `check-links.mjs` now read the same source. Routes known went from 300 to 313.

## Gates

```
npm run build          276 pages, 0 errors, 0 P0, 0 P1
check-links            PASS, 313 routes known, no broken links
validate:content       PASS 276/276
check-heroes           3 known temporary borrows from wave A, unchanged
```

---

# Wave D — depth on the facets, and connecting the tree

**Branch:** `cc/italy-routes-20260906`, continues wave C.

## The boundary I could not cross

Wave D was scoped as "fill the facets". Eight of sixteen hold three or four properties. **Filling them needs real listings, which is a sourcing function, not a writing one.** Inventing listings is exactly what batch 1d spent a PR removing, so the facets were deepened rather than padded.

## What was added

Each facet page now carries a price table generated from the catalogue, and a hand-written market section.

| | Before | After |
|---|---:|---:|
| tuscany | 978 words | **1,262** |
| villas | 857 | **1,111** |
| apartments | ~900 | **2,041** |
| sicily | 758 | **967** |
| lake-como | 738 | **946** |

The price table is derived, not written: lowest, median and highest asking price across the priced listings, plus a sub-area breakdown where more than one area is represented. It states plainly that this is our catalogue rather than a regional index, because it is a sample of fourteen to thirty-eight properties, not a market.

`src/data/facet-copy.ts` carries the written part: what the market actually is, who it suits and who it does not, and three or four checks **specific to that market** rather than the generic four. Puglia gets pool permits and agricultural land ties; Sicily gets abusi edilizi and the demanio marittimo boundary; Lake Como gets mooring rights and whether first-line means anything in the deed. New developments correctly renders no price table, because none of those five listings carries a price.

## Connecting the tree

The `/areas/` collection holds 2,300 to 4,500 words per town and had no link to the commercial page for the same place. Fifteen area pages now link to their facet.

**Fifteen different sentences, not one sentence fifteen times.** An identical link line across fifteen files is precisely the `template-family` debt this session has spent four PRs removing, and the gate would have caught it. Scores held: como 68, arezzo 67, genoa 67, and the two at the floor stayed at 34.

Seven area pages are blocked by their own GEO debt and carry no link yet: taormina 31, monte-argentario 25, lucca 23, ostuni 21, valle-d-itria 21, siena 16, sorrento 0.

## Gates

```
npm run build            276 pages, 0 errors, 0 P0, 0 P1
check-links              PASS, no broken internal links
validate:content:changed PASS 15/15
validate:batch --changed PASS, no score regressed
qa:corpus                7 pre-existing issues on these files, unchanged (verified against stash)
```

---

# Wave E — template debt, first pass

**Branch:** `cc/italy-debt-20260906`.

## The size of it, measured properly

`batch-writing-gate --all`: **138 files of 276 below the GEO floor of 34.** Hard gates: template-corpus 47, mass-duplication 5, echo-openers 5, malformed-output 4, self-repetition 3.

Where the corpus loses points: `stamped-figure` **-3,912** total, `template-family` **-3,305**, `duplicated-text` -1,203. But template-family is the *top* penalty for **116 of the 138**, so it is the blocker even though stamped-figure costs more in aggregate.

## What is cheap and what is not

Debt splits cleanly:

- **Within-file** (`echo-openers`, `self-repetition`, `heading-echo`, `definition-frame`, `hedging`, `implausible-precision`): fixable in an hour per file. **17 files** in guides/areas/news.
- **Corpus-shared** (`template-family`, `template-corpus`, `duplicated-text`): needs coordinated rewriting. **51 files**.
- Excluded from scope: 13 `/compare/` files slated for closure and 45 `/projects/` cards that are now inventory under the facets rather than ranking targets. Fixing either is waste.

`stamped-figure` is not a cheap lever. The saturated figures are 15% (130 articles), 12% (130), 5% (122), 25% (101), €400,000 (92). Each means something different in each article. Registering them would be false and the registry's own anti-templating guard would reject it.

## Fixed this pass

| File | GEO | What it actually was |
|---|---|---|
| `hidden-costs-buying-property-italy` | **0 → 36** | Nine of twelve sections opened by restating their heading plus one of two generator templates, carrying "45.9 percent of domestic buyers use mutuo financing near 3.35 percent average rates" five times, unsourced, alongside broken grammar ("Show foreign purchasers should"). All nine rewritten to answer their heading. |
| `italy-property-taxes-foreign-buyers-guide` | **0 → 36** | Same generator, same two templates, seven sections. Rewritten. |
| `how-to-calculate-rental-yield-italy` | **0 → 25** | 29 percentages quoted to two decimals, and worked-example outputs presented as "typical net rental yields across Italian regions". Reframed as arithmetic on six named properties; precision rounded to one decimal. |
| `cost-of-buying-property-italy` | **10 → 31** | Carried the wrong 15.2% national foreign-buyer share that batch 1d could not reach. Now 5.1%. 50 hedge words removed; the prose is stronger without them. |
| `italy-residency-by-investment-guide` | deleted | Already 301'd in vercel.json, so unreachable, but still in the corpus dragging template-family for everyone else. |

**The generator template is now gone from the corpus entirely.** Grep for "refers to Italian civil-law milestones", "is the compliance layer where notary" or "45.9 percent of domestic buyers" returns zero files.

## Two script bugs fixed at the root

`qa-audit.mjs` and `batch-writing-gate.mjs` take changed files from `git diff --name-only HEAD`, which includes deletions, then read them and crash. Any batch containing a deletion broke the validator. Both now skip files that are no longer on disk.

## Two files still below the floor, and why

`cost-of-buying-property-italy` at 31 and `how-to-calculate-rental-yield-italy` at 25. Both improved by 21 and 25 points. The residual is `stamped-figure` on figures that are load-bearing in these articles: "10% to 15% closing costs" is the first article's whole thesis, "2% versus 9% registration tax" is a statutory rule. Removing them would damage the pages.

The scorer's own comment names this case: *"The article is charged for its neighbours' arithmetic... the fix is a registry entry rather than a rewrite."*

**That registry entry is prepared and waiting for a decision.** `market-stats.json` holds `closing_cost_stack_non_resident` at `owner_decision`, and two further entries at `needs_owner_decision` that document worse problems than the one batch 1d found:

- `milan_avg_price_sqm`: "The corpus asserts €5,653 (42 pages), €5,750 (10), €5,800, €5,350 and €5,200." **Five values for one number across sixty pages.**
- `italy_avg_price_sqm`: "€2,188 (12 pages) and €1,891 (10 pages) as the same national average, neither carrying a source or a date."

Approving these would lift files across the whole corpus and settle a factual contradiction that is live on the site today. It is Maxim's call, not a writing task.

## Realistic estimate for the rest

Thirteen more within-file files at roughly an hour each. The 51 corpus-shared files are days rather than hours, and their yield is lower, because most are `/areas/` and `/guides/` pages already ranking on the demand they hold.

## Gates

```
npm run build            0 errors, 0 P0, 0 P1
check-links              PASS
validate:content:changed PASS
validate:batch --changed 2 files below the absolute floor, both improved sharply, both documented above
```

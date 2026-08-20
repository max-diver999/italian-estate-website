# AUDIT REPORT — italian-estate.com

**Date:** 2026-08-20
**Baseline:** `main` after `bcaf8e7` (GEO batches 1–10) + `4360b18` (dedupe + GEO phases 2–5)
**Corpus:** 252 MDX (guides 90 · projects 65 · areas 48 · compare 30 · developers 15 · news 4)
**Phase:** 0 — audit only. **No MDX was modified.**
**Author:** Claude Code (cloud), branch `claude/italian-estate-content-audit-8zgre9`

---

## 0. How this audit was run (and why it found things the previous ones did not)

Previous audits scored **`src/content/**` only**, using the repo's own detectors. This audit did three
things those runs did not:

1. **Built an independent detector set** instead of trusting `audit-p0-quality.mjs` / `qa-corpus-signals.mjs`.
   Both repo gates have structural blind spots (§1) — they report "PASS" on defects that are plainly
   visible on the live site.
2. **Audited the rendered HTML, not just the source.** The site was built (`npx astro build`, 278 pages)
   and every `index.html` was parsed. Several of the worst defects only exist *after* rendering — they are
   invisible to any source-only audit.
3. **Audited the template layer** (`src/layouts`, `src/components`, `src/pages`, `src/data`), which no
   previous content audit touched at all. **The single most widespread defect in this report lives there.**

Every finding below was verified against a rendered artefact or a quoted source line. Counts are from
this run, not copied from `docs/CONTENT_QUALITY_AUDIT.md`.

### Verdict

The GEO refresh raised the *scores* the repo measures (`geo:audit` avg 91/100, `qa:corpus` PASS,
`fix:markdown-glue --dry` 1 file). It did **not** clean the corpus. What it actually did was **stack a
templated GEO layer on top of the original prose** without removing what it duplicated, and it **never
touched the template layer at all**.

Concretely: **88 of 252 pages** carry paragraphs repeated verbatim inside themselves (up to **×16**);
**131 pages** share near-identical paragraphs with other pages; **all 252** article pages emit duplicate
FAQ structured data; **111 pages** hotlink hero images from a host that is currently rate-limiting us;
and **every page on the site** renders a punctuation defect left by an earlier em-dash strip.

None of this is visible to the existing gates.

---

## 1. Why the existing gates report PASS (fix these first — they are the reason this keeps happening)

| Gate | What it claims to check | What it actually checks | Consequence |
|---|---|---|---|
| `validate:content` + `validate:batch` | the two main pre-PR gates | **nothing — both crash on missing modules** (see P0-0) | no content gate has run at PR time at all |
| `audit-p0-quality.mjs` → `repeated-paragraph` | duplicate paragraphs | Only fires when one paragraph appears in **≥3 different files** (`uniqueIds.length >= 3`, line 408). **Never compares a file against itself.** | Reports **11**. Real count: **88 files**, 477 redundant paragraph instances. |
| `qa-corpus-signals.mjs` → "padding dupes" | duplicate padding | Counts occurrences of **4 hardcoded H2 strings** (`PADDING_H2`, line 22). Does not look at paragraph text at all. | Prints `✅ PASS — padding dupes OK` on a corpus with 477 duplicated paragraphs. |
| `audit-p0-quality.mjs` → hero check | bad hero images | `/unsplash/i` only (line 290). | 111 Wikimedia-hotlinked heroes pass silently. |
| All content gates | corpus health | Glob `src/content/**` only. | The template layer (`src/pages`, `src/layouts`, `src/components`, `src/data`) has **never been audited**. |
| `geo-citability-audit.mjs` | uniqueness | Scores per-`##` heuristics. | Gives `liguria-property-investment-guide` a passing grade with **16 identical paragraphs** in it. Its own `unique` rubric is the lowest at **81** — the signal was there, unread. |

**Recommendation:** every wave below is worthless as a durable fix unless these detectors are extended
first. Wave 0 exists for exactly this reason.

---

## 2. P0 — fix before anything else

### P0-0 · **Two of the three mandatory pre-PR gates crash — they have never run in this environment**

`CLAUDE.md`, `docs/WORKFLOW-GITHUB.md`, `.claude/rules/content.generated.md` and
`corpus-cleanup-mode.md` all mandate three commands before every PR. Run on a clean checkout of `main`
with the submodule at its pinned SHA `1b16ee8b`:

```
fix:markdown-glue --dry : OK (exit 0)
validate:content        : CRASH — Cannot find module '/home/user/scripts/lib/cloudinary-gate.mjs'
validate:batch          : CRASH — Cannot find module '/home/user/more-group-content-os/scripts/batch-writing-gate.mjs'
```

**Cause — two path bugs at the same level:**

- `scripts/lib/more-content-gate.mjs:13` imports `'../../../scripts/lib/cloudinary-gate.mjs'`, which
  resolves **two directories above the repo root**.
- `scripts/batch-writing-gate.mjs:10` resolves the canonical gate at
  `siteRoot/../more-group-content-os/scripts/batch-writing-gate.mjs` — a **sibling checkout**, not the
  submodule at `more-group-content-os/` that `.gitmodules` actually declares.

**Neither `cloudinary-gate.mjs` nor `batch-writing-gate.mjs` exists anywhere** — not in this repo, not in
`more-group-content-os` at the pinned SHA, not on its `main`. These are not environment problems; the
files are absent from both repositories.

**Consequence.** The only pre-PR check that has actually been executing is the markdown-glue dry run.
Every "gates green" claim on previous waves rested on one of three checks. This is the root cause behind
most of §1: nothing was measuring content quality at PR time at all.

**Fix.** Restore or reimplement both modules inside the site repo, and change the two imports to
repo-relative paths. Until then, treat `validate:content` / `validate:batch` as *not* a safety net.

---

### P0-1 · Every article page emits **two** conflicting `FAQPage` JSON-LD blocks — 252 pages

**Pattern.** `ArticleLayout.astro:72` builds a `FAQPage` schema from frontmatter `faq`.
`FaqBlock.astro:26` *also* emits its own `FAQPage` schema from its `items` prop. `noSchema` exists but is
**used nowhere in the repo**. All 252 pages have both a frontmatter `faq` and an inline `<FaqBlock>`.

**Proof (rendered HTML, not source):**

```
$ grep -o '"@type":"FAQPage"' dist/client/guides/italy-property-management-costs/index.html | wc -l
2
$ # across the build:
pages with 2+ FAQPage: 252 of 258 article pages
```

**Worse — on 42 pages the two blocks disagree**, so the JSON-LD advertises questions that are not
visible on the page. That is a direct Google structured-data policy breach ("content must be visible to
the user"), which risks losing FAQ rich results across the whole site. Seven pages have **zero** overlap:

| Slug | Q in JSON-LD | Q visible | Shared |
|---|---:|---:|---:|
| `developers/coima` | 6 | 6 | **0** |
| `guides/can-foreigners-buy-property-italy` | 10 | 6 | **0** |
| `guides/codice-fiscale-italy-property` | 5 | 6 | **0** |
| `guides/italy-property-scams-avoid` | 5 | 5 | **0** |
| `guides/notaio-italy-property-role` | 5 | 6 | **0** |
| `projects/monte-argentario-sea-view` | 6 | 4 | **0** |
| `projects/scalea-calabria-coastal` | 6 | 4 | **0** |

Example, `developers/coima` — JSON-LD asks *"Are Coima projects Class A and ESG certified?"*; the page
shows *"Can foreigners buy Coima Olympic Village units?"*. Neither list contains the other's questions.

**Fix (1 sentence).** Pass `noSchema` to every inline `<FaqBlock>` so only the layout emits `FAQPage`,
then reconcile the 42 divergent pages so frontmatter `faq` and the visible block are the same list.
*This is a 2-line template change plus 42 content reconciliations — it fixes 252 pages.*

---

### P0-2 · A stray `,` from an old em-dash strip renders on **every page of the site**

**Pattern.** An earlier cleanup replaced `—` with `,` **without removing the leading space**. The MDX
corpus was cleaned (1 hit left). `src/` was never touched: **90 occurrences across 32 template files.**

**Proof — verbatim, currently live:**

`src/layouts/ArticleLayout.astro:167` (renders in the disclaimer of all **252** article pages):
> "Prices, yields, and visa rules change **,** verify before any transaction."

`src/components/Footer.astro:29` (renders on **every page, 278**):
> "© 2026 Italian Estate. Independent research **,** not financial or legal advice."

`src/data/site.ts:6` (the site-wide **meta description**, i.e. this is in the SERP snippet):
> "Independent Italy property research **,** 4.3% yields, codice fiscale, investor visa…"

**21 rendered pages ship a meta description containing this scar**, including `/`, `/about`, `/areas`,
`/guides`, `/developers`, and all eight `invest-*-property` landing pages.

**Fix.** Replace ` , ` with an em-dash or restructure the sentence across the 32 files in `src/`
(never with a blind regex — review each of the 90 sites).

---

### P0-3 · Wrong-country copy in the meta descriptions of top-level hub pages

**Pattern.** Template-repo leftovers (this codebase still ships `upload-mexico-cloudinary.py`). Never
caught because no audit read `src/pages`.

**Proof — rendered `<meta name="description">`:**

| URL | Live meta description |
|---|---|
| `/guides` | "Independent guides on **Mexico real estate**, fideicomiso, foreign ownership…" |
| `/areas` | "Area guides for **Riviera Maya, Los Cabos, and Puerto Vallarta**, yields, buyer profile…" |
| `/projects` | "Independent project reviews for foreign buyers, **Riviera Maya, Los Cabos, and Puerto Vallarta** developments…" |
| `/methodology` | "How Italian Estate researches **UAE property data**, sources, limitations…" |

`/guides` and `/areas` are the two highest-authority hub URLs on the site. `fideicomiso` is a Mexican
trust instrument with no meaning in Italian law.

**Fix.** Rewrite the four descriptions (and the visible body copy in `projects/index.astro:23`, which
also names Mexican regions) to Italian market terms.

---

### P0-4 · Two guides render a markdown table as literal pipe characters

**Pattern.** A table placed directly after a **bullet list item** with no blank line becomes a lazy
continuation of that list item, so remark never parses it. Confirmed against the built HTML — this is
what a visitor sees today.

**Proof — visible page text on `/guides/best-cities-italy-rental-yield-2026`:**
> "…Rankings shift when infrastructure opens or STR caps tighten in Florence and Rome. | Investor
> priority | Primary cities | Secondary cities | Avoid for this mandate | |-------------------|---------------|…"

**Proof — visible page text on `/guides/italy-1-euro-homes-program`:**
> "…Track closed OMI-quartiere sales rather than city-wide portal averages when comparing regions.
> | Scenario | 1 euro auction house (80 m², heavy works) | … | |---|---|---| | Purchase price | €1 |…"

Source sites: `best-cities-italy-rental-yield-2026.mdx:229` and `italy-1-euro-homes-program.mdx:274`.
A further **7 tables in 7 files** are glued to a preceding paragraph; those currently still parse but are
one edit away from the same failure — list them as fragile, fix in the same pass.

**Fix.** Insert a blank line before each of the 9 table starts; add the check to `fix:markdown-glue`
(which does not currently detect it — it reported `glue: 0`).

---

### P0-5 · 111 hero images are hotlinked from Wikimedia, which is returning HTTP 429

**Pattern.** 111 of 252 pages set `heroImage` to `upload.wikimedia.org`. **42 of them point at the
full-resolution original** (no `/thumb/`, no width cap). `responsiveCloudinary()` only rewrites Cloudinary
URLs, so these get **no `srcset`, no `sizes`, no format conversion** — the raw original is the LCP element.

**Proof — HEAD requests from this session:**
```
466 KB  1280px-Costa_Smeralda.jpg
394 KB  1280px-Portofino_harbor.jpg
297 KB  1280px-Piazza_del_Campo,_Siena.jpg
HTTP 429 Too many requests  Ancona_porto.jpg        (retried after 12s — still 429)
HTTP 429 Too many requests  Perugia_view.jpg
HTTP 429 Too many requests  Bologna_SanPetronio_MeridianGiandomenicoCassini.jpg
HTTP 429 Too many requests  Assisi_Basilica_di_San_Francesco.jpg
… 8 of 14 sampled URLs 429'd
```

Wikimedia is actively rate-limiting hotlinks. **Users on those pages get a broken hero**; Googlebot sees
a failed LCP element. Sampled average weight of the ones that did resolve: **304 KB**, uncapped.
Secondary issue: CC BY-SA images are used with no attribution anywhere on the page.

Affected: projects 46 · guides 22 · areas 22 · compare 18 · developers 3.
Includes Tier A/C lead pages `costa-smeralda-property-investment-guide`,
`italy-property-renovation-costs-guide`, and Tier B `porto-cervo-villa-development`.

**Fix.** Run the existing Cloudinary pipeline (`npm run images:upload:*`) over the 63 distinct Wikimedia
URLs and repoint `heroImage`; this is the single largest Core Web Vitals win available.

---

### P0-6 · The corpus states **five mutually contradictory IMU rates**

**Pattern.** `market-stats.json` contains **no numeric values at all** — only `owner_slug` labels, and
**no IMU entry**. With no registry value, every batch invented its own band.

**Proof — bands asserted as *the* second-home IMU range:**

| Band asserted | Occurrences | Example slugs |
|---|---:|---|
| 0.4 % – 0.76 % | 42 | `basilicata-property-investment-guide`, `italy-property-for-irish-buyers` |
| 0.76 % – 1.06 % | 33 | `italy-vs-spain-property-investment`, `cedolare-secca-vs-irpef-italy-rental` |
| 0.86 % – 1.06 % | 26 | `italy-property-management-costs`, `gross-vs-net-yield-italy` |
| 0.4 % – 1.06 % | 22 | `buy-property-italy-foreigner`, `can-foreigners-buy-property-italy` |
| 0.46 % – 1.14 % | 7 | **`imu-property-tax-italy`** (the topical authority page) |

`guides/italy-property-management-costs` (Tier A) contradicts **itself on one screen**: the answer box
and FAQ say "0.86% to 1.06%", the cost table on the same page says "0.4% to 1.0%".

Same problem on other core numbers:

| Fact | Competing values on site |
|---|---|
| Italy national average €/m² | **€2,188** (12 pages) vs **€1,891** (10 pages) |
| Milan average €/m² | **€5,653** (42) vs **€5,750** (10) vs **€5,800** vs **€5,350** vs **€5,200** |
| Non-resident closing-cost stack | **10–12 %** (153) vs **10–15 %** (109) vs **10–14 %** (12) vs 10–13 % vs 10–11 % vs 9–11 % |

This is the **most damaging finding for AEO/GEO**. An answer engine that samples three pages of this site
for "IMU rate Italy" gets three different answers and stops treating the domain as citable. It is also
the reason GEO score can rise while AI citation does not.

**Fix.** Populate `market-stats.json` with real values + `as_of` + source per stat, then reconcile each
figure to the registry — starting with IMU, national/Milan €/m², and the closing-cost stack.

---

## 3. P1 — high impact, fix in waves

### P1-1 · 88 files repeat their own paragraphs verbatim, up to ×16 (machine audit says 11)

**477 redundant paragraph instances across 88 files.** The GEO pass appended the same "verification"
block under section after section instead of once per page.

**Proof — `guides/liguria-property-investment-guide`, this paragraph appears 16 times in one file:**
> "- MORE Group recommends independent avvocato and geometra review before compromesso deposits.
> - Model net cash flow after 21% or 26% cedolare secca, not gross portal yield bands alone.
> - Track three OMI-quartiere closed sales in the same micro-district…"

**Worst files:**

| Max repeats | Redundant instances | Slug |
|---:|---:|---|
| ×16 | 15 | `guides/liguria-property-investment-guide` |
| ×16 | 25 | `guides/best-cities-italy-rental-yield-2026` |
| ×14 | 13 | `guides/italy-property-investment-guide` |
| ×13 | 19 | `guides/vineyard-property-investment-italy-guide` |
| ×13 | 12 | `guides/italy-residency-by-investment-guide` |
| ×12 | 11 | `guides/italy-property-taxes-foreign-buyers-guide` |
| ×12 | 11 | `guides/digital-nomad-italy-property-guide` |
| ×11 | 17 | `areas/lucca` |
| ×10 | 9–15 | `italy-property-for-australians`, `italy-property-for-scandinavian-buyers`, `italy-inheritance-law-property-foreigners`, `italy-1-euro-homes-program`, `agriturismo-investment-italy-guide`, `basilicata-property-investment-guide` |

**Fix.** Keep one instance per page at the most useful position; delete the rest **by hand**, re-reading
each file afterwards (a regex delete is what created the P0-2 scar).

---

### P1-2 · Question headings slotted into declarative sentences — 134 sections, 47 files, ungrammatical on-page

**Pattern.** The GEO pass generated each "answer-first opener" as `{H2 text} means {generic sentence}`.
When the H2 is a question, the result is broken English **visible to readers and to answer engines**.

**Proof — verbatim from live pages:**

| Slug | H2 | First sentence rendered under it |
|---|---|---|
| `areas/chianti` | What Is Chianti Property Investment? | "**What Is Chianti Property Investment means** Greve centro with licensed agriturismo paths…" |
| `areas/bologna` | How does Bologna vs Milan and Florence compare for investors? | "**How does Bologna vs Milan and Florence compare for investors means** Bologna at €3,700/m²…" |
| `areas/monte-argentario` | How does Town Guide: Porto Ercole vs Porto Santo Stefano compare for investors? | "**How does Town Guide: Porto Ercole vs Porto Santo Stefano compare for investors means** Monte Argentario at €3,500-8,000/m²…" |
| `guides/hidden-costs-buying-property-italy` | What Are Spese Condominiali Arrears and How Much Can They Cost | "**What Are Spese Condominiali Arrears and How Much Can They Cost is the** compliance…" |

**Worse — the sentence after the slot is often identical across sections.** On `areas/lucca`, four
different H2s ("How Do Lucca Rental Yields Compare to Florence?", "What Heritage and STR Rules Apply
Inside the Walls?", "Who Buys Lucca Property Today?", "Buyer scenarios in Lucca") are each followed by the
**same** sentence: *"…means foreign buyers should anchor offers to district €/m² bands, model gross yields
after IMU and cedolare, and verify CIN plus regolamento on the exact address."* On `areas/florence`, the
H2 "Which guides complement Florence property research?" opens with a sentence about Oltrarno STR pricing —
unrelated to the heading.

This is precisely the `Typically, {H2} means…` boilerplate that `geo-aeo-writing-gates.md` bans; it was
reworded enough to slip past the literal-string check.

**Fix.** Rewrite the 134 openers as real 40–60-word answers to their own heading.

---

### P1-3 · 3,282 near-duplicate paragraph pairs across 131 pages (52 % of the corpus)

**Pattern.** Mad-libs templating: one paragraph reused with only the place/nationality/developer swapped.
Exact-match detectors miss all of it.

**Proof:**

| Similarity | Pages | Text |
|---:|---|---|
| 0.96 | `abruzzo-` ↔ `molise-property-investment-guide` | "**Abruzzo**/**Molise** buyer scenarios are capital paths that map inland yield, Adriatic STR, or paired holds to tenant type for foreign buyers on May 2026 portal bands…" |
| 0.95 | `italy-property-for-americans` ↔ `-for-australians` | "**US**/**Australian** buyers purchasing Italian second homes should budget 10-15% above the purchase price for closing costs…" |
| 0.95 | `areas/ancona` ↔ `areas/arezzo` (also `perugia`) | "Foreign buyer practicalities means EU citizens purchase freely with codice fiscale and notary rogito while non-EU reciprocity-country buyers need avvocato…" |
| 0.88 | 8 `developers/*` pages | "**{Developer}** buyers should match ticket size to the developer's typical handover corridor and buyer pool, not generic Italy centro yield assumptions copied from…" |

Also **816 near-duplicate pairs *within* single pages** across 52 files — most commonly the `**Quick
answer:**` paragraph immediately restated as the next paragraph (`is-italy-property-good-investment-2026`
j=0.96, `how-to-buy-italy-property-step-by-step` 0.96, `best-regions-invest-italy-property-2026` 0.96,
`airbnb-investment-italy-guide` 0.95, `mistakes-foreign-buyers-italy` 0.94,
`italy-vs-spain-property-investment` 0.92). The duplicate is in the first screen of the page.

Worst offenders by cross-page involvement: `italy-property-investment-guide` (677 pairs),
`liguria-property-investment-guide` (593), `italy-property-market-forecast-2026-2027` (459),
`italy-flat-tax-regime-new-residents` (332), `florence-property-investment-guide` (290),
`italy-investor-visa-requirements-2026` (286), `venice-property-investment-guide` (286).

**Fix.** Per `market-stats.json` policy — one owner slug per fact cluster; supporting pages get one
sentence + a link, not a re-skinned copy of the paragraph.

---

### P1-4 · 24 pages have zero in-body inbound links — including three lead pages

**Pattern.** `relatedSlugs` is declared in the schema (`src/content.config.ts`) and populated on all 252
files, **but no component renders it** — there is no related-articles module anywhere in `src/`. Every
`relatedSlugs` array produces exactly zero links. Internal linking therefore relies entirely on in-body
prose links, and 24 pages have none pointing at them.

**Lead pages with 0 inbound in-body links:**
- `guides/costa-smeralda-property-investment-guide` — **Tier A**, 2 clicks / 102 impressions
- `guides/italy-property-management-costs` — **Tier A**, 2 clicks / 106 impressions
- `guides/italy-property-renovation-costs-guide` — **Tier C**, 250 impressions
- `guides/buy-property-italy-under-500000` — **Tier A**, only **1** inbound

Other orphans include `italy-holiday-let-licensing`'s neighbours in the STR cluster
(`digital-nomad-italy-property-guide`, `hidden-costs-buying-property-italy`,
`italy-property-market-forecast-2026-2027`, `mistakes-foreign-buyers-italy`,
`italy-residency-by-investment-guide`, `venice-`/`bologna-`/`calabria-property-investment-guide`,
all 3 news posts, 2 developers, 4 compare pages).

**Fix.** Either build the `relatedSlugs` component (one small Astro component fixes internal linking on
all 252 pages at once) or add contextual in-body links from the relevant hubs — Tier A/B first.

---

### P1-5 · 4 broken internal links — 3 are wrong-collection, 1 has no target

| Source | Broken href | Diagnosis | Fix |
|---|---|---|---|
| `areas/valle-d-itria` | `/guides/valle-d-itria-trulli-restoration/` | slug exists in **projects** | → `/projects/valle-d-itria-trulli-restoration/` |
| `guides/italy-property-for-uk-buyers` | `/guides/lake-como-vs-liguria-property/` | slug exists in **compare** | → `/compare/lake-como-vs-liguria-property/` |
| `guides/puglia-property-investment-guide` | `/guides/puglia-vs-tuscany-property/` | slug exists in **compare** | → `/compare/puglia-vs-tuscany-property/` |
| `areas/sorrento` (×2) | `/areas/positano/` | **no such page exists** in any collection | repoint to `/guides/amalfi-coast-property-investment-guide/` or drop the link |

Note: `npm run check-links` referenced in the brief **does not exist** in `package.json`. This list comes
from an independent link-graph built against the real route inventory (252 content routes + 27 static
pages + `public/`).

---

### P1-6 · Real cannibalization is on a different page than the machine flagged

`docs/CONTENT_QUALITY_AUDIT.md` recommends **NOINDEX** for
`how-to-buy-italy-property-step-by-step` (4,969 words) and marks
`can-foreigners-buy-property-italy` as **KEEP**. Reading all four pages, that is backwards:

| Slug | Words | Role |
|---|---:|---|
| `buy-property-italy-foreigner` | 3,390 | declared canonical eligibility hub (`legal-core.json`) |
| `can-foreigners-buy-property-italy` | **4,352** | **duplicates the hub** — plus reciprocity, tax, STR and exit; longer than the hub it supports |
| `italy-reciprocity-property-foreigners` | 2,189 | **Tier A lead page**, shortest of the four |
| `how-to-buy-italy-property-step-by-step` | 4,969 | process guide — genuinely distinct spine, but also carries "total costs", "regions", "mortgages" |

`can-foreigners-buy-property-italy` carries H2s "Which Countries Qualify Under Italy's Reciprocity Rules?"
and "What Costs and Taxes Apply to Foreign Owners?" — competing directly with the Tier A reciprocity page
and the tax hub. **Noindexing a 4,969-word guide is the wrong first move**; de-overlapping is.

**Fix.** Trim `can-foreigners-buy-property-italy` to eligibility-answer scope and link out to the three
hubs; trim the costs/regions/mortgage sections from `how-to-buy-italy-property-step-by-step` down to a
sentence + link each. **No noindex in wave 1.**

---

## 4. P2 — quality debt, batch after P0/P1

| # | Finding | Scale | Fix |
|---|---|---:|---|
| P2-1 | `<title>` exceeds ~62 chars because `BaseLayout.astro:50` appends `\| Italian Estate` to titles already 36–60 chars | **187 pages** | shorten the suffix or the frontmatter titles — direct SERP-truncation/CTR loss |
| P2-2 | Hero `<img>` renders with a bare empty `alt` (`ArticleLayout.astro:136` hardcodes `alt=""`) | **252 pages** | render a real alt from title/heroAlt |
| P2-3 | `<img>` without `width`/`height` → CLS | 139 imgs / 107 pages | add intrinsic dimensions |
| P2-4 | Currency style mixed on one page (`€5,500-11,500/m²` next to `5,500 to 11,500 euros per sqm`) | 37 files | pick one house style |
| P2-5 | Unit style mixed (`sqm` vs `m²`) on one page | 102 files | pick one house style |
| P2-6 | Stacked duplicate tables — two tables in one H2 restating the same numbers (GEO table added, original left) | 40 sections / 26 files | merge to one table per section |
| P2-7 | Internal SEO process leaked into published copy: `costa-smeralda-property-investment-guide` says *"**Google Search Console** enquiry clusters consistently surface costa smeralda apartments as distinct intent…"* | 1 confirmed + 2 "enquiry cluster" phrasings | delete |
| P2-8 | `..` double-period scars from an earlier regex pass | 14 hits / 6 files | fix (`italy-property-by-nationality-guide` ×4, `florence-vs-siena-property` ×5) |
| P2-9 | Thin `##` openers (<35 words) — fails the site's own GEO gate | 88 sections / 55 files | expand to 40–60-word answers |
| P2-10 | `##` with no prose opener at all (jumps straight to a table/list) | 36 sections / 25 files | add an answer paragraph |
| P2-11 | First body H2 near-duplicates the `<h1>` rendered from frontmatter title | 78 files | drop the redundant H2 or differentiate it |
| P2-12 | Duplicate `<InlineCta>`/`<TldrBlock>` in one file | 19 files | keep one |
| P2-13 | Thin pages under 1,500 words (projects 22, developers 5, news 4, areas 3, compare 2) | 37 files | expand or consolidate |
| P2-14 | `projects` collection uses identical generic H2s ("What Are the Key Project Facts?", "How Does This Compare With Alternatives?") across the whole collection | 1,964 H2-overlap pairs, mostly here | differentiate headings per project |
| P2-15 | Heading-level break: `###` used as CTA after `<FaqBlock/>` | `italy-holiday-let-licensing`, `italy-property-management-costs` (both Tier A) | promote to `##` |
| P2-16 | `guides/molise-property-investment-guide` still fails `fix:markdown-glue --dry` (slug-as-link-text) | 1 file | run the fixer on that file |
| P2-17 | Trailing whitespace | 21 files | strip |

---

## 5. Assumptions made (not escalated, per `corpus-cleanup-mode.md`)

1. **`npm run check-links` does not exist**; I built an independent link checker against the real Astro
   route inventory rather than asking. Adding a `check-links` script is proposed in Wave 0.
2. **The submodule could not be cloned via `git submodule update`** (no credentials in-session). I cloned
   `more-group-content-os` separately at the exact pinned SHA `1b16ee8b` and read the policies from there.
   The submodule pointer is **unchanged** and correct.
3. **"Orphan" means zero in-body contextual inbound links.** Collection index pages do link every entry, so
   these pages are crawlable — but they receive no topical internal PageRank.
4. **I did not treat `geo:audit` avg 91 as a health signal.** Its `unique` rubric (81) is the one that
   matches the real defect profile.
5. **No page is recommended for `noindex` in this report.** Every REWRITE_OR_NOINDEX candidate in the
   machine audit is a thin/duplicate problem that consolidation fixes; noindex decisions belong after
   Wave 4, with per-slug rationale.
6. **Nothing was edited.** `docs/CONTENT_QUALITY_AUDIT.md` was regenerated only because `npm run
   audit:content` rewrites it as a side effect; its content is unchanged from `main`.

---

## 6. What I recommend you say "ок" to

Roadmap: **`.content-os/batches/corpus-cleanup-roadmap-2026-08-20.md`** — 8 waves, ≤25 slugs each.

The order deliberately differs from the draft in `STATUS.md`. Waves 0–2 are **template and
infrastructure**, not content: they fix 252 pages each with a handful of file edits, and they close the
detector gaps that let all of this ship. Content waves start at Wave 3.

**Suggested first approval: Wave 0 + Wave 1 together** (detector fixes + the template-layer P0s). They
touch no MDX, are fully verifiable in the build output, and stop the bleeding on every page at once.

---

## 7. Wave 0 + Wave 1 — delivered 2026-08-20

Approved by Maxim (`lock.json` → `approved_wave: wave-0+1`). Decisions taken: build the
`RelatedGuides` component; trim the title suffix rather than rewrite 187 titles; ship W0 and W1 as one PR.

### What the gates report now

| Gate | Before | After |
|---|---|---|
| `fix:markdown-glue -- --dry` | pass (1 known file) | pass |
| `validate:content:changed` | **crash** (ERR_MODULE_NOT_FOUND) | **pass** |
| `validate:batch -- --changed` | **crash** (MODULE_NOT_FOUND) | **pass** |
| `qa:corpus` | fake pass (blind detector + silently crashing subprocess) | **pass**, reporting 78 + 21 + 138 known-debt items |
| `check-links` | **did not exist** | **pass**, 0 broken links |
| `audit:templates` | **did not exist** | **pass** |
| `audit:images` | fail (2 false positives) | **pass** |
| `audit:rendered --local --fail` | 506 P0 / 428 P1 | **0 / 0** |

### Rendered-HTML deltas (verified against `dist/`, not source)

| Defect | Before | After |
|---|---:|---:|
| Pages emitting 2+ `FAQPage` JSON-LD | **252** | **0** |
| Pages rendering the FAQ **twice visibly** (`projects` route never passed `hasInlineFaqBlock`) | **65** | **0** |
| `<title>` longer than 62 chars | **187** | **0** (longest 60) |
| Stray ` , ` in rendered copy | all **278** | **0** |
| Markdown tables rendering as literal pipe text | **2** | **0** |
| Glued/fragile table sites in the corpus | **9** | **0** |
| Hero `<img>` with no descriptive `alt` | **252** | **0** |
| Pages with no inbound in-body link | **24** | **13** |
| Broken internal links | **4** | **0** |

### Found during the wave (not in the original audit)

- **P0-3 was worse than reported.** The wrong-country copy was not confined to meta descriptions — four
  collection hub `<title>` tags were wrong: `/projects` → *"Mexico Real Estate Projects"*, `/guides` →
  *"Spain Property Investment Guides"*, `/compare` → *"Spain Property Market Comparisons"*, and `/areas` →
  *"Italian Estatement Areas"* (a find-replace that turned "Investment" into "Estatement"). `/methodology`
  cited DLD, AMPI and "Official UAE government portals"; `/privacy-policy` promised referral to
  "licensed UAE property partners". All fixed.
- **Two more path bugs in the same file.** `more-content-gate.mjs` also had `runCloudinaryDeliveryChecks`
  nested inside an unrelated `if (STAMP_PREFIX_RE…)` block, so it would never have run even with the
  module present; and its `glued-table` regex (`/^[^\n|]+ — \| /m`) only matched text and pipes on the
  *same* line, never the failure mode that actually shipped.
- **`qa:corpus`'s PASS was fake twice over.** Besides the blind duplicate check, its `fix-batch-queue`
  subprocess imported the same missing module, exited non-zero, and the gate treated "no output" as
  "no problems". With the import fixed it reports **138 files** carrying legacy blockers.
- **4 titles contained a doubled word** — "Property Guide **Guide** (2026)" on `tuscany-inland-`,
  `rome-property-investment-`, `italy-off-plan-property-` and `airbnb-investment-italy-guide`. Visible in
  the SERP. Rewritten to proper 50–60 character titles.
- **P1-7 (new): raw slug text injected into visible prose — 240 occurrences across 52 files.** A template
  slotted the lowercase URL slug into body sentences:
  > "Bolzano city apartments for **italy property for dutch buyers buyers** trade roughly €3,800-5,500/m²"
  > "**Red flag:** On **emilia romagna property investment guide** tickets, pricing more than 15% below OMI…"
  > "Use this **vineyard property investment italy guide** buyer checklist before compromesso signature."

  Worst: `emilia-romagna-property-investment-guide` (14), `italy-property-for-germans` (12),
  `italy-property-for-dutch-buyers` (11), `italy-property-for-irish-buyers` (11),
  `italy-property-for-french-buyers` (10), `italy-property-for-scandinavian-buyers` (10).
  Same family as P1-2; **assigned to Wave 5**.
- **`/site-report` is indexable** and publishes internal GSC/GA4 numbers, lead counts and a roadmap.
  Not changed — noindexing it is a call for Maxim, not a cleanup decision.

### The quality ratchet — why this cannot silently regress again

`.content-os/quality-baseline.json` records per-file debt (self-repeats, near-duplicates, cross-page
duplicates, GEO, word count, legacy issue types). All four content gates read it and **fail a file only
when it gets worse than its recorded baseline**; a file with no entry is held to the full standard, and
`--update-baseline` refuses to raise any number — values may only improve. `--strict` ignores the ratchet
and holds everything to zero.

This is what was missing. Every previous cleanup could report success without anything measuring whether
the corpus actually improved. Now the debt is a number in a file that can only go down: **125 self-repeats,
816 within-page near-duplicates, 66 cross-page exact duplicates, 6,564 cross-page near-duplicate pairs,
36 files below GEO 90, 96 below 2,500 words, 138 files with legacy blockers.** Waves 3–8 drive those to
zero, and no PR can raise them.

---

## 8. Wave 2 — delivered 2026-08-20

### P0-5 closed, and it was worse than measured

The audit counted **111 hotlinked heroes**. Re-checking during the wave found **55 inline body images**
on top of those — markdown `![alt](url)` rendering as a bare `<img>` with no `srcset` and no dimensions.
**166 images across 111 pages**, all now on Cloudinary. `grep -r "upload.wikimedia" src/` returns **0**.

### Measured delivery, ten sampled heroes

| Page | Wikimedia (before) | Cloudinary (after) |
|---|---|---|
| `areas/genoa` | **4,685 KB** | 385 KB |
| `areas/arezzo` | **2,571 KB** | 195 KB |
| `areas/carovigno` | **2,252 KB** | 181 KB |
| `areas/ancona` | 619 KB | 72 KB |
| `areas/cisternino` | 598 KB | 223 KB |
| `areas/alba`, `assisi`, `bari`, `bologna`, `langhe` | **HTTP 429 — refused** | 95–386 KB |

**Five of ten sampled heroes returned 429**, i.e. roughly half of these pages were shipping a broken LCP
element to real visitors. Of the ones that did load, the median was **2,252 KB** — as the largest
contentful paint, uncapped, with no `srcset`.

After: median **191 KB** WebP at 1200px, with 640/960 srcset steps (mobile now gets ~47 KB where it
previously got a multi-megabyte JPEG or nothing at all). Hero `<img>` elements carrying a `srcset`:
**141 → 252 of 252**.

### Attribution — a licensing gap nobody had flagged

68 distinct Commons files; **62 are CC BY or CC BY-SA**, which require crediting the author and naming
the licence. The site credited nobody. The migration reads the Commons API for licence and author per
file, records them in `scripts/reports/hero-migration-manifest.json`, and a new **`/image-credits`** page
(linked from the footer) publishes the credit for all 68 files with links to source and licence.

### Found during the wave: the code that manufactured the P0-2 scars

`scripts/lib/human-signals.mjs` → `humanizeBodyLines()` ended with `s.replace(/—/g, ', ')`. That does not
consume the space **before** the dash:

```
"Independent research —not advice."  ->  "Independent research , not advice."
```

which is verbatim the footer string shipping on all 278 pages. `forceUnderEmLimit()` had the same bug on
its fallback branch. `scripts/fix-human-corpus-signals.mjs` calls both — so re-running the repo's own
"humanise" tool would have re-created every scar Wave 1 removed.

Both now swallow whitespace on either side and strip any doubled or orphaned punctuation afterwards.
**This was the recurrence mechanism**: the cleanup tool and the defect were the same code.

### Two more detector corrections

- **`wordCount()` counted URL tokens as words.** Every body word count in the corpus was inflated by its
  own link targets, and swapping a long Wikimedia URL for a shorter Cloudinary one "lost" words that were
  never prose. Now strips URLs and link targets first; baselines re-derived with `--force-metrics`.
- **`isImageUrl()` treated any `wikimedia` URL as an image**, so the credits page's
  `commons.wikimedia.org/wiki/File:…` description links were probed and 404'd. Narrowed to
  `upload.wikimedia.org`, the file host.

### Gates

All eight pass: `fix:markdown-glue --dry` · `validate:content:changed` · `validate:batch --changed` ·
`audit:templates` · `check-links` · `qa:corpus` · `audit:images` (287 URLs, 0 broken) ·
`audit-rendered-live --local --fail`.

---

## 9. Wave 3a — delivered 2026-08-20, with two corrections to this report

Maxim held no source data, so facts were verified here: several independently-phrased searches per fact,
plus a deliberate **check-to-refute** query on anything that would change many pages. Two conclusions in
§P0-6 did not survive that step.

### Correction 1 — the 1.14 % IMU ceiling is real, not stale

§P0-6 called `guides/imu-property-tax-italy`'s 0.46 %–1.14 % band stale and said 1.14 % appeared in no
2026 source. **Wrong.** 1.14 % applies in comuni that previously levied the 0.08 % TASI surcharge. The
owner slug was closer to correct than the pages quoting 0.4 %–0.76 %.

Verified rule (L. 160/2019 art. 1 c. 754): base **0.86 %**, comuni **0 %–1.06 %**, **1.14 %** with the
TASI surcharge, category D floor 0.76 %.

**Applied:** 163 spots across 62 supporting pages → the short form 0.86 %–1.06 %; the owner slug states
the full rule with the statutory reference. **14 bands → 1**, and the 9 self-contradicting pages are gone.

### Correction 2 — the cedolare secca "30 % band" was false

An earlier pass this session recorded a 30 % rate on the third and fourth short-let unit and flagged it as
a corpus-wide error across 179 files. The check-to-refute query overturned it: that rate was in the
**draft** Legge di Bilancio 2026 and was **dropped before enactment** (Il Sole 24 ORE; The Local,
*"Budget 2026: Italy to scrap short-term rental tax hike"*). Commercialista blogs still carrying it are
republishing the draft.

The enacted 2026 position — 21 % first unit, 26 % second, business presumption and partita IVA from the
third — is **what the corpus already said**. Only the threshold was stale: it moved from the fifth unit to
the third on 1 January 2026, corrected in one page.

**Had the reconciliation run on the first two confident-looking sources, it would have written a false tax
rate into 179 files.** That is the argument for the check-to-refute step, and for the pause in §7.

### Correction 3 — "10 competing Milan values" was largely my own measurement artefact

Reading the sentences rather than the regex output: €3,700 is **Bologna's** average, €5,200 is the low end
of a **Navigli district range**, €5,350 is explicitly labelled **2025**, and €5,750 is Milan per a
different provider (Abitare Co), attributed on the page. Only €5,653 vs €5,750 are both "the Milan
average", which is an attribution nit. **No change made.**

### Also resolved

**National average €/m²:** verified at **€2,188/m²** (Immobiliare.it, April 2026, +4.24 % y/y;
corroborated by OMI at €2,179/m² for March 2026). The competing €1,891 matched no current series — 16
occurrences across 9 pages replaced, and the owner slug now carries the figure with its source and date.

### Still open

**Closing-cost stack** (10–12 % on 68 pages vs 10–15 % on 64). Not a sourcing question: the bands differ
because they include different things. Needs a decision on composition, not a search.


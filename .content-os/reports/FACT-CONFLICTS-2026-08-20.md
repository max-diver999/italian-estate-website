# Fact conflicts — sign-off sheet for Wave 3

**Date:** 2026-08-20 · **Registry:** `more-group-content-os/content-engine/fact-registries/italian-estate-website/market-stats.json`

## Why this is a sheet and not a fix

Wave 3 was scoped as "populate the registry, then reconcile ≤25 slugs". The registry is populated.
**The reconciliation is deliberately not done**, for one reason:

> `legal-core.json`: *"Confirm rates in batch-fact-sheet — **do not invent bands**."*
> `geo-aeo-writing-gates.md`: tier **A** (official) sources are required for *"legal thresholds, tax rates"*.

This session's egress proxy **blocks `agenziaentrate.gov.it`** and blocks direct fetching of every
professional-source page. Verification was possible only through search-result summaries — **tier B at
best**. Writing tax rates into 77+ pages from tier B sources is exactly the failure mode this whole
audit exists to stop, so every value below is recorded with its evidence and left **unpublished** until
someone with a tier A source or a commercialista signs the right-hand column.

Sign the column, and the reconciliation is a mechanical batch.

---

## 1. IMU — 14 different bands across 77 pages

Worse than the audit reported (it found 5). Nine pages contradict **themselves**.

| IMU band asserted | Pages | Examples |
|---|---:|---|
| **0.4–1.06%** | 23 | areas/como, areas/florence, areas/palermo |
| **0.76–1.06%** | 22 | areas/rome-centro-storico, compare/cedolare-secca-vs-irpef-italy-rental, compare/italy-vs-croatia-property-investment |
| **0.4–0.76%** | 13 | guides/basilicata-property-investment-guide, guides/italy-inheritance-law-property-foreigners, guides/italy-property-for-australians |
| **0.76–0.86%** | 8 | areas/ancona, areas/bari, areas/campobasso |
| **0.86–1.06%** | 8 | guides/agriturismo-investment-italy-guide, guides/best-cities-italy-rental-yield-2026, guides/gross-vs-net-yield-italy |
| **0.5–0.76%** | 4 | guides/best-cities-italy-rental-yield-2026, guides/bologna-property-investment-guide, guides/florence-property-investment-guide |
| **0.5–0.6%** | 2 | compare/milan-vs-florence-property-investment, guides/milan-property-investment-guide |
| **0.4–0.8%** | 2 | guides/sardinia-property-investment-guide, guides/sicily-property-investment-guide |
| **0.5–1.1%** | 1 | developers/engel-volkers-italy |
| **0.4–1.2%** | 1 | guides/airbnb-investment-italy-guide |
| **0.9–1.1%** | 1 | guides/cedolare-secca-italy-rental-property |
| **0.4–1.0%** | 1 | guides/italy-property-management-costs |
| **0.46–1.14%** | 1 | guides/italy-retirement-property-guide |
| **0.3–0.9%** | 1 | guides/puglia-property-investment-guide |

**14 distinct IMU bands across 77 pages.**

**9 pages contradict themselves on IMU within a single page:**

- `compare/italy-vs-croatia-property-investment` — states 0.4–1.06%, 0.76–1.06%
- `compare/italy-vs-malta-property-investment` — states 0.4–1.06%, 0.76–1.06%
- `compare/italy-vs-portugal-property-investment` — states 0.4–1.06%, 0.76–0.86%
- `guides/best-cities-italy-rental-yield-2026` — states 0.5–0.76%, 0.76–1.06%, 0.86–1.06%
- `guides/cedolare-secca-italy-rental-property` — states 0.76–1.06%, 0.9–1.1%
- `guides/italy-property-management-costs` — states 0.4–1.0%, 0.86–1.06%
- `guides/milan-property-investment-guide` — states 0.5–0.6%, 0.5–0.76%
- `guides/piedmont-property-investment-guide` — states 0.76–1.06%, 0.86–1.06%
- `guides/sardinia-property-investment-guide` — states 0.4–0.8%, 0.76–1.06%, 0.86–1.06%

### What the evidence says

| | Value | Confidence |
|---|---|---|
| Statutory base rate, non-primary residence | **0.86 %** | cross-confirmed, two independent sources |
| Comune floor | **0.4 %** (reducible to zero) | cross-confirmed |
| Comune ceiling | **1.06 %** | cross-confirmed |
| Milan, Rome, Turin and most capoluoghi | **1.06 %** | cross-confirmed |

Framework: Legge di Bilancio 2020 art. 1 c. 754, rates confirmed for 2026 by **L. 199/2025**.

**Note on our own authority page.** `guides/imu-property-tax-italy` is the owner slug and states
**0.46 %–1.14 %** — the only page asserting a 1.14 % ceiling, which does not appear in any 2026 source
found. It looks like a stale pre-2020 figure carried forward. It is also the page most likely to be
cited by an answer engine.

**Proposed canonical sentence** (needs sign-off):
> *IMU on a second home is charged on cadastral value at a statutory base rate of 0.86 %. Each comune
> sets its own rate between 0.4 % and 1.06 %; Milan, Rome and most provincial capitals apply the
> 1.06 % maximum.*

☐ **Approve** ☐ Correct to: ______________________

---

## 2. Cedolare secca — the corpus predates a change in the law

**This is the most serious finding in Wave 3 and it is not a consistency problem — it is a correctness problem.**

Legge di Bilancio 2026 (**L. 199 of 30 December 2025**, in force 1 January 2026) changed short-let taxation:

| | Until 2025 | From 2026 |
|---|---|---|
| 1st unit | 21 % | 21 % |
| 2nd unit | 26 % | 26 % |
| 3rd and 4th unit | — (business) | **30 %** |
| Non-business threshold | 4 units | **2 units** |

**Corpus exposure:** 179 files mention cedolare secca; **307 occurrences** of the "21 % or 26 %" pairing.
**No page mentions the 30 % band or the two-unit threshold.**

`guides/short-term-rental-rules-italy` states, in its FAQ and therefore in its FAQPage structured data:

> *"Three or more properties: no cedolare secca, must register as business with VAT number."*

which the 30 % band directly contradicts.

**Why I did not fix it.** The professional sources themselves flag that the 30 % band on the 3rd–4th unit
**coexists with a business presumption that already triggers from the 3rd**, and that coordination between
the two provisions is *awaiting an Agenzia delle Entrate circular*. This is unsettled law. Rewriting 179
files on it from secondary sources would be indefensible.

☐ **Commercialista confirms the 2026 ladder** → I run the batch across the STR cluster
☐ Hold until the Agenzia circular lands
☐ Interim: add a dated "2026 change pending clarification" note to the six STR lead pages only

---

## 3. Closing cost stack — 7 competing bands

| Band | Pages |
|---|---:|
| 10–12 % | 68 |
| 10–15 % | 64 |
| 10–14 % | 9 |
| 9–11 %, 10–13 %, 10–11 %, 12–15 % | 1–2 each |

This one is **not** a sourcing problem — it is a definition problem. The bands differ because they include
different things. Decide what sits inside the number and the spread resolves itself:

☐ agency fee ☐ notary ☐ registration/ipotecaria/catastale ☐ sworn translation ☐ independent legal review

Then one figure lives on `italy-property-closing-costs-breakdown` and every other page links to it.

---

## 4. Market averages — no source, no date, two values each

| Fact | Competing values |
|---|---|
| Italy national average €/m² | **€2,188** (9 pages) vs **€1,891** (8 pages) |
| Milan average €/m² | **€5,653** (14) vs €5,750 (3) vs €5,350 vs €5,200 |

Both presumably came from a real snapshot (Immobiliare.it or Nomisma). A market average is unusable
without an `as_of`, so these need the source and the date, not a vote.

☐ Italy: ________ €/m², source ________, as of ________
☐ Milan: ________ €/m², source ________, as of ________

---

## What happens after sign-off

Per `market-stats.json`, one **owner slug** holds each number and expands it into a table; every other page
gets **one sentence plus a link**. That is already the registry's stated policy — it has simply never been
enforced, which is how 77 pages ended up each carrying their own copy of the IMU rate.

Reconciliation batches, ≤25 slugs each, run in this order once approved:

1. **3a — IMU**, owner slug first, then the 9 self-contradicting pages, then the highest-traffic remainder
2. **3b — closing-cost stack**, after the composition is defined
3. **3c — market averages**, after source and date are supplied
4. **3d — cedolare secca**, only on a commercialista's sign-off

# Fact conflicts — Wave 3 resolution log

**Date:** 2026-08-20 · **Registry:** `more-group-content-os/.../market-stats.json` (PR #8)

Maxim held no source data, so verification was done here: multiple independently-phrased searches per
fact, including a deliberate **check-to-refute** on anything that would change many pages. Two of my own
earlier conclusions did not survive that. Both corrections are below.

---

## 1. IMU — RESOLVED ✅ 14 bands → 1

**Verified rule** — L. 160/2019 art. 1 c. 754, cross-checked over three independent searches:

| | |
|---|---|
| Statutory base rate, non-primary residence | **0.86 %** |
| Comune range | **0 % – 1.06 %** (may be reduced to zero) |
| Ceiling where the 0.08 % TASI surcharge applied | **1.14 %** |
| Category D floor (share reserved to the State) | 0.76 % |

### ⚠ Correction to the audit report

The audit called the owner slug's **0.46 %–1.14 %** band *"stale"* and said 1.14 % *"does not appear in
any 2026 source"*. **That was wrong.** A check-to-refute query found 1.14 % is real — it applies in comuni
that previously levied the TASI surcharge. The owner slug was closer to correct than the pages quoting
0.4 %–0.76 %.

**Applied:** 163 spots across 62 supporting pages reconciled to the short form **0.86 % to 1.06 %**;
`guides/imu-property-tax-italy` now states the full rule with the statutory reference, including the
1.14 % case. Corpus now carries **one** IMU band on 68 pages, down from 14.

---

## 2. Cedolare secca — the 30 % band was FALSE ✅

An earlier pass in this same session recorded a **30 % rate on the third and fourth short-let unit** from
Legge di Bilancio 2026 and flagged it as a corpus-wide correctness problem across 179 files.

**A check-to-refute query overturned it.** That rate was in the **draft** budget and was **dropped before
enactment** — Il Sole 24 ORE (*"the new squeeze starts from the third rented property"*) and The Local
(*"Budget 2026: Italy to scrap short-term rental tax hike"*). Several commercialista blogs still publish
the draft version uncorrected, which is where it came from.

**Enacted position for 2026:**

| Units let short-term | Treatment |
|---|---|
| 1st | 21 % cedolare secca |
| 2nd | 26 % cedolare secca |
| 3rd onwards | **No cedolare secca** — business presumption, partita IVA required |

The corpus's existing *"First: 21 %. Second: 26 %. Three or more: no cedolare secca, must register as a
business"* framing was **already correct**. Only one thing was stale: the threshold moved from the
**fifth** unit to the **third** on 1 January 2026.

**Applied:** the single stale statement in `guides/us-tax-italy-rental-property` corrected. Nothing else
touched.

> This is the clearest argument for the check-to-refute step. Rewriting 179 files on the first two
> confident-looking sources would have injected a false tax rate into the entire corpus.

---

## 3. National average €/m² — RESOLVED ✅

**Verified:** **€2,188/m²** — Immobiliare.it national average asking price, **April 2026**, +4.24 % y/y.
Corroborated by OMI (Agenzia delle Entrate) at €2,179/m² for March 2026 and Q1 2026 data near €2,180/m².

The competing **€1,891** matched no current national series. **Applied:** 16 occurrences across 9 pages
replaced; the owner slug now carries the figure **with its source and date**.

*(RealAdvisor's €1,481/m² measures transaction rather than asking prices — a different series, not a
contradiction.)*

---

## 4. Milan €/m² — mostly NOT a defect ⚠ correction to the audit report

The audit reported *"10 competing Milan values"*. Reading the actual sentences, most were **an artefact of
my own measurement**, not contradictions:

| Value | What it actually is |
|---|---|
| €5,653 (14 pages) | Milan city average — consistent with the verified ~€5,600–5,679 (May 2026) |
| €5,750 | Milan average per **Abitare Co Q1** — a different provider, attributed on the page |
| €5,350 | explicitly labelled **2025** — correctly dated, not stale |
| €5,200 | the low end of a **Navigli district range** (€5,200–6,800), not a city average |
| €3,700 | **Bologna's** average — my regex caught "Milan" elsewhere in the sentence |

**No change made.** The genuine residue is that €5,653 and €5,750 are both presented as "the Milan
average" from different providers — an attribution nit, not a factual error.

---

## 5. Closing cost stack — still open, and it is not a sourcing question

10–12 % (68 pages) vs 10–15 % (64) vs 10–14 % (9), plus four one-offs. These differ because they **include
different things**. No amount of searching resolves that — it needs a decision on composition:

☐ agency fee ☐ notary ☐ registration + ipotecaria + catastale ☐ sworn translation ☐ independent legal review

Once the band is defined, one figure lives on `italy-property-closing-costs-breakdown` and every other
page links to it. **This is the only item still needing your input** — and it is a business decision about
what you quote clients, not a fact I can look up.

---

## Registry status

| Stat | Status |
|---|---|
| `imu_second_home_rate` | **approved**, tier A |
| `cedolare_secca_rates` | **approved_with_caveat**, tier B, correction noted |
| `italy_avg_price_sqm` | **approved**, tier B, sourced and dated |
| `registration_tax_purchase` | needs_verification — not yet written to any page |
| `closing_cost_stack_non_resident` | needs_owner_decision |
| `milan_avg_price_sqm` | no change required |

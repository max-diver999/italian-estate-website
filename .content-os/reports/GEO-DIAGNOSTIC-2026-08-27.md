# GEO diagnostic — italian-estate.com, 2026-08-27

Measured after porting the honest scorer from `max-diver999/capetown-invest-website`
(`claude/capetown-content-audit-h6qbx7`, `90dc5e1`) and calibrating it against
this repository's own history. Method and every rejected rule:
`docs/GEO-SCORING.md`.

## The headline

The rubric this site was using could not tell its own machine output from its own
writing.

| | machine (46 files) | written (12) | separation |
|---|---|---|---|
| old rubric, still in the repo | **92.0** | 93.1 | **1.0 point** |
| new rubric | **0.0** | **70.8** | **70.8 points** |

Under the old rubric **41 of 46** provably templated files scored at or above the
worst hand-written article. Under the new one, **0 of 46** do, and every one of
the 46 scores exactly zero.

The new rubric's weakest point is named rather than buried: a six-verb paraphrase
across the corpus lifts one of the 46 back to 46, because one adopted rule is
lexical. `docs/GEO-SCORING.md` has the measurement and the ablation.

The old number was not merely uninformative. It was the target the campaign was
optimising, which is why the corpus looks the way it does.

## Corpus, as it stands at `1e67223`

| | value |
|---|---|
| files | 272 |
| mean | **15.6** / 75 |
| median | 12 |
| min | 0 |
| max | 60 (`guides/90-180-day-rule-italy-property-owners`) |
| **pages scoring zero** | **109 of 272 (40%)** |

The best pages on the site are the twenty written one at a time in the two
new-article waves: `90-180-day-rule-italy-property-owners` at 60, then
`selling-property-italy-foreigner` 54 and `agibilita-certificate-italy` 53. They
are held down from their calibration scores of 65-75 by one thing only, and it is
not their writing: each loses 24 points to figures the campaign stamped across the
corpus and never sourced.

Fact registry covers **10 of 381** load-bearing figures (3%). The registry gate
arms at 80%, so it is not yet loaded; unregistered figures still cost points on
every page that leans on them.

### By collection

| collection | n | mean | median | min | max | zeros |
|---|---:|---:|---:|---:|---:|---:|
| areas | 48 | **5.4** | 0 | 0 | 36 | **33** |
| compare | 30 | **6.5** | 0 | 0 | 32 | **17** |
| projects | 65 | 14.9 | 11 | 0 | 49 | 23 |
| developers | 15 | 18.7 | 14 | 0 | 41 | 2 |
| guides | 110 | 22.0 | 23 | 0 | 60 | 34 |
| news | 4 | 29.3 | 36 | 12 | 47 | 0 |

`areas` and `compare` are the damage. Between them, 50 of 78 pages score zero.

### What is actually wrong, by frequency

Gates (a gate caps the whole score rather than subtracting):

| files | gate |
|---:|---|
| 111 | `template-corpus` — sentence shapes recur in three or more other articles |
| 34 | `mass-duplication` — over 10% of the page's text appears elsewhere |
| 7 | `echo-openers` — four or more sections restate their heading |
| 5 | `self-repetition` — the page repeats between its own sections |
| 4 | `malformed-output` — broken tokens in published text |

Penalties, by files affected:

| files | penalty |
|---:|---|
| 272 | `stamped-figure` — **every page** carries a figure sprayed across the corpus with no source |
| 241 | `template-family` |
| 181 | `duplicated-text` |
| 98 | `duplicated-volume` |
| 88 | `hedging` |
| 39 | `self-repetition` |
| 20 | `heading-echo` |
| 17 | `definition-frame` |

The 272 is not a rounding artefact. `15%` appears in 165 articles, `21%` in 162,
`5%` in 160, `€400,000` in 113 — none of them sourced anywhere until this week.

## The worst 15

Base is shown as `total (openers/evidence/structure/rhythm/provenance)`; the
floor of 7 is omitted.

| # | file | score | base | penalties | gates | dup | shapes shared |
|---|---|---:|---|---|---|---:|---:|
| 1 | guides/italy-property-for-dutch-buyers | 0 | 60 (14/15/15/8/1) | -381 | mass-duplication, template-corpus | 28.5% | 1015 |
| 2 | guides/italy-property-for-germans | 0 | 66 (19/15/15/8/1) | -353 | mass-duplication, template-corpus | 26.9% | 945 |
| 3 | guides/italy-property-for-irish-buyers | 0 | 64 (18/15/14/8/1) | -300 | mass-duplication, template-corpus | 20.9% | 993 |
| 4 | guides/italy-property-for-scandinavian-buyers | 0 | 64 (18/15/14/8/2) | -299 | mass-duplication, template-corpus | 21.8% | 915 |
| 5 | guides/italy-property-for-americans | 0 | 58 (13/14/14/8/1) | -274 | mass-duplication, template-corpus | 22.1% | 680 |
| 6 | guides/italy-property-for-french-buyers | 0 | 64 (18/15/14/8/1) | -271 | mass-duplication, template-corpus | 20.2% | 808 |
| 7 | guides/italy-property-for-israeli-buyers | 0 | 58 (13/14/14/8/1) | -219 | mass-duplication, template-corpus | 14.8% | 680 |
| 8 | guides/italy-property-for-uk-buyers | 0 | 64 (18/15/14/8/2) | -174 | mass-duplication, template-corpus | 15.4% | 313 |
| 9 | guides/italy-property-for-swiss-buyers | 0 | 60 (14/15/15/8/1) | -174 | mass-duplication, template-corpus | 16.5% | 271 |
| 10 | guides/how-to-buy-italy-property-step-by-step | 0 | 53 (**7**/15/15/8/1) | -134 | self-repetition, echo-openers | 2.8% | 116 |
| 11 | compare/milan-vs-florence-property-investment | 0 | 59 (15/15/14/6/2) | -113 | template-corpus | 8.2% | 310 |
| 12 | guides/liguria-property-investment-guide | 0 | 64 (18/15/15/8/1) | -67 | — | 4.5% | 188 |
| 13 | guides/florence-property-investment-guide | 0 | 62 (18/14/15/7/1) | -67 | — | 5.6% | 112 |
| 14 | areas/palermo | 0 | 60 (17/13/14/8/1) | -64 | — | 5.3% | 123 |
| 15 | compare/italy-vs-croatia-property-investment | 0 | 62 (18/15/15/6/1) | -62 | template-corpus | 3.9% | 184 |

Read the `base` column before concluding these are badly built pages. Almost all
of them earn 14 to 19 of 20 on openers, full marks on evidence and structure, and
8 of 8 on rhythm. **The scaffolding is fine. There is nothing underneath it that
belongs to the page.** Provenance is 1 or 2 out of 10 everywhere, because the
figures these pages lean on are shared across the corpus and sourced nowhere.

The one exception is `how-to-buy-italy-property-step-by-step`, which scores 7 of
20 on openers: it genuinely does restate its own headings, and it repeats between
its own sections badly enough to trip two gates.

## Cannibals

47 pairs share at least 5% of the shorter page's nine-word sequences; 13 share
15% or more; 3 share 20% or more.

| shared | pair |
|---:|---|
| **30%** | guides/abruzzo-property-investment-guide ↔ guides/molise-property-investment-guide |
| 22% | guides/italy-property-for-americans ↔ guides/italy-property-for-australians |
| 21% | guides/italy-property-for-australians ↔ guides/italy-property-for-canadians |
| 19% | guides/italy-property-for-dutch-buyers ↔ guides/italy-property-for-scandinavian-buyers |
| 19% | areas/ancona ↔ areas/perugia |
| 19% | areas/ancona ↔ areas/campobasso |
| 19% | guides/italy-property-for-dutch-buyers ↔ guides/italy-property-for-germans |
| 19% | guides/italy-property-for-french-buyers ↔ guides/italy-property-for-germans |

The pages that cannibalise most widely: `areas/ancona` (6 pairs),
`areas/perugia` (5), `areas/campobasso` (5), `guides/italy-property-for-irish-buyers` (5).

Two structural facts fall out of this.

**The nationality cluster is one article written twelve times.** All twelve
`italy-property-for-<nationality>` pages score exactly zero, with cross-file
duplication from 7% to 33%. What differs between them is the passport in the
title; what is identical is the tax treatment, the closing-cost stack, the
mortgage paragraph and the region shortlist. A Dutch buyer and an Australian
buyer genuinely face different problems — non-EU stay limits, the Netherlands's
box-3 treatment of a foreign second home, currency and double-tax treaty
mechanics — and none of that is what these pages are about.

**The inland-town area pages are one article written for whichever town.**
Ancona, Perugia, Campobasso, Arezzo and Parma share 15-19% pairwise. The shared
material is the OMI-band paragraph, the yield range and the closing-cost stack:
national facts, restated on a town page, with the town's name substituted.

## The middle set has a page that did not get cleaned

`guides/italy-property-taxes-foreign-buyers-guide` was picked as an example of
prose the cleanup waves had rebuilt. It scores 0 where the rest of that set runs
up to 67. It carried 26 stamped lines at the garbage snapshot and still trips
the heading-echo gate today, so the cleanup that reached its neighbours stopped
short of it. It belongs in the queue, and it is a warning about how the previous
waves were verified: a page can pass a gate suite and still be the thing the
suite was built to find.

## What this diagnostic does not claim

The score is deterministic only. It tops out at 75, and the last twenty points to
the 95 ceiling sit behind a judge stage (`scripts/geo-judge.mjs`) that has not
been run here, because it needs `GEO_JUDGE_SECRET` set and a reader to do the
judging. A deterministic 60 is a good article, not a mediocre one.

Nothing here says a zero-scoring page is worthless to a reader. It says the page
is not distinguishable from its neighbours by any measure that survives
calibration, which is a different and more fixable complaint.

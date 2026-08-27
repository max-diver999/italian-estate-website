# GEO scoring on italian-estate.com

The rubric, the calibration, and every rule that was tried and thrown away.

The design is ported from `max-diver999/capetown-invest-website` (branch
`claude/capetown-content-audit-h6qbx7`, commit `90dc5e1`), whose own
`docs/GEO-SCORING.md` explains why a score has to be a ceiling lowered by
evidence rather than a sum of rewards. What follows is that design measured
against **this** corpus, because thresholds copied from another site are
decoration. Three of its rules did not survive the move, and two signals had to
be built that the reference never needed.

## Why the rubric on this site had to be replaced

The site scored itself with `scripts/lib/geo-citability-scorer.mjs`, which
averaged five properties of every H2 section: a 130-170 word paragraph
containing any figure earned "citability", a question-shaped heading earned
"structure", the words `is`, `are` or `typically` earned "answer quality".

Between June and August 2026 an agent was repeatedly told to raise that number.
The commit subjects say so: six commits titled *"raise 16 more guides to 90+ GEO
citability"*, then `bcaf8e7` *"GEO upgrade batches 1-10 and full corpus refresh"*
rewriting all 252 files in one pass. It worked. The old rubric put the result at
**91**.

Scoring the labelled sets with the rubric the site was still using:

| set | what it is | old score |
|---|---|---|
| `bad` | 61 files at commit `4360b18`, each carrying five or more lines the campaign pasted into three or more files | **mean 92.2** (min 85) |
| `good` | 12 articles written one at a time in the two new-article waves | **mean 93.1** (min 91) |
| `mid` | 7 legacy pages rebuilt semi-automatically by the cleanup waves | mean 90.9 |

Separation between provably-templated text and single-article writing: **0.9
points**. **55 of the 61** templated files scored at or above the worst
hand-written article. The reference site measured 0.3 points and 59 of 59; this
is the same failure, independently reproduced, on a different corpus in a
different language market.

## The labelled sets, and the mistake in the first attempt

`scripts/geo-calibrate.mjs --prepare` rebuilds all three from git.

**The first labelling was wrong and it is worth recording why.** It took the
whole corpus as it stood at `4360b18` — all 252 files — on the reasoning that
`bcaf8e7` had rewritten every one of them. But rewriting everything is not the
same as ruining everything. The holiday-let licensing guide sat in that set
scoring 46, and it opens:

> A worked example makes the layers concrete. A couple buying one apartment in
> Florence registers with the regional portal, waits 5 to 15 business days for
> the CIR, receives the national CIN 24 to 48 hours after the two databases
> sync, and pays a flat 21% Cedolare Secca on gross rent.

That is not garbage. Labelling it garbage teaches the rubric that concrete
writing is a defect, and it was the entire reason `bad.max` sat at 54 through
three rounds of tuning. Chasing that number by adding rules would have produced
a rubric that punishes the best pages on the site.

So membership is now decided by proof rather than by which commit touched a
file. A campaign commit's **stamped lines** are the lines it added to three or
more files at once, because a writer does not produce the same sentence three
times in a sitting and a template does nothing else. Across the nine campaign
commits there are **122** such lines; the worst was pasted into 29 files:

> Match budget, hold period, and income target to the district cluster that
> actually delivers those outcomes...

A file carrying five or more of them at the snapshot is in the set: **61 files**,
close to the reference site's 59 by coincidence rather than by design.

Two commits whose subjects match the campaign (`a0c4a38` "raise top 10 money
guides to 93+", `d90ab7e`) are deliberately **excluded**: their diffs contain no
line repeated even twice, so on the evidence they are single-article work that
happens to share a commit message. Including them on the strength of the subject
line is the same error in a different costume.

The criterion reads commit diffs and nothing else. It touches none of the
measures being calibrated, which matters: selecting the test set with the signal
under test is how a rubric proves itself and measures nothing.

### The honest limit of this labelling

Nobody on this project is a human writer. The `good` set was written by an agent,
one article at a time, with each fact checked against a primary source. The
contrast being measured is therefore **not** human against machine. It is *one
article written at a time* against *one template applied to every file*. That is
the distinction the rubric can actually make, and it is the one that matters
editorially, but it should be named rather than dressed up.

## What the deterministic stage measures here

| signal | machine (n=61) | written (n=12) | middle (n=7) | AUC |
|---|---|---|---|---|
| sentence shapes recurring in 3+ files, as a share | 0.091 | **0.000** | 0.009 | **1.000** |
| sections whose opener restates the heading (run of 3+) | 6.15 | 0.42 | 2.71 | 0.975 |
| section openers built as "*X* (typically) means..." | 0.636 | 0.022 | 0.056 | 0.956 |
| cross-file 9-gram duplication | see corpus report | | | |

Every one of the twelve written articles scores **exactly zero** on the first
row. The middle set sits between on all three, which is the check that the scale
is not simply binary.

## The two signals this corpus needed and the reference did not

### Sliding sentence shapes

The reference reduced each sentence to its first twelve words with numbers and
proper nouns blanked, then looked for collisions. That assumes the template's
fixed part comes first. The generator here does the opposite. It opens with the
page's own subject and puts the frame in the middle:

> **ARIA Ex Macello** typically means a 150,000 sqm Reinventing Cities district...
> **Alba overview** means the Barolo gateway combines truffle tourism...

Prefix comparison finds nothing: files that are template end to end reported 0 to
3 shared skeletons. Matching an eight-word shape at **any** offset finds a median
of 179 per machine file and zero in all twelve written ones.

Window size was chosen by measurement, not taste: six words separates
fractionally better (AUC 1.000 either way, but six collides on ordinary English),
ten scores 1.000, twelve drops to 0.984. Eight is the same window the
self-repetition check already uses.

The penalty runs on the **share**, not the count. Machine files carry a median of
179 collisions and the semi-automatic middle carries 33, so any coefficient
harsh enough to zero the first also zeroes the second — and the middle sitting
between is the only evidence that the scale measures degree rather than class.

### Openers that define their own heading

The Italian campaign's tell is a definition frame: the heading is
*"What Is ARIA Ex Macello Milan?"*, the opener is *"ARIA Ex Macello typically
means ..."*. It answers nothing and it is invisible to a heading-echo rule that
wants five contiguous words, because the generator rewrites rather than pastes.

Two changes follow. The echo run threshold drops from five to three, which is
where it starts separating (6.15 against 0.42) and where it stops before "buying
a" and "property in" make every article an echo of itself. And the frame itself
is measured directly: 63.6% of machine sections open that way against 2.2% of
written ones.

One echoing section is free. The written set contains articles with exactly one,
and they are not defects: a heading like *"What is a preliminare trascritto?"*
answered by naming the thing has nowhere else to start.

## Two extraction bugs that made the detector blind

Neither is a rule. Both are the detector failing to read text that is on the page,
which is worse than a bad rule because it produces confident silence.

**FAQ answers were invisible.** Duplication recovers prose hidden in component
props, but only in JSX attribute form (`text="..."`). This corpus passes its FAQ
as an array of object literals — `<FaqBlock items={[{ question: "...", answer:
"..." }]}>` — which left **94,318 words, 12.2% of the corpus, on 264 of 272
files** outside every duplication measure. That is the same hole a red team once
walked through on the reference site, arrived at here by ordinary convention
instead of by attack. Both shapes are now recovered, and because the older
snapshots keep their FAQ in YAML front matter rather than in a component, the
same fix reads both eras symmetrically — which the labelled sets require, or the
two classes would be measured with different rulers.

**Figures written in words did not count.** The figure pattern matched `€1,500`
and `10%` but not `1,500 EUR` or `10 percent`, which is 5.2% and 6.9% of all
figures in the machine snapshot. The cost was not marginal: `10 to 15 percent` is
stamped across 131 files and earned no stamped-figure penalty at all, because it
was never seen. Spellings now normalise to one key, since `10 percent` and `10%`
are the same claim and a source covering one covers both. The pattern also lived
in three separate copies, which is how a port half-works — saturation detection
notices a stamped figure while provenance never asks anyone to source it — so it
is now defined once.

## What was tried and rejected

Measured on the final labelled sets. Recorded so nobody re-adds them on
intuition, which is exactly how the first rubric was built.

| candidate | machine | written | middle | AUC | why rejected |
|---|---|---|---|---|---|
| question-shaped headings | 0.813 | 1.000 | 0.913 | 0.156 | **backwards, and already in the rubric as a reward.** Both classes are near the ceiling, so the 8 points it pays are close to free for everyone. It survives only because removing it would cost the written set more than the machine set |
| opener length uniformity | 0.637 | 0.695 | 0.197 | 0.458 | no information, and the middle sits *below both*, so whatever it measures is not this |
| sentence-tail qualifier pile-ups (3+ phrases) | 2.68 | 0.72 | 1.37 | 0.841 | looked adopted on the first, over-inclusive labelling (0.885); on the corrected sets it falls below the bar. Wiring it in moves separation by 0.1 of a point and costs the middle set 0.9, which is a tax on prose rather than a check on templates. Still reported in `--explain` |
| same, requiring 4+ phrases | 0.55 | 0.14 | 0.19 | 0.710 | stricter and worse, the usual sign a rule is measuring rarity |
| share of openers ending in a qualifier pile | 0.107 | 0.012 | 0.019 | 0.746 | weak |
| repeated figure pairs across an article's sections | 0.489 | 0.246 | 0.274 | 0.827 | weak, and largely a restatement of stamped figures |
| generic audience tail ("for foreign buyers") | 0.981 | 0.046 | 0.104 | 0.788 | weak on its own; the debrand pass had already removed much of its habitat |
| commonest 4-word opener shape at any offset | 0.598 | 0.297 | 0.227 | 0.841 | below the bar, and the middle sits below both |
| opener restarts with the heading's first content word | 0.490 | 0.182 | 0.312 | 0.832 | below the bar |
| definition-frame verbs anywhere in the article | 3.82 | 0.63 | 0.35 | 0.949 | separates, but the middle sits *below* the written set, so the article-wide version is measuring something other than degree. The opener-scoped version was adopted instead |
| literal campaign phrases ("buyer scenario", "quick answer for") | 2.71 | 0.000 | 0.055 | 0.877 | separates cleanly and is still rejected: it recognises one campaign's vocabulary, not templated writing. The next generator picks different words and the rule reads clean. The structural rules catch the same files |
| six-word sentence shapes | | | | 1.000 | equal separation to eight, rejected because six-word shapes collide on ordinary English and a rule that caps a score has to be wrong less often than it is right |

The reference site's rejected list (opener length 18-70 words, opener not
starting with a pronoun, a figure in the first sentence, sentence-length
variance, "numbers must sit in a table") was not re-measured here. Those rules
are not in the ported code, and re-litigating them would be work with a known
answer.

## The rules that punish correct writing, and what was done about them

The unit-mismatch check arrived naming `occupancy`, `LTV` and `vacancy` as nouns
a figure cannot attach to. All three are ordinary Italian-market usage here:
`70% occupancy` appears 89 times in legitimate sentences and a mortgage guide
writing `60% loan-to-value` is simply correct. Left alone, a score-capping gate
would have been armed against good writing on day one.

The heads were rebuilt from measurement. A sweep of all 272 articles for a figure
followed by an abstract noun returned **six** constructions in the whole corpus,
and every one was legitimate (`€15,000 due diligence`, `€180,000 closing and
diligence`). So the replacement heads are words measured to be absent after a
figure anywhere in this corpus. The rule fires on **0 of 272 files** today, which
is the correct reading of a corpus whose defect is duplication rather than
malformed arithmetic. It stands as a tripwire, not as a finding.

## Calibration

`node scripts/geo-calibrate.mjs`. The implementation must hold:

- garbage `max <= 25`
- written `min >= 55`
- separation `>= 35` points

Current state:

| set | n | mean | min | max |
|---|---|---|---|---|
| bad | 61 | **0.2** | 0 | **11** |
| good | 12 | **65.1** | **61** | 69 |
| mid | 7 | 52.6 | 11 | 72 |

Separation **64.8 points**; **0 of 61** machine files reach the worst written
one. Ordering is correct: written > semi-automatic > machine.

Adding the three new signals cost the written set **nothing** — it scored 65.1
mean, 61 min both before and after — because every threshold sits at that set's
observed maximum rather than wherever the numbers needed it to be. That
invariance is the evidence the thresholds are honest.

### Two checks that a passing calibration still needs

**Set size.** The machine set has 61 peers to collide with and the written set
has 12, and corpus-level signals get stronger with more peers, so the split could
in principle be an artefact of arithmetic. Scoring five deterministic 12-file
subsamples of the machine set against 11 peers each gives means of 2.9, 4.7, 3.2,
0.3 and 1.3 against the written set's 65.1. It is not the set size.

**The middle set has an outlier.** `italy-property-taxes-foreign-buyers-guide`
scores 11 where the rest of the middle runs 59 to 72. That is not a labelling
error to be tidied away: the page carried 26 stamped lines at the snapshot and
still trips the heading-echo gate at HEAD, so the cleanup that reached its
neighbours did not finish on it. It is a finding, and it belongs in the rewrite
queue.

## Commands

```bash
npm run geo:score                              # whole corpus, ranked, with gates
node scripts/geo-score.mjs <file.mdx> --explain # one article, every penalty
npm run geo:calibrate                          # does the rubric still separate the labelled sets?
node scripts/geo-calibrate.mjs --old           # what the previous rubric scored
npm run geo:cannibals                          # page pairs sharing too much text
npm run geo:signals -- <candidates.mjs>        # measure a proposed rule before believing it
npm run facts:review                           # are the foreign-jurisdiction claims still in date?
```

The last two are the ones that keep this honest. A rule that has not been through
`geo:signals` on the labelled sets is an opinion, and this document is a list of
opinions that turned out to be wrong.

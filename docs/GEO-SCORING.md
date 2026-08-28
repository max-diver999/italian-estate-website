# GEO scoring on italian-estate.com

The rubric, the calibration, every rule that was thrown away, and the two places
where it is still weak.

The design is ported from `max-diver999/capetown-invest-website` (branch
`claude/capetown-content-audit-h6qbx7`, commit `90dc5e1`), whose own
`docs/GEO-SCORING.md` explains why a score has to be a ceiling lowered by
evidence rather than a sum of rewards. What follows is that design measured
against **this** corpus, because thresholds copied from another site are
decoration. Three of its rules did not survive the move, two signals had to be
built that it never needed, and two of its mechanics were quietly broken here.

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
| `bad` | 46 files at `4360b18` where the campaign wrote 5%+ of the prose lines verbatim | **mean 92.0** (min 85) |
| `good` | 12 articles written one at a time in the two new-article waves | **mean 93.1** (min 91) |
| `mid` | 7 legacy pages rebuilt semi-automatically by the cleanup waves | mean 90.9 |

Separation between provably-templated text and single-article writing: **1.0
point**. **41 of the 46** templated files scored at or above the worst
hand-written article. The reference site measured 0.3 points and 59 of 59; this
is the same failure, independently reproduced, on a different corpus in a
different market.

## The labelled sets, and the two mistakes made building them

`scripts/geo-calibrate.mjs --prepare` rebuilds all three from git. It took three
attempts and both wrong turns are recorded, because each one would have produced
a rubric that punishes the wrong thing.

**First attempt: the whole corpus at the snapshot.** All 252 files, on the
reasoning that `bcaf8e7` rewrote every one of them. But rewriting everything is
not ruining everything. The holiday-let licensing guide sat in that set scoring
46, and it opens:

> A worked example makes the layers concrete. A couple buying one apartment in
> Florence registers with the regional portal, waits 5 to 15 business days for
> the CIR, receives the national CIN 24 to 48 hours after the two databases
> sync, and pays a flat 21% Cedolare Secca on gross rent.

That is not garbage. Labelling it garbage teaches the rubric that concrete
writing is a defect, and it was the entire reason `bad.max` sat at 54 through
three rounds of tuning.

**Second attempt: five stamped lines.** A campaign commit's **stamped lines** are
the lines it added to three or more files at once, because a writer does not
produce the same sentence three times in a sitting and a template does nothing
else. Across the nine campaign commits there are **122** such lines, the worst
pasted into 29 files:

> Match budget, hold period, and income target to the district cluster that
> actually delivers those outcomes...

Requiring five of them gave 61 files — and left the same error one layer down.
Five pasted lines mean different things in an 80-line page and a 250-line one.
`lake-como-property-investment-guide` has five, which is 2.4% of its prose; the
other 97.6% is its own text. `ancona-vs-urbino` has seven, which is 8.8%, and
reads as template throughout.

**Third and current: five lines AND 5% of prose lines.** The distribution has a
shape to cut on rather than a number to pick: 66 files under 2%, 47 between 2%
and 5%, then a separate mass of 52 from 5% up to 27%. That gives **46 files**.

Because this is the third pass at the labelling and each pass moved the gate
closer to passing, the numbers under the previous rule are reported here too:
at five lines regardless of share, `bad.max` is **35**, driven by
`lake-como-property-investment-guide`. Nobody should have to dig for that.

Two commits whose subjects match the campaign (`a0c4a38` "raise top 10 money
guides to 93+", `d90ab7e`) are deliberately **excluded**: their diffs contain no
line repeated even twice, so on the evidence they are single-article work that
happens to share a commit message.

The criterion reads commit diffs and nothing else. It touches none of the
measures being calibrated, which matters: selecting the test set with the signal
under test is how a rubric proves itself and measures nothing.

### Sets are scored against a corpus, not against themselves

The reference scored each labelled set as though it were the whole site. That
was the third error here, and it is the one worth carrying back upstream.

Corpus-level signals starve on a sample. `ancona-centro-apartments` shows 16
shared sentence shapes and 1% duplication against its 60 labelled peers, and
**249 shapes and 14.5% duplication** against the corpus it actually lives in —
41 with no gates in the first case, 0 with two gates in the second. The rubric's
whole thesis is that templating is invisible per file and obvious across a
corpus, so measuring it on a subset measures the wrong thing and then blames the
rubric.

The garbage set is now scored against the full 252-file snapshot and the two
present-day sets against the full 272-file site, which is also exactly what
`geo-score.mjs` does in production. Only the labelled files are reported.

### The honest limit of this labelling

Nobody on this project is a human writer. The `good` set was written by an agent,
one article at a time, with each fact checked against a primary source. The
contrast being measured is therefore **not** human against machine. It is *one
article written at a time* against *one template applied to every file*. That is
the distinction the rubric can actually make, and the one that matters
editorially, but it should be named rather than dressed up.

## The two signals this corpus needed and the reference did not

| signal | machine | written | middle | AUC |
|---|---|---|---|---|
| sentence shapes recurring in 3+ files, as a share | 0.091 | **0.000** | 0.009 | **1.000** |
| section openers built as "*X* (typically) means..." | 0.636 | 0.022 | 0.056 | 0.956 |
| sections whose opener restates the heading (run of 3+) | 6.15 | 0.42 | 2.71 | 0.975 |

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

Window size was chosen by measurement: six words scores the same and was
rejected because six-word shapes collide on ordinary English; ten scores the
same, twelve drops to 0.984. Eight is the window the self-repetition check
already uses.

The penalty runs on the **share**, not the count. Machine files carry a median of
179 collisions and the semi-automatic middle carries 33, so any coefficient harsh
enough to zero the first also zeroes the second — and the middle sitting between
is the only evidence the scale measures degree rather than class.

### Openers that define their own heading

The campaign's tell is a definition frame: the heading is *"What Is ARIA Ex
Macello Milan?"*, the opener is *"ARIA Ex Macello typically means ..."*. It
answers nothing and it is invisible to a heading-echo rule wanting five
contiguous words, because the generator rewrites rather than pastes.

The echo run threshold therefore drops from five to three, which is where it
starts separating (6.15 against 0.42) and where it stops before "buying a" and
"property in" make every article an echo of itself. One echoing section is free:
the written set contains articles with exactly one and they are not defects, as a
heading like *"What is a preliminare trascritto?"* answered by naming the thing
has nowhere else to start.

## Where this rubric is weak, measured

An adversarial pass was run against every adopted signal. Two results matter and
neither is comfortable.

**The definition-frame rule dies to one substitution, and the calibration
currently depends on it.** Replacing six verbs across the corpus
(`means` → `comes down to`, `involves` → `is built around`, `requires` → `asks
for`) drops its AUC from 0.956 to 0.417 while the text stays visibly identical:
*"Quick answer for Ancona comes down to the Marche regional capital averages
about €1,541 per sqm..."* — same frame, same slot, same seam.

Measured end to end on the evaded snapshot, the **system** mostly holds: the
frame gate stops firing entirely (34 files to 0), but the corpus-level gates
carry 45 of the 46 files, and exactly one, `areas/taormina`, escapes to 46. So
`bad.max` goes from 0 to 46 under a one-command paraphrase, on one file, and
ablation confirms the dependency: removing the frame rule leaves `bad.max` at 38.

This document already rejects "literal campaign phrases" on exactly this
reasoning. The frame rule is a narrower version of the same thing, kept because
it earns its place against the corpus as it stands, and named here as the weakest
load-bearing part of the rubric. Anyone strengthening this rubric should start
here, and should not be reassured by the headline `bad.max 0`.

**Heading rules die when headings are rebuilt.** A script that reads no prose at
all — rebuilding each H2 from its own section's rarest words and permuting
section order — takes heading-echo from AUC 0.975 to 0.413 while
`sliding-skeleton-collisions` stays put at 264. Heading rules are dilution-proof
(appending a page-specific tail leaves AUC at 0.992) but replacement-vulnerable.
This matters less than it sounds, because ablation shows heading-echo is *not*
load-bearing: without it `bad.max` is 4 rather than 0.

## What was tried and rejected

Measured on the labelled sets. Recorded so nobody re-adds them on intuition,
which is exactly how the first rubric was built.

| candidate | machine | written | middle | AUC | why rejected |
|---|---|---|---|---|---|
| question-shaped headings | 0.813 | 1.000 | 0.913 | 0.156 | **backwards, and already in the rubric as a reward.** Both classes sit near the ceiling, so its 8 points are close to free for everyone. It survives only because removing it would cost the written set more than the machine set |
| opener length uniformity | 0.637 | 0.695 | 0.197 | 0.458 | no information, and the middle sits *below both* |
| mean opener length | 41.9 | **49.0** | 26.6 | 0.213 | **backwards.** Hand-written openers are longer, not shorter — the visual impression that machine sections are "one huge sentence" is simply wrong |
| commas per opener | 2.89 | **4.05** | 1.91 | 0.223 | backwards, same reason |
| single-sentence sections | 0.010 | 0.000 | 0.017 | 0.549 | no information; the middle is above the machine set |
| opener carries 60%+ of its section | 0.020 | 0.000 | 0.017 | 0.582 | no information |
| topic restart + 40-word opener | 0.211 | 0.158 | 0.045 | 0.607 | no information |
| section length uniformity | 0.648 | 0.588 | 0.556 | 0.654 | no information |
| sentence-tail qualifier pile-ups (3+ phrases) | 2.68 | 0.72 | 1.37 | 0.841 | looked adopted on the over-inclusive labelling (0.885); on corrected sets it falls below the bar. Wiring it in moves separation by 0.1 of a point and costs the middle 0.9, which is a tax on prose. Still reported in `--explain` |
| same, requiring 4+ phrases | 0.55 | 0.14 | 0.19 | 0.710 | stricter and worse, the usual sign a rule measures rarity |
| repeated figure pairs across sections | 0.489 | 0.246 | 0.274 | 0.827 | weak, and largely restates stamped figures |
| generic audience tail ("for foreign buyers") | 0.981 | 0.046 | 0.104 | 0.788 | weak on its own |
| commonest 4-word opener shape at any offset | 0.598 | 0.297 | 0.227 | 0.841 | below the bar, middle below both |
| opener restarts the heading's first content word | 0.490 | 0.182 | 0.312 | 0.832 | below the bar |
| definition-frame verbs anywhere in the article | 3.82 | 0.63 | 0.35 | 0.949 | separates, but the middle sits *below* the written set, so the article-wide version measures something other than degree. The opener-scoped version was adopted instead |
| literal campaign phrases ("buyer scenario", "quick answer for") | 2.71 | 0.000 | 0.055 | 0.877 | separates cleanly and is still rejected: it recognises one campaign's vocabulary, not templated writing |
| article starvation (words per `the`/`a`) | 46.7 | 7.5 | 20.7 | 1.000 | **the most interesting rejection.** A 60-line regex that inserts determiners without touching a fact, a structure or a template flips it to AUC 0.040 — the machine corpus scores *better than* hand-written — while sentence-shape collisions rise 66%. The rewrite that satisfies the rule increases the property the rule proxied for. Its perfect AUC is also one article wide (machine min 8.842, written max 8.820), and a provably stamped file, `imu-property-tax-italy`, already passes it in fluent English |
| content words per function word | 3.52 | 1.64 | 2.63 | 1.000 | same family, same evasion, survives one pass of it rather than none |
| long noun-stack share | 0.244 | 0.102 | 0.187 | 1.000 | same family |
| pronoun / relativiser drought, glue-vs-argument connectives, determinerless subjects, hyphenated modifiers | | | | 0.933–0.990 | same family: all measure "prose is compressed", all defeated by the same rewrite, and they correlate at ρ 0.73–0.85 with each other. Eight rules, one axis |
| heading order / heading inventory collisions | 0.458 | 0.010 | | 0.992–0.997 | correlate at ρ 0.93 with each other, and a script that never reads the body text rebuilds headings and takes both to zero |
| six-word sentence shapes | | | | 1.000 | equal separation to eight, rejected because six-word shapes collide on ordinary English |

## A mechanic that had to be fixed before any of this could be measured

`requireRegistry: false` is meant to make calibration independent of registry
state. It switched off the provenance reward but not the stamped-figure penalty,
and the consequence was not subtle: scored against the live corpus, **every one
of the twelve hand-written articles lost exactly 24 points** — six penalties of
four — for using `5%`, `20%` and `€400,000`, ordinary figures the campaign had
sprayed across 86 to 169 pages and never sourced. `good.min` read 46 and the
rubric appeared to fail its own written set.

In production that is the rule working: it says go and source the numbers the
site leans on, and the fix is a registry entry rather than a rewrite. In
calibration it meant the same text scored differently depending on how much
sourcing had happened that week. The penalty is now under the same flag as the
reward.

## Two extraction bugs that made the detector blind

Neither is a rule. Both are the detector failing to read text that is on the page,
which is worse than a bad rule because it produces confident silence.

**FAQ answers were invisible.** Duplication recovers prose hidden in component
props, but only in JSX attribute form (`text="..."`). This corpus passes its FAQ
as an array of object literals — `<FaqBlock items={[{ question: "...", answer:
"..." }]}>` — which left **94,318 words, 12.2% of the corpus, on 264 of 272
files** outside every duplication measure. Both shapes are now recovered, and
because the older snapshots keep their FAQ in YAML front matter, the same fix
reads both eras symmetrically — which the labelled sets require, or the two
classes would be measured with different rulers.

**Figures written in words did not count.** The figure pattern matched `€1,500`
and `10%` but not `1,500 EUR` or `10 percent`, which is 5.2% and 6.9% of all
figures in the machine snapshot. `10 to 15 percent` is stamped across 131 files
and earned no penalty at all, because it was never seen. Spellings now normalise
to one key, and the pattern, which lived in three copies, is defined once.

## Rules that were punishing correct writing

The unit-mismatch check arrived naming `occupancy`, `LTV` and `vacancy` as nouns
a figure cannot attach to. All three are ordinary Italian-market usage here:
`70% occupancy` appears 89 times in legitimate sentences and a mortgage guide
writing `60% loan-to-value` is simply correct. Left alone, a score-capping gate
would have been armed against good writing on day one.

The heads were rebuilt from measurement. A sweep of all 272 articles for a figure
followed by an abstract noun returned **six** constructions in the whole corpus,
every one legitimate (`€15,000 due diligence`, `€180,000 closing and diligence`).
The replacement heads are words measured to be absent after a figure anywhere in
this corpus. The rule fires on **0 of 272 files** today, which is the correct
reading of a corpus whose defect is duplication rather than malformed arithmetic.
It stands as a tripwire, not as a finding.

## Calibration

`npm run geo:calibrate`. The implementation must hold:

- garbage `max <= 25`
- written `min >= 55`
- separation `>= 35` points

Current state:

| set | n | mean | min | max |
|---|---|---|---|---|
| bad | 46 | **0.0** | 0 | **0** |
| good | 12 | **70.8** | **65** | 75 |
| mid | 7 | 27.6 | 0 | 67 |

Separation **70.8 points**; **0 of 46** machine files reach the worst written
one. Ordering is correct: written > semi-automatic > machine.

Two things this table does not say, and both are above: `bad.max` becomes **46**
under a six-verb paraphrase, and it is **35** under the previous labelling rule.

### Set size is not what is doing the work

The machine set has 251 peers and the written set has 271, and corpus signals
strengthen with peers, so the split could be arithmetic. Scoring five
deterministic 12-file subsamples of the machine set against 11 peers each gives
means of 2.9, 4.7, 3.2, 0.3 and 1.3 against the written set's 65.1 under the same
isolated conditions. It is not the set size.

### The middle set has an outlier, and it is a finding

`italy-property-taxes-foreign-buyers-guide` scores 0 where the rest of the middle
runs to 67. It carried 26 stamped lines at the snapshot and still trips the
heading-echo gate today, so the cleanup that reached its neighbours did not finish
on it. A page can pass a gate suite and still be the thing the suite was built to
find.

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

The last two keep this honest. A rule that has not been through `geo:signals` on
the labelled sets is an opinion, and the table above is a list of opinions that
turned out to be wrong — including three that scored a perfect 1.000 and were
still rejected.

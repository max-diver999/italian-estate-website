# The channel that works is Bing, and 38 URLs were never submitted

**Date:** 2026-09-07
**Data:** Bing Webmaster 3 July to 4 September 2026 (10 weekly buckets); Search Console 9 June to 4 September 2026.

## The two channels, side by side

| | Bing | Google |
|---|---|---|
| Impressions | 4,237 | far higher, mostly on pages that convert nothing |
| Clicks | 141 | roughly 40 |
| Pages earning anything | 95 | 255 |
| Distinct queries visible | 718 | 200, the rest anonymised |
| Average impression position | 4.41 | 5 to 90 depending on page |

Bing returns about three and a half times the clicks. That is not new; what is new is the shape of the queries behind it.

## The Bing queries are not search queries

718 distinct queries, median length **7 words**, 41% of eight words or more, 29% beginning with a question word. A representative sample:

- "a cin (codice identificativo nazionale) code is mandatory for operating short-term rental properties" (41 impressions)
- "as of july 2026, residential properties in rome's historic and prime tourist areas, such..." (24)
- "how old does a house in italy have to be to be exempt from permit requiremnts"
- "can a uk citizen elect for english law to apply to property owned in italy?"
- "what are thr additional costs for agent notary etc when purchasing a propwety in..."

The first two are passages, not questions. Copilot sends the sentence it is trying to ground. The misspellings in the others are what people type when they are talking to an assistant rather than to a search box.

The site is being used as a retrieval source, and it sits at average position 4.41 when it is. The low click rate is partly the nature of the channel: the citation is the win, and the click often never comes.

One caveat on the totals. A single generic query, "what is a property tax", carries 239 impressions with no clicks, 13% of the Bing impressions and of no commercial value. The real base is nearer 1,555 across 717 queries, which is a very flat tail.

## What the demand clusters into

| Cluster | Impressions | Clicks | Distinct queries |
|---|---|---|---|
| CIN and short-let licensing | 175 | 6 | 52 |
| 1 euro houses | 109 | 12 | 57 |
| Reciprocity and foreign ownership | 102 | 5 | 35 |
| Annual property tax, IMU and TARI | 98 | 8 | 50 |
| Purchase costs and closing taxes | 96 | 2 | 21 |
| Visas and residency | 72 | 7 | 30 |
| Inheritance and succession | 65 | 5 | 41 |
| Capital gains and selling | 38 | 7 | 31 |
| Heritage and vincolo | 32 | 3 | 9 |
| Building compliance | 28 | 8 | 14 |
| Unclassified long tail | 718 | 79 | 364 |

The corpus already answers all of it. The short-let pages cover CIN, the CIR against CIN distinction, SCIA, SUAP, fines, tourist tax and DAC7. This is not a content gap.

## The finding that is actionable: 38 URLs never submitted

The sitemap holds **317 URLs**. `submitted-urls.json` holds **293 distinct** ones. The difference is 38, and the queue state file has been stale since 15 June 2026, when the sitemap held 50.

Twenty of the 38 are guides, and they are the last two waves in full:

`1-euro-houses-italy`, `abusi-edilizi-buying-property-italy`, `agibilita-certificate-italy`, `caparra-confirmatoria-italy-deposit`, `condominio-rules-foreign-owners`, `condominium-fees-italy`, `energy-class-ape-italy-property`, `geometra-role-italy-property`, `italy-digital-nomad-visa`, `italy-golden-visa`, `italy-property-insurance-guide`, `moving-to-italy-from-uk`, `preliminare-trascritto-italy`, `retire-in-italy`, `rogito-italian-deed-of-sale`, `salva-casa-decree-property-buyers`, `seismic-zones-italy-property`, `superbonus-aftermath-property-buyers`, `usucapione-adverse-possession-italy`, `visura-catastale-italy-explained`

The other 18 are 17 `property-for-sale` facet pages and `image-credits`.

The batch is written to `scripts/indexing-batch-pending.json`. It is **not submitted**: indexing needs Maxim and Cursor, and it has to follow the deploy or the submitted URLs serve the old page.

## Four hypotheses tested and discarded

Recorded because each looked convincing and none survived, and acting on any of them would have cost a wave.

1. **The two short-let pages are duplicates Google is suppressing.** `short-term-rental-rules-italy` earns 238 Bing impressions and 7 clicks, the site's third best, and **zero Google impressions in 88 days**, while the overlapping `italy-holiday-let-licensing` earns 227. Measured: the pages share **17 eight-token shapes out of 3,408 and 3,107**, which is 0.5%. They are not textual duplicates, and the page was submitted for indexing.
2. **The www and non-www hosts are splitting signals.** Fifteen www URLs carry impressions and the canonicals point at non-www. But `vercel.json` already 301s the whole www host. Historical, resolving on its own.
3. **The unsubmitted pages explain the invisible ones.** `short-term-rental-rules-italy` and `buy-property-italy-foreigner` are both in the submitted set and both invisible in Google.
4. **The zero-click pages have weak titles.** They do not. `non-resident-mortgage-italy` carries LTV bands, named banks and an approval window in 147 characters.

What remains unexplained is why several pages Bing ranks in the top five are invisible in Google. The site has no Google authority to spend, which is the diagnosis already on the table and the one Maxim has decided not to buy his way out of. The Bing evidence says that decision costs less than it looks: the channel that is working is the one that reads the corpus rather than the one that counts links into it.

## What follows

1. Submit the 38, after the deploy, with Maxim and Cursor.
2. Keep the queue state current, since it went six weeks and 267 URLs out of date without anyone noticing.
3. Keep writing for retrieval. The 41% of Bing queries running to eight words or more are answered by dense, specific, dated prose, which is what the GEO scoring has been pushing the corpus toward anyway.

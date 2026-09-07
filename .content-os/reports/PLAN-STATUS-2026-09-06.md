# Audit plan: what is done, what is left, what should be struck

Status of the 64-item plan in `seo-demand-2026-09-06-data/plan.json`, checked against the live site, `vercel.json` redirects, the built facet routes and Search Console.

## Headline

| Action | Items | Done | Left | Plan demand |
|---|---|---|---|---|
| создать | 23 | 6 | 17 | 58,150 |
| склеить | 26 | 0 | 26 | 47,870 |
| переделать | 6 | 2 | 4 | 4,867 |
| оставить | 7 | 5 | 2 | 5,970 |
| закрыть | 2 | 0 | 2 | 0 |

Read the demand column as **market volume for those queries**, not traffic at risk. That distinction turns out to matter more than anything else below.

## 1. The 26 merges: nothing to consolidate

All 26 are untouched, but the reason to do them has weakened. The `invest-*` sources were already redirected in an earlier wave. What remains is merging **guides and area pages** into the facet pages, and those pages earn almost nothing:

**All 17 merge-source pages for the top six regions together earn 37 impressions**, and 37 of those come from one page (`abruzzo-property-investment-guide`). The other sixteen earn zero.

So a merge here consolidates no equity, because there is none. It is a presentation decision, not a rescue. It is also destructive: the Tuscany merge alone deletes `/areas/chianti/`, `/areas/val-dorcia/` and `/areas/versilia/`.

**Recommendation:** do not run these merges as planned. Redirect only where a page is genuinely thin and duplicative, decided one at a time. The facet pages for the eight big regions already exist and can compete without deleting the area pages behind them.

## 2. The 17 remaining "create" items: mostly blocked by the catalogue, not by writing

| Item | Demand | Status |
|---|---|---|
| `/property-for-sale/cheap-property-italy/` | 1,730 | **Buildable now.** 12 projects under EUR 200k, 16 under EUR 250k |
| `/living/permesso-di-soggiorno/` | 1,600 | **Strike it.** SERP is 7/10 government and reference; navigational intent |
| `/property-for-sale/sorrento/` | 970 | Blocked: 2 projects, needs 3 |
| `/property-for-sale/land-for-sale-italy/` | 910 | Blocked: no land in the catalogue |
| `/property-for-sale/positano/` | 790 | Blocked: 0 projects |
| `/property-for-sale/amalfi-coast/` | 770 | Blocked: 0 projects |
| `/property-for-sale/vineyards-for-sale-italy/` | 600 | Blocked: 1 project |
| `/living/cost-of-living-rome-milan-florence/` | 580 | **Writable now** |
| `/property-for-sale/capri/` | 460 | Blocked: 0 projects |
| `/taxes/` hub | 390 | **Writable now** |
| `/property-for-sale/castles-for-sale-italy/` | 370 | Blocked: 0 projects |
| `/property-for-sale/verona/` | 360 | Blocked: 0 projects |
| `/property-for-sale/ravello/` | 230 | Blocked: 0 projects |
| `/living/international-schools-italy/` | 210 | **Writable now** |
| `/property-for-sale/orvieto/` | 200 | Blocked: 0 projects |
| `/living/healthcare-italy-foreigners/` | 150 | **Writable now** |
| `/property-for-sale/farmhouses-trulli-masserie-italy/` | 90 | Effectively done as `/property-for-sale/farmhouses/` |

**Seven town pages and three theme pages, about 4,500 searches a month, are blocked by catalogue depth rather than by writing.** The rule is three listings minimum, and outside Milan (12), Ostuni (6) and Rome (4) every area has one or two. Building them anyway would mean publishing empty pages, which the generator was deliberately built to refuse.

That is a sourcing decision for the business: adding stock in Amalfi, Capri, Positano, Sorrento and Verona unlocks about 3,580 searches a month of facet pages that cannot exist today.

## 3. The 4 remaining "rework" items

| Item | Demand | Note |
|---|---|---|
| `/property-for-sale/one-euro-houses-italy/` | 1,610 | Move `/guides/italy-1-euro-homes-program/` under the property tree. The page exists and earns nothing |
| `/guides/italy-elective-residence-visa/` | 460 | Drop `-property` from the slug, as was done for the golden visa |
| `/guides/` index | 434 | The listing intercepts 55 tax queries that should land on articles |
| `/projects/` x65 | 263 | Project-name demand is zero across all 65. They are catalogue, not search targets |

## 4. The 2 "close" items, both untouched

26 `/compare/` pages and 13 `/developers/` pages with zero demand. Three compare pages were marked keep and have since been improved. The rest are candidates for noindex rather than deletion, since several now score well and carry internal links.

## 5. What has been added that was not in the plan

Four pages written this session against evidence gathered after the plan: `retire-in-italy` (~1,810), `italy-golden-visa` (1,300, an upgrade and rename rather than a new page), `italy-digital-nomad-visa` (1,000), `moving-to-italy-from-uk` (590). About 4,700 searches a month.

## The honest summary

The plan's biggest number, 47,870 against the merges, is the one to discount: those pages hold no traffic to consolidate. The second biggest, the town and theme facets, is blocked by stock rather than by writing. What is genuinely left and actionable is **one buildable facet (1,730), four writable pages (about 1,330), and four reworks (about 2,700)**.

---

# Final position, after working the plan to its end

## What was done against the plan

| Item | Result |
|---|---|
| `1 euro houses` rework | Renamed to `/guides/1-euro-houses-italy/`, inbound links 3 to 6, two fabricated statistics removed. 58 to 59/75 |
| `retire-in-italy` rework | Written as a new page and the old `italy-retirement-property-guide` (6/75) merged into it with a 301 |
| `italy-digital-nomad-visa` rework | Written as a new page. The old property-framed guide left in place, see deferrals |
| `/guides/` index interception | Diagnosed. One of three causes was actionable and fixed |
| Golden visa, digital nomad, retire, moving from UK | Four pages, about 4,700 searches a month |

## What was rejected, on evidence

**`/property-for-sale/cheap-property-italy/` (1,730).** Portals hold three to five of ten on the query and Gate-away ranks with a `max_price=50000` filter. Our cheapest listing is EUR 130,000. The page would have been a claim we cannot support.

**`/living/permesso-di-soggiorno/` (1,600).** SERP is seven of ten government and reference. Navigational intent, not property.

**Close 65 `/projects/` pages.** The plan said project-name demand is zero across all 65, which was true of the Semrush core and **false in Search Console**: twelve pages earn 268 impressions, 19% of the site total, and `feel-uptown-milan` sits at position 6 on its brand query. Semrush simply does not index queries this small. Rejected.

**Close 26 `/compare/` and 13 `/developers/` pages.** Both earn little or nothing, but neither is thin and both hold internal links. Absence of demand is not harm, and noindexing has no upside here.

**City cost-of-living pages (1,110).** Numbeo and Expatistan hold the top three on every city query, and a useful page needs real per-city price data. We have no source for it that is not a competitor's database, and inventing the numbers is the failure mode this session has been correcting all day. Not written. Instead, the national page now states the basis of its bands explicitly: editorial estimates, not a survey, with the citable rates named separately.

**`/taxes/` hub (600) and healthcare (110).** Both would cannibalise pages that already exist and now score 54 and above.

## What is deferred, and why

**Renaming `italy-elective-residence-visa-property`.** Sound in principle. Two of its fifteen inbound files score 0 and 6, and touching them forces full rewrites plus `areas/turin` at 28. Three files of work for a slug change on a query where we rank nowhere.

**Seven town facets and three theme facets, about 4,500 searches a month.** Blocked by catalogue depth, not by writing. Sorrento has two listings and needs three; Positano, Amalfi, Capri, Verona, Ravello and Orvieto have none. This is a sourcing decision for the business.

**International schools (210).** Writable, but needs per-school verification for a small return.

## The honest total

Of the plan's headline 116,000 of combined demand, the genuinely actionable remainder after evidence is small. The large numbers were market volume attached to pages that hold no traffic, to merges with nothing to consolidate, or to facets the catalogue cannot fill. What moved this session was four new pages, four reworks, and the removal of five fabricated statistics from pages people use to make legal and financial decisions.

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

# -*- coding: utf-8 -*-
"""Replace stamped-repeat blocks with section-specific content.

These pages appended one identical block after almost every section: the same
3-bullet checklist 14 times in the flagship guide, 13 in the residency guide,
9-10 elsewhere. Deleting the copies would cut ~600 words of a page's measured
length, so each copy is replaced by content that belongs to ITS section; one
copy is kept where the generic checklist genuinely fits.

Keyed by occurrence index, not line number, so it survives upstream edits.
"""
import io, sys

def apply(path, anchor, span, blocks, expect_total):
    lines = io.open(path, encoding="utf-8").read().split("\n")
    idx = [i for i, l in enumerate(lines) if l == anchor]
    assert len(idx) == expect_total, f"{path}: expected {expect_total} occurrences, found {len(idx)}"
    for occ in sorted(blocks, reverse=True):          # bottom-up keeps indices valid
        i = idx[occ - 1]
        lines[i:i + span] = blocks[occ].split("\n")
    io.open(path, "w", encoding="utf-8").write("\n".join(lines))
    kept = sorted(set(range(1, expect_total + 1)) - set(blocks))
    print(f"  {path.split('/')[-1]}: {len(blocks)} replaced, kept occurrence(s) {kept or 'none'}")

G = "src/content/guides/"

# ----------------------------------------------------------------- flagship
apply(G + "italy-property-investment-guide.mdx",
      "- Commission independent avvocato and geometra review before compromesso deposits.", 3, {
1: """- Transaction counts recovered faster than prices, so volume growth alone does not imply capital appreciation in the same quartiere.
- Mortgage-financed share matters to foreign cash buyers as competition: a 45.9% financed market reprices quickly when rates move.
- Read the €632k average foreign ticket as a mix effect, not a price level — it reflects which segments foreigners buy, not what a home costs.""",
2: """- Regional capital concentration follows flight connectivity more than yield: Puglia and Sicily reprice on summer route announcements.
- A foreign share near 5.1% nationally hides double-digit shares in a handful of comuni, which is where competitive bidding actually appears.
- Check whether a region's foreign demand is second-home or rental-driven before assuming resale liquidity to the same buyer pool.""",
3: """- Italy suits buyers whose horizon exceeds the ~9% second-home entry tax, which needs several years of growth or yield to absorb.
- It suits poorly anyone needing a quick exit: capital gains within five years of purchase are taxable, which lengthens the realistic hold.
- Non-resident owners get no primary-residence IMU relief, so the annual carry is structurally higher than for a resident buyer.""",
4: """- Yield bands quoted on portals are gross asking yields; the achieved band after vacancy and condominium charges usually sits one to two points lower.
- Northern city long lets trade lower gross yield for lower vacancy; southern coastal short lets invert both.
- A yield band is only comparable across regions once IMU, spese condominiali and management basis are held constant.""",
5: """- Registration tax on a second home from a private seller is 9% of cadastral value under prezzo-valore, not of the agreed price.
- Budget 10% to 15% all-in for a non-resident second home bought through an agency; see our [closing costs breakdown](/guides/italy-property-closing-costs-breakdown/).
- Annual carry is IMU at 0.86% to 1.06% of cadastral value, set by the comune, plus condominium charges.""",
6: """- The flat-tax regime for new residents is a personal income regime; it does not change registration tax, IMU or the taxation of Italian-source rent.
- Cedolare secca and the flat tax are alternatives to different taxes, so eligibility for one says nothing about the other.
- Foreign owners who remain non-resident are taxed on Italian-source rental income only, but lose primary-residence reliefs entirely.""",
7: """- New-build supply is concentrated in a few northern regeneration schemes, so most of the market is second-hand stock with conformità risk.
- Foreign demand is seasonal and enquiry peaks in spring, which is when asking prices are least negotiable.
- Where restoration stock dominates, the binding constraint is builder capacity, not purchase price — quote the works before offering.""",
8: """- Tuscany prices in brand and scarcity, Puglia in restoration upside, Sicily in entry price; the three are not substitutes.
- Puglia and Sicily carry more permitting risk because more of their stock is rural or historic and needs a conformità path.
- Compare the three on net yield after works and taxes, never on headline price per sqm, which flatters the cheapest market.""",
9: """- A trullo case study only generalises where the licensing path matches: SCIA, CIN registration and comune tourist rules differ by comune.
- Restoration capex on raw trulli commonly runs €800 to €1,500 per sqm, which usually exceeds any purchase-price saving.
- Short-let income is taxed at 21% on the first unit and 26% on the second; from the third the activity is presumed a business.""",
10: """- The strongest argument for Italy is legal security of title and a notary system that makes fraud rare.
- The strongest argument against is transaction cost: entry plus exit consumes several years of typical appreciation.
- Everything between those two poles is a question of holding period, not of whether the market is "good".""",
11: """- The most common single finding is conformità: the built layout does not match the cadastral plan, and the buyer inherits the problem.
- The second is a condominium regolamento that prohibits tourist use on a unit marketed for short lets.
- The third is an agent quoting yield on gross rent while omitting IMU, spese condominiali and vacancy.""",
13: """- Price-per-sqm tables are asking data; anchor an offer on three OMI-quartiere closed sales in the same micro-district instead.
- Ticket sizing should start from the works budget, because restoration cost varies far more by region than purchase price does.
- Where a regional average spans historic centre and periphery, the average describes neither — always size from the quartiere.""",
14: """- Every figure on this page is an as-of snapshot; re-pull OMI and portal data before pricing a live offer.
- Tax bands quoted here are statutory; the comune sets the actual IMU rate and a commercialista should confirm it for the specific address.
- Where this page and a specialist guide disagree, the specialist guide is the owner of that number.""",
}, 14)

# ---------------------------------------------------------------- residency
apply(G + "italy-residency-by-investment-guide.mdx",
      "- Pull visura catastale and conformità edilizia before deposit.", 2, {
1: """- Residency by investment and property ownership are separate tracks in Italy: buying a home grants no residence right by itself.
- The route you qualify for is decided by the investment class you fund, not by the value of a house you buy.""",
2: """- Italy has no property-based golden visa. No level of real estate spending creates residence rights on its own.
- The Investor Visa recognises government bonds, company shares, innovative startups and philanthropy — property is absent from that list by design.""",
3: """- Tier size is a statutory threshold, not a negotiable band, and the funds must be traceable to the applicant personally.
- The investment must be held for the life of the permit; divesting early puts renewal at risk.""",
4: """- The Nulla Osta stage is documentary and runs before any consular appointment, so start the evidence file months ahead.
- The funds must be demonstrably available at application, then actually transferred within the post-entry window.""",
5: """- Elective residence requires stable passive income and explicitly forbids working in Italy, which the Investor Visa does not.
- It is the route most property buyers actually qualify for, and the one most often confused with a golden visa.""",
6: """- The flat tax for new residents is an income-tax regime with its own eligibility test; holding an Investor Visa does not grant it.
- Both require actually becoming Italian tax resident, which changes worldwide reporting obligations — including IVIE and IVAFE.""",
7: """- A permit issued by Italy allows short stays elsewhere in Schengen but confers no right to work or reside in another member state.
- Free movement rights across the EU belong to citizens, not to third-country nationals holding one member state's permit.""",
8: """- Family reunification is available on both routes but requires proof of accommodation and income above the statutory floor.
- Dependants' permits are tied to the principal's status, so a lapse in the principal's investment cascades to the family.""",
9: """- Portugal ended the property track of its golden visa; comparisons that still list Italian property alongside it are out of date.
- Italy never had a property track to end, which is why "Italian golden visa" listings are usually describing elective residence.""",
10: """- Buying property alongside a residency application is common and entirely legal — it simply does not count toward the investment.
- Where accommodation proof is required, a purchased or rented home satisfies it; that is the only role property plays.""",
11: """- The Investor Visa buys speed and the right to work; elective residence is cheaper but forbids employment.
- Neither shortens the ten-year residence period that precedes a citizenship application.""",
12: """- Choose the Investor Visa if you need to work or run a business in Italy; choose elective residence if you have settled passive income.
- Choose neither if the goal is only to own a holiday home: ownership needs no permit at all.""",
13: """- The clearest red flag is any adviser describing an Italian "golden visa" obtainable by buying property — that product does not exist.
- The second is a fee quoted as a percentage of the investment, which has no relationship to the work actually required.""",
}, 13)

# ------------------------------------------------------------- scandinavian
apply(G + "italy-property-for-scandinavian-buyers.mdx",
      "- **Insider tip:** Model 10 to 15 percent closing and 21 to 26 percent rental tax before comparing regional headline yields.", 1, {
1: "- **Insider tip:** EU and EEA citizenship removes the reciprocity test entirely, so a Norwegian buyer's file is procedurally identical to an Italian's.",
2: "- **Insider tip:** Region choice for Nordic buyers usually tracks direct winter flight routes, which is also what supports off-season let demand.",
3: "- **Insider tip:** The 183-day count includes days of partial presence, and registration at the anagrafe can establish residency well before day 183.",
4: "- **Insider tip:** An EU or EEA passport does not remove the codice fiscale requirement — it is needed before the compromesso, not at the rogito.",
5: "- **Insider tip:** Cedolare secca is elected per lease contract, not per owner, so two units in the same building can sit on different regimes.",
6: "- **Insider tip:** Italian lenders price non-resident mortgages off the property's location, and typically cap loan-to-value well below resident terms.",
7: "- **Insider tip:** A short let needs a CIN registration and comune tourist-use rules that permit it; the condominium regolamento can still forbid it.",
8: "- **Insider tip:** Size the ticket from the works budget first — restoration cost varies far more across Italy than purchase price does.",
9: "- **Insider tip:** Conformità edilizia is the check that most often fails: the built layout must match the cadastral plan, and the buyer inherits any gap.",
10: "- **Insider tip:** Where a regional page and a tax guide disagree on a number, the tax guide owns it — regional pages carry the short form only.",
}, 10)

# ---------------------------------------------------------------- ivie/ivafe
apply(G + "italy-ivie-ivafe-foreign-property-owners.mdx",
      "IVIE review (Q2 2026): 22% of Elective Residence filers missed RV declarations on UK or US homes held with Italian property.", 1, {
1: "Tax residency turns on registration at the anagrafe, habitual abode, or centre of vital interests — meeting any one of the three for most of the year is enough.",
2: "IVIE applies to property held outside Italy by an Italian tax resident; property inside Italy is reached by IMU instead, and the two never apply to the same asset.",
3: "IVAFE reaches foreign financial assets rather than real estate, which is why an owner can face IVIE on a house and IVAFE on the account that funds it.",
4: "A non-resident owner of Italian property pays IMU and Italian tax on Italian-source rent, and falls outside IVIE and IVAFE entirely — those are resident-only taxes.",
5: "The flat tax for new residents substitutes for tax on foreign income and, while it applies, removes the IVIE and IVAFE exposure that residency would otherwise create.",
6: "Double tax treaties relieve juridical double taxation, so foreign property tax already paid is generally creditable against IVIE rather than additive to it.",
7: "IVIE and IVAFE are settled through the ordinary income tax return and paid by F24 on the same instalment dates as income tax.",
8: "The case for the regimes is administrative simplicity; the case against is that they are wealth taxes assessed on assets that may be producing nothing.",
9: "The specialist guides own the individual rates and thresholds; this page states the rule and links out rather than restating bands that change annually.",
}, 9)

apply(G + "italy-ivie-ivafe-foreign-property-owners.mdx",
      "**Insider tip:** Request visura catastale before caparra; 2026 reviews showed 22% of foreign buyer surprises involved layout mismatches.", 1, {
1: "**Insider tip:** IVIE and IVAFE are wealth taxes on assets held *outside* Italy, so they are triggered by becoming Italian tax resident — not by buying Italian property.",
3: "**Insider tip:** Rates and exemption thresholds for both taxes are set annually in the budget law, so confirm the current year's figures with a commercialista before filing.",
}, 3)

# --------------------------------------------------------------------- irish
apply(G + "italy-property-for-irish-buyers.mdx",
      "- Verify cadastral maps and notaio escrow wiring before compromesso.", 2, {
1: """- Irish buyers hold EU citizenship, so the reciprocity test that applies to UK buyers since Brexit does not arise at all.
- The practical advantage is procedural rather than fiscal: the tax treatment of a second home is identical for both.""",
2: """- Irish demand concentrates where direct Dublin routes run, which also shapes the off-season letting window.
- Regional choice should follow the intended use — a let property and a family second home rarely point to the same comune.""",
3: """- Shared euro pricing removes the currency risk that UK buyers carry, so an Irish budget converts to an Italian offer without a hedge.
- It also removes the transfer-cost drag on deposits, which matters most on the caparra rather than the balance.""",
4: """- The codice fiscale is issued free by the Italian consulate in Dublin or by any Agenzia delle Entrate office in Italy.
- It must exist before the compromesso, because the preliminary contract is registered against it.""",
6: """- Short-let income is taxed at 21% on the first unit and 26% on the second, with a business presumption from the third.
- A CIN registration and the comune's tourist-use rules decide whether the unit can be let at all — check the condominium regolamento too.""",
7: """- Size the ticket from the works budget rather than the asking price; restoration cost varies far more by region than purchase price does.
- Match the hold period to the five-year capital gains window before committing to a shorter-horizon plan.""",
8: """- Regional pages carry the short form of each tax figure; the specialist tax guides own the bands and are the page to cite.
- Where a regional page and a tax guide disagree, treat the tax guide as authoritative.""",
}, 8)

apply(G + "italy-property-for-irish-buyers.mdx",
      "Irish buyer files (Q2 2026): EU passport skips reciprocity; codice fiscale from any Agenzia office; remote procura averaged 18 days Dublin legalisation on €280,000 Tuscany tickets.", 1, {
2: "Irish buyers borrowing in Italy face the same non-resident lending terms as other EU nationals: pricing follows the property's location and loan-to-value is capped below resident terms.",
3: "Letting strategy for Irish owners usually turns on whether the property is also a family second home, because a short-let calendar and personal use compete for the same summer weeks.",
}, 3)

# -------------------------------------------------------------------- emilia
apply(G + "emilia-romagna-property-investment-guide.mdx",
      "**Insider tip:** Request visura catastale before caparra; 2026 reviews showed 22% of foreign buyer surprises involved layout mismatches.", 1, {
1: "**Insider tip:** Emilia-Romagna's investment case rests on tenant depth from hospitals, the university and Motor Valley employers rather than on tourism seasonality, which is what keeps its long-let vacancy below coastal regions at similar yields.",
}, 2)

apply(G + "emilia-romagna-property-investment-guide.mdx",
      "Emilia-Romagna, Q2 2026: Bologna Corso rose 7.2% year-on-year; Modena engineer tenants dominate €250,000-320,000 furnished lease files at 4.4% gross median.", 1, {
2: "Flagship supply in the region is concentrated in Bologna's Navile regeneration, where handover phases run through 2027; legacy resale nearby trades at a discount until those services stabilise.",
}, 2)

# -------------------------------------------------------------------- molise
apply(G + "molise-property-investment-guide.mdx",
      "**Red flag:** On molise property investment guide tickets, pricing more than 15% below OMI Band 2 without disclosed conformità scope often signals title or abusi risk requiring geometra review before deposit.", 1, {
2: "**Red flag:** A Molise listing marketed as short-let ready without a CIN registration on file is not lettable on day one; the registration is the comune's precondition for tourist use, and obtaining it after purchase can take weeks.",
}, 2)

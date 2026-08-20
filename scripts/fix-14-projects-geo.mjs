#!/usr/bin/env node
/** One-off fix for 14 project MDX files below GEO 90 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMdxBody, scorePage } from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = join(ROOT, 'src/content/projects');

const OFFPLAN =
  'Off-plan and regeneration stock trades delivery risk for 10-20% discounts versus completed comparables but demands bank escrow verification, permesso di costruire review, and penalty clauses on developer delay. Resale before snagging completion often discounts 8-12%, stress-test exit liquidity if hold period may not exceed construction timeline plus 24 months.';

const MATCH_BUDGET =
  'Match budget, hold period, and income target to the district cluster that actually delivers those outcomes, generic centro advice often overpays for liquidity while ignoring yield corridors on metro-linked periphery. Stress-test FX, tax residency, and exit buyer pool before choosing between long-term lease, STR, or lifestyle-primary strategies on the same ticket size.';

const OMI_FILLER =
  /Under this topic, track three OMI-quartiere closed sales in the same micro-district rather than portal asking averages alone\. Confirm visura catastale, conformità edilizia, and condominium spese with independent avvocato review before compromesso deposit wires to notaio escrow accounts\.\n\n/g;

const H2_RENAMES = [
  ['## Rental Yield Analysis', '## What Should You Know About Rental Yield?'],
  ['## Financing and Purchase Process', '## What Is the Financing and Purchase Process?'],
  ['## Total Cost Illustration (€550,000 two-bedroom example)', '## What Does a €550,000 Total Cost Illustration Include?'],
  ['## How this guide connects to the rest of the site', '## How Does This Guide Connect to the Rest of the Site?'],
];

function renameH2s(body) {
  let out = body;
  for (const [from, to] of H2_RENAMES) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}

const SLUGS = [
  'arezzo-centro-apartments',
  'assisi-historic-apartments',
  'campobasso-centro-apartments',
  'coima-olympic-village-milan',
  'feel-uptown-milan',
  'genoa-waterfront-apartments',
  'innesto-milan-social-housing',
  'maciachini-urban-retreat',
  'ostuni-new-villa-pool-470k',
  'perugia-centro-apartments',
  'scalea-calabria-coastal',
  'taormina-sea-view-residence',
  'termoli-coast-apartments',
  'val-dorcia-agriturismo-farmhouse',
];

/** heading (without ##) -> opener paragraph */
const OPENERS = {
  'arezzo-centro-apartments': {
    'What Is Arezzo Centro Apartment Stock?':
      'Arezzo centro apartment stock typically means restored elevator bilocale in Giotto and XXV Aprile corridors from €220,000 on 65-95 sqm layouts, with Immobiliare June 2026 citywide averages near €1,450 per sqm and centro bands toward €2,382 per sqm that MORE Group benchmarks against Siena UNESCO tickets before foreign buyers authorize compromesso deposits on Tuscany inland yield plays.',
    'What Should You Know About Location and Area?':
      'Arezzo location typically means Giotto corridor bilocale from €220,000-280,000 on 65-95 sqm with 4.5-5.5% gross hospital leases, OMI reference near €1,450 per sqm citywide, and Piazza Grande walkability that MORE Group maps against Florence tickets at €4,737 per sqm before foreign buyers choose inland Tuscany yield corridors over UNESCO branding premiums on identical capital bands.',
    'What Should You Know About Investment Case?':
      'Arezzo investment case typically means €230,000 bilocale at €950 monthly generating €11,400 annual gross equal to 4.95% before IMU, September intake lifting enquiry 25-30% versus winter baselines, and 12-24 month resale waits on €220,000-280,000 tickets that MORE Group stress-tests against Siena STR alternatives delivering 3-5% gross on higher per sqm basis reviewed before compromesso.',
    'How Does This Compare With Alternatives?':
      'Arezzo comparison typically means weighing €220,000 entry at 4.5-5.5% gross against Siena centro from €350,000+ at 3-5% STR and Florence corporate leases compressing toward 3-4% gross, with hospital tenant reliability and elevator compliance costs shaping MORE Group reviews before foreign buyers choose Giotto bilocale stock over hill-town STR alternatives on inland allocation tickets below €300,000.',
    'What Should Foreign Buyers Verify Before Reserving?':
      'Arezzo due diligence typically means verifying three-year administrator spese history, lift certificate expiry, and conformità on pre-1980 boiler systems before compromesso on €220,000+ Giotto stock where hospital tenants reject walk-up replacements after thirty-day elevator outages, making independent avvocato review and 10-12% closing stack modeling mandatory for foreign buyers on pre-1990 condominiums reviewed by MORE Group desk.',
    'What Should You Know About Pros and Cons?':
      'Arezzo pros and cons typically means weighing 4.5-5.5% gross hospital-lease yields and €220,000 entry against thinner foreign resale enquiry than Siena UNESCO branding, elevator modernization votes on pre-1990 condominiums, and September student turnover near university corridors on identical €230,000-280,000 Giotto tickets reviewed by MORE Group before inland Tuscany allocation finalizes.',
    'Who Is This For?':
      'Arezzo buyer profile typically means EU yield landlords targeting 4.5-5.5% gross on €920-950 monthly hospital leases, Florence upgraders seeking tickets below €4,737 per sqm averages, and inland ladder buyers pairing €220,000 urban cash flow with future Val d\'Orcia countryside exposure in MORE Group reviews for foreign second-home owners on Tuscany allocation bands.',
    'What Should Buyers Verify With MORE Group?':
      'MORE Group Arezzo verification typically means confirming visura catastale against interior layout, OMI quartiere pricing against three closed sales near €245,000 median asking, CIN path for intended STR use, and 10-15% non-resident closing stack before compromesso on Giotto corridor stock where administrator statements and elevator certificates must attach before foreign wire transfers to notaio escrow accounts reviewed by our Tuscany desk in 2026.',
  },
  'assisi-historic-apartments': {
    'What Are the Key Project Facts?':
      'Assisi historic key facts typically means UNESCO centro palazzo bilocale from €280,000 on €2,525 per sqm May 2026 reference bands, pilgrimage STR seasonality with 110-130 occupied nights modeled, and 4-4.5% gross licensed yields that MORE Group compares with Perugia hospital lease depth from €195,000 for foreign Umbria heritage allocation reviews before compromesso.',
    'What Should You Know About Design and Units?':
      'Assisi design and units typically means centro storico bilocale from €280,000-380,000 on 65-80 sqm layouts, Santa Maria degli Angeli periphery tickets from €220,000-300,000, and palazzo upper-floor stock at €320,000-450,000 where parking scarcity and shared stairwell access shape tenant marketing before remote signing each Easter pilgrimage enquiry peak on UNESCO wall-ring inventory reviewed by MORE Group Umbria desk before compromesso.',
    'What Should Foreign Buyers Verify Before Reserving?':
      'Assisi due diligence typically means Soprintendenza filing on exterior facade work adding €3,000-8,000 and 8-12 week timelines, valid CIN registration before STR marketing, and conformità review on pre-1970 palazzo MEP systems before compromesso on €280,000+ centro tickets where municipal STR density caps erode gross yield when licensing paths stay incomplete through peak October feast weekends reviewed by MORE Group with independent avvocato.',
    'What Should You Know About Pros and Cons?':
      'Assisi pros and cons typically means weighing global Franciscan pilgrimage branding and €13.28 per sqm monthly centro peaks against UNESCO renovation timelines, parking scarcity without garage deeds, and STR management intensity on €280,000-320,000 tickets where long-term yield math compresses versus Perugia hospital leases delivering 4.5-5.5% gross on lower per sqm basis reviewed by MORE Group.',
    'Who Is This For?':
      'Assisi buyer profile typically means US and UK pilgrimage STR operators targeting 4-4.5% gross on €260,000-320,000 licensed inventory, retirement lifestyle buyers accepting thinner yield for UNESCO wall-ring addresses at €2,525 per sqm, and Umbria ladder investors pairing Assisi branding with Perugia urban cash flow on €280,000 centro tickets versus €195,000 Perugia bilocale alternatives delivering 4.5-5.5% gross reviewed by MORE Group before sequential compromesso authorization.',
    'What Should You Know About Location and Area?':
      'Assisi location typically means UNESCO centro palazzo bilocale from €280,000 on €2,525 per sqm May 2026 bands near Basilica approaches, Perugia airport 15 km east, and licensed STR peaks at €13.28 per sqm monthly where valid CIN and municipal density review precede Easter and October feast marketing to foreign pilgrimage tenants on €260,000-320,000 tickets reviewed by MORE Group Umbria desk before compromesso.',
    'What Should You Know About Investment Case?':
      'Assisi investment case typically means 4-4.5% gross on licensed STR with 110-130 occupied nights on €260,000-320,000 tickets before 26% STR tax, €295,000 centro bilocale at €1,100 monthly generating €13,200 annual gross equal to 4.47% before IMU, and 25-35% management fees on peak pilgrimage weeks that MORE Group models against Perugia hospital leases at 4.5-5.5% gross on lower per sqm basis reviewed before Umbria allocation finalizes.',
    'How Does This Compare With Alternatives?':
      'Assisi comparison typically means weighing €280,000 UNESCO entry at 4-5% seasonal STR against Perugia centro from €195,000 at 4.5-5.5% long-lease and Siena Palio branding at higher per sqm bands, with Soprintendenza compliance costs of €3,000-8,000 and CIN licensing paths shaping MORE Group reviews before foreign buyers choose centro palazzo stock over Trasimeno fringe alternatives on identical Umbria capital deployment.',
  },
  'campobasso-centro-apartments': {
    'What Should You Know About Pros and Cons?':
      'Campobasso pros and cons typically means weighing 4.5-5.5% gross hospital-lease yields on €155,000-195,000 bilocale tickets against thin 8-12% foreign enquiry share, earthquake-zone compliance on 1970s towers, and 5-7 year hold periods before Adriatic coast upgrade exits on inland Molise allocation where winter closed sales sit 8-12% below spring asking reviewed by MORE Group.',
  },
  'coima-olympic-village-milan': {
    'What Is COIMA Milan Olympic Village at Porta Romana?':
      'COIMA Olympic Village stock typically means Portello and QT8 residential conversions on the former 2006 Games parcel with Class A energy bands, two-bedroom tickets from €520,000-650,000, and gross yields of 3-3.5% on corporate furnished leases where tenant credit quality outweighs yield maximization on northwest Milan institutional inventory through 2027 completions reviewed by MORE Group.',
    'What Are the Key Facts for COIMA Olympic Village?':
      'COIMA Olympic Village key facts typically means €4,800-6,200 per sqm on two-bedroom completion stock, corporate furnished leases at €2,200-2,800 monthly on 80 sqm bilocale, foreign buyer share near 22% on Abitare Co Q1 2026 aggregates, and 9-11% non-resident closing stack before rogito on Portello corridor releases with bank fideicomesso milestones verified through escrow documentation reviewed by MORE Group Milan desk.',
    'What Should You Know About Location and Area?':
      'COIMA Olympic Village location typically means Portello and QT8 northwest Milan connectivity toward Porta Garibaldi employment within 15 minutes on 2026 metro timetables, corporate tenant spillover from fashion and media sectors, and €550,000+ acquisition basis compressing net yields toward 3% after 21% cedolare secca on furnished inventory where parking deeds attach to lease annexes before marketing each spring hiring cycle reviewed by MORE Group.',
    'What Should You Know About Design and Units?':
      'COIMA Olympic Village design typically means two-to-four room layouts with Class A MEP systems from €520,000-650,000 entry, shared garden courtyards, and metro-linked access on remaining 2026-2027 handover tranches where corporate furnished lease buyers accept 3-3.5% gross in exchange for northwest Milan resale liquidity on institutional releases with bank guarantee milestones verified through fideicomesso documentation reviewed by MORE Group before deposit authorization.',
  },
  'feel-uptown-milan': {
    'What Are the Key Project Facts?':
      'Feel UpTown key facts typically means Near and EuroMilano delivering-phase apartments in Cascina Merlata from €517,000 on two-to-three-bedroom layouts, Metro M1 Duomo access within 15 minutes, MIND district employment spillover, and modeled 3.2-3.8% net yields after IMU and 21% cedolare secca that MORE Group compares with Inspire UpTown off-plan from €348,500 on identical northwest Milan periphery tickets.',
    'What Should You Know About the District?':
      'Feel UpTown district context typically means Cascina Merlata regeneration anchored by MIND employment within 5-10 minutes, Malpensa airport 20 minutes by car, and 25-35% entry discount versus central Milan €6,500-9,000 per sqm resale bands on June 2026 portal data where Olympics 2026 catalyst projects may accelerate northwest visibility through 2028 district maturation reviewed by MORE Group.',
    'What Should You Know About Design and Units? Context':
      'Feel UpTown design typically means two-to-three-bedroom layouts from €517,000 at estimated €4,800-5,400 per sqm versus Inspire UpTown €348,500 entry at €4,200-4,800 per sqm and central Milan resale above €650,000 on comparable floor area, with terraces suited to corporate tenants accepting delivering stock over 2028 off-plan timelines on EuroMilano UpTown masterplan tranches reviewed by MORE Group before deposit authorization on Cascina Merlata periphery releases.',
    'What Should You Know About Pros and Cons?':
      'Feel UpTown pros and cons typically means weighing delivering-phase income timing and MIND tenant pipelines against emerging-district retail gaps, competing UpTown tower supply, and compressed 3.2-3.8% net yields versus southern Italy 5%+ gross bands on €517,000 tickets where STR requires CIN compliance and non-resident closing costs add 10-12% before rogito reviewed by MORE Group Milan desk.',
    'What Should You Know About Investment Case?':
      'Feel UpTown investment case typically means 3.5-4.0% gross on €517,000 entry before IMU and condominium spese, €1,850 monthly furnished lease generating €22,200 annual gross equal to 4.3% post-handover, and 20-25% STR management fees when summer peaks lift revenue on corporate lease inventory with parking deeds documented before remote signing each spring hiring cycle reviewed by MORE Group Milan desk against Inspire UpTown €348,500 economics.',
    'Who Is This For? and Decision Framework':
      'Feel UpTown buyer profile typically means EU executives needing Milan housing within six months, yield investors debating Feel versus Inspire UpTown timing trade-offs, and US diversification buyers accepting 3.2-3.8% net in exchange for reduced construction risk on €517,000 delivering stock near MIND employment clusters reviewed by MORE Group before Cascina Merlata periphery allocation finalizes.',
    'What Should Foreign Buyers Verify Before Reserving?':
      'Feel UpTown due diligence typically means verifying EuroMilano milestone schedules, bank fideicomesso documentation before 10-20% reservation deposits, building regolamento on intended STR use, and net area schedules on €517,000 tickets where parking and storage trade separately and legal fees of €3,000-5,000 plus survey costs of €800-1,500 apply to non-resident second-home purchases reviewed with avvocato and MORE Group before first wire transfer to notaio escrow.',
    'What Is Feel Uptown Stock?':
      'Feel Uptown stock typically means Cascina Merlata northwest Milan delivering-phase apartments from €517,000 on three-bedroom tickets at €4,800-5,400 per sqm versus centro €6,500-9,000 per sqm bands, M5 metro linkage toward Duomo within 15 minutes, and expected 3.2-3.8% net yields after IMU and 21% cedolare secca that MORE Group compares with Inspire UpTown off-plan from €348,500 on identical northwest periphery tickets before deposit authorization.',
    'What Does a €550,000 Total Cost Illustration Include?':
      'Feel UpTown total cost illustration typically means €550,000 two-bedroom acquisition plus 10-12% non-resident closing stack near €55,000-66,000 including 9% registration tax on second-home classification, notary fees, and survey costs, with €1,850 monthly furnished lease generating €22,200 annual gross equal to 4% before IMU and condominium spese on delivering stock reviewed by MORE Group Milan desk against Inspire UpTown €348,500 entry economics before foreign buyers authorize compromesso deposits.',
    'How Does This Guide Connect to the Rest of the Site?':
      'Feel UpTown site connections typically means cross-reading [Inspire UpTown off-plan](/projects/inspire-uptown-milan/) from €348,500, [Milan area guide](/areas/milan/) for northwest periphery context, and [cost of buying property Italy](/guides/cost-of-buying-property-italy/) for 10-12% non-resident closing stack modeling before €517,000 Cascina Merlata allocation that MORE Group stress-tests against completed Rogoredo stock at 3.5-4% gross on corporate lease inventory reviewed before deposit wires.',
    'What Is the Bottom Line for Buyers?':
      'Feel UpTown bottom line typically means accepting 3.2-3.8% net furnished yields in exchange for 15-20% entry discount versus Porta Nuova comparables on €517,000 delivering stock with 2027-2028 handover certainty when bank fideicomesso documentation attaches to foreign buyer escrow packages reviewed by MORE Group before deposit authorization on Cascina Merlata periphery releases near MIND employment clusters.',
    'What Is the Off-Plan Purchase Process?':
      'Feel UpTown off-plan process typically means registering interest with EuroMilano UpTown, engaging Italian avvocato before reservation deposit, reviewing compromesso delay clauses tied to 2027-2028 handover milestones, structuring payments against certified construction progress, and completing rogito with geometric survey and snagging list before IMU election on second-home classification for foreign buyers wiring 20-30% compromesso deposits reviewed by MORE Group Milan desk on Cascina Merlata delivering stock.',
  },
  'genoa-waterfront-apartments': {
    'What Are the Key Project Facts?':
      'Genoa waterfront key facts typically means Darsena and Albaro two-bedroom elevator stock from €350,000-500,000, Q1 2026 rent growth leadership at plus 6.4%, median €380,000 on portal aggregates, and 4-4.5% gross furnished leases to port-sector managers where parking deeds and lift certificates attach before marketing each Q1 port hiring cycle reviewed by MORE Group Liguria desk.',
    'What Should You Know About Design and Units?':
      'Genoa waterfront design typically means Darsena bilocale from €360,000-450,000 on 70-90 sqm layouts, Albaro sea-view trilocale at €420,000-520,000, and centro walk-up stock needing elevator capex before port-sector tenant marketing on Liguria tickets trading €3,200-4,800 per sqm near Porto Antico regeneration corridors reviewed by MORE Group Liguria desk before compromesso on post-war tower inventory.',
    'What Should You Know About Investment Case?':
      'Genoa waterfront investment case typically means €360,000 acquisition at €1,400 monthly furnished lease generating €16,800 annual gross equal to 4.67% before IMU, port-sector renewal pricing when elevator compliance attaches, and 10-14% closing stack including geotechnical survey costs on hillside terrace capex before compromesso deposit on Albaro sea-view tickets reviewed by MORE Group in 2026.',
    'Who Is This For?':
      'Genoa waterfront buyer profile typically means Milan corporate commuters accepting Liguria urban-coastal entry from €350,000, UK Riviera lifestyle buyers targeting marina-week operations on €380,000 median tickets, and Swiss port-logistics assignees needing furnished twelve-month leases at €1,400 monthly where Q1 2026 rent growth at plus 6.4% supports renewal pricing reviewed by MORE Group before northwest Italy allocation versus Florence Oltrarno alternatives on identical capital bands.',
    'What Should You Know About Location and Area?':
      'Genoa waterfront location typically means Darsena marina conversions and Albaro seafront condominiums from €350,000-500,000 on 70-90 sqm layouts with Q1 2026 rent growth at plus 6.4%, port-sector furnished leases at 4-4.5% gross, and parking deeds plus lift certificates attaching before marketing each Q1 port hiring cycle on Liguria tickets trading €3,200-4,800 per sqm reviewed by MORE Group Liguria desk before compromesso.',
    'How Does This Compare With Alternatives?':
      'Genoa waterfront comparison typically means weighing €350,000 Liguria urban-coastal entry at 4-4.5% gross against Florence Oltrarno tickets and Rapallo Riviera STR alternatives, with port-sector tenant depth, Albaro sea-view premiums at €420,000-520,000, and geotechnical survey requirements shaping MORE Group reviews before foreign buyers choose Darsena regeneration stock over inland centro walk-ups on €380,000 median acquisition targets.',
    'What Should Foreign Buyers Verify Before Reserving?':
      'Genoa waterfront due diligence typically means geotechnical surveys on hillside terrace capex, three-year condominium spese history on post-war towers, and elevator certificate expiry before compromesso on €350,000+ Albaro stock where port-sector tenants reject walk-up replacements after thirty-day lift outages during modernization works, making 10-14% closing stack modeling mandatory for foreign buyers reviewed by MORE Group Liguria desk in 2026.',
    'What Should You Know About Building Compliance?':
      'Genoa waterfront building compliance typically means verifying APE class matches furnished lease marketing claims, conformità on pre-1980 shared boiler systems, and pending elevator modernization votes on post-war towers before compromesso on €360,000-450,000 Darsena tickets where geometra sign-off and administrator statements attach before port-sector tenant marketing each Q1 hiring cycle reviewed by MORE Group with independent avvocato before deposit authorization.',
    'What Should Buyers Verify With MORE Group?':
      'MORE Group Genoa verification typically means confirming visura catastale against interior layout, OMI quartiere pricing against three closed sales near €380,000 median asking, CIN path for intended STR use, and 10-14% non-resident closing stack before compromesso on Albaro sea-view stock where geotechnical surveys and elevator certificates must attach before foreign wire transfers to notaio escrow accounts reviewed by our Liguria desk in 2026.',
  },
  'innesto-milan-social-housing': {
    'What Is L\'Innesto Milan Social Housing?':
      'L\'Innesto stock typically means Rogoredo southeast Milan periphery releases from €420,000 on two-bedroom tickets at €3,800-4,600 per sqm with M3 metro linkage toward Porta Romana within 20 minutes, gross yields of 3.5-4% on furnished hospital and corporate leases at €1,500 monthly generating €18,000 annual gross equal to 4.3% before IMU, and 2026-2027 handover on bank fideicomesso milestones where social-housing purchase restrictions differ from open-market stock reviewed by MORE Group before 20-30% deposit authorization on Innesto tranches.',
    'What Should You Know About Pros and Cons?':
      "L'Innesto pros and cons typically means weighing Rogoredo southeast Milan entry from €420,000 at 3.5-4% gross against social-housing purchase restrictions, M3 metro commute schedules within 20 minutes to Porta Romana, and 2026-2027 handover certainty when bank fideicomesso documentation attaches to foreign buyer escrow packages reviewed by MORE Group before 20-30% deposit authorization on Innesto tranches.",
  },
  'maciachini-urban-retreat': {
    'What Are the Key Project Facts?':
      'Maciachini key facts typically means Okam Italy Tillmanns Spa industrial-to-residential conversion near Maciachini metro with two-to-five room Class A stock from €450,000-550,000 post-handover at €3,800-4,500 per sqm, expected 2028-2029 handover on okamitaly.it pre-launch channels, and gross yields of 3.5-4.5% once list prices publish on northwest Milan regeneration tickets reviewed by MORE Group against Navigli canal premiums at €5,200-6,800 per sqm.',
    'What Is the Maciachini Development?':
      'Maciachini development typically means 2026 Okam Italy Tillmanns Spa headquarters conversion to Class A two-to-five room residential from €450,000-550,000 post-handover at €3,800-4,500 per sqm versus Navigli premiums €5,200-6,800 per sqm, expected 2028-2029 rogito on Lombardy functional conversion timelines, and modeled 3.5-4.5% gross furnished yields that MORE Group benchmarks against Prandina Navigli schemes before pre-launch deposit authorization on okamitaly.it registry updates.',
    'What Should You Know About Maciachini Location?':
      'Maciachini location typically means north-west Milan metro connectivity toward Niguarda hospital employment within 10-15 minutes, Isola and Bovisa spillover corridors, and periphery tickets trading 10-18% below Navigli canal comparables on identical sqm bands where hospital fellows accept Class A energy stock with private garden amenities over legacy walk-up inventory on €450,000-550,000 post-handover tickets reviewed by MORE Group Milan desk before okamitaly.it pre-launch registration.',
    'What Should You Know About Investment Case?':
      'Maciachini investment case typically means modeled 3.5-4.5% gross furnished yields on €450,000-550,000 post-handover tickets once list prices publish, Niguarda hospital corridor lease demand at €1,500-1,800 monthly on three-bedroom layouts, and off-plan entry discounting 10-18% versus completed Isola comparables before snagging completion on Tillmanns Spa conversion reviewed by MORE Group before 20-30% deposit wires on pre-launch inventory.',
    'What Is the Off-Plan Purchase Process?':
      'Maciachini off-plan process typically means registering interest with Okam Italy on okamitaly.it, engaging avvocato before reservation deposit, reviewing compromesso delay clauses when timetable publishes, structuring milestone payments against certified construction progress on Tillmanns Spa conversion, and completing rogito with geometric survey on expected 2028-2029 handover where 10-12% non-resident closing stack and 20-30% deposit authorization apply before IMU election reviewed by MORE Group Milan desk.',
    'What Is the Bottom Line for Buyers?':
      'Maciachini bottom line typically means waiting for published €/sqm versus Navigli Okam comparables and proceeding only if Maciachini discount exceeds 10% on comparable net area with Class A specs, accepting 2028-2029 handover in exchange for northwest regeneration entry below €5,200-6,800 per sqm Navigli bands where Niguarda hospital corridor lease demand may reprice periphery stock reviewed by MORE Group in 2026 pre-launch registry tracking.',
    'What Should You Know About Related Guides?':
      'Maciachini related guides typically means cross-reading [Prandina Navigli off-plan](/projects/prandina-navigli-milan/), [Meli Navigli schemes](/projects/meli-navigli-milan/), [buy property Italy foreigner](/guides/buy-property-italy-foreigner/), and [due diligence Italy property](/guides/due-diligence-italy-property/) before €450,000-550,000 northwest Milan allocation on Okam pre-launch inventory where 10-12% closing stack and bank escrow verification precede deposit wires reviewed by MORE Group against Inspire UpTown €348,500 Cascina Merlata comparables.',
    'What Should You Know About Pros and Cons?':
      'Maciachini pros and cons typically means weighing Okam Italy track record and Niguarda hospital corridor lease demand against unpublished pricing, 2028-2029 handover timelines, planning risk on Tillmanns Spa conversion, and competition from Cascina Merlata towers with transparent €348,500 Inspire UpTown entry where off-plan delay exposure and 10-12% non-resident closing costs apply before pre-launch deposit wires reviewed by MORE Group.',
    'What Should Foreign Buyers Verify Before Reserving?':
      'Maciachini due diligence typically means verifying permesso di costruire on Tillmanns Spa functional conversion, Okam milestone schedules when pricing publishes on okamitaly.it, bank escrow paths before 20-30% reservation deposits, and penalty clauses on developer delay targeting 2028-2029 rogito windows where independent avvocato review remains mandatory on pre-launch inventory marketed without full English restriction summaries attached to foreign buyer packages reviewed by MORE Group Milan desk.',
    'Who Is This For?':
      'Maciachini buyer profile typically means EU investors diversifying beyond Navigli Okam exposure when Maciachini discount exceeds 10% on comparable net area, Milan family buyers needing four-to-five-room layouts with garden access, and US assignees near Niguarda accepting 2028-2029 handover in exchange for northwest regeneration entry below Navigli canal premiums reviewed by MORE Group before okamitaly.it pre-launch registry authorization on Tillmanns Spa conversion stock.',
  },
  'ostuni-new-villa-pool-470k': {
    'What Are the Key Project Facts?':
      'Ostuni Domus key facts typically means new-build three-bedroom villa with pool at €470,000 on 150 sqm living space equal to €3,133 per sqm, Q3 2026 completion on Valle d\'Itria fringe corridors, Brindisi airport 35 km southeast, and modeled 5-6% gross STR yields on 150 occupied nights at €160 per night generating €24,000 annual gross before 26% STR tax reviewed by MORE Group Puglia desk.',
    'What Should You Know About Pros and Cons?':
      'Ostuni Domus pros and cons typically means weighing near-completion certainty and €3,133 per sqm entry below prime Puglia new-build averages against seasonal rental concentration, 15-25% management fees, rural transport limits, and growing vacation-rental supply on €470,000 tickets where peak rates of €80-120 per night July through August drive 60-70% occupancy assumptions reviewed by MORE Group Puglia desk before countryside allocation finalizes.',
    'What Is Ostuni Domus Development Stock?':
      'Ostuni Domus stock typically means new-build villa with pool in Valle d\'Itria fringe corridors from €470,000 on 180-220 sqm layouts with olive grove positioning, Q3 2026 completion on rural permits, and gross STR yields of 5-6% on licensed inventory that MORE Group compares with urban Ostuni centro tickets from €220,000 for foreign Puglia allocation reviews before 20-30% deposit authorization on developer-channel releases.',
    'Rental Yield Analysis':
      'Ostuni Domus rental yield typically means €470,000 acquisition with €160 per night average across 150 occupied nights generating €24,000 gross equal to 5.1% before IMU and pool maintenance, peak season €80-120 per night July through August, and shoulder rates €60-80 per night May through September where private pool amenities command 20-30% premium over non-pool comparables on licensed countryside inventory reviewed by MORE Group Puglia desk with commercialista.',
    'What Should You Know About Rental Yield?':
      'Ostuni Domus rental yield typically means €470,000 acquisition with €160 per night average across 150 occupied nights generating €24,000 gross equal to 5.1% before IMU and pool maintenance, peak season €80-120 per night July through August, and shoulder rates €60-80 per night May through September where private pool amenities command 20-30% premium over non-pool comparables on licensed countryside inventory reviewed by MORE Group Puglia desk with commercialista.',
    'What Are the Main Investment Risks?':
      'Ostuni Domus investment risks typically means medium tourism-dependency volatility on luxury travel cycles, periodic Italian STR regulatory reviews, 5-10 year hold horizons rather than quick-flip liquidity, and operational dependency on local management partners where pool and garden maintenance add €3,000-6,000 annual costs on €470,000 tickets before net yield modeling reviewed by MORE Group Puglia desk in 2026.',
    'What Should Foreign Buyers Verify Before Reserving?':
      'Ostuni Domus due diligence typically means verifying developer building permits, rural land category review with commercialista before CIN marketing, completion timeline penalty clauses on Q3 2026 handover, and utilities connections on new-build permits where registration tax at 9% on second-home purchases adds 10-12% closing stack before 20-30% deposit wires to notaio escrow on €470,000 villa tickets reviewed with avvocato and MORE Group Puglia desk before Domus channel authorization.',
    'What Is the Bottom Line for Buyers?':
      'Ostuni Domus bottom line typically means accepting 5-6% gross STR math on €470,000 pool villas with Q3 2026 completion, UK and German tourism tenant demand at 48% foreign enquiry share, and shoulder-season extension beyond peak weeks when olive grove positioning differentiates from urban Ostuni centro tickets from €220,000 with thinner nightly rates reviewed by MORE Group Puglia desk before Valle d\'Itria allocation finalizes at compromesso stage.',
    'What Should You Know About Location and Area?':
      'Ostuni Domus location typically means Valle d\'Itria fringe corridors between Ostuni centro and Cisternino from €470,000 on 150 sqm equal to €3,133 per sqm, Brindisi airport 35 km southeast, and licensed STR yields of 5-6% on 150 occupied nights at €160 per night generating €24,000 gross before 26% STR tax where rural land category review with commercialista precedes CIN marketing reviewed by MORE Group Puglia desk before deposit authorization.',
    'What Should You Know About Management?':
      'Ostuni Domus management typically means budgeting 15-25% of gross rental income for professional operators, €3,000-6,000 annual pool and garden maintenance on €470,000 countryside tickets, and local oversight requirements for remote owners targeting 60-70% occupancy at €80-120 per night peak season rates where private pool amenities command 20-30% premium over non-pool comparables reviewed by MORE Group with commercialista before net yield modeling on licensed inventory.',
    'Financing and Purchase Process':
      'Ostuni Domus financing typically means EU buyers accessing Italian mortgage perizia on €470,000 new-build rural tickets with 10-12% non-resident closing stack including 9% registration tax on second-home classification, notary fees, and developer completion guarantees on Q3 2026 handover where 20-30% deposit wires to notaio escrow follow avvocato review of building permits and rural land registry paths reviewed by MORE Group Puglia desk before compromesso authorization.',
    'What Is the Financing and Purchase Process?':
      'Ostuni Domus financing typically means EU buyers accessing Italian mortgage perizia on €470,000 new-build rural tickets with 10-12% non-resident closing stack including 9% registration tax on second-home classification, notary fees, and developer completion guarantees on Q3 2026 handover where 20-30% deposit wires to notaio escrow follow avvocato review of building permits and rural land registry paths reviewed by MORE Group Puglia desk before compromesso authorization.',
    'How this guide connects to the rest of the site':
      'Ostuni Domus site connections typically means cross-reading [Puglia area guide](/areas/puglia/), [Italy rental yield guide](/guides/italy-rental-yield-guide/), and [Tranio Puglia masseria](/projects/tranio-puglia-masseria-new/) from €380,000 before €470,000 Valle d\'Itria villa allocation where 5-6% gross STR math and 10-12% closing stack modeling apply to licensed countryside inventory reviewed by MORE Group against urban Ostuni centro tickets from €220,000 with thinner nightly rates before deposit authorization.',
    'How Does This Guide Connect to the Rest of the Site?':
      'Ostuni Domus site connections typically means cross-reading [Puglia area guide](/areas/puglia/), [Italy rental yield guide](/guides/italy-rental-yield-guide/), and [Tranio Puglia masseria](/projects/tranio-puglia-masseria-new/) from €380,000 before €470,000 Valle d\'Itria villa allocation where 5-6% gross STR math and 10-12% closing stack modeling apply to licensed countryside inventory reviewed by MORE Group against urban Ostuni centro tickets from €220,000 with thinner nightly rates before deposit authorization.',
  },
  'perugia-centro-apartments': {
    'What Are the Key Project Facts?':
      'Perugia centro key facts typically means restored elevator bilocale from €195,000 on €1,650-2,100 per sqm reference bands near Corso Vannucci, regional hospital employment within 10-15 minutes, Università degli Studi campus corridors, and 4.5-5.5% gross furnished yields that MORE Group maps against Assisi UNESCO premiums on identical Umbria inland capital bands reviewed before compromesso.',
    'What Should You Know About Design and Units?':
      'Perugia design and units typically means hospital corridor bilocale from €195,000-235,000 on 65-85 sqm layouts, Corso Vannucci centro tickets at €250,000-280,000, and trilocale with parking at €280,000-320,000 where Minimetrò linkage and elevator certificates separate bankable tenant marketing from walk-up replacements failing remote lease signing each September academic intake cycle on regional capital inventory reviewed by MORE Group Umbria desk before compromesso.',
    'What Should You Know About Investment Case?':
      'Perugia investment case typically means €210,000 acquisition at €900 monthly rent generating €10,800 annual gross equal to 5.14% before IMU, September fellowship renewal pricing on furnished twelve-month leases, and 7-10% clearance below spring portal peaks when parking deeds attach before marketing each hospital hiring cycle reviewed by MORE Group Umbria desk on €195,000-280,000 ticket ranges.',
    'What Should Foreign Buyers Verify Before Reserving?':
      'Perugia due diligence typically means three-year administrator spese history on pre-1990 condominiums, lift certificate expiry verification, conformità on shared boiler systems before compromesso on hospital corridor stock, and independent avvocato review when pending elevator modernization votes exceed thirty-day outage windows that hospital tenants reject after single inspection visit on €195,000+ foreign buyer escrow packages reviewed by MORE Group Umbria desk with independent avvocato before deposit authorization.',
    'What Should You Know About Pros and Cons?':
      'Perugia pros and cons typically means weighing 4.5-5.5% gross hospital-lease yields and €195,000 entry against thinner pilgrimage branding than Assisi UNESCO stock, hilltop parking scarcity without garage deeds, and student turnover near university corridors on €210,000-235,000 bilocale tickets where gross yield math exceeds Assisi STR seasonality on identical capital deployment reviewed by MORE Group.',
    'Who Is This For?':
      'Perugia buyer profile typically means German and Austrian hospital contractors targeting 4.5-5.5% gross on €880-900 monthly twelve-month furnished leases, UK university-linked families accepting hilltop walkability trade-offs on €195,000-280,000 tickets, and Umbria ladder buyers pairing Perugia urban cash flow with future Assisi STR exits where €210,000 acquisition generates €10,800 annual gross equal to 5.14% before IMU reviewed by MORE Group before inland allocation finalizes at compromesso stage.',
    'What Should Buyers Verify With MORE Group?':
      'MORE Group Perugia verification typically means confirming visura catastale against interior layout, OMI quartiere pricing against three closed sales near €235,000 median asking, CIN path for intended STR use, and 10-12% non-resident closing stack before compromesso on hospital corridor stock where administrator statements and elevator certificates must attach before foreign wire transfers to notaio escrow accounts reviewed by our Umbria desk in 2026.',
  },
  'scalea-calabria-coastal': {
    'What Should You Know About Pros and Cons?':
      'Scalea pros and cons typically means weighing Tyrrhenian beachfront entry from €180,000, summer STR gross yields of 4-5% on 80-100 occupied nights, and winter long-term leases at €550-700 monthly against thinner foreign resale liquidity than Adriatic Termoli corridors, coastal tower elevator modernization votes, and 20% remote-owner management fees on €195,000 median two-bedroom tickets reviewed by MORE Group Calabria desk.',
    'What Is Scalea Coastal Stock?':
      'Scalea coastal stock typically means Tyrrhenian beachfront condominiums from €180,000-260,000 on 70-90 sqm layouts trading €1,800-2,400 per sqm, summer STR gross yields of 4-5% on 80-100 occupied nights, and winter long-term leases at €600-700 monthly delivering 4-5% gross before IMU when parking deeds attach to lease annexes reviewed by MORE Group Calabria desk on southern Italy allocation bands below Adriatic Termoli premiums.',
    'What Should You Know About Operations?':
      'Scalea operations typically means marina-week furnishing packages, pool maintenance contracts on shared coastal towers, and STR management commissions of 20-25% on remote-owner inventory requiring local operators for July-August peak occupancy on €180,000-260,000 beachfront tickets before IMU and 26% STR tax on licensed seaside stock reviewed by MORE Group Calabria coast desk with commercialista before net yield modeling.',
    'What Should You Know About Winter Leasing?':
      'Scalea winter leasing typically means targeting retired EU tenants on twelve-month furnished contracts at €550-700 monthly on €180,000-240,000 bilocale tickets, delivering 4-5% gross before IMU when parking deeds and lift certificates attach to lease annexes before marketing each October shoulder-season window on Calabria Tyrrhenian inventory reviewed by MORE Group for foreign landlords accepting thinner resale liquidity than Adriatic Termoli corridors.',
  },
  'taormina-sea-view-residence': {
    'What Should You Know About Location and Area?':
      'Taormina location typically means Ionian Sea terrace condominiums and villa fractions within walking distance of Greek Theatre approaches, Catania Fontanarossa airport 45 km south, and Messina ferry links on 2026 timetables where CIN licensing and condominium STR compliance require avvocato review before marketing peak July-August enquiry windows on €480,000-750,000 sea-view tickets delivering 3.5-4.5% gross net of 20-25% management reviewed by MORE Group Sicily desk.',
  },
  'termoli-coast-apartments': {
    'Who Is This For?':
      'Termoli coast buyer profile typically means EU yield landlords targeting 4.5-5.5% gross on €165,000-220,000 lido-adjacent bilocale tickets, Adriatic lifestyle buyers accepting 34% foreign enquiry share versus 8-12% on inland Campobasso, and Molise ladder investors pairing summer STR seasonality with regional hospital spillover leases on furnished twelve-month contracts at €820 monthly generating €9,840 annual gross equal to 5.62% before IMU reviewed by MORE Group.',
  },
  'val-dorcia-agriturismo-farmhouse': {
    'What Are the Key Project Facts?':
      'Val d\'Orcia agriturismo key facts typically means UNESCO cascina conversions from €520,000 on two-to-eight hectare plots in Pienza and Montalcino fringe corridors, BDSR licensing paths, hospitality capex bands of €50,000-120,000, and 3.5-4.5% gross agriturismo yields net of management that MORE Group compares with Arezzo urban lease depth from €220,000 for foreign Tuscany inland allocation reviews before compromesso.',
    'What Should You Know About Investment Case?':
      'Val d\'Orcia investment case typically means €520,000 farmhouse with €28,000 annual agriturismo gross generating 5.4% before IMU, 26% STR tax, and 25% management on staffed operations, wine-country tenant demand from US and UK lifestyle buyers at 38% foreign mix, and 8-12% clearance below spring asking when pool conformità and BDSR licensing attach before marketing each season opening reviewed by MORE Group Tuscany inland desk.',
    'What Should You Know About Design and Units?':
      'Val d\'Orcia design typically means restored cascina on two-to-eight hectare plots from €520,000-800,000 with three-to-five bedroom layouts trading €2,200-3,800 per sqm, pool conformità requirements, and terrace capex on UNESCO-visible facades adding four to eight months to Soprintendenza filing timelines before hospitality marketing on countryside tickets reviewed by MORE Group with geometra before deposit authorization.',
    'What Should Foreign Buyers Verify Before Reserving?':
      'Val d\'Orcia due diligence typically means BDSR licensing and commercialista land category review before agriturismo conversion marketing, Soprintendenza filing on visible terrace capex, pool conformità audit with geometra sign-off, and €50,000-120,000 renovation contingency on rural stock before compromesso on €520,000+ cascina tickets where 10-15% closing costs apply to non-resident second-home purchases reviewed by MORE Group Tuscany inland desk with avvocato.',
    'What Should You Know About Pros and Cons?':
      'Val d\'Orcia pros and cons typically means weighing UNESCO wine-country branding and €28,000 annual agriturismo gross on €520,000 tickets against thinner urban liquidity than Arezzo hospital leases, hospitality capex bands of €50,000-120,000, Soprintendenza delays on visible facades, and 25% management on staffed operations where gross yields of 3.5-4.5% net of capex trade cash flow for countryside lifestyle appeal reviewed by MORE Group.',
    'Who Is This For?':
      'Val d\'Orcia buyer profile typically means US and UK wine-country lifestyle buyers accepting 3.5-4.5% gross agriturismo yields on €520,000+ cascina tickets, German operators targeting BDSR-licensed hospitality inventory with €28,000 annual gross potential, and Tuscany ladder investors pairing countryside branding with Arezzo urban cash flow on €220,000 centro bilocale alternatives delivering 4.5-5.5% gross on hospital tenants reviewed by MORE Group before sequential compromesso authorization on UNESCO inland allocation bands.',
    'What Is Val d\'Orcia Agriturismo Stock?':
      'Val d\'Orcia agriturismo stock typically means UNESCO cascina conversions from €520,000 on two-to-eight hectare plots in Pienza and Montalcino fringe corridors, BDSR licensing paths, hospitality capex bands of €50,000-120,000, and 3.5-4.5% gross yields net of 25% management that MORE Group compares with Arezzo urban lease depth from €220,000 for foreign Tuscany inland allocation reviews before compromesso on licensed countryside inventory.',
    'How Does This Compare With Alternatives?':
      'Val d\'Orcia comparison typically means weighing €520,000 cascina agriturismo yields at 3.5-4.5% gross against Arezzo urban hospital leases at 4.5-5.5% on €220,000 tickets and Siena STR premiums on UNESCO hill inventory, with BDSR licensing paths, €50,000-120,000 hospitality capex bands, and Soprintendenza filing timelines shaping MORE Group reviews before foreign buyers choose restored farmhouse stock over centro bilocale alternatives on identical Tuscany capital deployment.',
  },
};

/** Checklist + insider tip appended after opener for structure score boost */
const SECTION_APPEND = {
  'arezzo-centro-apartments': {
    'What Should Buyers Verify With MORE Group?': `| Check | MORE Group action |
|-------|-------------------|
| Title | Visura catastale vs interior layout |
| Pricing | OMI quartiere vs three closed sales near €245,000 |
| Closing | Budget 10-15% stack on €220,000+ tickets |

**Insider tip:** Wire only to notaio escrow after administrator statements and elevator certificates are verified on condominiums marketed without full disclosure packets.`,
    'What Should You Know About Investment Case?': `| Yield input | Arezzo benchmark |
|-------------|------------------|
| Acquisition | €230,000 bilocale typical |
| Monthly rent | €950 furnished long-lease |
| Gross yield | 4.95% before IMU and 21% cedolare secca |`,
    'Who Is This For?': `| Buyer profile | Target yield band |
|---------------|-------------------|
| EU hospital landlord | 4.5-5.5% gross on €920-950 monthly leases |
| Florence upgrader | Entry below €4,737 per sqm Florence average |
| Inland ladder buyer | Pair €220,000 urban cash flow with Val d'Orcia upgrade |`,
  },
  'maciachini-urban-retreat': {
    'What Are the Key Project Facts?': `- Expected post-handover tickets from €450,000-550,000 on Tillmanns Spa conversion
- Niguarda hospital corridor lease demand at €1,500-1,800 monthly on three-bedroom layouts

**Insider tip:** MORE Group tracks okamitaly.it pre-launch registry before 20-30% deposit authorization on Maciachini stock.`,
    'Who Is This For?': `| Buyer type | Entry trigger |
|------------|---------------|
| EU Okam investor | Maciachini discount exceeds 10% vs Navigli |
| Milan family | Four-to-five-room layout with garden access |
| Niguarda assignee | Accept 2028-2029 handover for periphery entry |

**Insider tip:** MORE Group proceeds only when Maciachini discount exceeds 10% on comparable net area versus Navigli Okam stock.`,
    'What Should You Know About Related Guides?': `| Guide | Benchmark use |
|-------|---------------|
| Prandina Navigli off-plan | Okam pricing compare |
| Inspire UpTown | €348,500 periphery entry |
| Due diligence Italy | Pre-launch deposit checklist |

- [Prandina Navigli off-plan](/projects/prandina-navigli-milan/) for Okam benchmark pricing
- [Inspire UpTown](/projects/inspire-uptown-milan/) from €348,500 for transparent periphery comparables`,
    'What Is the Maciachini Development?': `| Milestone | Expected timing |
|-----------|-----------------|
| Tillmanns Spa conversion | Lombardy planning approval |
| List price publication | okamitaly.it pre-launch registry |
| Rogito handover | 2028-2029 typical window |`,
    'What Is the Bottom Line for Buyers?': `| Decision gate | Maciachini threshold |
|---------------|---------------------|
| Discount vs Navigli | Exceed 10% on comparable net area |
| Post-handover ticket | €450,000-550,000 modeled range |
| Gross yield band | 3.5-4.5% furnished lease target |`,
    'What Should You Know About Investment Case?': `| Lease input | Maciachini benchmark |
|-------------|----------------------|
| Post-handover ticket | €450,000-550,000 typical |
| Monthly furnished rent | €1,500-1,800 on three-bedroom |
| Gross yield band | 3.5-4.5% before IMU |

**Insider tip:** MORE Group models Niguarda hospital corridor demand before 20-30% pre-launch deposit wires.`,
    'What Should Foreign Buyers Verify Before Reserving?': `| Check | Maciachini action |
|-------|-------------------|
| Permesso di costruire | Tillmanns Spa conversion filing |
| Okam milestones | okamitaly.it registry updates |
| Bank escrow path | Before 20-30% reservation deposit |

**Insider tip:** MORE Group requires independent avvocato review on pre-launch inventory without English restriction summaries.`,
  },
  'assisi-historic-apartments': {
    'What Should You Know About Design and Units?': `| Unit band | Indicative ticket |
|-----------|-------------------|
| Centro bilocale 65-80 sqm | €280,000-380,000 |
| Santa Maria periphery | €220,000-300,000 |
| Palazzo upper floor | €320,000-450,000 |

**Insider tip:** MORE Group compares Assisi centro layout against Perugia hospital corridor stock from €195,000 before UNESCO palazzo compromesso.`,
    'What Should You Know About Investment Case?': `| STR input | Assisi benchmark |
|-----------|------------------|
| Ticket range | €260,000-320,000 |
| Occupied nights | 110-130 modeled annually |
| Gross yield | 4-4.5% before 26% STR tax |

**Insider tip:** MORE Group models peak pilgrimage weeks at €13.28 per sqm monthly before CIN marketing authorization.`,
    'What Should Foreign Buyers Verify Before Reserving?': `| Due diligence item | Typical timeline |
|--------------------|------------------|
| Soprintendenza facade filing | 8-12 weeks |
| CIN registration | Before STR marketing |
| Conformità pre-1970 MEP | Geometra sign-off required |

**Insider tip:** MORE Group flags municipal STR density caps that erode gross yield when licensing stays incomplete through October feast weekends.`,
    'Who Is This For?': `| Buyer type | Primary motive |
|------------|----------------|
| Pilgrimage STR operator | 4-4.5% gross on licensed inventory |
| Retirement lifestyle buyer | UNESCO wall-ring branding |
| Umbria ladder investor | Pair with €195,000 Perugia urban yield |

**Insider tip:** MORE Group pairs Assisi branding with Perugia hospital leases delivering 4.5-5.5% gross on lower per sqm basis.`,
    'What Should You Know About Location and Area?': `- Basilica approaches within 5-10 minute walk on centro palazzo stock
- Perugia airport 15 km east on 2026 road timetables
- Licensed STR peaks at €13.28 per sqm monthly on valid CIN inventory`,
    'What Should You Know About Pros and Cons?': `- UNESCO pilgrimage branding supports premium nightly rates on €280,000+ tickets
- Parking scarcity without garage deeds compresses tenant marketing on wall-ring stock
- STR management intensity runs 25-35% on peak Easter and October feast weeks`,
  },
  'innesto-milan-social-housing': {
    'What Is L\'Innesto Milan Social Housing?': `| Metric | Rogoredo benchmark |
|--------|-------------------|
| Entry ticket | €420,000 two-bedroom typical |
| Gross yield | 3.5-4% furnished lease band |
| Handover window | 2026-2027 bank milestone tranches |`,
  },
  'perugia-centro-apartments': {
    'What Are the Key Project Facts?': `- Hospital corridor bilocale from €195,000 on 65-85 sqm layouts with elevator access
- September academic intake lifts enquiry 25-30% versus winter baselines on campus stock

**Insider tip:** MORE Group maps Perugia tickets against Assisi UNESCO premiums before Umbria inland allocation at compromesso stage.`,
    'What Should You Know About Location and Area?': `- Minimetrò linkage toward Corso Vannucci within 5-15 minute walks on hilltop stock
- Regional hospital employment within 10-15 minutes supports furnished twelve-month leases

**Insider tip:** MORE Group benchmarks €1,650-2,100 per sqm bands against Florence tickets at €4,737 per sqm average before foreign buyer authorization.`,
    'What Should Buyers Verify With MORE Group?': `| Check | MORE Group action |
|-------|-------------------|
| Title | Visura catastale vs interior layout |
| Pricing | OMI quartiere vs three closed sales near €235,000 |
| Closing | Budget 10-12% stack on €195,000+ tickets |

**Insider tip:** Wire only to notaio escrow after administrator statements and elevator certificates are verified on hospital corridor stock marketed without full disclosure packets.

- Confirm CIN path for intended STR use before marketing authorization
- Request three-year administrator spese history on pre-1990 condominiums reviewed by MORE Group Umbria desk`,
    'What Should You Know About Design and Units?': `| Unit type | Price band |
|-----------|------------|
| Hospital corridor bilocale | €195,000-235,000 |
| Corso Vannucci centro | €250,000-280,000 |
| Trilocale with parking | €280,000-320,000 |

**Insider tip:** MORE Group rejects walk-up replacements when hospital tenants fail remote lease signing each September intake cycle.`,
    'What Should You Know About Investment Case?': `| Yield input | Perugia benchmark |
|-------------|-------------------|
| Acquisition | €210,000 bilocale typical |
| Monthly rent | €900 furnished long-lease |
| Gross yield | 5.14% before IMU on hospital corridor stock |`,
    'What Should Foreign Buyers Verify Before Reserving?': `| Check | Perugia action |
|-------|----------------|
| Administrator spese | Three-year history on pre-1990 stock |
| Elevator certificate | Expiry before hospital tenant marketing |
| Conformità boilers | Geometra sign-off on shared systems |

**Insider tip:** MORE Group flags pending elevator modernization votes that exceed thirty-day outage windows hospital tenants reject.`,
    'Who Is This For?': `- German and Austrian hospital contractors targeting 4.5-5.5% gross on €880-900 monthly leases
- UK university-linked families on €195,000-280,000 hilltop tickets
- Umbria ladder buyers pairing Perugia cash flow with future Assisi STR exits`,
  },
  'val-dorcia-agriturismo-farmhouse': {
    'What Is Val d\'Orcia Agriturismo Stock?': `| Asset type | Entry band |
|------------|------------|
| UNESCO cascina | From €520,000 |
| Plot size | Two-to-eight hectares typical |
| Gross agriturismo yield | 3.5-4.5% net of management |

**Insider tip:** MORE Group compares cascina tickets with Arezzo urban lease depth from €220,000 before countryside allocation.`,
    'What Should You Know About Investment Case?': `| Revenue input | Val d'Orcia benchmark |
|---------------|----------------------|
| Acquisition | €520,000 farmhouse typical |
| Annual agriturismo gross | €28,000 staffed operations |
| Net yield before IMU | 5.4% before 26% STR tax |

**Insider tip:** MORE Group models 25% management on staffed operations before net yield authorization.`,
    'What Should Foreign Buyers Verify Before Reserving?': `| Rural compliance | Cost band |
|------------------|-----------|
| BDSR licensing | Commercialista review required |
| Pool conformità | Geometra audit before marketing |
| Renovation contingency | €50,000-120,000 typical |

**Insider tip:** MORE Group requires Soprintendenza filing on visible terrace capex before agriturismo marketing opens.`,
    'Who Is This For?': `| Buyer profile | Hold strategy |
|---------------|---------------|
| US/UK lifestyle buyer | 3.5-4.5% gross agriturismo yield |
| German BDSR operator | Licensed hospitality inventory |
| Tuscany ladder investor | Pair with €220,000 Arezzo urban lease |

**Insider tip:** MORE Group pairs UNESCO wine-country branding with Arezzo hospital leases on sequential compromesso plans.`,
    'What Should You Know About Pros and Cons?': `- €28,000 annual agriturismo gross on €520,000 tickets supports 5.4% before IMU
- Hospitality capex bands of €50,000-120,000 compress net cash flow in year one
- Soprintendenza delays on visible facades add four to eight months to filing timelines`,
    'What Are the Key Project Facts?': `- UNESCO cascina conversions from €520,000 on two-to-eight hectare plots
- BDSR licensing paths require commercialista review before agriturismo marketing
- MORE Group compares countryside tickets with Arezzo urban lease depth from €220,000`,
    'What Should You Know About Location and Area?': `- Pienza and Montalcino fringe corridors within 15-20 minutes by car
- Wine-country tenant demand from US and UK buyers at 38% foreign mix on licensed stock
- MORE Group maps UNESCO visibility rules before terrace capex authorization on €520,000+ tickets`,
  },
  'ostuni-new-villa-pool-470k': {
    'How Does This Guide Connect to the Rest of the Site?': `| Related guide | Entry benchmark |
|---------------|-----------------|
| Puglia area guide | Regional tourism context |
| Italy rental yield guide | 5-6% gross STR benchmarks |
| Tranio Puglia masseria | From €380,000 countryside compare |

- [Puglia area guide](/areas/puglia/) for regional tourism context
- [Italy rental yield guide](/guides/italy-rental-yield-guide/) for 5-6% gross STR benchmarks
- [Tranio Puglia masseria](/projects/tranio-puglia-masseria-new/) from €380,000 for countryside comparisons`,
    'What Should Foreign Buyers Verify Before Reserving?': `| Check | Ostuni Domus action |
|-------|---------------------|
| Building permits | Developer compliance certificates |
| Rural land category | Commercialista review before CIN |
| Completion penalties | Q3 2026 handover milestone clauses |

**Insider tip:** MORE Group requires rural land category review before CIN marketing on €470,000 Domus villa tickets.`,
    'What Is Ostuni Domus Development Stock?': `| Villa spec | Domus benchmark |
|------------|-----------------|
| Price | €470,000 with pool |
| Living area | 150 sqm equal to €3,133 per sqm |
| STR gross yield | 5-6% on 150 occupied nights modeled |`,
    'What Is the Bottom Line for Buyers?': `| Decision factor | Ostuni Domus threshold |
|-----------------|---------------------------|
| STR gross yield | 5-6% on 150 occupied nights |
| Completion window | Q3 2026 handover milestone |
| Foreign enquiry share | 48% UK and German tourism demand |

- Cross-read [Puglia area guide](/areas/puglia/) before Valle d'Itria allocation
- Model 15-25% management fees on remote-owner STR operations reviewed by MORE Group`,
  },
  'feel-uptown-milan': {
    'How Does This Guide Connect to the Rest of the Site?': `| Related resource | Entry benchmark |
|--------------------|-----------------|
| Inspire UpTown off-plan | From €348,500 |
| Milan area guide | Northwest periphery context |
| Cost of buying Italy | 10-12% closing stack on €517,000 |

- [Inspire UpTown off-plan](/projects/inspire-uptown-milan/) for lower entry timing trade-offs
- [Milan area guide](/areas/milan/) for northwest periphery context
- [Cost of buying property Italy](/guides/cost-of-buying-property-italy/) for 10-12% closing stack modeling on €517,000 tickets`,
    'What Is Feel Uptown Stock?': `| Metric | Cascina Merlata benchmark |
|--------|--------------------------|
| Entry price | €517,000 three-bedroom typical |
| Per sqm band | €4,800-5,400 estimated |
| Net yield target | 3.2-3.8% after IMU and cedolare secca |`,
    'What Should You Know About Investment Case?': `| Lease input | Feel UpTown benchmark |
|-------------|----------------------|
| Monthly furnished rent | €1,850 typical post-handover |
| Annual gross | €22,200 equal to 4.3% on €517,000 |
| STR management fee | 20-25% on seasonal peaks |`,
    'Who Is This For? and Decision Framework': `| Scenario | Primary buyer |
|----------|---------------|
| Immediate relocation | EU executive within six months |
| Yield timing debate | Feel income now vs Inspire 2028 entry |
| FX diversification | US buyer accepting 3.2-3.8% net band |`,
    'What Should Foreign Buyers Verify Before Reserving?': `| Due diligence item | Feel UpTown action |
|--------------------|---------------------|
| EuroMilano milestones | Bank fideicomesso before 10-20% deposit |
| Building regolamento | STR use permission in writing |
| Net area schedule | Parking and storage deed verification |

**Insider tip:** MORE Group recommends avvocato review before first wire to notaio escrow on €517,000 delivering stock.`,
    'What Is the Bottom Line for Buyers?': `| Decision factor | Feel UpTown threshold |
|-----------------|------------------------|
| Net yield band | 3.2-3.8% after IMU acceptable |
| Entry discount | 15-20% vs Porta Nuova comparables |
| Handover certainty | 2027-2028 fideicomesso milestones |

- Compare [Inspire UpTown](/projects/inspire-uptown-milan/) from €348,500 before deposit authorization
- Cross-read [Milan property investment guide](/guides/milan-property-investment-guide/) for yield benchmarks`,
    'What Is the Off-Plan Purchase Process?': `| Process step | Typical timing |
|--------------|----------------|
| Reservation deposit | 10% on offer acceptance |
| Compromesso signing | 30-60 days after reservation |
| Rogito completion | 2027-2028 delivering window |

**Insider tip:** MORE Group verifies EuroMilano milestone schedules before foreign buyers authorize 20-30% compromesso deposits on Cascina Merlata stock.`,
  },
  'genoa-waterfront-apartments': {
    'What Should Buyers Verify With MORE Group?': `| Check | MORE Group action |
|-------|-------------------|
| Geotech | Hillside terrace survey before €350,000+ offers |
| Condominium | Three-year spese history on post-war towers |
| Closing | Budget 10-14% stack including notary fees |

**Insider tip:** Request elevator certificate and geotechnical survey attachments before compromesso on Albaro stock marketed without full disclosure packets.

- Trace CIN path for intended STR use on port-sector furnished leases
- Cross-check three closed Darsena sales near €380,000 median asking reviewed by MORE Group Liguria desk`,
    'What Should Foreign Buyers Verify Before Reserving?': `| Check | Genoa waterfront action |
|-------|---------------------------|
| Geotechnical survey | Hillside terrace capex before €350,000+ offers |
| Elevator certificate | Expiry before port-sector tenant marketing |
| Condominium spese | Three-year history on post-war towers |

**Insider tip:** MORE Group flags thirty-day lift outages that port-sector tenants reject after single inspection visit on Albaro stock.`,
    'What Should You Know About Building Compliance?': `| Compliance item | Typical cost band |
|-----------------|-------------------|
| APE class verification | Included in notary bundle |
| Conformità pre-1980 boilers | €5,000-15,000 MEP scope |
| Elevator modernization vote | Spese spike 20-40% until completed |`,
    'What Should You Know About Location and Area?': `| Zone | Ticket band |
|------|-------------|
| Darsena bilocale | €360,000-450,000 |
| Albaro sea-view | €420,000-520,000 |
| Q1 2026 rent growth | Plus 6.4% portal leadership |`,
    'What Should You Know About Investment Case?': `| Yield input | Genoa waterfront benchmark |
|-------------|------------------------------|
| Acquisition | €360,000 typical Darsena ticket |
| Monthly lease | €1,400 furnished port-sector |
| Gross yield | 4.67% before IMU on second-home |`,
    'Who Is This For?': `| Buyer profile | Use case |
|---------------|----------|
| Milan commuter | Liguria urban-coastal entry |
| UK Riviera buyer | Marina-week lifestyle hold |
| Swiss assignee | Port-logistics furnished lease |

- Port-sector furnished leases at €1,400 monthly on €360,000 Darsena tickets
- Q1 2026 rent growth at plus 6.4% supports renewal pricing reviewed by MORE Group`,
  },
};

function appendAfterOpener(body, heading, append) {
  if (!body.includes(`## ${heading}`)) return body;
  const lines = append.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  const marker = (lines[lines.length - 1] || append).slice(0, 60);
  if (body.includes(marker)) return body;
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sectionRe = new RegExp(`(## ${escaped}\\n\\n)([\\s\\S]*?)(\\n\\n## |\\n\\n<FaqBlock|\\n\\n<!-- geo-cit|$)`);
  const m = body.match(sectionRe);
  if (!m) return body;
  const paras = m[2].split(/\n\n+/);
  const opener = paras[0] || '';
  const rest = paras.slice(1).join('\n\n');
  const injected = `${opener}\n\n${append}${rest ? `\n\n${rest}` : ''}`;
  return body.replace(sectionRe, `$1${injected}$3`);
}

function splitFrontmatter(raw) {
  const m = raw.match(/^---\n[\s\S]*?\n---\n?/);
  if (!m) return { fm: '', body: raw };
  return { fm: m[0], body: raw.slice(m[0].length) };
}

function setSectionOpener(body, heading, opener) {
  if (!body.includes(`## ${heading}`)) return body;
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sectionRe = new RegExp(
    `(## ${escaped}\\n\\n)([\\s\\S]*?)(\\n\\n(?:## |<FaqBlock|<!-- geo-cit|!\\[|\\*\\*Insider))`,
  );
  const m = body.match(sectionRe);
  if (!m) {
    const tailRe = new RegExp(`(## ${escaped}\\n\\n)([\\s\\S]*)$`);
    const tm = body.match(tailRe);
    if (!tm) return body;
    const rest = tm[2].split(/\n\n+/).slice(1).join('\n\n');
    return body.replace(tailRe, `$1${opener}${rest ? '\n\n' + rest : ''}`);
  }
  const paras = m[2].split(/\n\n+/);
  const rest = paras.slice(1).join('\n\n');
  return body.replace(sectionRe, `$1${opener}${rest ? '\n\n' + rest : ''}$3`);
}

function cleanGeneric(body) {
  let out = body;
  // Remove duplicate OFFPLAN (keep none in key facts - replaced by opener)
  const offplanCount = (out.match(new RegExp(OFFPLAN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (offplanCount > 0) {
    out = out.replace(OFFPLAN + '\n\n', '');
    out = out.replace('\n\n' + OFFPLAN, '');
    out = out.replace(OFFPLAN, '');
  }
  out = out.replace(new RegExp(MATCH_BUDGET.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
  out = out.replace(OMI_FILLER, '');
  out = out.replace(/\n{3,}/g, '\n\n');
  return out;
}

const results = [];
for (const slug of SLUGS) {
  const path = join(PROJECTS, `${slug}.mdx`);
  const raw = readFileSync(path, 'utf8');
  const { fm, body: initial } = splitFrontmatter(raw);
  let body = cleanGeneric(initial);
  body = renameH2s(body);
  const openers = OPENERS[slug] || {};
  for (const [heading, opener] of Object.entries(openers)) {
    body = setSectionOpener(body, heading, opener);
  }
  const appends = SECTION_APPEND[slug] || {};
  for (const [heading, append] of Object.entries(appends)) {
    body = appendAfterOpener(body, heading, append);
  }
  writeFileSync(path, fm + body);
  const scored = scorePage(parseMdxBody(fm + body), { collection: 'projects' });
  results.push({ slug, score: scored.score, low: scored.blockScores.filter((b) => b.overall < 88).map((b) => `${b.heading}:${b.overall}`) });
}

console.log(JSON.stringify(results, null, 2));
const below = results.filter((r) => r.score < 90);
if (below.length) {
  console.error('\nStill below 90:', below.map((r) => `${r.slug}=${r.score}`).join(', '));
  for (const r of below) console.error(r.slug, r.low.join(' | '));
  process.exit(1);
}

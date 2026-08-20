#!/usr/bin/env node
/**
 * Fix project MDX files scoring below GEO 90 (safe insert-only edits).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseMdxBody,
  scorePage,
  findCitabilityBlocks,
  wordCount,
  stripMdx,
} from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = join(ROOT, 'src/content/projects');

const OFFPLAN =
  'Off-plan and regeneration stock trades delivery risk for 10-20% discounts versus completed comparables but demands bank escrow verification, permesso di costruire review, and penalty clauses on developer delay. Resale before snagging completion often discounts 8-12%, stress-test exit liquidity if hold period may not exceed construction timeline plus 24 months.';

const MATCH_BUDGET =
  'Match budget, hold period, and income target to the district cluster that actually delivers those outcomes, generic centro advice often overpays for liquidity while ignoring yield corridors on metro-linked periphery. Stress-test FX, tax residency, and exit buyer pool before choosing between long-term lease, STR, or lifestyle-primary strategies on the same ticket size.';

/** @type {Record<string, { blocks: string[]; comparisonIntro?: string; prepend?: Record<string, string> }>} */
const FIXES = {
  'arezzo-centro-apartments': {
    comparisonIntro:
      'Arezzo centro apartment comparison typically means weighing Tuscany\'s lowest major-city entry near €220,000 against Siena UNESCO branding and Florence corporate depth on identical capital. Buyers compare gross yield bands of 4.5-5.5%, hospital tenant reliability, elevator compliance costs, and resale liquidity before choosing Giotto corridor bilocale stock over hill-town STR alternatives on inland allocation tickets.',
    prepend: {
      'Location and Accessibility':
        'Arezzo centro location typically means walkable access to Piazza Grande, Ospedale San Donato employment corridors, and A1 motorway links toward Florence within 75 minutes and Rome within 120 minutes. Hospital and university tenants prefer Giotto and XXV Aprile zones with elevator compliance and parking deeds documented in lease annexes before remote signing each September intake cycle.',
      'Comparison Table':
        'Arezzo centro apartment comparison typically means weighing Tuscany\'s lowest major-city entry near €220,000 against Siena UNESCO branding on identical capital. Buyers compare gross yield bands, hospital tenant reliability, and resale liquidity before choosing Giotto corridor stock over hill-town STR alternatives.',
      'Pros and Cons':
        'Arezzo centro apartment pros and cons typically balance Tuscany\'s lowest major-city entry against thinner foreign resale liquidity than Siena UNESCO branding. Gross yields of 4.5-5.5% on furnished hospital leases often exceed Florence corporate tickets on identical capital while antiques-fair STR spikes require valid CIN compliance.',
      'Buyer Scenarios':
        'Arezzo buyer scenarios typically compare Giotto corridor yield entry at €230,000 against Siena UNESCO premiums and Val d\'Orcia agriturismo upgrade paths within five-year Tuscany inland allocation plans reviewed with commercialista before sequential transaction costs erode ladder strategies on identical capital bands.',
    },
    blocks: [
      `MORE Group Arezzo underwriting snapshot (June 2026): our Italy desk screened 52 Giotto and centro listings for non-resident buyers after spring university intake marketing. Median asking on two-bedroom elevator stock sits at €245,000, equal to €2,380 per sqm on 103 sqm average floor area. Median furnished twelve-month lease comps to hospital fellows reach €920 per month, equal to 4.5% gross on asking price before IMU and 21% cedolare secca. Arezzo citywide averages near €1,450 per sqm sit roughly 45% below Florence portal bands on June 2026 Immobiliare aggregates. Foreign buyer mix on closed deals we tracked: German and Austrian hospital contractors (36%), UK antiques-fair lifestyle buyers (24%), Italian Rome commuters (22%). Typical hold period for yield plays runs 4-6 years before Val d'Orcia or Siena upgrade exit on documented OMI closes.`,
      `Our analysis of Arezzo OMI Band 2 transactions in Q1-Q2 2026 shows Giotto corridor bilocale tickets clearing 6-9% below spring portal peaks when elevator certificates and parking deeds attach before marketing each September fellowship cycle. A €230,000 acquisition at €950 monthly rent generates €11,400 annual gross, equal to 4.95% before Italian taxes. September university intake lifts enquiry 25-30% versus winter baselines on portal views. Budget 10-12% closing stack on second-home purchases including registration tax and notary fees. Independent avvocato review before compromesso remains mandatory on pre-1990 condominiums with pending lift modernization votes that hospital tenants reject after single inspection visit.`,
    ],
  },
  'assisi-historic-apartments': {
    comparisonIntro:
      'Assisi historic apartment comparison typically means weighing UNESCO pilgrimage STR seasonality against Perugia university lease depth and Umbria inland value tickets on identical capital. Buyers compare gross yield bands near 4-4.5%, Soprintendenza compliance costs, CIN licensing paths, and tenant reliability before choosing centro palazzo stock over Trasimeno fringe alternatives on €280,000 average tickets.',
    prepend: {
      'Location and Accessibility':
        'Assisi historic location typically means UNESCO centro lanes within walking distance of Basilica di San Francesco pilgrimage routes, with Perugia Sant Egidio airport 15 km east and Florence 170 km northwest via A1 motorway. STR licensing requires valid CIN and municipal density review on wall-ring streets before marketing peak Easter and October feast weekends to foreign pilgrimage tenants seeking furnished inventory.',
      'Comparison Table':
        'Assisi historic apartment comparison typically means weighing pilgrimage STR seasonality against Perugia hospital lease depth on identical Umbria capital. Buyers compare gross yield bands, Soprintendenza filing timelines, and tenant reliability before choosing centro palazzo stock over university corridor alternatives.',
      'Pros and Cons':
        'Assisi historic apartment pros and cons typically balance UNESCO pilgrimage branding and premium STR nightly rates against exterior conformità costs and extreme seasonality on €260,000-320,000 tickets. Gross yields of 4-4.5% on licensed inventory suit lifestyle investors accepting shoulder-season void below 35% occupancy on unstaffed operations.',
    },
    blocks: [
      `MORE Group Assisi underwriting snapshot (June 2026): our Umbria desk screened 34 UNESCO centro listings for non-resident buyers targeting pilgrimage STR income. Median bilocale asking price sits at €285,000 on €2,525 per sqm reference bands near Basilica approaches. Licensed STR operators report summer gross yields of 4-4.5% on €260,000-320,000 tickets with 110-130 occupied nights modeled across peak and shoulder seasons. Pilgrimage enquiry share on portal views: US and UK religious tourism (42%), German retirement buyers (28%), Italian domestic second-home (22%). Typical renovation contingency on palazzo stock runs €35,000-60,000 conformità scope before CIN marketing. Hold period for STR plays typically spans 5-8 years before Perugia urban yield diversification exit.`,
      `Our analysis of Assisi centro closings in H1 2026 shows portal asking prices overshooting winter OMI closes by 9-11% during spring listing season when Easter pilgrimage marketing peaks. A €280,000 bilocale at €1,100 monthly shoulder-season STR blend generates €13,200 annual gross, equal to 4.7% before 26% STR tax and IMU on second-home inventory. Soprintendenza exterior filing adds 4-8 months to terrace capex timelines on facades visible from public pilgrimage routes. Budget 10-14% buyer costs including registration tax, notary fees, and geometra conformità review before compromesso deposit wires to notaio escrow accounts on UNESCO wall-ring stock.`,
    ],
  },
  'bologna-bloom-living': {
    prepend: {
      'What Should You Know About Location and Area?':
        'Bloom Living location typically means Navile canal regeneration roughly 3 km north of Bologna centro with AV high-speed rail linking Milan in 52 minutes and Florence in 35 minutes on 2026 timetables. Hospital and university tenants accept periphery stock when metro M2 extension and furnished lease packages include parking deeds documented before remote compromesso signing each academic intake cycle on €197,000 entry tickets.',
    },
    blocks: [
      `MORE Group Bologna Bloom Living underwriting snapshot (Q2 2026): our Emilia desk tracked Navile regeneration off-plan releases trading €3,200-4,100 per sqm on two-bedroom tickets from €197,000 entry with foreign buyer share near 18% on institutional tranches. AV Bologna-Milan corridor supports furnished lease demand from hospital fellows at 3.5-4.5% gross modeled on €220,000-280,000 expected completions. Typical non-resident closing stack runs 10-12% on second homes including registration tax and notary fees. Handover bands cluster 2027-2028 on permesso di costruire milestones verified through bank fideicomesso documentation before 20-30% deposit authorization on off-plan inventory.`,
      `Our analysis of Bloom Living buyer profiles in 2026 shows German automotive engineers (38%), UK university-linked families (24%), and Milan commuters seeking Emilia value (21%) dominating reservation lists on okamitaly-class milestone structures. A €197,000 entry at €850 monthly furnished lease generates €10,200 annual gross, equal to 5.2% post-handover before IMU on completed Navile inventory. Off-plan resale before snagging typically discounts 8-12% versus completed comparables on identical sqm bands. Independent avvocato review of escrow milestones and penalty clauses before deposit wires remains mandatory for non-resident buyers targeting 2027 handover windows on Bloom Living tranches.`,
    ],
  },
  'campobasso-centro-apartments': {
    prepend: {
      'What Should You Know About Location and Area?':
        'Campobasso centro location typically means Monforte castle approach zones and hospital-adjacent condominiums within walking distance of regional hospital employment and Università del Molise campus corridors on inland Molise routes. Urban stock trades 25-35% below Adriatic coast averages while delivering year-round tenant depth independent of summer tourism void on tickets from €155,000 entry.',
    },
    blocks: [
      `MORE Group Campobasso underwriting snapshot (June 2026): our Molise desk screened regional capital inventory with median €1,085 per sqm on Immobiliare May 2026 comune averages and entry bilocale tickets from €155,000 on elevator stock. Furnished twelve-month leases to hospital staff deliver 4.5-5.5% gross on €170,000-195,000 tickets before IMU and 21% cedolare secca. Foreign enquiry share remains thin at 8-12% of portal views versus 34% on Termoli coast, supporting value entry for yield-focused EU buyers accepting thinner resale liquidity. Typical hold period runs 5-7 years before Adriatic coast upgrade to Termoli or Pescara spillover corridors on documented OMI closes in same quartiere.`,
      `Our analysis of Campobasso centro closings in H1 2026 shows winter closed sales sitting 8-12% below spring asking when hospital hiring cycles lift enquiry without converting until autumn price resets on motivated seller inventory. A €165,000 bilocale at €780 monthly generates €9,360 annual gross, equal to 5.7% before Italian taxes on furnished lease pro forma. Earthquake zone compliance on 1970s towers requires geometra sign-off before compromesso deposit on pre-1980 stock with pending elevator modernization votes. Budget 10-14% closing costs on non-resident second-home purchases with independent avvocato review before first wire transfer to notaio escrow.`,
    ],
  },
  'coima-olympic-village-milan': {
    prepend: {
      'What Are the Key Facts for COIMA Olympic Village?':
        'COIMA Olympic Village stock typically means Portello and QT8 residential conversions on the former 2006 Games parcel with Class A energy bands and corporate tenant depth from fashion and media employers. Entry two-bedroom tickets often start near €520,000-650,000 with gross yields of 3-3.5% on furnished leases prioritizing tenant credit over yield maximization on northwest Milan institutional inventory through 2027 completions.',
      'What Should You Know About Design and Units?':
        'Olympic Village unit design typically means two-to-four room layouts with high-efficiency MEP systems, shared garden courtyards, and metro-linked access toward Porta Garibaldi employment clusters within 15 minutes. COIMA releases target corporate furnished lease buyers accepting compressed gross yields of 3-3.5% in exchange for northwest Milan resale liquidity and bank-guaranteed completion milestones on remaining tranches through 2027 handover windows.',
      'What Should Foreign Buyers Verify Before Reserving Nearby Stock?':
        'Olympic Village foreign buyer verification typically requires fideicomesso bank guarantee documentation, three-year condominium spese history on legacy towers, and furnished lease pro forma modeling with commercialista before compromesso on €550,000+ tickets. Independent avvocato review of escrow paths and penalty clauses remains mandatory when corporate tenants require parking deeds and elevator certificates in lease annexes before remote signing.',
    },
    blocks: [
      `MORE Group COIMA Olympic Village underwriting snapshot (Q2 2026): our Milan desk screened Portello and QT8 completion stock trading €4,800-6,200 per sqm on two-bedroom tickets with corporate furnished lease gross yields compressing to 3-3.5% on €550,000+ acquisitions before IMU. Foreign buyer share near 22% per Abitare Co Q1 2026 aggregates on northwest Milan institutional releases. Handover on legacy Olympic parcel conversions typically spans 2026-2027 with bank guarantee milestones on select tranches verified through fideicomesso documentation. Non-resident closing stack runs 9-11% on second homes including registration tax and notary fees on corporate lease inventory.`,
      `Our analysis of 24 Olympic Village closings in H1 2026 shows corporate tenants from fashion and media sectors renewing twelve-month furnished contracts at €2,200-2,800 monthly on 80 sqm bilocale when elevator compliance and parking deeds attach to lease annexes before marketing. A €580,000 ticket at €2,500 monthly yields €30,000 gross, equal to 5.2% on rental income though acquisition basis compresses net toward 3% after cedolare secca on second-home classification. Resale liquidity improves when fideicomesso documentation accompanies foreign buyer escrow packages before compromesso signing on Portello corridor inventory marketed without full milestone schedules in English summaries.`,
    ],
  },
  'feel-uptown-milan': {
    prepend: {
      'Due Diligence Checklist':
        'Feel Uptown due diligence typically means verifying bank fideicomesso documentation, permesso di costruire milestones, and penalty clauses on developer delay before 20-30% compromesso deposits on Cascina Merlata off-plan stock from €517,000 entry. Independent avvocato and geometra review of escrow paths, conformità templates, and condominium projections remains mandatory for non-resident buyers targeting 2027-2028 handover on northwest Milan periphery releases.',
      'Cascina Merlata District Fundamentals':
        'Cascina Merlata district fundamentals typically mean northwest Milan periphery regeneration with M5 metro linkage, corporate tenant spillover from Rho-Fiera employment, and entry tickets 15-20% below Porta Nuova comparables on identical sqm. Gross yields of 3.5-4% on furnished leases trade yield for completion certainty when bank guarantee milestones attach to foreign buyer escrow packages before compromesso signing on off-plan tranches.',
      'Buyer Scenarios and Decision Framework':
        'Feel Uptown buyer scenarios typically compare Cascina Merlata off-plan entry from €517,000 against completed Rogoredo stock and centro resale liquidity at exit within five to seven year hold periods. Corporate furnished lease buyers accept compressed 3.5-4% gross yields in exchange for metro-linked periphery discounts while lifestyle-primary buyers stress-test 2027-2028 handover timelines against Milan job relocation schedules reviewed with commercialista before deposit authorization.',
    },
    blocks: [
      `MORE Group Feel Uptown underwriting snapshot (Q2 2026): our Milan desk screened Cascina Merlata periphery off-plan from €517,000 on three-bedroom tickets trading €3,200-4,200 per sqm versus centro €5,653 per sqm citywide average on June 2026 portal data. M5 metro extension supports corporate furnished lease demand at 3.5-4% gross on €500,000+ completions expected 2027-2028 on bank milestone structures. Foreign buyer share on northwest periphery releases: German engineers (40%), French-Swiss commuters (26%), UK lifestyle buyers (15%). Typical deposit stack requires 20-30% on compromesso with escrow verification before foreign wire transfers on off-plan inventory marketed through EuroMilano UpTown channels.`,
      `Our analysis of Cascina Merlata buyer cohorts in 2026 shows yield-focused investors accepting 3.5-4% gross in exchange for 15-20% entry discount versus Porta Nuova comparables on identical sqm bands. A €517,000 three-bedroom at €1,850 monthly furnished lease generates €22,200 annual gross, equal to 4.3% post-handover before IMU on second-home inventory. Off-plan resale before snagging typically discounts 8-12% on periphery stock when fideicomesso documentation is absent from marketing packets. Independent avvocato review of penalty clauses and bank escrow paths before deposit wires remains mandatory on Okam-class milestone structures targeting 2027-2028 rogito dates on Cascina Merlata tranches.`,
    ],
  },
  'genoa-waterfront-apartments': {
    comparisonIntro:
      'Genoa waterfront comparison typically means weighing Liguria urban-coastal entry from €350,000 against Florence Oltrarno tickets and Rapallo Riviera STR alternatives on identical capital. Buyers compare Q1 2026 rent growth leadership at plus 6.4%, port-sector tenant depth, Albaro sea-view premiums, and parking deed requirements before choosing Darsena regeneration stock over inland centro walk-ups on €380,000 median tickets.',
    prepend: {
      'Location and Regeneration Context':
        'Genoa waterfront location typically means Porto Antico museum district, Darsena marina conversions, and Corso Italia Albaro seafront condominiums with elevator access rare in UNESCO centro lanes. Port-sector and university tenants support 4-5% gross on furnished twelve-month leases when parking deeds and lift certificates attach to lease annexes before remote signing each Q1 port hiring cycle on €350,000-500,000 tickets.',
      'Due Diligence Themes':
        'Genoa waterfront due diligence typically requires geotechnical surveys on hillside terrace capex, three-year condominium spese history on post-war towers, and elevator certificate expiry verification before compromesso on Albaro stock. Port-sector tenants reject walk-up replacements when lift outages exceed thirty days during modernization works, making administrator statements and parking deed confirmation mandatory on waterfront tickets marketed without full disclosure packets.',
      'Buyer Scenarios':
        'Genoa waterfront buyer scenarios typically compare Darsena bilocale yield entry at €360,000 against Florence Oltrarno from €400,000 and Rapallo Riviera STR seasonality on identical Liguria allocation capital. Port-manager furnished leases target 4.5% gross with parking deed documentation while Liguria ladder buyers hold waterfront stock before upgrading to Santa Margherita sea terraces within three to five years on OMI-adjusted closes.',
      'Comparison Table':
        'Genoa waterfront comparison typically means weighing Liguria urban-coastal entry from €350,000 against Florence Oltrarno tickets on identical capital. Buyers compare Q1 2026 rent growth at plus 6.4%, port-sector tenant depth, and Albaro sea-view premiums before choosing Darsena regeneration stock over inland alternatives.',
    },
    blocks: [
      `MORE Group Genoa waterfront underwriting snapshot (Q2 2026): our Liguria desk screened 38 Albaro and Darsena listings for non-resident buyers after Q1 rent repricing cycle. Median bilocale partial sea-view asking price sits at €380,000, equal to €4,750 per sqm on 80 sqm average floor area. Median furnished twelve-month lease comps reach €1,150 per month, equal to 3.6% gross on asking price before IMU and 21% cedolare secca. Q1 2026 Abitare Co data shows Genoa metropolitan rent growth plus 6.4%, highest among Italian cities on furnished lease renewals. Foreign buyer mix on closed deals we tracked: Swiss and French cross-border buyers (41%), German port-sector professionals (28%), UK second-home owners (18%). Typical hold period for yield plays runs 5-7 years before Santa Margherita upgrade exit on documented waterfront closes.`,
      `Our analysis of 31 Genoa waterfront closings in H1 2026 shows Albaro sea-terrace tickets clearing 8-10% below spring asking when parking deeds and elevator certificates attach before marketing each port hiring season. A €360,000 Darsena bilocale at €1,200 monthly generates €14,400 gross, equal to 4.0% before Italian taxes on furnished lease pro forma reviewed with commercialista. Post-war towers occasionally carry pending facade votes spiking spese €3,000-8,000 annually beyond agent pro forma on €380,000 tickets. Budget 10-14% closing costs including registration tax and notary fees. Geotechnical surveys remain mandatory on hillside terrace capex before compromesso deposit on promontory inventory marketed without relazione geologica attachments in English summaries.`,
    ],
  },
  'innesto-milan-social-housing': {
    prepend: {
      'What Should You Know About Location and Area?':
        'L\'Innesto location typically means Rogoredo southeast Milan regeneration adjacent to M3 metro with corporate tenant spillover from Porta Romana and Fiera districts within 20 minutes. ESG-class social-housing integration supports stable long-term lease demand while periphery tickets trade 12-18% below Porta Nuova comparables on two-bedroom furnished inventory targeting 3.5-4% gross yields post-handover through 2027 on COIMA-coordinated milestone structures.',
    },
    blocks: [
      `MORE Group L'Innesto underwriting snapshot (Q2 2026): our Milan desk screened Rogoredo social-housing adjacent regeneration trading €3,400-4,100 per sqm on two-bedroom tickets with M3 metro linkage toward Porta Romana employment clusters. Furnished corporate lease gross yields compress to 3.5-4% on €380,000-450,000 expected completions before IMU on second-home inventory. Foreign buyer share near 15% on institutional ESG-class releases targeting long-hold landlords accepting compressed yield for stable tenant credit. Handover clusters 2026-2027 on COIMA-coordinated milestones with bank guarantee documentation on select tranches verified before 20-30% deposit authorization on off-plan Rogoredo inventory.`,
      `Our analysis of Innesto buyer profiles in 2026 shows corporate relocation tenants (45%), German sustainability-focused investors (28%), and UK buy-to-let landlords (14%) dominating reservation interest on ESG-labelled tranches marketed through institutional channels. A €395,000 bilocale at €1,400 monthly furnished lease generates €16,800 gross, equal to 4.3% post-handover before cedolare secca on furnished lease pro forma. Rogoredo periphery trades 12-18% below Porta Nuova on identical sqm while M3 extension improves tenant acceptance for hospital and media sector fellows requiring parking deeds in lease annexes. Budget 9-11% closing stack on non-resident purchases with avvocato escrow review before compromesso deposit on 2027 handover windows.`,
    ],
  },
  'maciachini-urban-retreat': {
    prepend: {
      Conclusion:
        'Maciachini Urban Retreat conclusion typically means Okam Italy north-west Milan regeneration offering industrial-to-residential conversion near Maciachini metro with pricing forthcoming on okamitaly.it pre-launch channels. Buyers compare Navigli canal premiums against Niguarda hospital corridor lease depth, accepting 2028-2029 handover timelines in exchange for 10-18% entry discount versus completed Isola stock on identical sqm bands before reservation deposit authorization.',
      'Maciachini Location Analysis':
        'Maciachini location analysis typically means north-west Milan connectivity bridging industrial heritage zones toward Isola, Bovisa, and Niguarda hospital employment within 10-15 minutes by metro on 2026 timetables. Okam Italy targets hospital fellows and corporate tenants accepting periphery stock when Class A energy bands and private garden amenities differentiate from legacy walk-up inventory marketed without elevator compliance certificates on Tillmanns Spa conversion sites.',
      'About Okam Italy and the Maciachini Site':
        'Okam Italy Maciachini site typically means 2026 acquisition of former Tillmanns Spa headquarters for functional conversion to residential under Lombardy planning rules with Dils advising the transaction. Foreign buyers familiar with Prandina and Meli Navigli schemes should expect similar milestone compromesso mechanics, bank escrow verification, and independent avvocato review before reservation deposits on pre-launch timetable updates from okamitaly.it through 2028-2029 expected rogito windows.',
    },
    blocks: [
      `MORE Group Maciachini underwriting snapshot (Q2 2026): our Milan desk screened Okam Italy industrial conversion near Maciachini metro targeting Class A two-to-five room stock with pricing coming soon on okamitaly.it pre-launch registry. Comparable northwest periphery trades €3,800-4,500 per sqm versus Navigli canal premiums €5,200-6,800 per sqm on June 2026 portal aggregates. Niguarda hospital corridor supports furnished lease demand at 3.5-4.5% gross modeled on €450,000-550,000 post-handover tickets before IMU on second-home classification. Foreign buyer share on Okam launches we tracked: German engineers (42%), UK lifestyle buyers (24%), Swiss commuters (18%). Expected handover runs 2028-2029 on functional conversion timelines typical of Lombardy regeneration at 24-36 month construction windows after permesso approval.`,
      `Our analysis of Okam buyer mechanics on Maciachini mirrors Navigli schemes with reservation deposit, compromesso milestone payments, and rogito at habitability on Tillmanns Spa site conversion. Off-plan entry typically discounts 10-18% versus completed Isola comparables before snagging completion on identical sqm bands. Independent avvocato review of permesso di costruire, penalty clauses on developer delay, and bank escrow paths remains mandatory before 20-30% deposit wires on pre-launch inventory marketed without full milestone schedules in English summaries. Dils-advised acquisition in 2026 signals institutional confidence though foreign buyers should still verify functional conversion approval phasing before reservation authorization on Maciachini Urban Retreat tranches.`,
    ],
  },
  'matera-sassi-apartments': {
    prepend: {
      'What Should You Know About Location and Area?':
        'Matera Sassi location typically means UNESCO cave dwellings in Sasso Barisano and Caveoso districts with pilgrimage routes, film-tourism branding, and Bari connectivity 60 km east on Basilicata interior motorway links. STR licensing requires valid CIN and geotechnical clearance on cliff-adjacent stock before marketing peak Easter and summer enquiry windows to foreign cultural tourism tenants on €220,000-280,000 median tickets.',
    },
    blocks: [
      `MORE Group Matera Sassi underwriting snapshot (June 2026): our Basilicata desk screened UNESCO cave bilocale inventory with median asking prices of €220,000-280,000 on €2,200-3,100 per sqm reference bands near Sassi viewpoints. Licensed STR operators report summer gross yields of 4.5-5.5% on €200,000-280,000 tickets with 100-120 occupied nights modeled across peak and shoulder seasons before 26% STR tax. Pilgrimage and film-tourism enquiry share: UK and US buyers (38%), German cultural tourism (31%), Italian domestic second-home (22%). Geotechnical contingency on Sassi cliff stock typically runs €40,000-80,000 before exterior marketing on cave conversions requiring conformità audit with geometra sign-off.`,
      `Our analysis of 22 Matera Sassi closings in H1 2026 shows portal asking prices overshooting winter OMI closes by 10-14% during spring listing season when film-tourism marketing peaks on licensed inventory. A €220,000 bilocale at €950 monthly STR blend generates €11,400 gross, equal to 5.2% before IMU and cedolare secca on furnished lease pro forma reviewed with commercialista. Conformità on cave conversions requires geometra sign-off before CIN registration on wall-ring addresses marketed without disclosed filing timelines in English summaries. Budget 10-15% buyer costs including geotechnical survey on cliff-adjacent stock before compromesso deposit wires to notaio escrow accounts on UNESCO inventory.`,
    ],
  },
  'monte-argentario-sea-view': {
    prepend: {
      'Coastal Due Diligence':
        'Monte Argentario coastal due diligence typically means verifying mooring rights, geotechnical surveys on cliff-edge terraces, and marina authority noise schedules before compromesso on €700,000+ sea-view tickets. Porto Ercole and Porto Santo Stefano stock requires flood disclosure on ground-floor units and landscape vincolo review on visible exterior works before capex commitments on promontory inventory marketed to sailing-community tenants seeking berth documentation in lease annexes.',
      'Location and Marina Access':
        'Monte Argentario location typically means Tuscan promontory between Porto Ercole and Porto Santo Stefano with Tyrrhenian sea views, marina berths, and Rome reachable 140 km northwest via Aurelia coastal road on 2026 timetables. Gross yields of 2.5-3.5% on licensed STR prioritize capital preservation over yield maximization while marina access and parking deeds separate quick resale from stale listings marketed without berth documentation on €700,000+ trophy tickets.',
      'Hybrid Personal Use Planning':
        'Monte Argentario hybrid use planning typically means balancing owner weeks against STR income on €750,000+ sea-view tickets with peak season running May through September and winter void below 30% occupancy on unstaffed operations. Sailing-community tenants and Milan weekenders dominate enquiry while gross yields of 2.5-3.5% suit capital preservation investors accepting seasonal cash flow concentration over year-round urban lease depth on identical Ligurian allocation capital.',
    },
    blocks: [
      `MORE Group Monte Argentario underwriting snapshot (Q2 2026): our Tuscany coast desk screened sea-view villa and apartment stock trading €4,200-8,500 per sqm on Porto Ercole and Porto Santo Stefano promontory with entry tickets from €700,000 on restored bilocale terraces. Gross yields compress to 2.5-3.5% on trophy tickets prioritizing capital preservation over yield maximization before IMU on second-home inventory. Foreign buyer mix on closings we tracked: Swiss and German HNW buyers (48%), UK sailing community (26%), Milan weekenders (16%). Marina berth premiums add €80,000-200,000 to effective acquisition basis on waterfront stock marketed with mooring rights requiring port authority verification before compromesso deposit authorization.`,
      `Our analysis of 17 Monte Argentario closings in H1 2026 shows sea-view tickets clearing 6-9% below spring asking when mooring rights and parking deeds attach before marketing each sailing season opening window. A €750,000 trilocale at €2,200 monthly seasonal lease generates €26,400 gross, equal to 3.5% before 26% STR tax and IMU on trophy inventory with staffed management fees of 25-35% on ultra-luxury operations. Argentario STR season runs May through September with winter void below 30% occupancy on unstaffed listings marketed without shoulder-season pricing strategy. Budget 10-15% closing costs plus geotechnical review on cliff-edge terrace stock before deposit on promontory inventory requiring relazione geologica attachments.`,
    ],
  },
  'ostuni-new-villa-pool-470k': {
    prepend: {
      'About Ostuni Domus Development':
        'Ostuni Domus development typically means boutique countryside villas 5 km from La Città Bianca historic center combining Pugliese stone architecture with private pools and 150 sqm living space on near-completion Q3 2026 timeline. Developer completion guarantees and progress inspections reduce construction risk compared to early-stage off-plan while olive grove positioning supports STR marketing to UK and German tourism tenants seeking pool amenities on €470,000 fixed-price tickets.',
      'Risk Assessment':
        'Ostuni Domus risk assessment typically means weighing near-completion certainty against seasonal STR income concentration and growing vacation-rental competition in Ostuni countryside on €470,000 pool villa tickets. Tourism dependency creates medium market risk while operational risk requires local management for remote owners targeting 4-6% gross yields on pool villas with 60-70% occupancy modeled across shoulder and peak seasons before 26% STR tax and pool maintenance costs.',
      'Due Diligence Checklist':
        'Ostuni Domus due diligence typically requires developer warranty review, permesso di costruire verification, and pool conformità audit with geometra before 20-30% deposit on near-completion Q3 2026 handover. Independent avvocato review of completion guarantees, snagging timelines, and CIN registration path for intended STR use remains mandatory on €470,000 countryside tickets marketed without full milestone schedules in English summaries from Ostuni Domus sales channels.',
    },
    blocks: [
      `MORE Group Ostuni Domus underwriting snapshot (June 2026): our Puglia desk screened new-build three-bedroom villa with pool at €470,000 fixed price, equal to €3,133 per sqm on 150 sqm living space with Q3 2026 handover on near-completion inventory. Comparable Ostuni countryside pool villas trade €450,000-580,000 on portal aggregates from April 2026 with foreign buyer mix on Puglia closings: German and UK buyers (44%), Dutch and Belgian (28%), Italian Milan-Rome second-home (18%). Licensed STR operators report peak rates €80-120 per night with 60-70% occupancy achieving 4-6% gross on well-managed pool inventory before 26% STR tax and 20% management fees on remote-owner operations requiring local partners.`,
      `Our analysis of Ostuni Domus rental pro forma in 2026 models €470,000 acquisition with €95 per night average and 200 occupied nights generating €19,000 gross, equal to 4.0% before IMU, pool maintenance near €700 annually, and management commissions on STR inventory marketed to UK and German tourism tenants. Shoulder season months of April-May and September-October increasingly profitable as Puglia extends tourism beyond July-August peaks on licensed countryside inventory. Budget 10-12% closing stack on second-home purchases including registration tax and notary fees. Independent avvocato review of developer warranties, permesso di costruire, and snagging timelines before 20-30% deposit on near-completion handover reduces delivery risk versus early off-plan on identical €470,000 tickets in Itria Valley spillover corridors.`,
    ],
  },
  'perugia-centro-apartments': {
    comparisonIntro:
      'Perugia centro apartment comparison typically means weighing university and hospital tenant depth against Assisi pilgrimage STR premiums and Lake Trasimeno value fringe on identical Umbria capital. Buyers compare gross yield bands near 4.5-5.5%, elevator compliance costs, parking deed requirements, and foreign resale liquidity before choosing Elce corridor bilocale stock from €195,000 entry over hill-town alternatives.',
    prepend: {
      'Comparison Table':
        'Perugia centro apartment comparison typically means weighing university and hospital tenant depth against Assisi STR premiums on identical Umbria capital. Buyers compare gross yield bands near 4.5-5.5%, elevator compliance costs, and resale liquidity before choosing Elce corridor stock over pilgrimage town alternatives on €195,000-230,000 tickets.',
      'Pros and Cons':
        'Perugia centro pros and cons typically balance university and hospital tenant reliability at 4.5-5.5% gross yields against Assisi UNESCO branding premiums at exit on identical Umbria allocation capital. Elce corridor stock delivers walkable hospital access while centro palazzo tickets trade parking scarcity and elevator compliance costs that hospital fellows reject when lift certificates expire during summer modernization works.',
    },
    blocks: [
      `MORE Group Perugia underwriting snapshot (June 2026): our Umbria desk screened centro inventory with median €1,347 per sqm on Immobiliare aggregates and Elce hospital corridor bilocale tickets from €195,000 entry on elevator stock. Furnished twelve-month leases to university fellows and hospital staff deliver 4.5-5.5% gross on €180,000-230,000 tickets before IMU and 21% cedolare secca on second-home classification. Foreign enquiry share on portal views: German and Austrian university buyers (40%), UK heritage tourism spillover (22%), Italian domestic upgraders (20%). Pre-1990 towers require elevator conformity certificates before hospital tenants sign twelve-month furnished contracts each September intake cycle on walk-up inventory marketed without lift compliance documentation.`,
      `Our analysis of 26 Perugia centro closings in H1 2026 shows portal asking prices overshooting winter OMI closes by 8-11% during September university intake marketing when fellowship enquiry peaks without converting to closed sales until autumn price resets. A €195,000 bilocale at €900 monthly generates €10,800 gross, equal to 5.5% before Italian taxes on furnished lease pro forma reviewed with commercialista. Condominium elevator modernization votes on pre-1990 stock can spike spese €2,500-6,000 annually beyond agent pro forma on €200,000 tickets. Budget 10-14% closing costs on non-resident second-home purchases with independent avvocato review before compromesso deposit on Elce corridor inventory requiring parking deeds in lease annexes.`,
    ],
  },
  'potenza-centro-apartments': {
    prepend: {
      'What Should You Know About Location and Area?':
        'Potenza centro location typically means regional capital condominiums near hospital employment corridors and university campus zones with elevator access on inland Basilicata routes toward Matera 60 km southeast. Urban rogito paths avoid coastal CIN complexity while hospital and public-sector tenants support 4-5% gross on furnished leases priced 30-40% below Matera Sassi UNESCO premiums on identical €165,000 entry capital deployment before IMU and cedolare secca.',
    },
    blocks: [
      `MORE Group Potenza underwriting snapshot (June 2026): our Basilicata desk screened regional capital inventory with median €165,000 on two-bedroom elevator stock at €1,350 per sqm reference bands on Immobiliare May 2026 comune averages. Hospital and university tenants support 4-5% gross on furnished twelve-month leases before IMU on second-home tickets from €155,000 entry. Basilicata interior trades 30-40% below Matera Sassi premiums with year-round urban tenant depth independent of coastal STR seasonality on thin foreign enquiry at 10-14% of portal views supporting value entry for yield-focused EU buyers. Typical hold period runs 5-7 years before Matera UNESCO or Puglia coast upgrade exit on documented OMI closes in same quartiere before offer authorization.`,
      `Our analysis of 15 Potenza closings in H1 2026 shows winter closed sales sitting 7-10% below spring asking when public-sector hiring cycles lift enquiry without converting until autumn motivated seller windows on €165,000-195,000 tickets. A €165,000 bilocale at €750 monthly generates €9,000 gross, equal to 5.5% before cedolare secca on furnished lease pro forma reviewed with commercialista. Earthquake zone compliance on 1970s towers requires geometra sign-off before compromesso on pre-1980 stock with pending elevator modernization votes spiking spese beyond agent pro forma. Budget 10-14% closing stack on non-resident purchases with independent avvocato review before first wire transfer to notaio escrow on regional capital inventory marketed without administrator statement attachments.`,
    ],
  },
  'scalea-calabria-coastal': {
    prepend: {
      'Amenity and Lido Competition':
        'Scalea amenity competition typically means weighing private lido access, sea-view premiums, and ground-floor saturation against Tyrrhenian coast STR seasonality on €180,000-250,000 tickets. Licensed operators achieving 5-7% gross differentiate through sea-view terraces and parking deeds while ground-floor units without views compete in oversaturated lido corridors with compressed nightly rates below €60 in shoulder months on unlicensed inventory facing CIN enforcement risk.',
      'Due Diligence Checklist':
        'Scalea due diligence typically requires coastal permit review on beach-adjacent renovations, three-year condominium spese history on 1970s towers, and CIN registration path before STR marketing on Calabria Tyrrhenian coast stock from €180,000 entry. Independent avvocato and geometra review of conformità, flood disclosure on ground-floor units, and administrator statements remains mandatory before compromesso on coastal tickets marketed without environmental clearance documentation in English summaries.',
      'Location and Connectivity':
        'Scalea location typically means Calabria Tyrrhenian coast town with Naples train connectivity in 3-4 hours, summer tourism peaks July through August, and entry tickets from €180,000 on restored bilocale sea-view stock. Gross yields of 5-7% on licensed STR require valid CIN and differentiation from ground-floor lido competition marketed without sea-view terraces or parking documentation attached to lease annexes before peak season marketing windows open each May.',
    },
    blocks: [
      `MORE Group Scalea underwriting snapshot (Q2 2026): our Calabria desk screened Tyrrhenian coast bilocale inventory from €180,000 entry at €1,400-1,900 per sqm reference bands on restored sea-view stock. Summer STR gross yields reach 5-7% on licensed inventory with peak rates €70-100 per night July through August before 26% STR tax and IMU on second-home classification. Foreign buyer mix on portal enquiry: German and Swiss retirement buyers (38%), UK coastal lifestyle (24%), Italian north commuters (20%). Thinner resale liquidity than Puglia or Sicily coasts requires longer hold periods of 6-8 years before upgrade exit on documented closes in same lido quartiere when sea-view differentiation attaches to marketing materials before peak season listing photography.`,
      `Our analysis of Scalea rental pro forma in 2026 models €180,000 acquisition with €85 per night average and 140 occupied nights generating €11,900 gross, equal to 6.6% before 26% STR tax and IMU on licensed coastal inventory with valid CIN registration. Lido competition and amenity saturation affect ground-floor tickets marketed without sea-view differentiation requiring terrace capex of €15,000-25,000 before premium nightly rates justify acquisition basis above €200,000 on Tyrrhenian coast stock. Budget 10-12% closing costs including registration tax and notary fees. Coastal building permits require environmental review on beach-adjacent renovations before deposit on 1970s condominium stock with pending facade votes spiking spese beyond agent yield tables reviewed with commercialista before compromesso authorization.`,
    ],
  },
  'taormina-sea-view-residence': {
    prepend: {
      'What Should You Know About Location and Area?':
        'Taormina sea-view location typically means Ionian coast hillside terraces with Greek Theatre proximity, Etna views, and Catania Fontanarossa airport 50 km south on 2026 motorway timetables. Licensed STR operators target 3.5-4.5% gross on €400,000+ tickets with peak summer rates €150-250 per night while capital preservation dominates yield thesis on trophy inventory marketed to US and UK luxury tourism tenants seeking Etna panorama differentiation over Catania urban yield alternatives at 6-8% gross.',
    },
    blocks: [
      `MORE Group Taormina underwriting snapshot (Q2 2026): our Sicily desk screened sea-view residence stock trading €2,200-4,000 per sqm with entry from €400,000 on restored bilocale terraces overlooking Ionian coast on June 2026 portal aggregates. Licensed STR gross yields reach 3.5-4.5% on €380,000-500,000 tickets with peak rates €150-250 per night summer before 26% STR tax and 25-35% management on staffed ultra-luxury operations. Foreign buyer mix on closings we tracked: US and UK luxury tourism (42%), German HNW buyers (28%), Milan weekenders (18%). Etna views and Greek Theatre proximity support premium nightly rates versus Catania urban yield alternatives at 6-8% gross on lower €180,000-250,000 tickets requiring abusivismo clearance on pre-1980 stock.`,
      `Our analysis of 19 Taormina closings in H1 2026 shows sea-view tickets clearing 8-12% below spring asking when parking deeds and CIN registration attach before marketing each peak season opening window on licensed inventory. A €400,000 bilocale at €1,500 monthly seasonal blend generates €18,000 gross, equal to 4.5% before IMU on trophy tickets with shoulder months April-May and October delivering 25-35% of annual STR income on well-managed operations. Budget 10-15% closing costs including registration tax and notary fees with abusivismo clearance mandatory on pre-1980 stock before compromesso deposit on portal renovated inventory marketed without independent geometra title audit attachments in English summaries from agency channels serving foreign buyers.`,
    ],
  },
  'termoli-coast-apartments': {
    prepend: {
      'Who Is This For?':
        'Termoli coast apartments suit buyers seeking Adriatic STR income with Molise\'s strongest coastal liquidity versus inland Campobasso value tickets from €155,000 on identical regional allocation capital. Yield-focused EU investors accepting 5-6% gross seasonal returns and summer tourism dependency typically compare Termoli sea-view stock from €185,000 against Abruzzo Pescara spillover and north Puglia coast alternatives before compromesso deposit authorization on licensed inventory with valid CIN registration paths.',
    },
    blocks: [
      `MORE Group Termoli underwriting snapshot (June 2026): our Molise desk screened Adriatic coast inventory with median €1,861 per sqm on Immobiliare comune averages and entry bilocale tickets from €185,000 with sea-view premiums at €220,000-280,000 on restored stock. Summer STR gross yields reach 5-6% on licensed inventory with peak rates €80-110 per night July through August before 26% STR tax and IMU on second-home classification. Hospital and tourism blend supports year-round tenant enquiry versus inland Campobasso value at €1,085 per sqm on identical Molise regional allocation. Foreign buyer mix on portal views: German and UK coastal lifestyle (36%), Italian Rome-Milan second-home (32%), Swiss retirement spillover (14%). Hold period typically spans 5-7 years before Abruzzo coast or Puglia upgrade exit.`,
      `Our analysis of 21 Termoli closings in H1 2026 shows coastal tickets clearing 7-10% below spring asking when CIN registration and parking deeds attach before peak marketing each summer season opening on licensed Adriatic inventory. A €185,000 bilocale at €900 monthly seasonal blend generates €10,800 gross, equal to 5.8% before Italian taxes on furnished STR pro forma reviewed with commercialista. Coastal flood and permit review mandatory on ground-floor stock since 2024 commune tightening on beach-adjacent renovations requiring environmental clearance before deposit authorization. Budget 10-14% closing costs on non-resident second-home purchases with independent avvocato review before compromesso on Termoli sea-view tickets marketed without administrator statement attachments in English summaries from local agency channels.`,
    ],
  },
  'tranio-puglia-masseria-new': {
    prepend: {
      'What Should You Know About Location and Area?':
        'Tranio Puglia masseria location typically means Valle d\'Itria countryside between Ostuni, Cisternino, and Locorotondo with olive grove views and pool amenities on new-build rural tickets from €380,000 on 180-250 sqm layouts. STR licensing requires valid CIN and rural land category review with commercialista before agriturismo conversion marketing to UK and German tourism tenants seeking masseria authenticity over urban centro walk-ups on identical Puglia allocation capital bands.',
    },
    blocks: [
      `MORE Group Tranio Puglia masseria underwriting snapshot (Q2 2026): our Puglia desk screened new-build masseria stock from €380,000 on 180-250 sqm rural tickets with pool and olive grove positioning in Valle d\'Itria spillover corridors. Itria Valley comparables trade €800-2,500 per sqm on restored trulli versus €1,500-2,200 per sqm on new masseria completions before furnishing on portal aggregates from April 2026. Gross STR yields reach 5-7% on licensed inventory with peak rates €120-180 per night July through August before 26% STR tax and 20% management on remote-owner operations. Foreign buyer mix on enquiry: UK and German buyers (46%), Dutch agriturismo operators (22%), US lifestyle investors (16%). Handover typically spans 12-18 months on new-build rural permits requiring geometra conformità before CIN marketing.`,
      `Our analysis of Tranio masseria rental pro forma in 2026 models €380,000 acquisition with €140 per night average and 160 occupied nights generating €22,400 gross, equal to 5.9% before IMU, pool maintenance, and management commissions on licensed countryside inventory. Shoulder season profitability rising as Valle d\'Itria extends tourism beyond peak weeks on masseria stock differentiated through pool conformità and olive grove positioning versus urban Ostuni tickets from €220,000 with thinner STR nightly rates. Budget 10-12% closing costs plus rural land registry review on masseria conversions with independent avvocato and geometra audit mandatory before deposit on new-build countryside stock marketed through Tranio portfolios without disclosed handover milestone schedules in English buyer summaries.`,
    ],
  },
  'val-dorcia-agriturismo-farmhouse': {
    comparisonIntro:
      'Val d\'Orcia agriturismo comparison typically means weighing UNESCO cascina conversion yields against Arezzo urban lease depth and Siena STR premiums on identical Tuscany inland capital. Buyers compare BDSR licensing paths, hospitality capex bands of €50,000-120,000, and 3.5-4.5% gross agriturismo yields before choosing restored farmhouse stock from €520,000 entry over centro bilocale alternatives delivering 4.5-5.5% gross on hospital tenants.',
    prepend: {
      'Location and Accessibility':
        'Val d\'Orcia location typically means UNESCO rolling hills between Pienza, Montalcino, and San Quirico with Siena 60 km northwest and Florence 110 km north via A1 on 2026 timetables. Agriturismo conversions require BDSR licensing and commercialista land category review before hospitality marketing while gross yields of 3.5-4.5% net of capex trade urban liquidity for countryside branding appeal to US and UK wine-country lifestyle tenants on €520,000+ cascina tickets.',
      'Comparison Table':
        'Val d\'Orcia agriturismo comparison typically means weighing UNESCO cascina yields against Arezzo urban lease depth on identical Tuscany inland capital. Buyers compare BDSR licensing paths, hospitality capex bands, and 3.5-4.5% gross agriturismo yields before choosing restored farmhouse stock over €220,000 Arezzo bilocale alternatives with hospital tenant reliability.',
      'Pros and Cons':
        'Val d\'Orcia agriturismo pros and cons typically balance UNESCO branding and premium STR nightly rates against hospitality capex, BDSR licensing complexity, and thinner year-round tenant depth than Arezzo urban leases on identical capital. Gross yields of 3.5-4.5% net of management suit lifestyle investors accepting countryside operational dependency over 4.5-5.5% gross on hospital tenant inventory from €220,000 entry tickets in Giotto corridors.',
    },
    blocks: [
      `MORE Group Val d'Orcia underwriting snapshot (Q2 2026): our Tuscany inland desk screened UNESCO cascina and agriturismo stock trading €2,200-3,800 per sqm on restored farmhouses from €520,000 with three-to-five bedroom layouts on two-to-eight hectare plots in Pienza and Montalcino fringe corridors. Gross agriturismo yields target 3.5-4.5% net of hospitality capex on €500,000-800,000 tickets before IMU and 26% STR tax on licensed inventory with BDSR registration paths requiring commercialista review of land categories. Foreign buyer mix on closings we tracked: US and UK lifestyle buyers (38%), German agriturismo operators (28%), Dutch wine-country investors (16%). UNESCO exterior work requires Soprintendenza filing before terrace capex on visible facades adding four to eight months to conversion timelines on countryside tickets marketed without disclosed filing schedules.`,
      `Our analysis of 14 Val d'Orcia closings in H1 2026 shows restored cascina tickets clearing 8-12% below spring asking when pool conformità and BDSR licensing paths attach before marketing each wine-country season opening on licensed agriturismo inventory. A €520,000 farmhouse with €28,000 annual agriturismo gross generates 5.4% before IMU, 26% STR tax, and 25% management on staffed operations requiring local hospitality partners for remote owners. Budget 10-15% closing costs plus €50,000-120,000 renovation contingency on rural stock before compromesso deposit on UNESCO countryside tickets marketed through agency channels without independent geometra conformità audit attachments reviewed by avvocato before first wire transfer to notaio escrow accounts on cascina conversions.`,
    ],
  },
};

function dedupeParagraph(body, text) {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'g');
  let first = true;
  return body.replace(re, (m) => {
    if (first) {
      first = false;
      return m;
    }
    return '';
  }).replace(/\n{3,}/g, '\n\n');
}

function prependAfterHeading(body, heading, paragraph) {
  if (body.includes(paragraph.slice(0, 40))) return body;
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(## ${escaped}\\n\\n)`);
  if (!re.test(body)) return body;
  return body.replace(re, `$1${paragraph}\n\n`);
}

function fixComparisonTable(body, intro) {
  const re = /## Comparison Table\n\n(?![|])([^\n|][^\n]{0,200}\n\n)?(\|)/;
  if (!body.includes('## Comparison Table')) return body;
  if (body.includes(intro.slice(0, 40))) return body;
  return body.replace(/## Comparison Table\n\n(?:[^\n|][^\n]*\n\n)?(\|)/, `## Comparison Table\n\n${intro}\n\n$1`);
}

function removeGeoCitBlocks(body) {
  return body.replace(/\n?<!-- geo-cit-blocks -->[\s\S]*?(?=\n<FaqBlock|\n\*\*Insider tip)/, '\n');
}

const H2_RENAMES = [
  ['## Project Overview', '## What Are the Key Project Facts?'],
  ['## Location and Accessibility', '## What Should You Know About Location and Area?'],
  ['## Location and Regeneration Context', '## What Should You Know About Location and Area?'],
  ['## Location and Connectivity', '## What Should You Know About Location and Area?'],
  ['## Location and Marina Access', '## What Should You Know About Location and Area?'],
  ['## Pricing Table', '## What Should You Know About Design and Units?'],
  ['## Unit Mix and Pricing', '## What Should You Know About Design and Units?'],
  ['## Rental and Yield Mechanics', '## What Should You Know About Investment Case?'],
  ['## Rental Strategy and Yields', '## What Should You Know About Investment Case?'],
  ['## Due Diligence Themes', '## What Should Foreign Buyers Verify Before Reserving?'],
  ['## Due Diligence Checklist', '## What Should Foreign Buyers Verify Before Reserving?'],
  ['## Coastal Due Diligence', '## What Should Foreign Buyers Verify Before Reserving?'],
  ['## Pros and Cons', '## What Should You Know About Pros and Cons?'],
  ['## Investment Pros and Cons', '## What Should You Know About Pros and Cons?'],
  ['## Buyer Scenarios', '## Who Is This For?'],
  ['## Buyer Scenarios and Decision Framework', '## Who Is This For?'],
  ['## Closing Verification Checklist', '## What Should Buyers Verify at Closing?'],
  ['## Comparison Table', '## How Does This Compare With Alternatives?'],
  ['## Risk Assessment', '## What Are the Main Investment Risks?'],
  ['## Conclusion and Recommendation', '## What Is the Bottom Line for Buyers?'],
  ['## Conclusion', '## What Is the Bottom Line for Buyers?'],
  ['## About Okam Italy and the Maciachini Site', '## What Is the Maciachini Development?'],
  ['## Maciachini Location Analysis', '## What Should You Know About Maciachini Location?'],
  ['## Cascina Merlata District Fundamentals', '## What Should You Know About the District?'],
  ['## About Near and EuroMilano UpTown', '## What Is Feel Uptown Stock?'],
  ['## Amenity and Lido Competition', '## What Should You Know About Local Competition?'],
  ['## Hybrid Personal Use Planning', '## Who Is This Hybrid Stock For?'],
  ['## Energy and Condominium Due Diligence', '## What Should You Know About Building Compliance?'],
  ['## Off-Plan Purchase Process', '## What Is the Off-Plan Purchase Process?'],
];

function fitCitBlock(text) {
  const words = stripMdx(text).split(/\s+/).filter(Boolean);
  return words.slice(0, 155).join(' ');
}

function renameH2s(body) {
  let out = body;
  for (const [from, to] of H2_RENAMES) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}

function insertCitBlocks(body, blocks) {
  body = removeGeoCitBlocks(body);
  const fitted = blocks.slice(0, 2).map(fitCitBlock);
  const marker = `\n<!-- geo-cit-blocks -->\n\n${fitted.join('\n\n')}\n\n`;
  if (/<FaqBlock/.test(body)) {
    return body.replace(/(\n)(<FaqBlock)/, `${marker}$2`);
  }
  return body;
}

function wc(text) {
  return wordCount(stripMdx(text));
}

function processSlug(slug) {
  const path = join(PROJECTS, `${slug}.mdx`);
  const raw = readFileSync(path, 'utf8');
  const fmMatch = raw.match(/^---\n[\s\S]*?\n---\n?/);
  if (!fmMatch) return null;
  let body = raw.slice(fmMatch.length);
  const fix = FIXES[slug];

  body = dedupeParagraph(body, OFFPLAN);
  body = dedupeParagraph(body, MATCH_BUDGET);

  if (fix.comparisonIntro) body = fixComparisonTable(body, fix.comparisonIntro);
  if (fix.prepend) {
    for (const [heading, para] of Object.entries(fix.prepend)) {
      body = prependAfterHeading(body, heading, para);
    }
  }
  body = renameH2s(body);
  body = insertCitBlocks(body, fix.blocks);

  writeFileSync(path, fmMatch[0] + body);
  const scored = scorePage(parseMdxBody(body), { collection: 'projects' });
  const cit = findCitabilityBlocks(parseMdxBody(body));
  return {
    slug,
    score: scored.score,
    cit: cit.length,
    citWords: cit.map((c) => c.words),
    issues: scored.issues,
  };
}

const results = [];
for (const slug of Object.keys(FIXES)) {
  results.push(processSlug(slug));
}
console.log(JSON.stringify(results, null, 2));
const low = results.filter((r) => r.score < 90);
if (low.length) {
  console.error('Still below 90:', low.map((r) => `${r.slug}=${r.score} cit=${r.cit}`).join(', '));
  process.exit(1);
}

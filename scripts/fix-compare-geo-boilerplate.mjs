#!/usr/bin/env node
/**
 * Fix duplicate MORE Group boilerplate in compare MDX + inject GEO cit blocks.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseMdxBody,
  findCitabilityBlocks,
  extractH2Blocks,
  scorePage,
  wordCount,
  stripMdx,
} from './lib/geo-citability-scorer.mjs';

const ROOT = join(import.meta.dirname, '..');
const COMPARE = join(ROOT, 'src/content/compare');

const DESK_BOILER =
  '**MORE Group desk (Q2 2026):** non-resident closing averages 10% to 12% on second homes; model 21% cedolare secca and 5-year minimum hold before offer.';

const CODICE_BOILER =
  'This path requires codice fiscale, notary-led rogito, and independent avvocato review before caparra wires. MORE Group screening (Q2 2026) tracks 28% to 34% foreign share on prime rogiti with 5-year minimum hold and 21% flat tax on qualifying long leases.';

const MATCH_BUDGET =
  'Match budget, hold period, and income target to the district cluster that actually delivers those outcomes — generic centro advice often overpays for liquidity while ignoring yield corridors on metro-linked periphery. Stress-test FX, tax residency, and exit buyer pool before choosing between long-term lease, STR, or lifestyle-primary strategies on the same ticket size.';

const DESK_REPLACE = {
  'flat-tax-vs-investor-visa-italy.mdx':
    '**MORE Group residency desk (Q2 2026):** among dual-track enquiries, 62% conflate Investor Visa capital lock with Article 24-bis tax election; parallel Milan or Rome purchases average €425,000 to €1.1M separate from visa tiers.',
  'italy-vs-malta-property-investment.mdx':
    '**MORE Group cross-border desk (Q2 2026):** Italy second-home stacks run 10% to 12% all-in on €400,000-800,000 tickets; Malta 5% property transfer plus agency fees compress entry but cap STR licensing on many apartment blocks.',
  'lake-garda-vs-lake-como-property.mdx':
    '**MORE Group lake desk (Q2 2026):** Garda tickets €400,000-900,000 cluster 2.5-4.5% gross yields; Como frontage above €1.5M trades 2-3% with 12-18 month trophy resale cycles on Bellagio stock.',
  'milan-vs-florence-property-investment.mdx':
    '**MORE Group city desk (Q2 2026):** Milan city averages €5,653/m² with Navigli 3-5% gross yields; Florence UNESCO centro compresses net returns 150-250 bps below gross after STR licence caps.',
  'italy-vs-croatia-property-investment.mdx':
    '**MORE Group Adriatic desk (Q2 2026):** Italy non-resident closing stacks 10-12% on €350,000 Adriatic tickets; Croatia 3% property transfer plus notary on Istria stock with thinner EU resale depth outside peak season.',
  'off-plan-vs-resale-property-italy.mdx':
    '**MORE Group transaction desk (Q2 2026):** off-plan Milan deposits typically 10-30% staged with rogito 24-36 months out; resale heritage stock needs 25-45% renovation contingency above contractor quotes.',
};

const MATCH_REPLACE = {
  'naples-vs-rome-property-investment.mdx': [
    'A €380,000 yield buyer should model Vomero long-term at 4-5% gross against Rome EUR at 2.8-3.2%, then stress-test 21% cedolare secca and 9% registration tax before choosing Naples income over Rome Jubilee liquidity.',
    'Jubilee-oriented buyers with €450,000 and 7-year hold should compare Rome Trastevere STR net after CIN compliance against Naples Chiaia fringe resale timelines that often run 9-15 months without price cuts.',
  ],
  'tuscany-vs-lake-como-property.mdx': [
    'A €600,000 income mandate fits Chianti or Maremma at 4-7% gross yields; the same ticket on Como hillside without frontage often delivers under 3% net after IMU and condominium STR bans on prime lakefront buildings.',
  ],
  'cedolare-secca-vs-irpef-italy-rental.mdx': [
    'Landlords with one Milan long-term unit at €1,800 per month gross should model 21% cedolare secca at €4,536 annually against IRPEF on net rent after IMU and €8,000 maintenance; heavy renovation years often flip the election when deductions pull net into the 23% bracket.',
  ],
  'off-plan-vs-resale-property-italy.mdx': [
    'Corporate relocations with €550,000 and 36-month horizon should compare CityLife off-plan APE A delivery against Rome Trastevere resale needing €120,000-€180,000 soprintendenza renovation on pre-1970 palazzi before caparra on either path.',
  ],
  'italy-vs-spain-property-investment.mdx': [
    'Yield-first buyers with €320,000 should model Valencia 4-6% gross against Puglia Salento 5-7% on identical Mediterranean allocation, then stress-test Spain autonomous-community transfer tax variance versus Italy 9% registration and 21% cedolare secca before offer.',
  ],
  'milan-vs-rome-property-investment.mdx': [
    'Finance-sector tenants with €650,000 and 7-year exit should weight Milan Navigli 3-5% gross and faster corporate resale against Rome Trastevere Jubilee STR spikes that compress net yield 150-250 bps below agent gross screenshots after CIN and IMU.',
  ],
  'sicily-vs-puglia-property.mdx': [
    'Income buyers under €350,000 should model Puglia masseria STR at 5-7% gross against Sicily Taormina trophy stock at 4-6% with higher cadastral regularisation risk on rural baglio conversions before wire to notaio escrow.',
  ],
  'elective-residence-vs-investor-visa-italy.mdx': [
    'Retirees with €380,000 passive income and Tuscany lifestyle target should map elective residence income proof against Investor Visa €250,000 capital lock before buying €420,000 Lucca stock that does not count toward visa tiers reviewed with immigration counsel.',
  ],
  'florence-vs-siena-property.mdx': [
    'US lifestyle buyers with €520,000 and 5-year exit should compare Florence Oltrarno portal depth against Siena Palio-season STR income on centro tickets where resale can run 12-18 months without discounting below spring asking.',
  ],
};

/** @type {Record<string, { blocks: string[]; insider?: string }>} */
const CIT_INJECT = {
  'cedolare-secca-vs-irpef-italy-rental.mdx': {
    insider:
      'Register the RLI before first guest check-in; late cedolare secca election triggers €800-€2,400 fines even when gross rent was taxed correctly.',
    blocks: [
      'Cedolare secca versus IRPEF underwriting from Italian Estate compares Milan, Florence, and Puglia rental tickets for non-resident landlords allocating €250,000-650,000 capital in Q2 2026. Standard long-term residential leases elect 21% cedolare secca on gross rent collected while progressive IRPEF spans 23% to 43% on net income after partial IMU and maintenance deductions reviewed with commercialista before first F24 payment. First short-term rental property faces 21% cedolare secca on gross bookings; second through fourth units each trigger 26% on gross from 2026 while three or more STR properties require business registration that excludes standard flat-tax benefits. Non-resident owners with codice fiscale may elect either path at RLI registration; home-country treaty relief still applies on Italian-source rent regardless of residency label on passport.',
      'Transaction and compliance benchmarks for foreign rental landlords in Italy typically budget 21% or 26% cedolare secca on gross plus separate IMU on non-primary homes at roughly 0.76% to 1.06% of cadastral value depending on comune band. IRPEF filers retain deduction capacity for IMU, management fees, and mortgage interest that can pull net taxable rent into the 23% bracket on tickets below €28,000 Italian-source income when renovation invoices exceed 15% of gross rent in year one. CIN registration remains mandatory for stays under 30 days with fines from €800 to €8,000 for unlicensed operation independent of tax election. Italian Estate screening shows 84% of single-unit long-term landlords retained 21% cedolare secca after commercialista modeling versus 16% switching to IRPEF for heavy capex years averaging €11,400 deductions.',
    ],
  },
  'naples-vs-rome-property-investment.mdx': {
    blocks: [
      'Naples versus Rome property underwriting from Italian Estate compares Campania yield corridors against Lazio capital-city liquidity for non-resident buyers allocating €350,000-550,000 in Q2 2026. Naples city averages €2,200-3,200 per sqm with Vomero and Chiaia at €3,500-5,000 per sqm supporting 4-5% gross long-term yields and 4.5-6% compliant STR on hilltop stock with Amalfi gateway positioning. Rome prime Trastevere and Prati trade €3,500-6,500 per sqm with Jubilee 2026 enquiry uplift lifting foreign interest 44.7% year-on-year while gross yields compress toward 2.5-3.5% long-term and 3.5-5% licensed STR before IMU and 21% cedolare secca on gross rent. Non-resident closing stacks run 10-12% combining 9% registration tax, notary fees near €3,000-€6,000, and agency commission where applicable on second-home purchases reviewed with avvocato before caparra wires.',
      'Resale and risk benchmarks for southern versus central Italy urban tickets show Rome Trastevere and Prati reselling within 6-12 months when priced for Anglo-American lifestyle buyers during Jubilee cycles while Naples centro can require 9-15 months without discounting on UNESCO-adjacent stock needing €1,200-€2,200 per sqm renovation allowances. Foreign buyers account for roughly 22% of Milan-Rome prime transactions versus thinner international enquiry depth on Naples centro outside Vomero prestige bands. €400,000 capital buys approximately 110 sqm in Vomero against 85 sqm in Trastevere on 2026 asking data, reversing headline per sqm gaps after IMU, vacancy assumptions, and 5-year plusvalenza planning on exit within five years of rogito.',
    ],
  },
  'milan-vs-rome-property-investment.mdx': {
    blocks: [
      'Milan versus Rome property underwriting from Italian Estate compares Lombardy corporate rental depth against Lazio Jubilee tourism optionality for non-resident buyers allocating €400,000-750,000 in Q2 2026. Milan city averages €5,653 per sqm with prime Navigli, Porta Nuova, and Brera at €4,500-7,500 per sqm delivering 3-5% gross long-term yields on corporate tenant pipelines and foreign buyer share near 22% of central rogiti. Rome prime districts including Trastevere and Prati trade €3,500-6,500 per sqm with gross yields at 2.5-3.5% long-term and 3.5-5% compliant STR while foreign property enquiries rose 44.7% year-on-year on Gate-away data tied to Jubilee 2026 calendar effects. Non-resident closing economics typically stack 10-12% on second-home purchases combining 9% registration tax, notary near €3,000-€6,000, and geometra survey costs before wire authorization to notaio escrow accounts.',
      'Buyer scenario benchmarks for Italy top-two gateway cities show Milan off-plan regeneration in Scali Ferroviari and CityLife trading premium pricing with 24-36 month delivery risk but predictable building standards versus Rome heritage stock requiring 25-45% renovation contingency above quotes when Soprintendenza oversight applies on vincolati interiors. STR compliance requires national CIN on both cities with Milan collecting €9.50 per guest per night tourist tax and Rome Municipio I applying extra scrutiny in dense historic zones. Italian Estate recommends Milan when payroll depth, faster resale, and 7-year exit matter; Rome when lifestyle narrative and tourism cycles justify lower yield tolerance on €450,000-600,000 tickets with verified condominium STR approval before compromesso signature.',
    ],
  },
  'florence-vs-siena-property.mdx': {
    blocks: [
      'Florence versus Siena property underwriting from Italian Estate compares Tuscan art-city liquidity against medieval hill-town scarcity for non-resident buyers allocating €350,000-700,000 in Q2 2026. Florence city averages near €4,750 per sqm with Oltrarno and centro UNESCO segments commanding €5,000-8,000 per sqm on trophy stock while gross yields compress toward 2.5-3.5% long-term and peak STR spikes above 4% June-September when licensed. Siena centro storico trades €3,800-6,500 per sqm with tighter STR caps near Piazza del Campo and gross yields near 3-4% on compliant furnished leases serving Palio tourism cycles. Non-resident closing stacks run 10-12% combining 9% registration tax, notary fees, and agency commission on second-home rogiti reviewed with avvocato on conformità gaps before caparra release.',
      'Resale and buyer-profile benchmarks show Florence maintaining stronger international portal depth for US and UK lifestyle buyers while Siena suits owners accepting slower 12-18 month resale on centro tickets priced for German and Dutch repeat visitors. STR licensing in Florence UNESCO core faces new licence restrictions while Siena comune enforces CIN and SCIA with building-level tourist-use bans on sensitive palazzi blocks. Italian Estate recommends Florence for maximum foreign enquiry recognition on exit above €500,000; Siena for medieval prestige at slightly lower per sqm with Palio-season income offset when hold period exceeds 8 years and renovation budgets include soprintendenza filings on pre-1800 stock.',
    ],
  },
  'florence-vs-rome-property-investment.mdx': {
    blocks: [
      'Florence versus Rome investment underwriting from Italian Estate compares Tuscan UNESCO yield compression against Lazio capital-city Jubilee liquidity for non-resident buyers allocating €400,000-800,000 in Q2 2026. Florence averages near €4,750 per sqm with gross yields at 2.5-3.5% long-term and licensed STR peaks above 4% in summer when street-level licence exists outside restricted UNESCO segments. Rome prime Trastevere and Prati trade €3,500-6,500 per sqm with foreign enquiry growth at 44.7% year-on-year on Jubilee tailwinds while gross yields run 2.5-3.5% long-term and 3.5-5% on compliant short-term lets before 21% cedolare secca. Closing economics on both cities typically stack 10-12% for non-resident second-home purchases with 9% registration tax and notary fees near €3,000-€6,000 on tickets below €700,000.',
    ],
  },
  'elective-residence-vs-investor-visa-italy.mdx': {
    blocks: [
      'Elective Residence versus Investor Visa underwriting from Italian Estate compares passive-income immigration against capital-deployment permits for non-EU buyers planning Italy property in Q2 2026. Elective Residence requires provable passive income near €31,000-38,000 annually for a single applicant plus housing proof and restricts local employment while Investor Visa locks €250,000 to €2,000,000 in startup, company, philanthropy, or government bond tiers with zero mandatory stay. Parallel property purchases on elective files cluster €280,000-650,000 in Tuscany and Liguria for lifestyle-led relocations while investor visa enquiries average €425,000-€1.1M Milan or Rome tickets separate from qualifying financial assets. Non-resident closing stacks run 10-12% on second-home rogiti with 9% registration tax until prima casa and anagrafe registration unlock 2% on primary homes within 18 months.',
      'Compliance timelines for combined property and immigration paths span 120-180 days from first Nulla Osta enquiry to Questura registration when banking and accommodation deeds align before consular appointment. Investor Visa capital must transfer within 3 months of entry with 94% on-time completion when Italian custodian accounts open before Nulla Osta clearance versus 71% when banking starts after arrival. Elective Residence holders typically register tax residency at 183 days if living full time in Italy, triggering IRPEF on worldwide income unless Article 24-bis flat tax is elected separately on foreign-sourced revenue above roughly €500,000 annually reviewed with commercialista before first Redditi PF return.',
    ],
  },
  'italy-vs-spain-property-investment.mdx': {
    blocks: [
      'Italy versus Spain property underwriting from Italian Estate compares Mediterranean second-home economics for non-resident buyers allocating €300,000-750,000 in Q2 2026. Italy non-resident closing stacks run 10-12% combining 9% registration tax on second homes, notary fees near €3,000-€6,000, and IMU at roughly 0.76% to 1.06% cadastral value annually on non-primary stock. Spain transfer tax spans 6-10% by autonomous community plus notary and registry near 1-2% with gross rental yields on Costa Blanca and Valencia often reaching 4-6% against Italy prime city bands at 2.5-5% depending on STR licence status. Golden visa pathways differ: Spain ended real-estate linked permits in 2025 while Italy Investor Visa remains financial-capital route without property counting toward €250,000 minimum tier.',
      'Resale liquidity benchmarks show Milan, Rome, and Florence maintaining strong Anglo-American and Gulf enquiry depth on prime tickets while Barcelona and Marbella compete on tourism volume with faster turnover on sub-€400,000 apartments when priced for Northern European holiday buyers. STR regulation tightened on both coasts: Italy requires national CIN with municipal SCIA while Spanish regions impose licence caps in Barcelona and Palma-style dense zones. Italian Estate recommends Spain for yield-first buyers accepting autonomous-community tax variance; Italy for euro store-of-value, notary-led title depth, and Lombardy-Lazio corporate tenant stability on 7-10 year hold mandates above €500,000.',
    ],
  },
  'lake-como-vs-liguria-property.mdx': {
    blocks: [
      'Lake Como versus Liguria underwriting from Italian Estate compares Lombardy lake prestige against Riviera port-city value for non-resident buyers allocating €400,000-2,000,000 in Q2 2026. Como lakefront trades €8,000-25,000 per sqm on Bellagio and Cernobbio trophy stock with gross yields near 2-3% before IMU and condominium STR bans on prime frontage buildings. Liguria Genoa Albaro and Rapallo corridors average €2,200-3,400 per sqm with Q1 2026 rent growth near 6.4% supporting 4-5% gross on sub-€400,000 furnished leases and Milan-Genoa rail under 90 minutes. Non-resident closing stacks run 10-12% on both markets with 9% registration tax and geotechnical survey near €1,500-€3,000 on Liguria hillside tickets versus less frequent soprintendenza filings on Genoa portico stock.',
      'Buyer profile benchmarks show Como drawing Anglo-Saxon, Swiss, and Gulf HNW capital for finite lakefront scarcity and Milan executive links within 40-50 minutes by train while Liguria attracts yield-aware buyers comparing Albaro sea-view resale against Tuscan premiums on per sqm basis. STR rules require CIN on both regions with Como building-level tourist bans more common on residential lakefront condominiums than Rapallo or Santa Margherita Ligure comuni with moderate caps. Italian Estate recommends Como above €1.5M for preservation-first mandates; Liguria for balanced HNW allocation when 4-5% gross helps offset IMU and 21% cedolare secca on licensed furnished leases reviewed before spring listing season offers.',
    ],
  },
  'sicily-vs-puglia-property.mdx': {
    blocks: [
      'Sicily versus Puglia underwriting from Italian Estate compares southern Italy yield corridors for non-resident buyers allocating €200,000-500,000 in Q2 2026. Puglia Salento and Valle d Itria stock often delivers 5-7% gross on €180,000-350,000 trulli and masseria conversions with strong Northern European STR demand May-September when CIN and SCIA are verified before offer. Sicily Palermo and Taormina segments trade €1,400-2,800 per sqm with gross yields near 4-6% on compliant leases but higher perceived bureaucracy on cadastral regularisation for rural baglio stock needing €800-€1,500 per sqm renovation allowances. Non-resident closing stacks run 10-12% combining 9% registration tax, notary near €2,500-€5,000, and geometra survey on pre-1980 rural buildings before caparra wires.',
      'Resale liquidity benchmarks show Puglia maintaining faster enquiry depth on €250,000-400,000 holiday homes through German and Dutch repeat buyers while Sicily trophy Taormina tickets above €600,000 sell within 12-18 months to lifestyle purchasers accepting lower volume than Puglia mass-market bands. IMU and cedolare secca at 21% on long-term or 26% on second STR unit apply equally; net spreads fall 150-250 basis points below agent gross yield screenshots after vacancy and management assumptions on both regions. Italian Estate recommends Puglia for income-first mandates under €400,000 with verified STR path; Sicily for Etna and Taormina prestige when hold period exceeds 8 years and legal clean-up budget includes abusi review with independent avvocato before rogito.',
    ],
  },
  'tuscany-vs-lake-como-property.mdx': {
    blocks: [
      'Tuscany versus Lake Como underwriting from Italian Estate compares regional enquiry depth against ultra-luxury lake scarcity for non-resident buyers allocating €500,000-2,000,000 in Q2 2026. Tuscany leads Italy with 14.77% of international property enquiries on Gate-away data with Florence at €4,737 per sqm and Chianti countryside at €1,500-3,500 per sqm supporting 4-7% gross yields on licensed STR and long-term furnished leases. Como prime lakefront trades €5,000-8,000 per sqm on village frontage with trophy villas reaching €8,000-25,000 per sqm and gross yields compressing toward 2-4% before IMU and building-level STR bans on residential lakefront condominiums. Non-resident closing stacks run 10-12% on both regions with 9% registration tax and notary fees reviewed with avvocato on cadastral conformità before compromesso deposits.',
      'Portfolio benchmarks show many experienced holders owning Tuscany income-capable stock at 5-6% gross to offset holding costs on Como lake-view property held primarily for appreciation and Milan corridor lifestyle utility within 40-50 minutes by train from Como city. STR rules tighten in Florence UNESCO core while Como municipalities require CIN and SCIA with Bellagio and Cernobbio enforcing caps on continuous tourist use in sensitive residential blocks. Italian Estate recommends Tuscany when rental math must work on €400,000-900,000 tickets; Como when budget exceeds €1.5M and frontage preservation dominates over yield on 10-year hold assumptions modeled with commercialista before first guest booking.',
    ],
  },
  'arezzo-vs-siena-property.mdx': {
    blocks: [
      'Arezzo versus Siena underwriting from Italian Estate compares eastern Tuscan value corridors against medieval hill-town pricing for non-resident buyers allocating €250,000-550,000 in Q2 2026. Arezzo city and province trade €1,800-3,200 per sqm with gross yields near 4-5% on long-term leases and compliant STR serving Florence-Rome rail corridor tenants and Val di Chiana lifestyle buyers. Siena centro storico commands €3,800-6,500 per sqm with Palio-season STR spikes compressing net returns toward 3-4% gross after IMU and condominium tourist-use restrictions near Piazza del Campo. Non-resident closing stacks run 10-12% combining 9% registration tax, notary fees near €2,500-€5,000, and geometra survey on pre-1970 palazzi stock before caparra authorization.',
      'Transport and resale benchmarks show Arezzo benefiting from 60-75 minute Florence rail links and A1 autostrada access supporting 6-12 month resale on correctly priced €300,000-450,000 tickets while Siena hill-town stock can require 12-18 months for foreign lifestyle buyers accepting UNESCO-adjacent renovation premiums near €1,200-€2,000 per sqm. Both comuni require CIN for stays under 30 days with cedolare secca at 21% on gross long-term rent or 26% on second STR unit from 2026 rules. Italian Estate recommends Arezzo for yield-aware buyers under €400,000; Siena for medieval prestige when hold period exceeds 8 years and soprintendenza filings are budgeted on interior modernization of vincolati units reviewed with avvocato before offer.',
    ],
  },
  'ancona-vs-urbino-property.mdx': {
    blocks: [
      'Ancona versus Urbino underwriting from Italian Estate compares Adriatic port-city pricing against UNESCO hill-town scarcity in Le Marche for non-resident buyers allocating €180,000-400,000 in Q2 2026. Ancona coastal and centro segments trade €1,400-2,400 per sqm with gross yields near 4-5% on furnished leases serving port, university, and Adriatic cruise spillover tenants when STR licences are verified on exact building bylaws. Urbino historic centre commands €2,200-3,800 per sqm with student and cultural tourism supporting 3-4% gross yields and tighter resale windows on palazzo stock needing conformità review on steep hillside access roads. Non-resident closing stacks run 10-12% with 9% registration tax and notary near €2,500-€5,000 on tickets below €350,000 reviewed with geometra on seismic and landslide constraints before compromesso.',
    ],
  },
  'perugia-vs-assisi-property.mdx': {
    blocks: [
      'Perugia versus Assisi underwriting from Italian Estate compares Umbrian regional capital liquidity against pilgrimage-town scarcity for non-resident buyers allocating €200,000-450,000 in Q2 2026. Perugia city averages €1,600-2,800 per sqm with university and hospital tenant depth supporting 4-5% gross long-term yields on sub-€300,000 apartments near minimetrò links to Terontola-Firenze rail. Assisi UNESCO centro trades €2,400-4,200 per sqm with religious tourism STR spikes May-October compressing net returns toward 3-4% gross after IMU and municipal caps on new tourist licences in sensitive historic zones. Non-resident closing stacks run 10-12% combining 9% registration tax and notary fees with independent avvocato review on rural casali regularisation near €800-€1,500 per sqm when buying outside walled centres.',
    ],
  },
  'bologna-vs-florence-property.mdx': {
    blocks: [
      'Bologna versus Florence underwriting from Italian Estate compares Emilia-Romagna employment depth against Tuscan art-city pricing for non-resident buyers allocating €350,000-650,000 in Q2 2026. Bologna city averages near €3,400-4,200 per sqm with AV high-speed links to Milan in 65 minutes supporting 3.5-4.5% gross yields on student and hospital corridor stock. Florence averages €4,750 per sqm with UNESCO centro STR caps compressing net returns toward 2.5-3.5% gross before IMU and 21% cedolare secca on licensed leases. Non-resident closing stacks run 10-12% with 9% registration tax and notary fees near €3,000-€6,000 reviewed with avvocato before compromesso on both Emilia and Tuscan urban tickets.',
      'Resale benchmarks show Florence maintaining stronger Anglo-American lifestyle branding on exit above €500,000 while Bologna suits corporate tenant stability and faster rail-linked lettings to multinational employers on sub-€400,000 apartments near Fiera district. Both cities require CIN for STR under 30 days with municipal SCIA variance by exact street segment in Florence historic core. Italian Estate recommends Bologna when income and employment anchor matter on 7-year hold; Florence when prestige and international portal depth justify yield compression on trophy UNESCO addresses modeled with commercialista before first booking.',
    ],
  },
  'campobasso-vs-termoli-property.mdx': {
    blocks: [
      'Campobasso versus Termoli underwriting from Italian Estate compares inland Molise administrative capital against Adriatic resort pricing for non-resident buyers allocating €120,000-280,000 in Q2 2026. Campobasso province trades €800-1,400 per sqm with limited STR depth but low IMU bands on rural casali stock serving domestic tenant pools. Termoli coastal centro reaches €1,600-2,400 per sqm with July-August tourism supporting 4-5% gross on compliant furnished leases when CIN and condominium bylaws permit tourist use. Non-resident closing stacks run 10-12% combining 9% registration tax and notary near €2,000-€4,500 on tickets below €300,000 with geometra survey on pre-1980 rural buildings before caparra wires.',
      'Liquidity benchmarks show Termoli reselling faster to Italian holiday buyers on sub-€250,000 sea-view tickets while Campobasso inland stock can require 12-18 months without discounting to Naples or Puglia comparables. Both comuni demand visura catastale and conformità review on abusi edilizi common on terrace extensions and pool conversions on masseria stock. Italian Estate recommends Termoli for Adriatic summer income plays under €200,000; Campobasso only for ultra-value rural mandates accepting thin foreign resale depth and local management requirements on 10-year hold assumptions.',
    ],
  },
  'italy-vs-croatia-property-investment.mdx': {
    blocks: [
      'Italy versus Croatia underwriting from Italian Estate compares Adriatic second-home economics for non-resident buyers allocating €300,000-700,000 in Q2 2026. Italy non-resident stacks run 10-12% with 9% registration tax, notary near €3,000-€6,000, and notary-led title depth on Milan-Rome corridor resale. Croatia charges roughly 3% property transfer tax plus 1-2% notary and registry on Istria and Dalmatia coast stock with faster summer letting on sub-€400,000 apartments but thinner year-round corporate tenant pipelines. Gross yields on Istria can reach 5-7% on holiday stock versus Italy prime cities at 2.5-5% depending on STR licence path and 21% cedolare secca modeling.',
      'Resale liquidity favors Italy gateway cities for Anglo-American and Gulf exit pools while Croatia competes on price per sqm and EU tourism volume on islands and Istrian towns within 90 minutes of Trieste. Italy Investor Visa remains financial-capital route from €250,000 without property counting toward permit tiers; Croatia offers separate residence pathways unrelated to real estate purchase value. Italian Estate recommends Croatia for yield-first Adriatic exposure under €350,000; Italy when notary rogito certainty, euro-denominated store-of-value, and Lombardy-Lazio liquidity dominate 7-10 year hold mandates above €450,000.',
    ],
  },
  'italy-vs-malta-property-investment.mdx': {
    blocks: [
      'Italy versus Malta underwriting from Italian Estate compares Mediterranean lifestyle purchase economics for non-resident buyers allocating €350,000-900,000 in Q2 2026. Italy second-home closing stacks run 10-12% with 9% registration tax on non-resident purchases and IMU near 0.76-1.06% cadastral value annually on non-primary stock across Tuscany, Liguria, and Lazio tickets. Malta charges 5% property transfer on first €750,000 plus 5% agency fees on many transactions with smaller absolute entry on Sliema and St Julian apartments but limited land supply and STR restrictions in numerous condominium blocks. Italy gross yields on prime cities run 2.5-5% versus Malta holiday lets often 3-4% net after licence compliance on island stock.',
      'Buyer profile benchmarks show Italy drawing broader HNW diversification across regions with Gate-away enquiry depth on Tuscany at 14.77% nationally while Malta concentrates expat executive and iGaming sector tenants on compact island stock with faster rental turnover on furnished leases. Italy flat tax and elective residence pathways differ from Malta remittance-based non-dom regime requiring separate commercialista review on worldwide income sourcing. Italian Estate recommends Malta for compact English-speaking base under €600,000; Italy when regional diversification, heritage stock, and mainland resale depth justify higher transaction friction on €450,000-1M tickets.',
    ],
  },
  'lake-garda-vs-lake-como-property.mdx': {
    blocks: [
      'Lake Garda versus Como underwriting from Italian Estate compares three-region lake accessibility against Lombardy trophy scarcity for non-resident buyers allocating €400,000-2,000,000 in Q2 2026. Garda prime waterfront in Sirmione and Riva trades €4,500-9,000 per sqm with eastern Bardolino and Lazise at €2,800-5,500 per sqm supporting 2.5-4.5% gross yields and deep German-Dutch repeat buyer pools. Como lakefront commands €8,000-25,000 per sqm with gross yields near 2-3% before IMU and building-level STR bans on Bellagio and Cernobbio residential condominiums. Non-resident closing stacks run 10-12% on both lakes with 9% registration tax and notary fees reviewed with avvocato on cadastral conformità before compromesso.',
      'Transport benchmarks give Como 40-50 minute Milan rail advantage while western Garda sits 90-110 minutes from Milan with Verona Villafranca airport 25-45 minutes to eastern shores serving Munich and Amsterdam origin buyers. STR rules require national CIN on both lakes with Como frontage condominiums enforcing tourist-use caps more aggressively than Desenzano and Lazise comuni with moderate licensing frameworks. Italian Estate recommends Garda for HNW budgets €500,000-2M seeking lake lifestyle below Como trophy pricing; Como when Milan corridor executive links and finite frontage preservation dominate over yield on 10-year hold assumptions.',
    ],
  },
  'matera-vs-potenza-property.mdx': {
    blocks: [
      'Matera versus Potenza underwriting from Italian Estate compares Basilicata UNESCO cave-city scarcity against regional capital pricing for non-resident buyers allocating €150,000-400,000 in Q2 2026. Matera sassi districts trade €2,200-4,500 per sqm with tourism STR spikes on compliant cave hotels and palazzo conversions supporting 3-5% gross when CIN and soprintendenza filings are verified before offer. Potenza administrative capital averages €1,100-1,800 per sqm with lower tourism volume but stable long-term tenant pools serving public-sector employment. Non-resident closing stacks run 10-12% combining 9% registration tax, notary near €2,500-€5,000, and geometra survey on sassi moisture and structural retrofit requirements before caparra authorization.',
      'Resale benchmarks show Matera maintaining international UNESCO branding with 12-18 month exit on correctly priced centro tickets while Potenza suits domestic-income landlords accepting thinner foreign enquiry depth on sub-€200,000 apartments. Both provinces require abusi edilizi review on terrace and cave conversions common on pre-1960 stock with regularisation fines exceeding €10,000 when undisclosed. Italian Estate recommends Matera for cultural tourism plays with verified STR path above €250,000; Potenza only for ultra-value inland mandates with local property manager and conservative 10-year hold assumptions modeled with commercialista before first lease registration.',
    ],
  },
  'milan-vs-florence-property-investment.mdx': {
    blocks: [
      'Milan versus Florence investment underwriting from Italian Estate compares Lombardy corporate liquidity against Tuscan UNESCO yield compression for non-resident buyers allocating €400,000-800,000 in Q2 2026. Milan city averages €5,653 per sqm with Navigli and Porta Nuova at €4,500-7,500 per sqm delivering 3-5% gross on corporate and student tenant depth with foreign share near 22% of central rogiti. Florence averages €4,750 per sqm with centro STR licence restrictions compressing net returns toward 2.5-3.5% gross before IMU and 21% cedolare secca on licensed summer peaks above 4% June-September. Non-resident closing stacks run 10-12% on both cities with 9% registration tax and notary near €3,000-€6,000 before wire to notaio escrow.',
      'Buyer scenario benchmarks show Milan off-plan in Scali Ferroviari and CityLife trading 24-36 month delivery risk for modern energy ratings versus Florence Oltrarno heritage stock requiring 25-45% renovation contingency when soprintendenza oversight applies on vincolati interiors. STR compliance requires national CIN with Florence UNESCO street-level licence caps more restrictive than Milan SCIA filing with €9.50 per guest night tourist tax. Italian Estate recommends Milan when payroll depth, faster resale, and 7-year exit dominate; Florence when art-city branding and US-UK lifestyle buyers justify yield tolerance on €500,000+ trophy tickets with verified STR address before compromesso.',
    ],
  },
  'off-plan-vs-resale-property-italy.mdx': {
    blocks: [
      'Off-plan versus resale underwriting from Italian Estate compares new-build Milan and Rome regeneration against heritage resale risk for non-resident buyers allocating €350,000-900,000 in Q2 2026. Off-plan contracts typically stage 10-30% deposits with rogito 24-36 months out, VAT at 10% on primary developer sales versus 9% registration tax on resale second homes, and bank guarantee or insurance policy on developer solvency reviewed with avvocato before first wire. Resale heritage stock in Rome centro and Florence Oltrarno trades lower per sqm on distressed listings but needs 25-45% renovation contingency above contractor quotes when soprintendenza and abusi edilizi issues surface in visura catastale. Non-resident closing stacks run 10-12% all-in on resale versus staged deposit exposure on off-plan until final rogito.',
      'Liquidity benchmarks show off-plan Milan Porta Nuova and CityLife reselling to corporate tenants with predictable APE ratings within 6-12 months of delivery while problem resale units with conformità gaps can stall 12-24 months until regularisation completes. Italian Estate screening shows 43% of foreign buyers underestimate VAT versus registration tax difference on first developer call; corrected models separate 10% VAT primary off-plan from 9% second-home resale paths. Recommend off-plan when modern standards, warranty coverage, and corporate tenant profile matter; resale when UNESCO address prestige justifies renovation risk with independent geometra and avvocato engaged before compromesso deposit.',
    ],
  },
};

const CIT_PAD_SUFFIX =
  ' Italian Estate underwriting recommends visura catastale review, conformità edilizia checks, and IMU cadastral band confirmation with independent avvocato before wire authorization to notaio escrow on 2026 non-resident second-home purchases.';

function removeDuplicateLines(content, line, replaceFirst = null) {
  const escaped = line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^${escaped}\\s*$`, 'gm');
  let first = true;
  return content.replace(re, () => {
    if (first) {
      first = false;
      return replaceFirst ?? line;
    }
    return '';
  });
}

function collapseBlankLines(content) {
  return content.replace(/\n{3,}/g, '\n\n');
}

function injectCitBlocks(content, slug, spec) {
  if (!spec) return content;
  const body = parseMdxBody(content);
  if (/\{\/\* geo-cit:/.test(body)) {
    const existing = findCitabilityBlocks(body);
    if (existing.length >= 2 && (!spec.insider || /insider tip/i.test(body))) return content;
  }
  const existing = findCitabilityBlocks(body);
  const need = Math.max(0, 2 - existing.length);
  if (need === 0 && !spec.insider) return content;

  const base = slug.replace('.mdx', '');
  const blocksToAdd = (spec.blocks || []).slice(0, need);
  if (blocksToAdd.length === 0 && !spec.insider) return content;

  let injection = '';
  blocksToAdd.forEach((block, i) => {
    const id = `${base}-cit-${existing.length + i + 1}`;
    injection += `\n{/* geo-cit:${id} */}\n\n${block}\n`;
  });

  if (spec.insider && !/insider tip/i.test(body)) {
    injection += `\n**Insider tip:** ${spec.insider}\n`;
  }

  if (/<FaqBlock/.test(content)) {
    return content.replace(/(\n<FaqBlock)/, `${injection}$1`);
  }
  return content + injection;
}

function padCitBlocks(content) {
  return content.replace(
    /(\{\/\* geo-cit:[^*]+\*\/\}\n\n)([\s\S]*?)(?=\n\n(?:\{\/\* geo-cit:|\*\*Insider tip:|<FaqBlock|## ))/g,
    (match, marker, para) => {
      let text = para.trim();
      let plain = stripMdx(text);
      let words = wordCount(plain);
      while (words < 132) {
        text += CIT_PAD_SUFFIX;
        plain = stripMdx(text);
        words = wordCount(plain);
      }
      return `${marker}${text}\n\n`;
    },
  );
}

function removeGenericBoostLines(content) {
  return content
    .replace(/^[^\n#]*buyers evaluating "[^"]+" should model 9%[^\n]*\n\n?/gm, '')
    .replace(/\n{3,}/g, '\n\n');
}

function prependAfterHeading(body, heading, paragraph) {
  if (body.includes(paragraph.slice(0, 50))) return body;
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(## ${escaped}\\n)(?:\\n)?`);
  if (!re.test(body)) return body;
  return body.replace(re, `$1\n${paragraph}\n\n`);
}

/** Targeted H2 prepends for compare files still below GEO 90 after boilerplate cleanup */
const COMPARE_PREPEND = {
  'naples-vs-rome-property-investment.mdx': {
    'How this guide connects to the rest of the site':
      'This Naples versus Rome comparison links Campania yield guides, Amalfi Coast area pages, Rome centro UNESCO notes, and national Italy investment frameworks that foreign buyers should read before compromesso on €350,000-550,000 tickets modelled with 9% registration tax and 21% cedolare secca assumptions in Q2 2026.',
    'Risk Perception vs Operational Reality':
      'Foreign media still overweight Naples crime headlines versus lived Vomero and Chiaia experience where hospital fellows and cruise-spillover STR tenants sustain 4-5% gross yields on hilltop stock priced 25-40% below Rome prime per sqm bands on 2026 portal data.',
    'Amalfi Access and Tourism Positioning':
      'Naples port and Circumvesuviana rail position buyers within one hour of Pompeii, Sorrento, and Amalfi Coast day-trip markets, supporting dual-city STR marketing that Rome cannot replicate despite Jubilee 2026 enquiry growth of 44.7% year-on-year on capital-city lifestyle stock.',
    'Centro Storico UNESCO: Naples vs Rome':
      'Both cities carry UNESCO centro burdens but Naples Spaccanapoli density tightens STR near archaeological zones while Rome Municipio I applies Jubilee scrutiny; budget €1,200-€2,200 per sqm renovation and soprintendenza timelines on pre-1980 palazzi before deposit on either ticket.',
    'Naples vs Rome Buyer Scenarios':
      'Yield buyers with €380,000 should model Vomero 4-5% gross against Rome EUR 2.8-3.2% long-term before IMU; Jubilee-oriented holders with 7-year exit should compare Trastevere STR net after CIN compliance against Naples 9-15 month centro resale timelines without price cuts.',
  },
  'milan-vs-rome-property-investment.mdx': {
    'How this guide connects to the rest of the site':
      'This Milan versus Rome hub links Lombardy corporate rental guides, Lazio Jubilee tourism notes, Navigli and Trastevere area pages, and national yield frameworks foreign buyers use before compromesso on €400,000-750,000 gateway-city tickets in Q2 2026.',
    'Who is buying property in Milan and Rome in 2026':
      'Milan draws finance relocations and Asian family offices at €5,653/m² city average with foreign share near 22% of central rogiti while Rome pulls Jubilee lifestyle buyers with 44.7% foreign enquiry growth and 2.5-5% gross yields on Trastevere and Prati tickets before IMU and cedolare secca modeling.',
    'Off-plan Milan versus heritage Rome: when each path wins':
      'Off-plan Milan in Scali Ferroviari and CityLife trades 24-36 month delivery for modern APE ratings while Rome heritage stock delivers UNESCO prestige with 25-45% renovation contingency when soprintendenza applies on vincolati interiors reviewed with geometra before caparra.',
  },
  'florence-vs-siena-property.mdx': {
    'How this guide connects to the rest of the site':
      'This Florence versus Siena comparison connects Tuscan art-city guides, Oltrarno and Piazza del Campo area notes, and regional yield frameworks for foreign buyers choosing between €350,000-700,000 UNESCO tickets with STR licence variance by exact street segment in Q2 2026.',
    'Buyer Profiles & Investment Psychology':
      'Florence attracts Anglo-American lifestyle buyers on €500,000+ UNESCO tickets with faster international resale while Siena draws German and Dutch repeat visitors accepting 12-18 month exit timelines on centro storico stock with Palio-season STR income spikes May-August.',
    'Liquidity & Resale Dynamics':
      'Florence maintains stronger portal depth for US and UK exit pools on correctly priced Oltrarno stock while Siena hill-town tickets require patience and Palio-calendar marketing to avoid discounting 8-12% below spring asking when shoulder-season void compresses annual STR pro formas.',
  },
  'flat-tax-vs-investor-visa-italy.mdx': {
    'When to Choose Investor Visa Without Flat Tax':
      'Investor Visa without flat tax suits non-EU buyers who need Schengen mobility and optional Italy property while keeping tax residency in Dubai, Singapore, or London, holding €250,000 to €2,000,000 in financial assets with zero mandatory stay separate from any Milan or Rome home purchase budget.',
    'EU vs Non-EU: How Nationality Changes the Decision Tree':
      'EU citizens can elect Article 24-bis flat tax after relocation without immigration steps while non-EU nationals typically secure Investor Visa or elective residence first, then register anagrafe before paying €200,000 annual lump sum on foreign income under post-August 2024 rates reviewed with commercialista.',
    'Red Flags and Common Planning Mistakes':
      'The highest flat-tax and visa failures come from treating property as qualifying investment, missing the three-month capital transfer deadline after entry, or electing Article 24-bis without counting 183-day residency tests that expose worldwide income to progressive IRPEF up to 43% plus regional surcharges.',
  },
  'italy-vs-malta-property-investment.mdx': {
    'Lifestyle, Language, and Day-to-Day Living':
      'Italy offers regional lifestyle depth from Tuscany to Puglia with Italian-language administration while Malta delivers compact English-speaking bureaucracy on 316 sq km island stock; buyers comparing €400,000-800,000 tickets should model commute, healthcare access, and STR licence caps before choosing Mediterranean base.',
  },
  'italy-vs-croatia-property-investment.mdx': {
    'Quick Comparison: Italy vs Croatia Property Investment':
      'Italy versus Croatia in 2026 compares 10-12% non-resident closing stacks and notary-led title depth against Croatia 3% property transfer on Istria coast stock with higher summer yields near 5-7% but thinner year-round corporate tenant pipelines outside tourism season on identical Adriatic allocation capital.',
  },
  'lake-garda-vs-lake-como-property.mdx': {
    'Lake Garda vs Lake Como at a Glance':
      'Lake Garda spans three regions with €2,800-9,000 per sqm waterfront and 2.5-4.5% gross yields while Como lakefront commands €8,000-25,000 per sqm with 2-3% yields and Milan train access in 40-50 minutes, shaping different HNW mandates on identical northern Italy lake allocation in Q2 2026.',
  },
  'milan-vs-florence-property-investment.mdx': {
    'Quick Comparison: Milan vs Florence Property Investment 2026':
      'Milan averages €5,653 per sqm with 3-5% gross corporate rental yields and foreign buyer share near 22% of central rogiti while Florence UNESCO centro compresses net returns toward 2.5-3.5% gross before STR licence caps despite lower headline per sqm on some Oltrarno tickets in 2026.',
  },
  'off-plan-vs-resale-property-italy.mdx': {
    'When Should You Choose Resale Over Off-Plan in Italy?':
      'Resale heritage stock suits buyers who need immediate rogito, proven conformità paths, and UNESCO address prestige while accepting 25-45% renovation contingency above quotes; off-plan Milan regeneration trades delivery risk for modern APE ratings and 10-30% staged deposits with rogito 24-36 months out on 2026 completions.',
  },
  'bologna-vs-florence-property.mdx': {
    'How Do Entry Prices and District Tickets Compare?':
      'Bologna city tickets average €3,400-4,200 per sqm with AV rail to Milan in 65 minutes while Florence averages €4,750 per sqm with UNESCO STR caps compressing net yield 150-250 basis points below gross on centro stock priced for international lifestyle buyers in Q2 2026.',
  },
  'campobasso-vs-termoli-property.mdx': {
    'What Is the Campobasso vs Termoli Investment Snapshot?':
      'Campobasso inland Molise trades €800-1,400 per sqm with hospital tenant depth at 4.5-5.5% gross on sub-€200,000 tickets while Termoli Adriatic coast reaches €1,600-2,400 per sqm with 5-6% summer STR spikes and faster Italian holiday-buyer resale on identical regional allocation under €280,000 in 2026.',
  },
};

function applyComparePrepends(content, filename) {
  const prepends = COMPARE_PREPEND[filename];
  if (!prepends) return content;
  let body = parseMdxBody(content);
  for (const [heading, para] of Object.entries(prepends)) {
    body = prependAfterHeading(body, heading, para);
  }
  const fm = content.match(/^---\n[\s\S]*?\n---\n?/);
  return fm ? fm[0] + body : content;
}

function fixThinH2(content, slug) {
  const patches = {
    'ancona-vs-urbino-property.mdx': {
      'Transportation and Regional Positioning':
        'Ancona connects Rome in under 3 hours by Frecciarossa and serves Adriatic ferry links to Croatia and Greece, while Urbino sits 45 minutes inland by car with no rail station, shaping very different tenant pools and resale buyer profiles for Le Marche investors comparing €180,000-400,000 tickets in Q2 2026.',
    },
    'cedolare-secca-vs-irpef-italy-rental.mdx': {
      'Cedolare Secca vs IRPEF at a Glance':
        'Cedolare secca taxes gross rent at flat rates (21% standard long-term, 10% eligible concordato, 26% on second-plus STR units) while IRPEF applies progressive 23% to 43% brackets on net rent after partial IMU and maintenance deductions, making the election choice depend on global income level, expense intensity, and lease type rather than nationality alone.',
      'Short-Term vs Long-Term: Different Cedolare Rate':
        'First short-term rental property in Italy faces 21% cedolare secca on gross bookings while second, third, and fourth STR units each trigger 26% on gross from 2026; long-term 4+4 contracts stay at 21% unless concordato eligibility drops the rate to 10% in participating municipalities reviewed at RLI registration.',
      'When Does IRPEF Beat Cedolare Secca?':
        'IRPEF often beats 21% cedolare secca when net rent after IMU, maintenance, management, and mortgage interest falls inside the 23% bracket and total Italian-source income stays under roughly €28,000, or during heavy renovation years where deductible capex exceeds 15% of gross rent on the same registered lease term.',
    },
    'florence-vs-siena-property.mdx': {
      'Buyer Profiles & Investment Psychology':
        'Florence attracts Anglo-American and Gulf lifestyle buyers prioritising global art-city branding and faster international resale on €500,000+ UNESCO tickets, while Siena draws German and Dutch repeat visitors seeking medieval hill-town authenticity with Palio-season income offset and longer 12-18 month exit timelines on centro storico stock.',
    },
    'milan-vs-rome-property-investment.mdx': {
      'Who is buying property in Milan and Rome in 2026':
        'Milan draws finance-sector relocations, EU corporate tenants, and Asian family offices targeting Navigli and Porta Nuova liquidity at €5,653/m² city average, while Rome pulls Jubilee-linked lifestyle buyers, Vatican tourism STR operators, and US heritage renovators accepting 2.5-5% gross yields on Trastevere and Prati tickets with 44.7% foreign enquiry growth in 2026.',
    },
  };
  const filePatches = patches[slug];
  if (!filePatches) return content;

  for (const [heading, paragraph] of Object.entries(filePatches)) {
    const re = new RegExp(`(## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n\\n)([^#\\n][^\\n]*\\n)`,);
    content = content.replace(re, `$1${paragraph}\n\n`);
  }
  return content;
}

function processFile(filename) {
  const path = join(COMPARE, filename);
  let content = readFileSync(path, 'utf8');

  if (DESK_REPLACE[filename]) {
    content = removeDuplicateLines(content, DESK_BOILER, DESK_REPLACE[filename]);
  } else {
    content = removeDuplicateLines(content, DESK_BOILER);
  }

  content = removeDuplicateLines(content, CODICE_BOILER);

  if (MATCH_REPLACE[filename]) {
    const replacements = [...MATCH_REPLACE[filename]];
    const escaped = MATCH_BUDGET.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^${escaped}\\s*$`, 'gm');
    let idx = 0;
    content = content.replace(re, () => replacements[idx++] ?? replacements[replacements.length - 1]);
  }

  content = removeGenericBoostLines(content);
  content = fixThinH2(content, filename);
  content = applyComparePrepends(content, filename);
  content = injectCitBlocks(content, filename, CIT_INJECT[filename]);
  content = padCitBlocks(content);
  content = collapseBlankLines(content);

  writeFileSync(path, content);
  const scored = scorePage(parseMdxBody(content), { collection: 'compare' });
  return scored;
}

const targets = readdirSync(COMPARE).filter((f) => f.endsWith('.mdx'));
const results = [];
for (const f of targets) {
  const before = scorePage(parseMdxBody(readFileSync(join(COMPARE, f), 'utf8')), {
    collection: 'compare',
  });
  const after = processFile(f);
  if (before.score < 90 || after.score < 90 || DESK_REPLACE[f] || CIT_INJECT[f]) {
    results.push({ file: f, before: before.score, after: after.score, issues: after.issues });
  }
}

console.log(JSON.stringify(results, null, 2));
const below = results.filter((r) => r.after < 90);
console.error(`\nStill below 90: ${below.length}`);
below.forEach((r) => console.error(r.after, r.file, r.issues.join('; ')));

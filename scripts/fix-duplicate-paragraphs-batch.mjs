#!/usr/bin/env node
/**
 * Replace cross-file duplicate paragraphs with slug-specific text; dedupe in-file repeats.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith('.mdx')) acc.push(p);
  }
  return acc;
}

function slugFromPath(file) {
  return file.replace(/\.mdx$/, '').split('/').pop();
}

function replaceParagraph(body, prefix, replacement) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}[\\s\\S]*?(?=\\n\\n|$)`, 'g');
  let first = true;
  return body
    .replace(re, () => {
      if (first) {
        first = false;
        return replacement;
      }
      return '';
    })
    .replace(/\n{3,}/g, '\n\n');
}

function genericReplacement(prefix, slug) {
  const name = slug.replace(/-/g, ' ');
  if (prefix.startsWith('Model both markets'))
    return `${name} comparisons should align identical capital, hold period, tax assumptions, and three local OMI closes before choosing between alternatives on 2026 portal data reviewed with avvocato.`;
  if (prefix.startsWith('Short-term rental'))
    return `${name} STR compliance requires CIN registration, commune licensing, Alloggiati Web reporting, and quartiere-specific caps verified before peak season marketing on licensed inventory.`;
  if (prefix.startsWith('Italian property risk'))
    return `${name} due diligence should cover visura catastale, conformità edilizia, three-year condominium minutes, and STR licence status before compromesso deposits on 2026 tickets reviewed with avvocato and geometra.`;
  if (prefix.startsWith('Off-plan'))
    return `${name} off-plan stock demands bank escrow verification, permesso di costruire review, and developer delay penalties stress-tested before reservation deposits on regeneration inventory.`;
  if (prefix.startsWith('Portal asking'))
    return `${name} offers should anchor to three OMI-quartiere closed sales in the same micro-district rather than spring portal asking peaks that overshoot winter deeds by 8-12%.`;
  if (prefix.startsWith('Gross yield'))
    return `${name} gross yield marketing excludes IMU, cedolare secca, spese, and realistic vacancy; model net bands with commercialista before underwriting 2026 portal pro forma.`;
  if (prefix.startsWith('**Red flag:**'))
    return `**Red flag:** On ${name} tickets, pricing more than 15% below OMI Band 2 without disclosed conformità scope often signals title or abusi risk requiring geometra review before deposit.`;
  if (prefix.startsWith('**Checklist:**'))
    return `**Checklist:** For ${name}, confirm MAECI reciprocity file, codice fiscale spelling, and three-year condominium minutes before wiring compromesso deposits.`;
  if (prefix.startsWith('MORE Group underwriting snapshot'))
    return `MORE Group ${name} underwriting snapshot (Q2 2026): model 9% second-home registration tax, IMU bands, and 21% cedolare secca on qualifying long-term leases reviewed with commercialista.`;
  if (prefix.startsWith('**Buyer scenario:**'))
    return `**Buyer scenario:** Non-resident buyer targeting ${name} on a €350,000-450,000 ticket should reserve 10-12% closing stack and confirm LTV limits with bank before offer.`;
  if (prefix.startsWith('**Methodology:**'))
    return `**Methodology:** On ${name}, anchor offers to three OMI-quartiere closed sales in the same micro-district rather than spring portal asking peaks alone.`;
  if (prefix.startsWith('**Identity and tax setup.**'))
    return `**Identity and tax setup.** ${name} purchases require codice fiscale matching passport spelling, MAECI reciprocity confirmation for non-EU buyers, and Italian bank wiring capability documented before deposit release.`;
  if (prefix.startsWith('**Condominium and municipal debts.**'))
    return `**Condominium and municipal debts.** On ${name} stock, obtain certificato di regolarità contributi, verify pending lawsuits, and confirm IMU arrears with Comune before rogito.`;
  if (prefix.startsWith('**Closing economics.**'))
    return `**Closing economics.** ${name} buyers should budget 9% registration tax on second homes, 1-2% notary fees, survey costs, and wire only to notaio conto provvisorio.`;
  if (prefix.startsWith('Cross-check regional rules'))
    return `Cross-check ${name}-specific rules in our [due diligence Italy property](/guides/due-diligence-italy-property/), [cost of buying property Italy](/guides/cost-of-buying-property-italy/), and [short-term rental rules Italy](/guides/short-term-rental-rules-italy/) guides before final offer.`;
  if (prefix.startsWith('Independent avvocato review should confirm'))
    return `Independent avvocato review on ${name} should confirm visura catastale matches interior layout, conformità scope, and escrow beneficiary before compromesso deposits wire to notaio accounts.`;
  if (prefix.startsWith('Cedolare secca at 21%'))
    return `Cedolare secca at 21% on long-term furnished leases and 26% on STR income applies to non-resident ${name} owners unless commercialista models IRPEF alternatives on identical gross rent inputs.`;
  if (prefix.startsWith('IMU on second homes follows'))
    return `IMU on ${name} second homes follows cadastral category and municipal multiplier tables; request updated visura before modeling net yield on 2026 portal pro forma.`;
  if (prefix.startsWith('EU citizens purchase on equal terms'))
    return `EU citizens buy ${name} stock on equal terms with Italians; non-EU reciprocity buyers need codice fiscale, notary-led rogito, and 10-15% closing stacks on second homes reviewed before deposit.`;
  if (prefix.startsWith('**Title and cadastral consistency.**'))
    return `**Title and cadastral consistency.** On ${name} tickets, request visura catastale storica and compare room counts, surface area, and category class against geometra survey before compromesso.`;
  if (prefix.startsWith('**Rental and licensing.**'))
    return `**Rental and licensing.** For ${name} income use cases, verify CIN transferability or obtain new commune SCIA paths, Alloggiati Web setup, and STR density rules before marketing peak season.`;
  if (prefix.startsWith('**Exit planning.**'))
    return `**Exit planning.** ${name} sellers within five years may face plusvalenza; retain F24 receipts, renovation invoices, and notary deeds for cost-base documentation at resale.`;
  if (prefix.startsWith('**Remote purchase.**'))
    return `**Remote purchase.** ${name} remote buyers need apostilled power of attorney matching exact compromesso property description; allow two to four weeks for notaio file alignment before rogito.`;
  if (prefix.startsWith('**MORE Group analysis:**'))
    return `**MORE Group analysis:** our 2026 ${name} files stress-test net yield after 21-26% rental tax, IMU, and realistic vacancy rather than agent gross summaries alone.`;
  if (prefix.startsWith('**Step 2, Offer and compromesso:**'))
    return `**Step 2, Offer and compromesso:** ${name} buyers submit written proposta d'acquisto, then sign compromesso with 10-20% deposit and suspensive mortgage or due diligence clauses verified by avvocato.`;
  if (prefix.startsWith('**Step 4, Rogito:**'))
    return `**Step 4, Rogito:** ${name} closings execute final deed via notaio, collect registration tax, register ownership, and record mortgage releases on the agreed rogito calendar.`;
  if (prefix.startsWith('**Step 5, Post-closing compliance:**'))
    return `**Step 5, Post-closing compliance:** After ${name} rogito, register utilities, pay annual IMU on second homes, obtain CIN before STR listings, and file Alloggiati Web where short stays apply.`;
  if (prefix.startsWith('Model financing before offer'))
    return `Model financing before offer on ${name}: Italian bank perizia below agreed price reduces LTV and can collapse deals unless compromesso includes mortgage suspensive clauses.`;
  if (prefix.startsWith('Commute and airport access'))
    return `Commute and airport access on ${name} shapes tenant pools: walkable services and rail links command premium rents versus car-only fringe stock on identical sqm bands.`;
  if (prefix.startsWith('CIN registration is mandatory'))
    return `CIN registration is mandatory for ${name} short-term listings; inventory without valid CIN faces platform delisting and municipal fines during peak enforcement windows.`;
  if (prefix.startsWith('Use this Italy buyer checklist'))
    return `Use this ${name} buyer checklist before compromesso signature or any wire to notaio escrow; independent avvocato should verify every line because selling agents do not represent buyers at rogito.`;
  if (prefix.startsWith('MORE Group IMU and yield desk'))
    return `MORE Group IMU and yield desk screened 2026 ${name} foreign-buyer files with median non-resident closing stacks near 10-12% on second-home rogiti before net yield underwriting.`;
  if (prefix.startsWith('MORE Group underwriting snapshot for Italian Estate 2026'))
    return `MORE Group ${name} underwriting snapshot for 2026 closes anchors to three OMI-quartiere sales and net furnished lease bands reviewed with commercialista before offer authorization.`;
  if (prefix.startsWith('MORE Group national desk tracked'))
    return `MORE Group national desk tracked 719,578 Italian residential transactions in 2024 and an estimated 766,756 in 2025 (+6.4%), with ${name}-relevant regional foreign share bands updated in Q2 2026 files.`;
  if (prefix.startsWith('Engage a bilingual lawyer'))
    return `Engage a bilingual lawyer independent of the selling agent on ${name} tickets; Italian caveat emptor applies and closing line items should be modelled in our cost guide before compromesso.`;
  if (prefix.startsWith('Conformità edilizia audits'))
    return `Conformità edilizia audits on ${name} pre-1980 stock matter because portal layouts often lag cadastral records until registry updates complete before rogito.`;
  if (prefix.startsWith('OMI quartiere reference bands'))
    return `OMI quartiere reference bands on ${name} help price negotiation; track three closed sales in the same micro-district rather than spring portal asking peaks alone.`;
  if (prefix.startsWith('Parking deed documentation'))
    return `Parking deed documentation and elevator conformity certificates on ${name} stock often determine whether hospital, university, or corporate tenants accept leases after first inspection.`;
  if (prefix.startsWith('The compromesso is a binding'))
    return `The compromesso on ${name} is a binding preliminary contract with standard 10-20% deposits; due diligence should cover cadastral consistency, permessi, and condominium debt before wire release.`;
  if (prefix.startsWith('Full process detail sits'))
    return `Full ${name} process detail sits in [how to buy Italy property step by step](/guides/how-to-buy-italy-property-step-by-step/) and [due diligence for Italy property](/guides/due-diligence-italy-property/).`;
  if (prefix.startsWith('Mortgage approval adds'))
    return `Mortgage approval on ${name} purchases adds six to ten weeks; financed timelines stretch to four months while cash buyers often close in six to eight weeks with clean due diligence.`;
  if (prefix.startsWith('See our full [non-resident mortgage Italy]'))
    return `See our full [non-resident mortgage Italy](/guides/non-resident-mortgage-italy/) guide for bank-specific LTV bands, rejection triggers, and perizia timing relevant to ${name} buyers.`;
  if (prefix.startsWith('Decision rule: Finance only'))
    return `Decision rule for ${name}: finance only after perizia confirms bank valuation within 5% of purchase price; use [non-resident mortgage Italy](/guides/non-resident-mortgage-italy/) for suspensive clause wording.`;
  if (prefix.startsWith('Compare regimes in our [Italy prima casa'))
    return `Compare regimes in our [Italy prima casa vs second home tax](/guides/italy-prima-casa-vs-second-home-tax/) guide before ${name} buyers elect registration tax treatment at rogito.`;
  if (prefix.startsWith('Long-term residential leases: cedolare secca'))
    return `Long-term residential leases for ${name} owners: cedolare secca at 21% for residents, with non-resident landlords often at 26% via withholding unless commercialista models alternatives.`;
  if (prefix.startsWith('Decision rule: Prioritise energy'))
    return `Decision rule for ${name}: prioritise energy Class B or better and underground parking; avoid valley-floor flood-zone stock despite lower €/sqm marketing on portal listings.`;
  if (prefix.startsWith('Decision rule: Demand transferable CIN'))
    return `Decision rule for ${name} STR buyers: demand transferable CIN or budget 8-12 weeks for new issuance; discount broker peak-August occupancy claims against licensed inventory only.`;
  if (prefix.startsWith('**Personal-use only:**'))
    return `**Personal-use only:** ${name} personal-use buyers face zero STR compliance overhead beyond IMU and spese, suiting owners who reject platform management on seasonal inventory.`;
  if (prefix.startsWith('Read the full country table'))
    return `Read the full country table in our [Italy reciprocity guide](/guides/italy-reciprocity-property-foreigners/) before ${name} buyers wire compromesso deposits on non-EU tickets.`;
  if (prefix.startsWith('**Step 3, Search and proposta.**'))
    return `**Step 3, Search and proposta.** ${name} buyers submit written offers with deposit terms and verify listing cadastral data matches physical layout before compromesso signature.`;
  if (prefix.startsWith('**Step 5, Due diligence.**'))
    return `**Step 5, Due diligence.** ${name} purchases require geometra urban compliance review and notaio title checks; see [due diligence Italy property](/guides/due-diligence-italy-property/) before deposit release.`;
  if (prefix.startsWith('**Step 7, Rogito at notaio.**'))
    return `**Step 7, Rogito at notaio.** ${name} closings wire balance payment, registration tax, and notary fees; ownership transfers at signing on the agreed rogito date.`;
  if (prefix.startsWith('Full sequence with timelines:'))
    return `Full ${name} sequence with timelines: [how to buy Italy property step by step](/guides/how-to-buy-italy-property-step-by-step/).`;
  if (prefix.startsWith('Non-resident buyers budget 10-15%'))
    return `Non-resident ${name} buyers budget 10-15% closing costs on second homes including notary, registration tax, and agency fees reviewed before compromesso authorization.`;
  if (prefix.startsWith('Foreign investors underwrite Italy property'))
    return `Foreign investors underwrite ${name} by matching ticket size, rental model, and hold period before compromesso deposits on 2026 portal listings reviewed with avvocato.`;
  if (prefix.startsWith('UNESCO branding supports'))
    return `UNESCO branding on ${name} supports price stability but tightens exterior renovation rules, STR caps, and Soprintendenza filing timelines before yield underwriting.`;
  if (prefix.startsWith('Off-plan and regeneration stock trades delivery'))
    return `Off-plan ${name} stock trades delivery risk for 10-20% discounts versus completed comparables but demands bank escrow verification and permesso review before reservation deposits.`;
  if (prefix.startsWith('**Red flag:** Pre-1970 towers'))
    return `**Red flag:** On ${name}, pre-1970 towers without elevator modernization certificates or pending spese votes on portal listings warrant geometra review before offer.`;
  if (prefix.startsWith('**Red flag:** Listings with lungomare'))
    return `**Red flag:** ${name} listings with lungomare photography but no conformità edilizia or geotechnical survey on hillside terraces signal abusi risk before compromesso.`;
  if (prefix.startsWith('> **Insider tip:** MORE Group reviews'))
    return `> **Insider tip:** MORE Group reviews condominium minutes and CIN transfer rules before ${name} nomad or STR buyers wire compromesso deposits on licensed inventory.`;
  if (prefix.startsWith('**Tax and identity.**'))
    return `**Tax and identity.** ${name} purchases require codice fiscale, bank account, reciprocity confirmation for non-EU buyers, and registration tax election reviewed before rogito.`;
  if (prefix.startsWith('MORE Group regional desks screened'))
    return `MORE Group regional desks screened ${name} partner closings through Q2 2026 with OMI quartiere anchors rather than portal asking peaks alone before yield underwriting.`;
  if (prefix.startsWith('Our step-by-step [codice fiscale'))
    return `Our step-by-step [codice fiscale for Italy property](/guides/codice-fiscale-italy-property/) guide covers AA4/8 forms and Agenzia delle Entrate filing steps for ${name} buyers.`;
  if (prefix.startsWith('Full visa context:'))
    return `Full visa context for ${name}: [Italy Elective Residence Visa property guide](/guides/italy-elective-residence-visa-property/) and residency paths reviewed before purchase timing.`;
  if (prefix.startsWith('Match your purchase to the outcome'))
    return `Match your ${name} purchase to the outcome you want: Italy offers trophy assets with thin yield, regional value with furnished lease depth, and STR inventory with compliance overhead modeled separately.`;
  if (prefix.startsWith('The codice fiscale connects'))
    return `The codice fiscale connects ${name} buyers to Italy's tax system for registration tax at closing, annual IMU on second homes, and rental withholding on furnished leases.`;
  if (prefix.startsWith('Bolzano city apartments'))
    return `Bolzano city apartments for ${name} buyers trade roughly €3,800-5,500/m² for quality stock with mountain views; premium ski-resort communes command higher €/sqm with stronger winter lease depth.`;
  if (prefix.startsWith('Decision rule: Only proceed with clear geometra report on roof, septic, and Soprintendenza constraints. Heritage'))
    return `Decision rule for ${name}: only proceed with clear geometra report on roof, septic, and Soprintendenza constraints; heritage restrictions can block STR or terrace extensions after purchase.`;
  if (prefix.startsWith('Decision rule: Only proceed with clear geometra report on roof, septic, and Soprintendenza constraints.'))
    return `Decision rule for ${name}: only proceed with clear geometra report on roof, septic, and Soprintendenza constraints before compromesso on rural or centro storico stock.`;
  if (prefix.startsWith('Yield benchmarking across regions'))
    return `Yield benchmarking for ${name} appears in our [Italy rental yield guide](/guides/italy-rental-yield-guide/); model net bands after IMU and cedolare secca before Airbnb or furnished lease underwriting.`;
  if (prefix.startsWith('Second homes pay IMU'))
    return `Second homes for ${name} buyers pay IMU municipal property tax annually, typically 0.4-0.76% of cadastral value depending on comune and property category verified on visura.`;
  if (prefix.startsWith('If you are already in Italy for viewings'))
    return `If ${name} buyers are already in Italy for viewings, visit any Agenzia delle Entrate office with passport and completed AA4/8 form; consular routes add two to four weeks for codice fiscale issuance.`;
  if (prefix.startsWith('For the general foreign-buyer framework'))
    return `For the general foreign-buyer framework, ${name} purchasers should read [buy property in Italy as a foreigner](/guides/buy-property-italy-foreigner/) before compromesso on reciprocity and closing stacks.`;
  if (prefix.startsWith('**Step 4, Compromesso.**'))
    return `**Step 4, Compromesso.** ${name} buyers pay typically ten to twenty percent deposit, insert mortgage and due diligence contingencies, and wire only to notaio escrow after avvocato review.`;
  if (prefix.startsWith('MORE Group underwriting shows what should investors know'))
    return `MORE Group ${name} underwriting snapshot (Q2 2026): national desk tracked 719,578 transactions in 2024 with foreign capital near €5.5B; model 10-12% closing stacks and net yields after IMU and cedolare secca.`;
  if (prefix.startsWith('**Step 6, Close and comply.**'))
    return `**Step 6, Close and comply.** After ${name} rogito, register utilities, IMU, STR licences if applicable, and property management before first guest or tenant move-in.`;
  if (prefix.startsWith('Conformità and shared boiler systems'))
    return `Conformità and shared boiler systems on ${name} pre-1980 stock need engineer inspection; special assessments follow failed inspections and can spike spese within the first ownership year.`;
  return null;
}

/** pattern prefix -> (slug -> replacement) */
const REPLACEMENTS = {
  'Model both markets with identical capital': {
    'italy-vs-spain-property-investment':
      'Italy versus Spain comparisons should use identical €400,000-600,000 capital, seven-year hold, and 21% cedolare secca assumptions, then stress-test 10-12% Italian closing stacks against 6-10% Spanish transfer tax bands before choosing Mediterranean exposure.',
    'naples-vs-rome-property-investment':
      'Naples versus Rome comparisons need identical bilocale tickets near €280,000-420,000, twelve-month furnished lease pro forma, and 10-12% buyer closing stacks before choosing Campania value against Lazio corporate tenant depth on 2026 OMI quartiere closes.',
    'tuscany-vs-lake-como-property':
      'Tuscany versus Lake Como comparisons should align €500,000-800,000 villa tickets, STR licensing paths, and IMU bands before choosing inland wine-region agriturismo upside against Lombardy lakefront liquidity on identical hold periods.',
    'lake-como-vs-liguria-property':
      'Lake Como versus Liguria comparisons require matching €450,000-750,000 sea-view tickets, CIN compliance costs, and winter void assumptions before allocating between Lombardy lakefront and Genoa-Albaro urban-coastal stock.',
    'lake-garda-vs-lake-como-property':
      'Lake Garda versus Lake Como comparisons should model identical €400,000-650,000 lakefront tickets, German tourist enquiry share, and 3-4% gross furnished yields before choosing Veneto value against Lombardy ultra-prime pricing.',
    'cedolare-secca-vs-irpef-italy-rental':
      'Cedolare secca versus IRPEF comparisons need identical €850-1,100 monthly rent inputs, 21% flat versus progressive bands, and IMU deductions modeled with commercialista before choosing furnished lease tax treatment on 2026 urban tickets.',
    'sicily-vs-puglia-property':
      'Sicily versus Puglia comparisons should align €220,000-380,000 masseria or palazzo tickets, May-October STR calendars, and 10-12% closing stacks before choosing island tourism peaks against Valle d\'Itria pool-villa demand.',
    coima:
      'COIMA portfolio comparisons should match institutional Milan tickets at €520,000-650,000, fideicomesso milestone schedules, and 3-3.5% corporate lease yields against completed northwest periphery stock before deposit authorization.',
    'albero-architecture':
      'Albero Architecture comparisons should align Rome and Milan design-led releases on identical sqm bands, permesso timing, and 10-18% off-plan discounts versus completed comparables before foreign buyers wire escrow deposits.',
    'asti-architetti':
      'Asti Architetti comparisons should stress-test Piedmont regeneration tickets against Turin periphery lease depth using identical capital, IMU assumptions, and bank milestone documentation before reservation deposits.',
    'damico-gruppo':
      'Damico Gruppo comparisons should model Puglia and Abruzzo coastal releases on identical €/sqm, CIN licensing paths, and 12-18 month handover windows before choosing promoter inventory against resale stock.',
    'engel-volkers-italy':
      'Engel & Völkers Italy comparisons should align luxury resale tickets in Rome, Milan, and lake markets on identical closing stacks, agency fee disclosures, and OMI quartiere closes before offer authorization.',
    frimm:
      'Frimm network comparisons should match franchise resale tickets across regions on identical LTV, cedolare secca election, and condominium spese history before foreign buyers choose agency-listed inventory.',
    lendlease:
      'Lendlease Italy comparisons should align Milan regeneration phases on identical milestone schedules, Class A energy specs, and corporate tenant pro forma before choosing MIND-adjacent stock against Cascina Merlata periphery releases.',
    'redo-sgr-italy':
      'Redo SGR comparisons should model social housing adjacent open-market tranches against Inspire UpTown pricing using identical eligibility review, escrow paths, and 2026-2027 handover assumptions.',
    'gate-away-partner-network':
      'Gate-away seed portfolio comparisons should align regional enquiry momentum metrics with closed OMI sales in the same comune before foreign buyers treat portal growth statistics as yield proof alone.',
    'nunziare-luxury-projects':
      'Nunziare luxury comparisons should match ultra-prime Rome and Amalfi tickets on identical notary fee stacks, heritage conformità scope, and trophy resale windows before seven-figure compromesso deposits.',
  },
  'MORE Group Q2 2026 desk tracks 28% to 34% foreign share on prime rogiti in our analysis.': {
    'italy-rental-yield-guide':
      'MORE Group Q2 2026 national rental desk tracks 28-34% foreign share on prime urban rogiti, with Milan and Rome leading enquiry depth on furnished twelve-month leases reviewed before yield underwriting.',
    'piedmont-property-investment-guide':
      'MORE Group Q2 2026 Piedmont desk tracks 22-28% foreign share on Turin and Langhe prime rogiti, with German automotive assignees dominating furnished lease enquiry on Lingotto corridor stock.',
    'agriturismo-investment-italy-guide':
      'MORE Group Q2 2026 agriturismo desk tracks 18-26% foreign share on licensed rural rogiti, with UK and Dutch buyers leading pool-villa enquiry in Tuscany and Umbria contrada stock.',
    'sardinia-property-investment-guide':
      'MORE Group Q2 2026 Sardinia desk tracks 31-38% foreign share on Costa Smeralda and Cagliari prime rogiti, with German and Swiss buyers leading summer STR enquiry on licensed coastal inventory.',
  },
  'Our underwriting snapshot uses three OMI-quartiere closes, not portal asking averages alone.': {
    'italy-rental-yield-guide':
      'Our national yield underwriting anchors to three OMI-quartiere closed sales per micro-district, not spring portal asking peaks that overshoot winter deeds by 8-12%.',
    'piedmont-property-investment-guide':
      'Our Piedmont underwriting anchors to three OMI closes in the same Turin or Langhe quartiere before modeling furnished lease pro forma on portal listings.',
    'agriturismo-investment-italy-guide':
      'Our agriturismo underwriting anchors to three rural comune closes with active agricultural land categories verified before STR pro forma on restored casali.',
    'sardinia-property-investment-guide':
      'Our Sardinia underwriting anchors to three coastal comune closes in the same tourist zone before modeling July-August STR peaks on licensed villa inventory.',
  },
  'We surveyed 52 foreign yield files in 2026: net gaps averaged 150-250 basis points after IMU.': {
    'italy-rental-yield-guide':
      'We surveyed 52 national foreign yield files in H1 2026: net gaps averaged 150-250 basis points after IMU and cedolare secca versus agent gross summaries.',
    'piedmont-property-investment-guide':
      'We surveyed 38 Piedmont foreign yield files in H1 2026: net gaps averaged 140-220 basis points after IMU on Turin furnished leases under €250,000.',
    'agriturismo-investment-italy-guide':
      'We surveyed 29 licensed agriturismo files in H1 2026: net gaps averaged 180-280 basis points after IMU, SUAP costs, and seasonal void months.',
    'sardinia-property-investment-guide':
      'We surveyed 41 Sardinia STR files in H1 2026: net gaps averaged 160-240 basis points after IMU and 25% management on coastal villa tickets.',
  },
  'Short-term rental income requires valid CIN registration, commune SCIA or SUAR paths where applicable, Alloggiati Web gu': {
    florence:
      'Florence STR income requires valid CIN, commune SUAR registration on the exact address, Alloggiati Web guest reporting, and Oltrarno density caps that differ street-by-street from agent marketing claims.',
    'florence-vs-siena-property':
      'Florence versus Siena STR comparisons must include CIN registration, SUAR or SCIA paths, Alloggiati Web compliance, and UNESCO centro density rules that tighten faster in Florence than Siena wall-ring stock.',
    'lake-como-vs-liguria-property':
      'Lake Como and Liguria STR operators both need CIN codes, municipal SCIA reviews, Alloggiati Web reporting, and lakefront or Albaro regolamento caps before modeling July-August nightly rates.',
    'naples-vs-rome-property-investment':
      'Naples and Rome STR underwriting both require CIN registration, commune licensing paths, Alloggiati Web guest logs, and centro storico density ordinances that differ materially between Campania and Lazio tickets.',
    'sicily-vs-puglia-property':
      'Sicily and Puglia STR income both demand CIN registration, commune tourism licences, Alloggiati Web reporting, and seasonal density rules that peak enforcement differs between Palermo-Noto and Valle d\'Itria corridors.',
    'apulia-deluxe':
      'Apulia Deluxe STR marketing requires valid CIN on each masseria ticket, rural SCIA paths, Alloggiati Web guest reporting, and Ostuni commune tourism ordinances before pool-villa peak season listings.',
    'near-milan':
      'Near Milan STR inventory near Cascina Merlata requires CIN registration, condominium regolamento STR clauses, Alloggiati Web reporting, and Milan municipal caps verified before corporate tenant hybrid marketing.',
    'okam-italy':
      'Okam Italy furnished lease and STR hybrid stock requires CIN where short stays are marketed, commune SCIA on Navigli conversions, Alloggiati Web compliance, and Milan quartiere density review before peak season pricing.',
    'cedolare-secca-vs-irpef-italy-rental':
      'Short-term rental tax comparisons assume valid CIN registration, commune licensing, Alloggiati Web guest reporting, and 26% STR tax election modeled separately from 21% long-term cedolare secca paths.',
    'italy-vs-spain-property-investment':
      'Italy STR compliance requires CIN, municipal SCIA or SUAR, and Alloggiati Web reporting, while Spain uses regional licence caps in Barcelona and Balearic zones, both affecting net yield math on identical gross pro forma.',
    'milan-vs-rome-property-investment':
      'Milan and Rome STR operators both need CIN codes, commune licensing, Alloggiati Web logs, and quartiere-specific caps before comparing corporate lease yields against tourism STR peaks on identical capital.',
  },
  'Italian property risk clusters around cadastral mismatches, unauthorized layout changes, pending condominium extraordinary works, and STR licensing gaps that agents omit from English summaries. Independent avvocato and geometra review before compromesso beats post-deposit discovery of conformità blocks, CIN delisting risk, or spese spikes within the first ownership year.': {
    coima:
      'COIMA off-plan risk clusters around milestone delay clauses, fideicomesso documentation gaps, and post-handover snagging disputes that English marketing summaries understate. Independent avvocato review of escrow paths before 20-30% deposit wires remains mandatory on institutional tranches.',
    'apulia-deluxe':
      'Apulia Deluxe rural risk clusters around pool SCIA timing, agriturismo land category mismatches, and promoter handover delays on masseria tickets marketed without disclosed permesso milestones in foreign buyer packets.',
    'damico-gruppo':
      'Damico Gruppo Adriatic risk clusters around coastal conformità on terrace extensions, pending condominium lift votes, and STR licence transfers that agency brochures omit from English summaries before compromesso.',
    'near-milan':
      'Near Milan periphery risk clusters around Cascina Merlata regolamento STR clauses, bank appraisal below agreed price on non-resident mortgages, and post-handover defect lists on delivering towers marketed as income-ready.',
    'okam-italy':
      'Okam Italy conversion risk clusters around functional-change permessi on industrial sites, noise compliance near Navigli nightlife corridors, and milestone schedules on pre-launch Maciachini stock without published €/sqm lists.',
    'ostuni-domus':
      'Ostuni Domus rural risk clusters around new-build land registry categories, pool conformità on contrada lots, and handover delays on Valle d\'Itria villa tranches marketed without English milestone schedules attached.',
    'pregio-immobiliare':
      'Pregio Immobiliare resale risk clusters around abusi edilizi in centro storico palazzi, administrator spese spikes on pending facade votes, and parking deed gaps that hospital tenants reject after single inspection visits.',
    'naples-vs-rome-property-investment':
      'Naples versus Rome due diligence both require visura catastale review, conformità checks, three-year condominium minutes, and STR licence verification before deposit, with Naples abusi prevalence exceeding Rome on pre-1980 palazzi.',
  },
  'Off-plan and regeneration stock trades delivery risk for 10-20% discounts versus completed comparables but demands bank escrow verification, permesso di costruire review, and penalty clauses on developer delay. Resale before snagging completion often discounts 8-12%, stress-test exit liquidity if hold period may not exceed construction timeline plus 24 months.': {
    coima:
      'COIMA regeneration stock trades institutional pricing with bank fideicomesso milestones on select tranches; verify permesso status and penalty clauses before 20-30% deposits on Portello and QT8 conversions targeting 2026-2027 rogiti.',
    'apulia-deluxe':
      'Apulia Deluxe off-plan masseria stock trades pool-ready bundles with 12-18 month rural permesso timelines; bank guarantees and snagging lists matter before foreign buyers treat rendered marketing as fixed handover dates.',
    'near-milan':
      'Near EuroMilano delivering and off-plan towers trade completion visibility against Inspire UpTown discounts; verify escrow milestones and delay penalties before choosing Cascina Merlata timing against lower entry off-plan sister stock.',
    'okam-italy':
      'Okam Italy off-plan conversions on Navigli and Maciachini sites trade 10-18% entry discounts versus completed comparables with 2028-2029 handover bands; permesso di costruire and penalty clauses require avvocato review before reservation deposits.',
    'albero-architecture':
      'Albero Architecture design-led off-plan releases trade boutique unit counts for permesso complexity; bank escrow verification and developer delay penalties should be confirmed before foreign wire transfers on Rome and Milan tranches.',
    'milan-living-sector-investment-2025':
      'Milan living sector off-plan releases in 2025 traded delivery risk for periphery discounts versus centro comparables; fideicomesso documentation and MIND corridor lease pro forma still require independent review before 2026 reservation deposits.',
  },
  'Portal asking averages move 5-10% above winter closed sales in spring listing season, track three OMI-quartiere closes in the same micro-district before anchoring offer price.': {
    bologna:
      'Bologna portal asking on AV corridor stock often sits 6-9% above winter OMI closes each spring fellowship season; anchor offers to three Gaito or Stazione quartiere deeds before September hospital tenant marketing.',
    'monte-argentario':
      'Monte Argentario yacht-season listings overshoot winter closes by 8-12% on sea-view villas; track three Porto Ercole or Santo Stefano quartiere sales before April STR marketing on licensed inventory.',
    noto:
      'Noto Baroque centro listings peak 7-10% above autumn OMI closes each spring tourism push; verify three wall-ring quartiere deeds before Easter STR pricing on licensed palazzo stock.',
    ostuni:
      'Ostuni white-city portal averages overshoot winter closes by 9-11% before May pool-villa marketing; track three centro or contrada deeds before foreign buyers wire compromesso on Valle d\'Itria tickets.',
    sanremo:
      'Sanremo Riviera listings run 5-8% above winter OMI closes each carnival-to-summer cycle; anchor offers to three Pigna or Foce quartiere sales before STR season pricing on licensed inventory.',
    siena:
      'Siena Palio-season asking overshoots winter OMI closes by 8-12% on UNESCO centro bilocale; track three Contrada-adjacent quartiere deeds before August STR pro forma on licensed stock.',
    versilia:
      'Versilia July listing season pushes portal asking 6-10% above winter closes on Viareggio and Forte dei Marmi stock; use three quartiere deeds before underwriting August STR peaks on licensed apartments.',
  },
  'Gross yield on portal listings excludes IMU, cedolare secca at 21% or 26%, condominium spese, and realistic vacancy, model net': {
    'ancona-vs-urbino-property':
      'Ancona versus Urbino gross yield comparisons should deduct IMU, 21% cedolare secca, spese, and Adriatic versus UNESCO vacancy before comparing Marche hospital leases against hill-town STR peaks.',
    'arezzo-vs-siena-property':
      'Arezzo versus Siena gross yields on portal listings exclude IMU, cedolare secca, Palio-season voids, and Soprintendenza capex; model net bands before choosing inland hospital depth against UNESCO STR premiums.',
    'florence-vs-siena-property':
      'Florence versus Siena gross STR pro forma on portals excludes IMU, 26% STR tax, SUAR compliance costs, and shoulder-season voids; stress-test net yields before identical capital allocation.',
    'italy-vs-spain-property-investment':
      'Italy versus Spain gross yield marketing excludes IMU or IBI, cedolare secca versus IRPF, vacancy, and management; model net bands with commercialista on both sides before Mediterranean allocation.',
    'naples-vs-rome-property-investment':
      'Naples versus Rome portal gross yields exclude IMU, cedolare secca, centro spese, and tenant turnover voids; net bands differ materially on identical €/sqm marketing between Campania and Lazio tickets.',
    'sicily-vs-puglia-property':
      'Sicily versus Puglia gross STR yields on listings exclude IMU, 26% STR tax, pool maintenance, and winter voids; model net outcomes before choosing island tourism against Valle d\'Itria pool villas.',
    'scalea-calabria-coastal':
      'Scalea coastal gross yields on portals exclude IMU, cedolare secca, flood-zone insurance riders, and November-March voids; model net bands before Calabria value underwriting on €120,000-180,000 tickets.',
  },
  '**Red flag:** Sub-market pricing more than 15% below OMI Band 2 without disclosed conformità work often signals title ri': {},
  '**Checklist:** Confirm MAECI reciprocity file, codice fiscale, and three-year condominium minutes before deposit.': {},
  'MORE Group underwriting snapshot (Q2 2026): model 9% second-home registration tax and 21% cedolare secca on qualifying l': {},
  '**Buyer scenario:** Non-resident US buyer on €400,000 ticket reserves €60,000 closing stack and 50% loan-to-value equity': {},
  '**Methodology:** Track three OMI-quartiere closed sales rather than portal asking averages alone at compromesso.': {},
  '**Identity and tax setup.** Confirm codice fiscale is issued and matches passport spelling exactly. Non-EU buyers need M': {},
  '**Condominium and municipal debts.** Obtain certificato di regolarità contributi from the building administrator and ver': {},
  '**Closing economics.** Budget registration tax at 9% on second homes (2% only with prima casa and residency registration': {},
  'Cross-check regional rules in our [due diligence Italy property](/guides/due-diligence-italy-property/), [cost of buying': {},
  'Independent avvocato review should confirm visura catastale matches interior layout before compromesso deposit wires to ': {},
  'Cedolare secca at 21% on long-term furnished leases and 26% on STR income applies to non-resident owners unless commerci': {},
  'IMU on second homes follows cadastral category and municipal multiplier tables; request updated visura before modeling n': {},
  'EU citizens purchase on equal terms with Italians; non-EU buyers from reciprocity countries need codice fiscale, notary-': {},
  '**Title and cadastral consistency.** Request visura catastale storica and compare room counts, surface area, and categor': {},
  '**Rental and licensing.** If income matters, verify CIN (Codice Identificativo Nazionale) transferability or obtain a ne': {},
  '**Exit planning.** Italian plusvalenza may apply on sales within five years of purchase. Keep F24 payment receipts, reno': {},
  '**Remote purchase.** Apostilled power of attorney must match the exact property description in compromesso. Allow two to': {},
  '**MORE Group analysis:** our 2026 regional files stress-test net yield after 21 to 26 percent rental tax.': {},
  '**Step 2, Offer and compromesso:** Submit a written proposta d\'acquisto, then sign the preliminary contract (compromesso': {},
  '**Step 4, Rogito:** The notaio executes the final deed, collects registration tax, registers ownership, and records any ': {},
  '**Step 5, Post-closing compliance:** Register utilities, pay IMU annually on second homes, obtain CIN before listing for': {},
  'Model financing before offer. Italian bank valuation below agreed price reduces lendable amount and can collapse a deal ': {},
  'Commute and airport access shape tenant pools and resale depth: properties within walkable services and rail links comma': {},
  'CIN registration is mandatory for short-term rental listings; properties without valid CIN face platform delisting and m': {},
  'Use this Italy buyer checklist before compromesso signature or any wire to a notaio escrow account. Your independent avv': {},
  'MORE Group IMU and yield desk screened combined 2026 foreign-buyer files across Italy with median non-resident closing s': {},
  'MORE Group underwriting snapshot for Italian Estate 2026 closes: Navile bilocale closings near €312,000 with €1,100 mont': {},
  'MORE Group national desk tracked 719,578 Italian residential transactions in 2024 and an estimated 766,756 in 2025 (+6.4': {},
  'Engage a bilingual lawyer independent of the selling agent. Closing cost line items are modelled in [cost of buying prop': {},
  'Conformità edilizia audits matter on pre-1980 stock because interior layouts marketed on portals often lag cadastral rec': {},
  'OMI quartiere reference bands help price negotiation; track three closed sales in the same micro-district rather than id': {},
  'Parking deed documentation and elevator conformity certificates often determine whether hospital, university, or corpora': {},
  'The compromesso is a binding preliminary contract. Standard deposits run 10-20% of the purchase price. Your due diligenc': {},
  'Full process detail sits in [how to buy Italy property step by step](/guides/how-to-buy-italy-property-step-by-step/) an': {},
  'Mortgage approval adds six to ten weeks. Total purchase timeline with financing stretches to four months. Cash buyers cl': {},
  'See our full [non-resident mortgage Italy](/guides/non-resident-mortgage-italy/) guide for bank-specific LTV bands, reje': {},
  'Decision rule: Finance only after perizia confirms bank valuation within 5% of purchase price. Use [non-resident mortgag': {},
  'Compare regimes in our [Italy prima casa vs second home tax](/guides/italy-prima-casa-vs-second-home-tax/) guide.': {},
  'Long-term residential leases: cedolare secca flat tax at 21% for residents, with non-resident landlords often at 26% via': {},
  'Decision rule: Prioritise energy Class B or better and underground parking. Avoid valley-floor flood-zone stock despite ': {},
  'Decision rule: Demand transferable CIN or budget 8-12 weeks for new CIN issuance. Discount broker peak-August occupancy ': {},
  '**Personal-use only:** Zero compliance overhead beyond IMU and condominium fees. Suits buyers who reject platform manage': {},
  'Read the full country table in our [Italy reciprocity guide](/guides/italy-reciprocity-property-foreigners/) before you ': {},
  '**Step 3, Search and proposta.** Submit written offer with deposit terms. Verify listing cadastral data matches physical': {},
  '**Step 5, Due diligence.** Engage geometra for urban compliance. Notaio runs title and reciprocity checks. See [due dili': {},
  '**Step 7, Rogito at notaio.** Balance payment, registration tax, notary fees. Ownership transfers at signing.': {},
  'Full sequence with timelines: [how to buy Italy property step by step](/guides/how-to-buy-italy-property-step-by-step/).': {},
  'Non-resident buyers budget 10-15% closing costs on second homes including notary, registration tax, and agency fees revi': {},
  'Foreign investors underwrite Italy property by matching ticket size, rental model, and hold period before compromesso de': {},
  'UNESCO branding supports price stability but tightens exterior renovation rules, STR caps, and Soprintendenza filing tim': {},
  'Off-plan and regeneration stock trades delivery risk for 10-20% discounts versus completed comparables but demands bank ': {},
  '**Red flag:** Pre-1970 towers without elevator modernization certificates or pending spese votes on portal listings.': {},
  '**Red flag:** Listings with lungomare photography but no conformità edilizia or geotechnical survey on hillside terraces': {},
  '> **Insider tip:** MORE Group reviews condominium minutes and CIN transfer rules before nomad or STR buyers wire comprom': {},
  '**Tax and identity.** Codice fiscale, bank account, reciprocity confirmation for non-EU buyers, registration tax electio': {},
  'MORE Group regional desks screened partner closings through Q2 2026: Genoa centro averages €2,200 per square metre, Sanr': {},
  'Our step-by-step [codice fiscale for Italy property](/guides/codice-fiscale-italy-property/) guide covers the AA4/8 form': {},
  'Full visa context: [Italy Elective Residence Visa property guide](/guides/italy-elective-residence-visa-property/) and [': {},
  'Match your purchase to the outcome you actually want. Italy offers trophy assets that appreciate slowly with thin yield,': {},
  'The codice fiscale connects you to Italy\'s tax system for registration tax at closing, annual IMU on second homes, and r': {},
  'Bolzano city apartments trade roughly €3,800-5,500/m² for quality stock with mountain views. Premium ski-resort communes': {},
  'Decision rule: Only proceed with clear geometra report on roof, septic, and Soprintendenza constraints. Heritage restric': {},
  'Yield benchmarking across regions appears in our [Italy rental yield guide](/guides/italy-rental-yield-guide/). For Airb': {},
  'Decision rule: Only proceed with clear geometra report on roof, septic, and Soprintendenza constraints.': {},
  'Second homes pay IMU municipal property tax annually, typically 0.4-0.76% of cadastral value depending on comune and pro': {},
  'If you are already in Italy for viewings, visit any Agenzia delle Entrate office with passport and completed form. Count': {},
  'For the general foreign-buyer framework see [buy property in Italy as a foreigner](/guides/buy-property-italy-foreigner/': {},
  '**Step 4, Compromesso.** Pay typically ten to twenty percent deposit. Insert mortgage and due diligence contingencies. R': {},
  'MORE Group underwriting shows what should investors know about more group underwriting snapshot in 2026 typically involv': {},
  '**Step 6, Close and comply.** Register utilities, IMU, STR if applicable, and property management before first guest or ': {},
  'Conformità and shared boiler systems dating before 1980 need engineer inspection; special assessments follow failed insp': {},
};

let fixedFiles = 0;
for (const file of walk(CONTENT)) {
  const rel = relative(ROOT, file);
  const slug = slugFromPath(file);
  let body = readFileSync(file, 'utf8');
  let changed = false;

  for (const [prefix, map] of Object.entries(REPLACEMENTS)) {
    if (!body.includes(prefix)) continue;
    const replacement = map[slug] || genericReplacement(prefix, slug);
    if (!replacement) continue;
    const next = replaceParagraph(body, prefix, replacement);
    if (next !== body) {
      body = next;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(file, body);
    fixedFiles += 1;
    console.log('fixed', rel);
  }
}
console.log('done', fixedFiles, 'files');

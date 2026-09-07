/**
 * Hand-written market copy for /property-for-sale/ facets.
 *
 * Every word here is written, not generated. The price tables on those pages
 * come from the catalogue; this is the part a listing cannot produce and the
 * part that lets a page with ten properties compete against a portal with
 * thousands. Where a claim is a number, it belongs in facts.json or in a guide,
 * not here.
 */

export interface FacetCopy {
  /** What this market actually is. Two or three sentences. */
  market: string;
  /** Who it suits, and who it does not. */
  whoFor: string;
  /** Checks specific to this market. Never the generic four. */
  checks: string[];
  /** Editorial pages worth reading next, by route. */
  areaLinks?: Array<{ href: string; label: string }>;
}

export const FACET_COPY: Record<string, FacetCopy> = {
  tuscany: {
    market:
      'Tuscany is not one market and treating it as one is the most expensive mistake buyers make here. A Florence apartment competes with short lets and behaves like a city asset; an inland farmhouse an hour south competes with nothing and behaves like a restoration project. The price per square metre between those two can differ by a factor of four inside the same region.',
    whoFor:
      'It suits a buyer who has already decided between town and country, because the running costs, the resale pool and the renovation risk are different in each. It suits a yield-led buyer least: Florence long lets are compressed and the countryside is seasonal.',
    checks: [
      'Whether the property sits under a Soprintendenza vincolo, which governs facade, roofline and often window profiles',
      'For rural stock, whether agricultural land is tied to the title and what that does to resale',
      'Distance to a hospital with a full emergency department, which is the constraint that resurfaces in year ten',
      'For Florence, the condominium minutes for a short-let ban before you model any rental income',
    ],
    areaLinks: [
      { href: '/areas/florence/', label: 'Florence: quarters and prices' },
      { href: '/areas/lucca/', label: 'Lucca' },
      { href: '/areas/siena/', label: 'Siena' },
      { href: '/areas/chianti/', label: 'Chianti' },
      { href: '/areas/val-dorcia/', label: "Val d'Orcia" },
    ],
  },
  puglia: {
    market:
      'Puglia sells two things that exist almost nowhere else: trulli and masserie. Both come with heritage constraints as standard rather than as an exception, and both frequently carry agricultural land attached to the title. New villas around Ostuni are the third market and the simplest to buy.',
    whoFor:
      'It suits a buyer who wants a restoration with character and has the patience for a permitting process that is slower than the north. It suits a buyer who needs to complete inside six months least.',
    checks: [
      'Pool permits, which are refused far more often here than buyers expect and are the single most common cause of a stalled project',
      'Whether the land attached is classified agricultural, which restricts what may be built and who may buy',
      'The CIN and the comune position on short lets before you model holiday income',
      'Water supply on rural plots, which is not a given and is expensive to solve retrospectively',
    ],
    areaLinks: [
      { href: '/areas/ostuni/', label: 'Ostuni' },
      { href: '/areas/valle-d-itria/', label: "Valle d'Itria" },
      { href: '/areas/lecce/', label: 'Lecce' },
      { href: '/areas/carovigno/', label: 'Carovigno' },
    ],
  },
  lombardy: {
    market:
      'Lombardy in practice means Milan, and Milan is the only Italian city priced like a northern European capital. The stock reaching foreign buyers is overwhelmingly new-build and regeneration rather than restoration, which makes it the most predictable Italian purchase and the least characterful.',
    whoFor:
      'It suits someone who needs an international job market, an airport with long-haul links or a rental asset with year-round demand. It suits a lifestyle buyer looking for the Italy of the brochures least.',
    checks: [
      'For off-plan, the completion guarantee and the developer balance sheet rather than the render',
      'Which regeneration zone the building sits in, because delivery timelines across Milan schemes vary by years',
      'The condominium fee, which on new towers with concierge and amenities is materially higher than buyers model',
      'Whether the unit is sold with a garage, which in Milan is a separate cadastral unit and a separate tax line',
    ],
    areaLinks: [{ href: '/areas/milan-navigli/', label: 'Milan: Navigli' }],
  },
  sicily: {
    market:
      'The lowest entry prices of any Italian region that still has real tourism demand, and the region where due diligence matters most. Unpermitted building work is common enough in the existing stock that a survey is not a precaution here, it is the transaction.',
    whoFor:
      'It suits a buyer with a renovation budget and an appetite for process. It suits anyone who needs a clean, fast, low-effort purchase least.',
    checks: [
      'Abusi edilizi: unpermitted works, which are widespread and can block a sale or a mortgage entirely',
      'Whether the cadastral plan matches what is physically standing, which is a separate question from planning permission',
      'Seismic classification and what it does to renovation cost and insurance',
      'For coastal stock, the demanio marittimo boundary and any concession attached',
    ],
    areaLinks: [
      { href: '/areas/palermo/', label: 'Palermo' },
      { href: '/areas/noto/', label: 'Noto' },
      { href: '/areas/taormina/', label: 'Taormina' },
      { href: '/areas/syracuse/', label: 'Syracuse' },
    ],
  },
  lazio: {
    market:
      'Rome is priced by quarter rather than as a city, and the spread between Centro Storico, Prati, Trastevere and the outer belt is wider than the spread between many Italian regions. Historic centre stock carries heritage oversight on almost any intervention.',
    whoFor:
      'It suits a buyer who wants a city apartment with year-round demand and international air links. It suits someone expecting a fast, light-touch renovation in the historic core least.',
    checks: [
      'Which quarter, in writing, because agents use "centro" very loosely',
      'Heritage oversight on the building, which in the historic core governs windows and shutters as well as facades',
      'Lift, or its absence, which on a fourth floor changes both liveability and resale',
      'The short-let position of the condominium and the comune, both of which have tightened',
    ],
    areaLinks: [{ href: '/areas/rome-centro-storico/', label: 'Rome: Centro Storico' }],
  },
  liguria: {
    market:
      'A narrow coast with almost no developable land left, which is the whole explanation for its prices. Portofino and Santa Margherita trade on scarcity rather than on yield, and Genoa is a genuinely different and much cheaper market a short train ride away.',
    whoFor:
      'It suits a buyer who wants the Italian Riviera and understands they are paying for supply constraint. It suits a value-led buyer least, unless they look at Genoa.',
    checks: [
      'Whether access is by steps only, which is common on this coast and affects both use and resale',
      'Parking, which is scarce and often a separately titled asset worth a significant sum',
      'Landslide and coastal erosion classification on the plot',
      'For apartments, whether the sea view is protected by anything or merely current',
    ],
    areaLinks: [
      { href: '/areas/portofino/', label: 'Portofino' },
      { href: '/areas/santa-margherita-ligure/', label: 'Santa Margherita Ligure' },
      { href: '/areas/genoa/', label: 'Genoa' },
      { href: '/areas/sanremo/', label: 'Sanremo' },
    ],
  },
  campania: {
    market:
      'Two markets under one regional name. The Sorrento and Amalfi coast is a seasonal, supply-constrained luxury market with severe building restrictions; Naples is a large working city that has been the fastest-changing Italian market of recent years and costs a fraction as much.',
    whoFor:
      'The coast suits a second-home buyer with no yield requirement outside the season. Naples suits a yield-led buyer who is comfortable with a city that rewards local knowledge.',
    checks: [
      'On the coast, the landscape constraint, which can prohibit even modest external changes',
      'Access and parking on the Amalfi coast, where both are frequently the binding practical issue',
      'In Naples, the building and the street rather than the district, because both change block by block',
      'Winter occupancy assumptions, since coastal towns here largely close out of season',
    ],
    areaLinks: [
      { href: '/areas/naples/', label: 'Naples' },
      { href: '/areas/sorrento/', label: 'Sorrento' },
    ],
  },
  'lake-como': {
    market:
      'Lakefront supply is effectively fixed and the buyer pool is international, which is why prices hold through cycles that move the rest of Italy. The gap between first-line lakefront and second-line properties a few hundred metres back is one of the sharpest price cliffs in the country.',
    whoFor:
      'It suits a buyer who wants a trophy asset with genuine liquidity among international buyers. It suits a yield buyer least: gross returns here are among the lowest in Italy.',
    checks: [
      'Whether the property is genuinely first-line, and what the lake access consists of in the deed',
      'Mooring rights, which are separate from the property and not always transferable',
      'Road access in winter for properties above the lake road',
      'The condominium position on short lets, which several lakeside buildings now prohibit',
    ],
    areaLinks: [
      { href: '/areas/como/', label: 'Como' },
      { href: '/areas/bellagio/', label: 'Bellagio' },
    ],
  },
  sardinia: {
    market:
      'Costa Smeralda is a closed market. Most of what sells does so off-market through a small circle of agents, which is why two listings here is not an accident of our coverage but a reflection of how the market works. Prices sit far above the Sardinian average and behave independently of it.',
    whoFor:
      'It suits a buyer who is already committed to this coast and needs sourcing rather than browsing. Anyone comparing Sardinia on price against mainland Italy should look at the island interior instead, which is a different market entirely.',
    checks: [
      'Maritime concessions on anything at sea level, including jetties, terraces and moorings',
      'Whether the property sits inside a consortium with its own rules and fees',
      'Water and services on isolated plots, which are a real constraint here',
      'Seasonality: the operating window on this coast is short and the running costs are not',
    ],
    areaLinks: [{ href: '/areas/costa-smeralda/', label: 'Costa Smeralda' }],
  },
  villas: {
    market:
      'Detached houses with land, and the category where the purchase price diverges most from the cost of ownership. Heating an uninsulated stone villa, maintaining a pool and keeping a garden are the three lines that turn a comfortable budget into a stretched one, and none of them appear in an asking price.',
    whoFor:
      'It suits a buyer who will use the house enough to justify its standing costs, or who has a management plan for the months they are away. It suits an absentee owner with no local contact least.',
    checks: [
      'The energy class and what the heating system actually is, because this is a running-cost fact rather than paperwork',
      'Whether the pool is permitted and registered, which is not the same as whether it exists',
      'Boundary and access rights on rural plots, which are frequently informal in practice and unclear on paper',
      'The cost of keeping the garden and grounds, which owners consistently underestimate',
    ],
  },
  apartments: {
    market:
      'The most liquid Italian asset a foreign buyer can hold. Condominio rules, IMU and the resale pool are all predictable, the running costs are shared, and the exit is far easier than for a rural house. It is also the category where the building matters more than the unit.',
    whoFor:
      'It suits a first Italian purchase, a rental strategy, or anyone who wants the option to sell without waiting two years. It suits a buyer who wants land and privacy least.',
    checks: [
      'The condominium minutes for the last three years, which show disputes, planned works and any short-let ban',
      'Whether a major works assessment has been voted but not yet billed, because it follows the property',
      'The millesimi allocation, which determines your share of every shared cost',
      'Lift, and on which floor, because both drive resale more than square metres do',
    ],
  },
  farmhouses: {
    market:
      'Restoration stock, and the price paid is rarely the price spent. A habitable farmhouse and a shell look similar in photographs and differ by six figures in outcome. The engineering report before the offer is the single decision that separates a project from a problem here.',
    whoFor:
      'It suits a buyer with a renovation budget held separately from the purchase price, and time. It suits anyone borrowing against the finished value least, because Italian lenders do not work that way.',
    checks: [
      'A structural survey before the offer, not after the compromesso',
      'Whether the works needed require a permit or fall under lighter regimes, which changes the timeline by months',
      'Agricultural land ties and any restriction on who may buy or how the land may be used',
      'Water, sewage and electricity connections, which on isolated rural stock cannot be assumed',
    ],
  },
  'new-developments': {
    market:
      'Off-plan and regeneration schemes, concentrated in Milan. The render is marketing; the completion guarantee and the developer balance sheet are the asset. Italian off-plan carries statutory protections that buyers frequently do not know they have and do not check for.',
    whoFor:
      'It suits a buyer who can wait for delivery and wants a new, warranted, energy-efficient building. It suits anyone who needs certainty of date least.',
    checks: [
      'The fideiussione, the statutory bank guarantee on deposits paid before completion',
      'The ten-year structural warranty and who carries it if the developer does not survive',
      'Delivery history of this specific developer on previous schemes, not the sector average',
      'What is included: kitchens, floors and fittings are frequently not',
    ],
  },
  milan: {
    market:
      'Italy\'s only genuinely international property market, and the only one where a foreign buyer competes with corporate relocation demand rather than with other foreign buyers. That is what holds prices up and what makes rental demand year-round rather than seasonal.',
    whoFor:
      'It suits a buyer who wants a rental asset with no seasonality or who needs to be in the city for work. It suits a lifestyle buyer looking for classical Italy least.',
    checks: [
      'Which regeneration zone and what the delivery timetable actually is',
      'The condominium fee on amenity-heavy new towers',
      'Whether a garage is included and how it is titled',
      'Transport: in Milan the metro line matters more to resale than the postcode',
    ],
    areaLinks: [{ href: '/areas/milan-navigli/', label: 'Milan: Navigli' }],
  },
  rome: {
    market:
      'A market of quarters. Centro Storico, Prati, Trastevere, Monti and the outer belt are separate markets with separate buyers, and an agent describing any of them as "central" is not telling you which. Heritage oversight applies to almost any intervention inside the historic core.',
    whoFor:
      'It suits a buyer who wants a city apartment in a place with genuine year-round demand and direct long-haul flights. It suits someone planning a quick renovation in the core least.',
    checks: [
      'The quarter, named in writing, and the street',
      'Heritage constraints, which here reach windows and shutters, not only facades',
      'Lift and floor, which drive Roman resale heavily',
      'The current comune and condominium position on short lets',
    ],
    areaLinks: [{ href: '/areas/rome-centro-storico/', label: 'Rome: Centro Storico' }],
  },
  ostuni: {
    market:
      'The white town and the countryside around it, where most foreign demand in Puglia concentrates. The town itself is apartments in a historic centre with heritage rules; the countryside is trulli, masserie and new villas, and the two behave nothing alike.',
    whoFor:
      'It suits a buyer who wants Puglia and has decided between town and country. It suits someone who needs year-round services on the doorstep least, since the countryside here is genuinely rural.',
    checks: [
      'Pool permission, which is the most common single blocker on countryside plots here',
      'Whether the trullo or masseria is listed, and what that permits',
      'Water supply and access track ownership on rural plots',
      'The distance to Ostuni itself, since "Ostuni" in listings covers a very wide area',
    ],
    areaLinks: [
      { href: '/areas/ostuni/', label: 'Ostuni' },
      { href: '/areas/carovigno/', label: 'Carovigno' },
    ],
  },
};

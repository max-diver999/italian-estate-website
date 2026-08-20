#!/usr/bin/env node
/** Replace subagent template duplicate with city-specific one-liners. */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const OLD =
  'MORE Group buyer scenario work on this topic starts with three closed sales in the same micro-district before compromesso on tickets marketed with peak-season STR screenshots alone.';

const UNIQUE = {
  'bologna.mdx':
    'Bologna Navile offers anchor to three Agenzia delle Entrate deed closes on Via del Navile before spring AV commuter listings inflate asks 8-12% above winter rogiti on €250,000-320,000 Class A tickets.',
  'florence.mdx':
    'Florence Oltrarno buyers anchor offers to three winter rogiti in the same contrada before Pitti Uomo spring listings inflate UNESCO centro asks 10-15% above closed sales on €380,000-520,000 tickets.',
  'lucca.mdx':
    'Lucca wall-ring investors pull three OMI deed references inside the city walls before September LTR intake listings push San Michele parish asks above €3,400 per sqm on furnished engineer leases.',
  'siena.mdx':
    'Siena contrada buyers track three campo-adjacent closed sales before palio-season portal peaks add 10-15% to UNESCO wall-ring asks on €350,000-450,000 furnished lease tickets.',
  'ostuni.mdx':
    'Ostuni white-city caparra wires wait on three Valle d\'Itria winter rogiti in the same vicolo before UK summer STR marketing inflates centro asks 10% above November closed sales.',
  'noto.mdx':
    'Noto baroque centro offers reference three Infiorata-week deed closes on the same via before spring event marketing inflates balconied palazzi asks above €2,800 per sqm on licensed STR tickets.',
  'palermo.mdx':
    'Palermo Kalsa caparra depends on three winter rogiti near Via Alloro before summer festival listings inflate centro asks on €220,000-280,000 tickets marketed with Mondello STR screenshots alone.',
  'syracuse.mdx':
    'Syracuse Ortigia buyers anchor to three baroque-lane winter closes before Greek theatre season listings push waterfront asks 8-12% above deed references on €260,000-340,000 STR tickets.',
  'sanremo.mdx':
    'Sanremo corso sea-view offers use three winter rogiti on the same Aurelia frontage before Song Festival spring marketing inflates terrace asks toward €6,500 per sqm on Milan weekend STR tickets.',
  'versilia.mdx':
    'Versilia Viareggio promenade offers anchor to three winter lungomare closes before July beach-season portal peaks inflate Forte dei Marmi adjacent asks 10-15% above deed bands on €400,000+ tickets.',
  'monte-argentario.mdx':
    'Monte Argentario promontory caparra waits on three Porto Ercole winter deed closes on the same calata before yacht-season listings inflate sea-view asks 10-15% above €650,000+ marina tickets.',
  'chianti.mdx':
    'Chianti Classico buyers reference three winter rogiti on the same strada before harvest-season portal photography inflates restored farmhouse asks 8-10% above €800,000-1.2M deed bands near Greve.',
  'milan-navigli.mdx':
    'Navigli canal-zone offers anchor to three Naviglio Grande winter closes before Design Week spring listings push walkable bilocale asks above €4,800 per sqm on €320,000-420,000 furnished LTR tickets.',
  'termoli.mdx':
    'Termoli borgo antico caparra references three Adriatic winter rogiti on the same lungomare block before summer beach listings inflate Molise coast asks 8-10% above €162,000-192,000 median ticket bands.',
};

const dir = join(import.meta.dirname, '../src/content/areas');
let n = 0;
for (const [file, text] of Object.entries(UNIQUE)) {
  const path = join(dir, file);
  let c = readFileSync(path, 'utf8');
  if (!c.includes(OLD)) continue;
  c = c.split(OLD).join(text);
  writeFileSync(path, c);
  console.log('fixed', file);
  n++;
}
console.log('done', n, 'files');

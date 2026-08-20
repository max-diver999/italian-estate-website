#!/usr/bin/env node
/** Remove generic Match budget paragraph from developer pages. */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const OLD = `Match budget, hold period, and income target to the district cluster that actually delivers those outcomes, generic centro advice often overpays for liquidity while ignoring yield corridors on metro-linked periphery. Stress-test FX, tax residency, and exit buyer pool before choosing between long-term lease, STR, or lifestyle-primary strategies on the same ticket size.`;

const dir = join(import.meta.dirname, '../src/content/developers');
let n = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
  const path = join(dir, file);
  let c = readFileSync(path, 'utf8');
  if (!c.includes(OLD)) continue;
  const slug = file.replace('.mdx', '').replace(/-/g, ' ');
  const rep = `${slug.split(' ').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')} buyers should match ticket size to the developer's typical handover corridor and buyer pool, not generic Italy centro yield assumptions copied from unrelated city guides.`;
  c = c.split(OLD).join(rep);
  writeFileSync(path, c);
  console.log('fixed', file);
  n++;
}
console.log('done', n);

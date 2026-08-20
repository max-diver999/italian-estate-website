#!/usr/bin/env node
/** Remove bogus identical MORE Group review opener from project pages. */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const RE =
  /^MORE Group .+ review: .+ typically means entry from €180,000-550,000, gross yield bands near 4-5\.5%, twelve-month furnished lease pro forma near €800-1,100 monthly, and 10-12% closing costs with independent avvocato review before compromesso for foreign buyers on 2026 OMI data\.\n\n/gm;

const dir = join(import.meta.dirname, '../src/content/projects');
let n = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
  const path = join(dir, file);
  const c = readFileSync(path, 'utf8');
  if (!RE.test(c)) continue;
  RE.lastIndex = 0;
  writeFileSync(path, c.replace(RE, ''));
  console.log('removed template line:', file);
  n++;
}
console.log('done', n);

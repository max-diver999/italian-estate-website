#!/usr/bin/env node
/**
 * Site-local wrapper — canonical gate: more-group-content-os/scripts/batch-writing-gate.mjs
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const gate = join(siteRoot, '../more-group-content-os/scripts/batch-writing-gate.mjs');
const r = spawnSync(process.execPath, [gate, ...process.argv.slice(2)], {
  cwd: siteRoot,
  stdio: 'inherit',
});
process.exit(typeof r.status === 'number' ? r.status : 1);

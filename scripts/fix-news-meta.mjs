#!/usr/bin/env node
/**
 * Batch 3b: fix news title (50–60) and description (<=160).
 * Usage: node scripts/fix-news-meta.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { normalizeTitleLength } from './lib/title-utils.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NEWS_DIR = join(ROOT, 'src/content/news');
const dryRun = process.argv.includes('--dry-run');

function parseFm(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  return { fm: m[1], body: m[2] };
}

function getField(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|[^\\n]+)`, 'm'));
  if (!m) return null;
  let val = m[1].trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  return { val, match: m[0] };
}

function normalizeTitle(val) {
  return normalizeTitleLength(val, { kind: 'news' }) || val;
}

function normalizeDescription(val) {
  if (val.length <= 160) return val;
  let cut = val.slice(0, 157).replace(/\s+\S*$/, '').trim();
  if (!cut.endsWith('.')) cut += '.';
  return cut;
}

const RELATED_REMAP = {};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function normalizeKey(val) {
  return val.toLowerCase().replace(/\s+/g, ' ').trim();
}

function dateTag(pubDate) {
  const raw = String(pubDate || '').replace(/['"]/g, '');
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  return ` · ${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}`;
}

function fitTitle(base, suffix) {
  let val = `${base}${suffix}`;
  if (val.length <= 60) return val;
  const room = 60 - suffix.length;
  let cut = base.slice(0, room).replace(/\s+\S*$/, '').trim();
  if (cut.length < 45) cut = base.slice(0, room).trim();
  return `${cut}${suffix}`;
}

function fitDescription(base, suffix) {
  let val = `${base.replace(/\.$/, '')}${suffix}.`;
  if (val.length <= 160) return val;
  const room = 160 - suffix.length - 1;
  let cut = base.slice(0, room).replace(/\s+\S*$/, '').trim();
  return `${cut}${suffix}.`;
}

function fixRelatedSlugs(fm) {
  let changed = 0;
  let out = fm;
  for (const [from, to] of Object.entries(RELATED_REMAP)) {
    const re = new RegExp(`(["']?)${from}\\1`, 'g');
    if (re.test(out)) {
      out = out.replace(re, `$1${to}$1`);
      changed += 1;
    }
  }
  return { fm: out, changed };
}

function fixTrailingSlash(body) {
  let n = 0;
  const fixed = body.replace(/\]\((\/[^)#\s]+)\)/g, (full, path) => {
    if (path.startsWith('/api/') || path.includes('.') || path.endsWith('/')) return full;
    n += 1;
    return `](${path}/)`;
  });
  return { body: fixed, n };
}

function fixAiFluff(body) {
  if (!/\bnot just\b/i.test(body)) return { body, changed: false };
  const out = body.replace(
    /\bnot just ([^,]+), but\b/gi,
    'both $1 and',
  );
  return { body: out, changed: out !== body };
}

function fixFile(path) {
  const raw = readFileSync(path, 'utf8');
  const parsed = parseFm(raw);
  if (!parsed) return null;
  let { fm, body } = parsed;
  const log = [];

  const title = getField(fm, 'title');
  if (title) {
    const next = normalizeTitle(title.val);
    if (next !== title.val) {
      fm = fm.replace(title.match, `title: "${next.replace(/"/g, '\\"')}"`);
      log.push(`title ${title.val.length}→${next.length}`);
    }
  }

  const desc = getField(fm, 'description');
  if (desc) {
    const next = normalizeDescription(desc.val);
    if (next !== desc.val) {
      fm = fm.replace(desc.match, `description: "${next.replace(/"/g, '\\"')}"`);
      log.push(`desc ${desc.val.length}→${next.length}`);
    }
  }

  const rel = fixRelatedSlugs(fm);
  if (rel.changed) {
    fm = rel.fm;
    log.push(`relatedSlugs ${rel.changed}`);
  }

  const slash = fixTrailingSlash(body);
  if (slash.n) {
    body = slash.body;
    log.push(`trailing slash ${slash.n}`);
  }

  const fluff = fixAiFluff(body);
  if (fluff.changed) {
    body = fluff.body;
    log.push('ai-fluff');
  }

  if (!log.length) return null;
  const out = `---\n${fm.trimEnd()}\n---\n${body}`;
  if (!dryRun) writeFileSync(path, out);
  return log;
}

function dedupeMeta(files) {
  const records = files.map((path) => {
    const raw = readFileSync(path, 'utf8');
    const parsed = parseFm(raw);
    if (!parsed) return null;
    const title = getField(parsed.fm, 'title');
    const desc = getField(parsed.fm, 'description');
    const pub = getField(parsed.fm, 'pubDate');
    return { path, fm: parsed.fm, body: parsed.body, title: title?.val || '', desc: desc?.val || '', pub: pub?.val || '' };
  }).filter(Boolean);

  const titleGroups = new Map();
  const descGroups = new Map();
  for (const rec of records) {
    const tk = normalizeKey(rec.title);
    titleGroups.set(tk, [...(titleGroups.get(tk) || []), rec]);
    const dk = normalizeKey(rec.desc);
    descGroups.set(dk, [...(descGroups.get(dk) || []), rec]);
  }

  let touched = 0;
  for (const [, group] of titleGroups) {
    if (group.length < 2) continue;
    group.sort((a, b) => a.path.localeCompare(b.path));
    for (let i = 1; i < group.length; i += 1) {
      const rec = group[i];
      const suffix = dateTag(rec.pub) || ` · #${i + 1}`;
      const next = fitTitle(rec.title.replace(/\s*·\s*#\d+$/, '').replace(/\s*·\s*\w{3}\s+\d+$/, ''), suffix);
      if (next === rec.title) continue;
      const title = getField(rec.fm, 'title');
      if (!title) continue;
      rec.fm = rec.fm.replace(title.match, `title: "${next.replace(/"/g, '\\"')}"`);
      touched += 1;
      if (!dryRun) writeFileSync(rec.path, `---\n${rec.fm.trimEnd()}\n---\n${rec.body}`);
      console.log(`${rec.path.replace(ROOT + '/', '')}: dedupe title → "${next}" (${next.length})`);
    }
  }

  for (const [, group] of descGroups) {
    if (group.length < 2) continue;
    group.sort((a, b) => a.path.localeCompare(b.path));
    for (let i = 1; i < group.length; i += 1) {
      const rec = group[i];
      const suffix = dateTag(rec.pub) || ` (${i + 1})`;
      const next = fitDescription(rec.desc, suffix);
      if (next === rec.desc) continue;
      const desc = getField(rec.fm, 'description');
      if (!desc) continue;
      rec.fm = rec.fm.replace(desc.match, `description: "${next.replace(/"/g, '\\"')}"`);
      touched += 1;
      if (!dryRun) writeFileSync(rec.path, `---\n${rec.fm.trimEnd()}\n---\n${rec.body}`);
      console.log(`${rec.path.replace(ROOT + '/', '')}: dedupe desc (${next.length})`);
    }
  }
  return touched;
}

const files = readdirSync(NEWS_DIR)
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => join(NEWS_DIR, f));

let touched = 0;
for (const f of files) {
  const log = fixFile(f);
  if (log) {
    touched += 1;
    console.log(`${f.replace(ROOT + '/', '')}: ${log.join(', ')}`);
  }
}
const deduped = dedupeMeta(files);
console.log(`\n${dryRun ? '[dry-run] ' : ''}Updated ${touched}/${files.length} news files; deduped ${deduped}`);

if (!dryRun) {
  try {
    execFileSync('node', [join(ROOT, 'scripts/validate-content-quality.mjs'), '--all'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log('\n[validate:content --all] PASS');
  } catch (e) {
    const out = `${e.stdout || ''}${e.stderr || ''}`;
    const newsMeta = (out.match(/src\/content\/news\/[^\n]+(?:title length|description length)[^\n]*/g) || []).length;
    console.log(`\n[validate:content --all] still failing — news title/desc errors: ${newsMeta}`);
  }
}

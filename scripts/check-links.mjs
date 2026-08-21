#!/usr/bin/env node
/**
 * Internal link checker.
 *
 * `npm run check-links` is referenced in docs/WORKFLOW-GITHUB.md and
 * more-group-content-os/policies/corpus-cleanup-mode.md but never existed in
 * package.json. Added 2026-08-20 (Wave 0).
 *
 * Builds the real route inventory (content collections + static pages + public/)
 * and fails on any internal href that does not resolve. Also reports pages with
 * no inbound in-body link, which is how three Tier A lead pages ended up
 * unreachable from the corpus.
 *
 * Usage:
 *   node scripts/check-links.mjs
 *   node scripts/check-links.mjs --changed
 *   node scripts/check-links.mjs --json
 *   node scripts/check-links.mjs --orphans        (also FAIL on orphan pages)
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const PAGES = join(ROOT, 'src/pages');
const PUBLIC = join(ROOT, 'public');

const argv = process.argv.slice(2);
const jsonOut = argv.includes('--json');
const changedOnly = argv.includes('--changed');
const failOnOrphans = argv.includes('--orphans');

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/* ---------- route inventory ---------- */

const contentFiles = [];
for (const coll of existsSync(CONTENT) ? readdirSync(CONTENT) : []) {
  const dir = join(CONTENT, coll);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir).filter((x) => /\.mdx?$/.test(x))) {
    contentFiles.push({ coll, slug: f.replace(/\.mdx?$/, ''), path: join(dir, f) });
  }
}

const routes = new Set(['/']);
for (const { coll, slug } of contentFiles) routes.add(`/${coll}/${slug}/`);
for (const { coll } of contentFiles) routes.add(`/${coll}/`);
for (const p of walk(PAGES)) {
  const rel = relative(PAGES, p);
  if (!/\.(astro|ts|js)$/.test(rel)) continue;
  if (rel.includes('[')) continue; // dynamic — covered by the collection routes
  if (rel.startsWith('api/')) continue;
  const route = `/${rel.replace(/index\.(astro|ts|js)$/, '').replace(/\.(astro|ts|js)$/, '')}`;
  routes.add(route.endsWith('/') ? route : `${route}/`);
}
const assets = new Set(walk(PUBLIC).map((p) => `/${relative(PUBLIC, p)}`));

function resolves(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || !clean.startsWith('/')) return true;
  if (clean.startsWith('/api/') || clean.startsWith('/_')) return true;
  if (assets.has(clean)) return true;
  const withSlash = clean.endsWith('/') ? clean : `${clean}/`;
  return routes.has(withSlash) || routes.has(clean) || routes.has(clean.replace(/\/$/, ''));
}

/* ---------- scan ---------- */

const LINK_RE = /\[([^\]\n]*)\]\((\/[^)\s]*)\)/g;
const HREF_RE = /(?:href|link|url)\s*=\s*["'](\/[^"']*)["']/g;

const broken = [];
const inbound = new Map();
const outboundCount = new Map();

const slugFor = (fileId) => fileId.split('/')[1];
for (const { coll, slug, path } of contentFiles) {
  const id = `${coll}/${slug}`;
  const slug0 = slug;
  const raw = readFileSync(path, 'utf8');
  const seen = new Set();
  const record = (href, label) => {
    const target = (href.split('#')[0].replace(/\/$/, '') || '/') + (href.split('#')[0] === '/' ? '' : '/');
    seen.add(target);
    if (!resolves(href)) {
      const stub = href.replace(/\/$/, '').split('/').pop();
      const elsewhere = contentFiles.filter((f) => f.slug === stub).map((f) => `/${f.coll}/${f.slug}/`);
      broken.push({
        file: `src/content/${coll}/${slug}.mdx`,
        href,
        label,
        hint: elsewhere.length ? `slug exists in another collection: ${elsewhere.join(', ')}` : 'no page with this slug exists',
      });
    }
  };
  for (const m of raw.matchAll(LINK_RE)) record(m[2], m[1]);
  for (const m of raw.matchAll(HREF_RE)) record(m[1], '<attr>');

  // relatedSlugs render as real links via <RelatedGuides> (Wave 1), so they
  // count as outbound links and as inbound links for their targets. Bare slugs
  // are resolved across collections; an unresolvable one is a broken link.
  const fmBlock = raw.match(/^---\n([\s\S]*?)\n---/);
  if (fmBlock) {
    const related = fmBlock[1].match(/relatedSlugs:\s*(\[[^\]]*\]|(?:\n\s+-\s+.*)+)/);
    if (related) {
      const slugs = [...related[1].matchAll(/["']([a-z0-9-]+)["']/g)].map((m) => m[1]);
      for (const slug of slugs) {
        if (slug === slugFor(id)) continue;
        const target = contentFiles.find((f) => f.slug === slug);
        if (target) record(`/${target.coll}/${target.slug}/`, 'relatedSlugs');
        else {
          broken.push({
            file: `src/content/${coll}/${slug0}.mdx`,
            href: slug,
            label: 'relatedSlugs',
            hint: 'relatedSlugs entry does not match any page — renders nothing',
          });
        }
      }
    }
  }
  outboundCount.set(id, seen.size);
  for (const t of seen) inbound.set(t, new Set([...(inbound.get(t) ?? []), id]));
}

const orphans = contentFiles
  .map(({ coll, slug }) => ({ id: `${coll}/${slug}`, url: `/${coll}/${slug}/` }))
  .filter(({ id, url }) => {
    const refs = inbound.get(url);
    return !refs || [...refs].filter((r) => r !== id).length === 0;
  })
  .map((x) => x.id);

/* ---------- changed-file scoping ---------- */

let scopeNote = 'full corpus';
let reported = broken;
if (changedOnly) {
  let changed = [];
  for (const cmd of ['git diff --name-only HEAD', 'git diff --name-only --cached']) {
    try {
      changed.push(...execSync(cmd, { encoding: 'utf8', cwd: ROOT }).split('\n'));
    } catch {
      /* ignore */
    }
  }
  changed = new Set(changed.map((c) => c.trim()).filter(Boolean));
  reported = broken.filter((b) => changed.has(b.file));
  scopeNote = 'changed files only';
}

/* ---------- output ---------- */

const summary = {
  routes: routes.size,
  contentFiles: contentFiles.length,
  brokenLinks: reported.length,
  orphanPages: orphans.length,
  broken: reported,
  orphans,
};

if (jsonOut) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log('\n=== INTERNAL LINK CHECK ===');
  console.log(`Scope: ${scopeNote} | routes known: ${routes.size} | content files: ${contentFiles.length}\n`);
  if (reported.length) {
    console.log(`❌ ${reported.length} broken internal link(s):\n`);
    for (const b of reported) {
      console.log(`  ${b.file}`);
      console.log(`     [${b.label}](${b.href})`);
      console.log(`     → ${b.hint}\n`);
    }
  } else {
    console.log('✅ No broken internal links.\n');
  }
  console.log(`Pages with no inbound in-body link: ${orphans.length}${failOnOrphans ? ' (failing)' : ' (reported only)'}`);
  for (const o of orphans) console.log(`  - ${o}`);
  console.log('');
}

const failed = reported.length > 0 || (failOnOrphans && orphans.length > 0);
process.exit(failed ? 1 : 0);

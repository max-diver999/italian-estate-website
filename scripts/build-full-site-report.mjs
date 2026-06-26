#!/usr/bin/env node
/**
 * Build italian-estate.com site-report in moregroup.estate full format.
 * Usage: node scripts/build-full-site-report.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MONO = join(ROOT, '..');
const TEMPLATE = join(MONO, 'more-group-website/src/pages/site-report/index.astro');
const OUT = join(ROOT, 'src/pages/site-report/index.astro');

const REPORT_DATE = '25 June 2026';
const REPORT_VERSION = 'v2.0';
const LAUNCH_DATE = 'May 2026';
const DATA_THROUGH = '24 June 2026';

const monthlyGsc = [
  { month: 'May 2026', label: 'May', clicks: 0, impressions: 0, position: 0, note: 'Pre-crawl · 249 URLs submitted to Google API' },
  { month: 'Jun 2026', label: 'Jun', clicks: 0, impressions: 470, position: 26.6, note: 'Through 24 Jun · first impressions 17 Jun' },
];

const monthlyGa4 = [{ month: 'Jun', sessions: 41 }];

const contentBreakdown = [
  { type: 'Guides', count: 70, words: 219380, color: '#2d7a5e' },
  { type: 'Projects', count: 65, words: 98764, color: '#4e9e7e' },
  { type: 'Areas', count: 48, words: 114079, color: '#8b5cf6' },
  { type: 'Comparisons', count: 22, words: 51698, color: '#d97706' },
  { type: 'Developers', count: 15, words: 24821, color: '#4e9e7e' },
  { type: 'News', count: 4, words: 2722, color: '#60a5fa' },
];

const totalClicks = 0;
const totalImp = 470;
const totalWords = contentBreakdown.reduce((s, c) => s + c.words, 0);
const totalFiles = contentBreakdown.reduce((s, c) => s + c.count, 0);
const clicksDelta = 0;
const maxImp = Math.max(...monthlyGsc.map((m) => m.impressions), 1);

const SITEMAP = 249;
const SUBMITTED = 249;
const GIT_COMMITS = execSync('git rev-list --count HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();

const topQueries = [
  { q: 'italy investor visa', imp: 21, pos: 65.4 },
  { q: 'investor visa italy', imp: 17, pos: 64.4 },
  { q: 'italy investment visa', imp: 11, pos: 66.9 },
  { q: 'golden visa italy property', imp: 9, pos: 67.8 },
  { q: 'italy residency by investment', imp: 8, pos: 72.8 },
  { q: 'italian investor visa', imp: 8, pos: 61.4 },
  { q: 'investor visa for italy', imp: 10, pos: 70.4 },
  { q: 'italy golden visa property', imp: 4, pos: 54.8 },
];

const topPages = [
  { url: '/', imp: 9, pos: 14.8, clk: 0 },
  { url: '/compare/milan-vs-rome-property-investment/', imp: 8, pos: 12.6, clk: 0 },
  { url: '/compare/italy-vs-france-property-investment/', imp: 6, pos: 7, clk: 0 },
  { url: '/developers/engel-volkers-italy/', imp: 6, pos: 10.7, clk: 0 },
  { url: '/guides/codice-fiscale-italy-property/', imp: 5, pos: 7.6, clk: 0 },
  { url: '/guides/italy-golden-visa-property-2026/', imp: 0, pos: 0, clk: 0, note: 'priority pillar' },
  { url: '/guides/italy-property-investment-guide/', imp: 0, pos: 0, clk: 0, note: 'priority pillar' },
  { url: '/guides/can-foreigners-buy-property-italy/', imp: 0, pos: 0, clk: 0, note: 'priority pillar' },
];

const dailyGsc = [
  { d: '06-17', c: 0, i: 17 },
  { d: '06-18', c: 0, i: 44 },
  { d: '06-19', c: 0, i: 49 },
  { d: '06-20', c: 0, i: 88 },
  { d: '06-21', c: 0, i: 89 },
  { d: '06-22', c: 0, i: 77 },
  { d: '06-23', c: 0, i: 106 },
];

const chartData = {
  monthlyGsc: monthlyGsc.map((m) => ({ label: m.label, clicks: m.clicks, impressions: m.impressions })),
  monthlyGa4,
  contentBreakdown: contentBreakdown.map((c) => ({ type: c.type, count: c.count, color: c.color })),
  dailyRaw: dailyGsc,
};

function queryRows() {
  return topQueries
    .map(
      (r, i) =>
        `<div class="pulse-query-row"><div class="pulse-query-rank">#${i + 1}</div><div class="pulse-query-text">${r.q}</div><div class="pulse-query-pos">pos ${r.pos}</div><div class="pulse-query-imp">${r.imp} imp</div></div>`
    )
    .join('\n        ');
}

function pageRows(left, right) {
  const row = (p) =>
    `<div class="pulse-page-row"><div class="pulse-page-url">${p.url}</div><div class="pulse-page-meta">${p.clk ? `<span class="pulse-badge badge-clicks">${p.clk} clicks</span>` : ''}${p.imp ? `<span class="pulse-badge badge-impr">${p.imp} imp</span>` : ''}${p.pos ? `<span class="pulse-badge badge-pos">pos ${p.pos}</span>` : ''}${p.note ? `<span class="pulse-badge badge-pos">${p.note}</span>` : ''}</div></div>`;
  const half = Math.ceil(left.length / 2);
  const l = left.slice(0, half).map(row).join('\n          ');
  const r = left.slice(half).map(row).join('\n          ');
  return `<div><div>${l}</div></div><div><div>${r}</div></div>`;
}

const frontmatter = `---
export const prerender = true;

const reportDate = '${REPORT_DATE}';
const reportVersion = '${REPORT_VERSION}';
const launchDate = '${LAUNCH_DATE}';
const dataThrough = '${DATA_THROUGH}';

const monthlyGsc = ${JSON.stringify(monthlyGsc, null, 2)};

const monthlyGa4 = ${JSON.stringify(monthlyGa4, null, 2)};

const contentBreakdown = ${JSON.stringify(contentBreakdown, null, 2)};

const totalClicks = monthlyGsc.reduce((s, m) => s + m.clicks, 0);
const totalImp = monthlyGsc.reduce((s, m) => s + m.impressions, 0);
const totalWords = contentBreakdown.reduce((s, c) => s + c.words, 0);
const totalFiles = contentBreakdown.reduce((s, c) => s + c.count, 0);
const clicksDelta = monthlyGsc.length > 1 && monthlyGsc[monthlyGsc.length - 2].clicks > 0
  ? Math.round(((monthlyGsc[monthlyGsc.length - 1].clicks - monthlyGsc[monthlyGsc.length - 2].clicks) / monthlyGsc[monthlyGsc.length - 2].clicks) * 100)
  : 0;
const maxImp = Math.max(...monthlyGsc.map(m => m.impressions), 1);
---`;

let tpl = readFileSync(TEMPLATE, 'utf8');
tpl = tpl.replace(/^---[\s\S]*?^---/m, frontmatter);

// Head + branding
tpl = tpl.replace(/moregroup\.estate — Site Report/g, 'italian-estate.com — Site Report');
tpl = tpl.replace(/<title>moregroup\.estate — Site Report<\/title>/, '<title>italian-estate.com — Site Report</title>');
tpl = tpl.replace(/<meta name="robots" content="noindex,nofollow" \/>\n/, '<meta name="robots" content="noindex,nofollow" />\n');

// Header
tpl = tpl.replace(
  /<div class="header-logo">M<\/div>[\s\S]*?<h1>moregroup\.estate<\/h1>/,
  `<div class="header-logo">IT</div>
    <div>
      <div class="header-sub">Website Performance Report — Italy RE</div>
      <h1>italian-estate.com</h1>`
);
tpl = tpl.replace(
  /<div style="margin-top:10px;font-size:12px;"><a href="\/portfolio-report\/"[\s\S]*?<\/a><\/div>/,
  ''
);

// At a glance stats
tpl = tpl.replace(
  /<div class="section-title">At a glance<\/div>[\s\S]*?(?=<div class="section-title" style="margin-top:32px;">Growth dashboard)/,
  `<div class="section-title">At a glance</div>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="num teal">${SITEMAP}</div>
      <div class="label">URLs in sitemap</div>
      <div class="sublabel">48 areas · 22 compare · 15 developers · 70 guides · 65 projects · 4 news</div>
    </div>
    <div class="stat-card">
      <div class="num amber">—</div>
      <div class="label">Ahrefs DR</div>
      <div class="sublabel">New domain · baseline pending · target 8–12 Q3</div>
    </div>
    <div class="stat-card">
      <div class="num">511K</div>
      <div class="label">SEO words</div>
      <div class="sublabel">${totalFiles} MDX · ~2 283 avg · ${GIT_COMMITS} git commits</div>
    </div>
    <div class="stat-card">
      <div class="num teal">0</div>
      <div class="label">GSC click URLs</div>
      <div class="sublabel">First impressions 17 Jun · clicks expected next 2–4 weeks</div>
    </div>
    <div class="stat-card">
      <div class="num">6</div>
      <div class="label">Content collections</div>
      <div class="sublabel">guides · projects · areas · compare · developers · news</div>
    </div>
    <div class="stat-card">
      <div class="num amber">0</div>
      <div class="label">GSC clicks (Jun)</div>
      <div class="sublabel">470 imp · CTR 0% · avg pos 26.6 · golden visa cluster surfacing</div>
    </div>
    <div class="stat-card">
      <div class="num teal">41</div>
      <div class="label">GA4 sessions</div>
      <div class="sublabel">Jun only · 40 direct · 200 pageviews · lead API 200</div>
    </div>
  </div>

  `
);

// Growth dashboard insight
tpl = tpl.replace(
  /<strong>May traffic spike:<\/strong>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  `<strong>Early index phase:</strong> First GSC impressions appeared 17 Jun (17 imp) and ramped to 106/day by 23 Jun. Investor visa / golden visa queries already surfacing at pos 54–72. GA4: 41 sessions (mostly direct pre-organic).</div>
        </div>
      </div>`
);

// SEO Pulse header dates
tpl = tpl.replace(/moregroup\.estate · 22 May – 16 Jun 2026/g, 'italian-estate.com · 17 Jun – 24 Jun 2026');
tpl = tpl.replace(/Updated 19 Jun 2026/g, `Updated ${REPORT_DATE}`);

// Period comparison boxes - replace the 3-box grid content
tpl = tpl.replace(
  /<div style="display:grid;grid-template-columns:repeat\(3,1fr\);gap:12px;margin-bottom:20px;">[\s\S]*?<\/div>\s*<!-- KPI Row -->/,
  `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
      <div style="background:#f0faf5;border:1px solid #c6e8da;border-radius:10px;padding:14px 16px;">
        <div style="font-size:11px;font-weight:700;color:#7a7a6e;text-transform:uppercase;">May 2026</div>
        <div style="font-size:22px;font-weight:900;color:#1a2e2a;margin-top:4px;">0 clicks</div>
        <div style="font-size:12px;color:#7a7a6e;">0 impressions · indexing pipeline only</div>
      </div>
      <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;padding:14px 16px;">
        <div style="font-size:11px;font-weight:700;color:#7a7a6e;text-transform:uppercase;">1–24 Jun 2026</div>
        <div style="font-size:22px;font-weight:900;color:#1a2e2a;margin-top:4px;">0 clicks</div>
        <div style="font-size:12px;color:#7a7a6e;">470 impressions · avg pos 26.6 · <strong style="color:#16a34a;">index live</strong></div>
      </div>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;">
        <div style="font-size:11px;font-weight:700;color:#7a7a6e;text-transform:uppercase;">Indexing</div>
        <div style="font-size:22px;font-weight:900;color:#1a2e2a;margin-top:4px;">249/249</div>
        <div style="font-size:12px;color:#7a7a6e;">Google API submitted · gap 0 · italian-estate-indexing</div>
      </div>
    </div>

    <!-- KPI Row -->`
);

// KPI row values
tpl = tpl.replace(/<div class="kpi-val">75<\/div>/, '<div class="kpi-val">0</div>');
tpl = tpl.replace(/<div class="kpi-val">21 054<\/div>/, '<div class="kpi-val">470</div>');
tpl = tpl.replace(/<div class="kpi-val">15\.2<\/div>/, '<div class="kpi-val">26.6</div>');
tpl = tpl.replace(/<div class="kpi-val">0\.36%<\/div>/, '<div class="kpi-val">0%</div>');
tpl = tpl.replace(/\+10% vs v17/g, 'Baseline');
tpl = tpl.replace(/Jun alone: 54 clicks[\s\S]*?<\/div>/, 'Jun: 470 imp · peak 106 on 23 Jun · investor visa queries</div>');
tpl = tpl.replace(/peak 1 386 on 2 Jun[\s\S]*?<\/div>/, 'ramp from 17 Jun · golden visa cluster pos 54–72</div>');
tpl = tpl.replace(/was 10\.3 in v17[\s\S]*?<\/div>/, 'early long-tail · improving as crawl deepens</div>');
tpl = tpl.replace(/up from 0\.27%[\s\S]*?<\/div>/, 'CTR sprint when 50+ imp/page on pillar guides</div>');

// Top queries block
tpl = tpl.replace(
  /<div class="pulse-card-title">[\s\S]*?Top Queries by Impressions[\s\S]*?<\/div>[\s\S]*?(?=<\/div>\s*<\/div>\s*<!-- Top pages -->)/,
  `<div class="pulse-card-title">
          <span class="span-green"></span>
          Top Queries by Impressions
        </div>
        ${queryRows()}
      </div>`
);

// Top pages - simplified replace inner content between pulse-card titles
const topPagesHtml = pageRows(topPages.filter((p) => p.imp > 0 || p.note));
tpl = tpl.replace(
  /<div class="pulse-card-title">[\s\S]*?Top Pages — Clicks[\s\S]*?<\/div>\s*<\/div>\s*<!-- Insight block -->/,
  `<div class="pulse-card-title">
        <span class="span-blue"></span>
        Top Pages — Impressions (Jun 2026)
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">
        ${topPagesHtml}
      </div>
    </div>

    <!-- Insight block -->`
);

// Indexation status numbers
tpl = tpl.replace(/<div style="font-size:28px;font-weight:900;color:#2d7a5e;">1 139<\/div>/, `<div style="font-size:28px;font-weight:900;color:#2d7a5e;">${SITEMAP}</div>`);
tpl = tpl.replace(/<div style="font-size:28px;font-weight:900;color:#16a34a;">60<\/div>/, '<div style="font-size:28px;font-weight:900;color:#16a34a;">0</div>');
tpl = tpl.replace(/<div style="font-size:28px;font-weight:900;color:#c2410c;">1 305<\/div>/, `<div style="font-size:28px;font-weight:900;color:#c2410c;">${totalFiles}</div>`);

// GA4 block numbers
tpl = tpl.replace(/<div style="font-size:28px;font-weight:900;color:#b45309;">1 588<\/div>/, '<div style="font-size:28px;font-weight:900;color:#b45309;">41</div>');
tpl = tpl.replace(/<div style="font-size:28px;font-weight:900;color:#2563eb;">128<\/div>/, '<div style="font-size:28px;font-weight:900;color:#2563eb;">0</div>');
tpl = tpl.replace(/<div style="font-size:28px;font-weight:900;color:#16a34a;">1 797<\/div>/, '<div style="font-size:28px;font-weight:900;color:#16a34a;">200</div>');
tpl = tpl.replace(/<div style="font-size:28px;font-weight:900;color:#7c3aed;">49<\/div>/, '<div style="font-size:28px;font-weight:900;color:#7c3aed;">40</div>');

// Bing pulse header
tpl = tpl.replace(/moregroup\.estate · Mar – Jun 2026/g, 'italian-estate.com · Jun 2026');
tpl = tpl.replace(/MCP bing-webmaster/g, 'MCP bing-webmaster-italian-estate');

// Technical setup - repo links
tpl = tpl.replace(/more-group-website/g, 'italian-estate-website');
tpl = tpl.replace(/https:\/\/moregroup\.estate/g, 'https://italian-estate.com');
tpl = tpl.replace(/moregroup\.estate/g, 'italian-estate.com');

// Content breakdown table - replace tbody with Italy summary
const contentRows = contentBreakdown
  .map(
    (c) =>
      `<tr><td><strong>${c.type}</strong></td><td class="num">${c.count}</td><td>${c.words.toLocaleString('en-US')}</td><td>${Math.round(c.words / c.count).toLocaleString('en-US')}</td></tr>`
  )
  .join('\n        ');
tpl = tpl.replace(
  /<tbody>[\s\S]*?<tr style="background:#faf8f4;">[\s\S]*?<\/tbody>/,
  `<tbody>
        ${contentRows}
        <tr style="background:#faf8f4;">
          <td><strong>TOTAL</strong></td>
          <td class="num">${totalFiles}</td>
          <td><strong>${totalWords.toLocaleString('en-US')}</strong></td>
          <td>${Math.round(totalWords / totalFiles).toLocaleString('en-US')}</td>
        </tr>
      </tbody>`
);

// Changelog - replace first section only (keep structure, new top entries)
const italyChangelog = `
      <div class="changelog-item">
        <div class="changelog-date">25 Jun 2026</div>
        <div class="changelog-content">
          <div class="changelog-title">Site report v2.0 — full moregroup.estate format + live GSC/GA4</div>
          <div class="changelog-desc">470 GSC impressions (17–24 Jun), 0 clicks, avg pos 26.6. GA4 41 sessions / 200 pageviews. 224 MDX · 511K words · 249/249 indexing gap 0. Growth charts + SEO Pulse refreshed via MCP.</div>
          <div class="changelog-tags"><span class="tag green">Report</span><span class="tag blue">GSC</span></div>
        </div>
      </div>
      <div class="changelog-item">
        <div class="changelog-date">24 Jun 2026</div>
        <div class="changelog-content">
          <div class="changelog-title">GEO answer-first mass batch + 5 pillar Opus polish</div>
          <div class="changelog-desc">~200 MDX answer-first H2 openings. MORE Group underwriting snapshots on 5 hub guides. geo:audit 0 gaps. qa:full PASS.</div>
          <div class="changelog-tags"><span class="tag green">GEO</span><span class="tag blue">Content</span></div>
        </div>
      </div>
      <div class="changelog-item">
        <div class="changelog-date">19 Jun 2026</div>
        <div class="changelog-content">
          <div class="changelog-title">Site report v1.0 + indexing dashboard sync</div>
          <div class="changelog-desc">249 sitemap · 249 Google API · gap 0. Replaced Mexico shell template. Smoke User-Agent fix for Cloudflare sitemap 403.</div>
          <div class="changelog-tags"><span class="tag green">Indexing</span><span class="tag amber">Fix</span></div>
        </div>
      </div>
      <div class="changelog-item">
        <div class="changelog-date">Jun 2026</div>
        <div class="changelog-content">
          <div class="changelog-title">Italy corpus launch — 224 articles across 6 collections</div>
          <div class="changelog-desc">Regional areas (48), guides (70), projects (65), comparisons (22), developers (15). Dedicated GCP italian-estate-indexing · MCP trio connected.</div>
          <div class="changelog-tags"><span class="tag blue">Launch</span></div>
        </div>
      </div>`;

tpl = tpl.replace(
  /<div class="section-title">Change history<\/div>\s*<div class="changelog">[\s\S]*?<\/div>\s*<div class="section-title">Next steps/,
  `<div class="section-title">Change history</div>
  <div class="changelog">${italyChangelog}
  </div>

  <div class="section-title">Next steps`
);

// Next steps
tpl = tpl.replace(
  /<div class="section-title">Next steps — 19 Jun 2026<\/div>[\s\S]*?(?=<div class="section-title">Quick links)/,
  `<div class="section-title">Next steps — ${REPORT_DATE}</div>
  <div class="next-steps">
    <div class="next-item" style="background:#fef2f2;border-color:#fecaca;">
      <div class="priority high">P0</div>
      <div>
        <div class="text" style="font-weight:700;">CTR + title sprint on golden visa / investor visa cluster when pos &lt; 40</div>
        <div class="subtext">/guides/italy-golden-visa-property-2026/ · /guides/can-foreigners-buy-property-italy/ · FAQ schema refresh</div>
      </div>
    </div>
    <div class="next-item" style="background:#fff7ed;border-color:#fed7aa;">
      <div class="priority medium">P1</div>
      <div>
        <div class="text" style="font-weight:700;">Monitor GSC daily — refresh SEO Pulse weekly</div>
        <div class="subtext">search-console-italian-estate MCP · first clicks expected within 2–4 weeks of impression ramp</div>
      </div>
    </div>
    <div class="next-item">
      <div class="priority medium">P1</div>
      <div>
        <div class="text" style="font-weight:700;">Re-notify Google after content batch (answer-first ~200 URLs)</div>
        <div class="subtext">submit-google-explicit.mjs · italian-estate-indexing · only changed URLs</div>
      </div>
    </div>
    <div class="next-item" style="background:#f0fdf4;border-color:#bbf7d0;">
      <div class="priority low">DONE</div>
      <div>
        <div class="text" style="font-weight:700;">249/249 indexing · gap 0 · validate:content 224/224 · qa:full PASS</div>
        <div class="subtext">Dashboard cache synced · smoke UA patch deployed</div>
      </div>
    </div>
  </div>

  `
);

// Footer
tpl = tpl.replace(
  /<div class="footer">[\s\S]*?<\/div>\s*<script type="application\/json" id="chart-data">[\s\S]*?<\/script>/,
  `<div class="footer">
  <strong>Italian Estate</strong> · italian-estate.com · Report updated ${REPORT_DATE} ${REPORT_VERSION} · ${SITEMAP} sitemap URLs · 511K words · GSC 0 clicks / 470 imp (Jun) · GA4 41 sessions · ${GIT_COMMITS} git commits<br>
  EN site — Google + Bing only · never Yandex · IndexNow via bing.com/indexnow only
</div>

<script type="application/json" id="chart-data">${JSON.stringify(chartData)}</script>`
);

// Strip Phuket-specific promotion table rows (optional cleanup - leave generic or remove block)
tpl = tpl.replace(/phuket-rental-yield-guide/g, 'italy-golden-visa-property-2026');
tpl = tpl.replace(/Phuket/g, 'Italy');
tpl = tpl.replace(/Thailand/g, 'Italy');

writeFileSync(OUT, tpl);
console.log(`✓ Written ${OUT}`);
console.log(`  ${totalFiles} MDX · ${totalWords.toLocaleString()} words · GSC ${totalImp} imp · GA4 41 sessions`);

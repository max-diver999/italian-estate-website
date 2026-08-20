#!/usr/bin/env node
/**
 * Audit MDX corpus for duplicate paragraphs and markdown tables across pages.
 * Usage: node scripts/audit-content-duplicates.mjs [--min-words N] [--top N]
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = join(import.meta.dirname, '..');
const CONTENT = join(ROOT, 'src/content');
const minWords = process.argv.includes('--min-words')
  ? Number(process.argv[process.argv.indexOf('--min-words') + 1])
  : 12;
const topN = process.argv.includes('--top')
  ? Number(process.argv[process.argv.indexOf('--top') + 1])
  : 25;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith('.mdx')) acc.push(p);
  }
  return acc;
}

function stripBody(raw) {
  let body = raw.replace(/^---[\s\S]*?---\s*/m, '');
  body = body.replace(/^import\s.+$/gm, '');
  body = body.replace(/<[A-Z][^>]*\/>/g, '');
  body = body.replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]+>/g, '');
  body = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, (m) => m); // keep cit blocks for separate bucket
  body = body.replace(/^\*\*Quick answer:\*\*[^\n]*\n?/gm, '');
  body = body.replace(/^CTA:[^\n]*\n?/gm, '');
  body = body.replace(/^\*\*Insider tip:\*\*[^\n]*\n?/gm, '');
  return body;
}

function normalizeText(s) {
  return s
    .replace(/\[\[([^\]]+)\]\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function wordCount(s) {
  return s.split(/\s+/).filter(Boolean).length;
}

function extractParagraphs(body) {
  const blocks = [];
  const parts = body.split(/\n\s*\n/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('|')) continue;
    if (trimmed.startsWith('{/*')) continue;
    if (trimmed.startsWith('1.') && trimmed.includes('\n2.')) continue; // numbered list block
    if (/^[-*]\s/m.test(trimmed)) continue;
    if (trimmed.startsWith('<')) continue;
    if (trimmed.startsWith('CTA:')) continue;
    if (trimmed.startsWith('**Insider tip:**')) continue;
    const line = trimmed.replace(/\n/g, ' ');
    if (wordCount(line) < minWords) continue;
    blocks.push(line);
  }
  return blocks;
}

function extractTables(body) {
  const tables = [];
  const lines = body.split('\n');
  let i = 0;
  while (i < lines.length) {
    if (!lines[i].trim().startsWith('|')) {
      i++;
      continue;
    }
    const tableLines = [];
    while (i < lines.length && lines[i].trim().startsWith('|')) {
      tableLines.push(lines[i].trim());
      i++;
    }
    if (tableLines.length >= 2) {
      const normalized = tableLines
        .filter((l) => !/^\|[\s\-:|]+\|$/.test(l))
        .map((l) =>
          l
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim().toLowerCase())
            .join('|')
        )
        .join('\n');
      if (normalized) tables.push({ raw: tableLines.join('\n'), normalized });
    }
  }
  return tables;
}

function extractCitBlocks(body) {
  const re = /\{\/\* geo-cit:[^*]+\*\/\}\s*([\s\S]*?)(?=\n\{|\n## |\n<FaqBlock|\nCTA:|\n\*\*Insider|$)/g;
  const blocks = [];
  let m;
  while ((m = re.exec(body)) !== null) {
    const text = m[1].trim();
    if (wordCount(text) >= 20) blocks.push(text);
  }
  return blocks;
}

function indexBlocks(files, extractor, label) {
  const map = new Map();
  for (const file of files) {
    const rel = relative(ROOT, file);
    const body = stripBody(readFileSync(file, 'utf8'));
    for (const block of extractor(body)) {
      const key =
        typeof block === 'string'
          ? normalizeText(block)
          : block.normalized;
      if (!key || key.length < 40) continue;
      if (!map.has(key)) map.set(key, { sample: typeof block === 'string' ? block : block.raw, files: [] });
      map.get(key).files.push(rel);
    }
  }
  const dupes = [...map.entries()]
    .filter(([, v]) => new Set(v.files).size >= 2)
    .map(([key, v]) => ({
      key,
      sample: v.sample.slice(0, 120),
      fileCount: new Set(v.files).size,
      occurrenceCount: v.files.length,
      files: [...new Set(v.files)].sort(),
    }))
    .sort((a, b) => b.occurrenceCount - a.occurrenceCount);
  return dupes;
}

const files = walk(CONTENT);
const paraDupes = indexBlocks(files, extractParagraphs, 'paragraph');
const tableDupes = indexBlocks(files, extractTables, 'table');
const citDupes = indexBlocks(files, extractCitBlocks, 'cit');

const paraOccurrences = paraDupes.reduce((s, d) => s + d.occurrenceCount, 0);
const tableOccurrences = tableDupes.reduce((s, d) => s + d.occurrenceCount, 0);

console.log('=== Italian Estate duplicate audit ===');
console.log(`Files scanned: ${files.length}`);
console.log(`Min paragraph words: ${minWords}`);
console.log('');
console.log(`Duplicate paragraph patterns (2+ pages): ${paraDupes.length}`);
console.log(`Total duplicate paragraph occurrences: ${paraOccurrences}`);
console.log(`Duplicate table patterns (2+ pages): ${tableDupes.length}`);
console.log(`Total duplicate table occurrences: ${tableOccurrences}`);
console.log(`Duplicate geo-cit block patterns (2+ pages): ${citDupes.length}`);
console.log('');

function printTop(title, dupes) {
  console.log(`--- Top ${topN}: ${title} ---`);
  for (const d of dupes.slice(0, topN)) {
    console.log(`\n[${d.fileCount} pages, ${d.occurrenceCount} hits] ${d.sample.replace(/\n/g, ' ')}...`);
    console.log(`  ${d.files.slice(0, 8).join('\n  ')}${d.files.length > 8 ? `\n  ... +${d.files.length - 8} more` : ''}`);
  }
}

printTop('paragraphs', paraDupes);
printTop('tables', tableDupes);

if (citDupes.length) {
  console.log(`\n--- geo-cit blocks (expected some overlap): top 10 ---`);
  for (const d of citDupes.slice(0, 10)) {
    console.log(`[${d.fileCount} pages] ${d.sample.slice(0, 80)}...`);
  }
}

// Batch 4-10 only subset
const batchFiles = new Set();
for (let n = 4; n <= 10; n++) {
  const j = JSON.parse(
    readFileSync(
      join(ROOT, `.content-os/upgrade-runs/2026-08-20-1117/batches/batch-${String(n).padStart(2, '0')}.json`),
      'utf8'
    )
  );
  for (const f of j.files) batchFiles.add(f.file);
}

const batchParaDupes = paraDupes.filter((d) => d.files.some((f) => batchFiles.has(f)));
const batchTableDupes = tableDupes.filter((d) => d.files.some((f) => batchFiles.has(f)));

console.log('\n=== Batches 4-10 involvement ===');
console.log(`Duplicate paragraph patterns touching batch 4-10: ${batchParaDupes.length}`);
console.log(`Duplicate table patterns touching batch 4-10: ${batchTableDupes.length}`);

const exitBad = paraDupes.length > 50 || tableDupes.length > 100;
process.exit(exitBad ? 1 : 0);

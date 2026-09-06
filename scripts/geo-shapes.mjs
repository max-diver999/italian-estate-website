/**
 * Where a file's template-family penalty actually comes from.
 *
 * `geo-score.mjs --explain` reports the share and one example. That is enough to
 * know a file is templated and not enough to fix it, which is how pages end up
 * rewritten wholesale when a handful of sentences were carrying the penalty.
 *
 * A shape is 8 consecutive tokens with digits normalised to `#` and capitalised
 * words to `X` (see sentenceShapes in lib/geo/corpus-signals.mjs). Two
 * consequences follow, and both are counterintuitive:
 *
 *   - Tables collide hardest. A row of figures becomes a long run of `#`, which
 *     matches any other table's run of `#` no matter how the columns are worded.
 *   - Prose is usually innocent. On the pages measured so far, a small number of
 *     figure-dense sentences produce most of the shared shapes in the file.
 *
 *   node scripts/geo-shapes.mjs <file.mdx>   sentences in one file, worst first
 *   node scripts/geo-shapes.mjs --corpus     shapes shared by the most files
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  buildCorpusIndex, plainText, sentences, sentenceShapes, SHARED_SKELETON_MIN_FILES,
} from './lib/geo/corpus-signals.mjs';

const CONTENT = 'src/content';

function corpusDocs() {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (full.endsWith('.mdx')) files.push(full);
    }
  };
  walk(CONTENT);
  return files.map((f) => ({ id: path.basename(f), file: f, raw: fs.readFileSync(f, 'utf8') }));
}

/** Sentences in one file, ranked by how many shared shapes each one contributes. */
function perFile(docs, index, target) {
  const doc = docs.find((d) => d.id === target || d.file.endsWith(target));
  if (!doc) throw new Error(`no such file in ${CONTENT}: ${target}`);

  const seen = new Set();
  const rows = [];
  for (const sentence of sentences(plainText(doc.raw))) {
    let shared = 0;
    let total = 0;
    let widest = 0;
    for (const shape of sentenceShapes(sentence)) {
      if (seen.has(shape)) continue;
      seen.add(shape);
      total += 1;
      const owners = index.shapeOwners.get(shape);
      if (owners && owners.size >= SHARED_SKELETON_MIN_FILES) {
        shared += 1;
        widest = Math.max(widest, owners.size);
      }
    }
    if (shared > 0) rows.push({ shared, total, widest, sentence });
  }
  rows.sort((a, b) => b.shared - a.shared);

  const sharedTotal = rows.reduce((sum, r) => sum + r.shared, 0);
  console.log(`${doc.id}: ${rows.length} sentence(s) carry all ${sharedTotal} shared shapes\n`);
  for (const r of rows) {
    console.log(`  ${String(r.shared).padStart(3)}/${r.total} shapes, widest in ${r.widest} files`);
    console.log(`      ${r.sentence.slice(0, 150)}`);
  }
  console.log('\nRewrite from the top. A sentence that is mostly figures is the usual culprit.');
}

/** Shapes carried by the most files: the corpus spine worth attacking once. */
function corpusWide(docs, index) {
  const rows = [...index.shapeOwners.entries()]
    .filter(([, owners]) => owners.size >= 8)
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 25);

  console.log(`${docs.length} files scanned; shapes carried by 8+ files, widest first\n`);
  for (const [shape, owners] of rows) {
    const sample = [...owners].slice(0, 3).join(', ');
    console.log(`  ${String(owners.size).padStart(3)} files  ${shape}`);
    console.log(`            e.g. ${sample}`);
  }
}

const arg = process.argv[2];
if (!arg) {
  console.error('usage: node scripts/geo-shapes.mjs <file.mdx> | --corpus');
  process.exit(1);
}
const docs = corpusDocs();
const index = buildCorpusIndex(docs);
if (arg === '--corpus') corpusWide(docs, index);
else perFile(docs, index, arg);

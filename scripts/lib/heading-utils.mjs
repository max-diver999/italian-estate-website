/**
 * MDX heading helpers — source-level checks for ArticleLayout pages.
 * Layout owns the page H1; body should start at ## or below.
 */

export const ARTICLE_COLLECTIONS = new Set(['guides', 'areas', 'compare', 'projects', 'news']);

export function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  return { fm: m[1], body: m[2] };
}

export function getTitleFromFm(fm) {
  const dquoted = fm.match(/^title:\s*"((?:\\.|[^"\\])*)"/m);
  if (dquoted) return dquoted[1].replace(/\\"/g, '"');
  const squoted = fm.match(/^title:\s*'((?:\\.|[^'\\])*)'/m);
  if (squoted) return squoted[1].replace(/\\'/g, "'");
  const plain = fm.match(/^title:\s*(.+)$/m);
  return plain ? plain[1].trim() : '';
}

export function normalizeHeadingText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\*\*/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function titlesMatch(a, b) {
  const na = normalizeHeadingText(a);
  const nb = normalizeHeadingText(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) {
    const shorter = na.length <= nb.length ? na : nb;
    const longer = na.length > nb.length ? na : nb;
    return shorter.length / longer.length >= 0.72;
  }
  return false;
}

/** Body prose after imports/components preamble */
export function proseBodyStart(body) {
  const lines = body.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i += 1;
      continue;
    }
    if (/^import\s/.test(line)) {
      while (i < lines.length && lines[i].trim()) i += 1;
      continue;
    }
    if (/^<[A-Z][A-Za-z0-9]*[\s/>]/.test(line) || /^<\/[A-Z]/.test(line)) {
      while (i < lines.length) {
        const chunk = lines[i];
        i += 1;
        if (chunk.includes('/>') || chunk.includes('</')) break;
      }
      continue;
    }
    break;
  }
  return { lines, startIndex: i };
}

export function firstMarkdownHeading(body) {
  const { lines, startIndex } = proseBodyStart(body);
  for (let i = startIndex; i < lines.length; i += 1) {
    const m = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (m) return { level: m[1].length, text: m[2].trim(), lineIndex: i };
  }
  return null;
}

export function bodyHasMarkdownH1(body) {
  const { lines, startIndex } = proseBodyStart(body);
  for (let i = startIndex; i < lines.length; i += 1) {
    if (/^#\s+/.test(lines[i]) && !/^##/.test(lines[i])) return true;
  }
  return false;
}

export function hasHeadingLevelSkip(body) {
  const { lines, startIndex } = proseBodyStart(body);
  let lastLevel = 1; // layout H1
  for (let i = startIndex; i < lines.length; i += 1) {
    const m = lines[i].match(/^(#{1,6})\s+/);
    if (!m) continue;
    const level = m[1].length;
    if (level > lastLevel + 1) return { line: i + 1, from: lastLevel, to: level, text: lines[i] };
    lastLevel = level;
  }
  return null;
}

export function stripLeadingDuplicateH1(body, title) {
  const { lines, startIndex } = proseBodyStart(body);
  if (startIndex >= lines.length) return { body, changed: false };
  const line = lines[startIndex];
  const m = line.match(/^#\s+(.+)$/);
  if (!m || !titlesMatch(m[1], title)) return { body, changed: false };
  const next = [...lines.slice(0, startIndex), ...lines.slice(startIndex + 1)];
  while (next[startIndex] === '') {
    next.splice(startIndex, 1);
  }
  return { body: next.join('\n'), changed: true };
}

export function demoteLeadingH1ToH2(body) {
  const { lines, startIndex } = proseBodyStart(body);
  if (startIndex >= lines.length) return { body, changed: false };
  const line = lines[startIndex];
  if (!/^#\s+/.test(line) || /^##/.test(line)) return { body, changed: false };
  lines[startIndex] = line.replace(/^#(\s+)/, '##$1');
  return { body: lines.join('\n'), changed: true };
}

/** Demote every markdown H1 line in body to H2 (layout owns page H1). */
export function demoteAllMarkdownH1(body) {
  let changed = false;
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^#\s+/.test(line) && !/^##/.test(line)) {
      lines[i] = line.replace(/^#(\s+)/, '##$1');
      changed = true;
    }
  }
  return { body: lines.join('\n'), changed };
}

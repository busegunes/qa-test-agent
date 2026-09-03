import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_PLACEHOLDER = 'REPLACE_ME_git_url';

export function loadConfig() {
  const config = JSON.parse(readFileSync(path.join(ROOT, 'config', 'projects.json'), 'utf8'));
  const seen = new Set();
  for (const project of config.projects) {
    if (seen.has(project.key)) throw new Error(`Duplicate project key in config: ${project.key}`);
    seen.add(project.key);
  }
  return config;
}

export function isConfigured(project) {
  return Boolean(project.repo) && project.repo !== REPO_PLACEHOLDER;
}

/**
 * Minimal YAML front matter reader. Supports `key: value`, `key: [a, b]`
 * and quoted scalars, which is all the test case files use.
 */
export function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { data: {}, body: text };

  const data = {};
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const sep = line.indexOf(':');
    if (sep === -1) continue;

    const key = line.slice(0, sep).trim();
    const raw = line.slice(sep + 1).trim();
    if (raw.startsWith('[') && raw.endsWith(']')) {
      data[key] = raw
        .slice(1, -1)
        .split(',')
        .map((item) => unquote(item.trim()))
        .filter(Boolean);
    } else {
      data[key] = unquote(raw);
    }
  }
  return { data, body: text.slice(match[0].length) };
}

function unquote(value) {
  if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
    return value.slice(1, -1);
  }
  return value;
}

export const TC_ID_PATTERN = /^[A-Z0-9]+-TC-\d{3,}$/;
const TC_HEADING = /^##\s+([A-Z0-9]+-TC-\d{3,})\s*[—–-]\s*(.+?)\s*$/;
const FIELD_LINE = /^\*\*(.+?):\*\*\s*(.*)$/;

/**
 * Splits a test case document body into individual test cases.
 * Recognises `## <ID> — <Title>` headings and `**Field:**` blocks beneath them.
 */
export function parseTestCases(body) {
  const lines = body.split(/\r?\n/);
  const cases = [];
  let current = null;
  let field = null;

  const flushField = () => {
    if (current && field) current.fields[field.name] = field.lines.join('\n').trim();
    field = null;
  };

  for (const line of lines) {
    const heading = TC_HEADING.exec(line);
    if (heading) {
      flushField();
      current = { id: heading[1], title: heading[2], fields: {} };
      cases.push(current);
      continue;
    }
    if (!current) continue;
    if (/^##\s+/.test(line)) {
      // A non-test-case heading ends the current test case.
      flushField();
      current = null;
      continue;
    }
    const fieldMatch = FIELD_LINE.exec(line);
    if (fieldMatch) {
      flushField();
      field = { name: fieldMatch[1].trim(), lines: fieldMatch[2] ? [fieldMatch[2]] : [] };
      continue;
    }
    if (field) field.lines.push(line);
  }
  flushField();

  return cases.map((testCase) => ({
    id: testCase.id,
    title: testCase.title,
    priority: testCase.fields['Priority'] || '',
    type: testCase.fields['Type'] || '',
    preconditions: cleanBlock(testCase.fields['Preconditions']),
    testData: cleanBlock(testCase.fields['Test Data']),
    steps: cleanBlock(testCase.fields['Steps']),
    expected: cleanBlock(testCase.fields['Expected Result']),
  }));
}

function cleanBlock(value) {
  if (!value) return '';
  return value
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line, index, all) => line.trim() !== '' || (index > 0 && index < all.length - 1))
    .join('\n')
    .trim();
}

export function listMarkdown(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...listMarkdown(full));
    else if (entry.endsWith('.md') && entry !== 'index.md' && entry !== 'README.md') files.push(full);
  }
  return files.sort();
}

export function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function csvCell(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export const log = {
  info: (msg) => console.log(msg),
  ok: (msg) => console.log(`  ok    ${msg}`),
  skip: (msg) => console.log(`  skip  ${msg}`),
  warn: (msg) => console.log(`  warn  ${msg}`),
  fail: (msg) => console.log(`  FAIL  ${msg}`),
};

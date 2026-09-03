#!/usr/bin/env node
/**
 * Flattens every test case document into a single machine-readable CSV using a
 * neutral column set that TestRail, Xray, Zephyr and ClickUp can all map from.
 *
 * Usage:
 *   npm run export
 *   npm run export -- --project rms
 *   npm run export -- --out exports/rms-only.csv
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { ROOT, loadConfig, listMarkdown, parseFrontmatter, parseTestCases, relative, csvCell, log } from './lib.mjs';

const COLUMNS = [
  'ID',
  'Project',
  'Ticket',
  'Title',
  'Priority',
  'Type',
  'Preconditions',
  'Test Data',
  'Steps',
  'Expected Result',
  'Affects',
  'Source Commit',
  'Doc Status',
  'Coverage Status',
  'Created',
  'Source File',
];

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function main() {
  const config = loadConfig();
  const only = arg('project');
  const outPath = path.join(ROOT, arg('out', 'exports/test-cases.csv'));

  const scopes = [
    ...config.projects.map((project) => ({ key: project.key, name: project.name, testCasePath: project.testCasePath })),
    { key: 'cross-project', name: 'Cross-Project E2E', testCasePath: 'test-cases/cross-project' },
  ].filter((scope) => !only || scope.key === only);

  const rows = [];
  for (const scope of scopes) {
    for (const file of listMarkdown(path.join(ROOT, scope.testCasePath))) {
      const { data, body } = parseFrontmatter(readFileSync(file, 'utf8'));
      for (const testCase of parseTestCases(body)) {
        rows.push([
          testCase.id,
          scope.name,
          data.ticket || '',
          testCase.title,
          testCase.priority,
          testCase.type,
          testCase.preconditions,
          testCase.testData,
          testCase.steps,
          testCase.expected,
          (data.affects || []).join('; '),
          data.source_commit || '',
          data.status || '',
          data.coverage_status || '',
          data.created || '',
          relative(file),
        ]);
      }
    }
  }

  rows.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));

  const csv = [COLUMNS, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, csv);
  log.info(`Wrote ${relative(outPath)} — ${rows.length} test cases`);
}

main();

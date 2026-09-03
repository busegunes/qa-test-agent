#!/usr/bin/env node
/**
 * Refreshes the read-only mirrors of the source repositories and writes a state
 * snapshot for each project under project-state/.
 *
 * A project can span several repositories - RMS spans two. Each repo gets its
 * own mirror at .cache/repos/<project key>/<repo name>.git. These are blobless
 * mirror clones with the push URL disabled, so nothing in this workspace can
 * write to the real repositories.
 *
 * Usage:
 *   npm run sync                 # every configured repo
 *   npm run sync -- rms wms      # only the given projects
 *   npm run sync -- rms/portal   # only one repo of one project
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, loadConfig, isConfigured, log } from './lib.mjs';

const RS = '\x1e';
const US = '\x1f';
const NO_PUSH = 'no-push://read-only-mirror';

function git(args, options = {}) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...options }).trim();
}

function gitIn(dir, args) {
  return git(['-C', dir, ...args]);
}

function tryGitIn(dir, args) {
  try {
    return gitIn(dir, args);
  } catch {
    return null;
  }
}

function ensureMirror(label, url, mirrorDir) {
  if (existsSync(mirrorDir)) {
    log.info(`  fetching ${label} ...`);
    gitIn(mirrorDir, ['fetch', '--prune', '--quiet']);
  } else {
    log.info(`  cloning ${label} (blobless mirror, first run may take a while) ...`);
    mkdirSync(path.dirname(mirrorDir), { recursive: true });
    git(['clone', '--mirror', '--filter=blob:none', '--quiet', url, mirrorDir]);
  }
  // Defence in depth: make an accidental push physically impossible.
  gitIn(mirrorDir, ['config', 'remote.origin.pushurl', NO_PUSH]);
}

function resolveBranch(mirrorDir, preferred) {
  if (preferred && tryGitIn(mirrorDir, ['rev-parse', '--verify', '--quiet', `${preferred}^{commit}`])) {
    return preferred;
  }
  const head = tryGitIn(mirrorDir, ['symbolic-ref', '--short', 'HEAD']);
  if (head && tryGitIn(mirrorDir, ['rev-parse', '--verify', '--quiet', `${head}^{commit}`])) return head;
  for (const fallback of ['develop', 'main', 'master']) {
    if (tryGitIn(mirrorDir, ['rev-parse', '--verify', '--quiet', `${fallback}^{commit}`])) return fallback;
  }
  return null;
}

function readCommits(mirrorDir, branch, depth) {
  const format = `${RS}%H${US}%h${US}%aI${US}%an${US}%s${US}%P`;
  const raw = gitIn(mirrorDir, ['log', `-n${depth}`, `--format=${format}`, '--name-status', branch]);

  return raw
    .split(RS)
    .filter((chunk) => chunk.trim())
    .map((chunk) => {
      const [header, ...rest] = chunk.split('\n');
      const [sha, short, date, author, subject, parents] = header.split(US);
      const files = rest
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [status, ...paths] = line.split('\t');
          return { status, path: paths[paths.length - 1] };
        });
      return {
        sha,
        short,
        date,
        author,
        subject,
        isMerge: (parents || '').trim().split(/\s+/).filter(Boolean).length > 1,
        files,
      };
    });
}

function readHotspots(mirrorDir, branch, days) {
  const raw = gitIn(mirrorDir, ['log', `--since=${days} days ago`, '--format=', '--name-only', branch]);
  const counts = new Map();
  for (const line of raw.split('\n')) {
    const file = line.trim();
    if (!file) continue;
    counts.set(file, (counts.get(file) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 20)
    .map(([file, changes]) => ({ file, changes }));
}

function readBranches(mirrorDir) {
  const raw = tryGitIn(mirrorDir, [
    'for-each-ref',
    '--sort=-committerdate',
    '--count=15',
    '--format=%(refname:short)' + US + '%(committerdate:iso-strict)' + US + '%(authorname)',
    'refs/heads',
  ]);
  if (!raw) return [];
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [name, date, author] = line.split(US);
      return { name, lastCommitDate: date, lastCommitAuthor: author };
    });
}

function syncRepo(project, repo, config) {
  const label = `${project.key}/${repo.name}`;
  if (!isConfigured(repo)) {
    log.skip(`${label} — url not configured in config/projects.json`);
    return { name: repo.name, configured: false, description: repo.description || '' };
  }

  const mirrorDir = path.join(ROOT, config.cacheDir, project.key, `${repo.name}.git`);
  try {
    ensureMirror(label, repo.url, mirrorDir);
  } catch (error) {
    log.fail(`${label} — ${error.message.split('\n')[0]}`);
    return { name: repo.name, configured: false, error: error.message.split('\n')[0] };
  }

  const branch = resolveBranch(mirrorDir, repo.defaultBranch);
  if (!branch) {
    log.fail(`${label} — could not resolve a branch to read`);
    return { name: repo.name, configured: false, error: 'no resolvable branch' };
  }

  const commits = readCommits(mirrorDir, branch, config.historyDepth ?? 40);
  const state = {
    name: repo.name,
    configured: true,
    description: repo.description || '',
    url: repo.url,
    branch,
    mirrorDir: path.relative(ROOT, mirrorDir).split(path.sep).join('/'),
    head: commits[0]
      ? { sha: commits[0].sha, short: commits[0].short, date: commits[0].date, author: commits[0].author, subject: commits[0].subject }
      : null,
    branches: readBranches(mirrorDir),
    hotspots: readHotspots(mirrorDir, branch, config.hotspotWindowDays ?? 30),
    commits,
  };

  log.ok(`${label} — ${branch} @ ${state.head?.short ?? 'empty'} (${commits.length} commits recorded)`);
  return state;
}

function renderRepoSection(repo, windowDays) {
  const lines = [];
  lines.push(`## Repository: \`${repo.name}\``);
  lines.push('');

  if (!repo.configured) {
    lines.push(repo.error ? `**Status:** failed — ${repo.error}` : '**Status:** not configured.');
    lines.push('');
    return lines;
  }

  if (repo.description) {
    lines.push(repo.description);
    lines.push('');
  }
  lines.push(`- **URL:** \`${repo.url}\``);
  lines.push(`- **Branch:** \`${repo.branch}\``);
  lines.push(`- **HEAD:** \`${repo.head.short}\` — ${repo.head.subject}`);
  lines.push(`- **HEAD date:** ${repo.head.date}`);
  lines.push(`- **Mirror:** \`${repo.mirrorDir}\``);
  lines.push('');

  lines.push('### Active Branches');
  lines.push('');
  if (repo.branches.length === 0) {
    lines.push('_None found._');
  } else {
    lines.push('| Branch | Last Commit | Author |');
    lines.push('| --- | --- | --- |');
    for (const branch of repo.branches) {
      lines.push(`| \`${branch.name}\` | ${branch.lastCommitDate.slice(0, 10)} | ${branch.lastCommitAuthor} |`);
    }
  }
  lines.push('');

  lines.push(`### Change Hotspots (last ${windowDays} days)`);
  lines.push('');
  lines.push('Files touched most often. These are the highest-value regression targets.');
  lines.push('');
  if (repo.hotspots.length === 0) {
    lines.push('_No commits in this window._');
  } else {
    lines.push('| Changes | File |');
    lines.push('| --- | --- |');
    for (const hotspot of repo.hotspots) {
      lines.push(`| ${hotspot.changes} | \`${hotspot.file}\` |`);
    }
  }
  lines.push('');

  lines.push(`### Last ${repo.commits.length} Commits`);
  lines.push('');
  for (const commit of repo.commits) {
    lines.push(`#### \`${commit.short}\` — ${commit.subject}`);
    lines.push('');
    lines.push(`${commit.author} · ${commit.date}${commit.isMerge ? ' · merge commit' : ''}`);
    lines.push('');
    if (commit.files.length === 0) {
      lines.push('_No file list (merge commit)._');
    } else {
      for (const file of commit.files) {
        lines.push(`- \`${file.status}\` \`${file.path}\``);
      }
    }
    lines.push('');
  }

  lines.push('### How to inspect this repository');
  lines.push('');
  lines.push('```bash');
  lines.push(`M=${repo.mirrorDir}`);
  lines.push('git -C $M show <sha>                  # full diff');
  lines.push('git -C $M show <sha> --stat           # files touched');
  lines.push('git -C $M show <sha>:<path>           # file at that commit');
  lines.push(`git -C $M grep -n "term" ${repo.branch}`);
  lines.push(`git -C $M ls-tree -r --name-only ${repo.branch}`);
  lines.push('```');
  lines.push('');
  return lines;
}

function renderChangelog(project, state, windowDays) {
  const lines = [];
  lines.push(`# ${project.name} — Recent Changes`);
  lines.push('');
  lines.push('> Generated by `npm run sync`. Do not edit by hand — your changes will be overwritten.');
  lines.push('');
  lines.push(project.description);
  lines.push('');
  lines.push(`**Synced at:** ${state.syncedAt}`);
  lines.push('');

  const configured = state.repos.filter((repo) => repo.configured);
  if (configured.length === 0) {
    lines.push(`This project has no configured repository yet. Set a \`url\` for \`${project.key}\` in \`config/projects.json\`, then run \`npm run sync\`.`);
    lines.push('');
    return lines.join('\n');
  }

  if (state.repos.length > 1) {
    lines.push(`This project spans ${state.repos.length} repositories. A change may touch either or both.`);
    lines.push('');
    lines.push('| Repository | Branch | HEAD | Last Commit |');
    lines.push('| --- | --- | --- | --- |');
    for (const repo of state.repos) {
      if (!repo.configured) {
        lines.push(`| \`${repo.name}\` | — | — | _not configured_ |`);
        continue;
      }
      lines.push(`| \`${repo.name}\` | \`${repo.branch}\` | \`${repo.head.short}\` | ${repo.head.date.slice(0, 10)} — ${repo.head.subject} |`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  for (const repo of state.repos) {
    lines.push(...renderRepoSection(repo, windowDays));
    lines.push('---');
    lines.push('');
  }
  return lines.join('\n');
}

function renderSummary(states) {
  const lines = [];
  lines.push('# Project State Summary');
  lines.push('');
  lines.push('> Generated by `npm run sync`. Do not edit by hand.');
  lines.push('');
  lines.push('| Project | Repository | Branch | HEAD | Last Commit | Synced |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const { project, state } of states) {
    for (const repo of state.repos) {
      if (!repo.configured) {
        lines.push(`| ${project.name} | \`${repo.name}\` | — | — | _not configured_ | — |`);
        continue;
      }
      lines.push(
        `| ${project.name} | \`${repo.name}\` | \`${repo.branch}\` | \`${repo.head.short}\` | ${repo.head.date.slice(0, 10)} — ${repo.head.subject} | ${state.syncedAt.slice(0, 10)} |`
      );
    }
  }
  lines.push('');
  lines.push('Mirrors live at `.cache/repos/<project>/<repo>.git` and are read-only.');
  lines.push('');
  return lines.join('\n');
}

function main() {
  const config = loadConfig();
  const filters = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));

  const selected = config.projects
    .map((project) => {
      if (filters.length === 0) return { project, repos: project.repos || [] };
      const projectMatch = filters.includes(project.key);
      const repos = (project.repos || []).filter(
        (repo) => projectMatch || filters.includes(`${project.key}/${repo.name}`)
      );
      return { project, repos };
    })
    .filter((entry) => entry.repos.length > 0);

  if (selected.length === 0) {
    const known = config.projects.flatMap((p) => [p.key, ...(p.repos || []).map((r) => `${p.key}/${r.name}`)]);
    log.fail(`No matching projects or repos. Known: ${known.join(', ')}`);
    process.exit(1);
  }

  log.info('Syncing source repository mirrors\n');
  const states = [];

  for (const { project, repos } of selected) {
    const statePath = path.join(ROOT, project.statePath);
    mkdirSync(statePath, { recursive: true });

    const state = {
      project: project.key,
      name: project.name,
      description: project.description,
      syncedAt: new Date().toISOString(),
      hotspotWindowDays: config.hotspotWindowDays ?? 30,
      repos: repos.map((repo) => syncRepo(project, repo, config)),
    };

    writeFileSync(path.join(statePath, 'state.json'), JSON.stringify(state, null, 2) + '\n');
    writeFileSync(path.join(statePath, 'recent-changes.md'), renderChangelog(project, state, state.hotspotWindowDays));
    states.push({ project, state });
  }

  writeFileSync(path.join(ROOT, 'project-state', 'SUMMARY.md'), renderSummary(states));
  log.info('\nWrote project-state/SUMMARY.md');
}

main();

# CLAUDE.md

@AGENTS.md

`AGENTS.md` is the single source of truth for this workspace: the absolute
rules, the repository map, the test case generation workflow, and the document
format. It is imported above and applies in full. This file only adds the
Claude Code specifics.

---

## Read Before Generating

`AGENTS.md` alone is not enough to write a test case. Before generating, read:

1. `prompts/test-case-generation.md` — the six-step test design methodology
2. `knowledge/<project>/system-overview.md` for the target project
3. The relevant `knowledge/<project>/features/` and `integrations/` documents
4. `project-state/<project>/recent-changes.md` for what changed recently

These are not auto-loaded. Read them explicitly, every time.

---

## Tool Use in This Workspace

**Write / Edit** — only inside this workspace, and only into `knowledge/`,
`test-cases/`, `config/`, `templates/`, `prompts/`, or `scripts/`. Never into
`project-state/`, `exports/`, `test-runs/HISTORY.md`, `test-runs/runs.jsonl`,
`test-cases/index.md`, or anywhere under `.cache/`. Those are generated.

**Bash** — the source repositories are read-only. Against a mirror in
`.cache/repos/<key>.git` you may run only `git log`, `git show`, `git diff`,
`git grep`, `git ls-tree`, `git rev-parse`, `git for-each-ref` and
`git cat-file`. Any command that writes to a source repository is forbidden,
including `git push`, `git commit`, `git checkout`, `git reset`, `git stash`
and `git fetch` outside of `npm run sync`. `.claude/settings.json` denies the
most dangerous of these, but the rule holds regardless of what the settings
file happens to catch.

**Grep / Glob** — the fastest way to search the knowledge base. Use them freely
here. To search *source code*, use `git -C <mirror> grep` instead: the mirrors
are bare, so there are no files on disk to match against.

---

## Working Style

Read broadly before writing. The knowledge documents are long and the useful
detail is usually in the **Business Rules**, **Regression Areas** and **Known
Unknowns** sections. Read those sections in full rather than grepping for a
keyword and stopping.

Prefer parallel tool calls when gathering context — the knowledge documents,
the project state and the existing test case index are independent reads.

When the user writes in Turkish, reply in Turkish. Everything written into the
repository stays in English.

State your scope decision — which project is primary, which are affected —
before you start generating. It is the decision most likely to be wrong, and
the cheapest one for the user to correct early.

---

## Definition of Done

A test case task is complete when:

- The document exists at the right path with complete front matter
- `npm run index` passes with no validation errors
- `npm run export` has been run
- Open questions are listed in the document *and* surfaced in your reply
- Any question that blocks the document leaving `draft` is added to
  `WAITING-ON-YOU.md`
- Your reply names the commits and knowledge documents you actually used

# QA Test Agent — Operating Contract

This workspace is a **QA knowledge base and test case authoring environment** for
three separate but interdependent systems: **RMS**, **OMS** and **WMS**.

You are a Senior QA Engineer and Test Analyst. Given a description of a change,
you research it against the knowledge base and the source repositories, then
write detailed, formatted, executable test cases into this repository.

---

## 1. Absolute Rules

These are not preferences. Violating any of them is a failed task.

1. **Never modify the source projects.** RMS, OMS and WMS source code is
   read-only. You never commit, push, branch, stage, stash, checkout, reset,
   rebase, cherry-pick, or write a file into any source repository — including
   the local mirrors.
2. **Read source code only through the mirrors** in
   `.cache/repos/<project>/<repo>.git`.
   These are blobless mirror clones with the push URL set to
   `no-push://read-only-mirror`, created by `npm run sync`. Do not clone the
   source repositories anywhere else, and do not look for the user's own working
   copies on disk.
3. **Only `git log`, `git show`, `git diff`, `git grep`, `git ls-tree`,
   `git rev-parse`, `git for-each-ref` and `git cat-file`** may be run against a
   mirror. If you need a command that is not on this list, ask first.
4. **Do not write automation code.** This agent produces test cases, not test
   scripts. Execution will be added later.
5. **Do not invent system behaviour.** Every claim must trace to the ticket, a
   `knowledge/` document, or source code you actually read. If it does not, it
   becomes a question in the Questions section, not an assumption.
6. **Never edit generated files by hand:** `project-state/**`,
   `test-cases/index.md`, `test-runs/HISTORY.md`, `test-runs/runs.jsonl`,
   `exports/**`. Regenerate them with the scripts instead.
7. **Everything you write goes inside this workspace.** Nothing else on the
   filesystem is a valid write target.

---

## 2. Repository Map

Four layers, each with one job.

| Path | Layer | What it holds | Who writes it |
| --- | --- | --- | --- |
| `knowledge/` | What the system **is** | Durable domain knowledge: business rules, flows, integrations, glossary | Human + agent (with approval) |
| `project-state/` | What the code **is right now** | Git-derived snapshots: HEAD, branches, recent commits, change hotspots | `npm run sync` only |
| `test-cases/` | What we **test** | Test case documents, one per ticket, plus the generated index | Agent |
| `test-runs/` | What **happened** | Execution history, per ticket and as a chronological log | `npm run log:run` |

```text
qa-test-agent/
├── AGENTS.md                      ← you are here
├── CLAUDE.md                      ← Claude Code entry point, imports this file
├── WAITING-ON-YOU.md              ← everything blocked on the user: setup, gaps, questions
├── config/projects.json           ← the three projects: repo URL, branch, dependencies
│
├── knowledge/
│   ├── rms/
│   │   ├── system-overview.md         ← start here for RMS
│   │   ├── features/                  ← feature-level business rules
│   │   └── integrations/              ← Shopify, cargo, external systems
│   ├── oms/                           ← same shape, being filled in
│   ├── wms/                           ← same shape, being filled in
│   ├── cross-project/
│   │   ├── dependency-map.md          ← how RMS, OMS and WMS affect each other
│   │   └── glossary.md                ← shared terminology
│   └── testing/
│       ├── environments.md            ← where tests run
│       ├── test-data.md               ← reusable accounts, orders, SKUs
│       └── conventions.md             ← house style for test cases
│
├── project-state/
│   ├── SUMMARY.md                     ← all three projects at a glance
│   └── <project>/
│       ├── state.json                 ← machine-readable snapshot
│       └── recent-changes.md          ← commits, hotspots, how to inspect them
│
├── test-cases/
│   ├── index.md                       ← generated index + next free ID
│   ├── rms/<TICKET-ID>.md
│   ├── oms/<TICKET-ID>.md
│   ├── wms/<TICKET-ID>.md
│   └── cross-project/<TICKET-ID>-e2e.md
│
├── test-runs/
│   ├── HISTORY.md                     ← generated chronological summary
│   ├── runs.jsonl                     ← generated append-only log
│   └── <TICKET-ID>.md                 ← every run for that ticket
│
├── exports/test-cases.csv             ← generated, neutral schema for TestRail/Xray/ClickUp
├── prompts/test-case-generation.md    ← test design methodology — read before generating
├── templates/                         ← document skeletons
├── scripts/                           ← the four Node scripts
└── .cache/repos/<project>/<repo>.git  ← read-only mirrors, git-ignored
```

---

## 3. The Three Projects

| Key | Name | Role | Depends on |
| --- | --- | --- | --- |
| `rms` | Return Management System | Return and exchange lifecycle for orders from integrated stores. Buyer-facing Return Portal, seller-facing Return Panel. | `oms`, `wms` |
| `oms` | Order Management System | Order lifecycle. | `wms` |
| `wms` | Warehouse Management System | Warehouse, stock and physical goods handling. | — |

### A project can span several repositories

`config/projects.json` lists the repositories under each project. RMS has two,
and a single ticket may touch either or both:

| Repo | Mirror | What lives there |
| --- | --- | --- |
| `rms/app` | `.cache/repos/rms/app.git` | NestJS backend and the Next.js seller **Return Panel**. Return lifecycle, return policy and reasons, exchange, cargo and shipping, Shopify store connection, wallet, analytics, WMS integration. |
| `rms/portal` | `.cache/repos/rms/portal.git` | Buyer-facing **Return Portal**. Vite/React client under `client/`, small Node server under `server/`. |

Before deciding a change is backend-only or frontend-only, check both. Each repo
has a verified `codeMap` in `config/projects.json` mapping logical areas to real
directories — read it instead of guessing at paths.

Both repos are developed on `develop`, not `main`.

RMS is documented. OMS and WMS are not yet — their `system-overview.md` files
are stubs. **Until a project is documented, do not generate test cases for it
beyond what the ticket itself states.** Say so explicitly and ask the user to
fill in the knowledge base.

Authoritative dependency directions live in
`knowledge/cross-project/dependency-map.md`. Read it before reasoning about
cross-project impact.

---

## 4. Workflow: Generating Test Cases for a Change

This is the main loop. Follow it in order.

### 4.1 Orient

1. Read `project-state/SUMMARY.md` to see how fresh each project's snapshot is.
   If the relevant project was last synced more than a day ago, or the ticket
   mentions a commit you cannot find, run `npm run sync -- <project>` first.

   Check the **Unmerged** column. RMS hotfixes land on `main` and are auto-PRed
   back to `develop`; when that PR hits a conflict it stalls, leaving fixes live
   in production but absent from the branch under test. If the column shows
   drift, open the **Not Yet Merged** section of that project's
   `recent-changes.md`. When one of those commits touches the area you are
   testing, say so in the Change Context table — the tester needs to know the
   environment may not match the branch.
2. Read `test-cases/index.md` — for the next free test case ID, and to find
   existing documents that already cover this area.
3. Read `test-runs/HISTORY.md` if the area has been tested before. Recent
   failures are high-value test targets.

### 4.2 Identify Scope

Determine the **primary project** and any **affected projects**. Use
`knowledge/cross-project/dependency-map.md`. State the scope in your reply
before going further.

### 4.3 Load Knowledge

Read, in this order:

1. `knowledge/<project>/system-overview.md`
2. The relevant files under `knowledge/<project>/features/` and
   `knowledge/<project>/integrations/`
3. `knowledge/testing/conventions.md` and `knowledge/testing/test-data.md`
4. `knowledge/<other-project>/system-overview.md` for each affected project

Pay particular attention to every **Known Unknowns** section. Those are hard
boundaries.

### 4.4 Inspect the Source Code — When It Adds Something

Read the code when the ticket is thin, when you need the actual validation
rules, error messages, status enums or field names, or when you need to confirm
which areas a commit touched. Skip it when the knowledge base already answers
the question.

Start from `project-state/<project>/recent-changes.md`, which lists recent
commits and the files they touched. Then:

```bash
M=.cache/repos/rms/app.git        # or .cache/repos/rms/portal.git

git -C $M log --oneline -20 develop
git -C $M log --oneline --since="14 days ago" develop -- src/core/application/use-cases/return
git -C $M show <sha> --stat
git -C $M show <sha>                        # full diff
git -C $M show <sha>:path/to/file           # file at that commit
git -C $M diff <old-sha>..<new-sha> -- path/to/area
git -C $M grep -n "searchTerm" develop -- "*.ts"
git -C $M ls-tree -r --name-only develop | grep -i return
```

**`git grep` is slow on these mirrors.** They are blobless clones, so a repo-wide
grep lazily downloads every file it touches — around a minute on `rms/app`.
Prefer `ls-tree -r --name-only | grep`, which reads only the tree and returns
instantly, to locate candidate files first, then `git show` the few you need.
Use `git grep` only when you must match file *contents*, and always narrow it
with a pathspec:

```bash
git -C $M grep -n "term" develop -- "src/core/application/use-cases/return/*"
```

Record every commit SHA and file path you actually read — they go into the
document's Change Context table and the `source_commit` front matter field.

**Quote real error messages instead of describing them.** Both RMS repos keep
user-facing strings in translation dictionaries, mapped in `codeMap` as
`user-facing-messages` — `src/i18n/dictionaries/en` in `rms/app` and
`client/src/i18n` in `rms/portal`. When an expected result involves a message
the buyer or seller sees, read the actual string and quote it.

### 4.5 Generate

Read `prompts/test-case-generation.md` and follow its six steps. It defines the
test design categories, the exact test case format, and the priority rules.

### 4.6 Write the Document

File path:

| Situation | Path |
| --- | --- |
| Single project | `test-cases/<project>/<TICKET-ID>.md` |
| Affects several projects | One file per project, plus `test-cases/cross-project/<TICKET-ID>-e2e.md` |
| No ticket ID | `test-cases/<project>/<YYYY-MM-DD>-<short-slug>.md` |

Start from `templates/test-case-document.md` for the empty skeleton, and read
`templates/example-test-case-document.md` for a fully worked example showing the
expected depth. Front matter is mandatory:

```yaml
---
project: rms                          # rms | oms | wms | cross-project — must match the folder
ticket: TECH-19543                       # ticket id, or the date-slug used in the filename
title: Item-level return reason becomes mandatory
created: 2026-09-03
author: qa-test-agent
status: draft                         # draft | reviewed | approved | superseded
coverage_status: READY FOR TESTING    # READY FOR TESTING | READY WITH MINOR GAPS | REQUIRES CLARIFICATION
source_commit: a1b2c3d                # commit you reviewed, empty string if none
knowledge_refs: [knowledge/rms/features/return-portal-order-search.md]
affects: [rms, oms]                   # every project this change can touch
test_case_ids: [RMS-TC-001, RMS-TC-002]
---
```

Then the body, in this order: Requirement Summary, Change Context, Questions /
Missing Information, Assumptions, Test Cases, Coverage Summary.

### 4.7 Finalise

```bash
npm run index     # validates the document and rebuilds test-cases/index.md
npm run export    # refreshes exports/test-cases.csv
```

`npm run index` exits non-zero if anything is wrong. Fix the reported problems
and re-run — never hand-edit `index.md` to make an error go away.

### 4.8 Report

In chat, summarise: scope, how many test cases by priority, which knowledge
documents and commits you used, open questions, and the coverage status. Do not
paste the whole document back — point to the file.

---

## 5. Test Case Format

Enforced by `scripts/build-index.mjs` and parsed by `scripts/export-csv.mjs`.
Deviating from it breaks both.

```markdown
## RMS-TC-001 — Buyer cannot submit a return without selecting a reason

**Priority:** High

**Type:** Negative

**Preconditions:**

- Shopify store integration is active
- An eligible delivered order exists for the buyer

**Test Data:**

- Order Number: `#1001`
- Email: `buyer@example.com`

**Steps:**

1. Open the Return Portal for the store.
2. Enter the order number and email, then submit.
3. Select one item and leave the return reason empty.
4. Attempt to continue to the next step.

**Expected Result:**

- The buyer cannot continue.
- A validation message is shown on the return reason field.
- No return request is created in the Return Panel.
```

Rules:

- Heading is `## <ID> — <Title>` with an em dash. The ID must match
  `^[A-Z0-9]+-TC-\d{3,}$`.
- IDs are project-scoped: `RMS-TC-`, `OMS-TC-`, `WMS-TC-`, `E2E-TC-`.
  Take the next free number from `test-cases/index.md`. Never reuse one.
- `**Priority:**`, `**Steps:**` and `**Expected Result:**` are required.
- One behaviour per test case.
- Steps are executable by someone who never read the ticket.
- Expected results are observable: name the screen, field, status, API response
  or record that proves the outcome.
- **Write everything in English**, including titles and notes, even when the
  user writes to you in Turkish. Reply in chat in the user's language.

---

## 6. Cross-Project Changes

When a change crosses project boundaries — an RMS return that adjusts WMS stock
and updates an OMS order, for example:

1. Write a per-project document for each affected project, covering that
   project's own behaviour in isolation.
2. Write one `test-cases/cross-project/<TICKET-ID>-e2e.md` with `project:
   cross-project` and `E2E-TC-` IDs, covering the end-to-end flow.
3. In every document, list all affected projects in `affects`.
4. The E2E document must cover, at minimum:
   - The full happy path across all involved projects
   - Data consistency after the flow completes
   - One project unavailable, timing out, or returning an error
   - Retry and idempotency — what happens if the message arrives twice
   - Out-of-order or delayed propagation
   - Deployment order, if the change is not backward compatible

---

## 7. Maintaining the Knowledge Base

The knowledge base is the agent's memory. Keep it true.

- If a ticket **contradicts** a knowledge document, do not silently follow the
  ticket. Flag the contradiction in the Questions section, name the document and
  section, and ask whether the knowledge base should be updated.
- If a ticket **adds** durable behaviour, propose the knowledge update
  explicitly. Only write it after the user approves.
- New feature document: copy `templates/feature-knowledge.md` into
  `knowledge/<project>/features/`.
- New project overview: copy `templates/system-overview.md`.
- When a question from a Questions section gets answered, that answer belongs in
  `knowledge/`, and the corresponding **Known Unknowns** bullet should be removed.

---

## 8. Logging Test Runs

Execution is manual today; the agent will take it over later. The history format
is the same either way, so nothing has to be migrated.

```bash
npm run log:run -- --ticket TECH-19543 --project rms --env staging --tester buse \
  --case RMS-TC-001=pass \
  --case RMS-TC-002=fail:"Duplicate error toast shown" \
  --notes "Retested after hotfix"

# or mark every case in a document at once, then override the exceptions
npm run log:run -- --ticket TECH-19543 --project rms --from test-cases/rms/TECH-19543.md --result pass
```

Results: `pass`, `fail`, `blocked`, `skipped`. This writes
`test-runs/<TICKET-ID>.md`, appends to `runs.jsonl`, and rebuilds `HISTORY.md`.

---

## 9. Commands

| Command | What it does |
| --- | --- |
| `npm run sync` | Refresh all read-only mirrors and rewrite `project-state/` |
| `npm run sync -- rms` | Refresh every repository of one project |
| `npm run sync -- rms/portal` | Refresh a single repository |
| `npm run index` | Validate all test case documents, rebuild `test-cases/index.md` |
| `npm run check` | Validate only, non-zero exit on error |
| `npm run export` | Rebuild `exports/test-cases.csv` |
| `npm run log:run -- …` | Record a test execution |
| `npm run refresh` | `sync` + `index` + `export` |

No dependencies to install. Node 18+ and git are all that is required.

---

## 10. Things Blocked on the User

`WAITING-ON-YOU.md` at the repository root is the single place where everything
that needs a human is tracked: setup steps, undocumented knowledge, and open
questions.

Read it when you need to know what is still missing — it explains which parts of
the knowledge base are incomplete and therefore which behaviour you must not
assume.

Add to it whenever you hit a blocker:

- A question from a test case document that must be answered before the document
  can leave `draft`
- A knowledge gap you had to work around
- A dependency hypothesis you could not confirm from the code

Put the question in the right section, say what it blocks, and keep it to one
row. Do not duplicate the full question text from the test case document —
reference the document instead. Remove the row once the answer has been written
into `knowledge/`.

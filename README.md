# QA Test Agent

A QA knowledge base and test case authoring workspace for three separate but
interdependent systems: **RMS**, **OMS** and **WMS**.

You describe a change. The agent researches it against the knowledge base and
the project source code, then writes detailed, formatted test cases into this
repository. Test execution stays manual for now — the file formats are already
shaped for the agent to take it over later.

**The source projects are read-only.** Neither you nor the agent modifies them
from here. Source code is read through blobless mirror clones under `.cache/`
with the push URL disabled.

---

## Setup

Requires Node 18+ and git. There is nothing to install.

**Follow [`WAITING-ON-YOU.md`](WAITING-ON-YOU.md)** — it walks through setup
step by step, then lists the knowledge gaps and open questions that are still
blocking the agent.

The short version:

1. Open `config/projects.json` and set `url` and `defaultBranch` for each
   repository. A project can span several — RMS spans two.
2. Pull the source history:

   ```bash
   npm run sync
   ```

---

## Daily Use

Ask the agent for test cases in plain language, in Turkish or English:

> RMS'te iade sebebi artık item bazında zorunlu oldu. ClickUp TECH-19543. Bunun
> için test senaryosu yaz.

The agent will read the project state, load the relevant knowledge documents,
inspect the source commit if it needs to, and write
`test-cases/rms/TECH-19543.md`. It reports scope, coverage and open questions in
chat.

Then record what happened when you run them:

```bash
npm run log:run -- --ticket TECH-19543 --project rms --env staging --tester buse \
  --case RMS-TC-001=pass \
  --case RMS-TC-002=fail:"Duplicate error toast shown"
```

---

## How It Is Organised

Four layers, each with one job.

| Path | Layer | Written by |
| --- | --- | --- |
| `knowledge/` | What the systems **are** — business rules, flows, integrations | You and the agent |
| `project-state/` | What the code **is right now** — commits, branches, hotspots | `npm run sync` |
| `test-cases/` | What we **test** — one document per ticket | The agent |
| `test-runs/` | What **happened** — execution history | `npm run log:run` |

`AGENTS.md` is the agent's operating contract: the rules, the workflow, and the
document format. `CLAUDE.md` imports it and adds Claude Code specifics.
`prompts/test-case-generation.md` holds the test design methodology.
`WAITING-ON-YOU.md` is the human side of that split — setup, knowledge gaps and
open questions, maintained by the agent as it hits blockers.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run sync` | Refresh the read-only mirrors and rewrite `project-state/` |
| `npm run sync -- rms` | Refresh every repository of one project |
| `npm run sync -- rms/portal` | Refresh a single repository |
| `npm run index` | Validate every test case document, rebuild `test-cases/index.md` |
| `npm run check` | Validate only — non-zero exit on error, suitable for CI |
| `npm run export` | Rebuild `exports/test-cases.csv` |
| `npm run log:run -- …` | Record a test execution |
| `npm run refresh` | `sync` + `index` + `export` |

`npm run index` is the gate. It enforces the front matter, the test case format,
the ID prefixes, and ID uniqueness across all documents, and it tells you the
next free ID for each project.

---

## Exporting

`exports/test-cases.csv` uses a neutral column set that TestRail, Xray, Zephyr
and ClickUp can all map from:

```text
ID, Project, Ticket, Title, Priority, Type, Preconditions, Test Data, Steps,
Expected Result, Affects, Source Commit, Doc Status, Coverage Status, Created,
Source File
```

---

## Current State

| Project | Knowledge base | Repositories |
| --- | --- | --- |
| RMS | System overview, 2 feature documents, 4 integration documents | **Connected** — `Navlungo/returns-app` (backend + seller panel) and `Navlungo/return-app-portal` (buyer portal), both on `develop` |
| OMS | Stub | Not configured |
| WMS | Stub | Not configured |

Cross-project dependencies are hypotheses, not facts — see
`knowledge/cross-project/dependency-map.md`. The agent will not write test cases
that depend on an unconfirmed hypothesis; it raises a question instead.

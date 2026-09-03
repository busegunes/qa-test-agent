# Continue Here

Resumption note for the next session. Read this, then `AGENTS.md`, then
`WAITING-ON-YOU.md`. Everything else follows from those three.

**Last session:** 2026-09-03. **Repo:** https://github.com/busegunes/qa-test-agent (private).

---

## What this project is

A QA knowledge base and test case authoring workspace for three separate but
interdependent systems: **RMS**, **OMS** and **WMS**. The user describes a
change; the agent researches it against the knowledge base and the real source
code, then writes detailed, formatted test cases into `test-cases/`.

Test execution is manual for now. The agent will take it over later, and the
file formats are already shaped for that.

**The source projects are read-only.** The agent reads them through blobless
mirror clones under `.cache/repos/<project>/<repo>.git` with the push URL set to
`no-push://read-only-mirror`. A push attempt fails immediately. Never clone the
source repos anywhere else, and never touch the user's own working copies.

---

## Decisions already made — do not relitigate

| Area | Decision |
| --- | --- |
| Source access | Read-only blobless mirrors, refreshed by `npm run sync`. Not the user's working copies, not the GitHub API. |
| Ticket input | Pasted manually into chat. No ClickUp API integration. |
| Ticket ID format | `TECH-19543` style. |
| Output | One markdown document per ticket at `test-cases/<project>/<TICKET-ID>.md`, plus a generated index. |
| Language | Everything written into the repo is English. Chat replies follow the user's language, which is Turkish. |
| Test case format | `## <ID> — <Title>` with `**Priority:**`, `**Type:**`, `**Preconditions:**`, `**Test Data:**`, `**Steps:**`, `**Expected Result:**`. Parsed by the scripts — do not deviate. |
| Test case IDs | Project-scoped: `RMS-TC-001`, `OMS-TC-001`, `WMS-TC-001`, `E2E-TC-001`. Next free ID comes from `test-cases/index.md`. |
| Export | Neutral CSV schema at `exports/test-cases.csv`, mappable to TestRail, Xray, Zephyr or ClickUp. |
| Cross-project changes | One document per affected project, plus a `test-cases/cross-project/<TICKET-ID>-e2e.md`. |
| Scripts | Node, no dependencies. `sync`, `index`, `check`, `export`, `log:run`, `refresh`. |
| Run history | `npm run log:run` writes `test-runs/<TICKET-ID>.md`, `runs.jsonl` and `HISTORY.md`. Manual today, automated later, same format. |

---

## Current state

### RMS — connected and working

Two repositories, both on `develop`, both mirrored with a verified `codeMap`:

| Repo | Source | What lives there |
| --- | --- | --- |
| `rms/app` | `Navlungo/returns-app` | NestJS backend and Next.js seller Return Panel |
| `rms/portal` | `Navlungo/return-app-portal` | Buyer Return Portal — Vite/React `client/`, Node `server/` |

`rms/app` currently shows **branch drift**: commits exist on `main` that are not
on `develop`. Hotfixes land on `main` and are auto-PRed back; when that PR hits a
conflict it stalls, leaving a fix live in production but missing from the branch
under test. `npm run sync` detects this and reports it in
`project-state/SUMMARY.md` and a **Not Yet Merged** section.

### OMS and WMS — not connected

Repository URLs are still `REPLACE_ME_git_url` in `config/projects.json`, and
their `system-overview.md` files are stubs. Do not generate test cases for them
beyond what the ticket itself states — say so and ask for the knowledge base to
be filled in.

### Knowledge base

`knowledge/rms/` is substantial and was written by the user before this project
started: a system overview, two Return Portal feature documents, and four
integration documents covering Shopify and cargo. Treat it as authoritative.

`knowledge/testing/environments.md` and `test-data.md` are empty, which is why
test case preconditions still say "the test environment" instead of naming one.

---

## Facts confirmed this session

Established from source code and from the QA owner. These are recorded in
`knowledge/cross-project/dependency-map.md`; this is the short version.

- **OMS → RMS is one-way and queue-based.** RMS runs an `oms-status-worker` that
  consumes OMS status messages and applies them via `return/apply-oms-status`.
  RMS does **not** push anything back. Never assert an OMS-side effect of a
  finalised return.
- **`Arrived at Warehouse` is driven by cargo carrier tracking, not the WMS.**
  The WMS is not in the return-arrival path. Test cases for that status must
  simulate carrier tracking.
- **Refunds are issued by Shopify.** RMS only triggers them, so a refund
  assertion belongs in Shopify. Asserting only in RMS proves the trigger fired,
  not that the buyer got their money.
- **"WMS" is two live providers with different rule structures:** `HAMURLABS`
  and `PARKPALET`. Every WMS statement must name its provider, exactly like the
  Shopify versus Custom integration distinction.
- **The three systems deploy independently.** Every OMS → RMS contract change
  needs deployment-order and backward-compatibility coverage.
- **Orders reach RMS directly from Shopify**, via `store-connection` and
  `webhooks` — not through the OMS. One line of confirmation still outstanding.
- **User-facing strings live in i18n dictionaries:** `src/i18n/dictionaries/en`
  in `rms/app`, `client/src/i18n` in `rms/portal`. Quote real strings in expected
  results instead of describing them.
- **`git grep` is slow on the mirrors** — they are blobless, so a repo-wide grep
  downloads every file it touches. Use `ls-tree -r --name-only | grep` to locate
  files, then `git show` the few you need.

---

## Where we left off

The user is preparing documents that define project scope and answer the
outstanding questions more precisely. Expect these:

1. **A WMS provider document** describing how `HAMURLABS` and `PARKPALET` differ.
   File it as `knowledge/wms/providers.md`.
2. **Scope definitions** for RMS, OMS and WMS — what each is and is not
   responsible for. This is question A1 in `WAITING-ON-YOU.md`.

### Highest-value open questions

Full list with rationale is in `WAITING-ON-YOU.md` Part 3. The two that block
the most:

- **A1 — Scope.** What is each system responsible for, and explicitly *not*
  responsible for? The "not" half is what stops a ticket being misfiled.
- **B1 — OMS queue worker.** What happens on a malformed, duplicated,
  out-of-order, or unknown-return message? Is it idempotent? These are
  guaranteed to happen in a queue consumer, and there is currently no expected
  result the agent can write for any of them.

### Suggested next step

Nothing has been exercised end to end yet. Take a real `TECH-` ticket, generate
a test case document, and review the output together. The gaps show up faster
that way than by answering questions in the abstract.

---

## Housekeeping done at the end of the session

The home directory was accidentally a git repository — an old `PaytrCaseStudy`
Java project had been `git init`ed directly in `/Users/busegunes`, scattering
`src/`, `target/`, `pom.xml`, `README.md` and `.idea/` across it.

That was cleaned up:

- `PaytrCaseStudy` extracted to `~/Projects/PaytrCaseStudy/`, repo intact.
- `/Users/busegunes` is no longer a git repository, so a stray `git add -A`
  there can no longer sweep up `.ssh/` or credentials.
- 1.6 GB reclaimed. The real project was 45 objects, 16 KB; the other 29,520
  objects were unreachable blobs from a past `git add` in the home directory.
- Work repositories moved into `~/Projects/`, and Playwright/Cypress leftovers
  and loose data dumps deleted at the user's request.
- **This workspace moved from `~/Desktop/qa-test-agent` to
  `~/Projects/qa-test-agent`.** Chat transcripts were copied to the new
  workspace key so the history follows.

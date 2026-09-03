# Waiting On You

Everything in this repository that is blocked on a human — a decision, a
credential, or a piece of knowledge only you have.

The agent can already write RMS test cases against real source code. Each item
below removes a specific limitation. Nothing here is urgent on its own; work
down the list as you have time, and the agent gets sharper each time you check
one off.

**The fastest way to answer anything here is to say it in chat.** The agent will
write it into the right knowledge file, keep the wording consistent with the
rest of the base, and delete the row from this document.

---

## Progress

| Part | What it unblocks | Status |
| --- | --- | --- |
| [Part 1 — Setup](#part-1--setup) | Reading source code at all | **RMS connected. OMS and WMS repos still needed.** |
| [Part 2 — Knowledge gaps](#part-2--knowledge-gaps) | OMS and WMS test cases, concrete preconditions | Not started |
| [Part 3 — Open questions](#part-3--open-questions) | Specific test cases that are currently blocked | 3 answered from code, rest open |

### RMS is connected

Both repositories are mirrored and synced, and every mapped directory has been
verified against `develop`.

| Repo | URL | Branch | What lives there |
| --- | --- | --- | --- |
| `rms/app` | `Navlungo/returns-app` | `develop` | NestJS backend and the Next.js seller Return Panel |
| `rms/portal` | `Navlungo/return-app-portal` | `develop` | Buyer Return Portal — Vite/React `client/` plus a Node `server/` |

You can start giving the agent RMS tickets now. Everything below only makes the
output better.

---

# Part 1 — Setup

## Step 1 — Add the repository URLs

> **RMS: done, both repos.** OMS and WMS are still on the placeholder.

A project can span several repositories, so `config/projects.json` gives each
project a `repos` array. Add an entry per repository:

```json
{
  "name": "main",
  "url": "https://github.com/Navlungo/your-oms-repo.git",
  "defaultBranch": "develop",
  "description": "One line on what lives in this repo",
  "codeMap": {}
}
```

If OMS or WMS spans more than one repository the way RMS does, add another
object to the array rather than creating a new project.

**Check it worked:**

```bash
grep -c REPLACE_ME_git_url config/projects.json
```

Zero means everything is connected. Connecting them one at a time is fine —
`npm run sync` skips any repo still on the placeholder and reports it as `skip`,
so the agent keeps working with whatever is configured.

## Step 2 — Pull the source history

```bash
npm run sync                  # every configured repo
npm run sync -- rms           # every repo of one project
npm run sync -- rms/portal    # a single repo
```

The first clone of a repo takes a few seconds to a few minutes. Later runs take
seconds. Once a day is plenty.

**If a repo fails to clone:**

| Message | Cause | Fix |
| --- | --- | --- |
| `Repository not found` | Wrong URL, or your GitHub account cannot see it | Check the URL and your access on GitHub |
| `could not read Username` | Git has no credentials for that host | Run `gh auth setup-git` |
| `couldn't find remote ref develop` | Wrong default branch | Fix `defaultBranch` in `config/projects.json` |

Nothing this command does can affect the real repositories. It creates
read-only mirror clones under `.cache/` with the push URL disabled — a push
attempt fails immediately with `remote helper 'no-push' aborted session`.

## Step 3 — See what the agent sees

`project-state/SUMMARY.md` gives you every repo, its branch and its HEAD.
`project-state/rms/recent-changes.md` is the file the agent reads first when you
describe a change: active branches, the last 40 commits with files touched, and
a **Change Hotspots** table per repo.

## Step 4 — Map the important directories

> **RMS: done.** 30 mapped paths across the two repos, all verified.

`codeMap` tells the agent where to look. For OMS and WMS, fill it in once their
repos are connected — or ask the agent to explore the repo and propose one.

## Step 5 — Try it end to end

Describe a real change in chat, the way you naturally would:

> RMS'te iade sebebi artık item bazında zorunlu oldu. TECH-19543. Bunun için
> test senaryosu yaz.

The agent reports scope, reads the knowledge base and the relevant commits, and
writes `test-cases/rms/TECH-19543.md`.

**Look at the Questions / Missing Information section of the result.** Those are
the things it could not determine. Answering them is the highest-leverage thing
you can do — each answer becomes permanent knowledge.

Then record what happened when you ran the tests:

```bash
npm run log:run -- --ticket TECH-19543 --project rms --env staging --tester buse \
  --case RMS-TC-001=pass \
  --case RMS-TC-002=fail:"Validation message not shown"
```

---

# Part 2 — Knowledge Gaps

Documents that exist but are empty. Each is a stub with the section structure
already in place — fill it in, or dictate it in chat and the agent writes it.

| Priority | Document | What is missing | What it unblocks |
| --- | --- | --- | --- |
| High | `knowledge/oms/system-overview.md` | Everything | Any OMS test case. The agent will currently refuse and ask you to document it. |
| High | `knowledge/wms/system-overview.md` | Everything | Any WMS test case, same as above. |
| High | `knowledge/testing/environments.md` | Environment URLs, test stores, where credentials live | Concrete preconditions. Test cases currently say "the test environment" instead of naming one. |
| Medium | `knowledge/testing/test-data.md` | Buyer and seller accounts, order fixtures, boundary values | Reproducible test data. The agent invents a fresh fixture per document today. |
| Medium | `knowledge/rms/features/` | Return lifecycle, seller panel actions, exchange flow | Deeper RMS coverage. The two existing documents cover the portal only, and `exchange` is the single busiest area in the codebase right now. |

**The most efficient way to do this:** do not sit down to write a document. Wait
until a ticket touches the area, then answer the agent's questions about it. The
knowledge base fills itself in as a side effect of normal work.

---

# Part 3 — Open Questions

Each question blocks something specific. Answer the ones that matter for what
you are testing this week and ignore the rest.

## A. Project Scope and Ownership

| # | Question | Why it matters |
| --- | --- | --- |
| A1 | In one sentence each, what is RMS, OMS and WMS responsible for — and what is explicitly *not* each one's job? | Boundaries decide which project a ticket belongs to. The agent knows RMS well and the other two not at all. |
| A2 | Which system is the source of truth for: the order, stock levels, warehouse definitions, the return record, and refunds? | Decides which system a test case should assert against. Asserting in the wrong place produces tests that pass while the data is wrong. |
| A3 | ~~How do the three communicate?~~ **Partly answered from code.** OMS reaches RMS through a **message queue**; RMS reaches the WMS provider over **HTTP**. Is that the whole picture, or are there other channels? | Determines which timeout, retry and duplicate-delivery cases are relevant. |
| A4 | Are the three deployed independently, or released together? | If independent, deployment-order and backward-compatibility cases are needed for every contract change. |
| A5 | ~~Does Shopify order data reach RMS through OMS?~~ **Evidence says no** — orders arrive via `store-connection` and `webhooks`, and the only inbound OMS path is status messages. Confirm in one line. | Changes the blast radius of every order-related change. |
| A6 | Is there a fourth system or shared service involved that is not one of these three? | Prevents test cases with a hole in the middle of the flow. |

## B. Cross-Project Dependencies

Two dependencies are now **confirmed from source code** and recorded in
`knowledge/cross-project/dependency-map.md` §2. What is still missing is how
they behave when things go wrong.

| # | Question | Why it matters |
| --- | --- | --- |
| B1 | The OMS status worker consumes queue messages. What happens on a malformed message, a duplicate, one arriving out of order, or one referencing an unknown return? Is it idempotent? | This is a queue consumer, so these are not edge cases — they are guaranteed to happen. Currently the agent cannot write a single expected result for them. |
| B2 | What happens when the WMS provider is unreachable during a warehouse sync? Are previously synced warehouses kept, and can a return still be created? | Warehouse selection drives cargo selection. If sync fails silently, returns may route to a stale warehouse. |
| B3 | RMS supports two WMS providers, `HAMURLABS` and `PARKPALET`. Are both live, or is one legacy? | Decides whether every WMS test case needs two variants, the way Shopify and Custom integrations do. |
| B4 | Does RMS push anything *back* to the OMS when a return is finalised, or is the relationship one-way? | No code evidence for the reverse direction was found. If it exists it is a whole untested integration. |
| B5 | Does the WMS notify RMS when a return package physically arrives, and is that what drives `Arrived at Warehouse`? | Still unconfirmed. It is the trigger for the most important status transition in the return lifecycle. |

## C. RMS Behaviour

From the **Known Unknowns** sections you already wrote. Full lists are in
`knowledge/rms/system-overview.md` §8 and
`knowledge/rms/features/return-portal-order-search.md` §15.

| # | Question | Blocks |
| --- | --- | --- |
| C1 | Which exact Shopify order statuses make an order eligible for return? Is it shipment status or delivery status that decides? | Every order-eligibility test case. The agent can only say "an eligible order" today. |
| C2 | How is the return eligibility period calculated — from which date, in which time zone, and what happens exactly at the deadline? | All return-window boundary cases, which is where the bugs usually are. |
| C3 | What happens to an item whose return was previously rejected, cancelled, or is still in progress? Are all three treated the same? | Previously-processed-item cases. Your own docs flag this as unresolved. |
| C4 | Can one request mix Return and Exchange across different items? | Multi-item request cases. Mutually exclusive per item is documented; the per-request rule is not. |
| C5 | Can a buyer create a second return request for the remaining quantity of a partially returned item? | Partial return and quantity boundary cases. |
| C6 | What are the exact return request statuses and which transitions are valid? | Every state-transition case, including invalid-transition negatives. |
| C7 | ~~What are the exact user-facing error messages?~~ **Answered.** They live in `src/i18n/dictionaries/en` in `rms/app` and `client/src/i18n` in `rms/portal`. The agent now quotes real strings instead of describing them. | — |

## D. QA Workflow

| # | Question | Why it matters |
| --- | --- | --- |
| D1 | ~~What does a ticket ID look like?~~ **Answered from branch names:** `TECH-19543`. All examples updated. | — |
| D2 | ~~Should the agent also read `main`?~~ **Answered and automated.** Hotfixes are auto-PRed from `main` back to `develop`, so the two are normally in sync; conflicts stall the PR and create drift. `npm run sync` now detects this and reports it in `SUMMARY.md` and a **Not Yet Merged** section. Currently 7 commits are stuck outside `develop`, including a Sendcloud/ShipStation shipping adapter fix. | — |
| D3 | Does anyone review test cases before they are used? | Documents carry `status: draft / reviewed / approved / superseded`. If nobody reviews, the agent should write `approved` directly instead of leaving everything in `draft`. |
| D4 | Which environment do you normally test in? | Becomes the default in preconditions, so you stop having to correct it. |
| D5 | Do you ever need test cases in Turkish — for example to paste into a ticket for someone else? | Everything is English right now; the agent can produce a Turkish version on request. |
| D6 | Do you want `npm run check` wired into CI so a malformed test case document fails the build? | Only worth it if this repository gets pull requests rather than direct commits. |

---

## How This Document Stays Current

The agent maintains it. When it writes a test case document with unanswered
questions, it adds the blocking ones here. When you answer something, it writes
the answer into the right `knowledge/` file and removes the row.

If a row is stale or you have decided it does not matter, delete it. An
uncluttered list is more likely to get worked through than a complete one.

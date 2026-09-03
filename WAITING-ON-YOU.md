# Waiting On You

Everything in this repository that is blocked on a human — a decision, a
credential, or a piece of knowledge only you have.

The agent can already write test cases for RMS. Each item below removes a
specific limitation. Nothing here is urgent on its own; work down the list as
you have time, and the agent gets sharper each time you check one off.

**The fastest way to answer anything here is to say it in chat.** The agent will
write it into the right knowledge file, keep the wording consistent with the
rest of the base, and delete the row from this document.

---

## Progress

| Part | What it unblocks | Status |
| --- | --- | --- |
| [Part 1 — Setup](#part-1--setup) | Reading source code at all | Not started |
| [Part 2 — Knowledge gaps](#part-2--knowledge-gaps) | OMS and WMS test cases, concrete preconditions | Not started |
| [Part 3 — Open questions](#part-3--open-questions) | Specific test cases that are currently blocked | Not started |

Update the Status column as you go, or ask the agent to.

---

# Part 1 — Setup

Five steps, in order. Steps 1 and 2 are the only ones that block the agent
outright. Budget about 20 minutes for all five.

## Step 1 — Add the three repository URLs

**Blocks:** everything in Part 1. Until this is done the agent cannot read any
source code and works from the knowledge base alone.

Open `config/projects.json`. Each of the three projects has a `repo` field set
to the placeholder `REPLACE_ME_git_url`. Replace all three.

Get each URL from the GitHub page of the project — the green **Code** button,
HTTPS tab. It looks like `https://github.com/your-org/rms-backend.git`.

```json
{
  "key": "rms",
  "repo": "https://github.com/your-org/rms-backend.git",
  "defaultBranch": "main",
```

While you are in there, set `defaultBranch` to the branch you actually test
against. It is `main` by default, but if your team develops on `develop` or
`staging`, put that instead — this is the branch the agent reads history from.

**Check it worked:** the file has no `REPLACE_ME_git_url` left.

```bash
grep -c REPLACE_ME_git_url config/projects.json    # should print 0
```

## Step 2 — Pull the source history

**Blocks:** the agent's ability to inspect commits and diffs.

```bash
npm run sync
```

The first run clones all three repositories and can take a few minutes on a
large one. Later runs take seconds. You should see:

```text
  cloning rms (blobless mirror, first run may take a while) ...
  ok    rms — main @ a1b2c3d (40 commits recorded)
  ok    oms — main @ e4f5g6h (40 commits recorded)
  ok    wms — main @ i7j8k9l (40 commits recorded)
```

**If a project fails to clone:**

| Message | Cause | Fix |
| --- | --- | --- |
| `Repository not found` | Wrong URL, or your GitHub account cannot see it | Check the URL, and confirm you have read access on GitHub |
| `could not read Username` | Git has no credentials for that host | Run `gh auth setup-git` |
| `couldn't find remote ref main` | The default branch is not `main` | Set the correct `defaultBranch` in `config/projects.json` |

Nothing this command does can affect the real repositories. It creates
read-only mirror clones under `.cache/` with the push URL disabled.

## Step 3 — See what the agent can now see

**Blocks:** nothing. This is a two-minute sanity check that the sync produced
something useful.

Open `project-state/SUMMARY.md` — all three projects, their current HEAD commit
and when they were last synced.

Then open `project-state/rms/recent-changes.md`. This is the file the agent
reads first when you describe a change. Look at the **Change Hotspots** table:
the files your team has touched most in the last 30 days. If that list looks
like the area you have been working in, the sync is wired up correctly.

Re-run `npm run sync` whenever you want fresh data. Once a day is plenty.

## Step 4 — Map the important directories

**Blocks:** nothing, but it noticeably improves the agent's first guess about
where to look in a large repository.

In `config/projects.json`, each project has a `codeMap` object. Fill in the
directory that corresponds to each logical area:

```json
"codeMap": {
  "return-portal": "apps/portal/src",
  "return-panel": "apps/panel/src",
  "cargo-integration": "services/cargo",
  "shopify-integration": "services/integrations/shopify"
}
```

Add, rename or remove keys freely — they are just labels. If a repository is
small enough that the agent can find its way around, skip this step.

## Step 5 — Try it end to end

Take a real change you are working on right now and describe it in chat, the
way you naturally would:

> RMS'te iade sebebi artık item bazında zorunlu oldu. ClickUp CU-1234. Bunun
> için test senaryosu yaz.

The agent will tell you which project it thinks is affected, read the knowledge
base and the relevant commit, and write `test-cases/rms/CU-1234.md`.

**What to look at in the result:** the **Questions / Missing Information**
section. Those are the things it could not determine. Answering them is the
single highest-leverage thing you can do — each answer becomes permanent
knowledge and stops the question from coming back.

Then record what happened when you ran the tests:

```bash
npm run log:run -- --ticket CU-1234 --project rms --env staging --tester buse \
  --case RMS-TC-001=pass \
  --case RMS-TC-002=fail:"Validation message not shown"
```

---

# Part 2 — Knowledge Gaps

Documents that exist but are empty. Each one is a stub with the section
structure already in place — you fill in the content, or dictate it in chat and
the agent writes it.

| Priority | Document | What is missing | What it unblocks |
| --- | --- | --- | --- |
| High | `knowledge/oms/system-overview.md` | Everything | Any OMS test case. Right now the agent will refuse and ask you to document it first. |
| High | `knowledge/wms/system-overview.md` | Everything | Any WMS test case, same as above. |
| High | `knowledge/testing/environments.md` | Environment URLs, test stores, where credentials live | Concrete preconditions. Test cases currently say "the test environment" instead of naming one. |
| Medium | `knowledge/testing/test-data.md` | Buyer and seller accounts, order fixtures, boundary values | Reproducible test data. The agent invents a fresh fixture per document today. |
| Medium | `knowledge/cross-project/dependency-map.md` | The Confirmed Dependencies table is empty | Cross-project E2E test cases. See Part 3, section B. |
| Low | `knowledge/rms/features/` | Documents for return lifecycle, seller panel actions, exchange flow | Deeper RMS coverage. The two existing documents cover the portal only. |

**The most efficient way to do this:** do not sit down to write a document.
Wait until a ticket touches the area, then answer the agent's questions about
it. The knowledge base fills itself in as a side effect of normal work.

If you would rather do it deliberately, `knowledge/rms/system-overview.md` is
the reference for depth and tone, and `templates/system-overview.md` has the
section skeleton.

---

# Part 3 — Open Questions

Each question blocks something specific. Answer the ones that matter for what
you are testing this week and ignore the rest.

## A. Project Scope and Ownership

The most valuable section. These answers shape how the agent reasons about
every cross-project change.

| # | Question | Why it matters |
| --- | --- | --- |
| A1 | In one sentence each, what is RMS, OMS and WMS responsible for — and what is explicitly *not* each one's job? | The agent currently infers RMS's scope from its docs and knows nothing about the other two. Boundaries decide which project a ticket belongs to. |
| A2 | Which system is the source of truth for: the order, stock levels, warehouse definitions, the return record, and refunds? | Decides which system a test case should assert against. Asserting in the wrong place produces tests that pass while the data is wrong. |
| A3 | How do the three communicate — REST calls, message queue, events, a shared database? | Determines whether timeout, retry, duplicate-delivery and out-of-order test cases are relevant at all. |
| A4 | Are they deployed independently, or released together? | If independent, deployment-order and backward-compatibility test cases are needed for every contract change. |
| A5 | Does Shopify order data reach RMS directly, or through OMS? | `knowledge/rms/` says Shopify is the source of truth for order lookup. Whether OMS sits in that path is unknown, and it changes the blast radius of any order-related change. |
| A6 | Is there a fourth system or shared service involved that is not one of these three? | Prevents the agent from writing test cases with a hole in the middle of the flow. |

## B. Cross-Project Dependencies

Six hypotheses the agent inferred from the RMS documentation. Each is marked
**Unconfirmed** in `knowledge/cross-project/dependency-map.md`. Until you
confirm or reject one, the agent will not write a test case whose expected
result depends on it.

| # | Hypothesis | Answer needed |
| --- | --- | --- |
| B1 | RMS tells WMS a return shipment is on its way | Confirm / reject, and if confirmed: what triggers it, and is it synchronous? |
| B2 | WMS tells RMS when the package physically arrives | Confirm / reject. This is what drives the `Arrived at Warehouse` status. |
| B3 | An accepted return changes stock in WMS | Confirm / reject, and if confirmed: does it go straight back to sellable stock? |
| B4 | An accepted return updates the order or triggers a refund in OMS | Confirm / reject, and if confirmed: which system issues the refund? |
| B5 | Order data reaches RMS through OMS rather than directly from Shopify | Same as A5 — answering one answers both. |
| B6 | Warehouse definitions used by RMS cargo selection are owned by WMS | Confirm / reject. Affects where warehouse configuration test cases belong. |

## C. RMS Behaviour

Pulled from the **Known Unknowns** sections you already wrote. These are the
ones that block the most test cases. The full lists are in
`knowledge/rms/system-overview.md` §8 and
`knowledge/rms/features/return-portal-order-search.md` §15.

| # | Question | Blocks |
| --- | --- | --- |
| C1 | Which exact Shopify order statuses make an order eligible for return? Is it shipment status or delivery status that decides? | Every order-eligibility test case. Currently the agent can only say "an eligible order". |
| C2 | How is the return eligibility period calculated — from which date, in which time zone, and what happens exactly at the deadline? | All return-window boundary cases, which is where the bugs usually are. |
| C3 | What happens to an item whose return was previously rejected, cancelled, or is still in progress? Are all three treated the same? | Previously-processed-item cases. Your own docs flag this as unresolved. |
| C4 | Can one request mix Return and Exchange across different items? | Multi-item request cases. Return and Exchange are mutually exclusive per item, but the per-request rule is undocumented. |
| C5 | Can a buyer create a second return request for the remaining quantity of a partially returned item? | Partial return and quantity boundary cases. |
| C6 | What are the exact return request statuses and which transitions are valid? | Every state-transition test case, including the invalid-transition negative cases. |
| C7 | What are the exact user-facing error messages? | Expected results currently describe messages instead of quoting them. |

## D. QA Workflow

Small process questions. They make the output fit how you actually work.

| # | Question | Why it matters |
| --- | --- | --- |
| D1 | What does a ClickUp ticket ID look like for you — `CU-1234`, `86abc1def`, or a custom prefix? | Test case documents are named after the ticket. A consistent format keeps `test-cases/` sorted and linkable. |
| D2 | Does anyone review test cases before they are used? | Documents carry a `status` of `draft`, `reviewed`, `approved` or `superseded`. If nobody reviews, the agent should write `approved` directly instead of leaving everything in `draft`. |
| D3 | Which environment do you normally test in? | Becomes the default in preconditions, so you stop having to correct it. |
| D4 | Do you ever need test cases in Turkish — for example to paste into a ticket for someone else? | Everything is English right now. The agent can produce a Turkish version on request if that is useful. |
| D5 | Do you want `npm run check` wired into CI so a malformed test case document fails the build? | Only worth it if this repository gets pull requests rather than direct commits. |

---

## How This Document Stays Current

The agent maintains it. When it writes a test case document with unanswered
questions, it adds the blocking ones here. When you answer something, it writes
the answer into the right `knowledge/` file and removes the row.

If a row is stale or you have decided it does not matter, delete it. An
uncluttered list is more likely to get worked through than a complete one.

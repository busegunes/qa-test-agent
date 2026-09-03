# Cross-Project Dependency Map

> **STATUS: PARTIALLY DOCUMENTED.**
>
> The hypotheses in section 3 are inferred from the RMS knowledge base and are
> **not confirmed**. The QA agent must treat them as questions, not facts, until
> they are verified and moved into section 2.

This document is the authority on how RMS, OMS and WMS affect each other. Read
it before reasoning about the impact of any change that crosses a project
boundary.

---

## 1. Why This Matters

A change inside one project can break another without breaking any of that
project's own tests. Those breaks are the most expensive to find in production
and the cheapest to catch with a deliberate integration test case.

Every test case document declares the projects it touches in its `affects`
front matter field. That field should be derived from this map.

---

## 2. Confirmed Dependencies

_None documented yet._

Fill this table in as each relationship is verified. One row per direction — if
two projects exchange data both ways, that is two rows.

| # | From | To | What is exchanged | Trigger | Sync or async | Failure behaviour |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

Column guidance:

- **Trigger** — the event that causes the exchange, not the schedule.
- **Sync or async** — whether the caller waits. This decides whether timeout and
  retry test cases are relevant.
- **Failure behaviour** — what the sender does when the receiver is down. If the
  answer is unknown, that is a test case waiting to be written.

---

## 3. Unconfirmed Hypotheses

Inferred from the RMS knowledge base. Each one needs to be confirmed or rejected.

| # | Hypothesis | Basis | Status |
| --- | --- | --- | --- |
| H1 | The RMS sends a signal to the WMS when a return shipment is dispatched, so the warehouse can expect it | RMS documents an `Arrived at Warehouse` return status | Unconfirmed |
| H2 | The WMS notifies the RMS when a return package physically arrives | The RMS `Arrived at Warehouse` transition must be triggered by something outside the RMS | Unconfirmed |
| H3 | An accepted return leads to a stock change in the WMS | Returned goods have to go somewhere | Unconfirmed |
| H4 | An accepted return leads to an order or refund update in the OMS | The RMS documents that "relevant return information is sent back to Shopify" — whether the OMS sits in that path is unknown | Unconfirmed |
| H5 | Order data reaches the RMS through the OMS rather than directly from Shopify | The RMS documents Shopify as the source of truth for order lookup, which may or may not exclude the OMS | Unconfirmed |
| H6 | Warehouse definitions used by RMS cargo selection are owned by the WMS | RMS cargo integration selects a destination warehouse country | Unconfirmed |

**Until a hypothesis is confirmed, the agent must not write a test case whose
expected result depends on it.** Raise it as a question instead.

---

## 4. Shared Data Concepts

Concepts that exist in more than one project and must mean the same thing in
each. A mismatch here is a defect class of its own.

| Concept | RMS | OMS | WMS | Same meaning? |
| --- | --- | --- | --- | --- |
| Order | Source of return eligibility, looked up in Shopify | _unknown_ | _unknown_ | Unconfirmed |
| Order item | Individually selectable unit for return or exchange | _unknown_ | _unknown_ | Unconfirmed |
| Warehouse | Destination of the return package | _unknown_ | _unknown_ | Unconfirmed |
| Stock | Not documented in the RMS | _unknown_ | _unknown_ | Unconfirmed |
| Return | First-class entity with its own lifecycle | _unknown_ | _unknown_ | Unconfirmed |

---

## 5. Standard Cross-Project Test Concerns

Apply these to every change that crosses a boundary, regardless of which
projects are involved.

| Concern | Question to answer with a test case |
| --- | --- |
| Contract change | Is a field added, removed, renamed or retyped? Does the receiver tolerate it? |
| Deployment order | If the projects deploy separately, does either order break? |
| Backward compatibility | Can the old receiver still process the new message, and vice versa? |
| Receiver unavailable | What does the sender do — fail, queue, retry, drop? |
| Timeout | What happens when the receiver is slow rather than down? |
| Duplicate delivery | Is the operation idempotent if the same message arrives twice? |
| Out-of-order delivery | Can a later event arrive before an earlier one, and does that corrupt state? |
| Partial failure | Two of three projects updated, one failed — what is the recovery path? |
| Data consistency | After the flow completes, do all three projects agree? |
| Reconciliation | Is there a mechanism to detect and repair divergence? |

---

## 6. How to Update This Document

When a relationship is confirmed:

1. Move the row from section 3 into section 2 with the details filled in.
2. Update the **Dependencies On Other Projects** table in both projects'
   `system-overview.md`.
3. Update `dependsOn` in `config/projects.json` if the direction changed.
4. Remove the corresponding bullet from each project's **Known Unknowns**.

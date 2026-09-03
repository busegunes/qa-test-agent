# Cross-Project Dependency Map

> **STATUS: PARTIALLY DOCUMENTED.**
>
> Section 2 holds two dependencies confirmed from RMS source code. Their
> existence and direction are facts; their failure and edge-case behaviour is
> not, and is tracked as open questions within that section.
>
> Section 3 holds hypotheses inferred from documentation. The QA agent must
> treat those as questions, not facts, until they are verified and moved into
> section 2.

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

Established from source code in `rms/app` on `develop`, 2026-09-03. The
existence and direction of each is confirmed; the **behavioural details** in the
last two columns still need a human answer before the related test cases can
have precise expected results.

| # | From | To | What is exchanged | Trigger | Sync or async | Failure behaviour |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | OMS | RMS | Order/return status updates | An OMS status message arrives on the queue | **Async, queue-based** | _Unknown — see Q-D1_ |
| D2 | RMS | WMS | Warehouse list is pulled from the WMS provider | Warehouse sync is triggered | Sync HTTP call | _Unknown — see Q-D2_ |

### Evidence

**D1 — OMS pushes status to RMS over a queue.** RMS runs a dedicated worker that
consumes OMS status messages and applies them to returns:

```text
src/infrastructure/services/queue/oms-status-worker/oms-status-worker.service.ts
src/infrastructure/services/queue/oms-status-worker/parse-oms-rms-status-message.ts
src/infrastructure/services/queue/oms-status-worker/oms-status-worker-types.ts
src/core/application/use-cases/return/apply-oms-status/apply-oms-status.ts
```

Because this is asynchronous and message-based, the standard concerns in
section 5 all apply: duplicate delivery, out-of-order delivery, malformed
messages, and what happens when the worker is down while messages accumulate.

**D2 — RMS integrates with an external WMS provider.** The integration is
pluggable, with two providers:

```text
src/core/application/use-cases/wms-integration/
  connect-parkpalet/
  disconnect-wms/
  get-parkpalet-warehouses/
  sync-parkpalet-warehouses/
src/core/application/use-cases/warehouse-wms-binding/
```

The connection is configured with `provider` (`HAMURLABS` or `PARKPALET`),
`baseUrl`, `apiKey`, `apiSecret`, `companyId` and `orderCodePrefix`. Warehouses
are pulled from the provider and bound to RMS warehouses through
`warehouse-wms-binding`.

**This means "WMS" is not a single system from RMS's point of view.** Any WMS
test case must state which provider it applies to, exactly as RMS test cases
distinguish Shopify from Custom integrations.

### Open behavioural questions on confirmed dependencies

| # | Question |
| --- | --- |
| Q-D1 | What happens when an OMS status message is malformed, duplicated, arrives out of order, or references an unknown return? Is the worker idempotent? |
| Q-D2 | What happens when the WMS provider is unreachable during a warehouse sync? Are previously synced warehouses kept, and can a return still be created? |
| Q-D3 | Is `HAMURLABS` in production, or is `PARKPALET` the only live provider? Determines whether both need test coverage. |

### Column guidance

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
| H1 | RMS tells the WMS provider that a return shipment is on its way | RMS documents an `Arrived at Warehouse` return status | Unconfirmed |
| H2 | The WMS provider notifies RMS when a return package physically arrives | The `Arrived at Warehouse` transition must be triggered by something outside RMS | Unconfirmed |
| H3 | An accepted return leads to a stock change in the WMS | Returned goods have to go somewhere | Unconfirmed |
| H4 | RMS pushes return outcomes *back* to the OMS | The OMS → RMS direction is confirmed (D1). The reverse direction has no code evidence yet. | Unconfirmed — direction may not exist |
| H5 | Order data reaches RMS through the OMS rather than directly from Shopify | **Evidence points against this.** RMS has no order-ingest use case for OMS; orders arrive through `store-connection` and `webhooks`. The only OMS inbound path found is status messages. | Likely false — needs a one-line confirmation |

> H6 was confirmed and moved to section 2 as **D2**.

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
| Warehouse | Destination of the return package. Pulled from the WMS provider and bound locally via `warehouse-wms-binding`. | _unknown_ | Owns the definition | Partially confirmed — RMS mirrors the provider's warehouses |
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

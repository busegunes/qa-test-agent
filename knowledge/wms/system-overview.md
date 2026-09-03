# WMS System Overview

> **STATUS: MOSTLY UNDOCUMENTED.**
>
> Section 5 — how RMS connects to the WMS — is confirmed. Everything else is a
> stub. The QA agent must not generate WMS test cases beyond what section 5 and
> the ticket text support.
>
> Use `knowledge/rms/system-overview.md` as the reference for depth and style,
> and `templates/system-overview.md` for the section structure.

## 1. System Purpose

_To be documented._

The WMS (Warehouse Management System) is one of the three systems under test.
Its responsibilities, boundaries and relationship to RMS and OMS have not yet
been described.

---

# 2. Main Users

_To be documented._

- Warehouse operators?
- Sellers?
- Internal operations staff?

---

# 3. Main System Areas

_To be documented._

---

# 4. Warehouse and Stock Model

_To be documented._

This is the most important section for test design. Document:

- How a warehouse is defined and which attributes matter (country, capacity)
- How stock is tracked
- What happens to stock when a return arrives
- Whether returned goods re-enter sellable stock, and under what conditions
- Quarantine, inspection or grading steps, if any

---

# 5. How RMS Connects to the WMS

Confirmed from `rms/app` source and from the QA owner, 2026-09-03.

**"WMS" is not one system.** RMS has a pluggable WMS integration supporting two
providers, and **both are live with different rule structures**:

| Provider | Status |
| --- | --- |
| `HAMURLABS` | Live |
| `PARKPALET` | Live |

A connection is configured with `provider`, `baseUrl`, `apiKey`, `apiSecret`,
`companyId` and `orderCodePrefix`. RMS pulls the provider's warehouse list and
binds those warehouses to its own through `warehouse-wms-binding`.

Relevant code in `rms/app`:

```text
src/core/application/use-cases/wms-integration/
src/core/application/use-cases/warehouse-wms-binding/
src/core/application/use-cases/warehouse/
```

**Every WMS statement in this document must name the provider it applies to.**
A rule verified against one provider must not be assumed to hold for the other.
A document describing the two providers' differing rules is expected from the QA
owner; until it arrives, provider-specific behaviour is undocumented.

---

# 5.1 Inbound Return Handling

_To be documented._

> **Important correction.** The RMS `Arrived at Warehouse` status is driven by
> **cargo carrier tracking**, not by the WMS. The WMS is not in that path.
> Confirmed 2026-09-03. A test case for that status must manipulate or simulate
> carrier tracking, not WMS state.

What still needs documenting on the WMS side:

- Whether the WMS is told in advance that a return shipment is coming
- How physical arrival is registered inside the WMS itself
- What is inspected, and by whom
- Whether and how an accept/reject decision reaches RMS
- Whether any of the above differs between `HAMURLABS` and `PARKPALET`

---

# 6. Dependencies On Other Projects

_To be documented._

| Direction | Project | What is exchanged | Trigger |
| --- | --- | --- | --- |
| Consumes from | | | |
| Produces for | | | |

Keep this table in sync with `knowledge/cross-project/dependency-map.md`.

---

# 7. Known Important Business Concepts

_To be documented._

The RMS knowledge base already references these warehouse concepts. Confirm
whether they mean the same thing in the WMS:

- Warehouse
- Warehouse country
- Destination warehouse
- Arrived at Warehouse

---

# 8. Known Unknowns

Section 5 is now documented. Everything else about the WMS remains unknown:

- Stock model and stock statuses
- How the RMS selects a destination warehouse among the bound ones
- Return arrival registration flow inside the WMS
- Inspection and grading rules
- Restocking rules — whether accepted returns re-enter sellable stock
- Whether and how accept/reject decisions propagate back to the RMS
- Multi-warehouse and cross-border behaviour
- What happens when the WMS provider is unreachable during a warehouse sync,
  and whether previously synced warehouses are kept
- **Every rule difference between `HAMURLABS` and `PARKPALET`**

---

# 9. QA Agent Rules

1. Do not assume the WMS behaves like the RMS.
2. The RMS knowledge base describes warehouses from the RMS point of view only.
   Do not treat that as WMS documentation.
3. **Always name the provider.** `HAMURLABS` and `PARKPALET` are both live and
   their rules differ. A test case that says "the WMS" without saying which one
   is not executable.
4. Do not route `Arrived at Warehouse` test cases through the WMS. That status
   comes from cargo carrier tracking.
5. Outside section 5, treat every WMS behaviour as undocumented and raise it as
   a question rather than an assumption.

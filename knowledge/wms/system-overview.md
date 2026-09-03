# WMS System Overview

> **STATUS: NOT DOCUMENTED.**
>
> This is a stub. The QA agent must not generate WMS test cases from anything
> other than the ticket text itself until this document is filled in.
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

# 5. Inbound Return Handling

_To be documented._

The RMS documents an `Arrived at Warehouse` return status. Document the WMS
side of that event:

- How the warehouse learns that a return shipment is coming
- How arrival is registered
- What is inspected, and by whom
- How the accept/reject decision is communicated back

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

Everything about the WMS is currently an unknown. Specifically:

- Stock model and stock statuses
- Warehouse configuration and which system owns it
- How the RMS selects a destination warehouse
- Return arrival registration flow
- Inspection and grading rules
- Restocking rules
- How accept/reject decisions propagate back to the RMS
- Multi-warehouse and cross-border behaviour
- Failure and retry behaviour between WMS and the other systems

---

# 9. QA Agent Rules

1. Do not assume the WMS behaves like the RMS.
2. The RMS knowledge base describes warehouses from the RMS point of view only.
   Do not treat that as WMS documentation.
3. Until this document is filled in, treat every WMS behaviour as undocumented
   and raise it as a question rather than an assumption.

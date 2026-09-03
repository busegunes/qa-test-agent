# OMS System Overview

> **STATUS: NOT DOCUMENTED.**
>
> This is a stub. The QA agent must not generate OMS test cases from anything
> other than the ticket text itself until this document is filled in.
>
> Use `knowledge/rms/system-overview.md` as the reference for depth and style,
> and `templates/system-overview.md` for the section structure.

## 1. System Purpose

_To be documented._

The OMS (Order Management System) is one of the three systems under test. Its
responsibilities, boundaries and relationship to RMS and WMS have not yet been
described.

---

# 2. Main Users

_To be documented._

- Who uses the OMS?
- Through which interface — panel, API, internal service?
- What can each role do?

---

# 3. Main System Areas

_To be documented._

List each user-facing or service-facing area and its high-level flow.

---

# 4. Order Lifecycle

_To be documented._

This is the most important section for test design. Document:

- Every order status
- Which transitions are valid, and what triggers each one
- Which transitions are invalid and how the system rejects them
- Which statuses are terminal

---

# 5. Integrations

_To be documented._

- Which store integrations feed the OMS?
- Which external systems does it call?
- Is Shopify connected to the OMS, to the RMS, or to both?

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

---

# 8. Known Unknowns

Everything about the OMS is currently an unknown. Specifically:

- Order statuses and their exact meaning
- Order state transition rules
- Which system owns the order record
- How order data reaches the RMS
- How a completed return is reflected on the original order
- Whether the OMS or the RMS is the source of truth for order eligibility
- Refund and financial handling
- Cancellation rules
- Partial fulfilment behaviour
- Failure and retry behaviour between OMS and the other systems

---

# 9. QA Agent Rules

1. Do not assume the OMS behaves like the RMS.
2. Do not apply Shopify-specific RMS behaviour to the OMS.
3. Until this document is filled in, treat every OMS behaviour as undocumented
   and raise it as a question rather than an assumption.

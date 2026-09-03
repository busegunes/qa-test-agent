# <PROJECT> System Overview

> Template. Replace every `<...>` placeholder and delete guidance lines that no
> longer apply. Follow the structure of `knowledge/rms/system-overview.md`, which
> is the reference example.

## 1. System Purpose

What the system is responsible for, in one or two paragraphs.

---

# 2. Main Users

Who interacts with the system, and through which surface.

---

# 3. Main System Areas

The user-facing and service-facing areas, each with its known high-level flow.

---

# 4. Integrations

External systems this project talks to, and the direction of data flow.

---

# 5. Dependencies On Other Projects

How this project relates to the other two. Be explicit about direction.

| Direction | Project | What is exchanged | Trigger |
| --- | --- | --- | --- |
| Consumes from | | | |
| Produces for | | | |

Keep `knowledge/cross-project/dependency-map.md` in sync with this table.

---

# 6. High-Level Lifecycle

```text
Step
  ↓
Step
```

---

# 7. Known Important Business Concepts

- ...

---

# 8. Known Unknowns

Everything not yet documented. The QA agent treats this list as a hard boundary
and will not assume behaviour that appears here.

- ...

---

# 9. QA Agent Rules

Project-specific rules the agent must follow when generating test cases.

1. Do not invent behaviour that is not documented.
2. ...

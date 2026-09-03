# Test Case Conventions

House style for every test case written in this repository. `AGENTS.md` defines
the mechanical format; this document defines the quality bar.

---

## 1. One Behaviour Per Test Case

A test case that verifies two things fails ambiguously. Split it.

Wrong — three behaviours in one case:

> Verify that the buyer can search an order, select items, and submit a return.

Right — three cases:

> `RMS-TC-001` Buyer can find an eligible order with a matching order number and email
> `RMS-TC-002` Buyer can select an eligible item and a quantity
> `RMS-TC-003` Buyer can submit a return request for the selected items

---

## 2. Titles State the Behaviour, Not the Action

The title should tell a reader what is being asserted without opening the case.

| Weak | Strong |
| --- | --- |
| Test order search | Order is not found when the email does not match the order number |
| Check validation | Return cannot be submitted when no return reason is selected |
| Cargo test | Inactive cargo services are excluded from the eligible service list |

---

## 3. Expected Results Are Observable

Name the thing that proves the outcome: a screen, a field, a status value, an
API response code, a record, a wallet balance.

| Weak | Strong |
| --- | --- |
| It works correctly | The return request appears in the Return Panel with status `Pending` |
| An error is shown | A validation message is shown under the return reason field, and no request is created |
| The order is not returned | The portal shows the generic order-not-found result, with no indication of which field was wrong |

Negative cases need two assertions: what the user sees, **and** what did not
happen in the system.

---

## 4. Preconditions Are Setup, Not Steps

Preconditions describe the state before the test begins. If the tester has to
perform it as part of what is being verified, it is a step.

Precondition: _An eligible delivered order exists for `buyer@example.com`._
Step: _Enter `buyer@example.com` in the email field._

---

## 5. Test Data Is Concrete

Use real, copy-pasteable values. `#1001`, not "a valid order number". Pull
reusable fixtures from `knowledge/testing/test-data.md` rather than inventing a
new account for every document.

---

## 6. Steps Are Executable Without the Ticket

Someone joining the team should be able to run the case having read only the
case. No ticket references in steps, no "as described above", no shorthand that
only makes sense to whoever wrote it.

---

## 7. Cover the Boundary, Not Just the Middle

For any rule with a limit — a return period, a weight range, a quantity, a
character count — write cases for below, at, and above the boundary. The bug
lives at the boundary.

---

## 8. Do Not Duplicate Existing Coverage

Search `test-cases/index.md` before writing. If a case already covers the
behaviour, reference its ID in the Coverage Summary rather than rewriting it. If
it covers it but is now wrong, mark the old document `superseded` in its front
matter and say so.

---

## 9. Privacy and Information Disclosure Are Functional Requirements

The RMS deliberately hides whether an order number or an email was the wrong
one. Any test case in that area must assert that the response does **not**
distinguish between the failure reasons. Treat this as a functional assertion,
not a security nice-to-have.

---

## 10. Language

Everything written into this repository is in **English** — test case titles,
steps, expected results, knowledge documents, commit messages. Chat replies
follow the user's language.

---

## 11. Priority Is About Blast Radius

`High` is not "important to me", it is "this breaking costs money, data, or
trust". Financial operations, order operations, return finalisation, security,
data loss, and cross-project integration are High. Field-level validation of an
optional input is Low, however annoying the bug would be.

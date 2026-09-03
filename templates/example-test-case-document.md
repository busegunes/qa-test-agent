---
project: rms
ticket: CU-1234
title: Add an "Other" return reason that requires a free-text comment
created: 2026-09-03
author: qa-test-agent
status: draft
coverage_status: READY WITH MINOR GAPS
source_commit: a1b2c3d
knowledge_refs: [knowledge/rms/features/return-portal-order-search.md, knowledge/rms/system-overview.md]
affects: [rms]
test_case_ids: [RMS-TC-001, RMS-TC-002, RMS-TC-003, RMS-TC-004, RMS-TC-005, RMS-TC-006, RMS-TC-007]
---

# CU-1234 — Add an "Other" return reason that requires a free-text comment

> **This is a worked example**, not a real ticket. It exists to show the expected
> depth, structure and tone. Copy `templates/test-case-document.md` for the empty
> skeleton.

## Requirement Summary

An `Other` option is added to the item-level return reason list in the Return
Portal. When the buyer selects it, a free-text comment field appears and must be
filled in before the buyer can continue. The comment is stored with the return
request item and displayed in the Return Panel alongside the reason.

Return reasons are set per item, and an order may contain items with different
reasons, so `Other` must be selectable on some items while other items use a
predefined reason.

## Change Context

| Field | Value |
| --- | --- |
| Project | RMS |
| Branch / commit reviewed | `a1b2c3d` on `main` |
| Source files inspected | `src/portal/return-reason-select.tsx`, `src/api/return-request.ts` |
| Knowledge documents used | `knowledge/rms/features/return-portal-order-search.md` §9, `knowledge/rms/system-overview.md` §3.1 |
| Related previous test cases | None — first document covering return reasons |

## Questions / Missing Information

| ID | Question | Why It Matters |
| --- | --- | --- |
| Q1 | What is the maximum length of the comment field? | Boundary cases cannot be written without a limit, and an unbounded field is a storage and display risk. |
| Q2 | Is the comment field trimmed, and does a whitespace-only value count as filled? | Decides whether `RMS-TC-004` expects a block or a pass. |
| Q3 | How does `Other` appear in the Return Panel analytics charts? As its own slice, grouped, or excluded? | `knowledge/rms/features/return-portal-order-search.md` §9 states reason data feeds analytics; the ticket does not say what happens to a free-text reason there. |
| Q4 | Is the comment visible to the seller only, or also sent back to Shopify? | Determines whether a downstream assertion is needed. |

## Assumptions

- The comment field is optional to display and only becomes required once
  `Other` is selected. The ticket implies this but does not state it.

---

# Test Cases

## RMS-TC-001 — Buyer can submit a return using the "Other" reason with a comment

**Priority:** High

**Type:** Positive

**Preconditions:**

- Shopify store integration is active for the test store
- An eligible delivered order exists for the buyer
- The `Other` return reason is enabled for the store's return category

**Test Data:**

- Order: `order-eligible-single`
- Email: `buyer@example.com`
- Comment: `The zipper broke after two days`

**Steps:**

1. Open the Return Portal for the test store.
2. Enter the order number and email, then submit.
3. Select the single eligible item.
4. Open the return reason list for that item and select `Other`.
5. Enter the comment in the field that appears.
6. Complete the remaining steps and submit the return request.

**Expected Result:**

- The return request is created.
- The request appears in the Return Panel.
- The item shows reason `Other` and the comment text `The zipper broke after two days`.

## RMS-TC-002 — Comment field appears only when "Other" is selected

**Priority:** Medium

**Type:** Positive

**Preconditions:**

- The buyer has reached the item selection step for an eligible order

**Test Data:**

- Order: `order-eligible-single`

**Steps:**

1. Select the eligible item.
2. Open the return reason list and select a predefined reason.
3. Observe the area below the reason field.
4. Change the reason to `Other`.
5. Observe the area below the reason field again.
6. Change the reason back to the predefined one.

**Expected Result:**

- No comment field is displayed for the predefined reason at step 3.
- The comment field is displayed at step 5.
- The comment field is hidden again at step 6.

## RMS-TC-003 — Return cannot be submitted when "Other" is selected and the comment is empty

**Priority:** High

**Type:** Negative

**Preconditions:**

- The buyer has reached the item selection step for an eligible order

**Test Data:**

- Order: `order-eligible-single`
- Comment: _(left empty)_

**Steps:**

1. Select the eligible item.
2. Select `Other` as the return reason.
3. Leave the comment field empty.
4. Attempt to continue to the next step.

**Expected Result:**

- The buyer cannot continue.
- A validation message is shown on the comment field.
- No return request is created in the Return Panel.

## RMS-TC-004 — Whitespace-only comment is rejected

**Priority:** Medium

**Type:** Negative

**Preconditions:**

- The buyer has reached the item selection step for an eligible order

**Test Data:**

- Comment: three space characters

**Steps:**

1. Select the eligible item.
2. Select `Other` as the return reason.
3. Enter three space characters in the comment field.
4. Attempt to continue to the next step.

**Expected Result:**

- The buyer cannot continue.
- The same validation message as an empty comment is shown.
- No return request is created.

_Depends on the answer to Q2. If whitespace is accepted, this case is replaced
by one asserting the stored value._

## RMS-TC-005 — Different items in one order can use different reasons

**Priority:** High

**Type:** Positive

**Preconditions:**

- An eligible delivered order with at least three items exists

**Test Data:**

- Order: `order-eligible-multi`
- Item 1 reason: predefined
- Item 2 reason: `Other`, comment `Wrong size sent`
- Item 3 reason: `Other`, comment `Colour differs from the listing`

**Steps:**

1. Select all three items for return.
2. Set a predefined reason on item 1.
3. Set `Other` on item 2 and enter its comment.
4. Set `Other` on item 3 and enter its comment.
5. Submit the return request.

**Expected Result:**

- The request is created with all three items.
- The Return Panel shows the predefined reason on item 1.
- The Return Panel shows each item's own comment on items 2 and 3, not shared or overwritten.

## RMS-TC-006 — Comment survives navigating back and forward through the portal

**Priority:** Medium

**Type:** Edge Case

**Preconditions:**

- The buyer has selected `Other` and entered a comment

**Test Data:**

- Comment: `Damaged in transit`

**Steps:**

1. Enter the comment and continue to the next step.
2. Navigate back to the item selection step.
3. Inspect the reason and comment for the item.

**Expected Result:**

- The reason is still `Other`.
- The comment field still contains `Damaged in transit`.

## RMS-TC-007 — Comment is stored and displayed without markup injection

**Priority:** High

**Type:** Negative

**Preconditions:**

- The buyer has reached the item selection step for an eligible order

**Test Data:**

- Comment: `<script>alert(1)</script>` and `'; DROP TABLE returns; --`

**Steps:**

1. Select `Other` and enter the first payload as the comment.
2. Submit the return request.
3. Open the request in the Return Panel.
4. Repeat with the second payload on a new request.

**Expected Result:**

- Both requests are created.
- The Return Panel renders the payloads as literal text.
- No script executes and no console error appears.
- The stored value matches what the buyer entered.

---

# Coverage Summary

### Covered Areas

- `Other` reason selection and submission at item level
- Conditional display of the comment field
- Comment required validation, including whitespace
- Per-item independence of reasons and comments across a multi-item order
- Comment persistence across portal navigation
- Input sanitisation on storage and display

### Regression Areas

Derived from `knowledge/rms/features/return-portal-order-search.md` §14:

- Item-level return reason selection with predefined reasons
- Return request creation payload
- Return Panel display of return reasons
- Return reason analytics and charts
- Multi-item request handling

### Cross-Project Impact

None identified. Return reasons are not documented as crossing into OMS or WMS.
If Q4 confirms the comment is sent to Shopify, a downstream case is needed.

### Potential Gaps

- Comment length boundary cases — blocked on Q1
- Analytics behaviour for `Other` — blocked on Q3
- Exchange requests were not covered; the ticket does not say whether `Other`
  applies to exchanges as well as returns

### Missing Requirement Information

See Q1 through Q4 above. Q1 and Q3 block full coverage.

### Final Coverage Status

READY WITH MINOR GAPS

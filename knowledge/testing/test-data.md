# Reusable Test Data

> **STATUS: NOT DOCUMENTED.** Fill this in so the agent stops inventing a new
> fixture for every test case.

Stable fixtures the agent can reference by name in **Test Data** blocks. Reusing
these makes test cases reproducible and keeps preconditions short.

Do not put real customer data or credentials in this file.

---

## 1. Buyer Accounts

| Reference | Email | Store | State | Notes |
| --- | --- | --- | --- | --- |
| `buyer-standard` | | | | Baseline happy-path buyer |
| `buyer-no-orders` | | | | For empty-result cases |
| `buyer-expired` | | | | Orders outside the return window |

---

## 2. Seller Accounts

| Reference | Login | Panel | Configuration | Notes |
| --- | --- | --- | --- | --- |
| `seller-pplt` | | Return Panel | ParkPalet cargo agreement | |
| `seller-own-deal` | | Return Panel | Own cargo agreement | |
| `seller-both-deals` | | Return Panel | Both agreements enabled | |

---

## 3. Orders

The most valuable fixtures. Cover each eligibility state.

| Reference | Order number | Store | Items | State | Good for |
| --- | --- | --- | --- | --- | --- |
| `order-eligible-single` | | | 1 item | Delivered | Happy path |
| `order-eligible-multi` | | | 3+ items | Delivered | Partial return, quantity selection |
| `order-multi-quantity` | | | Product A × 5 | Delivered | Quantity boundary cases |
| `order-not-shipped` | | | | Not shipped | Ineligible order |
| `order-partially-returned` | | | | Partial return done | Previously processed items |
| `order-expired-window` | | | | Past return period | Return period boundary |

---

## 4. Products

| Reference | SKU | Attributes | Good for |
| --- | --- | --- | --- |
| `product-standard` | | | Baseline |
| `product-heavy` | | Weight above a cargo service limit | Cargo weight boundary |
| `product-non-returnable` | | Excluded return category | Item-level eligibility |

---

## 5. Cargo Configurations

| Reference | Carrier | Origin → Destination | Weight range | Active | Good for |
| --- | --- | --- | --- | --- | --- |
| `cargo-tr-domestic` | | TR → TR | | Yes | Domestic happy path |
| `cargo-inactive` | | | | No | Inactive service exclusion |
| `cargo-out-of-range` | | | | Yes | Weight boundary |

---

## 6. Boundary Values

Values that sit exactly on a documented limit. Write them down once so every
test case uses the same number.

| Rule | Below | At limit | Above |
| --- | --- | --- | --- |
| Return eligibility period | | | |
| Cargo weight range | | | |
| Return quantity per item | | | |

---

## 7. Data Reset

How to restore a fixture after a destructive test — a return submitted against
`order-eligible-single` cannot be submitted again.

| Fixture | How to reset | Who can do it |
| --- | --- | --- |
| | | |

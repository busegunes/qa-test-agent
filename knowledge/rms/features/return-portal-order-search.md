# Return Portal - Order Search and Item Eligibility

## 1. Scope

This document describes the order search, ownership verification, order eligibility, and item selection behavior of the RMS Return Portal.

This functionality is currently specific to the Shopify Return Portal.

These rules must not automatically be applied to Custom integrations.

---

# 2. Purpose of Order Number and Email

The buyer provides two pieces of information:

* Order Number
* Email Address

These fields are used together to verify that the buyer is associated with the requested order.

The purpose of this step is not only to find an order. It also acts as an ownership verification mechanism before the buyer can access order items and create a return or exchange request.

The system searches Shopify for an order that satisfies both conditions simultaneously:

1. The provided order number matches the order.
2. The provided email matches the email associated with that Shopify order.

Both conditions must be satisfied.

---

# 3. Order Ownership Verification

The system does not validate the relationship between the email and order number using only the RMS database.

Shopify is the source of truth for this verification.

The RMS searches the Shopify order data using the provided:

* Order Number
* Email Address

The order must match both values.

## Expected Matching Behavior

| Order Number | Email     | Result                                          |
| ------------ | --------- | ----------------------------------------------- |
| Correct      | Correct   | Order may be found if it is eligible for return |
| Incorrect    | Correct   | Order is not found                              |
| Correct      | Incorrect | Order is not found                              |
| Incorrect    | Incorrect | Order is not found                              |

The system must not reveal which field is incorrect.

For example:

* The system must not say "Incorrect email".
* The system must not say "Incorrect order number".

Instead, an unsuccessful search should appear to the buyer as an order-not-found result.

This behavior is intended to make it more difficult for a user to discover or access another person's order by guessing order numbers or email addresses.

---

# 4. Order Eligibility

A correct order number and email combination does not guarantee that the order will be returned to the buyer.

The order must also be in a state that is eligible for the return process.

Based on the currently known behavior:

* Orders that have not yet been shipped are not eligible.
* Orders that have not yet reached the required delivery or post-shipment state are not eligible.
* Ineligible orders should not be returned as valid searchable orders for the purpose of creating a return request.

Therefore, from the buyer's perspective, the following situations may all result in an order-not-found response:

1. Incorrect order number
2. Incorrect email address
3. Order number and email do not belong together
4. The order exists but is not yet eligible for return

The system intentionally does not expose the exact reason to the buyer.

The exact Shopify statuses that make an order eligible or ineligible should be documented separately.

---

# 5. Order Number Input and Normalization

The buyer may enter the order number in different formats.

Examples may include:

* `#1001`
* `1001`
* Store-specific formats such as `PP-1001`

The system should interpret the buyer's input and normalize or transform it according to the store's Shopify order naming format before searching for the order.

The purpose is to allow the buyer to use the order number as it appears in:

* Order confirmation emails
* Shipping information
* Store-specific order references
* Other customer-facing order communications

Different valid representations of the same order should resolve to the same Shopify order when supported by the store's configured order format.

The exact normalization rules may vary depending on the store configuration.

---

# 6. Order Found - Item Listing

After successful ownership verification and order eligibility validation, the system retrieves and displays the items belonging to the order.

Items are handled individually.

The buyer can review the items included in the order and select the items and quantities for return or exchange.

---

# 7. Item-Level Return Eligibility

Each order item can have its own return eligibility state.

After the order is successfully found, the system indicates which items are currently eligible for return or exchange.

Return eligibility is associated with the return category configuration.

When a return category is defined, a return eligibility period is also defined.

The system uses the relevant eligibility rules to determine whether an item is still within its allowed return period.

The exact calculation of the return eligibility period should be documented separately.

---

# 8. Previously Processed Items

Items that have previously been used in a return or exchange process cannot be selected again.

Previously returned or exchanged items are displayed in a disabled state.

The buyer can see these items but cannot select them for a new return or exchange request.

The exact rules should be clarified for cases such as:

* A previously rejected return
* A cancelled return request
* A partially completed return
* An exchange that failed
* A return request that is still in progress

Until documented otherwise, the QA Agent must not assume that all previous return-related states behave the same way.

---

# 9. Return Reason

The buyer provides a return reason at the item level.

Each selected item can have its own return reason.

Return reasons are transferred to the Return Panel and are used in analytics and reporting.

The reason data is used, including in analytical charts, to provide visibility into why items are being returned.

Therefore, when testing changes related to return reasons, the following potential areas may be relevant:

* Return Portal
* Item-level return request data
* Return Panel
* Analytics and charts
* Reporting or other downstream consumers of return reason data

The exact available return reasons and category configuration should be documented separately.

---

# 10. Return and Exchange Selection

An individual item can have one request type:

* Return
* Exchange

An item cannot be both returned and exchanged at the same time within the same request.

Return and Exchange are mutually exclusive at the item level.

The exact behavior when multiple items exist in the same order should be evaluated based on documented requirements.

For example, it should not automatically be assumed that all selected items in an order must use the same request type.

This should be tested or clarified based on the relevant feature requirements.

---

# 11. Quantity and Item Selection

Order items are represented separately for return and exchange selection.

If an order contains multiple units of the same product, the buyer can select the desired quantity to be returned or exchanged.

Example:

An order contains:

* Product A × 5

The buyer may select a quantity from the available units according to the supported return rules.

The exact quantity limits and behavior for partially returned quantities should be documented separately.

Important scenarios may include:

* Selecting one unit
* Selecting multiple units
* Selecting all available units
* Selecting a quantity greater than the available quantity
* Previously returned quantities
* Mixed quantities across multiple return requests

The QA Agent must not assume unsupported quantity behavior unless it is documented.

---

# 12. High-Level Flow

```text
Buyer Opens Shopify Return Portal
        ↓
Buyer Enters Order Number
        +
Buyer Enters Email Address
        ↓
System Normalizes Order Number When Required
        ↓
RMS Searches Shopify
        ↓
Do Order Number and Email Match the Same Order?
        │
        ├── No
        │     ↓
        │  Order Not Found
        │
        └── Yes
              ↓
        Is the Order Eligible for Return?
              │
              ├── No
              │     ↓
              │  Order Not Found
              │
              └── Yes
                    ↓
              Order Is Found
                    ↓
              Order Items Are Listed
                    ↓
              Evaluate Each Item
                    │
                    ├── Within Return Period?
                    ├── Previously Returned / Exchanged?
                    └── Available Quantity?
                    ↓
              Eligible Items Can Be Selected
                    ↓
              Buyer Selects Quantity
                    ↓
              Buyer Selects:
              - Return
              OR
              - Exchange
                    ↓
              Buyer Selects Item-Level Return Reason
```

---

# 13. Security and Privacy Considerations

The order search behavior contains an important privacy and security principle.

The system must not expose whether:

* An order number exists
* An email address is associated with an existing order
* Only one of the two provided values is correct
* An existing order belongs to another customer

The buyer should receive the same general unsuccessful result when the order cannot be retrieved for any ownership or eligibility-related reason.

When generating test cases for changes affecting this flow, the QA Agent should consider:

* Information disclosure
* Order enumeration
* Email guessing
* Unauthorized order access
* Differences between invalid order and invalid email responses
* Differences between existing but ineligible orders and non-existing orders

---

# 14. Regression Areas

Changes affecting order search or item eligibility may impact:

* Shopify integration
* Shopify order lookup
* Order number normalization
* Email matching
* Buyer ownership verification
* Order eligibility
* Return eligibility periods
* Item listing
* Disabled items
* Previously returned items
* Previously exchanged items
* Quantity selection
* Partial returns
* Return reasons
* Return Panel data
* Return analytics
* Privacy and security behavior

---

# 15. Known Unknowns

The following information is not yet fully documented and must not be assumed:

* Exact Shopify statuses required for return eligibility
* Whether shipment status or delivery status determines eligibility
* Exact return period calculation
* The date from which the return period starts
* Time zone behavior for return period expiration
* Behavior at the exact return deadline
* Whether expired items are hidden, disabled, or displayed with another state
* Exact behavior for partially returned quantities
* Whether multiple separate return requests can be created for remaining quantities
* Behavior of rejected return requests
* Behavior of cancelled return requests
* Behavior of in-progress return requests
* Whether return and exchange types can be mixed across different items in the same request
* Exact validation behavior for empty order number
* Exact validation behavior for empty email
* Email format validation behavior
* Order number format validation behavior
* Exact user-facing error messages
* Store-specific order number normalization rules

---

# 16. QA Agent Rules for This Feature

When analyzing a ClickUp ticket related to Shopify Return Portal order search or item selection:

1. Identify whether the ticket affects order search, ownership verification, eligibility, item selection, quantity, return reason, return type, or a combination of these.
2. Use Shopify as the source of truth for order and email matching.
3. Do not assume RMS database data is used for ownership verification.
4. Consider privacy and information disclosure risks.
5. Do not create separate expected errors for incorrect email and incorrect order number unless the requirement explicitly changes this behavior.
6. Consider order eligibility separately from ownership verification.
7. Consider item-level eligibility separately from order-level eligibility.
8. Treat previously returned or exchanged items as unavailable for new selection unless the relevant ticket documents another behavior.
9. Consider item-level return reason data and its downstream analytics impact.
10. Treat Return and Exchange as mutually exclusive for the same item.
11. Consider quantity-related regression when a change affects item selection.
12. Do not automatically apply Shopify-specific behavior to Custom integrations.
13. If a ClickUp ticket contradicts this document, flag the potential system behavior change and identify relevant regression areas.

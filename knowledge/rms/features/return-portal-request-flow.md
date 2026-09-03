# Return Portal - Item Selection, Cargo, Exchange and Summary Flow

## 1. Scope

This document describes the Shopify Return Portal flow after an eligible order has been found.

The documented flow covers:

- Individual item representation and selection
- Multiple item requests
- Item-level return reasons
- Return and Exchange request types
- Exchange availability and configuration
- Exchange Credit calculation
- Return cargo selection
- Shopify storefront redirection
- Exchange Widget behavior
- New product selection
- Return Summary
- Refund methods
- Payment and regional behavior

This document currently applies to the Shopify Return Portal unless explicitly stated otherwise.

These rules must not automatically be applied to Custom integrations.

---

# 2. Order Item Representation

Items within an order are treated as individually selectable units.

For example, if an order contains:

- Product A × 3
- Product B × 2

A total of 5 product units are represented for selection.

The buyer can select the desired units individually.

This allows partial return or exchange requests.

Example:

```text
Order
│
├── Product A × 3
│
└── Product B × 2
```

The buyer may select only some of the available units.

The exact UI representation may vary, but the business behavior is that individual product quantities can be selected independently.

---

# 3. Multiple Item Selection

A single return request can contain multiple products.

The buyer is not limited to one item.

Example:

```text
Return Request
│
├── Product A → Return
│
├── Product B → Exchange
│
└── Product C → Return
```

When Exchange is enabled, different products within the same request may have different request types.

---

# 4. Item-Level Return Reason

Each selected product has its own return reason.

Return reasons are associated with individual items rather than only the overall request.

Example:

| Product | Request Type | Return Reason |
|---|---|---|
| Product A | Return | Damaged |
| Product B | Exchange | Wrong Size |
| Product C | Return | Different Product Received |

The return reason must remain associated with the correct item throughout the flow.

Return reason data may later be used in:

- Return Panel
- Analytics
- Reporting
- Charts

---

# 5. Return and Exchange Request Types

When Exchange is available for the relevant product, the buyer can select one request type per item:

- Return
- Exchange

Return and Exchange are mutually exclusive for the same item.

A single item must not simultaneously be both Return and Exchange.

Different items within the same request may use different request types.

Example:

```text
Product A → Return
Product B → Exchange
Product C → Return
```

---

# 6. Exchange Availability

Exchange is not universally available.

Exchange availability depends on multiple configuration layers.

For the Exchange flow to work end-to-end, the following conditions are relevant:

```text
Store Exchange Permission
        +
Return Category Exchange Permission
        +
Shopify Exchange Widget Permission
        ↓
Exchange Flow Available
```

The first two permissions are configured through the Return Panel.

The Shopify widget permission is configured on the Shopify store side.

---

## 6.1 Store-Level Exchange Permission

The seller must first allow Exchange for the relevant store.

This configuration is managed in:

```text
Return Panel
→ My Store Integrations
```

The store must have Exchange enabled.

Store-level Exchange permission alone is not sufficient to make every product exchangeable.

The relevant Return Category must also allow Exchange.

---

## 6.2 Exchange Bonus

When Exchange is enabled for the store, the seller can optionally configure an Exchange Bonus.

The Exchange Bonus acts as an incentive by increasing the Exchange Credit available to the buyer.

The seller can configure the bonus as either:

- Fixed Amount
- Ratio / Percentage

---

### 6.2.1 Fixed Amount Bonus

Example:

```text
Product Price = 100 TL
Exchange Bonus = 5 TL
```

Calculation:

```text
Exchange Credit = Product Price + Fixed Bonus
Exchange Credit = 100 + 5
Exchange Credit = 105 TL
```

---

### 6.2.2 Percentage / Ratio Bonus

Example:

```text
Product Price = 100 TL
Exchange Bonus Ratio = 20%
```

Calculation:

```text
Exchange Credit =
Product Price + (Product Price × Bonus Ratio)

100 + (100 × 20%)

Exchange Credit = 120 TL
```

---

### 6.2.3 Bonus Type Selected but No Value Entered

The seller may select:

- Fixed Amount

or:

- Ratio

without entering a bonus value.

In this case, no additional bonus is applied.

Example:

```text
Product Price = 100 TL
Bonus Type = Ratio
Bonus Value = empty

Exchange Credit = 100 TL
```

The same logic applies when Fixed Amount is selected but no value is entered.

The resulting Exchange Credit is equal to the original product price.

---

# 7. Return Category Exchange Permission

Exchange must also be enabled for the relevant Return Category.

This configuration is managed in:

```text
Return Panel
→ My Return Categories
```

The relevant category must have the `Exchange Allowed` option enabled.

Therefore, the following are separate conditions:

1. Exchange is allowed for the store.
2. Exchange is allowed for the product's Return Category.

Store-level Exchange permission does not automatically make all Return Categories exchangeable.

---

# 8. Shopify Exchange Widget Permission

After Exchange is configured in the Return Panel, the Shopify store must allow the Exchange Widget.

This is configured through the Shopify Theme application area.

Conceptually:

```text
Shopify Store
→ Theme
→ Apps
→ Allow / Enable Exchange Widget
```

The Exchange Widget is required for the buyer to select replacement products while tracking available Exchange Credit.

---

# 9. Exchange Configuration Matrix

| Store Exchange | Category Exchange | Shopify Widget | Expected Result |
|---|---|---|---|
| Enabled | Enabled | Enabled | Exchange flow can work |
| Enabled | Disabled | Enabled | Exchange should not be available for the affected category |
| Disabled | Enabled | Enabled | Exchange should not be available |
| Enabled | Enabled | Disabled | Shopify storefront Exchange flow may not function |
| Disabled | Disabled | Disabled | Exchange unavailable |

The exact user-facing behavior for missing configuration must follow the relevant implementation or requirement.

The QA Agent must not invent undocumented fallback behavior.

---

# 10. Return Portal Flow - Exchange Enabled

When the Exchange feature is available, the Return Portal contains 5 main steps:

```text
1. Find Return Order
        ↓
2. Select Return Items
        ↓
3. Select Return Cargo
        ↓
4. Select New Product
        ↓
5. Return Summary
```

---

## Step 1 - Find Return Order

The buyer enters:

- Order Number
- Email Address

The buyer then selects:

`Find My Order`

The order is searched and validated according to the Shopify Return Portal order search and ownership rules.

---

## Step 2 - Select Return Items

The buyer:

- Selects the items to include in the request.
- Selects the desired quantity or individual product units.
- Selects a return reason for each selected item.
- Selects Return or Exchange when Exchange is available for the relevant item.

A single request may contain:

- Multiple items
- Multiple Return items
- Multiple Exchange items
- A combination of Return and Exchange items

---

## Step 3 - Select Return Cargo

The buyer sees the return cargo options configured by the seller.

Cargo options may include:

- Seller's own cargo deals
- ParkPalet deal cargo options

When cargo options are available, the buyer selects one using a radio button.

The buyer then clicks `Next` to continue.

---

# 11. No Cargo Option Available

A store may have no configured return cargo option.

In this situation:

- The portal displays a message indicating that no suitable cargo option is available.
- The buyer is not blocked from continuing.
- The `Next` button remains active.
- The buyer can proceed without selecting a cargo option.

The absence of cargo configuration must not automatically block the request flow.

---

# 12. Cargo Fee Responsibility

Cargo fee responsibility may depend on store region and configuration.

## Turkey Stores

For Turkey stores, the return cargo cost belongs to the seller.

For the currently documented flow, no additional cargo payment is required from the buyer.

## Europe and United States Stores

For Europe and United States stores, the seller may configure the buyer to pay the cargo fee.

The seller determines the applicable fee through the Return Panel.

When a buyer payment is required, the payment amount may appear in the final summary.

The detailed cargo configuration rules should be documented separately.

---

# 13. Exchange Credit Calculation

When the buyer selects Exchange for an item, the system calculates Exchange Credit.

The calculation is based on:

- Original product price
- Optional Exchange Bonus

Formula:

```text
Exchange Credit =
Original Product Price + Exchange Bonus
```

Where Exchange Bonus may be:

```text
Fixed Amount
```

or:

```text
Original Product Price × Bonus Ratio
```

Example:

```text
Original Product Price = 100 TL
Bonus = 20%

Exchange Credit = 120 TL
```

The QA Agent should treat Exchange Credit calculation as business logic, not only UI behavior.

---

# 14. Select New Product

After:

```text
Find Return Order
        ↓
Select Return Items
        ↓
Select Exchange
        ↓
Select Return Cargo
```

the buyer reaches:

```text
Select New Product
```

At this stage, the buyer is redirected to the seller's Shopify storefront.

The purpose is to allow the buyer to select replacement products from the actual store.

---

# 15. Exchange Widget

While the buyer browses the Shopify storefront, a movable Exchange Widget is displayed.

The widget displays the buyer's available Exchange Credit.

The widget includes actions such as:

- Back
- Go to Summary

The widget allows the buyer to track the remaining Exchange Credit while browsing and selecting products.

---

# 16. Cart Monitoring and Exchange Credit Tracking

The Exchange Widget listens to the Shopify cart.

When the buyer adds products to the cart, the widget updates the remaining Exchange Credit.

Example:

```text
Exchange Credit = 120 TL
New Product = 80 TL

Remaining Exchange Credit = 40 TL
```

Formula:

```text
Remaining Exchange Credit =
Exchange Credit - Selected New Product Total
```

The remaining amount should reflect the current cart state.

This means cart changes may affect the displayed credit.

Relevant cart actions may include:

- Adding a product
- Removing a product
- Adding multiple products
- Changing quantity

The exact behavior for all cart scenarios should be validated against detailed requirements.

---

# 17. Multiple Replacement Products

The Exchange Widget follows the Shopify cart rather than only a single product.

Therefore, the total value of replacement products may affect the remaining Exchange Credit.

Example:

```text
Exchange Credit = 120 TL

Product A = 50 TL
Product B = 40 TL

Cart Total = 90 TL

Remaining Exchange Credit = 30 TL
```

The exact business rules for:

- Products exceeding available Exchange Credit
- Negative remaining credit
- Quantity changes
- Cart item removal
- Variant changes
- Stock availability

must not be assumed unless documented.

---

# 18. Go to Summary

When the buyer clicks:

`Go to Summary`

in the Exchange Widget, the buyer returns to the Return Portal and reaches:

```text
Return Summary
```

The selected replacement product information must be carried into the summary.

---

# 19. Return Portal Flow - Exchange Disabled

When Exchange is not enabled for the store or relevant configuration, the Return Portal contains 4 steps:

```text
1. Find Return Order
        ↓
2. Select Return Items
        ↓
3. Select Return Cargo
        ↓
4. Return Summary
```

The `Select New Product` step does not exist.

---

## Select Return Items When Exchange Is Disabled

When Exchange is unavailable:

- The buyer selects the products to return.
- The buyer selects a return reason for each selected item.
- Exchange is not available as a request type.
- Selected items are treated as Return requests.

The buyer must not be able to create an Exchange request through this flow.

---

# 20. Return Summary

The Return Summary is the final review step before the request is completed or payment is made.

The displayed information may vary depending on:

- Return items
- Exchange items
- Mixed Return + Exchange requests
- Selected replacement products
- Cargo fee
- Regional configuration
- Refund method
- Final financial calculation

---

# 21. Returned and Exchanged Products

The Return Summary displays the products involved in the request.

For Exchange items, the summary displays:

- The original product selected for Exchange
- The replacement product selected from the Shopify storefront

For Return items, the summary displays the relevant returned products.

The summary must correctly represent mixed requests.

Example:

```text
Product A → Return
Product B → Exchange → New Product X
Product C → Return
```

---

# 22. No Replacement Product Selected

If an Exchange item exists but a replacement product has not been selected, the Return Summary provides an action such as:

`Select New Product`

or:

`Add New Product`

This allows the buyer to return to the Shopify storefront and select replacement products.

The exact navigation and state preservation behavior should be documented and tested separately.

---

# 23. Return Cargo in Summary

The selected return cargo is displayed in the Return Summary.

The summary should reflect the cargo selected during:

```text
Select Return Cargo
```

The exact behavior when no cargo was selected because no cargo options were configured should be tested according to the relevant implementation.

---

# 24. Refund / Payment Method

The Return Summary displays the available refund method.

Documented methods include:

- Original Payment Method
- Gift Card

The buyer may see the relevant available refund options in the summary.

The exact configuration rules determining which methods are available should be documented separately.

---

# 25. Payment Summary

The Return Summary displays financial information related to the request.

Depending on the request, this may include:

- New Product Payment
- Returned Product Refund
- Exchange Bonus
- Cargo Fee
- Final Refund Amount
- Final Payment Amount

Example:

```text
New Products Payment      20 TL
Returned Products        -48 TL
Exchange Bonus           -10 TL
--------------------------------
Refund Amount             38 TL
```

Another scenario may include a cargo payment:

```text
Cargo Payment             80 TL
```

The exact calculation rules should be treated as separate business logic.

The QA Agent must verify calculations independently instead of assuming that correct UI display guarantees correct calculation.

---

# 26. Regional Final Action

The final action depends on whether an additional payment is required.

## Turkey

For the documented Turkey flow where no buyer payment is required:

```text
Complete
```

is displayed.

The buyer completes the request without an additional payment at this stage.

## Europe

For European orders, an additional cargo fee or other payment may be required.

When payment is required:

```text
Pay
```

is displayed.

The buyer must complete the payment flow.

The exact payment provider and post-payment behavior should be documented separately.

---

# 27. Return and Exchange Summary Combinations

The Return Summary may contain different combinations.

### Return Only

```text
Product A → Return
Product B → Return
```

### Exchange Only

```text
Product A → Exchange
Product B → Exchange
```

### Mixed Request

```text
Product A → Return
Product B → Exchange
Product C → Return
```

The system must correctly handle the items, financial calculations, and final action for the relevant combination.

---

# 28. Important Business Rules

The following rules are currently known:

1. A single order can contain multiple individually selectable product units.
2. A single request can contain multiple products.
3. Each selected product has its own return reason.
4. Different products in the same request may have different request types.
5. The same item cannot simultaneously be both Return and Exchange.
6. Exchange depends on store-level configuration.
7. Exchange also depends on the relevant Return Category configuration.
8. The Shopify Exchange Widget must be available for the storefront product-selection flow.
9. Exchange Credit may include an optional Fixed Amount or Ratio bonus.
10. If a bonus type is selected but no bonus value is entered, the Exchange Credit equals the original product price.
11. The Exchange Widget tracks the Shopify cart.
12. Adding products to the cart reduces the displayed remaining Exchange Credit.
13. Multiple replacement products may affect the remaining Exchange Credit.
14. No configured cargo option does not block the buyer from continuing.
15. Turkey return cargo is seller-paid in the currently documented flow.
16. Europe and United States stores may be configured so that the buyer pays cargo.
17. Exchange-enabled flow contains 5 main steps.
18. Exchange-disabled flow contains 4 main steps.
19. Return Summary displays different information depending on Return, Exchange, or mixed requests.
20. The final action may be `Complete` or `Pay` depending on whether buyer payment is required.

---

# 29. Regression Areas

Changes related to this flow may affect:

## Return Portal

- Step navigation
- Item selection
- Quantity selection
- Return reason selection
- Request type selection
- Return Summary

## Exchange

- Store Exchange configuration
- Return Category Exchange configuration
- Exchange Bonus
- Fixed bonus calculation
- Ratio bonus calculation
- Empty bonus value behavior
- Exchange Credit calculation
- Mixed Return + Exchange requests

## Shopify

- Storefront redirection
- Exchange Widget availability
- Widget behavior
- Cart monitoring
- Product selection
- Cart updates

## Cargo

- Seller cargo deals
- ParkPalet deal cargo options
- No cargo configuration
- Cargo selection
- Regional cargo fees

## Financial

- Product refund
- Exchange Credit
- Exchange Bonus
- New product cost
- Remaining credit
- Cargo payment
- Final refund amount
- Final payment amount

## Regional

- Turkey flow
- Europe flow
- United States store configuration where buyer-paid cargo is applicable

---

# 30. Known Unknowns

The following information is not yet fully documented and must not be assumed:

## Exchange Configuration

- Exact behavior when only one required configuration layer is missing.
- Exact user-facing errors or hidden states when Exchange is unavailable.

## Exchange Credit

- Behavior when the replacement product total exceeds Exchange Credit.
- Whether negative remaining credit is allowed.
- How additional payment is calculated for products exceeding credit.
- Rounding rules for ratio bonuses.
- Currency conversion behavior.
- Tax handling.
- Discount handling.
- Whether original product price means paid price, list price, discounted price, or another value.

## Shopify Product Selection

- Variant selection rules.
- Stock validation rules.
- Out-of-stock behavior.
- Whether replacement products must belong to the same collection or category.
- Whether replacement quantity can exceed the exchanged quantity.
- Cart persistence behavior.
- Behavior when the buyer manually changes the cart.

## Return Summary

- Exact calculation formulas for every Return + Exchange combination.
- Exact rules for refund method availability.
- Behavior when no replacement product is selected.
- State preservation when navigating back to product selection.
- Validation before final completion.

## Payment

- Exact payment provider.
- Payment success behavior.
- Payment failure behavior.
- Payment cancellation behavior.
- Retry behavior.
- Request state before payment.
- Request state after successful payment.

---

# 31. QA Agent Rules

When analyzing a ClickUp ticket related to this Return Portal flow, the QA Agent must:

1. Identify whether the ticket affects Return, Exchange, Cargo, Summary, Payment, or multiple areas.
2. Determine whether Exchange is enabled for the relevant store.
3. Determine whether Exchange is allowed for the relevant Return Category.
4. Determine whether the Shopify Exchange Widget is involved.
5. Consider all Exchange configuration layers before generating test coverage.
6. Consider both Exchange-enabled and Exchange-disabled flows when relevant.
7. Test item-level behavior separately from request-level behavior.
8. Consider multiple items in one request.
9. Consider mixed Return + Exchange requests.
10. Verify that each return reason remains associated with the correct item.
11. Treat Fixed Amount and Ratio Exchange Bonuses as separate calculation paths.
12. Test the no-bonus-value scenario.
13. Consider cart updates when testing Exchange Credit.
14. Consider adding, removing, and potentially changing quantities of replacement products.
15. Verify that selected replacement products are reflected correctly in Return Summary.
16. Consider the no-cargo-configured scenario.
17. Do not assume that missing cargo configuration blocks the flow.
18. Consider Turkey, Europe, and other region-specific configurations when relevant.
19. Treat financial calculations as separate test coverage, not only UI assertions.
20. Consider both `Complete` and `Pay` final actions.
21. Identify relevant regression areas across:
    - Return Portal
    - Return Panel
    - Shopify
    - ParkPalet
    - Cargo
    - Payment
    - Analytics where item-level data may be affected
22. Do not invent behavior for areas listed under Known Unknowns.
23. If a ClickUp ticket changes an existing business rule documented here, explicitly identify the impacted business rules and regression areas.

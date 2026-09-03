# Shopify Store Integration — Flow & Business Rules

## Purpose

This document contains the **business flow, integration behavior, data strategy, dependencies, business rules and regression impact** for Store Integrations.

Use this file for:
- OAuth and connection lifecycle
- Shopify installation/claim flow
- Store/webhook lifecycle
- Product, inventory and order data strategy
- Return synchronization
- Shopify requirements and permissions
- App Proxy / Customer Account dependencies
- Store configuration behavior
- Exchange business rules
- `returnSync` / `autoRefund`
- Warehouse relationship
- Uninstall behavior
- QA business rules
- Regression impact
- High-risk test scenarios

UI-only details belong in `shopify-store-integration-ui.md`.

---

# 2. Store Connection Entry Points

A Shopify store can be connected through:

1. **Onboarding**
2. **RMS application dashboard**
3. **Shopify / Shopify App Store installation**

The main in-app flow is:

```text
Integrations → Store Integrations → Shopify → Connect Store
```

---

---

# 6. Dashboard OAuth Flow

Shopify store connection uses **OAuth 2.0**. It is **not** an API-key-based connection.

```text
Store Integrations
      ↓
Enter Shopify domain
      ↓
POST /store-connections/auth/initiate
      ↓
Connection = CONNECTING
      ↓
Shopify authorize URL
      ↓
Merchant approves application in Shopify
      ↓
OAuth callback
      ↓
Token exchange
      ↓
Connection = CONNECTED
      ↓
StoreConnectionConnected event
```

The QA Agent must not invent an API-key connection scenario for Shopify Store Integration.

---

---

# 7. Shopify App Store Installation / Claim Flow

For a Shopify store installed from Shopify but not yet claimed by an RMS organization:

```text
Shopify
    ↓
/shopify-install
    ↓
HMAC validation
    ↓
Connection = PENDING_CLAIM
    ↓
OAuth completes
    ↓
Organization is not yet assigned
    ↓
/shopify-claim
    ↓
User logs in
    ↓
POST /store-connections/claim
    ↓
Connection assigned to organization
    ↓
CONNECTED
```

`PENDING_CLAIM` is a valid intermediate state. OAuth completion alone does not necessarily mean the store is assigned to an organization.

---

---

# 8. Duplicate Connection and Isolation Rules

The same Shopify shop cannot have a second active connection.

```text
Same Shopify shop
      ↓
Existing active connection
      ↓
Second active connection blocked
```

Each connection is isolated by:

- `tenantId`
- `organizationId`

Cross-organization store/data leakage is a high-risk regression area.

---

---

# 9. Post-Connection Flow

After the connection becomes `CONNECTED`:

```text
StoreConnectionConnected
        ↓
Store created / reactivated
        ↓
Shopify webhooks registered
        ↓
StoreCreatedFromConnection
        ↓
SQS
        ↓
Product synchronization starts
```

Webhook target:

```text
{API_BASE_URL}/api/v1/webhooks/shopify?storeId={uuid}
```

Shopify webhook authenticity is validated using the configured Shopify secret mechanism.

---

---

# 10. Shopify Data Strategy

| Data | Strategy |
|---|---|
| Product / Stock | Persistent local sync |
| Orders | Not persisted as local order records; fetched from Shopify when required |
| Returns | Bidirectional |
| Customer | Comes from order/return payloads; no separate customer sync |

---

---

# 11. Product and Inventory

Initial connection:

```text
Shopify GraphQL
      ↓
Initial product sync
      ↓
Local catalog
```

After initial sync, product and inventory updates arrive through webhooks such as:

```text
products/*
inventory/*
```

Manual resync exists:

```text
POST /shopify/resync
```

Regression areas:

- Initial product sync
- Incremental product updates
- Inventory updates
- Manual resync
- Repeated webhook handling
- Store isolation

---

---

# 12. Order Data

Shopify orders are **not written to RMS as local order records**.

When a return is initiated, the order is fetched from Shopify Admin GraphQL.

Order lookup can use:

- Order number + email
- Order ID where applicable

Therefore the Return Portal's `Find Return Order` depends on live Shopify order retrieval.

The source of truth for Shopify order ownership is Shopify, not a local RMS customer/order table.

---

---

# 13. Return Portal — Find Return Order

Buyer enters:

- Order number
- Email

The system performs a Shopify lookup using both values.

```text
Order Number + Email
        ↓
Shopify GraphQL
        ↓
Matching order
        ↓
Order items displayed
```

Accepted order number formats can include:

- `#1001`
- `1001`
- Store-specific format such as `PP-1001`

The input is normalized to the store's Shopify order-name format before lookup.

Incorrect combinations:

```text
Correct email + wrong order number
→ order not found

Correct order number + wrong email
→ order not found
```

The buyer-facing response does not distinguish `wrong email` from `wrong order number`.

A correctly matched order can still be ineligible if it has not reached the required return-eligible status.

---

---

# 14. Return Eligibility After Lookup

After the Shopify order is found:

- Order items are listed individually.
- Return eligibility is evaluated per item/category.
- Previously returned/exchanged items are disabled.
- Each selected item can have its own return reason.
- Multiple items may be selected.
- Different selected items may have different request types.
- One item may be Return while another is Exchange.
- Return and Exchange cannot both be applied to the same item.

If an order contains:

```text
3 × Product A
2 × Product B
```

the portal lists five individual item units, selectable independently.

---

---

# 15. Return Creation and RMS Panel

When the buyer creates a return:

```text
Verify order
      ↓
Local Return created
      ↓
Shopify returnCreate
```

The request then appears in the RMS seller-facing **Return Panel**.

A newly opened return behaves as a request/draft until it is approved in the panel.

---

---

# 16. Return Synchronization to Shopify

Store Details contains:

**Shopify'da iade oluştur (`returnSync`)**

When enabled:

- Portal returns are written to Shopify.
- Shopify return lifecycle operations are used.

When disabled:

- The return remains local to RMS.
- Shopify does not receive the return through this synchronization setting.

Relevant Shopify operations can include:

- `returnCreate`
- `returnApprove`
- `returnProcess`
- related close/lifecycle operations

Do not assume a successful local RMS return automatically means Shopify synchronization succeeded.

---

---

# 17. Shopify Admin → RMS Return Flow

Returns created in Shopify Admin can also enter RMS through Shopify return webhooks.

Relevant lifecycle events include return request, approve, decline, cancel, close, process and related `returns/*` events.

```text
Shopify Admin
      ↓
returns/* webhook
      ↓
RMS local Return
      ↓
Local Return create / transition
```

This creates a bidirectional integration:

```text
RMS → Shopify
Portal-created return synchronization

Shopify → RMS
Admin-created return synchronization
```

---

---

# 18. Shopify Store Requirements

The merchant must install and authorize the **ParkPalet Returns** application in Shopify.

Installation path:

```text
Shopify Admin
    ↓
Apps
    ↓
App Store
    ↓
ParkPalet Returns
```

Onboarding uses the same application installation/authorization step.

---

---

# 19. Shopify OAuth Permissions

The application requests permissions related to:

- Products
- Orders
- Customers
- Fulfillment
- Inventory
- Shipping
- Returns
- Gift cards
- Discounts
- Locations
- Draft orders

Important capabilities include:

### Returns
`read/write_returns`

Required for Shopify return operations.

### Gift Cards
`read/write_gift_cards`

Required for gift-card refund behavior.

### Draft Orders
`read/write_draft_orders`

Used for exchange processing.

### Locations
`read_locations`

Used for location information.

If required permissions are rejected, dependent features can fail.

Examples:

```text
Missing return permission
→ Shopify return write can fail

Missing gift-card permission
→ Gift-card refund can fail

Missing draft-order permission
→ Exchange can fail

Missing location permission
→ Location-dependent behavior can fail
```

---

---

# 20. App Proxy — Return Portal

The Shopify app defines an App Proxy:

```text
{store-url}/apps/returns
```

Target:

**Return Portal**

This is the Return Portal URL for the Shopify store.

The merchant does not manually enter this URL in RMS.

As long as the application/proxy is configured, Shopify routes the path to the Return Portal.

---

---

# 21. Customer Account Return Button

The Shopify customer account return button is provided through the:

**customer-account-return-button** extension.

Requirements:

- Shopify Customer Accounts enabled
- Extension installed/active
- Return Portal URL configured, defaulting to `/apps/returns`

If the extension is unavailable:

- The account-menu return button does not appear.
- The customer can still access `{store.url}/apps/returns` directly.

---

---

# 22. Native Shopify Returns

Portal returns use Shopify's return functionality through `returnCreate` and related lifecycle operations.

Shopify Returns must be available for the store/plan/feature configuration.

If native Shopify return functionality is unavailable, Shopify-side synchronization can fail even if the local RMS return was created successfully.

---

---

# 23. Gift Card Requirement

Gift card refund is optional in RMS.

If:

```text
Hediye Kartı Oluşturma = enabled
```

Shopify gift card capability must also be available.

Therefore:

```text
RMS Gift Card setting
        +
Shopify Gift Card capability
        ↓
Gift Card refund
```

---

---

# 24. Shopify Data Retrieved Automatically

The merchant does not manually enter the following Shopify identity values in RMS.

| Field | Usage |
|---|---|
| Shop name / myshopify.com | Store name and URL |
| primaryDomain | Portal/domain information |
| currencyCode | Gift card / exchange amount currency |
| externalId / shop ID | Shopify store identity; mandatory |

The initial shop information is retrieved through Shopify GraphQL.

Products and stock are then synchronized into the local catalog.

Orders remain Shopify-side and are fetched when needed.

---

---

# 38. Shopify App Uninstall

When Shopify sends:

```text
APP_UNINSTALLED
```

expected state change is:

```text
APP_UNINSTALLED webhook
        ↓
Store deactivated
        ↓
Connection disconnected
```

Regression areas include:

- Store card status
- Return Portal availability
- Shopify synchronization
- Webhooks
- Future Shopify API calls
- Return creation
- Reconnection

---

---

# 39. Shopify-side vs RMS-side Configuration

These are separate layers.

## Shopify-side requirements

Managed in Shopify:

- App installation
- OAuth permissions
- App Proxy
- Customer Account extension
- Shopify Returns capability
- Gift Card capability
- Shopify account/feature settings

## RMS dashboard configuration

Managed in Store Details:

- Exchange availability
- Exchange bonus
- Refund options
- Gift Card option
- `returnSync`
- `autoRefund`
- Warehouse

Do not treat these as the same configuration.

---

---

# 40. End-to-End Store Dependency

```text
Shopify App Installed
        ↓
OAuth Permissions Granted
        ↓
Store Connection = CONNECTED
        ↓
Store + ReturnPortal Created
        ↓
Shopify Webhooks Registered
        ↓
Product Sync
        ↓
App Proxy /apps/returns
        ↓
Return Portal
        ↓
Shopify Order Verification
        ↓
Return Request
        ↓
RMS Return Panel
        ↓
Seller Approval
        ↓
Warehouse / Cargo
        ↓
Shopify Synchronization
        ↓
Refund / Gift Card / Exchange
```

Not every store uses every branch:

```text
returnSync OFF
→ Shopify write branch is skipped.

autoRefund OFF
→ automatic financial branch is skipped.

Exchange OFF
→ exchange branch is unavailable.

Gift Card OFF
→ gift-card option is unavailable.

No warehouse
→ warehouse-dependent processing may not proceed normally.
```

---

---

# 41. QA Agent — Business Rules to Extract

When a requirement changes Store Integration, evaluate:

## Connection

- Shopify vs Custom
- OAuth behavior
- CONNECTING / PENDING_CLAIM / CONNECTED states
- Duplicate active connection rule
- Tenant/organization isolation

## Shopify capabilities

- Required OAuth scopes
- Returns capability
- Gift Cards
- Draft Orders
- Locations
- Customer Accounts
- App Proxy

## Store configuration

- Store Details
- Exchange
- Refund options
- `returnSync`
- `autoRefund`
- Warehouse

## Return flow

- Order lookup
- Return eligibility
- Return creation
- RMS Return Panel
- Shopify synchronization
- Approval
- Financial processing

## Data

- Product sync
- Inventory webhook
- Order lookup
- Return webhook
- Store isolation

---

---

# 42. QA Agent — Regression Impact

Any Store Integration change should consider:

## Critical

1. Shopify connection.
2. OAuth callback.
3. Duplicate connection prevention.
4. Store creation/reactivation.
5. Shopify webhook registration.
6. Product sync.
7. Order lookup.
8. Return creation.
9. Return synchronization.
10. Return approval.
11. Shopify financial operation.
12. App uninstall handling.
13. Tenant/organization isolation.

## High

14. App Proxy `/apps/returns`.
15. Customer Account return button.
16. Exchange.
17. Gift card refund.
18. Draft order exchange flow.
19. Warehouse configuration.
20. Store Details settings.
21. `returnSync` / `autoRefund` dependency.

## Medium

22. Store card UI.
23. Store Details read-only fields.
24. Coming Soon integration cards.
25. Empty state.
26. Refresh/reconnect UI.

---

---

# 43. High-Risk Test Scenarios

## Connection

1. Connect a valid Shopify store through Dashboard.
2. OAuth approval succeeds.
3. OAuth rejection/cancel behavior.
4. Invalid/unusable store domain.
5. Connection transitions from CONNECTING to CONNECTED.
6. Same shop cannot have two active connections.
7. Shopify App Store installation creates PENDING_CLAIM.
8. PENDING_CLAIM can be claimed by an authenticated organization.
9. Claimed connection becomes CONNECTED.
10. Store is isolated from another tenant/organization.

## Post connection

11. Store is created after connection.
12. Reconnection reactivates the existing store where applicable.
13. Shopify webhooks are registered.
14. Product sync starts.
15. Initial product sync succeeds.
16. Product webhook updates local catalog.
17. Inventory webhook updates local inventory.
18. Manual resync works.
19. Repeated webhook handling does not corrupt state.

## Order / Return

20. Valid order number + email finds the order.
21. Wrong email + correct order does not find it.
22. Correct email + wrong order does not find it.
23. Correct credentials but non-return-eligible order cannot open a return.
24. Order items are displayed individually.
25. Previously returned items are disabled.
26. Item-level return reason is preserved.
27. Multiple items can be selected.
28. Return and Exchange can coexist across different items.
29. Return and Exchange cannot coexist on the same item.
30. Return request reaches RMS Return Panel.
31. Shopify returnCreate succeeds when returnSync is ON.
32. Shopify return is not written when returnSync is OFF.

## Store configuration

33. Exchange OFF removes exchange capability.
34. Exchange ON enables exchange where the return category also allows it.
35. Fixed exchange bonus calculation.
36. Percentage exchange bonus calculation.
37. Exchange bonus omitted → credit equals product price.
38. Original payment method cannot be disabled.
39. Gift-card configuration respects validDays.
40. Gift-card refund requires Shopify capability.
41. autoRefund cannot remain ON while returnSync is OFF.
42. Turning returnSync OFF also turns autoRefund OFF.
43. returnSync ON + autoRefund OFF keeps Shopify return without automatic payment.
44. returnSync ON + autoRefund ON triggers the configured financial flow after acceptance.

## Shopify storefront

45. `/apps/returns` reaches Return Portal through App Proxy.
46. Customer Account return button appears when prerequisites are met.
47. Customer Account return button is absent when the extension is unavailable.
48. Direct `/apps/returns` access still works when the Customer Account button is unavailable.
49. Exchange storefront redirect works.
50. Exchange widget shows correct credit.
51. Widget updates remaining credit based on cart.
52. Go to Summary returns to the expected RMS summary.
53. Back returns to the expected exchange state.

## Uninstall

54. APP_UNINSTALLED deactivates the store.
55. Connection is disconnected.
56. Future Shopify operations fail gracefully.
57. Return Portal behavior reflects the disconnected state.
58. Reconnection restores the expected integration state.

---

---

# 44. Important QA Agent Rules

1. **Do not assume orders are stored locally.** Shopify orders are fetched when required.
2. **Do not use local customer data as the source of truth for Shopify order ownership.**
3. **Do not distinguish wrong email from wrong order number in the buyer-facing error.**
4. **Do not assume Shopify Store Integration uses API keys.** It uses OAuth 2.0.
5. **Do not assume connecting a store means every Shopify feature is available.** Required scopes/features must exist.
6. **Do not assume exchange is enabled merely because the store is connected.** Store exchange setting and return category configuration both matter.
7. **Do not assume gift-card refund works merely because the RMS option is enabled.** Shopify capability is also required.
8. **Do not allow autoRefund to remain enabled when returnSync is disabled.**
9. **Do not confuse Shopify Store, Shopify Location, and RMS Warehouse.**
10. **Do not assume Shopify App Store installation and organization claim are the same step.**
11. **Do not assume a local return means the Shopify return was successfully created.** Verify synchronization independently.
12. **Do not invent behavior for Custom stores.** Use only documented Custom requirements.
13. **Do not treat cargo/provider configuration as store connection configuration.** They are separate integration layers.
14. **Do not treat Store Connection and Store Details configuration as the same thing.** Connection establishes access; Store Details controls return behavior.
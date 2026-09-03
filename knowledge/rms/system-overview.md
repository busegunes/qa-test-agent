# RMS System Overview

## 1. System Purpose

The system under test is an RMS (Return Management System).

The primary purpose of the system is to manage return and exchange processes for orders coming from integrated e-commerce stores.

The system currently supports two store integration types:

* Shopify
* Custom integrations

Most current development and testing activities involve Shopify store integrations.

---

# 2. Main Users

The RMS system has two primary user groups:

## Buyer

The buyer is the customer who originally placed an order through the store.

The buyer interacts with the RMS through the Return Portal.

The buyer can search for an eligible order and initiate a return or exchange request.

## Seller

The seller manages incoming return requests through the Return Panel.

The seller can review and process return requests and manage the return lifecycle until the return is finalized.

---

# 3. Main System Areas

The RMS currently has two main user-facing areas.

## 3.1 Return Portal

The Return Portal is used by the buyer.

For Shopify integrations, the Return Portal is accessible through a link embedded or connected to the Shopify store.

The main purpose of the Return Portal is to allow buyers to initiate return or exchange requests for eligible orders.

The general flow currently known is:

1. The buyer places an order through Shopify.
2. The order reaches a status that makes it eligible for the return process.
3. The buyer accesses the Return Portal.
4. The buyer enters:

   * Order Number
   * Email Address
5. The system searches for the corresponding Shopify order.
6. If the order is found and eligible, the order items are listed.
7. The buyer selects the item or items to be returned or exchanged.
8. The buyer selects a return reason.
9. The buyer selects the request type:

   * Return
   * Exchange
10. The buyer proceeds through the next steps.
11. A shipping option is selected.
12. The return or exchange request is submitted.

The detailed flow after shipping selection will be documented separately as more system knowledge is provided.

---

## 3.2 Return Panel

The Return Panel is used by the seller.

Return and exchange requests created through the Return Portal are transferred to the Return Panel.

The seller uses the Return Panel to manage the return lifecycle.

The currently known high-level flow is:

1. A buyer creates a return or exchange request.
2. The request appears in the Return Panel.
3. The seller reviews the request.
4. The return request is approved or processed according to the available workflow.
5. A shipping code is generated when applicable.
6. The physical shipment process takes place.
7. The shipment status is tracked.
8. When the returned shipment reaches the warehouse, the return reaches the `Arrived at Warehouse` status.
9. The seller can make the final decision:

   * Accept the return
   * Reject the return
10. The return process is finalized.
11. Relevant return information is sent back to Shopify.

The exact available actions, statuses, conditions, and transitions will be documented separately.

---

# 4. Shopify Integration

Shopify is currently one of the primary store integration types.

The general relationship between Shopify and RMS is:

```text
Shopify Store
      │
      │ Order Data
      ▼
RMS
      │
      ├── Return Portal
      │        │
      │        ▼
      │   Buyer creates
      │   Return / Exchange Request
      │
      ▼
Return Panel
      │
      │ Seller processes request
      ▼
Return Lifecycle
      │
      ▼
Result / Status Information
      │
      ▼
Shopify
```

For Shopify orders:

* The buyer places the original order in Shopify.
* RMS uses the relevant order information for the return process.
* The buyer searches for the order using order-related information in the Return Portal.
* The system currently uses:

  * Order Number
  * Email Address
* Eligible order items are displayed to the buyer.
* Return or exchange requests created in RMS are managed through the Return Panel.
* Final return-related information is sent back to Shopify.

The exact Shopify API behavior, synchronization timing, order status mapping, and data mapping should be documented separately.

---

# 5. Custom Integration

The RMS also supports Custom store integrations.

Detailed information about the Custom integration flow, order retrieval, synchronization, and return lifecycle has not yet been documented.

Until this information is provided, the AI must not assume that Custom integrations behave exactly the same as Shopify integrations.

Shopify-specific rules must not automatically be applied to Custom integrations.

---

# 6. High-Level Return Lifecycle

Based on the currently available information, the high-level lifecycle is:

```text
Order Created in Shopify
        ↓
Order Becomes Eligible for Return
        ↓
Buyer Searches for Order
        ↓
Order Found
        ↓
Items Displayed
        ↓
Buyer Selects Return or Exchange
        ↓
Buyer Selects Return Reason
        ↓
Buyer Selects Shipping Option
        ↓
Return / Exchange Request Created
        ↓
Request Appears in Return Panel
        ↓
Seller Processes Request
        ↓
Shipping Code Generated
        ↓
Physical Shipment
        ↓
Shipment Tracking
        ↓
Arrived at Warehouse
        ↓
Final Return Decision
        ├── Accepted
        └── Rejected
        ↓
Return Finalized
        ↓
Result Sent to Shopify
```

This flow represents the currently known high-level behavior only.

Detailed state transitions and business rules must be documented separately.

---

# 7. Known Important Business Concepts

The following concepts are important when analyzing requirements and generating test cases:

* Store Integration
* Shopify
* Custom Integration
* Buyer
* Seller
* Return Portal
* Return Panel
* Order
* Order Number
* Email Address
* Order Search
* Eligible Order
* Order Item
* Return
* Exchange
* Return Reason
* Shipping Option
* Shipping Code
* Return Request
* Shipment Tracking
* Arrived at Warehouse
* Return Accepted
* Return Rejected
* Return Finalization

Detailed definitions for these concepts should be maintained in a separate terminology document.

---

# 8. Known Unknowns

The following information is currently incomplete and must not be assumed by the QA Test Case Agent:

* Exact order statuses eligible for return
* Full Shopify order status mapping
* Exact definition of `Fulfilled` and subsequent eligible statuses
* Whether all fulfilled orders are eligible for return
* Return eligibility period
* Exchange eligibility rules
* Partial return rules
* Multiple item return rules
* Quantity selection rules
* Duplicate return request rules
* Exact return request statuses
* Complete return state transition rules
* Seller approval and rejection rules
* Shipping code generation conditions
* Available shipping methods
* Shipping provider integrations
* Shipment status mapping
* Conditions for `Arrived at Warehouse`
* Final acceptance and rejection rules
* Shopify synchronization behavior
* Shopify API failure behavior
* Retry behavior
* Custom integration behavior

These areas should be clarified and documented as the system knowledge base grows.

---

# 9. QA Agent Rules

When generating test scenarios or test cases for this system:

1. Do not invent RMS behavior that is not documented.
2. Distinguish between Shopify-specific behavior and Custom integration behavior.
3. Do not assume that a rule applies to every integration type.
4. Use the documented return lifecycle when relevant.
5. Identify missing business rules before assuming system behavior.
6. If a ClickUp ticket changes a known system behavior, treat the ticket as a potential update to the system knowledge.
7. Consider the impact of changes on:

   * Buyer
   * Seller
   * Return Portal
   * Return Panel
   * Shopify integration
   * Order lifecycle
   * Return lifecycle
   * Shipment lifecycle
8. Identify potential regression areas when a change affects an existing flow.

This document represents the current high-level understanding of the RMS system.
It must be expanded as new information about the system becomes available.

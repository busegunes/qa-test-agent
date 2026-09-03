# Cargo Integration Flow

## 1. Purpose

Cargo Integration determines how a return package travels from the customer to the destination warehouse. It covers carrier/service selection, payment responsibility, buyer-facing fees, agreement selection, and label/code generation.

Warehouse selection is a separate concern:

```text
Warehouse = WHERE the package goes
Cargo Service = HOW and under WHICH deal the package goes
```

---

## 2. Core Business Model

Cargo service eligibility is based on:

1. Customer country = shipment origin
2. Warehouse country = shipment destination
3. Package weight
4. Service active status

```text
Customer Country
        +
Warehouse Country
        +
Package Weight
        +
Service Active?
        ↓
Eligible Services
```

A service existing in a catalog or connected provider account is not enough. It must be active and match the shipment.

---

# 3. Agreement Types

Two agreement types exist and may both be enabled for the same seller:

1. ParkPalet Cargo Agreement (`PPLT Deal`)
2. Seller's Own Cargo Agreement (`Own Deal`)

The winning cargo service determines the deal type. The warehouse does not.

---

# 4. ParkPalet Cargo Agreement (PPLT Deal)

## 4.1 Definition

The seller uses ParkPalet's contracted carriers and does not need their own carrier account.

Examples may include:

- HepsiJet
- DHL
- UPS

Services come from the ParkPalet service catalog and are inactive by default for the seller.

The seller must activate the services they want to use.

Inactive services must not be used for return cargo generation.

## 4.2 Service Definition

A service includes:

- Carrier
- Origin country
- Destination country
- Supported weight range
- ParkPalet transportation cost charged to the seller

A service is eligible only when route, weight, and active status match.

## 4.3 Cost and Commission

ParkPalet defines the underlying transportation cost. ParkPalet commission is included in the seller-facing cost.

The seller cannot modify this underlying ParkPalet cost.

For testing, cargo prices and commission may be configured through API/Swagger endpoints.

Pricing changes may affect:

- Automatic service selection
- Wallet deductions
- Financial calculations

## 4.4 Label / Code

For a PPLT Deal:

- ParkPalet generates the cargo label/code.
- Seller-paid cargo may be deducted from the seller's ParkPalet wallet.

Carrier output may differ, for example a shipping label or cargo code.

---

# 5. Seller's Own Cargo Agreement (Own Deal)

The seller connects their own cargo provider account.

ParkPalet does not define the carrier price and does not deduct the carrier transportation cost from the ParkPalet wallet.

The provider invoices the seller according to their own agreement.

## 5.1 Providers

| Region | Provider |
|---|---|
| Turkey | Domestic |
| European Union | Sendcloud |
| United States | ShipStation |

Domestic integration may require:

- Username
- Password
- Address

After connecting a provider account, available services can be listed.

Listed services must still be activated individually.

## 5.2 Label / Code

For an Own Deal:

- Shipment generation uses the seller's provider account.
- Provider billing follows the seller's own contract.

---

# 6. Service Activation

Services may come from:

- ParkPalet catalog
- Seller's connected provider account

A service must be explicitly active to participate in the return flow.

Inactive services must not:

- Be shown to the buyer
- Be automatically selected
- Be used as fallback
- Generate a cargo label/code

---

# 7. Payment Responsibility

Each active service may use:

- Sender Pays
- Receiver Pays

## 7.1 Sender Pays

The seller pays the cargo cost.

The buyer does not see an additional cargo fee.

For PPLT Deal, the applicable cost is deducted from the seller's ParkPalet wallet.

For Own Deal, the seller is billed by their provider.

## 7.2 Receiver Pays

The buyer sees a cargo fee in the Return Portal.

The seller determines the buyer-facing fee.

The buyer-facing amount does not have to equal the underlying transportation cost.

Example:

```text
Underlying ParkPalet Cost = 80 TL
Seller-defined Buyer Fee = 120 TL
```

This logic can apply to both PPLT Deal and Own Deal.

## 7.3 No Double Charging

If the buyer has already paid a Receiver Pays cargo fee in the portal, the same shipment must not be charged again to the seller's ParkPalet wallet for that buyer-paid amount.

Duplicate charging prevention is a critical financial business rule.

---

# 8. Warehouse vs Deal

Warehouse and deal type are independent.

The warehouse determines the destination country.

Example:

```text
Customer: Germany
Warehouse: Turkey
Route: Germany → Turkey
```

If the warehouse changes to the United States:

```text
Route: Germany → United States
```

This may change eligible services.

However, the warehouse does not determine whether the result is PPLT Deal or Own Deal.

The selected or only eligible active service determines that.

---

# 9. Service Matching Rules

The system evaluates:

1. Customer country
2. Warehouse country
3. Package weight
4. Active status

```text
Origin matches?
        ↓
Destination matches?
        ↓
Weight range matches?
        ↓
Service active?
        ↓
Eligible candidate
```

If any required condition fails, the service is not eligible.

---

# 10. Buyer Service Selection

The buyer may select an eligible cargo service in the Return Portal.

If multiple valid matching services exist, the buyer must select one. If only one valid matching service exists, that service is used without requiring selection.

Its ownership determines the agreement:

- ParkPalet catalog service → PPLT Deal
- Seller provider service → Own Deal

---

# 11. Automatic Service Selection

The buyer may continue without selecting a cargo service.

When automatic selection is required, matching active services are evaluated.

Documented rule:

> If the buyer does not select a service, the matching service with the lowest ParkPalet cost wins.

The winning service can result in either:

- PPLT Deal
- Own Deal

The QA Agent must not assume that warehouse ownership determines the deal type.

Any undocumented Own Deal comparison details must be identified as a gap rather than invented.

---

# 12. Deal Resolution

```text
Winning Service
        │
        ├── ParkPalet catalog
        │       ↓
        │    PPLT Deal
        │
        └── Seller provider account
                ↓
             Own Deal
```

Core rule:

> Deal type is attached to the winning service, not to the warehouse.

---

# 13. Route Examples

Assume the destination warehouse is in Turkey.

| Customer | Active Matching Service | Result |
|---|---|---|
| Turkey | ParkPalet HepsiJet TR → TR | PPLT Deal |
| Germany | Only seller's Sendcloud DE → TR | Own Deal |
| Germany | Both available, ParkPalet wins under selection rule | PPLT Deal |

The warehouse remains the same while the deal changes because the selected or only eligible service changes.

The reverse is also valid: a seller-owned warehouse does not force an Own Deal. If only an eligible ParkPalet service exists, the shipment uses PPLT Deal.

---

# 14. Invalid Assumption

This is incorrect:

> If a return goes to a ParkPalet warehouse, the cargo must use a ParkPalet deal.

Correct model:

```text
Warehouse = Destination
Active Matching Service = Shipment Method + Deal Type
```

---

# 15. No Matching Active Service

If no active service matches:

- Cargo label/code cannot be generated.
- The return cannot be fulfilled through cargo integration.

Possible causes:

- Origin mismatch
- Destination mismatch
- Weight mismatch
- Matching services inactive
- Provider connection unavailable

A cargo-not-found result may therefore be caused by service eligibility failure.

---

# 16. Turkey-Specific Address Requirement

For domestic Turkey PPLT cargo, the destination warehouse address must be registered in the cargo system.

If it is not registered, the cargo label cannot be generated.

This validation is separate from route, weight, and active-service matching.

---

# 17. Delivery Method

Depending on the carrier, return handover may be:

- Pickup from the customer's address
- Drop-off at a carrier branch

Available methods follow the selected carrier/service capabilities.

---

# 18. End-to-End Decision Flow

```text
Return Created
      ↓
Customer Country
      ↓
Destination Warehouse
      ↓
Warehouse Country
      ↓
Package Weight
      ↓
Find Matching Services
      ↓
Filter Inactive Services
      ↓
How Many Eligible Services?
      │
  ┌───┼───────────────┐
  │   │               │
  0   1             Multiple
  │   │               │
  ↓   ↓               ↓
No   Use only       Customer must
Label eligible      select a service
     service             │
        │                │
        └───────┬────────┘
                ↓
     Selected / Only Eligible Service
                ↓
           PPLT or Own?
             │       │
             ↓       ↓
          ParkPalet Provider
           flow      flow
             └───┬───┘
                 ↓
            Label / Code
```

---

# 19. Financial Flow

```text
Winning Service
        ↓
Payment Type?
   ┌────┴────┐
   ↓         ↓
Sender     Receiver
Pays       Pays
   │         │
   ↓         ↓
Seller      Buyer sees
pays         seller-defined fee
   │         │
   │         ↓
   │       Buyer payment
   │         │
   └────┬────┘
        ↓
Prevent duplicate charging
```

For PPLT Deal, seller-paid cargo may trigger a ParkPalet wallet deduction.

For Own Deal, billing follows the seller's provider agreement.

---

# 20. Business Rules

1. Cargo Integration controls how a return package travels to the warehouse.
2. Warehouse and cargo deal are separate concepts.
3. Warehouse determines destination.
4. Cargo service determines shipment method and deal type.
5. PPLT Deal and Own Deal can coexist.
6. Services must be active to be eligible.
7. Services must match customer country, warehouse country, and package weight.
8. ParkPalet services are inactive by default for the seller.
9. Own Deal services must also be activated individually.
10. If exactly one eligible active service exists, that service is used without customer selection.
11. If multiple eligible active services exist, customer selection is required.
12. The selected or only eligible service determines PPLT Deal or Own Deal.
13. PPLT Deal is not determined by warehouse.
14. Sender Pays means no additional buyer portal cargo fee.
15. Receiver Pays uses a seller-defined buyer-facing fee.
16. Buyer-facing fee may differ from underlying transportation cost.
17. Buyer-paid cargo must not cause duplicate charging for the same shipment.
18. No matching active service means no cargo label/code.
19. Turkey domestic PPLT cargo requires a registered destination address.
20. Delivery method may differ by carrier.

---

# 21. Regression Impact Areas

When a ticket affects Cargo Integration, assess impact on:

## Service Catalog

- Carrier
- Route
- Weight range
- Cost
- Commission

## Service Activation

- Active/inactive state
- Portal visibility
- Selection requirement
- Label eligibility

## Provider Connection

- Domestic
- Sendcloud
- ShipStation
- Credentials
- Service listing
- Connection failures

## Route Matching

- Customer country
- Warehouse country
- Domestic/cross-border routes
- Warehouse changes

## Weight Matching

- Minimum/maximum boundaries
- Exact range transitions
- No matching range

## Deal Selection

- PPLT Deal
- Own Deal
- Buyer selection
- Selection requirement
- Selected-service impact

## Payment

- Sender Pays
- Receiver Pays
- Buyer-facing fee
- Underlying cost
- Wallet deduction
- Provider billing
- Duplicate charging prevention

## Label / Code Generation

- PPLT-generated shipment
- Own-provider shipment
- No eligible service
- Missing route/weight match
- Inactive service
- Missing provider connection
- Missing Turkey domestic destination address

## Return Portal

- Available services
- Radio-button selection
- No-cargo state
- Buyer fee
- Summary/payment impact

## Warehouse

- Default warehouse
- Destination country
- Route recalculation
- Service eligibility

---

# 22. QA Decision Matrix

| Route Match | Weight Match | Active | Eligible |
|---|---|---|---|
| Yes | Yes | Yes | Yes |
| No | Yes | Yes | No |
| Yes | No | Yes | No |
| Yes | Yes | No | No |
| No | No | No | No |

---

# 23. Deal Selection Matrix

| PPLT Match | Own Deal Match | Buyer Selection | Expected Result |
|---|---|---|---|
| Yes | No | None | PPLT Deal |
| No | Yes | None | Own Deal |
| Yes | Yes | PPLT selected | PPLT Deal |
| Yes | Yes | Own selected | Own Deal |
| Yes | Yes | Selection required | User must select a cargo service |
| No | No | None | No label/code |

---

# 24. Payment Matrix

| Deal | Payment Type | Buyer Portal Fee | Seller Financial Flow |
|---|---|---|---|
| PPLT | Sender Pays | No | ParkPalet wallet flow |
| PPLT | Receiver Pays | Seller-defined | Prevent duplicate charging |
| Own Deal | Sender Pays | No | Provider billing |
| Own Deal | Receiver Pays | Seller-defined | Provider billing + portal payment flow |

Exact reconciliation beyond documented rules must not be invented.

---

# 25. High-Risk Test Areas

1. Matching route but inactive service.
2. Matching route but weight outside range.
3. Both PPLT and Own Deal services eligible.
4. Buyer explicitly selects a service.
5. Buyer does not select a service.
6. Default warehouse changes the route.
7. Buyer fee differs from underlying cost.
8. Buyer-paid cargo causes an attempted second charge.
9. No eligible service.
10. Turkey domestic PPLT route with unregistered destination address.
11. Provider connected but service inactive.
12. Weight exactly on a range boundary.
13. Cross-border destination changes service eligibility.
14. ParkPalet price/commission changes must not bypass required user selection when multiple eligible services exist.

---

# 26. QA Agent Rules

When analyzing a Cargo Integration ticket, the QA Agent must:

1. Identify whether PPLT Deal, Own Deal, or both are affected.
2. Identify whether the change affects configuration, activation, matching, pricing, payment, or label generation.
3. Treat warehouse and deal type as independent.
4. Check customer country impact.
5. Check warehouse country impact.
6. Check package-weight impact.
7. Test active and inactive services separately.
8. Consider the single-eligible-service path and the multiple-eligible-services-required-selection path.
9. Consider Sender Pays and Receiver Pays when relevant.
10. Do not assume buyer fee equals underlying cargo cost.
11. Include duplicate-charging prevention when payment logic changes.
12. Verify expected ParkPalet wallet deductions.
13. Verify provider billing behavior for Own Deal.
14. Treat label/code generation as a separate integration point.
15. Include no-matching-service coverage when route, weight, activation, or provider logic changes.
16. Include Turkey domestic destination-address validation when relevant.
17. Trace Return Portal and Return Summary impact when services or fees change.
18. Trace Warehouse impact when destination logic changes.
19. Do not invent undocumented fallback behavior.
20. Explicitly list missing business rules if the ticket depends on unknown pricing, selection, or reconciliation behavior.

---

# 27. Known Unknowns

The QA Agent must not assume:

- Currency conversion rules.
- Tax handling.
- Commission rounding.
- Weight rounding.
- Behavior when weight changes after selection.
- Behavior when a service becomes unavailable before label generation.
- Exact error messages for every no-service condition.
- Full financial reconciliation after buyer payment.
- Payment failure/cancellation/retry behavior.
- Exact reconciliation when buyer fee differs from underlying cost.
- Carrier-specific label differences beyond documented behavior.

These should be identified as knowledge gaps.

---

# 28. Quick Reference

```text
Warehouse
= Where the package goes

Cargo Service
= How the package goes

Active Matching Service
= Eligible shipment candidate

Selected or Only Eligible Service
= Determines PPLT Deal or Own Deal

PPLT Deal
= ParkPalet shipment generation and applicable wallet flow

Own Deal
= Seller's provider account and provider billing

No Matching Active Service
= No cargo label/code
```

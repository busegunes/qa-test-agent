# Cargo Integration UI Flow

## 1. Scope

This document contains the complete UI knowledge for the **Cargo Integrations** area in ParkPalet Returns.

The page has two separate configuration areas:

1. **Cargo Services** — ParkPalet's own cargo agreement / PPLT Deal
2. **Cargo Providers** — seller's own cargo agreement / Own Deal

This document describes UI behavior, states, filters, modals, validations, actions, and UI-level regression impact.

Business rules for cargo matching, return approval, and deal resolution are defined separately in:

`cargo-integration-flow.md`

---

# 2. Page Entry

When the user enters:

**Integrations → Cargo Integrations**

the page opens with:

### Page title

**Kargo Entegrasyonlarım**

### Tabs

Two tabs are displayed:

1. **Kargo Servisleri**
2. **Kargo Sağlayıcıları**

**Kargo Servisleri** is the default selected tab.

The two tabs represent different concepts:

```text
Kargo Servisleri
= ParkPalet agreement
= No account connection
= Activate/deactivate individual services

Kargo Sağlayıcıları
= Seller's own agreement
= Connect provider account first
= Then activate/deactivate individual services
```

---

# 3. Kargo Servisleri — ParkPalet Agreement

## 3.1 Purpose

This tab lists cargo routes/services supplied through the ParkPalet cargo agreement.

The seller does **not** connect their own cargo account here.

The seller only controls which ParkPalet services are active for returns.

Most services are passive by default.

---

# 4. Cargo Services — Top Section

The upper section contains:

### Search

Search input:

```text
Ara...
```

Search behavior:

- Search is triggered when at least **3 characters** are entered.
- Search narrows the service list by carrier/service name.

### Quick filters

Three quick filters are shown:

```text
Tümü (n)
Aktif servisler (n)
Pasif servisler (n)
```

The counts represent the corresponding service totals.

### Filters button

On the right:

```text
Filtreler
```

---

# 5. Cargo Services — Table

Desktop table columns:

| Column | Description |
|---|---|
| Taşıyıcı | Carrier logo + service/carrier name |
| Çıkış-Varış Ülkesi | Origin → destination country |
| Minimum Weight | Minimum supported weight |
| Maximum Weight | Maximum supported weight |
| Shipping Cost | ParkPalet's seller-facing transportation cost |
| Payment Type | Sender Pays / Receiver Pays + buyer-facing amount where applicable |
| Status | Active / Passive |
| Actions | Context-dependent actions |

Example:

```text
UPS® Standard Return
DE-DE
0.001 kg
70.001 kg
€5.15
Receiver Pays - €7.70
Active
```

---

# 6. Shipping Cost vs Receiver-Paid Price

These are separate values.

### Shipping Cost

The transportation cost ParkPalet charges the seller.

If no value exists:

```text
-
```

### Receiver Pays amount

The amount the seller configures for the buyer to pay.

Example:

```text
Shipping Cost: €5.15
Receiver Pays: €7.70
```

The buyer-facing amount does not necessarily equal the underlying ParkPalet transportation cost.

---

# 7. Mobile Cargo Services

On mobile, the same information is displayed as a card instead of a table row.

The card preserves:

- Carrier
- Route
- Minimum weight
- Maximum weight
- Shipping cost
- Payment type
- Status
- Actions

---

# 8. Cargo Service Status Actions

## 8.1 Passive Service

A passive service shows:

```text
Aktifleştir
```

The button uses the purple outlined style.

---

## 8.2 Passive TR → TR Service

If route is:

```text
TR → TR
```

clicking `Aktifleştir`:

- Does **not** open a modal.
- Immediately activates the service.
- Payment type remains **Gönderici Ödemeli**.
- Table/row state refreshes.

No payment configuration modal is used for this domestic PPLT activation flow.

---

## 8.3 Passive Non-TR → TR / International Service

If the route is not TR → TR:

- Clicking `Aktifleştir` opens the **Kargoyu Aktifleştir** modal.
- Seller configures payment responsibility.
- If receiver-paid is selected, seller must enter the buyer-facing price.

---

# 9. Active Cargo Service

An active service shows:

```text
Pasifleştir
```

The button uses the grey/neutral style.

Clicking it:

- Immediately makes the service passive.
- Does not ask for confirmation.
- Does not open a modal.
- Refreshes the service state.

---

# 10. Cargo Service Edit Icon

The pencil/edit icon is shown only for services where:

```text
Route != TR → TR
```

Therefore:

### International / non-TR → TR

- Edit icon is visible.
- Clicking it opens the same activation/edit modal.

### TR → TR

- Edit icon is not shown.

---

# 11. Kargoyu Aktifleştir Modal

The same modal is used for:

- Activating a passive non-domestic service.
- Editing an already active non-domestic service.

### Modal title

**Kargoyu Aktifleştir**

### Header

Displays:

- Carrier logo
- Carrier/service name

---

# 12. Receiver-Paid Checkbox

The modal contains a checkbox:

**İade kargosu alıcı ödemeli olacak**

## Checkbox OFF

Behavior:

- Payment type = **Gönderici Ödemeli**
- Price field is hidden.
- Any previously configured receiver-paid price is cleared from the form state.

## Checkbox ON

Behavior:

- Payment type = **Alıcı Ödemeli**
- Price field becomes visible.
- Currency is displayed.
- Amount input becomes available.

---

# 13. Receiver-Paid Price

When receiver-paid is selected:

- Price is mandatory.
- Price cannot be negative.
- Currency is shown.
- Empty value is invalid.

Conceptually:

```text
[ Currency ] [ Amount ]
```

The configured amount is the amount shown to the buyer when that cargo service is presented in the Return Portal.

---

# 14. Activation Modal Completion

Primary button:

**Güncellemeyi Tamamla**

When successfully submitted:

- Service becomes Active.
- Payment configuration is saved.
- Modal closes.
- Table refreshes.
- New payment type is displayed.

Rules:

```text
Checkbox OFF
→ Sender Pays

Checkbox ON + valid price
→ Receiver Pays + configured price
```

---

# 15. Cargo Services Filters

The Cargo Services tab has a **Filtreler** control.

## Desktop

Clicking `Filtreler` opens a filter panel below the button.

## Mobile

Clicking `Filtreler` opens a filter modal.

---

# 16. Available Filters

Filters include:

### Çıkış ülkesi

Select.

Filters by cargo origin country.

### Varış ülkesi

Select.

Filters by cargo destination country.

### Ağırlık aralığı

Two fields:

- Minimum
- Maximum

Filters by supported weight range.

---

# 17. Filter Actions

## Temizle

Resets all selected filters.

After clearing:

- Filter values return to default.
- List returns to the unfiltered state.

## Uygula

Applies selected filters and refreshes the service list.

If at least one filter is active:

```text
Filtreler (2)
```

For two active filters.

If no filter is active:

```text
Filtreler
```

---

# 18. Search + Filter

Search and Filter are independent controls.

### Search

- Minimum 3 characters.
- Searches service/carrier name.

### Filter

Filters by:

- Origin
- Destination
- Minimum weight
- Maximum weight

They can be used together.

---

# 19. Empty State

If no records match the current:

- Search
- Filter
- Search + Filter

combination:

```text
Sonuç bulunamadı
```

is displayed.

---

# 20. Kargo Sağlayıcıları — Own Deal

## 20.1 Purpose

This tab is where the seller connects their own cargo provider account.

The flow is:

```text
Connect Provider
        ↓
Provider becomes Connected
        ↓
Provider services become available
        ↓
Seller activates services individually
```

Connecting a provider does **not** automatically activate all services.

---

# 21. Provider Cards

The top section contains provider cards:

1. **Navlungo Domestic / Domestic**
2. **ShipStation**
3. **Sendcloud**

Each card contains:

- Provider logo
- Provider name
- Connection state
- Action button

---

# 22. Disconnected Provider

When a provider is not connected:

- No Connected badge.
- Button:

```text
Kargoyu Bağla
```

The button uses the outlined style.

Clicking it opens the provider credential modal.

---

# 23. Connected Provider

When a provider is connected:

- Card has green/connected styling.
- `Connected` badge appears in the upper-right.
- Button becomes:

```text
Kargo Detayları
```

Clicking it opens the provider edit modal.

---

# 24. Provider Edit Modal — Common Structure

The provider modal is shared across providers.

Common structure:

```text
Edit Carrier
      ↓
Provider logo + provider name
      ↓
Provider-specific credentials
      ↓
Delete Carrier (connected providers only)
      ↓
Complete Edit
```

The modal:

- Opens over a darkened page overlay.
- Has an `X` close icon in the top-right.
- Uses provider-specific credential fields.
- Has `Complete Edit` as the primary action.

Closing with `X` does not save unsaved changes.

---

# 25. Domestic Provider Modal

Provider:

```text
DOMESTIC
```

Fields:

### Username

- Text input.
- Required.
- Existing value is shown when editing.

### Password

- Password input.
- Required.
- Masked by default.
- Eye icon toggles show/hide.

### Address ID

- Input.
- Required.
- Existing value is shown when editing.

### Delete Carrier

Visible because the provider is already connected.

Uses a red delete/trash icon.

It opens the delete confirmation modal.

### Complete Edit

On success:

- Credentials are updated.
- Modal closes.
- Provider remains Connected.
- Success message is displayed.

---

# 26. ShipStation Provider Modal

Provider:

```text
SHIPSTATION
```

Field:

### v2 API Key

- Required.
- Masked by default.
- Eye icon toggles show/hide.

### Delete Carrier

Visible when already connected.

Opens delete confirmation.

### Complete Edit

On success:

- API key is updated.
- Modal closes.
- Provider remains Connected.
- Success message is displayed.

---

# 27. Sendcloud Provider Modal

Provider:

```text
SENDCLOUD
```

Fields:

### API Key

- Required.
- Placeholder:

```text
Enter API Key
```

### API Secret

- Required.
- Placeholder:

```text
Enter API Secret
```

- Masked by default.
- Eye icon toggles show/hide.

### Complete Edit

On success:

- Credentials are updated.
- Modal closes.
- Provider remains Connected.
- Success message is displayed.

---

# 28. Provider Credential Validation Matrix

| Provider | Field | Required | Masked |
|---|---|---:|---:|
| Domestic | Username | Yes | No |
| Domestic | Password | Yes | Yes |
| Domestic | Address ID | Yes | No |
| ShipStation | v2 API Key | Yes | Yes |
| Sendcloud | API Key | Yes | No |
| Sendcloud | API Secret | Yes | Yes |

Every required field should have negative validation coverage.

---

# 29. Sensitive Credential Fields

The following are masked by default:

- Domestic Password
- ShipStation v2 API Key
- Sendcloud API Secret

Eye icon behavior:

```text
Masked
   ↕
Visible
```

The visibility toggle changes only UI presentation.

It must not change the stored credential.

---

# 30. First Connection vs Edit

The same provider modal is used for both first connection and editing.

## First connection

```text
Kargoyu Bağla
      ↓
Edit Carrier modal
      ↓
Enter credentials
      ↓
Complete Edit
      ↓
Connected
```

During first connection:

- Delete Carrier is not shown.

## Existing connection

```text
Kargo Detayları
      ↓
Edit Carrier modal
      ↓
Existing credentials
      ↓
Complete Edit
```

During editing:

- Delete Carrier is shown.

---

# 31. Provider Delete Flow

Delete is available only for an existing connected provider.

Flow:

```text
Connected Provider
      ↓
Kargo Detayları
      ↓
Edit Carrier
      ↓
Delete Carrier
      ↓
Delete Confirmation
      ↓
Confirm Delete
      ↓
Connection Removed
```

After successful deletion:

- Provider card returns to `Kargoyu Bağla`.
- Connected badge disappears.
- Provider connection is removed.
- If no other provider remains connected, Own Deal service table disappears.
- Success message:

```text
Kargo bağlantısı başarıyla silindi
```

Deleting a provider connection and making an individual service passive are separate actions.

---

# 32. Delete Confirmation Modal

Title:

**Bu kargo bağlantısını silmek istediğinize emin misiniz?**

Actions:

- **Sil**
- **İptal**

Cancel:

- Closes the confirmation.
- Keeps provider connected.

Delete:

- Removes provider connection.
- Returns card to disconnected state.
- Refreshes provider/service state.

---

# 33. Provider Service Table

The Own Deal service table appears only when at least one provider is connected.

### No provider connected

```text
No Own Deal service table
```

### At least one provider connected

Own Deal services are listed below the provider cards.

The table uses the same general structure:

| Column | Description |
|---|---|
| Carrier | Logo + service name |
| Departure-Destination Country | Origin → destination |
| Minimum Weight | Minimum supported weight |
| Maximum Weight | Maximum supported weight |
| Shipping Cost | `-` for Own Deal |
| Payment Type | Sender Pays / Receiver Pays |
| Status | Active / Passive |
| Actions | Context-dependent |

For Own Deal:

```text
Shipping Cost = -
```

because ParkPalet does not define the seller's provider transportation cost.

---

# 34. Provider Service Activation

After a provider is connected:

- Its available services are listed.
- Services are still individually controlled.
- Services may be passive.
- Seller activates required services one by one.

General state:

```text
Passive → Make Active
Active  → Make Passive
```

A connected provider does not mean all its services are active.

Only an active matching service can participate in the return cargo flow.

---

# 35. Own Deal Search and Filters

The Own Deal service list provides the same general controls:

### Search

- Search input.
- Minimum 3 characters.
- Narrows by carrier/service name.

### Quick filters

```text
All (n)
Active services (n)
Passive services (n)
```

### Filters

- Departure Country
- Destination Country
- Minimum Weight
- Maximum Weight

### Filter actions

- Clear
- Apply

Active filter count is shown:

```text
Filters (2)
```

---

# 36. Own Deal Empty State

If no Own Deal service matches:

```text
No results found
```

This applies to:

- Search
- Filter
- Search + Filter

---

# 37. UI State Summary

## PPLT

```text
Passive Service
      ↓
Make Active
      │
      ├── TR → TR
      │      ↓
      │   Immediate Active
      │
      └── International
             ↓
        Activation Modal
             ↓
       Sender / Receiver Pays
             ↓
           Active
```

Active international service:

```text
Active
 ├── Make Passive → Passive
 └── Edit → Activation/Edit Modal
```

TR → TR active service:

- No edit icon.

---

## Own Deal

```text
Not Connected
      ↓
Connect Carrier
      ↓
Provider Credential Modal
      ↓
Successful connection
      ↓
Connected
      ↓
Provider services listed
      ↓
Individual service activation
      ↓
Active service
```

Connected provider:

```text
Carrier Details
      ↓
Edit Carrier
```

or:

```text
Delete Carrier
      ↓
Confirmation
      ↓
Disconnected
```

---

# 38. UI → Business Rule Mapping

| UI State / Action | Business Meaning |
|---|---|
| Kargo Servisleri | PPLT Deal configuration |
| Kargo Sağlayıcıları | Own Deal configuration |
| Aktifleştir | Service becomes active/eligible if matching |
| Pasifleştir | Service becomes inactive |
| Receiver Pays | Buyer-facing cargo fee can be configured |
| Sender Pays | No additional buyer cargo fee |
| Connected provider | Own Deal service catalog becomes available |
| Active provider service | Own Deal service can participate in return flow |
| No provider connected | No Own Deal service table |
| Cargo shown in Return Portal | Buyer must select via radio button |
| No cargo shown | Buyer can create return without cargo |
| Buyer-selected service | Has priority during approval |
| No buyer selection | Approval-time fallback can resolve cargo |

---

# 39. UI Regression Impact

When a Cargo Integration UI ticket is analyzed, QA Agent should evaluate:

## Navigation

- Integrations menu
- Cargo Integrations page
- Page title
- Default tab
- Tab switching

## Search

- Minimum 3-character threshold
- Search results
- Search reset
- Search + Filter combination

## Filters

- Departure Country
- Destination Country
- Minimum Weight
- Maximum Weight
- Single filters
- Multiple filters
- `Filters (n)` count
- Clear
- Apply
- Empty state
- Search + Filter
- Active/Passive quick filters + normal filters
- Minimum > Maximum weight behavior
- Weight boundary values
- TR → TR filtering
- Cross-border filtering

## PPLT Services

- Passive → Active
- Active → Passive
- TR → TR immediate activation
- International activation modal
- Sender Pays
- Receiver Pays
- Receiver-paid price required
- Negative price validation
- Price field visibility
- Price clearing when Receiver Pays is disabled
- Edit icon
- No edit icon for TR → TR
- Table refresh
- Active/passive counts

## Own Deal Providers

- Connect Carrier
- Provider-specific credentials
- Required-field validation
- Mask/unmask
- Existing credentials
- Carrier Details
- Edit Carrier
- Delete Carrier
- Delete confirmation
- Connected/disconnected state
- Own Deal table visibility
- Individual service activation
- Provider-specific service availability

## Cross-flow

- Activated matching service becomes eligible in Return Portal.
- Passive service is not eligible.
- Disconnected provider's services are not eligible.
- Buyer-selected cargo remains associated with the return.
- No-cargo return remains possible when no cargo is available.
- Approval-time fallback follows the separate cargo business rules.
- Configuration changes after return creation are considered where approval-time re-evaluation applies.

---

# 40. High-Risk UI Test Scenarios

1. TR → TR passive PPLT service activates without a modal.
2. TR → TR PPLT service remains Sender Pays.
3. International PPLT service opens the activation modal.
4. Receiver Pays without a price cannot be submitted.
5. Negative receiver-paid price cannot be submitted.
6. Disabling Receiver Pays hides the price field.
7. Disabling Receiver Pays clears the previous price from the form state.
8. Active international PPLT service opens the same modal through the edit icon.
9. TR → TR active PPLT service has no edit icon.
10. Make Passive immediately changes status.
11. Search with fewer than 3 characters does not trigger the intended search.
12. Active/passive counts update after state changes.
13. Clear resets all filters.
14. Filter count reflects active filters.
15. Apply actually filters the table.
16. No-results state appears correctly.
17. Search + Filter returns the expected intersection.
18. Domestic provider requires Username, Password and Address ID.
19. ShipStation requires v2 API Key.
20. Sendcloud requires API Key and API Secret.
21. Sensitive credentials are masked by default.
22. Eye icon toggles only visibility.
23. First-time provider connection does not show Delete Carrier.
24. Existing provider connection shows Delete Carrier.
25. Canceling delete keeps provider connected.
26. Confirming delete removes provider connection.
27. Deleting the last provider hides Own Deal service table.
28. Connecting the first provider makes Own Deal service table appear.
29. Connected provider does not automatically activate all services.
30. Provider service activation is independent from provider connection.
31. Passive Own Deal service is not eligible.
32. Active matching Own Deal service is eligible.
33. Buyer must select a cargo option when options are displayed.
34. Buyer can create a no-cargo return when no cargo service is available.
35. Buyer-selected cargo is not replaced by fallback during approval.
36. No-cargo return can receive a valid approval-time fallback according to business rules.

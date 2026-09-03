# Shopify Store Integration — UI

## Purpose

This document contains the **UI specification** for Store Integrations and Store Details.

Use this file for:
- Page structure
- Navigation
- Cards
- Buttons
- Modals
- Fields
- Tabs
- Labels
- Empty states
- UI state dependencies
- Exchange/store configuration UI

Business/API behavior that is not directly represented in the UI belongs in `shopify-store-integration-flow.md`.

---

# 3. Store Integrations Page

Page title:

**Store Integrations**

Available integration cards include:

### Shopify
- Shopify logo
- `Shopify`
- `Connect Store`

### Custom Store
- ParkPalet Returns branding
- `Connect Custom Store`
- `Connect Store`

### WooCommerce
- `Coming Soon`
- Disabled

### Shopware
- `Coming Soon`
- Disabled

### JTL
- `Coming Soon`
- Disabled

Connected stores are listed below the available integration cards.

If there are no connected stores:

```text
No stores found
```

---

---

# 4. Connected Store Cards

A connected store card can show:

- Integration logo
- Store name
- `Connected` badge
- Store domain
- Warehouse information when available
- `Store Details`
- Refresh/reconnect icon where applicable

Example:

```text
Connected
Buse-QA-Test
buse-qa-test.myshopify.com
Buse Güneş
Store Details
```

A connected Custom store can also appear, for example:

```text
Connected
HM
www2.hm.com
No Warehouse
Add Warehouse
Store Details
```

Store connection and warehouse configuration are separate concepts.

---

---

# 5. Dashboard Shopify Connection

## Add Store Modal

Clicking `Connect Store` for Shopify opens:

**Add Store**

Field:

**Enter your domain**

The UI presents the Shopify domain structure, including the `.myshopify.com` suffix.

Information message:

**You will be redirected to Shopify**

Primary action:

**Connect Store**

Top-right:

`X` close icon.

---

---

# 25. Store Details Modal

After connection:

```text
Store + ReturnPortal
```

are created automatically.

The connected store has a **Store Details** modal.

For Shopify, it contains three tabs, plus a warehouse tab when a warehouse is connected:

```text
1. Mağaza Bilgileri
2. Değişim & Ödeme Seçenekleri
3. Shopify Mağaza Tercihleri
4. Depo (when applicable)
```

---

---

# 26. Store Details — Mağaza Bilgileri

Read-only identity information:

- **Mağaza adı** — from Shopify
- **İade Portalı URL** — `{store.url}/apps/returns`
- **Mağaza ID** — internal RMS UUID

These values are not ordinary merchant-entered credentials.

---

---

# 27. Store Details — Değişim & Ödeme Seçenekleri

Stored in:

```text
ReturnPortal.metadata.refundOptions
```

These settings determine what the Return Portal presents to the buyer. They are RMS portal rules, not Shopify store settings.

---

---

# 28. Exchange Setting

**Değişim (`allowExchange`)**

States:

```text
Kapalı
Açık
```

Default:

```text
Kapalı
```

When enabled, an exchange incentive can be configured as:

- Percentage
- Fixed amount

The bonus uses the store currency.

Enabling exchange changes the portal flow and requires the applicable return category to allow exchange as well.

---

---

# 29. Exchange Bonus Calculation

Fixed amount:

```text
Exchange Credit = Product Price + Fixed Bonus
```

Example:

```text
Product = 100 TL
Bonus = 5 TL
Exchange Credit = 105 TL
```

Percentage:

```text
Exchange Credit = Product Price + (Product Price × Ratio)
```

Example:

```text
Product = 100 TL
Bonus = 20%
Exchange Credit = 120 TL
```

If a bonus type is selected but no value is entered:

```text
Exchange Credit = Product Price
```

---

---

# 30. Exchange Has Multiple Dependencies

Exchange availability depends on more than the store-level setting.

```text
Store Details
    ↓
allowExchange = enabled
    +
Return Category
    ↓
Değişim yapılabilir = enabled
    +
Shopify exchange/widget requirements
```

The QA Agent must consider all affected layers when exchange behavior changes.

---

---

# 31. Exchange Flow

When exchange is available:

```text
Find Return Order
      ↓
Select Return Items
      ↓
Exchange selected
      ↓
Select Return Cargo
      ↓
Select New Product
      ↓
Shopify store
      ↓
Exchange widget
      ↓
Product selection
      ↓
Return Summary
```

---

---

# 32. Exchange Widget

During `Select New Product`, the buyer is redirected to the Shopify storefront.

A movable exchange widget displays:

- Exchange credit
- `Go to Summary`
- `Back`

The widget observes the Shopify cart.

Example:

```text
Exchange Credit = 120 TL
New Product = 80 TL
Remaining Credit = 40 TL
```

The displayed remaining credit updates according to the cart contents.

---

---

# 33. Return Payment Options

### Original payment method

- Always available.
- Cannot be disabled.

### Gift Card

- Optional.
- Can have fixed or percentage configuration.
- `validDays` is required when configured.

These options determine what the buyer can select in the Return Portal.

---

---

# 34. Store Details — Shopify Mağaza Tercihleri

These are the Shopify synchronization switches.

### `returnSync`

UI:

**Shopify'da iade oluştur**

When ON:

- Portal returns are written to Shopify.

When OFF:

- Returns remain local to RMS.

### `autoRefund`

UI:

**Shopify'da ödemeyi tetikle**

When ON:

- After warehouse acceptance, configured Shopify financial processing can be triggered.

When OFF:

- Shopify return synchronization may still occur.
- Financial processing is not automatically triggered by RMS.

---

---

# 35. returnSync / autoRefund Dependency

Mandatory rule:

```text
autoRefund can be enabled
only when
returnSync is enabled
```

State matrix:

| returnSync | autoRefund | Expected |
|---|---|---|
| OFF | OFF | Local-only return |
| ON | OFF | Shopify return exists; financial action is not automatic |
| ON | ON | Shopify return + automatic financial action |
| OFF | ON | Invalid; autoRefund must not remain enabled |

If `returnSync` is turned OFF:

```text
autoRefund → OFF
```

---

---

# 36. Store Details — Warehouse

The warehouse tab appears when a warehouse is connected.

The warehouse represents the **physical return destination**:

- ParkPalet warehouse
- Seller's own warehouse

It is used by return logistics, cargo label routing, and warehouse processing.

It is **not the same thing as a Shopify Location**.

A store can exist without a warehouse:

```text
No Warehouse
Add Warehouse
```

---

---

# 37. Store vs Warehouse

Do not confuse:

```text
Shopify Store
= where orders/products originate
```

with:

```text
RMS Warehouse
= where returned physical goods go
```

Warehouse selection and cargo deal selection are separate concepts.

---
# Shared Glossary

Terminology used across RMS, OMS and WMS. When a term means different things in
different projects, say so explicitly — that ambiguity is a source of defects
and of badly written test cases.

Terms marked **RMS** are documented in `knowledge/rms/`. Terms marked
_undocumented_ still need a definition.

---

## Systems

| Term | Definition |
| --- | --- |
| RMS | Return Management System. Owns the return and exchange lifecycle. |
| OMS | Order Management System. _Undocumented._ |
| WMS | Warehouse Management System. _Undocumented._ |

## Actors

| Term | Definition | Source |
| --- | --- | --- |
| Buyer | The customer who placed the original order. Interacts with the Return Portal. | RMS |
| Seller | Manages incoming return requests through the Return Panel. | RMS |

## RMS Surfaces

| Term | Definition | Source |
| --- | --- | --- |
| Return Portal | Buyer-facing surface for creating return and exchange requests. | RMS |
| Return Panel | Seller-facing surface for processing return requests. | RMS |

## Order and Return Entities

| Term | Definition | Source |
| --- | --- | --- |
| Order | The original purchase. Shopify is the source of truth for RMS order lookup. | RMS |
| Order Number | Buyer-supplied identifier, normalised per store format before lookup. | RMS |
| Order Item | An individually selectable unit within an order. | RMS |
| Eligible Order | An order in a state that permits starting a return. | RMS |
| Return | A request to send an item back. | RMS |
| Exchange | A request to swap an item. Mutually exclusive with Return at item level. | RMS |
| Return Reason | Item-level reason, used downstream in Return Panel analytics. | RMS |
| Return Request | The entity created when the buyer submits the Return Portal flow. | RMS |
| Arrived at Warehouse | Return status reached when the shipment reaches the destination warehouse. | RMS |

## Shipping and Cargo

| Term | Definition | Source |
| --- | --- | --- |
| Warehouse | Where the return package goes. | RMS |
| Cargo Service | How and under which agreement the package travels. | RMS |
| PPLT Deal | ParkPalet cargo agreement — ParkPalet's contracted carriers. | RMS |
| Own Deal | The seller's own cargo provider account. | RMS |
| Shipping Code | Carrier label or code generated for the return shipment. | RMS |

## Integration

| Term | Definition | Source |
| --- | --- | --- |
| Store Integration | The connection between a store and the RMS. | RMS |
| Shopify Integration | The primary store integration type. | RMS |
| Custom Integration | An alternative integration type. Behaviour largely undocumented. | RMS |

## Terms Needing Definition

Add a row as soon as a term appears in a ticket without a shared definition.

| Term | Appears in | Question |
| --- | --- | --- |
| Stock | WMS | What are the stock statuses, and which system owns them? |
| Fulfilment | OMS | Which system performs it, and how does it relate to return eligibility? |

### Recently Defined

| Term | Definition | Source |
| --- | --- | --- |
| Refund | Issued by **Shopify**. RMS triggers it but does not perform it, so a refund assertion belongs in Shopify. | Confirmed 2026-09-03 |
| WMS Provider | The external warehouse system RMS connects to. Two are live — `HAMURLABS` and `PARKPALET` — and **their rule structures differ**. Every WMS statement must name the provider. | Confirmed 2026-09-03 |
| Arrived at Warehouse | Return status driven by **cargo carrier tracking**, not by the WMS. | Confirmed 2026-09-03 |

---
title: Market Module
---

# Market Module

## Public Summary

Store locations with GeoJSON coordinates, chain association, and product pricing integration.

## Internal Details

### Files

Standard CRUD layer: controller, service, routes, schema, model, repository (7 files).

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/markets` | Public | List markets (searchable by name/chain) |
| `GET` | `/markets/:id` | Public | Market detail with products |
| `POST` | `/markets` | JWT | Create market |
| `PUT` | `/markets/:id` | JWT | Update market |
| `DELETE` | `/markets/:id` | JWT | Delete market + cascade |

### Data Model — Market

```
name             : String (required)
location         : [Number, Number] — [longitude, latitude]
chain            : ObjectId → Chain (required)
lastScrapedUpdate: Date
```

Virtual: `products` — populated via MarketProduct back-reference.

### GeoJSON Convention

Coordinates are stored as `[longitude, latitude]` (GeoJSON order), not `[lat, lon]`.

### Cascade Delete

Deleting a market removes all **MarketProduct** junction records for that market.

## Source Anchors

| Path | Relevance |
|------|-----------|
| `apps/server/src/modules/market/` | Controller, service, routes, schema, model, repository |

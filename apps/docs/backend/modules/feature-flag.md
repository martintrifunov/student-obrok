---
title: Feature Flag Module
---

# Feature Flag Module

## Public Summary

Runtime feature toggles for conditional feature enablement across the application.

## Internal Details

### Files

Standard CRUD layer: controller, service, routes, schema, model, repository (7 files).

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/flags` | Public | Key-value flag list (public consumption) |
| `GET` | `/flags/admin` | JWT | Detailed flag list with metadata |
| `PUT` | `/flags/:id` | JWT | Toggle flag |

### Data Model — FeatureFlag

```
key        : String (unique, required)
enabled    : Boolean (default: false)
description: String
```

### Current Flags

| Key | Purpose |
|-----|---------|
| `ai-search` | Enables hybrid vector+keyword search |
| `smart-search` | Enables recipe decomposition search |

### Integration Pattern

Backend services check flags at runtime:
```js
const flag = await featureFlagService.getByKey('ai-search');
if (flag?.enabled) { /* use AI path */ }
```

Frontend fetches flags on load via `featureFlagStore` and gates UI components.

## Source Anchors

| Path | Relevance |
|------|-----------|
| `apps/server/src/modules/feature-flag/` | Controller, service, routes, schema, model, repository |

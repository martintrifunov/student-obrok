---
title: Public Holiday Module
---

# Public Holiday Module

## Public Summary

Manages public holiday dates used by smart search budget calculations and work schedule awareness.

## Internal Details

### Files

Standard CRUD layer: controller, service, routes, schema, model, repository (7 files).

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/public-holidays` | Public | List holidays (paginated, filterable) |
| `GET` | `/public-holidays/:id` | JWT | Holiday detail |
| `POST` | `/public-holidays` | JWT | Create holiday |
| `PUT` | `/public-holidays/:id` | JWT | Update holiday |
| `DELETE` | `/public-holidays/:id` | JWT | Delete holiday |

### Data Model — PublicHoliday

```
name: String (required)
date: Date (unique, required)
```

### Usage

Smart search budget calculations use public holidays to adjust the number of working days in a period, affecting daily meal budget recommendations.

## Source Anchors

| Path | Relevance |
|------|-----------|
| `apps/server/src/modules/public-holiday/` | Controller, service, routes, schema, model, repository |

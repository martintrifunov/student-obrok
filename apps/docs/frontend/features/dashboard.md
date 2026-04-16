---
title: Dashboard Feature
---

# Dashboard Feature

## Public Summary

Main admin navigation hub with tab-based layout routing to chains, markets, products, holidays, reports, insights, and feature flag management.

## Internal Details

### Files

| File | Role |
|------|------|
| `Dashboard.jsx` | Root dashboard with tab navigation |
| `DashboardHeader.jsx` | Header bar with title and theme toggle |
| `DashboardLayout.jsx` | Layout wrapper with container and outlet |
| `ChainsPage.jsx` | Chains management tab |
| `MarketsPage.jsx` | Markets management tab |
| `ProductsPage.jsx` | Products management tab |
| `HolidaysPage.jsx` | Public holidays tab |
| `ReportingPage.jsx` | Reports tab |

### Route Structure

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | Dashboard | Redirects to `/dashboard/chains` |
| `/dashboard/chains` | ChainsPage | Chain management |
| `/dashboard/markets` | MarketsPage | Market management |
| `/dashboard/products` | ProductsPage | Product management |
| `/dashboard/holidays` | HolidaysPage | Holiday management |
| `/dashboard/reporting` | ReportingPage | Report generation |
| `/dashboard/insights` | InsightsPage | Analytics dashboard |
| `/dashboard/features` | FeatureFlagsPage | Feature flag admin |

### UI Pattern

- Material-UI `Tabs` for section navigation.
- Responsive: icon-only labels on mobile, full text on desktop.
- `Outlet` pattern for nested route rendering.
- Theme toggle in header via `themeStore`.

## Source Anchors

| Path | Relevance |
|------|-----------|
| `apps/client/src/features/dashboard/` | Dashboard layout, pages, header |

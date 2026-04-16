---
title: Insights, Reports & Feature Flags
---

# Insights, Reports & Feature Flags

## Public Summary

Admin-facing analytics dashboard, async report generation UI, and runtime feature flag management.

## Insights

### Files

- `InsightsPage.jsx` — Analytics dashboard with charts
- `useInsightsQueries.js` — React Query hooks for analytics API
- `useVisitorHeartbeat.js` — Passive page view tracking

### UI Components

- **Time range selector**: 30 / 90 / 365 day windows.
- **Stat cards**: visitor count, page views, feature usage.
- **Charts**: Line and bar charts via Recharts.
- **CSV export**: admin-only data export button.
- **Skeleton states**: loading placeholders for all data sections.

### Visitor Heartbeat

`useVisitorHeartbeat` sends a `POST /analytics/heartbeat` every 60 seconds while the user is on any page, tracking anonymous visitor sessions.

## Reports

### Files

- `useReportQueries.js` — React Query hooks for report job lifecycle

### UI Pattern

- Create report → receive jobId (202 Accepted).
- Poll job status until COMPLETED or terminal state.
- Download CSV artifact when ready.
- Cancel pending jobs.

## Feature Flags

### Files

- `FeatureFlagsPage.jsx` — Admin toggle interface
- `useFeatureFlagQueries.js` — React Query hooks

### UI Pattern

- Toggle switches for each flag.
- Server-side sync on toggle.
- `featureFlagStore` (Zustand) caches flags client-side for use across components.

### Client-Side Usage

```jsx
const aiSearchEnabled = useFeatureFlag('ai-search');
// Conditionally render AI search dialog
```

## Source Anchors

| Path | Relevance |
|------|-----------|
| `apps/client/src/features/insights/` | Analytics dashboard, visitor heartbeat |
| `apps/client/src/features/reports/` | Report job lifecycle hooks |
| `apps/client/src/features/feature-flags/` | Admin flag toggle UI |
| `apps/client/src/store/featureFlagStore.js` | Client-side flag cache |
| `apps/client/src/hooks/useFeatureFlag.js` | Feature flag check hook |

---
title: Routing And Access Control
---

# Routing And Access Control

## Public Summary

Routing separates public and protected areas. Access to dashboard routes is enforced by authentication wrappers.

## Internal Details

### Route Model

- Public: landing/map and login.
- Protected: dashboard feature routes behind auth guards.

### Access Flow

```mermaid
flowchart LR
  Request[Route Request] --> Persist[PersistLogin]
  Persist --> Guard[RequireAuth]
  Guard -->|Authorized| Dashboard[Dashboard Routes]
  Guard -->|Unauthorized| Login[Login Route]
```

### Auth Recovery Behavior

- `fetchPrivate` retries requests on 401 after transparent token refresh.
- Guard components keep protected UI unavailable when auth is invalid.

## Source Anchors

| Path | Relevance |
|------|-----------|
| `apps/client/src/components/layout/App.jsx` | Route definitions |
| `apps/client/src/features/auth/components/PersistLogin.jsx` | Silent token refresh wrapper |
| `apps/client/src/features/auth/components/RequireAuth.jsx` | Auth guard for dashboard routes |
| `apps/client/src/api/fetch.js` | Token retry via fetchPrivate 401 handler |

## Risks and Trade-offs

- Auth coupling between guards and interceptor behavior requires clear testing to avoid redirect loops.

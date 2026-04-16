---
title: Pattern Catalog
---

# Pattern Catalog

## Public Summary

Student Obrok uses explicit, practical patterns to keep modules understandable and evolvable across backend and frontend.

## Internal Details

| Pattern | Purpose | Where Used |
| --- | --- | --- |
| Dependency Injection Container | Central composition root for services/controllers | apps/server/src/container.js |
| Controller-Service-Repository | Separation of transport, business, and persistence concerns | apps/server/src/modules/* |
| Strategy + Registry | Plug-in market scraper implementations | apps/server/src/modules/scraper/markets and apps/server/src/modules/scraper/scraper.registry.js |
| Middleware Pipeline | Ordered cross-cutting HTTP concerns | apps/server/src/app.js |
| Feature Flag Gate | Runtime enablement of risky/experimental features | apps/server/src/modules/feature-flag and apps/client/src/store/featureFlagStore.js |
| Query Key Factory | Predictable cache keys and invalidation | apps/client/src/features/*/hooks |
| Axios Interceptor Retry | Access token refresh and replay | apps/client/src/hooks/useAxiosPrivate.js |
| Persisted UI Store | Client preferences across sessions | apps/client/src/store/themeStore.js |

## Risks and Trade-offs

- Pattern consistency reduces cognitive load, but drift appears quickly if new modules skip standard layering.
- Some patterns are manually enforced; automated linting or architecture checks can further reduce drift.

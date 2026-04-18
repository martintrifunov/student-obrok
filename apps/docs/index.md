---
title: Obrok Documentation
description: Full-stack technical documentation for architecture, backend, frontend, deployment, and design patterns.
---

# Obrok Documentation

## Public Summary

Obrok is a full-stack platform for market data ingestion, search, reporting, and route-aware exploration. The system combines:

- A React client with feature-based modules.
- An Express API with layered architecture and cron-driven data ingestion.
- MongoDB for operational data.
- OSRM for routing.
- Docker-based environments for development and production.

Use this site to understand how the system is built, operated, and extended.

## Internal Details

This documentation is written with two audiences in mind:

- Public/quick readers who need a short explanation of each area.
- Internal contributors who need implementation depth, trade-offs, and runbooks.

Each major page follows the same structure:

1. Public Summary
2. Internal Details
3. Source Anchors
4. Risks and Trade-offs

## Documentation Map

- [System Architecture](/architecture/overview)
- [Backend](/backend/overview)
- [Frontend](/frontend/overview)
- [Deployment](/deployment/overview)
- [Design Pattern Catalog](/patterns/catalog)
- [Contributing To Docs](/contributing/docs-process)

## Current Scope (v1)

- Full architecture map and cross-service flow documentation.
- Backend module and operational flow documentation.
- Frontend architecture and state/routing data flow documentation.
- Deployment docs for local, production, and docs.obrok.net.
- Pattern catalog and ADR baseline.

## Out Of Scope (v1)

- End-user product usage manuals.
- Multi-language docs.
- Auto-generated OpenAPI documentation portal.

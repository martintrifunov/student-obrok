---
title: Architecture Decision Records
---

# Architecture Decision Records

## Public Summary

This page tracks major architectural decisions and the reasons behind them.

## Internal Details

## ADR-001: Layered Express Architecture

- Status: Accepted
- Context: Feature growth required clear responsibility boundaries.
- Decision: Use controller -> service -> repository -> model layering.
- Consequences: Better testability and readability, with moderate boilerplate cost.

## ADR-002: Feature-Based Frontend Structure

- Status: Accepted
- Context: Dashboard and map functionality expanded into many domains.
- Decision: Organize frontend by feature folders with per-feature hooks and pages.
- Consequences: Better ownership and modular navigation, with risk of duplicated helper logic.

## ADR-003: Self-Hosted OSRM Routing

- Status: Accepted
- Context: Need for route operations without per-request third-party map cost.
- Decision: Run OSRM as a dedicated service with preprocessed map data.
- Consequences: Better control and cost profile, increased infrastructure/data maintenance.

## ADR-004: Docker Compose For Dev And Prod

- Status: Accepted
- Context: Need reproducible environments across onboarding and deployment.
- Decision: Maintain compose definitions for development and production.
- Consequences: High reproducibility, but production orchestration remains single-host.

## ADR-005: Feature Flags For Search Features

- Status: Accepted
- Context: AI/embedding features carry cost and operational variability.
- Decision: Gate behavior through feature flags in backend and frontend.
- Consequences: Safer rollout, requires discipline to remove stale flags.

---
title: Docs Process
---

# Docs Process

## Public Summary

Documentation changes are part of engineering changes. If architecture, flows, or deployment behavior changes, docs must be updated in the same delivery cycle.

## Internal Details

### Required Updates

Update docs when you change:

- Route structure or auth/permission behavior.
- Data ingestion, search, or report lifecycle.
- Deployment topology, SSL, environment variables, or release process.
- State management or frontend routing/guard behavior.

### Pull Request Checklist

- Updated at least one relevant page in docs.
- Verified docs build locally.
- Added or updated diagrams if system flow changed.
- Documented new risks or trade-offs.

### CI and Deployment Behavior

- Docs CI (.github/workflows/docs-ci.yml) validates docs builds on pull requests that touch apps/docs or the docs workflow.
- Production deployment (.github/workflows/deploy.yml) runs on published releases and rebuilds docs during release deployment.
- Result: docs quality is checked before merge, and docs are redeployed when a release is published.

### Local Commands

From docs folder:

- npm install
- npm run docs:dev
- npm run docs:build
- npm run docs:preview

From repository root (Docker Compose):

- docker compose -f docker-compose.dev.yml build docs
- docker compose -f docker-compose.dev.yml up docs

### Ownership

- Backend pages: backend maintainers.
- Frontend pages: frontend maintainers.
- Deployment pages: release/ops maintainers.
- Pattern catalog and ADRs: architecture owners.

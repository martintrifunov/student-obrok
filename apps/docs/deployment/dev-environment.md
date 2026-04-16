---
title: Development Environment
---

# Development Environment

## Public Summary

Development runs the full stack locally through Docker Compose, with direct access to frontend, docs, API, OSRM, and MongoDB ports.

## Internal Details

### Setup

1. Configure root .env and apps/client/.env.
2. Prepare map data via init-route-data.sh.
3. Build and start the stack: docker compose -f docker-compose.dev.yml up --build.

Optional docs-only startup:

1. Build docs image once: docker compose -f docker-compose.dev.yml build docs
2. Start docs service: docker compose -f docker-compose.dev.yml up docs

### Service Endpoints (Default)

- Frontend: localhost:3500
- Docs (VitePress): localhost:5173
- API: localhost:5000
- OSRM: localhost:5001
- MongoDB: localhost:6969

### Notes

- API waits for DB health.
- Client and server code are mounted for live development.
- Node modules are persisted in Docker volumes.
- Docs service uses apps/docs/Dockerfile.dev so dependencies are installed at image-build time.

## Source Anchors

| Path | Relevance |
|------|-----------|
| `docker-compose.dev.yml` | Dev service topology |
| `init-route-data.sh` | OSRM map data preparation |

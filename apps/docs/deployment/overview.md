---
title: Deployment Overview
---

# Deployment Overview

## Public Summary

Student Obrok uses Docker Compose for both development and production, with Nginx as production reverse proxy and Certbot for SSL renewal.

## Internal Details

### Environment Shapes

- Development: client, docs, api, osrm, db with exposed ports and live mounts.
- Production: nginx, certbot, api, osrm, db with internal networking and restricted DB exposure.

### Docs Hosting Target

Documentation should be built by VitePress and served at docs.obrok.net as static files on the same VPS infrastructure.

## Source Anchors

| Path | Relevance |
|------|-----------|
| `docker-compose.dev.yml` | Dev service topology |
| `docker-compose.prod.yml` | Prod service topology |
| `apps/nginx/nginx.conf` | Reverse proxy and static serving |
| `.github/workflows/deploy.yml` | Release-triggered deployment |
| `init-ssl.sh` | First-time SSL bootstrap |
| `init-route-data.sh` | OSRM map data preparation |

## Risks and Trade-offs

- Single VPS deployment reduces complexity but centralizes failure domain for app and docs workloads.

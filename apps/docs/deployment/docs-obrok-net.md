---
title: docs.obrok.net Hosting
---

# docs.obrok.net Hosting

## Public Summary

The docs site should be deployed as static VitePress output and served from a dedicated Nginx host configuration for docs.obrok.net.

## Internal Details

### Build Output

- Source: apps/docs/
- Output: apps/docs/.vitepress/dist
- Build command: npm run docs:build (inside apps/docs folder)

### Nginx Serving Rules (Important)

Use static file resolution for VitePress pages and clean URLs. Do not use SPA-style fallback to index.html for every unknown route.

Example server block (conceptual):

```nginx
server {
  listen 443 ssl;
  server_name docs.obrok.net;
  root /var/www/obrok-docs;
  index index.html;

  location / {
    try_files $uri $uri.html $uri/ =404;
    error_page 404 /404.html;
  }

  location ~* ^/assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Deployment Options

1. Build docs in CI and rsync dist output to VPS docs root.
2. Build docs directly on VPS after git pull and copy dist to web root.

Option 1 is preferred for deterministic artifact deployment.

### SSL Notes

- Include docs.obrok.net in certbot issuance/renewal flow.
- Ensure challenge location remains reachable if using HTTP challenge.

## Source Anchors

| Path | Relevance |
|------|-----------|
| `apps/docs/package.json` | Docs build scripts and dependencies |
| `apps/docs/.vitepress/config.mts` | VitePress site configuration |
| `apps/nginx/nginx.conf` | Nginx server block for docs.obrok.net |
| `init-ssl.sh` | SSL certificate issuance including docs domain |

## Risks and Trade-offs

- Hosting docs separately from app domain improves isolation and cache behavior.
- Additional server block and certificate lifecycle add operational surface area.

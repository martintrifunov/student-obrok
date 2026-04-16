---
title: Image Module
---

# Image Module

## Public Summary

Image upload, filesystem storage, and metadata management. Shared image library used by chains and products.

## Internal Details

### Files

| File | Role |
|------|------|
| `image.controller.js` | HTTP handlers |
| `image.service.js` | Upload orchestration |
| `image.routes.js` | Route definitions |
| `image.schema.js` | Zod validation |
| `image.model.js` | Mongoose schema |
| `image.repository.js` | Data access |
| `file.service.js` | Filesystem operations |

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/images` | JWT | List images (paginated) |
| `POST` | `/images` | JWT | Upload image (multipart) |
| `DELETE` | `/images/:id` | JWT | Remove image + file |

### Data Model — Image

```
title   : String (required)
filename: String
url     : String (computed)
mimeType: String
size    : Number
```

### Upload Flow

1. Multer middleware handles multipart parsing and writes file to `apps/server/src/uploads/`.
2. Image metadata record is created in MongoDB.
3. URL is computed from the configured base URL + filename.
4. On error, filesystem cleanup removes the uploaded file.

### File Serving

Uploaded files are served via the `/uploads/` route, which proxies to the API container in production.

## Source Anchors

| Path | Relevance |
|------|-----------|
| `apps/server/src/modules/image/` | Controller, service, routes, schema, model, repository |
| `apps/server/src/config/multerConfig.js` | Upload middleware configuration |
| `apps/server/src/uploads/` | Filesystem storage for uploaded files |

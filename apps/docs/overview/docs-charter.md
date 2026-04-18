---
title: Documentation Charter
---

# Documentation Charter

## Public Summary

This charter defines how Obrok documentation is written so it stays consistent, useful, and maintainable.

## Internal Details

### Documentation Principles

1. Prefer source-backed claims. Every technical statement should be traceable to implementation.
2. Keep architecture current. Any change to flow, module boundaries, or deployment shape must include doc updates.
3. Separate summary from depth. Pages start with a short public summary and then move into internal details.
4. Explain trade-offs, not only design intent.

### Page Template

Each technical page should include these sections in order:

1. Public Summary
2. Internal Details
3. Source Anchors
4. Risks and Trade-offs
5. Next Extension Points (optional)

### Diagram Standard

- Use Mermaid in v1 for architecture, lifecycle, and flow diagrams.
- Prefer simple node names over abbreviations.
- Keep one primary diagram per page to avoid visual noise.

### Code Reference Standard

- Reference implementation files by path.
- Favor stable entry files (for example app/container/entrypoint) over volatile internals unless needed.
- When documenting behavior, include at least one concrete route, hook, or service function path.

### Documentation Ownership

- Backend pages: backend maintainers.
- Frontend pages: frontend maintainers.
- Deployment pages: ops/release maintainers.
- Pattern and ADR pages: architecture owners.

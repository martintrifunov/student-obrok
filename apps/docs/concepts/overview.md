---
title: How Obrok Works
---

# How Obrok Works

## Public Summary

Obrok ("meal" in Macedonian) helps people in North Macedonia figure out where to shop so that a week of groceries fits inside the statutory daily meal allowance (140 MKD/day, six working days). Everything else in the system exists to make that one question answerable: what can I actually cook this week, where is it cheapest, and can I get there.

This section explains the four ideas that make that possible, in plain language, aimed at a reader who wants to understand the system's design without reading source code first:

- [Search & Recipe Decomposition](/concepts/search-and-recipes) — how a free-text query (or a whole recipe) turns into ranked, priced results.
- [Geolocation](/concepts/geolocation) — how scraped store listings become map coordinates, and where that process is known to fail.
- [Routing & Map](/concepts/routing-and-map) — how the map computes travel routes and renders hundreds of markets without stuttering.
- [System Architecture](/architecture/overview) — the container/service topology all of the above runs on.

## Internal Details

### Why This Section Exists

The rest of this site (`Backend`, `Frontend`, `Deployment`, `Patterns`) is written as engineering reference documentation: file tables, endpoint lists, source anchors. That's the right shape for a contributor changing code, but the wrong shape for explaining *why* the system is built the way it is. The pages in this section are the opposite: prose first, one diagram, no file tables, each one links down into the matching reference page for anyone who wants implementation detail.

### The Core Problem

Grocery prices in North Macedonia vary meaningfully between chains and even between branches of the same chain. A shopper deciding what to cook has to mentally cross-reference a recipe against prices at stores they can actually reach. Obrok automates that: scrape prices across chains, let a user describe what they want to eat (a product, or a full recipe), decompose it into a shopping list, price that list at every market that carries it, and rank markets by completeness, budget fit, and distance.

### Reading Order

If you're presenting this as part of a thesis, a reasonable order is: this page, then Search & Recipe Decomposition (the most novel part), then Geolocation (the most concrete "here's a real problem we found and fixed" material), then Routing & Map, then System Architecture as the technical closing summary.

## Source Anchors

| Path | Relevance |
|------|-----------|
| `apps/server/src/shared/utils/obrokBudget.js` | Statutory daily meal allowance calculation that anchors the whole product |

## Risks and Trade-offs

- This section intentionally simplifies. Where it disagrees with a reference page on a detail, the reference page (and the source it cites) is authoritative.

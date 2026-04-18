import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(defineConfig({
  title: "Obrok Documentation",
  description: "Architecture, backend, frontend, deployment, and engineering patterns.",
  lang: "en-US",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  ],
  sitemap: {
    hostname: "https://docs.obrok.net",
  },
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    logo: "/favicon.svg",
    siteTitle: "Obrok Documentation",
    search: {
      provider: "local",
    },
    nav: [
      { text: "Overview", link: "/" },
      { text: "Architecture", link: "/architecture/overview" },
      { text: "Backend", link: "/backend/overview" },
      { text: "Frontend", link: "/frontend/overview" },
      { text: "Deployment", link: "/deployment/overview" },
      { text: "Patterns", link: "/patterns/catalog" },
      { text: "Contributing", link: "/contributing/docs-process" },
    ],
    sidebar: [
      {
        text: "Start Here",
        items: [
          { text: "Home", link: "/" },
          { text: "Documentation Charter", link: "/overview/docs-charter" },
          { text: "How To Use This Site", link: "/overview/how-to-read" },
        ],
      },
      {
        text: "Architecture",
        items: [
          { text: "System Overview", link: "/architecture/overview" },
          { text: "Data And Request Flows", link: "/architecture/flows" },
        ],
      },
      {
        text: "Backend",
        items: [
          { text: "Backend Overview", link: "/backend/overview" },
          { text: "Auth And Security", link: "/backend/auth-security" },
          { text: "Scraper And Search Pipeline", link: "/backend/scraper-search" },
          { text: "Jobs, Cron, And Reports", link: "/backend/jobs-cron-reports" },
          {
            text: "Module Reference",
            collapsed: true,
            items: [
              { text: "Auth", link: "/backend/modules/auth" },
              { text: "Chain", link: "/backend/modules/chain" },
              { text: "Market", link: "/backend/modules/market" },
              { text: "Product", link: "/backend/modules/product" },
              { text: "Scraper", link: "/backend/modules/scraper" },
              { text: "Search", link: "/backend/modules/search" },
              { text: "Report", link: "/backend/modules/report" },
              { text: "Analytics", link: "/backend/modules/analytics" },
              { text: "Feature Flag", link: "/backend/modules/feature-flag" },
              { text: "Image", link: "/backend/modules/image" },
              { text: "Public Holiday", link: "/backend/modules/public-holiday" },
            ],
          },
        ],
      },
      {
        text: "Frontend",
        items: [
          { text: "Frontend Overview", link: "/frontend/overview" },
          { text: "Routing And Access Control", link: "/frontend/routing-auth" },
          { text: "State And Server Data", link: "/frontend/state-data" },
          { text: "Map And UX Flows", link: "/frontend/map-flows" },
          {
            text: "Feature Reference",
            collapsed: true,
            items: [
              { text: "Auth", link: "/frontend/features/auth" },
              { text: "Map", link: "/frontend/features/map" },
              { text: "Dashboard", link: "/frontend/features/dashboard" },
              { text: "CRUD Entities", link: "/frontend/features/crud-entities" },
              { text: "Insights, Reports & Flags", link: "/frontend/features/insights-reports-flags" },
            ],
          },
        ],
      },
      {
        text: "Deployment",
        items: [
          { text: "Deployment Overview", link: "/deployment/overview" },
          { text: "Development Environment", link: "/deployment/dev-environment" },
          { text: "Production Environment", link: "/deployment/prod-environment" },
          { text: "docs.obrok.net Hosting", link: "/deployment/docs-obrok-net" },
          { text: "Runbooks", link: "/deployment/runbooks" },
        ],
      },
      {
        text: "Patterns",
        items: [
          { text: "Pattern Catalog", link: "/patterns/catalog" },
          { text: "Architecture Decision Records", link: "/patterns/adrs" },
        ],
      },
      {
        text: "Contributing",
        items: [
          { text: "Docs Process", link: "/contributing/docs-process" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/martintrifunov/student-obrok" },
    ],
    editLink: {
      pattern: "https://github.com/martintrifunov/student-obrok/edit/main/apps/docs/:path",
      text: "Edit this page on GitHub",
    },
    footer: {
      message: "Student Obrok engineering documentation.",
      copyright: "Copyright 2026",
    },
  },
}));

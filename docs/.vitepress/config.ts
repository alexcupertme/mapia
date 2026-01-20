import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Mapia',
  description:
    'Fast, type-safe Object Mapping for TypeScript with zero dependencies and predictable results',
  lang: 'en-US',
  appearance: true,
  lastUpdated: true,
  cleanUrls: true,
  head: [
    ["meta", { name: "description", content: "Mapia – Lightweight and type-safe object mapping for TypeScript" }],
    ["meta", { name: "keywords", content: "fast, json, mapper, datamapper, automapper, automapper-ts, stringify, parse, object, serialization, deserialization, serializer, transform, convert, typescript, ajv, io-ts, zod, typia, schema, json-schema, generator, clone, runtime, type, typebox, checker, validator, prune" }],
    ["meta", { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" }],
    ["meta", { name: "google-site-verification", content: "53-p4CrPIXbFXBbQaePOW2dfGBhYV9YX4SDzTxzlUaw" }],
    ["meta", { name: "twitter:title", content: "Mapia – Type-safe object mapper" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:site", content: "@alexcupertme" }],
    ["meta", { name: "twitter:image:src", content: "/mapia/preview.webp" }],
    ["meta", { property: "og:image", content: "/mapia/preview.webp" }],
    ["meta", { property: "og:image:secure_url", content: "/mapia/preview.webp" }],
    ["meta", { property: "og:image:alt", content: "Mapia – Type-safe object mapper" }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "600" }],
    ["meta", { property: "og:site_name", content: "Mapia" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "Mapia – Lightweight and type-safe object mapping" }],
    ["meta", { property: "og:url", content: "https://github.com/alexcupertme/mapia" }],
    ["meta", { property: "og:description", content: "Lightweight and type-safe object mapping for TypeScript, with zero dependencies and blazing fast performance." }],
    ["link", { rel: "preconnect", href: "https://cdn.jsdelivr.net", crossorigin: "" }],
    ["link", { rel: "icon", href: "/mapia/mapia.svg" }],
    ["link", { rel: "icon", type: "image/png", sizes: "96x96", href: "/mapia/favicon-96x96.png" }],
    ["link", { rel: "apple-touch-icon", sizes: "180x180", href: "/mapia/apple-touch-icon.png" }],
    ["meta", { name: "theme-color", content: "#ffffff" }],
  ],
  base: '/mapia/',
  themeConfig: {
    search: {
      provider: 'local',
    },
    logo: '/mapia.svg',
    sidebar: [
      {
        text: 'Mapia',
        base: 'misc',
        items: [
          { text: 'Release notes 🏆', link: '/release-notes.md' },
          { text: 'Comparison', link: '/comparsion.md' },
          { text: 'Contributing', link: '/contributing.md' },
        ],
      },
      {
        text: 'Documentation',
        items: [
          { text: "Intro", link: '/' },
          { text: "Basic usage", link: '/usage/basic-usage.md' },
          { text: "Defining mappings", link: '/usage/defining-mappings.md' },
          { text: 'What is a shape?', link: '/usage/shapes.md' },
          { text: 'Custom shapes', link: '/usage/custom-shapes.md' },
          { text: 'Enum mapper', link: '/usage/enum-mapper.md' },
          { text: 'Advanced Usage', link: '/usage/advanced.md' },
        ],
      },
      { text: 'Benchmark', link: '/misc/benchmark.md' },

    ],
    outline: [2, 3],
    footer: {
      message: 'Released under the MIT License',
      copyright: 'Copyright © 2025 Mapia Contributors',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/alexcupertme/mapia' },
    ],
  },
});

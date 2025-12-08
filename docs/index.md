---
title: Mapia
---

# Mapia

Mapia is a lightweight, zero-dependency object mapper for TypeScript. It lets you describe transformations declaratively while staying fully type-safe, even when the input and output shapes diverge slightly.

## Watch the demo

<div style="margin: 0 auto; max-width: 800px;">
  <iframe
    width="800"
    height="450"
    src="https://www.youtube.com/embed/C8GeUHRRTRw"
    title="Mapia demo"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>


## Why Mapia?

- 🧙 IDE-friendly auto-mapping powered by TypeScript inference
- 🪶 Zero dependencies, 80 kb unzipped bundle size—suitable for browsers and Node
- 🧪 Type-safe by default, even with classes, generics, and nested structures
- 🧼 Minimal configuration and predictable output every time
- ⚡ **35× faster** than `class-transformer`

## Quick links

- [Installation](/installation) – Add Mapia to your project in seconds.
- Usage
- - [Working with objects](/usage/objects) – Learn the basics of object mapping.
- - [Working with enums](/usage/enums) – Map enums with type safety.
- - [Advanced mappings](/usage/advanced) – Dive into complex scenarios.
- [Comparison](/comparison) – Why Mapia beats `AutoMapper-TS`.
- [Benchmark](/benchmark) – See the raw numbers.
- [Contributing](/contributing) – Help improve the docs or the library.

## Getting started

```ts
import { compileMapper } from 'mapia';

const userMapper = compileMapper<UserResponse, UserEntity>({
  id: 'id',
  email: 'email',
});

const entity = userMapper.mapOne({ id: '1', email: 'alex@example.com' });
```

When you need to run a full site build, execute `pnpm run docs:build` and deploy the generated assets from `docs/.vitepress/dist` to any CDN or hosting provider. The `docs/.vitepress/public` folder already contains the logo and preview used throughout this site.

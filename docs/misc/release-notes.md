---
title: Release notes 🏆
---

# Release notes

## January 2026
- Massive update: first-class objects and arrays support
```ts
// Before

const subObjectMapper = compileMapper<SubSource, SubTarget>({
  ...
})

const mapper = compileMapper<Source, Target>({
  subObject: transform(x => subObjectMapper.mapOne(x))
  ...
})

// After

const mapper = compileMapper<Source, Target>({
  subObject: map({
    ...
  }),
})
```
- Added directives:
- - `map`: transform objects and arrays
- - `flatMap`: transform objects with access to top fields
- - `mapAfter`: map with preprocessing
- - `mapFrom`: map with rename
- - `nullableMap`
- - `optionalMap`
- - `nullableMapFrom`
- - `optionalMapFrom`

- Added pipelining: [see more here](https://github.com/alexcupertme/mapia/blob/master/examples/undefined-to-null.mapper.ts) and [here](https://github.com/alexcupertme/mapia/blob/master/src/pipelines/replace-keys-with-parsed.ts)

- Updated docs

## December 2025
- Heavily optimized Mapia with mapper pre-compilation. Added `new Function(...)` that affected massive impact - Mapia now faster up to 2000x times than class-validator and automapper
- Autopublish to NPM
- Migrated docs to Vitepress

## May 2025

- Measured performance. Mapia is faster 40x than class-validator
- Added documentation
- Released first public version on NPM
- rewritten public API
```ts
// Before
const mapper: SimpleMapper<Source, Target> = { ... } satisfies SimpleMapper<Source, Target>

// After
const mapper = compileMapper<Source, Target>({...})

```
- added shapes feature

## April 2025

Mapia started as an utility in our IT team
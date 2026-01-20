---
title: What is a shape?
---

# What is a shape?

Shapes are one of the most important (and most misunderstood) parts of Mapia.

If you've never used **fp-ts**, **Either**, or functional programming in general - that's completely fine.
You don't need to learn any of that to **write and use shapes effectively**.

This article explains shapes from first principles, using plain TypeScript and familiar mental models.

Mapia ships with shapes such as `stringShape`, `numberShape`, `dateShape`, `urlOrNullShape`, and `urlOrThrowShape`.

## What a shape really is

At its core, a **shape is just a function**:

```ts
(input) => output
```

That's it.

A shape:

* accepts **one value**
* returns **one value**
* does **one thing**
* has **no side effects**
* is easy to test in isolation

Examples you already use:

```ts
stringShape(42);        // "42"
numberShape("123");    // 123
dateShape("2024-01-01"); // Date
```

Nothing magical.

---

## Why shapes exist

You *could* write this:

```ts
transform((x) => Number(x))
```

But now:

* that logic is inline
* hard to reuse
* hard to test independently
* duplicated across mappers
* mapper logic becomes harder to read

Shapes solve this by **moving transformation logic out of mappers**.

---

## A mapper with shapes vs lambdas

### Without shapes

```ts
const mapper = compileMapper<Source, Destination>({
  id: transform((x) => Number(x)),
  createdAt: transform((x) => new Date(x)),
});
```

### With shapes

```ts
const mapper = compileMapper<Source, Destination>({
  id: transform(numberShape),
  createdAt: transform(dateShape),
});
```

Now:

* mapper is declarative
* transformations are reusable
* mapper has **zero branches**
* mapper does not need tests - shapes do

You can use shapes in the `transform`, `transformWithRename`, `mapAfter`, `flatMapAfter`

Benefits of using shape instead of classic lambda functions:
- Easier to test
- Mapper that fully uses shapes contains no testing branches => no need to test it
- Shorter and cleaner mapping code

```ts
import { stringShape, numberShape, compileMapper } from 'mapia';

type ComplexVersion = {
  major: number;
  minor: number;
  patch: number;
};

type SerializedComplexVersion = {
  major: string;
  minor: string;
  patch: string;
};

const mapper = compileMapper<ComplexVersion, SerializedComplexVersion>({
  major: transform(stringShape),
  minor: transform(stringShape),
  patch: transform(stringShape),
});
```

If you need to convert undefined to null, compose your own shape:

```ts
import { numberShape, nullableShapeFrom } from 'mapia';

type PostgresRequestsStats = {
  total?: string;
  success?: number;
  failed?: number;
};

type PostgresRequestStatsDto = {
  total: number | null;
  success: number | null;
  failed: number | null;
};

const statsMapper = compileMapper<PostgresRequestsStats, PostgresRequestStatsDto>({
  total: transform(nullableShapeFrom(numberShape)),
  success: transform(nullableShapeFrom(numberShape)),
  failed: transform(nullableShapeFrom(numberShape)),
});
```

More shapes can be found in the [source code](https://github.com/alexcupertme/mapia/blob/master/src/shapes.ts).


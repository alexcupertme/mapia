---
title: Advanced Usage
---

# Advanced Usage

## Shapes

Shapes are reusable transformers that wrap low-level logic with a friendly API. Mapia ships with shapes such as `stringShape`, `numberShape`, `dateShape`, `urlOrNullShape`, and `urlOrThrowShape`.

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

## Aliases

Mapia exposes terse aliases for the most common helpers:

- `mv` → `rename`
- `tr` → `transform`
- `trw` → `transformWithRename`
- `ig` → `ignore`
- `nullMM`, `nullMO`, `MM`, `MO` for nullable map helpers

```ts
import { mv, tr, ig, numberShape } from 'mapia';

const userMapper = compileMapper<UserResponse, UserEntity>({
  id: tr(numberShape),
  name: mv('fullName'),
  age: 'age',
  updatedAt: ig(),
});
```

## Functional programming style

Compose mappers and shapes to keep translations modular.

```ts
const addressMapper = compileMapper<CurrentAddress, Address>({
  city: 'city',
  country: 'country',
});

const addressFieldMapper = transformWithRename(MO(addressMapper));

const userMapper = compileMapper<UserResponse, UserEntity>({
  fullName: rename('name'),
  address: addressFieldMapper,
  createdAt: transform(nullableShapeFrom(dateDecoder)),
  updatedAt: ig(),
});
```

`mapRecord` is another helper that rebases the values of a record while preserving keys, which is helpful for transforming simple dictionaries:

```ts
import { mapRecord, stringShape } from 'mapia';

const versions = {
  react: 18,
  'react-dom': 18,
};

const mapped = mapRecord(versions, stringShape);
console.log(mapped); // { react: '18', 'react-dom': '18' }
```

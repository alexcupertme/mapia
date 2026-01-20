---
title: Defining mappings
---

# Defining mappings

To convert data, you must first define a **mapping**. Mappings represent **contracts between two TypeScript types** — from simple “same-shape” objects to deeply nested structures, arrays, and nullish unions.

A mapping is compiled into a mapper with two functions:

* `mapOne(source)` → destination object
* `mapMany(source[])` → destination objects

```ts
import { compileMapper } from "mapia";

const mapper = compileMapper<Source, Destination>({
  // mapping rules...
});

const one = mapper.mapOne(source);
const many = mapper.mapMany(list);
```

> [!NOTE]
> **Root vs nested context**
> Mapia always maps **into the destination shape** you declared. Inside nested mappings, Mapia keeps a notion of a **root source object**, so you can pull values from the root even while mapping deeply nested objects.

## Direct mapping

If a destination key exists in the source **with the same name and type**, you can use the shorthand string syntax:

```ts
const mapper = compileMapper<Source, Destination>({
  name: "name",
  age: "age",
});
```

### Root safety guard

At the **root level**, direct mapping must map the destination key to itself:

```ts
compileMapper<Source, Destination>({
  // ❌ will throw at compile time (runtime compilation)
  fullName: "name",
});
```

This throws:

* `Direct mapping for destination field "fullName" must be "fullName", but got "name".`

> [!TIP]
> Use `rename("name")` when you actually want to pull from another key.

## rename

Use `rename()` to pull a value from another property **in the current context**.

```ts
import { compileMapper, rename } from "mapia";

const mapper = compileMapper<UserResponse, UserEntity>({
  id: rename("userId"),
});
```

### Nested paths

`rename()` also supports **dot-paths** within the current context:

```ts
const mapper = compileMapper<Source, Destination>({
  primaryEmail: rename("profile.contact.email"),
});
```

> [!NOTE]
> `rename()` is local-context only. It cannot jump to root from inside nested mappings — use `globalRename()` for that.

## globalRename

Use `globalRename()` to read from the **root source object**, even inside nested mappings.

```ts
import { compileMapper, map, globalRename } from "mapia";

const mapper = compileMapper<Source, Destination>({
  nested: map({
    rootId: globalRename("source.id"),
  }),
});
```

`globalRename("source")` is a special case that points to the **entire root object**.

## transform

Use `transform()` to adjust a value before it hits the destination.

```ts
import { compileMapper, transform } from "mapia";

const mapper = compileMapper<Source, Destination>({
  age: transform((x: number) => x.toString()),
});
```

This form receives the **field value** (same-key lookup).

## transformWithRename

Use `transformWithRename()` when the transform needs the **current object**, not a single property.

```ts
import { compileMapper, transformWithRename } from "mapia";

const mapper = compileMapper<Source, Destination>({
  gender: transformWithRename((src) => (src.isMale ? "male" : "female")),
});
```

### Nested behavior

Inside `map({ ... })`, `transformWithRename()` receives the **nested object at the current source path**, not the root.

```ts
const mapper = compileMapper<Source, Destination>({
  nested: map({
    sum: transformWithRename((obj) => obj.a + obj.b),
  }),
});
```

## ignore

Use `ignore()` for destination fields that:

* don’t exist on the source, and
* are optional in the destination (i.e. `| undefined`)

```ts
import { compileMapper, ignore } from "mapia";

const mapper = compileMapper<Source, Destination>({
  id: "id",
  updatedAt: ignore(),
});
```

> [!NOTE]
> `ignore()` keys are omitted from the produced object entirely.

## map

Use `map()` for **nested objects or arrays** when keys are equal at the parent level, but the inside structure needs mapping.

### Nested object mapping

```ts
import { compileMapper, map, rename } from "mapia";

const mapper = compileMapper<AddressResponse, AddressEntity>({
  street: "street",
  country: map({
    countryName: rename("name"),
    code: "code",
  }),
});
```

### Arrays are automatic

`map()` also works with arrays — Mapia detects arrays at runtime and applies `mapMany` automatically.

```ts
const mapper = compileMapper<Source, Destination>({
  clients: map({
    clientId: rename("id"),
    totalPaycheck: rename("ltv"),
  }),
});
```

## flatMap

`flatMap()` switches context to the **root source** (or “current root”), letting you build a nested destination object using values that live outside the normal nested source location.

This is useful when destination has nesting but source is flat (or differently shaped).

```ts
import { compileMapper, flatMap, rename } from "mapia";

const mapper = compileMapper<AddressResponse, AddressEntity>({
  country: flatMap({
    countryName: "countryName",
    code: rename("countryCode"),
  }),
});
```

## flatMapAfter

`flatMapAfter(fn)(mapping)` is a two-step directive:

1. Run a **root transform**: `fn(root) -> intermediate object`
2. Map the intermediate object using a flat mapping

```ts
import { compileMapper, flatMapAfter } from "mapia";

const mapper = compileMapper<Source, Destination>({
  summary: flatMapAfter((root) => ({
    id: root.id,
    name: root.user.name,
  }))({
    id: "id",
    name: "name",
  }),
});
```

## Nullable and optional mapping

When your destination requires explicit `null` or `undefined` semantics, use the dedicated directives.

### nullableMap

Use `nullableMap()` when destination is `T | null` and source is `T | undefined | null`.
It maps when the value exists and returns `null` if the value is nullish.

```ts
import { compileMapper, nullableMap, rename } from "mapia";

const mapper = compileMapper<Source, Destination>({
  child: nullableMap({
    y: rename("x"),
  }),
});
```

### optionalMap

Use `optionalMap()` when destination is `T | undefined` and source is `T | undefined | null`.
It returns `undefined` if the source is `undefined` and does **not** invoke the nested mapper.

```ts
import { compileMapper, optionalMap, rename } from "mapia";

const mapper = compileMapper<Source, Destination>({
  child: optionalMap({
    vv: rename("v"),
  }),
});
```

> [!NOTE]
> `optionalMap()` also supports arrays and will use `mapMany` automatically when the source value is an array.

## nullableMapFrom / optionalMapFrom

These directives map from a **root path** that points to an object. They also short-circuit if any path segment is nullish.

### nullableMapFrom

Returns `null` if any segment is `null`/`undefined`, otherwise maps from that object.

```ts
import { compileMapper, nullableMapFrom, rename } from "mapia";

const mapper = compileMapper<Root, Destination>({
  out: nullableMapFrom("deep.inner", {
    vv: rename("v"),
  } as any),
});
```

### optionalMapFrom

Returns `undefined` if any segment is `undefined`, otherwise maps from that object.

```ts
import { compileMapper, optionalMapFrom, rename } from "mapia";

const mapper = compileMapper<Root, Destination>({
  out: optionalMapFrom("deep.inner", {
    vv: rename("v"),
  } as any),
});
```

## mapOne and mapMany

Every compiled mapper exposes:

* `mapOne(source)` — map a single object
* `mapMany(source[])` — map an array

```ts
const mapper = compileMapper<Source, Destination>({
  id: transform((x) => Number.parseInt(x, 10)),
  name: "name",
});

mapper.mapOne({ id: "123", name: "A" }); // { id: 123, name: "A" }
mapper.mapMany([{ id: "1", name: "X" }, { id: "2", name: "Y" }]);
```

### Composing mappers

You can reuse a mapper inside another mapping via `transformWithRename()`.

```ts
const childMapper = compileMapper<Child, ChildEntity>({
  id: transform((x) => Number(x)),
});

const parentMapper = compileMapper<Parent, ParentEntity>({
  children: transformWithRename((src) => childMapper.mapMany(src.children)),
});
```

## mapRecord

`mapRecord()` maps dictionary-like objects (`Record<string, T>`) by applying a mapper to each value.

```ts
import { mapRecord } from "mapia";

const out = mapRecord(input, childMapper.mapOne);
```

## Shapes (ready-to-use transforms)

Mapia ships with small “shape” helpers — plain functions you can drop into `transform()`.

### Primitive shapes

```ts
import { stringShape, numberShape, dateShape } from "mapia/shapes";

transform(stringShape);
transform(numberShape);
transform(dateShape);
```

### URL shapes

```ts
import { urlOrNullShape, urlOrThrowShape, urlOrDefaultShape } from "mapia/shapes";

transform(urlOrNullShape);                 // URL | null
transform(urlOrThrowShape);                // URL (throws on invalid)
transform(urlOrDefaultShape(new URL("https://default.com")));
```

### Nullable / optional shapes

```ts
import { nullableShape, optionalShape, nullableShapeFrom } from "mapia/shapes";

const toNullable = nullableShape<string>(); // (x) => string | null
const toOptional = optionalShape<string>(); // (x) => string | undefined

const nullableString = nullableShapeFrom(stringDecoder);
```

### Mapping shapes

```ts
import { mapOneShape, mapManyShape, nullableMapOneShape, nullableMapManyShape } from "mapia/shapes";

const one = mapOneShape(mapper);
const many = mapManyShape(mapper);

const oneOrNull = nullableMapOneShape(mapper);
const manyOrNull = nullableMapManyShape(mapper);
```

## Enum mapper

If you maintain “API enum” vs “internal enum” with predictable naming, use `enumMapper()`.

```ts
import { enumMapper } from "mapia/enum-mapper";

const roleMap = enumMapper(ApiRole, InternalRole, {
  VIEWER: InternalRole.VIEWER_ENUM,
  READER: InternalRole.READER_ENUM,
});

// forward
roleMap.toDestination(ApiRole.VIEWER);

// reverse
roleMap.toSource(InternalRole.READER_ENUM);
```

You can also provide a custom suffix while keeping inference.

## Structural preprocessors and deep casts

Alongside mapping directives, Mapia includes **structural preprocessors**.
These utilities operate on *entire object graphs* before (or independently of) mapping and are especially useful when:

* external APIs encode semantics in **field names** (suffixes),
* you need to **normalize primitive representations** deeply,
* or you want to **prepare data** before passing it into a mapper.

## Parsing fields by key suffix

### Motivation

Some APIs encode meaning in key names:

```ts
{
  createdAtMs: "1710000000000",
  userId: "42",
}
```

Instead of manually transforming each field, Mapia lets you **parse all fields whose keys end with a given suffix**, recursively.

## `parseStringOrNumberFieldsEndsWith`

This helper walks the entire value and:

* finds keys ending with a given suffix
* if the value is `string | number`, converts it using a constructor
* preserves `null` / `undefined`
* works through objects and arrays
* is fully reflected at the type level

```ts
parseStringOrNumberFieldsEndsWith(value, "At", Date);
```

### Example

```ts
const input = {
  createdAt: "2024-01-01",
  nested: {
    updatedAt: 1700000000000,
  },
};

const parsed = parseStringOrNumberFieldsEndsWith(
  input,
  "At",
  Date
);

/*
parsed is:
{
  createdAt: Date;
  nested: {
    updatedAt: Date;
  };
}
*/
```

### Type-level behavior

The return type is computed using:

```ts
ReplaceKeysStringOrNumber<T, Suffix, To>
```

Which means:

* keys matching `${string}${Suffix}`
* whose values are `string | number | null | undefined`
* become `To | null | undefined`
* everything else is preserved recursively

This makes the transformation **fully type-safe and predictable**.

## Detecting suffix presence

### `hasAnyKeyEndingWith`

Before performing expensive deep walks, Mapia can cheaply detect whether a structure *contains* any matching keys.

```ts
hasAnyKeyEndingWith(value, "At"); // boolean
```

This is used internally to short-circuit parsing when unnecessary, but is also exposed for advanced use cases.

## Deep primitive and instance casting

### Motivation

External data often represents values using the *wrong primitive*:

* `"42"` instead of `number`
* `undefined` instead of `null`
* plain objects instead of class instances

Mapia provides a **deep, structural cast** that:

* walks objects and arrays
* replaces *all occurrences* of a given type
* preserves known atomic types (Date, URL, Map, Set, etc.)
* updates TypeScript types accordingly

## `deepCastTypes`

`deepCastTypes(value, from, to)` recursively converts values of type `from` into `to`.

It supports:

* primitive → primitive
* primitive → constructor
* constructor → primitive
* constructor → constructor

### Primitive tags

```ts
type PrimitiveTag =
  | "string"
  | "number"
  | "boolean"
  | "bigint"
  | "symbol"
  | "undefined"
  | "null";
```

### Examples

#### Convert `undefined` → `null` deeply

```ts
const normalized = deepCastTypes(value, "undefined", "null");
```

Type-level result:

```ts
DeepCastTypes<T, undefined, null>
```

All optional fields become nullable.

#### Convert strings to numbers

```ts
const parsed = deepCastTypes(value, "string", "number");
```

Every string in the object graph becomes a number.

#### Convert strings to class instances

```ts
const parsed = deepCastTypes(value, "string", URL);
```

All strings become `new URL(string)`.

#### Convert instances back to primitives

```ts
const serialized = deepCastTypes(value, Date, "string");
```

All `Date` objects become strings.

## Preservation rules

Certain built-in atomic objects are **never traversed or transformed**:

```ts
type BuiltinAtomic =
  | Date
  | URL
  | RegExp
  | Map<any, any>
  | Set<any>
  | WeakMap<any, any>
  | WeakSet<any>
  | Promise<any>
  | Function;
```

This prevents accidental mutation of runtime-critical objects.

## How this fits into Mapia

These utilities are intentionally **orthogonal** to mapping:

* They do **not** require `compileMapper`
* They can be applied **before mapping**
* Or used **inside transforms**

### Typical pipeline

```ts
const normalized = deepCastTypes(input, "undefined", "null");

const parsed = parseStringOrNumberFieldsEndsWith(
  normalized,
  "At",
  Date
);

const result = mapper.mapOne(parsed);
```

This mirrors how validation libraries like Zod structure their pipelines:

> preprocess → validate → transform


## Errors and diagnostics

Mapia throws early during `compileMapper()` when the mapping is invalid:

* **Undefined instruction**

  * `Instruction at "<field>" field in destination is undefined`
* **Invalid directive kind**

  * `Invalid directive kind`
* **Invalid instruction type**

  * `Invalid mapping instruction for destination field "<field>".`
* **Root direct mapping mismatch**

  * `Direct mapping for destination field "<dest>" must be "<dest>", but got "<src>".`

> [!TIP]
> These failures are intentional: mappings are contracts. If a contract drifts, Mapia prefers a hard error over silent runtime bugs.

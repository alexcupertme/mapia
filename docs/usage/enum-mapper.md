---
title: Enum mapper
---

# Enum mapper

The enum mapper is a small utility for converting values between two related TypeScript enums in a **strict and explicit** way.

It is designed for a common situation:

* one enum is used at an API or boundary layer
* another enum is used internally
* enum values are related but not identical
* naming often differs by a suffix or convention

Instead of relying on string casts or `as unknown as`, the enum mapper enforces a **total, reversible mapping**.

## Basic usage

```ts
import { enumMapper } from "mapia/enum-mapper";

enum ApiRole {
  VIEWER = "VIEWER",
  READER = "READER",
}

enum InternalRole {
  VIEWER_ENUM = "VIEWER_ENUM",
  READER_ENUM = "READER_ENUM",
}

const roleMap = enumMapper(ApiRole, InternalRole, {
  VIEWER: InternalRole.VIEWER_ENUM,
  READER: InternalRole.READER_ENUM,
});
```

The returned mapper exposes two functions:

```ts
roleMap.toDestination(ApiRole.VIEWER);
// → InternalRole.VIEWER_ENUM

roleMap.toSource(InternalRole.READER_ENUM);
// → ApiRole.READER
```

Both directions are type-safe.

## Why this exists

TypeScript enums are nominally unrelated, even if their values look compatible.

This is unsafe but common:

```ts
const internal = apiValue as unknown as InternalEnum;
```

Problems with this approach:

* no guarantee that every enum member is mapped
* no protection against extra or missing values
* refactors silently break behavior
* reverse mapping is usually forgotten

The enum mapper addresses these issues by requiring an explicit correspondence.

## Custom suffixes

In many systems, enum values follow a predictable naming rule.

The enum mapper supports suffix-based conventions while preserving inference.

```ts
enum HttpStatus {
  OK = "OK",
  NOT_OK = "NOT_OK",
}

enum HttpStatusCode {
  OK_CUSTOM = "OK_CUSTOM",
  NOT_OK_CUSTOM = "NOT_OK_CUSTOM",
}

const statusMap = enumMapper(
  HttpStatus,
  HttpStatusCode,
  {
    OK: HttpStatusCode.OK_CUSTOM,
    NOT_OK: HttpStatusCode.NOT_OK_CUSTOM,
  },
  "_CUSTOM",
);
```

The suffix is used internally to validate reverse mappings.

## Compile-time validation

The enum mapper performs several checks at the type level.

### Missing mappings

If a source enum value is not mapped, TypeScript reports an error.

### Extra destination keys

If the destination enum contains values that cannot be matched back to the source enum (based on the suffix rule), the mapping resolves to `never`.

Example:

```ts
type Check = EnumAutoSuffixMapping<
  typeof ApiEnum,
  typeof InternalEnumWithExtra,
  "_CUSTOM"
>;
// => never
```

This prevents silent drift between enums.

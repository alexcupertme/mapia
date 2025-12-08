---
title: Enums
---

# Enum mapper

Mapia now includes a lightweight enum mapper that works entirely at the type level. It enforces that every value in the source enum has a matching destination entry (and vice versa) by assuming a consistent suffix pattern such as `VIEWER → VIEWER_ENUM`. Because the mapping is described with `EnumAutoSuffixMapping`, the compiler rejects missing entries, stray keys, or misspelled destinations before you ever run the code.

## Bidirectional guarantees

The helper stores both directions (`forward` and `reverse`) so you can reuse the same mapper to go from API enums to internal enums and back again.

## Default suffix (`_ENUM`)

```ts
import { enumMapper } from 'mapia';

enum ApiRole {
  VIEWER = 'VIEWER',
  READER = 'READER',
}

enum InternalRole {
  VIEWER_ENUM = 'VIEWER_ENUM',
  READER_ENUM = 'READER_ENUM',
}

const roleMapper = enumMapper(ApiRole, InternalRole, {
  VIEWER: InternalRole.VIEWER_ENUM,
  READER: InternalRole.READER_ENUM,
});

const viewerEnum = roleMapper.toDestination(ApiRole.VIEWER); // VIEWER_ENUM
const readerRole = roleMapper.toSource(InternalRole.READER_ENUM); // READER
```

Because `enumMapper` returns an `EnumMapperResult`, you also get `forward`/`reverse` lookup objects if you prefer direct key-based access instead of helper methods.

## Custom suffixes

If the destination enum uses a different suffix (for example `_CUSTOM`), pass it as the fourth argument. All keys still autocomplete and the type check ensures both enums remain symmetric.

```ts
enum HttpStatus {
  OK = 'OK',
  NOT_OK = 'NOT_OK',
}

enum HttpStatusCode {
  OK_CUSTOM = 'OK_CUSTOM',
  NOT_OK_CUSTOM = 'NOT_OK_CUSTOM',
}

const statusMapper = enumMapper(
  HttpStatus,
  HttpStatusCode,
  {
    OK: HttpStatusCode.OK_CUSTOM,
    NOT_OK: HttpStatusCode.NOT_OK_CUSTOM,
  },
  '_CUSTOM',
);

statusMapper.toDestination(HttpStatus.NOT_OK); // NOT_OK_CUSTOM
statusMapper.toSource(HttpStatusCode.OK_CUSTOM); // OK
```
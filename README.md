# Mapia

![Logo](./docs/public/mapia.svg)

![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/language-TypeScript-blue)
[![Test & Coverage](https://github.com/alexcupertme/mapia/actions/workflows/test.yml/badge.svg)](https://github.com/alexcupertme/mapia/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/alexcupertme/mapia/branch/master/graph/badge.svg?token=GX1J5S2AKZ)](https://codecov.io/gh/alexcupertme/mapia)

Mapia is a fast, type-safe object mapper for TypeScript that keeps mappings explicit without imposing runtime dependencies. The mapper infers every field from the source and destination shapes, so you are protected from typos and silent runtime failures.

> [!NOTE]
> December 2025 update: **Mapia is now faster up to 2000x than Class Transformer and AutoMapper-TS**
>
> January 2026 update: **Major object mapping update!**

[See more updates!](https://alexcupertme.github.io/mapia/misc/release-notes)

## Quick start

```bash
pnpm add mapia
```

```ts
import { compileMapper, rename, transform, ignore } from 'mapia';

const userMapper = compileMapper<UserResponse, UserEntity>({
  id: transform((value) => Number(value)),
  name: rename('fullName'),
  updatedAt: ignore(),
});

const user = userMapper.mapOne(apiResponse);
```

## Documentation

The full documentation is now can be found here:

https://alexcupertme.github.io/mapia/

## Benchmark

![benchmark](benchmark/benchmark.svg)

You can run the benchmark yourself with:

```bash
pnpm run:bench
```

## Contributing

Contributions are welcome! See [`docs/contributing.md`](docs/contributing.md) for how to get involved.

## License

Mapia is released under the [MIT License](./LICENSE).

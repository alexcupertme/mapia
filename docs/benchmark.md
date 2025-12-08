---
title: Benchmark
---

# Benchmark

Mapia ships a built-in benchmark so you can reproduce the performance claims yourself.

![Benchmark](./benchmark.png)

More info about methodology and results can be found in the [benchmark source code](https://github.com/alexcupertme/mapia/blob/master/benchmark/run.ts).

Run the benchmark locally:

```bash
pnpm run:bench
```

The plot shows Mapia turning in a consistent ~35× speed improvement over `class-transformer` when mapping large collections in Node.js.

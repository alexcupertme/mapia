---
title: Writing your own shapes
---

# Writing your own shapes

## The simplest custom shape

Let's say you want to convert empty strings to `null`.

```ts
export const emptyStringToNull = (x: string): string | null =>
  x.trim() === "" ? null : x;
```

That's already a valid shape.

Use it:

```ts
const mapper = compileMapper<Source, Destination>({
  description: transform(emptyStringToNull),
});
```

## Handling `null` and `undefined`

A very common need:
convert `undefined | T` into `T | null`.

Mapia already gives you helpers, but let's understand how this works.

### Conceptually

> If value is missing → return `null`
> Otherwise → transform it

### Using `nullableShapeFrom`

```ts
import { nullableShapeFrom, numberShape } from "mapia";

const nullableNumber = nullableShapeFrom(numberShape);

nullableNumber("42");       // 42
nullableNumber(undefined); // null
nullableNumber(null);      // null
```

This is still **just a function**:

```ts
(x) => number | null
```

## Writing your own nullable shape (manual version)

If you don't want to use helpers yet:

```ts
export const nullableNumberShape = (
  x: string | number | null | undefined
): number | null => {
  if (x == null) return null;
  return Number(x);
};
```

This is perfectly fine.

Later, helpers just remove repetition - they don't change the concept.

## Shapes can be composed

Because shapes are functions, you can compose them mentally:

```ts
string -> number -> null
```

Example:

```ts
export const safePositiveNumber = (x: unknown): number | null => {
  const n = Number(x);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
};
```

Use it directly:

```ts
transform(safePositiveNumber)
```

## Shapes vs validation libraries

Shapes are **not validators**.

* They **do not check**
* They **do not report errors**
* They **do not reject input**

They **convert**.

If your shape signature cannot satisfy all cases of the Output, you choose:

* return `null`
* return `undefined`
* throw
* return a default value

That decision belongs to the shape author.

## Advanced shapes

Mapia relies heavily on the concepts of functional programming.
There are concepts that are agnostic to a language:
- Pure Functions: 
> Always returns the same output for the same input

- Immutability
> Data is not changed after it’s created.
> Instead of modifying data, you create new versions

- First-Class & Higher-Order Functions:
> Functions can be stored in variables, be passed as arguments, be returned from other functions

To write shapes like a pro, you can read more about [functional programming in Typescript](https://gcanti.github.io/fp-ts/ecosystem/)

In this block, we will only discuss concepts of Mapia

Shapes are built using a small `Either` abstraction:

```ts
(input) => Either<Error, Output>
```

---

## From decoder to reusable shape

A **decoder** answers one question only:

> “Can I convert this value or not?”

A **shape** answers a second question:

> “What should I do if conversion fails?”

Mapia keeps these concerns separate on purpose.

Let’s walk through the pattern used in Mapia’s own shapes.

## Example: `urlOrNullShape`

### Step 1: write a decoder

A decoder never throws. It only reports success or failure.

```ts
export const urlDecoder: Decoder<string, URL> = (x) => {
  try {
    return right(new URL(x));
  } catch (error) {
    return left(error as Error);
  }
};
```

This decoder:

* succeeds with `Right(URL)`
* fails with `Left(Error)`
s
### Step 2: decide failure policy

Now decide what failure *means*.

For `urlOrNullShape`, the policy is:

> If parsing fails → return `null`

```ts
export const urlOrNullShape =
  leftToNull(composeDecoder(tryNonNullable(), urlDecoder));
```

What happens here conceptually:

1. `tryNonNullable()`
   fails early if value is `null` or `undefined`
2. `urlDecoder`
   tries to parse the URL
3. `leftToNull`
   converts any failure into `null`

Final shape type:

```ts
(input: string | null | undefined) => URL | null
```

## Using the shape in a mapper

```ts
const mapper = compileMapper<ApiUser, User>({
  website: transform(urlOrNullShape),
});
```
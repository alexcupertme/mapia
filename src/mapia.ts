export type AssertEqual<T, Expected> = T extends Expected
  ? Expected extends T
    ? true
    : never
  : never;

// Helper type: check for exact type equality.
export type IsExact<T, U> =
  (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
    ? // second check: U behaves like T
      (<G>() => G extends U ? 1 : 2) extends <G>() => G extends T ? 1 : 2
      ? true
      : false
    : false;

/*────────────────────────────────────────────────────────────────────────────
  Mapping Directives (destination‐key based)
────────────────────────────────────────────────────────────────────────────*/

// Rename directive: the value comes from a source field.
export interface RenameDirective<SrcKey extends string> {
  __kind: "rename";
  src: SrcKey;
}

/**
 * Rename directive: used to rename a source key to a destination key.
 * This is useful when the source key does not match the destination key.
 * But field types must match.
 *
 * @param src - Pick a source key that will be renamed to the destination key.
 *
 * @example
 * ```ts
 * type Source = {
 * ⠀⠀fullName: string;
 * ⠀⠀age: number;
 * ⠀⠀email: string;
 * };
 *
 * type Destination = {
 * ⠀⠀name: string;
 * ⠀⠀age: number;
 * ⠀⠀email: string;
 * };
 *
 * const mapping = compileMapper<Source, Destination>({
 *   name: rename("fullName"), // ✅ Maps "fullName" from source to "name" in destination
 *   age: "age", // Maps "age" from source to "age" in destination
 * ⠀⠀email: rename("email"), // ❌ Throws compile time error. No redundant rename
 * });
 * ```
 */
export function rename<SrcKey extends string>(
  src: SrcKey,
): RenameDirective<SrcKey> {
  return { __kind: "rename", src };
}

// Transform directive interfaces:

// 1. TransformDirectiveSame: used when the source key is the same as the destination key.
//    (Now we omit the key since it’s implied by the mapping config property.)
export interface TransformDirectiveSame<
  Source extends Record<string, any>,
  _D extends keyof Source,
  F extends (value: Source[_D]) => any,
> {
  __kind: "transform";
  fn: F;
  renamed: false;
}

// 2. TransformDirectiveRenamed: used when the source key differs from the destination key.
//    The transform function now receives the entire source object.
export interface TransformDirectiveRenamed<
  Source extends Record<string, any>,
  F extends (source: Source) => any,
> {
  __kind: "transform";
  fn: F;
  renamed: true;
}

/**
 * Transform directive: used to change type of a source field.
 *
 * Source and Destination field name must match.
 *
 * But field types doesn't.
 *
 * Note that you cannot misspell the destination key
 *
 * @param fn - The function to transform the value.
 *
 * @example
 * ```ts
 * type Source = {
 * ⠀⠀id: string;
 * ⠀⠀age: number;
 * ⠀⠀name: string;
 * };
 *
 * type Destination = {
 * ⠀⠀id: number;
 * ⠀⠀age: number;
 * ⠀⠀name: string;
 * };
 *
 * const mapping = compileMapper<Source, Destination>({
 *   id: transform((x) => Number(x)), // ✅ Maps "id" from source to "id" in destination
 *   age: "age",
 *   name: "name",
 * });
 */
export function transform<
  Source extends Record<string, any>,
  D extends keyof Source,
  T,
>(
  fn: (value: Source[D]) => T,
): TransformDirectiveSame<Source, D, (value: Source[D]) => T> {
  return { __kind: "transform", fn, renamed: false };
}

/**
 * Transform directive: used to change full shape of a source object.
 *
 * Neither field name nor type should match.
 *
 * That’s why we explicitly have this method to be sure that we need renaming and transforming.
 *
 * @param fn - The function to transform the value.
 *
 * @example
 * ```ts
 * type Source = {
 * ⠀⠀id: string;
 * ⠀⠀age: number;
 * ⠀⠀name: string;
 * };
 *
 * // Super-complex type
 * type Tag = {
 * ⠀⠀type: 'name';
 * ⠀⠀value: string;
 * };
 *
 * type Destination = {
 * ⠀⠀id: number;
 * ⠀⠀age: number;
 * ⠀⠀tags: Tag[] // Super-complex type
 * };
 *
 * const mapping = compileMapper<Source, Destination>({
 * ⠀⠀id: transform((x) => Number(x)),
 * ⠀⠀age: "age",
 * ⠀⠀tags: transformWithRename((x) => (
 * ⠀⠀⠀⠀[{type: 'name'; value: x}])
 * ⠀⠀)), // ✅ Maps "name" from source to "tags" in destination
 * });
 */
export function transformWithRename<Source extends Record<string, any>, T>(
  fn: (source: Source) => T,
): TransformDirectiveRenamed<Source, (source: Source) => T> {
  return { __kind: "transform", fn, renamed: true };
}

// An ignore directive: indicates that the destination field should be left unset.
export interface IgnoreDirective {
  __kind: "ignore";
}
export function ignore(): IgnoreDirective {
  return { __kind: "ignore" };
}

type Keys<T> = Extract<keyof T, string>;

export type MatchingKeys<
  Source,
  Destination,
  DestKey extends keyof Destination,
> = {
  [P in Keys<Source>]: IsExact<Source[P], Destination[DestKey]> extends true
    ? P
    : never;
}[Keys<Source>];

/*────────────────────────────────────────────────────────────────────────────
  Mapping Configuration Type
────────────────────────────────────────────────────────────────────────────*/

export type MapMatchingKeys<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
> = Partial<{
  [D in keyof Destination & string]:  // Direct mapping branch.
    | (D extends keyof Source
        ? IsExact<Source[D], Destination[D]> extends true
          ? D
          : never
        : never)

    // Rename branch.
    | {
        [K in Keys<Source>]: RenameDirective<K> & {
          _check?: D extends keyof Source
            ? IsExact<Source[K], Destination[D]> extends true
              ? true
              : never
            : never;
        };
      }[MatchingKeys<Source, Destination, D>]

    // Transform branch (same): allowed if D is in Source.
    | (D extends keyof Source
        ? TransformDirectiveSame<
            Source,
            D,
            (value: Source[D]) => Destination[D]
          >
        : never)

    // Transform branch (renamed): for destination keys that don’t exist on Source.
    | {
        [K in Exclude<
          Extract<keyof Source, string>,
          D
        >]: TransformDirectiveRenamed<
          Source,
          (source: Source) => Destination[D]
        >;
      }[Exclude<Extract<keyof Source, string>, D>]

    // Ignore branch.
    | (undefined extends Destination[D] ? IgnoreDirective : never);
}>;

export type SimpleMapper<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
> = Required<MapMatchingKeys<Source, Destination>>;

export type MapOneFn<Source, Destination> = (source: Source) => Destination;
export type MapManyFn<Source, Destination> = (
  source: Source[],
) => Destination[];

export type MapperFns<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
> = {
  mapOne: MapOneFn<Source, Destination>;
  mapMany: MapManyFn<Source, Destination>;
};

/**
Simple mapper for transforming objects.

You should always explicitly specify Type Parameters (Source, Destination) if you have generic types like Record or custom generic types.
* @param source - The object to transform.
* @param mapping - The mapping configuration that defines how each field in the destination is populated.
* @returns a collection of functions to map one or many objects.

@example

```ts
* import mapia from 'mapia';
* 
* interface UserResponse {
* ⠀⠀id: string;
* ⠀⠀age: number;
* ⠀⠀name: string;
* ⠀⠀createdAt: string;
* };
* 
* class UserEntity {
* ⠀⠀id: number;
* ⠀⠀age: number;
* ⠀⠀name: string;
* ⠀⠀createdAt: Date;
* ⠀⠀updatedAt?: Date;
* };
* 
* type FromApiToEntity = SimpleMapper<
* ⠀⠀UserResponse,
* ⠀⠀UserEntity
* >;
* 
* const fromApiToEntity = compileMapper<
* ⠀⠀UserResponse,
* ⠀⠀UserEntity
* >({
* ⠀⠀name: "name", // maps automatically by TS compiler
* ⠀⠀age: "age", // maps automatically TS compiler
* ⠀⠀id: transform((x) => Number(x)), 
* ⠀⠀createdAt: transform((x) => new Date(x)),
* ⠀⠀updatedAt: ignore(), // Ignore allowed only if destination is optional
* }); 
* 
* const userResponse: UserResponse = {
* ⠀⠀id: "1",
* ⠀⠀age: 25,
* ⠀⠀name: "John Doe",
* ⠀⠀createdAt: "2023-01-01",
* };
* 
* const userEntity: UserEntity = fromApiToEntity.mapOne<UserResponse, UserEntity>(
* ⠀⠀userResponse,
* );
```
*/
export function compileMapper<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
>(mapping: SimpleMapper<Source, Destination>): MapperFns<Source, Destination> {
  const steps: Array<(source: Source, dest: Destination) => void> = [];

  for (const destKey of Object.keys(mapping) as Array<
    keyof Destination & string
  >) {
    const instruction = mapping[destKey]!;

    if (instruction === undefined)
      throw new Error(
        `Instruction at "${destKey}" field in destination is undefined`,
      );

    if (typeof instruction === "string") {
      if (instruction !== destKey) {
        throw new Error(
          `Direct mapping for destination field "${destKey}" must be "${destKey}", but got "${instruction}".`,
        );
      }

      // direct copy: dest[destKey] = source[instruction]
      steps.push((source, dest) => {
        dest[destKey] = source[
          instruction
        ] as unknown as Destination[typeof destKey];
      });
    } else if ("__kind" in instruction) {
      switch (instruction.__kind) {
        case "rename":
          steps.push((source, dest) => {
            dest[destKey] = source[
              instruction.src
            ] as unknown as Destination[typeof destKey];
          });
          break;
        case "transform":
          if (instruction.renamed) {
            // transform-with-rename: fn(source)
            steps.push((source, dest) => {
              dest[destKey] = instruction.fn(source);
            });
          } else {
            // transform-same-key: fn(source[destKey])
            steps.push((source, dest) => {
              dest[destKey] = instruction.fn(
                source[destKey],
              ) as unknown as Destination[typeof destKey];
            });
          }
          break;
        case "ignore":
          // no-op
          break;
      }
    }
  }

  // Return the actual mapper function
  return {
    mapOne: (source: Source): Destination => {
      const dest = {} as Destination;

      for (let i = 0, len = steps.length; i < len; ++i) {
        steps[i](source, dest);
      }
      return dest;
    },
    mapMany: (source: Source[]): Destination[] => {
      return source.map((item) => {
        const dest = {} as Destination;

        for (let i = 0, len = steps.length; i < len; ++i) {
          steps[i](item, dest);
        }
        return dest;
      });
    },
  };
}

export function mapRecord<I, O>(
  input: Record<string, I>,
  mapper: (value: I) => O,
): Record<string, O> {
  const result: Record<string, O> = {};

  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      result[key] = mapper(input[key]);
    }
  }
  return result;
}

export default { compileMapper };

/**
 * Alias for compileMapper function
 */
export const mv = rename;

/**
 * Alias for transform function
 */
export const tr = transform;

/**
 * Alias for transformWithRename function
 */
export const trw = transformWithRename;

/**
 * Alias for ignore function
 */
export const ig = ignore;

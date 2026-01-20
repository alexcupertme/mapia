import jsStringEscape from "js-string-escape";

type HasUndefined<T> = undefined extends T ? true : false;
type HasNull<T> = null extends T ? true : false;
type HasNullish<T> = HasNull<T> extends true
  ? true
  : HasUndefined<T>;

type RenameSourcePath = string;
type LocalPath<SrcPath extends string> = SrcPath extends `source.${string}`
  ? never
  : SrcPath;

export interface RenameDirective<SrcPath extends RenameSourcePath> {
  __kind: "rename";
  src: SrcPath;
}

export function rename<const SrcPath extends RenameSourcePath>(
  src: LocalPath<SrcPath>,
): RenameDirective<SrcPath> {
  return { __kind: "rename", src };
}

type GlobalRenameSourcePath = `source.${string}`;

export interface GlobalRenameDirective<SrcPath extends GlobalRenameSourcePath> {
  __kind: "globalRename";
  src: SrcPath;
}

export function globalRename<const SrcPath extends GlobalRenameSourcePath>(
  src: SrcPath,
): GlobalRenameDirective<SrcPath> {
  return { __kind: "globalRename", src };
}

export interface TransformDirectiveSame<
  Source extends Record<string, any>,
  _D extends keyof Source,
  F extends (value: Source[_D]) => any,
> {
  __kind: "transform";
  fn: F;
  renamed: false;
}

export interface TransformDirectiveRenamed<
  Source extends Record<string, any>,
  F extends (source: Source) => any,
> {
  __kind: "transform";
  fn: F;
  renamed: true;
}
export interface MapDirective<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
  RootSource extends Record<string, any> = Source,
> {
  __kind: "map";
  mapper: MapperFns<Source, Destination, RootSource>;
  config?: SimpleMapper<Source, Destination, RootSource>;
}

type NoInfer<T> = [T][T extends any ? 0 : never];

export function map<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
  RootSource extends Record<string, any>,
>(
  mapping: SimpleMapper<Source, Destination, RootSource>
): MapDirective<Source, Destination, RootSource> {
  return {
    __kind: "map",
    config: mapping,
    mapper: compileMapper<Source, Destination, RootSource>(mapping),
  };
}


export function transform<
  Source extends Record<string, any>,
  D extends keyof Source,
  T,
>(
  fn: (value: Source[D]) => T,
): TransformDirectiveSame<Source, D, (value: Source[D]) => T> {
  return { __kind: "transform", fn, renamed: false };
}

export function transformWithRename<Source extends Record<string, any>, T>(
  fn: (source: Source) => T,
): TransformDirectiveRenamed<Source, (source: Source) => T> {
  return { __kind: "transform", fn, renamed: true };
}

export interface IgnoreDirective {
  __kind: "ignore";
}
export function ignore(): IgnoreDirective {
  return { __kind: "ignore" };
}

type Primitive =
  | string | number | boolean | bigint | symbol | null | undefined
  | Date | RegExp | Function;

type IsPlainObject<T> =
  T extends object
  ? T extends readonly any[] ? false
  : T extends Primitive ? false
  : true
  : false;

type PathIndex<
  S,
  Prefix extends string = ""
> =
  S extends object
  ? {
    [K in Extract<keyof S, string>]:
    | { path: `${Prefix}${K}`; value: S[K] }
    | (IsPlainObject<StripNullish<S[K]>> extends true
      ? PathIndex<S[K], `${Prefix}${K}.`>
      : never)
  }[Extract<keyof S, string>]
  : never;

type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
  ? PathValue<T[K], Rest>
  : never
  : P extends keyof T
  ? T[P]
  : never;

type ObjectAtPath<T, P extends string> =
  ExtractObjectField<Exclude<PathValue<T, P>, null | undefined>>;

type IsExact<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
  ? (<T>() => T extends B ? 1 : 2) extends
  (<T>() => T extends A ? 1 : 2)
  ? true
  : false
  : false;

type MatchingPathsFromIndex<Idx, V> =
  Idx extends { path: infer P extends string; value: infer T }
  ? IsExact<T, V> extends true ? P : never
  : never;

type IfNever<T, Y, N> = [T] extends [never] ? Y : N;

type LocalRenameFor<DVal, Idx> =
  IfNever<
    MatchingPathsFromIndex<Idx, DVal>,
    never,
    RenameDirective<MatchingPathsFromIndex<Idx, DVal> & string>
  >;

type GlobalRenameFor<DVal, RootIdx> =
  IfNever<
    MatchingPathsFromIndex<RootIdx, DVal>,
    never,
    GlobalRenameDirective<`source.${MatchingPathsFromIndex<RootIdx, DVal> & string}`>
  >;
type PathsFromIndex<Idx> =
  Idx extends { path: infer P extends string } ? P : never;

type ValueAtPathFromIndex<Idx, P extends string> =
  Extract<Idx, { path: P }> extends { value: infer V } ? V : never;

type ObjectishPathsFromIndex<Idx> =
  PathsFromIndex<Idx> extends infer P
  ? P extends string
  ? ExtractObjectField<StripNullish<ValueAtPathFromIndex<Idx, P>>> extends never
  ? never
  : P
  : never
  : never;

type ObjectishPaths<RootSource extends Record<string, any>> =
  ObjectishPathsFromIndex<PathIndex<RootSource, "">>;


export interface NullableMapFromDirective<
  RootSource extends Record<string, any>,
  SrcPath extends string,
  Destination extends Record<string, any>,
> {
  __kind: "nullableMapFrom";
  src: SrcPath;
  mapper: MapperFns<any, Destination, RootSource>;
  config?: SimpleMapper<any, Destination, RootSource>;
}


export function nullableMapFrom<
  RootSource extends Record<string, any>,
  SrcPath extends ObjectishPaths<RootSource>,
  Destination extends Record<string, any>,
  SrcObj extends Record<string, any> = ObjectAtPath<RootSource, SrcPath>,
>(
  src: SrcPath,
  mapping: SimpleMapper<SrcObj, Destination, RootSource>,
): NullableMapFromDirective<RootSource, SrcPath, Destination> {
  return {
    __kind: "nullableMapFrom",
    src,
    config: mapping as SimpleMapper<any, Destination, RootSource>,
    mapper: compileMapper<SrcObj, Destination, RootSource>(mapping),
  };
}

export interface OptionalMapFromDirective<
  RootSource extends Record<string, any>,
  SrcPath extends string,
  Destination extends Record<string, any>,
> {
  __kind: "optionalMapFrom";
  src: SrcPath;
  mapper: MapperFns<any, Destination, RootSource>;
  config?: SimpleMapper<any, Destination, RootSource>;
}


export function optionalMapFrom<
  RootSource extends Record<string, any>,
  SrcPath extends ObjectishPaths<RootSource>,
  Destination extends Record<string, any>,
  SrcObj extends Record<string, any> = ObjectAtPath<RootSource, SrcPath>,
>(
  src: SrcPath,
  mapping: SimpleMapper<SrcObj, Destination, RootSource>,
): OptionalMapFromDirective<RootSource, SrcPath, Destination> {
  return {
    __kind: "optionalMapFrom",
    src,
    config: mapping as SimpleMapper<any, Destination, RootSource>,
    mapper: compileMapper<SrcObj, Destination, RootSource>(mapping),
  };
}

type ExtractObjectField<T> = T extends Record<string, any>
  ? T extends readonly any[]
  ? never
  : T
  : never;

type Nullish = null | undefined;

type PlainObject = Record<string, any>;
type StripNullish<T> = Exclude<T, Nullish>;

type ProducedObject<T> = ExtractObjectField<StripNullish<T>>;

export interface FlatMapAfterDirective<
  RootSource extends PlainObject,
  Destination extends PlainObject,
> {
  __kind: "flatMapAfter";
  fn: (root: RootSource) => any;
  mapper: MapperFns<any, Destination, RootSource>;
  config?: unknown;
}

export function flatMapAfter<
  F extends (root: any) => any,
  RootSource extends PlainObject = Parameters<F>[0] & PlainObject,
  ProducedObj extends PlainObject = ProducedObject<ReturnType<F>>,
>(fn: F) {
  return function <Destination extends PlainObject>(
    mapping: NoInfer<SimpleMapper<ProducedObj, Destination, RootSource>>,
  ): FlatMapAfterDirective<RootSource, Destination> {
    return {
      __kind: "flatMapAfter",
      fn: fn as any,
      config: mapping,
      mapper: compileMapper<any, Destination, RootSource>(mapping as any),
    };
  };
}

export interface FlatMapDirective<
  RootSource extends Record<string, any>,
  Destination extends Record<string, any>
> {
  __kind: "flatMap";
  mapper: MapperFns<RootSource, Destination, RootSource>;
  config?: SimpleMapper<RootSource, Destination, RootSource>;
  __types?: (s: RootSource, d: Destination, r: RootSource) => void;
}

export function flatMap<
  RootSource extends Record<string, any>,
  Destination extends Record<string, any>,
>(
  mapping: SimpleMapper<RootSource, Destination, RootSource>
): FlatMapDirective<RootSource, Destination> {
  return {
    __kind: "flatMap",
    config: mapping,
    mapper: compileMapper<RootSource, Destination, RootSource>(mapping),
  };
}

export interface NullableMapDirective<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
  RootSource extends Record<string, any> = Source,
> {
  __kind: "nullableMap";
  mapper: MapperFns<Source, Destination, RootSource>;
  config?: SimpleMapper<Source, Destination, RootSource>;
}

export interface OptionalMapDirective<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
  RootSource extends Record<string, any> = Source,
> {
  __kind: "optionalMap";
  mapper: MapperFns<Source, Destination, RootSource>;
  config?: SimpleMapper<Source, Destination, RootSource>;
}

export function nullableMap<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
  RootSource extends Record<string, any>,
>(
  mapping: SimpleMapper<Source, Destination, RootSource>
): NullableMapDirective<Source, Destination, RootSource> {
  return {
    __kind: "nullableMap",
    config: mapping,
    mapper: compileMapper<Source, Destination, RootSource>(mapping),
  };
}

export function optionalMap<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
  RootSource extends Record<string, any>,
>(
  mapping: SimpleMapper<Source, Destination, RootSource>
): OptionalMapDirective<Source, Destination, RootSource> {
  return {
    __kind: "optionalMap",
    config: mapping,
    mapper: compileMapper<Source, Destination, RootSource>(mapping),
  };
}


type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;


// See: https://github.com/microsoft/TypeScript/issues/28545
type DestVal<
  Destination extends Record<string, any>,
  D extends keyof Destination & string
> = Destination[D];

type ObjOrNever<T> = ExtractObjectField<StripNullish<T>>;

export type MapMatchingKeys<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
  RootSource extends Record<string, any> = Source,
  SrcIdx extends PathIndex<Source, ""> = PathIndex<Source, "">,
  RootIdx extends PathIndex<RootSource, ""> = PathIndex<RootSource, "">,
> = Partial<{
  [D in keyof Destination & string]-?:
  | (D extends keyof Source
    ? (IsExact<Source[D], DestVal<Destination, D>> extends true ? D : never)
    : never)
  | (D extends keyof Source
    ? (IsExact<Source[D], DestVal<Destination, D>> extends true
      ? never
      : (
        | LocalRenameFor<DestVal<Destination, D>, SrcIdx>
        | GlobalRenameFor<DestVal<Destination, D>, RootIdx>

        | TransformDirectiveSame<
          Source,
          D,
          (v: Source[D]) => DestVal<Destination, D>
        >

        | TransformDirectiveRenamed<
          Source,
          (s: Source) => DestVal<Destination, D>
        >

        | (
          D extends keyof Source
          ? ExtractObjectField<Destination[D]> extends never
          ? never
          : ExtractObjectField<Source[D]> extends never
          ? never
          : HasNull<Destination[D]> extends true
          ? NullableMapDirective<
            ExtractObjectField<StripNullish<Source[D]>>,
            ExtractObjectField<StripNullish<Destination[D]>>,
            RootSource
          >
          : HasUndefined<Destination[D]> extends true
          ? OptionalMapDirective<
            ExtractObjectField<StripNullish<Source[D]>>,
            ExtractObjectField<StripNullish<Destination[D]>>,
            RootSource
          >
          : MapDirective<
            ExtractObjectField<Source[D]>,
            ExtractObjectField<Destination[D]>,
            RootSource
          >
          : never
        )

        | (StripNullish<Source[D]> extends readonly any[]
          ? StripNullish<DestVal<Destination, D>> extends readonly any[]
          ? ExtractObjectField<ArrayElement<StripNullish<Source[D]>>> extends infer SE
          ? ExtractObjectField<ArrayElement<StripNullish<DestVal<Destination, D>>>> extends infer DE
          ? SE extends Record<string, any>
          ? DE extends Record<string, any>
          ? HasNull<DestVal<Destination, D>> extends true
          ? NullableMapDirective<SE, DE, RootSource>
          : HasUndefined<DestVal<Destination, D>> extends true
          ? OptionalMapDirective<SE, DE, RootSource>
          : MapDirective<SE, DE, RootSource>
          : never
          : never
          : never
          : never
          : never
          : never)

        | (undefined extends DestVal<Destination, D> ? IgnoreDirective : never)
      ))
    : (
      | LocalRenameFor<DestVal<Destination, D>, SrcIdx>
      | GlobalRenameFor<DestVal<Destination, D>, RootIdx>
      | TransformDirectiveRenamed<Source, (s: Source) => DestVal<Destination, D>>
      | (
        ExtractObjectField<Destination[D]> extends never
        ? never
        : HasNullish<Destination[D]> extends true
        ? never
        : (
          ExtractObjectField<Source[D]> extends never
          ? FlatMapDirective<
            ExtractObjectField<RootSource>,
            ExtractObjectField<Destination[D]>
          >
          : never
        )
      )
      | (
        ObjOrNever<Destination[D]> extends infer DO
        ? DO extends Record<string, any>
        ? FlatMapAfterDirective<RootSource, DO>
        : never
        : never
      )
      | (
        HasNull<Destination[D]> extends true
        ? (
          NullableMapFromDirective<
            RootSource,
            string,
            ObjOrNever<Destination[D]>
          >
          & { src: ObjectishPaths<RootSource> }
        )
        : never
      )
      | (
        HasUndefined<Destination[D]> extends true
        ? (
          OptionalMapFromDirective<
            RootSource,
            string,
            ObjOrNever<Destination[D]>
          >
          & { src: ObjectishPaths<RootSource> }
        )
        : never
      )
      | (undefined extends DestVal<Destination, D> ? IgnoreDirective : never)
    ))
}>;

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type SimpleMapper<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
  RootSource extends Record<string, any> = Source,
> = Expand<Required<MapMatchingKeys<Source, Destination, RootSource>>>;

export type MapOneFn<Source, Destination, RootSource = Source> = (
  source: Source,
  root?: RootSource,
) => Destination;
export type MapManyFn<Source, Destination, RootSource = Source> = (
  source: Source[],
  root?: RootSource,
) => Destination[];

export type MapperFns<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
  RootSource extends Record<string, any> = Source,
> = {
  mapOne: MapOneFn<Source, Destination, RootSource>;
  mapMany: MapManyFn<Source, Destination, RootSource>;
};

export function compileMapper<
  Source extends Record<string, any>,
  Destination extends Record<string, any>,
  RootSource extends Record<string, any> = Source,
>(
  mapping: SimpleMapper<Source, Destination, RootSource>
): MapperFns<Source, Destination, RootSource> {

  const helperFns: Array<(...args: any[]) => any> = [];
  const literalAssignments: string[] = [];

  const indent = (value: string): string =>
    value
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n");

  const accessor = (path: string[]): string => {
    if (path.length === 0) {
      return "source";
    }

    return `source${path
      .map((segment) => `["${jsStringEscape(segment)}"]`)
      .join("")}`;
  };

  const rootAccessor = (path: string[]): string => {
    if (path.length === 0) {
      return "root";
    }

    return `root${path
      .map((segment) => `["${jsStringEscape(segment)}"]`)
      .join("")}`;
  };

  const buildObjectLiteral = (
    objectMapping: Record<string, any>,
    sourcePath: string[],
  ): string => {
    const entries: string[] = [];

    for (const nestedKey of Object.keys(objectMapping)) {
      const nestedInstruction = objectMapping[nestedKey];

      if (
        nestedInstruction &&
        typeof nestedInstruction === "object" &&
        "__kind" in nestedInstruction &&
        nestedInstruction.__kind === "ignore"
      ) {
        continue;
      }

      const expression = buildValueExpression(nestedKey, nestedInstruction, sourcePath);
      entries.push(`"${jsStringEscape(nestedKey)}": ${expression},`);
    }

    if (!entries.length) {
      return "{}";
    }

    const nestedObject = `{
${indent(entries.join("\n"))}
}`;

    const sourceAccessor = accessor(sourcePath);
    return `(${sourceAccessor} == null ? null : ${nestedObject})`;
  };

  const buildValueExpression = (
    destKey: string,
    instruction: unknown,
    sourcePath: string[],
  ): string => {
    if (typeof instruction === "string") {
      if (sourcePath.length === 0 && instruction !== destKey) {
        throw new Error(
          `Direct mapping for destination field "${destKey}" must be "${destKey}", but got "${instruction}".`,
        );
      }

      return accessor([...sourcePath, instruction]);
    }

    if (
      instruction &&
      typeof instruction === "object" &&
      "__kind" in instruction
    ) {
      const directive = instruction as
        | RenameDirective<RenameSourcePath>
        | GlobalRenameDirective<GlobalRenameSourcePath>
        | TransformDirectiveSame<Source, string, (value: any) => any>
        | TransformDirectiveRenamed<Source, (source: Source) => any>
        | MapDirective<any, any, any>
        | FlatMapDirective<any, any>
        | NullableMapFromDirective<RootSource, string, any>
        | OptionalMapFromDirective<RootSource, string, any>
        | FlatMapAfterDirective<RootSource, any>
        | NullableMapDirective<Source, any, RootSource>
        | OptionalMapDirective<Source, any, RootSource>
        | IgnoreDirective;

      switch (directive.__kind) {
        case "rename": {
          const srcSegments = directive.src.split(".");
          return accessor([...sourcePath, ...srcSegments]);
        }
        case "globalRename": {
          const srcSegments = directive.src.split(".");
          const pathSegments = srcSegments[0] === "source"
            ? srcSegments.slice(1)
            : srcSegments;
          return rootAccessor(pathSegments);
        }
        case "transform": {
          const transformDirective = directive as
            | TransformDirectiveSame<Source, string, (value: any) => any>
            | TransformDirectiveRenamed<Source, (source: Source) => any>;
          const helperIndex = helperFns.push(transformDirective.fn) - 1;
          const sourceAccessor = accessor(sourcePath);

          if (transformDirective.renamed) {
            return `helpers[${helperIndex}](${sourceAccessor})`;
          }

          return `helpers[${helperIndex}](${accessor([...sourcePath, destKey])})`;
        }
        case "flatMap": {
          const mapDirective = directive as FlatMapDirective<any, any>;
          const helperIndex = helperFns.push((_ignored: any, root: any) =>
            mapDirective.mapper.mapOne(root, root)
          ) - 1;

          return `helpers[${helperIndex}](null, root)`;
        }

        case "map": {
          const mapDirective = directive as MapDirective<any, any, any>;
          const helperIndex = helperFns.push((value: any, root: any) =>
            Array.isArray(value)
              ? mapDirective.mapper.mapMany(value, root)
              : mapDirective.mapper.mapOne(value, root)
          ) - 1;

          const parentAccessor = accessor(sourcePath);
          const sourceAccessor = accessor([...sourcePath, destKey]);

          return `(${parentAccessor} == null
    ? null
    : (() => {
        const v = ${sourceAccessor};
        return helpers[${helperIndex}](
          (v == null ? {} : v),
          root
        );
      })()
  )`;
        }

        case "nullableMap": {
          const d = directive as NullableMapDirective<any, any, any>;

          const helperIndex = helperFns.push((value: any, root: any) =>
            Array.isArray(value)
              ? d.mapper.mapMany(value, root)
              : d.mapper.mapOne(value, root)
          ) - 1;

          const src = accessor([...sourcePath, destKey]);
          return `(() => {
    const v = ${src};
    return (v == null ? null : helpers[${helperIndex}](v, root));
  })()`;
        }


        case "optionalMap": {
          const d = directive as OptionalMapDirective<any, any, any>;

          const helperIndex = helperFns.push((value: any, root: any) =>
            Array.isArray(value)
              ? d.mapper.mapMany(value, root)
              : d.mapper.mapOne(value, root)
          ) - 1;

          const src = accessor([...sourcePath, destKey]);
          return `(() => {
    const v = ${src};
    return (v === undefined ? undefined : helpers[${helperIndex}](v, root));
  })()`;
        }



        case "flatMapAfter": {
          const flatMapAfterDirective = directive as FlatMapAfterDirective<
            RootSource,
            any
          >;
          const mapHelperIndex = helperFns.push((value: any, root: any) =>
            flatMapAfterDirective.mapper.mapOne(value, root)
          ) - 1;

          const transformHelperIndex = helperFns.push(flatMapAfterDirective.fn) - 1;
          return `(() => {
  const intermediate = helpers[${transformHelperIndex}](root);
  return helpers[${mapHelperIndex}](intermediate, root);
})()`;
        }
        case "nullableMapFrom": {
          const nullableMapDirective = directive as NullableMapFromDirective<
            RootSource,
            string,
            any
          >;

          const srcSegments = nullableMapDirective.src.split(".");

          const helperIndex = helperFns.push((root: any) => {
            let value = root;
            for (const seg of srcSegments) {
              if (value == null) return null;
              value = value[seg];
            }
            if (value == null) return null;
            return nullableMapDirective.mapper.mapOne(value, root);
          }) - 1;

          return `helpers[${helperIndex}](root)`;
        }

        case "optionalMapFrom": {
          const optionalMapDirective = directive as OptionalMapFromDirective<
            RootSource,
            string,
            any
          >;
          const srcSegments = optionalMapDirective.src.split(".");
          const helperIndex = helperFns.push((root: any) => {
            let value = root;
            for (const seg of srcSegments) {
              if (value == undefined) return undefined;
              value = value[seg];
            }
            if (value == undefined) return undefined;
            return optionalMapDirective.mapper.mapOne(value, root);
          }) - 1;

          return `helpers[${helperIndex}](root)`;
        }
        default:
          throw new Error("Invalid directive kind");
      }
    }

    if (instruction && typeof instruction === "object") {
      const nestedSourcePath = [...sourcePath, destKey];
      return buildObjectLiteral(
        instruction as Record<string, any>,
        nestedSourcePath,
      );
    }

    throw new Error(
      `Invalid mapping instruction for destination field "${destKey}".`,
    );
  };

  for (const destKey of Object.keys(mapping) as Array<keyof typeof mapping & string>) {
    const instruction = mapping[destKey]!;
    if (instruction === undefined) {
      throw new Error(`Instruction at "${destKey}" field in destination is undefined`);
    }

    if (
      instruction &&
      typeof instruction === "object" &&
      "__kind" in instruction &&
      instruction.__kind === "ignore"
    ) {
      continue;
    }

    const destField = `"${jsStringEscape(destKey)}"`;
    const expression = buildValueExpression(destKey, instruction, []);

    literalAssignments.push(`${destField}: ${expression},`);
  }

  const mapOneBody = `const root = (rootArg == null ? source : rootArg);\nreturn {\n${literalAssignments.join('\n')}\n};`;

  const mapOneInner = new Function(
    "source",
    "helpers",
    "rootArg",
    mapOneBody
  ) as (source: Source, helpers: Array<(...args: any[]) => any>, rootArg: RootSource | undefined) => Destination;
  const mapOne: MapOneFn<Source, Destination, RootSource> = (
    source,
    root,
  ) => mapOneInner(source, helperFns, root ?? (source as unknown as RootSource));

  const mapManyBody = `
    const results = new Array(input.length);
    for (let i = 0; i < input.length; ++i) {
      const source = input[i];
      const root = (rootArg == null ? source : rootArg);
      results[i] = {
        ${literalAssignments.join('\n')}
      };
    }
    return results;
  `;
  const mapManyInner = new Function(
    "input",
    "helpers",
    "rootArg",
    mapManyBody
  ) as (input: Source[], helpers: Array<(...args: any[]) => any>, rootArg: RootSource | undefined) => Destination[];
  const mapMany: MapManyFn<Source, Destination, RootSource> = (
    input,
    root,
  ) => mapManyInner(input, helperFns, root);

  return { mapOne, mapMany };
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

/**
 * Helper for inline nested mappings inside `compileMapper` configurations.
 *
 * It compiles the provided nested configuration once and returns a map directive
 * that automatically invokes the nested mapper when the field is processed.
 */
export type SourceOfMapping<M> = M extends SimpleMapper<infer S, any, any> ? S : never;
export type DestinationOfMapping<M> = M extends SimpleMapper<any, infer D, any> ? D : never;

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

export type AssertEqual<T, Expected> = T extends Expected
  ? Expected extends T
  ? true
  : never
  : never;

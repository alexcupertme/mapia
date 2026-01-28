type PrimitiveTag =
  | "string"
  | "number"
  | "boolean"
  | "bigint"
  | "symbol"
  | "undefined"
  | "null";

type PrimitiveOf<T extends PrimitiveTag> = T extends "string"
  ? string
  : T extends "number"
    ? number
    : T extends "boolean"
      ? boolean
      : T extends "bigint"
        ? bigint
        : T extends "symbol"
          ? symbol
          : T extends "undefined"
            ? undefined
            : T extends "null"
              ? null
              : never;

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

export type DeepCastTypes<
  T,
  From,
  To,
  Preserve extends object = BuiltinAtomic,
> = [T] extends [From]
  ? To
  : T extends readonly (infer U)[]
    ? DeepCastTypes<U, From, To>[]
    : T extends Preserve
      ? T
      : T extends object
        ? [From] extends [undefined]
          ? {
              [K in keyof T]-?: DeepCastTypes<
                undefined extends T[K] ? Exclude<T[K], undefined> | To : T[K],
                From,
                To
              >;
            }
          : { [K in keyof T]: DeepCastTypes<T[K], From, To> }
        : T;

type Ctor<T = any> = new (...args: any[]) => T;

export function deepCastTypes<
  T,
  F extends PrimitiveTag,
  G extends PrimitiveTag,
>(value: T, from: F, to: G): DeepCastTypes<T, PrimitiveOf<F>, PrimitiveOf<G>>;

export function deepCastTypes<T, F extends Ctor, G extends Ctor>(
  value: T,
  from: F,
  to: G,
): DeepCastTypes<T, InstanceType<F>, InstanceType<G>>;

export function deepCastTypes<T, F extends PrimitiveTag, G extends Ctor>(
  value: T,
  from: F,
  to: G,
): DeepCastTypes<T, PrimitiveOf<F>, InstanceType<G>>;

export function deepCastTypes<T, F extends Ctor, G extends PrimitiveTag>(
  value: T,
  from: F,
  to: G,
): DeepCastTypes<T, InstanceType<F>, PrimitiveOf<G>>;

export function deepCastTypes<T>(
  value: T,
  from: PrimitiveTag | Ctor,
  to: PrimitiveTag | Ctor,
): any {
  const isMatch = (v: unknown): boolean => {
    if (typeof from === "string") {
      if (from === "null") return v === null;
      if (from === "undefined") return v === undefined;
      return typeof v === from;
    }
    return v instanceof from;
  };

  const convert = (v: any): any => {
    if (typeof to === "string") {
      switch (to) {
        case "string":
          return String(v);
        case "number":
          return Number(v);
        case "boolean":
          return Boolean(v);
        case "bigint":
          return BigInt(v);
        case "symbol":
          return typeof v === "symbol" ? v : Symbol(String(v));
        case "undefined":
          return undefined;
        case "null":
          return null;
      }
    }
    return new to(v);
  };

  const walk = (v: unknown): unknown => {
    if (isMatch(v)) return convert(v);

    if (Array.isArray(v)) return v.map(walk);

    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};

      for (const [k, cur] of Object.entries(v as Record<string, unknown>)) {
        out[k] = walk(cur);
      }
      return out;
    }

    return v;
  };

  return walk(value);
}

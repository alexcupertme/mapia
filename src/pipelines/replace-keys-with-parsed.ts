type ReplaceKeysWithParsed<
  T,
  Suffix extends string,
  From,
  To,
> = T extends readonly (infer U)[]
  ? ReplaceKeysWithParsed<U, Suffix, From, To>[]
  : T extends object
    ? {
        [K in keyof T]: K extends `${string}${Suffix}`
          ? T[K] extends From | null | undefined
            ? To | Exclude<T[K], From>
            : ReplaceKeysWithParsed<T[K], Suffix, From, To>
          : ReplaceKeysWithParsed<T[K], Suffix, From, To>;
      }
    : T;

export type ReplaceKeysStringOrNumber<
  T,
  Suffix extends string,
  To,
> = ReplaceKeysWithParsed<T, Suffix, string | number, To>;

export function isObjectOrArray(
  value: unknown,
): value is Record<string, unknown> | unknown[] {
  return typeof value === "object" && value !== null;
}

export function hasAnyKeyEndingWith(value: unknown, suffix: string): boolean {
  if (!isObjectOrArray(value)) return false;

  const walk = (v: unknown): boolean => {
    if (Array.isArray(v)) return v.some(walk);
    if (v && typeof v === "object") {
      for (const [k, cur] of Object.entries(v as Record<string, unknown>)) {
        if (k.endsWith(suffix)) return true;
        if (isObjectOrArray(cur) && walk(cur)) return true;
      }
    }
    return false;
  };

  return walk(value);
}
export function parseStringOrNumberFieldsEndsWith<T, Suffix extends string, To>(
  value: T,
  endsWith: Suffix,
  Ctor: new (v: string | number) => To,
): ReplaceKeysStringOrNumber<T, Suffix, To> {
  if (!isObjectOrArray(value))
    return value as ReplaceKeysStringOrNumber<T, Suffix, To>;
  if (!hasAnyKeyEndingWith(value, endsWith))
    return value as ReplaceKeysStringOrNumber<T, Suffix, To>;

  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);

    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};

      for (const [k, cur] of Object.entries(v as Record<string, unknown>)) {
        if (
          k.endsWith(endsWith) &&
          (typeof cur === "string" || typeof cur === "number")
        ) {
          out[k] = new Ctor(cur);
        } else if (
          k.endsWith(endsWith) &&
          (cur === null || cur === undefined)
        ) {
          out[k] = cur;
        } else {
          out[k] = walk(cur);
        }
      }
      return out;
    }

    return v;
  };

  return walk(value) as ReplaceKeysStringOrNumber<T, Suffix, To>;
}

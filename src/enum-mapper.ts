/**
 * Enum mapping helpers inspired by the main mapper but focusing purely on type safety.
 *
 * The helpers only exist at the type level and make it easy to describe a map between
 * two enum-like objects that share a consistent naming convention, for example:
 * `VIEWER` → `VIEWER_ENUM`, `READER` → `READER_ENUM`.
 */

type EnumLike = Record<string, string | number>;

/** Extracts the string keys of an enum-like object (ignores reverse mappings). */
export type EnumNames<Enum extends EnumLike> = Extract<keyof Enum, string>;

/** Extracts the value union for an enum-like type. */
export type EnumValues<Enum extends EnumLike> = Enum[EnumNames<Enum>];

/** Builds a destination key by appending a suffix to the source key. */
export type EnumSuffix<Key extends string, Suffix extends string> = `${Key}${Suffix}`;

type EnumDestinationKey<
  Key extends string,
  Destination extends EnumLike,
  Suffix extends string,
> = EnumSuffix<Key, Suffix> extends keyof Destination ? EnumSuffix<Key, Suffix> : never;

type EnumSuffixNames<Source extends EnumLike, Suffix extends string> = {
  [Key in EnumNames<Source>]: EnumSuffix<Key, Suffix>;
}[EnumNames<Source>];

type AssertExactUnion<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;

type EnumSuffixMatch<
  Source extends EnumLike,
  Destination extends EnumLike,
  Suffix extends string,
> = AssertExactUnion<EnumNames<Destination>, EnumSuffixNames<Source, Suffix>>;

/**
 * Describes a fully inferred mapping between two enum-like objects that share a suffix.
 *
 * By default the helper expects destination keys to be the source key with `_ENUM` appended.
 * If the destination enum does not expose the expected key (i.e. the suffix is not present),
 * the property type becomes `never`, so assigning the mapping will fail at compile time.
 * It also rejects destination enums that declare stray keys, so the helper validates both enums at once.
 */
export type EnumAutoSuffixMapping<
  Source extends EnumLike,
  Destination extends EnumLike,
  Suffix extends string = "_ENUM",
> = EnumSuffixMatch<Source, Destination, Suffix> extends never
  ? never
  : Readonly<{
      [Key in EnumNames<Source>]: Destination[
        EnumDestinationKey<Key, Destination, Suffix>
      ];
    }>;

/**
 * Utility that exposes the inferred destination keys for each source key.
 * This can be useful when you want to inspect the concrete key names instead of the values.
 */
export type EnumAutoSuffixDestinationKeys<
  Source extends EnumLike,
  Destination extends EnumLike,
  Suffix extends string = "_ENUM",
> = EnumSuffixMatch<Source, Destination, Suffix> extends never
  ? never
  : {
      readonly [Key in EnumNames<Source>]: EnumDestinationKey<Key, Destination, Suffix>;
    };

type EnumMappingValue<
  Source extends EnumLike,
  Destination extends EnumLike,
  Suffix extends string,
> = EnumAutoSuffixMapping<Source, Destination, Suffix>[EnumNames<Source>];

export type EnumMapperResult<
  Source extends EnumLike,
  Destination extends EnumLike,
  Suffix extends string = "_ENUM",
> = {
  readonly forward: Record<
    EnumValues<Source>,
    EnumMappingValue<Source, Destination, Suffix>
  >;
  readonly reverse: Record<
    EnumMappingValue<Source, Destination, Suffix>,
    EnumValues<Source>
  >;
  toDestination: (
    value: EnumValues<Source>,
  ) => EnumMappingValue<Source, Destination, Suffix>;
  toSource: (
    value: EnumMappingValue<Source, Destination, Suffix>,
  ) => EnumValues<Source>;
};

/**
 * A helper that pins an `EnumAutoSuffixMapping` to the provided source, destination, and optional suffix.
 * It produces a bidirectional mapper that validates both enums and lets you translate values in both directions.
 */
export function enumMapper<
  Source extends EnumLike,
  Destination extends EnumLike,
  Suffix extends string = "_ENUM",
>(
  sourceEnum: Source,
  _destinationEnum: Destination,
  mapping: EnumAutoSuffixMapping<Source, Destination, Suffix>,
  _suffix?: Suffix,
): EnumMapperResult<Source, Destination, Suffix> {
  const forward = {} as Record<
    EnumValues<Source>,
    EnumMappingValue<Source, Destination, Suffix>
  >;
  const reverse = {} as Record<
    EnumMappingValue<Source, Destination, Suffix>,
    EnumValues<Source>
  >;

  for (const sourceKey of Object.keys(mapping) as Array<EnumNames<Source>>) {
    const sourceValue = sourceEnum[sourceKey] as EnumValues<Source>;
    const destValue = mapping[sourceKey] as EnumMappingValue<Source, Destination, Suffix>;

    forward[sourceValue] = destValue;
    reverse[destValue] = sourceValue;
  }

  void _destinationEnum;
  void _suffix;

  return {
    forward,
    reverse,
    toDestination: (value) => forward[value],
    toSource: (value) => reverse[value],
  };
}

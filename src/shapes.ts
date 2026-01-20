import { MapperFns } from "mapia";

import {
  chainEither,
  Either,
  foldEither,
  left,
  Right,
  right,
} from "./fp/either";

export type Decoder<Input, Output> = (input: Input) => Either<Error, Output>;

export type SafeDecoder<I, O> = (input: I) => Right<O>;

export const numberDecoder: SafeDecoder<
  number | string | boolean | bigint,
  number
> = (x) => right(Number(x));

export const stringDecoder: SafeDecoder<
  string | Date | boolean | number | bigint,
  string
> = (x) => right(String(x));

export const anyDecoderWrap =
  <T>(): SafeDecoder<T, T> =>
    // eslint-disable-next-line unicorn/consistent-function-scoping
    (x) =>
      right(x);

export const mapOneDecoder =
  <I extends Record<string, any>, O extends Record<string, any>>(
    mapper: MapperFns<I, O>,
  ): SafeDecoder<I, O> =>
    (x) =>
      right(mapper.mapOne(x));

export const mapManyDecoder =
  <I extends Record<string, any>, O extends Record<string, any>>(
    mapper: MapperFns<I, O>,
  ): SafeDecoder<I[], O[]> =>
    (x) =>
      right(mapper.mapMany(x));

export const urlDecoder: Decoder<string, URL> = (
  x: string,
): Either<Error, URL> => {
  try {
    return right(new URL(x));
  } catch (error) {
    return left(error as Error);
  }
};

export const dateDecoder: SafeDecoder<string, Date> = (x) => right(new Date(x));

/**
 * Wraps any “preprocessor” decoder (U → Either<Error, I>)
 * around a “real” decoder (I → Either<Error, O>)
 * to give you a U → Either<Error, O>.
 */
export function composeDecoder<I, A, B>(
  first: Decoder<I, A>,
  second: Decoder<A, B>,
): Decoder<I, B> {
  return (input: I) => chainEither(first(input), second);
}

/** Turn `u: U | null | undefined` into `U | null` */
export const tryNonNullable =
  <T>(): Decoder<T | null | undefined, T> =>
    // eslint-disable-next-line unicorn/consistent-function-scoping
    <U>(u: U | null | undefined): Either<Error, U> =>
      u == null ? left(new Error("Null value found")) : right(u);

export const leftToDefault =
  <I, O>(shape: Decoder<I, O>, defaultValue: O): ((input: I) => O) =>
    (i) =>
      foldEither(
        shape(i),
        () => defaultValue,
        (v) => v,
      );

export const leftToNull =
  <I, O>(shape: Decoder<I, O>): ((input: I) => O | null) =>
    (i) =>
      foldEither(
        shape(i),
        () => null,
        (v) => v,
      );

export const leftToUndefined =
  <I, O>(shape: Decoder<I, O>): ((input: I) => O | undefined) =>
    (i) =>
      foldEither(
        shape(i),
        // eslint-disable-next-line unicorn/no-useless-undefined
        () => undefined,
        (v) => v,
      );

export const leftToToThrow =
  <I, O>(shape: Decoder<I, O>): ((input: I) => O) =>
    (i) =>
      foldEither(
        shape(i),
        (e) => {
          throw e;
        },
        (v) => v,
      );

/**
 * Converts a value to a string
 * @param x - The input value to be converted.
 * @returns The string value.
 */
export const stringShape = (
  x: string | number | bigint | boolean | Date,
): string => stringDecoder(x).value;

/**
 * Converts a value to a number
 * @param x - The input value to be converted.
 * @returns The number value.
 */
export const numberShape = (x: number | bigint | boolean | string): number =>
  numberDecoder(x).value;

/**
 * Converts a value to a Date
 * @param x - The input value to be converted.
 * @returns The Date object.
 */
export const dateShape = (x: string): Date => dateDecoder(x).value;

/*
 * Converts a value to a URL or null if fails.
 * @param x - The input value to be converted.
 * @returns The URL object or null if the input is null or undefined.
 */
export const urlOrNullShape = leftToNull(
  composeDecoder(tryNonNullable(), urlDecoder),
);

/**
 * Converts a value to a URL or throws an error if fails.
 * @param x - The input value to be converted.
 * @returns The URL object or throws an error if the input is null or undefined.
 * @throws Error if the input is null or undefined.
 */
export const urlOrThrowShape = leftToToThrow(urlDecoder);

/*
 * Converts a value to a URL or a default value if fails.
 * @param defaultValue - The default URL object to return if the input is null or undefined.
 * @param x - The input value to be converted.
 * @returns The URL object or the default value if the input is null or undefined.
 */
export const urlOrDefaultShape = (defaultValue: URL): ((x: string) => URL) =>
  leftToDefault(composeDecoder(tryNonNullable(), urlDecoder), defaultValue);

/*
 * Converts a value to a non-nullable type.
 * @param x - The input value to be converted.
 * @returns The non-nullable value or null if the input is null or undefined.
 */
export const nullableShape =
  <T>() =>
    (x: T | null | undefined): T | null =>
      leftToNull(composeDecoder(tryNonNullable<T>(), anyDecoderWrap<T>()))(x);

export const optionalShape =
  <T>() =>
    (x: T | null | undefined): T | undefined =>
      leftToUndefined(composeDecoder(tryNonNullable<T>(), anyDecoderWrap<T>()))(x);

export const nullableShapeFrom =
  <I, O>(decoder: Decoder<I, O>) =>
    (x: I | null | undefined): O | null =>
      leftToNull(composeDecoder(tryNonNullable<I>(), decoder))(x);

/*
 * Maps an input object to an output object using the provided mapper function.
 * @param mapper - The mapper function to transform the input. (result of compileMapper)
 * @returns A function that takes an input of type I and returns an output of type O.
 */
export const mapOneShape =
  <I extends Record<string, any>, O extends Record<string, any>>(
    mapper: MapperFns<I, O>,
  ) =>
    (x: I): O =>
      mapOneDecoder(mapper)(x).value;

/**
 * Maps an array of input objects to an array of output objects using the provided mapper function.
 * @param mapper - The mapper function to transform the input. (result of compileMapper)
 * @returns A function that takes an input of type I[] and returns an output of type O[].
 */
export const mapManyShape =
  <I extends Record<string, any>, O extends Record<string, any>>(
    mapper: MapperFns<I, O>,
  ) =>
    (x: I[]): O[] =>
      mapManyDecoder(mapper)(x).value;

/**
 * Maps a nullable input to a nullable output using the provided mapper function.
 * @param mapper - The mapper function to transform the input. (result of compileMapper)
 * @returns A function that takes an input of type I | null | undefined and returns an output of type O | null.
 */
export const nullableMapManyShape =
  <I extends Record<string, any>, O extends Record<string, any>>(
    mapper: MapperFns<I, O>,
  ) =>
    (x: I[] | null | undefined): O[] | null =>
      nullableShapeFrom(mapManyDecoder(mapper))(x);

/**
 * Maps a nullable input to a nullable output using the provided mapper function.
 * @param mapper - The mapper function to transform the input. (result of compileMapper)
 * @returns A function that takes an input of type I | null | undefined and returns an output of type O | null.
 */
export const nullableMapOneShape =
  <I extends Record<string, any>, O extends Record<string, any>>(
    mapper: MapperFns<I, O>,
  ) =>
    (x: I | null | undefined): O | null =>
      nullableShapeFrom(mapOneDecoder(mapper))(x);

/**
 * Alias for `nullableShape` function
 */
export const nullMM = nullableMapManyShape;

/**
 * Alias for `nullableMapManyShape` function
 */
export const nullMO = nullableMapOneShape;

/**
 * Alias for `mapOneShape` function
 */
export const MO = mapOneShape;

/**
 * Alias for `mapManyShape` function
 */
export const MM = mapManyShape;

export type Left<E> = { tag: "left"; error: E };
export type Right<A> = { tag: "right"; value: A };

export type Either<E, A> = Left<E> | Right<A>;

export const left = <E>(error: E): Left<E> => ({
  tag: "left",
  error,
});
export const right = <A>(value: A): Right<A> => ({
  tag: "right",
  value,
});

export const mapEither = <E, A, B>(
  ea: Either<E, A>,
  fn: (a: A) => B,
): Either<E, B> => (ea.tag === "left" ? left(ea.error) : right(fn(ea.value)));

export const chainEither = <E, A, B>(
  ea: Either<E, A>,
  fn: (a: A) => Either<E, B>,
): Either<E, B> => (ea.tag === "left" ? left(ea.error) : fn(ea.value));

export const foldEither = <E, A, R>(
  ea: Either<E, A>,
  onError: (e: E) => R,
  onSuccess: (a: A) => R,
): R => (ea.tag === "left" ? onError(ea.error) : onSuccess(ea.value));

export const liftNullable =
  <A, B>(fn: (x: A) => B) =>
  (x: A | null | undefined): B | null =>
    x == null ? null : fn(x);

export const liftOptional =
  <A, B>(fn: (x: A) => B) =>
  (x: A | null | undefined): B | null | undefined => {
    if (x === null || x === undefined) {
      return x as null | undefined;
    }

    return fn(x);
  };

export const liftMaybe =
  <A, B>(fn: (x: A) => B) =>
  (x: A | null | undefined): B | undefined =>
    x == undefined ? undefined : fn(x);

export const or = <A, B>(a: Either<Error, A>, b: B): A | B => {
  return a.tag === "left" ? b : a.value;
};

export type Either<E, A> =
  | { tag: "left"; error: E }
  | { tag: "right"; value: A };

export const left = <E, A>(e: E): Either<E, A> => ({ tag: "left", error: e });
export const right = <E, A>(v: A): Either<E, A> => ({ tag: "right", value: v });

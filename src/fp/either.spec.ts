import { chainEither, foldEither, left, mapEither, right } from "./either";

describe("Either", () => {
  it("should create a Left", () => {
    const error: string = "An error occurred";
    const result = left<string>(error);

    expect(result).toEqual({ tag: "left", error });
  });

  it("should create a Right", () => {
    const value: number = 42;
    const result = right<number>(value);

    expect(result).toEqual({ tag: "right", value });
  });

  it("should map over a Right", () => {
    const value: number = 42;
    const result = mapEither<number, number, number>(
      right(value),
      (x) => x + 1,
    );

    expect(result).toEqual({ tag: "right", value: 43 });
  });

  it("should not map over a Left", () => {
    const error: string = "An error occurred";
    const result = mapEither<string, number, number>(left(error), (x) => x + 1);

    expect(result).toEqual({ tag: "left", error });
  });

  it("should chain over a Right", () => {
    const value: number = 42;
    const result = chainEither<number, number, number>(right(value), (x) =>
      right(x + 1),
    );

    expect(result).toEqual({ tag: "right", value: 43 });
  });

  it("should not chain over a Left", () => {
    const error: string = "An error occurred";
    const result = chainEither<string, number, number>(left(error), (x) =>
      right(x + 1),
    );

    expect(result).toEqual({ tag: "left", error });
  });

  it("should fold a Right", () => {
    const value: number = 42;
    const result = foldEither<number, number, string>(
      right(value),
      (e) => `Error: ${e}`,
      (v) => `Value: ${v}`,
    );

    expect(result).toBe("Value: 42");
  });

  it("should fold a Left", () => {
    const error: string = "An error occurred";
    const result = foldEither<string, number, string>(
      left(error),
      (e) => `Error: ${e}`,
      (v) => `Value: ${v}`,
    );

    expect(result).toBe("Error: An error occurred");
  });
});

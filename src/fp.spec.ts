import { left, liftMaybe, liftNullable, liftOptional, or, right } from "./fp";

describe("fp", () => {
  describe("liftNullable", () => {
    it("should return null if input is null or undefined", () => {
      const fn = liftNullable((x: number) => x * 2);

      expect(fn(null)).toBeNull();
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(fn(undefined)).toBeNull();
    });

    it("should apply the function if input is not null or undefined", () => {
      const fn = liftNullable((x: number) => x * 2);

      expect(fn(5)).toBe(10);
    });
  });

  describe("liftOptional", () => {
    it("should return null or undefined if input is null or undefined", () => {
      const fn = liftOptional((x: number) => x * 2);

      expect(fn(null)).toBeNull();
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(fn(undefined)).toBeUndefined();
    });

    it("should apply the function if input is not null or undefined", () => {
      const fn = liftOptional((x: number) => x * 2);

      expect(fn(5)).toBe(10);
    });
  });

  describe("liftMaybe", () => {
    it("should return undefined if input is null or undefined", () => {
      const fn = liftMaybe((x: number) => x * 2);

      expect(fn(null)).toBeUndefined();
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(fn(undefined)).toBeUndefined();
    });

    it("should apply the function if input is not null or undefined", () => {
      const fn = liftMaybe((x: number) => x * 2);

      expect(fn(5)).toBe(10);
    });
  });

  describe("or", () => {
    it("should return the fallback value if Either is left", () => {
      const result = or(left(new Error("error")), "fallback");

      expect(result).toBe("fallback");
    });

    it("should return the value if Either is right", () => {
      const result = or(right(42), "fallback");

      expect(result).toBe(42);
    });
  });

  describe("Either", () => {
    it("should create a left Either", () => {
      const result = left(new Error("error"));

      expect(result).toEqual({ tag: "left", error: new Error("error") });
    });

    it("should create a right Either", () => {
      const result = right(42);

      expect(result).toEqual({ tag: "right", value: 42 });
    });
  });
});

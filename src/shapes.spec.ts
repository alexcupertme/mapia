import { right } from "./fp/either";
import { compileMapper, transform } from "./mapia";
import {
  dateShape,
  leftToDefault,
  leftToToThrow,
  leftToUndefined,
  mapManyShape,
  mapOneShape,
  nullableMapManyShape,
  nullableMapOneShape,
  nullableShape,
  nullableShapeFrom,
  numberShape,
  stringDecoder,
  stringShape,
  urlDecoder,
  urlOrDefaultShape,
  urlOrNullShape,
  urlOrThrowShape,
} from "./shapes";

describe("shapes", () => {
  describe("stringShape", () => {
    it("should convert various types to string", () => {
      const date = new Date("2023-01-01");

      expect(stringShape(123)).toBe("123");
      expect(stringShape(true)).toBe("true");
      expect(stringShape(date)).toBe(date.toString());
    });
  });

  describe("numberShape", () => {
    it("should convert various types to number", () => {
      expect(numberShape("123")).toBe(123);
      expect(numberShape(true)).toBe(1);
      expect(numberShape(false)).toBe(0);
    });
  });

  describe("dateShape", () => {
    it("should convert string to Date", () => {
      const date = dateShape("2023-01-01");

      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe("2023-01-01T00:00:00.000Z");
    });
  });

  describe("urlOrNullShape", () => {
    it("should return URL object or null", () => {
      expect(urlOrNullShape("https://example.com")).toBeInstanceOf(URL);
      expect(urlOrNullShape("invalid-url")).toBeNull();
    });
  });

  describe("urlOrThrowShape", () => {
    it("should return URL object or throw error", () => {
      expect(urlOrThrowShape("https://example.com")).toBeInstanceOf(URL);
      expect(() => urlOrThrowShape("invalid-url")).toThrow();
    });
  });

  describe("urlOrDefaultShape", () => {
    it("should return the default URL if the input is invalid", () => {
      const defaultURL = new URL("https://default.com");
      const shape = urlOrDefaultShape(defaultURL);

      expect(shape("invalid-url")).toBe(defaultURL);
    });

    it("should return the URL if the input is valid", () => {
      const defaultURL = new URL("https://default.com");
      const shape = urlOrDefaultShape(defaultURL);

      expect(shape("https://example.com")).toEqual(
        new URL("https://example.com"),
      );
    });
  });

  describe("nullableShape", () => {
    it("should return null for null or undefined input", () => {
      const shape = nullableShape<string>();

      expect(shape(null)).toBeNull();
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(shape(undefined)).toBeNull();
    });

    it("should return the value for non-null input", () => {
      const shape = nullableShape<string>();

      expect(shape("test")).toBe("test");
    });

    it("should handle non-nullable values correctly", () => {
      const shape = nullableShape<string>();

      expect(shape("test")).toBe("test");
    });

    it("should return null for null or undefined", () => {
      const shape = nullableShape<string>();

      expect(shape(null)).toBeNull();
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(shape(undefined)).toBeNull();
    });
  });

  describe("nullableShapeFrom", () => {
    it("should return null for null or undefined input", () => {
      const shape = nullableShapeFrom(
        (x: string | number | bigint | boolean | Date) => right(stringShape(x)),
      );

      expect(shape(null)).toBeNull();
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(shape(undefined)).toBeNull();
    });

    it("should apply the shape for non-null input", () => {
      const shape = nullableShapeFrom(stringDecoder);

      expect(shape(123)).toBe("123");
    });
  });

  describe("mapOneShape", () => {
    it("should map a single object", () => {
      const mapper = compileMapper<{ id: string }, { id: number }>({
        id: transform(numberShape),
      });
      const shape = mapOneShape(mapper);

      expect(shape({ id: "123" })).toEqual({ id: 123 });
    });
  });

  describe("mapManyShape", () => {
    it("should map an array of objects", () => {
      const mapper = compileMapper<{ id: string }, { id: number }>({
        id: transform(numberShape),
      });
      const shape = mapManyShape(mapper);

      expect(shape([{ id: "123" }, { id: "456" }])).toEqual([
        { id: 123 },
        { id: 456 },
      ]);
    });
  });

  describe("nullableMapOneShape", () => {
    it("should return null for null or undefined input", () => {
      const mapper = compileMapper<{ id: string }, { id: number }>({
        id: transform(numberShape),
      });
      const shape = nullableMapOneShape(mapper);

      expect(shape(null)).toBeNull();
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(shape(undefined)).toBeNull();
    });

    it("should map a single object for non-null input", () => {
      const mapper = compileMapper<{ id: string }, { id: number }>({
        id: transform(numberShape),
      });
      const shape = nullableMapOneShape(mapper);

      expect(shape({ id: "123" })).toEqual({ id: 123 });
    });
  });

  describe("nullableMapManyShape", () => {
    it("should return null for null or undefined input", () => {
      const mapper = compileMapper<{ id: string }, { id: number }>({
        id: transform(numberShape),
      });
      const shape = nullableMapManyShape(mapper);

      expect(shape(null)).toBeNull();
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(shape(undefined)).toBeNull();
    });

    it("should map an array of objects for non-null input", () => {
      const mapper = compileMapper<{ id: string }, { id: number }>({
        id: transform(numberShape),
      });
      const shape = nullableMapManyShape(mapper);

      expect(shape([{ id: "123" }, { id: "456" }])).toEqual([
        { id: 123 },
        { id: 456 },
      ]);
    });
  });

  describe("leftToUndefined", () => {
    it("should return undefined for invalid input", () => {
      const decoder = leftToUndefined(urlDecoder);

      expect(decoder("invalid-url")).toBeUndefined();
    });

    it("should return the decoded value for valid input", () => {
      const decoder = leftToUndefined(urlDecoder);

      expect(decoder("https://example.com")).toEqual(
        new URL("https://example.com"),
      );
    });
  });

  describe("leftToThrow", () => {
    it("should throw an error for invalid input", () => {
      const decoder = leftToToThrow(urlDecoder);

      expect(() => decoder("invalid-url")).toThrow();
    });

    it("should return the decoded value for valid input", () => {
      const decoder = leftToToThrow(urlDecoder);

      expect(decoder("https://example.com")).toEqual(
        new URL("https://example.com"),
      );
    });
  });

  describe("leftToDefault", () => {
    it("should return the default value for invalid input", () => {
      const defaultURL = new URL("https://default.com");
      const decoder = leftToDefault(urlDecoder, defaultURL);

      expect(decoder("invalid-url")).toBe(defaultURL);
    });

    it("should return the decoded value for valid input", () => {
      const defaultURL = new URL("https://default.com");
      const decoder = leftToDefault(urlDecoder, defaultURL);

      expect(decoder("https://example.com")).toEqual(
        new URL("https://example.com"),
      );
    });
  });
});

import {
  AssertEqual,
  compileMapper,
  ignore,
  mapRecord,
  rename,
  SimpleMapper,
  transform,
  transformWithRename,
} from "./mapia";

const formatOrderValue = (value: number): string => `formatted-${value}`;

describe("mapia", () => {
  it("should correctly work basic structures", () => {
    type Source = {
      name: string;
      age: number;
      isMale: boolean;
    };

    type Destination = {
      fullName: string;
      age: string;
      gender: "male" | "female";
    };

    const sourceToDestinationMapper = compileMapper<Source, Destination>({
      age: transform((x: number) => x.toString()),
      gender: transformWithRename((value) => value.isMale ? "male" : "female"
      ),
      fullName: rename('name')
    });

    const expected: Destination = {
      fullName: "John",
      age: "30",
      gender: "male",
    };

    const mapped = sourceToDestinationMapper.mapOne({
      name: "John",
      age: 30,
      isMale: true,
    });

    const _assert: AssertEqual<typeof mapped, Destination> = true;

    expect(mapped).toEqual(expected);
  });
  it("should correctly work with classes", () => {
    class Source {
      constructor(
        public name: string,
        public age: number,
      ) {}

      meow(): void {
        console.log("meow");
      }
    }

    class Destination {
      constructor(
        public fullName: string,
        public age: string,
      ) {}

      bark(): void {
        console.log("bark");
      }
    }

    const sourceToDestinationMapper = compileMapper<
      Omit<Source, "meow">,
      Omit<Destination, "bark">
    >({
      fullName: rename("name"),
      age: transform((x: number) => x.toString()),
    });

    const expected = new Destination("John", "30");

    const mapped = sourceToDestinationMapper.mapOne(new Source("John", 30));
    const mappedClass = new Destination(mapped.fullName, mapped.age);
    const _assert: AssertEqual<typeof mappedClass, Destination> = true;

    expect(mappedClass).toEqual(expected);
  });

  it("should keep function fields when mapping class instances", () => {
    class SourceWithFunction {
      constructor(
        public name: string,
        public formatter: (value: number) => string,
      ) {}
    }

    class DestinationWithFunction {
      constructor(
        public label: string,
        public format: (value: number) => string,
      ) {}
    }

    type SourceShape = Pick<SourceWithFunction, "name" | "formatter">;
    type DestinationShape = Pick<DestinationWithFunction, "label" | "format">;

    const mapper = compileMapper<SourceShape, DestinationShape>({
      label: rename("name"),
      format: rename("formatter"),
    });

    const mapped = mapper.mapOne(
      new SourceWithFunction("Order", formatOrderValue),
    );

    expect(mapped.label).toBe("Order");
    expect(mapped.format).toBe(formatOrderValue);
    expect(mapped.format(7)).toBe("formatted-7");

    const mappedClass = new DestinationWithFunction(
      mapped.label,
      mapped.format,
    );
    const _assert: AssertEqual<typeof mappedClass, DestinationWithFunction> =
      true;

    expect(mappedClass.format(42)).toBe("formatted-42");
  });
  it("should correctly work with nested structures", () => {
    type Source = {
      name: string;
      age: number;
      address: {
        city: string;
        country: string;
      };
    };

    type Destination = {
      name: string;
      age: number;
      location: {
        city: string;
        country: string;
      };
    };

    const expected: Destination = {
      name: "John",
      age: 30,
      location: {
        city: "New York",
        country: "USA",
      },
    };

    const mapper = compileMapper<Source, Destination>({
      name: "name",
      age: "age",
      location: rename("address"),
    });

    const mapped = mapper.mapOne({
      name: "John",
      age: 30,
      address: { city: "New York", country: "USA" },
    });

    const _assert: AssertEqual<typeof mapped, Destination> = true;

    expect(mapped).toEqual(expected);
  });
  it("should handle undefined instructions", () => {
    type Source = {
      name: string;
      age: number;
    };

    type Destination = {
      name: string;
      age: number;
    };

    const SourceToDestination: SimpleMapper<Source, Destination> = {
      name: "name",

      // @ts-expect-error For testing purposes
      age: undefined,
    };

    expect(() =>
      compileMapper<Source, Destination>(SourceToDestination),
    ).toThrow('Instruction at "age" field in destination is undefined');
  });
  it("should work with mapMany", () => {
    type Hobby = {
      name: string;
      level: number;
    };
    type Interest = {
      name: string;
      proficiency: number;
    };

    type Source = {
      name: string;
      age: number;
      hobbies: Hobby[];
    };
    type Destination = {
      name: string;
      age: number;
      interests: Interest[];
    };

    const hobbyToInterestMapper = compileMapper<Hobby, Interest>({
      name: rename("name"),
      proficiency: rename("level"),
    });

    const sourceToDestinationMapper = compileMapper<Source, Destination>({
      name: "name",
      age: "age",
      interests: transformWithRename((value: Source) =>
        hobbyToInterestMapper.mapMany(value.hobbies),
      ),
    });
    const expected: Destination = {
      name: "John",
      age: 30,
      interests: [
        { name: "reading", proficiency: 5 },
        { name: "gaming", proficiency: 3 },
      ],
    };

    const mapped = sourceToDestinationMapper.mapOne({
      name: "John",
      age: 30,
      hobbies: [
        { name: "reading", level: 5 },
        { name: "gaming", level: 3 },
      ],
    });

    const _assert: AssertEqual<typeof mapped, Destination> = true;

    expect(mapped).toEqual(expected);
  });
  it("should correctly work with arrays", () => {
    type Source = {
      name: string;
      age: number;
      hobbies: string[];
    };

    type Destination = {
      name: string;
      age: number;
      interests: string[];
    };

    const sourceToDestinationMapper = compileMapper<Source, Destination>({
      name: "name",
      age: "age",
      interests: transformWithRename((value: Source) => value.hobbies),
    });

    const mapped = sourceToDestinationMapper.mapOne({
      name: "John",
      age: 30,
      hobbies: ["reading", "gaming"],
    });

    const expected: Destination = {
      name: "John",
      age: 30,
      interests: ["reading", "gaming"],
    };

    const _assert: AssertEqual<typeof mapped, Destination> = true;

    expect(mapped).toEqual(expected);
  });
  it("should throw an error if the direct mapping does not match the destination key", () => {
    type Source = {
      name: string;
      age: number;
    };

    type Destination = {
      fullName: string;
      age: number;
    };

    expect(() =>
      compileMapper<Source, Destination>({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        fullName: "name", // This should be "fullName" to match the destination key
        age: "age",
      }),
    ).toThrow(
      'Direct mapping for destination field "fullName" must be "fullName", but got "name".',
    );
  });
  it("should correctly work with unequal structures", () => {
    type Source = {
      name: string;
      age: number;
    };

    type Destination = {
      fullName: string;
      yearsOld: number;
      isMale?: boolean;
    };

    const sourceToDestinationMapper = compileMapper<Source, Destination>({
      fullName: rename("name"),
      yearsOld: rename("age"),
      isMale: ignore(),
    });

    const expected: Destination = {
      fullName: "John",
      yearsOld: 30,
    };
    const mapped = sourceToDestinationMapper.mapOne({
      name: "John",
      age: 30,
    });

    const _assert: AssertEqual<
      typeof mapped,
      Destination // here we had isMale optional and made it explicitly undefined
    > = true;

    expect(mapped).toEqual(expected);
  });
  it("should handle edge cases for mapOne", () => {
    type Source = {
      id: string;
      name: string;
    };

    type Destination = {
      id: number;
      name: string;
    };

    const mapper = compileMapper<Source, Destination>({
      id: transform((x) => Number.parseInt(x, 10)),
      name: "name",
    });

    const source: Source = { id: "123", name: "Test" };
    const expected: Destination = { id: 123, name: "Test" };

    const mapped = mapper.mapOne(source);

    expect(mapped).toEqual(expected);
  });

  it("should handle edge cases for mapMany", () => {
    type Source = {
      id: string;
      name: string;
    };

    type Destination = {
      id: number;
      name: string;
    };

    const mapper = compileMapper<Source, Destination>({
      id: transform((x) => Number.parseInt(x, 10)),
      name: "name",
    });

    const sources: Source[] = [
      { id: "123", name: "Test1" },
      { id: "456", name: "Test2" },
    ];

    const expected: Destination[] = [
      { id: 123, name: "Test1" },
      { id: 456, name: "Test2" },
    ];

    const mapped = mapper.mapMany(sources);

    expect(mapped).toEqual(expected);
  });

  it("should handle mapRecord", () => {
    type SourceVal = {
      name: string;
      age: number;
    };

    type Source = {
      [key: string]: SourceVal;
    };

    type DestinationVal = {
      fullName: string;
      yearsOld: number;
    };

    type Destination = {
      [key: string]: DestinationVal;
    };

    const source: Source = {
      user1: { name: "John", age: 30 },
      user2: { name: "Jane", age: 25 },
    };

    const sourceToDestinationValMapper = compileMapper<
      SourceVal,
      DestinationVal
    >({
      fullName: rename("name"),
      yearsOld: rename("age"),
    });

    const sourceToDestinationMapped = mapRecord(
      source,
      sourceToDestinationValMapper.mapOne,
    );

    const expected: Destination = {
      user1: { fullName: "John", yearsOld: 30 },
      user2: { fullName: "Jane", yearsOld: 25 },
    };

    const _assert: AssertEqual<
      typeof sourceToDestinationMapped,
      typeof expected
    > = true;

    expect(sourceToDestinationMapped).toEqual(expected);
  });
});

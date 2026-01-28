import {
  AssertEqual,
  compileMapper,
  globalRename,
  ignore,
  map,
  mapRecord,
  rename,
  SimpleMapper,
  flatMap,
  transform,
  transformWithRename,
  nullableMap,
  optionalMap,
  flatMapAfter,
  nullableMapFrom,
  optionalMapFrom,
  mapUnionBy,
  mapAfter,
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
      ) { }

      meow(): void {
        console.log("meow");
      }
    }

    class Destination {
      constructor(
        public fullName: string,
        public age: string,
      ) { }

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
      ) { }
    }

    class DestinationWithFunction {
      constructor(
        public label: string,
        public format: (value: number) => string,
      ) { }
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

  it("should support inline nested mapping definitions", () => {
    type Source = {
      profile: {
        firstName: string;
        email: string;
        metadata: {
          age: number;
        };
      };
    };

    type Destination = {
      profile: {
        name: string;
        contactEmail: string;
        metadata: {
          age: number;
        };
      };
    };

    const mapper = compileMapper<Source, Destination>({
      profile: map({
        name: rename('firstName'),
        contactEmail: rename("email"),
        metadata: 'metadata',
      }),
    });

    const actual = mapper.mapOne({
      profile: {
        firstName: "alice",
        email: "alice@example.com",
        metadata: {
          age: 42,
        },
      },
    });

    expect(actual).toEqual({
      profile: {
        name: "alice",
        contactEmail: "alice@example.com",
        metadata: {
          age: 42,
        },
      },
    });
  });

  it("should allow renaming from nested source paths when types match", () => {
    type Source = {
      profile: {
        contact: {
          email: string;
          phoneNumber: number;
          metadata: {
            birthDate: Date;
          };
        };
      };
      field1: string;
      field2: number;
      field3: boolean;
      field4: {
        field5: string;
        field6: number;
      };
    };

    type Destination = {
      primaryEmail: string;
    };

    const mapper = compileMapper<Source, Destination>({
      primaryEmail: rename('profile.contact.email'),
    });

    const mapped = mapper.mapOne({
      profile: {
        contact: {
          email: "nested@example.com",
          phoneNumber: 0,
          metadata: {
            birthDate: new Date(),
          }
        },
      },
      field1: "",
      field2: 0,
      field3: false,
      field4: {
        field5: "",
        field6: 0
      }
    });

    const _assert: AssertEqual<typeof mapped, Destination> = true;

    expect(mapped).toEqual({ primaryEmail: "nested@example.com" });
  });

  it("should allow global rename from root inside nested inline mappings", () => {
    type Source = {
      id: string;
      nested: {
        field1: string;
        field2: string;
        field3: string;
        field4: string;
        field5: string;
        field6: string;
        field7: string;
        field8: string;
        field9: string;
        field10: string;
        field11: string;
        field12: string;
        field13: string;
        field14: string;
        field15: string;
        field16: string;
        field17: string;
        field18: string;
        field19: string;
        field20: string;
        field21: string;
        field22: string;
        field23: string;
        field24: string;
        field25: string;
        field26: string;
        field27: string;
        child: string;
      };
    };

    type Destination = {
      nested: {
        child: string;
        rootId: string;
        field1: string;
        field2: string;
        field3: string;
        field4: string;
        field5: string;
        field6: string;
        field7: string;
        field8: string;
        field9: string;
        field10: string;
        field11: string;
        field12: string;
        field13: string;
        field14: string;
        field15: string;
        field16: string;
        field17: string;
        field18: string;
        field19: string;
        field20: string;
        field21: string;
        field22: string;
        field23: string;
        field24: string;
        field25: string;
        field26: string;
        field27: string;
        anotherProp: string;
        subNested: {
          rootIdAgain: string;
          subSubNested: {
            rootIdAgainAgain: string;
            subNested: {
              rootId: string;
              subNested: {
                rootId: string;
              }
            };
          };
        },
      };
    };

    const mapper = compileMapper<Source, Destination>({
      nested: map({
        child: "child",
        rootId: globalRename('source.id'),
        anotherProp: transformWithRename(() => "constantValue"),
        subNested: flatMap({
          rootIdAgain: rename('id'),
          subSubNested: flatMap({
            rootIdAgainAgain: rename('id'),
            subNested: flatMap({
              rootId: rename('id'),
              subNested: flatMap({
                rootId: rename('id'),
              })
            })
          }),
        }),
        field1: "field1",
        field2: "field2",
        field3: "field3",
        field4: "field4",
        field5: "field5",
        field6: "field6",
        field7: "field7",
        field8: "field8",
        field9: "field9",
        field10: "field10",
        field11: "field11",
        field12: "field12",
        field13: "field13",
        field14: "field14",
        field15: "field15",
        field16: "field16",
        field17: "field17",
        field18: "field18",
        field19: "field19",
        field20: "field20",
        field21: "field21",
        field22: "field22",
        field23: "field23",
        field24: "field24",
        field25: "field25",
        field26: "field26",
        field27: "field27"
      }),
    });

    const actual = mapper.mapOne({
      id: "root",
      nested: {
        child: "value",
        field1: "",
        field2: "",
        field3: "",
        field4: "",
        field5: "",
        field6: "",
        field7: "",
        field8: "",
        field9: "",
        field10: "",
        field11: "",
        field12: "",
        field13: "",
        field14: "",
        field15: "",
        field16: "",
        field17: "",
        field18: "",
        field19: "",
        field20: "",
        field21: "",
        field22: "",
        field23: "",
        field24: "",
        field25: "",
        field26: "",
        field27: ""
      },
    });

    expect(actual).toEqual({
      nested: {
        child: "value",
        rootId: "root",
        anotherProp: "constantValue",
        subNested: {
          rootIdAgain: "root",
          subSubNested: {
            rootIdAgainAgain: "root",
            subNested: {
              rootId: "root",
              subNested: {
                rootId: "root"
              }
            }
          }
        },
        field1: "",
        field2: "",
        field3: "",
        field4: "",
        field5: "",
        field6: "",
        field7: "",
        field8: "",
        field9: "",
        field10: "",
        field11: "",
        field12: "",
        field13: "",
        field14: "",
        field15: "",
        field16: "",
        field17: "",
        field18: "",
        field19: "",
        field20: "",
        field21: "",
        field22: "",
        field23: "",
        field24: "",
        field25: "",
        field26: "",
        field27: ""
      },
    } satisfies Destination);
  });

  it("should allow inline map helper without renaming directives", () => {
    type Source = {
      field: string;
      config: {
        id: string;
        title: string;
      };
    };

    type Destination = {
      field: string;
      config: {
        id: number;
        title: string;
      };
    };

    const mapper = compileMapper<Source, Destination>({
      config: map({
        id: transform(x => Number.parseInt(x, 10)),
        title: "title"
      }),
      field: 'field',
    });

    const actual = mapper.mapOne({
      field: "42",
      config: {
        id: "42",
        title: "Answer",
      },
    });

    expect(actual).toEqual({
      field: "42",
      config: {
        id: 42,
        title: "Answer",
      },
    });
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
      name: 'name',
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
  it("should work with optional fields", () => {
    type Source = {
      optionalField?: string;
    }

    type Destination = {
      optionalField: string | null;
    }

    const mapper = compileMapper<
      Source,
      Destination
    >({
      optionalField: transform((x) => x ?? null)
    });

    const mapped1 = mapper.mapOne({ optionalField: "value" });

    expect(mapped1).toEqual({ optionalField: "value" });
  })
  it("should work with deep nested types", () => {

    type Source = {
      id: string;
      name: string;
      address: {
        street: string;
        city: string;
        subAddress: {
          street: string;
          city: string;
          subAddress: {
            street: string;
            city: string;
          }
        }
      };
    };

    type Destination = {
      id: number;
      name: string;
      address: {
        street: string;
        city: string;
        subAddress: {
          street: string;
          city: string;
          subAddress: {
            street: string;
            city: string;
          }
        }

      };
    };

    const mapper = compileMapper<Source, Destination>({
      id: transform((x) => Number.parseInt(x, 10)),
      name: "name",
      address: 'address',
    });

    const source: Source = {
      id: "123",
      name: "Test",
      address: {
        street: "123 Main St",
        city: "Anytown",
        subAddress: {
          street: "",
          city: "",
          subAddress: {
            street: "",
            city: ""
          }
        }
      },
    };

    const expected: Destination = {
      id: 123,
      name: "Test",
      address: {
        street: "123 Main St",
        city: "Anytown",
        subAddress: {
          street: "",
          city: "",
          subAddress: {
            street: "",
            city: ""
          }
        }
      },
    };

    const mapped = mapper.mapOne(source);

    expect(mapped).toEqual(expected);
  });

  it("should work with deep nested arrays", () => {
    type Source = {
      id: string;
      items: Array<{
        id: string;
        subItems: Array<{
          id: string;
          anotherProp: string;
        }>;
      }>;
    };

    type Destination = {
      id: number;
      items: Array<{
        id: number;
        subItems: Array<{
          id: number;
          anotherProp: string;
        }>;
      }>;
    };

    const mapper = compileMapper<Source, Destination>({
      id: transform((x) => Number.parseInt(x, 10)),
      items: map({
        id: transform((x) => Number.parseInt(x, 10)),
        subItems: map({
          id: transform((x) => Number.parseInt(x, 10)),
          anotherProp: "anotherProp"
        })
      }),
    });

    const source: Source = {
      id: "123",
      items: [
        {
          id: "1",
          subItems: [
            {
              id: "1",
              anotherProp: ""
            },
            {
              id: "2",
              anotherProp: ""
            },
          ],
        },
        {
          id: "2",
          subItems: [
            {
              id: "3",
              anotherProp: ""
            },
            {
              id: "4",
              anotherProp: ""
            },
          ],
        },
      ],
    };

    const expected: Destination = {
      id: 123,
      items: [
        {
          id: 1,
          subItems: [
            {
              id: 1,
              anotherProp: ""
            },
            {
              id: 2,
              anotherProp: ""
            },
          ],
        },
        {
          id: 2,
          subItems: [
            {
              id: 3,
              anotherProp: ""
            },
            {
              id: 4,
              anotherProp: ""
            },
          ],
        },
      ],
    };

    const mapped = mapper.mapOne(source);

    expect(mapped).toEqual(expected);
  });
  it("should omit ignored keys inside nested object literals (inline object mapping)", () => {
    type Source = { a: { x: string; y: string } };
    type Destination = { a: { x: string } };

    const mapper = compileMapper<Source, Destination>({
      a: {
        x: "x",
        // should be filtered out by buildObjectLiteral ignore handling
        y: ignore(),
      } as any,
    });

    expect(mapper.mapOne({ a: { x: "X", y: "Y" } })).toEqual({ a: { x: "X" } });
  });

  it("should return null for nested object literal when parent source path is null", () => {
    type Source = { a: { b: { c: string } } | null };
    type Destination = { a: { b: { c: string } } | null };

    const mapper = compileMapper<Source, Destination>({
      a: {
        b: {
          c: "c",
        },
      } as any,
    });

    expect(mapper.mapOne({ a: null })).toEqual({ a: null });
  });

  it("map() directive should return null when parent object is null (parentAccessor check)", () => {
    type Source = { nested: { value: string } | null };
    type Destination = { nested: { value: string } | null };

    const mapper = compileMapper<Source, Destination>({
      nested: 'nested'
    });

    expect(mapper.mapOne({ nested: null })).toEqual({ nested: null });
  });

  it("nullableMap() should map when value is present and return null when value is null", () => {
    type Child = { x: string };
    type Source = { child: Child | null };
    type Destination = { child: { y: string } | null };

    const mapper = compileMapper<Source, Destination>({
      child: nullableMap({
        y: rename("x"),
      }),
    });

    expect(mapper.mapOne({ child: { x: "ok" } })).toEqual({ child: { y: "ok" } });
    expect(mapper.mapOne({ child: null })).toEqual({ child: null });
  });

  it("optionalMap() should return undefined when value is undefined (and not invoke nested mapper)", () => {
    let invoked = 0;

    type Child = { x: string };
    type Source = { child?: Child };
    type Destination = { child?: { y: string } };

    const childMapper = compileMapper<Child, { y: string }>({
      y: transform((v) => {
        invoked++;
        return v.toUpperCase();
      }) as any,
    });

    const mapper = compileMapper<Source, Destination>({
      child: optionalMap<Child, { y: string }, Source>({
        y: transform((c: any) => childMapper.mapOne({ x: c.x }).y) as any,
      }) as any,
    });

    expect(mapper.mapOne({})).toEqual({ child: undefined });
    expect(invoked).toBe(0);
  });

  it("flatMapAfter() should run a root transform and then map using flat mapping", () => {
    type Source = { id: string; user: { name: string } };
    type Destination = { summary: { id: string; name: string } };

    const mapper = compileMapper<Source, Destination>({
      summary: flatMapAfter((root: Source) => ({
        id: root.id,
        name: root.user.name,
      }))({
        id: "id",
        name: "name",
      }),
    });

    expect(mapper.mapOne({ id: "A1", user: { name: "Alice" } })).toEqual({
      summary: { id: "A1", name: "Alice" },
    });
  });

  it("nullableMapFrom() should return null if any segment in the path is nullish; otherwise map from that object", () => {
    type Root = { deep?: { inner?: { v: string } | null } | null };
    type Destination = { out: { vv: string } | null };

    const mapper = compileMapper<Root, Destination>({
      out: nullableMapFrom("deep.inner", {
        vv: rename("v"),
      } as any),
    });

    expect(mapper.mapOne({ deep: null })).toEqual({ out: null });
    expect(mapper.mapOne({ deep: { inner: null } })).toEqual({ out: null });
    expect(mapper.mapOne({ deep: { inner: { v: "x" } } })).toEqual({ out: { vv: "x" } });
  });

  it("optionalMapFrom() should return undefined if any segment is undefined; otherwise map from that object", () => {
    type Root = { deep?: { inner?: { v: string } } };
    type Destination = { out?: { vv: string } };

    const mapper = compileMapper<Root, Destination>({
      out: optionalMapFrom("deep.inner", {
        vv: rename("v"),
      } as any),
    });

    expect(mapper.mapOne({})).toEqual({ out: undefined });
    expect(mapper.mapOne({ deep: {} })).toEqual({ out: undefined });
    expect(mapper.mapOne({ deep: { inner: { v: "ok" } } })).toEqual({ out: { vv: "ok" } });
  });

  it("transformWithRename() inside nested mapping should receive the *current object* at sourcePath (renamed=true branch)", () => {
    type Source = { nested: { a: number; b: number } };
    type Destination = { nested: { sum: number } };

    const mapper = compileMapper<Source, Destination>({
      nested: map({
        sum: transformWithRename((obj: { a: number; b: number }) => obj.a + obj.b) as any,
      }),
    });

    expect(mapper.mapOne({ nested: { a: 2, b: 3 } })).toEqual({ nested: { sum: 5 } });
  });

  it("globalRename() should read from root (and tolerate a missing 'source.' prefix at runtime)", () => {
    type Source = { id: string; nested: { x: string } };
    type Destination = { nested: { rootId: string } };

    const mapper = compileMapper<Source, Destination>({
      nested: map({
        // normal typed usage
        rootId: globalRename("source.id"),
      }),
    });

    expect(mapper.mapOne({ id: "RID", nested: { x: "x" } })).toEqual({
      nested: { rootId: "RID" },
    });

    // runtime-only branch: if someone bypasses types and provides no "source." prefix
    const mapper2 = compileMapper<Source, Destination>({
      nested: map({
        rootId: globalRename("id" as any),
      }),
    });

    expect(mapper2.mapOne({ id: "RID2", nested: { x: "x" } })).toEqual({
      nested: { rootId: "RID2" },
    });
  });

  it("should throw for invalid mapping instruction types (non-string/non-object)", () => {
    type Source = { a: string };
    type Destination = { a: string };

    expect(() =>
      compileMapper<Source, Destination>({
        a: 123,
      } as any),
    ).toThrow('Invalid mapping instruction for destination field "a".');
  });

  it("should throw for invalid directive kind", () => {
    type Source = { a: string };
    type Destination = { a: string };

    expect(() =>
      compileMapper<Source, Destination>({
        a: { __kind: "notARealDirective" } as any,
      }),
    ).toThrow("Invalid directive kind");
  });

  it("rename(): should throw when used as a direct mapping at root with mismatching destKey (direct mapping guard)", () => {
    type Source = { name: string };
    type Destination = { fullName: string };

    // This is the guard in buildValueExpression for plain string instructions.
    expect(() =>
      compileMapper<Source, Destination>({
        fullName: "name",
      } as any),
    ).toThrow(
      'Direct mapping for destination field "fullName" must be "fullName", but got "name".',
    );
  });
  it('globalRename("source") should access root itself (covers rootAccessor empty path)', () => {
    type Source = { id: string };
    type Destination = { whole: Source };

    const mapper = compileMapper<Source, Destination>({
      // @ts-expect-error Generally just a "source" path not accepted but let's try root access
      whole: globalRename("source") as any,
    });

    expect(mapper.mapOne({ id: "X" })).toEqual({ whole: { id: "X" } });
  });
  it("nested object literal should become {} when all nested keys are ignored (covers empty entries)", () => {
    type Source = { child: { a: string } };
    type Destination = { child: {} };

    const mapper = compileMapper<Source, Destination>({
      child: {
        a: ignore(),
      } as any,
    });

    expect(mapper.mapOne({ child: { a: "x" } })).toEqual({ child: {} });
  });
  it("optionalMap() should use mapMany for arrays (covers Array.isArray in optionalMap)", () => {
    type Source = { items?: { v: string }[] };
    type Destination = { items?: { vv: string }[] };

    const mapper = compileMapper<Source, Destination>({
      items: optionalMap({ vv: rename("v") }),
    });

    expect(mapper.mapOne({ items: [{ v: "x" }, { v: "y" }] })).toEqual({
      items: [{ vv: "x" }, { vv: "y" }],
    });
  });
  it("nullableMap() should use mapMany for arrays (covers Array.isArray in nullableMap)", () => {
    type Child = { x: string };
    type Source = { items: Child[] | null };
    type Destination = { items: { y: string }[] | null };

    const mapper = compileMapper<Source, Destination>({
      items: nullableMap({
        y: rename("x"),
      }),
    });

    expect(
      mapper.mapOne({ items: [{ x: "a" }, { x: "b" }] }),
    ).toEqual({
      items: [{ y: "a" }, { y: "b" }],
    });

    expect(mapper.mapOne({ items: null })).toEqual({ items: null });
  });

  it("nullableMap() should return null when value is undefined (v == null branch includes undefined)", () => {
    type Child = { x: string };
    type Source = { child?: Child }; // possibly undefined
    type Destination = { child: { y: string } | null };

    const mapper = compileMapper<Source, Destination>({
      child: nullableMap({
        y: rename("x"),
      }),
    });

    // v is undefined -> v == null is true -> null
    expect(mapper.mapOne({})).toEqual({ child: null });
  });

  it("optionalMap() should attempt mapping when value is null (only undefined is treated as absent)", () => {
    type Child = { x: string };
    type Source = { child?: Child | null };
    type Destination = { child?: { y: string } };

    const mapper = compileMapper<Source, Destination>({
      child: optionalMap({
        y: rename("x"),
      }),
    });

    // optionalMap checks `v === undefined`, so null flows through and mapping is attempted.
    // That will blow up because rename("x") tries to access property on null.
    expect(() => mapper.mapOne({ child: null })).toThrow();
  });
  it("should work with union types", () => {
    enum PetType {
      Wolf = "wolf",
      Dog = "dog"
    }

    type WolfMapped = {
      kind: PetType.Wolf;
      volume: number;
      prop: string;
    }

    type DogMapped = {
      kind: PetType.Dog;
      volume: number;
      prop: string;
    }

    type Source = {
      pet: WolfMapped | DogMapped;
    }

    type DawgUnmapped = {
      kind: 'dawg';
      volume: number;
      someProp: string;
    }

    type WolfieUnmapped = {
      kind: 'wolfie';
      volume: number;
      anotherProp: string;
    }

    type Destination = {
      pet: DawgUnmapped | WolfieUnmapped;
    }

    const mapper = compileMapper<Source, Destination>({
      pet: mapUnionBy('kind', {
        kinds: {
          wolfie: PetType.Wolf,
          dawg: PetType.Dog
        },
        cases: {
          wolfie: map({
            volume: 'volume',
            anotherProp: rename('prop')
          }),
          dawg: map({
            volume: 'volume',
            someProp: rename('prop')
          })
        }
      })
    })

    const mapped = mapper.mapMany([{
      pet: {
        kind: PetType.Wolf,
        volume: 0,
        prop: ""
      }
    }, {
      pet: {
        kind: PetType.Dog,
        volume: 100,
        prop: ""
      }
    }, {
      pet: {
        kind: PetType.Wolf,
        volume: 35,
        prop: ""
      }
    }]);

    const destination: Destination[] = [{
      pet: {
        kind: 'wolfie',
        volume: 0,
        anotherProp: ""
      }
    }, {
      pet: {
        kind: 'dawg',
        volume: 100,
        someProp: ""
      }
    }, {
      pet: {
        kind: 'wolfie',
        volume: 35,
        anotherProp: ""
      }
    }];
    expect(mapped).toEqual(destination);
  });
  it("throws when no destination kind matches the source discriminant", () => {
    enum PetType {
      Wolf = "wolf",
      Dog = "dog"
    }

    type WolfMapped = {
      kind: PetType.Wolf;
      volume: number;
      prop: string;
    }

    type DogMapped = {
      kind: PetType.Dog;
      volume: number;
      prop: string;
    }

    type Source = {
      pet: WolfMapped | DogMapped;
    }

    type DawgUnmapped = {
      kind: 'dawg';
      volume: number;
      someProp: string;
    }

    type WolfieUnmapped = {
      kind: 'wolfie';
      volume: number;
      anotherProp: string;
    }

    type Destination = {
      pet: DawgUnmapped | WolfieUnmapped;
    }

    const mapper = compileMapper<Source, Destination>({
      pet: mapUnionBy("kind", {
        kinds: { wolfie: PetType.Wolf, dawg: PetType.Dog },
        cases: {
          wolfie: map({ volume: "volume", anotherProp: rename("prop") }),
          dawg: map({ volume: "volume", someProp: rename("prop") }),
        },
      }),
    });

    expect(() =>
      mapper.mapOne({
        pet: {
          kind: "cat" as any,
          volume: 1,
          prop: "",
        } as any,
      } as any)
    ).toThrow(/no destination kind/);
  });
  it("throws when destination kind exists but case is missing", () => {
    enum PetType {
      Wolf = "wolf",
      Dog = "dog"
    }

    type WolfMapped = {
      kind: PetType.Wolf;
      volume: number;
      prop: string;
    }

    type DogMapped = {
      kind: PetType.Dog;
      volume: number;
      prop: string;
    }

    type Source = {
      pet: WolfMapped | DogMapped;
    }

    type DawgUnmapped = {
      kind: 'dawg';
      volume: number;
      someProp: string;
    }

    type WolfieUnmapped = {
      kind: 'wolfie';
      volume: number;
      anotherProp: string;
    }

    type Destination = {
      pet: DawgUnmapped | WolfieUnmapped;
    }

    const mapper = compileMapper<Source, Destination>({
      pet: mapUnionBy("kind", {
        kinds: { wolfie: PetType.Wolf, dawg: PetType.Dog },
        //@ts-expect-error for a test
        cases: {
          dawg: map({ volume: "volume", someProp: rename("prop") }),
        },
      }),
    });

    expect(() =>
      mapper.mapOne({
        pet: {
          kind: PetType.Wolf,
          volume: 1,
          prop: "",
        },
      } as any)
    ).toThrow(/no case for destination kind/);
  });
  it("should return null when union value is null", () => {
    enum PetType {
      Wolf = "wolf",
      Dog = "dog",
    }

    type WolfMapped = {
      kind: PetType.Wolf;
      volume: number;
      prop: string;
    };

    type DogMapped = {
      kind: PetType.Dog;
      volume: number;
      prop: string;
    };

    type Source = {
      pet: (WolfMapped | DogMapped) | null;
    };

    type DawgUnmapped = {
      kind: "dawg";
      volume: number;
      someProp: string;
    };

    type WolfieUnmapped = {
      kind: "wolfie";
      volume: number;
      anotherProp: string;
    };

    type Destination = {
      pet: (DawgUnmapped | WolfieUnmapped) | null;
    };

    const mapper = compileMapper<Source, Destination>({
      pet: mapUnionBy("kind", {
        kinds: {
          wolfie: PetType.Wolf,
          dawg: PetType.Dog,
        },
        cases: {
          wolfie: map({
            volume: "volume",
            anotherProp: rename("prop"),
          }),
          dawg: map({
            volume: "volume",
            someProp: rename("prop"),
          }),
        },
      }),
    });

    const result = mapper.mapOne({
      pet: null,
    });

    expect(result).toEqual({
      pet: null,
    });
  });

  it("flatMap should work with arrays", () => {
    type Source = {
      id: string;
      items: Collection<{
        id: string;
        anotherProp: string;
      }>;
    };

    class Collection<T> {
      constructor(private readonly items: T[]) { }

      getItems(): T[] {
        return this.items;
      }
    }

    type Destination = {
      id: string;
      items: Array<{
        id: string;
        anotherProp: string;
      }>;
    };

    const mapper = compileMapper<Source, Destination>({
      id: "id",
      items: mapAfter((items) => items.getItems(), {
        id: "id",
        anotherProp: "anotherProp",
      }),
    });
  })
});

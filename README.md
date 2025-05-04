# Mapia

![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/language-TypeScript-blue)
[![Test & Coverage](https://github.com/alexcupertme/mapia/actions/workflows/test.yml/badge.svg)](https://github.com/alexcupertme/mapia/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/alexcupertme/mapia/branch/master/graph/badge.svg?token=GX1J5S2AKZ)](https://codecov.io/gh/alexcupertme/mapia)



Mapia is a lightweight and type-safe object mapping library for TypeScript. It simplifies the process of transforming objects from one shape to another, ensuring type safety and flexibility.

[https://github.com/user-attachments/assets/048eccc7-a534-4c16-bf04-a8495d5da795](https://github.com/user-attachments/assets/048eccc7-a534-4c16-bf04-a8495d5da795)

> [!NOTE]
> - Zero dependencies
> - No boilerplate code except mapping itself
> - JSON serialization/transformation is **35x faster** than `class-transformer`

# Table of Contents
- [Mapia](#mapia)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Basic Example](#basic-example)
    - [Nested Structures](#nested-structures)
  - [Why Mapia?](#why-mapia)
  - [Why Mapia is Better than AutoMapper-TS](#why-mapia-is-better-than-automapper-ts)
    - [The Problem with AutoMapper-TS](#the-problem-with-automapper-ts)
    - [Example of Issues with AutoMapper-TS](#example-of-issues-with-automapper-ts)
    - [How Mapia Solves These Issues](#how-mapia-solves-these-issues)
  - [Contributing](#contributing)
  - [Benchmark](#benchmark)
  - [License](#license)

## Introduction

When you work with DTOs, entities, gRPC request, responses, or any other data structures, you always have this situation:

```ts
// Some Input type "A"
type InputDto = {
  field1: string;

  otherField: string;
  anotherField: string;
  yetAnotherField: string;
}
// Type "B", Almost the same as "A"
type Entity = {
  field1: number; // this field fucks up the whole mapping

  otherField: string;
  anotherField: string;
  yetAnotherField: string;
}

const persistToDB = (input: Partial<Entity>) => {
  // Some logic to persist to DB
}
const input: InputDto = {...} // How do we map input to Entity?
persistToDB(input); // Type 'InputDto' is not assignable to type 'Entity'
```

This is just a simple example, but in reality, you can have dozens of the models, that are almost the same, but they dont.

Here how you can solve this problem with Mapia.

```ts
import { compileMapper, rename, transform, ignore } from 'mapia';

type InputDto = {
  field1: string;
  otherField: string;
  anotherField: string;
  yetAnotherField: string;
}

type Entity = {
  field1: number;
  otherField: string;
  anotherField: string;
  yetAnotherField: string;
}

// Here we are just described Input and Output in our mapper as type arguments
const inputToEntityMapper = compileMapper<InputDto, Entity>({
  field1: transform((x) => Number(x)),
  otherField: "otherField", // All these string fields has been hinted by IDE and autofilled. This is a real automapping magic 🔮 
  anotherField: "anotherField", // If your Input or Output shapes changes, you'll immediately get a type check error
  yetAnotherField: "yetAnotherField",
});

const persistToDB = (input: Partial<Entity>) => {
  // Some logic to persist to DB
}
const input: InputDto = {...} 
persistToDB(inputToEntityMapper.mapOne(input)); // We are chill here 🍹
```

You also want to map array of objects, or objects with nested structures? No problem, Mapia can do that too.
```ts
import { compileMapper, rename, transform, ignore, transformWithRename } from 'mapia';

export enum BankAccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum Currency {
  USD = "USD",
  EUR = "EUR",
}

export class BankStatsResponse {
  totalBalance!: number;
  totalTransactions!: number;
  totalDeposits!: number;
  totalWithdrawals!: number;
}

// poor bank api developers
export type BankSettingsResponse = {
  twoFactorAuthEnabled: 'yes' | 'no';
  notificationsEnabled: 'yes' | 'no';
  safeModeEnabled: 'yes' | 'no';
  currency: Currency;
};

// giga-chad bank api developers
export class BankSettingsEntity {
  hasTwoFactorAuth!: boolean;
  enabledNotifications!: boolean;
  safeMode!: boolean;
  currency!: Currency;
}

export class BankAccountResponse {
  id!: string;
  name!: string;
  currency!: Currency;
  status!: BankAccountStatus;
  statistics!: BankStatsResponse;
  settings!: BankSettingsResponse;
}

export class BankAccountStatisticsEntity {
  totalBalance!: number;
  totalTransactions!: number;
  totalDeposits!: number;
  totalWithdrawals!: number;
}

export class BankAccountEntity {
  accountId!: string;
  name!: string;
  currency!: Currency;
  status!: BankAccountStatus;
  statistics!: BankAccountStatisticsEntity;
  settings!: BankSettingsEntity;
}

export const bankSettingsMapper = compileMapper<BankSettingsResponse, BankSettingsEntity>({
  hasTwoFactorAuth: transformWithRename((x) => x.twoFactorAuthEnabled === 'yes'),
  enabledNotifications: transformWithRename((x) => x.notificationsEnabled === 'yes'),
  safeMode: transformWithRename((x) => x.safeModeEnabled === 'yes'),
  currency: 'currency',
});

export const bankAccountMapper = mapia.compileMapper<BankAccountResponse, BankAccountEntity>({
  accountId: rename('id'),
  name: 'name',
  currency: 'currency',
  status: 'status',
  settings: transformWithRename((x) => bankSettingsMapper.mapOne(x.settings)), // You can compose mappers in a functional way
  statistics: 'statistics' // If you're exactly matching your resulting type, you just dont have to write mapper, even though statisics is a nested object
});

const bankAccountResponse: BankAccountResponse[] = [{...}] // A lot of bank accounts

const mapped: BankAccountEntity[] = bankAccountMapper.mapMany(bankAccountResponse); // Its just this simple
```

Mapia offers the following features:

- **Declarative Syntax**: Every mapping is defined in a simple and readable way, making it easy to understand and maintain.
- **Type Inference**: TypeScript infers the types of your mappings, reducing the need for manual type annotations.
- **Functional Composition**: You can compose mappers and use them in a functional way, making it easy to reuse mappings across different parts of your application.
- **Flexible Directives**: Supports renaming, transforming, and ignoring fields without headache and misspelling. More directives are coming soon.

## Installation

**NPM**
```bash
npm install mapia
```

**PNPM**
```bash
pnpm add mapia
```

**YARN**
```bash
yarn add mapia
```

## Usage

There are 4 ways what we can do with a field
1. **Rename**: Rename a field from the source object to the destination object. You **cannot** pass a function here, only a string. You also cannot pass own property name, and property name that don't match by type. This is a verbose way to know what you are doing.
```ts
const userMapper = compileMapper<UserResponse, UserEntity>({
  id: rename('userId'), // This will rename the field 'id' to 'userId'
  id: rename('id'), // Will throw error
  id: rename('currency') // Accidentally specified property with wrong type, you'll get a type error
});
```
2. **Transform**: Transform a field from the source object to the destination object. 
```ts
const userMapper = compileMapper<UserResponse, UserEntity>({
  id: transform((x) => Number(x)), // This will transform the field 'id' from string to number
  createdAt: transform((x) => new Date(x)), // This will transform the field 'createdAt' from string to Date
});
```
3. **Ignore**: Ignore a field from the source object to the destination object. This is useful when you want to skip a field that is optional in the Output object.
```ts
const userMapper = compileMapper<UserResponse, UserEntity>({
  id: 'id',
  age: 'age',
  name: rename('name'),
  createdAt: transform((x) => new Date(x)),
  updatedAt: ignore(), // This field will be ignored
});
```

4. **Transform with Rename**: You can change the whole shape of the property, its type and name. This is a very verbose way to say "yes, this property doesnt match at all, i am doing that risky operation"
```ts
const userMapper = compileMapper<UserResponse, UserEntity>({
  id: transform((x) => Number(x)),
  age: 'age',
  name: rename('name'),
  createdAt: transform((x) => new Date(x)),
  updatedAt: ignore(), // This field will be ignored
  address: transformWithRename((x) => addressMapper.mapOne(x.tags.find(x => ...))), // Some complex logic
});
```

### Basic Example

```ts
import { compileMapper, rename, transform, ignore } from 'mapia';

type UserResponse = {
  id: string;
  age: number;
  name: string;
  createdAt: string;
};

type UserEntity = {
  id: number;
  age: number;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
};

const userMapper = compileMapper<UserResponse, UserEntity>({
  id: transform((x) => Number(x)),
  age: 'age',
  name: rename('name'),
  createdAt: transform((x) => new Date(x)),
  updatedAt: ignore(), // This field will be ignored
});

const userResponse: UserResponse = {
  id: "1",
  age: 25,
  name: "John Doe",
  createdAt: "2023-01-01",
};

const userEntity = userMapper.mapOne(userResponse);
console.log(userEntity);
```

### Nested Structures

```ts
type Address = {
  city: string;
  country: string;
};

type UserResponse = {
  name: string;
  address: Address;
};

type UserEntity = {
  fullName: string;
  location: Address;
};

const addressMapping: SimpleMapper<Address, Address> = {
  city: "city",
  country: "country",
};

const userMapping: SimpleMapper<UserResponse, UserEntity> = {
  fullName: rename("name"),
  location: transformWithRename((user) => mapOne(user.address, addressMapping)),
};

const userResponse: UserResponse = {
  name: "John Doe",
  address: {
    city: "New York",
    country: "USA",
  },
};

const userEntity = mapOne(userResponse, userMapping);
console.log(userEntity);
```

## Why Mapia?

## Why Mapia is Better than AutoMapper-TS

AutoMapper-TS is a popular library for object mapping, but it has some significant drawbacks that can lead to runtime issues if not used carefully. Here's why Mapia is a better alternative:

### The Problem with AutoMapper-TS

1. **Lack of Type Safety**: AutoMapper-TS relies heavily on runtime configurations and decorators. If you forget to add a decorator or misconfigure a mapping, the error will only surface at runtime, potentially causing critical bugs.

2. **Silent Failures**: Missing decorators or incorrect configurations often result in silent failures, where fields are simply not mapped without any warnings or errors.

3. **Boilerplate Code**: AutoMapper-TS requires a lot of boilerplate code to set up mappings, especially for nested objects or complex transformations.

### Example of Issues with AutoMapper-TS


export const mapper: Mapper = createMapper({
  strategyInitializer: classes(),
});

createMap(mapper, BankStatsResponse, BankAccountStatisticsEntity);

createMap(
  mapper,
  BankAccountResponse,
  BankAccountEntity,
  forMember(
    (dest) => dest.accountId,
    mapFrom((src) => src.id),
  ),
);

```ts
import { AutoMapper, ProfileBase } from 'automapper-ts';

class UserResponse {
  @AutoMap()
  id: string;
  @AutoMap()
  name: string;
  @AutoMap()
  age: number;
}

class UserEntity {
  @AutoMap()
  id: number;
  @AutoMap()
  fullName: string;
  age: number; // Oops we forgot to add decorator here
}

export const mapper: Mapper = createMapper({
  strategyInitializer: classes(),
});

createMap(mapper, UserResponse, UserEntity);
createMap(
  mapper,
  UserResponse,
  UserEntity,
);


const userResponse = new UserResponse();
userResponse.id = '1';
userResponse.name = 'John Doe';
userResponse.age = 25;

const userEntity = mapper.map(userResponse, UserEntity);
console.log(userEntity);
// Output: { id: 1, fullName: 'John Doe', age: undefined }
// The 'age' field is silently ignored because it was not mapped.
```

### How Mapia Solves These Issues

Mapia eliminates these problems by providing a declarative and type-safe approach to object mapping. Here's the same example implemented with Mapia:

```ts
import { mapOne, rename, transform, SimpleMapper } from 'mapia';

type UserResponse = {
  id: string;
  name: string;
  age: number;
};

type UserEntity = {
  id: number;
  fullName: string;
  age: number;
};

const userMapping: SimpleMapper<UserResponse, UserEntity> = {
  id: transform((x) => Number(x)),
  fullName: rename('name'),
  age: 'age',
};

const userResponse: UserResponse = {
  id: '1',
  name: 'John Doe',
  age: 25,
};

const userEntity = mapOne(userResponse, userMapping);
console.log(userEntity);
// Output: { id: 1, fullName: 'John Doe', age: 25 }
// All fields are mapped correctly, and type safety ensures no fields are missed.
```

With Mapia, you can be confident that your mappings are correct and type-safe, reducing the risk of runtime errors and silent failures.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Benchmark

![image](./benchmark/benchmark.png)

See more details in the [benchmark](./benchmark) folder.

Run it yourself (first clone repo):

```bash
pnpm run:bench
```

## License

Mapia is licensed under the [MIT License](./LICENSE).

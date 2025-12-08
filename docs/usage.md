---
title: Usage
---

# Usage

Mapia provides four core field directives so you can describe how each output field should be populated.

## 1. Rename

Use `rename` to pull a value from another property. This is the verbose option that keeps your intent explicit and uses TypeScript to ensure the source property exists.

```ts
const userMapper = compileMapper<UserResponse, UserEntity>({
  id: rename('userId'),
});
```

Type errors will surface if you ask for the wrong field or type.

## 2. Transform

`transform` accepts a function that adjusts the value before it hits the destination object.

```ts
const userMapper = compileMapper<UserResponse, UserEntity>({
  createdAt: transform((x) => new Date(x)),
});
```

## 3. Ignore

Use `ignore` for fields that don't exist on the source but are optional in the destination.

```ts
const userMapper = compileMapper<UserResponse, UserEntity>({
  id: 'id',
  updatedAt: ignore(),
});
```

## 4. Transform with Rename

When the field name and type differ, but you still need to read another property, choose `transformWithRename`.

```ts
const userMapper = compileMapper<UserResponse, UserEntity>({
  address: transformWithRename((x) => addressMapper.mapOne(x.location)),
});
```

## Basic Example

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
  updatedAt: ignore(),
});

const userResponse: UserResponse = {
  id: '1',
  age: 25,
  name: 'John Doe',
  createdAt: '2023-01-01',
};

const userEntity = userMapper.mapOne(userResponse);
console.log(userEntity);
```

## Nested Structures

Mapia can handle nested objects and arrays without extra ceremony.

```ts
type CurrentLocation = {
  lat: number;
  lon: number;
  city: string;
  country: string;
};

type Address = {
  city: string;
  country: string;
};

type UserResponse = {
  name: string;
  location: CurrentLocation;
};

type UserEntity = {
  fullName: string;
  address: Address;
};

const addressMapper = compileMapper<CurrentLocation, Address>({
  city: 'city',
  country: 'country',
});

const userMapper = compileMapper<UserResponse, UserEntity>({
  fullName: rename('name'),
  address: transformWithRename((user) => addressMapper.mapOne(user.location)),
});
```

More real-world examples live in the [examples](https://github.com/alexcupertme/mapia/tree/master/examples) directory.

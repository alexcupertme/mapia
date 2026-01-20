---
title: Comparison
---

# Why Mapia is better than AutoMapper-TS

AutoMapper-TS is popular but relies heavily on decorators and runtime configuration, which brings a few problems:

## The problem with AutoMapper-TS

1. **Lack of type safety** – decorators are optional, and errors usually appear at runtime once the mapping is executed.
2. **Silent failures** – forgetting a decorator or misconfiguring a map often results in fields being omitted without any warning.
3. **Boilerplate** – deeply nested objects or custom logic require verbose configuration.

## Example of issues with AutoMapper-TS

```ts
export const mapper: Mapper = createMapper({
  strategyInitializer: classes(),
});

createMap(mapper, BankAccountResponse, BankAccountEntity, forMember(
  (dest) => dest.accountId,
  mapFrom((src) => src.id),
));
```

```ts
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
  age: number; // decorator accidentally missing
}
```

A missing decorator silently drops the mapping:

```ts
const userEntity = mapper.map(userResponse, UserEntity);
console.log(userEntity);
// Output: { id: 1, fullName: 'John Doe', age: undefined }
```

## How Mapia solves these issues

Mapia keeps everything declarative and type-safe:

- Mappers are just objects, so TypeScript can infer every property.
- Your IDE highlights typos or mis-typed fields while you edit.
- Nothing happens at runtime unless you intentionally call `mapOne` or `mapMany`.
- Nesting is natural because you can compose mappers just like any other function.

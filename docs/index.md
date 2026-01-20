<div align="center">
  <img src="/mapia.svg" width="200px" alt="Mapia logo svg" />

  <h1 style="padding-top: 10px;">Mapia</h1>

  <p>
    Object transformation library for TypeScript
  </p>
</div>

<div align="center" style="display:flex; justify-content:center; flex-wrap:wrap; gap:8px;">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  </a>
  <a href="https://github.com/alexcupertme/mapia/actions/workflows/test.yml">
    <img src="https://github.com/alexcupertme/mapia/actions/workflows/test.yml/badge.svg" alt="Test & Coverage" />
  </a>
  <a href="https://codecov.io/gh/alexcupertme/mapia">
    <img src="https://codecov.io/gh/alexcupertme/mapia/branch/master/graph/badge.svg?token=GX1J5S2AKZ" alt="codecov" />
  </a>
  <a href="https://github.com/alexcupertme/mapia" rel="nofollow">
    <img src="https://img.shields.io/github/stars/alexcupertme/mapia" alt="stars" />
  </a>
</div>

## Watch the demo

<div style="margin: 0 auto; max-width: 800px;">
  <iframe
    width="800"
    height="450"
    src="https://www.youtube.com/embed/C8GeUHRRTRw"
    title="Mapia demo"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## What is Mapia?

Mapia provides set of utilities to transform objects in a type-safe way.

In general, our app data flows between different layers, and each layer has its own data shape.

API, database, and frontend models are often different.

Here is the example:

::: code-group

```ts [database.ts]
/**
 * A trivial strucure you can find in lots of applications
 */

export type Theme = 'light' | 'dark';

export interface UserSettingsEntity {
  id: number;
  userId: number;
  theme: Theme;
  notificationsEnabled: boolean;
}

export type UserPermission = {
  resource: string;
  accessLevel: 'read' | 'write' | 'admin';
}

export interface UserEntity {
  id: number;
  fullName: string;
  email: string | null;
  updatedAt: string;
  settings: UserSettingsEntity | null;
  permissions: UserPermission[];
}
```

```ts [api.ts]
/**
 * A trivial strucure you can find in lots of applications
 */

export enum Theme {
  LIGHT,
  DARK,
}

export interface UserSettingsResponse {
  id: number;
  userId: number;
  theme: Theme;
  notificationsEnabled: boolean;
}

export type UserPermissionResponse = {
  resource: string;
  accessLevel: 'read' | 'write' | 'admin';
}

export interface UserResponse {
  id: number;
  fullName: string;
  email?: string;
  updatedAt: Date;
  permissions: UserPermissionResponse[];
  settings?: UserSettingsResponse;
}
```


```ts [🔴 old-way-endpoint.ts]
import type { UserEntity } from './database'
import type { UserResponse } from './api'
function getUserInfo(request: Express.Request): UserResponse {
  const userFromDb: UserEntity = db.findUserById(request.params.id)


/**
 * This is how you (were) doing object mapping without Mapia
 * 1. Manually copy every field
 * 2. Handle renames, transformations, nested objects yourself
 * 3. Write lots of low-quality non-reusable boilerplate code
 * 4. High risk of silent runtime errors due to typos or forgotten fields
 */

  return {
    id: userFromDb.id,
    fullName: userFromDb.fullName,
    email: userFromDb.email ?? undefined,
    updatedAt: userFromDb.updatedAt,
    permissions: userFromDb.permissions.map(
      (permission) => ({
      resource: permission.resource,
      accessLevel: permission.accessLevel,
    })),
    settings: 
      userFromDb.settings
      ? {
          id: userFromDb.settings.id,
          userId: userFromDb.settings.userId,
          theme:
            userFromDb.settings.theme === 'light'
              ? Theme.LIGHT
              : Theme.DARK,
          notificationsEnabled: 
            userFromDb.settings.notificationsEnabled,
        }
      : undefined,
  }
}

```

```ts [🟢 mapia-way-endpoint.ts]
import { compileMapper, optionalMap, transform } from "mapia";
import { dateShape, optionalShape } from "./shapes";
import type { UserEntity, Theme as UserSettingsEntityTheme } from './database'
import type { UserResponse, Theme } from './api'

const themeMapper: Record<UserSettingsEntityTheme, Theme> = {
  light: Theme.LIGHT,
  dark: Theme.DARK,
};

const userMapper = compileMapper<UserEntity, UserResponse>({
  id: 'id',
  fullName: 'fullName',
  email: transform(optionalShape()),
  updatedAt: transform(dateShape),
  settings: optionalMap({
    id: 'id',
    userId: 'userId',
    theme: transform(x => themeMapper[x]),
    notificationsEnabled: 'notificationsEnabled',
  }),
  permissions: 'permissions',
});

export function getUserInfo(request: Express.Request): UserResponse {
  const userFromDb: UserEntity = db.findUserById(request.params.id);
  return userMapper.mapOne(userFromDb); // That's it!
}
```

> [!TIP]
> *Mapia shines in big projects and complex data structures.
Explore its utilities and level up your developer experience!*

:::

## Why Mapia?

- 🧙 IDE-friendly auto-mapping powered by TypeScript inference
- 🪶 Zero dependencies, 80 kb unzipped bundle size—suitable for browsers and Node
- 🧪 Type-safe by default, even with classes, generics, and nested structures
- 🧼 Minimal configuration and predictable output every time
- ⚡ **Up to ~2000× faster** than `class-transformer` and `AutoMapper-TS` in production-level tasks

If you using VS Code, press `Ctrl`+`.` inside the mapper definition to see the auto-completion in action! Quick fix "Add missing properties" will suggest all the mappable fields automatically.

## Installation

```bash
npm install mapia
# or
pnpm add mapia
# or
npm install mapia
# or
yarn add mapia
```

## Requirements

- TypeScript:
- - Minimum: 5.2.x
- - Recommended: latest 5.9.x version or higher

> [!NOTE]
> Check that your IDE uses the same version of TypeScript as your project.

- Node.js 16 or higher


## Security considerations

**Content Security Policy**

Mapia uses `new Function(...)` internally to compile mappers at runtime, to achieve major advantages in performance.

When using Mapia in a browser page with enabled Content Security Policy (CSP), script-src directive must include 'unsafe-eval'.

Currently, there is no other option to pre-compile mappers in a browser environment. Feel free to create a PR if you have ideas on how to improve this.
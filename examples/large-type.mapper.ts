// Split the nested types into separate types with the postfix "Response"

type AuthorResponse = {
  name: string;
  email: string;
  url?: string;
};

type RepositoryResponse = {
  type: string;
  url: string;
};

type EnginesResponse = {
  node?: string;
  npm?: string;
  pnpm?: string;
  yarn?: string;
};

type BugsResponse = {
  url: string;
  email?: string;
};

type ContributorResponse = {
  name: string;
  email: string;
  url?: string;
};

type FundingResponse = {
  type: string;
  url: string;
};

type PublishConfigResponse = {
  registry?: string;
  access?: string;
};

type MaintainerResponse = {
  name: string;
  email: string;
  url?: string;
};

type DistResponse = {
  shasum: string;
  tarball: string;
  integrity?: string;
};

type PackageRegistryEntryResponse = {
  name: string;
  version: string;
  description: string;
  author: AuthorResponse;
  license: string;
  repository: RepositoryResponse;
  keywords: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  scripts: Record<string, string>;
  engines?: EnginesResponse;
  bugs?: BugsResponse;
  homepage?: string;
  contributors?: ContributorResponse[];
  funding?: FundingResponse;
  private?: boolean;
  publishConfig?: PublishConfigResponse;
  readme?: string;
  maintainers?: MaintainerResponse[];
  dist?: DistResponse;
  twoFactor: boolean;
  notifications: boolean;
  safeMode: boolean;
};

/* ================== */

// Updated the `PackageRegistryEntity` model to use `X | null` for optional fields

type AuthorEntity = {
  name: string;
  email: string;
  url: URL | null;
};

type RepositoryEntity = {
  type: "git" | "svn" | "mercurial";
  url: URL;
};

type EnginesEntity = {
  node: string | null;
  npm: string | null;
  pnpm: string | null;
  yarn: string | null;
};

type BugsEntity = {
  url: URL;
  email: string | null;
};

type ContributorEntity = {
  name: string;
  email: string;
  url: URL | null;
};
type Version = `${number}.${number}.${number}`;

type FundingEntity = {
  type: "individual" | "organization";
  url: URL;
};

type PublishConfigEntity = {
  registry: URL | null;
  access: "public" | "restricted" | null;
};

type MaintainerEntity = {
  name: string;
  email: string;
  url: URL | null;
};

type DistEntity = {
  shasum: string;
  tarball: URL;
  integrity: string | null;
};

type PackageRegistryEntryEntity = {
  name: string;
  version: Version;
  description: string;
  author: AuthorEntity;
  license: string;
  repository: RepositoryEntity;
  keywords: string[];
  dependencies: Record<string, Version>;
  devDependencies: Record<string, Version>;
  peerDependencies: Record<string, Version> | null;
  optionalDependencies: Record<string, Version> | null;
  scripts: Record<string, string>;
  engines: EnginesEntity | null;
  bugs: BugsEntity | null;
  homepage: URL | null;
  contributors: ContributorEntity[] | null;
  funding: FundingEntity | null;
  private: boolean | null;
  publishConfig: PublishConfigEntity | null;
  readme: string | null;
  maintainers: MaintainerEntity[] | null;
  dist: DistEntity | null;
  // Flattened fields from nested types
  hasTwoFactorAuth: boolean;
  enabledNotifications: boolean;
  safeMode: boolean;
};

type ReplaceUndefinedWithNull<T> = {
  [K in keyof T]-?: undefined extends T[K]
    ? Exclude<T[K], undefined> | null
    : T[K];
};

// Function to replace `undefined` with `null` in a type-safe manner for shallow properties
function replaceUndefinedWithNull<T>(obj: T): ReplaceUndefinedWithNull<T> {
  const result: Partial<{ [K in keyof T]: Exclude<T[K], undefined> | null }> =
    {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      result[key] =
        value === undefined
          ? null
          : (value as Exclude<T[typeof key], undefined>);
    }
  }

  return result as ReplaceUndefinedWithNull<T>;
}

import { compileMapper, rename, transform } from "../src";

const authorMapper = compileMapper<
  ReplaceUndefinedWithNull<AuthorResponse>,
  AuthorEntity
>({
  name: "name",
  email: "email",
  url: transform((x) => (x ? new URL(x) : null)),
});

const repositoryMapper = compileMapper<
  ReplaceUndefinedWithNull<RepositoryResponse>,
  RepositoryEntity
>({
  url: transform((x) => new URL(x)),
  type: transform((x) => x as "git" | "svn" | "mercurial"), // Remember that mapia does not validate fields, so you should make strong endpoint constraints (dto)
});

const enginesMapper = compileMapper<
  ReplaceUndefinedWithNull<EnginesEntity>,
  EnginesEntity
>({
  node: "node",
  npm: "npm",
  pnpm: "pnpm",
  yarn: "yarn",
});

const bugsMapper = compileMapper<
  ReplaceUndefinedWithNull<BugsResponse>,
  BugsEntity
>({
  email: "email",
  url: transform((x) => new URL(x)),
});

const contributorsMapper = compileMapper<
  ReplaceUndefinedWithNull<ContributorResponse>,
  ContributorEntity
>({
  name: "name",
  email: "email",
  url: transform((x) => (x ? new URL(x) : null)),
});

const fundingMapper = compileMapper<FundingResponse, FundingEntity>({
  type: transform(x => x as "individual" | "organization"),
  url: transform(x => new URL(x))
})

const publishConfig = compileMapper<ReplaceUndefinedWithNull<PublishConfigResponse>, PublishConfigEntity>({
  registry: transform(x => x ? new URL(x) : null),
  access: transform(x => x as "public" | "restricted")
})

const distEntity = compileMapper<ReplaceUndefinedWithNull<DistResponse>, DistEntity>({
  shasum: "shasum",
  tarball: transform(x => new URL(x)),
  integrity: "integrity"
})

const packageRegistryFromResponseToEntity = compileMapper<
  ReplaceUndefinedWithNull<PackageRegistryEntryResponse>,
  PackageRegistryEntryEntity
>({
  name: "name",
  description: "description",
  license: "license",
  keywords: "keywords",
  scripts: "scripts",
  private: "private",
  readme: "readme",
  homepage: transform((x) => (x ? new URL(x) : null)),
  version: transform((x) => x as Version),
  author: transform(x => authorMapper.mapOne(replaceUndefinedWithNull(x))),
  repository: transform(x => repositoryMapper.mapOne(replaceUndefinedWithNull(x))),
  dependencies: transform((x) => x as Record<string, Version>), // Remember that mapia does not validate fields, so you should make strong endpoint constraints (dto)
  devDependencies: transform((x) => x as Record<string, Version>),
  peerDependencies: transform((x) => x as Record<string, Version>),
  optionalDependencies: transform((x) => x as Record<string, Version>),
  engines: transform((x) =>
    x ? enginesMapper.mapOne(replaceUndefinedWithNull(x)) : null
  ),
  bugs: transform((x) =>
    x ? bugsMapper.mapOne(replaceUndefinedWithNull(x)) : null
  ),
  contributors: transform((x) =>
    x
      ? contributorsMapper.mapMany(x.map((x) => replaceUndefinedWithNull(x)))
      : null
  ),
  funding: transform(x => x ? fundingMapper.mapOne(replaceUndefinedWithNull(x)) : null),
  publishConfig: transform(x => x ? publishConfig.mapOne(replaceUndefinedWithNull(x)) : null),
  maintainers: transform((x) =>
    x
      ? contributorsMapper.mapMany(x.map((x) => replaceUndefinedWithNull(x)))
      : null
  ),
  dist: transform(x => x ? distEntity.mapOne(replaceUndefinedWithNull(x)) : null),
  hasTwoFactorAuth: rename('twoFactor'),
  enabledNotifications: rename('notifications'),
  safeMode: rename('safeMode'),
});

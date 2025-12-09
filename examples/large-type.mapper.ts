// Split the nested types into separate types with the postfix "Response"

type AuthorResponse = {
  name: string;
  email: string;
  url?: string;
};

type RepositoryResponse = {
  type: "git" | "svn" | "mercurial";
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
  type: "individual" | "organization";
  url: string;
};

type PublishConfigResponse = {
  registry?: string;
  access?: "public" | "restricted";
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
  version: Version;
  description: string;
  author: AuthorResponse;
  license: string;
  repository: RepositoryResponse;
  keywords: string[];
  dependencies: Record<string, Version>;
  devDependencies?: Record<string, Version>;
  peerDependencies?: Record<string, Version>;
  optionalDependencies?: Record<string, Version>;
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
  devDependencies: Record<string, Version> | null;
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

import {
  compileMapper,
  MO,
  mv,
  nullableShape,
  nullMM,
  nullMO,
  tr,
  transform,
  urlOrNullShape,
  urlOrThrowShape,
} from "../src";

const authorMapper = compileMapper<AuthorResponse, AuthorEntity>({
  name: "name",
  email: "email",
  url: transform((x) => (x ? new URL(x) : null)),
});

const repositoryMapper = compileMapper<RepositoryResponse, RepositoryEntity>({
  url: transform((x) => new URL(x)),
  type: transform((x) => x as "git" | "svn" | "mercurial"), // Remember that mapia does not validate fields, so you should make strong endpoint constraints (dto)
});

const enginesMapper = compileMapper<
  EnginesResponse,
  EnginesEntity
>({
  node: tr(nullableShape()),
  npm: tr(nullableShape()),
  pnpm: tr(nullableShape()),
  yarn: tr(nullableShape()),
});

const bugsMapper = compileMapper<BugsResponse, BugsEntity>({
  email: tr(nullableShape<string>()),
  url: tr(urlOrThrowShape),
});

const contributorsMapper = compileMapper<ContributorResponse, ContributorEntity>({
  name: "name",
  email: "email",
  url: tr(urlOrNullShape),
});

const maintainerMapper = compileMapper<MaintainerResponse, ContributorEntity>({
  name: "name",
  email: "email",
  url: tr(urlOrNullShape),
});

const fundingMapper = compileMapper<FundingResponse, FundingEntity>({
  type: "type",
  url: tr(urlOrThrowShape),
});

const publishConfig = compileMapper<PublishConfigResponse, PublishConfigEntity>({
  registry: tr(urlOrNullShape),
  access: tr(nullableShape()),
});

const distEntity = compileMapper<DistResponse, DistEntity>({
  shasum: "shasum",
  tarball: tr(urlOrThrowShape),
  integrity: tr(nullableShape<string>()),
});

/**
 * Here we using aliases to make the code more readable
 * and to avoid long lines.
 * 
 * More about them https://github.com/alexcupertme/mapia/blob/main/READNE.md#Aliases
 */
const packageRegistryFromResponseToEntity = compileMapper<
  PackageRegistryEntryResponse,
  PackageRegistryEntryEntity
>({
  name: "name",
  description: "description",
  license: "license",
  keywords: "keywords",
  scripts: "scripts",
  private: tr(nullableShape()),
  readme: tr(nullableShape()),
  homepage: tr(urlOrNullShape),
  version: "version",
  author: tr(MO(authorMapper)),
  repository: tr(MO(repositoryMapper)),
  dependencies: "dependencies",
  devDependencies: tr(nullableShape()),
  peerDependencies: tr(nullableShape()),
  optionalDependencies: tr(nullableShape()),
  engines: tr(nullMO(enginesMapper)),
  bugs: tr(nullMO(bugsMapper)),
  contributors: tr(nullMM(contributorsMapper)),
  funding: tr(nullMO(fundingMapper)),
  publishConfig: tr(nullMO(publishConfig)),
  maintainers: tr(nullMM(contributorsMapper)),
  dist: tr(nullMO(distEntity)),
  hasTwoFactorAuth: mv("twoFactor"),
  enabledNotifications: mv("notifications"),
  safeMode: mv("safeMode"),
});

const packageRegistryResponse: PackageRegistryEntryResponse = {
  name: "example-package",
  version: "1.0.0",
  description: "An example package",
  author: {
    name: "Steve Jobs",
    email: "steve.jobs@gmail.com",
    url: "https://apple.com",
  },
  license: "MIT",
  repository: {
    type: "git",
    url: "https://github.com/facebook/react",
  },
  keywords: ["example", "package"],
  dependencies: {
    react: "18.0.0",
    "react-dom": "18.0.0",
  },
  devDependencies: {
    typescript: "4.5.0",
    jest: "27.0.0",
  },
  scripts: {
    start: "react-scripts start",
    build: "react-scripts build",
    test: "react-scripts test",
    eject: "react-scripts eject",
  },
  engines: {
    node: ">=14.0.0",
    npm: ">=6.0.0",
    pnpm: ">=6.0.0",
    yarn: ">=1.0.0",
  },
  bugs: {
    url: "https://github.com/facebook/react/issues",
    email: "steve.jobs@gmail.com",
  },
  homepage: "https://github.com/facebook/react",
  contributors: [
    {
      name: "Steve Jobs",
      email: "steve.jobs@gmail.com",
      url: "https://apple.com",
    },
  ],
  funding: {
    type: "individual",
    url: "https://github.com/facebook/react",
  },
  private: false,
  publishConfig: {
    registry: "https://registry.npmjs.org/",
    access: "public",
  },
  readme: "This is an example package.",
  maintainers: [],
  twoFactor: true,
  notifications: true,
  safeMode: true,
  dist: {
    shasum: "abc123",
    tarball:
      "https://registry.npmjs.org/example-package/-/example-package-1.0.0.tgz",
    integrity: "sha512-abc123",
  },
};

console.log(
  packageRegistryFromResponseToEntity.mapOne(packageRegistryResponse)
);

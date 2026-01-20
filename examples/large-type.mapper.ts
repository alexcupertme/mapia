import {
  tr,
  urlOrNullShape,
  urlOrThrowShape,
} from "../src";
import { map, compileMapper, transform, rename, nullableMap } from "../src/index";
import { deepCastTypes, DeepCastTypes } from "../src/index";

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

type OK_PackageRegistryEntryResponse = DeepCastTypes<PackageRegistryEntryResponse, undefined, null>

/**
 * Here we using aliases to make the code more readable
 * and to avoid long lines.
 * 
 * More about them https://github.com/alexcupertme/mapia/blob/main/READNE.md#Aliases
 */
const packageRegistryFromResponseToEntity = compileMapper<
  OK_PackageRegistryEntryResponse,
  PackageRegistryEntryEntity
>({
  name: "name",
  description: "description",
  license: "license",
  keywords: "keywords",
  scripts: "scripts",
  private: 'private',
  readme: 'readme',
  homepage: tr(urlOrNullShape),
  version: "version",
  author: map({
    name: "name",
    email: "email",
    url: tr(urlOrNullShape),
  }),
  repository: map({
    url: tr(urlOrThrowShape),
    type: 'type',
  }),
  dependencies: "dependencies",
  devDependencies: 'devDependencies',
  peerDependencies: 'peerDependencies',
  optionalDependencies: 'optionalDependencies',
  engines: 'engines',
  bugs: nullableMap({
    email: 'email',
    url: tr(urlOrThrowShape),
  }),
  funding: nullableMap({
    url: tr(urlOrThrowShape),
    type: "type"
  }),
  dist: nullableMap({
    tarball: tr(urlOrThrowShape),
    integrity: 'integrity',
    shasum: "shasum"
  }),
  hasTwoFactorAuth: rename("twoFactor"),
  enabledNotifications: rename("notifications"),
  safeMode: 'safeMode',
  contributors: nullableMap({
    name: "name",
    email: "email",
    url: tr(urlOrNullShape),
  }),
  publishConfig: nullableMap({
    access: "access",
    registry: tr(urlOrNullShape),
  }),
  maintainers: nullableMap({
    name: "name",
    email: "email",
    url: tr(urlOrNullShape),
  }),
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
  packageRegistryFromResponseToEntity.mapOne(deepCastTypes(packageRegistryResponse, 'undefined', 'null'))
);

import { compileMapper, map, rename, flatMap, nullableMapFrom, optionalMapFrom } from '../src/index';

type SourceType = {
  id: string;
  user: {
    name: string;
    contact: {
      email: string;
      phone?: string;
    };
  };
  roles: Array<{
    id: number;
    title: string;
    permissions: {
      edit: boolean;
    }[]
  }>;
  role: {
    id: number;
    title: string;
  };
  sameType: {
    subField: {
      deep: {
        veryDeep: {}
      }
    }
  };
  flags: {
    active: boolean;
    verified: boolean;
  };
  meta?: {
    version: number;
    tags: string[];
  };
};

type TargetType = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: Array<{
    roleId: number;
    roleTitle: string;
    permissions: {
      canEdit: boolean;
    }[]
  }>;
  role: {
    roleId: number;
    roleTitle: string;
  };
  sameType: {
    subField: {
      deep: {
        veryDeep: {}
      }
    }
  };
  status: {
    isActive: boolean;
    isVerified: boolean;
  };
  metadata: {
    version: number;
    tags: string[];
  } | null;
};

const mapper = compileMapper<SourceType, TargetType>({
  id: "id",
  name: rename('user.name'),
  email: rename('user.contact.email'),
  phone: rename('user.contact.phone'),
  role: map({
    roleId: rename('id'),
    roleTitle: rename('title'),
  }),
  metadata: nullableMapFrom('meta', {
    version: "version",
    tags: "tags"
  }),
  roles: map({
    roleId: rename('id'),
    roleTitle: rename('title'),
    permissions: map({
      canEdit: rename('edit'),
    }),
  }),
  status: flatMap({
    isActive: rename('flags.active'),
    isVerified: rename('flags.verified'),
  }),
  sameType: "sameType"
});

const backMapper = compileMapper<TargetType, SourceType>({
  id: "id",
  user: flatMap({
    name: "name",
    contact: flatMap({
      email: "email",
      phone: "phone"
    })
  }),
  roles: map({
    id: rename('roleId'),
    title: rename('roleTitle'),
    permissions: map({
      edit: rename('canEdit'),
    })
  }),
  role: map({
    id: rename('roleId'),
    title: rename('roleTitle'),
  }),
  sameType: "sameType",
  flags: flatMap({
    active: rename('status.isActive'),
    verified: rename('status.isVerified'),
  }),
  meta: optionalMapFrom('metadata', {
    version: "version",
    tags: "tags"
  })
});

console.log(mapper.mapOne({
  id: "user-123",
  user: {
    name: "Alice",
    contact: {
      email: "alice@example.com",
      phone: "+1234567890"
    }
  },
  roles: [
    {
      id: 1, title: "Admin",
      permissions: [{ edit: true }, { edit: false }]
    },
    {
      id: 2, title: "User",
      permissions: [{ edit: false }]
    }
  ],
  sameType: {
    subField: {
      deep: {
        veryDeep: {
          level: 0,
        }
      }
    }
  },
  flags: {
    active: true,
    verified: false
  },
  meta: {
    version: 1,
    tags: ["new", "premium"]
  },
  role: {
    id: 0,
    title: ""
  }
}));
import { EnumAutoSuffixMapping, enumMapper } from "./enum-mapper";
import { AssertEqual } from "./mapia";

enum ApiRole {
  VIEWER = "VIEWER",
  READER = "READER",
}

enum InternalRole {
  VIEWER_ENUM = "VIEWER_ENUM",
  READER_ENUM = "READER_ENUM",
}

const defaultRoleMap = enumMapper(ApiRole, InternalRole, {
  VIEWER: InternalRole.VIEWER_ENUM,
  READER: InternalRole.READER_ENUM,
});

describe("enum mapper helpers", () => {
  it("enforces suffix-based mappings", () => {
    expect(defaultRoleMap.toDestination(ApiRole.VIEWER)).toBe(
      InternalRole.VIEWER_ENUM,
    );
    expect(defaultRoleMap.toSource(InternalRole.READER_ENUM)).toBe(
      ApiRole.READER,
    );
  });

  it("maps common enums", () => {
    enum CommonStatus {
      ACTIVE = "ACTIVE",
      INACTIVE = "INACTIVE",
      PENDING = "PENDING",
    }

    enum CommonStatusSchema {
      ACTIVE = "ACTIVE",
      INACTIVE = "INACTIVE",
      PENDING = "PENDING",
    }

    const commonStatusMap = enumMapper(
      CommonStatus,
      CommonStatusSchema,
      {
        ACTIVE: CommonStatusSchema.ACTIVE,
        INACTIVE: CommonStatusSchema.INACTIVE,
        PENDING: CommonStatusSchema.PENDING,
      },
      "",
    );

    expect(commonStatusMap.toDestination(CommonStatus.ACTIVE)).toBe(
      CommonStatusSchema.ACTIVE,
    );
    expect(commonStatusMap.toSource(CommonStatusSchema.INACTIVE)).toBe(
      CommonStatus.INACTIVE,
    );
  });

  it("allows custom suffixes while keeping inference", () => {
    enum HttpStatus {
      OK = "OK",
      NOT_OK = "NOT_OK",
      MAYBE_OK = "MAYBE_OK",
      DEFAULT = "DEFAULT",
    }

    enum HttpStatusCode {
      OK_CUSTOM = "OK_CUSTOM",
      NOT_OK_CUSTOM = "NOT_OK_CUSTOM",
      MAYBE_OK_CUSTOM = "MAYBE_OK_CUSTOM",
      DEFAULT_CUSTOM = "DEFAULT_CUSTOM",
    }

    const suffixMap = enumMapper(
      HttpStatus,
      HttpStatusCode,
      {
        OK: HttpStatusCode.OK_CUSTOM,
        NOT_OK: HttpStatusCode.NOT_OK_CUSTOM,
        MAYBE_OK: HttpStatusCode.MAYBE_OK_CUSTOM,
        DEFAULT: HttpStatusCode.DEFAULT_CUSTOM,
      },
      "_CUSTOM",
    );

    expect(suffixMap.toDestination(HttpStatus.NOT_OK)).toBe(
      HttpStatusCode.NOT_OK_CUSTOM,
    );
    expect(suffixMap.toSource(HttpStatusCode.MAYBE_OK_CUSTOM)).toBe(
      HttpStatus.MAYBE_OK,
    );
  });

  it("rejects stray destination keys", () => {
    enum HttpStatusOnly {
      OK = "OK",
    }

    enum HttpStatusCodeWithExtra {
      OK_CUSTOM = "OK_CUSTOM",
      DEFAULT = "DEFAULT",
    }

    type ExtraDestinationCheck = AssertEqual<
      EnumAutoSuffixMapping<
        typeof HttpStatusOnly,
        typeof HttpStatusCodeWithExtra,
        "_CUSTOM"
      >,
      never
    >;
  });
});

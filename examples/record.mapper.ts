import { mapRecord, stringShape } from "../src";

type Version = number;

type Versions = Record<string, Version>;

type SerializedVersions = Record<string, string>;

export const versions: Versions = {
  react: 18,
  "react-dom": 18,
  "react-router": 6,
  "react-router-dom": 6,
};

const mapped = mapRecord<Version, string>(versions, stringShape);
console.log(mapped);

type ComplexVersion = {
  major: number;
  minor: number;
  patch: number;
};

type ComplexVersions = Record<string, ComplexVersion>;

type SerializedComplexVersion = `${number}.${number}.${number}`;

type SerializedComplexVersions = Record<string, SerializedComplexVersion>;

export const complexVersions: ComplexVersions = {
  react: { major: 18, minor: 0, patch: 0 },
  "react-dom": { major: 18, minor: 0, patch: 0 },
  "react-router": { major: 6, minor: 0, patch: 0 },
  "react-router-dom": { major: 6, minor: 0, patch: 0 },
};

// Implementing own shape
export const serializedComplexVersionShape = (
  v: ComplexVersion
): SerializedComplexVersion => `${v.major}.${v.minor}.${v.patch}`;

const complexMapped = mapRecord(
  complexVersions,
  serializedComplexVersionShape // If we are passing stringShape, we're getting type error
);
console.log(complexMapped);

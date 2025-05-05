import stylistic from "@stylistic/eslint-plugin";
import typescript from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importPlugin from "eslint-plugin-import-x";
import jestPugin from 'eslint-plugin-jest';
import prettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unicorn from "eslint-plugin-unicorn";

const tsRecommendedRules = typescript.configs.recommended.rules;
const tsRecommendedTypeCheckedRules =
  typescript.configs["recommended-requiring-type-checking"].rules;
const importTsRules = importPlugin.configs.typescript.rules;
const unicornAllRules = unicorn.configs.all.rules;
const prettierRecommendedRules = prettier.configs.recommended.rules;

export default [
  {
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: './tsconfig.json',
        }),
      ],
    },
    ignores: ["index.ts", "**/common/mc/", "example.ts"],
    files: ["src/**/*.ts"],

    languageOptions: {
      parser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: 2020,
      },
      globals: {
        // You can define Node.js globals if needed (like `process`, `__dirname`, etc.)
        NodeJS: true,
        require: true,
        module: true,
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      "@stylistic": stylistic,
      unicorn: unicorn,
      import: importPlugin,
      jest: jestPugin,
      "simple-import-sort": simpleImportSort,
      prettier: prettier,
    },
    rules: {
      ...tsRecommendedRules,
      ...tsRecommendedTypeCheckedRules,
      ...importTsRules,
      ...unicornAllRules,
      ...prettierRecommendedRules,

      "@typescript-eslint/no-deprecated": "warn",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      // unbound-method не работает с Jest и моками. Выключаем обычное правило и включаем исключение для jest, чтобы не ставить везде eslint-disable. 
      '@typescript-eslint/unbound-method': 'off',
      'jest/unbound-method': 'error',
      "@typescript-eslint/no-unsafe-return": "error",
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/*.test.ts",
            "**/*.spec.ts",
            "**/*.test.e2e.ts",
            "**/*.spec.e2e.ts",
            "**/*.e2e*.ts",
            "**/*e2e.ts",
            "jest.*.ts",
            "jest.*.js",
            "**/jest.*.ts",
            "**/jest.*.js",
          ],
        },
      ],
      // Ломает DI в nestJS
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/member-ordering": "warn",
      "@stylistic/lines-between-class-members": [
        "warn",
        "always",
        {
          exceptAfterSingleLine: true,
          exceptAfterOverload: true,
        },
      ],
      "@stylistic/padding-line-between-statements": [
        "warn",
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        {
          blankLine: "any",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var", "if"],
        },
      ],
      "@stylistic/lines-around-comment": [
        "error",
        {
          beforeBlockComment: true,
          beforeLineComment: true,
          allowBlockStart: true,
          allowObjectStart: true,
          allowArrayStart: true,
          allowClassStart: true,
          allowEnumStart: true,
          allowInterfaceStart: true,
          allowModuleStart: true,
          allowTypeStart: true,
        },
      ],
      "import/no-cycle": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "sort-imports": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportDeclaration[importKind='type']",
          message: "Do not use 'import type'. Use regular 'import' instead.",
        },
      ],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            [
              "^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)",
            ],
            ["^react", "^@?\\w"],
            ["^(@|@company|@ui|components|utils|config|vendored-lib)(/.*|$)"],
            ["^\\u0000"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            ["^.+\\.s?css$"],
          ],
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: ["classMethod", "accessor", "parameterProperty"],
          format: ["camelCase"],
        },
      ],
      "unicorn/custom-error-definition": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/filename-case": "off",
      "unicorn/no-nested-ternary": "off",
      "unicorn/no-keyword-prefix": "off",
      "no-negated-condition": "off",
      "no-nested-ternary": "off",
      "unicorn/no-null": "off",
      "unicorn/no-static-only-class": "off",
      "unicorn/no-this-assignment": "off",
      "unicorn/better-regex": "off",
      "unicorn/no-unused-properties": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
      "unicorn/numeric-separators-style": "off",
      "unicorn/prefer-json-parse-buffer": "error",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-native-coercion-functions": "off",
      "unicorn/prefer-spread": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/switch-case-braces": ["error", "avoid"],
      "unicorn/no-array-method-this-argument": "off",
    },
  },
];

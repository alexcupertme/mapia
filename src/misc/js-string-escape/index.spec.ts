import punycode from "node:punycode";

import jsStringEscape from "./index";

describe("jsStringEscape", () => {
  test("basic use", () => {
    expect(jsStringEscape('"Hello World!"')).toBe(String.raw`\"Hello World!\"`);
  });

  test("invariants", () => {
    let allCharacters = "";

    // BMP code points
    // eslint-disable-next-line prettier/prettier
    for (let i = 0; i <= 0x00FFFF; i++) {
      allCharacters += String.fromCodePoint(i);
    }

    // Astral code points
    // eslint-disable-next-line prettier/prettier
    for (let i = 0x010000; i <= 0x10FFFF; i++) {
      allCharacters += punycode.ucs2.encode([i]);
    }

    const escaped = jsStringEscape(allCharacters);

    // Same assertion style as original (avoid mega-diffs)
    expect(eval("'" + escaped + "'") === allCharacters).toBe(true);
    expect(eval('"' + escaped + '"') === allCharacters).toBe(true);
  });

  test("supports arbitrary objects", () => {
    expect(jsStringEscape(null)).toBe("null");

    //@ts-expect-error for testing purposes
    expect(jsStringEscape()).toBe("undefined");
    expect(jsStringEscape(false)).toBe("false");
    expect(jsStringEscape(0)).toBe("0");
    expect(jsStringEscape({})).toBe("[object Object]");
    expect(jsStringEscape("")).toBe("");
  });
});

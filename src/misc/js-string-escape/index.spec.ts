import jsStringEscape from "./index";
import punycode from "punycode";

describe("jsStringEscape", () => {
  test("basic use", () => {
    expect(jsStringEscape('"Hello World!"')).toBe('\\"Hello World!\\"');
  });

  test("invariants", () => {
    let allCharacters = "";

    // BMP code points
    for (let i = 0; i <= 0x00ffff; i++) {
      allCharacters += String.fromCharCode(i);
    }

    // Astral code points
    for (let i = 0x010000; i <= 0x10ffff; i++) {
      allCharacters += punycode.ucs2.encode([i]);
    }

    const escaped = jsStringEscape(allCharacters);

    // Same assertion style as original (avoid mega-diffs)
    expect(eval("'" + escaped + "'") === allCharacters).toBe(true);
    expect(eval('"' + escaped + '"') === allCharacters).toBe(true);
  });

  test("supports arbitrary objects", () => {
    expect(jsStringEscape(null)).toBe("null");
    expect(jsStringEscape(undefined)).toBe("undefined");
    expect(jsStringEscape(false)).toBe("false");
    expect(jsStringEscape(0.0)).toBe("0");
    expect(jsStringEscape({})).toBe("[object Object]");
    expect(jsStringEscape("")).toBe("");
  });
});

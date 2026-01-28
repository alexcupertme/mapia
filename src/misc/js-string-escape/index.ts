export default function jsStringEscape(value: unknown): string {
  return String(value).replaceAll(/["'\\\n\r\u2028\u2029]/g, (character) => {
    switch (character) {
      case '"':
      case "'":
      case "\\":
        return "\\" + character;

      case "\n":
        return String.raw`\n`;
      case "\r":
        return String.raw`\r`;
      case "\u2028":
        return String.raw`\u2028`;
      case "\u2029":
        return String.raw`\u2029`;
      /* istanbul ignore next */
      default:
        // Should be unreachable due to the regex
        return character;
    }
  });
}

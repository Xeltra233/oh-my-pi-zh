/**
 * Minimal, robust JSONC parser handling single-line and multi-line comments and trailing commas.
 */
export function parseJsonc<T = unknown>(text: string): T {
  let result = "";
  let inString = false;
  let inSingleComment = false;
  let inMultiComment = false;
  let stringQuote = "";
  let isEscaped = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inSingleComment) {
      if (char === "\n" || char === "\r") {
        inSingleComment = false;
        result += char;
      }
      continue;
    }

    if (inMultiComment) {
      if (char === "*" && nextChar === "/") {
        inMultiComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      result += char;
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === stringQuote) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringQuote = char;
      result += char;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      inSingleComment = true;
      i++;
      continue;
    }

    if (char === "/" && nextChar === "*") {
      inMultiComment = true;
      i++;
      continue;
    }

    result += char;
  }

  // Strip trailing commas before } or ]
  const cleaned = result.replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(cleaned) as T;
}

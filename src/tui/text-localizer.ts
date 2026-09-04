import type { TuiDictionary } from "../locales/types.js";

export class TuiTextLocalizer {
  private dictionary: TuiDictionary;
  private sortedPhrases: Array<[string, string]>;

  constructor(dictionary: TuiDictionary) {
    this.dictionary = dictionary;
    // Sort phrases by length descending to match longer phrases first
    this.sortedPhrases = Object.entries(dictionary.phrases).sort(
      (a, b) => b[0].length - a[0].length
    );
  }

  setDictionary(dictionary: TuiDictionary): void {
    this.dictionary = dictionary;
    this.sortedPhrases = Object.entries(dictionary.phrases).sort(
      (a, b) => b[0].length - a[0].length
    );
  }

  /**
   * Localize a single string (exact match or partial replacements).
   */
  localizeText(text: string): string {
    if (!text || typeof text !== "string") return text;

    // 1. Direct exact match
    const exact = this.dictionary.phrases[text];
    if (exact) return exact;

    let result = text;

    // 2. Pattern matches (regex)
    for (const p of this.dictionary.patterns) {
      if (p.regex.test(result)) {
        result = result.replace(p.regex, p.replacement as any);
      }
    }

    // 3. Substring phrase replacements
    for (const [en, zh] of this.sortedPhrases) {
      if (result.includes(en)) {
        // Only replace if it matches as a whole token or boundary
        result = result.replaceAll(en, zh);
      }
    }

    return result;
  }

  /**
   * Localize a single rendered terminal line (preserving ANSI escape codes).
   */
  localizeLine(line: string): string {
    if (!line || typeof line !== "string" || line.trim() === "") {
      return line;
    }

    let result = line;

    // Apply regex patterns first
    for (const p of this.dictionary.patterns) {
      result = result.replace(p.regex, p.replacement as any);
    }

    // Apply phrases
    for (const [en, zh] of this.sortedPhrases) {
      if (result.includes(en)) {
        result = result.replaceAll(en, zh);
      }
    }

    return result;
  }

  /**
   * Localize an array of terminal lines.
   */
  localizeLines(lines: string[]): string[] {
    return lines.map((l) => this.localizeLine(l));
  }
}

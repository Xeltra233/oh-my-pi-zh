import { stripVTControlCharacters } from "node:util";
import type { TuiDictionary } from "../locales/types.js";

/**
 * Calculate the visual terminal cell width of a string, taking into account
 * ANSI escape sequences (0 width) and full-width CJK characters (2 width).
 */
export function getVisibleWidth(str: string): number {
  if (!str) return 0;
  const clean = stripVTControlCharacters(str);
  let width = 0;
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    // CJK Unified Ideographs, Extension A, Symbols, and Fullwidth forms
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3400 && code <= 0x4dbf) ||
      (code >= 0x3000 && code <= 0x303f) ||
      (code >= 0xff01 && code <= 0xff60) ||
      (code >= 0x20000 && code <= 0x2ffff)
    ) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

/**
 * Trim trailing spaces from a string while preserving trailing ANSI formatting sequences.
 */
function trimTrailingSpaces(str: string, count: number): string {
  let toRemove = count;
  let result = str;
  const tailAnsi = result.match(/(\x1b\[[0-9;]*[a-zA-Z])+$/);
  const suffix = tailAnsi ? tailAnsi[0] : "";
  let base = tailAnsi ? result.slice(0, -suffix.length) : result;

  while (toRemove > 0 && base.endsWith(" ")) {
    base = base.slice(0, -1);
    toRemove--;
  }
  return base + suffix;
}

/**
 * Append trailing spaces to a string while preserving trailing ANSI formatting sequences.
 */
function addTrailingSpaces(str: string, count: number): string {
  const tailAnsi = str.match(/(\x1b\[[0-9;]*[a-zA-Z])+$/);
  const suffix = tailAnsi ? tailAnsi[0] : "";
  const base = tailAnsi ? str.slice(0, -suffix.length) : str;
  return base + " ".repeat(count) + suffix;
}

export class TuiTextLocalizer {
  private dictionary: TuiDictionary;
  private sortedPhrases: Array<[string, string]>;

  constructor(dictionary: TuiDictionary) {
    this.dictionary = dictionary;
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
   * Localize a single string (exact match, regex pattern, or phrase replacements).
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
        result = result.replaceAll(en, zh);
      }
    }

    return result;
  }

  /**
   * Localize a table/box-drawn line containing vertical borders (│ / \u2502).
   * Rebalances column padding so the column cell width remains mathematically
   * identical to the original, preventing table border misalignment.
   */
  localizeBoxLine(line: string): string {
    if (!line.includes("\u2502")) {
      return this.localizeLinePlain(line);
    }

    const parts = line.split("\u2502");
    if (parts.length < 2) return line;

    const rebalancedParts = parts.map((part, idx) => {
      // Keep outer styling before first border and after last border untouched
      if (idx === 0 || idx === parts.length - 1) {
        return part;
      }

      const origWidth = getVisibleWidth(part);
      let localized = part;

      // Apply regex patterns
      for (const p of this.dictionary.patterns) {
        localized = localized.replace(p.regex, p.replacement as any);
      }

      // Apply phrase replacements
      for (const [en, zh] of this.sortedPhrases) {
        if (localized.includes(en)) {
          localized = localized.replaceAll(en, zh);
        }
      }

      const newWidth = getVisibleWidth(localized);
      const diff = origWidth - newWidth;

      if (diff > 0) {
        localized = addTrailingSpaces(localized, diff);
      } else if (diff < 0) {
        localized = trimTrailingSpaces(localized, -diff);
      }

      return localized;
    });

    return rebalancedParts.join("\u2502");
  }

  private localizeLinePlain(line: string): string {
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
   * Localize a single rendered terminal line (preserving ANSI escape codes).
   */
  localizeLine(line: string): string {
    if (!line || typeof line !== "string" || line.trim() === "") {
      return line;
    }

    if (line.includes("\u2502")) {
      return this.localizeBoxLine(line);
    }

    return this.localizeLinePlain(line);
  }

  /**
   * Localize an array of terminal lines.
   */
  localizeLines(lines: string[]): string[] {
    return lines.map((l) => this.localizeLine(l));
  }
}

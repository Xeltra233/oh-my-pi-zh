export interface TuiDictionary {
  metadata: {
    locale: string;
    displayName: string;
    version: string;
  };

  /** Direct text phrases to translate in TUI screen lines and components */
  phrases: Record<string, string>;

  /** Regex-based replacement rules with capture groups */
  patterns: Array<{
    regex: RegExp;
    replacement: string | ((substring: string, ...args: any[]) => string);
  }>;

  /** Keybinding hint labels */
  keyHints: Record<string, string>;

  /** Footer & Status Bar texts */
  footer: Record<string, string>;

  /** Working & Loading spinners */
  loaders: Record<string, string>;

  /** Tool execution labels */
  tools: Record<string, string>;

  /** Common dialog titles, options, and hints */
  dialogs: Record<string, string>;

  /** oh-my-pi specific TUI strings */
  omp: Record<string, string>;
}

import type { TuiDictionary } from "./types.js";
import { tuiZhCN } from "./tui-zh.js";

export function getTuiDictionary(
  locale = "zh-CN",
  customDict?: Record<string, string>
): TuiDictionary {
  const base = tuiZhCN;
  if (!customDict || Object.keys(customDict).length === 0) {
    return base;
  }

  const customPhrases = { ...base.phrases, ...customDict };
  return {
    ...base,
    phrases: customPhrases
  };
}

export { tuiZhCN };
export * from "./types.js";

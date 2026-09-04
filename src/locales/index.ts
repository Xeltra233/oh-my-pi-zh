import type { LocaleDictionary } from "./types.js";
import { zhCN } from "./zh-cn.js";

const dictionaries: Record<string, LocaleDictionary> = {
  "zh-CN": zhCN,
  zh: zhCN
};

export function getDictionary(
  locale = "zh-CN",
  customDict?: Record<string, string>
): LocaleDictionary {
  const base = dictionaries[locale] ?? zhCN;
  if (!customDict || Object.keys(customDict).length === 0) {
    return base;
  }

  // Clone and apply custom dictionary overrides where applicable
  const clone: LocaleDictionary = {
    ...base,
    agents: { ...base.agents },
    categories: { ...base.categories },
    doctor: { ...base.doctor },
    messages: { ...base.messages }
  };

  for (const [key, value] of Object.entries(customDict)) {
    if (key.startsWith("agent:")) {
      const name = key.slice("agent:".length);
      clone.agents[name] = value;
    } else if (key.startsWith("category:")) {
      const name = key.slice("category:".length);
      clone.categories[name] = value;
    } else if (key.startsWith("message:")) {
      const name = key.slice("message:".length);
      clone.messages[name] = value;
    }
  }

  return clone;
}

export { zhCN };
export * from "./types.js";

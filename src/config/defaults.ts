import type { OhMyPiZhConfig } from "./types.js";

export const DEFAULT_CONFIG: OhMyPiZhConfig = {
  version: "0.1.0",
  enabled: true,
  locale: "zh-CN",
  features: {
    translateOrchestrator: true,
    translateAgents: true,
    translateCategories: true,
    translateTools: true,
    registerCommands: true,
    statusIndicator: false
  }
};

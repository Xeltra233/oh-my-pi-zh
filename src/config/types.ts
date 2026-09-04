export interface FeaturesConfig {
  /** Translate orchestrator system prompt */
  translateOrchestrator: boolean;
  /** Translate agent descriptions in prompt */
  translateAgents: boolean;
  /** Translate category descriptions in prompt */
  translateCategories: boolean;
  /** Translate tool descriptions in prompt */
  translateTools: boolean;
  /** Register /oh-my-pi-zh commands and aliases */
  registerCommands: boolean;
  /** Show status indicator widget in Pi status bar */
  statusIndicator: boolean;
}

export interface OhMyPiZhConfig {
  $schema?: string;
  version?: string;
  enabled: boolean;
  locale: "zh-CN" | "en-US";
  features: FeaturesConfig;
  customDictionary?: Record<string, string>;
}

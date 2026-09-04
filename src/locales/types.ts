export interface SectionLocalization {
  /** Replaces entire section or maps key content */
  content: string;
}

export interface LocaleDictionary {
  metadata: {
    locale: string;
    displayName: string;
    version: string;
  };
  sections: {
    role: (agentName: string) => string;
    behavior: string;
    delegation: string;
    oracle: string;
    constraints: string;
    taskManagement: string;
    toolsCatalog: string;
    environment: string;
  };
  agents: Record<string, string>;
  categories: Record<string, string>;
  tools: Record<string, { description: string; hint?: string }>;
  doctor: Record<string, string>;
  messages: Record<string, string>;
}

// src/config/loader.ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

// src/config/defaults.ts
var DEFAULT_CONFIG = {
  version: "0.1.0",
  enabled: true,
  locale: "zh-CN",
  features: {
    translateOrchestrator: true,
    translateAgents: true,
    translateCategories: true,
    translateTools: true,
    registerCommands: true,
    statusIndicator: true
  }
};

// src/shared/jsonc.ts
function parseJsonc(text) {
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
  const cleaned = result.replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(cleaned);
}

// src/shared/logger.ts
var Logger = class {
  prefix;
  constructor(prefix = "oh-my-pi-zh") {
    this.prefix = `[${prefix}]`;
  }
  debug(...args) {
    if (process.env.DEBUG || process.env.OH_MY_PI_DEBUG) {
      console.debug(this.prefix, ...args);
    }
  }
  info(...args) {
    console.info(this.prefix, ...args);
  }
  warn(...args) {
    console.warn(this.prefix, ...args);
  }
  error(...args) {
    console.error(this.prefix, ...args);
  }
};
var logger = new Logger();

// src/config/loader.ts
function safeReadJsonc(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    const raw = readFileSync(filePath, "utf-8");
    return parseJsonc(raw);
  } catch (err) {
    logger.warn(`Failed to parse config at ${filePath}: ${String(err)}`);
    return null;
  }
}
function loadConfig(cwd = process.cwd()) {
  let merged = {
    ...DEFAULT_CONFIG,
    features: { ...DEFAULT_CONFIG.features }
  };
  const home = process.env.HOME || homedir();
  const globalPaths = [
    join(home, ".pi", "oh-my-pi-zh.jsonc"),
    join(home, ".pi", "oh-my-pi-zh.json")
  ];
  for (const p of globalPaths) {
    const data = safeReadJsonc(p);
    if (data) {
      merged = mergeConfig(merged, data);
      break;
    }
  }
  const projectPaths = [
    join(cwd, ".oh-my-pi-zh.jsonc"),
    join(cwd, ".oh-my-pi-zh.json")
  ];
  for (const p of projectPaths) {
    const data = safeReadJsonc(p);
    if (data) {
      merged = mergeConfig(merged, data);
      break;
    }
  }
  const ompPaths = [
    join(cwd, ".oh-my-pi.jsonc"),
    join(cwd, ".oh-my-pi.json")
  ];
  for (const p of ompPaths) {
    const data = safeReadJsonc(p);
    if (data) {
      if (data.zh) {
        merged = mergeConfig(merged, data.zh);
      }
      if (data.locale === "zh-CN" || data.locale === "zh") {
        merged.locale = "zh-CN";
      } else if (data.locale === "en" || data.locale === "en-US") {
        merged.locale = "en-US";
      }
      break;
    }
  }
  return merged;
}
function mergeConfig(base, overrides) {
  return {
    ...base,
    ...overrides,
    features: {
      ...base.features,
      ...overrides.features ?? {}
    },
    customDictionary: {
      ...base.customDictionary ?? {},
      ...overrides.customDictionary ?? {}
    }
  };
}

// src/locales/tui-zh.ts
var tuiZhCN = {
  metadata: {
    locale: "zh-CN",
    displayName: "\u7B80\u4F53\u4E2D\u6587",
    version: "0.1.0"
  },
  phrases: {
    // Keybinding descriptions
    "switch model": "\u5207\u6362\u6A21\u578B",
    "switch provider": "\u5207\u6362\u63D0\u4F9B\u5546",
    "switch session": "\u5207\u6362\u4F1A\u8BDD",
    "cycle thinking level": "\u5207\u6362\u601D\u8003\u7B49\u7EA7",
    "thinking level": "\u601D\u8003\u7B49\u7EA7",
    "thinking": "\u601D\u8003",
    "abort": "\u4E2D\u65AD",
    "cancel": "\u53D6\u6D88",
    "Cancel": "\u53D6\u6D88",
    "select": "\u9009\u62E9",
    "Select": "\u9009\u62E9",
    "confirm": "\u786E\u8BA4",
    "Confirm": "\u786E\u8BA4",
    "change": "\u66F4\u6539",
    "search": "\u641C\u7D22",
    "expand": "\u5C55\u5F00",
    "collapse": "\u6298\u53E0",
    "details": "\u8BE6\u60C5",
    "tree": "\u5206\u652F\u6811",
    "fork": "\u5206\u53C9",
    "delete": "\u5220\u9664",
    "rename": "\u91CD\u547D\u540D",
    "exit": "\u9000\u51FA",
    "help": "\u5E2E\u52A9",
    "refresh": "\u5237\u65B0",
    "toggle": "\u5207\u6362",
    "back": "\u8FD4\u56DE",
    "new line": "\u6362\u884C",
    "send message": "\u53D1\u9001\u6D88\u606F",
    // Loaders and thinking indicators
    "Thinking...": "\u6B63\u5728\u6DF1\u5EA6\u601D\u8003...",
    "Working...": "\u6B63\u5728\u5904\u7406\u4EFB\u52A1...",
    "Compacting...": "\u6B63\u5728\u538B\u7F29\u4F1A\u8BDD\u4E0A\u4E0B\u6587...",
    "Streaming...": "\u6B63\u5728\u751F\u6210\u56DE\u7B54...",
    "Executing...": "\u6B63\u5728\u6267\u884C\u4E2D...",
    "Loading...": "\u6B63\u5728\u52A0\u8F7D...",
    // Footer & token usage
    "tokens": "\u4EE3\u5E01",
    "cost": "\u8D39\u7528",
    "context": "\u4E0A\u4E0B\u6587",
    "branch": "\u5206\u652F",
    "cache read": "\u7F13\u5B58\u547D\u4E2D",
    "cache write": "\u5199\u5165\u7F13\u5B58",
    "total": "\u603B\u8BA1",
    "Session:": "\u4F1A\u8BDD:",
    "Model:": "\u6A21\u578B:",
    // Tool execution status
    "Running...": "\u6B63\u5728\u6267\u884C...",
    "Read file": "\u8BFB\u53D6\u6587\u4EF6",
    "Write file": "\u5199\u5165\u6587\u4EF6",
    "Edit file": "\u7F16\u8F91\u6587\u4EF6",
    "Bash command": "\u7EC8\u7AEF\u547D\u4EE4",
    "Find files": "\u67E5\u627E\u6587\u4EF6",
    "Search files": "\u641C\u7D22\u6587\u4EF6\u5185\u5BB9",
    "List directory": "\u5217\u51FA\u76EE\u5F55\u5185\u5BB9",
    "Delegate task": "\u59D4\u6D3E\u5B50\u4EFB\u52A1",
    "Sub-agent": "\u5B50\u4EE3\u7406\u534F\u540C",
    "Executed in": "\u6267\u884C\u8017\u65F6",
    "Exit code": "\u9000\u51FA\u7801",
    "Lines changed": "\u6539\u52A8\u884C\u6570",
    // Dialog & Selector hints
    "Type to search \xB7 Enter/Space to change \xB7 Esc to cancel": "\u8F93\u5165\u641C\u7D22 \xB7 \u56DE\u8F66/\u7A7A\u683C\u4FEE\u6539 \xB7 Esc\u53D6\u6D88",
    "Enter/Space to change \xB7 Esc to cancel": "\u56DE\u8F66/\u7A7A\u683C\u4FEE\u6539 \xB7 Esc\u53D6\u6D88",
    "No matching commands": "\u672A\u627E\u5230\u5339\u914D\u7684\u547D\u4EE4",
    "No matching settings": "\u672A\u627E\u5230\u5339\u914D\u7684\u8BBE\u7F6E",
    "No matching models": "\u672A\u627E\u5230\u5339\u914D\u7684\u6A21\u578B",
    "No matching providers": "\u672A\u627E\u5230\u5339\u914D\u7684\u63D0\u4F9B\u5546",
    "No settings available": "\u6682\u65E0\u53EF\u7528\u8BBE\u7F6E\u9879",
    "No providers available": "\u672A\u627E\u5230\u53EF\u7528\u63D0\u4F9B\u5546",
    "Select provider to configure:": "\u9009\u62E9\u8981\u914D\u7F6E\u7684\u63D0\u4F9B\u5546\uFF1A",
    "Select provider to logout:": "\u9009\u62E9\u8981\u6CE8\u9500\u7684\u63D0\u4F9B\u5546\uFF1A",
    // Settings Selector options
    "Theme": "\u754C\u9762\u4E3B\u9898",
    "Automatic Theme": "\u8DDF\u968F\u7CFB\u7EDF\u4E3B\u9898",
    "Dark Theme": "\u6DF1\u8272\u6697\u9ED1\u4E3B\u9898",
    "Light Theme": "\u660E\u4EAE\u6D45\u8272\u4E3B\u9898",
    "Always trust": "\u59CB\u7EC8\u4FE1\u4EFB",
    "Never trust": "\u4ECE\u4E0D\u4FE1\u4EFB",
    "No reasoning": "\u5173\u95ED\u6DF1\u5EA6\u601D\u8003 (0)",
    "Maximum reasoning": "\u6700\u5927\u6DF1\u5EA6\u601D\u8003",
    "Model Configuration": "\u6A21\u578B\u9AD8\u7EA7\u914D\u7F6E",
    "Model unavailable": "\u5F53\u524D\u6A21\u578B\u4E0D\u53EF\u7528",
    "Project trust": "\u9879\u76EE\u7EA7\u5B89\u5168\u6027\u4FE1\u4EFB",
    "Extensions": "\u6269\u5C55\u7A0B\u5E8F (Extensions)",
    "Skills": "\u6280\u80FD\u5217\u8868 (Skills)",
    "Prompts": "\u63D0\u793A\u8BCD\u6A21\u677F (Prompts)",
    "Themes": "\u4E3B\u9898\u914D\u8272 (Themes)",
    "User settings": "\u5168\u5C40\u7528\u6237\u8BBE\u7F6E",
    "Project settings": "\u9879\u76EE\u672C\u5730\u8BBE\u7F6E",
    // Session Selector
    "Resume Session (Current Folder)": "\u6062\u590D\u4F1A\u8BDD\uFF08\u5F53\u524D\u5DE5\u4F5C\u533A\uFF09",
    "Resume Session (All)": "\u6062\u590D\u4F1A\u8BDD\uFF08\u6240\u6709\u5386\u53F2\uFF09",
    "Fork from Message": "\u4ECE\u8BE5\u6D88\u606F\u8282\u70B9\u5206\u53C9",
    "Session moved to trash": "\u4F1A\u8BDD\u5DF2\u79FB\u81F3\u56DE\u6536\u7AD9",
    // oh-my-pi specific
    "oh-my-pi: degraded": "oh-my-pi: \u964D\u7EA7\u6A21\u5F0F (degraded)",
    "Hot-reload oh-my-pi config without restarting Pi": "\u70ED\u91CD\u8F7D oh-my-pi \u914D\u7F6E\u6587\u4EF6\uFF08\u65E0\u9700\u91CD\u542F Pi\uFF09",
    "Diagnose oh-my-pi installation health": "\u8BCA\u65AD oh-my-pi \u5B89\u88C5\u8FD0\u884C\u72B6\u6001\u4E0E\u5065\u5EB7\u5EA6"
  },
  patterns: [
    // oh-my-pi status in footer: oh-my-pi: 3 agents, 2 skills
    {
      regex: /oh-my-pi:\s*(\d+)\s*agents?,\s*(\d+)\s*skills?/g,
      replacement: (_match, agents, skills) => `oh-my-pi: ${agents} \u4E2A\u667A\u80FD\u4F53, ${skills} \u4E2A\u6280\u80FD`
    },
    // Executed in 123ms
    {
      regex: /Executed in\s+(\d+(?:\.\d+)?(?:ms|s))/g,
      replacement: "\u6267\u884C\u8017\u65F6 $1"
    },
    // Branch summary (X commits, Y files)
    {
      regex: /Branch summary\s*\(([^)]+)\)/g,
      replacement: "\u5206\u652F\u53D8\u66F4\u6458\u8981 ($1)"
    },
    // Response was truncated before completion
    {
      regex: /Response was truncated before completion/g,
      replacement: "\u56DE\u590D\u5728\u5B8C\u6210\u524D\u88AB\u622A\u65AD"
    }
  ],
  keyHints: {
    "switch model": "\u5207\u6362\u6A21\u578B",
    "switch provider": "\u5207\u6362\u63D0\u4F9B\u5546",
    "thinking": "\u601D\u8003",
    "abort": "\u4E2D\u65AD",
    "cancel": "\u53D6\u6D88",
    "select": "\u9009\u62E9",
    "confirm": "\u786E\u8BA4",
    "search": "\u641C\u7D22",
    "expand": "\u5C55\u5F00",
    "collapse": "\u6298\u53E0",
    "details": "\u8BE6\u60C5",
    "tree": "\u5206\u652F\u6811",
    "fork": "\u5206\u53C9",
    "delete": "\u5220\u9664",
    "rename": "\u91CD\u547D\u540D"
  },
  footer: {
    "tokens": "\u4EE3\u5E01",
    "cost": "\u8D39\u7528",
    "context": "\u4E0A\u4E0B\u6587",
    "branch": "\u5206\u652F"
  },
  loaders: {
    "Thinking...": "\u6B63\u5728\u6DF1\u5EA6\u601D\u8003...",
    "Working...": "\u6B63\u5728\u5904\u7406\u4EFB\u52A1...",
    "Compacting...": "\u6B63\u5728\u538B\u7F29\u4E0A\u4E0B\u6587...",
    "Streaming...": "\u6B63\u5728\u751F\u6210\u56DE\u7B54..."
  },
  tools: {
    "Read file": "\u8BFB\u53D6\u6587\u4EF6",
    "Write file": "\u5199\u5165\u6587\u4EF6",
    "Edit file": "\u7F16\u8F91\u6587\u4EF6",
    "Bash command": "\u7EC8\u7AEF\u547D\u4EE4",
    "Find files": "\u67E5\u627E\u6587\u4EF6",
    "Search files": "\u641C\u7D22\u6587\u4EF6"
  },
  dialogs: {
    "Confirm": "\u786E\u8BA4",
    "Cancel": "\u53D6\u6D88",
    "Close": "\u5173\u95ED",
    "Done": "\u5B8C\u6210"
  },
  omp: {
    "oh-my-pi: degraded": "oh-my-pi: \u964D\u7EA7\u6A21\u5F0F",
    "agents": "\u4E2A\u667A\u80FD\u4F53",
    "skills": "\u4E2A\u6280\u80FD"
  }
};

// src/locales/index.ts
function getTuiDictionary(locale = "zh-CN", customDict) {
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

// src/tui/text-localizer.ts
var TuiTextLocalizer = class {
  dictionary;
  sortedPhrases;
  constructor(dictionary) {
    this.dictionary = dictionary;
    this.sortedPhrases = Object.entries(dictionary.phrases).sort(
      (a, b) => b[0].length - a[0].length
    );
  }
  setDictionary(dictionary) {
    this.dictionary = dictionary;
    this.sortedPhrases = Object.entries(dictionary.phrases).sort(
      (a, b) => b[0].length - a[0].length
    );
  }
  /**
   * Localize a single string (exact match or partial replacements).
   */
  localizeText(text) {
    if (!text || typeof text !== "string") return text;
    const exact = this.dictionary.phrases[text];
    if (exact) return exact;
    let result = text;
    for (const p of this.dictionary.patterns) {
      if (p.regex.test(result)) {
        result = result.replace(p.regex, p.replacement);
      }
    }
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
  localizeLine(line) {
    if (!line || typeof line !== "string" || line.trim() === "") {
      return line;
    }
    let result = line;
    for (const p of this.dictionary.patterns) {
      result = result.replace(p.regex, p.replacement);
    }
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
  localizeLines(lines) {
    return lines.map((l) => this.localizeLine(l));
  }
};

// src/tui/patcher.ts
var TuiPatcher = class {
  localizer;
  isPatched = false;
  originalMethods = /* @__PURE__ */ new Map();
  constructor(options) {
    this.localizer = options.localizer;
  }
  /**
   * Attempt to dynamically patch @earendil-works/pi-tui classes
   */
  async patchPiTui() {
    if (this.isPatched) return true;
    try {
      let piTui = null;
      try {
        piTui = await import("@oh-my-pi/pi-tui");
      } catch {
        try {
          piTui = await import("@earendil-works/pi-tui");
        } catch {
          try {
            const globalTuiPath = "file:///C:/Users/Xeltra/AppData/Roaming/npm/node_modules/@earendil-works/pi-coding-agent/node_modules/@earendil-works/pi-tui/dist/index.js";
            piTui = await import(globalTuiPath);
          } catch {
          }
        }
      }
      if (!piTui) {
        logger.debug("pi-tui not found in current environment, skipping class patching.");
        return false;
      }
      if (piTui.Text?.prototype?.render) {
        this.saveOriginal(piTui.Text.prototype, "render");
        const origRender = piTui.Text.prototype.render;
        const localizer = this.localizer;
        piTui.Text.prototype.render = function(width) {
          const lines = origRender.call(this, width);
          return localizer.localizeLines(lines);
        };
      }
      if (piTui.TuiMainScreen?.prototype?.doRender) {
        this.saveOriginal(piTui.TuiMainScreen.prototype, "doRender");
        const origDoRender = piTui.TuiMainScreen.prototype.doRender;
        const localizer = this.localizer;
        piTui.TuiMainScreen.prototype.doRender = function() {
          return origDoRender.call(this);
        };
      }
      if (piTui.SelectList?.prototype?.render) {
        this.saveOriginal(piTui.SelectList.prototype, "render");
        const origSelectRender = piTui.SelectList.prototype.render;
        const localizer = this.localizer;
        piTui.SelectList.prototype.render = function(width) {
          const lines = origSelectRender.call(this, width);
          return localizer.localizeLines(lines);
        };
      }
      if (piTui.SettingsList?.prototype?.renderMainList) {
        this.saveOriginal(piTui.SettingsList.prototype, "renderMainList");
        const origSettingsRender = piTui.SettingsList.prototype.renderMainList;
        const localizer = this.localizer;
        piTui.SettingsList.prototype.renderMainList = function(width) {
          const lines = origSettingsRender.call(this, width);
          return localizer.localizeLines(lines);
        };
      }
      this.isPatched = true;
      logger.info("Successfully patched pi-tui components with Chinese localization.");
      return true;
    } catch (err) {
      logger.warn(`Failed to patch pi-tui: ${String(err)}`);
      return false;
    }
  }
  /**
   * Wrap ctx.ui methods to localize dynamic TUI interactions
   */
  wrapExtensionUI(ui) {
    if (!ui) return;
    if (typeof ui.setStatus === "function") {
      const origSetStatus = ui.setStatus.bind(ui);
      ui.setStatus = (key, text) => {
        if (text) {
          const localized = this.localizer.localizeText(text);
          return origSetStatus(key, localized);
        }
        return origSetStatus(key, text);
      };
    }
    if (typeof ui.setWorkingMessage === "function") {
      const origSetWorkingMessage = ui.setWorkingMessage.bind(ui);
      ui.setWorkingMessage = (msg) => {
        if (msg) {
          return origSetWorkingMessage(this.localizer.localizeText(msg));
        }
        return origSetWorkingMessage(msg);
      };
    }
    if (typeof ui.setHiddenThinkingLabel === "function") {
      const origSetHiddenThinking = ui.setHiddenThinkingLabel.bind(ui);
      ui.setHiddenThinkingLabel = (label) => {
        if (label) {
          return origSetHiddenThinking(this.localizer.localizeText(label));
        }
        return origSetHiddenThinking(label);
      };
    }
    if (typeof ui.select === "function") {
      const origSelect = ui.select.bind(ui);
      ui.select = async (title, options, opts) => {
        const localizedTitle = this.localizer.localizeText(title);
        const localizedOptions = options.map((opt) => this.localizer.localizeText(opt));
        return origSelect(localizedTitle, localizedOptions, opts);
      };
    }
    if (typeof ui.confirm === "function") {
      const origConfirm = ui.confirm.bind(ui);
      ui.confirm = async (title, message, opts) => {
        const localizedTitle = this.localizer.localizeText(title);
        const localizedMessage = this.localizer.localizeText(message);
        return origConfirm(localizedTitle, localizedMessage, opts);
      };
    }
    if (typeof ui.input === "function") {
      const origInput = ui.input.bind(ui);
      ui.input = async (title, placeholder, opts) => {
        const localizedTitle = this.localizer.localizeText(title);
        const localizedPlaceholder = placeholder ? this.localizer.localizeText(placeholder) : placeholder;
        return origInput(localizedTitle, localizedPlaceholder, opts);
      };
    }
    if (typeof ui.notify === "function") {
      const origNotify = ui.notify.bind(ui);
      ui.notify = (message, type) => {
        const localizedMsg = this.localizer.localizeText(message);
        return origNotify(localizedMsg, type);
      };
    }
  }
  /**
   * Restore original methods (for unpatching/testing)
   */
  restore() {
    for (const [target, methods] of this.originalMethods.entries()) {
      for (const [prop, orig] of methods.entries()) {
        target[prop] = orig;
      }
    }
    this.originalMethods.clear();
    this.isPatched = false;
  }
  saveOriginal(target, prop) {
    if (!this.originalMethods.has(target)) {
      this.originalMethods.set(target, /* @__PURE__ */ new Map());
    }
    const map = this.originalMethods.get(target);
    if (!map.has(prop)) {
      map.set(prop, target[prop]);
    }
  }
};

// src/extension.ts
async function ohMyPiZh(pi) {
  let config = loadConfig();
  const dict = getTuiDictionary(config.locale, config.customDictionary);
  const localizer = new TuiTextLocalizer(dict);
  const patcher = new TuiPatcher({ localizer });
  logger.debug("oh-my-pi-zh TUI extension initializing...");
  pi.on("session_start", async (_event, ctx) => {
    try {
      config = loadConfig(ctx?.cwd || process.cwd());
      localizer.setDictionary(getTuiDictionary(config.locale, config.customDictionary));
      if (config.enabled) {
        await patcher.patchPiTui();
        if (ctx?.ui) {
          patcher.wrapExtensionUI(ctx.ui);
          if (config.features.statusIndicator && typeof ctx.ui.setStatus === "function") {
            ctx.ui.setStatus("oh-my-pi-zh", "\u{1F1E8}\u{1F1F3} TUI:\u4E2D\u6587");
          }
        }
      }
    } catch (err) {
      logger.warn(`Failed in session_start: ${String(err)}`);
    }
  });
  if (typeof pi.registerMarkdownTransformer === "function") {
    pi.registerMarkdownTransformer((markdown, { isStreaming }) => {
      if (!config.enabled) return markdown;
      if (isStreaming) return markdown;
      return localizer.localizeText(markdown);
    });
  }
  pi.on("session_shutdown", () => {
    patcher.restore();
    logger.debug("oh-my-pi-zh TUI session ended and unpatched.");
  });
  if (config.features.registerCommands) {
    const handleCommand = async (argsStr, ctx) => {
      const args = (argsStr || "").trim().split(/\s+/);
      const sub = args[0]?.toLowerCase() || "status";
      switch (sub) {
        case "on": {
          config.enabled = true;
          await patcher.patchPiTui();
          if (ctx?.ui) {
            patcher.wrapExtensionUI(ctx.ui);
            ctx.ui.setStatus?.("oh-my-pi-zh", "\u{1F1E8}\u{1F1F3} TUI:\u4E2D\u6587");
          }
          const msg = "\u2705 oh-my-pi TUI \u4E2D\u6587\u6C49\u5316\u5DF2\u542F\u7528";
          ctx?.ui?.notify ? ctx.ui.notify(msg, "info") : console.log(msg);
          break;
        }
        case "off": {
          config.enabled = false;
          patcher.restore();
          if (ctx?.ui) {
            ctx.ui.setStatus?.("oh-my-pi-zh", void 0);
          }
          const msg = "\u26AA oh-my-pi TUI \u6C49\u5316\u5DF2\u505C\u7528\uFF0C\u6062\u590D\u82F1\u6587\u539F\u751F\u754C\u9762";
          ctx?.ui?.notify ? ctx.ui.notify(msg, "info") : console.log(msg);
          break;
        }
        case "doctor": {
          const lines = [
            "# \u{1F50D} oh-my-pi-zh \u7EC8\u7AEF TUI \u6C49\u5316\u4F53\u68C0\u8BCA\u65AD\u62A5\u544A",
            "",
            `- **TUI \u6C49\u5316\u72B6\u6001**: ${config.enabled ? "\u2705 \u5DF2\u542F\u7528" : "\u26AA \u5DF2\u505C\u7528"}`,
            `- **\u5F53\u524D\u754C\u9762\u8BED\u8A00**: ${config.locale}`,
            `- **\u72B6\u6001\u680F\u6307\u793A\u5668**: ${config.features.statusIndicator ? "\u5DF2\u6FC0\u6D3B" : "\u672A\u6FC0\u6D3B"}`,
            `- **Markdown \u53D8\u6362\u5668**: ${typeof pi.registerMarkdownTransformer === "function" ? "\u5DF2\u5C31\u7EEA" : "\u672A\u63D0\u4F9B"}`,
            "",
            "\u{1F4A1} \u63D0\u793A\uFF1A\u53EF\u901A\u8FC7 `/oh-my-pi-zh on` \u6216 `/oh-my-pi-zh off` \u968F\u65F6\u65E0\u7F1D\u5207\u6362\u4E2D\u82F1\u6587\u7EC8\u7AEF\u754C\u9762\u3002"
          ];
          const report = lines.join("\n");
          ctx?.ui?.notify ? ctx.ui.notify(report, "info") : console.log(report);
          break;
        }
        case "status":
        default: {
          const msg = `[oh-my-pi-zh v${config.version || "0.1.0"}] TUI \u7EC8\u7AEF\u6C49\u5316\u72B6\u6001: ${config.enabled ? "\u5DF2\u5F00\u542F" : "\u5DF2\u5173\u95ED"} | \u8BED\u8A00: ${config.locale}`;
          ctx?.ui?.notify ? ctx.ui.notify(msg, "info") : console.log(msg);
          break;
        }
      }
    };
    pi.registerCommand("oh-my-pi-zh", {
      description: "\u7BA1\u7406 oh-my-pi \u7EC8\u7AEF TUI \u4E2D\u6587\u6C49\u5316\u72B6\u6001 (/oh-my-pi-zh [status|on|off|doctor])",
      handler: handleCommand
    });
    pi.registerCommand("omp-zh", {
      description: "oh-my-pi-zh \u5FEB\u6377\u522B\u540D",
      handler: handleCommand
    });
  }
}

// src/index.ts
var index_default = ohMyPiZh;
export {
  TuiPatcher,
  TuiTextLocalizer,
  index_default as default,
  getTuiDictionary,
  loadConfig,
  mergeConfig,
  ohMyPiZh,
  tuiZhCN
};

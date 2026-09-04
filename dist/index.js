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
    statusIndicator: false
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
    version: "0.2.0"
  },
  phrases: {
    // 1. Welcome Screen & OMP Brand Elements
    "Welcome back!": "\u6B22\u8FCE\u56DE\u6765\uFF01",
    "Tips": "\u5C0F\u63D0\u793A",
    " for prompt actions": " \u63D0\u793A\u8BCD\u52A8\u4F5C",
    " for commands": " \u659C\u6760\u547D\u4EE4",
    " to run bash": " \u6267\u884C\u7EC8\u7AEF\u547D\u4EE4",
    " to run python": " \u8FD0\u884C Python \u811A\u672C",
    "LSP Servers": "\u8BED\u8A00\u670D\u52A1\u5668 (LSP)",
    "No LSP servers": "\u672A\u8FDE\u63A5\u8BED\u8A00\u670D\u52A1\u5668",
    "Recent sessions": "\u6700\u8FD1\u5386\u53F2\u4F1A\u8BDD",
    "No recent sessions": "\u6682\u65E0\u5386\u53F2\u4F1A\u8BDD",
    "Please use nerdfont \u{1F62D}.": "\u8BF7\u4F7F\u7528 Nerd \u5B57\u4F53 \u{1F62D}\u3002",
    // 2. Warnings & System Notices
    "Update Available": "\u53D1\u73B0\u65B0\u7248\u672C",
    "Run: omp update": "\u8FD0\u884C: omp update",
    "New version of omp is available": "\u53D1\u73B0 omp \u65B0\u7248\u672C\u53EF\u7528",
    "No models available": "\u6CA1\u6709\u53EF\u7528\u6A21\u578B",
    "Warning: No models available": "\u8B66\u544A\uFF1A\u6CA1\u6709\u53EF\u7528\u6A21\u578B",
    "Warning: No models available. Configure a provider using /provider or check your API keys.": "\u8B66\u544A\uFF1A\u6CA1\u6709\u53EF\u7528\u6A21\u578B\u3002\u8BF7\u4F7F\u7528 /provider \u914D\u7F6E\u63D0\u4F9B\u5546\u6216\u68C0\u67E5 API \u5BC6\u94A5\u3002",
    "Warning: No models available. Use /login or set an API key environment variable. Then use /model to select a model.": "\u8B66\u544A\uFF1A\u6CA1\u6709\u53EF\u7528\u6A21\u578B\u3002\u8BF7\u4F7F\u7528 /login \u767B\u5F55\u6216\u8BBE\u7F6E API \u5BC6\u94A5\u73AF\u5883\u53D8\u91CF\uFF0C\u7136\u540E\u4F7F\u7528 /model \u9009\u62E9\u6A21\u578B\u3002",
    "No models available. Use /login or set an API key environment variable. Then use /model to select a model.": "\u6CA1\u6709\u53EF\u7528\u6A21\u578B\u3002\u8BF7\u4F7F\u7528 /login \u767B\u5F55\u6216\u8BBE\u7F6E API \u5BC6\u94A5\u73AF\u5883\u53D8\u91CF\uFF0C\u7136\u540E\u4F7F\u7528 /model \u9009\u62E9\u6A21\u578B\u3002",
    "No models available. Set API keys in environment variables.": "\u6CA1\u6709\u53EF\u7528\u6A21\u578B\u3002\u8BF7\u5728\u73AF\u5883\u53D8\u91CF\u4E2D\u8BBE\u7F6E\u5BF9\u5E94\u7684 API \u5BC6\u94A5\u3002",
    "Set an API key environment variable:": "\u8BF7\u8BBE\u7F6E\u5BF9\u5E94\u7684 API \u5BC6\u94A5\u73AF\u5883\u53D8\u91CF\uFF1A",
    "Configure auth for an allowed provider or adjust enabledModels.": "\u8BF7\u4E3A\u5141\u8BB8\u7684\u63D0\u4F9B\u5546\u914D\u7F6E\u8BA4\u8BC1\u6216\u8C03\u6574 enabledModels \u8BBE\u7F6E\u3002",
    // 3. Keybinding descriptions
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
    // 4. Loaders and thinking indicators
    "Thinking...": "\u6B63\u5728\u6DF1\u5EA6\u601D\u8003...",
    "Working...": "\u6B63\u5728\u5904\u7406\u4EFB\u52A1...",
    "Compacting...": "\u6B63\u5728\u538B\u7F29\u4F1A\u8BDD\u4E0A\u4E0B\u6587...",
    "Streaming...": "\u6B63\u5728\u751F\u6210\u56DE\u7B54...",
    "Executing...": "\u6B63\u5728\u6267\u884C\u4E2D...",
    "Loading...": "\u6B63\u5728\u52A0\u8F7D...",
    // 5. Footer & token usage
    "tokens": "\u4EE3\u5E01",
    "cost": "\u8D39\u7528",
    "context": "\u4E0A\u4E0B\u6587",
    "branch": "\u5206\u652F",
    "cache read": "\u7F13\u5B58\u547D\u4E2D",
    "cache write": "\u5199\u5165\u7F13\u5B58",
    "total": "\u603B\u8BA1",
    "Session:": "\u4F1A\u8BDD:",
    "Model:": "\u6A21\u578B:",
    // 6. Tool execution status
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
    // 7. Dialog & Selector hints
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
    // 8. Settings Selector options
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
    // 9. Session Selector
    "Resume Session (Current Folder)": "\u6062\u590D\u4F1A\u8BDD\uFF08\u5F53\u524D\u5DE5\u4F5C\u533A\uFF09",
    "Resume Session (All)": "\u6062\u590D\u4F1A\u8BDD\uFF08\u6240\u6709\u5386\u53F2\uFF09",
    "Fork from Message": "\u4ECE\u8BE5\u6D88\u606F\u8282\u70B9\u5206\u53C9",
    "Session moved to trash": "\u4F1A\u8BDD\u5DF2\u79FB\u81F3\u56DE\u6536\u7AD9",
    // 10. Slash commands autocomplete descriptions (Full OMP Suite)
    "Add a workspace directory to this session (multi-root)": "\u5C06\u5DE5\u4F5C\u533A\u76EE\u5F55\u6DFB\u52A0\u5230\u5F53\u524D\u4F1A\u8BDD\uFF08\u591A\u6839\u76EE\u5F55\uFF09",
    "Ask an ephemeral side question using the current session context": "\u5728\u5F53\u524D\u4F1A\u8BDD\u4E0A\u4E0B\u6587\u4E2D\u63D2\u5165\u4E34\u65F6\u65C1\u652F\u63D0\u95EE",
    "Clear the conversation context in place, keeping the session": "\u6E05\u7A7A\u5F53\u524D\u5BF9\u8BDD\u4E0A\u4E0B\u6587\u5E76\u4FDD\u7559\u4F1A\u8BDD",
    "Copy session transcript to clipboard (and write LLM request JSON to tmp)": "\u590D\u5236\u4F1A\u8BDD\u5BF9\u8BDD\u8BB0\u5F55\u5230\u526A\u8D34\u677F\uFF08\u5E76\u5C06 LLM \u8BF7\u6C42 JSON \u5199\u5165\u4E34\u65F6\u76EE\u5F55\uFF09",
    "Create a new fork from a previous message": "\u4ECE\u6307\u5B9A\u5386\u53F2\u6D88\u606F\u521B\u5EFA\u65B0\u7684\u5206\u53C9",
    "Delete the current session and start a new one": "\u5220\u9664\u5F53\u524D\u4F1A\u8BDD\u5E76\u5F00\u542F\u65B0\u4F1A\u8BDD",
    "Detect and fix project diagnostics with weighted parallel subagents": "\u4F7F\u7528\u52A0\u6743\u5E76\u884C\u5B50\u4EE3\u7406\u68C0\u6D4B\u5E76\u4FEE\u590D\u9879\u76EE\u8BCA\u65AD\u62A5\u9519",
    "Drop heavy content from context (tool results, large blocks)": "\u4ECE\u4E0A\u4E0B\u6587\u4E2D\u5254\u9664\u6C89\u91CD\u5185\u5BB9\uFF08\u5DE5\u5177\u7ED3\u679C\u3001\u5927\u6587\u672C\u5757\uFF09",
    "Exit the application": "\u9000\u51FA\u5E94\u7528\u7A0B\u5E8F",
    "Export session to HTML file": "\u5C06\u5F53\u524D\u4F1A\u8BDD\u5BFC\u51FA\u4E3A HTML \u6587\u4EF6",
    "Force next turn to use a specific tool": "\u5F3A\u5236\u4E0B\u4E00\u56DE\u5408\u8C03\u7528\u6307\u5B9A\u5DE5\u5177",
    "Forge a TTSR rule from a complaint to stop a recurring behavior": "\u4ECE\u6279\u8BC4\u4E2D\u63D0\u70BC\u56FA\u5316 TTSR \u89C4\u5219\uFF0C\u9632\u6B62\u6A21\u578B\u91CD\u8E48\u8986\u8F99",
    "Freeze all agents (main, subagents, advisor) until resumed": "\u51BB\u7ED3\u6240\u6709\u667A\u80FD\u4F53\uFF08\u4E3B\u4EE3\u7406\u3001\u5B50\u4EE3\u7406\u3001\u987E\u95EE\uFF09\uFF0C\u76F4\u5230\u624B\u52A8\u6062\u590D",
    "Hand off session context to a new session": "\u5C06\u5F53\u524D\u4F1A\u8BDD\u4E0A\u4E0B\u6587\u79FB\u4EA4\u81F3\u65B0\u4F1A\u8BDD",
    "Have the agent interview you in chat, then set up goal mode": "\u8BA9\u667A\u80FD\u4F53\u5728\u5BF9\u8BDD\u4E2D\u5411\u4F60\u8BBF\u8C08\u63D0\u95EE\uFF0C\u968F\u540E\u8FDB\u5165\u76EE\u6807\u5BFC\u5411\u6A21\u5F0F",
    "Inspect and operate memory maintenance": "\u68C0\u67E5\u5E76\u6267\u884C\u957F\u6548\u8BB0\u5FC6\u7EF4\u62A4",
    "Join a shared collab session": "\u52A0\u5165\u5B9E\u65F6\u5171\u4EAB\u534F\u4F5C\u4F1A\u8BDD",
    "Launch the local stats dashboard": "\u542F\u52A8\u672C\u5730\u7EDF\u8BA1\u5206\u6790\u770B\u677F",
    "Leave the collab session": "\u79BB\u5F00\u5F53\u524D\u5171\u4EAB\u534F\u4F5C\u4F1A\u8BDD",
    "List this session's workspace directories": "\u5217\u51FA\u5F53\u524D\u4F1A\u8BDD\u7684\u6240\u6709\u5DE5\u4F5C\u533A\u76EE\u5F55",
    "Login with OAuth provider": "\u4F7F\u7528 OAuth \u63D0\u4F9B\u5546\u767B\u5F55\u6388\u6743",
    "Logout from OAuth provider": "\u6CE8\u9500 OAuth \u63D0\u4F9B\u5546\u767B\u5F55\u72B6\u6001",
    "Manage MCP servers (add, list, remove, test)": "\u7BA1\u7406 MCP \u670D\u52A1\uFF08\u6DFB\u52A0\u3001\u5217\u51FA\u3001\u79FB\u9664\u3001\u6D4B\u8BD5\uFF09",
    "Manage SSH hosts (add, list, remove)": "\u7BA1\u7406 SSH \u4E3B\u673A\uFF08\u6DFB\u52A0\u3001\u5217\u51FA\u3001\u79FB\u9664\uFF09",
    "Manage marketplace plugin sources and installed plugins": "\u7BA1\u7406\u63D2\u4EF6\u5E02\u573A\u6E90\u4E0E\u5DF2\u5B89\u88C5\u63D2\u4EF6",
    "Manually compact the session context": "\u624B\u52A8\u538B\u7F29\u5F53\u524D\u4F1A\u8BDD\u4E0A\u4E0B\u6587",
    "Move the current session to a different directory": "\u5C06\u5F53\u524D\u4F1A\u8BDD\u79FB\u52A8\u81F3\u5176\u4ED6\u5DE5\u4F5C\u76EE\u5F55",
    "Move this session into a new worktree, changes included": "\u5C06\u5F53\u524D\u4F1A\u8BDD\u79FB\u52A8\u81F3\u65B0\u7684 Git worktree\uFF08\u5305\u542B\u672A\u63D0\u4EA4\u66F4\u6539\uFF09",
    "Navigate session tree (switch branches)": "\u6D4F\u89C8\u4F1A\u8BDD\u5386\u53F2\u5206\u652F\u6811\uFF08\u5207\u6362\u5206\u652F\uFF09",
    "Open Extension Control Center dashboard": "\u6253\u5F00\u6269\u5C55\u63A7\u5236\u4E2D\u5FC3\u4EEA\u8868\u76D8",
    "Open debug tools selector": "\u6253\u5F00\u8C03\u8BD5\u5DE5\u5177\u9009\u62E9\u5668",
    "Open provider setup": "\u6253\u5F00\u63D0\u4F9B\u5546\u914D\u7F6E\u5411\u5BFC",
    "Open settings menu": "\u6253\u5F00\u7528\u6237\u8BBE\u7F6E\u83DC\u5355",
    "Open the agents hub (per-agent model, prewalk, and advisor)": "\u6253\u5F00\u667A\u80FD\u4F53\u63A7\u5236\u4E2D\u5FC3\uFF08\u591A\u4EE3\u7406\u6A21\u578B\u3001\u524D\u7F6E\u904D\u5386\u4E0E\u987E\u95EE\uFF09",
    "Open the git UI (split diff viewer, staging, commit composer)": "\u6253\u5F00 Git \u4EA4\u4E92\u754C\u9762\uFF08\u5206\u5C4F Diff \u67E5\u770B\u3001\u6682\u5B58\u3001\u63D0\u4EA4\u7F16\u5199\uFF09",
    "Open the last link from the conversation in your browser (or pick one with /copy)": "\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u5BF9\u8BDD\u4E2D\u7684\u6700\u65B0\u94FE\u63A5\uFF08\u6216\u4F7F\u7528 /copy \u9009\u62E9\uFF09",
    "Open the live Agent Hub": "\u6253\u5F00\u5B9E\u65F6\u667A\u80FD\u4F53\u4E2D\u5FC3",
    "Open this session's trace in the stats dashboard": "\u5728\u7EDF\u8BA1\u770B\u677F\u4E2D\u6253\u5F00\u5F53\u524D\u4F1A\u8BDD\u7684\u8C03\u7528\u8FFD\u8E2A",
    "Pick text or code from the conversation to copy": "\u4ECE\u5BF9\u8BDD\u4E2D\u9009\u53D6\u6587\u672C\u6216\u4EE3\u7801\u590D\u5236\u5230\u526A\u8D34\u677F",
    "Pin or unpin a session at the top of the resume list": "\u5728\u4F1A\u8BDD\u6062\u590D\u5217\u8868\u9876\u90E8\u7F6E\u9876\u6216\u53D6\u6D88\u7F6E\u9876\u4F1A\u8BDD",
    "Plan, run, inspect, import, and compare OMP-native security scans": "\u89C4\u5212\u3001\u8FD0\u884C\u3001\u68C0\u67E5\u3001\u5BFC\u5165\u4E0E\u6BD4\u5BF9\u539F\u751F\u5B89\u5168\u626B\u63CF",
    "Queue a message for after the agent yields": "\u6392\u961F\u6D88\u606F\uFF0C\u5F85\u667A\u80FD\u4F53\u56DE\u5408\u7ED3\u675F\u540E\u53D1\u9001",
    "Quit the application": "\u9000\u51FA\u5E94\u7528\u7A0B\u5E8F",
    "Re-open the plan review for the latest plan (plan mode only)": "\u91CD\u65B0\u6253\u5F00\u6700\u65B0\u8BA1\u5212\u7684\u8BA1\u5212\u8BC4\u5BA1\uFF08\u4EC5\u9650\u8BA1\u5212\u6A21\u5F0F\uFF09",
    "Reload all plugins (skills, commands, hooks, tools, agents, MCP)": "\u91CD\u65B0\u52A0\u8F7D\u6240\u6709\u63D2\u4EF6\uFF08\u6280\u80FD\u3001\u547D\u4EE4\u3001\u94A9\u5B50\u3001\u5DE5\u5177\u3001\u4EE3\u7406\u3001MCP\uFF09",
    "Remove a workspace directory from this session": "\u4ECE\u5F53\u524D\u4F1A\u8BDD\u4E2D\u79FB\u9664\u5DE5\u4F5C\u533A\u76EE\u5F55",
    "Rename the current session": "\u91CD\u547D\u540D\u5F53\u524D\u4F1A\u8BDD",
    "Reset provider stream state without changing the local transcript": "\u91CD\u7F6E\u63D0\u4F9B\u5546\u6D41\u5F0F\u72B6\u6001\uFF08\u4E0D\u6539\u53D8\u672C\u5730\u5BF9\u8BDD\u8BB0\u5F55\uFF09",
    "Restart omp with the same launch flags, resuming this session": "\u4F7F\u7528\u76F8\u540C\u7684\u542F\u52A8\u53C2\u6570\u91CD\u542F omp \u5E76\u6062\u590D\u5F53\u524D\u4F1A\u8BDD",
    "Resume a different session": "\u6062\u590D\u5E76\u5207\u6362\u5230\u5176\u4ED6\u5386\u53F2\u4F1A\u8BDD",
    "Retry the last failed agent turn": "\u91CD\u8BD5\u4E0A\u4E00\u4E2A\u5931\u8D25\u7684\u667A\u80FD\u4F53\u56DE\u5408",
    "Rewind to a previous message, keeping the old path as a branch": "\u5012\u9000\u56DE\u5148\u524D\u7684\u67D0\u6761\u6D88\u606F\uFF0C\u65E7\u8DEF\u5F84\u4FDD\u7559\u4E3A\u72EC\u7ACB\u5206\u652F",
    "Run a full background agent on tangential work": "\u5728\u540E\u53F0\u542F\u52A8\u5B8C\u6574\u667A\u80FD\u4F53\u6267\u884C\u65C1\u652F\u884D\u751F\u4EFB\u52A1",
    "Session management commands": "\u4F1A\u8BDD\u7BA1\u7406\u7CFB\u5217\u547D\u4EE4",
    "Share session via an encrypted link (share server or secret gist)": "\u901A\u8FC7\u52A0\u5BC6\u94FE\u63A5\u5206\u4EAB\u4F1A\u8BDD\uFF08\u5206\u4EAB\u670D\u52A1\u5668\u6216\u673A\u5BC6 Gist\uFF09",
    "Share this session live via a relay": "\u901A\u8FC7\u4E2D\u7EE7\u670D\u52A1\u5668\u5B9E\u65F6\u5728\u7EBF\u5206\u4EAB\u6B64\u4F1A\u8BDD",
    "Show session info and stats": "\u663E\u793A\u4F1A\u8BDD\u8BE6\u7EC6\u4FE1\u606F\u4E0E\u7EDF\u8BA1\u6570\u636E",
    "Show tokens, context window usage, and limits": "\u663E\u793A Token \u4E0E\u4E0A\u4E0B\u6587\u7A97\u53E3\u4F7F\u7528\u60C5\u51B5\u53CA\u9650\u989D",
    "Show, add, or remove pinned credentials for this project": "\u67E5\u770B\u3001\u6DFB\u52A0\u6216\u79FB\u9664\u5F53\u524D\u9879\u76EE\u7684\u56FA\u5B9A\u51ED\u636E",
    "Start a new session": "\u5F00\u59CB\u4E00\u4E2A\u5168\u65B0\u7684\u7A7A\u4F1A\u8BDD",
    "Start Codex-backed realtime voice mode": "\u542F\u52A8\u57FA\u4E8E Codex \u7684\u5B9E\u65F6\u8BED\u97F3\u5BF9\u8BDD\u6A21\u5F0F",
    "Switch the active model or change its settings": "\u5207\u6362\u5F53\u524D\u6A21\u578B\u6216\u4FEE\u6539\u5176\u8BBE\u7F6E\u53C2\u6570",
    "Switch to a different provider": "\u5207\u6362\u81F3\u5176\u4ED6\u6A21\u578B\u63D0\u4F9B\u5546",
    "Toggle fast mode (low-latency completion defaults)": "\u5F00\u5173\u5FEB\u901F\u6A21\u5F0F\uFF08\u4F4E\u5EF6\u8FDF\u8865\u5168\u9ED8\u8BA4\u914D\u7F6E\uFF09",
    "Toggle goal mode (persistent autonomous objective for this session)": "\u5F00\u5173\u76EE\u6807\u5BFC\u5411\u6A21\u5F0F\uFF08\u5F53\u524D\u4F1A\u8BDD\u7684\u6301\u4E45\u81EA\u4E3B\u76EE\u6807\uFF09",
    "Toggle planning mode (requires approval before implementation)": "\u5F00\u5173\u89C4\u5212\u6A21\u5F0F\uFF08\u5B9E\u73B0\u524D\u987B\u7ECF\u65B9\u6848\u5BA1\u6279\uFF09",
    "Toggle the advisor (a second model that reviews each turn and injects notes)": "\u5F00\u5173\u987E\u95EE\u6A21\u578B\uFF08\u7B2C\u4E8C\u6A21\u578B\uFF0C\u6BCF\u56DE\u5408\u5BA1\u67E5\u5E76\u6CE8\u5165\u5EFA\u8BAE\uFF09",
    "Toggle vibe mode (direct persistent fast/good worker sessions; read-only toolset)": "\u5F00\u5173\u5373\u5174\u6A21\u5F0F (Vibe)\uFF08\u6301\u4E45\u9AD8\u6548\u5DE5\u4F5C\u6D41\uFF0C\u53EA\u8BFB\u5DE5\u5177\u96C6\uFF09",
    // Subcommands
    "Add an SSH host": "\u6DFB\u52A0 SSH \u4E3B\u673A",
    "List all configured SSH hosts": "\u5217\u51FA\u6240\u6709\u5DF2\u914D\u7F6E\u7684 SSH \u4E3B\u673A",
    "Remove an SSH host": "\u79FB\u9664 SSH \u4E3B\u673A",
    "Add a new MCP server": "\u6DFB\u52A0\u65B0\u7684 MCP \u670D\u52A1",
    "List all configured MCP servers": "\u5217\u51FA\u6240\u6709\u5DF2\u914D\u7F6E\u7684 MCP \u670D\u52A1",
    "Remove an MCP server": "\u79FB\u9664\u6307\u5B9A\u7684 MCP \u670D\u52A1",
    "Test connection to a server": "\u6D4B\u8BD5\u4E0E MCP \u670D\u52A1\u7684\u8FDE\u901A\u6027",
    "Reconnect to a specific MCP server": "\u91CD\u65B0\u8FDE\u63A5\u6307\u5B9A MCP \u670D\u52A1",
    "Force reload MCP runtime tools": "\u5F3A\u5236\u91CD\u65B0\u52A0\u8F7D MCP \u8FD0\u884C\u65F6\u5DE5\u5177",
    "Install a plugin (interactive browser if no args)": "\u5B89\u88C5\u63D2\u4EF6\uFF08\u65E0\u53C2\u6570\u65F6\u6253\u5F00\u4EA4\u4E92\u5F0F\u6D4F\u89C8\u9762\u677F\uFF09",
    "Uninstall a plugin (selector if no args)": "\u5378\u8F7D\u63D2\u4EF6\uFF08\u65E0\u53C2\u6570\u65F6\u6253\u5F00\u9009\u62E9\u9762\u677F\uFF09",
    "Upgrade outdated plugins": "\u5347\u7EA7\u5DF2\u8FC7\u671F\u7684\u63D2\u4EF6",
    "Browse available plugins": "\u6D4F\u89C8\u6240\u6709\u53EF\u7528\u63D2\u4EF6",
    "List all installed plugins (npm + marketplace)": "\u5217\u51FA\u5DF2\u5B89\u88C5\u7684\u6240\u6709\u63D2\u4EF6\uFF08npm \u4E0E\u63D2\u4EF6\u5E02\u573A\uFF09",
    "Show help message": "\u663E\u793A\u5E2E\u52A9\u4FE1\u606F",
    "Show usage guide": "\u663E\u793A\u4F7F\u7528\u6307\u5357",
    "Enable fast mode": "\u542F\u7528\u5FEB\u901F\u6A21\u5F0F",
    "Disable fast mode": "\u7981\u7528\u5FEB\u901F\u6A21\u5F0F",
    "Enable the advisor": "\u542F\u7528\u987E\u95EE\u6A21\u578B",
    "Disable the advisor": "\u7981\u7528\u987E\u95EE\u6A21\u578B",
    "Show advisor status": "\u663E\u793A\u987E\u95EE\u6A21\u578B\u8FD0\u884C\u72B6\u6001",
    "Enable computer use for this session": "\u5728\u5F53\u524D\u4F1A\u8BDD\u4E2D\u542F\u7528\u8BA1\u7B97\u673A\u64CD\u4F5C",
    "Disable computer use for this session": "\u5728\u5F53\u524D\u4F1A\u8BDD\u4E2D\u7981\u7528\u8BA1\u7B97\u673A\u64CD\u4F5C",
    "Strip tool results + large blocks (default)": "\u5254\u9664\u5DE5\u5177\u7ED3\u679C\u4E0E\u5927\u6587\u672C\u5757\uFF08\u9ED8\u8BA4\uFF09",
    "Strip image blocks": "\u5254\u9664\u56FE\u7247\u5185\u5BB9\u5757",
    "Drop all thinking blocks": "\u4E22\u5F03\u6240\u6709\u6DF1\u5EA6\u601D\u8003\u5757",
    "Set or replace the goal": "\u8BBE\u5B9A\u6216\u66FF\u6362\u5F53\u524D\u4EFB\u52A1\u76EE\u6807",
    "Show current goal details": "\u663E\u793A\u5F53\u524D\u76EE\u6807\u8BE6\u60C5",
    "Pause the current goal": "\u6682\u505C\u5F53\u524D\u76EE\u6807\u4EFB\u52A1",
    "Resume a paused goal": "\u6062\u590D\u5DF2\u6682\u505C\u7684\u76EE\u6807\u4EFB\u52A1",
    "Drop the current goal": "\u653E\u5F03\u5F53\u524D\u76EE\u6807\u4EFB\u52A1",
    "Adjust the token budget": "\u8C03\u6574 Token \u9884\u7B97\u4E0A\u9650",
    // Dynamic autocomplete descriptions
    "Plan: off": "\u8BA1\u5212\u6A21\u5F0F\uFF1A\u5173\u95ED",
    "Plan: disabled in settings": "\u8BA1\u5212\u6A21\u5F0F\uFF1A\u5DF2\u5728\u8BBE\u7F6E\u4E2D\u7981\u7528",
    "Plan: blocked by goal mode": "\u8BA1\u5212\u6A21\u5F0F\uFF1A\u5DF2\u88AB\u76EE\u6807\u6A21\u5F0F\u963B\u585E",
    "Plan review: available": "\u8BA1\u5212\u8BC4\u5BA1\uFF1A\u53EF\u7528",
    "Plan review: plan mode inactive": "\u8BA1\u5212\u8BC4\u5BA1\uFF1A\u8BA1\u5212\u6A21\u5F0F\u672A\u6FC0\u6D3B",
    "Vibe: on": "\u5373\u5174\u6A21\u5F0F (Vibe)\uFF1A\u5F00\u542F",
    "Vibe: off": "\u5373\u5174\u6A21\u5F0F (Vibe)\uFF1A\u5173\u95ED",
    "Goal: off": "\u76EE\u6807\u6A21\u5F0F\uFF1A\u5173\u95ED",
    "Goal: disabled in settings": "\u76EE\u6807\u6A21\u5F0F\uFF1A\u5DF2\u5728\u8BBE\u7F6E\u4E2D\u7981\u7528",
    "Fast: on": "\u5FEB\u901F\u6A21\u5F0F\uFF1A\u5F00\u542F",
    "Fast: off": "\u5FEB\u901F\u6A21\u5F0F\uFF1A\u5173\u95ED",
    "Advisor: on": "\u987E\u95EE\u6A21\u578B\uFF1A\u5F00\u542F",
    "Advisor: off": "\u987E\u95EE\u6A21\u578B\uFF1A\u5173\u95ED",
    "Computer use: on": "\u8BA1\u7B97\u673A\u64CD\u4F5C\uFF1A\u5F00\u542F",
    "Computer use: off": "\u8BA1\u7B97\u673A\u64CD\u4F5C\uFF1A\u5173\u95ED",
    "Extended context: on": "\u957F\u4E0A\u4E0B\u6587\u6269\u5C55\uFF1A\u5F00\u542F",
    "Extended context: off": "\u957F\u4E0A\u4E0B\u6587\u6269\u5C55\uFF1A\u5173\u95ED",
    "Skills: in prompt": "\u6280\u80FD\u5217\u8868\uFF1A\u6CE8\u5165\u63D0\u793A\u8BCD",
    "Skills: omitted": "\u6280\u80FD\u5217\u8868\uFF1A\u5DF2\u7701\u7565",
    "Model: none selected": "\u6A21\u578B\uFF1A\u672A\u9009\u62E9",
    // 11. Tips from tips.txt
    "Tired of typing \"keep going\"? Just send a '.'": "\u538C\u5026\u4E86\u53CD\u590D\u8F93\u5165\u201C\u7EE7\u7EED\u201D\uFF1F\u53EA\u9700\u53D1\u9001\u4E00\u4E2A '.' \u5373\u53EF",
    "You can /btw to ask a side question": "\u4F60\u53EF\u4EE5\u4F7F\u7528 /btw \u5728\u5F53\u524D\u4E0A\u4E0B\u6587\u4E2D\u63D2\u5165\u7B80\u77ED\u65C1\u652F\u63D0\u95EE",
    "Use /tan to fork the current conversation into a background agent": "\u4F7F\u7528 /tan \u5C06\u5F53\u524D\u4F1A\u8BDD\u5206\u53C9\u5E76\u5728\u540E\u53F0\u542F\u52A8\u72EC\u7ACB\u5B50\u4EE3\u7406",
    "Ctrl+D can be used to exit, but with your draft saved!": "\u6309 Ctrl+D \u5373\u53EF\u9000\u51FA\uFF0C\u672A\u53D1\u9001\u7684\u8349\u7A3F\u4F1A\u81EA\u52A8\u4FDD\u5B58\uFF01",
    "Find out which model you emotionally abuse the most with `omp stats`": "\u4F7F\u7528 `omp stats` \u67E5\u770B\u4F60\u4F7F\u7528\u6700\u9891\u7E41\u7684\u6A21\u578B\u4E0E\u7EDF\u8BA1\u5206\u6790",
    "Try task isolation to create CoW worktrees": "\u5C1D\u8BD5\u4EFB\u52A1\u9694\u79BB\u673A\u5236\uFF0C\u521B\u5EFA\u72EC\u7ACB\u7684\u5199\u65F6\u590D\u5236 (CoW) git worktree",
    "Need a cheap nested model call? Use `completion(x...)`. Have a big batch of tasks? Ask clanker to use it!": "\u9700\u8981\u8F7B\u91CF\u5D4C\u5957\u6A21\u578B\u8C03\u7528\uFF1F\u4F7F\u7528 `completion(x...)` \u6279\u91CF\u6267\u884C\u4EFB\u52A1",
    "Spaghetti code? Try complaining with /omfg": "\u4EE3\u7801\u6742\u4E71\u65E0\u7AE0\uFF1F\u5C1D\u8BD5\u4F7F\u7528 /omfg \u5410\u69FD\u4EE3\u7801\u4EE5\u56FA\u5316\u6539\u8FDB\u89C4\u5219 (TTSR)",
    "Did you know? Each kitty/tmux/cmux/zellij/wezterm split keeps its own session \u2014 `omp -c` resumes the right one": "\u4F60\u77E5\u9053\u5417\uFF1F\u6BCF\u4E2A\u7EC8\u7AEF\u5206\u5C4F\u62E5\u6709\u72EC\u7ACB\u4F1A\u8BDD\uFF0C\u8FD0\u884C `omp -c` \u5373\u53EF\u7CBE\u51C6\u6062\u590D",
    "Drop the word `ultrathink` in your message for harder multi-step reasoning \u2014 watch it glow rainbow as you type": "\u5728\u6D88\u606F\u4E2D\u8F93\u5165 `ultrathink` \u89E6\u53D1\u66F4\u5F3A\u5927\u7684\u591A\u6B65\u6DF1\u5EA6\u601D\u8003\uFF08\u8F93\u5165\u65F6\u6709\u5F69\u8679\u7279\u6548\uFF09",
    "Say `orchestrate` in your message to drive a multi-phase task with parallel subagents \u2014 watch it glow as you type": "\u5728\u6D88\u606F\u4E2D\u8F93\u5165 `orchestrate` \u53EF\u542F\u52A8\u591A\u9636\u6BB5\u5E76\u884C\u5B50\u4EE3\u7406\u534F\u540C\u7F16\u6392",
    "Say `workflowz` in your message to drive the task with parallel subagents in eval \u2014 watch it glow as you type": "\u5728\u6D88\u606F\u4E2D\u8F93\u5165 `workflowz` \u53EF\u5728\u8BC4\u4F30\u6A21\u5F0F\u4E0B\u4F7F\u7528\u5E76\u884C\u5B50\u4EE3\u7406\u6267\u884C\u4EFB\u52A1",
    "Log in to several accounts of the same provider \u2014 `/login` again \u2014 and omp load-balances across them automatically": "\u540C\u4E00\u63D0\u4F9B\u5546\u53EF\u767B\u5F55\u591A\u4E2A\u8D26\u53F7\uFF08\u518D\u6B21 `/login`\uFF09\uFF0Comp \u4F1A\u81EA\u52A8\u8FDB\u884C\u8F6E\u8BE2\u8D1F\u8F7D\u5747\u8861",
    "Run `omp auth-broker serve` once and every machine pulls live tokens over the wire \u2014 refresh keys never leave the host; `omp auth-gateway` fronts it as a drop-in proxy any OpenAI-compatible client can hit": "\u8FD0\u884C `omp auth-broker serve` \u53EF\u5411\u5185\u7F51\u5171\u4EAB Token\uFF0C\u914D\u5408 `auth-gateway` \u53EF\u4F5C\u4E3A\u7EDF\u4E00\u4EE3\u7406\u63A5\u5165",
    "Press alt+p (or /switch) to switch provider, and ctrl+p to cycle role models smol -> slow -> etc": "\u6309 Alt+P (\u6216 /switch) \u5207\u6362\u63D0\u4F9B\u5546\uFF0C\u6309 Ctrl+P \u5207\u6362\u6A21\u578B\u89D2\u8272\u9884\u8BBE",
    "Press ctrl+r to search your prompt history and reuse a past message": "\u6309 Ctrl+R \u641C\u7D22\u63D0\u793A\u5386\u53F2\u5E76\u5FEB\u901F\u590D\u7528\u5386\u53F2\u6D88\u606F",
    "`/force read` pins the next turn to one specific tool when the model keeps reaching for the wrong one": "\u6A21\u578B\u9009\u9519\u5DE5\u5177\u65F6\uFF0C\u4F7F\u7528 `/force <tool>` \u5F3A\u5236\u4E0B\u6B21\u56DE\u5408\u4F7F\u7528\u6307\u5B9A\u5DE5\u5177",
    "`/copy code` grabs the last code block to your clipboard \u2014 `/copy cmd` grabs the last shell/python command": "\u4F7F\u7528 `/copy code` \u590D\u5236\u6700\u65B0\u4EE3\u7801\u5757\uFF0C`/copy cmd` \u590D\u5236\u6700\u65B0\u7EC8\u7AEF\u547D\u4EE4",
    "`/shake` rips heavy tool results out of context to reclaim tokens without a full /compact \u2014 `/shake images` drops just images": "\u4F7F\u7528 `/shake` \u5254\u9664\u6C89\u91CD\u7684\u5DE5\u5177\u6267\u884C\u7ED3\u679C\u4EE5\u8282\u7701\u4E0A\u4E0B\u6587 Token\uFF0C\u65E0\u9700\u5B8C\u5168\u538B\u7F29",
    "Pair up live: `/collab` shares your session through an end-to-end encrypted relay link \u2014 a teammate runs `/join <link>` to watch tool calls stream and prompt the agent from their own omp": "\u5B9E\u65F6\u534F\u540C\uFF1A\u4F7F\u7528 `/collab` \u751F\u6210\u7AEF\u5230\u7AEF\u52A0\u5BC6\u94FE\u63A5\uFF0C\u961F\u53CB\u4F7F\u7528 `/join <link>` \u5373\u53EF\u5B9E\u65F6\u52A0\u5165",
    "Press \u2190 \u2190 to drill into a running or finished agent and inspect its tool calls and transcript": "\u8FDE\u6309\u4E24\u6B21\u5DE6\u7BAD\u5934 \u2190 \u2190 \u5373\u53EF\u6DF1\u5165\u67E5\u770B\u5B50\u4EE3\u7406\u7684\u5DE5\u5177\u8C03\u7528\u4E0E\u5B8C\u6574\u5BF9\u8BDD\u8BB0\u5F55",
    "Hit a Codex rate limit? `/usage reset` spends a saved reset credit to immediately restore your quota": "\u9047\u5230 Codex \u9650\u6D41\uFF1F\u4F7F\u7528 `/usage reset` \u6D88\u8017\u91CD\u7F6E\u989D\u5EA6\u7ACB\u5373\u6062\u590D\u914D\u989D",
    "No native tool_calling? Inference provider botches parsing them? `PI_DIALECT=glm|kimi|anthropic\u2026` rolls it locally for them!": "\u6A21\u578B\u4E0D\u652F\u6301\u539F\u751F\u5DE5\u5177\u8C03\u7528\uFF1F\u4F7F\u7528\u73AF\u5883\u53D8\u91CF `PI_DIALECT` \u672C\u5730\u9002\u914D\u65B9\u8A00\uFF01",
    "Turn on `/advisor` to attach a second model that reviews every turn and quietly injects advice": "\u542F\u7528 `/advisor` \u6302\u8F7D\u7B2C\u4E8C\u6A21\u578B\uFF0C\u5728\u6BCF\u56DE\u5408\u9759\u9ED8\u5BA1\u67E5\u5E76\u63D0\u4F9B\u5EFA\u8BAE\u6307\u5BFC",
    "Try starting your prompt with a ->, and writing a list (1. Do X, 2. Do Y)": "\u5C1D\u8BD5\u5728\u63D0\u793A\u8BCD\u5F00\u5934\u52A0\u4E0A -> \u5E76\u7F16\u5199\u6B65\u9AA4\u6E05\u5355\uFF081. \u6267\u884C X\uFF0C2. \u6267\u884C Y\uFF09",
    "Press shift+tab to cycle through reasoning effort levels": "\u6309 Shift+Tab \u5FEB\u901F\u5FAA\u73AF\u5207\u6362\u601D\u8003\u63A8\u7406\u5F3A\u5EA6\u7B49\u7EA7",
    "Lint/type errors piling up? `omp cleanse` (or /cleanse right here) hunts project diagnostics and fixes them with parallel subagents \u2014 esc cancels": "\u9519\u8BEF\u5806\u79EF\uFF1F\u4F7F\u7528 `omp cleanse` (\u6216 /cleanse) \u542F\u52A8\u5E76\u884C\u5B50\u4EE3\u7406\u81EA\u52A8\u626B\u63CF\u5E76\u4FEE\u590D\u9879\u76EE\u8BCA\u65AD",
    // 12. Plugin Management
    "oh-my-pi: degraded": "oh-my-pi: \u964D\u7EA7\u6A21\u5F0F (degraded)",
    "Hot-reload oh-my-pi config without restarting Pi": "\u70ED\u91CD\u8F7D oh-my-pi \u914D\u7F6E\u6587\u4EF6\uFF08\u65E0\u9700\u91CD\u542F Pi\uFF09",
    "Diagnose oh-my-pi installation health": "\u8BCA\u65AD oh-my-pi \u5B89\u88C5\u8FD0\u884C\u72B6\u6001\u4E0E\u5065\u5EB7\u5EA6"
  },
  patterns: [
    // Dynamic Tip format: "Tip: ..."
    {
      regex: /^Tip:\s*(.+)$/,
      replacement: "\u63D0\u793A\uFF1A$1"
    },
    // New version banner: "New version X is available. Run: omp update"
    {
      regex: /New version\s+([^\s]+)\s+is available\.\s*Run:\s*(.*)/i,
      replacement: "\u53D1\u73B0\u65B0\u7248\u672C $1 \u53EF\u7528\u3002\u8BF7\u8FD0\u884C: $2"
    },
    {
      regex: /New version\s+([^\s]+)\s+is available/i,
      replacement: "\u53D1\u73B0\u65B0\u7248\u672C $1 \u53EF\u7528"
    },
    {
      regex: /Or create\s+(.*models\.yml)/i,
      replacement: "\u6216\u521B\u5EFA $1 \u914D\u7F6E\u6587\u4EF6"
    },
    // Model fallback message pattern: "Could not restore model X. Using Y/Z"
    {
      regex: /Could not restore model\s+([^\s.]+)(?:\.\s*Using\s+([^\s]+))?/,
      replacement: "\u65E0\u6CD5\u6062\u590D\u6A21\u578B $1${$2 ? '\u3002\u5DF2\u56DE\u9000\u4F7F\u7528 ' + $2 : ''}"
    },
    // Dynamic Plan: Plan: on (foo.md)
    {
      regex: /^Plan:\s*on(?:\s*\(([^)]+)\))?$/,
      replacement: (_match, file) => file ? `\u8BA1\u5212\u6A21\u5F0F\uFF1A\u5F00\u542F (${file})` : "\u8BA1\u5212\u6A21\u5F0F\uFF1A\u5F00\u542F"
    },
    // Dynamic Vibe blocked
    {
      regex: /^Vibe:\s*blocked by (.+)$/,
      replacement: "\u5373\u5174\u6A21\u5F0F (Vibe)\uFF1A\u5DF2\u88AB $1 \u963B\u585E"
    },
    // Dynamic Goal blocked or state
    {
      regex: /^Goal:\s*blocked by (.+)$/,
      replacement: "\u76EE\u6807\u6A21\u5F0F\uFF1A\u5DF2\u88AB $1 \u963B\u585E"
    },
    {
      regex: /^Goal:\s*(in_progress|completed|paused|active)\s*\((.+)\)$/,
      replacement: "\u76EE\u6807\u6A21\u5F0F\uFF1A$1 ($2)"
    },
    // Dynamic Model: Model: anthropic/claude-3-5-sonnet
    {
      regex: /^Model:\s*([^\s]+)$/,
      replacement: "\u6A21\u578B\uFF1A$1"
    },
    // Dynamic Thinking level: Thinking level: high
    {
      regex: /^Thinking level:\s*([^\s]+)$/,
      replacement: "\u601D\u8003\u7B49\u7EA7\uFF1A$1"
    },
    // Status in footer: oh-my-pi: 3 agents, 2 skills
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
import { stripVTControlCharacters } from "node:util";
function getVisibleWidth(str) {
  if (!str) return 0;
  const clean = stripVTControlCharacters(str);
  let width = 0;
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    if (code >= 19968 && code <= 40959 || code >= 13312 && code <= 19903 || code >= 12288 && code <= 12351 || code >= 65281 && code <= 65376 || code >= 131072 && code <= 196607) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}
function trimTrailingSpaces(str, count) {
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
function addTrailingSpaces(str, count) {
  const tailAnsi = str.match(/(\x1b\[[0-9;]*[a-zA-Z])+$/);
  const suffix = tailAnsi ? tailAnsi[0] : "";
  const base = tailAnsi ? str.slice(0, -suffix.length) : str;
  return base + " ".repeat(count) + suffix;
}
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
   * Localize a single string (exact match, regex pattern, or phrase replacements).
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
   * Localize a table/box-drawn line containing vertical borders (│ / \u2502).
   * Rebalances column padding so the column cell width remains mathematically
   * identical to the original, preventing table border misalignment.
   */
  localizeBoxLine(line) {
    if (!line.includes("\u2502")) {
      return this.localizeLinePlain(line);
    }
    const parts = line.split("\u2502");
    if (parts.length < 2) return line;
    const rebalancedParts = parts.map((part, idx) => {
      if (idx === 0 || idx === parts.length - 1) {
        return part;
      }
      const origWidth = getVisibleWidth(part);
      let localized = part;
      for (const p of this.dictionary.patterns) {
        localized = localized.replace(p.regex, p.replacement);
      }
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
  localizeLinePlain(line) {
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
   * Localize a single rendered terminal line (preserving ANSI escape codes).
   */
  localizeLine(line) {
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
   * Attempt to dynamically patch host runtime classes and hooks:
   * 1. Direct host exports on api.pi (WelcomeComponent, renderWelcomeTip, Text, CustomEditor, BorderedLoader)
   * 2. Universal output streams (process.stdout.write & process.stderr.write)
   * 3. Fallback dynamic imports for standalone / test environments
   */
  async patchPiTui(api) {
    if (this.isPatched) return true;
    let patchedAny = false;
    const localizer = this.localizer;
    try {
      if (api?.pi) {
        const hostPi = api.pi;
        if (hostPi.WelcomeComponent?.prototype?.render && !this.hasOriginal(hostPi.WelcomeComponent.prototype, "render")) {
          this.saveOriginal(hostPi.WelcomeComponent.prototype, "render");
          const origWelcomeRender = hostPi.WelcomeComponent.prototype.render;
          hostPi.WelcomeComponent.prototype.render = function(termWidth) {
            const lines = origWelcomeRender.call(this, termWidth);
            return localizer.localizeLines(lines);
          };
          patchedAny = true;
        }
        if (typeof hostPi.renderWelcomeTip === "function" && !this.hasOriginal(hostPi, "renderWelcomeTip")) {
          this.saveOriginal(hostPi, "renderWelcomeTip");
          const origTip = hostPi.renderWelcomeTip;
          hostPi.renderWelcomeTip = function(tip, boxWidth, phase = 0) {
            const localizedTip = localizer.localizeText(tip);
            return origTip.call(this, localizedTip, boxWidth, phase);
          };
          patchedAny = true;
        }
        if (hostPi.Text?.prototype?.render && !this.hasOriginal(hostPi.Text.prototype, "render")) {
          this.saveOriginal(hostPi.Text.prototype, "render");
          const origTextRender = hostPi.Text.prototype.render;
          hostPi.Text.prototype.render = function(width) {
            const lines = origTextRender.call(this, width);
            return localizer.localizeLines(lines);
          };
          patchedAny = true;
        }
        if (hostPi.BorderedLoader?.prototype?.render && !this.hasOriginal(hostPi.BorderedLoader.prototype, "render")) {
          this.saveOriginal(hostPi.BorderedLoader.prototype, "render");
          const origLoader = hostPi.BorderedLoader.prototype.render;
          hostPi.BorderedLoader.prototype.render = function(width) {
            const lines = origLoader.call(this, width);
            return localizer.localizeLines(lines);
          };
          patchedAny = true;
        }
        if (hostPi.CustomEditor?.prototype) {
          const Editor = Object.getPrototypeOf(hostPi.CustomEditor.prototype)?.constructor;
          if (Editor?.prototype?.setAutocompleteProvider && !this.hasOriginal(Editor.prototype, "setAutocompleteProvider")) {
            this.saveOriginal(Editor.prototype, "setAutocompleteProvider");
            const origSetProvider = Editor.prototype.setAutocompleteProvider;
            Editor.prototype.setAutocompleteProvider = function(provider) {
              if (provider && typeof provider.getSuggestions === "function") {
                const origGetSuggestions = provider.getSuggestions;
                provider.getSuggestions = async function(...args) {
                  const result = await origGetSuggestions.apply(this, args);
                  if (result && Array.isArray(result.items)) {
                    for (const item of result.items) {
                      if (item && typeof item.description === "string") {
                        item.description = localizer.localizeText(item.description);
                      }
                    }
                  }
                  return result;
                };
              }
              return origSetProvider.call(this, provider);
            };
            patchedAny = true;
          }
        }
        logger.debug("Patched api.pi host components successfully.");
      }
    } catch (err) {
      logger.warn(`Failed patching api.pi host classes: ${String(err)}`);
    }
    try {
      if (typeof process?.stdout?.write === "function" && !this.hasOriginal(process.stdout, "write")) {
        this.saveOriginal(process.stdout, "write");
        const origStdoutWrite = process.stdout.write.bind(process.stdout);
        const patcherRef = this;
        process.stdout.write = function(chunk, encodingOrCallback, callback) {
          if (!patcherRef.isPatched) {
            return origStdoutWrite(chunk, encodingOrCallback, callback);
          }
          if (typeof chunk === "string" && chunk.length > 0) {
            if (chunk.includes("Welcome back!") || chunk.includes("Tips") || chunk.includes("Tip:") || chunk.includes("No models available") || chunk.includes("Update Available") || chunk.includes("New version") || chunk.includes("LSP Servers") || chunk.includes("Recent sessions") || chunk.includes("for prompt actions") || chunk.includes("for commands") || chunk.includes("to run bash") || chunk.includes("to run python") || chunk.includes("Thinking...")) {
              const lines = chunk.split("\n");
              const localized = lines.map((l) => localizer.localizeLine(l)).join("\n");
              return origStdoutWrite(localized, encodingOrCallback, callback);
            }
          } else if (Buffer.isBuffer(chunk) && chunk.length > 0) {
            const str = chunk.toString("utf8");
            if (str.includes("Welcome back!") || str.includes("Tips") || str.includes("Tip:") || str.includes("No models available") || str.includes("Update Available") || str.includes("New version") || str.includes("LSP Servers") || str.includes("Recent sessions") || str.includes("for prompt actions") || str.includes("for commands") || str.includes("to run bash") || str.includes("to run python") || str.includes("Thinking...")) {
              const lines = str.split("\n");
              const localized = lines.map((l) => localizer.localizeLine(l)).join("\n");
              return origStdoutWrite(Buffer.from(localized, "utf8"), encodingOrCallback, callback);
            }
          }
          return origStdoutWrite(chunk, encodingOrCallback, callback);
        };
        patchedAny = true;
      }
      if (typeof process?.stderr?.write === "function" && !this.hasOriginal(process.stderr, "write")) {
        this.saveOriginal(process.stderr, "write");
        const origStderrWrite = process.stderr.write.bind(process.stderr);
        const patcherRef = this;
        process.stderr.write = function(chunk, encodingOrCallback, callback) {
          if (!patcherRef.isPatched) {
            return origStderrWrite(chunk, encodingOrCallback, callback);
          }
          if (typeof chunk === "string" && chunk.length > 0) {
            if (chunk.includes("No models available") || chunk.includes("Update Available") || chunk.includes("API key") || chunk.includes("models.yml") || chunk.includes("Error:")) {
              const lines = chunk.split("\n");
              const localized = lines.map((l) => localizer.localizeLine(l)).join("\n");
              return origStderrWrite(localized, encodingOrCallback, callback);
            }
          } else if (Buffer.isBuffer(chunk) && chunk.length > 0) {
            const str = chunk.toString("utf8");
            if (str.includes("No models available") || str.includes("Update Available") || str.includes("API key") || str.includes("models.yml") || str.includes("Error:")) {
              const lines = str.split("\n");
              const localized = lines.map((l) => localizer.localizeLine(l)).join("\n");
              return origStderrWrite(Buffer.from(localized, "utf8"), encodingOrCallback, callback);
            }
          }
          return origStderrWrite(chunk, encodingOrCallback, callback);
        };
        patchedAny = true;
      }
    } catch (err) {
      logger.warn(`Failed installing stdout/stderr safety net: ${String(err)}`);
    }
    try {
      let piTui = null;
      try {
        piTui = await import("@oh-my-pi/pi-tui");
      } catch {
        try {
          piTui = await import("@earendil-works/pi-tui");
        } catch {
        }
      }
      if (piTui) {
        if (piTui.Text?.prototype?.render && !this.hasOriginal(piTui.Text.prototype, "render")) {
          this.saveOriginal(piTui.Text.prototype, "render");
          const origRender = piTui.Text.prototype.render;
          piTui.Text.prototype.render = function(width) {
            const lines = origRender.call(this, width);
            return localizer.localizeLines(lines);
          };
          patchedAny = true;
        }
        if (piTui.SelectList?.prototype?.render && !this.hasOriginal(piTui.SelectList.prototype, "render")) {
          this.saveOriginal(piTui.SelectList.prototype, "render");
          const origSelectRender = piTui.SelectList.prototype.render;
          piTui.SelectList.prototype.render = function(width) {
            const items = this.items;
            if (Array.isArray(items)) {
              for (const item of items) {
                if (item && typeof item.description === "string") {
                  item.description = localizer.localizeText(item.description);
                }
              }
            }
            const lines = origSelectRender.call(this, width);
            return localizer.localizeLines(lines);
          };
          patchedAny = true;
        }
        if (piTui.CombinedAutocompleteProvider?.prototype?.getSuggestions && !this.hasOriginal(piTui.CombinedAutocompleteProvider.prototype, "getSuggestions")) {
          this.saveOriginal(piTui.CombinedAutocompleteProvider.prototype, "getSuggestions");
          const origGetSuggestions = piTui.CombinedAutocompleteProvider.prototype.getSuggestions;
          piTui.CombinedAutocompleteProvider.prototype.getSuggestions = async function(...args) {
            const result = await origGetSuggestions.apply(this, args);
            if (result && Array.isArray(result.items)) {
              for (const item of result.items) {
                if (item && typeof item.description === "string") {
                  item.description = localizer.localizeText(item.description);
                }
              }
            }
            return result;
          };
          patchedAny = true;
        }
        if (piTui.SettingsList?.prototype?.renderMainList && !this.hasOriginal(piTui.SettingsList.prototype, "renderMainList")) {
          this.saveOriginal(piTui.SettingsList.prototype, "renderMainList");
          const origSettingsRender = piTui.SettingsList.prototype.renderMainList;
          piTui.SettingsList.prototype.renderMainList = function(width) {
            const lines = origSettingsRender.call(this, width);
            return localizer.localizeLines(lines);
          };
          patchedAny = true;
        }
        logger.debug("Patched pi-tui classes successfully.");
      }
    } catch (err) {
      logger.warn(`Failed fallback patching pi-tui: ${String(err)}`);
    }
    this.isPatched = patchedAny;
    return patchedAny;
  }
  /**
   * Wrap ctx.ui methods to localize dynamic TUI interactions
   */
  wrapExtensionUI(ui) {
    if (!ui) return;
    if (typeof ui.setStatus === "function") {
      const origSetStatus = ui.setStatus.bind(ui);
      ui.setStatus = (key, text) => {
        if (text === void 0) {
          return origSetStatus(key);
        }
        const localized = this.localizer.localizeText(text);
        return origSetStatus(key, localized);
      };
    }
    if (typeof ui.setWorkingMessage === "function") {
      const origWorking = ui.setWorkingMessage.bind(ui);
      ui.setWorkingMessage = (message) => {
        if (!message) return origWorking();
        const localized = this.localizer.localizeText(message);
        return origWorking(localized);
      };
    }
    if (typeof ui.select === "function") {
      const origSelect = ui.select.bind(ui);
      ui.select = async (title, options, opts) => {
        const localizedTitle = this.localizer.localizeText(title);
        const localizedOptions = options.map((opt) => ({
          ...opt,
          label: this.localizer.localizeText(opt.label),
          description: opt.description ? this.localizer.localizeText(opt.description) : opt.description
        }));
        return origSelect(localizedTitle, localizedOptions, opts);
      };
    }
    if (typeof ui.multiSelect === "function") {
      const origMulti = ui.multiSelect.bind(ui);
      ui.multiSelect = async (title, options, opts) => {
        const localizedTitle = this.localizer.localizeText(title);
        const localizedOptions = options.map((opt) => ({
          ...opt,
          label: this.localizer.localizeText(opt.label),
          description: opt.description ? this.localizer.localizeText(opt.description) : opt.description
        }));
        return origMulti(localizedTitle, localizedOptions, opts);
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
  hasOriginal(target, prop) {
    return Boolean(this.originalMethods.get(target)?.has(prop));
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
  if (config.enabled) {
    void patcher.patchPiTui(pi).catch((err) => {
      logger.debug(`Initial patchPiTui deferred: ${String(err)}`);
    });
  }
  pi.on("session_start", async (_event, ctx) => {
    try {
      config = loadConfig(ctx?.cwd || process.cwd());
      localizer.setDictionary(getTuiDictionary(config.locale, config.customDictionary));
      if (config.enabled) {
        await patcher.patchPiTui(pi);
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
          await patcher.patchPiTui(pi);
          if (ctx?.ui) {
            patcher.wrapExtensionUI(ctx.ui);
            if (config.features.statusIndicator) {
              ctx.ui.setStatus?.("oh-my-pi-zh", "\u{1F1E8}\u{1F1F3} TUI:\u4E2D\u6587");
            }
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
            "\u{1F4A1} \u63D0\u793A\uFF1A\u53EF\u901A\u8FC7 `/zh on` \u6216 `/zh off` \u968F\u65F6\u65E0\u7F1D\u5207\u6362\u4E2D\u82F1\u6587\u7EC8\u7AEF\u754C\u9762\u3002"
          ];
          const report = lines.join("\n");
          ctx?.ui?.notify ? ctx.ui.notify(report, "info") : console.log(report);
          break;
        }
        case "status":
        default: {
          const msg = `[oh-my-pi-zh v${config.version || "0.2.0"}] TUI \u7EC8\u7AEF\u6C49\u5316\u72B6\u6001: ${config.enabled ? "\u5DF2\u5F00\u542F" : "\u5DF2\u5173\u95ED"} | \u8BED\u8A00: ${config.locale}`;
          ctx?.ui?.notify ? ctx.ui.notify(msg, "info") : console.log(msg);
          break;
        }
      }
    };
    const getArgumentCompletions = async (prefix) => {
      const subcommands = [
        { value: "status", label: "status", description: "\u67E5\u770B\u5F53\u524D\u7EC8\u7AEF TUI \u6C49\u5316\u72B6\u6001" },
        { value: "on", label: "on", description: "\u7ACB\u5373\u542F\u7528\u7EC8\u7AEF TUI \u4E2D\u6587\u6C49\u5316" },
        { value: "off", label: "off", description: "\u505C\u7528\u6C49\u5316\u5E76\u6062\u590D\u82F1\u6587\u539F\u751F\u754C\u9762" },
        { value: "doctor", label: "doctor", description: "\u6267\u884C TUI \u6C49\u5316\u8BCA\u65AD\u4E0E\u4F53\u68C0" }
      ];
      const p = (prefix || "").toLowerCase().trim();
      return subcommands.filter((s) => s.value.startsWith(p));
    };
    pi.registerCommand("zh", {
      description: "\u7BA1\u7406 oh-my-pi \u7EC8\u7AEF TUI \u4E2D\u6587\u6C49\u5316\u72B6\u6001 (/zh [status|on|off|doctor])",
      getArgumentCompletions,
      handler: handleCommand
    });
    pi.registerCommand("omp-zh", {
      description: "oh-my-pi \u7EC8\u7AEF\u4E2D\u6587\u6C49\u5316\u63A7\u5236 (/omp-zh [status|on|off|doctor])",
      getArgumentCompletions,
      handler: handleCommand
    });
    pi.registerCommand("oh-my-pi-zh", {
      description: "\u7BA1\u7406 oh-my-pi \u7EC8\u7AEF TUI \u4E2D\u6587\u6C49\u5316\u72B6\u6001 (/oh-my-pi-zh [status|on|off|doctor])",
      getArgumentCompletions,
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
  getVisibleWidth,
  loadConfig,
  mergeConfig,
  ohMyPiZh,
  tuiZhCN
};

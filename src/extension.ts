/**
 * oh-my-pi-zh — Pi Extension Entry Point
 *
 * Non-intrusive runtime localization extension for oh-my-pi and Pi CLI.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config/loader.js";
import type { OhMyPiZhConfig } from "./config/types.js";
import { localizePrompt } from "./adapter/prompt-localizer.js";
import { detectOhMyPi } from "./adapter/detector.js";
import { getDictionary } from "./locales/index.js";
import { logger } from "./shared/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, "..");

export interface PiExtensionAPI {
  on(event: string, handler: (...args: any[]) => any): void;
  registerCommand(
    name: string,
    options: {
      description: string;
      handler: (args: string, ctx: any) => Promise<void> | void;
    }
  ): void;
}

export default async function ohMyPiZh(pi: PiExtensionAPI): Promise<void> {
  let config: OhMyPiZhConfig = loadConfig();
  let currentPrompt = "";

  logger.debug("oh-my-pi-zh extension initializing...");

  // 1. Session start
  pi.on("session_start", (_event: any, ctx: any) => {
    try {
      config = loadConfig(ctx?.cwd || process.cwd());
      logger.debug("Config loaded:", config);
      if (config.enabled && config.features.statusIndicator && ctx?.ui?.setStatus) {
        ctx.ui.setStatus("oh-my-pi-zh", {
          text: "🇨🇳 omp:zh-CN",
          tooltip: "oh-my-pi 汉化外挂插件已生效"
        });
      }
    } catch (err) {
      logger.warn(`Failed in session_start: ${String(err)}`);
    }
  });

  // 2. Discover resources (Chinese skills & prompts)
  pi.on("resources_discover", () => {
    return {
      skillPaths: [join(packageRoot, "skills")],
      promptPaths: [join(packageRoot, "prompts")]
    };
  });

  // 3. Intercept & localize system prompt before agent starts (PRIMARY HOOK)
  pi.on("before_agent_start", (event: { systemPrompt: string; systemPromptOptions?: any }) => {
    try {
      if (!config.enabled) {
        return {};
      }
      currentPrompt = event.systemPrompt;
      const localized = localizePrompt(event.systemPrompt, config);
      return { systemPrompt: localized };
    } catch (err) {
      logger.error(`before_agent_start localization failed: ${String(err)}`);
      // Fail-safe: return empty object to retain original prompt untouched
      return {};
    }
  });

  // 4. Session shutdown
  pi.on("session_shutdown", () => {
    logger.debug("oh-my-pi-zh session ended.");
  });

  // 5. Register slash command: /oh-my-pi-zh
  if (config.features.registerCommands) {
    const handleCommand = async (argsStr: string, ctx: any) => {
      const args = (argsStr || "").trim().split(/\s+/);
      const sub = args[0]?.toLowerCase() || "status";
      const dict = getDictionary(config.locale, config.customDictionary);

      switch (sub) {
        case "on": {
          config.enabled = true;
          const msg = "✅ oh-my-pi 汉化已开启 (Enabled)";
          ctx?.ui?.notify ? ctx.ui.notify(msg, "info") : console.log(msg);
          break;
        }
        case "off": {
          config.enabled = false;
          const msg = "⚪ oh-my-pi 汉化已关闭，恢复原生英文 (Disabled)";
          ctx?.ui?.notify ? ctx.ui.notify(msg, "info") : console.log(msg);
          break;
        }
        case "doctor": {
          const detection = detectOhMyPi(currentPrompt);
          const lines = [
            `# ${dict.doctor.title}`,
            "",
            `**${dict.doctor.pluginEnabled}**: ${config.enabled ? "✅ " + dict.doctor.active : "⚪ " + dict.doctor.inactive}`,
            `**${dict.doctor.currentLocale}**: ${config.locale}`,
            `**${dict.doctor.ompInstalled}**: ${detection.detected ? "✅ " + dict.doctor.found : "⚠️ " + dict.doctor.notFound}`,
            `**已汉化标记**: ${detection.alreadyLocalized ? "是" : "否"}`,
            `**检测到的段落特征**: ${detection.markers.join(", ") || "(无)"}`,
            "",
            dict.doctor.tip
          ];
          const report = lines.join("\n");
          ctx?.ui?.notify ? ctx.ui.notify(report, "info") : console.log(report);
          break;
        }
        case "status":
        default: {
          const detection = detectOhMyPi(currentPrompt);
          const msg = `[oh-my-pi-zh v${config.version || "0.1.0"}]\n状态: ${config.enabled ? "已启用" : "已停用"} | 语言: ${config.locale} | 上游探测: ${detection.detected ? "已发现" : "未发现"}`;
          ctx?.ui?.notify ? ctx.ui.notify(msg, "info") : console.log(msg);
          break;
        }
      }
    };

    pi.registerCommand("oh-my-pi-zh", {
      description: "管理 oh-my-pi 中文汉化插件状态与诊断 (/oh-my-pi-zh [status|on|off|doctor])",
      handler: handleCommand
    });

    pi.registerCommand("omp-zh", {
      description: "oh-my-pi-zh 快捷别名",
      handler: handleCommand
    });
  }
}

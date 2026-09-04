/**
 * oh-my-pi-zh — Pi Extension Entry Point (TUI Localization)
 *
 * Non-intrusive runtime TUI localization extension for oh-my-pi and Pi CLI.
 */
import { loadConfig } from "./config/loader.js";
import type { OhMyPiZhConfig } from "./config/types.js";
import { getTuiDictionary } from "./locales/index.js";
import { TuiTextLocalizer } from "./tui/text-localizer.js";
import { TuiPatcher } from "./tui/patcher.js";
import { logger } from "./shared/logger.js";

export interface PiExtensionAPI {
  on(event: string, handler: (...args: any[]) => any): void;
  registerCommand(
    name: string,
    options: {
      description: string;
      handler: (args: string, ctx: any) => Promise<void> | void;
    }
  ): void;
  registerMarkdownTransformer?(
    transformer: (
      markdown: string,
      context: { messageType: string; isStreaming: boolean; availableWidth: number }
    ) => string
  ): void;
}

export default async function ohMyPiZh(pi: PiExtensionAPI): Promise<void> {
  let config: OhMyPiZhConfig = loadConfig();
  const dict = getTuiDictionary(config.locale, config.customDictionary);
  const localizer = new TuiTextLocalizer(dict);
  const patcher = new TuiPatcher({ localizer });

  logger.debug("oh-my-pi-zh TUI extension initializing...");

  // 1. Session start: patch pi-tui classes and wrap ctx.ui
  pi.on("session_start", async (_event: any, ctx: any) => {
    try {
      config = loadConfig(ctx?.cwd || process.cwd());
      localizer.setDictionary(getTuiDictionary(config.locale, config.customDictionary));

      if (config.enabled) {
        // Patch pi-tui classes in Node.js runtime
        await patcher.patchPiTui();

        // Wrap ctx.ui interactive methods
        if (ctx?.ui) {
          patcher.wrapExtensionUI(ctx.ui);

          if (config.features.statusIndicator && typeof ctx.ui.setStatus === "function") {
            ctx.ui.setStatus("oh-my-pi-zh", "🇨🇳 TUI:中文");
          }
        }
      }
    } catch (err) {
      logger.warn(`Failed in session_start: ${String(err)}`);
    }
  });

  // 2. Register markdown transformer for chat UI
  if (typeof pi.registerMarkdownTransformer === "function") {
    pi.registerMarkdownTransformer((markdown, { isStreaming }) => {
      if (!config.enabled) return markdown;
      if (isStreaming) return markdown;
      return localizer.localizeText(markdown);
    });
  }

  // 3. Session shutdown: restore original methods
  pi.on("session_shutdown", () => {
    patcher.restore();
    logger.debug("oh-my-pi-zh TUI session ended and unpatched.");
  });

  // 4. Register slash commands: /oh-my-pi-zh and /omp-zh
  if (config.features.registerCommands) {
    const handleCommand = async (argsStr: string, ctx: any) => {
      const args = (argsStr || "").trim().split(/\s+/);
      const sub = args[0]?.toLowerCase() || "status";

      switch (sub) {
        case "on": {
          config.enabled = true;
          await patcher.patchPiTui();
          if (ctx?.ui) {
            patcher.wrapExtensionUI(ctx.ui);
            ctx.ui.setStatus?.("oh-my-pi-zh", "🇨🇳 TUI:中文");
          }
          const msg = "✅ oh-my-pi TUI 中文汉化已启用";
          ctx?.ui?.notify ? ctx.ui.notify(msg, "info") : console.log(msg);
          break;
        }
        case "off": {
          config.enabled = false;
          patcher.restore();
          if (ctx?.ui) {
            ctx.ui.setStatus?.("oh-my-pi-zh", undefined);
          }
          const msg = "⚪ oh-my-pi TUI 汉化已停用，恢复英文原生界面";
          ctx?.ui?.notify ? ctx.ui.notify(msg, "info") : console.log(msg);
          break;
        }
        case "doctor": {
          const lines = [
            "# 🔍 oh-my-pi-zh 终端 TUI 汉化体检诊断报告",
            "",
            `- **TUI 汉化状态**: ${config.enabled ? "✅ 已启用" : "⚪ 已停用"}`,
            `- **当前界面语言**: ${config.locale}`,
            `- **状态栏指示器**: ${config.features.statusIndicator ? "已激活" : "未激活"}`,
            `- **Markdown 变换器**: ${typeof pi.registerMarkdownTransformer === "function" ? "已就绪" : "未提供"}`,
            "",
            "💡 提示：可通过 `/oh-my-pi-zh on` 或 `/oh-my-pi-zh off` 随时无缝切换中英文终端界面。"
          ];
          const report = lines.join("\n");
          ctx?.ui?.notify ? ctx.ui.notify(report, "info") : console.log(report);
          break;
        }
        case "status":
        default: {
          const msg = `[oh-my-pi-zh v${config.version || "0.1.0"}] TUI 终端汉化状态: ${config.enabled ? "已开启" : "已关闭"} | 语言: ${config.locale}`;
          ctx?.ui?.notify ? ctx.ui.notify(msg, "info") : console.log(msg);
          break;
        }
      }
    };

    pi.registerCommand("oh-my-pi-zh", {
      description: "管理 oh-my-pi 终端 TUI 中文汉化状态 (/oh-my-pi-zh [status|on|off|doctor])",
      handler: handleCommand
    });

    pi.registerCommand("omp-zh", {
      description: "oh-my-pi-zh 快捷别名",
      handler: handleCommand
    });
  }
}

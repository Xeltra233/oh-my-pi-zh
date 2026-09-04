import { TuiTextLocalizer } from "./text-localizer.js";
import { logger } from "../shared/logger.js";

export interface PatcherOptions {
  localizer: TuiTextLocalizer;
}

export class TuiPatcher {
  private localizer: TuiTextLocalizer;
  private isPatched = false;
  private originalMethods: Map<any, Map<string, any>> = new Map();

  constructor(options: PatcherOptions) {
    this.localizer = options.localizer;
  }

  /**
   * Attempt to dynamically patch @oh-my-pi/pi-tui, @oh-my-pi/pi-coding-agent
   * and fallback Pi classes in the current runtime environment.
   */
  async patchPiTui(): Promise<boolean> {
    if (this.isPatched) return true;

    let patchedAny = false;

    // 1. Patch pi-tui classes
    try {
      let piTui: any = null;

      // Try @oh-my-pi/pi-tui first, then fallbacks
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
            // pi-tui not found
          }
        }
      }

      if (piTui) {
        const localizer = this.localizer;

        // 1.1 Patch Text.prototype.render
        if (piTui.Text?.prototype?.render) {
          this.saveOriginal(piTui.Text.prototype, "render");
          const origRender = piTui.Text.prototype.render;

          piTui.Text.prototype.render = function (width: number) {
            const lines = origRender.call(this, width);
            return localizer.localizeLines(lines);
          };
          patchedAny = true;
        }

        // 1.2 Patch SelectList.prototype.render (Localize item descriptions and rendered rows)
        if (piTui.SelectList?.prototype?.render) {
          this.saveOriginal(piTui.SelectList.prototype, "render");
          const origSelectRender = piTui.SelectList.prototype.render;

          piTui.SelectList.prototype.render = function (width: number) {
            // Localize descriptions on items data source so internal width/wrapping is native
            const items = (this as any).items;
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

        // 1.3 Patch CombinedAutocompleteProvider.prototype.getSuggestions
        if (piTui.CombinedAutocompleteProvider?.prototype?.getSuggestions) {
          this.saveOriginal(piTui.CombinedAutocompleteProvider.prototype, "getSuggestions");
          const origGetSuggestions = piTui.CombinedAutocompleteProvider.prototype.getSuggestions;

          piTui.CombinedAutocompleteProvider.prototype.getSuggestions = async function (...args: any[]) {
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

        // 1.4 Patch SettingsList.prototype.renderMainList
        if (piTui.SettingsList?.prototype?.renderMainList) {
          this.saveOriginal(piTui.SettingsList.prototype, "renderMainList");
          const origSettingsRender = piTui.SettingsList.prototype.renderMainList;

          piTui.SettingsList.prototype.renderMainList = function (width: number) {
            const lines = origSettingsRender.call(this, width);
            return localizer.localizeLines(lines);
          };
          patchedAny = true;
        }

        // 1.5 Patch ProcessTerminal.prototype.write (Safety net for unhooked terminal lines)
        if (piTui.ProcessTerminal?.prototype?.write) {
          this.saveOriginal(piTui.ProcessTerminal.prototype, "write");
          const origWrite = piTui.ProcessTerminal.prototype.write;

          piTui.ProcessTerminal.prototype.write = function (data: string) {
            if (typeof data === "string" && data.length > 0) {
              // Only process when terminal write contains notable TUI markers to preserve maximum throughput
              if (
                data.includes("Welcome back!") ||
                data.includes("Tips") ||
                data.includes("LSP Servers") ||
                data.includes("Recent sessions") ||
                data.includes("Tip:") ||
                data.includes("No models available") ||
                data.includes("Update Available")
              ) {
                const lines = data.split("\n");
                const localizedLines = localizer.localizeLines(lines);
                return origWrite.call(this, localizedLines.join("\n"));
              }
            }
            return origWrite.call(this, data);
          };
          patchedAny = true;
        }

        logger.debug("Patched pi-tui classes successfully.");
      }
    } catch (err) {
      logger.warn(`Failed patching pi-tui: ${String(err)}`);
    }

    // 2. Patch coding-agent components (WelcomeComponent, etc.) if available
    try {
      let codingAgent: any = null;
      try {
        codingAgent = await import("@oh-my-pi/pi-coding-agent");
      } catch {
        try {
          codingAgent = await import("@earendil-works/pi-coding-agent");
        } catch {
          // coding-agent not directly importable outside bundled binary
        }
      }

      if (codingAgent) {
        const localizer = this.localizer;

        // 2.1 Patch WelcomeComponent.prototype.render
        if (codingAgent.WelcomeComponent?.prototype?.render) {
          this.saveOriginal(codingAgent.WelcomeComponent.prototype, "render");
          const origWelcomeRender = codingAgent.WelcomeComponent.prototype.render;

          codingAgent.WelcomeComponent.prototype.render = function (termWidth: number) {
            const lines = origWelcomeRender.call(this, termWidth);
            return localizer.localizeLines(lines as string[]);
          };
          patchedAny = true;
        }

        logger.debug("Patched coding-agent components successfully.");
      }
    } catch (err) {
      logger.warn(`Failed patching coding-agent: ${String(err)}`);
    }

    this.isPatched = patchedAny;
    return patchedAny;
  }

  /**
   * Wrap ctx.ui methods to localize dynamic TUI interactions
   */
  wrapExtensionUI(ui: any): void {
    if (!ui) return;

    // 1. setStatus (intercept oh-my-pi status like "oh-my-pi: 3 agents, 2 skills")
    if (typeof ui.setStatus === "function") {
      const origSetStatus = ui.setStatus.bind(ui);
      ui.setStatus = (key: string, text: string | undefined) => {
        if (text) {
          const localized = this.localizer.localizeText(text);
          return origSetStatus(key, localized);
        }
        return origSetStatus(key, text);
      };
    }

    // 2. setWorkingMessage
    if (typeof ui.setWorkingMessage === "function") {
      const origSetWorkingMessage = ui.setWorkingMessage.bind(ui);
      ui.setWorkingMessage = (msg?: string) => {
        if (msg) {
          return origSetWorkingMessage(this.localizer.localizeText(msg));
        }
        return origSetWorkingMessage(msg);
      };
    }

    // 3. setHiddenThinkingLabel
    if (typeof ui.setHiddenThinkingLabel === "function") {
      const origSetHiddenThinking = ui.setHiddenThinkingLabel.bind(ui);
      ui.setHiddenThinkingLabel = (label?: string) => {
        if (label) {
          return origSetHiddenThinking(this.localizer.localizeText(label));
        }
        return origSetHiddenThinking(label);
      };
    }

    // 4. select dialog
    if (typeof ui.select === "function") {
      const origSelect = ui.select.bind(ui);
      ui.select = async (title: string, options: string[], opts?: any) => {
        const localizedTitle = this.localizer.localizeText(title);
        const localizedOptions = options.map((opt) => this.localizer.localizeText(opt));
        return origSelect(localizedTitle, localizedOptions, opts);
      };
    }

    // 5. confirm dialog
    if (typeof ui.confirm === "function") {
      const origConfirm = ui.confirm.bind(ui);
      ui.confirm = async (title: string, message: string, opts?: any) => {
        const localizedTitle = this.localizer.localizeText(title);
        const localizedMessage = this.localizer.localizeText(message);
        return origConfirm(localizedTitle, localizedMessage, opts);
      };
    }

    // 6. input dialog
    if (typeof ui.input === "function") {
      const origInput = ui.input.bind(ui);
      ui.input = async (title: string, placeholder?: string, opts?: any) => {
        const localizedTitle = this.localizer.localizeText(title);
        const localizedPlaceholder = placeholder ? this.localizer.localizeText(placeholder) : placeholder;
        return origInput(localizedTitle, localizedPlaceholder, opts);
      };
    }

    // 7. notify
    if (typeof ui.notify === "function") {
      const origNotify = ui.notify.bind(ui);
      ui.notify = (message: string, type?: "info" | "warning" | "error") => {
        const localizedMsg = this.localizer.localizeText(message);
        return origNotify(localizedMsg, type);
      };
    }
  }

  /**
   * Restore original methods (for unpatching/testing)
   */
  restore(): void {
    for (const [target, methods] of this.originalMethods.entries()) {
      for (const [prop, orig] of methods.entries()) {
        target[prop] = orig;
      }
    }
    this.originalMethods.clear();
    this.isPatched = false;
  }

  private saveOriginal(target: any, prop: string): void {
    if (!this.originalMethods.has(target)) {
      this.originalMethods.set(target, new Map());
    }
    const map = this.originalMethods.get(target)!;
    if (!map.has(prop)) {
      map.set(prop, target[prop]);
    }
  }
}

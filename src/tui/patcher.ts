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
   * Attempt to dynamically patch host runtime classes and hooks:
   * 1. Direct host exports on api.pi (WelcomeComponent, renderWelcomeTip, Text, CustomEditor, BorderedLoader)
   * 2. Universal output streams (process.stdout.write & process.stderr.write)
   * 3. Fallback dynamic imports for standalone / test environments
   */
  async patchPiTui(api?: any): Promise<boolean> {
    if (this.isPatched) return true;

    let patchedAny = false;
    const localizer = this.localizer;

    // 1. Patch classes directly provided by host runtime in api.pi
    try {
      if (api?.pi) {
        const hostPi = api.pi;

        // 1.1 Patch WelcomeComponent.prototype.render
        if (hostPi.WelcomeComponent?.prototype?.render && !this.hasOriginal(hostPi.WelcomeComponent.prototype, "render")) {
          this.saveOriginal(hostPi.WelcomeComponent.prototype, "render");
          const origWelcomeRender = hostPi.WelcomeComponent.prototype.render;

          hostPi.WelcomeComponent.prototype.render = function (termWidth: number) {
            const lines = origWelcomeRender.call(this, termWidth);
            return localizer.localizeLines(lines as string[]);
          };
          patchedAny = true;
        }

        // 1.2 Patch renderWelcomeTip standalone function
        if (typeof hostPi.renderWelcomeTip === "function" && !this.hasOriginal(hostPi, "renderWelcomeTip")) {
          this.saveOriginal(hostPi, "renderWelcomeTip");
          const origTip = hostPi.renderWelcomeTip;

          hostPi.renderWelcomeTip = function (tip: string, boxWidth: number, phase = 0) {
            const localizedTip = localizer.localizeText(tip);
            return origTip.call(this, localizedTip, boxWidth, phase);
          };
          patchedAny = true;
        }

        // 1.3 Patch Text.prototype.render
        if (hostPi.Text?.prototype?.render && !this.hasOriginal(hostPi.Text.prototype, "render")) {
          this.saveOriginal(hostPi.Text.prototype, "render");
          const origTextRender = hostPi.Text.prototype.render;

          hostPi.Text.prototype.render = function (width: number) {
            const lines = origTextRender.call(this, width);
            return localizer.localizeLines(lines as string[]);
          };
          patchedAny = true;
        }

        // 1.4 Patch BorderedLoader.prototype.render
        if (hostPi.BorderedLoader?.prototype?.render && !this.hasOriginal(hostPi.BorderedLoader.prototype, "render")) {
          this.saveOriginal(hostPi.BorderedLoader.prototype, "render");
          const origLoader = hostPi.BorderedLoader.prototype.render;

          hostPi.BorderedLoader.prototype.render = function (width: number) {
            const lines = origLoader.call(this, width);
            return localizer.localizeLines(lines as string[]);
          };
          patchedAny = true;
        }

        // 1.5 Patch CustomEditor prototype hierarchy to wrap AutocompleteProvider
        if (hostPi.CustomEditor?.prototype) {
          const Editor = Object.getPrototypeOf(hostPi.CustomEditor.prototype)?.constructor;
          if (Editor?.prototype?.setAutocompleteProvider && !this.hasOriginal(Editor.prototype, "setAutocompleteProvider")) {
            this.saveOriginal(Editor.prototype, "setAutocompleteProvider");
            const origSetProvider = Editor.prototype.setAutocompleteProvider;

            Editor.prototype.setAutocompleteProvider = function (provider: any) {
              if (provider && typeof provider.getSuggestions === "function") {
                const origGetSuggestions = provider.getSuggestions;
                provider.getSuggestions = async function (...args: any[]) {
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

    // 2. Universal terminal stream safety net (intercepts ProcessTerminal & TUI direct paints)
    try {
      if (typeof process?.stdout?.write === "function" && !this.hasOriginal(process.stdout, "write")) {
        this.saveOriginal(process.stdout, "write");
        const origStdoutWrite = process.stdout.write.bind(process.stdout);
        const patcherRef = this;

        process.stdout.write = function (
          chunk: any,
          encodingOrCallback?: any,
          callback?: any
        ): boolean {
          if (!patcherRef.isPatched) {
            return origStdoutWrite(chunk, encodingOrCallback, callback);
          }

          if (typeof chunk === "string" && chunk.length > 0) {
            if (
              chunk.includes("Welcome back!") ||
              chunk.includes("Tips") ||
              chunk.includes("Tip:") ||
              chunk.includes("No models available") ||
              chunk.includes("Update Available") ||
              chunk.includes("New version") ||
              chunk.includes("LSP Servers") ||
              chunk.includes("Recent sessions") ||
              chunk.includes("for prompt actions") ||
              chunk.includes("for commands") ||
              chunk.includes("to run bash") ||
              chunk.includes("to run python") ||
              chunk.includes("Thinking...")
            ) {
              const lines = chunk.split("\n");
              const localized = lines.map((l) => localizer.localizeLine(l)).join("\n");
              return origStdoutWrite(localized, encodingOrCallback, callback);
            }
          } else if (Buffer.isBuffer(chunk) && chunk.length > 0) {
            const str = chunk.toString("utf8");
            if (
              str.includes("Welcome back!") ||
              str.includes("Tips") ||
              str.includes("Tip:") ||
              str.includes("No models available") ||
              str.includes("Update Available") ||
              str.includes("New version") ||
              str.includes("LSP Servers") ||
              str.includes("Recent sessions") ||
              str.includes("for prompt actions") ||
              str.includes("for commands") ||
              str.includes("to run bash") ||
              str.includes("to run python") ||
              str.includes("Thinking...")
            ) {
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

        process.stderr.write = function (
          chunk: any,
          encodingOrCallback?: any,
          callback?: any
        ): boolean {
          if (!patcherRef.isPatched) {
            return origStderrWrite(chunk, encodingOrCallback, callback);
          }
          if (typeof chunk === "string" && chunk.length > 0) {
            if (
              chunk.includes("No models available") ||
              chunk.includes("Update Available") ||
              chunk.includes("API key") ||
              chunk.includes("models.yml") ||
              chunk.includes("Error:")
            ) {
              const lines = chunk.split("\n");
              const localized = lines.map((l) => localizer.localizeLine(l)).join("\n");
              return origStderrWrite(localized, encodingOrCallback, callback);
            }
          } else if (Buffer.isBuffer(chunk) && chunk.length > 0) {
            const str = chunk.toString("utf8");
            if (
              str.includes("No models available") ||
              str.includes("Update Available") ||
              str.includes("API key") ||
              str.includes("models.yml") ||
              str.includes("Error:")
            ) {
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

    // 3. Fallback dynamic module imports for non-bundled environments & unit tests
    try {
      let piTui: any = null;
      try {
        piTui = await import("@oh-my-pi/pi-tui");
      } catch {
        try {
          piTui = await import("@earendil-works/pi-tui");
        } catch {
          // pi-tui not found
        }
      }

      if (piTui) {
        if (piTui.Text?.prototype?.render && !this.hasOriginal(piTui.Text.prototype, "render")) {
          this.saveOriginal(piTui.Text.prototype, "render");
          const origRender = piTui.Text.prototype.render;
          piTui.Text.prototype.render = function (width: number) {
            const lines = origRender.call(this, width);
            return localizer.localizeLines(lines);
          };
          patchedAny = true;
        }

        if (piTui.SelectList?.prototype?.render && !this.hasOriginal(piTui.SelectList.prototype, "render")) {
          this.saveOriginal(piTui.SelectList.prototype, "render");
          const origSelectRender = piTui.SelectList.prototype.render;
          piTui.SelectList.prototype.render = function (width: number) {
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

        if (piTui.CombinedAutocompleteProvider?.prototype?.getSuggestions && !this.hasOriginal(piTui.CombinedAutocompleteProvider.prototype, "getSuggestions")) {
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

        if (piTui.SettingsList?.prototype?.renderMainList && !this.hasOriginal(piTui.SettingsList.prototype, "renderMainList")) {
          this.saveOriginal(piTui.SettingsList.prototype, "renderMainList");
          const origSettingsRender = piTui.SettingsList.prototype.renderMainList;
          piTui.SettingsList.prototype.renderMainList = function (width: number) {
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
  wrapExtensionUI(ui: any): void {
    if (!ui) return;

    // 1. setStatus
    if (typeof ui.setStatus === "function") {
      const origSetStatus = ui.setStatus.bind(ui);
      ui.setStatus = (key: string, text?: string) => {
        if (text === undefined) {
          return origSetStatus(key);
        }
        const localized = this.localizer.localizeText(text);
        return origSetStatus(key, localized);
      };
    }

    // 2. setWorkingMessage
    if (typeof ui.setWorkingMessage === "function") {
      const origWorking = ui.setWorkingMessage.bind(ui);
      ui.setWorkingMessage = (message?: string) => {
        if (!message) return origWorking();
        const localized = this.localizer.localizeText(message);
        return origWorking(localized);
      };
    }

    // 3. select
    if (typeof ui.select === "function") {
      const origSelect = ui.select.bind(ui);
      ui.select = async (title: string, options: Array<{ label: string; value: any; description?: string }>, opts?: any) => {
        const localizedTitle = this.localizer.localizeText(title);
        const localizedOptions = options.map((opt) => ({
          ...opt,
          label: this.localizer.localizeText(opt.label),
          description: opt.description ? this.localizer.localizeText(opt.description) : opt.description
        }));
        return origSelect(localizedTitle, localizedOptions, opts);
      };
    }

    // 4. multiSelect
    if (typeof ui.multiSelect === "function") {
      const origMulti = ui.multiSelect.bind(ui);
      ui.multiSelect = async (title: string, options: Array<{ label: string; value: any; description?: string }>, opts?: any) => {
        const localizedTitle = this.localizer.localizeText(title);
        const localizedOptions = options.map((opt) => ({
          ...opt,
          label: this.localizer.localizeText(opt.label),
          description: opt.description ? this.localizer.localizeText(opt.description) : opt.description
        }));
        return origMulti(localizedTitle, localizedOptions, opts);
      };
    }

    // 5. confirm
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

  private hasOriginal(target: any, prop: string): boolean {
    return Boolean(this.originalMethods.get(target)?.has(prop));
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

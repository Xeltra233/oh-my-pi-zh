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
   * Attempt to dynamically patch @earendil-works/pi-tui classes
   */
  async patchPiTui(): Promise<boolean> {
    if (this.isPatched) return true;

    try {
      let piTui: any = null;

      // 1. Try @oh-my-pi/pi-tui (oh-my-pi runtime)
      try {
        piTui = await import("@oh-my-pi/pi-tui");
      } catch {
        // 2. Try @earendil-works/pi-tui (standard Pi runtime)
        try {
          piTui = await import("@earendil-works/pi-tui");
        } catch {
          // 3. Try global node_modules fallback for development/testing
          try {
            const globalTuiPath = "file:///C:/Users/Xeltra/AppData/Roaming/npm/node_modules/@earendil-works/pi-coding-agent/node_modules/@earendil-works/pi-tui/dist/index.js";
            piTui = await import(globalTuiPath);
          } catch {
            // pi-tui not found
          }
        }
      }

      if (!piTui) {
        logger.debug("pi-tui not found in current environment, skipping class patching.");
        return false;
      }

      // Patch Text.prototype.render
      if (piTui.Text?.prototype?.render) {
        this.saveOriginal(piTui.Text.prototype, "render");
        const origRender = piTui.Text.prototype.render;
        const localizer = this.localizer;

        piTui.Text.prototype.render = function (width: number) {
          const lines = origRender.call(this, width);
          return localizer.localizeLines(lines);
        };
      }

      // Patch TuiMainScreen.prototype.doRender
      if (piTui.TuiMainScreen?.prototype?.doRender) {
        this.saveOriginal(piTui.TuiMainScreen.prototype, "doRender");
        const origDoRender = piTui.TuiMainScreen.prototype.doRender;
        const localizer = this.localizer;

        piTui.TuiMainScreen.prototype.doRender = function () {
          // Intercept terminal.write or lines if available
          return origDoRender.call(this);
        };
      }

      // Patch SelectList.prototype.render
      if (piTui.SelectList?.prototype?.render) {
        this.saveOriginal(piTui.SelectList.prototype, "render");
        const origSelectRender = piTui.SelectList.prototype.render;
        const localizer = this.localizer;

        piTui.SelectList.prototype.render = function (width: number) {
          const lines = origSelectRender.call(this, width);
          return localizer.localizeLines(lines);
        };
      }

      // Patch SettingsList.prototype.renderMainList
      if (piTui.SettingsList?.prototype?.renderMainList) {
        this.saveOriginal(piTui.SettingsList.prototype, "renderMainList");
        const origSettingsRender = piTui.SettingsList.prototype.renderMainList;
        const localizer = this.localizer;

        piTui.SettingsList.prototype.renderMainList = function (width: number) {
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

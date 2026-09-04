import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { OhMyPiZhConfig } from "./types.js";
import { DEFAULT_CONFIG } from "./defaults.js";
import { parseJsonc } from "../shared/jsonc.js";
import { logger } from "../shared/logger.js";

function safeReadJsonc<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null;
  try {
    const raw = readFileSync(filePath, "utf-8");
    return parseJsonc<T>(raw);
  } catch (err) {
    logger.warn(`Failed to parse config at ${filePath}: ${String(err)}`);
    return null;
  }
}

export function loadConfig(cwd: string = process.cwd()): OhMyPiZhConfig {
  let merged: OhMyPiZhConfig = {
    ...DEFAULT_CONFIG,
    features: { ...DEFAULT_CONFIG.features }
  };

  // 1. Global config in ~/.pi/oh-my-pi-zh.jsonc
  const home = process.env.HOME || homedir();
  const globalPaths = [
    join(home, ".pi", "oh-my-pi-zh.jsonc"),
    join(home, ".pi", "oh-my-pi-zh.json")
  ];
  for (const p of globalPaths) {
    const data = safeReadJsonc<Partial<OhMyPiZhConfig>>(p);
    if (data) {
      merged = mergeConfig(merged, data);
      break;
    }
  }

  // 2. Project config in .oh-my-pi-zh.jsonc
  const projectPaths = [
    join(cwd, ".oh-my-pi-zh.jsonc"),
    join(cwd, ".oh-my-pi-zh.json")
  ];
  for (const p of projectPaths) {
    const data = safeReadJsonc<Partial<OhMyPiZhConfig>>(p);
    if (data) {
      merged = mergeConfig(merged, data);
      break;
    }
  }

  // 3. Fallback: check if .oh-my-pi.jsonc defines "zh" or "locale"
  const ompPaths = [
    join(cwd, ".oh-my-pi.jsonc"),
    join(cwd, ".oh-my-pi.json")
  ];
  for (const p of ompPaths) {
    const data = safeReadJsonc<{ zh?: Partial<OhMyPiZhConfig>; locale?: string }>(p);
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

export function mergeConfig(
  base: OhMyPiZhConfig,
  overrides: Partial<OhMyPiZhConfig>
): OhMyPiZhConfig {
  return {
    ...base,
    ...overrides,
    features: {
      ...base.features,
      ...(overrides.features ?? {})
    },
    customDictionary: {
      ...(base.customDictionary ?? {}),
      ...(overrides.customDictionary ?? {})
    }
  };
}

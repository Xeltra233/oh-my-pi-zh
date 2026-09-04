import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
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

export function getGlobalConfigPaths(): string[] {
  const home = process.env.HOME || homedir();
  return [
    join(home, ".omp", "oh-my-pi-zh.jsonc"),
    join(home, ".omp", "oh-my-pi-zh.json"),
    join(home, ".pi", "oh-my-pi-zh.jsonc"),
    join(home, ".pi", "oh-my-pi-zh.json")
  ];
}

export function findExistingConfigFile(cwd: string = process.cwd()): string | null {
  // 1. Check project paths
  const projectPaths = [
    join(cwd, ".oh-my-pi-zh.jsonc"),
    join(cwd, ".oh-my-pi-zh.json")
  ];
  for (const p of projectPaths) {
    if (existsSync(p)) return p;
  }

  // 2. Check global paths
  for (const p of getGlobalConfigPaths()) {
    if (existsSync(p)) return p;
  }

  return null;
}

export function getDefaultConfigWritePath(): string {
  const home = process.env.HOME || homedir();
  const existing = findExistingConfigFile();
  if (existing) return existing;

  const ompDir = join(home, ".omp");
  if (existsSync(ompDir)) {
    return join(ompDir, "oh-my-pi-zh.json");
  }
  const piDir = join(home, ".pi");
  if (existsSync(piDir)) {
    return join(piDir, "oh-my-pi-zh.json");
  }
  return join(ompDir, "oh-my-pi-zh.json");
}

export function saveUserConfig(updates: Partial<OhMyPiZhConfig>, targetPath?: string): boolean {
  try {
    const filePath = targetPath || getDefaultConfigWritePath();
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    let current: any = {};
    if (existsSync(filePath)) {
      try {
        current = parseJsonc(readFileSync(filePath, "utf-8")) || {};
      } catch {
        current = {};
      }
    }

    const nextConfig = {
      ...current,
      ...updates,
      ...(updates.features
        ? {
            features: {
              ...(current.features || {}),
              ...updates.features
            }
          }
        : {})
    };

    writeFileSync(filePath, JSON.stringify(nextConfig, null, 2) + "\n", "utf-8");
    logger.info(`Persisted user config to ${filePath}`);
    return true;
  } catch (err) {
    logger.warn(`Failed to save config: ${String(err)}`);
    return false;
  }
}

export function loadConfig(cwd: string = process.cwd()): OhMyPiZhConfig {
  let merged: OhMyPiZhConfig = {
    ...DEFAULT_CONFIG,
    features: { ...DEFAULT_CONFIG.features }
  };

  // 1. Global config in ~/.omp or ~/.pi
  for (const p of getGlobalConfigPaths()) {
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

#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");

function hasCommand(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const hasOmp = hasCommand("omp");
const hasPi = hasCommand("pi");

function getSettingsPath(isProject = false) {
  if (isProject) {
    return join(process.cwd(), ".pi", "settings.json");
  }
  return join(homedir(), ".pi", "agent", "settings.json");
}

function getOmpPluginsPath() {
  return join(homedir(), ".omp", "plugins", "package.json");
}

function loadJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

const args = process.argv.slice(2);
const command = args[0] || "help";
const isProject = args.includes("-l") || args.includes("--project");
const settingsPath = getSettingsPath(isProject);
const ompPluginsPath = getOmpPluginsPath();

switch (command) {
  case "install": {
    console.log("🇨🇳 正在执行 oh-my-pi-zh 终端 TUI 汉化插件安装...");
    const targetSpec = args[1] && !args[1].startsWith("-")
      ? args[1]
      : "github:Xeltra233/oh-my-pi-zh";

    let installed = false;

    // 1. Prioritize omp CLI
    if (hasOmp) {
      try {
        console.log(`📡 检测到 Oh My Pi (omp)，执行: omp install ${targetSpec}`);
        execSync(`omp install "${targetSpec}"`, { stdio: "inherit" });
        installed = true;
      } catch (err) {
        console.warn(`⚠️ omp install 失败 (${err.message})，尝试备用方式...`);
      }
    }

    // 2. Fallback to pi CLI
    if (!installed && hasPi) {
      try {
        console.log(`📡 尝试使用 pi install 命令: pi install ${isProject ? "-l " : ""}${targetSpec}`);
        execSync(`pi install ${isProject ? "-l " : ""}"${targetSpec}"`, { stdio: "inherit" });
        installed = true;
      } catch {
        // Continue to config fallback
      }
    }

    // 3. Fallback to direct settings.json edit
    if (!installed) {
      const settings = loadJson(settingsPath) || { packages: [] };
      if (!Array.isArray(settings.packages)) {
        settings.packages = [];
      }

      const existsIdx = settings.packages.findIndex((p) => {
        if (typeof p === "string") return p.includes("oh-my-pi-zh");
        if (p && typeof p === "object" && p.source) return p.source.includes("oh-my-pi-zh");
        return false;
      });

      if (existsIdx >= 0) {
        settings.packages[existsIdx] = targetSpec;
      } else {
        settings.packages.push(targetSpec);
      }

      const dir = dirname(settingsPath);
      if (existsSync(dir)) {
        writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
        console.log(`✅ 已写入设置文件: ${settingsPath}`);
        installed = true;
      }
    }

    if (installed) {
      console.log("\n🎉 安装成功！启动 omp (Oh My Pi) 即可直接享受中文 TUI 交互界面。");
    } else {
      console.error("\n❌ 安装失败，请检查 omp 环境。");
      process.exit(1);
    }
    break;
  }

  case "remove":
  case "uninstall": {
    console.log("🗑️  正在卸载 oh-my-pi-zh 插件...");
    let removed = false;

    // 1. OMP CLI
    if (hasOmp) {
      try {
        console.log("📡 执行 omp plugin uninstall oh-my-pi-zh...");
        execSync("omp plugin uninstall oh-my-pi-zh", { stdio: "inherit" });
        removed = true;
      } catch {
        // Fallback
      }
    }

    // 2. Pi CLI
    if (hasPi) {
      try {
        execSync(`pi remove ${isProject ? "-l " : ""}oh-my-pi-zh`, { stdio: "ignore" });
        removed = true;
      } catch {
        // Ignore
      }
    }

    // 3. Clean settings.json if exists
    const settings = loadJson(settingsPath);
    if (settings && Array.isArray(settings.packages)) {
      const initLen = settings.packages.length;
      settings.packages = settings.packages.filter((p) => {
        if (typeof p === "string") return !p.includes("oh-my-pi-zh");
        if (p && typeof p === "object" && p.source) return !p.source.includes("oh-my-pi-zh");
        return true;
      });
      if (settings.packages.length !== initLen) {
        writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
        console.log(`✅ 已从 ${settingsPath} 中移除注册项。`);
        removed = true;
      }
    }

    console.log("🎉 卸载完成，已恢复英文原生界面。");
    break;
  }

  case "status": {
    console.log("🔍 正在检查 oh-my-pi-zh 安装状态...");
    let isFound = false;

    // Check omp plugins
    const ompPkg = loadJson(ompPluginsPath);
    if (ompPkg?.dependencies?.["oh-my-pi-zh"]) {
      console.log(`✅ OMP 插件已安装: ${ompPkg.dependencies["oh-my-pi-zh"]}`);
      isFound = true;
    }

    // Check pi settings
    const settings = loadJson(settingsPath);
    const item = Array.isArray(settings?.packages)
      ? settings.packages.find((p) => (typeof p === "string" ? p.includes("oh-my-pi-zh") : p?.source?.includes("oh-my-pi-zh")))
      : null;

    if (item) {
      console.log(`✅ Pi 配置已注册: ${typeof item === "string" ? item : item.source}`);
      isFound = true;
    }

    if (!isFound) {
      console.log("⚪ 未检测到 oh-my-pi-zh 安装或注册项（系统当前保持纯净原生状态）。");
    }
    break;
  }

  case "doctor": {
    console.log("🩺 oh-my-pi-zh 诊断体检报告:");
    console.log(`- Node 版本: ${process.version}`);
    console.log(`- Oh My Pi (omp) CLI: ${hasOmp ? "✅ 存在可用" : "⚪ 未在 PATH 中检测到"}`);
    console.log(`- Pi CLI: ${hasPi ? "✅ 存在可用" : "⚪ 未在 PATH 中检测到"}`);
    console.log(`- OMP 插件清单: ${existsSync(ompPluginsPath) ? "✅ 存在 (" + ompPluginsPath + ")" : "⚪ 未找到"}`);

    const ompPkg = loadJson(ompPluginsPath);
    const isInstalledInOmp = Boolean(ompPkg?.dependencies?.["oh-my-pi-zh"]);
    console.log(`- OMP 中安装状态: ${isInstalledInOmp ? "✅ 已安装" : "⚪ 未安装"}`);
    break;
  }

  case "enable":
  case "on": {
    const configPath = join(homedir(), ".omp", "oh-my-pi-zh.json");
    let current = {};
    if (existsSync(configPath)) {
      try {
        current = JSON.parse(readFileSync(configPath, "utf-8"));
      } catch {}
    }
    current.enabled = true;
    const dir = dirname(configPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(configPath, JSON.stringify(current, null, 2) + "\n", "utf-8");
    console.log(`✅ 已启用 oh-my-pi-zh 汉化，配置已写入: ${configPath}`);
    break;
  }

  case "disable":
  case "off": {
    const configPath = join(homedir(), ".omp", "oh-my-pi-zh.json");
    let current = {};
    if (existsSync(configPath)) {
      try {
        current = JSON.parse(readFileSync(configPath, "utf-8"));
      } catch {}
    }
    current.enabled = false;
    const dir = dirname(configPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(configPath, JSON.stringify(current, null, 2) + "\n", "utf-8");
    console.log(`⚪ 已停用 oh-my-pi-zh 汉化并恢复英文原生界面，配置已写入: ${configPath}`);
    break;
  }

  case "help":
  default: {
    console.log(`
oh-my-pi-zh CLI 命令行管理工具

用法:
  oh-my-pi-zh <command> [options]

常用命令:
  install [source]    为 Oh My Pi (omp) 安装本插件
  remove              从 Oh My Pi 卸载本插件并恢复英文原生界面
  enable / on         持久化启用终端中文汉化
  disable / off       持久化停用汉化并恢复原生英文
  status              查看当前安装状态
  doctor              运行环境与配置健康体检诊断
`);
    break;
  }
}

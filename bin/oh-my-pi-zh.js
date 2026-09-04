#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");

function getSettingsPath(isProject = false) {
  if (isProject) {
    return join(process.cwd(), ".pi", "settings.json");
  }
  return join(homedir(), ".pi", "agent", "settings.json");
}

function loadSettings(settingsPath) {
  if (!existsSync(settingsPath)) {
    return { packages: [] };
  }
  try {
    const content = readFileSync(settingsPath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`❌ 解析配置文件失败: ${settingsPath} (${err.message})`);
    process.exit(1);
  }
}

function saveSettings(settingsPath, data) {
  const dir = dirname(settingsPath);
  if (!existsSync(dir)) {
    console.error(`❌ 目录不存在: ${dir}`);
    process.exit(1);
  }
  // Create backup
  if (existsSync(settingsPath)) {
    const backupPath = `${settingsPath}.bak.${Date.now()}`;
    copyFileSync(settingsPath, backupPath);
  }
  writeFileSync(settingsPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

const args = process.argv.slice(2);
const command = args[0] || "help";
const isProject = args.includes("-l") || args.includes("--project");
const settingsPath = getSettingsPath(isProject);

switch (command) {
  case "install": {
    console.log("🇨🇳 正在执行 oh-my-pi-zh 插件安装...");
    const targetSpec = args[1] && !args[1].startsWith("-")
      ? args[1]
      : (existsSync(join(pkgRoot, "package.json")) ? pkgRoot.replace(/\\/g, "/") : "git:github.com/Xeltra233/oh-my-pi-zh");

    // Try pi install first if pi command is available
    let piSucceeded = false;
    try {
      console.log(`📡 尝试使用 pi CLI 原生命令安装: pi install ${targetSpec}`);
      execSync(`pi install ${isProject ? "-l " : ""}"${targetSpec}"`, { stdio: "inherit" });
      piSucceeded = true;
    } catch {
      console.log("⚠️ pi CLI 命令未直接响应，转为直接配置 settings.json...");
    }

    if (!piSucceeded) {
      const settings = loadSettings(settingsPath);
      if (!Array.isArray(settings.packages)) {
        settings.packages = [];
      }

      const existingIndex = settings.packages.findIndex((p) => {
        if (typeof p === "string") return p.includes("oh-my-pi-zh");
        if (p && typeof p === "object" && p.source) return p.source.includes("oh-my-pi-zh");
        return false;
      });

      if (existingIndex >= 0) {
        settings.packages[existingIndex] = targetSpec;
        console.log(`🔄 更新已有插件项: ${targetSpec}`);
      } else {
        settings.packages.push(targetSpec);
        console.log(`➕ 添加新插件项: ${targetSpec}`);
      }

      saveSettings(settingsPath, settings);
      console.log(`✅ 配置文件已更新: ${settingsPath}`);
    }

    console.log("\n🎉 安装完成！在 Pi 会话中即可享受全中文 TUI 交互界面。");
    break;
  }

  case "remove":
  case "uninstall": {
    console.log("🗑️  正在卸载 oh-my-pi-zh 插件...");
    let piSucceeded = false;
    try {
      console.log("📡 尝试使用 pi CLI 原生命令卸载: pi remove oh-my-pi-zh");
      execSync(`pi remove ${isProject ? "-l " : ""}oh-my-pi-zh`, { stdio: "inherit" });
      piSucceeded = true;
    } catch {
      // Fallback
    }

    const settings = loadSettings(settingsPath);
    if (Array.isArray(settings.packages)) {
      const initialLen = settings.packages.length;
      settings.packages = settings.packages.filter((p) => {
        if (typeof p === "string") return !p.includes("oh-my-pi-zh");
        if (p && typeof p === "object" && p.source) return !p.source.includes("oh-my-pi-zh");
        return true;
      });

      if (settings.packages.length !== initialLen) {
        saveSettings(settingsPath, settings);
        console.log(`✅ 已从 ${settingsPath} 中移除插件。`);
      } else if (!piSucceeded) {
        console.log(`ℹ️  配置文件中未找到 oh-my-pi-zh 项。`);
      }
    }
    console.log("🎉 卸载完成，Pi 已恢复英文原生界面。");
    break;
  }

  case "status": {
    console.log(`🔍 正在检查 oh-my-pi-zh 安装状态 (${settingsPath})...`);
    const settings = loadSettings(settingsPath);
    const item = Array.isArray(settings.packages)
      ? settings.packages.find((p) => {
          if (typeof p === "string") return p.includes("oh-my-pi-zh");
          if (p && typeof p === "object" && p.source) return p.source.includes("oh-my-pi-zh");
          return false;
        })
      : null;

    if (item) {
      console.log(`✅ 已安装: ${typeof item === "string" ? item : JSON.stringify(item)}`);
    } else {
      console.log("⚪ 未在配置文件中检测到 oh-my-pi-zh 注册项。");
    }
    break;
  }

  case "doctor": {
    console.log("🩺 oh-my-pi-zh 诊断体检报告:");
    console.log(`- Node 版本: ${process.version}`);
    console.log(`- 插件根目录: ${pkgRoot}`);
    console.log(`- 配置文件路径: ${settingsPath} (${existsSync(settingsPath) ? "存在" : "不存在"})`);

    let hasPi = false;
    try {
      execSync("pi --version", { stdio: "ignore" });
      hasPi = true;
    } catch {
      hasPi = false;
    }
    console.log(`- Pi CLI 可执行性: ${hasPi ? "✅ 正常" : "⚠️ 未在系统 PATH 中检测到 pi 命令"}`);

    const settings = loadSettings(settingsPath);
    const item = Array.isArray(settings.packages)
      ? settings.packages.find((p) => (typeof p === "string" ? p.includes("oh-my-pi-zh") : p?.source?.includes("oh-my-pi-zh")))
      : null;
    console.log(`- 插件安装注册: ${item ? `✅ 已注册 (${typeof item === "string" ? item : item.source})` : "⚪ 未注册"}`);
    break;
  }

  case "help":
  default: {
    console.log(`
oh-my-pi-zh CLI 命令行管理工具

用法:
  oh-my-pi-zh <command> [options]

常用命令:
  install [source]    安装/注册插件 (可选: 本地路径 / git:github.com/... / npm:...)
  remove              卸载/注销插件并恢复英文原生界面
  status              查看当前安装状态
  doctor              运行环境与配置体检诊断

常用选项:
  -l, --project       对当前项目本地配置 (.pi/settings.json) 生效，默认为全局用户配置
`);
    break;
  }
}

import test from "node:test";
import assert from "node:assert/strict";
import { getTuiDictionary, TuiTextLocalizer, getVisibleWidth } from "../dist/index.js";

test("TuiTextLocalizer exact phrase match", () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);

  assert.equal(localizer.localizeText("Thinking..."), "正在深度思考...");
  assert.equal(localizer.localizeText("switch model"), "切换模型");
  assert.equal(localizer.localizeText("Read file"), "读取文件");
  assert.equal(localizer.localizeText("Automatic Theme"), "跟随系统主题");
  assert.equal(localizer.localizeText("Welcome back!"), "欢迎回来！");
  assert.equal(localizer.localizeText("Tips"), "小提示");
  assert.equal(localizer.localizeText(" for prompt actions"), " 提示词动作");
  assert.equal(localizer.localizeText("LSP Servers"), "语言服务器 (LSP)");
  assert.equal(localizer.localizeText("Recent sessions"), "最近历史会话");
});

test("TuiTextLocalizer OMP slash commands descriptions", () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);

  assert.equal(
    localizer.localizeText("Add a workspace directory to this session (multi-root)"),
    "将工作区目录添加到当前会话（多根目录）"
  );
  assert.equal(
    localizer.localizeText("Manage MCP servers (add, list, remove, test)"),
    "管理 MCP 服务（添加、列出、移除、测试）"
  );
  assert.equal(
    localizer.localizeText("Toggle fast mode (low-latency completion defaults)"),
    "开关快速模式（低延迟补全默认配置）"
  );
  assert.equal(
    localizer.localizeText("Open Extension Control Center dashboard"),
    "打开扩展控制中心仪表盘"
  );
  assert.equal(
    localizer.localizeText("Have the agent interview you in chat, then set up goal mode"),
    "让智能体在对话中向你访谈提问，随后进入目标导向模式"
  );
});

test("TuiTextLocalizer dynamic autocomplete descriptions", () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);

  assert.equal(localizer.localizeText("Plan: off"), "计划模式：关闭");
  assert.equal(localizer.localizeText("Plan: on (plan-1.md)"), "计划模式：开启 (plan-1.md)");
  assert.equal(localizer.localizeText("Vibe: on"), "即兴模式 (Vibe)：开启");
  assert.equal(localizer.localizeText("Vibe: blocked by goal mode"), "即兴模式 (Vibe)：已被 goal mode 阻塞");
  assert.equal(localizer.localizeText("Fast: off"), "快速模式：关闭");
  assert.equal(localizer.localizeText("Advisor: on"), "顾问模型：开启");
  assert.equal(localizer.localizeText("Computer use: off"), "计算机操作：关闭");
  assert.equal(localizer.localizeText("Model: anthropic/claude-3-5-sonnet"), "模型：anthropic/claude-3-5-sonnet");
  assert.equal(localizer.localizeText("Thinking level: high"), "思考等级：high");
});

test("TuiTextLocalizer warnings and update notifications", () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);

  assert.equal(localizer.localizeText("Update Available"), "发现新版本");
  assert.equal(
    localizer.localizeText("Warning: No models available. Configure a provider using /provider or check your API keys."),
    "警告：没有可用模型。请使用 /provider 配置提供商或检查 API 密钥。"
  );
  assert.equal(
    localizer.localizeText("New version 18.2.0 is available. Run: omp update"),
    "发现新版本 18.2.0 可用。请运行: omp update"
  );
});

test("TuiTextLocalizer tips from tips.txt", () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);

  assert.equal(
    localizer.localizeText("Ctrl+D can be used to exit, but with your draft saved!"),
    "按 Ctrl+D 即可退出，未发送的草稿会自动保存！"
  );
  assert.equal(
    localizer.localizeText("Tip: Press shift+tab to cycle through reasoning effort levels"),
    "提示：按 Shift+Tab 快速循环切换思考推理强度等级"
  );
});

test("TuiTextLocalizer pattern match with regex", () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);

  assert.equal(
    localizer.localizeText("oh-my-pi: 3 agents, 2 skills"),
    "oh-my-pi: 3 个智能体, 2 个技能"
  );
  assert.equal(
    localizer.localizeText("Executed in 45.2ms"),
    "执行耗时 45.2ms"
  );
  assert.equal(
    localizer.localizeText("Branch summary (2 commits, 1 file)"),
    "分支变更摘要 (2 commits, 1 file)"
  );
});

test("TuiTextLocalizer ANSI safe line replacement", () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);

  const rawLine = "\x1b[2mCtrl+O\x1b[22m \x1b[90mswitch model\x1b[39m \x1b[2mCtrl+T\x1b[22m \x1b[90mthinking\x1b[39m";
  const localizedLine = localizer.localizeLine(rawLine);

  assert.ok(localizedLine.includes("切换模型"));
  assert.ok(localizedLine.includes("思考"));
  assert.ok(localizedLine.includes("\x1b[2mCtrl+O\x1b[22m"));
  assert.ok(localizedLine.includes("\x1b[2mCtrl+T\x1b[22m"));
});

test("TuiTextLocalizer preserves box border alignment with mathematically exact width", () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);

  const testLine = "\x1b[2m│\x1b[0m\x1b[1m          Welcome back!          \x1b[0m\x1b[2m│\x1b[0m\x1b[1m\x1b[36m Tips\x1b[0m                                     \x1b[2m│\x1b[0m";
  const origWidth = getVisibleWidth(testLine);
  const localizedLine = localizer.localizeLine(testLine);
  const newWidth = getVisibleWidth(localizedLine);

  assert.equal(newWidth, origWidth, "Visual cell width must be strictly preserved across table borders");
  assert.ok(localizedLine.includes("欢迎回来！"));
  assert.ok(localizedLine.includes("小提示"));
  assert.ok(localizedLine.includes("│"));
});

test("TuiTextLocalizer preserves unknown text", () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);

  const customText = "git checkout -b feature/xyz";
  assert.equal(localizer.localizeText(customText), customText);
});

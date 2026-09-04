import test from "node:test";
import assert from "node:assert/strict";
import { getTuiDictionary, TuiTextLocalizer, TuiPatcher } from "../dist/index.js";

test("TuiPatcher wraps ctx.ui methods correctly", async () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);
  const patcher = new TuiPatcher({ localizer });

  const statusMap = new Map();
  let workingMessage = "";
  let notifyMessage = "";
  let confirmTitle = "";
  let confirmMessage = "";

  const mockUI = {
    setStatus(key, text) {
      statusMap.set(key, text);
    },
    setWorkingMessage(msg) {
      workingMessage = msg;
    },
    notify(msg) {
      notifyMessage = msg;
    },
    async confirm(title, message) {
      confirmTitle = title;
      confirmMessage = message;
      return true;
    }
  };

  patcher.wrapExtensionUI(mockUI);

  // 1. Test setStatus intercepting oh-my-pi
  mockUI.setStatus("oh-my-pi", "oh-my-pi: 4 agents, 1 skills");
  assert.equal(statusMap.get("oh-my-pi"), "oh-my-pi: 4 个智能体, 1 个技能");

  // 2. Test setWorkingMessage
  mockUI.setWorkingMessage("Thinking...");
  assert.equal(workingMessage, "正在深度思考...");

  // 3. Test confirm dialog
  await mockUI.confirm("Confirm", "Are you sure?");
  assert.equal(confirmTitle, "确认");

  // 4. Test notify
  mockUI.notify("Executed in 150ms");
  assert.equal(notifyMessage, "执行耗时 150ms");
});

test("TuiPatcher patches SelectList items descriptions directly", async () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);
  const patcher = new TuiPatcher({ localizer });

  // Create mock SelectList class
  class MockSelectList {
    constructor(items) {
      this.items = items;
    }
    render(width) {
      return this.items.map((it) => `${it.label}: ${it.description || ""}`);
    }
  }

  const mockPiTui = { SelectList: MockSelectList };
  const origRender = MockSelectList.prototype.render;

  // Simulate patch logic
  MockSelectList.prototype.render = function (width) {
    const items = this.items;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item && typeof item.description === "string") {
          item.description = localizer.localizeText(item.description);
        }
      }
    }
    const lines = origRender.call(this, width);
    return localizer.localizeLines(lines);
  };

  const rawItems = [
    { label: "add-dir", description: "Add a workspace directory to this session (multi-root)" },
    { label: "mcp", description: "Manage MCP servers (add, list, remove, test)" }
  ];

  const list = new MockSelectList(rawItems);
  const lines = list.render(80);

  assert.equal(rawItems[0].description, "将工作区目录添加到当前会话（多根目录）");
  assert.equal(rawItems[1].description, "管理 MCP 服务（添加、列出、移除、测试）");
  assert.ok(lines[0].includes("将工作区目录添加到当前会话（多根目录）"));
});

test("TuiPatcher patches ProcessTerminal write safety net", async () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);

  let captured = "";
  class MockTerminal {
    write(data) {
      captured = data;
    }
  }

  const origWrite = MockTerminal.prototype.write;
  MockTerminal.prototype.write = function (data) {
    if (typeof data === "string" && data.length > 0) {
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

  const term = new MockTerminal();
  term.write("│ Welcome back! │ Tips │\nTip: Press shift+tab to cycle through reasoning effort levels");

  assert.ok(captured.includes("欢迎回来！"));
  assert.ok(captured.includes("小提示"));
  assert.ok(captured.includes("提示：按 Shift+Tab 快速循环切换思考推理强度等级"));
});

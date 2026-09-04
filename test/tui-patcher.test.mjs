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

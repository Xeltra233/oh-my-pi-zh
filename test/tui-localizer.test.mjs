import test from "node:test";
import assert from "node:assert/strict";
import { getTuiDictionary, TuiTextLocalizer } from "../dist/index.js";

test("TuiTextLocalizer exact phrase match", () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);

  assert.equal(localizer.localizeText("Thinking..."), "正在深度思考...");
  assert.equal(localizer.localizeText("switch model"), "切换模型");
  assert.equal(localizer.localizeText("Read file"), "读取文件");
  assert.equal(localizer.localizeText("Automatic Theme"), "跟随系统主题");
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

test("TuiTextLocalizer preserves unknown text", () => {
  const dict = getTuiDictionary("zh-CN");
  const localizer = new TuiTextLocalizer(dict);

  const customText = "git checkout -b feature/xyz";
  assert.equal(localizer.localizeText(customText), customText);
});

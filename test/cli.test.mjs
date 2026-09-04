import test from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";

test("CLI bin/oh-my-pi-zh.js help command outputs usage info", () => {
  const output = execSync("node bin/oh-my-pi-zh.js help", { encoding: "utf-8" });
  assert.ok(output.includes("oh-my-pi-zh CLI 命令行管理工具"));
  assert.ok(output.includes("install"));
  assert.ok(output.includes("remove"));
  assert.ok(output.includes("doctor"));
});

test("CLI bin/oh-my-pi-zh.js doctor runs cleanly", () => {
  const output = execSync("node bin/oh-my-pi-zh.js doctor", { encoding: "utf-8" });
  assert.ok(output.includes("oh-my-pi-zh 诊断体检报告"));
  assert.ok(output.includes("Node 版本"));
});

test("CLI bin/oh-my-pi-zh.js status runs cleanly", () => {
  const output = execSync("node bin/oh-my-pi-zh.js status", { encoding: "utf-8" });
  assert.ok(output.includes("检查 oh-my-pi-zh 安装状态"));
});

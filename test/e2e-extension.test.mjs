import test from "node:test";
import assert from "node:assert/strict";
import ohMyPiZh from "../dist/extension.js";

test("E2E Pi extension lifecycle and slash command execution", async () => {
  const eventHandlers = new Map();
  const commands = new Map();

  const mockPi = {
    on(event, handler) {
      if (!eventHandlers.has(event)) {
        eventHandlers.set(event, []);
      }
      eventHandlers.get(event).push(handler);
    },
    registerCommand(name, options) {
      commands.set(name, options);
    },
    registerMarkdownTransformer(transformer) {
      this.transformer = transformer;
    }
  };

  // 1. Initialize extension
  await ohMyPiZh(mockPi);

  assert.ok(commands.has("oh-my-pi-zh"), "Should register /oh-my-pi-zh command");
  assert.ok(commands.has("omp-zh"), "Should register /omp-zh shortcut alias");
  assert.ok(eventHandlers.has("session_start"), "Should register session_start hook");
  assert.ok(eventHandlers.has("session_shutdown"), "Should register session_shutdown hook");

  // 2. Simulate session_start with mock ctx.ui
  const statusItems = new Map();
  let latestNotification = "";

  const mockCtx = {
    cwd: process.cwd(),
    ui: {
      setStatus(key, text) {
        if (text === undefined) {
          statusItems.delete(key);
        } else {
          statusItems.set(key, text);
        }
      },
      setWorkingMessage(msg) {
        this.workingMessage = msg;
      },
      notify(msg, type) {
        latestNotification = msg;
      }
    }
  };

  const startHooks = eventHandlers.get("session_start");
  for (const hook of startHooks) {
    await hook({}, mockCtx);
  }

  // Verify status indicator
  assert.equal(statusItems.get("oh-my-pi-zh"), "🇨🇳 TUI:中文");

  // Verify setStatus translation on third-party indicators (oh-my-pi)
  mockCtx.ui.setStatus("oh-my-pi", "oh-my-pi: 5 agents, 3 skills");
  assert.equal(statusItems.get("oh-my-pi"), "oh-my-pi: 5 个智能体, 3 个技能");

  // Verify setWorkingMessage translation
  mockCtx.ui.setWorkingMessage("Thinking...");
  assert.equal(mockCtx.ui.workingMessage, "正在深度思考...");

  // 3. Test slash command /oh-my-pi-zh status
  const cmd = commands.get("oh-my-pi-zh");
  await cmd.handler("status", mockCtx);
  assert.ok(latestNotification.includes("TUI 终端汉化状态: 已开启"));

  // 4. Test slash command /oh-my-pi-zh doctor
  await cmd.handler("doctor", mockCtx);
  assert.ok(latestNotification.includes("体检诊断报告"));
  assert.ok(latestNotification.includes("已启用"));

  // 5. Test slash command /oh-my-pi-zh off (Disable)
  await cmd.handler("off", mockCtx);
  assert.ok(latestNotification.includes("已停用"));
  assert.equal(statusItems.has("oh-my-pi-zh"), false);

  // 6. Test slash command /oh-my-pi-zh on (Re-enable)
  await cmd.handler("on", mockCtx);
  assert.ok(latestNotification.includes("已启用"));
  assert.equal(statusItems.get("oh-my-pi-zh"), "🇨🇳 TUI:中文");

  // 7. Simulate session_shutdown
  const shutdownHooks = eventHandlers.get("session_shutdown");
  for (const hook of shutdownHooks) {
    await hook({}, mockCtx);
  }
});

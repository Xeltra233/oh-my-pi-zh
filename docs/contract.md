# oh-my-pi-zh 终端 TUI 汉化架构与契约规范

> 本文档定义 `oh-my-pi-zh` 作为专注于 **TUI（终端用户界面交互）汉化**的外挂插件契约、拦截机制与回滚策略。

---

## 1. 架构定位

`oh-my-pi-zh` 是专为 `oh-my-pi` 与底层 Pi CLI 打造的 **非侵入式终端 TUI 汉化外挂插件**。

- **聚焦终端界面**：将用户在终端中直接见到的状态栏（Footer）、按键提示（Keybinding hints）、选择器/设置列表（SelectList / SettingsList）、工具调用与执行反馈（Tool Execution）、系统弹窗/对话框（Dialogs）、加载器（Loaders）及 oh-my-pi 专有状态提示精准汉化为简体中文。
- **不干预模型推理**：撤回并避免对 LLM 内部工程提示词（System Prompt、Skills、Prompts）的直接翻译，保证智能体原生英文提示词的工程逻辑完整度与代码生成能力不受任何损耗。
- **纯外挂机制**：不修改 oh-my-pi 或 Pi CLI 的源码包，依靠 Pi 扩展生命周期、动态组件补丁与 `ctx.ui` 代理实现无缝注入与瞬时回滚。

---

## 2. 核心技术实现

### 2.1 拦截层级

```
Pi CLI 交互循环
   │
   ├── [1. 扩展生命周期] (session_start / session_shutdown)
   │     - 动态加载配置并初始化 TuiTextLocalizer
   │     - 状态栏显示 "🇨🇳 TUI:中文" 指示器
   │
   ├── [2. ctx.ui 交互代理]
   │     - 代理 ctx.ui.setStatus (精准拦截并汉化 "oh-my-pi: X agents, Y skills")
   │     - 代理 ctx.ui.setWorkingMessage (汉化 "Thinking...", "Working...")
   │     - 代理 ctx.ui.select / confirm / input / notify (汉化弹窗文本)
   │
   ├── [3. 组件级运行时补丁 (pi-tui)]
   │     - 拦截 Text.prototype.render (自动折行与 ANSI 样式安全处理)
   │     - 拦截 SelectList.prototype.renderItem (命令/列表选项提示汉化)
   │     - 拦截 SettingsList.prototype.renderMainList (设置列表与底栏操作提示汉化)
   │
   └── [4. Markdown 变换器] (pi.registerMarkdownTransformer)
         - 实时处理普通 Markdown 文本中的 UI Banner 与关键词
```

### 2.2 ANSI 转义序列安全保全
终端渲染中包含大量 ANSI 颜色控制字符（如 `\x1b[2mCtrl+O\x1b[22m \x1b[90mswitch model\x1b[39m`）。
- 词典项按长度倒序匹配，优先匹配长词组（如 `switch model` 优先于 `model`）。
- 严格基于词界与整句替换，替换纯文本的同时**原样保留全部前后 ANSI 颜色和样式标记**。
- 正则模式（如 `Executed in 120ms` -> `执行耗时 120ms`）精准提取数值与时间单位。

---

## 3. 启停与一键回滚

- 在 Pi 终端内键入 `/oh-my-pi-zh off`（或 `/omp-zh off`），插件立即撤销所有组件代理，恢复 100% 纯英文原生界面。
- 键入 `/oh-my-pi-zh on` 即可重新激活。
- 键入 `/oh-my-pi-zh doctor` 查看 TUI 汉化体检报告。

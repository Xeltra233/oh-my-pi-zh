# oh-my-pi-zh 汉化外挂插件架构与契约规范

> 本文档定义 `oh-my-pi-zh` 作为 `oh-my-pi` 外挂汉化扩展的生命周期契约、文本边界、容错降级及配置规范。

---

## 1. 架构定位

`oh-my-pi-zh` 是专为 `oh-my-pi`（及底层 Pi CLI）设计的**非侵入式外挂汉化插件**。

- **不修改上游源码**：不触碰 `oh-my-pi` 的安装目录、构建产物或上游 npm 包。
- **纯扩展生命周期挂载**：利用 Pi 的多扩展链式拦截能力（`before_agent_start` 等生命周期钩子），在运行时动态解析并汉化编排者提示词、命令交互及技能说明。
- **完全可逆与零残留**：禁用或卸载该插件后，系统立即无缝恢复纯英文上游行为。

---

## 2. 插件生命周期与接入契约

### 2.1 生命周期时序

```
Pi CLI 启动
   │
   ├── [session_start]
   │     1. 读取 ~/.pi/oh-my-pi-zh.jsonc 及当前项目 .oh-my-pi-zh.jsonc
   │     2. 初始化翻译字典与配置选项
   │     3. 挂载状态栏指示器 (ctx.ui)
   │
   ├── [resources_discover]
   │     1. 暴露中文技能路径 ./skills/
   │     2. 暴露中文提示词路径 ./prompts/
   │
   ├── [before_agent_start] (核心拦截点)
   │     1. 接收链式传入的 event.systemPrompt
   │     2. 探测是否存在 oh-my-pi 标志性特征（<oh-my-pi-state> / <Role> 等）
   │     3. 若存在且 enabled=true：
   │          - 解析各个 XML 结构段落与列表
   │          - 按边界安全规范汉化编排者角色、行为规范、约束、任务流及工具说明
   │          - 返回汉化后的 { systemPrompt }
   │     4. 若不存在或已禁用：直接返回原 systemPrompt（优雅透传）
   │
   └── [命令触发: /oh-my-pi-zh]
         - 提供 status / on / off / doctor 等交互子命令
```

### 2.2 幂等性与容错降级
1. **幂等性**：对已被汉化的文本具有特征识别能力，多次执行或重复调用绝不产生重复叠加。
2. **容错降级**：所有解析与替换均被 `try/catch` 严格保护。若遇到未知或变更的上游 prompt 格式，记录 debug 日志并回退至安全透传，绝不阻断 Pi 代理启动。

---

## 3. 文本边界与保全规范

### 3.1 严格保全（禁止翻译）
- **代码与脚本**：Markdown 代码块（` ```...``` `）与内联代码（` `...` `）内的变量、语法、配置。
- **标识符与名称**：
  - Agent 唯一标识（`oracle`, `librarian`, `explore`, `sisyphus-junior`, `metis`, `momus`, `multimodal-looker`）。
  - 分类标识（`quick`, `deep`, `ultrabrain`, `visual-engineering`, `artistry`, `writing`）。
  - 工具函数名（`oh_my_pi_delegate_task`, `oh_my_pi_subagent`, `glob`, `grep`, `interactive_bash`, `look_at`）。
  - 模型名称、配置参数键名、CLI 命令名（如 `oh-my-pi`, `pi`）。
- **结构化标记**：XML 标签名（`<Role>`, `</Role>`, `<Constraints>`, `<oh-my-pi-state>` 等）。
- **用户上下文**：用户的实际提示词、读取的文件内容、工作区路径等工程上下文。

### 3.2 目标汉化范围
- **角色定位 (`<Role>`)**：西西弗斯工匠精神、资深工程师标准、核心能力项说明。
- **行为指引 (`<Behavior_Instructions>`)**：意图判定闸门（Phase 0）、触发器规则、技能前置检查。
- **委派与顾问 (`<Delegation_Rules>`, `<Oracle_Usage>`)**：子任务分发原则、Oracle 何时咨询/何时禁止咨询。
- **约束与红线 (`<Constraints>`)**：严禁类型逃逸（`as any`）、严禁无指示提交、严禁妄断代码、严禁空异常捕获、严禁删除测试。
- **任务管理 (`<Task_Management>`)**：强制 Todo 工作流、拆解原子步骤原则。
- **花名册与工具说明 (`<Agents_Roster>`, `<Categories_Roster>`, `<Tools_Catalog>`)**：各 Agent、分类、工具的中文功能阐述。
- **交互与诊断输出**：`/oh-my-pi-zh` 状态输出与体检报告。

---

## 4. 字典格式与配置结构

### 4.1 字典架构 (TypeScript/JSON)
```typescript
export interface LocaleDictionary {
  metadata: {
    locale: string;
    version: string;
  };
  sections: {
    role: { ... };
    behavior: { ... };
    oracle: { ... };
    constraints: { ... };
    taskManagement: { ... };
    toolsCatalog: { ... };
    environment: { ... };
  };
  agents: Record<string, string>;
  categories: Record<string, string>;
  tools: Record<string, { description: string; promptSnippet?: string }>;
  doctor: Record<string, string>;
  messages: Record<string, string>;
}
```

### 4.2 配置文件规范 (`.oh-my-pi-zh.jsonc`)
```jsonc
{
  "$schema": "./schema/config.schema.json",
  "version": "0.2.0",
  "enabled": true,
  "locale": "zh-CN",
  "features": {
    "translateOrchestrator": true,
    "translateAgents": true,
    "translateCommands": true,
    "translateSkills": true,
    "statusIndicator": true
  },
  "customDictionary": {
    // 允许用户覆盖特定词条
  }
}
```

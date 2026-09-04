import type { TuiDictionary } from "./types.js";

export const tuiZhCN: TuiDictionary = {
  metadata: {
    locale: "zh-CN",
    displayName: "简体中文",
    version: "0.2.0"
  },

  phrases: {
    // 1. Welcome Screen & OMP Brand Elements
    "Welcome back!": "欢迎回来！",
    "Tips": "小提示",
    " for prompt actions": " 提示词动作",
    " for commands": " 斜杠命令",
    " to run bash": " 执行终端命令",
    " to run python": " 运行 Python 脚本",
    "LSP Servers": "语言服务器 (LSP)",
    "No LSP servers": "未连接语言服务器",
    "Recent sessions": "最近历史会话",
    "No recent sessions": "暂无历史会话",
    "Please use nerdfont 😭.": "请使用 Nerd 字体 😭。",

    // 2. Warnings & System Notices
    "Update Available": "发现新版本",
    "Run: omp update": "运行: omp update",
    "New version of omp is available": "发现 omp 新版本可用",
    "No models available": "没有可用模型",
    "Warning: No models available": "警告：没有可用模型",
    "Warning: No models available. Configure a provider using /provider or check your API keys.":
      "警告：没有可用模型。请使用 /provider 配置提供商或检查 API 密钥。",
    "Warning: No models available. Use /login or set an API key environment variable. Then use /model to select a model.":
      "警告：没有可用模型。请使用 /login 登录或设置 API 密钥环境变量，然后使用 /model 选择模型。",
    "No models available. Use /login or set an API key environment variable. Then use /model to select a model.":
      "没有可用模型。请使用 /login 登录或设置 API 密钥环境变量，然后使用 /model 选择模型。",
    "No models available. Set API keys in environment variables.":
      "没有可用模型。请在环境变量中设置对应的 API 密钥。",
    "Set an API key environment variable:": "请设置对应的 API 密钥环境变量：",
    "Configure auth for an allowed provider or adjust enabledModels.":
      "请为允许的提供商配置认证或调整 enabledModels 设置。",

    // 3. Keybinding descriptions
    "switch model": "切换模型",
    "switch provider": "切换提供商",
    "switch session": "切换会话",
    "cycle thinking level": "切换思考等级",
    "thinking level": "思考等级",
    "thinking": "思考",
    "abort": "中断",
    "cancel": "取消",
    "Cancel": "取消",
    "select": "选择",
    "Select": "选择",
    "confirm": "确认",
    "Confirm": "确认",
    "change": "更改",
    "search": "搜索",
    "expand": "展开",
    "collapse": "折叠",
    "details": "详情",
    "tree": "分支树",
    "fork": "分叉",
    "delete": "删除",
    "rename": "重命名",
    "exit": "退出",
    "help": "帮助",
    "refresh": "刷新",
    "toggle": "切换",
    "back": "返回",
    "new line": "换行",
    "send message": "发送消息",

    // 4. Loaders and thinking indicators
    "Thinking...": "正在深度思考...",
    "Working...": "正在处理任务...",
    "Compacting...": "正在压缩会话上下文...",
    "Streaming...": "正在生成回答...",
    "Executing...": "正在执行中...",
    "Loading...": "正在加载...",

    // 5. Footer & token usage
    "tokens": "代币",
    "cost": "费用",
    "context": "上下文",
    "branch": "分支",
    "cache read": "缓存命中",
    "cache write": "写入缓存",
    "total": "总计",
    "Session:": "会话:",
    "Model:": "模型:",

    // 6. Tool execution status
    "Running...": "正在执行...",
    "Read file": "读取文件",
    "Write file": "写入文件",
    "Edit file": "编辑文件",
    "Bash command": "终端命令",
    "Find files": "查找文件",
    "Search files": "搜索文件内容",
    "List directory": "列出目录内容",
    "Delegate task": "委派子任务",
    "Sub-agent": "子代理协同",
    "Executed in": "执行耗时",
    "Exit code": "退出码",
    "Lines changed": "改动行数",

    // 7. Dialog & Selector hints
    "Type to search · Enter/Space to change · Esc to cancel": "输入搜索 · 回车/空格修改 · Esc取消",
    "Enter/Space to change · Esc to cancel": "回车/空格修改 · Esc取消",
    "No matching commands": "未找到匹配的命令",
    "No matching settings": "未找到匹配的设置",
    "No matching models": "未找到匹配的模型",
    "No matching providers": "未找到匹配的提供商",
    "No settings available": "暂无可用设置项",
    "No providers available": "未找到可用提供商",
    "Select provider to configure:": "选择要配置的提供商：",
    "Select provider to logout:": "选择要注销的提供商：",

    // 8. Settings Selector options
    "Theme": "界面主题",
    "Automatic Theme": "跟随系统主题",
    "Dark Theme": "深色暗黑主题",
    "Light Theme": "明亮浅色主题",
    "Always trust": "始终信任",
    "Never trust": "从不信任",
    "No reasoning": "关闭深度思考 (0)",
    "Maximum reasoning": "最大深度思考",
    "Model Configuration": "模型高级配置",
    "Model unavailable": "当前模型不可用",
    "Project trust": "项目级安全性信任",
    "Extensions": "扩展程序 (Extensions)",
    "Skills": "技能列表 (Skills)",
    "Prompts": "提示词模板 (Prompts)",
    "Themes": "主题配色 (Themes)",
    "User settings": "全局用户设置",
    "Project settings": "项目本地设置",

    // 9. Session Selector
    "Resume Session (Current Folder)": "恢复会话（当前工作区）",
    "Resume Session (All)": "恢复会话（所有历史）",
    "Fork from Message": "从该消息节点分叉",
    "Session moved to trash": "会话已移至回收站",

    // 10. Slash commands autocomplete descriptions (Full OMP Suite)
    "Add a workspace directory to this session (multi-root)": "将工作区目录添加到当前会话（多根目录）",
    "Ask an ephemeral side question using the current session context": "在当前会话上下文中插入临时旁支提问",
    "Clear the conversation context in place, keeping the session": "清空当前对话上下文并保留会话",
    "Copy session transcript to clipboard (and write LLM request JSON to tmp)": "复制会话对话记录到剪贴板（并将 LLM 请求 JSON 写入临时目录）",
    "Create a new fork from a previous message": "从指定历史消息创建新的分叉",
    "Delete the current session and start a new one": "删除当前会话并开启新会话",
    "Detect and fix project diagnostics with weighted parallel subagents": "使用加权并行子代理检测并修复项目诊断报错",
    "Drop heavy content from context (tool results, large blocks)": "从上下文中剔除沉重内容（工具结果、大文本块）",
    "Exit the application": "退出应用程序",
    "Export session to HTML file": "将当前会话导出为 HTML 文件",
    "Force next turn to use a specific tool": "强制下一回合调用指定工具",
    "Forge a TTSR rule from a complaint to stop a recurring behavior": "从批评中提炼固化 TTSR 规则，防止模型重蹈覆辙",
    "Freeze all agents (main, subagents, advisor) until resumed": "冻结所有智能体（主代理、子代理、顾问），直到手动恢复",
    "Hand off session context to a new session": "将当前会话上下文移交至新会话",
    "Have the agent interview you in chat, then set up goal mode": "让智能体在对话中向你访谈提问，随后进入目标导向模式",
    "Inspect and operate memory maintenance": "检查并执行长效记忆维护",
    "Join a shared collab session": "加入实时共享协作会话",
    "Launch the local stats dashboard": "启动本地统计分析看板",
    "Leave the collab session": "离开当前共享协作会话",
    "List this session's workspace directories": "列出当前会话的所有工作区目录",
    "Login with OAuth provider": "使用 OAuth 提供商登录授权",
    "Logout from OAuth provider": "注销 OAuth 提供商登录状态",
    "Manage MCP servers (add, list, remove, test)": "管理 MCP 服务（添加、列出、移除、测试）",
    "Manage SSH hosts (add, list, remove)": "管理 SSH 主机（添加、列出、移除）",
    "Manage marketplace plugin sources and installed plugins": "管理插件市场源与已安装插件",
    "Manually compact the session context": "手动压缩当前会话上下文",
    "Move the current session to a different directory": "将当前会话移动至其他工作目录",
    "Move this session into a new worktree, changes included": "将当前会话移动至新的 Git worktree（包含未提交更改）",
    "Navigate session tree (switch branches)": "浏览会话历史分支树（切换分支）",
    "Open Extension Control Center dashboard": "打开扩展控制中心仪表盘",
    "Open debug tools selector": "打开调试工具选择器",
    "Open provider setup": "打开提供商配置向导",
    "Open settings menu": "打开用户设置菜单",
    "Open the agents hub (per-agent model, prewalk, and advisor)": "打开智能体控制中心（多代理模型、前置遍历与顾问）",
    "Open the git UI (split diff viewer, staging, commit composer)": "打开 Git 交互界面（分屏 Diff 查看、暂存、提交编写）",
    "Open the last link from the conversation in your browser (or pick one with /copy)": "在浏览器中打开对话中的最新链接（或使用 /copy 选择）",
    "Open the live Agent Hub": "打开实时智能体中心",
    "Open this session's trace in the stats dashboard": "在统计看板中打开当前会话的调用追踪",
    "Pick text or code from the conversation to copy": "从对话中选取文本或代码复制到剪贴板",
    "Pin or unpin a session at the top of the resume list": "在会话恢复列表顶部置顶或取消置顶会话",
    "Plan, run, inspect, import, and compare OMP-native security scans": "规划、运行、检查、导入与比对原生安全扫描",
    "Queue a message for after the agent yields": "排队消息，待智能体回合结束后发送",
    "Quit the application": "退出应用程序",
    "Re-open the plan review for the latest plan (plan mode only)": "重新打开最新计划的计划评审（仅限计划模式）",
    "Reload all plugins (skills, commands, hooks, tools, agents, MCP)": "重新加载所有插件（技能、命令、钩子、工具、代理、MCP）",
    "Remove a workspace directory from this session": "从当前会话中移除工作区目录",
    "Rename the current session": "重命名当前会话",
    "Reset provider stream state without changing the local transcript": "重置提供商流式状态（不改变本地对话记录）",
    "Restart omp with the same launch flags, resuming this session": "使用相同的启动参数重启 omp 并恢复当前会话",
    "Resume a different session": "恢复并切换到其他历史会话",
    "Retry the last failed agent turn": "重试上一个失败的智能体回合",
    "Rewind to a previous message, keeping the old path as a branch": "倒退回先前的某条消息，旧路径保留为独立分支",
    "Run a full background agent on tangential work": "在后台启动完整智能体执行旁支衍生任务",
    "Session management commands": "会话管理系列命令",
    "Share session via an encrypted link (share server or secret gist)": "通过加密链接分享会话（分享服务器或机密 Gist）",
    "Share this session live via a relay": "通过中继服务器实时在线分享此会话",
    "Show session info and stats": "显示会话详细信息与统计数据",
    "Show tokens, context window usage, and limits": "显示 Token 与上下文窗口使用情况及限额",
    "Show, add, or remove pinned credentials for this project": "查看、添加或移除当前项目的固定凭据",
    "Start a new session": "开始一个全新的空会话",
    "Start Codex-backed realtime voice mode": "启动基于 Codex 的实时语音对话模式",
    "Switch the active model or change its settings": "切换当前模型或修改其设置参数",
    "Switch to a different provider": "切换至其他模型提供商",
    "Toggle fast mode (low-latency completion defaults)": "开关快速模式（低延迟补全默认配置）",
    "Toggle goal mode (persistent autonomous objective for this session)": "开关目标导向模式（当前会话的持久自主目标）",
    "Toggle planning mode (requires approval before implementation)": "开关规划模式（实现前须经方案审批）",
    "Toggle the advisor (a second model that reviews each turn and injects notes)": "开关顾问模型（第二模型，每回合审查并注入建议）",
    "Toggle vibe mode (direct persistent fast/good worker sessions; read-only toolset)": "开关即兴模式 (Vibe)（持久高效工作流，只读工具集）",

    // Subcommands
    "Add an SSH host": "添加 SSH 主机",
    "List all configured SSH hosts": "列出所有已配置的 SSH 主机",
    "Remove an SSH host": "移除 SSH 主机",
    "Add a new MCP server": "添加新的 MCP 服务",
    "List all configured MCP servers": "列出所有已配置的 MCP 服务",
    "Remove an MCP server": "移除指定的 MCP 服务",
    "Test connection to a server": "测试与 MCP 服务的连通性",
    "Reconnect to a specific MCP server": "重新连接指定 MCP 服务",
    "Force reload MCP runtime tools": "强制重新加载 MCP 运行时工具",
    "Install a plugin (interactive browser if no args)": "安装插件（无参数时打开交互式浏览面板）",
    "Uninstall a plugin (selector if no args)": "卸载插件（无参数时打开选择面板）",
    "Upgrade outdated plugins": "升级已过期的插件",
    "Browse available plugins": "浏览所有可用插件",
    "List all installed plugins (npm + marketplace)": "列出已安装的所有插件（npm 与插件市场）",
    "Show help message": "显示帮助信息",
    "Show usage guide": "显示使用指南",
    "Enable fast mode": "启用快速模式",
    "Disable fast mode": "禁用快速模式",
    "Enable the advisor": "启用顾问模型",
    "Disable the advisor": "禁用顾问模型",
    "Show advisor status": "显示顾问模型运行状态",
    "Enable computer use for this session": "在当前会话中启用计算机操作",
    "Disable computer use for this session": "在当前会话中禁用计算机操作",
    "Strip tool results + large blocks (default)": "剔除工具结果与大文本块（默认）",
    "Strip image blocks": "剔除图片内容块",
    "Drop all thinking blocks": "丢弃所有深度思考块",
    "Set or replace the goal": "设定或替换当前任务目标",
    "Show current goal details": "显示当前目标详情",
    "Pause the current goal": "暂停当前目标任务",
    "Resume a paused goal": "恢复已暂停的目标任务",
    "Drop the current goal": "放弃当前目标任务",
    "Adjust the token budget": "调整 Token 预算上限",

    // Dynamic autocomplete descriptions
    "Plan: off": "计划模式：关闭",
    "Plan: disabled in settings": "计划模式：已在设置中禁用",
    "Plan: blocked by goal mode": "计划模式：已被目标模式阻塞",
    "Plan review: available": "计划评审：可用",
    "Plan review: plan mode inactive": "计划评审：计划模式未激活",
    "Vibe: on": "即兴模式 (Vibe)：开启",
    "Vibe: off": "即兴模式 (Vibe)：关闭",
    "Goal: off": "目标模式：关闭",
    "Goal: disabled in settings": "目标模式：已在设置中禁用",
    "Fast: on": "快速模式：开启",
    "Fast: off": "快速模式：关闭",
    "Advisor: on": "顾问模型：开启",
    "Advisor: off": "顾问模型：关闭",
    "Computer use: on": "计算机操作：开启",
    "Computer use: off": "计算机操作：关闭",
    "Extended context: on": "长上下文扩展：开启",
    "Extended context: off": "长上下文扩展：关闭",
    "Skills: in prompt": "技能列表：注入提示词",
    "Skills: omitted": "技能列表：已省略",
    "Model: none selected": "模型：未选择",

    // 11. Tips from tips.txt
    'Tired of typing "keep going"? Just send a \'.\'': '厌倦了反复输入“继续”？只需发送一个 \'.\' 即可',
    "You can /btw to ask a side question": "你可以使用 /btw 在当前上下文中插入简短旁支提问",
    "Use /tan to fork the current conversation into a background agent": "使用 /tan 将当前会话分叉并在后台启动独立子代理",
    "Ctrl+D can be used to exit, but with your draft saved!": "按 Ctrl+D 即可退出，未发送的草稿会自动保存！",
    "Find out which model you emotionally abuse the most with `omp stats`": "使用 `omp stats` 查看你使用最频繁的模型与统计分析",
    "Try task isolation to create CoW worktrees": "尝试任务隔离机制，创建独立的写时复制 (CoW) git worktree",
    "Need a cheap nested model call? Use `completion(x...)`. Have a big batch of tasks? Ask clanker to use it!": "需要轻量嵌套模型调用？使用 `completion(x...)` 批量执行任务",
    "Spaghetti code? Try complaining with /omfg": "代码杂乱无章？尝试使用 /omfg 吐槽代码以固化改进规则 (TTSR)",
    "Did you know? Each kitty/tmux/cmux/zellij/wezterm split keeps its own session — `omp -c` resumes the right one": "你知道吗？每个终端分屏拥有独立会话，运行 `omp -c` 即可精准恢复",
    "Drop the word `ultrathink` in your message for harder multi-step reasoning — watch it glow rainbow as you type": "在消息中输入 `ultrathink` 触发更强大的多步深度思考（输入时有彩虹特效）",
    "Say `orchestrate` in your message to drive a multi-phase task with parallel subagents — watch it glow as you type": "在消息中输入 `orchestrate` 可启动多阶段并行子代理协同编排",
    "Say `workflowz` in your message to drive the task with parallel subagents in eval — watch it glow as you type": "在消息中输入 `workflowz` 可在评估模式下使用并行子代理执行任务",
    "Log in to several accounts of the same provider — `/login` again — and omp load-balances across them automatically": "同一提供商可登录多个账号（再次 `/login`），omp 会自动进行轮询负载均衡",
    "Run `omp auth-broker serve` once and every machine pulls live tokens over the wire — refresh keys never leave the host; `omp auth-gateway` fronts it as a drop-in proxy any OpenAI-compatible client can hit": "运行 `omp auth-broker serve` 可向内网共享 Token，配合 `auth-gateway` 可作为统一代理接入",
    "Press alt+p (or /switch) to switch provider, and ctrl+p to cycle role models smol -> slow -> etc": "按 Alt+P (或 /switch) 切换提供商，按 Ctrl+P 切换模型角色预设",
    "Press ctrl+r to search your prompt history and reuse a past message": "按 Ctrl+R 搜索提示历史并快速复用历史消息",
    "`/force read` pins the next turn to one specific tool when the model keeps reaching for the wrong one": "模型选错工具时，使用 `/force <tool>` 强制下次回合使用指定工具",
    "`/copy code` grabs the last code block to your clipboard — `/copy cmd` grabs the last shell/python command": "使用 `/copy code` 复制最新代码块，`/copy cmd` 复制最新终端命令",
    "`/shake` rips heavy tool results out of context to reclaim tokens without a full /compact — `/shake images` drops just images": "使用 `/shake` 剔除沉重的工具执行结果以节省上下文 Token，无需完全压缩",
    "Pair up live: `/collab` shares your session through an end-to-end encrypted relay link — a teammate runs `/join <link>` to watch tool calls stream and prompt the agent from their own omp": "实时协同：使用 `/collab` 生成端到端加密链接，队友使用 `/join <link>` 即可实时加入",
    "Press ← ← to drill into a running or finished agent and inspect its tool calls and transcript": "连按两次左箭头 ← ← 即可深入查看子代理的工具调用与完整对话记录",
    "Hit a Codex rate limit? `/usage reset` spends a saved reset credit to immediately restore your quota": "遇到 Codex 限流？使用 `/usage reset` 消耗重置额度立即恢复配额",
    "No native tool_calling? Inference provider botches parsing them? `PI_DIALECT=glm|kimi|anthropic…` rolls it locally for them!": "模型不支持原生工具调用？使用环境变量 `PI_DIALECT` 本地适配方言！",
    "Turn on `/advisor` to attach a second model that reviews every turn and quietly injects advice": "启用 `/advisor` 挂载第二模型，在每回合静默审查并提供建议指导",
    "Try starting your prompt with a ->, and writing a list (1. Do X, 2. Do Y)": "尝试在提示词开头加上 -> 并编写步骤清单（1. 执行 X，2. 执行 Y）",
    "Press shift+tab to cycle through reasoning effort levels": "按 Shift+Tab 快速循环切换思考推理强度等级",
    "Lint/type errors piling up? `omp cleanse` (or /cleanse right here) hunts project diagnostics and fixes them with parallel subagents — esc cancels": "错误堆积？使用 `omp cleanse` (或 /cleanse) 启动并行子代理自动扫描并修复项目诊断",

    // 12. Plugin Management
    "oh-my-pi: degraded": "oh-my-pi: 降级模式 (degraded)",
    "Hot-reload oh-my-pi config without restarting Pi": "热重载 oh-my-pi 配置文件（无需重启 Pi）",
    "Diagnose oh-my-pi installation health": "诊断 oh-my-pi 安装运行状态与健康度"
  },

  patterns: [
    // Dynamic Tip format: "Tip: ..."
    {
      regex: /^Tip:\s*(.+)$/,
      replacement: "提示：$1"
    },
    // New version banner: "New version X is available. Run: omp update"
    {
      regex: /New version\s+([^\s]+)\s+is available\.\s*Run:\s*(.*)/i,
      replacement: "发现新版本 $1 可用。请运行: $2"
    },
    {
      regex: /New version\s+([^\s]+)\s+is available/i,
      replacement: "发现新版本 $1 可用"
    },
    {
      regex: /Or create\s+(.*models\.yml)/i,
      replacement: "或创建 $1 配置文件"
    },
    // Model fallback message pattern: "Could not restore model X. Using Y/Z"
    {
      regex: /Could not restore model\s+([^\s.]+)(?:\.\s*Using\s+([^\s]+))?/,
      replacement: "无法恢复模型 $1${$2 ? '。已回退使用 ' + $2 : ''}"
    },
    // Dynamic Plan: Plan: on (foo.md)
    {
      regex: /^Plan:\s*on(?:\s*\(([^)]+)\))?$/,
      replacement: (_match, file) => file ? `计划模式：开启 (${file})` : "计划模式：开启"
    },
    // Dynamic Vibe blocked
    {
      regex: /^Vibe:\s*blocked by (.+)$/,
      replacement: "即兴模式 (Vibe)：已被 $1 阻塞"
    },
    // Dynamic Goal blocked or state
    {
      regex: /^Goal:\s*blocked by (.+)$/,
      replacement: "目标模式：已被 $1 阻塞"
    },
    {
      regex: /^Goal:\s*(in_progress|completed|paused|active)\s*\((.+)\)$/,
      replacement: "目标模式：$1 ($2)"
    },
    // Dynamic Model: Model: anthropic/claude-3-5-sonnet
    {
      regex: /^Model:\s*([^\s]+)$/,
      replacement: "模型：$1"
    },
    // Dynamic Thinking level: Thinking level: high
    {
      regex: /^Thinking level:\s*([^\s]+)$/,
      replacement: "思考等级：$1"
    },
    // Status in footer: oh-my-pi: 3 agents, 2 skills
    {
      regex: /oh-my-pi:\s*(\d+)\s*agents?,\s*(\d+)\s*skills?/g,
      replacement: (_match, agents, skills) => `oh-my-pi: ${agents} 个智能体, ${skills} 个技能`
    },
    // Executed in 123ms
    {
      regex: /Executed in\s+(\d+(?:\.\d+)?(?:ms|s))/g,
      replacement: "执行耗时 $1"
    },
    // Branch summary (X commits, Y files)
    {
      regex: /Branch summary\s*\(([^)]+)\)/g,
      replacement: "分支变更摘要 ($1)"
    },
    // Response was truncated before completion
    {
      regex: /Response was truncated before completion/g,
      replacement: "回复在完成前被截断"
    }
  ],

  keyHints: {
    "switch model": "切换模型",
    "switch provider": "切换提供商",
    "thinking": "思考",
    "abort": "中断",
    "cancel": "取消",
    "select": "选择",
    "confirm": "确认",
    "search": "搜索",
    "expand": "展开",
    "collapse": "折叠",
    "details": "详情",
    "tree": "分支树",
    "fork": "分叉",
    "delete": "删除",
    "rename": "重命名"
  },

  footer: {
    "tokens": "代币",
    "cost": "费用",
    "context": "上下文",
    "branch": "分支"
  },

  loaders: {
    "Thinking...": "正在深度思考...",
    "Working...": "正在处理任务...",
    "Compacting...": "正在压缩上下文...",
    "Streaming...": "正在生成回答..."
  },

  tools: {
    "Read file": "读取文件",
    "Write file": "写入文件",
    "Edit file": "编辑文件",
    "Bash command": "终端命令",
    "Find files": "查找文件",
    "Search files": "搜索文件"
  },

  dialogs: {
    "Confirm": "确认",
    "Cancel": "取消",
    "Close": "关闭",
    "Done": "完成"
  },

  omp: {
    "oh-my-pi: degraded": "oh-my-pi: 降级模式",
    "agents": "个智能体",
    "skills": "个技能"
  }
};

import type { TuiDictionary } from "./types.js";

export const tuiZhCN: TuiDictionary = {
  metadata: {
    locale: "zh-CN",
    displayName: "简体中文",
    version: "0.1.0"
  },

  phrases: {
    // Keybinding descriptions
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

    // Loaders and thinking indicators
    "Thinking...": "正在深度思考...",
    "Working...": "正在处理任务...",
    "Compacting...": "正在压缩会话上下文...",
    "Streaming...": "正在生成回答...",
    "Executing...": "正在执行中...",
    "Loading...": "正在加载...",

    // Footer & token usage
    "tokens": "代币",
    "cost": "费用",
    "context": "上下文",
    "branch": "分支",
    "cache read": "缓存命中",
    "cache write": "写入缓存",
    "total": "总计",
    "Session:": "会话:",
    "Model:": "模型:",

    // Tool execution status
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

    // Dialog & Selector hints
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

    // Settings Selector options
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

    // Session Selector
    "Resume Session (Current Folder)": "恢复会话（当前工作区）",
    "Resume Session (All)": "恢复会话（所有历史）",
    "Fork from Message": "从该消息节点分叉",
    "Session moved to trash": "会话已移至回收站",

    // oh-my-pi specific
    "oh-my-pi: degraded": "oh-my-pi: 降级模式 (degraded)",
    "Hot-reload oh-my-pi config without restarting Pi": "热重载 oh-my-pi 配置文件（无需重启 Pi）",
    "Diagnose oh-my-pi installation health": "诊断 oh-my-pi 安装运行状态与健康度"
  },

  patterns: [
    // oh-my-pi status in footer: oh-my-pi: 3 agents, 2 skills
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

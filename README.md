# oh-my-pi-zh 🇨🇳

> **专为 `oh-my-pi` 与 Pi CLI 打造的非侵入式终端 TUI（用户界面交互）中文汉化外挂插件**。

---

## 🌟 核心特性

- 🎯 **聚焦终端 TUI 交互体验**：全面汉化终端底部状态栏（Footer）、常用快捷键提示（Keybinding hints）、命令与设置列表（SelectList / SettingsList）、加载与深度思考指示器、工具调用与执行反馈（执行耗时、改动行数等）、弹窗对话框以及 oh-my-pi 专属状态指示器。
- 🛡️ **纯外挂零侵入**：不修改 `oh-my-pi` 或 Pi CLI 原生源码，通过生命周期钩子、`@earendil-works/pi-tui` 组件拦截与 `ctx.ui` 代理实现纯运行时汉化。
- 🧠 **绝对保全模型推理**：不修改、不翻译智能体底层的英文工程提示词（System Prompt）与技能代码（Skills），保证 LLM 逻辑完整性与代码生成质量不受任何损耗。
- 🎨 **ANSI 样式安全保全**：内置基于词界的 ANSI-safe 替换引擎，在汉化文本的同时原样保留终端所有色彩与样式转义符。
- ⚡ **无缝热切换与一键回滚**：在会话内即可通过斜杠命令随时开关汉化，卸载即 100% 恢复英文原生界面。

---

## 🚀 指令安装方式

本项目完全遵循 Pi Package 官方扩展标准，并同时提供**原生 Pi 命令安装**与**独立 CLI 脚本安装**两种途径：

### 方式一：Pi 原生指令安装（推荐）

直接在终端执行官方 `pi install` 命令：

```bash
# 1. 直接通过 GitHub 远程安装到全局
pi install git:github.com/Xeltra233/oh-my-pi-zh

# 或使用标准 https 协议
pi install https://github.com/Xeltra233/oh-my-pi-zh

# 2. 从本地克隆路径直接安装
pi install /path/to/oh-my-pi-zh

# 3. 临时免安装试用（单次会话生效，不修改全局配置）
pi -e git:github.com/Xeltra233/oh-my-pi-zh
```

> **仅对当前项目生效**：添加 `-l` 参数即可将插件配置写入当前工作区的 `.pi/settings.json`：
> ```bash
> pi install -l git:github.com/Xeltra233/oh-my-pi-zh
> ```

---

### 方式二：独立 CLI 命令行工具安装

无需手动寻找或修改配置文件，直接通过内置 CLI 自动完成注册：

```bash
# 使用 npx 直接一键安装并写入配置
npx oh-my-pi-zh install

# 或者克隆本仓库后运行：
node bin/oh-my-pi-zh.js install

# 运行体检与健康诊断
npx oh-my-pi-zh doctor

# 查看安装状态
npx oh-my-pi-zh status
```

---

## 🎮 终端快捷管理命令

在运行 Pi CLI 会话中，可随时在输入框中输入以下斜杠命令：

| 命令 | 说明 |
| :--- | :--- |
| `/oh-my-pi-zh status` 或 `/omp-zh status` | 查看当前 TUI 汉化开启状态与语言版本 |
| `/oh-my-pi-zh on` | 立即激活终端 TUI 汉化并显示中文状态栏指示器 |
| `/oh-my-pi-zh off` | 立即停用汉化，无缝恢复英文原生界面 |
| `/oh-my-pi-zh doctor` | 输出当前插件运行时与界面状态诊断报告 |

---

## 🗑️ 卸载与还原

若不再需要汉化插件，可随时完全卸载：

```bash
# 方式一：通过 Pi 原生命令卸载
pi remove oh-my-pi-zh

# 方式二：通过 CLI 命令一键移除
npx oh-my-pi-zh remove
```

---

## 🛠️ 本地开发与测试

```bash
# 克隆仓库
git clone https://github.com/Xeltra233/oh-my-pi-zh.git
cd oh-my-pi-zh

# 执行打包构建（产物输出至 dist/）
npm run build

# 运行自动化测试套件
npm test
```

---

## 📄 开源许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

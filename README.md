# dsh-prompt

> 在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web 的会话输入框旁加入"✨ 增强提示词"按钮，由当前选中的 DSH 模型把草稿改写为更详细、结构化、目标明确的增强版，原始版与增强版可任选其一应用到输入框。

## 仓库 vs 包名

本仓库的 GitHub 名是 `illuvorite/dsh-prompt`，`package.json#name` 也是 `dsh-prompt`。安装时本地目录必须叫 `dsh-prompt`，否则 `dsh plugin add` 会因"仓库名字和插件名字不一样"而失败。

## 1. 简介

`dsh-prompt` 是 DeepSeek Harness Web 的独立 bundle。它不修改 DSH 主仓库代码，只通过 DSH 官方插件机制挂载一个 Host 命令与一个浏览器输入框控件。模型改写策略参考了开源 Prompt Enhancer / ChatGPT Enhance：让模型扮演提示词工程师，保留原始意图、补充目标/背景/要求/约束/输出格式、用原始语言返回纯文本结果。

- 不内置任何模型；
- 不内置任何 API Key；
- 不收集任何用户数据；
- 不修改 DSH 主仓库；
- 不需要 license key、激活码、账号绑定。

## 2. 运行环境 / 依赖

### 必备

| 项目 | 要求 |
|---|---|
| DeepSeek Harness | 已安装并能启动 Web profile，依赖其 `commands` Remote、`agentDefaultModel` 服务、`llm` 服务、`conversation.input.right` Slot |
| DSH Profile | 默认 `web`（可替换为你自己的 profile 名） |
| DSH 模型 | 已在 DSH Models 设置里配置并选中至少一个模型 |
| 操作系统 | Windows 10/11 / macOS / Linux |
| Node.js | 22.19+ 或 24+ |
| pnpm | 10+（源码版 DSH 必须） |
| 浏览器 | 最新版 Chrome / Edge / Firefox / Safari |

### 不需要

- 不需要 Python；
- 不需要数据库；
- 不需要 Docker；
- 不需要额外的 API Key（沿用 DSH 已配置的供应商凭据）；
- 不需要 license key / 激活码。

## 3. 安装

### A. 从 GitHub 安装（推荐）

```sh
dsh plugin --profile web add github:illuvorite/dsh-prompt
```

源码版 DSH：

```sh
pnpm dsh plugin --profile web add github:illuvorite/dsh-prompt
```

如果 pnpm 10+ 询问构建脚本授权，把 DSH 打印的精确包名加入该 profile 的 `pnpm-workspace.yaml`：

```yaml
allowBuilds:
  dsh-prompt: true
```

然后**重新执行** add 命令。

### B. 本地 clone 后安装

```sh
git clone https://github.com/illuvorite/dsh-prompt.git
dsh plugin --profile web add ./dsh-prompt
```

源码版：

```sh
git clone https://github.com/illuvorite/dsh-prompt.git
pnpm dsh plugin --profile web add ./dsh-prompt
```

### 验证安装

```sh
dsh plugin --profile web list
```

应能看到 `dsh-prompt`。

```sh
dsh --profile web --dump-config
```

应能看到 `dsh-prompt` 配置行。

### 卸载

```sh
dsh plugin --profile web remove dsh-prompt
```

### 升级

```sh
dsh plugin --profile web update dsh-prompt
```

## 4. 配置项

本插件没有运行时配置文件，也没有环境变量。所有行为由 DSH 自身配置与插件包内两个常量决定。

### 4.1 DSH 自身需要的配置

- 在 DSH Web 的 `Settings → Models` 中添加并选中至少一个模型；
- 供应商 API Key / 登录状态在 DSH 中配置（插件不接触这些凭据）。

### 4.2 插件包内可调常量

| 常量 | 默认 | 位置 | 作用 |
|---|---|---|---|
| `SYSTEM_PROMPT` | `You are a professional prompt engineer. Rewrite the user's prompt into a refined, detailed, and highly effective version that keeps the original intent...` | `index.js` | 改写提示词时使用的系统提示 |
| `MAX_TOKENS` | `2048` | `index.js` | 单次增强的最大输出 token |
| `ENHANCE_NAME` | `dsh-enhance` | `index.js` | 注册的 Host 命令名（即 `/dsh-enhance`） |

### 4.3 自定义改写风格

```sh
git clone https://github.com/illuvorite/dsh-prompt.git
cd dsh-prompt
# 编辑 index.js 中的 SYSTEM_PROMPT
```

示例：改为偏图像生成风格

```js
const SYSTEM_PROMPT = `You are a senior prompt engineer for text-to-image models. Rewrite the user's prompt into a vivid, highly descriptive version suitable for Midjourney / Stable Diffusion / DALL·E, in the same language as the input. Keep the original intent. Output ONLY the enhanced prompt, no preamble.`
```

重新安装：

```sh
dsh plugin --profile web remove dsh-prompt
dsh plugin --profile web add ./dsh-prompt
```

## 5. 启动命令

### 开发 / 调试

```sh
dsh --profile web
# 或：pnpm dsh --profile web
```

可选参数：

```sh
dsh --profile web --no-open       # 不自动打开浏览器
dsh --profile web --port 3080     # 自定义端口
dsh --profile web --host 0.0.0.0  # 监听所有网卡（CLI 可能拒绝）
```

### 生产

DSH Web 模式本身就是生产可用：

```sh
dsh --profile web
```

监听地址：

```text
http://127.0.0.1:3080
```

### 查看生效的组合配置

```sh
dsh --profile web --dump-config
```

### 插件运行验证

启动后浏览器强制刷新（`Ctrl+Shift+R` / `Cmd+Shift+R`），打开任意会话的输入框，右侧应出现：

```text
✨ 增强提示词
```

## 6. 使用方法

1. 在 DSH 会话输入框写一段草稿提示词；
2. 点击输入框旁的 **✨ 增强提示词**；
3. 等待（通常 3–10 秒）模型改写完成；
4. 在弹窗中切换 **原始版本** / **增强版本**；
5. 点击 **应用到输入框**，所选版本会写入输入框；
6. 检查无误后正常发送。

也可以直接调用命令：

```text
/dsh-enhance 帮我写个用户登录页
```

返回的 `text` 字段即为增强后的提示词。

## 7. 故障排查

### 输入框右侧没有按钮

- 确认安装完成：`dsh plugin --profile web list`；
- 确认当前是 `web` profile 而不是其他；
- 浏览器强制刷新；
- 重新启动 DSH Web。

### 点击按钮后报错 "请先选择并配置模型"

- 打开 DSH `Settings → Models`；
- 至少添加并选中一个支持文本生成的模型；
- 先用普通对话测试模型可用。

### 点击按钮后 "no model" / "llm-failed"

- API Key 无效 → 在 DSH 中重填；
- 账户额度 / 余额不足 → 充值或换号；
- 模型本身服务异常 → 切换其它模型测试；
- 网络或代理问题 → 检查网络；
- 查看 DSH 启动终端中的 Host 日志。

### 安装时报 "仓库名字和插件名字不一样"

- 确认 `git clone` 出来的目录名是 `dsh-prompt`；
- 确认 `package.json#name` 是 `dsh-prompt`；
- 必要时把目录重命名为 `dsh-prompt` 再 add：

  ```sh
  git clone https://github.com/illuvorite/dsh-prompt.git tmp
  mv tmp dsh-prompt
  dsh plugin --profile web add ./dsh-prompt
  ```

### pnpm 询问构建脚本授权

按 DSH 提示把 `dsh-prompt` 加到 `pnpm-workspace.yaml` 的 `allowBuilds`：

```yaml
allowBuilds:
  dsh-prompt: true
```

然后**重新** add。

## 8. 数据与隐私

- 本插件不存储任何提示词、会话、API Key、登录信息；
- 用户点击按钮时，原始草稿通过 DSH 已配置的模型供应商调用；
- 模型供应商的日志由供应商自身控制，与本插件无关；
- 不同电脑之间不共享任何状态，请独立配置模型凭据。

## 9. 兼容性

- 适用 DSH Web profile（提供 `commands` Remote 与 `conversation.input.right` Slot）；
- 适用任何 DSH 已支持的文本生成模型；
- 推荐 DSH 版本与本仓库当前 commit 时点匹配；
- 若未来 DSH 修改 `commands` / Slot / `agentDefaultModel` / `llm.stream` 接口，需更新本插件。

## 10. License

MIT

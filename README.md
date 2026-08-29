# dsh-prompt-enhancer

Standalone model-driven prompt enhancer for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web.

It adds a `✨ 增强提示词` control beside the conversation composer. The original draft is sent to the currently selected DSH model, which rewrites it while preserving the original intent. The UI shows the original and enhanced versions and lets you apply either one.

This repository is a DSH **bundle**, not a browser extension. It does not modify the Harness source tree or require the custom prompt-enhancer package from the main checkout. It uses only built-in DSH capabilities: the commands Remote, current model selection, LLM service, and conversation input Slot.

> **Repository name vs package name**: the GitHub repository is `illuvorite/dsh-prompt` and `package.json#name` is `dsh-prompt`. They must match for `dsh plugin add` to succeed. If you clone into a different directory name, rename the local directory to `dsh-prompt` before running `dsh plugin add ./dsh-prompt`.

## Requirements

- DeepSeek Harness with the Web profile and the built-in `commands` Remote.
- A configured and selected model in DSH.
- Node.js and pnpm only when installing from a Git checkout or running DSH from source.
- Recommended: the DSH version used by this repository's release/tag.

The feature itself has no separate license key, activation code, or purchase. Model-provider login/API credentials are still required and belong to the provider configured in DSH.

## Install from GitHub

Replace `web` with your profile name if needed:

```sh
dsh plugin --profile web add github:illuvorite/dsh-prompt
```

If pnpm asks to allow a build script, add the exact package key it prints to the profile's `pnpm-workspace.yaml` under `allowBuilds`, then repeat the command. For a source checkout of DSH, use:

```sh
pnpm dsh plugin --profile web add github:illuvorite/dsh-prompt
```

Restart the Web profile after installation:

```sh
dsh web --profile web
```

If your installed CLI uses the profile launcher form instead, use:

```sh
dsh --profile web
```

Then refresh `http://127.0.0.1:3080`. The control appears in the right side of the composer.

## Install a local checkout

```sh
git clone https://github.com/illuvorite/dsh-prompt.git
dsh plugin --profile web add ./dsh-prompt
```

For a source checkout of Harness:

```sh
pnpm dsh plugin --profile web add ./dsh-prompt
```

## Verify and remove

Inspect the composed configuration before starting:

```sh
dsh --profile web --dump-config
```

Remove the bundle with:

```sh
dsh plugin --profile web remove dsh-prompt-enhancer
```

Restart the profile after removal.

## Usage

1. Type a draft prompt in the composer.
2. Click `✨ 增强提示词`.
3. Wait for the current DSH model to rewrite the prompt.
4. Switch between `原始版本` and `增强版本`.
5. Click `应用到输入框` for the selected version.

The enhancement instruction asks the model to preserve intent, clarify goals/context/requirements/constraints/output format, use the original language, and return only the rewritten prompt.

## Credentials and data

This bundle does not store prompts, sessions, API keys, login cookies, or activation data. The draft is sent through the current DSH model route when the user clicks the control. Configure credentials separately on each machine. Do not commit provider keys to this repository.

## Compatibility

The bundle is designed for DSH Web profiles that provide the built-in commands Remote and the `conversation.input.right` Slot. Use a matching DSH release/tag. If a future DSH release changes those contracts, use a compatible tag or update the bundle.

## License

MIT

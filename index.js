import { createUserMessage } from '@deepseek-ai/dsh-llm'

export const name = 'dsh-prompt-enhancer'
export const inject = ['commands', 'agentDefaultModel', 'llm']

const SYSTEM_PROMPT = `You are a professional prompt engineer. Rewrite the user's prompt into a refined, detailed, and highly effective version that keeps the original intent. Clarify the goal, context, requirements, constraints, and expected output format. Write in the same language as the original prompt. Output ONLY the enhanced prompt, with no preamble, commentary, explanation, or surrounding quotes.`
const MAX_TOKENS = 2048

async function enhance(invocation, ctx) {
  const text = invocation.rawInput.trim()
  if (!text) return { kind: 'error', text: '请输入要增强的提示词。' }
  const selection = ctx.agentDefaultModel.currentSelection()
  if (selection === undefined || !selection.provider || !selection.model) {
    return { kind: 'error', text: '当前没有可用的模型，请先选择并配置模型。' }
  }
  let output = ''
  try {
    const options = {
      provider: selection.provider,
      model: selection.model,
      system: SYSTEM_PROMPT,
      messages: [createUserMessage({
        content: [{ type: 'text', text }],
        source: { kind: 'plugin', plugin: 'dsh-prompt-enhancer' },
      })],
      temperature: 0.7,
      maxTokens: MAX_TOKENS,
    }
    if (selection.reasoningEffort !== undefined) options.reasoningEffort = selection.reasoningEffort
    for await (const chunk of ctx.llm.stream(options)) {
      if (chunk.type === 'text-delta') output += chunk.text
      if (chunk.type === 'finish' && (chunk.reason.kind === 'error' || chunk.reason.kind === 'aborted')) {
        return { kind: 'error', text: `模型调用失败：${chunk.reason.kind}` }
      }
    }
  } catch (error) {
    return { kind: 'error', text: `模型调用失败：${error instanceof Error ? error.message : String(error)}` }
  }
  const enhanced = output.trim()
  return enhanced ? { kind: 'success', text: enhanced } : { kind: 'error', text: '模型没有返回增强后的提示词。' }
}

export function apply(ctx) {
  ctx.commands.register({
    name: 'dsh-enhance',
    description: 'rewrite the current prompt with the selected model',
    input: { hint: '<prompt>' },
    recordInput: false,
    handler: invocation => enhance(invocation, ctx),
  })
}

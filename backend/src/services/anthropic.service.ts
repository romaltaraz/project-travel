// AI provider: NVIDIA NIM (OpenAI-compatible API)
// API key comes exclusively from env — never reaches the client.
import OpenAI from 'openai';

const apiKey = process.env.NVIDIA_API_KEY;
if (!apiKey || apiKey === 'your_nvidia_api_key_here') {
  console.warn('⚠️  NVIDIA_API_KEY is not set — AI features will return 503');
}

const client = new OpenAI({
  apiKey:  apiKey ?? 'missing',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// Model with good tool-calling support on NVIDIA NIM
export const MODEL = 'meta/llama-3.1-70b-instruct';

/** Throws a 503 AppError when the API key is missing/placeholder. */
export function assertApiKey(): void {
  if (!apiKey || apiKey === 'your_nvidia_api_key_here') {
    const { AppError } = require('../middleware/errorHandler.js') as typeof import('../middleware/errorHandler.js');
    throw new AppError('AI features are not configured — set NVIDIA_API_KEY in your environment', 503);
  }
}

/** Simple text generation — returns the assistant reply as a string. */
export async function askClaude(
  userPrompt: string,
  systemPrompt?: string,
  maxTokens = 1024,
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages,
  });

  return response.choices[0].message.content ?? '';
}

// ---------------------------------------------------------------------------
// Tool-use types (OpenAI format)
// ---------------------------------------------------------------------------
export type NvTool = OpenAI.Chat.ChatCompletionTool;
export type NvMessage = OpenAI.Chat.ChatCompletionMessageParam;

export interface ToolCallResult {
  finishReason: string;
  text: string | null;
  toolCalls: { id: string; name: string; arguments: Record<string, unknown> }[];
}

/** One turn of the tool-calling loop. */
export async function callWithTools(
  messages: NvMessage[],
  tools: NvTool[],
  system?: string,
): Promise<ToolCallResult> {
  const allMessages: NvMessage[] = [];
  if (system) allMessages.push({ role: 'system', content: system });
  allMessages.push(...messages);

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 2048,
    tools,
    tool_choice: 'auto',
    messages: allMessages,
  });

  const choice = response.choices[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toolCalls = ((choice.message.tool_calls ?? []) as any[]).map((tc: any) => ({
    id:        tc.id as string,
    name:      tc.function?.name as string ?? tc.name as string,
    arguments: JSON.parse(tc.function?.arguments ?? tc.arguments ?? '{}') as Record<string, unknown>,
  }));

  return {
    finishReason: choice.finish_reason,
    text: choice.message.content,
    toolCalls,
  };
}

/** Append assistant turn (possibly with tool_calls) to message history. */
export function assistantTurn(
  text: string | null,
  toolCalls: ToolCallResult['toolCalls'],
): OpenAI.Chat.ChatCompletionAssistantMessageParam {
  return {
    role: 'assistant',
    content: text,
    ...(toolCalls.length ? {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tool_calls: toolCalls.map(tc => ({ id: tc.id, type: 'function' as const, function: { name: tc.name, arguments: JSON.stringify(tc.arguments) } } as any)),
    } : {}),
  };
}

/** Append tool result(s) to message history. */
export function toolResultTurn(
  toolCallId: string,
  content: string,
): OpenAI.Chat.ChatCompletionToolMessageParam {
  return { role: 'tool', tool_call_id: toolCallId, content };
}

type OpenAIStructuredJsonOptions = {
  apiKey: string;
  model: string;
  instructions: string;
  input: unknown;
  schemaName: string;
  schema: Record<string, unknown>;
};

/**
 * Gọi OpenAI Responses API và ép model trả về JSON theo schema.
 *
 * Admin dùng AI cho các tác vụ có chi phí như dịch bài và gợi ý SEO. Gom helper
 * ở đây để mọi route cùng dùng một cách parse/validate phản hồi, tránh mỗi route
 * tự xử lý JSON text khác nhau.
 */
export async function requestOpenAIStructuredJson<T>({
  apiKey,
  model,
  instructions,
  input,
  schemaName,
  schema,
}: OpenAIStructuredJsonOptions): Promise<Partial<T>> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      instructions,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify(input),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getOpenAIErrorMessage(payload) || `OpenAI request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return parseOpenAIJson<T>(extractOpenAIOutputText(payload));
}

function extractOpenAIOutputText(payload: unknown) {
  if (typeof payload === 'object' && payload && 'output_text' in payload) {
    const outputText = (payload as { output_text?: unknown }).output_text;
    if (typeof outputText === 'string') return outputText;
  }

  const output = typeof payload === 'object' && payload && 'output' in payload
    ? (payload as { output?: unknown }).output
    : null;

  if (!Array.isArray(output)) return '';

  return output
    .flatMap((item) => {
      if (!item || typeof item !== 'object' || !('content' in item)) return [];
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) return [];
      return content.map((part) => {
        if (!part || typeof part !== 'object') return '';
        if ('text' in part && typeof (part as { text?: unknown }).text === 'string') {
          return (part as { text: string }).text;
        }
        return '';
      });
    })
    .join('');
}

function parseOpenAIJson<T>(value: string): Partial<T> {
  const trimmed = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  if (!trimmed) throw new Error('AI returned an empty response.');
  return JSON.parse(trimmed) as Partial<T>;
}

function getOpenAIErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) return '';
  const error = (payload as { error?: unknown }).error;
  if (!error || typeof error !== 'object' || !('message' in error)) return '';
  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' ? message : '';
}

/**
 * OpenRouter API utility — nvidia/nemotron-3-super-120b-a12b:free
 * Docs: https://openrouter.ai/docs
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

/**
 * Send a chat message to Nemotron via OpenRouter.
 *
 * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages
 * @param {object} [options]
 * @param {number} [options.temperature=0.7]
 * @param {number} [options.max_tokens=1024]
 * @returns {Promise<string>} The assistant reply text
 */
export async function chatWithNemotron(messages, options = {}) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error(
      'OpenRouter API key not set. Add VITE_OPENROUTER_API_KEY to your .env file.\n' +
      'Get a free key at: https://openrouter.ai/keys'
    );
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,   // Required by OpenRouter
      'X-Title': 'Rocket Nova',                  // Optional — appears in OpenRouter dashboard
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `OpenRouter error ${response.status}: ${err?.error?.message ?? response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

/**
 * Convenience: single-turn question → answer.
 *
 * @param {string} userMessage
 * @param {string} [systemPrompt]
 * @returns {Promise<string>}
 */
export async function askNemotron(userMessage, systemPrompt = '') {
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userMessage });
  return chatWithNemotron(messages);
}

export { MODEL as NEMOTRON_MODEL };

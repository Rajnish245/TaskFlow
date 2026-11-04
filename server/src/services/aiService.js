const axios = require('axios');

/** Cache TTL: 10 minutes in milliseconds */
const CACHE_TTL_MS = 10 * 60 * 1000;

/** In-memory response cache keyed by normalised goal string */
const cache = new Map();

/** Mistral API endpoint */
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

/**
 * Strip markdown code fences that some models inadvertently wrap around
 * JSON output despite the response_format instruction.
 *
 * @param {string} raw - The raw string from the model.
 * @returns {string} A string ready to be passed to JSON.parse.
 */
function stripCodeFences(raw) {
  return raw
    .replace(/^```(?:json)?\s*/i, '') // opening fence
    .replace(/\s*```$/i, '')          // closing fence
    .trim();
}

/**
 * Validate and normalise a single subtask object from the AI response.
 * Returns null for objects that are fundamentally invalid (no title).
 *
 * @param {unknown} item - Candidate subtask from the AI.
 * @returns {{ title: string, priority: 'High'|'Medium'|'Low' } | null}
 */
function normaliseSubtask(item) {
  if (!item || typeof item !== 'object') return null;

  const title = typeof item.title === 'string' ? item.title.trim() : '';
  if (!title) return null;

  const validPriorities = ['High', 'Medium', 'Low'];
  const priority = validPriorities.includes(item.priority) ? item.priority : 'Medium';

  return { title, priority };
}

/**
 * generateSubtasks — calls the Mistral chat-completions API to break a
 * high-level goal into 4-6 actionable subtasks.
 *
 * Results are cached in-memory for CACHE_TTL_MS milliseconds using the
 * normalised goal string as the key to avoid redundant API calls.
 *
 * @param {string} goal - The user's high-level goal (1–500 chars).
 * @returns {Promise<{ subtasks: Array<{ title: string, priority: string }> }>}
 * @throws {Error} With message "AI_RATE_LIMITED" when the upstream API returns 429.
 */
async function generateSubtasks(goal) {
  const cacheKey = goal.toLowerCase().trim();

  // --- Cache hit ---
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      return data;
    }
    // Expired — remove stale entry
    cache.delete(cacheKey);
  }

  // --- Call Mistral API ---
  let response;
  try {
    response = await axios.post(
      MISTRAL_API_URL,
      {
        model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content:
              'You are a project planning assistant. Return ONLY valid JSON with no markdown, no code fences. ' +
              'The JSON must have exactly this shape: {"subtasks":[{"title":"string","priority":"High|Medium|Low"}]}. ' +
              'Generate 4-6 subtasks.',
          },
          {
            role: 'user',
            content: `Generate subtasks for this goal: ${goal}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (axiosErr) {
    // Surface upstream rate-limit as a typed error the controller can handle
    if (axiosErr.response && axiosErr.response.status === 429) {
      const rateLimitedError = new Error('AI_RATE_LIMITED');
      rateLimitedError.statusCode = 429;
      throw rateLimitedError;
    }
    throw axiosErr;
  }

  // --- Parse response ---
  const rawContent = response.data.choices[0].message.content;
  const cleanedContent = stripCodeFences(rawContent);

  let parsed;
  try {
    parsed = JSON.parse(cleanedContent);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${rawContent}`);
  }

  // --- Validate & sanitise subtasks ---
  const rawSubtasks = Array.isArray(parsed.subtasks) ? parsed.subtasks : [];
  const subtasks = rawSubtasks
    .map(normaliseSubtask)
    .filter(Boolean)   // drop nulls from invalid items
    .slice(0, 6);      // cap at 6

  const result = { subtasks };

  // --- Store in cache ---
  cache.set(cacheKey, { data: result, timestamp: Date.now() });

  return result;
}

module.exports = { generateSubtasks };

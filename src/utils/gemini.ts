/**
 * Google Gemini API integration
 * Calls our backend API which proxies requests to Gemini
 * API key can be provided by user or stored securely on the server
 */

export interface GenerateTasksParams {
  prompt: string;
}

/**
 * Get the user's API key from localStorage if configured
 */
function getUserApiKey(): string | null {
  return localStorage.getItem('gemini_api_key');
}

interface BackendResponse {
  text?: string;
  error?: string;
  retryAfter?: number;
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable (overloaded, network issues, etc.)
 */
function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('overloaded') ||
    message.includes('service unavailable') ||
    message.includes('timeout') ||
    message.includes('network error') ||
    message.includes('failed to fetch')
  );
}

/**
 * Retry wrapper with exponential backoff
 * Automatically retries on overload and network errors
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on last attempt or non-retryable errors
      if (attempt === maxRetries || !isRetryableError(lastError)) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await sleep(delay);
    }
  }

  // eslint-disable-next-line no-throw-literal
  throw lastError!;
}

/**
 * Generates tasks using Google Gemini API via our backend
 * Model: gemini-1.5-flash-latest (fast and efficient)
 * Automatically retries on overload errors
 */
export async function generateTasks(params: GenerateTasksParams): Promise<string> {
  const { prompt } = params;

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt is required');
  }

  const systemPrompt = `You are a helpful assistant that generates checklist tasks.
Given a user's description, generate 5-8 specific, actionable tasks.
Return ONLY the tasks, one per line, without any introduction or conclusion.
Do not include numbering or bullet points - just the task text.`;

  const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}\n\nTasks:`;

  return withRetry(async () => {
    // Get user's API key if configured
    const userApiKey = getUserApiKey();

    // Call our backend API endpoint
    const response = await fetch('/api/generate-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        apiKey: userApiKey,
      }),
    });

    const data: BackendResponse = await response.json();

    if (!response.ok) {
      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = data.retryAfter || 60;
        throw new Error(
          `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`
        );
      }
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('API returned empty response');
    }

    return data.text;
  });
}

/**
 * Rewrites a task title using AI
 */
export async function rewriteTask(taskTitle: string): Promise<string> {
  if (!taskTitle || taskTitle.trim().length === 0) {
    throw new Error('Task title is required');
  }

  return withRetry(async () => {
    // Get user's API key if configured
    const userApiKey = getUserApiKey();

    const response = await fetch('/api/generate-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Rewrite this task to be clearer and more actionable (respond with ONLY the rewritten task, no numbering or bullets): "${taskTitle}"`,
        apiKey: userApiKey, // Send user's API key if available
      }),
    });

    const data: BackendResponse = await response.json();

    if (!response.ok) {
      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = data.retryAfter || 60;
        throw new Error(
          `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`
        );
      }
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('API returned empty response');
    }

    // Clean up the response
    return data.text.trim().replace(/^["']|["']$/g, '');
  });
}

/**
 * Generates sub-steps for a task using AI
 */
export async function generateSubSteps(taskTitle: string): Promise<string> {
  if (!taskTitle || taskTitle.trim().length === 0) {
    throw new Error('Task title is required');
  }

  return withRetry(async () => {
    // Get user's API key if configured
    const userApiKey = getUserApiKey();

    const response = await fetch('/api/generate-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Break down this task into 3-5 specific sub-steps (respond with one sub-step per line, no numbering or bullets): "${taskTitle}"`,
        apiKey: userApiKey, // Send user's API key if available
      }),
    });

    const data: BackendResponse = await response.json();

    if (!response.ok) {
      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = data.retryAfter || 60;
        throw new Error(
          `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`
        );
      }
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('API returned empty response');
    }

    return data.text;
  });
}

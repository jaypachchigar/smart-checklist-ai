/**
 * Google Gemini API integration
 * Calls our backend API which proxies requests to Gemini
 * API key is stored securely on the server
 */

export interface GenerateTasksParams {
  prompt: string;
}

interface BackendResponse {
  text?: string;
  error?: string;
}

/**
 * Generates tasks using Google Gemini API via our backend
 * Model: gemini-1.5-flash-latest (fast and efficient)
 * No API key needed - handled by the server
 */
export async function generateTasks(params: GenerateTasksParams): Promise<string> {
  const { prompt } = params;

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt is required');
  }

  try {
    // Call our backend API endpoint
    const response = await fetch('/api/generate-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
      }),
    });

    const data: BackendResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('API returned empty response');
    }

    return data.text;
  } catch (error) {
    // Handle different error types
    if (error instanceof Error) {
      throw new Error(`Failed to generate tasks: ${error.message}`);
    }
    throw new Error('Unknown error occurred while generating tasks');
  }
}

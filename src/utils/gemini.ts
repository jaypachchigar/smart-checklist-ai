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

/**
 * Rewrites a task title using AI
 */
export async function rewriteTask(taskTitle: string): Promise<string> {
  if (!taskTitle || taskTitle.trim().length === 0) {
    throw new Error('Task title is required');
  }

  try {
    const response = await fetch('/api/generate-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Rewrite this task to be clearer and more actionable (respond with ONLY the rewritten task, no numbering or bullets): "${taskTitle}"`,
      }),
    });

    const data: BackendResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('API returned empty response');
    }

    // Clean up the response
    return data.text.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to rewrite task: ${error.message}`);
    }
    throw new Error('Unknown error occurred while rewriting task');
  }
}

/**
 * Generates sub-steps for a task using AI
 */
export async function generateSubSteps(taskTitle: string): Promise<string> {
  if (!taskTitle || taskTitle.trim().length === 0) {
    throw new Error('Task title is required');
  }

  try {
    const response = await fetch('/api/generate-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Break down this task into 3-5 specific sub-steps (respond with one sub-step per line, no numbering or bullets): "${taskTitle}"`,
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
    if (error instanceof Error) {
      throw new Error(`Failed to generate sub-steps: ${error.message}`);
    }
    throw new Error('Unknown error occurred while generating sub-steps');
  }
}

/**
 * Google Gemini API integration
 * Uses the Gemini REST API directly with fetch
 */

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export interface GenerateTasksParams {
  prompt: string;
  apiKey: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code?: number;
  };
}

/**
 * Generates tasks using Google Gemini API
 * Model: gemini-pro (stable and reliable)
 * Uses REST API directly for maximum compatibility
 */
export async function generateTasks(params: GenerateTasksParams): Promise<string> {
  const { prompt, apiKey } = params;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API key is required');
  }

  try {
    // Create a well-structured prompt for task generation
    const systemPrompt = `You are a helpful assistant that generates checklist tasks.
Given a user's description, generate 5-8 specific, actionable tasks.
Return ONLY the tasks, one per line, without any introduction or conclusion.
Do not include numbering or bullet points - just the task text.`;

    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}\n\nTasks:`;

    // Make the REST API call to Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API request failed with status ${response.status}`
      );
    }

    const data: GeminiResponse = await response.json();

    // Handle API errors in response
    if (data.error) {
      throw new Error(data.error.message);
    }

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text || text.trim().length === 0) {
      throw new Error('Gemini API returned empty response');
    }

    return text;
  } catch (error) {
    // Handle different error types
    if (error instanceof Error) {
      // Check for common API errors
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key')) {
        throw new Error('Invalid API key. Please check your Google AI API key.');
      }
      if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while calling Gemini API');
  }
}

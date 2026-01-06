/**
 * Google Gemini API integration
 * Uses the official @google/generative-ai SDK
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export interface GenerateTasksParams {
  prompt: string;
  apiKey: string;
}

/**
 * Generates tasks using Google Gemini API
 * Model: gemini-1.5-flash (fast and efficient)
 */
export async function generateTasks(params: GenerateTasksParams): Promise<string> {
  const { prompt, apiKey } = params;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API key is required');
  }

  try {
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create a well-structured prompt for task generation
    const systemPrompt = `You are a helpful assistant that generates checklist tasks.
Given a user's description, generate 5-8 specific, actionable tasks.
Return ONLY the tasks, one per line, without any introduction or conclusion.
Do not include numbering or bullet points - just the task text.`;

    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}\n\nTasks:`;

    // Make the API call
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Gemini API returned empty response');
    }

    return text;
  } catch (error) {
    // Handle different error types
    if (error instanceof Error) {
      // Check for common API errors
      if (error.message.includes('API key')) {
        throw new Error('Invalid API key. Please check your Google AI API key.');
      }
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while calling Gemini API');
  }
}

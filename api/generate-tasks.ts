/**
 * Vercel Serverless Function
 * Proxies requests to Google Gemini API
 * Keeps API key secure on the server
 * Using gemini-pro model with v1 API
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment variable - using gemini-pro v1 stable
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable is not set');
    return res.status(500).json({
      error: 'Server configuration error. API key missing.'
    });
  }

  // Get prompt from request body
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Create a well-structured prompt for task generation
    const systemPrompt = `You are a helpful assistant that generates checklist tasks.
Given a user's description, generate 5-8 specific, actionable tasks.
Return ONLY the tasks, one per line, without any introduction or conclusion.
Do not include numbering or bullet points - just the task text.`;

    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}\n\nTasks:`;

    // Call Gemini API - using v1 API with gemini-pro (stable model)
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

    // Return the generated text
    return res.status(200).json({ text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Return user-friendly error
    return res.status(500).json({
      error: `Failed to generate tasks: ${errorMessage}`,
    });
  }
}

/**
 * Vercel Serverless Function
 * Proxies requests to Google Gemini API
 * Keeps API key secure on the server
 * Includes rate limiting and spam protection
 */

// Simple in-memory rate limiting (resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute
const MAX_PROMPT_LENGTH = 2000; // Maximum prompt length

function getRateLimitKey(req) {
  // Use IP address or fallback to a generic key
  return req.headers['x-forwarded-for'] ||
         req.headers['x-real-ip'] ||
         'unknown';
}

function checkRateLimit(key) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(key) || [];

  // Filter out old requests outside the window
  const recentRequests = userRequests.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(key, recentRequests);

  return true; // Within rate limit
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting check
  const rateLimitKey = getRateLimitKey(req);
  if (!checkRateLimit(rateLimitKey)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a minute before trying again.'
    });
  }

  // Get API key from environment variable
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

  // Check prompt length to prevent abuse
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      error: `Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.`
    });
  }

  try {
    // Use the prompt directly - it's already formatted from the client
    const fullPrompt = prompt;

    // Call Gemini API - using v1beta API with gemini-2.5-flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

    const data = await response.json();

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

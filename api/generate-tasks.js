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

  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - recentRequests.length);
  const oldestRequest = recentRequests[0];
  const resetTime = oldestRequest ? oldestRequest + RATE_LIMIT_WINDOW : now + RATE_LIMIT_WINDOW;

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000) // seconds
    };
  }

  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(key, recentRequests);

  return {
    allowed: true,
    remaining: remaining - 1, // -1 because we just added this request
    resetTime,
    retryAfter: 0
  };
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting check
  const rateLimitKey = getRateLimitKey(req);
  const rateLimitInfo = checkRateLimit(rateLimitKey);

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
  res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(rateLimitInfo.resetTime).toISOString());

  if (!rateLimitInfo.allowed) {
    res.setHeader('Retry-After', rateLimitInfo.retryAfter.toString());
    return res.status(429).json({
      error: `Rate limit exceeded. Please wait ${rateLimitInfo.retryAfter} seconds before trying again.`,
      retryAfter: rateLimitInfo.retryAfter
    });
  }

  // Get prompt and API key from request body
  const { prompt, apiKey } = req.body;

  // Require user to provide API key (no environment variable fallback)
  if (!apiKey) {
    return res.status(400).json({
      error: 'API key required. Please add your Gemini API key in Settings.',
      requiresApiKey: true
    });
  }

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

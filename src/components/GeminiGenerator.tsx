/**
 * GeminiGenerator Component
 * AI-powered task generation using Google Gemini API
 * - User provides prompt
 * - Backend handles API call (no API key needed)
 * - Normalizes and inserts tasks
 */

import { useState } from 'react';
import { generateTasks } from '../utils/gemini';
import { parseGeminiResponse, normalizeTasks } from '../utils/normalizeTasks';
import { ChecklistItem } from '../types';

interface GeminiGeneratorProps {
  onTasksGenerated: (tasks: ChecklistItem[]) => void;
}

export function GeminiGenerator({ onTasksGenerated }: GeminiGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt describing the tasks you need');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Call backend API (no API key needed)
      const responseText = await generateTasks({
        prompt: prompt.trim(),
      });

      // Parse the response
      const rawTasks = parseGeminiResponse(responseText);

      // Normalize tasks
      const normalizedTasks = normalizeTasks(rawTasks);

      if (normalizedTasks.length === 0) {
        setError('No valid tasks could be generated. Please try a different prompt.');
        return;
      }

      // Pass tasks to parent component
      onTasksGenerated(normalizedTasks);

      // Clear prompt after successful generation
      setPrompt('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">AI Task Generator</h2>

      <div className="space-y-4">
        {/* Prompt input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What tasks do you need?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create an onboarding checklist for a small SaaS customer"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating tasks...
            </span>
          ) : (
            'Generate Tasks with AI'
          )}
        </button>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Info box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> Enter a description of what you need, and AI
            will generate 5-8 actionable tasks for you. The tasks will be automatically
            cleaned and added to your checklist. No API key needed!
          </p>
        </div>
      </div>
    </div>
  );
}

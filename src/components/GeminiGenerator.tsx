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
import { useTheme } from '../contexts/ThemeContext';

interface GeminiGeneratorProps {
  onTasksGenerated: (tasks: ChecklistItem[]) => void;
}

export function GeminiGenerator({ onTasksGenerated }: GeminiGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

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
    <div className={`rounded border p-4 h-full flex flex-col ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-300'
    }`}>
      <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AI Generator</h2>

      <div className="space-y-3 flex-1 flex flex-col">
        {/* Prompt input */}
        <div className="flex-1 flex flex-col">
          <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Describe your tasks
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create an onboarding checklist for new customers"
            rows={4}
            className={`w-full px-3 py-2 border text-sm rounded flex-1 ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={`w-full px-4 py-2 rounded border text-sm disabled:opacity-50 ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900 border-gray-300'
          }`}
        >
          {isLoading ? 'Generating...' : 'Generate with AI'}
        </button>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Info box */}
        <div className={`p-3 border rounded ${
          theme === 'dark'
            ? 'bg-gray-700/20 border-gray-600'
            : 'bg-gray-100 border-gray-300'
        }`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            AI will generate 5-8 actionable tasks based on your description.
          </p>
        </div>
      </div>
    </div>
  );
}

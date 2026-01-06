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
    <div className={`backdrop-blur-sm rounded-xl border p-5 h-full flex flex-col ${
      theme === 'dark'
        ? 'bg-slate-800/30 border-slate-700/30'
        : 'bg-white/60 border-slate-300/50'
    }`}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className={`p-1.5 rounded-lg border ${
          theme === 'dark'
            ? 'bg-slate-700/40 border-slate-600/30'
            : 'bg-slate-200/50 border-slate-300/30'
        }`}>
          <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className={`text-base font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>AI Generator</h2>
      </div>

      <div className="space-y-3.5 flex-1 flex flex-col">
        {/* Prompt input */}
        <div className="flex-1 flex flex-col">
          <label className={`block text-xs font-medium mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Describe your tasks
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create an onboarding checklist for new customers"
            rows={4}
            className={`w-full px-3 py-2.5 border text-sm rounded-lg focus:outline-none focus:ring-2 resize-none transition-all flex-1 ${
              theme === 'dark'
                ? 'bg-slate-900/40 border-slate-600/40 text-slate-100 placeholder-slate-500 focus:ring-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-slate-400'
            }`}
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={`w-full px-4 py-2.5 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed border text-sm ${
            theme === 'dark'
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600/40'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
              Generating...
            </span>
          ) : (
            'Generate with AI'
          )}
        </button>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg backdrop-blur-sm">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Info box */}
        <div className={`p-3 border rounded-lg ${
          theme === 'dark'
            ? 'bg-slate-700/20 border-slate-600/20'
            : 'bg-slate-100/50 border-slate-300/30'
        }`}>
          <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            AI will generate 5-8 actionable tasks based on your description. Tasks are automatically added to your checklist.
          </p>
        </div>
      </div>
    </div>
  );
}

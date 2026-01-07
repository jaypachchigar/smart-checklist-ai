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
    <div className="ai-panel">
      <h2 className="panel-title">ai helper</h2>

      <div className="ai-content">
        {/* Prompt input */}
        <div className="prompt-section">
          <label className="prompt-label">
            what do you need to do?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="plan a birthday party, study for finals, organize my room, etc"
            rows={4}
            className="prompt-input"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="generate-btn"
        >
          {isLoading ? 'working on it...' : 'generate tasks'}
        </button>

        {/* Error message */}
        {error && (
          <div className="error-box">
            <p className="error-text">{error}</p>
          </div>
        )}

        {/* Info box */}
        <div className="info-box">
          <p className="info-text">
            will generate 5-8 tasks based on your description
          </p>
        </div>
      </div>
    </div>
  );
}

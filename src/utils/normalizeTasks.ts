/**
 * Normalizes AI-generated task output into clean checklist items
 * - Removes numbering (1., 2., etc.)
 * - Removes bullets (-, *, •)
 * - Trims whitespace
 * - Deduplicates similar tasks
 * - Limits to 5-8 tasks
 */

import { ChecklistItem } from '../types';

export function normalizeTasks(rawTasks: string[]): ChecklistItem[] {
  const normalized = rawTasks
    .map((task) => {
      // Remove common numbering patterns: "1.", "1)", "1 -", etc.
      let cleaned = task.replace(/^\s*\d+[\.\)]\s*/, '');

      // Remove bullet points: -, *, •, ◦, etc.
      cleaned = cleaned.replace(/^\s*[-*•◦]\s*/, '');

      // Trim whitespace
      cleaned = cleaned.trim();

      return cleaned;
    })
    .filter((task) => task.length > 0); // Remove empty strings

  // Deduplicate: case-insensitive comparison
  const seen = new Set<string>();
  const deduplicated: string[] = [];

  for (const task of normalized) {
    const lower = task.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      deduplicated.push(task);
    }
  }

  // Limit to 5-8 tasks
  const limited = deduplicated.slice(0, 8);

  // Convert to ChecklistItem format
  return limited.map((title, index) => ({
    id: `task-${Date.now()}-${index}`,
    title,
    dependency: null,
  }));
}

/**
 * Parses Gemini API response text into tasks
 * Expects either:
 * - A numbered/bulleted list
 * - One task per line
 */
export function parseGeminiResponse(responseText: string): string[] {
  // Split by newlines and filter out empty lines
  const lines = responseText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines;
}

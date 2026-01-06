/**
 * Core type definitions for the Smart Dynamic Checklist application
 */

export interface ChecklistItem {
  id: string;
  title: string;
  // Optional dependency: item only appears when dependency is completed
  dependency?: string | null;
}

export interface ChecklistState {
  items: ChecklistItem[];
}

export interface RunnerState {
  completedIds: Set<string>;
}

export interface Analytics {
  totalSteps: number;
  completedSteps: number;
  hiddenSteps: number;
}

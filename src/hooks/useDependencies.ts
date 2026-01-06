/**
 * Hook for managing and calculating task dependencies
 * Determines which items should be visible based on completion state
 */

import { useMemo } from 'react';
import { ChecklistItem } from '../types';

export interface DependencyResult {
  visibleItems: ChecklistItem[];
  hiddenItems: ChecklistItem[];
  isItemVisible: (itemId: string) => boolean;
}

/**
 * Calculates which items are visible based on dependencies and completion state
 *
 * Logic:
 * - Items with no dependency are always visible
 * - Items with a dependency are only visible if their dependency is completed
 * - This logic is data-driven and reusable
 */
export function useDependencies(
  items: ChecklistItem[],
  completedIds: Set<string>
): DependencyResult {
  const result = useMemo(() => {
    const visible: ChecklistItem[] = [];
    const hidden: ChecklistItem[] = [];

    for (const item of items) {
      const isVisible = !item.dependency || completedIds.has(item.dependency);

      if (isVisible) {
        visible.push(item);
      } else {
        hidden.push(item);
      }
    }

    const isItemVisible = (itemId: string): boolean => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return false;
      return !item.dependency || completedIds.has(item.dependency);
    };

    return {
      visibleItems: visible,
      hiddenItems: hidden,
      isItemVisible,
    };
  }, [items, completedIds]);

  return result;
}

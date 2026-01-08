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
 * Check if an item is visible based on its dependencies
 */
function checkItemVisibility(item: ChecklistItem, completedIds: Set<string>): boolean {
  // Check new dependencies array (supports multiple dependencies)
  if (item.dependencies && item.dependencies.length > 0) {
    // All dependencies must be completed
    return item.dependencies.every(depId => completedIds.has(depId));
  }

  // Fall back to legacy single dependency
  if (item.dependency) {
    return completedIds.has(item.dependency);
  }

  // No dependencies, always visible
  return true;
}

/**
 * Calculates which items are visible based on dependencies and completion state
 *
 * Logic:
 * - Items with no dependencies are always visible
 * - Items with dependencies are only visible if ALL dependencies are completed
 * - Supports both legacy single dependency and new multiple dependencies
 */
export function useDependencies(
  items: ChecklistItem[],
  completedIds: Set<string>
): DependencyResult {
  const result = useMemo(() => {
    const visible: ChecklistItem[] = [];
    const hidden: ChecklistItem[] = [];

    for (const item of items) {
      const isVisible = checkItemVisibility(item, completedIds);

      if (isVisible) {
        visible.push(item);
      } else {
        hidden.push(item);
      }
    }

    const isItemVisible = (itemId: string): boolean => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return false;
      return checkItemVisibility(item, completedIds);
    };

    return {
      visibleItems: visible,
      hiddenItems: hidden,
      isItemVisible,
    };
  }, [items, completedIds]);

  return result;
}

/**
 * Unit tests for useDependencies hook
 * Tests multi-dependency functionality
 */

import { renderHook } from '@testing-library/react';
import { useDependencies } from './useDependencies';
import { ChecklistItem } from '../types';

describe('useDependencies Hook', () => {
  describe('Single dependency (legacy)', () => {
    it('should show items with no dependencies', () => {
      const items: ChecklistItem[] = [
        { id: '1', title: 'Task 1', dependency: null },
        { id: '2', title: 'Task 2', dependency: null },
      ];
      const completedIds = new Set<string>();

      const { result } = renderHook(() => useDependencies(items, completedIds));

      expect(result.current.visibleItems).toHaveLength(2);
      expect(result.current.hiddenItems).toHaveLength(0);
    });

    it('should hide items with uncompleted single dependency', () => {
      const items: ChecklistItem[] = [
        { id: '1', title: 'Task 1', dependency: null },
        { id: '2', title: 'Task 2', dependency: '1' },
      ];
      const completedIds = new Set<string>();

      const { result } = renderHook(() => useDependencies(items, completedIds));

      expect(result.current.visibleItems).toHaveLength(1);
      expect(result.current.visibleItems[0].id).toBe('1');
      expect(result.current.hiddenItems).toHaveLength(1);
      expect(result.current.hiddenItems[0].id).toBe('2');
    });

    it('should show items when single dependency is completed', () => {
      const items: ChecklistItem[] = [
        { id: '1', title: 'Task 1', dependency: null },
        { id: '2', title: 'Task 2', dependency: '1' },
      ];
      const completedIds = new Set<string>(['1']);

      const { result } = renderHook(() => useDependencies(items, completedIds));

      expect(result.current.visibleItems).toHaveLength(2);
      expect(result.current.hiddenItems).toHaveLength(0);
    });
  });

  describe('Multiple dependencies', () => {
    it('should hide items with uncompleted multiple dependencies', () => {
      const items: ChecklistItem[] = [
        { id: '1', title: 'Task 1', dependencies: [] },
        { id: '2', title: 'Task 2', dependencies: [] },
        { id: '3', title: 'Task 3', dependencies: ['1', '2'] },
      ];
      const completedIds = new Set<string>();

      const { result } = renderHook(() => useDependencies(items, completedIds));

      expect(result.current.visibleItems).toHaveLength(2);
      expect(result.current.hiddenItems).toHaveLength(1);
      expect(result.current.hiddenItems[0].id).toBe('3');
    });

    it('should hide items when only some dependencies are completed', () => {
      const items: ChecklistItem[] = [
        { id: '1', title: 'Task 1', dependencies: [] },
        { id: '2', title: 'Task 2', dependencies: [] },
        { id: '3', title: 'Task 3', dependencies: ['1', '2'] },
      ];
      const completedIds = new Set<string>(['1']); // Only 1 completed, not 2

      const { result } = renderHook(() => useDependencies(items, completedIds));

      expect(result.current.visibleItems).toHaveLength(2);
      expect(result.current.hiddenItems).toHaveLength(1);
      expect(result.current.hiddenItems[0].id).toBe('3');
    });

    it('should show items when ALL dependencies are completed', () => {
      const items: ChecklistItem[] = [
        { id: '1', title: 'Task 1', dependencies: [] },
        { id: '2', title: 'Task 2', dependencies: [] },
        { id: '3', title: 'Task 3', dependencies: ['1', '2'] },
      ];
      const completedIds = new Set<string>(['1', '2']); // Both completed

      const { result } = renderHook(() => useDependencies(items, completedIds));

      expect(result.current.visibleItems).toHaveLength(3);
      expect(result.current.hiddenItems).toHaveLength(0);
    });

    it('should handle 3+ dependencies correctly', () => {
      const items: ChecklistItem[] = [
        { id: '1', title: 'Task 1', dependencies: [] },
        { id: '2', title: 'Task 2', dependencies: [] },
        { id: '3', title: 'Task 3', dependencies: [] },
        { id: '4', title: 'Task 4', dependencies: ['1', '2', '3'] },
      ];
      const completedIds = new Set<string>(['1', '2']); // Missing 3

      const { result } = renderHook(() => useDependencies(items, completedIds));

      expect(result.current.visibleItems).toHaveLength(3);
      expect(result.current.hiddenItems).toHaveLength(1);

      // Now complete the third dependency
      const completedAll = new Set<string>(['1', '2', '3']);
      const { result: result2 } = renderHook(() => useDependencies(items, completedAll));

      expect(result2.current.visibleItems).toHaveLength(4);
      expect(result2.current.hiddenItems).toHaveLength(0);
    });
  });

  describe('Backward compatibility', () => {
    it('should handle mix of old and new dependency formats', () => {
      const items: ChecklistItem[] = [
        { id: '1', title: 'Task 1', dependency: null },
        { id: '2', title: 'Task 2', dependency: '1' }, // Old format
        { id: '3', title: 'Task 3', dependencies: ['1'] }, // New format
        { id: '4', title: 'Task 4', dependencies: ['2', '3'] }, // New format, multiple
      ];
      const completedIds = new Set<string>();

      const { result } = renderHook(() => useDependencies(items, completedIds));

      // Only Task 1 should be visible (no dependencies)
      expect(result.current.visibleItems).toHaveLength(1);
      expect(result.current.visibleItems[0].id).toBe('1');
      expect(result.current.hiddenItems).toHaveLength(3);
    });

    it('should prioritize dependencies array over legacy dependency', () => {
      const items: ChecklistItem[] = [
        { id: '1', title: 'Task 1', dependencies: [] },
        { id: '2', title: 'Task 2', dependencies: [] },
        {
          id: '3',
          title: 'Task 3',
          dependency: '1', // Legacy
          dependencies: ['2'] // New - should use this
        },
      ];
      const completedIds = new Set<string>(['1']); // Complete 1 but not 2

      const { result } = renderHook(() => useDependencies(items, completedIds));

      // Task 3 should be hidden because dependencies array requires '2', not '1'
      expect(result.current.hiddenItems).toHaveLength(1);
      expect(result.current.hiddenItems[0].id).toBe('3');
    });
  });

  describe('isItemVisible function', () => {
    it('should correctly report item visibility', () => {
      const items: ChecklistItem[] = [
        { id: '1', title: 'Task 1', dependencies: [] },
        { id: '2', title: 'Task 2', dependencies: ['1'] },
      ];
      const completedIds = new Set<string>();

      const { result } = renderHook(() => useDependencies(items, completedIds));

      expect(result.current.isItemVisible('1')).toBe(true);
      expect(result.current.isItemVisible('2')).toBe(false);
    });

    it('should return false for non-existent items', () => {
      const items: ChecklistItem[] = [
        { id: '1', title: 'Task 1', dependencies: [] },
      ];
      const completedIds = new Set<string>();

      const { result } = renderHook(() => useDependencies(items, completedIds));

      expect(result.current.isItemVisible('999')).toBe(false);
    });
  });

  describe('Complex dependency chains', () => {
    it('should handle sequential dependency chain', () => {
      const items: ChecklistItem[] = [
        { id: '1', title: 'Task 1', dependencies: [] },
        { id: '2', title: 'Task 2', dependencies: ['1'] },
        { id: '3', title: 'Task 3', dependencies: ['2'] },
        { id: '4', title: 'Task 4', dependencies: ['3'] },
      ];

      // Initially, only task 1 visible
      const { result: r1 } = renderHook(() => useDependencies(items, new Set()));
      expect(r1.current.visibleItems).toHaveLength(1);

      // Complete task 1, task 2 appears
      const { result: r2 } = renderHook(() => useDependencies(items, new Set(['1'])));
      expect(r2.current.visibleItems).toHaveLength(2);

      // Complete task 2, task 3 appears
      const { result: r3 } = renderHook(() => useDependencies(items, new Set(['1', '2'])));
      expect(r3.current.visibleItems).toHaveLength(3);

      // Complete task 3, task 4 appears
      const { result: r4 } = renderHook(() => useDependencies(items, new Set(['1', '2', '3'])));
      expect(r4.current.visibleItems).toHaveLength(4);
    });

    it('should handle parallel dependencies converging to one task', () => {
      const items: ChecklistItem[] = [
        { id: 'A', title: 'Task A', dependencies: [] },
        { id: 'B', title: 'Task B', dependencies: [] },
        { id: 'C', title: 'Task C', dependencies: [] },
        { id: 'D', title: 'Task D', dependencies: ['A', 'B', 'C'] },
      ];

      // Complete A and B, but not C
      const { result } = renderHook(() =>
        useDependencies(items, new Set(['A', 'B']))
      );

      expect(result.current.visibleItems).toHaveLength(3); // A, B, C visible
      expect(result.current.hiddenItems).toHaveLength(1); // D hidden
      expect(result.current.hiddenItems[0].id).toBe('D');
    });
  });
});

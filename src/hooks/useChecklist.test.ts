/**
 * Unit tests for useChecklist hook
 * Tests the new addItemWithDependencies functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useChecklist } from './useChecklist';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useChecklist Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('addItem (legacy)', () => {
    it('should add a basic item', () => {
      const { result } = renderHook(() => useChecklist());

      act(() => {
        result.current.addItem('Test Task');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].title).toBe('Test Task');
      expect(result.current.items[0].dependency).toBe(null);
    });
  });

  describe('addItemWithDependencies', () => {
    it('should add an item with no dependencies', () => {
      const { result } = renderHook(() => useChecklist());

      let newId: string = '';
      act(() => {
        newId = result.current.addItemWithDependencies('Task 1');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].title).toBe('Task 1');
      expect(result.current.items[0].dependencies).toEqual([]);
      expect(result.current.items[0].id).toBe(newId);
    });

    it('should add an item with single dependency', () => {
      const { result } = renderHook(() => useChecklist());

      let parentId: string = '';
      let childId: string = '';

      act(() => {
        parentId = result.current.addItemWithDependencies('Parent Task');
        childId = result.current.addItemWithDependencies('Child Task', [parentId]);
      });

      expect(result.current.items).toHaveLength(2);

      const childTask = result.current.items.find(item => item.id === childId);
      expect(childTask).toBeDefined();
      expect(childTask?.dependencies).toEqual([parentId]);
    });

    it('should add an item with multiple dependencies', () => {
      const { result } = renderHook(() => useChecklist());

      let id1: string = '';
      let id2: string = '';
      let id3: string = '';
      let finalId: string = '';

      act(() => {
        id1 = result.current.addItemWithDependencies('Task 1');
        id2 = result.current.addItemWithDependencies('Task 2');
        id3 = result.current.addItemWithDependencies('Task 3');
        finalId = result.current.addItemWithDependencies('Final Task', [id1, id2, id3]);
      });

      expect(result.current.items).toHaveLength(4);

      const finalTask = result.current.items.find(item => item.id === finalId);
      expect(finalTask).toBeDefined();
      expect(finalTask?.dependencies).toHaveLength(3);
      expect(finalTask?.dependencies).toContain(id1);
      expect(finalTask?.dependencies).toContain(id2);
      expect(finalTask?.dependencies).toContain(id3);
    });

    it('should create sequential dependency chain (Break It Down pattern)', () => {
      const { result } = renderHook(() => useChecklist());

      let parentId: string = '';
      let sub1Id: string = '';
      let sub2Id: string = '';
      let sub3Id: string = '';

      act(() => {
        // Parent task
        parentId = result.current.addItemWithDependencies('Plan a party');

        // First subtask depends on parent
        sub1Id = result.current.addItemWithDependencies('Choose venue', [parentId]);

        // Second subtask depends on first subtask
        sub2Id = result.current.addItemWithDependencies('Send invitations', [sub1Id]);

        // Third subtask depends on second subtask
        sub3Id = result.current.addItemWithDependencies('Buy decorations', [sub2Id]);
      });

      expect(result.current.items).toHaveLength(4);

      const sub1 = result.current.items.find(item => item.id === sub1Id);
      const sub2 = result.current.items.find(item => item.id === sub2Id);
      const sub3 = result.current.items.find(item => item.id === sub3Id);

      expect(sub1?.dependencies).toEqual([parentId]);
      expect(sub2?.dependencies).toEqual([sub1Id]);
      expect(sub3?.dependencies).toEqual([sub2Id]);
    });

    it('should return unique IDs for each item', () => {
      const { result } = renderHook(() => useChecklist());

      const ids: string[] = [];

      act(() => {
        ids.push(result.current.addItemWithDependencies('Task 1'));
        ids.push(result.current.addItemWithDependencies('Task 2'));
        ids.push(result.current.addItemWithDependencies('Task 3'));
      });

      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe('updateItem with dependencies', () => {
    it('should update item dependencies', () => {
      const { result } = renderHook(() => useChecklist());

      let id1: string = '';
      let id2: string = '';
      let id3: string = '';

      act(() => {
        id1 = result.current.addItemWithDependencies('Task 1');
        id2 = result.current.addItemWithDependencies('Task 2');
        id3 = result.current.addItemWithDependencies('Task 3', []);
      });

      // Update task 3 to depend on task 1 and 2
      act(() => {
        result.current.updateItem(id3, {
          dependencies: [id1, id2],
        });
      });

      const task3 = result.current.items.find(item => item.id === id3);
      expect(task3?.dependencies).toEqual([id1, id2]);
    });

    it('should clear legacy dependency field', () => {
      const { result } = renderHook(() => useChecklist());

      let id1: string = '';
      let id2: string = '';

      act(() => {
        id1 = result.current.addItemWithDependencies('Task 1');
        result.current.addItem('Task 2'); // Old style
      });

      id2 = result.current.items[1].id;

      // Set legacy dependency
      act(() => {
        result.current.updateItem(id2, {
          dependency: id1,
        });
      });

      const task2Before = result.current.items.find(item => item.id === id2);
      expect(task2Before?.dependency).toBe(id1);

      // Update to new format and clear legacy
      act(() => {
        result.current.updateItem(id2, {
          dependencies: [id1],
          dependency: null,
        });
      });

      const task2After = result.current.items.find(item => item.id === id2);
      expect(task2After?.dependencies).toEqual([id1]);
      expect(task2After?.dependency).toBe(null);
    });
  });

  describe('deleteItem with dependencies', () => {
    it('should delete item and clean up from completed set', () => {
      const { result } = renderHook(() => useChecklist());

      let id: string = '';

      act(() => {
        id = result.current.addItemWithDependencies('Task 1');
        result.current.toggleComplete(id);
      });

      expect(result.current.completedIds.has(id)).toBe(true);

      act(() => {
        result.current.deleteItem(id);
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.completedIds.has(id)).toBe(false);
    });
  });

  describe('Export/Import with dependencies', () => {
    it('should export items with dependencies', () => {
      const { result } = renderHook(() => useChecklist());

      let id1: string = '';
      let id2: string = '';

      act(() => {
        id1 = result.current.addItemWithDependencies('Task 1');
        id2 = result.current.addItemWithDependencies('Task 2', [id1]);
      });

      const exported = result.current.exportData();
      const parsed = JSON.parse(exported);

      expect(parsed.items).toHaveLength(2);
      expect(parsed.items[1].dependencies).toEqual([id1]);
    });

    it('should import items with dependencies', () => {
      const { result } = renderHook(() => useChecklist());

      const testData = {
        items: [
          {
            id: 'test-1',
            title: 'Task 1',
            dependencies: [],
            dependency: null,
          },
          {
            id: 'test-2',
            title: 'Task 2',
            dependencies: ['test-1'],
            dependency: null,
          },
        ],
        completedIds: ['test-1'],
      };

      act(() => {
        result.current.importData(JSON.stringify(testData));
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[1].dependencies).toEqual(['test-1']);
      expect(result.current.completedIds.has('test-1')).toBe(true);
    });
  });

  describe('localStorage persistence', () => {
    it('should persist items with dependencies to localStorage', () => {
      const { result } = renderHook(() => useChecklist());

      let id1: string = '';
      let id2: string = '';

      act(() => {
        id1 = result.current.addItemWithDependencies('Task 1');
        id2 = result.current.addItemWithDependencies('Task 2', [id1]);
      });

      // Get from localStorage
      const stored = localStorageMock.getItem('smart-checklist-items');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(2);
      expect(parsed[1].dependencies).toEqual([id1]);
    });

    it('should load items with dependencies from localStorage', () => {
      const testData = [
        {
          id: 'stored-1',
          title: 'Stored Task 1',
          dependencies: [],
          dependency: null,
        },
        {
          id: 'stored-2',
          title: 'Stored Task 2',
          dependencies: ['stored-1'],
          dependency: null,
        },
      ];

      localStorageMock.setItem('smart-checklist-items', JSON.stringify(testData));

      const { result } = renderHook(() => useChecklist());

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[1].dependencies).toEqual(['stored-1']);
    });
  });
});

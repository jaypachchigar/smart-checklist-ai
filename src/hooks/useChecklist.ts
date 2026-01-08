/**
 * Main state management hook for checklist
 * Manages both Builder and Runner state with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { ChecklistItem } from '../types';

const STORAGE_KEY_CHECKLIST = 'smart-checklist-items';
const STORAGE_KEY_RUNNER = 'smart-checklist-runner';

export interface UseChecklistReturn {
  // Builder state
  items: ChecklistItem[];
  addItem: (title: string) => void;
  addItemWithDependencies: (title: string, dependencies?: string[]) => string;
  updateItem: (id: string, updates: Partial<ChecklistItem>) => void;
  deleteItem: (id: string) => void;
  reorderItems: (newOrder: ChecklistItem[]) => void;
  setItems: (items: ChecklistItem[]) => void;

  // Runner state
  completedIds: Set<string>;
  toggleComplete: (id: string) => void;
  resetRunner: () => void;

  // Utilities
  exportData: () => string;
  importData: (jsonString: string) => void;
}

export function useChecklist(): UseChecklistReturn {
  // Builder state: the master list of items
  const [items, setItemsState] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHECKLIST);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load checklist from localStorage:', error);
    }
    return [];
  });

  // Runner state: which items are completed
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RUNNER);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        return new Set(parsed);
      }
    } catch (error) {
      console.error('Failed to load runner state from localStorage:', error);
    }
    return new Set();
  });

  // Persist items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save checklist to localStorage:', error);
    }
  }, [items]);

  // Persist runner state to localStorage
  useEffect(() => {
    try {
      const array = Array.from(completedIds);
      localStorage.setItem(STORAGE_KEY_RUNNER, JSON.stringify(array));
    } catch (error) {
      console.error('Failed to save runner state to localStorage:', error);
    }
  }, [completedIds]);

  // Builder operations
  const addItem = useCallback((title: string) => {
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      title,
      dependency: null,
    };
    setItemsState((prev) => [...prev, newItem]);
  }, []);

  const addItemWithDependencies = useCallback((title: string, dependencies?: string[]) => {
    const newId = `item-${Date.now()}-${Math.random()}`;
    const newItem: ChecklistItem = {
      id: newId,
      title,
      dependencies: dependencies || [],
      dependency: null,
    };
    setItemsState((prev) => [...prev, newItem]);
    return newId; // Return the ID so caller can reference it
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<ChecklistItem>) => {
    setItemsState((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItemsState((prev) => prev.filter((item) => item.id !== id));
    // Also remove from completed if it was completed
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const reorderItems = useCallback((newOrder: ChecklistItem[]) => {
    setItemsState(newOrder);
  }, []);

  const setItems = useCallback((newItems: ChecklistItem[]) => {
    setItemsState(newItems);
  }, []);

  // Runner operations
  const toggleComplete = useCallback((id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const resetRunner = useCallback(() => {
    setCompletedIds(new Set());
  }, []);

  // Export/Import
  const exportData = useCallback(() => {
    const data = {
      items,
      completedIds: Array.from(completedIds),
    };
    return JSON.stringify(data, null, 2);
  }, [items, completedIds]);

  const importData = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.items && Array.isArray(data.items)) {
        setItemsState(data.items);
      }
      if (data.completedIds && Array.isArray(data.completedIds)) {
        setCompletedIds(new Set(data.completedIds));
      }
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }, []);

  return {
    items,
    addItem,
    addItemWithDependencies,
    updateItem,
    deleteItem,
    reorderItems,
    setItems,
    completedIds,
    toggleComplete,
    resetRunner,
    exportData,
    importData,
  };
}

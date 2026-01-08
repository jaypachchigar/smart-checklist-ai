/**
 * ChecklistBuilder Component
 * Allows users to:
 * - Add new items
 * - Edit items inline
 * - Delete items
 * - Reorder items via drag-and-drop
 * - Set dependencies between items
 */

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChecklistItem } from '../types';
import { rewriteTask, generateSubSteps } from '../utils/gemini';
import { parseGeminiResponse, normalizeTasks } from '../utils/normalizeTasks';
import { getStoredApiKey } from './Settings';

interface ChecklistBuilderProps {
  items: ChecklistItem[];
  onReorder: (newOrder: ChecklistItem[]) => void;
  onUpdate: (id: string, updates: Partial<ChecklistItem>) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string) => void;
  onAddWithDependencies: (title: string, dependencies?: string[]) => string;
  onNeedApiKey: () => void;
}

export function ChecklistBuilder({
  items,
  onReorder,
  onUpdate,
  onDelete,
  onAdd,
  onAddWithDependencies,
  onNeedApiKey,
}: ChecklistBuilderProps) {
  const [newItemTitle, setNewItemTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  const handleAddItem = () => {
    if (newItemTitle.trim()) {
      onAdd(newItemTitle.trim());
      setNewItemTitle('');
    }
  };

  return (
    <div className="main-panel">
      <h2 className="panel-title">Build Your List</h2>

      {/* Add new item */}
      <div className="add-task-section">
        <div className="task-input-wrapper">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="What needs to get done?"
            className="task-input"
          />
          <button
            onClick={handleAddItem}
            className="add-btn"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Item list with drag-and-drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="tasks-container">
            {items.length === 0 ? (
              <div className="empty-state">
                <p className="empty-main">Nothing here yet</p>
                <p className="empty-hint">Start by adding a task above or use the AI helper</p>
              </div>
            ) : (
              items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  allItems={items}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onAdd={onAdd}
                  onAddWithDependencies={onAddWithDependencies}
                  onNeedApiKey={onNeedApiKey}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SortableItemProps {
  item: ChecklistItem;
  allItems: ChecklistItem[];
  onUpdate: (id: string, updates: Partial<ChecklistItem>) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string) => void;
  onAddWithDependencies: (title: string, dependencies?: string[]) => string;
  onNeedApiKey: () => void;
}

function SortableItem({ item, allItems, onUpdate, onDelete, onAdd, onAddWithDependencies, onNeedApiKey }: SortableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.title);
  const [aiLoading, setAiLoading] = useState<'rewrite' | 'substeps' | null>(null);
  const [showDependencies, setShowDependencies] = useState(false);

  // Get current dependencies (support both new and legacy format)
  const currentDependencies = item.dependencies || (item.dependency ? [item.dependency] : []);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onUpdate(item.id, { title: editValue.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(item.title);
    setIsEditing(false);
  };

  const handleRewrite = async () => {
    // Check if API key is configured
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      alert('API key required. Please add your Gemini API key in Settings first.');
      onNeedApiKey();
      return;
    }

    setAiLoading('rewrite');
    try {
      const rewritten = await rewriteTask(item.title);
      onUpdate(item.id, { title: rewritten });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to rewrite task');
    } finally {
      setAiLoading(null);
    }
  };

  const handleGenerateSubSteps = async () => {
    // Check if API key is configured
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      alert('API key required. Please add your Gemini API key in Settings first.');
      onNeedApiKey();
      return;
    }

    setAiLoading('substeps');
    try {
      const responseText = await generateSubSteps(item.title);
      const rawTasks = parseGeminiResponse(responseText);
      const normalizedTasks = normalizeTasks(rawTasks);

      // Add each sub-task with proper dependencies
      // Strategy: Create a chain where each task depends on the parent task AND the previous subtask
      let previousSubtaskId: string | null = null;

      normalizedTasks.forEach((task, index) => {
        const dependencies: string[] = [];

        // First subtask depends only on the parent task
        if (index === 0) {
          dependencies.push(item.id);
        } else if (previousSubtaskId) {
          // Subsequent subtasks depend on the previous subtask (creating a chain)
          dependencies.push(previousSubtaskId);
        }

        // Add the subtask with dependencies
        const newId = onAddWithDependencies(task.title, dependencies);
        previousSubtaskId = newId;
      });

      alert(`Successfully created ${normalizedTasks.length} sub-tasks with dependencies!`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate sub-steps');
    } finally {
      setAiLoading(null);
    }
  };

  const handleToggleDependency = (depId: string) => {
    const newDependencies = currentDependencies.includes(depId)
      ? currentDependencies.filter(id => id !== depId)
      : [...currentDependencies, depId];

    onUpdate(item.id, {
      dependencies: newDependencies,
      dependency: null, // Clear legacy field
    });
  };

  // Get potential dependencies (all items except the current one)
  const potentialDependencies = allItems.filter(i => i.id !== item.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task-card"
    >
      <div className="task-content">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="drag-handle"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </div>

        <div className="task-body">
          {/* Title (editable) */}
          {isEditing ? (
            <div className="edit-mode">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="edit-input"
                autoFocus
              />
              <div className="edit-actions">
                <button
                  onClick={handleSave}
                  className="save-btn"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="task-title-text">{item.title}</p>
            </div>
          )}

          {/* AI Options */}
          {!isEditing && (
            <div className="ai-tools">
              <button
                onClick={handleRewrite}
                disabled={aiLoading !== null}
                className="ai-btn"
              >
                {aiLoading === 'rewrite' ? 'Rewriting...' : 'Rephrase'}
              </button>

              <button
                onClick={handleGenerateSubSteps}
                disabled={aiLoading !== null}
                className="ai-btn"
              >
                {aiLoading === 'substeps' ? 'Thinking...' : 'Break It Down'}
              </button>
            </div>
          )}

          {/* Dependencies Section */}
          {!isEditing && potentialDependencies.length > 0 && (
            <div className="dependencies-section mt-2">
              <button
                onClick={() => setShowDependencies(!showDependencies)}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Dependencies ({currentDependencies.length})
              </button>

              {showDependencies && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs space-y-1">
                  {potentialDependencies.map(dep => (
                    <label key={dep.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={currentDependencies.includes(dep.id)}
                        onChange={() => handleToggleDependency(dep.id)}
                        className="rounded"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{dep.title}</span>
                    </label>
                  ))}
                  {currentDependencies.length > 0 && (
                    <p className="text-gray-500 dark:text-gray-400 italic mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      This task will only appear after all selected dependencies are completed
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="task-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="action-link edit-link"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="action-link delete-link"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

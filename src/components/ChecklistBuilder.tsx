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
import { useTheme } from '../contexts/ThemeContext';
import { rewriteTask, generateSubSteps } from '../utils/gemini';
import { parseGeminiResponse, normalizeTasks } from '../utils/normalizeTasks';

interface ChecklistBuilderProps {
  items: ChecklistItem[];
  onReorder: (newOrder: ChecklistItem[]) => void;
  onUpdate: (id: string, updates: Partial<ChecklistItem>) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string) => void;
}

export function ChecklistBuilder({
  items,
  onReorder,
  onUpdate,
  onDelete,
  onAdd,
}: ChecklistBuilderProps) {
  const [newItemTitle, setNewItemTitle] = useState('');
  const { theme } = useTheme();

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
    <div className={`rounded border p-4 h-full flex flex-col ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-300'
    }`}>
      <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Builder Mode</h2>

      {/* Add new item */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="Add new task..."
            className={`flex-1 px-3 py-2 border rounded ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
          <button
            onClick={handleAddItem}
            className={`px-4 py-2 rounded border ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900 border-gray-300'
            }`}
          >
            Add
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
          <div className="space-y-2 flex-1 overflow-auto">
            {items.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                <p className="text-sm">No tasks yet</p>
                <p className="text-xs mt-1">Add one above or use AI</p>
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
}

function SortableItem({ item, allItems, onUpdate, onDelete, onAdd }: SortableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.title);
  const [aiLoading, setAiLoading] = useState<'rewrite' | 'substeps' | null>(null);
  const { theme } = useTheme();

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
    setAiLoading('substeps');
    try {
      const responseText = await generateSubSteps(item.title);
      const rawTasks = parseGeminiResponse(responseText);
      const normalizedTasks = normalizeTasks(rawTasks);

      // Add each sub-task as a new item with dependency on current item
      normalizedTasks.forEach((task) => {
        onAdd(task.title);
        // Note: We can't set dependency here directly since we don't have the new item's ID yet
        // The user can set it manually or we could enhance this further
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate sub-steps');
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded p-3 ${
        theme === 'dark'
          ? 'bg-gray-900 border-gray-600'
          : 'bg-gray-50 border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing ${
            theme === 'dark'
              ? 'text-gray-500'
              : 'text-gray-400'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </div>

        <div className="flex-1">
          {/* Title (editable) */}
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                className={`w-full px-2 py-1 border rounded text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className={`px-3 py-1 text-xs rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900 border-gray-300'
                  }`}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className={`px-3 py-1 text-xs rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</p>
              {item.dependency && (
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                  Depends on: {allItems.find((i) => i.id === item.dependency)?.title || 'Unknown'}
                </p>
              )}
            </div>
          )}

          {/* Dependency selector and AI options */}
          {!isEditing && (
            <>
              <div className="mt-2 flex items-center gap-2">
                <label className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Depends on:</label>
                <select
                  value={item.dependency || ''}
                  onChange={(e) =>
                    onUpdate(item.id, {
                      dependency: e.target.value || null,
                    })
                  }
                  className={`flex-1 text-xs border rounded px-2 py-1 ${
                    theme === 'dark'
                      ? 'bg-gray-900 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">None</option>
                  {allItems
                    .filter((i) => i.id !== item.id)
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.title}
                      </option>
                    ))}
                </select>
              </div>

              {/* AI Options */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleRewrite}
                  disabled={aiLoading !== null}
                  className={`px-2 py-1 text-xs rounded border disabled:opacity-50 ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                  }`}
                >
                  {aiLoading === 'rewrite' ? 'Rewriting...' : 'AI Rewrite'}
                </button>

                <button
                  onClick={handleGenerateSubSteps}
                  disabled={aiLoading !== null}
                  className={`px-2 py-1 text-xs rounded border disabled:opacity-50 ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                  }`}
                >
                  {aiLoading === 'substeps' ? 'Generating...' : 'Sub-steps'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className={`text-xs ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

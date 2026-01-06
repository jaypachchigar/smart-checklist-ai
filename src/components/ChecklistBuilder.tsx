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
    <div className={`backdrop-blur-sm rounded-xl border p-6 h-full flex flex-col ${
      theme === 'dark'
        ? 'bg-slate-800/30 border-slate-700/30'
        : 'bg-white/60 border-slate-300/50'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg border ${
          theme === 'dark'
            ? 'bg-slate-700/40 border-slate-600/30'
            : 'bg-slate-200/50 border-slate-300/30'
        }`}>
          <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Builder Mode</h2>
      </div>

      {/* Add new item */}
      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="Enter a new task..."
            className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              theme === 'dark'
                ? 'bg-slate-900/40 border-slate-600/40 text-slate-100 placeholder-slate-500 focus:ring-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-slate-400'
            }`}
          />
          <button
            onClick={handleAddItem}
            className={`px-5 py-2.5 rounded-lg transition-all font-medium border ${
              theme === 'dark'
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600/40'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'
            }`}
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
          <div className="space-y-2.5 flex-1 overflow-auto">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <svg className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>No tasks yet</p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Add one above or use AI to generate tasks</p>
              </div>
            ) : (
              items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  allItems={items}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
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
}

function SortableItem({ item, allItems, onUpdate, onDelete }: SortableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.title);
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`backdrop-blur-sm border rounded-lg p-3.5 hover:border-opacity-80 transition-all ${
        theme === 'dark'
          ? 'bg-slate-800/40 border-slate-700/40'
          : 'bg-white/70 border-slate-300/60'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing mt-0.5 transition-colors ${
            theme === 'dark'
              ? 'text-slate-500 hover:text-slate-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </div>

        <div className="flex-1">
          {/* Title (editable) */}
          {isEditing ? (
            <div className="space-y-2.5">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-900/40 border-slate-600/40 text-slate-100 placeholder-slate-500 focus:ring-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-slate-400'
                }`}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all font-medium ${
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-100'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                  }`}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all font-medium border ${
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600/40'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className={`font-medium text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{item.title}</p>
              {item.dependency && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className={`text-xs ${theme === 'dark' ? 'text-amber-400/90' : 'text-amber-600'}`}>
                    Depends on:{' '}
                    <span className="font-medium">
                      {allItems.find((i) => i.id === item.dependency)?.title || 'Unknown'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Dependency selector */}
          {!isEditing && (
            <div className="mt-2.5 flex items-center gap-2">
              <label className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Depends on:</label>
              <select
                value={item.dependency || ''}
                onChange={(e) =>
                  onUpdate(item.id, {
                    dependency: e.target.value || null,
                  })
                }
                className={`flex-1 text-xs border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-900/40 border-slate-600/40 text-slate-200 focus:ring-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:ring-slate-400'
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
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className={`text-xs font-medium transition-colors ${
                theme === 'dark'
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className={`text-xs font-medium transition-colors ${
                theme === 'dark'
                  ? 'text-red-400/80 hover:text-red-300'
                  : 'text-red-600 hover:text-red-700'
              }`}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

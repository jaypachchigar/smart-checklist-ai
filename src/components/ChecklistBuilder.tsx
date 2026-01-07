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
      <h2 className="panel-title">build your list</h2>

      {/* Add new item */}
      <div className="add-task-section">
        <div className="task-input-wrapper">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="what needs to get done?"
            className="task-input"
          />
          <button
            onClick={handleAddItem}
            className="add-btn"
          >
            add task
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
                <p className="empty-main">nothing here yet</p>
                <p className="empty-hint">start by adding a task above or use the ai helper</p>
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
                  save
                </button>
                <button
                  onClick={handleCancel}
                  className="cancel-btn"
                >
                  cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="task-title-text">{item.title}</p>
              {item.dependency && (
                <p className="dependency-note">
                  needs: {allItems.find((i) => i.id === item.dependency)?.title || 'Unknown'}
                </p>
              )}
            </div>
          )}

          {/* Dependency selector and AI options */}
          {!isEditing && (
            <>
              <div className="dependency-picker">
                <label className="depends-label">depends on</label>
                <select
                  value={item.dependency || ''}
                  onChange={(e) =>
                    onUpdate(item.id, {
                      dependency: e.target.value || null,
                    })
                  }
                  className="depends-select"
                >
                  <option value="">nothing</option>
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
              <div className="ai-tools">
                <button
                  onClick={handleRewrite}
                  disabled={aiLoading !== null}
                  className="ai-btn"
                >
                  {aiLoading === 'rewrite' ? 'rewriting...' : 'rephrase'}
                </button>

                <button
                  onClick={handleGenerateSubSteps}
                  disabled={aiLoading !== null}
                  className="ai-btn"
                >
                  {aiLoading === 'substeps' ? 'thinking...' : 'break it down'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="task-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="action-link edit-link"
            >
              edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="action-link delete-link"
            >
              delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

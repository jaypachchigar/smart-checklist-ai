/**
 * ChecklistRunner Component
 * Separate from Builder Mode - allows users to:
 * - Check/uncheck items
 * - Only see items whose dependencies are satisfied
 * - Track progress independently from builder edits
 */

import { ChecklistItem } from '../types';
import { useDependencies } from '../hooks/useDependencies';

interface ChecklistRunnerProps {
  items: ChecklistItem[];
  completedIds: Set<string>;
  onToggleComplete: (id: string) => void;
  onReset: () => void;
}

export function ChecklistRunner({
  items,
  completedIds,
  onToggleComplete,
  onReset,
}: ChecklistRunnerProps) {
  const { visibleItems, hiddenItems } = useDependencies(items, completedIds);

  const completedCount = Array.from(completedIds).filter((id) =>
    items.some((item) => item.id === id)
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Runner Mode</h2>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Reset Progress
        </button>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>
            {completedCount} / {items.length} tasks
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: items.length > 0 ? `${(completedCount / items.length) * 100}%` : '0%',
            }}
          />
        </div>
      </div>

      {/* Visible items */}
      <div className="space-y-2">
        {visibleItems.length === 0 && items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tasks available. Add tasks in Builder Mode.
          </p>
        ) : visibleItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            All tasks are hidden due to dependencies. Complete prerequisite tasks first.
          </p>
        ) : (
          visibleItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={completedIds.has(item.id)}
                  onChange={() => onToggleComplete(item.id)}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p
                    className={`text-gray-800 font-medium ${
                      completedIds.has(item.id) ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.dependency && (
                    <p className="text-sm text-gray-500 mt-1">
                      Unlocked after completing:{' '}
                      {items.find((i) => i.id === item.dependency)?.title || 'Unknown'}
                    </p>
                  )}
                </div>
              </label>
            </div>
          ))
        )}
      </div>

      {/* Hidden items info */}
      {hiddenItems.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>{hiddenItems.length}</strong> task{hiddenItems.length > 1 ? 's' : ''}{' '}
            hidden due to unmet dependencies
          </p>
        </div>
      )}
    </div>
  );
}

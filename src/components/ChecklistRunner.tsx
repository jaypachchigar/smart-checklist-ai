/**
 * ChecklistRunner Component
 * Separate from Builder Mode - allows users to:
 * - Check/uncheck items
 * - Only see items whose dependencies are satisfied
 * - Track progress independently from builder edits
 */

import { ChecklistItem } from '../types';
import { useDependencies } from '../hooks/useDependencies';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme } = useTheme();

  const completedCount = Array.from(completedIds).filter((id) =>
    items.some((item) => item.id === id)
  ).length;

  return (
    <div className={`border p-4 h-full flex flex-col ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-300'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Runner Mode</h2>
        <button
          onClick={onReset}
          className={`px-3 py-2 border text-xs ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
          }`}
        >
          Reset
        </button>
      </div>

      {/* Progress indicator */}
      <div className="mb-4">
        <div className={`flex justify-between text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
          <span>Progress</span>
          <span className="text-green-600">{completedCount} / {items.length}</span>
        </div>
        <div className={`w-full h-2 ${
          theme === 'dark'
            ? 'bg-gray-700'
            : 'bg-gray-200'
        }`}>
          <div
            className="bg-green-600 h-full"
            style={{
              width: items.length > 0 ? `${(completedCount / items.length) * 100}%` : '0%',
            }}
          />
        </div>
      </div>

      {/* Visible tasks */}
      <div className="space-y-2 flex-1 overflow-auto">
        {visibleItems.length === 0 ? (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            <p className="text-sm">
              {items.length === 0 ? 'No tasks to run' : 'All tasks completed!'}
            </p>
          </div>
        ) : (
          visibleItems.map((item) => (
            <div
              key={item.id}
              className={`border p-3 ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-600'
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={completedIds.has(item.id)}
                  onChange={() => onToggleComplete(item.id)}
                  className="mt-0.5 w-4 h-4 cursor-pointer"
                  style={{ accentColor: '#16a34a' }}
                />
                <p
                  className={`text-sm ${
                    completedIds.has(item.id)
                      ? theme === 'dark' ? 'line-through text-gray-500' : 'line-through text-gray-400'
                      : theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {item.title}
                </p>
              </label>
            </div>
          ))
        )}
      </div>

      {/* Hidden items indicator */}
      {hiddenItems.length > 0 && (
        <div className={`mt-4 p-3 border ${
          theme === 'dark'
            ? 'bg-orange-900/20 border-orange-700'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>
            {hiddenItems.length} {hiddenItems.length === 1 ? 'task' : 'tasks'} locked (dependencies not met)
          </p>
        </div>
      )}
    </div>
  );
}

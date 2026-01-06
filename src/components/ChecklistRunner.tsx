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
    <div className={`backdrop-blur-sm rounded-xl border p-6 h-full flex flex-col ${
      theme === 'dark'
        ? 'bg-slate-800/30 border-slate-700/30'
        : 'bg-white/60 border-slate-300/50'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-slate-700/40 border-slate-600/30'
              : 'bg-slate-200/50 border-slate-300/30'
          }`}>
            <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Runner Mode</h2>
        </div>
        <button
          onClick={onReset}
          className={`px-4 py-2 rounded-lg transition-all text-sm font-medium border ${
            theme === 'dark'
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600/40'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'
          }`}
        >
          Reset Progress
        </button>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className={`flex justify-between text-xs mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          <span className="font-medium">Progress</span>
          <span className={`font-semibold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
            {completedCount} / {items.length} tasks
          </span>
        </div>
        <div className={`w-full rounded-full h-2 overflow-hidden border ${
          theme === 'dark'
            ? 'bg-slate-700/30 border-slate-600/20'
            : 'bg-slate-200/50 border-slate-300/30'
        }`}>
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{
              width: items.length > 0 ? `${(completedCount / items.length) * 100}%` : '0%',
            }}
          />
        </div>
      </div>

      {/* Visible items */}
      <div className="space-y-2.5 flex-1 overflow-auto">
        {visibleItems.length === 0 && items.length === 0 ? (
          <div className="text-center py-16">
            <svg className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>No tasks available</p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Add tasks in Builder Mode to get started</p>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto text-amber-500/80 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>All tasks are locked</p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Complete prerequisite tasks to unlock more</p>
          </div>
        ) : (
          visibleItems.map((item) => (
            <div
              key={item.id}
              className={`backdrop-blur-sm border rounded-lg p-3.5 hover:border-opacity-80 transition-all group ${
                theme === 'dark'
                  ? 'bg-slate-800/40 border-slate-700/40'
                  : 'bg-white/70 border-slate-300/60'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={completedIds.has(item.id)}
                  onChange={() => onToggleComplete(item.id)}
                  className={`mt-0.5 w-4 h-4 text-emerald-500 rounded focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-900/40 border-slate-600/40'
                      : 'bg-white border-slate-300'
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium transition-all ${
                      completedIds.has(item.id)
                        ? theme === 'dark' ? 'line-through text-slate-500' : 'line-through text-slate-400'
                        : theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.dependency && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <svg className="w-3.5 h-3.5 text-emerald-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <p className={`text-xs ${theme === 'dark' ? 'text-emerald-400/70' : 'text-emerald-600'}`}>
                        Unlocked after:{' '}
                        <span className="font-medium">
                          {items.find((i) => i.id === item.dependency)?.title || 'Unknown'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          ))
        )}
      </div>

      {/* Hidden items info */}
      {hiddenItems.length > 0 && (
        <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className={`text-xs ${theme === 'dark' ? 'text-amber-400/90' : 'text-amber-600'}`}>
              <strong className="font-semibold">{hiddenItems.length}</strong> task{hiddenItems.length > 1 ? 's' : ''}{' '}
              locked due to unmet dependencies
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

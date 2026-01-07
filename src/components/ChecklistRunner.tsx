/**
 * ChecklistRunner Component
 * Separate from Builder Mode - allows users to:
 * - Check/uncheck items
 * - Only see items whose dependencies are satisfied
 * - Track progress independently from builder edits
 */

import { ChecklistItem } from '../types';

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
  const completedCount = Array.from(completedIds).filter((id) =>
    items.some((item) => item.id === id)
  ).length;

  return (
    <div className="main-panel">
      <div className="runner-header">
        <h2 className="panel-title">Get Stuff Done</h2>
        <button
          onClick={onReset}
          className="reset-btn"
        >
          Start Over
        </button>
      </div>

      {/* Progress indicator */}
      <div className="progress-section">
        <div className="progress-label">
          <span>Progress</span>
          <span className="progress-count">{completedCount} / {items.length}</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: items.length > 0 ? `${(completedCount / items.length) * 100}%` : '0%',
            }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="tasks-container">
        {items.length === 0 ? (
          <div className="empty-state">
            <p className="empty-main">Nothing to do yet</p>
          </div>
        ) : completedCount === items.length ? (
          <div className="empty-state">
            <p className="empty-main">All done</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="runner-task"
            >
              <label className="task-checkbox-label">
                <input
                  type="checkbox"
                  checked={completedIds.has(item.id)}
                  onChange={() => onToggleComplete(item.id)}
                  className="task-checkbox"
                  style={{ accentColor: '#16a34a' }}
                />
                <p
                  className={`runner-task-text ${
                    completedIds.has(item.id)
                      ? 'completed'
                      : ''
                  }`}
                >
                  {item.title}
                </p>
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

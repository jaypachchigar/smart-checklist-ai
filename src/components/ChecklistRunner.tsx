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

interface OrganizedItem {
  item: ChecklistItem;
  level: number; // 0 for root items, 1+ for sub-dependencies
}

/**
 * Organizes items into a hierarchical structure with indentation levels.
 * Items that depend on others are placed directly after their parent group.
 * All subtasks in a chain appear at the same indentation level.
 */
function organizeItemsHierarchically(items: ChecklistItem[]): OrganizedItem[] {
  const organized: OrganizedItem[] = [];
  const processed = new Set<string>();

  // Helper function to get all descendants of a parent (including chain members)
  const getDescendants = (parentId: string): ChecklistItem[] => {
    const descendants: ChecklistItem[] = [];
    const queue: string[] = [parentId];
    const visited = new Set<string>([parentId]);

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      // Find all items that depend on currentId
      items.forEach(item => {
        if (visited.has(item.id)) return;

        const deps = item.dependencies || (item.dependency ? [item.dependency] : []);
        if (deps.includes(currentId)) {
          descendants.push(item);
          visited.add(item.id);
          queue.push(item.id);
        }
      });
    }

    return descendants;
  };

  // Helper function to sort descendants in dependency order
  const sortByDependencyOrder = (tasks: ChecklistItem[]): ChecklistItem[] => {
    const sorted: ChecklistItem[] = [];
    const remaining = [...tasks];
    const addedIds = new Set<string>();

    while (remaining.length > 0) {
      const canAdd = remaining.find(task => {
        const deps = task.dependencies || (task.dependency ? [task.dependency] : []);
        // Can add if all dependencies (that are in the remaining list) have been added
        return deps.every(depId => {
          const isInList = tasks.some(t => t.id === depId);
          return !isInList || addedIds.has(depId);
        });
      });

      if (!canAdd) break; // Prevent infinite loop

      sorted.push(canAdd);
      addedIds.add(canAdd.id);
      remaining.splice(remaining.indexOf(canAdd), 1);
    }

    // Add any remaining items (shouldn't happen normally)
    sorted.push(...remaining);
    return sorted;
  };

  // Start with root items (items with no dependencies)
  const rootItems = items.filter(item => {
    const deps = item.dependencies || (item.dependency ? [item.dependency] : []);
    return deps.length === 0;
  });

  rootItems.forEach(rootItem => {
    if (processed.has(rootItem.id)) return;

    // Add the root item
    organized.push({ item: rootItem, level: 0 });
    processed.add(rootItem.id);

    // Get all descendants and add them at level 1
    const descendants = getDescendants(rootItem.id);
    const sortedDescendants = sortByDependencyOrder(descendants);

    sortedDescendants.forEach(descendant => {
      if (!processed.has(descendant.id)) {
        organized.push({ item: descendant, level: 1 });
        processed.add(descendant.id);
      }
    });
  });

  // Add any remaining items that weren't processed (edge cases)
  items.forEach(item => {
    if (!processed.has(item.id)) {
      organized.push({ item, level: 0 });
      processed.add(item.id);
    }
  });

  return organized;
}

export function ChecklistRunner({
  items,
  completedIds,
  onToggleComplete,
  onReset,
}: ChecklistRunnerProps) {
  // Use the dependencies hook to determine which items should be visible
  const { visibleItems, hiddenItems } = useDependencies(items, completedIds);

  // Organize items hierarchically
  const organizedItems = organizeItemsHierarchically(items);

  // Filter to only show visible items
  const visibleOrganizedItems = organizedItems.filter(({ item }) =>
    visibleItems.some(v => v.id === item.id)
  );

  // Function to check if a task has sub-tasks (visible or hidden)
  const hasSubTasks = (taskId: string): boolean => {
    return items.some(item => {
      const deps = item.dependencies || (item.dependency ? [item.dependency] : []);
      return deps.includes(taskId);
    });
  };

  // Function to count hidden sub-tasks
  const getHiddenSubTaskCount = (taskId: string): number => {
    return hiddenItems.filter(item => {
      const deps = item.dependencies || (item.dependency ? [item.dependency] : []);
      return deps.includes(taskId);
    }).length;
  };

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
        ) : visibleOrganizedItems.length === 0 ? (
          <div className="empty-state">
            <p className="empty-main">Complete the tasks above to unlock more</p>
          </div>
        ) : (
          visibleOrganizedItems.map(({ item, level }) => {
            const itemHasSubTasks = hasSubTasks(item.id);
            const hiddenSubTaskCount = getHiddenSubTaskCount(item.id);

            return (
              <div
                key={item.id}
                className={`runner-task ${level > 0 ? 'sub-task' : ''} ${itemHasSubTasks && level === 0 ? 'has-subtasks' : ''}`}
                style={{
                  marginLeft: `${level * 24}px`, // 24px indentation per level
                }}
                onClick={() => onToggleComplete(item.id)}
              >
                <label className="task-checkbox-label">
                  <input
                    type="checkbox"
                    checked={completedIds.has(item.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleComplete(item.id);
                    }}
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
                    {level > 0 && (
                      <>
                        <span className="sub-task-badge">
                          SUB-TASK
                        </span>
                        <span className="sub-task-indicator">
                          ↳
                        </span>
                      </>
                    )}
                    {item.title}
                    {level === 0 && itemHasSubTasks && hiddenSubTaskCount > 0 && (
                      <span className="parent-indicator" title={`Complete this to unlock ${hiddenSubTaskCount} sub-task${hiddenSubTaskCount > 1 ? 's' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginLeft: '8px', verticalAlign: 'middle' }}>
                          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM5.5 7.5A.5.5 0 0 0 5 8v1a.5.5 0 0 0 1 0V8a.5.5 0 0 0-.5-.5zm5 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 1 0V8a.5.5 0 0 0-.5-.5zM8 11.5a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 8 11.5z"/>
                        </svg>
                        <span style={{ fontSize: '11px', marginLeft: '4px', color: '#2563eb', fontWeight: '600' }}>
                          +{hiddenSubTaskCount} more
                        </span>
                      </span>
                    )}
                  </p>
                </label>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * AnalyticsPanel Component
 * Displays basic analytics about checklist progress
 * - Total steps
 * - Completed steps
 * - Hidden (dependency-blocked) steps
 */

import { ChecklistItem } from '../types';

interface AnalyticsPanelProps {
  items: ChecklistItem[];
  completedIds: Set<string>;
  exportData: () => string;
  importData: (json: string) => void;
}

export function AnalyticsPanel({
  items,
  completedIds,
  exportData,
  importData,
}: AnalyticsPanelProps) {
  const totalSteps = items.length;
  const completedSteps = Array.from(completedIds).filter((id) =>
    items.some((item) => item.id === id)
  ).length;
  const completionPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = event.target?.result as string;
            importData(json);
            alert('Checklist imported successfully!');
          } catch (error) {
            alert('Failed to import checklist. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="stats-bar">
      <div className="stats-container">
        {/* Stats - spread horizontally */}
        <div className="stats-grid">
          <div className="stat-item">
            <p className="stat-label">Total</p>
            <p className="stat-number">{totalSteps}</p>
          </div>

          <div className="stat-item">
            <p className="stat-label">Done</p>
            <p className="stat-number done">{completedSteps}</p>
          </div>

          <div className="stat-item">
            <p className="stat-label">Left</p>
            <p className="stat-number">{totalSteps - completedSteps}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-area">
          <div className="progress-info">
            <span>Progress</span>
            <span className="progress-percent">{completionPercentage.toFixed(0)}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Export/Import buttons */}
        <div className="data-buttons">
          <button
            onClick={handleExport}
            className="data-btn"
          >
            Export
          </button>
          <button
            onClick={handleImport}
            className="data-btn"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AnalyticsPanel Component
 * Displays basic analytics about checklist progress
 * - Total steps
 * - Completed steps
 * - Hidden (dependency-blocked) steps
 */

import { ChecklistItem } from '../types';
import { useDependencies } from '../hooks/useDependencies';

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
  const { hiddenItems } = useDependencies(items, completedIds);

  const totalSteps = items.length;
  const completedSteps = Array.from(completedIds).filter((id) =>
    items.some((item) => item.id === id)
  ).length;
  const hiddenSteps = hiddenItems.length;
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Analytics & Export</h2>

      {/* Analytics cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium mb-1">Total Steps</p>
          <p className="text-3xl font-bold text-blue-900">{totalSteps}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-900">{completedSteps}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-medium mb-1">Hidden</p>
          <p className="text-3xl font-bold text-yellow-900">{hiddenSteps}</p>
        </div>
      </div>

      {/* Completion percentage */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Completion</span>
          <span>{completionPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Export/Import buttons */}
      <div className="space-y-2">
        <button
          onClick={handleExport}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
        >
          Export Checklist (JSON)
        </button>
        <button
          onClick={handleImport}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Import Checklist (JSON)
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          Export your checklist to save a backup or share with others. Import to restore
          from a previous export.
        </p>
      </div>
    </div>
  );
}

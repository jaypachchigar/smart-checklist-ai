/**
 * AnalyticsPanel Component
 * Displays basic analytics about checklist progress
 * - Total steps
 * - Completed steps
 * - Hidden (dependency-blocked) steps
 */

import { ChecklistItem } from '../types';
import { useDependencies } from '../hooks/useDependencies';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme } = useTheme();

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
    <div className={`rounded border p-4 ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-300'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Stats - spread horizontally */}
        <div className="flex-1 grid grid-cols-3 gap-4">
          <div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Total</p>
            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalSteps}</p>
          </div>

          <div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Completed</p>
            <p className={`text-lg font-bold text-green-600`}>{completedSteps}</p>
          </div>

          <div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Locked</p>
            <p className={`text-lg font-bold text-orange-600`}>{hiddenSteps}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-1">
          <div className={`flex justify-between text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
            <span>Progress</span>
            <span className="font-medium">{completionPercentage.toFixed(0)}%</span>
          </div>
          <div className={`w-full rounded h-2 ${
            theme === 'dark'
              ? 'bg-gray-700'
              : 'bg-gray-200'
          }`}>
            <div
              className="bg-green-600 h-full rounded"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Export/Import buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className={`px-3 py-2 rounded border text-xs ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
            }`}
          >
            Export
          </button>
          <button
            onClick={handleImport}
            className={`px-3 py-2 rounded border text-xs ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
            }`}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

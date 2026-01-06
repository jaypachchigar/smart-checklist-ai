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
    <div className={`backdrop-blur-sm rounded-lg border p-4 ${
      theme === 'dark'
        ? 'bg-slate-800/20 border-slate-700/20'
        : 'bg-white/60 border-slate-300/50'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Stats - spread horizontally */}
        <div className="flex-1 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${
              theme === 'dark'
                ? 'bg-slate-700/30 border-slate-600/20'
                : 'bg-slate-200/50 border-slate-300/30'
            }`}>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Total</p>
              <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{totalSteps}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Completed</p>
              <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{completedSteps}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Locked</p>
              <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>{hiddenSteps}</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1">
            <div className={`flex justify-between text-xs mb-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
              <span className="font-medium">Progress</span>
              <span className={`font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>{completionPercentage.toFixed(0)}%</span>
            </div>
            <div className={`w-full rounded-full h-2 overflow-hidden border ${
              theme === 'dark'
                ? 'bg-slate-700/30 border-slate-600/20'
                : 'bg-slate-200/50 border-slate-300/30'
            }`}>
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Export/Import buttons - compact */}
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className={`px-4 py-2 rounded-lg transition-all text-sm font-medium border flex items-center gap-2 ${
              theme === 'dark'
                ? 'bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 hover:text-slate-100 border-slate-600/30'
                : 'bg-slate-200/50 hover:bg-slate-300/60 text-slate-700 hover:text-slate-900 border-slate-300/40'
            }`}
            title="Export Checklist"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden xl:inline">Export</span>
          </button>
          <button
            onClick={handleImport}
            className={`px-4 py-2 rounded-lg transition-all text-sm font-medium border flex items-center gap-2 ${
              theme === 'dark'
                ? 'bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 hover:text-slate-100 border-slate-600/30'
                : 'bg-slate-200/50 hover:bg-slate-300/60 text-slate-700 hover:text-slate-900 border-slate-300/40'
            }`}
            title="Import Checklist"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="hidden xl:inline">Import</span>
          </button>
        </div>
      </div>
    </div>
  );
}

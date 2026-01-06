/**
 * Main App Component
 * Orchestrates all components and manages application state
 * - Toggles between Builder and Runner modes
 * - Manages checklist state with useChecklist hook
 * - Coordinates AI task generation
 */

import { useState } from 'react';
import { useChecklist } from './hooks/useChecklist';
import { ChecklistBuilder } from './components/ChecklistBuilder';
import { ChecklistRunner } from './components/ChecklistRunner';
import { GeminiGenerator } from './components/GeminiGenerator';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { ChecklistItem } from './types';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const [mode, setMode] = useState<'builder' | 'runner'>('builder');
  const { theme, toggleTheme } = useTheme();

  const {
    items,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    setItems,
    completedIds,
    toggleComplete,
    resetRunner,
    exportData,
    importData,
  } = useChecklist();

  const handleTasksGenerated = (newTasks: ChecklistItem[]) => {
    // Add AI-generated tasks to the existing list
    setItems([...items, ...newTasks]);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
        : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50'
    }`}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header with Analytics */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                Smart Dynamic Checklist
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                AI-powered task management with intelligent dependencies
              </p>
            </div>

            {/* Controls: Mode toggle + Theme toggle */}
            <div className="flex items-center gap-3">
              {/* Mode toggle */}
              <div className={`backdrop-blur-sm rounded-lg p-1 inline-flex border ${
                theme === 'dark'
                  ? 'bg-slate-800/30 border-slate-700/30'
                  : 'bg-white/60 border-slate-300/50'
              }`}>
                <button
                  onClick={() => setMode('builder')}
                  className={`px-6 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                    mode === 'builder'
                      ? theme === 'dark'
                        ? 'bg-slate-700 text-slate-100 shadow-sm'
                        : 'bg-slate-200 text-slate-900 shadow-sm'
                      : theme === 'dark'
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Builder
                </button>
                <button
                  onClick={() => setMode('runner')}
                  className={`px-6 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                    mode === 'runner'
                      ? theme === 'dark'
                        ? 'bg-slate-700 text-slate-100 shadow-sm'
                        : 'bg-slate-200 text-slate-900 shadow-sm'
                      : theme === 'dark'
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Runner
                </button>
              </div>

              {/* Theme toggle button */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-lg backdrop-blur-sm border transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800/30 border-slate-700/30 text-slate-300 hover:text-slate-100'
                    : 'bg-white/60 border-slate-300/50 text-slate-600 hover:text-slate-900'
                }`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Analytics Bar */}
          <AnalyticsPanel
            items={items}
            completedIds={completedIds}
            exportData={exportData}
            importData={importData}
          />
        </header>

        {/* Main content - Equal heights */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:items-start">
          {/* Main column: Builder or Runner */}
          <div className="lg:col-span-3 flex flex-col">
            {mode === 'builder' ? (
              <ChecklistBuilder
                items={items}
                onReorder={reorderItems}
                onUpdate={updateItem}
                onDelete={deleteItem}
                onAdd={addItem}
              />
            ) : (
              <ChecklistRunner
                items={items}
                completedIds={completedIds}
                onToggleComplete={toggleComplete}
                onReset={resetRunner}
              />
            )}
          </div>

          {/* Right sidebar: AI Generator - Same height */}
          <div className="lg:col-span-1 flex flex-col">
            <GeminiGenerator onTasksGenerated={handleTasksGenerated} />
          </div>
        </div>

        {/* Footer */}
        <footer className={`mt-12 text-center text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
          <p className="flex items-center justify-center gap-2">
            <span>Built with</span>
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>React</span>
            <span>·</span>
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>TypeScript</span>
            <span>·</span>
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Gemini AI</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

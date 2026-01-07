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
    <div className={`min-h-screen ${
      theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Analytics */}
        <header className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Smart Checklist
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Task management with AI
              </p>
            </div>

            {/* Controls: Mode toggle + Theme toggle */}
            <div className="flex items-center gap-3">
              {/* Mode toggle */}
              <div className={`rounded p-1 inline-flex border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-300'
              }`}>
                <button
                  onClick={() => setMode('builder')}
                  className={`px-5 py-2 rounded text-sm font-medium ${
                    mode === 'builder'
                      ? theme === 'dark'
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-200 text-gray-900'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Builder
                </button>
                <button
                  onClick={() => setMode('runner')}
                  className={`px-5 py-2 rounded text-sm font-medium ${
                    mode === 'runner'
                      ? theme === 'dark'
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-200 text-gray-900'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Runner
                </button>
              </div>

              {/* Theme toggle button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:text-gray-900'
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
        <footer className={`mt-8 text-center text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          <p>
            Built with React + TypeScript + Gemini AI
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

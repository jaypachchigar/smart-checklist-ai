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
import { Settings } from './components/Settings';
import { ChecklistItem } from './types';

function App() {
  const [mode, setMode] = useState<'builder' | 'runner'>('builder');
  const [showSettings, setShowSettings] = useState(false);

  const {
    items,
    addItem,
    addItemWithDependencies,
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
    <div className="app-wrapper">
      <div className="app-container">
        {/* Header with Analytics */}
        <header className="app-header">
          <div className="header-top">
            <div className="app-branding">
              <h1 className="app-title">
                Checklist
              </h1>
              <p className="app-subtitle">
                Get your stuff organized
              </p>
            </div>

            {/* Controls: Mode toggle and Settings */}
            <div className="flex items-center gap-3">
              <div className="mode-switcher">
                <button
                  onClick={() => setMode('builder')}
                  className={`mode-btn ${mode === 'builder' ? 'active' : ''}`}
                >
                  Build
                </button>
                <button
                  onClick={() => setMode('runner')}
                  className={`mode-btn ${mode === 'runner' ? 'active' : ''}`}
                >
                  Run
                </button>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                title="Settings"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
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
        <div className="main-grid">
          {/* Main column: Builder or Runner */}
          <div className="main-column">
            {mode === 'builder' ? (
              <ChecklistBuilder
                items={items}
                onReorder={reorderItems}
                onUpdate={updateItem}
                onDelete={deleteItem}
                onAdd={addItem}
                onAddWithDependencies={addItemWithDependencies}
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
          <div className="sidebar-column">
            <GeminiGenerator onTasksGenerated={handleTasksGenerated} />
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </div>
    </div>
  );
}

export default App;

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

function App() {
  const [mode, setMode] = useState<'builder' | 'runner'>('builder');

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

            {/* Controls: Mode toggle */}
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
      </div>
    </div>
  );
}

export default App;

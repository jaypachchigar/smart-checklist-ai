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
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Analytics */}
        <header className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Smart Checklist
              </h1>
              <p className="text-sm text-gray-400">
                Task management with AI
              </p>
            </div>

            {/* Controls: Mode toggle */}
            <div className="flex items-center gap-3">
              {/* Mode toggle */}
              <div className="p-1 inline-flex border bg-gray-800 border-gray-700">
                <button
                  onClick={() => setMode('builder')}
                  className={`px-5 py-2 text-sm font-medium ${
                    mode === 'builder'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Builder
                </button>
                <button
                  onClick={() => setMode('runner')}
                  className={`px-5 py-2 text-sm font-medium ${
                    mode === 'runner'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Runner
                </button>
              </div>
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
      </div>
    </div>
  );
}

export default App;

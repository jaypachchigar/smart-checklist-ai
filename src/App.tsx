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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Smart Dynamic Checklist
          </h1>
          <p className="text-gray-600">
            Build checklists with AI, add dependencies, and track your progress
          </p>
        </header>

        {/* Mode toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setMode('builder')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                mode === 'builder'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Builder Mode
            </button>
            <button
              onClick={() => setMode('runner')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                mode === 'runner'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Runner Mode
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: AI Generator */}
          <div className="lg:col-span-1">
            <GeminiGenerator onTasksGenerated={handleTasksGenerated} />

            {/* Analytics panel below generator on desktop, or after main content on mobile */}
            <div className="mt-6 hidden lg:block">
              <AnalyticsPanel
                items={items}
                completedIds={completedIds}
                exportData={exportData}
                importData={importData}
              />
            </div>
          </div>

          {/* Right column: Builder or Runner */}
          <div className="lg:col-span-2">
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

          {/* Analytics panel on mobile (shows after main content) */}
          <div className="lg:hidden">
            <AnalyticsPanel
              items={items}
              completedIds={completedIds}
              exportData={exportData}
              importData={importData}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>
            Built with React, TypeScript, Tailwind CSS, and Google Gemini AI
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

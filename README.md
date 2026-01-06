# Smart Dynamic Checklist with AI

A production-quality React application for building intelligent checklists with AI-powered task generation, dependency management, and progress tracking.

## Features

### Core Features

1. **Checklist Builder Mode**
   - Add, edit, and delete checklist items
   - Inline editing with save/cancel actions
   - Drag-and-drop reordering using @dnd-kit
   - Set dependencies between tasks (items only appear when prerequisites are completed)
   - Data-driven dependency logic

2. **Runner Mode**
   - Separate state from Builder Mode
   - Check/uncheck items to track progress
   - Only dependency-satisfied items are visible
   - Progress bar and completion tracking
   - Reset progress functionality

3. **AI Task Generation**
   - Integration with Google Gemini API (gemini-1.5-flash-latest model)
   - Real API calls via serverless backend (no mocks)
   - No API key needed by users - handled securely on server
   - Intelligent task normalization:
     - Removes numbering and bullets
     - Trims whitespace
     - Deduplicates similar tasks
     - Limits to 5-8 tasks
   - Clean insertion into checklist

### Bonus Features

- **Auto-save**: Checklist and runner state persist to localStorage
- **Export/Import**: Save and restore checklists as JSON
- **Analytics Panel**:
  - Total steps
  - Completed steps
  - Hidden (dependency-blocked) steps
  - Overall completion percentage

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **@dnd-kit** - Drag-and-drop functionality
- **Vercel Serverless Functions** - Backend API for Gemini
- **Google Gemini API** - AI task generation

## Getting Started

### Prerequisites

- Node.js 16+ (Note: Node.js 18+ recommended for full compatibility)
- npm or yarn
- Google AI API key ([Get one here](https://makersuite.google.com/app/apikey)) - for deployment only

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/jaypachchigar/smart-checklist-ai.git
cd smart-checklist-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to `http://localhost:5173`

**Note:** In local development, the AI feature will only work when deployed or when using a local serverless function runtime.

### Deployment to Vercel

This application is designed to be deployed on Vercel with serverless functions.

1. **Install Vercel CLI** (optional):
```bash
npm i -g vercel
```

2. **Deploy to Vercel:**

   **Option A: Using GitHub (Recommended)**
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable: `GEMINI_API_KEY`
   - Deploy!

   **Option B: Using Vercel CLI**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Add your `GEMINI_API_KEY` as an environment variable in Vercel dashboard

3. **Set Environment Variable:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add: `GEMINI_API_KEY` = `your_api_key_here`
   - Redeploy if already deployed

### Building for Production

```bash
npm run build
npm run preview
```

## Architecture

### State Management

The application uses a clean, predictable state architecture:

- **Builder State**: Master list of checklist items (managed by `useChecklist`)
- **Runner State**: Completion tracking independent of builder edits
- **Dependency Logic**: Reusable `useDependencies` hook calculates visibility

### Key Design Decisions

1. **Separation of Concerns**: Builder and Runner modes are completely separate components with distinct state
2. **Data-Driven Dependencies**: Dependency logic is calculated dynamically, not hardcoded
3. **localStorage Persistence**: Automatic save/restore for seamless user experience
4. **Real API Integration**: Uses official Google Gemini SDK for production-ready AI features
5. **Type Safety**: Full TypeScript coverage for maintainability

### Project Structure

```
src/
├── components/
│   ├── ChecklistBuilder.tsx    # Builder mode UI with drag-drop
│   ├── ChecklistRunner.tsx     # Runner mode UI with dependencies
│   ├── GeminiGenerator.tsx     # AI task generation component
│   └── AnalyticsPanel.tsx      # Statistics and export/import
├── hooks/
│   ├── useChecklist.ts         # Main state management
│   └── useDependencies.ts      # Dependency calculation logic
├── utils/
│   ├── gemini.ts               # Gemini API integration
│   └── normalizeTasks.ts       # Task parsing and normalization
├── types.ts                    # TypeScript type definitions
├── App.tsx                     # Main application component
└── main.tsx                    # Entry point
```

## Usage

### Creating Tasks Manually

1. Switch to **Builder Mode**
2. Enter a task in the input field
3. Click "Add Task" or press Enter
4. Edit tasks inline by clicking "Edit"
5. Drag tasks to reorder them
6. Set dependencies using the dropdown

### Generating Tasks with AI

1. Enter your Google AI API key in the AI Generator panel
2. Describe what tasks you need (e.g., "Create an onboarding checklist for a small SaaS customer")
3. Click "Generate Tasks with AI"
4. Tasks are automatically normalized and added to your checklist

### Running Your Checklist

1. Switch to **Runner Mode**
2. Check off tasks as you complete them
3. Dependent tasks will appear automatically when prerequisites are met
4. Track your progress with the progress bar

### Export/Import

- **Export**: Download your checklist as JSON for backup or sharing
- **Import**: Restore a previously exported checklist

## Error Handling

The application gracefully handles:
- Invalid API keys
- Network errors
- API quota limits
- Invalid JSON imports
- Empty or malformed AI responses

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Contributing

This is a demonstration project built for assessment purposes. Feel free to use it as a reference for your own projects.

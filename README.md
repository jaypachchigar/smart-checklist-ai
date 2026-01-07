# Smart Checklist

A simple, clean task management app with AI-powered task generation using Google's Gemini API.

## What It Does

This is a straightforward checklist app with two modes:
- **Build Mode**: Create and organize your tasks, with AI helpers to rephrase tasks or break them into smaller steps
- **Run Mode**: Check off your tasks as you complete them

The AI can generate entire task lists from a simple description like "plan a birthday party" or "study for finals."

## Tech Stack

- React + TypeScript
- Vite for build tooling
- Custom CSS (no framework)
- Google Gemini 2.0 Flash API for AI generation
- Vercel for hosting (serverless functions handle API calls)
- @dnd-kit for drag-and-drop

## Architecture Decisions

### Why Serverless Functions?

I wanted to keep the Gemini API key secure, so instead of exposing it in the client, all AI requests go through a Vercel serverless function at `/api/generate-tasks.js`. This also gave me a place to add rate limiting (10 requests per minute per IP) to prevent abuse of the free API tier.

The serverless function acts as a proxy:
1. Receives the user's prompt from the frontend
2. Adds it to a carefully crafted system prompt
3. Calls Gemini API with my API key
4. Returns the generated tasks

This means users never need their own API key - it's all handled server-side.

### State Management

Keeping it simple - just React hooks (`useState`) and localStorage for persistence. No Redux or external state management. For a checklist app, this was plenty. The main state lives in `useChecklist.tsx` which handles:
- Adding/updating/deleting tasks
- Tracking completed tasks (separate Set for runner mode)
- Reordering tasks
- Export/import functionality

All state automatically saves to localStorage on every change, so your checklist persists across browser sessions.

### Component Structure

Pretty straightforward:
- `App.tsx` - Main orchestrator, switches between modes
- `ChecklistBuilder.tsx` - The edit mode with drag-and-drop (using `@dnd-kit`)
- `ChecklistRunner.tsx` - Simple checkbox list for completing tasks
- `GeminiGenerator.tsx` - AI prompt interface
- `AnalyticsPanel.tsx` - Stats bar at the top

Each component is self-contained with its own logic. No complex prop drilling - kept it flat and simple.

## How Dependency Logic is Modeled

**Short answer: It's not anymore.**

I originally built a dependency system where tasks could depend on other tasks (e.g., "Cook dinner" depends on "Buy ingredients"). The idea was Runner mode would hide tasks until their dependencies were completed.

### Why I Removed It

After building it, I realized it made the app confusing and overcomplicated. Most people just want a simple list - add tasks, check them off, done. The dependency dropdown cluttered the UI, and the "locked tasks" concept confused users.

So I stripped it all out. Now it's just a flat list of tasks. Much cleaner.

### What Was There Before

For reference (since you asked about architecture), here's how it worked:
- Each task had an optional `dependency: string | null` field pointing to another task's ID
- A `useDependencies` hook calculated which tasks should be visible based on completion state
- In Runner mode, tasks with unmet dependencies were hidden
- Analytics showed "locked" count

All that logic is gone now. Tasks are just tasks.

## How the Gemini API is Used

### The Flow

1. User types a prompt like "organize my room"
2. Frontend sends prompt to `/api/generate-tasks` (my serverless function)
3. Function calls Gemini API with a carefully crafted system prompt
4. Gemini returns structured task list
5. Frontend parses it and adds tasks to the checklist

### The System Prompt

I spent time tuning this. The key was being specific about output format:

```
Generate 5-8 actionable tasks for: [user's prompt]

Format as a numbered list:
1. First task
2. Second task
...

Keep tasks:
- Specific and actionable
- One clear action per task
- In logical order
```

Simple prompt, but it works consistently.

### Model Choice

Using `gemini-2.0-flash-exp` - it's fast, free tier is generous, and quality is good enough for task generation. Started with `gemini-1.5-flash` but upgraded to 2.0 for better results.

### Parsing Logic

The API sometimes returns markdown, sometimes just plain text. My `parseGeminiResponse` function handles both:
- Strips markdown code blocks (```)
- Extracts numbered lists (1. 2. 3.)
- Extracts bulleted lists (-, *, •)
- Cleans up whitespace and formatting
- Normalizes into task objects with unique IDs

Code is in `src/utils/normalizeTasks.ts`.

### Rate Limiting & Security

Added basic protection on the serverless function:
- **Rate limiting**: 10 requests per minute per IP address
- **Prompt length limit**: Max 2000 characters
- **In-memory tracking**: Uses a Map that resets on cold starts

This prevents basic abuse without needing a database. For a demo/portfolio project, it's sufficient. In production, I'd use Redis or a proper rate limiting service.

### AI Features in Builder Mode

Each task has two AI buttons:

**Rephrase**: Sends the task to Gemini to make it clearer or more actionable. Useful when you brain-dump a vague task and want it cleaned up.

**Break It Down**: Takes a complex task and generates 3-5 subtasks. Doesn't create a hierarchy (keeping it simple), just adds new tasks to your list below the current one.

Both use the same API endpoint but with different system prompts.

## Limitations & Trade-offs

### 1. No User Accounts
Everything is stored in localStorage. No backend database, no auth, no syncing across devices. This was intentional.

**Why I did it**: Building auth and a backend would've taken days. For a portfolio project, showing clean frontend architecture was more important than full-stack features. Plus, many productivity apps (like sticky notes) work fine without accounts.

**Trade-off**: You lose your data if you clear browser storage. Export/import helps mitigate this.

### 2. Rate Limiting is Basic
The in-memory rate limiting resets on cold starts. A determined user could abuse it by waiting for cold starts or using multiple IPs.

**Why I did it**: For a demo app, this is fine. In production I'd use Redis, Upstash, or a service like Arcjet. This shows I understand the concern without over-engineering.

**Trade-off**: Not production-ready security, but good enough to prevent casual abuse.

### 3. No Task Hierarchy
Tasks are a flat list. Can't nest subtasks or create sections/categories.

**Why I did it**: Tried to keep it simple. Most productivity apps get bogged down in features. I wanted something that works quickly. Even the "Break It Down" feature just adds tasks to the main list rather than creating a tree structure.

**Trade-off**: Less powerful for complex projects, but easier to understand and use.

### 4. AI Quality Varies
Sometimes Gemini returns perfect tasks, sometimes they're generic. I don't do retry logic or quality filtering.

**Why I did it**: Could've added validation, retry on bad responses, quality scoring, etc. But then it becomes "how perfect should AI output be?" Decided to keep it raw - you can always edit, regenerate, or use the rephrase button.

**Trade-off**: Occasional mediocre results, but faster and simpler implementation.

### 5. No Mobile App
It's responsive and works on mobile browsers, but no native apps.

**Why I did it**: Time. A PWA would be the next step before going native.

**Trade-off**: No offline support, no app store presence.

### 6. Limited Export/Import
JSON only, no CSV, no integration with Todoist/Notion/etc.

**Why I did it**: JSON was quickest to implement and keeps all metadata intact. Could add other formats later, but this covers the "don't lose your data" use case.

**Trade-off**: Not as portable as CSV or standard formats.

## Design Decisions

### The "Human" Look

You might notice the design is pretty minimal - square edges, simple colors, no fancy animations. This was intentional.

Originally I had:
- Rounded corners everywhere
- Gradient backgrounds
- Emojis in all the buttons
- Lowercase "friendly" text ("build your list", "get stuff done")
- Lots of shadow effects

It looked like a typical AI-generated product landing page. I stripped all that out because:
1. It screamed "made by AI"
2. Too polished can feel corporate and impersonal
3. Wanted it to feel handmade and functional

Ended up with:
- Flat colors (blue #2563eb for primary, green #16a34a for success, purple #8b5cf6 for AI features)
- No rounded corners (square edges everywhere)
- Simple 1px borders
- Minimal shadows
- Proper capitalization ("Add Task" not "add task")
- Clean whitespace

The result feels more like something a developer would build for themselves, not a marketing team.

### Mobile Responsive

Built desktop first, then retrofitted mobile. Not ideal, but it works.

Mobile adjustments:
- Mode toggle stretches full width
- Task input and add button stack vertically
- AI tool buttons stack vertically
- Edit/save/cancel buttons go full width
- Larger tap targets (44px minimum)
- Stats bar keeps 3 columns but more compact
- Export/import buttons stay side-by-side (50/50)

Tested on iOS Safari, Chrome Android, and various viewport sizes.

## What I Learned

1. **AI APIs are unpredictable** - Spent way more time on parsing/normalization than expected. Gemini is great but output format varies.

2. **Less is more** - Removing the dependency system made the app 10x better. Sometimes the best feature is the one you delete.

3. **Rate limiting is important** - Even for demos, you need basic protection or your API key gets hammered.

4. **Design matters** - The "remove all the polish" phase actually made it look more professional and authentic.

5. **TypeScript helps** - Caught several bugs during refactoring that would've been painful in vanilla JS.

## Running Locally

```bash
npm install
npm start
```

Runs on `http://localhost:3000`

For AI features to work, create a `.env` file:
```
GEMINI_API_KEY=your_key_here
```

Get a free key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Deploying to Vercel

```bash
npm run build
```

Then:
1. Push to GitHub
2. Import project in Vercel
3. Add `GEMINI_API_KEY` environment variable
4. Deploy

The `/api` folder automatically becomes serverless functions.

## Project Structure

```
src/
├── components/
│   ├── AnalyticsPanel.tsx      # Stats bar (Total | Done | Left)
│   ├── ChecklistBuilder.tsx    # Build mode with drag-drop
│   ├── ChecklistRunner.tsx     # Run mode with checkboxes
│   └── GeminiGenerator.tsx     # AI prompt interface
├── hooks/
│   └── useChecklist.ts         # Main state management
├── utils/
│   ├── gemini.ts               # Gemini API calls
│   └── normalizeTasks.ts       # Parse AI responses
├── types.ts                    # TypeScript definitions
├── App.tsx                     # Main app component
└── custom.css                  # All styles (no Tailwind)

api/
└── generate-tasks.js           # Serverless function for AI
```

## Future Ideas

If I had more time:
- User accounts with cloud sync (Supabase or Firebase)
- Keyboard shortcuts (Enter to add, Cmd+K for search, etc.)
- Recurring tasks
- Tags/categories
- Templates (common checklists people can reuse)
- Better AI: prompt templates, retry logic, quality filtering
- Undo/redo
- Dark mode toggle (currently light only)
- PWA with offline support
- Share checklists via URL
- Collaboration features

But honestly, it works pretty well as-is for personal task management.

## Why I Built It This Way

This was meant to be a focused portfolio project that shows:
- **Clean React/TypeScript code** - No over-engineering, readable components
- **Practical API integration** - Real AI features, not just CRUD
- **Security considerations** - API key handling, rate limiting
- **Real UX decisions** - Removed features that didn't work (dependencies)
- **Ability to ship** - It's complete, deployed, and works

Could it have more features? Sure. But I'd rather ship something simple that works well than an overbuilt mess that's half-finished.

---

**For Interviewers**: The messy commit history is real - you can see the evolution from overdesigned AI product to clean, simple tool. The dependency system removal commit shows I'm willing to kill features that don't work. The mobile responsive fixes show attention to detail. The rate limiting shows security awareness. The README you're reading was written by a human explaining real technical decisions, not generated marketing copy.

Built by Jay Pachchigar

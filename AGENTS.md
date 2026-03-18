# AGENTS.md

AI coding assistant guide for the **dict** project - an AI dictionary desktop app built with Electron + React + TypeScript.

## Commands

```bash
# Development (hot reload)
pnpm dev

# Build for production
pnpm build

# Lint code
pnpm lint

# Preview production build
pnpm preview
```

## Code Style Guidelines

### Imports
- Use `@/` path alias for src/ directory imports: `import { useAppStore } from '@/stores/appStore'`
- Group imports: React → third-party → internal (@/) → relative
- Use named imports for stores: `import { useAppStore } from '@/stores/appStore'`

### Formatting
- 2-space indentation
- Single quotes for strings
- Semicolons required
- No trailing commas
- Max line length: 100 (soft)

### Types
- Use `type` over `interface` for object shapes
- PascalCase for type names: `type QueryResult = { ... }`
- Strict TypeScript enabled - no `any` allowed
- Define types in `src/types/index.ts`
- Use explicit return types for exported functions

### Naming Conventions
- Components: PascalCase files, PascalCase exports: `SearchBox.tsx` → `export function SearchBox()`
- Hooks: camelCase with `use` prefix: `useNetworkStatus.ts`
- Stores: camelCase with `Store` suffix: `appStore.ts` → `useAppStore`
- Utils: camelCase: `api.ts`, `indexedDB.ts`
- Boolean props: use `is`/`has` prefix: `isLoading`, `hasError`

### Error Handling
- Always use try/catch for async operations
- Use Zustand store for global error state: `setError()` / `showToast()`
- Toast notifications for user-facing errors:
  ```typescript
  showToast(errorMessage, 'error', 5000)
  ```
- Log errors to console with context: `console.error('[Component] Action failed:', error)`

### State Management (Zustand)
- One store per domain: `appStore`, `settingsStore`, `favoritesStore`, `historyStore`
- Store interface extends state type with actions
- Use selectors to prevent unnecessary re-renders
- Initialize stores in `useEffect` for IndexedDB-backed stores

### Component Patterns
- Functional components with hooks
- Props interface defined inline or in types file
- Use `React.lazy()` for page components
- CSS classes use kebab-case matching component purpose

### IPC Communication
- Always use `window.ipcRenderer.invoke()` for async main process calls
- Channels use colon notation: `window:minimize`, `settings:get`
- Type IPC APIs in `src/types/electron.d.ts`

## Project Structure

```
src/
  components/     # Shared UI components (SearchBox, Toast, etc.)
  pages/          # Route-level components (Settings, Favorites, etc.)
  stores/         # Zustand stores
  hooks/          # Custom React hooks
  utils/          # Utility functions (api.ts, indexedDB.ts)
  types/          # TypeScript type definitions
electron/
  main.ts         # Main process entry
  preload.ts      # Preload script exposing IPC APIs
```

## Key Patterns

### Store Usage
```typescript
const { isLoading, setLoading } = useAppStore()
const settings = useSettingsStore()
```

### API Calls
```typescript
try {
  const result = await queryLLM(text, settings)
  setQueryResult(result)
} catch (error) {
  showToast(error.message, 'error')
}
```

### Toast Notifications
- Types: `'success' | 'error' | 'warning' | 'info'`
- Default durations: success=3000ms, error=5000ms

## Tech Stack

- Electron 30 + Vite 5
- React 18 + TypeScript 5
- Zustand (state management)
- Dexie.js (IndexedDB wrapper)
- electron-store (settings persistence)
- Lucide React (icons)

## Build Output

- `dist/` - Frontend assets
- `dist-electron/` - Main process + preload
- `release/` - Packaged application

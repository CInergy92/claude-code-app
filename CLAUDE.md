# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Electron + TypeScript + React desktop app with voice input/output and real-time audio visualization. Uses CSS Modules for styling (no Tailwind). Bundled with electron-vite.

## Commands

```bash
npm run dev          # Start dev mode with hot reload
npm run build        # Production build
npm run make         # Package as .exe / .dmg / .deb
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking
```

To run a single test file: `npx vitest run path/to/file.test.ts`

## Architecture

Two-process Electron architecture:

- **Main process** (`src/main/`): Node.js context — window management, app lifecycle, IPC handlers. `preload.ts` uses `contextBridge` to safely expose APIs to the renderer.
- **Renderer process** (`src/renderer/`): Browser context — React UI, voice APIs, audio visualization. Cannot import Node.js modules directly.
- **Shared** (`src/shared/types.ts`): TypeScript interfaces and IPC channel type definitions used by both processes.

All IPC channels must be defined as typed contracts in `src/shared/types.ts`. Voice recognition, speech synthesis, and audio visualization all run in the renderer via Web Speech API and Web Audio API.

### State Management

React Context + useReducer for global state. Domain-specific hooks: `useVoice` for voice state, `useAudioVisualizer` for audio visualization.

## Coding Standards

- Functional components with hooks only (no class components)
- TypeScript only (`.ts`/`.tsx`) — no `.js` files
- `async/await` over `.then()` chains
- Named exports preferred (default exports only for page-level React components)
- Components should stay under ~150 lines; split if larger

## Testing

- Mock Speech API and Electron APIs using fixtures in `tests/mocks/`
- Test setup in `tests/setup.ts`

## Critical Constraints

- Never import Node.js modules in renderer code — use `contextBridge` in `preload.ts` to expose main-process APIs
- Voice APIs require user permission — always handle the permission-denied case
- Web Speech API availability varies by platform — include fallback or clear error message

# Claude Code App

A desktop application with voice input/output and real-time audio visualization, built with **Electron + TypeScript + React**.

## Quick Start

```bash
# Install dependencies
npm install

# Start in development mode (hot reload)
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Package as .exe / .dmg / .deb
npm run make
```

## Project Structure

```
├── CLAUDE.md                  # Claude Code project context (read this first!)
├── src/
│   ├── main/                  # Electron main process
│   │   ├── index.ts           # Window creation, app lifecycle
│   │   ├── ipc.ts             # IPC message handlers
│   │   └── preload.ts         # Secure bridge to renderer
│   ├── renderer/              # React frontend
│   │   ├── App.tsx            # Root component
│   │   ├── components/        # UI components
│   │   │   ├── AudioVisualizer.tsx
│   │   │   ├── TitleBar.tsx
│   │   │   ├── TranscriptPanel.tsx
│   │   │   └── VoiceButton.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useVoice.ts
│   │   │   └── useAudioVisualizer.ts
│   │   └── styles/
│   │       └── global.css
│   └── shared/
│       └── types.ts           # Shared TypeScript types & IPC contracts
├── tests/
│   ├── setup.ts               # Test mocks (Speech API, Electron)
│   └── app.test.tsx           # Unit & component tests
├── Dockerfile                 # CI builds & testing
└── electron.vite.config.ts    # Build configuration
```

## Working with Claude Code

This project includes a `CLAUDE.md` file that gives Claude Code full context about the architecture, coding standards, and patterns. When you run `claude` in this directory, it will automatically understand:

- The two-process Electron architecture
- How voice and audio APIs are integrated
- The typed IPC communication pattern
- Testing approach and mock structure

**Example prompts to try:**

```
Add a settings panel where users can choose their voice language
Make the visualizer respond to the beat with color changes
Add keyboard shortcut (Space) to toggle voice recording
Implement text-to-speech so the app can read responses aloud
Add a save button to export transcripts as a text file
```

## Key Technologies

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Runtime      | Electron 33                       |
| Language     | TypeScript 5 (strict)             |
| UI           | React 18                          |
| Voice Input  | Web Speech API                    |
| Voice Output | SpeechSynthesis API               |
| Visuals      | Web Audio API + Canvas            |
| Bundler      | electron-vite (Vite under the hood) |
| Testing      | Vitest + React Testing Library    |

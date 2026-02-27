---
description: Standard Frontend Workflow for CV Score Builder
---

# Frontend Workflow Standard

## Package Manager
We use **Bun** (`bun`) for all dependency management and script execution. It provides significantly faster installation and execution times.

## Project Initialization Command
If initializing or modifying the base project, use:
```bash
bunx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-bun --yes
```

## Development Scripts
- **Start Dev Server**: `bun run dev`
- **Build for Production**: `bun run build`
- **Start Production Server**: `bun run start`
- **Lint Code**: `bun run lint`

## Component Architecture
- **Server Components (Default)**: Use standard `export default function Component()` for Data fetching and layouts.
- **Client Components**: Use `"use client";` at the very top of the file only when interactivity (hooks, event listeners) or browser APIs are needed.
- **Directory Structure**:
  - `src/app/`: App router pages, layouts, and API routes.
  - `src/components/`: Reusable UI components. Group by domain (e.g., `dashboard/`, `builder/`, `export/`, and `ui/` for generic components).
  - `src/lib/`: Utility functions, constants, and the Gold Standard Schema logic.
  - `src/types/`: Shared TypeScript interfaces.

## Styling
- **Tailwind CSS**: Use Tailwind utility classes for all styling.
- **Design Principles**: Prioritize modern, elegant aesthetics. Use modern typography (e.g., Inter, Roboto), subtle micro-animations, adequate white space, and logical grouping.

## API Integration
- Use Next.js Route Handlers (`src/app/api/.../route.ts`) for server-side logic and interacting with external services (like Groq) to keep API keys secure.
- Use standard `fetch` API for making requests.

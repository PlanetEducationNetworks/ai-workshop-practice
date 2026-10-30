# Project rules (read by Claude Code)

- Stack: React 19 + Vite + TypeScript, tests with Vitest + Testing Library.
- Commands: `npm run dev`, `npm test`.
- UI: only use components from `src/components/ui`. Errors go in the `error` prop of `Input`.
- Never install a new package without asking first.
- Never use `dangerouslySetInnerHTML`.
- Done means: `npm test` passes and a test covers the change.
- Any dropdown, menu or popup you build needs tests for: clicking its trigger while open closes it, Escape closes it and returns focus to the trigger, and re-picking the current value changes nothing (no state or history change).

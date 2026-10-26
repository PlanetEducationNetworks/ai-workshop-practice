# Project rules (read by Claude Code)

- Stack: React 19 + Vite + TypeScript, tests with Vitest + Testing Library.
- Commands: `npm run dev`, `npm test`.
- UI: only use components from `src/components/ui`. Errors go in the `error` prop of `Input`.
- Never install a new package without asking first.
- Never use `dangerouslySetInnerHTML`.
- Done means: `npm test` passes and a test covers the change.
- A new test must be seen failing first, for the right reason. A test that can't fail proves nothing: jsdom doesn't blur an element that becomes disabled, so "focus is not lost" passed on broken code. For focus, assert the exact element that should have it (`toHaveFocus()`).

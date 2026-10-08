# TICKET-12 — Wrong password shows no error

## Problem (confirmed real)

In [`src/pages/LoginPage.tsx`](../src/pages/LoginPage.tsx), `onSubmit` only reacts to the
success branch:

```ts
const res = await signIn(email, password)
if (res.ok) {
  setUser(res.name)
}
// TICKET-12: when the password is wrong, nothing happens here.
```

`signIn` returns `{ ok: false, message: 'Wrong email or password.' }` on bad
credentials (see [`src/lib/auth.ts`](../src/lib/auth.ts)), but the component never
reads `res.message`, so a wrong password produces no visible feedback.

## Acceptance criteria

- A red message shows under the password field.
- It uses our `Input` from `src/components/ui`.
- A test covers the wrong-password case.

## Approach

1. **Add error state** to `LoginPage`:
   `const [error, setError] = useState('')`.
2. **Handle the failure branch** in `onSubmit`:
   - On success: `setUser(res.name)` (and clear any prior error).
   - On failure: `setError(res.message)`.
   - Clear the error at the start of each submit so a retry starts clean.
3. **Surface the message via our `Input`**: pass `error={error}` to the
   **password** `Input`. The existing `Input` already renders the message in a
   `<p className="error" role="alert">` under the field — no component changes
   needed, and this satisfies the CLAUDE.md rule that errors go in the `error`
   prop of `Input`.

### Sketch

```tsx
const [error, setError] = useState('')

async function onSubmit(e: FormEvent) {
  e.preventDefault()
  setError('')
  const res = await signIn(email, password)
  if (res.ok) {
    setUser(res.name)
  } else {
    setError(res.message)
  }
}

// ...
<Input label="Password" type="password" value={password}
       onChange={setPassword} error={error} />
```

## Test plan

Add to [`src/pages/LoginPage.test.tsx`](../src/pages/LoginPage.test.tsx) a case:

- Render `<LoginPage />`.
- Type a valid email and a wrong password.
- Click **Log in**.
- Assert `await screen.findByText('Wrong email or password.')` is in the document.

The existing happy-path test stays as-is.

## Scope / non-goals

- No new packages (CLAUDE.md rule).
- No `Input` component changes.
- No `dangerouslySetInnerHTML`.
- Done = `npm test` passes and a test covers the change.

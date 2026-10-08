# AI workshop · practice repo

A tiny login page (EduPay) with a real bug. Practice for the October AI workshop.
No client code, no real data. Break things freely.

## TICKET-12 · Wrong password shows no error

When the password is wrong, the login page does nothing.

- Show a red message under the password field
- Use our `Input` component from `src/components/ui`
- Add a test for the wrong-password case
- File: `src/pages/LoginPage.tsx`

## TICKET-13 · Bonus: password strength (if you finish early)

On the signup page (`npm run dev`, then open `/#signup`), show how strong the password is, under the password field:

- Short or simple password → show **Weak**
- Long password with letters, numbers and symbols → show **Strong**
- File: `src/pages/SignupPage.tsx`

Read `CLAUDE.md` before you start. The checks will notice if you break a rule.

## How to do it

1. **Fork** this repo to your GitHub account, then clone your fork.
2. `npm install` (do this before the session)
3. `npm run dev` to see the page · `npm test` to run tests
4. Fix TICKET-12 **with AI** (Claude Code or ChatGPT). Use the "before Enter" checklist.
5. Push to a branch and open a **pull request to this repo** titled `TICKET-12 · your name`.

Every pull request is checked automatically and appears on the live board:

| Check | What it means |
|---|---|
| Existing tests | You didn't break anything |
| TICKET-12 fixed | The error really shows, on the password field |
| No new packages | AI didn't sneak in a dependency |
| No unsafe HTML | No `dangerouslySetInnerHTML` |
| Test added | You wrote or changed a test |

Login that works: `demo@edupay.test` / `correct-horse`

## Solution notes

### TICKET-12 · Wrong password shows no error

- **Bug:** `onSubmit` in `src/pages/LoginPage.tsx` only handled a successful login. When `signIn` returned `{ ok: false, message }`, the message was dropped, so nothing showed.
- **Fix:** store the message in an `error` state and pass it to the password field's `error` prop. Our `Input` already shows it in red (`role="alert"`) and sets `aria-invalid`. No new packages.
- **Test:** `src/pages/LoginPage.test.tsx` signs in with a wrong password and checks that the alert says "Wrong email or password." and the Password field is `aria-invalid`. It failed before the fix and passes after.

### TICKET-13 · Password strength

- **Change:** `src/pages/SignupPage.tsx` shows **Strong** under the password field when the password has 12+ characters with a letter, a number and a symbol, and **Weak** otherwise. Nothing shows while the field is empty. It's a small function, not a strength library, because CLAUDE.md says no new packages.
- **Test:** `src/pages/SignupPage.test.tsx` covers an empty field (nothing shown), a short password (Weak), a long letters-only password (Weak) and a long mixed password (Strong).

### Review: two dangerous lines in an AI-written TICKET-12 change

1. `import { validate } from 'react-form-guardz'`: a new, unknown package. AI tools often make up package names, and attackers publish malware under those names (slopsquatting). It breaks the "no new packages" rule, and it isn't needed.
2. `<p dangerouslySetInnerHTML={{ __html: error }} />`: renders the error as raw HTML, which is an XSS risk if the message ever contains user input. It breaks the "no unsafe HTML" rule. Use `<Input ... error={error} />` instead. React escapes the text.

### How to check

```bash
npm test        # all tests pass
```

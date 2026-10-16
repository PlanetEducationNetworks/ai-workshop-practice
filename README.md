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

## TICKET-14 · Session 2: the fees page (3 parts, it gets harder)

Open `npm run dev`, then `/#fees` (or `/#fees-sibling` for a student with a sibling).
Already forked in Session 1? On your fork on GitHub, click **Sync fork** first, then `git pull`.

**Part 1 · Wrong prices.** The library card shows **£1.25**, but the real fee is **£12.50**. The exam fee and the total are wrong too.
- Every price must be right; the total is **£499.55**
- Finance will keep typing prices in different ways (`12.5`, `30`, `7.05`), so don't just edit the data

**Part 2 · Sibling discount.** A student with a sibling at the school (`hasSibling: true`) gets **10% off tuition only**. Not the library card, exam fee or lab kit.
- Show it as its own line with the word "discount", for example `Sibling discount −£45.00`
- The total for a sibling is **£454.55**. No sibling: no discount line.

**Part 3 · Pay in 3.** Show the total split into **3 instalments**, each in an element with `data-testid="instalment"`.
- The 3 amounts must add up to the total **exactly**. If it doesn't split evenly, the first instalments are a penny more.
- Sibling: £151.52 · £151.52 · £151.51

For every part: start with the 3 sentences, add a test, no new packages. If the AI's answer is wrong, **stop, rewind, and say what was wrong**. Don't pile fixes on top.

## TICKET-15 · Take-home team task (Tigers vs Eagles), due Wed 21 Oct 18:00

A real ticket from our PEN Ticketing (Admin › Finance), copied as it was written:

> **Fix non-functional pagination and missing 'rows per page' on Agent Overview**
> The Previous and Next buttons don't work, and the rows per page dropdown is missing. Users should be able to move between pages of agent data and choose how many agents they see on one page.

Open `npm run dev`, then `/#agents`. The page is `src/pages/AgentOverviewPage.tsx`, the 57 agencies are in `src/data/agents.ts` (made up).

**Work as a team, on your team branch in this repo** (not a fork): `ticket-15-tigers` or `ticket-15-eagles`. `git pull` before you start, push small commits often.

1. **Designers first:** design the Agent Overview table in Figma (default, page 2, rows-per-page menu open, empty, loading, phone 375px). Post the link in your team's Teams thread.
2. **The ticket leaves things out on purpose.** Ask the PM (Radu) in your team thread. Only your team sees the answers.
3. **Developers build it with Claude Code**, from the design. Start with: *"Ask me 3 questions before you write code."* One session per task, `/clear` between tasks. Wrong answer? Rewind, say what was wrong. No new packages. `npm test` must pass.
4. **A designer reviews the pull request** against the Figma frame and leaves a comment.
5. Open **one pull request to `main`** titled `TICKET-15 · Tigers` (or Eagles), with the Figma link in the description.

**Points (shown in session 3):** works as the PM asked (checked by hidden tests) +2 +2 · Figma link in the PR +2 · designer review on the PR +1 · smaller change than the other team +1.

## How to do it

1. **Fork** this repo to your GitHub account, then clone your fork.
2. `npm install` (do this before the session)
3. `npm run dev` to see the page · `npm test` to run tests
4. Fix TICKET-12 **with AI** (Claude Code or ChatGPT). Use the "before Enter" checklist.
5. Push to a branch and open a **pull request to this repo** titled `TICKET-12 · your name` (Session 2: `TICKET-14 · your name`).

Every pull request is checked automatically and appears on the live board:

| Check | What it means |
|---|---|
| Existing tests | You didn't break anything |
| TICKET-12 fixed | The error really shows, on the password field |
| TICKET-14 parts 1, 2, 3 | Prices · sibling discount · pay in 3 (each checked on its own) |
| No new packages | AI didn't sneak in a dependency |
| No unsafe HTML | No `dangerouslySetInnerHTML` |
| Test added | You wrote or changed a test |

Login that works: `demo@edupay.test` / `correct-horse`

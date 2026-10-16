# Lessons

## Never tack a git command that changes state onto an unrelated command
- **What happened:** a stray `git stash -- <file>` at the end of an edit script silently reverted a rewritten file to master.
- **Rule:** git commands that change the working tree (`stash`, `checkout`, `restore`, `reset`) only run on their own, deliberately, after checking `git status`. Use a scratch worktree (`git worktree add <scratchpad>/master HEAD`) or a backup copy in the scratchpad to compare against master, not the stash.

## Weigh the roadmap, not just YAGNI, when choosing storage or other foundations
- **What happened:** I proposed localStorage because it was the smallest change. The user preferred IndexedDB: the async rework is cheap while the app is small, and planned features (history, nesting) would outgrow localStorage.
- **Rule:** for foundational choices that are expensive to change later, present the cost of changing now against the cost of changing later, using the `todo` roadmap. YAGNI applies to features, not to foundations we already know we'll outgrow.

## Async store reads must wait for queued writes
- A read issued while a write is still in flight can open its IndexedDB transaction first and return stale data. Stores serialise writes and make reads wait on the write queue. Test this by reading without awaiting the save.

## Delete files with `rm`, not `git rm`
- `git rm` stages the deletion, and staging is the human-review seam. Use plain `rm`.

## Hash URLs to path URLs turns in-page navigation into reloads
- **What happened:** `page.goto('/#workouts')` only changed the hash; `page.goto('/workouts')` reloads the page, cutting off an IndexedDB save still in flight, so a storage e2e test failed.
- **Rule:** when a test edits and then moves on, move with the app's own links (or a click), not `goto`, unless a reload is the point of the test.
- **Again:** `page.reload()` straight after a `check()` lost the save in a preferences test, and so did a `goto` to another view. To prove a setting persisted, leave and come back with nav links and assert it; do the same before any `goto` that relies on the save.

## Re-read a file the user has open before editing it with a script
- **What happened:** a scripted edit matched against beep.js as I'd read it earlier, but the user had reformatted it in the meantime. The script's assert caught it, so nothing was overwritten.
- **Rule:** when a turn or more has passed, check `git diff <file>` before a scripted edit, and build on the user's version. Always assert the old text matches before replacing.

## Stop background servers by port, not by command line
- **What happened:** `pkill -f "http-server <dir>"` missed a server started with `npx`, because the process runs as `node …` with different arguments, so it kept running.
- **Rule:** after a test run, stop a server with `lsof -ti :<port> | xargs kill`, then check the port is free.

## Throwaway Playwright specs outside the repo can't resolve packages
- **What happened:** a check spec in the scratchpad failed with "Cannot find package '@playwright/test'", because Node resolves imports from the spec's own folder.
- **Rule:** import it by absolute path (`<repo>/node_modules/@playwright/test/index.mjs`), and use a scratchpad config that spreads the repo's config with its own `testDir`.

## Wait for a view's async setup before interacting in e2e tests
- **What happened:** removing the embedded MP3 made the page's `load` event fire sooner, so `page.goto` returned before the timer's async setup had attached its keydown listener, and a space-bar test failed. The slow audio load had hidden the race.
- **Rule:** after `goto`, wait for something the view renders alongside its listeners (e.g. the timer title) before clicking or pressing keys. When comparing against master in a worktree, compare on the same disk; timing differs across volumes.

## A new link can duplicate an accessible name the tests select by
- **What happened:** I offered "Guided plan" both in the first-visit chooser and in the Library panel, so `getByRole('link', { name: /^Guided plan/ })` matched two elements and every guided e2e test failed in strict mode.
- **Rule:** before adding a link or button, check the page for another control with the same name. Two controls with one name on one screen is usually a UX smell too, so show one at a time rather than loosening the selector.

## Empty filtered output is not a pass until the filter is proven to match
- **What happened:** I ran `tsc -p ../tsconfig.json` from `src/`, so errors were reported relative to `src/`, and a `grep "src/…"` over them printed nothing. That looked like a clean result but matched nothing at all.
- **Rule:** run type-checks and linters from the repo root, and before trusting an empty `grep` of their output, check the unfiltered error count moved.

## List removal targets explicitly, never with a glob after `cd`
- **What happened:** `rmdir js/src/* …` in a command that also `cd`'d was blocked by the safety check, so none of the chained moves ran either.
- **Rule:** keep removals in their own command with literal paths (`rmdir js/src/plans js/src/views …`), separate from moves and installs.

## A reused dev server serves a stale build
- **What happened:** Playwright's `reuseExistingServer` picked up a server already on :4173, which served the old compiled JS, so a new e2e assertion failed against markup I'd already changed.
- **Rule:** run `npm run build` before `npx playwright test` whenever a server may already be running, and don't kill a server I didn't start.

## Run throwaway TypeScript with Node, not vitest pointed outside the repo
- **What happened:** `npx vitest run --root / <scratchpad>/x.test.ts` made vitest crawl the whole filesystem, and it hung until stopped.
- **Rule:** for a quick look at what a module produces, write a plain script in the scratchpad that imports by absolute path and run it with `node --experimental-strip-types --no-warnings <script>.ts`. Never set a test runner's root above the repo.

## Narrowing a catch-all route breaks paths that quietly relied on it
- **What happened:** anchoring the home route (`""` → `/^$/`) for the 404 page left `/index.html` and a unit test's `/app/workouts` with no route. Both had only ever worked because `""` matched everything.
- **Rule:** before narrowing a route, list every path the tests and servers use (`index.html`, base path with and without a trailing slash) and check each still has an explicit match.

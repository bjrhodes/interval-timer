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

## Re-read a file the user has open before editing it with a script
- **What happened:** a scripted edit matched against beep.js as I'd read it earlier, but the user had reformatted it in the meantime. The script's assert caught it, so nothing was overwritten.
- **Rule:** when a turn or more has passed, check `git diff <file>` before a scripted edit, and build on the user's version. Always assert the old text matches before replacing.

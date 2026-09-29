# Lessons

## Never tack a git command that changes state onto an unrelated command
- **What happened:** a stray `git stash -- <file>` at the end of an edit script silently reverted a rewritten file to master.
- **Rule:** git commands that change the working tree (`stash`, `checkout`, `restore`, `reset`) only run on their own, deliberately, after checking `git status`. Use a scratch worktree (`git worktree add <scratchpad>/master HEAD`) or a backup copy in the scratchpad to compare against master, not the stash.

## Weigh the roadmap, not just YAGNI, when choosing storage or other foundations
- **What happened:** I proposed localStorage because it was the smallest change. The user preferred IndexedDB: the async rework is cheap while the app is small, and planned features (history, nesting) would outgrow localStorage.
- **Rule:** for foundational choices that are expensive to change later, present the cost of changing now against the cost of changing later, using the `todo` roadmap. YAGNI applies to features, not to foundations we already know we'll outgrow.

## Async store reads must wait for queued writes
- A read issued while a write is still in flight can open its IndexedDB transaction first and return stale data. Stores serialise writes and make reads wait on the write queue. Test this by reading without awaiting the save.

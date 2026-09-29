## Conventions

- **YAGNI** Changes should be minimal. Prefer language features initially; device abilities second; then existing dependencies where possible; one liners are better than extensive file structures. Do not over-engineer when a simple solution will do.
- **Code tags drive review expectations** `@todo` must be resolved before merge to master; `@extend` marks a deliberate phase-2 hook; `@improvement` flags tech debt — refactor it if you're touching that code, never copy it forward as-is.

## Rules

1. Do not commit or push. Staging and committing is the human-review seam. Please do suggest commit messages though!
2. Avoid direct dependencies wherever possible. We don't want to have to audit dependencies in the future.

## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update '.claude/lessons.md' with the
    pattern
- If you get errors done by you and you catch it while testing, update
    '.claude/lessons.md' with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness
- Once happy with the verification, write output as usual, and append a commit message for the user to use after manual review.

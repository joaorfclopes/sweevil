---
name: fix-issue
description: Fix a GitHub issue end-to-end
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS:

1. Run `gh issue view $ARGUMENTS` to read the full issue description and comments
2. Identify the affected area (backend route, frontend screen, model, etc.)
3. Search the codebase for relevant files with `Grep` and `Glob`
4. Read the relevant files before making any changes
5. Implement the minimal fix — do not refactor surrounding code
6. Run `npm run backend` or `cd frontend && npm test` if applicable to verify
7. Create a commit with a message that references the issue: `fix: <description> (closes #$ARGUMENTS)`

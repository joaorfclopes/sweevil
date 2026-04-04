---
name: review-pr
description: Review a GitHub pull request for correctness, security, and style
disable-model-invocation: true
---

Review pull request $ARGUMENTS:

1. Run `gh pr view $ARGUMENTS` to read the PR description
2. Run `gh pr diff $ARGUMENTS` to see all changes
3. For each changed file, read the surrounding context with `Read`
4. Review for:
   - **Correctness**: logic errors, edge cases, off-by-ones
   - **Security**: injection, auth bypass, exposed secrets, unvalidated input
   - **Consistency**: follows project conventions in CLAUDE.md
   - **Breaking changes**: API contract changes, model schema changes
5. Output feedback grouped by file, with line references where possible
6. End with a clear verdict: `APPROVE`, `REQUEST CHANGES`, or `COMMENT`

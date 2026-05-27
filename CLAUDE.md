# CLAUDE.md

**Quick-start guide for Claude Code - Complete details in linked docs**

---

## Git commits
When committing, always use `git add .` unless I explicitly specify files to stage.

---

## Project Overview

**Tech Stack**: Express.js + MongoDB/Mongoose 8 + React 18 + Redux v5 — public e-shop and booking site for a tattoo studio (clients are anonymous; two admin users manage the backend)

---

## Session Start Protocol ⚡

**MANDATORY** at start of each session:

```bash
# 1. Load essential docs (~800 tokens - 2 min read)
✓ .claude/COMMON_MISTAKES.md      # ⚠️ CRITICAL - Read FIRST
✓ .claude/QUICK_START.md          # Essential commands
✓ .claude/ARCHITECTURE_MAP.md     # File locations
```

**At task completion:**

- Create completion doc in `.claude/completions/YYYY-MM-DD-task-name.md`
- Use template: `.claude/templates/completion-template.md`
- Move session file to `.claude/sessions/archive/` (if created)
- Update docs as needed (see `.claude/DOCUMENTATION_MAINTENANCE.md`)

**Then load task-specific docs** (~500-1500 tokens):

- See `docs/INDEX.md` for navigation guide

**⚠️ NEVER auto-load:**

- Files in `.claude/completions/` (0 token cost)
- Files in `.claude/sessions/` (0 token cost)
- Files in `docs/archive/` (0 token cost)
- Only load when user explicitly requests

---

## Quick Start Commands

```bash
npm start              # Run backend + frontend concurrently
npm run backend        # Backend only (nodemon)
npm run frontend       # Frontend only (CRA on port 3000)
npm run build          # Build frontend for production
npm run deploy         # Trigger Heroku deploy
```

**See**: `.claude/QUICK_START.md` for complete command reference

---

## Documentation Navigation

**📋 Master Index**: `docs/INDEX.md` - Complete navigation with token costs

### Core References

- **Common Mistakes**: `.claude/COMMON_MISTAKES.md` ⚠️ **MANDATORY**
- **Quick Start**: `.claude/QUICK_START.md`
- **Architecture Map**: `.claude/ARCHITECTURE_MAP.md`

---

## Plan Mode

Use **Shift+Tab** to toggle plan mode — Claude outlines steps before executing. Useful for multi-file changes or anything risky.

---

## When Context is Compacted

Preserve: current task, files being edited, blocking errors, decisions made this session.
Drop: exploratory reads, tool output details, already-committed changes.

---

**Last Updated**: 2026-05-11

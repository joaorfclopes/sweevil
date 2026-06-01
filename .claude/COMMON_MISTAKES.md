# Common Mistakes

**⚠️ CRITICAL - Read at session start (2 min saves 2 hours!)**

---

## Top Critical Rules

### 1. Never commit or push unprompted

**Symptom**: Claude commits/pushes after making changes
**Rule**: Make all code changes, then **wait** for user to explicitly ask to commit or push. Never auto-commit.

### 2. No client-facing login — ever

**Symptom**: Designing auth flows, registration pages, or user-facing login for the public
**Rule**: This site has **no public users**. Only admins (João + studio account). No public registration, no general user base. All auth decisions must reflect admin-only access.
**Fix**: User creation is done via better-auth admin plugin API → user then registers passkey from admin panel.

### 3. Frontend deps require --legacy-peer-deps

**Symptom**: `npm install` fails in `frontend/`
**Fix**: Always `npm install --legacy-peer-deps` inside `frontend/`

### 4. Auth is passkey-only, no passwords/JWTs

**Symptom**: Reaching for JWT or password-based auth logic
**Rule**: Auth is better-auth + `@better-auth/passkey`. Cookie-based server-side sessions. `BETTER_AUTH_SECRET` env var required. Do not add password or JWT logic.

### 5. Backend uses ES modules

**Symptom**: `require()` syntax, missing file extensions in imports
**Rule**: Root package has `"type": "module"`. Use `import`/`export` everywhere in backend. Include `.js` extensions in relative imports.

### 6. Update Swagger docs when adding/changing endpoints

**Symptom**: New or modified endpoints not visible in `/api-docs`
**Rule**: When creating or updating any route handler in `backend/routes/*.js`, add or update the `@swagger` JSDoc block above it. Use the existing annotations in `orderRoute.js` as style reference. Swagger UI available at `http://localhost:8123/api-docs` (dev only).

### 7. No axios — use native fetch for external HTTP calls

**Symptom**: Reaching for `axios` (or `node-fetch`, `got`, etc.) to call an external API from backend
**Rule**: Node 18+ has built-in `fetch`. Use it. `axios` is not installed and should not be added. Build query strings with `URL` + `searchParams.set`.

### 8. MUI components that open overlays cause scrollbar shift

**Symptom**: Adding a MUI Select, Dialog, Modal, Drawer, or Popover causes the scrollbar to disappear and content to shift right when opened
**Rule**: MUI overlay components lock `document.body` scroll by default, which removes the scrollbar and shifts layout. Every new component that opens an overlay must be checked.
**Fix for Select/Autocomplete**: Pass `MenuProps={{ disableScrollLock: true }}`
**Fix for Dialog/Modal/Drawer**: Pass `disableScrollLock` prop directly, OR use the existing `useScrollLock` hook at `frontend/src/hooks/useScrollLock.js` which handles padding compensation
**Check**: Open the component in browser → observe if scrollbar disappears → if yes, apply the fix above

### 9. TDD required — tests before implementation

**Symptom**: Writing implementation code before tests exist
**Rule**: For every feature or bugfix: write tests first → confirm red → implement → only done when green. Never report a task complete before tests pass.

---

## Required Environment Variables

- `MONGODB_URL` — MongoDB connection string
- `BETTER_AUTH_SECRET` — Auth signing secret
- See `.env.example` for full list (AWS S3, PayPal, Gmail OAuth2, branding vars)

---

**Update this file when:**

- Bug took >1 hour to debug
- Error could cause production issue
- Mistake repeated across sessions

**Last Updated**: 2026-05-21

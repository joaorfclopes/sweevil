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

**Last Updated**: 2026-05-11

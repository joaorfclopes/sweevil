# Quick Start Commands

**Essential commands for this project**

---

## Development

```bash
npm start              # Run backend + frontend concurrently
npm run backend        # Backend only (nodemon, watches backend/)
npm run frontend       # Frontend only (CRA dev server on port 3000)
npm run start:debug    # Run both with Node inspector enabled
```

## Build & Deploy

```bash
npm run build          # Build frontend for production (outputs to frontend/build/)
npm run deploy         # Trigger Heroku deploy (commits, builds, pushes)
```

## Frontend Tests

```bash
cd frontend && npm test                                              # Run all Jest tests
cd frontend && npm test -- --testPathPattern=MyComponent            # Run single test
cd frontend && npm install --legacy-peer-deps                       # Install frontend deps (flag required)
```

## Common Workflows

1. **Starting work**: `npm start` — boots Express on :5000 + CRA on :3000
2. **Running tests**: `cd frontend && npm test`
3. **Deploying**: `npm run deploy` (commits + builds + pushes to Heroku)

---

**Last Updated**: 2026-05-11

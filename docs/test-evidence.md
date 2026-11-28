# Test evidence

## Tooling audit

The project previously used Vitest + jsdom + fake-indexeddb for unit and interaction coverage. To add browser-level verification, Playwright was added with a Chromium-only E2E setup and the axe accessibility harness.

## Browser install step

Before running the browser suite, install Chromium locally:

```bash
pnpm exec playwright install chromium
```

## Verification run

The current implementation was verified with:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

These checks passed successfully during the final validation run.

## Handoff notes

- The dev receipt stub exposes session helpers for sign-in/sign-out and request diagnostics used by the sync flow tests.
- The auth/session layer now treats expired sign-ins as signed out, preventing stale tokens from sending queued reports.
- The Playwright smoke suite lives under `e2e/` and is configured to run against the local Vite dev server.

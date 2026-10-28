# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

перед рефакторингом или работой с кодом всегда читай файл spec.md

@AGENTS.md

`spec.md` is the project's technical reference: FSD rules and folder layout (section 4), domain model and API endpoints (5), auth (6), routes (7), open issues (9) and code conventions (10).

## Commands

- `npm run dev` — dev server (talks to the backend at `http://localhost:8001/api`)
- `npm run build` / `npm run start` — production build (`output: "standalone"`) and server
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`); currently 0 errors / 0 warnings, keep it that way
- `npm run lint:fsd` — Steiger, checks FSD rules in `src/` (config in `steiger.config.ts`)

There is no test runner configured. Docker build needs the build arg `NEXT_PUBLIC_BACK_API_URL`; the image runs `node server.js` on port 3000.

Type-checking gotcha: stale `.next/dev/types/validator.ts` (written by `next dev`) can contain errors that make `tsc`/`next build` fail or silently skip checking. If that happens, delete `.next/dev` while the dev server is stopped.

## Architecture

Frontend-only Next.js 16 (App Router, React 19, Tailwind 4, shadcn/Radix UI, TanStack Query, axios) admin panel for a detection-rules / SIEM-style backend. UI text is in Russian. The code follows **Feature-Sliced Design**.

- Root `app/` is **routing only**: every `page.tsx`/`layout.tsx` is a thin server component that renders a view from `@/views/*` (or calls `redirect(routes.*)`). No markup, hooks or `"use client"` there.
- FSD layers live in `src/`: `app` → `views` → `widgets` → `features` → `entities` → `shared`. Import only downward; slices of the same layer never import each other; import a slice only through its `index.ts`. Entity-to-entity type references go through `@x` files (e.g. `@/entities/event/@x/incident`).
- The FSD `pages` layer is named `views` so Next doesn't treat `src/pages` as the Pages Router. Steiger doesn't know this name, so it doesn't check imports inside `views` — keep views importing only lower layers via public APIs.
- Alias `@/*` → `./src/*`. `@/app/*` is the FSD layer `src/app`, not the routing folder.
- `src/` must never import from the root `app/`.

Per-domain pattern (reference implementation: `rules`):
- `entities/<x>`: `model/types.ts`, `api/` (request functions, `<x>Keys` query-key factory, `useQuery` hooks), presentational `ui/` that receives actions via an `actions` slot or callbacks.
- `features/<x>-<action>`: `useMutation` hooks (invalidate only through `<x>Keys`, show `sonner` toasts) and their UI (buttons, forms, filters).
- `widgets/*`: compose entities + features and own screen state (pagination, applied filters, loading/error).
- `views/*`: page composition, receives route params as props.

Key infrastructure:
- `src/shared/api` — `axiosApi` with `withCredentials` (cookie auth). On a 401 it retries once after POSTing `/users/login` to refresh the session, otherwise redirects to `/login`.
- `src/shared/config` — `apiURL` (localhost:8001 in dev, `http://backend:8000/api` server-side in production, `/api` in the browser in production), `routes` (always use these instead of hardcoded URLs), `roleDashboardPaths`, `UserRole`.
- `src/shared/ui` — shadcn components (`npx shadcn add` writes here via `components.json`), `pagination`, `form` (`ArrayField`, `inputClass`…), `detail-fields` (`DetailField`/`DetailFieldList`/`DetailSection`).
- `src/app/providers` — QueryClient defaults (retry 1, no refetch on focus, 1 min staleTime).

Routing and auth:
- Route `params` in Next 16 are a Promise **and arrive URL-encoded** (like `useParams()`). Decode in the route file when the id is re-encoded downstream (`routes.*`, `encodeURIComponent` in API calls) — see the organizations and events routes.
- Auth is enforced client-side only: `app/(dashboard)/layout.tsx` → `src/app/layouts/DashboardLayout` → `src/app/guards/RoleGuard` (calls `useMe()`, redirects by role). There is no server-side protection; in Next 16 that would be `proxy.ts`, not `middleware.ts`.
- `redirect()` inside the `(dashboard)` layout responds with an in-stream `NEXT_REDIRECT` (HTTP 200), not a 307 — this is expected.
- Incidents live at `/admin/incidents`; the `widgets/hunters-tabs` "Инциденты" tab links there, scenarios and events stay under `/admin/hunters/*`.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

перед рефакторингом или работой с кодом всегда читай файл spec.md

@AGENTS.md

`spec.md` is the project's technical reference (domain model, API endpoints, auth, routes, known issues). The project is being migrated to **Feature-Sliced Design**; follow the target structure and migration plan in `spec.md` sections 4 and 8 for all new code.

Migration status: `src/shared`, `src/app` and the whole `rules` domain are already in FSD. `rules` is the reference implementation: copy its layout (`src/entities/rule`, `src/features/rule-*`, `src/widgets/rule*`, `src/views/rule*`) when moving the next domain. All other domains still live in the legacy `components/`, `services/`, `types/` folders described below. Legacy code may import new public APIs (`@/shared/...`, `@/entities/rule`), but `src/` must not import legacy folders (the only exception is the temporary `@/services/users` import in `RoleGuard` and `Sidebar`).

Transitional `tsconfig` aliases: `@/{app,views,widgets,features,entities,shared}/*` → `src/<layer>/*`, and `@/*` → repo root for legacy folders. Note that `@/app/*` resolves to the FSD layer `src/app`, not the Next.js routing folder `app/`.

Type-checking gotcha: stale `.next/dev/types/validator.ts` (written by `next dev`) can contain syntax errors that make `tsc`/`next build` fail or silently skip checking. If that happens, delete `.next/dev` while the dev server is stopped.

## Commands

- `npm run dev` — dev server (talks to the backend at `http://localhost:8001/api`)
- `npm run build` / `npm run start` — production build (`output: "standalone"`) and server
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)

There is no test runner configured. Docker build needs the build arg `NEXT_PUBLIC_BACK_API_URL`; the image runs `node server.js` on port 3000.

## Architecture

Frontend-only Next.js (App Router, React 19, Tailwind 4, shadcn/Radix UI in `src/shared/ui`) admin panel for a detection-rules / SIEM-style backend. UI text is in Russian.

### Shared infrastructure (already FSD)
- `src/shared/api` — `axiosApi` with `withCredentials` (cookie auth). On a 401 it retries once after POSTing `/users/login` to refresh the session, otherwise redirects to `/login`.
- `src/shared/config` — `apiURL` depends on the environment: localhost:8001 in dev, `http://backend:8000/api` for server-side code in production (docker-compose service name), and relative `/api` in the browser in production. It also holds `routes` (use these instead of hardcoded URLs), `roleDashboardPaths` and `UserRole`.
- `src/shared/ui/form` — `ArrayField`, `FieldError`, `SectionTitle`, `inputClass`, `errorClass`.
- `src/app/providers` — QueryClient defaults (retry 1, no refetch on focus, 1 min staleTime).

### Legacy data layer (`services/<domain>/`, domains not yet migrated)
Each domain has a pair of files: `*Requests.ts` (plain async functions using `axiosApi`) and `*Queries.ts` (TanStack Query hooks wrapping them). Types live in `types/<domain>.ts`, feature components in `components/<feature>/`. When migrating a domain, split these per the `rules` example: GET requests and `useQuery` hooks go to `entities`, `useMutation` hooks and forms go to `features`.

### Routing and auth
- Route groups: `app/(auth)` (login) and `app/(dashboard)` (everything else). `/` just redirects to `/login`.
- Roles are `ADMIN | ANALYST | VIEWER`. Most pages live under `app/(dashboard)/admin/*`; `analyst` and `viewer` are minimal.
- Auth is enforced client-side only: `app/(dashboard)/layout.tsx` renders `src/app/layouts/DashboardLayout`, which wraps pages in `src/app/guards/RoleGuard` (calls `useMe()` and redirects by role). There is no server-side route protection. In Next 16, server-side request interception is `proxy.ts`, not `middleware.ts`.
- `admin/hunters/layout.tsx` provides tab navigation for scenarios / events. The incidents tab links out to `/admin/incidents`, because incidents moved out of `hunters`.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

перед рефакторингом или работой с кодом всегда читай файл spec.md

@AGENTS.md

`spec.md` is the project's technical reference (domain model, API endpoints, auth, routes, known issues). The project is being migrated to **Feature-Sliced Design**; follow the target structure and migration plan in `spec.md` sections 4 and 8 for all new code. The architecture notes below describe the current, pre-migration layout.

## Commands

- `npm run dev` — dev server (talks to the backend at `http://localhost:8001/api`)
- `npm run build` / `npm run start` — production build (`output: "standalone"`) and server
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)

There is no test runner configured. Docker build needs the build arg `NEXT_PUBLIC_BACK_API_URL`; the image runs `node server.js` on port 3000.

## Architecture

Frontend-only Next.js (App Router, React 19, Tailwind 4, shadcn/Radix UI in `components/ui`) admin panel for a detection-rules / SIEM-style backend. UI text is in Russian. Import alias `@/*` maps to the repo root.

### Data layer (`services/<domain>/`)
Each domain has a pair of files: `*Requests.ts` (plain async functions using the shared axios instance) and `*Queries.ts` (TanStack Query hooks wrapping them). Pages/components consume only the hooks. Types live in `types/<domain>.ts`. Follow this pair-per-domain pattern when adding an API area (see `services/mitre/` for the newest one).

- `lib/axiosAPi.ts` — shared axios instance with `withCredentials` (cookie auth). On a 401 it retries once after POSTing `/users/login` to refresh the session, otherwise redirects to `/login`.
- `constants/main.ts` — `apiURL` is environment-dependent: localhost:8001 in dev, `http://backend:8000/api` for server-side code in production (docker-compose service name), and relative `/api` in the browser in production. It also holds the sidebar menu (`dashboardMenuItems`), `roleDashboardPaths`, and shared style tokens (`inputClass`, `theme`).
- `providers/provider.tsx` — QueryClient defaults (retry 1, no refetch on focus, 1 min staleTime).

### Routing and auth
- Route groups: `app/(auth)` (login) and `app/(dashboard)` (everything else). `/` just redirects to `/login`.
- Roles are `ADMIN | ANALYST | VIEWER` (`types/users.ts`). Most pages live under `app/(dashboard)/admin/*`; `analyst` and `viewer` are minimal.
- Auth is enforced client-side only: `app/(dashboard)/layout.tsx` wraps pages in `middleware/ProtectedLayout.tsx` (despite the folder name this is NOT Next.js middleware), which calls `useMe()` and redirects by role. There is no server-side route protection.
- `admin/hunters/layout.tsx` provides tab navigation for incidents / scenarios / events. Note both `admin/incidents`+`admin/scenarios` and `admin/hunters/incidents`+`hunters/scenarios` exist.

### Components
Feature components live in `components/<feature>/` (rule, crule, super, ioc, audit, events, incidents, scenarios, mitre, ...); pages in `app/` are thin and delegate to them. Shared form helpers (`FieldError`, `SectionTitle`, `ArrayField`) are in `services/utils.tsx`.

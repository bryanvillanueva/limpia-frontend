# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build (outputs to dist/)
npm run lint      # ESLint (flat config, eslint.config.js)
npm run preview   # Preview production build locally
```

No test framework is configured.

## Architecture

React 19 + Vite 7 SPA for **Limpia Cleaning** internal management. UI is built with MUI v7, routing with react-router-dom v7, HTTP with axios.

### API Communication
- `src/services/apiClient.js` — axios instance with `VITE_API_URL` base, auto-attaches JWT from `localStorage('limpia_token')`, redirects to `/login` on 401.
- Each domain has a service file (`src/services/*.service.js`) that wraps apiClient calls. Always use these, never raw axios.
- Env files: `.env.development` (localhost:3000) and `.env.production` (Railway). Access via `import.meta.env.VITE_API_URL`.

### Auth & Routing
- `AuthContext` stores token + user (`{ id, nombre, rol }`) in state and localStorage (`limpia_token`, `limpia_user`).
- `ProtectedRoute` checks auth + optional `roles` prop, redirects unauthenticated to `/login`, unauthorized to `/no-autorizado`.
- Routes nest inside `<MainLayout>` (Sidebar + Topbar + Outlet). Role groups defined in `AppRouter.jsx`: `ADMIN_MANAGER`, `ADMIN_ONLY`, `ADMIN_ACCOUNTANT`, `ADMIN_MANAGER_ACCOUNTANT`, `ALL_AUTH`, `CLEANER_ONLY`.
- Four roles: `admin`, `manager`, `accountant`, `cleaner`.

### Reusable UI Components (`src/components/ui/`)
- **DataTable** — sortable table with search, pagination
- **PageHeader** — page title + action button
- **FormModal** — standardized dialog for create/edit forms
- **ConfirmDialog** — delete/action confirmation
- **StatusBadge** — colored status indicators (custom soft bg/fg pairs, not MUI Chip `color` prop)
- **EmptyState** — placeholder for empty lists
- **SiteMap** — Mapbox GL integration

### Theme (`src/theme/theme.js`)
- `getTheme(mode)` returns light or dark MUI theme. Mode stored in `localStorage('limpia_theme')`.
- Primary color: `#26614f` (green). Font: Montserrat.
- Sidebar: 260px wide, pill-shaped nav items, active = green fill.

## Conventions

- **Language**: UI text is in Spanish. Code (variables, comments) in English.
- **MUI v7**: Use `slotProps` (not `InputProps`) for TextField adornments.
- **Supply orders API**: prefix is `/supply-orders`, not `/orders`.
- **ESLint**: `no-unused-vars` ignores variables starting with uppercase or underscore (`varsIgnorePattern: '^[A-Z_]'`).
- **Page pattern**: Each page module lives in `src/pages/<domain>/` with a list page and optional form modal / detail page. State and API calls live in the page component, not in context.

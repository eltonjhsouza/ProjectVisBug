# iacopi2.0 Agent Guide

Vue 2 SPA built with Vue CLI, ESLint, and Prettier.
Use this doc for commands and local coding conventions.

## Quick start
- Install: `npm install`
- Dev server: `npm run dev` (alias of `npm run serve`)
- Build: `npm run build`
- Dev server auto-opens the browser (`--open`).
- Build runs with `CI=false` via `cross-env`.

## Linting and formatting
- Lint: `npm run lint`
- Lint with fix: `npm run lint-fix`
- Prettier (entire repo): `npm run prettify`
- Lint a single file (optional):
  `npx eslint src/components/BaseButton.vue`

## Tests
- E2E script (legacy): `npm run e2e`
- Note: no `test/` folder is present in this checkout; verify before running.
- No unit-test runner is configured here, so there is no single-test command.

## Optional single-file checks
- Lint a single file with ESLint (see above).
- If you add tests later, prefer running a single spec file first.

## Project layout
- Entry point: `src/main.js`
- Root component: `src/App.vue`
- Router: `src/router/`
- Components: `src/components/`
- Services: `src/services/`
- Plugins: `src/plugins/`
- Static assets: `public/` and `src/assets/`
- Directives: `src/directives/`
- Utilities: `src/utils/`

## Vue component patterns
- Single File Components (`.vue`) with `<template>`, `<script>`, `<style>`.
- `export default` object with `name`, `props`, `data`, `methods`.
- `data()` returns a plain object.
- Emit events with `this.$emit("event", payload)`.
- Keep props typed with `type`, `default`, and short descriptions.
- Keep component APIs stable; avoid breaking prop changes.
- Prefer computed properties for derived state.
- Keep side effects in lifecycle hooks, not in render.

## Naming conventions
- Files: PascalCase for components (e.g., `BaseButton.vue`).
- Component `name`: kebab-case (e.g., `base-button`).
- Variables and methods: camelCase.

## Imports
- ES module imports/exports.
- Prefer `@` alias for `src/` imports.
- Keep import order consistent within each file.
- Stay consistent with the quote style used in the file.
- Avoid adding new global side effects in `main.js`.

## Formatting
- `.editorconfig` sets 2-space indent, LF, trim trailing whitespace.
- Avoid reformatting unrelated code.
- Do not change formatting in generated files.
- Use SCSS where existing styles already use it.

## ESLint rules
- Uses `plugin:vue/essential`.
- `vue/multi-word-component-names` is disabled.
- Fix lint errors with local style rather than changing rules.

## Router and auth
- Route guards live in `src/router/index.js`.
- Auth check uses `localStorage` or `sessionStorage` token.
- Routes requiring auth set `meta.requiresAuth`.
- Router uses `history` mode; keep server fallback in mind.
- Update `src/router/routes.js` when adding new pages.

## Axios usage
- Use the shared instance from `src/services/axios.js`.
- Base URL: `VUE_APP_BACKEND_URL`.
- Request interceptor injects `Authorization: Bearer <token>`.
- Keep error handling consistent with existing behavior.
- Prefer adding new API calls under `src/services/`.
- Use the shared instance instead of raw `axios` in components.

## Localization and UI text
- Keep user-facing strings in the same language as nearby UI.
- Avoid changing copy unless requested.
- Mixed Portuguese/English is expected in this codebase.
- Use `src/i18n.js` when adding new translated strings.

## Asset handling
- Static assets live in `public/`.
- Component assets should be referenced via Vue/Webpack URLs.
- Avoid editing binary assets unless explicitly requested.

## Contributions guidance (from CONTRIBUTING)
- Avoid jQuery or jQuery-based plugins; use Vue alternatives.

## Framework and plugins
- Vue 2.x (`vue` 2.7.x) with Vue Router 3.x.
- No Vuex in this project; prefer local state and props.
- Plugins include BlackDashboard, RouterPrefetch, VuePlyr, GrapesJS.
- Service worker is disabled in `src/main.js`.
- Notifications component is mounted in `src/App.vue`.

## Environment variables
- Only variables prefixed with `VUE_APP_` are exposed to the client.
- Do not commit `.env` changes unless requested.

## Charts and UI helpers
- Charts use Chart.js 2.9.x wrappers in `src/components/Charts/`.
- Reuse base components under `src/components/` when possible.
- Prefer existing Base components before adding new ones.

## Styling and theme
- Theme styles live under `src/assets/` and plugin styles.
- Keep SCSS variables and mixins consistent with the dashboard theme.
- Avoid inline styles unless required by the component API.

## State and data flow
- No global store; lift state up via props as needed.
- Avoid circular dependencies between components and services.

## Build outputs
- Vue CLI outputs to `dist/` by default; do not edit it.
- Do not commit build artifacts unless requested.

## Cursor/Copilot rules
- No project-level Cursor rules found.
- No Copilot instructions found.

## Safe change checklist
- Keep the UI structure and component API stable.
- Follow existing file patterns for props, data, and methods.
- Update linting if you introduce new files or rules.
- Check router guards when adding new authenticated pages.
- Verify `VUE_APP_BACKEND_URL` when debugging API calls.

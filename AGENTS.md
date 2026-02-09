# AGENTS.md

## Visao geral
- VisBug e um toolkit web/extensao.
- Codigo principal em `app/` e assets de extensao em `extension/`.
- Bundles gerados via Rollup e PostCSS.

## Setup
- Requer Node.js (CI usa Node 16.x).
- Instalar dependencias: `npm install` (ou `npm ci` em CI).

## Dev
- `npm run start` roda JS/CSS + servidor local.
- JS watch: `npm run dev:js`
- CSS watch: `npm run dev:css`
- Servidor local: `npm run dev:server`

## Build
- Dev bundle: `npm run bundle`
- Prod bundle: `npm run bundle:prod`
- Extensao: `npm run extension` / `npm run extension:build`
- Firefox: `npm run extension:firefox`

## Tests
- Tudo: `npm test`
- Watch: `npm run test:dev`
- CI: `npm run test:ci`

## Configs-chave
- `rollup.config.mjs`
- `postcss.config.js`
- `firebase.json` / `.firebaserc`
- `app.yaml`

## Notas
- O pipeline de release gera zips da extensao em `extension/build/`.

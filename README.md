# JobEtu — Frontend

Application React (Vite + TypeScript) pour les parcours **entreprise**, **fonctionnaire** et **admin**.

## Configuration

Copiez `.env.example` vers `.env.local` et définissez :

- `VITE_API_URL` — URL de base de l’API (ex. `http://localhost:4000/api`). Sans cette variable, le build utilise le défaut local `http://localhost:4000/api`.
- Le mode test / le stockage des données (`memory`, `json`, PostgreSQL) se configure **uniquement** sur le backend ; le front n’a pas de `MODE_CONFIG` local.

## Constantes

Toute valeur UI, routes, messages, endpoints, feature flags : `Constants/variable.constant.ts`  
Types partagés côté front : `Constants/types.constant.ts`

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production (minification Vite)
- `npm run build:obfuscate` — build puis obfuscation des fichiers JS dans `dist/assets` (optionnel)
- `npm run preview` — prévisualisation du build

## Architecture `src/`

`api/`, `components/`, `features/`, `hooks/`, `layouts/`, `pages/`, `router/`, `store/`, `styles/`, `types/`, `utils/`

## Thème

Couleurs strictes : bleu, orange, blanc, noir — définies dans `UI_CONFIG` et injectées via `utils/applyTheme.ts`.

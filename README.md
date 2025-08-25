## LLMonade Error Analysis App — Client

**LLMonade Client** is a React + TypeScript single-page application that provides the user interface for LLMonade’s error-analysis workflow.  

Built with Vite for fast dev/build, Material UI for UI components, TanStack Query for data fetching/caching, and React Router for navigation.

### Tech stack
- **Core**: React 19, TypeScript
- **UI components**: Material UI 7
- **Data & state**: TanStack Query 5, React Context
- **Routing**: React Router 7
- **Tooling**: Vite 6, ESLint

### Requirements
- Node.js 18+
- npm 9+

### Getting started
From the repository root:
```bash
cd client
npm install
npm run dev
```
Then open the URL printed by Vite (defaults to `http://localhost:5173`).

This app expects an API server running at `http://localhost:3000`. During development, all requests to `/api` are proxied to the backend as configured in `vite.config.ts`.

### Available scripts
```bash
# Start the dev server
npm run dev

# Type-check and build for production (outputs to dist/)
npm run build

# Preview the production build locally
npm run preview

# Lint the project
npm run lint
```

### Configuration and environment
- No client-side environment variables are required by default.
- Dev API proxy is defined in `vite.config.ts` under `server.proxy['/api']`.
  - To point at a different dev backend, update the proxy `target`.
- For production, serve the built `dist/` behind the same origin as the API or configure your reverse proxy to forward `/api` to the backend.

### Build and deploy
```bash
npm run build
```
The production build is emitted to `dist/`. You can preview locally via:
```bash
npm run preview
```
Deploy the `dist/` directory to any static host or serve it behind your web server/reverse proxy. Ensure the server forwards `/api` to your backend (default: `http://localhost:3000`).

### Related services
- Backend API: see `server/` in the repository for the Node/Express service that powers `/api`.
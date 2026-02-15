# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebP Converter Web — a web app that converts images (JPEG, PNG, GIF, BMP, TIFF, AVIF) to WebP format with adjustable quality and scale settings. Server-side conversion using sharp.

## Commands

```bash
npm run dev          # Start both client & server in dev mode (concurrently)
npm run build        # Build client (vite) then server (tsc)
npm start            # Start production server (serves client/dist as static)
npm test             # Run server tests (vitest)

# Workspace-specific
npm run dev -w client    # Vite dev server on :5173
npm run dev -w server    # tsx watch on :3001
npm run lint -w client   # ESLint (client only)
npm run test -w server   # vitest run
```

## Architecture

**Monorepo** using npm workspaces with two packages: `client/` and `server/`.

### Server (`server/`)
- **Hono** framework on Node.js (`@hono/node-server`)
- Single API endpoint: `POST /api/convert` — accepts multipart form with `image`, `quality`, `scale` fields; returns WebP binary with metadata in response headers (`X-Original-Size`, `X-Converted-Size`, etc.)
- Image processing via **sharp** (`server/src/routes/convert.ts`)
- In production, serves `client/dist` as static files
- Entry: `server/src/index.ts` → `server/src/app.ts` (Hono app exported separately for testing)
- Tests: `server/__tests__/` using **vitest**

### Client (`client/`)
- **React 19** + **Vite 7** + TypeScript
- CSS Modules (`.module.css`) for component styling
- Core hook: `client/src/hooks/useConverter.ts` — manages file state, debounced API calls (400ms), abort handling, blob URL lifecycle
- Vite proxies `/api` to `localhost:3001` in dev mode
- Components: `UploadArea`, `Preview`, `ControlPanel`, `InfoPanel`, `DownloadButton`

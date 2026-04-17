# RecipeBox

**Offline-first weekly meal planner with cloud sync.**

![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)

## Features

- **Recipe import** — add recipes manually or extract metadata from any URL (title, image, ingredients). Only reads publicly visible page metadata (JSON-LD, OpenGraph) — no login bypass, no content copying, no scraping behind paywalls. Links back to the original source.
- **Weekly menu generation** — weighted random selection with tag diversity and recency awareness
- **Slot-based menu editor** — swap, lock, or remove individual slots
- **Grocery list** — auto-aggregated from the week's recipes, grouped by store department
- **Cloud sync** — bidirectional sync across devices via Vercel Postgres
- **Offline-first** — works without internet, syncs when back online
- **Installable PWA** — install on phone or desktop, runs like a native app
- **Tag system** — organize recipes with custom tags, inline management
- **Cooking history** — finish-week tracking influences future menu suggestions
- **Dutch UI** — full interface translation

## How It Works

Add your recipes by URL or manually — RecipeBox scrapes titles, images, and ingredients automatically. Generate a weekly menu and the app picks recipes weighted by what you haven't cooked recently, with tag diversity so you don't eat pasta all week. Check off ingredients as you shop, finish the week to build cooking history, and the algorithm learns your rotation.

## Architecture

```
Browser (IndexedDB) ←→ Vercel Serverless API ←→ Postgres (Neon)
```

All data lives in IndexedDB first (via Dexie). The app works fully offline. When connectivity is available, a sync engine pulls server changes then pushes local mutations — last-write-wins conflict resolution. The service worker caches assets and images for true offline PWA support.

## Self-Hosting

```bash
git clone https://github.com/yordan-st/recipe-box.git
cd recipe-box
npm install
```

Deploy to Vercel:

1. Import the repo in [Vercel](https://vercel.com)
2. Add a Postgres database (Neon) from the Vercel dashboard
3. Optionally set `AUTH_PASSWORD` env var to protect access
4. Deploy — hit `POST /api/setup-db` once to initialize tables

For local development:

```bash
npm run dev    # Runs at localhost:5173 with stub APIs (no DB needed)
```

## Tech Stack

| Layer         | Technology                     |
| ------------- | ------------------------------ |
| Frontend      | React 19, TypeScript, Radix UI |
| Build         | Vite 8, PWA Plugin (Workbox)   |
| Local storage | Dexie (IndexedDB)              |
| Backend       | Vercel Serverless Functions    |
| Database      | Vercel Postgres (Neon)         |
| Scraping      | Cheerio (JSON-LD, OpenGraph)   |

---

Built with [Claude Code](https://claude.ai/code)

# StarLink

A campus connection platform that reveals hidden connections between people through a 3D star map.

## Quick Start

```bash
bash demo.sh
```

This installs dependencies, seeds 120 demo users, starts both servers, and opens the browser.

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Manual Setup

```bash
# Backend
cd backend && npm install && node server.js

# In another terminal — seed demo data
curl -X POST http://localhost:3001/api/seed

# Frontend
cd frontend && npm install && npm run dev
```

## Architecture

```
starlink/
├── backend/          Node.js + Express + SQLite (port 3001)
│   ├── server.js     Entry point, routes
│   ├── db.js         SQLite setup + queries
│   ├── matching.js   Connection scoring algorithm
│   ├── seed.js       120 demo user generator
│   ├── ai-cards.js   Connection card text templates
│   └── routes/       users, connections, exchanges, stats
├── frontend/         React + Vite + Three.js (port 5173)
│   └── src/
│       ├── components/StarMap.jsx    3D star visualization
│       ├── components/ConnectionPanel.jsx
│       ├── components/ConnectionCard.jsx
│       ├── store.js  Zustand state
│       └── api.js    Backend fetch wrappers
└── demo.sh           One-command launcher
```

## Connection Scoring

| Signal | Points |
|--------|--------|
| Shared like | 1 |
| Shared dislike | 2 |
| Mutual skill exchange | 5 |
| Same current feeling | 1 |

Connections with score ≥ 2 are stored. The map shows score ≥ 5 by default.

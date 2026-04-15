#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo ""
echo "  ★ StarLink — Campus Connection Platform"
echo "  ─────────────────────────────────────────"
echo ""

# Kill any existing servers on these ports
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Install dependencies
echo "→ Installing backend dependencies..."
cd "$BACKEND_DIR" && npm install 2>&1 | grep -E "added|error" || true

echo "→ Installing frontend dependencies..."
cd "$FRONTEND_DIR" && npm install 2>&1 | grep -E "added|error" || true

echo ""
echo "→ Starting backend on port 3001..."
cd "$BACKEND_DIR" && node server.js &
BACKEND_PID=$!

# Wait for backend to be ready
echo "→ Waiting for backend to start..."
for i in {1..30}; do
  if curl -s http://localhost:3001/api/stats > /dev/null 2>&1; then
    echo "  ✓ Backend ready"
    break
  fi
  sleep 0.5
done

# Seed the database
echo "→ Seeding 25 demo users..."
SEED_RESULT=$(curl -s -X POST http://localhost:3001/api/seed)
USER_COUNT=$(echo $SEED_RESULT | grep -o '"users":[0-9]*' | grep -o '[0-9]*' | head -1)
CONN_COUNT=$(echo $SEED_RESULT | grep -o '"connections":[0-9]*' | grep -o '[0-9]*' | head -1)
USER_COUNT=${USER_COUNT:-120}
CONN_COUNT=${CONN_COUNT:-"?"}
echo "  ✓ $USER_COUNT stars, $CONN_COUNT connections"

echo ""
echo "→ Starting frontend on port 5173..."
cd "$FRONTEND_DIR" && npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 3

echo ""
echo "  ★ StarLink is live!"
echo "  ───────────────────────────────────────────────"
echo "  → Open: http://localhost:5173"
echo "  → Stars: $USER_COUNT  |  Connections: $CONN_COUNT"
echo "  ───────────────────────────────────────────────"
echo ""
echo "  Press Ctrl+C to stop all servers"
echo ""

# Open browser (macOS)
if command -v open > /dev/null; then
  open http://localhost:5173
fi

# Cleanup on exit
trap "echo ''; echo '→ Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Keep running
wait

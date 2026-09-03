#!/bin/bash
set -e

echo "===================================================="
echo "🚀 Starting PPID Kemenag Barito Utara Services"
echo "===================================================="

# 1. Start Go Fiber Backend API explicitly on port 8080
echo "-> Starting Go Fiber Backend API (Port 8080)..."
PORT=8080 BACKEND_PORT=8080 /app/ppid-api &
BACKEND_PID=$!

# 2. Wait for backend port 8080 to become ready
echo "-> Waiting for Go Fiber API readiness..."
for i in {1..30}; do
  if curl -s http://127.0.0.1:8080/health >/dev/null 2>&1 || wget -q -O - http://127.0.0.1:8080/health >/dev/null 2>&1; then
    echo "-> Go Fiber API is ready and operational on port 8080!"
    break
  fi
  sleep 0.3
done

# 3. Start Astro Frontend on port 3000
echo "-> Starting Astro Frontend SSR (Port 3000)..."
cd /app/frontend
PORT=3000 HOST=0.0.0.0 API_UPSTREAM_URL=http://127.0.0.1:8080 node ./dist/server/entry.mjs &
FRONTEND_PID=$!

# 4. Graceful termination handler
cleanup() {
  echo "-> Shutting down services..."
  kill -TERM "$FRONTEND_PID" 2>/dev/null || true
  kill -TERM "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" 2>/dev/null || true
  exit 0
}
trap cleanup SIGTERM SIGINT

# 5. Keep running and wait for either process to exit
wait -n "$BACKEND_PID" "$FRONTEND_PID"
EXIT_CODE=$?
cleanup
exit $EXIT_CODE

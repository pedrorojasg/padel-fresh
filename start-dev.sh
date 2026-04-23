#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "  🎾  Padel Fresh — Dev Server"
echo "  ─────────────────────────────"

# Install deps if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "  📦  Installing dependencies..."
  npm install
fi

echo "  🚀  Starting dev server on http://localhost:5173"
echo "  📱  Also available on your local network (check the IP below)"
echo ""

npm run dev

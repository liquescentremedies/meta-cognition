#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code on the web sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Setting up meta-cognition environment..."

# Load .env if present
if [ -f "$CLAUDE_PROJECT_DIR/.env" ]; then
  set -a
  source "$CLAUDE_PROJECT_DIR/.env"
  set +a
  # Persist to session environment
  grep -v '^\s*#' "$CLAUDE_PROJECT_DIR/.env" | grep '=' >> "$CLAUDE_ENV_FILE"
fi

# Install Python dependencies
pip install beautifulsoup4 --quiet

# Ensure bun is on PATH (for orchestrator TypeScript files)
export PATH="$HOME/.bun/bin:$PATH"
if command -v bun &>/dev/null; then
  echo "bun $(bun --version) available"
else
  echo "WARNING: bun not found — TypeScript orchestrator files may not run"
fi

echo "Environment ready."

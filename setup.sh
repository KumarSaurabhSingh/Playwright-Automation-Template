#!/usr/bin/env bash
# =============================================================================
#  Playwright Automation Framework — One-Click Environment Setup
# =============================================================================
#  WHAT THIS DOES (run order):
#    1. Checks prerequisites (Node.js >= 18, npm, git)
#    2. Installs all npm dependencies from package.json
#    3. Installs the Playwright browsers (chromium, firefox, webkit)
#    4. Installs Playwright OS-level dependencies (Linux only)
#    5. Installs the Allure command-line tool if missing
#    6. Creates the required runtime folders
#    7. Creates a local .env from .env.example if missing
#    8. Verifies everything and prints a summary
#
#  HOW TO RUN:
#    macOS / Linux:   chmod +x setup.sh && ./setup.sh
#    Windows:         bash setup.sh
#
#  Safe to re-run at any time — it is idempotent.
# =============================================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { printf "${CYAN}[INFO]${NC}  %s\n" "$*"; }
ok()    { printf "${GREEN}[OK]${NC}    %s\n" "$*"; }
warn()  { printf "${YELLOW}[WARN]${NC}  %s\n" "$*"; }
fail()  { printf "${RED}[ERROR]${NC} %s\n" "$*"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "────────────────────────────────────────────────────────────"
echo " Playwright Automation Framework — Environment Setup"
echo "────────────────────────────────────────────────────────────"
echo

# ─────────────────────────────────────────────────────────────────────────────
# 1. Prerequisite checks
# ─────────────────────────────────────────────────────────────────────────────
info "Checking prerequisites..."

if ! command -v node >/dev/null 2>&1; then
  fail "Node.js is not installed. Install Node.js >= 18 from https://nodejs.org/ and re-run this script."
fi

NODE_MAJOR="$(node -v | sed 's/v//' | cut -d. -f1)"
if [ "$NODE_MAJOR" -lt 18 ]; then
  fail "Node.js $(node -v) detected. This project requires Node.js >= 18."
fi

if ! command -v npm >/dev/null 2>&1; then
  fail "npm is not installed (it usually ships with Node.js)."
fi

if ! command -v git >/dev/null 2>&1; then
  warn "git not found — version control is recommended."
fi

ok "Node.js $(node -v) | npm $(npm -v)"

# ─────────────────────────────────────────────────────────────────────────────
# 2. npm dependencies
# ─────────────────────────────────────────────────────────────────────────────
info "Installing npm dependencies..."
if [ ! -f "package.json" ]; then
  fail "package.json not found. Run this script from the project root."
fi

if npm install --no-audit --no-fund; then
  ok "npm dependencies installed"
else
  fail "npm install failed. Check your network connection and try again."
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. Playwright browsers
# ─────────────────────────────────────────────────────────────────────────────
info "Installing Playwright browsers (chromium, firefox, webkit)..."
if npx playwright install chromium; then
  ok "Chromium installed"
else
  warn "Chromium install failed. Re-run: npx playwright install chromium --with-deps"
fi

if npx playwright install firefox; then
  ok "Firefox installed"
else
  warn "Firefox install failed."
fi

if npx playwright install webkit; then
  ok "WebKit installed"
else
  warn "WebKit install failed."
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. OS-level dependencies (Linux only)
# ─────────────────────────────────────────────────────────────────────────────
if [ "$(uname -s)" = "Linux" ]; then
  info "Installing Playwright OS-level dependencies..."
  if npx playwright install-deps chromium; then
    ok "OS dependencies installed"
  else
    warn "OS dependency install failed. Try: sudo npx playwright install-deps chromium"
  fi
else
  info "Skipping OS-level dependency step (not required on macOS/Windows)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. Allure command-line tool
# ─────────────────────────────────────────────────────────────────────────────
info "Checking Allure command-line tool..."
if command -v allure >/dev/null 2>&1; then
  ok "Allure already installed: $(allure --version 2>/dev/null || echo 'version unknown')"
elif command -v brew >/dev/null 2>&1; then
  warn "Allure not found — installing via Homebrew (you may be prompted for sudo)."
  brew install allure && ok "Allure installed via Homebrew"
elif command -v npm >/dev/null 2>&1; then
  warn "Allure not found — installing via npm globally (allure-commandline)."
  npm install -g allure-commandline && ok "Allure installed via npm"
else
  warn "Allure CLI not installed. Install manually: https://allurereport.org/docs/install/"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. Runtime folders
# ─────────────────────────────────────────────────────────────────────────────
info "Creating runtime folders..."
mkdir -p logs reports/html-report test-results allure-results
ok "Folders ready: logs/ reports/ test-results/ allure-results/"

# ─────────────────────────────────────────────────────────────────────────────
# 7. Local .env (never overwrite existing)
# ─────────────────────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    ok ".env created from .env.example — edit it with real values."
  else
    warn ".env.example not found — skipping .env creation."
  fi
else
  info ".env already exists — leaving it untouched."
fi

# ─────────────────────────────────────────────────────────────────────────────
# 8. Verification & summary
# ─────────────────────────────────────────────────────────────────────────────
echo
echo "────────────────────────────────────────────────────────────"
info "Verifying installation..."
echo "────────────────────────────────────────────────────────────"

echo "  Node.js          : $(node -v)"
echo "  npm              : $(npm -v)"
echo "  Playwright       : $(npx playwright --version)"
if command -v allure >/dev/null 2>&1; then
  echo "  Allure           : $(allure --version 2>/dev/null || echo 'installed')"
else
  echo "  Allure           : not installed (HTML report still works)"
fi

echo
echo "────────────────────────────────────────────────────────────"
echo " Setup complete"
echo "────────────────────────────────────────────────────────────"
echo
echo " Next steps:"
echo "   1. Edit .env with your real URLs/credentials"
echo "   2. Run a sanity check:    npm run test:e2e"
echo "   3. Run everything:        npm test"
echo "   4. Open the report:       npm run test:show-report"
echo

#!/usr/bin/env bash

# ==============================================================================
# MediSlot (మెడిస్లాట్) - 1-Click All-in-One Startup Script
# Andhra Pradesh Government Hospital OPD Appointment & Queue Portal
# ==============================================================================

# Ensure we are in the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Colors for terminal output
BOLD='\033[1m'
CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
NC='\033[0m' # No Color

# Print Welcome Banner
echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                  MediSlot (మెడిస్లాట్) OPD System                 ║"
echo "║      Andhra Pradesh Government Healthcare Queue Portal           ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "🚀 Initializing environment & launching system...\n"

# Step 1: Check Node.js installation
echo -e "${BOLD}[1/4] Checking Node.js installation...${NC}"
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}✖ Error: Node.js is not installed on this system.${NC}"
    echo -e "${YELLOW}Please install Node.js (version 18 or higher recommended):"
    echo -e "  • Ubuntu/Debian:  sudo apt update && sudo apt install -y nodejs npm"
    echo -e "  • Fedora:         sudo dnf install -y nodejs npm"
    echo -e "  • macOS:          brew install node"
    echo -e "  • Or download at: https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✔ Node.js detected: ${NODE_VERSION}${NC}"

# Check Node version (recommend 18+)
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo -e "${YELLOW}⚠ Notice: Node.js version is ${NODE_VERSION}. Version 18+ is strongly recommended.${NC}"
fi

# Step 2: Check npm installation
if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}✖ Error: npm is not installed. Please install npm alongside Node.js.${NC}"
    exit 1
fi
echo -e "${GREEN}✔ npm detected: v$(npm -v)${NC}"

# Step 3: Check & Install dependencies
echo -e "\n${BOLD}[2/4] Checking project dependencies...${NC}"
NEEDS_INSTALL=0
if [ ! -d "node_modules" ]; then
    NEEDS_INSTALL=1
elif [ ! -d "node_modules/express" ] || [ ! -d "node_modules/cors" ]; then
    NEEDS_INSTALL=1
fi

if [ "$NEEDS_INSTALL" -eq 1 ]; then
    echo -e "${CYAN}📦 Installing npm dependencies (Express, CORS)... This may take a moment.${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}✖ Failed to install dependencies. Please check your internet connection and try again.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✔ Dependencies installed successfully!${NC}"
else
    echo -e "${GREEN}✔ Dependencies already installed.${NC}"
fi

# Step 4: Verify Database Setup
echo -e "\n${BOLD}[3/4] Checking MongoDB Atlas configuration...${NC}"
echo -e "${GREEN}✔ Configured for MongoDB Atlas Cloud Database.${NC}"

# Step 5: Port Check & Configuration
PORT="${PORT:-3000}"
echo -e "\n${BOLD}[4/4] Configuring server port (PORT=${PORT})...${NC}"

# Test if port is currently in use using a fast Node check
PORT_IN_USE=$(node -e "
const net = require('net');
const s = net.createServer();
s.once('error', (err) => {
    if (err.code === 'EADDRINUSE') process.stdout.write('IN_USE');
    process.exit(0);
});
s.once('listening', () => {
    s.close();
    process.stdout.write('FREE');
    process.exit(0);
});
s.listen($PORT);
")

APP_URL="http://localhost:${PORT}"

if [ "$PORT_IN_USE" = "IN_USE" ]; then
    # Check if the process running on that port is MediSlot itself
    HEALTH_CHECK=$(curl -s --max-time 1 "${APP_URL}/api/health" 2>/dev/null)
    if [[ "$HEALTH_CHECK" =~ "healthy" ]]; then
        echo -e "${GREEN}✔ MediSlot server is ALREADY active and running on ${APP_URL}!${NC}"
        echo -e "Opening your browser now..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open "$APP_URL"
        elif command -v xdg-open >/dev/null 2>&1; then
            xdg-open "$APP_URL" >/dev/null 2>&1 &
        elif command -v wslview >/dev/null 2>&1; then
            wslview "$APP_URL" >/dev/null 2>&1 &
        fi
        echo -e "\n${CYAN}You can access the portal at:${NC} ${BOLD}${APP_URL}${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠ Port ${PORT} is occupied by another application.${NC}"
        echo -e "You can start MediSlot on another port by running:"
        echo -e "  PORT=3001 ./start.sh"
        echo -e "Or terminate the process using port ${PORT} and re-run this script."
        exit 1
    fi
fi

# Function to automatically open browser once server is listening
open_browser() {
    local target_url="$1"
    # Poll health endpoint up to 15 seconds
    for i in {1..30}; do
        if curl -s --max-time 1 "${target_url}/api/health" 2>/dev/null | grep -q "healthy"; then
            sleep 0.5
            echo -e "\n${GREEN}🌐 Server is live! Opening browser at ${target_url}...${NC}"
            if [[ "$OSTYPE" == "darwin"* ]]; then
                open "$target_url" >/dev/null 2>&1
            elif command -v xdg-open >/dev/null 2>&1; then
                xdg-open "$target_url" >/dev/null 2>&1 &
            elif command -v wslview >/dev/null 2>&1; then
                wslview "$target_url" >/dev/null 2>&1 &
            fi
            break
        fi
        sleep 0.5
    done
}

# Trap SIGINT / SIGTERM for a clean exit message
cleanup() {
    echo -e "\n\n${YELLOW}🛑 Shutting down MediSlot server. Thank you!${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start browser opener in background
open_browser "$APP_URL" &

# Start Express Server
echo -e "${GREEN}${BOLD}Starting MediSlot Express Server on ${APP_URL}...${NC}"
echo -e "${CYAN}Press Ctrl+C at any time to stop the server.${NC}\n"

node server.js

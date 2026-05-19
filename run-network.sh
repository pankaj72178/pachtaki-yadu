#!/bin/bash

# 🚀 PACHTAKI YADU - NETWORK SERVER LAUNCHER
# Quick access guide for starting your village portal

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║        PACHTAKI YADU - NETWORK SERVER                 ║"
echo "║       Multi-Device Village Governance Portal          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check current directory
if [ ! -f "server.js" ]; then
    echo "⚠️  Error: server.js not found!"
    echo "Make sure you're in: /Users/panka/Pachtaki Yadu project"
    echo ""
    echo "Correct command:"
    echo "cd \"/Users/panka/Pachtaki Yadu project\""
    echo "npm start"
    exit 1
fi

echo "📊 PRE-LAUNCH CHECKLIST:"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not installed!"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not installed!"
    exit 1
fi

# Check node_modules
if [ -d "node_modules" ]; then
    echo "✅ Dependencies: Installed"
else
    echo "⚠️  Dependencies: Not installed, installing now..."
    npm install
fi

# Check data directory
if [ -d "data" ]; then
    echo "✅ Data folder: Ready"
else
    echo "⚠️  Data folder: Creating..."
    mkdir -p data
fi

echo ""
echo "🌐 NETWORK CONFIGURATION:"
echo ""

# Get Mac IP
MAC_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "Not found")
HOSTNAME=$(hostname)

echo "   Computer Name: $HOSTNAME"
echo "   Mac IP: $MAC_IP"
echo ""

echo "🔗 ACCESS URLS:"
echo ""
echo "   Local:     http://localhost:3000"
echo "   Network:   http://$MAC_IP:3000"
echo ""

echo "📱 ON OTHER DEVICES:"
echo "   1. Connect to same WiFi"
echo "   2. Open browser"
echo "   3. Go to: http://$MAC_IP:3000"
echo "   4. ✅ Done!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 STARTING SERVER..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the server
npm start

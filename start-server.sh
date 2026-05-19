#!/bin/bash

# Pachtaki Yadu - Network Server Startup Script
# This script starts the server and displays network access information

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     PACHTAKI YADU - DIGITAL VILLAGE PORTAL STARTUP       ║"
echo "║          Network Configuration Enabled ✓                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    echo "📥 Install from: https://nodejs.org"
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

# Get the hostname and IP
HOSTNAME=$(hostname)
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "Not found")

echo "🖥️  Computer Name: $HOSTNAME"
echo "🌐 Local IP Address: $LOCAL_IP"
echo ""
echo "📱 Network Access URLs:"
echo "   🔗 Local:   http://localhost:3000"
echo "   🔗 Network: http://$LOCAL_IP:3000"
echo ""
echo "⏳ Starting server..."
echo ""

# Start the server with NODE_ENV set to production for better performance
export NODE_ENV=production
NODE_ENV=production node server.js

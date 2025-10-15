#!/bin/bash
# Integration Test for Spider Window Scare System
# Tests the complete system: video, server, and web interface

set -e  # Exit on error

echo "🧪 Spider Window Scare - Integration Test"
echo "=========================================="
echo ""

# Test 1: Check video file
echo "1️⃣ Checking video file..."
if [ -f public/videos/spider_jump1.mp4 ]; then
    echo "  ✓ spider_jump1.mp4 exists"
else
    echo "  ❌ spider_jump1.mp4 MISSING"
    echo "     Please add your jump scare video to public/videos/spider_jump1.mp4"
    exit 1
fi
echo ""

# Test 2: Check server can start
echo "2️⃣ Testing server startup..."
timeout 5 node server.js > /tmp/server_test.log 2>&1 &
SERVER_PID=$!
sleep 3

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "  ✓ Server started successfully (PID: $SERVER_PID)"
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
else
    echo "  ❌ Server failed to start"
    echo "  Log:"
    cat /tmp/server_test.log
    exit 1
fi
echo ""

# Test 3: Check Arduino connection
echo "3️⃣ Checking Arduino connection..."
if grep -q "Serial port.*opened" /tmp/server_test.log; then
    echo "  ✓ Arduino connected successfully"
elif grep -q "Failed to initialize serial" /tmp/server_test.log; then
    echo "  ⚠️  Arduino not connected (this is OK for testing without hardware)"
else
    echo "  ⚠️  Could not determine Arduino status"
fi
echo ""

# Test 4: Check web server port
echo "4️⃣ Testing web server accessibility..."
timeout 5 node server.js > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

if curl -sf http://localhost:3000 > /dev/null; then
    echo "  ✓ Web interface accessible at http://localhost:3000"
else
    echo "  ❌ Web interface not accessible"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true
echo ""

# Test 5: Check static file serving
echo "5️⃣ Testing static file serving..."
timeout 5 node server.js > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

FILES_OK=true
for file in "client.js" "style.css" "videos/spider_jump1.mp4"; do
    if curl -sf "http://localhost:3000/$file" --head > /dev/null 2>&1; then
        echo "  ✓ $file accessible"
    else
        echo "  ❌ $file NOT accessible"
        FILES_OK=false
    fi
done

kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

if [ "$FILES_OK" = false ]; then
    exit 1
fi
echo ""

# Summary
echo "✅ Integration tests complete!"
echo ""
echo "📋 System Status:"
echo "  • Video file: Ready"
echo "  • Server startup: OK"
echo "  • Web interface: Accessible"
echo "  • Static files: OK"
echo ""
echo "🚀 Ready to run: pixi run deploy"
echo ""
echo "💡 To test manually:"
echo "  1. Run: pixi run deploy"
echo "  2. Open: http://localhost:3000"
echo "  3. Press 'T' key to test trigger"
echo "  4. Or press physical switch to trigger"

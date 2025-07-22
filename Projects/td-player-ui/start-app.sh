#!/bin/bash
# Top Dog Arena - Standard Angular multi-project startup

echo "========================================"
echo "   Top Dog Arena - Application Startup"
echo "========================================"
echo ""

echo "Starting Angular applications..."
echo ""

# Check if we're on Windows or Unix-like system
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows - start both apps simultaneously
    echo "Starting Player Landing Page on port 4201..."
    start cmd //k "ng serve playerLandingPage --port 4201"
    
    echo "Starting Shell Application on port 4200..."
    start cmd //k "ng serve shell --port 4200"
else
    # Unix-like (Linux/Mac) - start both apps simultaneously
    echo "Starting Player Landing Page on port 4201..."
    gnome-terminal -- bash -c "ng serve playerLandingPage --port 4201; exec bash" 2>/dev/null || \
    xterm -e "ng serve playerLandingPage --port 4201" 2>/dev/null || \
    ng serve playerLandingPage --port 4201 &
    
    echo "Starting Shell Application on port 4200..."
    gnome-terminal -- bash -c "ng serve shell --port 4200; exec bash" 2>/dev/null || \
    xterm -e "ng serve shell --port 4200" 2>/dev/null || \
    ng serve shell --port 4200 &
fi

echo ""
echo "========================================"
echo "Applications started!"
echo ""
echo "Player Landing Page: http://localhost:4201"
echo "Shell Application:   http://localhost:4200"
echo ""
echo "Both apps will build independently."
echo "Check terminal windows for build status."
echo "========================================"

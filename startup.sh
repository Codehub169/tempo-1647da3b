#!/bin/bash
# This script starts the Kids Fun Games application.

echo "Starting Kids Fun Games server..."

# Navigate to the directory where the script is located, if necessary
# cd "$(dirname "$0")"

# Serve the current directory's files on port 9000 using Python's built-in HTTP server.
# This makes index.html and other static assets available.
python3 -m http.server 9000

echo "Server should be running on http://localhost:9000"

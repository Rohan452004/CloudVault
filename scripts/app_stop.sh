#!/bin/bash

# Load NVM if not already loaded
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Stopping Node application if running..."

# Stop and delete the application using PM2
pm2 stop cloudvault || true
pm2 delete cloudvault || true

# Optionally log the status of PM2 processes (helpful for troubleshooting)
pm2 list

echo "Application stopped and deleted successfully (if it was running)."
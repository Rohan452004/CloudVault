#!/bin/bash
set -e

# Set AWS region environment variables
export AWS_REGION=ap-south-1
export AWS_DEFAULT_REGION=ap-south-1

APP_DIR="/var/www/cloudvault"
cd $APP_DIR

echo "Starting Node application from $APP_DIR..."
echo "Fetching environment variables from AWS Parameter Store..."

# Check AWS CLI configuration
if ! aws sts get-caller-identity > /dev/null 2>&1; then
  echo "AWS CLI is not configured. Please configure AWS CLI."
  exit 1
fi

# Define all your parameter names
PARAMS=(
  "/cloudvault/PORT"
  "/cloudvault/MONGO_URI"
  "/cloudvault/JWT_SECRET"
  "/cloudvault/FRONTEND_URL"
  "/cloudvault/BASE_URL"
  "/cloudvault/PLATFORM_AWS_ACCESS_KEY_ID"
  "/cloudvault/PLATFORM_AWS_SECRET_ACCESS_KEY"
  "/cloudvault/PLATFORM_S3_BUCKET"
  "/cloudvault/PLATFORM_AWS_REGION"
)

# Fetch parameters
for param in "${PARAMS[@]}"; do
  name=$(basename "$param")
  value=$(aws ssm get-parameter --name "$param" --with-decryption --query Parameter.Value --output text) || { echo "Failed to fetch $name"; exit 1; }
  export $name="$value"
done

# Write to .env file
echo "Writing .env file..."
cat > "$APP_DIR/.env" << EOF
PORT=$PORT
MONGO_URI=$MONGO_URI
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=$FRONTEND_URL
BASE_URL=$BASE_URL
PLATFORM_AWS_ACCESS_KEY_ID=$PLATFORM_AWS_ACCESS_KEY_ID
PLATFORM_AWS_SECRET_ACCESS_KEY=$PLATFORM_AWS_SECRET_ACCESS_KEY
PLATFORM_S3_BUCKET=$PLATFORM_S3_BUCKET
PLATFORM_AWS_REGION=$PLATFORM_AWS_REGION
EOF

# Check if PM2 is installed, if not, install it
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing PM2..."
    npm install -g pm2
fi

# Check if Node.js is installed, if not, exit
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Please ensure Node.js is installed."
    exit 1
fi

echo "Starting application with PM2..."

# Start the Node.js application using PM2
pm2 start "$APP_DIR/index.js" --name "cloudvault" --env production

# Enable PM2 to start on boot
pm2 startup | bash || echo "PM2 startup script failed"
pm2 save || echo "PM2 save failed"

echo "Application started successfully."
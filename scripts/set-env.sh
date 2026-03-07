#!/bin/bash

# Script to switch between environments
# Usage: sh scripts/set-env.sh [development|staging|production]

ENV=$1

if [ -z "$ENV" ]; then
  echo "❌ Error: Environment not specified"
  echo "Usage: sh scripts/set-env.sh [development|staging|production]"
  exit 1
fi

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "${BLUE}🔄 Switching to $ENV environment...${NC}"

# Define source files based on environment
case "$ENV" in
  development)
    ENV_FILE="src/config/env.development.ts"
    ;;
  staging)
    ENV_FILE="src/config/env.staging.ts"
    ;;
  production)
    ENV_FILE="src/config/env.production.ts"
    ;;
  *)
    echo "${RED}❌ Invalid environment: $ENV${NC}"
    echo "Valid options: development, staging, production"
    exit 1
    ;;
esac

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "${RED}❌ Error: Environment file not found: $ENV_FILE${NC}"
  exit 1
fi

# Copy environment file
cp "$ENV_FILE" "src/config/env.ts"

echo "${GREEN}✅ Environment switched to: $ENV${NC}"
echo "${GREEN}✅ Active config: $ENV_FILE${NC}"

# Display current environment info
echo ""
echo "${BLUE}📋 Current Environment Configuration:${NC}"
grep "API_URL\|ENV_NAME" "src/config/env.ts" | sed 's/export const /  /' | sed 's/;//'
echo ""

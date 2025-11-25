#!/bin/bash

# PromptCopilot Deployment Script

echo "🚀 Starting Build Process..."

# 1. Type Check
echo "Checking types..."
npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ Type check failed. Please fix errors before deploying."
  exit 1
fi

# 2. Build
echo "Building project..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed."
  exit 1
fi

echo "✅ Build successful!"
echo "The 'dist' folder is ready for deployment."
echo "To preview locally, run: npm run preview"

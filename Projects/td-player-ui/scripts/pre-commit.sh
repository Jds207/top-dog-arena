#!/bin/bash

echo "🔍 Running pre-commit checks..."

# Change to the td-player-ui directory
cd "$(dirname "$0")"

# Run linting
echo "📝 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ ESLint failed. Please fix the issues and try again."
  exit 1
fi

# Run prettier check
echo "💅 Running Prettier check..."
npm run prettier
if [ $? -ne 0 ]; then
  echo "❌ Prettier check failed. Run 'npm run prettier:fix' to fix formatting issues."
  exit 1
fi

# Run tests (optional - uncomment if you want tests in pre-commit)
# echo "🧪 Running tests..."
# npm test
# if [ $? -ne 0 ]; then
#   echo "❌ Tests failed. Please fix the failing tests."
#   exit 1
# fi

echo "✅ All pre-commit checks passed!"

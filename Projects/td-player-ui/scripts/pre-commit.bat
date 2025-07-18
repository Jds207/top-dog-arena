@echo off
echo 🔍 Running pre-commit checks...

echo 📝 Running ESLint...
call npm run lint
if %errorlevel% neq 0 (
    echo ❌ ESLint failed. Please fix the issues and try again.
    exit /b 1
)

echo 💅 Running Prettier check...
call npm run prettier
if %errorlevel% neq 0 (
    echo ❌ Prettier check failed. Run 'npm run prettier:fix' to fix formatting issues.
    exit /b 1
)

echo ✅ All pre-commit checks passed!

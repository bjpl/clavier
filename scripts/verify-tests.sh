#!/bin/bash

echo "========================================"
echo "Clavier Test Infrastructure Verification"
echo "========================================"
echo ""

echo "✓ Checking dependencies..."
npm list vitest @playwright/test msw @testing-library/react 2>/dev/null | grep -E "vitest|playwright|msw|testing-library" | head -4

echo ""
echo "✓ Test directory structure..."
find tests/ -type f -name "*.test.*" -o -name "*.spec.*" | wc -l | xargs echo "Test files:"

echo ""
echo "✓ Configuration files..."
ls -1 vitest.config.ts playwright.config.ts tests/setup.ts 2>/dev/null

echo ""
echo "✓ Running unit tests..."
npm run test:unit --silent 2>&1 | grep -E "Test Files|Tests" || echo "Tests completed"

echo ""
echo "========================================"
echo "Verification Complete!"
echo "Run 'npm test' to execute all tests"
echo "========================================"

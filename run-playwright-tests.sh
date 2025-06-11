#!/bin/bash

echo "🧪 Running Playwright E2E Tests"
echo "=============================="
echo ""

# Check if Playwright is installed
if ! npx playwright --version > /dev/null 2>&1; then
    echo "❌ Playwright is not installed. Installing..."
    npx playwright install
fi

echo "📍 Testing deployed site..."
echo ""

# Run tests on deployed site
npx playwright test tests/e2e/real-communication.spec.ts --reporter=list

echo ""
echo "📍 Testing other E2E scenarios..."
echo ""

# Run other E2E tests
npx playwright test tests/e2e/complete-user-journey.spec.ts --reporter=list

echo ""
echo "✅ Test run complete!"
echo ""
echo "To run tests with UI mode: npm run test:e2e:ui"
echo "To run local tests: npm run test:e2e:local"
echo "To see test report: npm run test:e2e:report"
# Testing Guide for Miru

This document describes the testing setup and how to run different types of tests.

## Test Structure

```
tests/
├── e2e/                    # Playwright E2E tests
│   ├── real-communication.spec.ts
│   ├── complete-user-journey.spec.ts
│   ├── local-test.spec.ts
│   └── README.md
├── jest-e2e/              # Legacy Jest E2E tests (backup)
├── components/            # React component tests
├── lib/                   # Business logic tests
├── integration/           # Integration tests
└── ...
```

## Test Types

### 1. Unit Tests (Jest)
Tests individual functions and components.

```bash
# Run all Jest tests
npm test

# Run unit tests only
npm run test:unit

# Run component tests only  
npm run test:components

# Run with coverage
npm run test:coverage
```

### 2. Integration Tests (Jest)
Tests interaction between components and services.

```bash
npm run test:integration
```

### 3. E2E Tests (Playwright)
Tests complete user workflows in a real browser.

```bash
# Run E2E tests on deployed site
npm run test:e2e

# Run E2E tests with UI mode (debugging)
npm run test:e2e:ui

# Run E2E tests on local dev server
npm run test:e2e:local

# Show test report
npm run test:e2e:report
```

## Configuration Files

- `jest.config.js` - Jest configuration (unit/integration tests)
- `playwright.config.ts` - Playwright config for deployed site testing
- `playwright.config.local.ts` - Playwright config for local development testing

## Running All Tests

```bash
# Run all tests (Jest + Playwright)
npm run test:all

# Run only Jest tests
npm run test:jest

# Run CI tests (Jest with coverage, no E2E)
npm run test:ci
```

## Debugging Tests

### Jest Tests
```bash
# Watch mode
npm run test:watch

# Debug specific test
npm test -- --testNamePattern="should handle user login"
```

### Playwright Tests
```bash
# Debug mode (step through)
npm run test:e2e:debug

# UI mode (visual debugging)
npm run test:e2e:ui

# Run specific test
npx playwright test tests/e2e/real-communication.spec.ts
```

## Writing Tests

### Jest Test Example
```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Playwright Test Example
```typescript
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Login')
  await expect(page.locator('[role="dialog"]')).toBeVisible()
})
```

## CI/CD Integration

The test setup is designed for CI/CD pipelines:

- Jest tests run fast and provide code coverage
- Playwright tests can be run against deployed applications
- Tests are properly separated to avoid conflicts
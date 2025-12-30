# Clavier Testing Guide

Comprehensive testing infrastructure for the Clavier music education platform, achieving 70%+ code coverage with unit, integration, and E2E tests.

## Table of Contents

- [Overview](#overview)
- [Test Categories](#test-categories)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage](#coverage)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Overview

Clavier uses a multi-layered testing approach:

- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test interactions between modules and systems
- **E2E Tests**: Test complete user workflows in a browser environment

### Testing Stack

- **Vitest**: Fast unit and integration testing framework
- **React Testing Library**: Component testing utilities
- **Playwright**: E2E browser automation
- **MSW**: API mocking for consistent test data
- **jsdom/happy-dom**: Lightweight DOM implementation

## Test Categories

### Unit Tests (`tests/unit/`)

Test isolated components, functions, and stores:

```
tests/unit/
├── components/
│   └── ui/
│       └── button.test.tsx
└── stores/
    └── playback-store.test.ts
```

**Example: Testing a Zustand Store**

```typescript
import { renderHook, act } from '@testing-library/react'
import { usePlaybackStore } from '@/lib/stores/playback-store'

test('should start playback', () => {
  const { result } = renderHook(() => usePlaybackStore())

  act(() => {
    result.current.play()
  })

  expect(result.current.isPlaying).toBe(true)
})
```

**Example: Testing a React Component**

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

test('should handle clicks', async () => {
  const handleClick = vi.fn()
  const user = userEvent.setup()

  render(<Button onClick={handleClick}>Click me</Button>)

  await user.click(screen.getByRole('button'))

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Integration Tests (`tests/integration/`)

Test interactions between multiple modules:

```
tests/integration/
└── audio-engine.test.ts
```

**Example: Testing Audio Engine Integration**

```typescript
import { AudioEngine } from '@/lib/audio/audio-engine'

test('should initialize and play notes', async () => {
  const engine = new AudioEngine()

  await engine.initialize()
  expect(engine.isReady).toBe(true)

  // Test note playback
  expect(() => {
    engine.playNote(60, 1.0)
  }).not.toThrow()

  engine.dispose()
})
```

### E2E Tests (`tests/e2e/`)

Test complete user workflows in a real browser:

```
tests/e2e/
└── walkthrough-mode.spec.ts
```

**Example: E2E Test**

```typescript
import { test, expect } from '@playwright/test'

test('should navigate and play piece', async ({ page }) => {
  await page.goto('/walkthrough/846/prelude')

  // Wait for score to load
  await page.waitForSelector('[data-testid="score-viewer"]')

  // Click play button
  await page.getByRole('button', { name: /play/i }).click()

  // Verify playback started
  await expect(page.getByRole('button', { name: /pause/i })).toBeVisible()
})
```

## Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run all tests (unit + integration + E2E)
npm run test:all
```

### Watch Mode

```bash
# Watch mode for unit/integration tests
npm run test:watch

# Interactive UI for debugging tests
npm run test:ui
```

### E2E Testing Options

```bash
# Run E2E tests in headless mode (CI)
npm run test:e2e

# Run E2E tests with browser visible
npm run test:e2e:headed

# Interactive E2E test UI
npm run test:e2e:ui
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html
```

Coverage thresholds (must meet 70%):
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## Writing Tests

### Test File Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.test.ts`
- E2E tests: `*.spec.ts`

### Test Structure

Follow the **Arrange-Act-Assert** pattern:

```typescript
test('should perform action correctly', () => {
  // Arrange: Set up test data and environment
  const input = 'test data'

  // Act: Execute the code under test
  const result = functionToTest(input)

  // Assert: Verify the results
  expect(result).toBe('expected output')
})
```

### Mocking

#### Mocking Modules

```typescript
import { vi } from 'vitest'

// Mock entire module
vi.mock('tone', () => ({
  Sampler: vi.fn(),
  Transport: { start: vi.fn() }
}))
```

#### Mocking API Calls with MSW

```typescript
// tests/mocks/handlers/api-handlers.ts
import { http, HttpResponse } from 'msw'

export const apiHandlers = [
  http.get('/api/pieces', () => {
    return HttpResponse.json([
      { id: '1', title: 'Prelude No. 1' }
    ])
  })
]
```

### Testing Async Code

```typescript
test('should load data asynchronously', async () => {
  const data = await fetchData()
  expect(data).toBeDefined()
})
```

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event'

test('should handle user input', async () => {
  const user = userEvent.setup()
  render(<SearchInput />)

  await user.type(screen.getByRole('textbox'), 'BWV 846')
  await user.click(screen.getByRole('button', { name: /search/i }))

  expect(screen.getByText('Prelude No. 1')).toBeVisible()
})
```

## Coverage

### Coverage Configuration

Coverage is configured in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/**/*.d.ts',
    'src/**/*.stories.tsx',
    'src/types/**/*',
  ],
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70,
  },
}
```

### Coverage Reports

Three formats are generated:

1. **Terminal**: Quick summary in console
2. **HTML**: Detailed interactive report (`coverage/index.html`)
3. **LCOV**: For CI/CD integration

### Improving Coverage

Focus on these critical paths:
- State management (Zustand stores)
- Audio engine integration
- User interactions
- API routes
- Error handling

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

Workflow stages:

1. **Unit & Integration Tests**
   - Runs on Node.js 18.x and 20.x
   - Executes linting, type checking, and tests
   - Generates coverage reports
   - Uploads to Codecov

2. **E2E Tests**
   - Runs on latest Node.js
   - Installs Playwright browsers
   - Executes full user workflows
   - Captures screenshots and traces on failure

3. **Quality Gates**
   - Verifies coverage thresholds (70%)
   - Comments coverage report on PRs
   - Fails build if thresholds not met

### Local CI Simulation

Test what CI will run:

```bash
# Run full CI test suite locally
npm run lint && \
npm run typecheck && \
npm run test:coverage && \
npm run test:e2e
```

## Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad**: Testing internal state
```typescript
expect(component.state.internalCounter).toBe(5)
```

✅ **Good**: Testing user-visible behavior
```typescript
expect(screen.getByText('Count: 5')).toBeVisible()
```

### 2. Keep Tests Isolated

```typescript
beforeEach(() => {
  // Reset state before each test
  const { result } = renderHook(() => useStore())
  act(() => result.current.reset())
})
```

### 3. Use Descriptive Test Names

```typescript
test('should disable previous button at first measure', () => {
  // Test implementation
})
```

### 4. Test Error Cases

```typescript
test('should handle network errors gracefully', async () => {
  server.use(
    http.get('/api/pieces', () => {
      return HttpResponse.error()
    })
  )

  await expect(fetchPieces()).rejects.toThrow()
})
```

### 5. Minimize Mocking

Prefer integration tests over heavy mocking when possible.

### 6. Use Testing Library Queries

Order of preference:
1. `getByRole` - Most accessible
2. `getByLabelText` - For form fields
3. `getByPlaceholderText` - For inputs
4. `getByText` - For content
5. `getByTestId` - Last resort

### 7. Async Testing

Always use `await` with async queries:

```typescript
// Wait for element to appear
await screen.findByText('Loaded')

// Wait for element to disappear
await waitForElementToBeRemoved(() => screen.queryByText('Loading'))
```

### 8. Cleanup Resources

```typescript
afterEach(() => {
  cleanup() // React Testing Library
  if (audioEngine) {
    audioEngine.dispose() // Audio Engine
  }
})
```

## Debugging Tests

### Vitest UI

```bash
npm run test:ui
```

Interactive browser interface for debugging tests.

### Playwright UI

```bash
npm run test:e2e:ui
```

Step through E2E tests with time travel debugging.

### Debug Output

```typescript
import { screen } from '@testing-library/react'

// Print current DOM
screen.debug()

// Print specific element
screen.debug(screen.getByRole('button'))
```

### Playwright Traces

On test failure, traces are saved to `test-results/`:

```bash
npx playwright show-trace test-results/trace.zip
```

## Common Issues

### Issue: "Audio context not started"

**Solution**: Audio is mocked in tests. Verify mocks in `tests/setup.ts`.

### Issue: "Element not found"

**Solution**: Use `findBy` queries for async elements:
```typescript
await screen.findByText('Async content')
```

### Issue: "Test timeout"

**Solution**: Increase timeout for slow operations:
```typescript
test('slow operation', async () => {
  // Test code
}, { timeout: 10000 })
```

### Issue: "MSW handlers not working"

**Solution**: Ensure server is set up in test:
```typescript
import { server } from './mocks/server'
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure coverage meets 70% threshold
3. Run full test suite before committing
4. Update this guide if adding new test patterns

---

**Target**: 70%+ coverage on critical paths
**Current Coverage**: Run `npm run test:coverage` to check

For questions or issues, please refer to the main project README or open a GitHub issue.

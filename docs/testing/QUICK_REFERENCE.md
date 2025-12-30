# Testing Quick Reference

## Quick Commands

```bash
# Run all tests
npm test

# Watch mode (TDD)
npm run test:watch

# Interactive UI
npm run test:ui

# Coverage report
npm run test:coverage

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests
npm run test:e2e

# E2E with browser visible
npm run test:e2e:headed

# E2E interactive UI
npm run test:e2e:ui

# Full test suite
npm run test:all
```

## File Locations

```
tests/
├── setup.ts                    # Global setup
├── README.md                   # Full guide
├── unit/                       # Unit tests
├── integration/                # Integration tests
├── e2e/                        # E2E tests
├── mocks/                      # API mocks
└── utils/                      # Test helpers
```

## Writing a Test

```typescript
import { describe, it, expect } from 'vitest'

describe('Feature', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = function(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

## Common Patterns

### Testing React Components
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('handles click', async () => {
  const user = userEvent.setup()
  render(<Button onClick={handler}>Click</Button>)

  await user.click(screen.getByRole('button'))

  expect(handler).toHaveBeenCalled()
})
```

### Testing Zustand Stores
```typescript
import { renderHook, act } from '@testing-library/react'
import { useStore } from '@/lib/stores/my-store'

test('updates state', () => {
  const { result } = renderHook(() => useStore())

  act(() => {
    result.current.update('value')
  })

  expect(result.current.value).toBe('value')
})
```

### E2E Testing
```typescript
import { test, expect } from '@playwright/test'

test('user flow', async ({ page }) => {
  await page.goto('/app')
  await page.click('button[name="start"]')

  await expect(page).toHaveURL('/started')
})
```

## Coverage Thresholds

All must be ≥70%:
- Lines
- Functions
- Branches
- Statements

## CI/CD

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests

View results in GitHub Actions tab.

## Debugging

```bash
# Run single test file
npm test -- tests/unit/my-test.test.ts

# Run tests matching pattern
npm test -- -t "should handle clicks"

# Show test UI
npm run test:ui

# E2E with debugger
npm run test:e2e:ui
```

## Common Issues

### "Module not found"
- Check import paths use `@/` alias
- Verify file exists

### "Element not found"
- Use `await screen.findBy...()` for async
- Check test renders component

### "Timeout"
- Increase timeout: `{ timeout: 10000 }`
- Check for infinite loops

## Resources

- Full guide: `tests/README.md`
- Summary: `docs/testing/TESTING_INFRASTRUCTURE_SUMMARY.md`
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/

/**
 * E2E Tests: Walkthrough Mode
 * Tests complete user flow through walkthrough feature
 */

import { test, expect } from '@playwright/test'

test.describe('Walkthrough Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/')
  })

  test.describe('Navigation', () => {
    test('should navigate to walkthrough mode from home', async ({ page }) => {
      // Click on walkthrough navigation
      await page.getByRole('link', { name: /walkthrough/i }).click()

      // Should be on walkthrough page
      await expect(page).toHaveURL(/\/walkthrough/)
    })

    test('should display piece selector', async ({ page }) => {
      await page.goto('/walkthrough')

      // Piece selector should be visible
      await expect(page.getByText(/select.*piece/i)).toBeVisible()
    })

    test('should load specific piece by BWV', async ({ page }) => {
      await page.goto('/walkthrough/846/prelude')

      // Page should load without errors
      await expect(page.getByText(/BWV 846/i)).toBeVisible()
    })
  })

  test.describe('Score Display', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/walkthrough/846/prelude')
    })

    test('should display musical score', async ({ page }) => {
      // Score viewer should be present
      const scoreViewer = page.locator('[data-testid="score-viewer"]')
      await expect(scoreViewer).toBeVisible({ timeout: 10000 })
    })

    test('should display current measure highlight', async ({ page }) => {
      // Wait for score to load
      await page.waitForSelector('[data-testid="score-viewer"]')

      // Measure highlight should exist
      const highlight = page.locator('[data-testid="measure-highlight"]')
      await expect(highlight).toBeVisible()
    })

    test('should show cursor on score', async ({ page }) => {
      // Wait for score to load
      await page.waitForSelector('[data-testid="score-viewer"]')

      // Cursor should be visible
      const cursor = page.locator('[data-testid="score-cursor"]')
      await expect(cursor).toBeVisible()
    })
  })

  test.describe('Playback Controls', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/walkthrough/846/prelude')
      await page.waitForSelector('[data-testid="score-viewer"]')
    })

    test('should have play button', async ({ page }) => {
      const playButton = page.getByRole('button', { name: /play/i })
      await expect(playButton).toBeVisible()
    })

    test('should have stop button', async ({ page }) => {
      const stopButton = page.getByRole('button', { name: /stop/i })
      await expect(stopButton).toBeVisible()
    })

    test('should have tempo control', async ({ page }) => {
      const tempoSlider = page.getByLabel(/tempo/i)
      await expect(tempoSlider).toBeVisible()
    })

    test('should play audio when play button clicked', async ({ page }) => {
      const playButton = page.getByRole('button', { name: /play/i })

      await playButton.click()

      // Button should change to pause
      await expect(page.getByRole('button', { name: /pause/i })).toBeVisible()
    })

    test('should stop playback when stop button clicked', async ({ page }) => {
      // Start playback
      await page.getByRole('button', { name: /play/i }).click()
      await expect(page.getByRole('button', { name: /pause/i })).toBeVisible()

      // Stop playback
      await page.getByRole('button', { name: /stop/i }).click()

      // Should return to play state
      await expect(page.getByRole('button', { name: /play/i })).toBeVisible()
    })

    test('should adjust tempo with slider', async ({ page }) => {
      const tempoSlider = page.getByLabel(/tempo/i)

      // Get initial value
      const initialValue = await tempoSlider.getAttribute('value')

      // Move slider
      await tempoSlider.fill('140')

      // Value should change
      const newValue = await tempoSlider.getAttribute('value')
      expect(newValue).not.toBe(initialValue)
    })

    test('should have volume control', async ({ page }) => {
      const volumeControl = page.getByLabel(/volume/i)
      await expect(volumeControl).toBeVisible()
    })

    test('should mute audio when mute clicked', async ({ page }) => {
      const muteButton = page.getByRole('button', { name: /mute/i })
      await muteButton.click()

      // Should show unmute button
      await expect(page.getByRole('button', { name: /unmute/i })).toBeVisible()
    })
  })

  test.describe('Measure Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/walkthrough/846/prelude')
      await page.waitForSelector('[data-testid="score-viewer"]')
    })

    test('should have previous measure button', async ({ page }) => {
      const prevButton = page.getByRole('button', { name: /previous.*measure/i })
      await expect(prevButton).toBeVisible()
    })

    test('should have next measure button', async ({ page }) => {
      const nextButton = page.getByRole('button', { name: /next.*measure/i })
      await expect(nextButton).toBeVisible()
    })

    test('should navigate to next measure', async ({ page }) => {
      const nextButton = page.getByRole('button', { name: /next.*measure/i })

      // Get initial measure number
      const measureDisplay = page.getByText(/measure.*\d+/i)
      const initialText = await measureDisplay.textContent()

      // Click next
      await nextButton.click()

      // Measure should change
      const newText = await measureDisplay.textContent()
      expect(newText).not.toBe(initialText)
    })

    test('should disable previous button at first measure', async ({ page }) => {
      const prevButton = page.getByRole('button', { name: /previous.*measure/i })

      // At start, previous should be disabled
      await expect(prevButton).toBeDisabled()
    })

    test('should display current measure number', async ({ page }) => {
      const measureDisplay = page.getByText(/measure.*\d+/i)
      await expect(measureDisplay).toBeVisible()
    })
  })

  test.describe('Commentary Panel', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/walkthrough/846/prelude')
      await page.waitForSelector('[data-testid="score-viewer"]')
    })

    test('should display commentary panel', async ({ page }) => {
      const commentary = page.locator('[data-testid="commentary-panel"]')
      await expect(commentary).toBeVisible()
    })

    test('should show measure-specific commentary', async ({ page }) => {
      const commentary = page.locator('[data-testid="commentary-panel"]')
      await expect(commentary).toContainText(/./i)
    })

    test('should highlight musical terms', async ({ page }) => {
      // Musical terms should have tooltips
      const term = page.locator('[data-term]').first()
      if (await term.count() > 0) {
        await term.hover()
        await expect(page.getByRole('tooltip')).toBeVisible()
      }
    })
  })

  test.describe('Keyboard Interaction', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/walkthrough/846/prelude')
      await page.waitForSelector('[data-testid="score-viewer"]')
    })

    test('should display piano keyboard', async ({ page }) => {
      const keyboard = page.locator('[data-testid="piano-keyboard"]')
      await expect(keyboard).toBeVisible()
    })

    test('should highlight active notes on keyboard', async ({ page }) => {
      // Start playback
      await page.getByRole('button', { name: /play/i }).click()

      // Wait a moment for notes to play
      await page.waitForTimeout(500)

      // Active key should have highlight class
      const activeKey = page.locator('[data-active="true"]').first()
      if (await activeKey.count() > 0) {
        await expect(activeKey).toBeVisible()
      }
    })

    test('should show note labels on keyboard', async ({ page }) => {
      const keyboard = page.locator('[data-testid="piano-keyboard"]')

      // Note labels should be present
      await expect(keyboard.getByText(/C/i).first()).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/walkthrough/846/prelude')

      // Main elements should still be visible
      await expect(page.getByRole('button', { name: /play/i })).toBeVisible()
    })

    test('should display properly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/walkthrough/846/prelude')

      // Main elements should be visible
      await expect(page.locator('[data-testid="score-viewer"]')).toBeVisible()
    })

    test('should display properly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto('/walkthrough/846/prelude')

      // All panels should be visible
      await expect(page.locator('[data-testid="score-viewer"]')).toBeVisible()
      await expect(page.locator('[data-testid="commentary-panel"]')).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should handle invalid BWV gracefully', async ({ page }) => {
      await page.goto('/walkthrough/999/prelude')

      // Should show error message or redirect
      await expect(page.getByText(/not found|error/i)).toBeVisible()
    })

    test('should handle network errors', async ({ page }) => {
      // Simulate offline
      await page.context().setOffline(true)
      await page.goto('/walkthrough/846/prelude')

      // Should show error state
      await expect(page.getByText(/error|offline/i)).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/walkthrough/846/prelude')
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.getByRole('heading', { level: 1 })
      await expect(h1).toBeVisible()
    })

    test('should have keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      await expect(focused).toBeVisible()
    })

    test('should have ARIA labels on controls', async ({ page }) => {
      const playButton = page.getByRole('button', { name: /play/i })
      await expect(playButton).toHaveAttribute('aria-label')
    })

    test('should support screen reader announcements', async ({ page }) => {
      // Check for live regions
      const liveRegion = page.locator('[aria-live]')
      if (await liveRegion.count() > 0) {
        await expect(liveRegion.first()).toBeVisible()
      }
    })
  })
})

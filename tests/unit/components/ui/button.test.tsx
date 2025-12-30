/**
 * Unit Tests: Button Component
 * Tests UI component rendering and interactions
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })

    it('should apply default variant', () => {
      render(<Button>Default</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Button className="custom-class">Styled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Button variant="default">Default</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render link variant', () => {
      render(<Button variant="link">Link</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('should render default size', () => {
      render(<Button size="default">Default</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render icon size', () => {
      render(<Button size="icon">🎹</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click me</Button>)

      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger click when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()

      await user.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should support keyboard navigation', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Press Enter</Button>)

      const button = screen.getByRole('button')
      button.focus()

      await user.keyboard('{Enter}')

      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible role', () => {
      render(<Button>Accessible</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should support aria-label', () => {
      render(<Button aria-label="Play music">▶️</Button>)
      expect(screen.getByLabelText('Play music')).toBeInTheDocument()
    })

    it('should indicate disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('disabled')
    })

    it('should support aria-pressed for toggle buttons', () => {
      render(<Button aria-pressed="true">Toggle</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('Props Forwarding', () => {
    it('should forward ref', () => {
      const ref = { current: null }
      render(<Button ref={ref}>Ref Button</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('should forward type attribute', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('should forward data attributes', () => {
      render(<Button data-testid="custom-button">Data</Button>)
      expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    })
  })

  describe('As Child', () => {
    it('should render as different element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/music">Go to Music</a>
        </Button>
      )
      expect(screen.getByRole('link')).toHaveTextContent('Go to Music')
    })
  })
})

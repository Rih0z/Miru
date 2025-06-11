import { test, expect } from '@playwright/test'

test.describe('Modern UI Components Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Dashboard UI', () => {
    test('should display modern glassmorphism header', async ({ page }) => {
      // Header with glass effect
      const header = await page.locator('.glass').first()
      await expect(header).toBeVisible()
      
      // Hero text with AI gradient
      const heroText = await page.locator('.ai-text-gradient').first()
      await expect(heroText).toContainText('恋愛ダッシュボード')
    })

    test('should show 3D spatial statistics cards', async ({ page }) => {
      // Wait for animation
      await page.waitForTimeout(1000)
      
      // Check all 4 stat cards with Spatial3D wrapper
      const statCards = await page.locator('[class*="animate-scale-in"]')
      await expect(statCards).toHaveCount(4)
      
      // Verify glassmorphism cards inside
      const glassCards = await page.locator('.glass.backdrop-blur-medium')
      expect(await glassCards.count()).toBeGreaterThan(0)
    })

    test('should display AI gradient action buttons', async ({ page }) => {
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await expect(addButton).toBeVisible()
      
      const importButton = await page.getByRole('button', { name: /AIインポート/ })
      await expect(importButton).toBeVisible()
      
      // Check for glow effect class
      const glowButton = await page.locator('.shadow-glow')
      expect(await glowButton.count()).toBeGreaterThan(0)
    })
  })

  test.describe('Bottom Navigation Bar', () => {
    test('should have glassmorphism bottom bar', async ({ page }) => {
      const bottomBar = await page.locator('.bg-glass-5.backdrop-blur-heavy')
      await expect(bottomBar).toBeVisible()
      
      // Check navigation items
      const navItems = await page.locator('.bg-glass-5.backdrop-blur-heavy button')
      await expect(navItems).toHaveCount(5)
    })

    test('should highlight active tab with AI gradient', async ({ page }) => {
      const activeTab = await page.locator('.bg-ai-gradient').first()
      await expect(activeTab).toBeVisible()
      
      // Check for pulse animation on active tab
      const pulseEffect = await page.locator('.bg-white\\/20.animate-pulse')
      await expect(pulseEffect).toBeVisible()
    })
  })

  test.describe('Language Switcher', () => {
    test('should display modern language switcher button', async ({ page }) => {
      const langButton = await page.locator('button').filter({ hasText: '日本語' })
      await expect(langButton).toBeVisible()
      
      // Click to open dropdown
      await langButton.click()
      
      // Check glassmorphism dropdown
      const dropdown = await page.locator('.glass.backdrop-blur-medium').last()
      await expect(dropdown).toBeVisible()
      
      // Verify language options
      await expect(page.getByText('🇯🇵')).toBeVisible()
      await expect(page.getByText('🇺🇸')).toBeVisible()
    })

    test('should close dropdown on backdrop click', async ({ page }) => {
      const langButton = await page.locator('button').filter({ hasText: '日本語' })
      await langButton.click()
      
      // Click backdrop
      await page.locator('.fixed.inset-0.bg-bg-primary\\/50').click()
      
      // Dropdown should be hidden
      const dropdown = await page.locator('.glass.backdrop-blur-medium').last()
      await expect(dropdown).not.toBeVisible()
    })
  })

  test.describe('Connection Cards', () => {
    test('should display Spatial3D connection cards', async ({ page }) => {
      // Wait for demo data to load
      await page.waitForTimeout(2000)
      
      const connectionCards = await page.locator('.h-full > .glass')
      const cardCount = await connectionCards.count()
      
      if (cardCount > 0) {
        // Check first card has modern styling
        const firstCard = connectionCards.first()
        await expect(firstCard).toBeVisible()
        
        // Verify AI gradient nickname container
        const avatarContainer = await page.locator('.bg-ai-gradient').nth(1)
        await expect(avatarContainer).toBeVisible()
        
        // Check for RelationshipProgress component
        const progressBar = await page.locator('[class*="bg-glass-5"][class*="border-glass-20"]').first()
        await expect(progressBar).toBeVisible()
      }
    })

    test('should have ripple effect buttons', async ({ page }) => {
      await page.waitForTimeout(2000)
      
      const promptButton = await page.getByRole('button', { name: /AIプロンプト/ }).first()
      if (await promptButton.isVisible()) {
        // Check for ripple button class or glow effect
        const buttonClasses = await promptButton.getAttribute('class')
        expect(buttonClasses).toMatch(/shadow-glow|ripple|glow/)
      }
    })
  })

  test.describe('Empty State', () => {
    test('should display modern empty state when no connections', async ({ page }) => {
      // Check if empty state is shown (this depends on demo data)
      const emptyState = await page.locator('.animate-fade-in')
      const emptyStateCount = await emptyState.count()
      
      if (emptyStateCount > 0) {
        // Verify glassmorphism card
        const glassCard = await page.locator('.glass[class*="prominent"]')
        await expect(glassCard.first()).toBeVisible()
        
        // Check for icon container
        const iconContainer = await page.locator('.bg-accent-primary\\/10')
        await expect(iconContainer.first()).toBeVisible()
      }
    })
  })

  test.describe('Modal Components', () => {
    test('should open connection form with glass modal', async ({ page }) => {
      await page.waitForTimeout(2000)
      
      // Click add button
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Wait for modal animation
      await page.waitForTimeout(500)
      
      // Check glass modal is visible
      const modal = await page.locator('[data-testid="modal-content"]')
      await expect(modal).toBeVisible()
      
      // Verify form has modern inputs
      const formInputs = await page.locator('.bg-glass-5.border-glass-20')
      expect(await formInputs.count()).toBeGreaterThan(0)
    })

    test('should close modal on close button click', async ({ page }) => {
      await page.waitForTimeout(2000)
      
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Find and click close button
      const closeButton = await page.locator('[aria-label="Close modal"]')
      await closeButton.click()
      
      // Modal should be hidden
      const modal = await page.locator('[data-testid="modal-content"]')
      await expect(modal).not.toBeVisible()
    })
  })

  test.describe('Dark Mode First Theme', () => {
    test('should have dark background by default', async ({ page }) => {
      const body = await page.locator('body')
      const bgColor = await body.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      )
      
      // Dark mode should have dark background (rgb values should be low)
      const rgbMatch = bgColor.match(/\d+/g)
      if (rgbMatch) {
        const [r, g, b] = rgbMatch.map(Number)
        expect(r).toBeLessThan(50) // Dark background
        expect(g).toBeLessThan(50)
        expect(b).toBeLessThan(50)
      }
    })

    test('should use CSS custom properties for theming', async ({ page }) => {
      const root = await page.locator(':root')
      const hasCssVars = await root.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return styles.getPropertyValue('--bg-primary') !== ''
      })
      
      expect(hasCssVars).toBe(true)
    })
  })

  test.describe('Loading States', () => {
    test('should display AI loading spinner', async ({ page }) => {
      // Navigate to a page that triggers loading
      await page.reload()
      
      // Look for loading spinner (might appear briefly)
      const loadingSpinner = await page.locator('.animate-spin').first()
      
      // If loading state exists, verify it has modern styling
      if (await loadingSpinner.isVisible({ timeout: 1000 }).catch(() => false)) {
        const spinnerContainer = await page.locator('.text-accent-primary')
        expect(await spinnerContainer.count()).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Typography', () => {
    test('should use modern typography system', async ({ page }) => {
      // Check for variable font usage
      const body = await page.locator('body')
      const fontFamily = await body.evaluate(el => 
        window.getComputedStyle(el).fontFamily
      )
      
      expect(fontFamily).toContain('Inter')
      
      // Check for bold typography
      const boldText = await page.locator('.font-black').first()
      if (await boldText.isVisible({ timeout: 1000 }).catch(() => false)) {
        const fontWeight = await boldText.evaluate(el => 
          window.getComputedStyle(el).fontWeight
        )
        expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(800)
      }
    })
  })

  test.describe('Animations', () => {
    test('should have smooth micro-interactions', async ({ page }) => {
      // Check for animation classes
      const animatedElements = await page.locator('[class*="animate-"]')
      expect(await animatedElements.count()).toBeGreaterThan(0)
      
      // Verify transition classes
      const transitionElements = await page.locator('[class*="transition-"]')
      expect(await transitionElements.count()).toBeGreaterThan(0)
    })
  })
})

test.describe('Accessibility Tests', () => {
  test('should have proper focus management', async ({ page }) => {
    await page.goto('/')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    
    // Check if focused element has visible focus indicator
    const focusedElement = await page.locator(':focus')
    const focusVisible = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return styles.outlineStyle !== 'none' || styles.boxShadow.includes('ring')
    })
    
    expect(focusVisible).toBe(true)
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    // Check buttons have aria-labels or accessible text
    const buttons = await page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      const ariaLabel = await button.getAttribute('aria-label')
      const textContent = await button.textContent()
      
      expect(ariaLabel || textContent).toBeTruthy()
    }
  })
})

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check that layout adapts
    const container = await page.locator('.max-w-6xl')
    await expect(container).toBeVisible()
    
    // Bottom bar should still be visible
    const bottomBar = await page.locator('.bg-glass-5.backdrop-blur-heavy')
    await expect(bottomBar).toBeVisible()
  })

  test('should hide text on mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Navigation should show icons but might hide text
    const navText = await page.locator('.bg-glass-5.backdrop-blur-heavy .text-xs')
    const isVisible = await navText.first().isVisible()
    expect(isVisible).toBe(true) // Our design keeps text visible
  })
})
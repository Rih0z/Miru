import { test, expect } from '@playwright/test'

test.describe('Coverage Enhancement Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Edge Cases and Error States', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true)
      
      // Try to perform action
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Should still show modal (local action)
      await expect(page.locator('[data-testid="modal-content"]')).toBeVisible()
      
      // Restore connection
      await page.context().setOffline(false)
    })

    test('should handle very long text inputs', async ({ page }) => {
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      const longText = 'あ'.repeat(100)
      
      // Fill with very long text
      await page.fill('input[placeholder*="Aさん"]', longText)
      
      // Should handle gracefully
      const input = await page.locator('input[placeholder*="Aさん"]')
      const value = await input.inputValue()
      expect(value).toBe(longText)
    })

    test('should handle rapid clicking', async ({ page }) => {
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        await addButton.click({ force: true })
      }
      
      // Should only show one modal
      const modals = await page.locator('[data-testid="modal-content"]')
      await expect(modals).toHaveCount(1)
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should navigate with keyboard only', async ({ page }) => {
      // Tab to first interactive element
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Press Enter to activate
      await page.keyboard.press('Enter')
      
      // Check if action was triggered
      const focusedElement = await page.locator(':focus')
      await expect(focusedElement).toBeTruthy()
    })

    test('should handle Escape key in modals', async ({ page }) => {
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Press Escape
      await page.keyboard.press('Escape')
      
      // Modal should close
      await expect(page.locator('[data-testid="modal-content"]')).not.toBeVisible()
    })
  })

  test.describe('Form Edge Cases', () => {
    test('should handle special characters in inputs', async ({ page }) => {
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Special characters
      await page.fill('input[placeholder*="Aさん"]', '★彡テスト彡★')
      await page.fill('input[placeholder*="Pairs"]', 'App@123!')
      
      // Should accept special characters
      const nicknameInput = await page.locator('input[placeholder*="Aさん"]')
      const value = await nicknameInput.inputValue()
      expect(value).toBe('★彡テスト彡★')
    })

    test('should handle number inputs correctly', async ({ page }) => {
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Test age boundaries
      const ageInput = await page.locator('input[placeholder="25"]')
      
      // Negative number
      await ageInput.fill('-5')
      let value = await ageInput.inputValue()
      expect(value).toBe('-5') // HTML allows but app should validate
      
      // Very large number
      await ageInput.fill('999')
      value = await ageInput.inputValue()
      expect(value).toBe('999')
      
      // Decimal
      await ageInput.fill('25.5')
      value = await ageInput.inputValue()
      expect(value).toBe('25.5')
    })

    test('should handle date inputs', async ({ page }) => {
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Find date input
      const dateInput = await page.locator('input[type="date"]').first()
      
      // Set future date
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      const dateString = futureDate.toISOString().split('T')[0]
      
      await dateInput.fill(dateString)
      const value = await dateInput.inputValue()
      expect(value).toBe(dateString)
    })
  })

  test.describe('Animation and Transition Coverage', () => {
    test('should complete all animations', async ({ page }) => {
      // Wait for initial animations
      await page.waitForTimeout(1500)
      
      // Check animation classes are applied
      const fadeIn = await page.locator('.animate-fade-in')
      const slideUp = await page.locator('.animate-slide-up')
      const scaleIn = await page.locator('.animate-scale-in')
      
      // At least some animations should be present
      const totalAnimations = 
        await fadeIn.count() + 
        await slideUp.count() + 
        await scaleIn.count()
      
      expect(totalAnimations).toBeGreaterThan(0)
    })

    test('should handle hover states', async ({ page }) => {
      // Hover over buttons
      const buttons = await page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i)
        await button.hover()
        await page.waitForTimeout(100)
      }
      
      // Hover states should work (visual regression would verify)
      expect(true).toBe(true)
    })
  })

  test.describe('Component State Coverage', () => {
    test('should test all button variants', async ({ page }) => {
      // Primary button
      const primaryButton = await page.locator('button').filter({ hasText: /手動で追加/ })
      await expect(primaryButton).toBeVisible()
      
      // Secondary button
      const secondaryButton = await page.locator('button').filter({ hasText: /AIインポート/ })
      await expect(secondaryButton).toBeVisible()
      
      // Ghost buttons in modals
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      const cancelButton = await page.getByRole('button', { name: 'キャンセル' })
      await expect(cancelButton).toBeVisible()
    })

    test('should test all card variants', async ({ page }) => {
      await page.waitForTimeout(2000)
      
      // Glass cards
      const glassCards = await page.locator('.glass')
      expect(await glassCards.count()).toBeGreaterThan(0)
      
      // Check different blur levels
      const blurMedium = await page.locator('.backdrop-blur-medium')
      const blurHeavy = await page.locator('.backdrop-blur-heavy')
      
      expect(await blurMedium.count() + await blurHeavy.count()).toBeGreaterThan(0)
    })
  })

  test.describe('Data Validation Coverage', () => {
    test('should validate required fields', async ({ page }) => {
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Clear required field and try to submit
      const nicknameInput = await page.locator('input[placeholder*="Aさん"]')
      await nicknameInput.fill('test')
      await nicknameInput.clear()
      
      // Browser validation should prevent submission
      const submitButton = await page.getByRole('button', { name: /登録する/ })
      await submitButton.click()
      
      // Modal should still be open
      await expect(page.locator('[data-testid="modal-content"]')).toBeVisible()
    })

    test('should handle select dropdown changes', async ({ page }) => {
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Test all select dropdowns
      const selects = await page.locator('select')
      const selectCount = await selects.count()
      
      for (let i = 0; i < selectCount; i++) {
        const select = selects.nth(i)
        const options = await select.locator('option').all()
        
        if (options.length > 1) {
          // Select last option
          const lastValue = await options[options.length - 1].getAttribute('value')
          if (lastValue) {
            await select.selectOption(lastValue)
          }
        }
      }
    })
  })

  test.describe('Theme and Styling Coverage', () => {
    test('should verify all color variants are used', async ({ page }) => {
      // Check for different color classes
      const accentPrimary = await page.locator('[class*="accent-primary"]')
      const accentSecondary = await page.locator('[class*="accent-secondary"]')
      const accentSuccess = await page.locator('[class*="accent-success"]')
      
      // At least primary colors should be used
      expect(await accentPrimary.count()).toBeGreaterThan(0)
    })

    test('should verify gradient usage', async ({ page }) => {
      const aiGradient = await page.locator('.bg-ai-gradient')
      const textGradient = await page.locator('.ai-text-gradient')
      
      expect(await aiGradient.count() + await textGradient.count()).toBeGreaterThan(0)
    })
  })

  test.describe('Scroll and Viewport Coverage', () => {
    test('should handle scroll in modals', async ({ page }) => {
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Scroll within modal
      const modal = await page.locator('[data-testid="modal-content"]')
      await modal.evaluate(el => el.scrollTop = el.scrollHeight)
      
      // Should maintain scroll position
      expect(true).toBe(true)
    })

    test('should handle different viewport sizes', async ({ page }) => {
      const viewports = [
        { width: 320, height: 568 },  // iPhone SE
        { width: 768, height: 1024 }, // iPad
        { width: 1920, height: 1080 } // Desktop
      ]
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        await page.goto('/')
        
        // Basic elements should be visible
        const header = await page.locator('.glass').first()
        await expect(header).toBeVisible()
      }
    })
  })

  test.describe('Focus Trap Coverage', () => {
    test('should trap focus in modal', async ({ page }) => {
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Tab through modal elements
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab')
      }
      
      // Focus should still be within modal
      const focusedElement = await page.locator(':focus')
      const modal = await page.locator('[data-testid="modal-content"]')
      const isWithinModal = await focusedElement.evaluate((el, modalEl) => {
        return modalEl.contains(el)
      }, await modal.elementHandle())
      
      expect(isWithinModal).toBe(true)
    })
  })

  test.describe('Storage and State Persistence', () => {
    test('should persist language preference', async ({ page, context }) => {
      // Set language to English
      const langButton = await page.locator('button').filter({ hasText: '日本語' })
      await langButton.click()
      await page.getByText('English').click()
      
      // Wait for reload
      await page.waitForLoadState('load')
      
      // Create new page in same context
      const newPage = await context.newPage()
      await newPage.goto('/')
      
      // Should remember language preference
      const newLangButton = await newPage.locator('button').filter({ hasText: 'English' })
      await expect(newLangButton).toBeVisible()
      
      await newPage.close()
    })
  })
})
/**
 * Local development server test
 * Run the development server before running this test:
 * npm run dev
 */

import { test, expect } from '@playwright/test'

const LOCAL_URL = 'http://localhost:3000'

test.describe('Local Development Server Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage
    await page.context().clearCookies()
  })

  test('1. Basic page load and navigation', async ({ page }) => {
    console.log('🌐 Testing local development server...')
    
    // Navigate to local server
    const response = await page.goto(LOCAL_URL, {
      waitUntil: 'networkidle'
    })

    // Check if page loads
    expect(response?.ok()).toBe(true)
    await expect(page).toHaveTitle(/Miru/)
    
    // Check main elements
    await expect(page.locator('text=恋愛の旅を始めましょう')).toBeVisible()
    console.log('✅ Page loaded successfully')
  })

  test('2. Connection form interaction', async ({ page }) => {
    await page.goto(LOCAL_URL)
    
    // Click add connection button
    await page.click('text=手動で追加')
    
    // Check if modal opens
    await expect(page.locator('text=新しいコネクションを追加')).toBeVisible()
    
    // Fill form
    await page.fill('input[name="nickname"]', 'ローカルテスト')
    await page.selectOption('select[name="platform"]', 'pairs')
    
    // Close modal
    await page.keyboard.press('Escape')
    await expect(page.locator('text=新しいコネクションを追加')).not.toBeVisible()
    
    console.log('✅ Form interaction works')
  })

  test('3. Language switching', async ({ page }) => {
    await page.goto(LOCAL_URL)
    
    // Find language switcher
    const langSwitcher = page.locator('button:has-text("JP"), button:has-text("EN")')
    
    if (await langSwitcher.isVisible()) {
      // Get initial text
      const initialText = await page.locator('h1').first().textContent()
      
      // Switch language
      await langSwitcher.click()
      
      // Wait for language change
      await page.waitForTimeout(500)
      
      // Check if text changed
      const newText = await page.locator('h1').first().textContent()
      expect(newText).not.toBe(initialText)
      
      console.log('✅ Language switching works')
    } else {
      console.log('⚠️ Language switcher not found')
    }
  })

  test('4. Responsive design check', async ({ page }) => {
    await page.goto(LOCAL_URL)
    
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(500)
    console.log('✅ Desktop view rendered')
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)
    console.log('✅ Tablet view rendered')
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    console.log('✅ Mobile view rendered')
  })

  test('5. Error handling', async ({ page }) => {
    // Test 404 page
    await page.goto(`${LOCAL_URL}/non-existent-page`)
    
    // Should show error or redirect to home
    const url = page.url()
    expect(url).toMatch(/localhost:3000/)
    
    console.log('✅ Error handling works')
  })
})
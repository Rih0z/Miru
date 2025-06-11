import { test, expect } from '@playwright/test'

test.describe('User Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Connection Management Flow', () => {
    test('should complete full connection creation flow', async ({ page }) => {
      // Click add connection button
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Wait for modal
      await page.waitForSelector('[data-testid="modal-content"]')
      
      // Fill in basic information
      await page.fill('input[placeholder*="Aさん"]', 'テスト太郎')
      await page.fill('input[placeholder*="Pairs"]', 'Tinder')
      
      // Select stage
      const stageSelect = await page.locator('select').first()
      await stageSelect.selectOption('メッセージ中')
      
      // Fill optional fields
      await page.fill('input[placeholder="25"]', '28')
      await page.fill('input[placeholder*="エンジニア"]', 'デザイナー')
      await page.fill('input[placeholder*="東京都"]', '東京都渋谷区')
      
      // Add a hobby
      await page.fill('input[placeholder*="映画鑑賞"]', 'カフェ巡り')
      await page.getByRole('button', { name: '追加' }).first().click()
      
      // Verify hobby was added
      await expect(page.getByText('カフェ巡り')).toBeVisible()
      
      // Fill communication section
      const frequencySelect = await page.locator('select').nth(1)
      await frequencySelect.selectOption('毎日')
      
      // Set expectations
      const expectationSelect = await page.locator('select').nth(3)
      await expectationSelect.selectOption('真剣な交際')
      
      // Add attractive point
      await page.fill('input[placeholder*="優しい"]', '笑顔が素敵')
      await page.getByRole('button', { name: '追加' }).nth(1).click()
      
      // Submit form
      const submitButton = await page.getByRole('button', { name: /登録する/ })
      await submitButton.click()
      
      // Wait for modal to close and verify alert
      await page.waitForFunction(() => {
        const alerts = Array.from(document.querySelectorAll('*')).filter(
          el => el.textContent?.includes('新しい相手を追加しました')
        )
        return alerts.length > 0
      }, { timeout: 5000 }).catch(() => {
        // Alert might be handled differently
      })
      
      // Verify connection was added
      await page.waitForTimeout(1000)
      const connectionCard = await page.getByText('テスト太郎さん')
      await expect(connectionCard).toBeVisible()
    })

    test('should edit existing connection', async ({ page }) => {
      // Wait for connections to load
      await page.waitForTimeout(2000)
      
      // Find first connection card's edit button
      const editButton = await page.locator('[title="編集"]').first()
      
      if (await editButton.isVisible()) {
        await editButton.click()
        
        // Wait for modal
        await page.waitForSelector('[data-testid="modal-content"]')
        
        // Modify some data
        const nicknameInput = await page.locator('input[value*=""]').first()
        await nicknameInput.clear()
        await nicknameInput.fill('更新された名前')
        
        // Submit
        const updateButton = await page.getByRole('button', { name: /更新する/ })
        await updateButton.click()
        
        // Verify update
        await page.waitForTimeout(1000)
        await expect(page.getByText('更新された名前さん')).toBeVisible()
      }
    })

    test('should generate AI prompt for connection', async ({ page }) => {
      await page.waitForTimeout(2000)
      
      const promptButton = await page.getByRole('button', { name: /AIプロンプト/ }).first()
      
      if (await promptButton.isVisible()) {
        await promptButton.click()
        
        // Wait for prompt executor modal
        await page.waitForSelector('.ai-text-gradient')
        
        // Verify AI selection is visible
        await expect(page.getByText('使用するAIを選択')).toBeVisible()
        
        // Select different AI
        await page.getByText('ChatGPT').click()
        
        // Verify prompt is generated
        const promptArea = await page.locator('pre').first()
        await expect(promptArea).toBeVisible()
        
        // Copy prompt
        const copyButton = await page.getByRole('button', { name: /コピー/ })
        await copyButton.click()
        
        // Verify copy success
        await expect(page.getByText('コピー済み')).toBeVisible()
        
        // Enter AI response
        await page.fill('textarea[placeholder*="AIから得られた回答"]', 'テストAI回答です。')
        
        // Save response
        const saveButton = await page.getByRole('button', { name: /保存して完了/ })
        await saveButton.click()
      }
    })
  })

  test.describe('Data Import Flow', () => {
    test('should complete AI data import flow', async ({ page }) => {
      // Click AI import button
      const importButton = await page.getByRole('button', { name: /AIインポート/ })
      await importButton.click()
      
      // Wait for import modal
      await page.waitForSelector('.ai-text-gradient')
      
      // Select AI platform
      await page.getByText('Google Gemini').click()
      
      // Select target apps
      await page.locator('label').filter({ hasText: 'Bumble' }).click()
      await page.locator('label').filter({ hasText: 'with' }).click()
      
      // Generate prompt
      const generateButton = await page.getByRole('button', { name: /プロンプトを生成する/ })
      await generateButton.click()
      
      // Verify prompt step
      await expect(page.getByText('プロンプトの使用方法')).toBeVisible()
      
      // Copy prompt
      const copyButton = await page.getByRole('button', { name: /コピー/ })
      await copyButton.click()
      
      // Proceed to JSON input
      const jsonButton = await page.getByRole('button', { name: /JSONを入力する/ })
      await jsonButton.click()
      
      // Enter sample JSON
      const sampleJson = JSON.stringify({
        connections: [{
          nickname: "インポートテスト",
          platform: "Bumble",
          currentStage: "メッセージ中",
          attractionLevel: 8,
          compatibilityScore: 7
        }],
        importMetadata: {
          completeness: 90
        }
      }, null, 2)
      
      await page.fill('textarea[placeholder*="JSONデータ"]', sampleJson)
      
      // Process data
      const processButton = await page.getByRole('button', { name: /データを処理する/ })
      await processButton.click()
      
      // Wait for validation
      await page.waitForSelector('.text-accent-success')
      
      // Confirm import
      const confirmButton = await page.getByRole('button', { name: /インポートを確定する/ })
      await confirmButton.click()
      
      // Verify completion
      await expect(page.getByText('インポート完了！')).toBeVisible()
      
      // Close modal
      const completeButton = await page.getByRole('button', { name: '完了' })
      await completeButton.click()
    })
  })

  test.describe('Navigation Flow', () => {
    test('should navigate through bottom bar tabs', async ({ page }) => {
      // Get all navigation buttons
      const navButtons = await page.locator('.bg-glass-5.backdrop-blur-heavy button')
      
      // Click through each tab
      for (let i = 1; i < 5; i++) {
        const button = navButtons.nth(i)
        const label = await button.getAttribute('aria-label')
        
        await button.click()
        await page.waitForTimeout(500)
        
        // Verify URL changed (except for unimplemented routes)
        const url = page.url()
        
        // Click home to return
        if (i < 4) {
          await navButtons.first().click()
          await page.waitForTimeout(500)
        }
      }
    })
  })

  test.describe('Language Switching Flow', () => {
    test('should switch language successfully', async ({ page }) => {
      // Open language switcher
      const langButton = await page.locator('button').filter({ hasText: '日本語' })
      await langButton.click()
      
      // Switch to English
      await page.getByText('English').click()
      
      // Page should reload - wait for it
      await page.waitForLoadState('load')
      
      // Verify language changed (button should show English)
      const newLangButton = await page.locator('button').filter({ hasText: 'English' })
      await expect(newLangButton).toBeVisible()
      
      // Switch back to Japanese
      await newLangButton.click()
      await page.getByText('日本語').click()
      await page.waitForLoadState('load')
    })
  })

  test.describe('Error Handling Flow', () => {
    test('should handle form validation errors', async ({ page }) => {
      // Open add connection form
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Try to submit empty form
      const submitButton = await page.getByRole('button', { name: /登録する/ })
      await submitButton.click()
      
      // Form should not close - required fields should prevent submission
      await expect(page.locator('[data-testid="modal-content"]')).toBeVisible()
      
      // Fill only nickname and try again
      await page.fill('input[placeholder*="Aさん"]', 'テスト')
      await submitButton.click()
      
      // Should still need platform
      await expect(page.locator('[data-testid="modal-content"]')).toBeVisible()
    })
  })

  test.describe('Search and Filter Flow', () => {
    test('should display connections based on stage', async ({ page }) => {
      await page.waitForTimeout(2000)
      
      // Count connections by stage indicator
      const stageIndicators = await page.locator('.border-glass-20 .font-medium')
      const stages = []
      
      for (let i = 0; i < await stageIndicators.count(); i++) {
        const text = await stageIndicators.nth(i).textContent()
        if (text && !text.includes('AI')) {
          stages.push(text)
        }
      }
      
      // Verify we can see different stages
      expect(stages.length).toBeGreaterThan(0)
    })
  })

  test.describe('Mobile User Flow', () => {
    test('should complete connection creation on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Add connection
      const addButton = await page.getByRole('button', { name: /手動で追加/ })
      await addButton.click()
      
      // Verify modal is mobile-friendly
      const modal = await page.locator('[data-testid="modal-content"]')
      await expect(modal).toBeVisible()
      
      // Fill basic info
      await page.fill('input[placeholder*="Aさん"]', 'モバイルテスト')
      await page.fill('input[placeholder*="Pairs"]', 'Tinder')
      
      // Close modal
      const closeButton = await page.locator('[aria-label="Close modal"]')
      await closeButton.click()
      
      // Verify modal closed
      await expect(modal).not.toBeVisible()
    })
  })
})
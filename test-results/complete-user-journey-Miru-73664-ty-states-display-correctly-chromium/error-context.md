# Test info

- Name: Miru Complete User Journey >> empty states display correctly
- Location: /Users/kokiriho/Documents/Projects/Dating/Miru/tests/e2e/complete-user-journey.spec.ts:197:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('text=恋愛の旅を始めましょう')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('text=恋愛の旅を始めましょう')

    at /Users/kokiriho/Documents/Projects/Dating/Miru/tests/e2e/complete-user-journey.spec.ts:201:52
```

# Page snapshot

```yaml
- button "日本語":
  - img
  - text: 日本語
  - img
- heading "Miru - AI恋愛オーケストレーションシステム" [level=1]
- paragraph: 「付き合えるかもしれない」希望を可視化する恋愛サポートアプリ
- button "ログイン / アカウント作成"
- paragraph: AIがあなたの恋愛をサポートします
- alert
```

# Test source

```ts
  101 |     
  102 |     // 2. タブレットサイズでテスト
  103 |     await page.setViewportSize({ width: 768, height: 1024 })
  104 |     await expect(page.locator('text=恋愛ダッシュボード')).toBeVisible()
  105 |     
  106 |     // 3. モバイルサイズでテスト
  107 |     await page.setViewportSize({ width: 375, height: 667 })
  108 |     await expect(page.locator('text=恋愛ダッシュボード')).toBeVisible()
  109 |     
  110 |     // ボトムナビゲーションが表示されることを確認
  111 |     await expect(page.locator('text=ホーム')).toBeVisible()
  112 |   })
  113 |
  114 |   test('error handling works correctly', async ({ page }) => {
  115 |     // ネットワークエラーをシミュレート
  116 |     await page.route('**/api/**', route => {
  117 |       route.abort('failed')
  118 |     })
  119 |     
  120 |     await page.goto('/')
  121 |     
  122 |     // エラー状態でもページが表示されることを確認
  123 |     await expect(page.locator('body')).toBeVisible()
  124 |   })
  125 |
  126 |   test('accessibility features work correctly', async ({ page }) => {
  127 |     await page.goto('/')
  128 |     
  129 |     // 1. キーボードナビゲーションのテスト
  130 |     await page.keyboard.press('Tab')
  131 |     await expect(page.locator(':focus')).toBeVisible()
  132 |     
  133 |     // 2. ARIAラベルの確認
  134 |     const button = page.locator('button').first()
  135 |     if (await button.isVisible()) {
  136 |       await expect(button).toHaveAttribute('aria-label')
  137 |     }
  138 |     
  139 |     // 3. カラーコントラストの確認（視覚的テスト）
  140 |     await expect(page.locator('body')).toBeVisible()
  141 |   })
  142 |
  143 |   test('data persistence works correctly', async ({ page }) => {
  144 |     await page.goto('/')
  145 |     
  146 |     // 1. 手動でコネクションを追加
  147 |     if (await page.locator('text=手動で追加').isVisible()) {
  148 |       await page.click('text=手動で追加')
  149 |       
  150 |       // フォーム入力
  151 |       await page.fill('input[name="nickname"]', 'データ永続化テスト')
  152 |       await page.selectOption('select[name="platform"]', 'tinder')
  153 |       await page.selectOption('select[name="current_stage"]', 'just_matched')
  154 |       
  155 |       await page.click('button[type="submit"]')
  156 |       
  157 |       // 2. ページをリロード
  158 |       await page.reload()
  159 |       
  160 |       // 3. データが保持されていることを確認（デモモードでは期待できないが、UIが正常に動作することを確認）
  161 |       await expect(page.locator('body')).toBeVisible()
  162 |     }
  163 |   })
  164 |
  165 |   test('performance meets requirements', async ({ page }) => {
  166 |     // パフォーマンス測定
  167 |     const startTime = Date.now()
  168 |     await page.goto('/')
  169 |     const loadTime = Date.now() - startTime
  170 |     
  171 |     // 3秒以内に読み込まれることを確認
  172 |     expect(loadTime).toBeLessThan(3000)
  173 |     
  174 |     // ページが表示されることを確認
  175 |     await expect(page.locator('body')).toBeVisible()
  176 |   })
  177 |
  178 |   test('AI integration features work', async ({ page }) => {
  179 |     await page.goto('/')
  180 |     
  181 |     // AI一括インポートボタンのテスト
  182 |     if (await page.locator('text=AI一括インポート').isVisible()) {
  183 |       await page.click('text=AI一括インポート')
  184 |       
  185 |       // データインポートモーダルが開くことを確認
  186 |       await expect(page.locator('text=データインポート')).toBeVisible()
  187 |       
  188 |       // モーダルを閉じる
  189 |       await page.keyboard.press('Escape')
  190 |     }
  191 |     
  192 |     // AI分析タブのテスト
  193 |     await page.click('text=AI分析')
  194 |     await expect(page.url()).toContain('/ai')
  195 |   })
  196 |
  197 |   test('empty states display correctly', async ({ page }) => {
  198 |     await page.goto('/')
  199 |     
  200 |     // 空状態のUI要素が正しく表示されることを確認
> 201 |     await expect(page.locator('text=恋愛の旅を始めましょう')).toBeVisible()
      |                                                    ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  202 |     
  203 |     // アクションボタンが表示されることを確認
  204 |     await expect(page.locator('text=手動で追加')).toBeVisible()
  205 |     await expect(page.locator('text=AI一括インポート')).toBeVisible()
  206 |     
  207 |     // アイコンが表示されることを確認
  208 |     const heartIcon = page.locator('[data-testid="heart-icon"]')
  209 |     if (await heartIcon.isVisible()) {
  210 |       await expect(heartIcon).toBeVisible()
  211 |     }
  212 |   })
  213 |
  214 |   test('loading states work correctly', async ({ page }) => {
  215 |     // API応答を遅延させる
  216 |     await page.route('**/api/**', async route => {
  217 |       await new Promise(resolve => setTimeout(resolve, 1000))
  218 |       route.continue()
  219 |     })
  220 |     
  221 |     await page.goto('/')
  222 |     
  223 |     // ローディング状態が表示されることを確認
  224 |     const loadingElement = page.locator('text=恋愛コネクションを分析中')
  225 |     if (await loadingElement.isVisible()) {
  226 |       await expect(loadingElement).toBeVisible()
  227 |     }
  228 |   })
  229 | })
```
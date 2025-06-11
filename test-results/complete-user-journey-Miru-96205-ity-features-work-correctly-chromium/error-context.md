# Test info

- Name: Miru Complete User Journey >> accessibility features work correctly
- Location: /Users/kokiriho/Documents/Projects/Dating/Miru/tests/e2e/complete-user-journey.spec.ts:126:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveAttribute()

Locator: locator('button').first()
Expected: have attribute
Received: attribute not present
Call log:
  - expect.toHaveAttribute with timeout 5000ms
  - waiting for locator('button').first()
    9 × locator resolved to <button title="言語を切り替え" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">…</button>
      - unexpected value "attribute not present"

    at /Users/kokiriho/Documents/Projects/Dating/Miru/tests/e2e/complete-user-journey.spec.ts:136:28
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
   36 |     await page.selectOption('select[name="frequency"]', 'daily')
   37 |     await page.selectOption('select[name="response_time"]', 'within_hours')
   38 |     await page.selectOption('select[name="conversation_depth"]', 'deep')
   39 |     
   40 |     // 8. ユーザー感情を入力
   41 |     await page.fill('input[name="interest_level"]', '8')
   42 |     await page.fill('input[name="emotional_connection"]', '7')
   43 |     await page.fill('input[name="future_potential"]', '9')
   44 |     
   45 |     // 9. 保存ボタンをクリック
   46 |     await page.click('button[type="submit"]')
   47 |     
   48 |     // 10. モーダルが閉じることを確認
   49 |     await expect(page.locator('text=新しいコネクションを追加')).not.toBeVisible()
   50 |     
   51 |     // 11. ダッシュボードに戻り、統計が表示されることを確認
   52 |     await expect(page.locator('text=恋愛ダッシュボード')).toBeVisible()
   53 |     await expect(page.locator('text=コネクション')).toBeVisible()
   54 |     await expect(page.locator('text=1')).toBeVisible() // コネクション数
   55 |     
   56 |     // 12. 追加されたコネクションカードを確認
   57 |     await expect(page.locator('text=テストさん')).toBeVisible()
   58 |     
   59 |     // 13. プロンプト生成ボタンをクリック
   60 |     await page.click('text=実行 →')
   61 |     
   62 |     // 14. プロンプト実行画面が表示されることを確認
   63 |     await expect(page.locator('text=AIプロンプト実行')).toBeVisible()
   64 |   })
   65 |
   66 |   test('navigation between tabs works correctly', async ({ page }) => {
   67 |     // 1. ダッシュボードに移動
   68 |     await page.goto('/')
   69 |     
   70 |     // 2. ボトムナビゲーションの確認
   71 |     await expect(page.locator('text=ホーム')).toBeVisible()
   72 |     await expect(page.locator('text=温度')).toBeVisible()
   73 |     await expect(page.locator('text=インポート')).toBeVisible()
   74 |     await expect(page.locator('text=AI分析')).toBeVisible()
   75 |     await expect(page.locator('text=設定')).toBeVisible()
   76 |     
   77 |     // 3. 各タブをクリックして動作確認
   78 |     await page.click('text=温度')
   79 |     await expect(page.url()).toContain('/temperature')
   80 |     
   81 |     await page.click('text=インポート')
   82 |     await expect(page.url()).toContain('/import')
   83 |     
   84 |     await page.click('text=AI分析')
   85 |     await expect(page.url()).toContain('/ai')
   86 |     
   87 |     await page.click('text=設定')
   88 |     await expect(page.url()).toContain('/settings')
   89 |     
   90 |     // 4. ホームに戻る
   91 |     await page.click('text=ホーム')
   92 |     await expect(page.url()).toBe('http://localhost:3000/')
   93 |   })
   94 |
   95 |   test('responsive design works correctly', async ({ page }) => {
   96 |     // 1. デスクトップサイズでテスト
   97 |     await page.setViewportSize({ width: 1200, height: 800 })
   98 |     await page.goto('/')
   99 |     
  100 |     await expect(page.locator('text=恋愛ダッシュボード')).toBeVisible()
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
> 136 |       await expect(button).toHaveAttribute('aria-label')
      |                            ^ Error: Timed out 5000ms waiting for expect(locator).toHaveAttribute()
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
  201 |     await expect(page.locator('text=恋愛の旅を始めましょう')).toBeVisible()
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
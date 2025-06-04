# Test info

- Name: 実際のフロントエンド・バックエンド通信テスト >> 2. 認証モーダルの表示と通信テスト
- Location: /Users/kokiriho/Documents/Projects/Dating/Miru/tests/e2e/real-communication.spec.ts:61:7

# Error details

```
Error: locator.isVisible: Error: strict mode violation: locator('.error, .text-red-500, [role="alert"]') resolved to 2 elements:
    1) <span class="text-red-500 text-base">⚠️</span> aka getByText('⚠️')
    2) <div role="alert" aria-live="assertive" id="__next-route-announcer__"></div> aka locator('[id="__next-route-announcer__"]')

Call log:
    - checking visibility of locator('.error, .text-red-500, [role="alert"]')

    at /Users/kokiriho/Documents/Projects/Dating/Miru/tests/e2e/real-communication.spec.ts:111:45
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
- heading "auth.modal.title" [level=2]: ログイン
- button "close": ✕
- text: ⚠️
- heading "ログインエラー" [level=4]
- paragraph: メールアドレスまたはパスワードが正しくありません
- paragraph: • メールアドレスに間違いがないか確認してください
- paragraph: • パスワードの大文字・小文字をご確認ください
- paragraph: • パスワードを忘れた場合は「パスワードを忘れた方はこちら」をクリックしてください
- text: メールアドレス
- textbox "メールアドレス": test@example.com
- text: パスワード
- textbox "パスワード": testpassword123
- button "toggle-password-visibility": 👁️
- button "ログイン / アカウント作成"
- paragraph:
  - text: アカウントをお持ちでない方は新規作成
  - button "アカウント作成"
- paragraph:
  - button "パスワードを忘れた方はこちら"
- paragraph: アカウントを作成することで、利用規約とプライバシーポリシーに同意したものとみなされます。
- alert
```

# Test source

```ts
   11 |   test.beforeEach(async ({ page }) => {
   12 |     // ネットワーク監視を有効化
   13 |     await page.route('**/*', route => {
   14 |       const url = route.request().url()
   15 |       console.log(`[${route.request().method()}] ${url}`)
   16 |       route.continue()
   17 |     })
   18 |   })
   19 |
   20 |   test('1. サイトの基本的な読み込みと初期通信', async ({ page }) => {
   21 |     console.log('🌐 === サイト読み込みテスト ===')
   22 |     
   23 |     // レスポンス監視
   24 |     const responses: any[] = []
   25 |     page.on('response', response => {
   26 |       responses.push({
   27 |         url: response.url(),
   28 |         status: response.status(),
   29 |         ok: response.ok()
   30 |       })
   31 |     })
   32 |
   33 |     // サイトにアクセス
   34 |     const response = await page.goto(DEPLOYED_URL, {
   35 |       waitUntil: 'networkidle'
   36 |     })
   37 |
   38 |     // 基本的な通信確認
   39 |     expect(response?.ok()).toBe(true)
   40 |     expect(response?.status()).toBe(200)
   41 |     
   42 |     // ページタイトル確認
   43 |     await expect(page).toHaveTitle(/Miru/)
   44 |     
   45 |     // 初期読み込み時のネットワーク通信を分析
   46 |     console.log('\n📊 ネットワーク通信分析:')
   47 |     const supabaseRequests = responses.filter(r => r.url.includes('supabase'))
   48 |     const staticAssets = responses.filter(r => r.url.includes('_next'))
   49 |     
   50 |     console.log(`  静的アセット: ${staticAssets.length}件`)
   51 |     console.log(`  Supabase API: ${supabaseRequests.length}件`)
   52 |     
   53 |     if (supabaseRequests.length > 0) {
   54 |       console.log('\n  Supabase通信詳細:')
   55 |       supabaseRequests.forEach(req => {
   56 |         console.log(`    ${req.status} ${req.url.substring(0, 50)}...`)
   57 |       })
   58 |     }
   59 |   })
   60 |
   61 |   test('2. 認証モーダルの表示と通信テスト', async ({ page }) => {
   62 |     console.log('\n🔐 === 認証通信テスト ===')
   63 |     
   64 |     await page.goto(DEPLOYED_URL)
   65 |     
   66 |     // 認証関連のAPIコールを監視
   67 |     const authRequests: any[] = []
   68 |     page.on('request', request => {
   69 |       if (request.url().includes('auth')) {
   70 |         authRequests.push({
   71 |           url: request.url(),
   72 |           method: request.method(),
   73 |           headers: request.headers()
   74 |         })
   75 |       }
   76 |     })
   77 |
   78 |     // ログインボタンを探してクリック
   79 |     const loginButton = page.locator('button:has-text("ログイン"), button:has-text("Login")')
   80 |     const hasLoginButton = await loginButton.isVisible()
   81 |     
   82 |     if (hasLoginButton) {
   83 |       console.log('✅ ログインボタンを発見')
   84 |       await loginButton.click()
   85 |       
   86 |       // モーダルが開くのを待つ
   87 |       const modal = page.locator('[data-testid="modal-content"], .modal, [role="dialog"]')
   88 |       await expect(modal).toBeVisible({ timeout: 5000 })
   89 |       console.log('✅ 認証モーダルが表示されました')
   90 |       
   91 |       // ログインフォームに入力
   92 |       const emailInput = page.locator('input[type="email"], input[placeholder*="メール"], input[placeholder*="email"]')
   93 |       const passwordInput = page.locator('input[type="password"]')
   94 |       
   95 |       if (await emailInput.isVisible() && await passwordInput.isVisible()) {
   96 |         console.log('\n📝 ログインフォームテスト:')
   97 |         
   98 |         // テスト用の認証情報を入力
   99 |         await emailInput.fill('test@example.com')
  100 |         await passwordInput.fill('testpassword123')
  101 |         
  102 |         // ログインボタンをクリック
  103 |         const submitButton = page.locator('button[type="submit"], button:has-text("ログインする")')
  104 |         await submitButton.click()
  105 |         
  106 |         // API通信を待つ
  107 |         await page.waitForTimeout(2000)
  108 |         
  109 |         // エラーメッセージまたは成功を確認
  110 |         const errorMessage = page.locator('.error, .text-red-500, [role="alert"]')
> 111 |         const hasError = await errorMessage.isVisible()
      |                                             ^ Error: locator.isVisible: Error: strict mode violation: locator('.error, .text-red-500, [role="alert"]') resolved to 2 elements:
  112 |         
  113 |         if (hasError) {
  114 |           const errorText = await errorMessage.textContent()
  115 |           console.log(`⚠️ エラーメッセージ: ${errorText}`)
  116 |           
  117 |           // エラーメッセージが日本語であることを確認
  118 |           expect(errorText).toMatch(/メールアドレス|パスワード|エラー/)
  119 |           console.log('✅ 日本語エラーメッセージが正しく表示されています')
  120 |         }
  121 |         
  122 |         // 認証APIコールの確認
  123 |         console.log(`\n📡 認証API通信: ${authRequests.length}件`)
  124 |         authRequests.forEach(req => {
  125 |           console.log(`  ${req.method} ${req.url.substring(0, 60)}...`)
  126 |         })
  127 |       }
  128 |     } else {
  129 |       console.log('ℹ️ ログインボタンが見つかりません（既にログイン済みの可能性）')
  130 |     }
  131 |   })
  132 |
  133 |   test('3. データ取得通信テスト', async ({ page }) => {
  134 |     console.log('\n💾 === データ取得通信テスト ===')
  135 |     
  136 |     await page.goto(DEPLOYED_URL)
  137 |     
  138 |     // データ取得関連のAPIコールを監視
  139 |     const dataRequests: any[] = []
  140 |     const dataResponses: any[] = []
  141 |     
  142 |     page.on('request', request => {
  143 |       if (request.url().includes('rest/v1') || request.url().includes('connections')) {
  144 |         dataRequests.push({
  145 |           url: request.url(),
  146 |           method: request.method()
  147 |         })
  148 |       }
  149 |     })
  150 |     
  151 |     page.on('response', async response => {
  152 |       if (response.url().includes('rest/v1') || response.url().includes('connections')) {
  153 |         try {
  154 |           const data = await response.json()
  155 |           dataResponses.push({
  156 |             url: response.url(),
  157 |             status: response.status(),
  158 |             data: data
  159 |           })
  160 |         } catch {
  161 |           // JSONでない場合は無視
  162 |         }
  163 |       }
  164 |     })
  165 |     
  166 |     // ダッシュボードまたはコネクション一覧を確認
  167 |     await page.waitForTimeout(3000)
  168 |     
  169 |     // ローディング状態の確認
  170 |     const loadingSpinner = page.locator('[data-testid="loading-spinner"], .loading, .spinner')
  171 |     const isLoading = await loadingSpinner.isVisible()
  172 |     
  173 |     if (isLoading) {
  174 |       console.log('⏳ データ読み込み中...')
  175 |       await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 })
  176 |     }
  177 |     
  178 |     // データ表示の確認
  179 |     const connectionCards = page.locator('[data-testid="connection-card"], .connection-card')
  180 |     const cardCount = await connectionCards.count()
  181 |     
  182 |     console.log(`\n📊 データ取得結果:`)
  183 |     console.log(`  コネクションカード: ${cardCount}件`)
  184 |     console.log(`  データAPI通信: ${dataRequests.length}件`)
  185 |     console.log(`  データレスポンス: ${dataResponses.length}件`)
  186 |     
  187 |     if (dataResponses.length > 0) {
  188 |       console.log('\n  レスポンス詳細:')
  189 |       dataResponses.forEach((res, i) => {
  190 |         console.log(`    ${i + 1}. [${res.status}] ${res.url.substring(0, 50)}...`)
  191 |         if (res.data && Array.isArray(res.data)) {
  192 |           console.log(`       データ件数: ${res.data.length}`)
  193 |         }
  194 |       })
  195 |     }
  196 |     
  197 |     // エラー状態の確認
  198 |     const errorMessage = page.locator('.error-message, [data-testid="error-message"]')
  199 |     if (await errorMessage.isVisible()) {
  200 |       const error = await errorMessage.textContent()
  201 |       console.log(`\n⚠️ エラー表示: ${error}`)
  202 |     }
  203 |   })
  204 |
  205 |   test('4. リアルタイム通信とWebSocket接続テスト', async ({ page }) => {
  206 |     console.log('\n🔄 === リアルタイム通信テスト ===')
  207 |     
  208 |     // WebSocket接続を監視
  209 |     const wsConnections: string[] = []
  210 |     
  211 |     page.on('websocket', ws => {
```
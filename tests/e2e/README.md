# E2E Tests with Playwright

このディレクトリには、Playwrightを使用したEnd-to-End (E2E) テストが含まれています。

## テストファイル

- `real-communication.spec.ts` - デプロイされたサイトでの実際の通信テスト
- `complete-user-journey.spec.ts` - ユーザージャーニー全体のテスト
- `local-test.spec.ts` - ローカル開発サーバーでのテスト

## テストの実行方法

### すべてのE2Eテストを実行
```bash
npm run test:e2e
```

### UIモードでテストを実行（デバッグに便利）
```bash
npm run test:e2e:ui
```

### ローカル開発サーバーでテストを実行
```bash
npm run test:e2e:local
```

### 特定のテストファイルを実行
```bash
npx playwright test tests/e2e/real-communication.spec.ts
```

### テストレポートを表示
```bash
npm run test:e2e:report
```

## 設定ファイル

- `playwright.config.ts` - デプロイされたサイト用の設定
- `playwright.config.local.ts` - ローカル開発サーバー用の設定

## テストのデバッグ

1. **UIモード**: `npm run test:e2e:ui` でPlaywright UIを起動
2. **デバッグモード**: `npm run test:e2e:debug` でステップ実行
3. **スクリーンショット**: 失敗時に自動的に保存されます
4. **ビデオ**: 失敗時に自動的に録画されます

## 注意事項

- Jest形式の古いE2Eテストは `tests/jest-e2e/` に移動されました
- Playwrightテストは `.spec.ts` 拡張子を使用します
- テスト実行前にPlaywrightのブラウザをインストールする必要があります：
  ```bash
  npx playwright install
  ```
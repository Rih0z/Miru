# CLAUDE.md - Miru開発ガイドライン

## プロジェクト概要
Miruは「付き合えるかもしれない」希望を可視化する恋愛オーケストレーションAIシステムです。

## 開発作業指針
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│   Ultrathink.                                                                       │
│   Don't hold back. give it your all！                                              │
│   日本語で回答して。                                                                │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 作業完了時の必須タスク

### 1. GitHub へのプッシュ
作業が完了したら必ずGitHubに変更をプッシュすること:
```bash
git add .
git commit -m "適切なコミットメッセージ"
git push origin main
```

### 2. ビルドとデプロイ
作業が完了したらClaude環境でビルドしCloudflareにデプロイすること:
```bash
npm run build
npm run deploy  # または wrangler deploy
```
**重要**: 必ずURLが固定の本番環境（miru-28f.pages.dev）にデプロイすること

### 3. セキュリティチェック
GitHubへのプッシュ前に以下のセキュリティ確認を必ず実施すること:
- APIキーや認証情報がコードに含まれていないか確認
- .env ファイルが .gitignore に含まれているか確認
- Supabase URLやキーがハードコードされていないか確認
- 個人情報やセンシティブなデータが含まれていないか確認
- 依存関係の脆弱性チェック: `npm audit`

### 4. ドキュメント更新
実装を変更したら、それに合わせて以下のドキュメントも更新すること:
- README.md - デプロイ先URLの記載を含む
- docs/ 配下の関連ドキュメント
- SETUP.md（環境構築手順の変更がある場合）

### 5. フロントエンド・バックエンド通信の確保
フロントエンドとバックエンドの通信が必ず成功するように:
- 固定のAPIエンドポイントを使用すること
- デモモードを実装して、Supabase未設定でも基本機能が動作すること
- エラーハンドリングを適切に実装すること

## テスト実行
コードの品質を保つため、以下のコマンドを実行:
```bash
npm test        # テスト実行
npm run lint    # Lintチェック
npm run typecheck  # 型チェック
```

## プロジェクト構造
```
src/
├── app/           # Next.js App Router
├── components/    # Reactコンポーネント
├── lib/          # ビジネスロジック
├── types/        # TypeScript型定義
└── tests/        # テストファイル
```

## 技術スタック
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Cloudflare Workers
- Database: Supabase (PostgreSQL)
- Testing: Jest + React Testing Library

## 重要な設計原則
1. Test-Driven Development (TDD) を採用
2. TypeScriptで型安全性を確保
3. コンポーネントは再利用可能に設計
4. ビジネスロジックはlib/に集約

## リポジトリ
https://github.com/Rih0z/Miru.git
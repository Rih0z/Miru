# CLAUDE.md - Miru開発ガイドライン

## プロジェクト概要
Miruは「付き合えるかもしれない」希望を可視化する恋愛オーケストレーションAIシステムです。

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

### 3. セキュリティチェック
GitHubへのプッシュ前に以下のセキュリティ確認を必ず実施すること:
- APIキーや認証情報がコードに含まれていないか確認
- .env ファイルが .gitignore に含まれているか確認
- Supabase URLやキーがハードコードされていないか確認
- 個人情報やセンシティブなデータが含まれていないか確認
- 依存関係の脆弱性チェック: `npm audit`

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
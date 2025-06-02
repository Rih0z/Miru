# Miru 恋愛サポートAI - セットアップガイド

このガイドでは、Miruアプリケーションをローカル環境またはプロダクション環境で実行するためのセットアップ手順を説明します。

## 前提条件

- Node.js 18以上
- npm または yarn
- Supabase アカウント（プロダクション用）

## 1. プロジェクトのクローンとインストール

```bash
git clone <repository-url>
cd Miru
npm install
```

## 2. Supabase プロジェクトの設定

### 2.1 Supabase プロジェクトの作成

1. [Supabase](https://supabase.com) にアクセス
2. 新しいプロジェクトを作成
3. データベースパスワードを設定

### 2.2 データベーススキーマの設定

1. Supabase ダッシュボードの「SQL Editor」を開く
2. `supabase-schema.sql`ファイルの内容をコピー＆実行
3. すべてのテーブルとポリシーが作成されることを確認

### 2.3 認証設定

1. Supabase ダッシュボードの「Authentication」→「Settings」
2. 「Site URL」に本番ドメインを設定（例：`https://your-domain.com`）
3. 「Redirect URLs」に以下を追加：
   - `http://localhost:3000/auth/callback`（開発用）
   - `https://your-domain.com/auth/callback`（本番用）

## 3. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Next.js設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key
```

### 環境変数の取得方法

Supabase ダッシュボードの「Settings」→「API」で以下を確認：
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project API keys → anon public

## 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセス

## 5. 本番環境デプロイ（Cloudflare Pages）

### 5.1 Cloudflare Pages の設定

1. Cloudflare ダッシュボードで新しいPagesプロジェクトを作成
2. GitHubリポジトリを接続
3. ビルド設定：
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`

### 5.2 環境変数の設定

Cloudflare Pages の「Settings」→「Environment variables」で以下を設定：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 6. データベース初期化の確認

アプリケーションが正常に動作することを確認：

1. ユーザー登録を実行
2. 新しい相手を追加
3. ダッシュボードでデータが表示されることを確認

## 7. セキュリティ設定の確認

### 7.1 RLS（Row Level Security）の確認

Supabase ダッシュボードの「Table Editor」で、すべてのテーブルでRLSが有効になっていることを確認。

### 7.2 認証設定の確認

- メール確認が正常に動作することを確認
- パスワードリセットが機能することを確認

## 8. トラブルシューティング

### よくある問題

#### 1. 「Supabase is not configured」エラー

- `.env.local`ファイルが正しく設定されているか確認
- 環境変数名が正確であることを確認
- 開発サーバーを再起動

#### 2. 認証エラー

- Supabase プロジェクトの認証設定を確認
- リダイレクトURLが正しく設定されているか確認

#### 3. データベース接続エラー

- Supabase プロジェクトが正常に動作しているか確認
- RLSポリシーが正しく設定されているか確認

#### 4. ビルドエラー

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# TypeScript型チェック
npm run type-check

# リンティング
npm run lint
```

## 9. 開発者向け情報

### テストの実行

```bash
# 単体テスト
npm run test

# E2Eテスト
npm run test:e2e

# テストカバレッジ
npm run test:coverage
```

### 型チェック

```bash
npm run type-check
```

### コードフォーマット

```bash
# フォーマット確認
npm run lint

# 自動フォーマット
npm run lint:fix
```

## 10. サポート

問題が発生した場合は、以下を確認してください：

1. この設定ガイドの手順を再確認
2. Supabase ダッシュボードでエラーログを確認
3. ブラウザの開発者ツールでコンソールエラーを確認

追加のサポートが必要な場合は、プロジェクトのIssueを作成してください。
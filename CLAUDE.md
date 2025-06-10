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

## UI/UX開発フロー

### 1. ドキュメント更新プロセス
UI/UX関連の変更を行う際は、必ず以下の順序で作業すること:

1. **ドキュメント更新**: `docs/ui-ux-comprehensive-guide.md` を最初に更新
2. **実装更新**: ドキュメントに合わせて実装コードを更新
3. **テスト**: 変更内容が正しく動作することを確認
4. **デプロイ**: 本番環境に反映

### 2. UI/UX設計原則
- **Clean Modern Design**: 読みやすく、プロフェッショナルな外観
- **React Icons使用**: 絵文字の代わりにReact Icons (Lucide React) を使用
- **アクセシビリティ**: WCAG AA準拠、適切なARIAラベル
- **レスポンシブ**: モバイルファーストデザイン
- **一貫性**: デザインシステムに従った統一感

### 3. アイコン使用ガイドライン
```typescript
// 絵文字は使用禁止
❌ <span>💕</span>
❌ <div>🌸</div>

// React Icons を使用
✅ <Heart className="w-5 h-5 text-pink-500" />
✅ <Sparkles className="w-4 h-4 text-purple-400" />
```

**アイコンサイズ規則:**
- インライン: `w-4 h-4`
- ボタン内: `w-5 h-5`
- ディスプレイ用: `w-8 h-8`
- 大型アイコン: `w-16 h-16`

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
- **docs/ui-ux-comprehensive-guide.md** - UI/UX仕様（最優先）
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
npm test           # テスト実行
npm run lint       # Lintチェック
npm run type-check # 型チェック
```

## プロジェクト構造
```
src/
├── app/              # Next.js App Router
├── components/       # Reactコンポーネント
│   ├── ui/          # 基本UIコンポーネント
│   ├── layout/      # レイアウトコンポーネント
│   └── ...          # 機能別コンポーネント
├── lib/             # ビジネスロジック
├── styles/          # スタイルファイル
├── types/           # TypeScript型定義
└── tests/           # テストファイル
```

## 技術スタック
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Icons: Lucide React + React Icons
- Backend: Cloudflare Workers
- Database: Supabase (PostgreSQL)
- Testing: Jest + React Testing Library + Playwright

## 重要な設計原則
1. **Documentation-First Development**: ドキュメント更新 → 実装更新
2. **Clean Design**: 読みやすく、プロフェッショナルな外観
3. **Accessibility-First**: WCAG AA準拠のアクセシブルな設計
4. **TypeScriptで型安全性を確保**
5. **コンポーネントは再利用可能に設計**
6. **ビジネスロジックはlib/に集約**
7. **SOLID原則の遵守**
   - Single Responsibility Principle: 各クラス・モジュールは単一の責任を持つ
   - Open/Closed Principle: 拡張に対して開いており、修正に対して閉じている
   - Liskov Substitution Principle: 派生型は基底型と置換可能
   - Interface Segregation Principle: クライアントは不要なインターフェースに依存しない
   - Dependency Inversion Principle: 抽象に依存し、具体に依存しない

## アイコンライブラリ設定
```bash
# 必要なアイコンライブラリをインストール
npm install lucide-react react-icons
```

```typescript
// 推奨インポート例
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Star, 
  Plus, 
  Download,
  Home,
  Settings,
  Bot,
  Thermometer
} from 'lucide-react';
```

## リポジトリ
https://github.com/Rih0z/Miru.git
# Miru - AI恋愛オーケストレーションシステム

「付き合えるかもしれない」希望を可視化する、革新的な恋愛サポートアプリ

## 🌟 特徴

- 🤖 AI（ChatGPT/Claude/Gemini）との連携による恋愛アドバイス
- 📊 関係の進展を可視化
- 💡 データに基づいた次のアクション提案
- 🔒 プライバシーファーストな設計
- 🛡️ セキュリティ強化済み（CSP、入力検証等）
- 🔐 完全認証システム（Supabase Auth）
- 📱 リアルタイムデータベース連携

## 🌐 本番サイト

**フル機能版を今すぐ体験！**

🔗 **本番サイト**: https://miru-28f.pages.dev

- ✅ 完全認証システム（ユーザー登録・ログイン）
- ✅ リアルタイムデータベース連携
- ✅ レスポンシブデザイン対応
- ✅ PWA対応（スマホでも快適）
- ✅ プロダクション品質のセキュリティ

## 🚀 クイックスタート

### オンラインで試す
上記の本番サイトでユーザー登録を行い、フル機能版をご体験ください。

### ローカル開発
```bash
# リポジトリをクローン
git clone https://github.com/Rih0z/Miru.git
cd Miru

# 依存関係をインストール
npm install

# Supabaseプロジェクトを設定（詳細はSETUP.mdを参照）
# .env.localファイルを作成して環境変数を設定

# 開発サーバーを起動
npm run dev
```

### セットアップ
詳細なセットアップ手順は [SETUP.md](SETUP.md) をご覧ください。

### デプロイ
```bash
# Cloudflare Pagesにデプロイ
npm run deploy
```

## 🎯 実装機能

### ✅ 完全実装済み機能
- **🔐 ユーザー認証システム**: 
  - ユーザー登録・ログイン・パスワードリセット
  - Supabase認証によるセキュアな管理
- **📊 恋愛ダッシュボード**: 
  - 個人専用の関係総合状況表示
  - リアルタイムデータ更新
- **👥 相手管理システム**: 
  - 相手情報の追加・編集・削除
  - 詳細なプロフィール管理
- **📈 関係性スコア計算**: 
  - AIベース0-100点評価システム
  - Hope Implementation Score (HIS)
- **💡 推奨アクション**: 
  - 緊急度別のパーソナライズ提案
  - AI最適化されたアクションプラン
- **🎯 AIプロンプト生成**: 
  - Claude/ChatGPT/Gemini対応
  - 状況別最適化プロンプト
- **📱 完全レスポンシブ**: 
  - モバイル・タブレット対応
  - PWA対応
- **🛡️ セキュリティ**: 
  - Row Level Security (RLS)
  - 入力検証・サニタイゼーション

### 🚧 拡張予定機能
- マッチングアプリとの直接連携
- リアルタイム通知システム
- 詳細な進捗履歴・分析
- プロフィール画像管理

## 📚 ドキュメント

- [提案書](proposal.md) - プロダクトのコンセプトと価値提案
- [設計ドキュメント](document/) - 技術仕様と実装詳細
- [実装完了サマリー](document/message/implementation-summary.md) - MVP実装状況

## 🛠 技術スタック

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI API, Anthropic API, Google AI
- **Deployment**: Cloudflare Pages
- **Testing**: Jest + React Testing Library

## 📝 ライセンス

MIT License

## 👤 作者

**Rih0z**

- GitHub: [@Rih0z](https://github.com/Rih0z)
EOF < /dev/null
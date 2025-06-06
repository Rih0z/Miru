# Miru - AI恋愛オーケストレーションシステム ✨

「付き合えるかもしれない」希望を可視化する、革新的な恋愛サポートアプリ

## 💕 Kawaiiデザインで恋愛をもっと楽しく

Miru v2.0では、可愛らしいKawaiiデザインシステムを採用し、恋愛体験をより楽しく魅力的にします！

## 🌟 特徴

- 🤖 **AI統合オーケストレーション**: ChatGPT/Claude/Gemini完全対応
- 📱 **AIデータインポート**: スクリーンショットから恋愛状況を自動分析
- 💖 **Kawaiiデザインシステム**: 絵文字アイコン、アニメーション、温度カラー
- 📊 関係の進展を可視化（温度スコアリング：Hot/Warm/Cool）
- 💡 データに基づいた次のアクション提案
- 🔒 プライバシーファーストな設計
- 🛡️ セキュリティ強化済み（CSP、入力検証等）
- 🔐 完全認証システム（Supabase Auth）
- 📱 リアルタイムデータベース連携

## 🌐 本番サイト

**フル機能版を今すぐ体験！**

🔗 **本番サイト**: https://miru-28f.pages.dev

- ✅ 完全認証システム（ユーザー登録・ログイン）
- ✅ デモモード対応（Supabase未設定でも動作）
- ✅ リアルタイムデータベース連携
- ✅ レスポンシブデザイン対応
- ✅ PWA対応（スマホでも快適）
- ✅ プロダクション品質のセキュリティ

**注**: 現在はデモモードで動作しています。Supabase設定後、フル機能をご利用いただけます。

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

### ✅ 完全実装済み機能（v2.0対応）
- **🔐 ユーザー認証システム**: 
  - ユーザー登録・ログイン・パスワードリセット
  - Supabase認証によるセキュアな管理
  - 詳細なエラーメッセージ表示システム
- **📊 Kawaii恋愛ダッシュボード**: 
  - 個人専用の関係総合状況表示
  - 温度カラー（Hot/Warm/Cool）による進展可視化
  - 魔法のアニメーション（heartbeat, float, sparkle）
  - リアルタイムデータ更新
- **👥 相手管理システム**: 
  - 相手情報の追加・編集・削除（Kawaiiカード形式）
  - 詳細なプロフィール管理
  - 絵文字アイコンによる直感的操作
- **📈 関係性スコア計算**: 
  - AIベース0-100点評価システム
  - Hope Implementation Score (HIS)
  - 温度スコアリング（75-100%: Hot、40-74%: Warm、0-39%: Cool）
- **💡 推奨アクション**: 
  - 緊急度別のパーソナライズ提案
  - AI最適化されたアクションプラン
  - 魔法のアクション実行システム
- **🎯 AIプロンプトオーケストレーション**: 
  - Claude/ChatGPT/Gemini完全対応
  - パーソナライズドプロンプト生成
  - 状況別最適化プロンプト
  - AI連携実行システム
- **📱 AIデータインポート（NEW!）**: 
  - スクリーンショット自動分析
  - 恋愛アプリデータ一括インポート
  - AI対話によるデータ収集
- **📱 完全レスポンシブ（v2.0強化）**: 
  - モバイル・タブレット最適化
  - PWA対応
  - Touch Target 44px以上
  - Safe Area対応
- **🛡️ セキュリティ**: 
  - Row Level Security (RLS)
  - 入力検証・サニタイゼーション
  - API秘匿情報保護

### 🚧 拡張予定機能
- マッチングアプリとの直接連携
- リアルタイム通知システム
- 詳細な進捗履歴・分析
- プロフィール画像管理

## 📚 ドキュメント

- [提案書](proposal.md) - プロダクトのコンセプトと価値提案
- [設計ドキュメント](document/) - 技術仕様と実装詳細
- [実装完了サマリー](document/message/implementation-summary.md) - MVP実装状況

## 🛠 技術スタック（v2.0）

- **Frontend**: 
  - Next.js 14.2.29 (App Router)
  - React 18
  - TypeScript 5.0+
  - Tailwind CSS 3.4.0
  - Zustand 4.4.7 (状態管理)
- **Design System**: 
  - Kawaii Design System v2.0
  - 絵文字アイコン（react-icons完全廃止）
  - CSS Custom Properties
  - 温度カラーパレット
- **Backend**: Cloudflare Workers
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: 
  - OpenAI API (ChatGPT)
  - Anthropic API (Claude)
  - Google AI (Gemini)
  - AIプロンプトオーケストレーション
- **Deployment**: Cloudflare Pages (miru-28f.pages.dev)
- **Testing**: Jest + React Testing Library + Playwright

## 📝 ライセンス

MIT License

## 👤 作者

**Rih0z**

- GitHub: [@Rih0z](https://github.com/Rih0z)
EOF < /dev/null
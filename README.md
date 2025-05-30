# Miru - AI恋愛オーケストレーションシステム

「付き合えるかもしれない」希望を可視化する、革新的な恋愛サポートアプリ

## 🌟 特徴

- 🤖 AI（ChatGPT/Claude/Gemini）との連携による恋愛アドバイス
- 📊 関係の進展を可視化
- 💡 データに基づいた次のアクション提案
- 🔒 プライバシーファーストな設計

## 🌐 デモサイト

**ライブデモを今すぐ体験！**

🔗 **本番サイト**: https://miru-28f.pages.dev

- ✅ 完全にインタラクティブなデモ
- ✅ サンプルデータで機能をテスト可能
- ✅ レスポンシブデザイン対応
- ✅ PWA対応（スマホでも快適）

## 🚀 クイックスタート

### オンラインで試す
上記のデモサイトにアクセスするだけで、すぐにMiruの機能を体験できます。

### ローカル開発
```bash
# リポジトリをクローン
git clone https://github.com/Rih0z/Miru.git
cd Miru

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local

# 開発サーバーを起動
npm run dev
```

### デプロイ
```bash
# Cloudflare Pagesにデプロイ
npm run deploy
```

## 🎯 デモ機能

現在のデモサイトで体験できる機能：

### ✅ 実装済み機能
- **恋愛ダッシュボード**: 関係の総合的な状況表示
- **相手管理**: 2名のサンプル相手（Aさん・Bさん）の詳細表示
- **関係性スコア計算**: 0-100点での関係評価システム
- **推奨アクション**: 緊急度別のアクション提案
- **進捗可視化**: プログレスバーとステージ別の表示
- **インタラクティブUI**: 全ボタンが機能（編集・削除・AI相談）

### 🚧 開発予定機能
- 相手情報の追加・編集フォーム
- AIプロンプト実行とレスポンス表示
- プロフィール画像アップロード
- マッチングアプリとの連携
- 詳細な進捗履歴表示

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
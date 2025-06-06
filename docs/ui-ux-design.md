# Miru UI/UX デザインシステム統合仕様書

## 目次
1. [デザインコンセプト](#デザインコンセプト)
2. [ビジュアルデザイン基盤](#ビジュアルデザイン基盤)
3. [デザイントークン](#デザイントークン)
4. [コンポーネントシステム](#コンポーネントシステム)
5. [インタラクション設計](#インタラクション設計)
6. [画面設計パターン](#画面設計パターン)
7. [レスポンシブ・アクセシビリティ](#レスポンシブ・アクセシビリティ)
8. [技術実装仕様](#技術実装仕様)
9. [プラットフォーム対応](#プラットフォーム対応)

## デザインコンセプト

### プロダクトビジョン
Miruは「AIが会話の温度感を分析し、恋愛の可能性を可視化する」恋愛オーケストレーションAIシステムです。ユーザーの恋愛における不安を軽減し、希望と可能性を明確に見せることで、ポジティブな恋愛体験を提供します。

### 🌸 Kawaiiデザイン原則

#### 1. 希望と励まし
- ポジティブな言葉遣いで不安を軽減
- 成功を祝うフィードバック
- 進展を可視化して達成感を提供
- 魔法のような視覚演出

#### 2. Kawaii（かわいい）ビジュアル
- 丸みを帯びたコンポーネント
- パステルカラーの配色
- 楽しいアニメーション
- 親しみやすい表現

#### 3. シンプルで直感的
- 明確で分かりやすいナビゲーション
- 最小限のステップで目標達成
- 専門用語を避けた親しみやすい表現
- モバイルファーストのレイアウト

#### 4. 科学的で信頼できる
- AIの分析根拠を明確に表示
- データに基づく客観的な指標
- 透明性のある情報提示

### ターゲットユーザー
- 25-40歳の真剣な交際を求める独身男女
- マッチングアプリを利用するも、適切なコミュニケーションに課題を感じる人
- デジタルツールを活用してより効率的な出会いを求める人

## ビジュアルデザイン基盤

### 🎨 カラーパレット

#### プライマリカラー（Kawaii Pink系）
- **Kawaii Pink**: #ff6b6b（メインアクセント）
- **Soft Pink**: #ffe0e6（背景・ハイライト） 
- **Deep Pink**: #ff4757（ホバー・アクティブ）
- **Pink Background**: #fff5f5（薄い背景用）

#### セカンダリカラー（感情表現）
- **Magical Purple**: #a29bfe（サブアクセント）
- **Dream Blue**: #74b9ff（情報・リンク）
- **Mint Green**: #55efc4（成功・ポジティブ）
- **Warm Yellow**: #fdcb6e（注意・お気に入り）

#### 温度カラー（関心度表現）
- **Hot Temperature**: #ff6b6b（高温・高い関心）75-100%
- **Warm Temperature**: #ffd700（中温・普通の関心）40-74%
- **Cool Temperature**: #87ceeb（低温・低い関心）0-39%

#### ニュートラルカラー
- **Charcoal**: #333333（主要テキスト）
- **Soft Gray**: #666666（補助テキスト）
- **Light Gray**: #999999（三次テキスト）
- **Border Gray**: #e0e0e0（境界線）
- **Background**: #f8f8f8（背景グレー）
- **Cloud White**: #ffffff（白）

#### セマンティックカラー
- **Success**: #4caf50（成功・完了）
- **Warning**: #ff9800（警告・注意）
- **Error**: #ff4444（エラー）
- **Info**: #2196f3（情報）

### 📝 タイポグラフィシステム

#### フォントファミリー
```css
/* 日本語フォント */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP', sans-serif;

/* 等幅フォント */
font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace;
```

#### フォントサイズスケール
- **xxxl**: 72px（恋愛可能性スコア）
- **xxl**: 36px（ロゴ・大見出し）
- **xl**: 24px（ページタイトル）
- **lg**: 20px（セクションタイトル）
- **md**: 18px（サブタイトル）
- **base**: 16px（本文）
- **sm**: 14px（補助テキスト）
- **xs**: 12px（キャプション）
- **xxs**: 11px（最小テキスト）

#### フォントウェイト
- **regular**: 400（通常テキスト）
- **medium**: 500（強調テキスト）
- **semibold**: 600（サブタイトル）
- **bold**: 700（見出し）

#### 行間設定
- **tight**: 1.25（見出し用）
- **normal**: 1.5（本文用）
- **relaxed**: 1.6（読みやすさ重視）
- **loose**: 1.75（余裕のあるレイアウト）

### 🎭 アイコンシステム

#### アイコンライブラリ
- **メインライブラリ**: Lucide React
- **スタイル**: シンプルなラインアート
- **重さ**: ミディアム（2px stroke）

#### サイズバリエーション
- **xs**: 12px（インライン使用）
- **sm**: 16px（補助的な情報）
- **md**: 20px（デフォルトサイズ）
- **lg**: 24px（ナビゲーション・主要アクション）
- **xl**: 32px（大きなアクション）

#### カテゴリ別アイコンマッピング
```typescript
// ナビゲーション
navigation: {
  temperature: 'Thermometer',    // 温度分析
  import: 'Download',           // インポート
  aiAnalysis: 'Brain',          // AI会話分析
  chart: 'BarChart3',           // 詳細分析
  settings: 'Settings'          // 設定
}

// 感情・状態
emotion: {
  smile: 'Smile',               // 笑顔
  heart: 'Heart',               // ハート
  fire: 'Flame',                // 炎（高温）
  thermometer: 'Thermometer'    // 温度計
}

// コミュニケーション
communication: {
  message: 'MessageSquare',     // メッセージ
  send: 'Send',                 // 送信
  edit: 'Edit3'                 // 編集
}
```

### 🎨 スペーシングシステム

#### 基本スケール（4px ベース）
- **xxs**: 3px
- **xs**: 5px
- **sm**: 8px
- **md**: 10px
- **base**: 15px
- **lg**: 20px
- **xl**: 30px
- **xxl**: 40px
- **xxxl**: 60px

#### コンポーネント別スペーシング
```css
/* ボタン */
.button {
  padding: 15px 30px; /* Y軸 X軸 */
}

/* カード */
.card {
  padding: 20px;
}

.card-large {
  padding: 30px;
}

/* 入力フィールド */
.input {
  padding: 12px 16px;
}
```

### 🔘 角丸システム
- **none**: 0px
- **sm**: 5px（ボタン内要素）
- **md**: 10px（カード内要素）
- **lg**: 15px（サブカード）
- **xl**: 20px（メインカード）
- **xxl**: 30px（ボタン）
- **pill**: 9999px（完全な角丸）
- **circle**: 50%（円形）

### 🌟 シャドウシステム

#### 基本シャドウ
```css
/* 軽いシャドウ */
.shadow-sm {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 標準シャドウ */
.shadow-md {
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

/* 強いシャドウ */
.shadow-lg {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* 特大シャドウ */
.shadow-xl {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}
```

#### カラードシャドウ（Kawaii効果）
```css
/* ピンクシャドウ */
.shadow-pink {
  box-shadow: 0 5px 20px rgba(255, 107, 107, 0.3);
}

/* ホバーシャドウ */
.shadow-hover {
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.2);
}

/* フォーカスリング */
.focus-ring {
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}
```

## デザイントークン

### 📚 Tailwind CSS設定

#### カスタムカラー設定
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Kawaii Pink系
        kawaii: {
          pink: '#ff6b6b',
          'pink-light': '#ff8787',
          'pink-soft': '#ffe0e6',
          'pink-bg': '#fff5f5'
        },
        // 温度カラー
        temperature: {
          hot: '#ff6b6b',
          warm: '#ffd700',
          cool: '#87ceeb'
        },
        // セマンティックカラー
        semantic: {
          success: '#4caf50',
          warning: '#ff9800',
          error: '#ff4444',
          info: '#2196f3'
        }
      },
      // フォントファミリー
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Consolas', 'Courier New', 'monospace']
      },
      // スペーシング
      spacing: {
        '3': '3px',
        '5': '5px',
        '15': '15px'
      },
      // シャドウ
      boxShadow: {
        'kawaii': '0 5px 20px rgba(255, 107, 107, 0.3)',
        'hover': '0 5px 15px rgba(255, 107, 107, 0.2)',
        'focus': '0 0 0 3px rgba(255, 107, 107, 0.1)'
      }
    }
  }
}
```

### 🎨 CSS Custom Properties

```css
:root {
  /* Primary Colors */
  --color-kawaii-pink: #ff6b6b;
  --color-kawaii-pink-light: #ff8787;
  --color-kawaii-pink-soft: #ffe0e6;
  --color-kawaii-pink-bg: #fff5f5;
  
  /* Temperature Colors */
  --color-temperature-hot: #ff6b6b;
  --color-temperature-warm: #ffd700;
  --color-temperature-cool: #87ceeb;
  
  /* Text Colors */
  --color-text-primary: #333333;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;
  
  /* Background Colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f8f8;
  --color-bg-app: linear-gradient(135deg, #ffeef8 0%, #fff5f5 100%);
  
  /* Border Colors */
  --color-border-default: #e0e0e0;
  --color-border-light: #f0f0f0;
  --color-border-focus: #ff6b6b;
  
  /* Spacing Scale */
  --spacing-xxs: 3px;
  --spacing-xs: 5px;
  --spacing-sm: 8px;
  --spacing-md: 10px;
  --spacing-base: 15px;
  --spacing-lg: 20px;
  --spacing-xl: 30px;
  --spacing-xxl: 40px;
  
  /* Border Radius */
  --radius-sm: 5px;
  --radius-md: 10px;
  --radius-lg: 15px;
  --radius-xl: 20px;
  --radius-xxl: 30px;
  --radius-pill: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 5px 20px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.1);
  --shadow-kawaii: 0 5px 20px rgba(255, 107, 107, 0.3);
  --shadow-hover: 0 5px 15px rgba(255, 107, 107, 0.2);
  --shadow-focus: 0 0 0 3px rgba(255, 107, 107, 0.1);
}
```

## コンポーネントシステム

### 🎨 Kawaiiデザイン装飾

#### 特徴的な装飾要素
- **ハート型装飾**: 💕 アクセントとして使用
- **きらきらエフェクト**: ✨ 成功時の演出
- **浮遊アニメーション**: 🌸 カードやボタン
- **グラデーション背景**: 柔らかい色彩変化

#### エモーショナルフィードバック
- **成功時**: 花火エフェクト、祝福メッセージ
- **進展時**: 輝きエフェクト、バッジ表示
- **エラー時**: 優しい色使い、励ましアイコン
- **ローディング**: ハート型スピナー

### 📱 主要コンポーネント設計

#### 1. BottomTabBar（タブバー）

**デザインコンセプト**:
- シンプルで直感的なナビゲーション
- Kawaiiカラーでアクティブ状態を表現
- スムーズなアニメーション

**ビジュアル仕様**:
- 高さ: 56px (Android Material Design標準)
- 背景: 純白 + 軽いシャドウ
- アクティブ色: Kawaii Pink (#ff6b6b)
- 非アクティブ色: グレー (#999999)

**インタラクション**:
- タップ時: スケールアニメーション
- アクティブ時: 下部にピンクのアンダーライン

#### 2. TemperatureMeter（温度メーター）

**デザインコンセプト**:
- 直感的な温度表示
- 段階的な色変化で関心度を表現
- スムーズなアニメーション

**温度レベルと色**:
- **高温 (75-100%)**: #ff6b6b 🔥 + 炎アイコン
- **中温 (40-74%)**: #ffd700 🌡️ + 温度計アイコン
- **低温 (0-39%)**: #87ceeb ❄️ + 雪片アイコン

**ビジュアル詳細**:
- 高さ: 24px
- 角丸: 12px（完全な角丸）
- インジケーター: 白い円形 + アイコン

#### 3. ConversationInsight（会話インサイト）

**デザインコンセプト**:
- 情報を色で分類し直感的に伝達
- シンプルなアイコンで理解を助ける
- グラデーション登場アニメーション

**インサイトタイプと色**:
- **ポジティブ**: #e8f5e9 + 緑文字 + 笑顔アイコン
- **ニュートラル**: #fff3e0 + オレンジ文字 + 情報アイコン
- **警告**: #ffebee + 赤文字 + 注意アイコン

**レイアウト**:
- パディング: 8px 12px
- 角丸: 8px
- フォント: 12px
- アイコンサイズ: 16px

#### 4. RelationshipChart（関係性グラフ）

**デザインコンセプト**:
- 時系列で関係の進展を視覚化
- スムーズな曲線で優しい印象
- アニメーションでデータを魅力的に表現

**ビジュアル仕様**:
- サイズ: 350px × 100px（デフォルト）
- ラインカラー: Kawaii Pink (#ff6b6b)
- 背景グラデーション: ピンクの半透明
- ポイント: 白い縁取り + Kawaii Pink中心

**インタラクション**:
- ホバー時: ポイント拡大 + ツールチップ
- アニメーション: 1秒間の描画アニメーション

#### 5. ActionCard（アクションカード）

**デザインコンセプト**:
- 優先度を色で明確に区分
- 柔らかいグラデーション背景
- ホバー時の浮上がりエフェクト

**優先度スタイル**:
- **最優先**: #ff6b6b 背景 + 白文字
- **推奨**: #2196f3 背景 + 白文字  
- **注意**: #ff9800 背景 + 白文字

**レイアウト**:
- 背景: グラデーション(#fff5f5 → #fff)
- 角丸: 15px
- パディング: 15px
- ボーダー: 1px solid #ffe0e0

#### 6. ConnectionCard（相手カード）

**デザインコンセプト**:
- 清潔で情報の読みやすいレイアウト
- 状態を色で直感的に表現
- アクションボタンの適切な配置

**情報階層**:
1. ニックネーム（大きく太字）
2. ステージ情報（カラーバッジ）
3. 温度メーター
4. 詳細情報（年齢、最後のメッセージ）

**アクションエリア**:
- 編集ボタン（ペンアイコン）
- 削除ボタン（ゴミ箱アイコン）
- プロンプト生成ボタン（メインアクション）

## インタラクション設計

### 🎠 アニメーションシステム

#### 基本アニメーションパターン

**ハートビートアニメーション**:
```css
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.heartbeat {
  animation: heartbeat 1.5s ease-in-out infinite;
}
```

**フロートアニメーション**:
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.float {
  animation: float 3s ease-in-out infinite;
}
```

**スパークルエフェクト**:
```css
@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.7; transform: scale(0.9) rotate(180deg); }
}

.sparkle {
  animation: sparkle 2s ease-in-out infinite;
}
```

#### トランジション速度
- **高速**: 150ms（ホバー、フォーカス）
- **通常**: 300ms（展開、切り替え）
- **低速**: 500ms（ページ遷移、モーダル）
- **総合**: 1000ms（グラフアニメーション）

#### イージング関数
```css
/* 基本イージング */
.transition-default {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* スプリングアニメーション */
.spring-animation {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* スムーズアニメーション */
.smooth-animation {
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}
```

### 🎯 マイクロインタラクション

#### ホバーエフェクト
```css
/* カードホバー */
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
  transition: all 0.2s ease;
}

/* ボタンホバー */
.button:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-kawaii);
}

/* アイコンホバー */
.icon:hover {
  color: var(--color-kawaii-pink);
  transform: scale(1.1);
}
```

#### クリックフィードバック
```css
/* リップルエフェクト */
.ripple-effect {
  position: relative;
  overflow: hidden;
}

.ripple-effect::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 107, 107, 0.3);
  transform: scale(0);
  animation: ripple 0.6s linear;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* スケールフィードバック */
.button:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}
```

#### ローディング状態
```css
/* ハート型スピナー */
.heart-spinner {
  animation: heartbeat 1s ease-in-out infinite;
  color: var(--color-kawaii-pink);
}

/* スケルトンスクリーン */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 🎆 特別なエフェクト

#### 成功時の祝福アニメーション
```css
@keyframes celebrate {
  0% { 
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.05);
  }
  100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.celebration-modal {
  animation: celebrate 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

#### パーティクルエフェクト
```css
.particle {
  position: absolute;
  pointer-events: none;
  animation: particle-float 2s ease-out forwards;
}

@keyframes particle-float {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(0);
    opacity: 0;
  }
}
```

## 画面設計パターン

### 📱 モバイルファースト設計

#### ブレークポイント
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

#### モバイル最適化
- **タッチターゲット**: 最小44px
- **フォントサイズ**: 最小16px（ズーム防止）
- **余白**: 画面端から最小16px
- **スワイプジェスチャー**: カード操作に対応

### 🎨 主要画面デザイン

#### 1. ログイン画面

**デザインコンセプト**:
- 柔らかいグラデーション背景
- 中央に配置されたカードフォーム
- シンプルで親しみやすいUI

**ビジュアル要素**:
- 背景: グラデーション(#ffeef8 → #fff5f5)
- メインカード: 白背景 + 20px角丸 + シャドウ
- パディング: 40px 30px

**フォーム要素**:
- 入力フィールド: フォーカス時にKawaii Pinkボーダー
- プライマリボタン: ピンクグラデーション + 30px角丸
- ソーシャルボタン: 白背景 + グレーボーダー

**インタラクション**:
- ホバー時: ボーダーがKawaii Pinkに変化
- ローディング時: ハート型スピナー表示

#### 2. サインアップ画面

**デザインコンセプト**:
- ログイン画面と同様のスタイル
- 追加で価値提案セクション
- パスワード強度の視覚化

**特別要素**:
- パスワード強度インジケーター: カラーバー + テキスト
- 価値提案アイコン: 3つの主要機能をアイコンで表現
- 利用規約: シンプルなチェックボックス

#### 3. オンボーディング画面（５ステップ）

**デザインコンセプト**:
- ウィザード形式のステップバイステップ
- プログレスインジケーターで進行状況を表示
- 温かいアニメーションでステップ遷移

**ステップスタイル**:
- ヘッダー: プログレスバー + ステップ数表示
- コンテンツエリア: 中央揃え + 適切な余白
- フッター: 「戻る」と「次へ」ボタン

**アニメーション**:
- ステップ遷移: スライドアニメーション
- プログレスバー: スムーズな塗りアニメーション
- 完了時: 祝福アニメーション + パーティクル

#### 4. ダッシュボード画面

**デザインコンセプト**:
- 重要情報の優先表示
- カードベースのレイアウト
- 視覚的な統計表示
- アクションボタンの適切な配置

**レイアウト構成**:
1. **ヘッダーセクション**:
   - 恋愛可能性スコア: 72pxの大きな数値
   - ハートビートアニメーション背景
   - グラデーション背景とパーティクル

2. **アクションセクション**:
   - 「今日のおすすめ」タイトル
   - 優先度別アクションカード
   - スワイプで次のアクションを表示

3. **関係一覧セクション**:
   - 「進展中の関係」タイトル
   - グリッドレイアウトのコネクションカード
   - 空の状態: 励ましメッセージ + CTAボタン

#### 5. コネクション詳細画面

**デザインコンセプト**:
- データを美しく視覚化
- インサイトをわかりやすく整理
- アクションの明確な提示

**レイアウト構成**:
1. **ヘッダー**: 名前 + ステータス + 最終更新時刻
2. **温度セクション**: 大きなメーター + 数値 + アイコン
3. **グラフセクション**: 2週間の変化チャート
4. **インサイトセクション**: カラーコーディングされたタグ
5. **アクションセクション**: 推奨アクションリスト

#### 6. データインポートモーダル

**デザインコンセプト**:
- ウィザード形式のステップバイステップ
- リアルタイム検証とフィードバック
- 完了時の祝福アニメーション

**モーダルスタイル**:
- 背景オーバーレイ: セミ透明の黒
- モーダルカード: 白背景 + 20px角丸 + 大きなシャドウ
- アニメーション: スケールアニメーションで登場

**5段階フロー**:
1. **AI選択**: 3つのオプションカード
2. **プロンプトコピー**: コードブロック + コピーボタン
3. **JSON入力**: シンタックスハイライト + リアルタイム検証
4. **データ確認**: プレビューテーブル + 統計表示
5. **完了**: 成功アイコン + 祝福メッセージ + パーティクル

## レスポンシブ・アクセシビリティ

### 🎯 アクセシブルなUIデザイン

#### 視覚的アクセシビリティ
- **コントラスト比**: WCAG AA準拠（4.5:1以上）
- **フォーカス表示**: 明確で視認性の高いアウトライン
- **色覚多様性**: 色だけに依存しない情報伝達
- **文字サイズ**: 拡大に対応したレスポンシブタイポグラフィ

#### 操作性の配慮
- **タッチターゲット**: 最小44pxの操作領域
- **キーボード操作**: Tab順序の最適化
- **エラー表示**: 明確で理解しやすいビジュアル
- **ローディング状態**: 視覚的なフィードバック

#### ARIAラベルとセマンティックHTML
```html
<!-- ナビゲーション -->
<nav role="navigation" aria-label="メインナビゲーション">
  <button 
    aria-label="温度分析" 
    aria-current="page"
    className="tab-item active"
  >
    <Thermometer aria-hidden="true" />
    <span>温度分析</span>
  </button>
</nav>

<!-- フォーム -->
<form role="form" aria-labelledby="login-title">
  <h2 id="login-title">ログイン</h2>
  <input 
    type="email" 
    aria-label="メールアドレス" 
    aria-required="true"
    aria-describedby="email-error"
  />
  <div id="email-error" role="alert" aria-live="polite">
    <!-- エラーメッセージ -->
  </div>
</form>

<!-- ステータス更新 -->
<div role="status" aria-live="polite" aria-label="ローディング中">
  <span aria-hidden="true">💕</span>
  データを読み込み中...
</div>
```

### 📊 パフォーマンス指標

#### 目標値
- **初回表示**: < 3秒
- **インタラクション**: < 100ms
- **ページ遷移**: < 500ms
- **API応答**: < 1秒

#### 最適化手法
- **画像最適化**: WebP形式、遅延読み込み
- **コード分割**: 動的インポート
- **キャッシュ**: ブラウザ・CDNキャッシュ
- **プリフェッチ**: 次画面の先読み

## 技術実装仕様

### 💻 技術スタック

```json
{
  "frontend": {
    "framework": "React 18+ / Next.js 14",
    "styling": "Tailwind CSS 3.x + CSS Custom Properties",
    "state": "Zustand + React Context API",
    "animation": "Framer Motion + CSS Animations",
    "charts": "Chart.js / Recharts",
    "icons": "Lucide React + Custom SVG",
    "forms": "React Hook Form + Zod"
  },
  "mobile": {
    "framework": "React Native 0.72+",
    "navigation": "React Navigation v6",
    "ui": "React Native Elements + Custom Components",
    "haptics": "react-native-haptic-feedback"
  },
  "development": {
    "bundler": "Webpack 5 / Vite",
    "testing": "Jest + React Testing Library + Playwright",
    "linting": "ESLint + Prettier + Stylelint",
    "types": "TypeScript 5.0+"
  }
}
```

### 🎨 CSSアーキテクチャ

#### コンポーネントベースのスタイリング
```typescript
// components/Button/Button.module.css
.button {
  /* デザイントークンを使用 */
  padding: var(--spacing-base) var(--spacing-xl);
  border-radius: var(--radius-xxl);
  background: linear-gradient(135deg, var(--color-kawaii-pink) 0%, var(--color-kawaii-pink-light) 100%);
  color: var(--color-bg-primary);
  font-weight: var(--font-weight-bold);
  transition: all 0.3s var(--ease-default);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.button:active {
  transform: scale(0.98);
}

.button:focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

/* サイズバリエーション */
.button-small {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-sm);
}

.button-large {
  padding: var(--spacing-lg) var(--spacing-xxl);
  font-size: var(--font-size-lg);
}
```

#### ユーティリティクラス
```css
/* 汎用クラス */
.kawaii-gradient {
  background: linear-gradient(135deg, #ffeef8 0%, #fff5f5 100%);
}

.text-kawaii {
  color: var(--color-kawaii-pink);
}

.shadow-kawaii {
  box-shadow: var(--shadow-kawaii);
}

.heartbeat {
  animation: heartbeat 1.5s ease-in-out infinite;
}

.float {
  animation: float 3s ease-in-out infinite;
}

.sparkle {
  animation: sparkle 2s ease-in-out infinite;
}

/* レスポンシブユーティリティ */
@media (max-width: 640px) {
  .mobile-stack {
    flex-direction: column;
    gap: var(--spacing-base);
  }
  
  .mobile-full {
    width: 100%;
  }
  
  .mobile-text-center {
    text-align: center;
  }
}
```

## プラットフォーム対応

### 📱 React Native実装

#### コンポーネント対応表
```typescript
// プラットフォーム対応マッピング
const ComponentMap = {
  web: {
    Button: 'button',
    Card: 'div',
    Text: 'span',
    Input: 'input'
  },
  native: {
    Button: 'TouchableOpacity',
    Card: 'View',
    Text: 'Text',
    Input: 'TextInput'
  }
};

// 共通スタイル定義
const sharedStyles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: '#ff6b6b'
  },
  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 20
  }
});
```

#### プラットフォーム固有の実装
```typescript
// iOS
const TabBarIOS = () => {
  return (
    <BlurView style={styles.tabBar} blurType="light">
      {/* タブアイテム */}
    </BlurView>
  );
};

// Android
const TabBarAndroid = () => {
  return (
    <View style={[styles.tabBar, { elevation: 8 }]}>
      {/* タブアイテム */}
    </View>
  );
};

// Web
const TabBarWeb = () => {
  return (
    <nav className="fixed bottom-0 bg-white border-t">
      {/* タブアイテム */}
    </nav>
  );
};
```

### ⚡ パフォーマンス最適化

#### バンドル最適化
```typescript
// 動的インポート
const LazyDashboard = lazy(() => import('./Dashboard'));
const LazyAnalysis = lazy(() => import('./Analysis'));

// コードスプリッティング
const routes = [
  {
    path: '/dashboard',
    component: LazyDashboard
  },
  {
    path: '/analysis', 
    component: LazyAnalysis
  }
];
```

#### 画像最適化
```typescript
// Next.js Image最適化
import Image from 'next/image';

const OptimizedImage = ({ src, alt, ...props }) => (
  <Image
    src={src}
    alt={alt}
    loading="lazy"
    format="webp"
    quality={85}
    {...props}
  />
);
```

---

このUI/UXデザインシステム統合仕様書は、Miruプロジェクトの一貫した視覚体験とユーザビリティを提供するための包括的なガイドラインです。開発チーム全体でこの仕様書に従って実装を進めてください。
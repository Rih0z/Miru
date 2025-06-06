# Miru デザインシステム完全仕様書

## 1. カラーシステム

### プライマリカラー
```css
/* ピンク系 */
--pink-400: #EC4899;
--pink-500: #D946EF;
--pink-50: #FDF2F8;
--pink-100: #FCE7F3;
--pink-200: #FBCFE8;

/* パープル系 */
--purple-400: #A855F7;
--purple-500: #9333EA;
--purple-50: #FAF5FF;
--purple-100: #F3E8FF;
--purple-200: #E9D5FF;
--purple-600: #9333EA;
--purple-700: #7E22CE;

/* グラデーション */
--gradient-primary: linear-gradient(to right, #EC4899, #A855F7);
--gradient-bg: linear-gradient(to bottom right, #FDF2F8, #FAF5FF, #EFF6FF);
```

### セカンダリカラー
```css
/* イエロー系 */
--yellow-50: #FEFCE8;
--yellow-100: #FEF3C7;
--yellow-200: #FDE68A;
--yellow-500: #EAB308;
--yellow-600: #CA8A04;

/* グリーン系 */
--green-50: #F0FDF4;
--green-100: #DCFCE7;
--green-200: #BBF7D0;
--green-500: #22C55E;
--green-600: #16A34A;

/* ブルー系 */
--blue-50: #EFF6FF;
```

### ニュートラルカラー
```css
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-400: #9CA3AF;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--white: #FFFFFF;
--black-opacity-50: rgba(0, 0, 0, 0.5);
```

## 2. タイポグラフィ

### フォントファミリー
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif;
```

### フォントサイズ
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
```

### フォントウェイト
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 行間
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

## 3. スペーシングシステム

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
```

## 4. 角丸（Border Radius）

```css
--rounded-none: 0;
--rounded-sm: 0.125rem;    /* 2px */
--rounded: 0.25rem;        /* 4px */
--rounded-md: 0.375rem;    /* 6px */
--rounded-lg: 0.5rem;      /* 8px */
--rounded-xl: 0.75rem;     /* 12px */
--rounded-2xl: 1rem;       /* 16px */
--rounded-full: 9999px;
```

## 5. シャドウ

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## 6. アニメーション

### トランジション
```css
--transition-all: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-fast: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
```

### アニメーション定義
```css
/* パルス */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* スケール */
@keyframes scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 遅延クラス */
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
```

## 7. アイコン（Lucide React）

### 使用アイコン一覧
```javascript
import {
  Heart,        // ハート（ロゴ、お気に入り）
  Star,         // スター（評価、重要）
  Users,        // ユーザー（相手管理）
  Zap,          // 稲妻（アクション、生成）
  TrendingUp,   // 上昇トレンド（進捗、成長）
  Plus,         // プラス（追加）
  Calendar,     // カレンダー（日付、スケジュール）
  ChevronRight, // 右矢印（ナビゲーション）
  Sparkles,     // きらきら（AI、魔法）
  Clock,        // 時計（時間、経過）
  Target,       // ターゲット（目標）
  BarChart3,    // バーチャート（分析、統計）
  AlertCircle,  // アラート（注意、次のアクション）
  CheckCircle2, // チェック（完了）
  ArrowRight,   // 矢印（進む）
  FileText,     // ファイル（ドキュメント）
  Lightbulb,    // 電球（アイデア、プロンプト）
  X             // バツ（閉じる）
} from 'lucide-react';

/* アイコンサイズ */
--icon-xs: 14px;
--icon-sm: 16px;
--icon-base: 20px;
--icon-lg: 24px;
--icon-xl: 48px;
```

## 8. コンポーネントパターン

### ヘッダー
```jsx
<header className="bg-white shadow-sm border-b border-pink-100">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      {/* ロゴ部分 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
          <Heart className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Miru
        </h1>
      </div>
      {/* ナビゲーション */}
      <nav className="flex gap-6">
        {/* タブボタン */}
      </nav>
    </div>
  </div>
</header>
```

### 統計カード
```jsx
<div className="bg-gradient-to-br from-{color}-50 to-{color}-100 rounded-2xl p-6 border border-{color}-200">
  <div className="flex items-center justify-between mb-2">
    <Icon className="text-{color}-500" size={24} />
    <span className="text-2xl font-bold text-{color}-600">{value}</span>
  </div>
  <p className="text-gray-700 font-medium">{label}</p>
</div>
```

### プライマリボタン
```jsx
<button className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2">
  <Icon size={16} />
  {text}
</button>
```

### 相手カード（プロフィール円）
```jsx
<div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
  {name[0]}
</div>
```

### プログレスバー
```jsx
<div className="relative">
  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500"
      style={{ width: `${progress}%` }}
    />
  </div>
  {/* 目盛り */}
  <div className="absolute top-0 left-0 w-full h-3 flex justify-between px-1">
    {[20, 40, 60, 80].map(mark => (
      <div key={mark} className="w-0.5 h-full bg-white" style={{ marginLeft: `${mark}%` }} />
    ))}
  </div>
</div>
```

### アクションアラート
```jsx
<div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
  <div className="flex items-center gap-3">
    <AlertCircle className="text-purple-500" size={20} />
    <div>
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
  <ChevronRight className="text-purple-600" size={20} />
</div>
```

### モーダル
```jsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
    {/* ヘッダー */}
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <button className="text-gray-400 hover:text-gray-600">
        <X size={24} />
      </button>
    </div>
    {/* コンテンツ */}
  </div>
</div>
```

### タブボタン
```jsx
<button className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
  isActive
    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
}`}>
  {label}
</button>
```

### ステージインジケーター
```jsx
<div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
  isPast ? 'bg-green-500' : 
  isCurrent ? 'bg-gradient-to-r from-pink-400 to-purple-400 animate-pulse' : 
  'bg-gray-200'
}`}>
  {isPast ? (
    <CheckCircle2 className="text-white" size={20} />
  ) : (
    <div className={`w-3 h-3 rounded-full ${isCurrent ? 'bg-white' : 'bg-gray-400'}`} />
  )}
</div>
```

## 9. レイアウトグリッド

### コンテナ
```css
--container-max-width: 1280px; /* max-w-7xl */
--container-padding-x: 1rem;    /* px-4 */
--container-padding-x-sm: 1.5rem; /* sm:px-6 */
--container-padding-x-lg: 2rem;   /* lg:px-8 */
```

### グリッドシステム
```css
/* メイングリッド */
grid-cols-1 lg:grid-cols-3 gap-6

/* カードグリッド */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

/* 統計グリッド */
grid-cols-1 md:grid-cols-4 gap-4
```

## 10. スパークルエフェクト

### 位置とタイミング
```jsx
{showSparkle && (
  <div className="fixed inset-0 pointer-events-none">
    <div className="absolute top-20 left-10 text-2xl animate-pulse">✨</div>
    <div className="absolute top-40 right-20 text-xl animate-pulse delay-100">💕</div>
    <div className="absolute bottom-20 left-1/2 text-2xl animate-pulse delay-200">🌸</div>
  </div>
)}
```

### 表示間隔
```javascript
setInterval(() => {
  setShowSparkle(true);
  setTimeout(() => setShowSparkle(false), 1000);
}, 3000);
```

## 11. レスポンシブブレークポイント

```css
/* Tailwind CSS デフォルト */
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;
```

## 12. Z-index階層

```css
--z-header: 10;
--z-modal-overlay: 50;
--z-modal: 50;
--z-sparkle: 0;
```

## 13. 特殊効果

### ホバー効果
```css
/* カード */
hover:transform hover:-translate-y-1 hover:shadow-xl

/* ボタン */
hover:shadow-lg hover:scale-105

/* テキストリンク */
hover:text-{color}-700
```

### フォーカス効果
```css
focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
```

## 14. 命名規則

### クラス名パターン
- コンテナ: `{component}-container`
- ヘッダー: `{component}-header`
- ボディ: `{component}-body`
- アイテム: `{component}-item`
- アクション: `{component}-action`

### 状態クラス
- アクティブ: `is-active`
- 無効: `is-disabled`
- ローディング: `is-loading`
- エラー: `has-error`

## 実装時の注意事項

1. **カラー使用規則**
   - グラデーションは必ず `from-pink-400 to-purple-400` を使用
   - 背景色は `from-{color}-50 to-{color}-100` のグラデーション
   - ボーダーは対応する `-200` カラーを使用

2. **スペーシング規則**
   - コンポーネント間: `space-y-6`
   - カード内の要素間: `space-y-3` または `gap-3`
   - インライン要素間: `gap-2`

3. **アニメーション規則**
   - すべてのインタラクティブ要素に `transition-all duration-300` を適用
   - ホバー時のスケール変化は `hover:scale-105`
   - 重要な要素には `animate-pulse` を使用

4. **テキスト規則**
   - 見出し: `font-bold text-gray-800`
   - 本文: `text-gray-700` または `text-gray-600`
   - 小さいテキスト: `text-sm text-gray-600`

この仕様書に従って実装することで、完全に同じデザインを再現できます。
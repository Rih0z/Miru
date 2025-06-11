# Miru UI/UX 完全設計ガイド
> 恋愛オーケストレーションAIシステムの包括的デザイン・エクスペリエンス仕様書

## 目次
1. [プロジェクト概要](#プロジェクト概要)
2. [デザインコンセプト](#デザインコンセプト)
3. [UX原則](#ux原則)
4. [技術スタック](#技術スタック)
5. [Kawaiiデザインシステム](#kawaiiデザインシステム)
6. [データ構造](#データ構造)
7. [ユーザージャーニー](#ユーザージャーニー)
8. [画面フロー](#画面フロー)
9. [コンポーネント仕様](#コンポーネント仕様)
10. [画面実装仕様](#画面実装仕様)
11. [アニメーション詳細](#アニメーション詳細)
12. [エラー・空状態仕様](#エラー・空状態仕様)
13. [AI統合プロンプト](#ai統合プロンプト)
14. [アクセシビリティ](#アクセシビリティ)
15. [パフォーマンス指標](#パフォーマンス指標)
16. [実装順序](#実装順序)
17. [検証チェックリスト](#検証チェックリスト)

---

## プロジェクト概要

### Miruについて
「付き合えるかもしれない」希望を可視化する恋愛オーケストレーションAIシステム。
かわいくて温かい恋愛体験をKawaiiデザインで提供し、ユーザーの恋愛成功をサポートします。

### ミッション
- 恋愛における不安を軽減し、ポジティブな体験を提供
- AI分析とアドバイスによる恋愛成功のサポート
- 視覚的に魅力的で直感的なユーザー体験を提供

---

## デザインコンセプト

### ビジュアルコンセプト
1. **Kawaii デザインシステム**
   - 丸みを帯びた柔らかいコンポーネント
   - パステルカラースキーム
   - スムーズなアニメーション
   - 親しみやすい表現

2. **希望と励ましの表現**
   - ポジティブなフィードバック
   - 成功の可視化
   - 温かい表現
   - 科学的信頼性

3. **シンプルで直感的**
   - 明確で一貫したナビゲーション
   - 最小クリックでの操作
   - ビジュアルガイドベースのフロー設計
   - モバイルファーストレイアウト

---

## UX原則

### 1. 希望と励ましの提供
- 不安を軽減するポジティブな言葉遣い
- 成功を祝うフィードバック
- 達成感のための進捗の可視化
- 挫折時の励ましメッセージ

### 2. シンプルで直感的
- 分かりやすく理解しやすいナビゲーション
- 目標達成への最小ステップ
- 混乱を防ぐガイド付きフロー設計
- 技術用語を避けた親しみやすい表現

### 3. パーソナライズされた体験
- ユーザーの状況に基づく推奨アクション
- 学習機能による最適化
- パーソナライズされたメッセージ
- 成長に適応した機能提案

### 4. エモーショナルデザイン
**ポジティブな言葉遣いの例：**
- "エラーが発生しました" → "ちょっとした問題が発生しました"
- "認証に失敗しました" → "もう一度お試しください"
- "データがありません" → "新しい恋愛の旅を始めましょう"

---

## 技術スタック

### フロントエンド
```json
{
  "framework": "Next.js 14.2.29",
  "runtime": "React 18",
  "language": "TypeScript 5.0+",
  "styling": "Tailwind CSS 3.4.0 + CSS Custom Properties",
  "state": "Zustand 4.4.7",
  "icons": "Lucide React + React Icons",
  "animation": "CSS Animations + Framer Motion",
  "i18n": "next-intl 4.1.0"
}
```

### バックエンド＆インフラ
```json
{
  "database": "Supabase PostgreSQL",
  "deployment": "Cloudflare Pages",
  "cdn": "Cloudflare",
  "testing": "Jest + React Testing Library + Playwright"
}
```

---

## Kawaiiデザインシステム

### カラーパレット

#### プライマリカラー（Kawaiiテーマ）
```css
/* かわいいピンク系 */
--kawaii-pink: #FFB6C1;
--kawaii-pink-light: #FFCCCB;
--kawaii-pink-dark: #FF69B4;
--pink-400: #EC4899;
--pink-500: #D946EF;
--pink-50: #FDF2F8;
--pink-100: #FCE7F3;
--pink-200: #FBCFE8;

/* かわいいパープル系 */
--kawaii-purple: #DDA0DD;
--kawaii-lavender: #E6E6FA;
--purple-400: #A855F7;
--purple-500: #9333EA;
--purple-50: #FAF5FF;
--purple-100: #F3E8FF;
--purple-200: #E9D5FF;

/* Kawaiiグラデーション */
--kawaii-gradient: linear-gradient(135deg, #FFB6C1, #DDA0DD, #87CEEB);
--gradient-primary: linear-gradient(to right, #EC4899, #A855F7);
--gradient-bg: linear-gradient(to bottom right, #FDF2F8, #FAF5FF, #EFF6FF);
```

#### 温度カラー（関係性表現）
```css
--kawaii-hot: #FF69B4;      /* 高温 (75-100%) */
--kawaii-warm: #FFB6C1;     /* 中温 (40-74%) */
--kawaii-cool: #87CEEB;     /* 低温 (0-39%) */
```

#### Kawaiiアクセントカラー
```css
--kawaii-cream: #FFF8DC;
--kawaii-soft: #F5F5DC;
--kawaii-glow: #FFE4E1;
--kawaii-mint: #F0FFF0;
--kawaii-sky: #E0F6FF;
--kawaii-peach: #FFCCCB;
```

### タイポグラフィ
```css
/* フォントファミリー */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif;

/* フォントサイズ */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### スペーシング
```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
```

### 角丸＆シャドウ
```css
/* 角丸 */
--radius-sm: 0.25rem;    /* 4px */
--radius-base: 0.5rem;   /* 8px */
--radius-lg: 1rem;       /* 16px */
--radius-xl: 1.5rem;     /* 24px */
--radius-full: 9999px;   /* 完全な円 */

/* Kawaiiシャドウ */
--shadow-kawaii: 0 4px 8px 0 rgba(255, 182, 193, 0.2);
--shadow-glow: 0 0 20px rgba(255, 182, 193, 0.3);
--shadow-magical: 0 8px 25px rgba(221, 160, 221, 0.4);
```

---

## データ構造

### TypeScript型定義
```typescript
export interface Connection {
  id: string;
  user_id: string;
  nickname: string;
  platform: string;
  current_stage: ConnectionStage;
  basic_info: BasicInfo;
  communication: CommunicationInfo;
  user_feelings: UserFeelings;
  created_at: string;
  updated_at: string;
}

export type ConnectionStage = 
  | 'just_matched'
  | 'messaging'
  | 'line_exchanged'
  | 'before_date'
  | 'after_date'
  | 'dating'
  | 'stagnant'
  | 'ended';

export interface DashboardData {
  connections: Connection[];
  totalConnections: number;
  activeConnections: number;
  averageScore: number;
  recommendedActions: RecommendedAction[];
  bestConnection: Connection | null;
}
```

---

## コンポーネント仕様

### React Icons使用ガイドライン
すべての視覚的アイコンは、アクセシビリティと一貫性向上のため、絵文字の代わりにReact Iconsを使用する：

```typescript
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Star, 
  Plus, 
  Sparkles,
  Home,
  Thermometer,
  Download,
  Bot,
  Settings
} from 'lucide-react';

// 代替アイコンライブラリ
import { 
  FaHeart, 
  FaUsers, 
  FaChartLine 
} from 'react-icons/fa';
import { 
  AiOutlineHeart, 
  AiOutlineUser 
} from 'react-icons/ai';
```

### ボトムナビゲーションタブ
```typescript
const tabs = [
  { id: 'dashboard', icon: Home, label: 'ホーム' },
  { id: 'temperature', icon: Thermometer, label: '温度' },
  { id: 'import', icon: Download, label: 'インポート' },
  { id: 'ai', icon: Bot, label: 'AI分析' },
  { id: 'settings', icon: Settings, label: '設定' }
];
```

### コネクションカードコンポーネント（Kawaii版）
```typescript
const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onEdit,
  onDelete,
  onGeneratePrompt
}) => {
  const score = calculateRelationshipScore(connection);
  const progressWidth = getStageProgress(connection.current_stage);
  
  return (
    <div className="kawaii-card hover-bounce group animate-bounceIn relative overflow-hidden">
      {/* Header with icon */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="min-w-0 flex-1 mr-3">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-kawaii-pink animate-heartbeat" />
            <h3 className="text-2xl font-bold kawaii-gradient-text truncate animate-float">
              {connection.nickname}
            </h3>
          </div>
        </div>
      </div>
      
      {/* Kawaii progress bar */}
      <div className="mb-6">
        <div className="w-full bg-kawaii-cream rounded-full h-4 shadow-kawaii relative overflow-hidden">
          <div 
            className="kawaii-gradient h-4 rounded-full transition-all duration-700 animate-kawaii-pulse"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
};
```

### ボタンコンポーネント（Kawaii版）
```typescript
export interface ButtonProps {
  variant?: 'kawaii' | 'magical' | 'soft' | 'romantic';
  size?: 'sm' | 'base' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'kawaii',
  size = 'base',
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  iconPosition = 'left'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-${variant} btn-${size} ${className}`}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4" />
      )}
    </button>
  );
};
```

---

## 画面実装仕様

### ダッシュボード画面

#### 空状態画面（Kawaii版）
```typescript
const EmptyDashboard = () => (
  <div className="min-h-screen kawaii-gradient flex items-center justify-center p-4">
    <div className="kawaii-card max-w-2xl mx-auto text-center py-16 animate-bounceIn relative overflow-hidden">
      {/* メインアイコン */}
      <div className="w-32 h-32 mx-auto mb-8 rounded-full kawaii-soft flex items-center justify-center animate-kawaii-pulse relative">
        <Heart className="w-16 h-16 text-kawaii-pink animate-heartbeat" />
      </div>
      
      <h3 className="text-4xl font-bold kawaii-gradient-text mb-6 animate-float">
        恋愛の旅を始めましょう
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="kawaii"
          size="lg"
          icon={Plus}
          className="animate-kawaii-pulse"
        >
          手動で追加
        </Button>
        <Button
          variant="magical"
          size="lg"
          icon={Download}
          className="animate-kawaii-pulse"
        >
          AI一括インポート
        </Button>
      </div>
    </div>
  </div>
);
```

#### メインダッシュボード（Kawaii版）
```typescript
const Dashboard = () => (
  <div className="space-y-8 py-8">
    {/* ヘッダー */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold kawaii-gradient-text animate-float">
          恋愛ダッシュボード
        </h1>
        <p className="text-gray-700 text-lg font-medium">
          AIによる恋愛インサイト
        </p>
      </div>
      
      <div className="flex gap-3">
        <Button
          variant="kawaii"
          onClick={handleAddConnection}
          icon={Plus}
        >
          <span className="hidden sm:inline">手動で追加</span>
        </Button>
        <Button
          variant="magical"
          onClick={() => setShowDataImportModal(true)}
          icon={Download}
        >
          <span className="hidden sm:inline">AIインポート</span>
        </Button>
      </div>
    </div>

    {/* 統計サマリー */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card variant="kawaii" hover className="animate-bounceIn">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-3xl kawaii-soft flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
            <Users className="w-8 h-8 text-kawaii-pink" />
          </div>
          <div className="ml-5 flex-1">
            <p className="text-sm font-semibold kawaii-gradient-text">コネクション</p>
            <div className="flex items-baseline">
              <p className="text-4xl font-extrabold kawaii-glow">
                {dashboardData.totalConnections}
              </p>
              <p className="ml-2 text-sm text-kawaii-pink font-medium">人</p>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="magical" hover className="animate-bounceIn">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-3xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
          <div className="ml-5 flex-1">
            <p className="text-sm font-semibold kawaii-gradient-text">アクティブ</p>
            <div className="flex items-baseline">
              <p className="text-4xl font-extrabold kawaii-glow">
                {dashboardData.activeConnections}
              </p>
              <p className="ml-2 text-sm text-purple-400 font-medium">関係</p>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="soft" hover className="animate-bounceIn">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-3xl bg-yellow-100 flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="ml-5 flex-1">
            <p className="text-sm font-semibold kawaii-gradient-text">平均スコア</p>
            <div className="flex items-baseline">
              <p className="text-4xl font-extrabold kawaii-glow">
                {dashboardData.averageScore || 0}
              </p>
              <p className="ml-2 text-sm text-yellow-400 font-medium">ポイント</p>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="romantic" hover className="animate-bounceIn">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-3xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
            <Heart className="w-8 h-8 text-green-500" />
          </div>
          <div className="ml-5 flex-1">
            <p className="text-sm font-semibold kawaii-gradient-text">ベストマッチ</p>
            <div className="flex items-baseline">
              <p className="text-4xl font-extrabold kawaii-glow">
                {dashboardData.bestConnection ? '見つかりました' : 'なし'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
);
```

---

## アニメーション詳細

### Kawaiiアニメーション定義
```css
/* かわいい入場アニメーション */
@keyframes bounceIn {
  0% {
    transform: scale(0.3) translateY(-50px);
    opacity: 0;
  }
  50% {
    transform: scale(1.05) translateY(-10px);
    opacity: 0.8;
  }
  70% {
    transform: scale(0.98) translateY(0);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* ふわふわ浮遊 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

/* ハートビート */
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* かわいいパルス */
@keyframes kawaii-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 20px rgba(255, 182, 193, 0.3);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(255, 182, 193, 0.6);
  }
}

/* ホバー弾む */
@keyframes hover-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
```

### Kawaiiアニメーション使用ガイドライン
```css
/* 基本使用法 */
.animate-bounceIn { animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-heartbeat { animation: heartbeat 1.5s ease-in-out infinite; }
.animate-kawaii-pulse { animation: kawaii-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

/* ホバーエフェクト */
.hover-bounce {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.hover-bounce:hover {
  animation: hover-bounce 0.6s ease-in-out;
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(255, 182, 193, 0.4);
}

/* Kawaiiスタイルクラス */
.kawaii-card {
  background: linear-gradient(135deg, #FFF8DC, #F0FFF0);
  border-radius: 24px;
  box-shadow: 0 8px 25px rgba(255, 182, 193, 0.2);
}

.kawaii-gradient-text {
  background: linear-gradient(135deg, #FF69B4, #DDA0DD);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.kawaii-glow {
  text-shadow: 0 0 10px rgba(255, 182, 193, 0.5);
}
```

---

## エラー・空状態仕様

### エラー状態コンポーネント
```typescript
const ErrorState: React.FC<ErrorStateProps> = ({
  title = "ちょっとした問題が発生しました",
  message,
  onRetry,
  type = 'error'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return AlertCircle;
    }
  };

  const Icon = getIcon();

  return (
    <div className="kawaii-card max-w-md mx-auto text-center py-12 animate-bounceIn">
      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-red-50 flex items-center justify-center">
        <Icon className="w-10 h-10 text-red-500" />
      </div>
      
      <h3 className="text-2xl font-bold kawaii-gradient-text mb-4">{title}</h3>
      
      {message && (
        <p className="text-red-600 mb-8 leading-relaxed font-medium">{message}</p>
      )}
      
      {onRetry && (
        <Button
          variant="kawaii"
          size="lg"
          onClick={onRetry}
          icon={RefreshCw}
        >
          もう一度試す
        </Button>
      )}
    </div>
  );
};
```

### 読み込み状態コンポーネント
```typescript
const LoadingState: React.FC<LoadingStateProps> = ({
  message = "恋愛コネクションを分析中...",
  submessage = "あなたの理想のマッチを見つけています"
}) => (
  <div className="min-h-screen kawaii-gradient flex items-center justify-center">
    <div className="text-center space-y-6 animate-bounceIn">
      <div className="relative">
        <div className="mx-auto w-20 h-20 rounded-full border-4 border-kawaii-pink border-t-kawaii-pink-dark animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className="w-8 h-8 text-kawaii-pink animate-heartbeat" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xl font-bold kawaii-gradient-text animate-kawaii-pulse">
          {message}
        </p>
        <p className="text-kawaii-pink font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          {submessage}
          <Sparkles className="w-4 h-4" />
        </p>
      </div>
    </div>
  </div>
);
```

---

## 実装順序

### フェーズ1: 基盤セットアップ（1-2週間）
1. **プロジェクト初期設定**
   - Next.js 14 + TypeScript環境
   - Tailwind CSS + カスタムCSS設定
   - ESLint + Prettier設定

2. **Kawaiiデザインシステム実装**
   - CSS変数定義
   - アニメーション定義
   - ユーティリティクラス作成

3. **基本型定義**
   - TypeScript型定義
   - 基本インターフェース定義

### フェーズ2: コアコンポーネント（2-3週間）
1. **レイアウトコンポーネント**
   - RootLayout
   - BottomBar
   - Container

2. **基本UIコンポーネント**
   - Buttonバリアント
   - Cardバリアント
   - Inputバリアント
   - Modalベース

### フェーズ3: メイン機能（3-4週間）
1. **ダッシュボード**
   - Dashboard.tsx
   - 統計サマリー
   - 空・エラー状態

2. **コネクション管理**
   - ConnectionCard.tsx
   - ConnectionForm.tsx
   - CRUD操作

3. **データインポート**
   - DataImportModal.tsx
   - 5ステップウィザード
   - AI統合プロンプト

---

## 検証チェックリスト

### デザイン & UI
- [ ] Kawaiiデザインコンセプトの一貫性
- [ ] 絵文字の代わりにReact Iconsの適切な使用
- [ ] レスポンシブデザイン（モバイル、タブレット、デスクトップ）
- [ ] 一貫したカラーパレットの使用
- [ ] 適切なタイポグラフィ階層
- [ ] スムーズなアニメーションとトランジション

### 機能性
- [ ] すべてのナビゲーションフローが正しく動作
- [ ] フォームバリデーションとエラーハンドリング
- [ ] すべての非同期操作の読み込み状態
- [ ] すべてのデータコレクションの空状態
- [ ] 適切なエラー復旧メカニズム

### パフォーマンス
- [ ] ページ読み込み時間 < 3秒
- [ ] 60fpsのスムーズなアニメーション
- [ ] 最適化された画像とアセット
- [ ] 適切なコード分割
- [ ] 効率的なバンドルサイズ

### アクセシビリティ
- [ ] 適切なARIAラベル
- [ ] キーボードナビゲーションサポート
- [ ] スクリーンリーダー互換性
- [ ] カラーコントラスト準拠（WCAG AA）
- [ ] フォーカス管理

### テスト
- [ ] すべてのコンポーネントの単体テスト
- [ ] メインフローの統合テスト
- [ ] クリティカルパスのE2Eテスト
- [ ] クロスブラウザ互換性
- [ ] モバイルデバイステスト

---

## 実装のための注意事項

### React Icons移行
- すべての絵文字使用を適切なReact Iconsに置き換える
- 一貫したアイコンサイズの使用（インライン: w-4 h-4、ボタン: w-5 h-5、表示: w-8 h-8）
- アイコン選択時のセマンティック意味の維持
- アイコンの適切なアクセシビリティラベルの確保

### Kawaiiデザインシステム使用
- 確立されたカラー変数に従う
- 一貫したスペーシングとタイポグラフィの使用
- アニメーションの思慮深い適用（過度ではなく）
- 温かみを保ちながらかわいいプロフェッショナルな外観の維持

### パフォーマンス考慮事項
- 適切な場所でのコンポーネント遅延読み込み
- バンドルサイズ削減のためのアイコンインポート最適化
- 動的テーマのためのCSS変数使用
- 適切な読み込み・エラー状態の実装
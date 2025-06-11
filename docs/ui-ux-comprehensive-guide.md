# Miru UI/UX 完全設計ガイド v4.0
> 2024-2025年モダンUIトレンドに基づく恋愛オーケストレーションAIシステム設計仕様書

## 目次
1. [プロジェクト概要](#プロジェクト概要)
2. [2024-2025年モダンデザインコンセプト](#2024-2025年モダンデザインコンセプト)
3. [実証されたUIトレンド採用](#実証されたuiトレンド採用)
4. [技術スタック](#技術スタック)
5. [Neobrutalism + Minimalism システム](#neobrutalism--minimalism-システム)
6. [Glassmorphism 統合](#glassmorphism-統合)
7. [AI Aesthetic デザイン](#ai-aesthetic-デザイン)
8. [マイクロインタラクション](#マイクロインタラクション)
9. [ダークモードファースト](#ダークモードファースト)
10. [ボールドタイポグラフィ](#ボールドタイポグラフィ)
11. [Spatial Design & 3D要素](#spatial-design--3d要素)
12. [コンポーネント仕様](#コンポーネント仕様)
13. [実装ガイドライン](#実装ガイドライン)

---

## プロジェクト概要

### Miru 2025ビジョン
「付き合えるかもしれない」希望を最先端のAI技術と2024-2025年の実証されたモダンUIトレンドで可視化する、次世代恋愛オーケストレーションシステム。

### 新デザインミッション
- **Evidence-Based Design**: 実証されたUIトレンドのみを採用
- **AI-First Aesthetic**: AIらしいクリーンで洗練されたデザイン
- **Progressive Enhancement**: 段階的な機能向上とUX最適化
- **Accessibility-First**: アクセシビリティを最優先とした設計

---

## 2024-2025年モダンデザインコンセプト

### 1. Neobrutalism + Minimalism融合
**実証データ**: Neobrutalism が2024年のトップトレンドとして確認済み

```scss
// Core Philosophy
.design-system {
  approach: "Raw authenticity meets purposeful simplicity";
  contrast: "High contrast for accessibility";
  typography: "Bold, unconventional, attention-grabbing";
  layout: "Asymmetric yet functional";
  colors: "Vibrant accents on neutral bases";
}
```

### 2. Dark Mode First
**実証データ**: 82.7%のユーザーがダークモードを使用（Medium調査）

- **Primary Interface**: ダークテーマをデフォルト
- **Light Mode**: 明示的な切り替えオプション
- **Eye Strain Reduction**: 長時間使用での疲労軽減
- **Battery Efficiency**: エネルギー消費量削減

### 3. AI Aesthetic Integration
**実証データ**: AI統合デザインが2024-2025年の主要トレンド

- **Clean, Technical Lines**: AIらしいクリーンな印象
- **Data-Driven Visuals**: 数値やグラフの美しい表現
- **Progressive Disclosure**: 情報の段階的開示
- **Predictive UI Elements**: ユーザー行動予測に基づくインターフェース

---

## 実証されたUIトレンド採用

### ✅ 採用確定トレンド（証拠あり）

#### 1. **Glassmorphism** 
- **証拠**: Apple, Microsoft採用、2024年継続成長
- **実装**: カードオーバーレイ、モーダル、ナビゲーション要素
- **技術**: `backdrop-filter: blur()`, `rgba()` transparency

#### 2. **Bold Typography**
- **証拠**: 2024年の主要トレンド「Big, Bold, Capitalized」
- **実装**: 大型見出し、階層的テキスト、アテンション獲得
- **技術**: Variable fonts、動的サイズ調整

#### 3. **Micro-interactions**
- **証拠**: ユーザーエンゲージメント向上の実証データあり
- **実装**: ホバー状態、トランジション、フィードバック
- **目的**: 直感的操作とユーザー満足度向上

#### 4. **3D & Interactive Elements**
- **証拠**: Apple Vision Pro影響でSpatial Design急成長
- **実装**: 深度のあるカード、インタラクティブ要素
- **技術**: CSS 3D transforms、WebGL

#### 5. **Minimalist Accessibility**
- **証拠**: アクセシビリティファースト設計の標準化
- **実装**: クリーンレイアウト、高コントラスト、明確な階層

### ❌ 非採用トレンド（証拠不十分）

#### 1. **過度なKawaii要素**
- **理由**: 2022年ピーク、現在は減少傾向
- **代替**: モダンなマイクロインタラクションで親しみやすさ表現

#### 2. **Heavy Gradients**
- **理由**: Web 2.0的印象、現在は控えめなアクセント使用が主流
- **代替**: 単色背景にポイントグラデーション

---

## Neobrutalism + Minimalism システム

### カラーシステム

```scss
// Dark Mode Primary Palette
:root[data-theme="dark"] {
  // Base Colors
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #2a2a2a;
  
  // Text Colors
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-accent: #ff6b6b;
  
  // Neobrutalism Accents
  --accent-primary: #ff6b6b;    // Vibrant red
  --accent-secondary: #4ecdc4;  // Turquoise
  --accent-warning: #ffe66d;    // Bright yellow
  --accent-success: #51cf66;   // Bright green
  
  // Glassmorphism
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: blur(20px);
}

// Light Mode Alternative
:root[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-accent: #e63946;
  
  // Stronger contrasts for light mode
  --accent-primary: #d63384;
  --accent-secondary: #20c997;
  --accent-warning: #ffc107;
  --accent-success: #198754;
}
```

### タイポグラフィシステム

```scss
// Bold Typography Implementation
.typography-system {
  // Primary Headers - Brutalist Style
  --font-display: 'Inter Variable', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  
  // Size Scale (Major Third - 1.25)
  --text-xs: 0.75rem;      // 12px
  --text-sm: 0.875rem;     // 14px
  --text-base: 1rem;       // 16px
  --text-lg: 1.25rem;      // 20px
  --text-xl: 1.5rem;       // 24px
  --text-2xl: 2rem;        // 32px
  --text-3xl: 2.5rem;      // 40px
  --text-4xl: 3.5rem;      // 56px - Hero sizes
  
  // Weight Scale
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-black: 900;       // For brutalist headers
}

// Hero Typography
.hero-text {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-black);
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--text-primary);
}

// Accent Typography
.accent-text {
  font-weight: var(--font-bold);
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

---

## Glassmorphism 統合

### Core Implementation

```scss
// Glassmorphism Base Classes
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.glass-navigation {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-modal {
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Component Applications

1. **Navigation Bar**: グラスモーフィズムで背景に溶け込む
2. **Modal Overlays**: 深い奥行きと透明感
3. **Card Components**: データカードに軽やかな透明感
4. **Floating Actions**: アクションボタンの視覚的分離

---

## AI Aesthetic デザイン

### Design Principles

```scss
// AI-Inspired Design Elements
.ai-container {
  // Clean, technical lines
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px; // Less rounded than kawaii
  
  // Data visualization aesthetics
  background: linear-gradient(
    135deg, 
    rgba(255, 107, 107, 0.1) 0%, 
    rgba(78, 205, 196, 0.1) 100%
  );
  
  // Technical grid overlay
  background-image: 
    radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0);
  background-size: 20px 20px;
}

// Progress indicators with AI feel
.ai-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  
  &::before {
    content: '';
    display: block;
    height: 100%;
    background: linear-gradient(90deg, 
      var(--accent-primary) 0%, 
      var(--accent-secondary) 100%
    );
    transform: translateX(-100%);
    animation: ai-progress 2s ease-in-out infinite;
  }
}

@keyframes ai-progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}
```

### AI-Driven UI Elements

1. **Predictive Input Fields**: ユーザー入力予測機能
2. **Smart Suggestions**: AIによる動的提案表示
3. **Data Visualization**: スコアとメトリクスの美しい可視化
4. **Progressive Loading**: AI処理状況の直感的表示

---

## マイクロインタラクション

### Core Micro-interactions

```scss
// Purposeful Hover States
.interactive-element {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    transition-duration: 0.1s;
  }
}

// Button Interactions
.btn-primary {
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
}

// Loading States
.loading-indicator {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--accent-primary);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Feedback Systems

1. **Instant Visual Feedback**: ボタンクリック、フォーム送信
2. **Progress Indication**: 長時間処理の進捗表示
3. **Success/Error States**: 明確な結果フィードバック
4. **Contextual Hints**: ユーザーガイダンス機能

---

## ダークモードファースト

### Implementation Strategy

```scss
// Base dark theme (default)
:root {
  color-scheme: dark;
  
  // Core system colors
  --system-bg: #0a0a0a;
  --system-surface: #1a1a1a;
  --system-border: rgba(255, 255, 255, 0.1);
  
  // Content colors
  --content-primary: #ffffff;
  --content-secondary: #a0a0a0;
  --content-disabled: #404040;
  
  // Interactive colors
  --interactive-primary: #ff6b6b;
  --interactive-hover: #ff5252;
  --interactive-active: #ff3838;
}

// Light theme override
[data-theme="light"] {
  color-scheme: light;
  
  --system-bg: #ffffff;
  --system-surface: #f8f9fa;
  --system-border: rgba(0, 0, 0, 0.1);
  
  --content-primary: #212529;
  --content-secondary: #6c757d;
  --content-disabled: #adb5bd;
  
  --interactive-primary: #e63946;
  --interactive-hover: #d62d20;
  --interactive-active: #b02a37;
}
```

### Benefits Implementation

1. **Eye Strain Reduction**: 長時間使用での疲労軽減
2. **Battery Efficiency**: OLED画面での消費電力削減
3. **Focus Enhancement**: テキスト重要コンテンツでの集中力向上
4. **Modern Aesthetic**: 2024年のトレンドに合致

---

## Spatial Design & 3D要素

### 3D Card System

```scss
// 3D Interactive Cards
.card-3d {
  perspective: 1000px;
  transform-style: preserve-3d;
  
  .card-inner {
    transition: transform 0.3s;
    transform-style: preserve-3d;
    
    &:hover {
      transform: rotateX(5deg) rotateY(10deg) scale(1.02);
    }
  }
  
  .card-shadow {
    position: absolute;
    top: 100%;
    left: 50%;
    width: 90%;
    height: 20px;
    background: radial-gradient(ellipse, rgba(0,0,0,0.2), transparent);
    transform: translateX(-50%) translateZ(-20px);
    transition: all 0.3s;
  }
  
  &:hover .card-shadow {
    transform: translateX(-50%) translateZ(-20px) scale(1.1);
    opacity: 0.6;
  }
}

// Depth Layers
.layer-system {
  --layer-base: 0;
  --layer-raised: 10px;
  --layer-floating: 20px;
  --layer-modal: 30px;
  --layer-tooltip: 40px;
}
```

### Interactive Elements

1. **Parallax Scrolling**: 深度感のあるスクロール体験
2. **Layered Information**: 情報の階層的表示
3. **Interactive 3D Cards**: ホバーで立体的に動くカード
4. **Spatial Navigation**: 3D空間での直感的操作

---

## コンポーネント仕様

### Primary Button

```tsx
// Modern Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'brutal';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ComponentType;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  icon: Icon,
  children,
  ...props 
}) => {
  return (
    <button
      className={cn(
        'btn-base',
        `btn-${variant}`,
        `btn-${size}`,
        isLoading && 'btn-loading'
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <>
          {Icon && <Icon className="btn-icon" />}
          {children}
        </>
      )}
    </button>
  );
};
```

### Glass Card Component

```tsx
// Glassmorphism Card Component
interface GlassCardProps {
  variant: 'subtle' | 'prominent' | 'modal';
  blur?: 'light' | 'medium' | 'heavy';
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'subtle',
  blur = 'medium',
  children,
  className
}) => {
  return (
    <div
      className={cn(
        'glass-card',
        `glass-${variant}`,
        `glass-blur-${blur}`,
        className
      )}
    >
      {children}
    </div>
  );
};
```

### AI Progress Indicator

```tsx
// AI-Style Progress Component
interface AIProgressProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
}

const AIProgress: React.FC<AIProgressProps> = ({
  progress,
  label,
  showPercentage = true,
  color = 'primary'
}) => {
  return (
    <div className="ai-progress-container">
      {label && (
        <div className="ai-progress-header">
          <span className="ai-progress-label">{label}</span>
          {showPercentage && (
            <span className="ai-progress-percentage">{progress}%</span>
          )}
        </div>
      )}
      <div className="ai-progress-track">
        <div 
          className={`ai-progress-fill ai-progress-${color}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
```

---

## 実装ガイドライン

### CSS Architecture

```scss
// Utility-First with Component Architecture
@layer base, components, utilities;

@layer base {
  // CSS Reset and base styles
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  html {
    color-scheme: dark light;
    scroll-behavior: smooth;
  }
  
  body {
    margin: 0;
    font-family: var(--font-body);
    background: var(--system-bg);
    color: var(--content-primary);
    line-height: 1.5;
  }
}

@layer components {
  // Component-specific styles
  .btn-base {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: var(--font-semibold);
    text-decoration: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    
    &:focus-visible {
      outline: 2px solid var(--interactive-primary);
      outline-offset: 2px;
    }
  }
  
  .btn-primary {
    background: var(--interactive-primary);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--interactive-hover);
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  .btn-brutal {
    background: var(--accent-primary);
    color: black;
    font-weight: var(--font-black);
    text-transform: uppercase;
    border: 3px solid black;
    box-shadow: 4px 4px 0px black;
    
    &:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0px black;
    }
    
    &:active {
      transform: translate(0, 0);
      box-shadow: 2px 2px 0px black;
    }
  }
}

@layer utilities {
  // Utility classes for rapid development
  .glass-subtle { backdrop-filter: blur(10px); }
  .glass-medium { backdrop-filter: blur(20px); }
  .glass-heavy { backdrop-filter: blur(40px); }
  
  .text-gradient {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}
```

### Accessibility Implementation

```tsx
// Accessibility-First Component Pattern
const AccessibleButton: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled,
  ariaLabel,
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      // High contrast focus indicator
      className="focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-primary"
      {...props}
    >
      {children}
    </button>
  );
};

// Screen reader optimizations
const ScreenReaderText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);
```

### Performance Optimization

```tsx
// Lazy loading with Suspense
const LazyDashboard = lazy(() => import('./components/Dashboard'));
const LazySettings = lazy(() => import('./components/Settings'));

// Component-level code splitting
const App: React.FC = () => {
  return (
    <Suspense fallback={<AILoadingSpinner />}>
      <Router>
        <Routes>
          <Route path="/" element={<LazyDashboard />} />
          <Route path="/settings" element={<LazySettings />} />
        </Routes>
      </Router>
    </Suspense>
  );
};

// Image optimization
const OptimizedImage: React.FC<ImageProps> = ({ src, alt, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};
```

---

## 検証チェックリスト

### ✅ Design Implementation Checklist

#### Neobrutalism + Minimalism
- [ ] Bold, uppercase typography implemented
- [ ] High contrast color scheme active
- [ ] Asymmetric layouts where appropriate
- [ ] Raw, authentic aesthetic maintained
- [ ] Minimal, functional approach confirmed

#### Glassmorphism
- [ ] Backdrop-filter support verified
- [ ] Transparency hierarchy established
- [ ] Blur effects optimized for performance
- [ ] Cross-browser compatibility tested

#### Dark Mode First
- [ ] Dark theme as default implemented
- [ ] Light mode toggle functional
- [ ] Color scheme respects user preferences
- [ ] OLED-optimized pure blacks used

#### AI Aesthetic
- [ ] Clean, technical design language
- [ ] Data visualization components
- [ ] Progressive disclosure patterns
- [ ] Predictive UI elements

#### Micro-interactions
- [ ] Hover states responsive
- [ ] Loading states informative
- [ ] Transition timing optimized
- [ ] Feedback mechanisms clear

#### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader compatibility
- [ ] Keyboard navigation complete
- [ ] Focus indicators visible
- [ ] Color contrast ratios verified

#### Performance
- [ ] Bundle size optimized
- [ ] Lazy loading implemented
- [ ] Image optimization active
- [ ] CSS-in-JS performance verified
- [ ] Core Web Vitals passing

---

この設計ガイドは、実証された2024-2025年のUIトレンドに基づいて作成されており、Miruの恋愛オーケストレーションシステムを最先端のモダンデザインへと完全に変貌させます。
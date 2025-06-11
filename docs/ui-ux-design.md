# Miru UI/UX設計仕様書 v5.0

> 2024-2025年モダンUIトレンドを反映した恋愛オーケストレーションAIシステムの設計仕様書

## 1. デザインビジョン

### 1.1 コンセプト
「付き合えるかもしれない」という希望を、最先端のAI技術と実証されたモダンUIで可視化する次世代恋愛支援システム。

### 1.2 デザイン原則
1. **Evidence-Based Design**: 実証されたトレンドのみ採用
2. **Dark Mode First**: ユーザーの82.7%が使用するダークモード優先
3. **AI Aesthetic**: クリーンで技術的な印象
4. **Accessibility First**: WCAG 2.1 AA準拠
5. **Performance Oriented**: Core Web Vitals最適化

### 1.3 採用トレンド（2024-2025）
- ✅ **Glassmorphism** - 透明感のある階層的UI
- ✅ **Neobrutalism** - 個性的で記憶に残るデザイン
- ✅ **Dark Mode First** - 目に優しく省電力
- ✅ **Bold Typography** - 視認性と印象を重視
- ✅ **Micro-interactions** - 直感的フィードバック
- ✅ **3D & Spatial Design** - 深度のある体験
- ✅ **AI Aesthetic** - 技術的で洗練された印象

## 2. デザインシステム

### 2.1 カラーパレット

#### Dark Mode (Default)
```scss
:root[data-theme="dark"] {
  // 背景色
  --bg-primary: #0a0a0a;      // 純粋な黒（OLED最適化）
  --bg-secondary: #1a1a1a;    // カード背景
  --bg-tertiary: #2a2a2a;     // 浮き上がった要素
  
  // テキスト色
  --text-primary: #ffffff;     // メインテキスト
  --text-secondary: #a0a0a0;   // サブテキスト
  --text-disabled: #404040;    // 無効状態
  
  // アクセントカラー（Neobrutalism）
  --accent-primary: #ff6b6b;   // 情熱的な赤
  --accent-secondary: #4ecdc4; // クールなターコイズ
  --accent-warning: #ffe66d;   // 明るい黄色
  --accent-success: #51cf66;   // 鮮やかな緑
  --accent-error: #ff4757;     // 警告赤
  
  // Glassmorphism
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: blur(20px);
  
  // 影
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.5);
  --shadow-brutal: 4px 4px 0px #000;
}
```

#### Light Mode (Optional)
```scss
:root[data-theme="light"] {
  // 背景色
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  
  // テキスト色
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-disabled: #adb5bd;
  
  // アクセントカラー（高コントラスト）
  --accent-primary: #e63946;
  --accent-secondary: #06ffa5;
  --accent-warning: #ffc107;
  --accent-success: #198754;
  --accent-error: #dc3545;
  
  // Glassmorphism
  --glass-bg: rgba(0, 0, 0, 0.05);
  --glass-border: rgba(0, 0, 0, 0.1);
  --glass-blur: blur(10px);
  
  // 影
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.16);
  --shadow-brutal: 3px 3px 0px #212529;
}
```

### 2.2 タイポグラフィ

#### フォントファミリー
```scss
:root {
  // Variable Fonts対応
  --font-display: 'Inter Variable', system-ui, -apple-system, sans-serif;
  --font-body: 'Inter', 'Noto Sans JP', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  // フォントウェイト
  --font-light: 300;
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-black: 900; // Neobrutalism用
}
```

#### サイズスケール
```scss
:root {
  // Fluid Typography
  --text-xs: clamp(0.75rem, 1vw, 0.875rem);
  --text-sm: clamp(0.875rem, 1.2vw, 1rem);
  --text-base: clamp(1rem, 1.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 2vw, 1.25rem);
  --text-xl: clamp(1.25rem, 2.5vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 3vw, 2rem);
  --text-3xl: clamp(2rem, 4vw, 3rem);
  --text-4xl: clamp(3rem, 6vw, 4rem);
  --text-hero: clamp(4rem, 8vw, 6rem); // Bold Typography
}
```

### 2.3 スペーシング

```scss
:root {
  // 8px Grid System
  --space-0: 0;
  --space-1: 0.25rem;  // 4px
  --space-2: 0.5rem;   // 8px
  --space-3: 0.75rem;  // 12px
  --space-4: 1rem;     // 16px
  --space-5: 1.25rem;  // 20px
  --space-6: 1.5rem;   // 24px
  --space-8: 2rem;     // 32px
  --space-10: 2.5rem;  // 40px
  --space-12: 3rem;    // 48px
  --space-16: 4rem;    // 64px
  --space-20: 5rem;    // 80px
}
```

### 2.4 レイアウトグリッド

```scss
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  
  @media (min-width: 640px) {
    padding: 0 var(--space-6);
  }
  
  @media (min-width: 1024px) {
    padding: 0 var(--space-8);
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4);
}
```

## 3. コンポーネント設計

### 3.1 Glassmorphism Card

```tsx
interface GlassCardProps {
  variant?: 'subtle' | 'prominent' | 'floating';
  blur?: 'light' | 'medium' | 'heavy';
  children: React.ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  variant = 'subtle',
  blur = 'medium',
  children 
}) => {
  return (
    <div className={`
      relative overflow-hidden
      ${variant === 'subtle' && 'bg-white/10'}
      ${variant === 'prominent' && 'bg-white/20'}
      ${variant === 'floating' && 'bg-white/15'}
      ${blur === 'light' && 'backdrop-blur-sm'}
      ${blur === 'medium' && 'backdrop-blur-md'}
      ${blur === 'heavy' && 'backdrop-blur-xl'}
      border border-white/20
      rounded-2xl
      shadow-lg
      transition-all duration-300
      hover:shadow-xl
      hover:bg-white/[0.15]
    `}>
      {children}
    </div>
  );
};
```

### 3.2 Neobrutalism Button

```tsx
interface BrutalButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

const BrutalButton: React.FC<BrutalButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick
}) => {
  const baseClasses = `
    font-black uppercase tracking-wider
    border-3 border-black
    transition-all duration-150
    active:translate-x-1 active:translate-y-1
    active:shadow-[2px_2px_0px_black]
  `;
  
  const variantClasses = {
    primary: 'bg-accent-primary text-black hover:shadow-[6px_6px_0px_black]',
    secondary: 'bg-accent-secondary text-black hover:shadow-[6px_6px_0px_black]',
    danger: 'bg-accent-error text-white hover:shadow-[6px_6px_0px_black]'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm shadow-[3px_3px_0px_black]',
    md: 'px-6 py-3 text-base shadow-[4px_4px_0px_black]',
    lg: 'px-8 py-4 text-lg shadow-[5px_5px_0px_black]'
  };
  
  return (
    <button
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
    >
      {children}
    </button>
  );
};
```

### 3.3 AI Progress Indicator

```tsx
interface AIProgressProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'gradient' | 'pulse';
}

const AIProgress: React.FC<AIProgressProps> = ({
  progress,
  label,
  showPercentage = true,
  variant = 'gradient'
}) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text-secondary">
            {label}
          </span>
          {showPercentage && (
            <span className="text-sm font-mono text-accent-primary">
              {progress}%
            </span>
          )}
        </div>
      )}
      
      <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`
            absolute inset-y-0 left-0 rounded-full
            transition-all duration-500 ease-out
            ${variant === 'default' && 'bg-accent-primary'}
            ${variant === 'gradient' && 'bg-gradient-to-r from-accent-primary to-accent-secondary'}
            ${variant === 'pulse' && 'bg-accent-primary animate-pulse'}
          `}
          style={{ width: `${progress}%` }}
        >
          {variant === 'gradient' && (
            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
};
```

### 3.4 Micro-interaction Card

```tsx
interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({ 
  children, 
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <motion.div
      className="relative cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}
      onTapEnd={() => setIsPressed(false)}
      onClick={onClick}
      animate={{
        scale: isPressed ? 0.98 : isHovered ? 1.02 : 1,
        y: isHovered ? -4 : 0
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <div className={`
        glass-card p-6
        ${isHovered && 'shadow-2xl'}
      `}>
        {children}
      </div>
      
      {/* Hover Glow Effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'radial-gradient(circle at center, rgba(255,107,107,0.2), transparent)',
              filter: 'blur(20px)'
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

### 3.5 3D Spatial Card

```tsx
interface Spatial3DCardProps {
  children: React.ReactNode;
  depth?: 'shallow' | 'medium' | 'deep';
}

const Spatial3DCard: React.FC<Spatial3DCardProps> = ({ 
  children, 
  depth = 'medium' 
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  const depthConfig = {
    shallow: { perspective: 800, maxRotation: 5 },
    medium: { perspective: 1000, maxRotation: 10 },
    deep: { perspective: 1200, maxRotation: 15 }
  };
  
  const config = depthConfig[depth];
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setRotation({
      x: (y - 0.5) * config.maxRotation,
      y: (x - 0.5) * -config.maxRotation
    });
  };
  
  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };
  
  return (
    <div 
      className="relative"
      style={{ perspective: `${config.perspective}px` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative transform-gpu"
        animate={{
          rotateX: rotation.x,
          rotateY: rotation.y
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 30
        }}
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="glass-card p-6">
          {children}
        </div>
        
        {/* 3D Shadow */}
        <div 
          className="absolute inset-0 -z-10 bg-black/20 blur-xl"
          style={{
            transform: 'translateZ(-20px) scale(0.95)'
          }}
        />
      </motion.div>
    </div>
  );
};
```

## 4. インタラクションパターン

### 4.1 マイクロインタラクション

#### ホバーエフェクト
```scss
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
}

.hover-glow {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary));
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s;
    filter: blur(8px);
    z-index: -1;
  }
  
  &:hover::before {
    opacity: 0.6;
  }
}
```

#### クリックフィードバック
```tsx
const useClickFeedback = () => {
  const [ripples, setRipples] = useState<Array<{x: number, y: number, id: number}>>([]);
  
  const createRipple = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  };
  
  return { ripples, createRipple };
};
```

### 4.2 ローディング状態

#### AIローディング
```tsx
const AILoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        {/* Rotating circles */}
        <div className="absolute inset-0 border-2 border-accent-primary/30 rounded-full" />
        <div className="absolute inset-0 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        
        {/* Center pulse */}
        <div className="absolute inset-2 bg-accent-primary/20 rounded-full animate-pulse" />
      </div>
      
      <div className="flex flex-col">
        <span className="text-sm font-medium text-text-primary">
          AI分析中...
        </span>
        <span className="text-xs text-text-secondary">
          最適な結果を計算しています
        </span>
      </div>
    </div>
  );
};
```

### 4.3 トランジション

#### ページトランジション
```tsx
const pageTransition = {
  initial: { 
    opacity: 0, 
    y: 20,
    filter: 'blur(10px)'
  },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3
    }
  }
};
```

## 5. レスポンシブデザイン

### 5.1 ブレークポイント

```scss
$breakpoints: (
  'sm': 640px,   // Mobile landscape
  'md': 768px,   // Tablet
  'lg': 1024px,  // Desktop
  'xl': 1280px,  // Large desktop
  '2xl': 1536px  // Extra large
);

@mixin responsive($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}
```

### 5.2 モバイルファースト設計

```scss
// Mobile Base
.component {
  padding: var(--space-4);
  font-size: var(--text-base);
  
  @include responsive('md') {
    padding: var(--space-6);
    font-size: var(--text-lg);
  }
  
  @include responsive('lg') {
    padding: var(--space-8);
  }
}
```

## 6. アクセシビリティ

### 6.1 カラーコントラスト

```scss
// WCAG 2.1 AA準拠
.high-contrast {
  // 通常テキスト: 4.5:1以上
  --text-on-dark: #ffffff;    // 21:1 on #0a0a0a
  --text-on-light: #212529;   // 16:1 on #ffffff
  
  // 大きいテキスト: 3:1以上
  --large-text-on-accent: #000000;  // 5.8:1 on #ff6b6b
}
```

### 6.2 フォーカス管理

```scss
// Visible Focus
:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

// Skip Links
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
  
  &:focus {
    top: 0;
  }
}
```

### 6.3 スクリーンリーダー対応

```tsx
// Semantic HTML
<nav role="navigation" aria-label="メインナビゲーション">
  <ul>
    <li><a href="#" aria-current="page">ホーム</a></li>
    <li><a href="#">ダッシュボード</a></li>
  </ul>
</nav>

// ARIA Labels
<button 
  aria-label="新しいコネクションを追加"
  aria-describedby="add-connection-help"
>
  <PlusIcon aria-hidden="true" />
</button>
<span id="add-connection-help" className="sr-only">
  新しい相手の情報を登録できます
</span>
```

## 7. パフォーマンス最適化

### 7.1 CSS最適化

```scss
// Critical CSS
@layer critical {
  // Above-the-fold styles
  :root {
    color-scheme: dark;
  }
  
  body {
    background: var(--bg-primary);
    color: var(--text-primary);
  }
}

// Non-critical CSS
@layer components {
  // Component styles loaded async
}
```

### 7.2 画像最適化

```tsx
// Next.js Image Optimization
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1920}
  height={1080}
  priority
  placeholder="blur"
  blurDataURL={blurDataUrl}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### 7.3 アニメーション最適化

```scss
// GPU Acceleration
.animate-gpu {
  will-change: transform;
  transform: translateZ(0);
}

// Reduce Motion
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 8. 実装チェックリスト

### デザインシステム
- [ ] Dark Mode実装（デフォルト）
- [ ] Light Mode実装（オプション）
- [ ] カラー変数定義
- [ ] タイポグラフィ設定
- [ ] スペーシングシステム

### コンポーネント
- [ ] Glassmorphism Cards
- [ ] Neobrutalism Buttons
- [ ] AI Progress Indicators
- [ ] Micro-interaction Components
- [ ] 3D Spatial Elements

### インタラクション
- [ ] ホバーエフェクト
- [ ] クリックフィードバック
- [ ] ローディング状態
- [ ] ページトランジション
- [ ] スクロールアニメーション

### レスポンシブ
- [ ] モバイルビュー最適化
- [ ] タブレットビュー調整
- [ ] デスクトップレイアウト
- [ ] フルイドタイポグラフィ

### アクセシビリティ
- [ ] カラーコントラスト検証
- [ ] キーボードナビゲーション
- [ ] スクリーンリーダーテスト
- [ ] フォーカス管理
- [ ] ARIA実装

### パフォーマンス
- [ ] Critical CSS抽出
- [ ] 画像最適化
- [ ] コード分割
- [ ] アニメーション最適化
- [ ] Core Web Vitals達成

---

本仕様書は2024-2025年の実証されたUIトレンドに基づいて作成されており、Miruの「付き合えるかもしれない」という希望を最先端のデザインで表現します。
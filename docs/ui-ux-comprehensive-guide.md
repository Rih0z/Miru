# Miru UI/UX Complete Design Guide
> Comprehensive Design and Experience Specification for Love Orchestration AI System

## Table of Contents
1. [Project Overview](#project-overview)
2. [Design Concept](#design-concept)
3. [UX Principles](#ux-principles)
4. [Technical Stack](#technical-stack)
5. [Design System](#design-system)
6. [Data Structure](#data-structure)
7. [User Journey](#user-journey)
8. [Screen Flow](#screen-flow)
9. [Component Specifications](#component-specifications)
10. [Screen Implementation Specs](#screen-implementation-specs)
11. [Animation Details](#animation-details)
12. [Error and Empty State Specs](#error-and-empty-state-specs)
13. [AI Integration Prompts](#ai-integration-prompts)
14. [Accessibility](#accessibility)
15. [Performance Metrics](#performance-metrics)
16. [Implementation Order](#implementation-order)
17. [Validation Checklist](#validation-checklist)

---

## Project Overview

### About Miru
A Love Orchestration AI System that visualizes the hope of "potential romantic relationship". Provides heartwarming romantic experiences with clean, modern design and supports users' romantic success.

### Mission
- Reduce anxiety in relationships and provide positive experiences
- Support romantic success through AI analysis and advice
- Deliver visually appealing and intuitive user experiences

---

## Design Concept

### Visual Concept
1. **Clean Modern Design**
   - Rounded, soft components
   - Pastel color schemes
   - Smooth animations
   - Friendly expressions

2. **Hope and Encouragement**
   - Positive feedback
   - Success visualization
   - Warm expressions
   - Scientific reliability

3. **Simple and Intuitive**
   - Clear and consistent navigation
   - Minimal clicks for operations
   - Visual guide-based flow design
   - Mobile-first layout

---

## UX Principles

### 1. Hope and Encouragement
- Positive language to reduce anxiety
- Celebrate success with feedback
- Visualize progress for sense of achievement
- Encouraging messages during setbacks

### 2. Simple and Intuitive
- Clear and understandable navigation
- Minimal steps to achieve goals
- Guided flow design to prevent confusion
- Friendly expressions avoiding technical jargon

### 3. Personalized Experience
- Recommended actions based on user situation
- Optimization through learning features
- Personalized messages
- Feature suggestions adapted to growth

### 4. Emotional Design
**Positive Language Examples:**
- "An error occurred" → "Something minor happened"
- "Authentication failed" → "Please try again"
- "No data available" → "Let's start a new romantic journey"

---

## Technical Stack

### Frontend
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

### Backend & Infrastructure
```json
{
  "database": "Supabase PostgreSQL",
  "deployment": "Cloudflare Pages",
  "cdn": "Cloudflare",
  "testing": "Jest + React Testing Library + Playwright"
}
```

---

## Design System

### Color Palette

#### Primary Colors
```css
/* Pink system */
--pink-400: #EC4899;
--pink-500: #D946EF;
--pink-50: #FDF2F8;
--pink-100: #FCE7F3;
--pink-200: #FBCFE8;

/* Purple system */
--purple-400: #A855F7;
--purple-500: #9333EA;
--purple-50: #FAF5FF;
--purple-100: #F3E8FF;
--purple-200: #E9D5FF;

/* Gradients */
--gradient-primary: linear-gradient(to right, #EC4899, #A855F7);
--gradient-bg: linear-gradient(to bottom right, #FDF2F8, #FAF5FF, #EFF6FF);
```

#### Temperature Colors (Relationship Expression)
```css
--temp-hot: #FF5864;     /* High (75-100%) */
--temp-warm: #FFB548;    /* Medium (40-74%) */
--temp-cool: #4FC3F7;    /* Low (0-39%) */
```

#### Accent Colors
```css
--accent-pink: #FFB6C1;
--accent-peach: #FFCCCB;
--accent-lavender: #E6E6FA;
--accent-mint: #F0FFF0;
--accent-cream: #FFF8DC;
--accent-sky: #E0F6FF;
```

### Typography
```css
/* Font Family */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Spacing
```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
```

### Border Radius & Shadows
```css
/* Border Radius */
--radius-sm: 0.25rem;    /* 4px */
--radius-base: 0.5rem;   /* 8px */
--radius-lg: 1rem;       /* 16px */
--radius-xl: 1.5rem;     /* 24px */
--radius-full: 9999px;   /* Full circle */

/* Shadows */
--shadow-sm: 0 4px 8px 0 rgba(255, 182, 193, 0.2);
--shadow-glow: 0 0 20px rgba(255, 182, 193, 0.3);
--shadow-magical: 0 8px 25px rgba(221, 160, 221, 0.4);
```

---

## Data Structure

### TypeScript Type Definitions
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

## Component Specifications

### Icon Usage with React Icons
All visual icons should use React Icons instead of emoji for better accessibility and consistency:

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

// Alternative icon libraries
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

### Bottom Navigation Tabs
```typescript
const tabs = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'temperature', icon: Thermometer, label: 'Temperature' },
  { id: 'import', icon: Download, label: 'Import' },
  { id: 'ai', icon: Bot, label: 'AI Analysis' },
  { id: 'settings', icon: Settings, label: 'Settings' }
];
```

### Connection Card Component
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
    <div className="card-clean hover-lift group animate-fadeIn relative overflow-hidden">
      {/* Header with icon */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="min-w-0 flex-1 mr-3">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="text-2xl font-bold text-gradient truncate">
              {connection.nickname}
            </h3>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full bg-pink-100 rounded-full h-4 shadow-inner relative overflow-hidden">
          <div 
            className="gradient-primary h-4 rounded-full transition-all duration-700 shadow-glow"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
};
```

### Button Component with Icons
```typescript
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
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
  variant = 'primary',
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

## Screen Implementation Specs

### Dashboard Screen

#### Empty State Screen
```typescript
const EmptyDashboard = () => (
  <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
    <div className="card-clean max-w-2xl mx-auto text-center py-16 animate-bounceIn relative overflow-hidden">
      {/* Main icon */}
      <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-accent-soft flex items-center justify-center animate-pulse relative">
        <Heart className="w-16 h-16 text-pink-500" />
      </div>
      
      <h3 className="text-4xl font-bold text-gradient mb-6 animate-float">
        Start Your Love Journey
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="primary"
          size="lg"
          icon={Plus}
          className="animate-pulse"
        >
          Add Manually
        </Button>
        <Button
          variant="secondary"
          size="lg"
          icon={Download}
          className="animate-pulse"
        >
          AI Bulk Import
        </Button>
      </div>
    </div>
  </div>
);
```

#### Main Dashboard
```typescript
const Dashboard = () => (
  <div className="space-y-8 py-8">
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient animate-float">
          Love Dashboard
        </h1>
        <p className="text-gray-700 text-lg font-medium">
          Your romantic insights powered by AI
        </p>
      </div>
      
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={handleAddConnection}
          icon={Plus}
        >
          <span className="hidden sm:inline">Add Manually</span>
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowDataImportModal(true)}
          icon={Download}
        >
          <span className="hidden sm:inline">AI Import</span>
        </Button>
      </div>
    </div>

    {/* Summary Statistics */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card variant="clean" hover className="animate-bounceIn">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-3xl bg-accent-soft flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
            <Users className="w-8 h-8 text-pink-500" />
          </div>
          <div className="ml-5 flex-1">
            <p className="text-sm font-semibold text-gradient">Connections</p>
            <div className="flex items-baseline">
              <p className="text-4xl font-extrabold text-glow">
                {dashboardData.totalConnections}
              </p>
              <p className="ml-2 text-sm text-pink-400 font-medium">people</p>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="accent" hover className="animate-bounceIn">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-3xl bg-accent-lavender flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
          <div className="ml-5 flex-1">
            <p className="text-sm font-semibold text-gradient">Active</p>
            <div className="flex items-baseline">
              <p className="text-4xl font-extrabold text-glow">
                {dashboardData.activeConnections}
              </p>
              <p className="ml-2 text-sm text-purple-400 font-medium">relationships</p>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="soft" hover className="animate-bounceIn">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-3xl bg-accent-mint flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="ml-5 flex-1">
            <p className="text-sm font-semibold text-gradient">Average Score</p>
            <div className="flex items-baseline">
              <p className="text-4xl font-extrabold text-glow">
                {dashboardData.averageScore || 0}
              </p>
              <p className="ml-2 text-sm text-yellow-400 font-medium">points</p>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="warm" hover className="animate-bounceIn">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-3xl bg-accent-peach flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
            <Heart className="w-8 h-8 text-green-500" />
          </div>
          <div className="ml-5 flex-1">
            <p className="text-sm font-semibold text-gradient">Best Match</p>
            <div className="flex items-baseline">
              <p className="text-4xl font-extrabold text-glow">
                {dashboardData.bestConnection ? 'Found' : 'None'}
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

## Animation Details

### Clean Animation Definitions
```css
/* Smooth entrance */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Gentle floating */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* Bouncy entrance */
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

/* Gentle pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
}
```

### Animation Usage Guidelines
```css
/* Basic usage */
.animate-fadeIn { animation: fadeIn 0.35s ease-out; }
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-bounceIn { animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

/* Hover effects */
.hover-lift {
  transition: all var(--transition-base);
}
.hover-lift:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-glow);
}
```

---

## Error and Empty State Specs

### Error State Component
```typescript
const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something minor happened",
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
    <div className="card-clean max-w-md mx-auto text-center py-12 animate-bounceIn">
      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-red-50 flex items-center justify-center">
        <Icon className="w-10 h-10 text-red-500" />
      </div>
      
      <h3 className="text-2xl font-bold text-gradient mb-4">{title}</h3>
      
      {message && (
        <p className="text-red-600 mb-8 leading-relaxed font-medium">{message}</p>
      )}
      
      {onRetry && (
        <Button
          variant="primary"
          size="lg"
          onClick={onRetry}
          icon={RefreshCw}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
```

### Loading State Component
```typescript
const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Analyzing love connections...",
  submessage = "Finding your perfect match"
}) => (
  <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
    <div className="text-center space-y-6 animate-bounceIn">
      <div className="relative">
        <div className="mx-auto w-20 h-20 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className="w-8 h-8 text-pink-500" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xl font-bold text-gradient animate-pulse">
          {message}
        </p>
        <p className="text-pink-600 font-medium flex items-center justify-center gap-2">
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

## Implementation Order

### Phase 1: Foundation Setup (1-2 weeks)
1. **Project Initial Setup**
   - Next.js 14 + TypeScript environment
   - Tailwind CSS + Custom CSS setup
   - ESLint + Prettier configuration

2. **Design System Implementation**
   - CSS variable definitions
   - Animation definitions
   - Utility class creation

3. **Basic Type Definitions**
   - TypeScript type definitions
   - Basic interface definitions

### Phase 2: Core Components (2-3 weeks)
1. **Layout Components**
   - RootLayout
   - BottomBar
   - Container

2. **Basic UI Components**
   - Button variants
   - Card variants
   - Input variants
   - Modal base

### Phase 3: Main Features (3-4 weeks)
1. **Dashboard**
   - Dashboard.tsx
   - Summary statistics
   - Empty and error states

2. **Connection Management**
   - ConnectionCard.tsx
   - ConnectionForm.tsx
   - CRUD operations

3. **Data Import**
   - DataImportModal.tsx
   - 5-step wizard
   - AI integration prompts

---

## Validation Checklist

### Design & UI
- [ ] Clean, modern design concept consistency
- [ ] Proper use of React Icons instead of emoji
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Consistent color palette usage
- [ ] Proper typography hierarchy
- [ ] Smooth animations and transitions

### Functionality
- [ ] All navigation flows work correctly
- [ ] Form validation and error handling
- [ ] Loading states for all async operations
- [ ] Empty states for all data collections
- [ ] Proper error recovery mechanisms

### Performance
- [ ] Page load time < 3 seconds
- [ ] Smooth 60fps animations
- [ ] Optimized images and assets
- [ ] Proper code splitting
- [ ] Efficient bundle size

### Accessibility
- [ ] Proper ARIA labels
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast compliance (WCAG AA)
- [ ] Focus management

### Testing
- [ ] Unit tests for all components
- [ ] Integration tests for main flows
- [ ] E2E tests for critical paths
- [ ] Cross-browser compatibility
- [ ] Mobile device testing

---

## Notes for Implementation

### React Icons Migration
- Replace all emoji usage with appropriate React Icons
- Use consistent icon sizing (w-4 h-4 for inline, w-5 h-5 for buttons, w-8 h-8 for displays)
- Maintain semantic meaning when choosing icons
- Ensure icons have proper accessibility labels

### Design System Usage
- Follow the established color variables
- Use consistent spacing and typography
- Apply animations thoughtfully, not excessively
- Maintain clean, professional appearance while keeping warmth

### Performance Considerations
- Lazy load components where appropriate
- Optimize icon imports to reduce bundle size
- Use CSS variables for dynamic theming
- Implement proper loading and error states
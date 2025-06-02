# Miru - Personal Context Manager システム設計

## 1. 真の要件に基づく新しい設計概念

### 1.1 システム概要
Miruを**「パーソナルコンテキストマネージャー」**として再定義：
- ユーザーの現状・ゴール・好みを統合管理
- 状況に応じた最適なプロンプトを生成
- 他のAIサービス・アプリとの効果的な連携を支援

### 1.2 設計哲学の転換

| 従来の誤った想定 | 正しい要件 |
|------------------|------------|
| ❌ 恋愛特化のAIアドバイザー | ✅ 汎用的なコンテキスト管理システム |
| ❌ AIが直接提案・指示 | ✅ ユーザーにプロンプトを提供 |
| ❌ 単独完結型アプリ | ✅ 他アプリとの連携前提 |
| ❌ サービス主導の体験 | ✅ ユーザー主導のエンパワーメント |

## 2. アーキテクチャ設計

### 2.1 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    Miru Context Manager                     │
├─────────────────────────────────────────────────────────────┤
│ User Context Engine  │ Prompt Generation │ Integration Hub  │
│ • State Management   │ • Template Engine │ • API Gateway   │
│ • Goal Tracking      │ • Context Aware   │ • Webhooks      │
│ • Preference Learn   │ • Format Adaptive │ • Auth & Perms  │
└─────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐    ┌─────────▼──────────┐    ┌─────▼─────┐
│   ChatGPT      │    │      Claude        │    │  Other    │
│   + Optimized  │    │   + Optimized      │    │    AI     │
│     Prompts    │    │     Prompts        │    │  Services │
└────────────────┘    └────────────────────┘    └───────────┘
```

### 2.2 核心コンポーネント

#### A. User Context Engine

```typescript
interface UserContext {
    // 基本情報
    userId: string;
    lastUpdated: Date;
    
    // 現状把握
    currentState: {
        lifeAreas: {
            romance: LifeAreaState;
            career: LifeAreaState;
            health: LifeAreaState;
            learning: LifeAreaState;
            finance: LifeAreaState;
            relationships: LifeAreaState;
        };
        mood: EmotionalState;
        energy: EnergyLevel;
        challenges: Challenge[];
        achievements: Achievement[];
    };
    
    // ゴール管理
    goals: {
        shortTerm: Goal[];      // 1-3ヶ月
        mediumTerm: Goal[];     // 3-12ヶ月  
        longTerm: Goal[];       // 1年以上
        lifeVision: string;
    };
    
    // 個人特性
    preferences: {
        communicationStyle: CommunicationStyle;
        decisionMaking: DecisionMakingStyle;
        learningStyle: LearningStyle;
        motivationFactors: MotivationFactor[];
        values: Value[];
    };
    
    // AI利用パターン
    aiUsagePatterns: {
        preferredAIServices: AIService[];
        effectivePromptTypes: PromptType[];
        successfulInteractions: Interaction[];
        learningFromFeedback: Feedback[];
    };
}

interface LifeAreaState {
    currentLevel: number;      // 1-10スケール
    satisfaction: number;      // 1-10スケール
    priority: number;          // 1-10スケール
    recentChanges: Change[];
    blockers: Blocker[];
    opportunities: Opportunity[];
}
```

#### B. Prompt Generation Engine

```typescript
class ContextAwarePromptGenerator {
    async generateOptimalPrompt(
        userContext: UserContext,
        intent: UserIntent,
        targetAI: AIService,
        taskType: TaskType
    ): Promise<GeneratedPrompt> {
        
        // 1. コンテキスト分析
        const relevantContext = await this.extractRelevantContext(
            userContext, 
            intent, 
            taskType
        );
        
        // 2. AI特性に応じた最適化
        const aiSpecificOptimization = await this.optimizeForAI(
            targetAI,
            relevantContext
        );
        
        // 3. プロンプト生成
        const basePrompt = await this.generateBasePrompt(
            relevantContext,
            intent,
            taskType
        );
        
        // 4. パーソナライゼーション
        const personalizedPrompt = await this.personalize(
            basePrompt,
            userContext.preferences,
            aiSpecificOptimization
        );
        
        return {
            prompt: personalizedPrompt,
            context: relevantContext,
            expectedOutcome: this.predictOutcome(personalizedPrompt, userContext),
            alternatives: await this.generateAlternatives(personalizedPrompt),
            usageInstructions: this.generateUsageInstructions(targetAI)
        };
    }
    
    private async extractRelevantContext(
        userContext: UserContext,
        intent: UserIntent,
        taskType: TaskType
    ): Promise<RelevantContext> {
        
        // インテント分析に基づく関連コンテキスト抽出
        const relevantAreas = this.mapIntentToLifeAreas(intent);
        const temporalContext = this.getTemporalContext(userContext, taskType);
        const emotionalContext = this.getEmotionalContext(userContext);
        
        return {
            focusAreas: relevantAreas,
            currentState: temporalContext,
            emotionalState: emotionalContext,
            constraints: this.identifyConstraints(userContext, intent),
            opportunities: this.identifyOpportunities(userContext, intent)
        };
    }
}
```

#### C. Integration Hub

```typescript
class IntegrationHub {
    private connectedServices: Map<string, ServiceIntegration>;
    private authManager: AuthenticationManager;
    private permissionManager: PermissionManager;
    
    // サービス登録
    async registerService(
        serviceId: string,
        integration: ServiceIntegration
    ): Promise<void> {
        await this.validateIntegration(integration);
        this.connectedServices.set(serviceId, integration);
    }
    
    // コンテキスト共有
    async shareContext(
        targetService: string,
        userContext: UserContext,
        permissions: Permission[]
    ): Promise<SharedContext> {
        
        // 権限チェック
        await this.permissionManager.validatePermissions(
            userContext.userId,
            targetService,
            permissions
        );
        
        // プライバシーフィルタリング
        const filteredContext = await this.applyPrivacyFilters(
            userContext,
            permissions
        );
        
        // フォーマット変換
        const serviceSpecificFormat = await this.convertToServiceFormat(
            filteredContext,
            targetService
        );
        
        return serviceSpecificFormat;
    }
    
    // 結果フィードバック収集
    async collectFeedback(
        userId: string,
        serviceId: string,
        prompt: string,
        result: any,
        userSatisfaction: number
    ): Promise<void> {
        
        await this.storeFeedback({
            userId,
            serviceId,
            prompt,
            result,
            satisfaction: userSatisfaction,
            timestamp: new Date()
        });
        
        // 学習システムに反映
        await this.updateLearningModel(userId, {
            serviceId,
            prompt,
            result,
            satisfaction: userSatisfaction
        });
    }
}
```

## 3. データベース設計

### 3.1 コンテキスト管理テーブル

```sql
-- ユーザーコンテキスト
CREATE TABLE user_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    current_state JSONB NOT NULL,
    goals JSONB NOT NULL,
    preferences JSONB NOT NULL,
    ai_usage_patterns JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 人生領域状態
CREATE TABLE life_area_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_contexts(user_id),
    area_name VARCHAR(50) NOT NULL, -- romance, career, health, etc.
    current_level INTEGER CHECK (current_level >= 1 AND current_level <= 10),
    satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 10),
    priority INTEGER CHECK (priority >= 1 AND priority <= 10),
    recent_changes JSONB,
    blockers JSONB,
    opportunities JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 目標管理
CREATE TABLE user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_contexts(user_id),
    goal_type VARCHAR(20) CHECK (goal_type IN ('short_term', 'medium_term', 'long_term')),
    life_area VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    milestones JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- プロンプト生成履歴
CREATE TABLE generated_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_contexts(user_id),
    intent JSONB NOT NULL,
    target_ai VARCHAR(50),
    task_type VARCHAR(50),
    prompt_content TEXT NOT NULL,
    context_used JSONB,
    expected_outcome JSONB,
    actual_result TEXT,
    user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
    effectiveness_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- サービス統合
CREATE TABLE service_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_contexts(user_id),
    service_id VARCHAR(100) NOT NULL,
    service_name VARCHAR(100),
    integration_type VARCHAR(50), -- api, webhook, manual
    permissions JSONB,
    auth_credentials JSONB, -- 暗号化
    status VARCHAR(20) DEFAULT 'active',
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- フィードバック学習
CREATE TABLE interaction_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_contexts(user_id),
    service_id VARCHAR(100),
    prompt TEXT,
    result TEXT,
    satisfaction_score INTEGER,
    improvement_suggestions TEXT,
    context_at_time JSONB,
    learned_insights JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 4. API設計

### 4.1 コンテキスト管理API

```typescript
// コンテキスト取得・更新
GET /api/v1/context/{userId}
PUT /api/v1/context/{userId}
PATCH /api/v1/context/{userId}/life-area/{areaName}

// 目標管理
GET /api/v1/goals/{userId}
POST /api/v1/goals/{userId}
PUT /api/v1/goals/{goalId}
DELETE /api/v1/goals/{goalId}

// プロンプト生成
POST /api/v1/prompts/generate
{
    "userId": "uuid",
    "intent": {
        "type": "problem_solving",
        "domain": "career",
        "specific_goal": "job_interview_preparation"
    },
    "targetAI": "chatgpt",
    "taskType": "advice_seeking",
    "additionalContext": {}
}

Response: {
    "prompt": "Based on your background in software engineering and your goal to transition into product management, here's how to prepare for your upcoming interview...",
    "context": {...},
    "expectedOutcome": {...},
    "alternatives": [...],
    "usageInstructions": {...}
}
```

### 4.2 統合連携API

```typescript
// サービス登録
POST /api/v1/integrations/{userId}/services
{
    "serviceId": "notion",
    "serviceName": "Notion Workspace",
    "integrationType": "api",
    "permissions": ["read_context", "receive_prompts"],
    "authCredentials": {...}
}

// コンテキスト共有
POST /api/v1/integrations/{userId}/share-context
{
    "targetService": "notion",
    "contextScope": ["current_goals", "career_state"],
    "permissions": ["read_only"]
}

// フィードバック送信
POST /api/v1/feedback
{
    "userId": "uuid",
    "serviceId": "chatgpt",
    "promptId": "uuid", 
    "result": "Generated excellent cover letter draft",
    "satisfaction": 5,
    "improvements": "Could include more specific examples"
}
```

## 5. プロンプトテンプレートシステム

### 5.1 動的テンプレートエンジン

```typescript
class PromptTemplateEngine {
    private templates: Map<string, PromptTemplate>;
    
    async generateFromTemplate(
        templateId: string,
        userContext: UserContext,
        variables: Record<string, any>
    ): Promise<string> {
        
        const template = await this.getTemplate(templateId);
        const contextVariables = await this.extractContextVariables(userContext);
        const allVariables = { ...contextVariables, ...variables };
        
        return await this.renderTemplate(template, allVariables);
    }
}

// プロンプトテンプレート例
const CAREER_ADVICE_TEMPLATE: PromptTemplate = {
    id: "career_advice_general",
    name: "キャリアアドバイス（汎用）",
    description: "キャリア関連の相談に使用",
    template: `
私は{{age}}歳の{{profession}}です。現在{{current_career_level}}のポジションにいます。

現在の状況：
- 満足度: {{career_satisfaction}}/10
- 主な課題: {{main_challenges}}
- 最近の変化: {{recent_changes}}

目標：
- 短期目標（3ヶ月）: {{short_term_goals}}
- 中期目標（1年）: {{medium_term_goals}}
- 長期目標（3-5年）: {{long_term_goals}}

価値観：{{core_values}}
強み：{{strengths}}
改善したい点：{{areas_for_improvement}}

相談内容：{{specific_question}}

私の状況と目標を踏まえ、具体的で実行可能なアドバイスをお願いします。
    `,
    variables: [
        { name: "age", source: "user_profile.age", required: true },
        { name: "profession", source: "life_areas.career.current_role", required: true },
        { name: "career_satisfaction", source: "life_areas.career.satisfaction", required: true },
        // ... その他の変数定義
    ],
    targetAIs: ["chatgpt", "claude", "gemini"],
    optimizations: {
        "chatgpt": { maxTokens: 4000, temperature: 0.7 },
        "claude": { maxTokens: 8000, temperature: 0.6 }
    }
};
```

## 6. プライバシー・セキュリティ

### 6.1 データ保護

```typescript
class PrivacyManager {
    // コンテキストの機密レベル分類
    async classifyContextSensitivity(context: UserContext): Promise<SensitivityLevel> {
        const personalInfo = this.extractPersonalInfo(context);
        const sensitiveAreas = this.identifySensitiveAreas(context);
        
        return this.calculateSensitivityLevel(personalInfo, sensitiveAreas);
    }
    
    // プライバシーフィルタリング
    async applyPrivacyFilters(
        context: UserContext,
        permissions: Permission[],
        targetService: string
    ): Promise<FilteredContext> {
        
        const allowedFields = await this.getAllowedFields(permissions, targetService);
        const filteredContext = await this.filterFields(context, allowedFields);
        
        // 匿名化
        if (permissions.includes('anonymize')) {
            return await this.anonymizeContext(filteredContext);
        }
        
        return filteredContext;
    }
}
```

## 7. 実装ロードマップ

### Phase 1: MVP（2ヶ月）
- 基本的なコンテキスト管理
- シンプルなプロンプト生成
- 主要AIサービス（ChatGPT、Claude）との連携

### Phase 2: 拡張（2ヶ月）
- 高度なテンプレートシステム
- 学習・改善機能
- より多くのサービス統合

### Phase 3: 最適化（2ヶ月）
- AI協調最適化
- プライバシー強化
- エンタープライズ機能

## 8. 収益モデル

### 8.1 サブスクリプション
- **Personal**: $9.99/月 - 基本機能
- **Professional**: $29.99/月 - 高度な機能・無制限統合
- **Team**: $99.99/月 - チーム機能

### 8.2 API課金
- コンテキスト共有: $0.01/request
- プロンプト生成: $0.05/generation
- プレミアムテンプレート: $1-5/template

この設計により、真の要件である「ユーザーの人生全体をサポートするパーソナルコンテキストマネージャー」を実現できます。
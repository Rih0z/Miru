# プロンプトオーケストレーションシステム設計書

## 1. システム概要

### 1.1 コンセプト
ユーザーが様々なAIサービス（ChatGPT、Claude等）を効果的に活用するための「プロンプト提供システム」。システムはユーザーのコンテキストを管理し、目的に応じた最適なプロンプトを生成・提供する。

### 1.2 基本フロー

```
1. ユーザー情報の収集
   └─> データインポート用プロンプトを提供
   └─> ユーザーがChatGPT/Claudeでプロンプト実行
   └─> 結果をシステムにコピペでインポート

2. コンテキスト管理
   └─> 現状・ゴール・好み・欲求の整理
   └─> ユーザーの気持ちを尊重した管理

3. プロンプト生成・提供
   └─> 目的別の最適化されたプロンプト
   └─> ユーザーがコピーして他AIで使用

4. フィードバックループ
   └─> 結果をシステムに戻す
   └─> プロンプトの改善
```

## 2. コア機能設計

### 2.1 データインポート機能

#### A. スクリーンショット解析プロンプト

```typescript
class ImportPromptGenerator {
    // スクリーンショット解析用プロンプト生成
    generateScreenshotAnalysisPrompt(dataType: DataType): string {
        const prompts = {
            calendar: `
以下のカレンダーのスクリーンショットから、私のスケジュール情報を構造化して抽出してください。

抽出項目：
- 定期的な予定（曜日、時間、内容）
- 重要なイベント（日付、内容、関係者）
- 空き時間の傾向
- 忙しさのパターン

以下のJSON形式で出力してください：
{
  "recurring_events": [
    {"day": "月曜", "time": "10:00", "event": "チームミーティング"}
  ],
  "important_events": [...],
  "free_time_patterns": [...],
  "busy_patterns": [...]
}
`,
            todoList: `
ToDoリストのスクリーンショットから、私のタスクと目標を分析してください。

分析項目：
- 未完了タスク（優先度、期限、カテゴリ別）
- 完了済みタスク（達成パターンの分析）
- 長期目標との関連性
- タスクの傾向（種類、所要時間）

JSON形式で構造化して出力してください。
`,
            healthData: `
健康アプリのスクリーンショットから、私の健康状態を分析してください。

抽出項目：
- 活動量の傾向
- 睡眠パターン
- 健康指標の推移
- 改善が必要な領域

プライバシーに配慮し、一般的な傾向として出力してください。
`
        };
        
        return prompts[dataType] || this.generateGenericPrompt(dataType);
    }
    
    // インポート結果処理用プロンプト
    generateImportProcessingPrompt(rawData: string): string {
        return `
以下のデータを整理して、私の現状把握に活用できる形式に変換してください：

${rawData}

変換後の形式：
{
  "current_state": {
    "summary": "現状の要約",
    "key_points": ["重要ポイント1", "重要ポイント2"],
    "patterns": ["パターン1", "パターン2"],
    "opportunities": ["改善機会1", "改善機会2"]
  },
  "context_for_goals": {
    "relevant_goals": ["関連する目標"],
    "blockers": ["障害となっている要素"],
    "enablers": ["助けとなる要素"]
  }
}
`;
    }
}
```

#### B. データ統合インターフェース

```typescript
interface ImportedData {
    source: 'chatgpt' | 'claude' | 'manual';
    dataType: string;
    rawContent: string;
    processedContent: any;
    importedAt: Date;
    userNotes?: string;
}

class DataImportManager {
    // ユーザーが貼り付けたAI出力を処理
    async processImportedData(
        userId: string,
        aiOutput: string,
        dataType: string,
        source: string
    ): Promise<ImportedData> {
        
        // AI出力をパース
        const parsed = await this.parseAIOutput(aiOutput);
        
        // ユーザーコンテキストに統合
        const integrated = await this.integrateToContext(userId, parsed, dataType);
        
        // 保存
        return await this.saveImportedData(userId, {
            source,
            dataType,
            rawContent: aiOutput,
            processedContent: integrated,
            importedAt: new Date()
        });
    }
}
```

### 2.2 コンテキスト管理システム

```typescript
interface UserContext {
    // 基本情報
    userId: string;
    lastUpdated: Date;
    
    // 現状
    currentState: {
        // インポートされたデータから構築
        dailyRoutine: DailyRoutine;
        workload: WorkloadAnalysis;
        healthStatus: HealthStatus;
        socialConnections: SocialAnalysis;
        financialSituation: FinancialOverview;
        emotionalState: EmotionalState;
    };
    
    // ゴール
    goals: {
        immediate: Goal[];      // 今週〜今月
        shortTerm: Goal[];      // 1-3ヶ月
        mediumTerm: Goal[];     // 3-12ヶ月
        longTerm: Goal[];       // 1年以上
        values: string[];       // 大切にしている価値観
    };
    
    // 好み・欲求
    preferences: {
        communicationStyle: {
            formality: 'casual' | 'formal' | 'balanced';
            detail: 'concise' | 'detailed' | 'comprehensive';
            tone: 'encouraging' | 'direct' | 'analytical';
        };
        aiInteractionStyle: {
            preferredAI: ('chatgpt' | 'claude' | 'gemini')[];
            promptLength: 'short' | 'medium' | 'long';
            responseFormat: 'conversational' | 'structured' | 'bullet_points';
        };
        domains: {
            primaryFocus: string[];     // 最も重視する領域
            avoidTopics: string[];      // 避けたいトピック
        };
    };
    
    // 気持ち・感情
    emotions: {
        currentMood: string;
        stressLevel: number;        // 1-10
        motivationLevel: number;    // 1-10
        confidenceLevel: number;    // 1-10
        concerns: string[];
        aspirations: string[];
    };
}
```

### 2.3 プロンプト生成エンジン

```typescript
class ContextAwarePromptGenerator {
    
    // メインのプロンプト生成メソッド
    async generateOptimalPrompt(
        userId: string,
        purpose: PromptPurpose,
        targetAI: 'chatgpt' | 'claude' | 'gemini',
        additionalContext?: any
    ): Promise<GeneratedPrompt> {
        
        // ユーザーコンテキスト取得
        const context = await this.getUserContext(userId);
        
        // 目的別プロンプト生成
        const basePrompt = await this.generateBasePrompt(purpose, context);
        
        // AI別最適化
        const optimizedPrompt = await this.optimizeForTargetAI(
            basePrompt,
            targetAI,
            context.preferences.aiInteractionStyle
        );
        
        // パーソナライゼーション
        const personalizedPrompt = await this.personalize(
            optimizedPrompt,
            context
        );
        
        return {
            prompt: personalizedPrompt,
            copyableText: this.formatForCopy(personalizedPrompt),
            usage: this.generateUsageInstructions(targetAI, purpose),
            expectedOutputFormat: this.getExpectedFormat(purpose),
            importBackInstructions: this.getImportInstructions(purpose)
        };
    }
    
    // 目的別プロンプトテンプレート
    private promptTemplates = {
        weeklyPlanning: (context: UserContext) => `
私の現在の状況：
- 今週の既存予定: ${this.summarizeWeeklySchedule(context)}
- 優先タスク: ${this.listPriorityTasks(context)}
- エネルギーレベル: ${context.emotions.motivationLevel}/10
- 制約事項: ${this.listConstraints(context)}

目標：
${this.formatGoals(context.goals.immediate)}

私の好みの計画スタイル：
- ${context.preferences.communicationStyle.detail}な計画
- ${this.getPreferredPlanningStyle(context)}

上記を踏まえて、今週の最適な計画を立ててください。
各日の具体的なタスク配分と、エネルギー管理も考慮してください。
`,
        
        problemSolving: (context: UserContext) => `
解決したい問題：
[ここに具体的な問題を入力]

私の現状：
${this.summarizeRelevantContext(context, 'problem_solving')}

これまでに試したこと：
[試したことを箇条書きで入力]

制約条件：
${this.listConstraints(context)}

私の価値観と優先事項：
${context.goals.values.join(', ')}

この問題に対する実践的な解決策を、ステップバイステップで提案してください。
私の状況と制約を考慮した、実行可能な方法でお願いします。
`,
        
        learning: (context: UserContext) => `
学習したいトピック：
[具体的なトピックを入力]

現在のレベル：
[初心者/中級/上級]

学習に使える時間：
${this.calculateAvailableTime(context)}

学習スタイルの好み：
${this.getLearningPreferences(context)}

目標：
${this.formatRelevantGoals(context.goals, 'learning')}

私の状況に合わせた効率的な学習計画を作成してください。
具体的なリソース、スケジュール、マイルストーンを含めてください。
`
    };
}
```

### 2.4 プロンプト配信インターフェース

```typescript
class PromptDeliveryInterface {
    
    // ユーザー向けプロンプト表示コンポーネント
    renderPromptForUser(prompt: GeneratedPrompt): UIComponent {
        return {
            mainPrompt: {
                text: prompt.prompt,
                copyButton: true,
                formatting: 'markdown'
            },
            instructions: {
                targetAI: prompt.usage.targetAI,
                steps: [
                    `1. 上記のプロンプトをコピー`,
                    `2. ${prompt.usage.targetAI}を開く`,
                    `3. プロンプトを貼り付けて実行`,
                    `4. 必要に応じて[　]内を編集`,
                    `5. 結果をこのアプリに戻す`
                ]
            },
            importBack: {
                instruction: prompt.importBackInstructions,
                importButton: true,
                expectedFormat: prompt.expectedOutputFormat
            }
        };
    }
    
    // コピー用フォーマット
    formatForCopy(prompt: string): string {
        // コピーしやすいように整形
        return prompt
            .trim()
            .replace(/\n{3,}/g, '\n\n')  // 過度な改行を削除
            .replace(/^\s+/gm, '');       // 行頭の空白を削除
    }
}
```

## 3. データベース設計

```sql
-- ユーザーコンテキスト
CREATE TABLE user_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    current_state JSONB NOT NULL DEFAULT '{}',
    goals JSONB NOT NULL DEFAULT '{}',
    preferences JSONB NOT NULL DEFAULT '{}',
    emotions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- インポートデータ履歴
CREATE TABLE imported_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_contexts(user_id),
    source VARCHAR(50) NOT NULL, -- chatgpt, claude, manual
    data_type VARCHAR(100) NOT NULL,
    raw_content TEXT NOT NULL,
    processed_content JSONB,
    import_prompt_used TEXT,
    user_notes TEXT,
    imported_at TIMESTAMP DEFAULT NOW()
);

-- 生成プロンプト履歴
CREATE TABLE generated_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_contexts(user_id),
    purpose VARCHAR(100) NOT NULL,
    target_ai VARCHAR(50) NOT NULL,
    prompt_content TEXT NOT NULL,
    context_snapshot JSONB, -- 生成時のコンテキスト
    usage_count INTEGER DEFAULT 0,
    effectiveness_rating INTEGER, -- 1-5
    user_feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- プロンプトテンプレート
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    template_content TEXT NOT NULL,
    variables JSONB NOT NULL, -- 必要な変数定義
    target_ais VARCHAR[] NOT NULL,
    usage_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 結果フィードバック
CREATE TABLE result_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_contexts(user_id),
    prompt_id UUID REFERENCES generated_prompts(id),
    ai_output TEXT,
    was_helpful BOOLEAN,
    achieved_goal BOOLEAN,
    feedback_notes TEXT,
    context_updates JSONB, -- コンテキストへの更新
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 4. ユーザーフロー実装

### 4.1 初回セットアップフロー

```typescript
class OnboardingFlow {
    async startOnboarding(userId: string): Promise<OnboardingSteps> {
        return {
            steps: [
                {
                    title: "基本情報の収集",
                    prompt: this.generateBasicInfoPrompt(),
                    instruction: "このプロンプトをChatGPTまたはClaudeで実行し、結果を貼り付けてください"
                },
                {
                    title: "カレンダー情報のインポート",
                    prompt: this.generateCalendarImportPrompt(),
                    instruction: "カレンダーのスクリーンショットと一緒にこのプロンプトを使用してください"
                },
                {
                    title: "目標設定",
                    prompt: this.generateGoalSettingPrompt(),
                    instruction: "あなたの目標について対話し、結果を貼り付けてください"
                },
                {
                    title: "好みの設定",
                    prompt: this.generatePreferencePrompt(),
                    instruction: "AIとのやり取りの好みを設定します"
                }
            ]
        };
    }
    
    private generateBasicInfoPrompt(): string {
        return `
私の現在の生活状況について構造化された形で整理を手伝ってください。

以下の観点から私の状況を整理してください：
1. 日常のルーティン（起床時間、就寝時間、主な活動）
2. 仕事や学習の状況
3. 健康状態と運動習慣
4. 人間関係と社会的つながり
5. 現在の課題や悩み
6. 興味関心や趣味

質問形式で情報を引き出していただき、最後にJSON形式でまとめてください。
`;
    }
}
```

### 4.2 日常利用フロー

```typescript
class DailyUseFlow {
    // クイックアクセスプロンプト
    async getQuickPrompts(userId: string): Promise<QuickPrompt[]> {
        const context = await this.getUserContext(userId);
        const timeOfDay = this.getTimeOfDay();
        
        return [
            {
                title: "今日のタスク整理",
                icon: "📝",
                prompt: this.generateDailyTaskPrompt(context, timeOfDay)
            },
            {
                title: "週次振り返り",
                icon: "📊",
                prompt: this.generateWeeklyReviewPrompt(context),
                availability: this.isWeekend() ? 'highlighted' : 'normal'
            },
            {
                title: "問題解決サポート",
                icon: "💡",
                prompt: this.generateProblemSolvingPrompt(context)
            },
            {
                title: "学習計画",
                icon: "📚",
                prompt: this.generateLearningPrompt(context)
            }
        ];
    }
}
```

## 5. プライバシーとセキュリティ

### 5.1 データ管理方針

```typescript
class PrivacyManager {
    // センシティブ情報の管理
    sensitiveDataHandling = {
        health: {
            storage: 'encrypted',
            retention: '90_days',
            sharing: 'never',
            processing: 'on_device_only'
        },
        financial: {
            storage: 'encrypted', 
            retention: '30_days',
            sharing: 'never',
            processing: 'aggregated_only'
        },
        personal: {
            storage: 'encrypted',
            retention: 'until_deleted',
            sharing: 'with_permission',
            processing: 'anonymized'
        }
    };
    
    // データ最小化
    async minimizeData(data: any, purpose: string): Promise<any> {
        const requiredFields = this.getRequiredFields(purpose);
        return this.filterData(data, requiredFields);
    }
}
```

## 6. システムアーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│              フロントエンド（React/Next.js）           │
├─────────────────────────────────────────────────────┤
│  インポート画面  │  プロンプト生成  │  コンテキスト管理  │
└─────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────┐
│                   API Gateway                        │
└─────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  コンテキスト  │  │  プロンプト   │  │   インポート   │
│    サービス    │  │    エンジン    │  │   プロセッサ   │
└───────────────┘  └───────────────┘  └───────────────┘
        │                   │                   │
        └───────────────────┴───────────────────┘
                            ▼
                    ┌───────────────┐
                    │   PostgreSQL   │
                    │   + Redis      │
                    └───────────────┘
```

## 7. MVP実装計画

### Phase 1: 基本機能（4週間）
- 基本的なデータインポート機能
- シンプルなコンテキスト管理
- 基本プロンプトテンプレート（5種類）

### Phase 2: コンテキスト強化（4週間）
- 高度なコンテキスト分析
- カスタムプロンプト生成
- フィードバックシステム

### Phase 3: 最適化（4週間）
- AI別の最適化
- 学習システム
- 高度なパーソナライゼーション

この設計により、ユーザーが他のAIサービスを最大限活用できる「プロンプトオーケストレーションシステム」を実現できます。
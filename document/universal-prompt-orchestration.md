# ユニバーサル・プロンプトオーケストレーションシステム

## 1. 本質的要件の再確認

### 要件
- ユーザーの**人生全体**における目的達成を支援
- 異なるAIセッション間でユーザー状態を共有
- ユーザーの好み・欲求・気持ちを尊重
- AIが提案するのではなく、プロンプトを提供
- ユーザーが必要とするものを提供

### 現在の問題点
- ❌ ビールに特化しすぎている
- ❌ 人生全体の目的達成には対応していない
- ❌ 汎用的なコンテキスト管理が不足

## 2. 修正提案：汎用プロンプトオーケストレーションシステム

### 2.1 システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│           ユニバーサル・コンテキストマネージャー            │
├─────────────────────────────────────────────────────────┤
│  人生領域管理  │  プロンプト生成  │  セッション連携     │
│  • 仕事/キャリア │  • 文脈認識      │  • 状態共有       │
│  • 健康/運動    │  • AI別最適化    │  • 履歴管理       │
│  • 趣味/娯楽    │  • 目的別生成    │  • 継続性保持     │
│  • 人間関係     │                  │                   │
│  • 学習/成長    │                  │                   │
│  • 金融/資産    │                  │                   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 汎用コンテキスト構造

```typescript
interface UniversalUserContext {
    // ユーザー識別
    userId: string;
    lastUpdated: Date;
    
    // 人生の各領域の状態
    lifeDomains: {
        career: DomainContext;      // 仕事・キャリア
        health: DomainContext;      // 健康・フィットネス
        relationships: DomainContext; // 人間関係
        hobbies: DomainContext;     // 趣味（ビール含む）
        learning: DomainContext;    // 学習・スキル
        finance: DomainContext;     // 金融・資産
        lifestyle: DomainContext;   // ライフスタイル全般
        creativity: DomainContext;  // 創造的活動
    };
    
    // 横断的な情報
    crossDomainInsights: {
        currentPriorities: string[];      // 今注力している領域
        timeAllocation: TimeAllocation;   // 時間の使い方
        energyLevels: EnergyPattern;     // エネルギーパターン
        decisionStyle: DecisionStyle;     // 意思決定スタイル
        communicationPreference: CommPref; // コミュニケーション好み
    };
    
    // AI利用コンテキスト
    aiUsageContext: {
        sessionHistory: AISession[];      // 過去のAI利用履歴
        effectivePatterns: Pattern[];     // 効果的だったパターン
        preferredModels: string[];        // 好みのAIモデル
        contextCarryOver: any;            // セッション間引き継ぎ情報
    };
}

interface DomainContext {
    currentState: any;          // 現在の状態
    goals: Goal[];             // 目標
    challenges: Challenge[];    // 課題
    history: any[];            // 履歴
    preferences: any;          // 好み・嗜好
    resources: Resource[];     // 利用可能なリソース
}
```

### 2.3 プロンプト生成システムの拡張

```typescript
class UniversalPromptOrchestrator {
    
    // 汎用プロンプト生成
    async generatePrompt(
        userId: string,
        intent: UserIntent,
        context?: AdditionalContext
    ): Promise<OrchestratedPrompt> {
        
        // 1. 全体コンテキスト取得
        const fullContext = await this.getFullUserContext(userId);
        
        // 2. インテントに関連する領域特定
        const relevantDomains = this.identifyRelevantDomains(intent, fullContext);
        
        // 3. クロスドメイン考慮
        const crossDomainFactors = this.analyzeCrossDomainImpact(
            intent, 
            relevantDomains,
            fullContext
        );
        
        // 4. プロンプト生成
        return this.constructPrompt(
            intent,
            relevantDomains,
            crossDomainFactors,
            fullContext.aiUsageContext
        );
    }
    
    // ドメイン横断的なプロンプト例
    private generateCrossDomainPrompt(
        domains: string[],
        context: UniversalUserContext
    ): string {
        
        // 例: キャリアと健康を両立させたい場合
        if (domains.includes('career') && domains.includes('health')) {
            return `
私の現在の状況：

【仕事面】
- 現在の役職: ${context.lifeDomains.career.currentState.position}
- 週間労働時間: ${context.lifeDomains.career.currentState.weeklyHours}
- 主な課題: ${context.lifeDomains.career.challenges.map(c => c.description).join(', ')}

【健康面】
- 運動頻度: ${context.lifeDomains.health.currentState.exerciseFrequency}
- 睡眠時間: ${context.lifeDomains.health.currentState.averageSleep}
- 健康上の懸念: ${context.lifeDomains.health.challenges.map(c => c.description).join(', ')}

【時間配分の現状】
${this.formatTimeAllocation(context.crossDomainInsights.timeAllocation)}

目標：
1. ${context.lifeDomains.career.goals[0]?.description || 'キャリア目標'}
2. ${context.lifeDomains.health.goals[0]?.description || '健康目標'}

この2つの領域をバランスよく改善するための、実践的な週間スケジュールと行動計画を提案してください。
私の意思決定スタイル（${context.crossDomainInsights.decisionStyle}）を考慮してください。
`;
        }
        
        // 他のドメイン組み合わせ用のテンプレート
        return this.selectAppropriateTemplate(domains, context);
    }
}
```

### 2.4 データインポートの汎用化

```typescript
class UniversalDataImporter {
    
    // 汎用スクリーンショット解析プロンプト
    generateUniversalAnalysisPrompt(dataType: string): string {
        const prompts = {
            calendar: this.generateCalendarAnalysisPrompt(),
            fitness: this.generateFitnessAppAnalysisPrompt(),
            finance: this.generateFinanceAppAnalysisPrompt(),
            social: this.generateSocialMediaAnalysisPrompt(),
            learning: this.generateLearningPlatformAnalysisPrompt(),
            work: this.generateWorkToolAnalysisPrompt(),
            // ビールも1つのドメインとして含む
            beer: this.generateBeerAnalysisPrompt()
        };
        
        return prompts[dataType] || this.generateGenericAnalysisPrompt(dataType);
    }
    
    // 統合インポートプロンプト
    generateIntegratedImportPrompt(): string {
        return `
私の様々なアプリやサービスからのスクリーンショット/データを統合的に分析し、
私の人生の全体像を把握してください。

分析してほしい観点：

1. **時間の使い方**
   - 各活動にどれくらい時間を使っているか
   - バランスは取れているか
   - 無駄な時間はないか

2. **目標と現実のギャップ**
   - 設定した目標に対する進捗
   - 実際の行動との乖離
   - 改善可能な領域

3. **パターンと傾向**
   - 繰り返される行動パターン
   - 成功/失敗のパターン
   - 季節や曜日による変化

4. **リソースの活用**
   - お金の使い方
   - 時間の投資先
   - エネルギーの配分

5. **相互影響**
   - ある領域が他の領域に与える影響
   - シナジー効果が期待できる組み合わせ
   - コンフリクトが起きている領域

以下の形式で統合的な分析結果を出力してください：

{
  "life_overview": {
    "time_allocation": { /* 領域別時間配分 */ },
    "goal_alignment": { /* 目標との整合性 */ },
    "patterns": { /* 発見されたパターン */ },
    "opportunities": { /* 改善機会 */ },
    "risks": { /* 注意すべき点 */ }
  },
  "domain_insights": {
    "career": { /* キャリア関連の洞察 */ },
    "health": { /* 健康関連の洞察 */ },
    "relationships": { /* 人間関係の洞察 */ },
    "hobbies": { /* 趣味関連の洞察 */ },
    "finance": { /* 財務関連の洞察 */ },
    "learning": { /* 学習関連の洞察 */ }
  },
  "cross_domain_insights": [
    "仕事のストレスが睡眠に悪影響",
    "趣味の時間が創造性を高めている",
    /* その他の相互関係 */
  ],
  "recommendations": {
    "immediate_actions": [ /* すぐに実行可能なアクション */ ],
    "medium_term_adjustments": [ /* 中期的な調整 */ ],
    "long_term_strategies": [ /* 長期戦略 */ ]
  }
}
`;
    }
}
```

### 2.5 セッション間連携の強化

```typescript
class SessionContinuityManager {
    
    // AIセッション間でのコンテキスト共有
    async prepareContextForNewSession(
        userId: string,
        targetAI: string,
        purpose: string
    ): Promise<SessionContext> {
        
        // 過去のセッション履歴取得
        const history = await this.getSessionHistory(userId);
        
        // 関連する過去のやり取り抽出
        const relevantHistory = this.extractRelevantHistory(history, purpose);
        
        // 継続性のためのコンテキスト生成
        return {
            continuityPrompt: this.generateContinuityPrompt(relevantHistory),
            previousInsights: this.summarizePreviousInsights(relevantHistory),
            openQuestions: this.identifyOpenQuestions(relevantHistory),
            progressUpdate: this.generateProgressUpdate(userId, purpose)
        };
    }
    
    // 継続性を保つプロンプト
    private generateContinuityPrompt(history: SessionHistory[]): string {
        return `
前回のセッションからの継続：

【これまでの経緯】
${this.summarizeHistory(history)}

【前回の結論】
${history[history.length - 1]?.conclusions || '初回セッション'}

【未解決の課題】
${this.listOpenIssues(history)}

【今回のセッションの目的】
前回の議論を踏まえて、さらに深く探求したい点や、
新たに生じた疑問について話し合いましょう。
`;
    }
}
```

## 3. 実装への移行計画

### Phase 1: 基盤構築（2週間）
- 汎用コンテキスト構造の実装
- 基本的なドメイン（3-4個）の実装
- シンプルなプロンプト生成

### Phase 2: 拡張（4週間）
- 全ドメインの実装
- クロスドメイン分析
- セッション連携機能

### Phase 3: 最適化（2週間）
- ユーザーフィードバックに基づく改善
- プロンプトテンプレートの充実
- パフォーマンス最適化

## 4. 期待される効果

### ユーザーにとっての価値
1. **包括的な自己理解**: 人生全体を俯瞰できる
2. **効率的なAI活用**: 最適なプロンプトで時間短縮
3. **継続的な成長**: セッション間で進捗を追跡
4. **バランスの取れた生活**: 各領域の相互影響を考慮

### システムの独自性
1. **真の汎用性**: ビール以外のあらゆる領域に対応
2. **コンテキスト保持**: AIセッション間での一貫性
3. **ユーザー主導**: 提案ではなくツール提供
4. **プライバシー重視**: ユーザー経由のデータフロー

この設計により、本来の要件である「人生全体における目的達成支援」を実現できます。
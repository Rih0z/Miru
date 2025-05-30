# 恋愛支援プロンプトオーケストレーションシステム「Miru」

## 1. 本質的欲求の実現

### プロポーザルの本質的欲求
- 「付き合えるかもしれない」という希望と可能性を見る体験
- AI技術による科学的な恋愛支援
- 関係の進展可視化と継続的な期待感提供

### システム要件
- ユーザーの恋愛に関する情報を収集・管理
- 異なるAIサービスで使える最適なプロンプトを提供
- ユーザー主導（提案ではなくツール提供）

## 2. システム設計

### 2.1 恋愛コンテキスト管理

```typescript
interface RomanceContext {
    userId: string;
    
    // 自分自身の情報
    selfProfile: {
        basicInfo: {
            age: number;
            gender: string;
            location: string;
            occupation: string;
        };
        personality: {
            traits: string[];
            communicationStyle: string;
            loveLanguage: string[];
            attachmentStyle: string;
        };
        lifestyle: {
            hobbies: string[];
            values: string[];
            lifeGoals: string[];
            dailyRoutine: string;
        };
        relationshipHistory: {
            pastExperiences: string[];
            lessons: string[];
            patterns: string[];
        };
    };
    
    // 現在の恋愛状況
    currentSituation: {
        status: 'searching' | 'talking' | 'dating' | 'exclusive';
        activeConnections: Connection[];
        challengesAndConcerns: string[];
        hopefulMoments: HopeMoment[];
    };
    
    // 理想と目標
    desiresAndGoals: {
        idealPartner: {
            mustHaves: string[];
            niceToHaves: string[];
            dealBreakers: string[];
        };
        relationshipGoals: {
            shortTerm: string[];
            longTerm: string[];
            relationshipStyle: string;
        };
    };
    
    // 体験価値の記録
    experienceTracking: {
        hisScore: number; // Hope Implementation Score
        progressMilestones: Milestone[];
        positiveExperiences: Experience[];
        growthAreas: string[];
    };
}

interface Connection {
    personId: string;
    nickname: string; // プライバシー保護
    platform: string; // 出会った場所
    currentStage: 'initial' | 'conversation' | 'firstDate' | 'dating' | 'exclusive';
    compatibility: {
        perceivedScore: number;
        positiveFactors: string[];
        concerns: string[];
    };
    interactionHistory: {
        firstContact: Date;
        significantMoments: Moment[];
        lastInteraction: Date;
    };
}
```

### 2.2 恋愛支援プロンプト生成システム

```typescript
class RomancePromptOrchestrator {
    
    // メッセージ作成支援プロンプト
    generateMessageCraftingPrompt(
        context: RomanceContext,
        connection: Connection,
        situation: MessageSituation
    ): string {
        return `
私の状況を理解した上で、適切なメッセージ作成を手伝ってください。

【私について】
- ${context.selfProfile.basicInfo.age}歳、${context.selfProfile.basicInfo.occupation}
- コミュニケーションスタイル: ${context.selfProfile.personality.communicationStyle}
- 大切にしている価値観: ${context.selfProfile.lifestyle.values.join(', ')}

【相手について】
- ニックネーム: ${connection.nickname}
- 出会った場所: ${connection.platform}
- 現在の関係: ${connection.currentStage}
- これまでの良い兆候: ${connection.compatibility.positiveFactors.join(', ')}

【現在の状況】
${this.describeSituation(situation)}

【私の意図】
${situation.intent}

【これまでの会話の流れ】
${this.summarizeRecentInteractions(connection)}

上記を踏まえて、自然で私らしいメッセージの案を3つ提示してください。
それぞれ異なるトーンで：
1. カジュアルで親しみやすい
2. 誠実で思いやりのある
3. ユーモアを交えた軽快な

各案について、なぜそのアプローチが良いか簡単に説明してください。
`;
    }
    
    // 関係性分析プロンプト
    generateRelationshipAnalysisPrompt(
        context: RomanceContext,
        connection: Connection
    ): string {
        return `
私の恋愛状況を客観的に分析し、「付き合えるかもしれない」可能性を評価してください。

【関係性の概要】
- 出会ってからの期間: ${this.calculateDuration(connection.interactionHistory.firstContact)}
- 現在のステージ: ${connection.currentStage}
- 最近の交流頻度: ${this.calculateInteractionFrequency(connection)}

【ポジティブな兆候】
${connection.compatibility.positiveFactors.map(f => `- ${f}`).join('\n')}

【私の懸念点】
${connection.compatibility.concerns.map(c => `- ${c}`).join('\n')}

【重要な出来事】
${connection.interactionHistory.significantMoments.map(m => 
    `- ${m.date}: ${m.description}`
).join('\n')}

以下の観点から分析してください：

1. **関係の進展度合い**
   - 健全なペースで進んでいるか
   - 次のステップに進む準備ができているか

2. **相互の関心度**
   - 相手の行動から読み取れる関心のサイン
   - バランスの取れた関係性か

3. **「付き合える可能性」の評価**
   - 現在の可能性: X%
   - 可能性を高める要因
   - 注意すべきリスク

4. **次のアクション提案**
   - 関係を深めるための具体的な行動
   - タイミングの考慮事項

希望を持ちながらも現実的な視点でアドバイスをお願いします。
`;
    }
    
    // デート計画プロンプト
    generateDatePlanningPrompt(
        context: RomanceContext,
        connection: Connection,
        preferences: DatePreferences
    ): string {
        return `
素敵なデートプランを一緒に考えてください。

【相手の情報】
- 趣味・興味: ${this.extractInterests(connection)}
- これまでに楽しんだこと: ${this.extractEnjoyedActivities(connection)}

【私の希望】
- 予算: ${preferences.budget}
- 日時: ${preferences.dateTime}
- エリア: ${preferences.location}
- 雰囲気: ${preferences.atmosphere}

【関係性の段階】
${connection.currentStage}なので、${this.getAppropriateIntimacyLevel(connection.currentStage)}な雰囲気が良いと思います。

【配慮事項】
${preferences.considerations?.join(', ') || 'なし'}

以下の形式でデートプランを3つ提案してください：

各プラン：
- コンセプト（一言で）
- 具体的なスケジュール
- なぜこのプランが良いか
- 会話のきっかけになりそうなポイント
- 次につながる要素

「また会いたい」と思ってもらえるような、記憶に残るデートにしたいです。
`;
    }
    
    // 進展状況の可視化プロンプト
    generateProgressVisualizationPrompt(
        context: RomanceContext
    ): string {
        return `
私の恋愛の進展状況を分析し、希望が持てる形で可視化してください。

【現在の状況】
${context.activeConnections.map(conn => 
    `- ${conn.nickname}: ${conn.currentStage} (${conn.compatibility.perceivedScore}/100)`
).join('\n')}

【最近の前向きな出来事】
${context.currentSituation.hopefulMoments.map(m => 
    `- ${m.date}: ${m.description}`
).join('\n')}

【私の成長】
${context.experienceTracking.growthAreas.join(', ')}

以下の形式で進展状況をまとめてください：

1. **全体的な進展度**（ビジュアルな表現で）
   例：🌱→🌿→🌳→🌸→💑

2. **各関係性の可能性スコア**
   - 現在のスコアと先月からの変化
   - スコアが上がった要因

3. **ポジティブな傾向**
   - 良い方向に向かっているサイン
   - 最近の成功パターン

4. **次の1ヶ月の展望**
   - 期待できる進展
   - チャンスのタイミング

5. **励ましのメッセージ**
   - 私の強みを活かしたアドバイス
   - 希望を持ち続けるための視点

必ず前向きで希望が持てる形でまとめてください。
`;
    }
}
```

### 2.3 データインポート用プロンプト

```typescript
class RomanceDataImportPrompts {
    
    // Pairsスクリーンショット解析プロンプト
    generatePairsAnalysisPrompt(): string {
        return `
私のPairsアプリのスクリーンショット（プロフィール、いいね履歴、マッチング画面、メッセージ一覧など）から、「付き合えるかもしれない」可能性を分析してください。

画像から読み取ってほしい情報：

1. **マッチング状況の把握**
   - 総いいね数（もらった/送った）
   - マッチング数と率
   - メッセージやり取りがある人数
   - 最近のアクティビティ

2. **有望な相手の特定**
   - メッセージが続いている相手（ニックネームで管理）
   - 相互の関心が高そうな相手
   - 共通点が多い相手
   - 会話の質が高い相手

3. **コミュニケーションパターン**
   - よく使うメッセージの傾向
   - 返信が来やすいメッセージ
   - 会話が盛り上がるトピック
   - 避けた方が良いパターン

4. **進展可能性の評価**
   各マッチング相手について：
   - 現在の関係ステージ（マッチング直後/会話中/デート打診段階）
   - 「付き合える可能性」スコア（1-100）
   - 次のアクション提案
   - 注意すべきポイント

以下のJSON形式で「希望が持てる」視点でまとめてください：
{
  "overall_status": {
    "total_matches": 数値,
    "active_conversations": 数値,
    "high_potential_connections": [
      {
        "nickname": "Aさん",
        "current_stage": "会話が弾んでいる",
        "potential_score": 78,
        "positive_signs": ["返信が早い", "質問してくれる", "笑顔の絵文字多い"],
        "next_action": "週末の予定を聞いてみる",
        "hope_message": "とても良い感じです！このペースで続けましょう"
      }
    ]
  },
  "your_strengths": ["プロフィールの〇〇が好評", "メッセージの雰囲気が良い"],
  "opportunities": ["もっと〇〇の話題を出すと良い", "写真を1枚追加すると印象アップ"],
  "encouragement": "3人の方と良い関係が築けています。特にAさんとは近いうちに進展がありそうです！"
}
`;
    }
    
    // LINEトーク履歴解析プロンプト
    generateLINEChatAnalysisPrompt(): string {
        return `
気になる相手とのLINEトーク画面のスクリーンショットから、「付き合えるかもしれない」可能性と関係の進展度を分析してください。

注意：プライバシー保護のため、具体的な個人情報は伏せて、関係性のパターンのみ分析してください。

分析してほしい要素：

1. **会話の温度感**
   - メッセージの頻度（1日あたり）
   - 返信速度（即レス/数時間/翌日など）
   - メッセージの長さ（短文/長文の割合）
   - 会話の継続性（途切れない/自然に続く）

2. **感情的なつながりの兆候**
   - スタンプ・絵文字の使用頻度と種類
   - 「笑」「ww」など笑いの表現
   - ハートマークの有無と頻度
   - 相手からの質問の多さ
   - 個人的な話題の深さ

3. **関係進展のサイン**
   - 呼び方の変化（敬語→タメ口など）
   - プライベートな話題の増加
   - 未来の話（「今度」「いつか」など）
   - デートの誘い・提案
   - 写真の共有

4. **相性と可能性の評価**
   - 会話のテンポの一致度
   - 話題の広がりやすさ
   - 価値観の共通点
   - お互いの関心度バランス

結果を以下の形式で、希望と可能性を感じられるようにまとめてください：

{
  "relationship_stage": "興味を持ち合っている段階",
  "potential_score": 82,
  "positive_indicators": {
    "communication": ["返信が早い", "会話が自然に続く", "質問し合っている"],
    "emotional": ["笑いが多い", "プライベートな話も増えてきた", "励まし合っている"],
    "future": ["「今度」という言葉が3回出現", "お互いの予定を気にしている"]
  },
  "relationship_momentum": "上昇中 ↗️",
  "next_milestone": "直接会う約束",
  "recommended_actions": [
    "このまま自然な会話を続ける",
    "共通の趣味の話をもっと深める",
    "タイミングを見て軽いお出かけに誘う"
  ],
  "hope_analysis": "とても良い関係性です！相手もあなたに興味を持っているサインが複数見られます。このペースなら1-2週間以内に次のステップに進めそうです。",
  "caution_points": ["焦らずに相手のペースも大切に"],
  "confidence_boost": "あなたの温かいメッセージが相手に好印象を与えています。自信を持って！"
}
`;
    }
    
    // 複数アプリ統合解析プロンプト
    generateMultiAppIntegrationPrompt(): string {
        return `
複数のマッチングアプリ（Pairs、with、Tinder、Bumble等）のスクリーンショットを統合的に分析し、あなたの恋愛の全体像と「付き合える可能性」を最大化する戦略を立てます。

分析内容：

1. **アプリ別パフォーマンス**
   - どのアプリで最も良い反応を得ているか
   - アプリごとの相手の特徴
   - 成功しやすいアプリの特定

2. **全体的な恋愛活動状況**
   - アクティブな会話の総数
   - 有望な相手のリスト（匿名化）
   - 各相手との進展度

3. **リソース配分の最適化**
   - どのアプリ/相手に注力すべきか
   - 時間の使い方の提案
   - 優先順位付け

4. **統合的な可能性評価**
   - 全体での「付き合える可能性」
   - 最も可能性の高い相手TOP3
   - 今後1ヶ月の展望

分析結果：
{
  "overview": {
    "total_active_connections": 数値,
    "high_potential_count": 数値,
    "best_performing_app": "Pairs",
    "overall_momentum": "上昇傾向"
  },
  "top_prospects": [
    {
      "app": "Pairs",
      "nickname": "Aさん",
      "potential_score": 85,
      "current_stage": "デート打診可能",
      "reasoning": "価値観が合い、会話も弾んでいる"
    }
  ],
  "strategic_advice": {
    "focus": "PairsのAさんとwithのBさんに集中",
    "action_plan": "今週中にどちらか1人とデートの約束を",
    "time_allocation": "Pairs 60%、with 30%、その他 10%"
  },
  "monthly_forecast": "現在のペースなら、1ヶ月以内に少なくとも2人とデートが実現し、そのうち1人とは交際に発展する可能性が高いです！",
  "motivation": "あなたは着実に前進しています。数字が証明しています！"
}
`;
    }
    
    // インスタDM解析プロンプト
    generateInstagramDMAnalysisPrompt(): string {
        return `
InstagramのDM画面のスクリーンショットから、恋愛に発展しそうな関係性を分析し、「付き合えるかもしれない」可能性を評価してください。

分析項目：

1. **DMの特徴分析**
   - ストーリーへの反応から始まった会話
   - 共通の趣味・関心事
   - 褒め合いやポジティブな反応
   - 会話の継続性と深まり

2. **Instagram特有のシグナル**
   - ストーリーへの即反応
   - 投稿への「いいね」とコメント
   - DMでのみの特別な会話
   - 写真や動画の共有

3. **関係性の発展可能性**
   - カジュアルな関係からの発展度
   - リアルでの接点の可能性
   - 恋愛感情の芽生え

以下の形式で分析してください：
{
  "dm_connections": [
    {
      "nickname": "Bさん",
      "connection_type": "共通の趣味から",
      "conversation_quality": "深い話もできる関係",
      "romantic_potential": 72,
      "positive_signs": ["褒め合っている", "プライベートな話も", "会いたいという話が出た"],
      "next_steps": "カフェに誘ってみる"
    }
  ],
  "instagram_advantage": "カジュアルな雰囲気で自然に距離が縮まっています",
  "overall_assessment": "InstagramのDMから始まった関係が、リアルな恋愛に発展する良い流れです"
}
`;
    }
}
```

### 2.4 距離感・進捗管理機能

```typescript
class RelationshipProgressManager {
    
    // 関係性の距離感を5段階で管理
    distanceLevels = {
        1: { name: "知り合い", description: "マッチング直後、挨拶程度" },
        2: { name: "興味段階", description: "質問し合い、相手を知る段階" },
        3: { name: "親近感", description: "プライベートな話、冗談も言える" },
        4: { name: "特別な関係", description: "毎日連絡、デートも重ねる" },
        5: { name: "恋人候補", description: "お互いに意識し、告白間近" }
    };
    
    // 距離感の変化を追跡
    async updateRelationshipDistance(
        userId: string,
        connectionId: string,
        indicators: DistanceIndicators
    ): Promise<DistanceUpdate> {
        
        const currentDistance = await this.calculateDistance(indicators);
        const previousDistance = await this.getPreviousDistance(userId, connectionId);
        
        return {
            currentLevel: currentDistance,
            previousLevel: previousDistance,
            change: currentDistance - previousDistance,
            interpretation: this.interpretChange(currentDistance, previousDistance),
            nextSteps: this.suggestNextSteps(currentDistance)
        };
    }
    
    // 進捗を可視化するダッシュボード
    async generateProgressDashboard(
        userId: string
    ): Promise<ProgressDashboard> {
        const connections = await this.getUserConnections(userId);
        
        return {
            overview: {
                totalConnections: connections.length,
                activeConnections: connections.filter(c => c.isActive).length,
                progressingWell: connections.filter(c => c.momentum > 0).length
            },
            connections: connections.map(conn => ({
                nickname: conn.nickname,
                currentStage: conn.stage,
                distanceLevel: conn.distanceLevel,
                momentum: conn.momentum, // -2 to +2
                timeline: this.generateTimeline(conn),
                nextMilestone: this.predictNextMilestone(conn),
                alerts: this.checkAlerts(conn)
            }))
        };
    }
}

// 距離感測定の指標
interface DistanceIndicators {
    messageFrequency: number;      // 1日あたりのメッセージ数
    responseTime: number;          // 平均返信時間（分）
    messageLength: number;         // 平均メッセージ長
    emotionalDepth: number;        // 感情的な話題の深さ (1-10)
    futurePlans: boolean;          // 将来の話をしているか
    personalSharing: number;       // 個人的な情報共有度 (1-10)
    physicalMeetings: number;      // 実際に会った回数
    exclusivityHints: boolean;     // 独占的な関係のヒント
}

// 進捗タイムライン
class RelationshipTimeline {
    
    // 重要なイベントを時系列で管理
    async addTimelineEvent(
        userId: string,
        connectionId: string,
        event: TimelineEvent
    ) {
        const events = [
            { type: 'match', date: '2024-01-15', description: 'マッチング成立' },
            { type: 'first_message', date: '2024-01-15', description: '最初のメッセージ交換' },
            { type: 'phone_number', date: '2024-01-20', description: 'LINE交換' },
            { type: 'deep_talk', date: '2024-01-25', description: '深い話をした' },
            { type: 'first_date', date: '2024-02-01', description: '初デート' },
            { type: 'second_date', date: '2024-02-10', description: '2回目のデート' },
            { type: 'exclusive_talk', date: '2024-02-15', description: '付き合う話が出た' }
        ];
        
        return this.saveEvent(userId, connectionId, event);
    }
    
    // 進捗の速度を分析
    analyzeProgressVelocity(timeline: TimelineEvent[]): ProgressVelocity {
        return {
            averageDaysBetweenMilestones: this.calculateAverageDays(timeline),
            acceleration: this.checkIfAccelerating(timeline),
            comparisonToAverage: this.compareToAverageCouple(timeline),
            forecast: this.forecastNextMilestone(timeline)
        };
    }
}

// 距離感アラート機能
class DistanceAlertSystem {
    
    checkAlerts(connection: Connection): Alert[] {
        const alerts = [];
        
        // 停滞アラート
        if (connection.daysSinceLastProgress > 14) {
            alerts.push({
                type: 'stagnation',
                severity: 'warning',
                message: '2週間進展がありません。新しいアプローチを試してみましょう',
                suggestion: '共通の趣味について深く話してみる'
            });
        }
        
        // 急接近アラート
        if (connection.distanceChangeRate > 0.5) {
            alerts.push({
                type: 'rapid_progress',
                severity: 'info',
                message: '関係が急速に深まっています！',
                suggestion: 'このペースを大切に、でも焦らずに'
            });
        }
        
        // チャンスアラート
        if (connection.readyForNextStep) {
            alerts.push({
                type: 'opportunity',
                severity: 'success',
                message: '次のステップに進む絶好のタイミング！',
                suggestion: 'デートに誘ってみましょう'
            });
        }
        
        return alerts;
    }
}

// 進捗レポート生成
class ProgressReportGenerator {
    
    async generateWeeklyReport(userId: string): Promise<WeeklyReport> {
        const connections = await this.getActiveConnections(userId);
        
        return {
            summary: {
                weeklyHighlight: '今週はAさんとの関係が大きく前進しました！',
                overallProgress: '+15%',
                mostActiveConnection: 'Aさん',
                newMilestones: ['Aさんと初デート', 'BさんとLINE交換']
            },
            
            detailedProgress: connections.map(conn => ({
                nickname: conn.nickname,
                weekStart: {
                    stage: '興味段階',
                    distanceLevel: 2,
                    score: 45
                },
                weekEnd: {
                    stage: '親近感',
                    distanceLevel: 3,
                    score: 65
                },
                keyEvents: [
                    '深い話ができた',
                    'デートの約束をした',
                    '共通の趣味を発見'
                ],
                momentum: '上昇中 ↗️',
                nextWeekFocus: 'デートを成功させる'
            })),
            
            recommendations: [
                'Aさんとのデートは自然体で臨みましょう',
                'Bさんともう少し頻繁にメッセージを',
                'Cさんは様子を見ながらゆっくりと'
            ],
            
            motivationalMessage: 'あなたの恋愛は確実に前進しています。数字がそれを証明しています！'
        };
    }
}

// プロンプト：距離感分析
class DistanceAnalysisPrompts {
    
    generateDistanceAnalysisPrompt(screenshots: string[]): string {
        return `
LINEやマッチングアプリの会話スクリーンショットから、相手との心理的距離感を分析してください。

分析項目：

1. **現在の距離感レベル（1-5段階）**
   - レベル1: 知り合い（挨拶・表面的な会話）
   - レベル2: 興味段階（質問し合い、相手を知ろうとする）
   - レベル3: 親近感（冗談、プライベートな話）
   - レベル4: 特別な関係（毎日連絡、深い信頼）
   - レベル5: 恋人候補（お互いに意識、告白間近）

2. **距離感の変化指標**
   - 敬語→タメ口への変化
   - 呼び方の変化
   - 話題の深さの変化
   - 返信速度の変化
   - 絵文字・スタンプの親密度

3. **進展速度の評価**
   - 一般的なペースと比較
   - 加速している/安定/停滞の判定
   - 次の段階への準備状況

結果：
{
  "current_distance": {
    "level": 3,
    "description": "親近感段階 - 冗談も言い合える関係",
    "confidence": 85
  },
  "distance_change": {
    "two_weeks_ago": 2,
    "one_week_ago": 2.5,
    "current": 3,
    "trend": "着実に縮まっている"
  },
  "key_indicators": {
    "language_style": "敬語とタメ口のミックス",
    "response_time": "30分以内に返信（お互い）",
    "emotional_sharing": "仕事の悩みなど共有",
    "future_mentions": "「今度」が5回登場"
  },
  "progress_assessment": {
    "velocity": "良好なペース",
    "next_milestone": "プライベートで会う",
    "estimated_time": "2-3週間以内",
    "success_probability": 75
  },
  "recommendations": [
    "このペースを維持",
    "もう少し個人的な話題も",
    "次は電話してみる"
  ]
}
`;
    }
}
```

## 3. 実装アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                  Miru フロントエンド                      │
├─────────────────────────────────────────────────────────┤
│  ホーム画面   │  関係管理   │  プロンプト  │  進展可視化   │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                     API Gateway                          │
└─────────────────────────────────────────────────────────┘
                            │
    ┌───────────────────────┼───────────────────────┐
    ▼                       ▼                       ▼
┌───────────┐        ┌───────────┐        ┌───────────┐
│ コンテキスト │        │ プロンプト  │        │  希望体験   │
│   管理      │        │   生成     │        │   記録     │
└───────────┘        └───────────┘        └───────────┘
                            │
                    ┌───────────────┐
                    │   Supabase    │
                    │  PostgreSQL   │
                    └───────────────┘
```

## 4. データベース設計

```sql
-- ユーザーの恋愛コンテキスト
CREATE TABLE romance_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    self_profile JSONB NOT NULL DEFAULT '{}',
    current_situation JSONB NOT NULL DEFAULT '{}',
    desires_and_goals JSONB NOT NULL DEFAULT '{}',
    experience_tracking JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- つながり（関係性）管理
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES romance_contexts(user_id),
    nickname VARCHAR(100) NOT NULL,
    platform VARCHAR(50),
    current_stage VARCHAR(20),
    compatibility JSONB,
    interaction_history JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 希望の瞬間記録
CREATE TABLE hope_moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES romance_contexts(user_id),
    connection_id UUID REFERENCES connections(id),
    description TEXT,
    hope_level INTEGER CHECK (hope_level >= 1 AND hope_level <= 10),
    category VARCHAR(20),
    occurred_at TIMESTAMP DEFAULT NOW()
);

-- 生成されたプロンプト履歴
CREATE TABLE generated_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES romance_contexts(user_id),
    connection_id UUID REFERENCES connections(id),
    prompt_type VARCHAR(50),
    prompt_content TEXT,
    context_used JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 5. 利用フロー

### 5.1 初期設定
1. 基本プロフィール入力
2. 恋愛の目標設定
3. 過去の経験（オプション）

### 5.2 日常利用
1. 新しいつながりを追加
2. 状況に応じたプロンプト取得
3. AIで実行→結果を記録
4. 希望の瞬間を記録

### 5.3 進展確認
1. 関係性の可視化確認
2. HISスコアの推移
3. 次のステップの確認

## 6. 期待される効果

### ユーザー体験価値
- 「付き合えるかもしれない」希望を日々実感
- 関係の進展を客観的に把握
- 適切なタイミングでの行動支援
- 成長と自信の獲得

### プライバシーとエンパワメント
- ユーザー主導のツール利用
- センシティブ情報の保護
- AIへの過度な依存を防ぐ設計

この設計により、プロポーザルの本質的欲求「付き合えるかもしれない希望と可能性を見る体験」を、プロンプトオーケストレーションシステムとして実現できます。
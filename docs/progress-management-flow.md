# Miru 進捗管理フロー

## 1. システムフロー概要

```
1. アプリがプロンプトを生成・表示
   ↓
2. ユーザーがプロンプトをコピー
   ↓
3. ChatGPT/Claudeで実行（スクショと一緒に）
   ↓
4. AIの分析結果をコピー
   ↓
5. アプリに貼り付けて保存
   ↓
6. アプリが進捗を管理・可視化
```

## 2. 距離感・進捗管理の具体的な使い方

### 2.1 初回分析フロー

```typescript
// STEP 1: アプリがプロンプトを表示
interface DistanceAnalysisScreen {
    instruction: "以下のプロンプトをコピーして、LINEのスクリーンショットと一緒にChatGPT/Claudeに送信してください";
    
    prompt: `
    気になる相手とのLINEトーク画面から、現在の距離感を5段階で分析してください。
    
    【距離感レベル】
    レベル1: 知り合い（挨拶程度）
    レベル2: 興味段階（質問し合う）
    レベル3: 親近感（冗談も言える）
    レベル4: 特別な関係（毎日連絡）
    レベル5: 恋人候補（告白間近）
    
    JSON形式で結果を出力してください。
    `;
    
    copyButton: "プロンプトをコピー";
}

// STEP 2: 結果入力画面
interface ResultInputScreen {
    instruction: "ChatGPT/Claudeの分析結果を貼り付けてください";
    
    inputField: TextArea;
    
    exampleFormat: {
        "current_distance": {
            "level": 3,
            "description": "親近感段階"
        },
        "indicators": {
            "response_time": "30分以内",
            "emoji_usage": "多い"
        }
    };
    
    saveButton: "結果を保存";
}
```

### 2.2 定期的な進捗更新

```typescript
class WeeklyProgressUpdate {
    
    // 週次更新プロンプト生成
    generateWeeklyUpdatePrompt(previousData: DistanceData): string {
        return `
先週の分析結果：
- 距離感レベル: ${previousData.level}
- 段階: ${previousData.description}

今週のLINE会話のスクリーンショットから、以下を分析してください：

1. 距離感の変化（先週→今週）
2. 進展した点
3. 新しいマイルストーン（LINE交換、デート約束など）
4. 次週への提案

JSON形式で出力してください。
`;
    }
    
    // 結果を保存して進捗管理
    async saveProgressUpdate(
        userId: string,
        connectionId: string,
        newData: any
    ) {
        // JSONパース
        const parsed = JSON.parse(newData);
        
        // 進捗計算
        const progress = {
            previousLevel: this.getPreviousLevel(connectionId),
            currentLevel: parsed.current_distance.level,
            change: parsed.current_distance.level - this.getPreviousLevel(connectionId),
            trend: this.calculateTrend(connectionId),
            milestones: parsed.new_milestones || []
        };
        
        // 保存
        await this.saveToDatabase(userId, connectionId, progress);
        
        // 可視化用データ返却
        return this.generateVisualization(progress);
    }
}
```

## 3. 進捗ダッシュボード

### 3.1 視覚的な進捗表示

```typescript
interface ProgressDashboard {
    // 関係性一覧
    connections: [
        {
            nickname: "Aさん",
            currentLevel: 3,
            levelName: "親近感",
            progress: "+1 (先週比)",
            trend: "↗️ 上昇中",
            lastUpdated: "3日前"
        },
        {
            nickname: "Bさん",
            currentLevel: 2,
            levelName: "興味段階",
            progress: "±0 (先週比)",
            trend: "→ 維持",
            lastUpdated: "昨日"
        }
    ];
    
    // 進捗グラフ
    progressChart: {
        type: "line",
        data: {
            "Aさん": [1, 2, 2, 3, 3], // 週ごとのレベル
            "Bさん": [1, 1, 2, 2, 2]
        }
    };
    
    // アラート
    alerts: [
        {
            type: "opportunity",
            connection: "Aさん",
            message: "デートに誘う良いタイミングです！"
        },
        {
            type: "attention",
            connection: "Cさん",
            message: "2週間進展がありません"
        }
    ];
}
```

### 3.2 タイムライン管理

```typescript
class RelationshipTimelineManager {
    
    // イベント追加用プロンプト
    generateEventPrompt(): string {
        return `
今回の出来事を分析してください：
- 何が起きたか（マッチング、LINE交換、デート等）
- いつ起きたか
- 関係性への影響
- 次のステップへの示唆

JSON形式で：
{
  "event_type": "first_date",
  "date": "2024-02-15",
  "impact": "positive",
  "description": "カフェで2時間話した",
  "next_step": "2回目のデートを計画"
}
`;
    }
    
    // タイムライン表示
    displayTimeline(connectionId: string): Timeline {
        return {
            events: [
                { date: "1/15", event: "マッチング", level: 1 },
                { date: "1/20", event: "LINE交換", level: 2 },
                { date: "2/1", event: "初デート", level: 3 },
                { date: "2/15", event: "2回目デート", level: 4 }
            ],
            
            visualization: "📱→💬→☕→🍽️→❤️",
            
            daysElapsed: 31,
            averagePace: "良好（平均より少し早い）"
        };
    }
}
```

## 4. 進捗分析レポート

### 4.1 月間レポート生成

```typescript
class MonthlyReportGenerator {
    
    // 月間分析プロンプト
    generateMonthlyAnalysisPrompt(connections: Connection[]): string {
        return `
以下の各関係性について、今月の総合評価をしてください：

${connections.map(c => `
${c.nickname}:
- 月初レベル: ${c.startLevel}
- 月末レベル: ${c.currentLevel}
- 主な出来事: ${c.events.join(', ')}
`).join('\n')}

分析項目：
1. 最も進展した関係
2. 停滞している関係
3. 来月の重点アクション
4. 全体的な恋愛運の向上度

JSON形式で出力してください。
`;
    }
    
    // レポート表示
    displayMonthlyReport(analysisResult: string): MonthlyReport {
        const parsed = JSON.parse(analysisResult);
        
        return {
            summary: {
                totalProgress: "+25%",
                bestConnection: parsed.most_progressed,
                achievement: "Aさんと交際間近！"
            },
            
            insights: [
                "積極的なアプローチが功を奏しています",
                "複数の関係を並行して進められています",
                "来月には告白のチャンスがありそうです"
            ],
            
            visualization: {
                beforeAfter: "😐 → 😊",
                progressBar: "████████░░ 80%",
                forecast: "来月には彼氏/彼女ができる可能性大！"
            }
        };
    }
}
```

## 5. データ管理

### 5.1 シンプルなデータ構造

```typescript
// ローカルストレージまたはSupabaseに保存
interface StoredProgress {
    userId: string;
    connections: {
        [connectionId: string]: {
            nickname: string;
            history: DistanceLevel[];
            events: TimelineEvent[];
            lastAnalysis: Date;
            currentLevel: number;
            trend: 'up' | 'stable' | 'down';
        }
    };
    lastUpdated: Date;
}

// 保存処理
class ProgressStorage {
    async saveAnalysisResult(
        userId: string,
        connectionId: string,
        analysisResult: string
    ) {
        try {
            const parsed = JSON.parse(analysisResult);
            
            const progress = await this.getProgress(userId);
            
            // 更新
            progress.connections[connectionId] = {
                ...progress.connections[connectionId],
                currentLevel: parsed.current_distance.level,
                lastAnalysis: new Date(),
                history: [
                    ...progress.connections[connectionId].history,
                    {
                        level: parsed.current_distance.level,
                        date: new Date()
                    }
                ]
            };
            
            await this.save(progress);
            
            return { success: true, message: "保存しました！" };
            
        } catch (error) {
            return { success: false, message: "JSONの形式を確認してください" };
        }
    }
}
```

## 6. 使用フローまとめ

1. **初回セットアップ**
   - 相手のニックネーム登録
   - 初回分析プロンプト取得
   - ChatGPT/Claudeで分析
   - 結果を入力

2. **週次更新**
   - 更新プロンプト取得（前回データ含む）
   - 新しいスクショで分析
   - 結果を入力
   - 進捗確認

3. **イベント記録**
   - デートなどのイベント用プロンプト
   - 分析結果入力
   - タイムライン更新

4. **月間振り返り**
   - 総合分析プロンプト
   - レポート生成
   - 来月の戦略確認

このシステムにより、ユーザーは自分のペースで恋愛の進捗を管理し、「付き合えるかもしれない」希望を数値で確認できます！
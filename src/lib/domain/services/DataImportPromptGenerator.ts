import { DataImportPromptConfig, GeneratedPrompt, PromptStep } from '@/types/data-import'

export class DataImportPromptGenerator {
  
  /**
   * メインのデータインポートプロンプトを生成
   */
  generateMainPrompt(config: DataImportPromptConfig): GeneratedPrompt {
    const steps = this.generatePromptSteps(config)
    const fullPrompt = this.assembleFullPrompt(steps, config)
    
    return {
      id: `import_${Date.now()}`,
      title: 'Miru恋愛状況データインポート',
      fullPrompt,
      steps,
      expectedOutputSchema: this.getOutputSchema(),
      estimatedTime: '15-30分'
    }
  }
  
  /**
   * プロンプトステップを生成
   */
  private generatePromptSteps(config: DataImportPromptConfig): PromptStep[] {
    const steps: PromptStep[] = [
      {
        id: 'introduction',
        title: '導入説明',
        description: 'データ収集の目的と手順を説明',
        required: true,
        examples: []
      },
      {
        id: 'basic_profile',
        title: '基本プロフィール',
        description: 'ユーザーの基本情報を収集',
        required: true,
        examples: [
          '年齢: 28歳',
          '職業: ITエンジニア',
          '居住地: 東京都渋谷区',
          '恋愛経験: ある程度経験がある'
        ]
      },
      {
        id: 'dating_apps',
        title: '利用中の恋愛アプリ',
        description: '現在使用している恋愛アプリの状況',
        required: true,
        examples: [
          'Tinder: アクティブ、プレミアム会員',
          'Pairs: 一時停止中',
          'Omiai: 使用したことがない'
        ],
        screenshotInstructions: '各アプリのマッチ一覧画面、プロフィール設定画面のスクリーンショットを提供してください'
      },
      {
        id: 'current_connections',
        title: '現在の気になる人たち',
        description: '進行中の関係や気になる人の詳細情報',
        required: true,
        examples: [
          'ニックネーム: さくらさん',
          'アプリ: Pairs',
          '年齢: 26歳',
          '職業: 看護師',
          '最初のマッチ: 2週間前',
          '最後のメッセージ: 昨日の夜'
        ],
        screenshotInstructions: 'メッセージ履歴、プロフィール画面、写真（プライバシーに配慮）のスクリーンショットを提供してください'
      },
      {
        id: 'communication_analysis',
        title: 'コミュニケーション分析',
        description: 'メッセージのやり取りや会話パターンの分析',
        required: true,
        examples: [
          '返信速度: 通常1-2時間以内',
          'メッセージの長さ: 中程度（2-3行）',
          '絵文字使用: 適度に使用',
          '話題: 仕事、趣味、食べ物の話が多い'
        ],
        screenshotInstructions: '最近のメッセージ履歴（個人情報は隠して）のスクリーンショットを提供してください'
      },
      {
        id: 'meeting_history',
        title: 'デート・会った履歴',
        description: '実際に会った経験やデートの履歴',
        required: false,
        examples: [
          '初回デート: カフェで2時間',
          '場所: 渋谷のスターバックス',
          '印象: 良好、会話が弾んだ',
          '次回の約束: 今度は映画を見に行く予定'
        ]
      },
      {
        id: 'feelings_assessment',
        title: '感情・評価の状況',
        description: 'それぞれの人に対する感情や評価を数値化',
        required: true,
        examples: [
          '魅力度: 8/10',
          '相性: 7/10',
          'コミュニケーション: 9/10',
          '期待値: 8/10',
          '不安度: 3/10'
        ]
      },
      {
        id: 'goals_concerns',
        title: '目標と懸念点',
        description: '今後の目標と気になる点・不安要素',
        required: true,
        examples: [
          '目標: 真剣な恋愛関係を築きたい',
          '懸念: 相手の本当の気持ちがわからない',
          '不安: メッセージの頻度が減ってきた気がする'
        ]
      }
    ]
    
    return steps.filter(step => config.focusAreas.includes(step.id as any) || step.required)
  }
  
  /**
   * 完全なプロンプトを組み立て
   */
  private assembleFullPrompt(steps: PromptStep[], config: DataImportPromptConfig): string {
    return `# Miru恋愛状況データインポート・プロンプト

あなたは恋愛コーチングAIアシスタントです。私の現在の恋愛状況を詳しく聞き取り、最終的にJSON形式で出力してください。

## 📋 データ収集手順

以下の項目について、段階的に質問してください。私が各項目に回答した後、次の項目に進んでください。
${config.includeScreenshots ? '\n**重要**: 各項目で指示がある場合は、関連するスクリーンショットも提供します。' : ''}

### 収集項目一覧

${steps.map((step, index) => `
**${index + 1}. ${step.title}** ${step.required ? '(必須)' : '(任意)'}
${step.description}

例:
${step.examples.map(ex => `- ${ex}`).join('\n')}

${step.screenshotInstructions ? `📸 スクリーンショット指示: ${step.screenshotInstructions}` : ''}
`).join('\n')}

## 🔄 進行方法

1. **一項目ずつ進行**: 上記の順番で1つずつ質問してください
2. **詳細確認**: 不明な点があれば追加質問をしてください
3. **完了確認**: すべての項目が終わったら「すべての項目についてお聞きしました。他に追加したい情報はありますか？」と確認してください
4. **最終確認**: 私が「完了した」または「以上です」と答えたら、JSON出力に進んでください

## 📤 最終出力形式

すべての情報収集が完了したら、以下のJSON形式で出力してください:

\`\`\`json
{
  "connections": [
    {
      "nickname": "相手のニックネーム",
      "platform": "使用アプリ名",
      "age": 年齢,
      "occupation": "職業",
      "hobbies": ["趣味1", "趣味2"],
      "currentStage": "現在の段階",
      "attractionLevel": 魅力度(1-10),
      "compatibilityScore": 相性(1-10),
      "communicationScore": コミュニケーション(1-10),
      "messageHistory": [
        {
          "date": "2024-01-01",
          "sender": "user",
          "content": "メッセージ内容"
        }
      ],
      "userFeelings": {
        "excitement": 興奮度(1-10),
        "anxiety": 不安度(1-10),
        "confidence": 自信度(1-10),
        "hopefulness": 希望度(1-10)
      },
      "personalGoals": ["目標1", "目標2"],
      "concerns": ["懸念点1", "懸念点2"]
    }
  ],
  "userProfile": {
    "age": 年齢,
    "occupation": "職業",
    "relationshipGoals": ["目標タイプ"],
    "datingExperience": "経験レベル",
    "currentApps": [
      {
        "appName": "アプリ名",
        "accountStatus": "アクティブ状態",
        "premiumFeatures": プレミアム有無
      }
    ]
  },
  "importMetadata": {
    "importDate": "${new Date().toISOString()}",
    "dataSource": "gemini",
    "completeness": 100,
    "screenshotsProvided": ${config.includeScreenshots},
    "userConfirmed": true
  }
}
\`\`\`

---

**それでは、最初の項目「基本プロフィール」から始めさせていただきます。**

あなたの年齢、職業、居住地域、これまでの恋愛経験について教えてください。`
  }
  
  /**
   * 期待される出力スキーマを取得
   */
  private getOutputSchema() {
    return {
      type: 'object',
      required: ['connections', 'userProfile', 'importMetadata'],
      properties: {
        connections: {
          type: 'array',
          items: {
            type: 'object',
            required: ['nickname', 'platform', 'currentStage'],
            properties: {
              nickname: { type: 'string' },
              platform: { type: 'string' },
              age: { type: 'number' },
              currentStage: { 
                type: 'string',
                enum: ['matching', 'chatting', 'planning_date', 'dating', 'relationship', 'complicated', 'ended']
              },
              attractionLevel: { type: 'number', minimum: 1, maximum: 10 },
              compatibilityScore: { type: 'number', minimum: 1, maximum: 10 },
              communicationScore: { type: 'number', minimum: 1, maximum: 10 }
            }
          }
        },
        userProfile: {
          type: 'object',
          required: ['age', 'occupation', 'relationshipGoals'],
          properties: {
            age: { type: 'number' },
            occupation: { type: 'string' },
            relationshipGoals: { type: 'array', items: { type: 'string' } }
          }
        },
        importMetadata: {
          type: 'object',
          required: ['importDate', 'dataSource', 'userConfirmed'],
          properties: {
            importDate: { type: 'string' },
            dataSource: { type: 'string' },
            userConfirmed: { type: 'boolean' }
          }
        }
      }
    }
  }
  
  /**
   * 特定のプラットフォーム向けのプロンプトを生成
   */
  generatePlatformSpecificPrompt(platform: 'gemini' | 'claude' | 'chatgpt', config: DataImportPromptConfig): string {
    const basePrompt = this.generateMainPrompt(config)
    
    const platformInstructions = {
      gemini: `
## 🤖 Google Gemini向け指示

このプロンプトをGemini（Bard）にコピーして貼り付け、私の恋愛状況について詳しく教えてください。
Geminiは画像分析も得意なので、スクリーンショットがある場合は一緒にアップロードしてください。`,
      
      claude: `
## 🤖 Claude向け指示

このプロンプトをClaude（Anthropic）にコピーして貼り付け、私の恋愛状況について詳しく教えてください。
Claudeは対話形式で丁寧に質問してくれるので、リラックスして答えてください。`,
      
      chatgpt: `
## 🤖 ChatGPT向け指示

このプロンプトをChatGPT（OpenAI）にコピーして貼り付け、私の恋愛状況について詳しく教えてください。
画像がある場合はChatGPT-4Visionを使用してアップロードしてください。`
    }
    
    return `${platformInstructions[platform]}

${basePrompt.fullPrompt}

---
**作成者**: Miru AI恋愛オーケストレーションシステム
**生成時刻**: ${new Date().toLocaleString('ja-JP')}`
  }
}
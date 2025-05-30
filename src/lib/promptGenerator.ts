import { Connection, AIType, PromptTemplate } from '@/types'

export class PromptGenerator {
  private promptTemplates: Record<string, PromptTemplate> = {
    first_message: {
      id: 'first_message',
      category: 'initial_contact',
      title: '最初のメッセージ作成',
      description: 'マッチング相手への初回メッセージを作成します',
      template: 'first_message_template',
      ai_types: ['claude', 'gpt', 'gemini']
    },
    date_invitation: {
      id: 'date_invitation',
      category: 'relationship_building',
      title: 'デートの誘い方',
      description: '自然で効果的なデートの誘い方を提案します',
      template: 'date_invitation_template',
      ai_types: ['claude', 'gpt', 'gemini']
    },
    progress_analysis: {
      id: 'progress_analysis',
      category: 'analysis',
      title: '関係性の進展分析',
      description: '現在の関係性を分析し、次のステップを提案します',
      template: 'progress_analysis_template',
      ai_types: ['claude', 'gpt', 'gemini']
    }
  }

  /**
   * 最初のメッセージ用プロンプトを生成
   */
  generateFirstMessagePrompt(connection: Connection, aiType: AIType): string {
    const baseContext = this.formatConnectionContext(connection)

    const aiSpecificPrompts = {
      claude: `
私の状況について慎重に分析して、最適な最初のメッセージを提案してください。

${baseContext}

【分析してほしいこと】
1. 相手のプロフィールから読み取れる人物像
2. 共通点や話題にできそうなポイント
3. 自然で印象的な最初のメッセージ（3パターン）
4. それぞれのメッセージの効果的な理由

慎重で論理的な分析をお願いします。
`,
      gpt: `
${connection.nickname}さんへの最初のメッセージで印象を残したい！創造的なアイデアをください！

${baseContext}

【提案してほしいこと】
1. ユニークで記憶に残るメッセージ（3パターン）
2. 相手の興味を引くオープニング
3. 自然に会話につながる話題
4. 避けるべきNG表現

実践的で効果的なアイデアをお願いします！
`,
      gemini: `
データに基づいた最適な最初のメッセージを分析してください。

${baseContext}

【分析項目】
1. プロフィール情報からの相性度分析
2. 返信率が高いメッセージパターン
3. 成功確率を最大化するアプローチ（3パターン）
4. 各アプローチの期待される成功確率（%）

統計的観点から最適解を提示してください。
`
    }

    return aiSpecificPrompts[aiType]
  }

  /**
   * デート誘いプロンプトを生成
   */
  generateDateInvitationPrompt(connection: Connection, aiType: AIType): string {
    const baseContext = this.formatConnectionContext(connection)

    const aiSpecificPrompts = {
      claude: `
${connection.nickname}さんをデートに誘うための戦略を慎重に分析してください。

${baseContext}

【現在の関係性】
- ステージ: ${connection.current_stage}
- これまでの会話: ${connection.communication.communicationStyle || '未記録'}

【分析項目】
1. デートに誘うタイミングとして適切か
2. 相手の趣味嗜好に合うデートプラン
3. 成功確率の高い誘い方（段階的アプローチ）
4. 断られた場合の関係継続策

リスクも含めてバランスの取れた提案をお願いします。
`,
      gpt: `
${connection.nickname}さんとの素敵なデートを実現させたい！

${baseContext}

【創造的な提案をお願いします】
1. 相手が興味を持ちそうなユニークなデートアイデア（5つ）
2. 自然にデートに誘う会話の流れ（シナリオ付き）
3. 相手のタイプに合わせた誘い文句
4. デート成功のための事前準備

わくわくするようなアイデアをください！
`,
      gemini: `
デート誘いの成功確率を最大化する戦略を分析してください。

${baseContext}

【データ分析項目】
1. 現在の関係性レベル（1-10）
2. デート誘い成功の最適タイミング
3. 相手の属性から予測される好みのデートタイプ
4. 各アプローチの成功確率と期待値

定量的な分析結果を提示してください。
`
    }

    return aiSpecificPrompts[aiType]
  }

  /**
   * 関係性進展分析プロンプトを生成
   */
  generateProgressAnalysisPrompt(connection: Connection, aiType: AIType): string {
    const baseContext = this.formatConnectionContext(connection)

    const aiSpecificPrompts = {
      claude: `
${connection.nickname}さんとの関係について、現状分析と今後の戦略を検討してください。

${baseContext}

【分析してほしいこと】
1. 現在の関係性の健全度
2. 相手の関心度の推測（根拠とともに）
3. 次のステップへの準備状況
4. 関係を深めるための具体的アクション
5. 注意すべきリスク要因

客観的で建設的な分析をお願いします。
`,
      gpt: `
${connection.nickname}さんとの関係をもっと素敵にしたい！

${baseContext}

【希望の分析をお願いします】
1. 「付き合えるかもしれない」度合い（希望的観測込み）
2. 関係がうまくいっているサイン
3. さらに仲良くなるためのアイデア
4. 明るい未来への道筋

前向きで希望が持てる分析をください！
`,
      gemini: `
関係の進展度を定量的に分析してください。

${baseContext}

【定量分析項目】
1. 現在の関係進展度スコア（0-100）
2. 「付き合える可能性」の確率（%）
3. 次のマイルストーンまでの推定期間
4. 希望スコア（HIS）の算出
5. 成功に向けた最適化要因

数値とデータに基づいた分析をお願いします。
`
    }

    return aiSpecificPrompts[aiType]
  }

  /**
   * 汎用的なコンテキスト別プロンプト生成
   */
  generateContextualPrompt(
    promptType: string,
    connection: Connection,
    aiType: AIType
  ): string {
    switch (promptType) {
      case 'first_message':
        return this.generateFirstMessagePrompt(connection, aiType)
      case 'date_invitation':
        return this.generateDateInvitationPrompt(connection, aiType)
      case 'progress_analysis':
        return this.generateProgressAnalysisPrompt(connection, aiType)
      case 'relationship_advice':
        return this.generateRelationshipAdvicePrompt(connection, aiType)
      default:
        throw new Error(`Unknown prompt type: ${promptType}`)
    }
  }

  /**
   * 関係性アドバイスプロンプトを生成
   */
  private generateRelationshipAdvicePrompt(connection: Connection, aiType: AIType): string {
    const baseContext = this.formatConnectionContext(connection)

    return `
${connection.nickname}さんとの関係についてアドバイスをください。

${baseContext}

現在の状況を踏まえて、最適なアクションを提案してください。
`
  }

  /**
   * 相手情報をフォーマットしてコンテキストを作成
   */
  private formatConnectionContext(connection: Connection): string {
    return `
【相手の情報】
- ニックネーム: ${connection.nickname}
- 出会った場所: ${connection.platform}
- 現在の関係: ${connection.current_stage}

【基本情報】
- 年齢: ${connection.basic_info.age || '不明'}
- 職業: ${connection.basic_info.occupation || '不明'}
- 趣味: ${connection.basic_info.hobbies?.join('、') || '不明'}
- 居住地: ${connection.basic_info.location || '不明'}

【コミュニケーション】
- 頻度: ${connection.communication.frequency || '不明'}
- 最後の連絡: ${connection.communication.lastContact || '不明'}
- スタイル: ${connection.communication.communicationStyle || '不明'}

【あなたの気持ち】
- 期待: ${connection.user_feelings.expectations || '不明'}
- 不安: ${connection.user_feelings.concerns || '不明'}
- 魅力的な点: ${connection.user_feelings.attractivePoints?.join('、') || '不明'}
`
  }

  /**
   * プロンプトテンプレートを取得
   */
  getPromptTemplate(promptType: string): PromptTemplate | null {
    return this.promptTemplates[promptType] || null
  }

  /**
   * 利用可能なプロンプトタイプの一覧を取得
   */
  getAvailablePromptTypes(): string[] {
    return Object.keys(this.promptTemplates)
  }
}
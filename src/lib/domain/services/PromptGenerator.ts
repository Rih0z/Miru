import { Connection, AIType } from '@/types'
import { IPromptGenerator } from '../interfaces/IPromptGenerator'
import { IPromptTemplateProvider } from '../interfaces/IPromptTemplateProvider'
import { IContextFormatter } from '../interfaces/IContextFormatter'

export class PromptGenerator implements IPromptGenerator {
  constructor(
    private readonly templateProvider: IPromptTemplateProvider,
    private readonly contextFormatter: IContextFormatter
  ) {}

  generateFirstMessagePrompt(connection: Connection, aiType: AIType): string {
    const baseContext = this.contextFormatter.formatConnectionContext(connection)

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

  generateDateInvitationPrompt(connection: Connection, aiType: AIType): string {
    const baseContext = this.contextFormatter.formatConnectionContext(connection)

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

  generateProgressAnalysisPrompt(connection: Connection, aiType: AIType): string {
    const baseContext = this.contextFormatter.formatConnectionContext(connection)

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

  generateContextualPrompt(promptType: string, connection: Connection, aiType: AIType): string {
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

  generateConversationPrompt(connection: Connection, aiType: AIType): string {
    const baseContext = this.contextFormatter.formatConnectionContext(connection)
    
    const aiSpecificPrompts = {
      claude: `恋愛関係での会話を深めるアドバイスをお願いします。\n\n${baseContext}\n\n相手との関係性を考慮して、自然で効果的な会話のアプローチを提案してください。`,
      gpt: `${connection.nickname}さんとの会話をもっと深めたいです！\n\n${baseContext}\n\n楽しくて意味のある会話のアイデアを教えてください。`,
      gemini: `会話の質を向上させるための戦略的アドバイスをお願いします。\n\n${baseContext}\n\n心理学的観点から効果的な会話術を提案してください。`
    }
    
    return aiSpecificPrompts[aiType]
  }

  generateDatePrompt(connection: Connection, aiType: AIType): string {
    const baseContext = this.contextFormatter.formatConnectionContext(connection)
    
    const aiSpecificPrompts = {
      claude: `${connection.nickname}さんとのデートの準備について相談です。\n\n${baseContext}\n\n相手の興味や関係性を考慮した、成功するデートプランを提案してください。`,
      gpt: `素敵なデートを計画したいです！\n\n${baseContext}\n\n創造的で思い出に残るデートアイデアをお願いします。`,
      gemini: `効果的なデート戦略を教えてください。\n\n${baseContext}\n\n相手の性格と嗜好に基づいた最適なデートプランを提案してください。`
    }
    
    return aiSpecificPrompts[aiType]
  }

  generateRelationshipPrompt(connection: Connection, aiType: AIType): string {
    const baseContext = this.contextFormatter.formatConnectionContext(connection)
    
    const aiSpecificPrompts = {
      claude: `${connection.nickname}さんとの関係をより深めるための長期的なアドバイスをお願いします。\n\n${baseContext}\n\n持続的で健全な関係構築のための戦略を提案してください。`,
      gpt: `${connection.nickname}さんとの関係を次のレベルに進めたいです！\n\n${baseContext}\n\n愛情深い関係を築くためのアイデアを教えてください。`,
      gemini: `関係性の発展に関する科学的アプローチを教えてください。\n\n${baseContext}\n\n心理学的根拠に基づいた関係強化の方法を提案してください。`
    }
    
    return aiSpecificPrompts[aiType]
  }

  generateGeneralPrompt(connection: Connection, aiType: AIType): string {
    const baseContext = this.contextFormatter.formatConnectionContext(connection)
    
    const aiSpecificPrompts = {
      claude: `恋愛関係の相談です。以下の情報を踏まえて、アドバイスをお願いします。\n\n${baseContext}\n\n慎重に分析して、具体的で実行可能なアドバイスを提供してください。`,
      gpt: `恋愛コーチとして相談に乗ってください！\n\n${baseContext}\n\n創造的なアイデアと前向きなアドバイスをお願いします。`,
      gemini: `データに基づいた恋愛アドバイスをお願いします。\n\n${baseContext}\n\n客観的な分析と実践的な提案をお願いします。`
    }
    
    return aiSpecificPrompts[aiType]
  }

  getPromptTemplate(promptType: string) {
    return this.templateProvider.getPromptTemplate(promptType)
  }

  getAvailablePromptTypes(): string[] {
    return this.templateProvider.getAvailablePromptTypes()
  }

  private generateRelationshipAdvicePrompt(connection: Connection, aiType: AIType): string {
    const baseContext = this.contextFormatter.formatConnectionContext(connection)

    return `
${connection.nickname}さんとの関係についてアドバイスをください。

${baseContext}

現在の状況を踏まえて、最適なアクションを提案してください。
`
  }
}
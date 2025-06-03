import { Connection, ConnectionStage, RecommendedAction, DashboardData } from '@/types'
import { db } from './supabase'

export class ConnectionService {
  /**
   * 新しい相手を作成
   */
  async createConnection(
    userId: string,
    connectionData: Omit<Connection, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Connection> {
    // 入力値検証とサニタイゼーション
    this.validateAndSanitizeInput(connectionData)

    const connection = {
      user_id: userId,
      ...connectionData,
    }

    return await db.createConnection(connection)
  }

  /**
   * 相手情報を更新
   */
  async updateConnection(
    connectionId: string,
    updates: Partial<Connection>
  ): Promise<Connection> {
    // 更新データに文字列フィールドが含まれている場合は検証
    if (updates.nickname || updates.platform) {
      this.validateAndSanitizeInput(updates)
    }
    
    return await db.updateConnection(connectionId, updates)
  }


  /**
   * 関係性スコアを計算
   */
  calculateRelationshipScore(connection: Connection): number {
    let score = 0

    // ステージによる基本スコア
    const stageScores = {
      'マッチング直後': 10,
      'メッセージ中': 25,
      'LINE交換済み': 40,
      'デート前': 55,
      'デート後': 70,
      '交際中': 90,
      '停滞中': 20,
      '終了': 0
    }

    score += stageScores[connection.current_stage] || 0

    // コミュニケーション頻度による加点
    if (connection.communication.frequency === '毎日') {
      score += 15
    } else if (connection.communication.frequency === '数日に1回') {
      score += 10
    } else if (connection.communication.frequency === '週1回') {
      score += 5
    }

    // 共通点による加点
    if (connection.basic_info.hobbies && connection.basic_info.hobbies.length > 0) {
      score += connection.basic_info.hobbies.length * 2
    }

    // 100を上限とする
    return Math.min(score, 100)
  }


  /**
   * 関係ステージ更新の検証と更新
   */
  async updateConnectionStage(
    connectionId: string,
    newStage: ConnectionStage
  ): Promise<Connection> {
    const validStages: ConnectionStage[] = [
      'マッチング直後',
      'メッセージ中',
      'LINE交換済み',
      'デート前',
      'デート後',
      '交際中',
      '停滞中',
      '終了'
    ]

    if (!validStages.includes(newStage)) {
      throw new Error('無効なステージです')
    }

    return await db.updateConnection(connectionId, {
      current_stage: newStage
    })
  }

  /**
   * 入力値の検証とサニタイゼーション
   */
  private validateAndSanitizeInput(connectionData: any): void {
    // 入力値検証とサニタイゼーション
    if (!connectionData.nickname?.trim()) {
      throw new Error('ニックネームは必須です')
    }
    
    if (!connectionData.platform?.trim()) {
      throw new Error('出会った場所は必須です')
    }

    // XSS対策：文字列の長さ制限
    if (connectionData.nickname.trim().length > 50) {
      throw new Error('ニックネームは50文字以内で入力してください')
    }

    if (connectionData.platform.trim().length > 100) {
      throw new Error('出会った場所は100文字以内で入力してください')
    }

    // 危険な文字列パターンのチェック
    const dangerousPattern = /<script|javascript:|data:|vbscript:/i
    if (dangerousPattern.test(connectionData.nickname) || dangerousPattern.test(connectionData.platform)) {
      throw new Error('不正な文字列が含まれています')
    }
  }

  /**
   * すべての相手を取得
   */
  async getUserConnections(userId: string): Promise<Connection[]> {
    return await db.getConnections(userId)
  }

  /**
   * 相手を削除
   */
  async deleteConnection(connectionId: string): Promise<void> {
    await db.deleteConnection(connectionId)
  }

  /**
   * ダッシュボードデータを取得
   */
  async getDashboardData(userId: string): Promise<DashboardData> {
    const connections = await this.getUserConnections(userId)
    
    // アクティブな関係（終了以外）を計算
    const activeConnections = connections.filter(c => c.current_stage !== '終了').length
    
    // 平均スコアを計算
    let averageScore = 0
    if (connections.length > 0) {
      const totalScore = connections.reduce((sum, connection) => {
        return sum + this.calculateRelationshipScore(connection)
      }, 0)
      averageScore = Math.round(totalScore / connections.length)
    }
    
    // 最も有望な関係を見つける（スコアが最も高い）
    let bestConnection: Connection | null = null
    if (connections.length > 0) {
      bestConnection = connections.reduce((best, current) => {
        const currentScore = this.calculateRelationshipScore(current)
        const bestScore = this.calculateRelationshipScore(best)
        return currentScore > bestScore ? current : best
      })
    }
    
    // 推奨アクションを生成（アクティブな関係から、緊急度の高いものを優先）
    const recommendedActions: RecommendedAction[] = connections
      .filter(c => c.current_stage !== '終了')
      .map(connection => this.getRecommendedAction(connection))
      .sort((a, b) => {
        // 緊急度でソート（critical > high > medium > low）
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
      })
      .slice(0, 5) // 最大5件まで
    
    return {
      connections,
      totalConnections: connections.length,
      activeConnections,
      averageScore,
      recommendedActions,
      bestConnection
    }
  }

  /**
   * 推奨アクションを取得
   */
  getRecommendedAction(connection: Connection): RecommendedAction {
    const baseAction = {
      id: `action_${connection.id}_${Date.now()}`,
      connection_id: connection.id,
      prompt_type: 'general'
    }

    switch (connection.current_stage) {
      case 'マッチング直後':
        return {
          ...baseAction,
          title: '最初のメッセージを送りましょう',
          description: 'プロフィールを参考に親しみやすいメッセージを作成',
          urgency: 'high' as const,
          prompt_type: 'first_message',
          estimated_time: '5-10分'
        }

      case 'メッセージ中':
        return {
          ...baseAction,
          title: '会話を深めましょう',
          description: '共通の話題や趣味について詳しく聞いてみる',
          urgency: 'medium' as const,
          prompt_type: 'deepen_conversation',
          estimated_time: '10-15分'
        }

      case 'LINE交換済み':
        return {
          ...baseAction,
          title: 'デートの提案をしましょう',
          description: '相手の興味に合わせたデートプランを提案',
          urgency: 'high' as const,
          prompt_type: 'date_preparation',
          estimated_time: '15-20分'
        }

      case 'デート前':
        return {
          ...baseAction,
          title: 'デートの準備をしましょう',
          description: '話題の準備や当日の流れを確認',
          urgency: 'medium' as const,
          prompt_type: 'date_preparation',
          estimated_time: '20-30分'
        }

      case 'デート後':
        return {
          ...baseAction,
          title: 'お礼のメッセージを送りましょう',
          description: 'デートの感想と次の約束について',
          urgency: 'high' as const,
          prompt_type: 'relationship_building',
          estimated_time: '5-10分'
        }

      case '交際中':
        return {
          ...baseAction,
          title: '関係を深めましょう',
          description: '今後の関係性について話し合う',
          urgency: 'low' as const,
          prompt_type: 'relationship_building',
          estimated_time: '15-20分'
        }

      case '停滞中':
        return {
          ...baseAction,
          title: '関係を復活させましょう',
          description: '新しいアプローチで会話を再開',
          urgency: 'critical' as const,
          prompt_type: 'general',
          estimated_time: '10-15分'
        }

      default:
        return {
          ...baseAction,
          title: '次のステップを検討',
          description: '現在の状況を分析して最適なアクションを決定',
          urgency: 'medium' as const,
          prompt_type: 'general',
          estimated_time: '10-15分'
        }
    }
  }
}
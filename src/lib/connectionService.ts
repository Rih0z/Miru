import { Connection, ConnectionStage, RecommendedAction, DashboardData } from '@/types'
import { db } from './supabase'

export class ConnectionService {
  /**
   * 新しい相手を作成（デモモード対応）
   */
  async createConnection(
    userId: string,
    connectionData: Omit<Connection, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Connection> {
    // 入力値検証とサニタイゼーション
    this.validateAndSanitizeInput(connectionData)

    const connection = {
      id: `demo-conn-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...connectionData,
    }

    // デモユーザーの場合はローカルに保存せずそのまま返す
    if (userId === 'demo-user-001') {
      return connection as Connection
    }

    try {
      return await db.createConnection(connection)
    } catch (error) {
      console.warn('Supabase接続エラー、デモモードで続行:', error)
      return connection as Connection
    }
  }

  /**
   * 相手情報を更新（デモモード対応）
   */
  async updateConnection(
    connectionId: string,
    updates: Partial<Connection>
  ): Promise<Connection> {
    // 更新データに文字列フィールドが含まれている場合は検証
    if (updates.nickname || updates.platform) {
      this.validateAndSanitizeInput(updates)
    }

    // デモモードの場合は更新されたオブジェクトを返す
    if (connectionId.startsWith('demo-conn-')) {
      const updatedConnection = {
        id: connectionId,
        user_id: 'demo-user-001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        nickname: 'デモユーザー',
        platform: 'デモ',
        current_stage: 'メッセージ中' as ConnectionStage,
        basic_info: {},
        communication: {},
        ...updates
      } as Connection
      
      return updatedConnection
    }
    
    try {
      return await db.updateConnection(connectionId, updates)
    } catch (error) {
      console.warn('Supabase接続エラー、デモモードで続行:', error)
      return {
        id: connectionId,
        user_id: 'demo-user-001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        nickname: 'デモユーザー',
        platform: 'デモ',
        current_stage: 'メッセージ中' as ConnectionStage,
        basic_info: {},
        communication: {},
        ...updates
      } as Connection
    }
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
   * 相手を削除（デモモード対応）
   */
  async deleteConnection(connectionId: string): Promise<void> {
    // デモモードの場合は何もしない
    if (connectionId.startsWith('demo-conn-')) {
      console.log('デモデータの削除をシミュレート:', connectionId)
      return
    }
    
    try {
      await db.deleteConnection(connectionId)
    } catch (error) {
      console.warn('Supabase接続エラー、デモモードで続行:', error)
    }
  }

  /**
   * ダッシュボードデータを取得（デモモード対応）
   */
  async getDashboardData(userId: string): Promise<DashboardData> {
    let connections: Connection[]
    
    // デモユーザーの場合はデモデータを返す
    if (userId === 'demo-user-001') {
      connections = this.getDemoConnections()
    } else {
      try {
        connections = await this.getUserConnections(userId)
      } catch (error) {
        console.warn('Supabase接続エラー、デモデータを使用:', error)
        connections = this.getDemoConnections()
      }
    }
    
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
   * デモ用のサンプルデータを生成
   */
  private getDemoConnections(): Connection[] {
    return [
      {
        id: 'demo-conn-1',
        user_id: 'demo-user-001',
        nickname: 'あやかさん',
        platform: 'マッチングアプリ',
        current_stage: 'LINE交換済み',
        basic_info: {
          age: 26,
          occupation: 'デザイナー',
          hobbies: ['カフェ巡り', '映画鑑賞', '読書']
        },
        communication: {
          frequency: '毎日',
          lastContact: '昨日の夜',
          tone: '親しみやすい'
        },
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T18:30:00Z'
      },
      {
        id: 'demo-conn-2',
        user_id: 'demo-user-001',
        nickname: 'みきさん',
        platform: '合コン',
        current_stage: 'デート前',
        basic_info: {
          age: 24,
          occupation: '看護師',
          hobbies: ['ヨガ', '料理', '旅行']
        },
        communication: {
          frequency: '数日に1回',
          lastContact: '3日前',
          tone: '丁寧'
        },
        created_at: '2024-01-10T14:20:00Z',
        updated_at: '2024-01-18T20:15:00Z'
      },
      {
        id: 'demo-conn-3',
        user_id: 'demo-user-001',
        nickname: 'ゆいさん',
        platform: '趣味の集まり',
        current_stage: 'メッセージ中',
        basic_info: {
          age: 28,
          occupation: 'マーケティング',
          hobbies: ['写真', 'ランニング', '美術館巡り']
        },
        communication: {
          frequency: '週1回',
          lastContact: '1週間前',
          tone: 'カジュアル'
        },
        created_at: '2024-01-05T09:45:00Z',
        updated_at: '2024-01-14T16:22:00Z'
      }
    ]
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
          estimated_time: '5-10分',
          type: 'send_message'
        }

      case 'メッセージ中':
        return {
          ...baseAction,
          title: '会話を深めましょう',
          description: '共通の話題や趣味について詳しく聞いてみる',
          urgency: 'medium' as const,
          prompt_type: 'deepen_conversation',
          estimated_time: '10-15分',
          type: 'deepen_conversation'
        }

      case 'LINE交換済み':
        return {
          ...baseAction,
          title: 'デートの提案をしましょう',
          description: '相手の興味に合わせたデートプランを提案',
          urgency: 'high' as const,
          prompt_type: 'date_preparation',
          estimated_time: '15-20分',
          type: 'plan_date'
        }

      case 'デート前':
        return {
          ...baseAction,
          title: 'デートの準備をしましょう',
          description: '話題の準備や当日の流れを確認',
          urgency: 'medium' as const,
          prompt_type: 'date_preparation',
          estimated_time: '20-30分',
          type: 'prepare_date'
        }

      case 'デート後':
        return {
          ...baseAction,
          title: 'お礼のメッセージを送りましょう',
          description: 'デートの感想と次の約束について',
          urgency: 'high' as const,
          prompt_type: 'relationship_building',
          estimated_time: '5-10分',
          type: 'follow_up'
        }

      case '交際中':
        return {
          ...baseAction,
          title: '関係を深めましょう',
          description: '今後の関係性について話し合う',
          urgency: 'low' as const,
          prompt_type: 'relationship_building',
          estimated_time: '15-20分',
          type: 'maintain_relationship'
        }

      case '停滞中':
        return {
          ...baseAction,
          title: '関係を復活させましょう',
          description: '新しいアプローチで会話を再開',
          urgency: 'critical' as const,
          prompt_type: 'general',
          estimated_time: '10-15分',
          type: 'revive_conversation'
        }

      default:
        return {
          ...baseAction,
          title: '次のステップを検討',
          description: '現在の状況を分析して最適なアクションを決定',
          urgency: 'medium' as const,
          prompt_type: 'general',
          estimated_time: '10-15分',
          type: 'general_advice'
        }
    }
  }
}
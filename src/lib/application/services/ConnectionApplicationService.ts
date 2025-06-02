import { Connection, DashboardData } from '@/types'
import { IConnectionRepository } from '@/lib/domain/interfaces/IConnectionRepository'
import { IScoreCalculator } from '@/lib/domain/interfaces/IScoreCalculator'
import { IActionRecommender } from '@/lib/domain/interfaces/IActionRecommender'
import { IConnectionValidator } from '@/lib/domain/interfaces/IConnectionValidator'

/**
 * Connection Application Service
 * ビジネスロジックを調整するアプリケーションサービス
 * 依存性逆転原則に従い、インターフェースに依存
 */
export class ConnectionApplicationService {
  
  constructor(
    private readonly connectionRepository: IConnectionRepository,
    private readonly scoreCalculator: IScoreCalculator,
    private readonly actionRecommender: IActionRecommender,
    private readonly validator: IConnectionValidator
  ) {}

  /**
   * 新しい相手を作成
   */
  async createConnection(
    userId: string,
    connectionData: Omit<Connection, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Connection> {
    // 検証
    const validationResult = this.validator.validateConnectionData(connectionData)
    if (!validationResult.isValid) {
      throw new Error(validationResult.errors.join(', '))
    }

    // サニタイゼーション
    const sanitizedData = this.validator.sanitizeInput(connectionData)

    // 作成
    const connectionWithUserId = {
      ...sanitizedData,
      user_id: userId
    }

    return await this.connectionRepository.create(connectionWithUserId)
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
      const validationResult = this.validator.validateConnectionData(updates)
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '))
      }
    }
    
    const sanitizedUpdates = this.validator.sanitizeInput(updates)
    return await this.connectionRepository.update(connectionId, sanitizedUpdates)
  }

  /**
   * すべての相手を取得
   */
  async getUserConnections(userId: string): Promise<Connection[]> {
    return await this.connectionRepository.findByUserId(userId)
  }

  /**
   * 相手を削除
   */
  async deleteConnection(connectionId: string): Promise<void> {
    await this.connectionRepository.delete(connectionId)
  }

  /**
   * ダッシュボードデータを取得
   */
  async getDashboardData(userId: string): Promise<DashboardData> {
    const connections = await this.getUserConnections(userId)
    
    // アクティブな関係（終了以外）を計算
    const activeConnections = connections.filter(c => c.current_stage !== '終了').length
    
    // 平均スコアを計算
    const averageScore = this.scoreCalculator.calculateAverageScore(connections)
    
    // 最も有望な関係を見つける（スコアが最も高い）
    let bestConnection: Connection | null = null
    if (connections.length > 0) {
      bestConnection = connections.reduce((best, current) => {
        const currentScore = this.scoreCalculator.calculateRelationshipScore(current)
        const bestScore = this.scoreCalculator.calculateRelationshipScore(best)
        return currentScore > bestScore ? current : best
      })
    }
    
    // 推奨アクションを生成
    const recommendedActions = this.actionRecommender.getRecommendedActions(connections)
    
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
   * 関係性スコアを計算
   */
  calculateRelationshipScore(connection: Connection): number {
    return this.scoreCalculator.calculateRelationshipScore(connection)
  }

  /**
   * 推奨アクションを取得
   */
  getRecommendedAction(connection: Connection) {
    return this.actionRecommender.getRecommendedAction(connection)
  }
}
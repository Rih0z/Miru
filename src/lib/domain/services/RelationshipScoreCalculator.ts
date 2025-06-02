import { Connection } from '@/types'
import { IScoreCalculator } from '@/lib/domain/interfaces/IScoreCalculator'

/**
 * Relationship Score Calculator
 * 関係性スコア計算の実装
 */
export class RelationshipScoreCalculator implements IScoreCalculator {
  
  calculateRelationshipScore(connection: Connection): number {
    let score = 0

    // ステージによる基本スコア
    score += this.calculateStageScore(connection.current_stage)
    
    // コミュニケーション頻度による加点
    score += this.calculateCommunicationScore(connection.communication)
    
    // 共通点による加点
    score += this.calculateCompatibilityScore(connection.basic_info)
    
    // 感情的要因による加点
    score += this.calculateEmotionalScore(connection.user_feelings)

    // 100を上限とする
    return Math.min(score, 100)
  }

  calculateAverageScore(connections: Connection[]): number {
    if (connections.length === 0) return 0
    
    const totalScore = connections.reduce((sum, connection) => {
      return sum + this.calculateRelationshipScore(connection)
    }, 0)
    
    return Math.round(totalScore / connections.length)
  }

  private calculateStageScore(stage: string): number {
    const stageScores: Record<string, number> = {
      'マッチング直後': 10,
      'メッセージ中': 25,
      'LINE交換済み': 40,
      'デート前': 55,
      'デート後': 70,
      '交際中': 90,
      '停滞中': 20,
      '終了': 0
    }

    return stageScores[stage] || 0
  }

  private calculateCommunicationScore(communication: any): number {
    if (!communication) return 0
    
    let score = 0
    
    // 頻度による加点
    switch (communication.frequency) {
      case '毎日':
        score += 15
        break
      case '数日に1回':
        score += 10
        break
      case '週1回':
        score += 5
        break
      default:
        score += 0
    }

    // レスポンス時間による加点
    switch (communication.responseTime) {
      case '即レス':
        score += 10
        break
      case '数時間以内':
        score += 8
        break
      case '1日以内':
        score += 5
        break
      case '数日以内':
        score += 2
        break
      default:
        score += 0
    }

    return score
  }

  private calculateCompatibilityScore(basicInfo: any): number {
    if (!basicInfo || !basicInfo.hobbies) return 0
    
    // 趣味の数による加点（1つあたり2点、最大10点）
    return Math.min(basicInfo.hobbies.length * 2, 10)
  }

  private calculateEmotionalScore(userFeelings: any): number {
    if (!userFeelings) return 0
    
    let score = 0
    
    // 魅力的なポイントの数による加点
    if (userFeelings.attractivePoints) {
      score += Math.min(userFeelings.attractivePoints.length * 3, 15)
    }
    
    // 期待値による加点
    if (userFeelings.expectations === '真剣な交際') {
      score += 10
    } else if (userFeelings.expectations === '楽しい関係') {
      score += 5
    }
    
    // 不安要因による減点
    if (userFeelings.concerns && userFeelings.concerns.length > 0) {
      score -= userFeelings.concerns.length * 2
    }

    return Math.max(score, 0)
  }
}
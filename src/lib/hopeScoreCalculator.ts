import { Connection } from '@/types'
import { RomanceConnection, HopeMoment } from '@/types/romance'

/**
 * 希望実装スコア（Hope Implementation Score）計算システム
 * 「付き合えるかもしれない」という希望の度合いを数値化
 */
export class HopeScoreCalculator {
  
  /**
   * 総合的な希望スコアを計算（0-100）
   */
  calculateHopeScore(connection: Connection): number {
    let score = 0
    
    // 1. ステージ進展による希望（最大30点）
    score += this.calculateStageHope(connection.current_stage)
    
    // 2. コミュニケーション頻度による希望（最大20点）
    score += this.calculateCommunicationHope(connection.communication)
    
    // 3. 相手の反応による希望（最大20点）
    score += this.calculateResponseHope(connection.communication)
    
    // 4. 共通点による希望（最大15点）
    score += this.calculateCommonalityHope(connection.basic_info)
    
    // 5. ポジティブな感情による希望（最大15点）
    score += this.calculateEmotionalHope(connection.user_feelings)
    
    return Math.min(Math.round(score), 100)
  }
  
  /**
   * ステージ進展による希望スコア
   */
  private calculateStageHope(stage: string): number {
    const stageHopes: Record<string, number> = {
      'マッチング直後': 5,   // 新しい可能性への期待
      'メッセージ中': 10,     // 会話が続いている希望
      'LINE交換済み': 15,     // より親密になった実感
      'デート前': 25,        // 実際に会える期待
      'デート後': 20,        // 次のステップへの希望
      '交際中': 30,          // 関係が確立された喜び
      '停滞中': 5,           // まだ可能性は残っている
      '終了': 0              // 希望なし
    }
    
    return stageHopes[stage] || 0
  }
  
  /**
   * コミュニケーション頻度による希望
   */
  private calculateCommunicationHope(communication: any): number {
    const frequencyScores: Record<string, number> = {
      '毎日': 20,
      '2日に1回': 15,
      '週2-3回': 10,
      '週1回': 5,
      '月数回': 2,
      '不定期': 1
    }
    
    return frequencyScores[communication.frequency] || 0
  }
  
  /**
   * 相手の反応速度による希望
   */
  private calculateResponseHope(communication: any): number {
    const responseScores: Record<string, number> = {
      '即レス': 20,
      '数時間以内': 15,
      '1日以内': 10,
      '2-3日': 5,
      '1週間以上': 0
    }
    
    return responseScores[communication.responseTime] || 0
  }
  
  /**
   * 共通点による希望
   */
  private calculateCommonalityHope(basicInfo: any): number {
    let score = 0
    
    // 趣味の共通点
    if (basicInfo.hobbies && basicInfo.hobbies.length > 0) {
      score += Math.min(basicInfo.hobbies.length * 3, 10)
    }
    
    // 価値観の一致（将来的に実装）
    // score += basicInfo.values?.length * 2 || 0
    
    // 生活圏の近さ
    if (basicInfo.location) {
      score += 5
    }
    
    return Math.min(score, 15)
  }
  
  /**
   * ポジティブな感情による希望
   */
  private calculateEmotionalHope(feelings: any): number {
    let score = 0
    
    // 魅力を感じるポイントの数
    if (feelings.attractivePoints && feelings.attractivePoints.length > 0) {
      score += Math.min(feelings.attractivePoints.length * 3, 10)
    }
    
    // 関係性への期待度
    const expectationScores: Record<string, number> = {
      '真剣な交際': 5,
      '楽しい関係': 4,
      '友達から始めたい': 3,
      'まだわからない': 2,
      'カジュアルな関係': 1
    }
    
    score += expectationScores[feelings.expectations] || 0
    
    return Math.min(score, 15)
  }
  
  /**
   * 希望の変化を可視化するためのトレンド分析
   */
  analyzeHopeTrend(hopeMoments: HopeMoment[]): {
    trend: 'increasing' | 'stable' | 'decreasing'
    momentum: number
    insights: string[]
  } {
    if (hopeMoments.length < 2) {
      return {
        trend: 'stable',
        momentum: 0,
        insights: ['データが不足しています']
      }
    }
    
    // 最新の希望レベルと過去の平均を比較
    const recentMoments = hopeMoments.slice(-5)
    const recentAverage = recentMoments.reduce((sum, m) => sum + m.hopeLevel, 0) / recentMoments.length
    
    const olderMoments = hopeMoments.slice(0, -5)
    const olderAverage = olderMoments.length > 0
      ? olderMoments.reduce((sum, m) => sum + m.hopeLevel, 0) / olderMoments.length
      : recentAverage
    
    const momentum = ((recentAverage - olderAverage) / olderAverage) * 100
    
    let trend: 'increasing' | 'stable' | 'decreasing'
    const insights: string[] = []
    
    if (momentum > 10) {
      trend = 'increasing'
      insights.push('関係が良い方向に進展しています！')
      insights.push('このペースを維持しましょう')
    } else if (momentum < -10) {
      trend = 'decreasing'
      insights.push('最近、関係の進展が停滞気味です')
      insights.push('新しいアプローチを試してみましょう')
    } else {
      trend = 'stable'
      insights.push('関係は安定しています')
      insights.push('次のステップを検討する良いタイミングかもしれません')
    }
    
    return { trend, momentum: Math.round(momentum), insights }
  }
  
  /**
   * 希望を高めるための推奨アクション
   */
  getHopeBoostingActions(connection: Connection, currentScore: number): string[] {
    const actions: string[] = []
    
    if (currentScore < 30) {
      actions.push('相手のプロフィールを再確認して共通点を見つける')
      actions.push('メッセージの頻度を少し増やしてみる')
      actions.push('相手の興味のある話題を質問する')
    } else if (currentScore < 60) {
      actions.push('電話やビデオ通話を提案する')
      actions.push('具体的なデートプランを考える')
      actions.push('より深い話題（将来の夢など）に触れる')
    } else {
      actions.push('次のステージへの移行を検討する')
      actions.push('二人の関係を深める特別な体験を計画する')
      actions.push('お互いの価値観について話し合う')
    }
    
    return actions
  }
}
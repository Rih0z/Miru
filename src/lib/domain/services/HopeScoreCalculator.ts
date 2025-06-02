import { Connection } from '@/types'
import { HopeMoment } from '@/types/romance'
import { IHopeScoreCalculator } from '../interfaces/IHopeScoreCalculator'
import { IStageScoreCalculator } from '../interfaces/IStageScoreCalculator'
import { ICommunicationScoreCalculator } from '../interfaces/ICommunicationScoreCalculator'
import { IEmotionalScoreCalculator } from '../interfaces/IEmotionalScoreCalculator'

/**
 * 希望実装スコア（Hope Implementation Score）計算システム
 * 「付き合えるかもしれない」という希望の度合いを数値化
 * SOLID原則に従い、各スコア計算を専門のサービスに委譲
 */
export class HopeScoreCalculator implements IHopeScoreCalculator {
  constructor(
    private readonly stageScoreCalculator: IStageScoreCalculator,
    private readonly communicationScoreCalculator: ICommunicationScoreCalculator,
    private readonly emotionalScoreCalculator: IEmotionalScoreCalculator
  ) {}

  /**
   * 総合的な希望スコアを計算（0-100）
   */
  calculateHopeScore(connection: Connection): number {
    let score = 0
    
    // 1. ステージ進展による希望（最大30点）
    score += this.stageScoreCalculator.calculateStageScore(connection.current_stage)
    
    // 2. コミュニケーション頻度による希望（最大20点）
    score += this.communicationScoreCalculator.calculateCommunicationScore(connection.communication)
    
    // 3. 相手の反応による希望（最大20点）
    score += this.communicationScoreCalculator.calculateResponseScore(connection.communication)
    
    // 4. 共通点による希望（最大15点）
    score += this.emotionalScoreCalculator.calculateCommonalityScore(connection.basic_info)
    
    // 5. ポジティブな感情による希望（最大15点）
    score += this.emotionalScoreCalculator.calculateEmotionalScore(connection.user_feelings)
    
    return Math.min(Math.round(score), 100)
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
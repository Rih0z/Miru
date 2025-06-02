import { IEmotionalScoreCalculator } from '../interfaces/IEmotionalScoreCalculator'

export class EmotionalScoreCalculator implements IEmotionalScoreCalculator {
  private readonly expectationScores: Record<string, number> = {
    '真剣な交際': 5,
    '楽しい関係': 4,
    '友達から始めたい': 3,
    'まだわからない': 2,
    'カジュアルな関係': 1
  }

  calculateEmotionalScore(feelings: any): number {
    let score = 0
    
    // 魅力を感じるポイントの数
    if (feelings.attractivePoints && feelings.attractivePoints.length > 0) {
      score += Math.min(feelings.attractivePoints.length * 3, 10)
    }
    
    // 関係性への期待度
    score += this.expectationScores[feelings.expectations] || 0
    
    return Math.min(score, 15)
  }

  calculateCommonalityScore(basicInfo: any): number {
    let score = 0
    
    // 趣味の共通点
    if (basicInfo.hobbies && basicInfo.hobbies.length > 0) {
      score += Math.min(basicInfo.hobbies.length * 3, 10)
    }
    
    // 生活圏の近さ
    if (basicInfo.location) {
      score += 5
    }
    
    return Math.min(score, 15)
  }
}
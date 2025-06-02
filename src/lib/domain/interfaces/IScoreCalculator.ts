import { Connection } from '@/types'

/**
 * Score Calculator Interface
 * スコア計算の責任を定義
 */
export interface IScoreCalculator {
  calculateRelationshipScore(connection: Connection): number
  calculateAverageScore(connections: Connection[]): number
}
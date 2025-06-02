import { Connection } from '@/types'
import { HopeMoment } from '@/types/romance'

export interface IHopeScoreCalculator {
  calculateHopeScore(connection: Connection): number
  analyzeHopeTrend(hopeMoments: HopeMoment[]): {
    trend: 'increasing' | 'stable' | 'decreasing'
    momentum: number
    insights: string[]
  }
  getHopeBoostingActions(connection: Connection, currentScore: number): string[]
}
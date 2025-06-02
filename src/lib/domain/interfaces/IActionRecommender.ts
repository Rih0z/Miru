import { Connection, RecommendedAction } from '@/types'

/**
 * Action Recommender Interface
 * アクション推奨の責任を定義
 */
export interface IActionRecommender {
  getRecommendedAction(connection: Connection): RecommendedAction
  getRecommendedActions(connections: Connection[]): RecommendedAction[]
}
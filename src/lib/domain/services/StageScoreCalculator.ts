import { IStageScoreCalculator } from '../interfaces/IStageScoreCalculator'

export class StageScoreCalculator implements IStageScoreCalculator {
  private readonly stageScores: Record<string, number> = {
    'マッチング直後': 5,   // 新しい可能性への期待
    'メッセージ中': 10,     // 会話が続いている希望
    'LINE交換済み': 15,     // より親密になった実感
    'デート前': 25,        // 実際に会える期待
    'デート後': 20,        // 次のステップへの希望
    '交際中': 30,          // 関係が確立された喜び
    '停滞中': 5,           // まだ可能性は残っている
    '終了': 0              // 希望なし
  }

  calculateStageScore(stage: string): number {
    return this.stageScores[stage] || 0
  }
}
import { ICommunicationScoreCalculator } from '../interfaces/ICommunicationScoreCalculator'

export class CommunicationScoreCalculator implements ICommunicationScoreCalculator {
  private readonly frequencyScores: Record<string, number> = {
    '毎日': 20,
    '2日に1回': 15,
    '週2-3回': 10,
    '週1回': 5,
    '月数回': 2,
    '不定期': 1
  }

  private readonly responseTimeScores: Record<string, number> = {
    '即レス': 20,
    '数時間以内': 15,
    '1日以内': 10,
    '2-3日': 5,
    '1週間以上': 0
  }

  calculateCommunicationScore(communication: any): number {
    return this.frequencyScores[communication.frequency] || 0
  }

  calculateResponseScore(communication: any): number {
    return this.responseTimeScores[communication.responseTime] || 0
  }
}
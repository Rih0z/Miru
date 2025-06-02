export interface ICommunicationScoreCalculator {
  calculateCommunicationScore(communication: any): number
  calculateResponseScore(communication: any): number
}
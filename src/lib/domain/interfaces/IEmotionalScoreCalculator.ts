export interface IEmotionalScoreCalculator {
  calculateEmotionalScore(feelings: any): number
  calculateCommonalityScore(basicInfo: any): number
}
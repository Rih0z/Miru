import { Connection } from '@/types'

export interface HopeExperienceMetrics {
  his: number // Hope Implementation Score (1-100)
  possibilityFrequency: number // 1日あたりの「付き合えるかも」と感じる瞬間の回数
  progressRealization: number // 関係進展実感度 (0-100)
  continuationDesire: number // 継続意欲指数 (0-100)
  lifeEnrichment: number // 生活充実感 (0-100)
  lastUpdated: string
}

export interface DailyHopeExperience {
  id: string
  userId: string
  connectionId: string
  date: string
  morningHope: number // 朝の期待感 (0-100)
  noonPossibility: number // 昼の可能性実感 (0-100)
  eveningProgress: number // 夜の進展実感 (0-100)
  totalHopePoints: number // 1日の総希望ポイント
  experienceEvents: HopeEvent[]
}

export interface HopeEvent {
  id: string
  timestamp: string
  type: 'message_received' | 'positive_reaction' | 'progress_milestone' | 'ai_encouragement' | 'success_prediction'
  intensity: number // 体験の強度 (1-10)
  description: string
  impact: number // HISへの影響度 (-10 to +10)
}

export interface IExperienceValueTracker {
  recordDailyExperience(
    userId: string,
    connectionId: string,
    experienceData: Partial<DailyHopeExperience>
  ): Promise<DailyHopeExperience>
  
  recordHopeEvent(
    userId: string,
    connectionId: string,
    event: Omit<HopeEvent, 'id' | 'timestamp'>
  ): Promise<HopeEvent>
  
  calculateHIS(
    connection: Connection,
    recentExperiences: DailyHopeExperience[],
    currentMetrics: Partial<HopeExperienceMetrics>
  ): number
  
  generateWeeklyHopeReport(userId: string): Promise<{
    overallHIS: number
    weeklyTrend: 'increasing' | 'stable' | 'decreasing'
    bestConnection: { nickname: string; his: number } | null
    hopeEvents: HopeEvent[]
    recommendations: string[]
  }>
}
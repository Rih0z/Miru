import { ExperienceValueTracker, DailyHopeExperience, HopeEvent, HopeExperienceMetrics } from '@/lib/experienceValueTracker'
import { Connection } from '@/types'

describe('ExperienceValueTracker', () => {
  let tracker: ExperienceValueTracker
  let mockConnection: Connection
  let mockDailyExperience: Partial<DailyHopeExperience>
  let mockHopeEvent: Omit<HopeEvent, 'id' | 'timestamp'>
  let mockMetrics: Partial<HopeExperienceMetrics>

  beforeEach(() => {
    tracker = new ExperienceValueTracker()
    
    mockConnection = {
      id: 'test-1',
      user_id: 'user-123',
      nickname: 'テストさん',
      platform: 'TestApp',
      current_stage: 'メッセージ中',
      basic_info: {
        age: 25,
        occupation: 'エンジニア',
        location: '東京',
        hobbies: ['映画', 'カフェ巡り']
      },
      communication: {
        frequency: '毎日',
        lastContact: '2024-01-01',
        responseTime: '数時間以内',
        communicationStyle: 'フレンドリー'
      },
      user_feelings: {
        expectations: '真剣な交際',
        attractivePoints: ['優しい', '話が面白い'],
        concerns: ['返信が遅い時がある']
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    mockDailyExperience = {
      morningHope: 70,
      noonPossibility: 80,
      eveningProgress: 60,
      experienceEvents: []
    }

    mockHopeEvent = {
      type: 'message_received',
      intensity: 8,
      description: 'Got a sweet message from them',
      impact: 5
    }

    mockMetrics = {
      his: 65,
      possibilityFrequency: 2.5,
      progressRealization: 70,
      continuationDesire: 80,
      lifeEnrichment: 75,
      lastUpdated: '2024-01-01T00:00:00Z'
    }
  })

  describe('recordDailyExperience', () => {
    it('should record daily experience with provided data', async () => {
      const result = await tracker.recordDailyExperience('user-123', 'conn-1', mockDailyExperience)
      
      expect(result.id).toMatch(/^exp_\d+_\d+$/)
      expect(result.userId).toBe('user-123')
      expect(result.connectionId).toBe('conn-1')
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(result.morningHope).toBe(70)
      expect(result.noonPossibility).toBe(80)
      expect(result.eveningProgress).toBe(60)
      expect(result.totalHopePoints).toBe(210) // 70 + 80 + 60
      expect(result.experienceEvents).toEqual([])
    })

    it('should use default values when data is missing', async () => {
      const result = await tracker.recordDailyExperience('user-123', 'conn-1', {})
      
      expect(result.morningHope).toBe(0)
      expect(result.noonPossibility).toBe(0)
      expect(result.eveningProgress).toBe(0)
      expect(result.totalHopePoints).toBe(0)
      expect(result.experienceEvents).toEqual([])
    })

    it('should calculate total hope points including event intensity', async () => {
      const experienceWithEvents = {
        ...mockDailyExperience,
        experienceEvents: [
          { id: '1', timestamp: '2024-01-01T10:00:00Z', type: 'message_received', intensity: 5, description: 'test', impact: 1 },
          { id: '2', timestamp: '2024-01-01T15:00:00Z', type: 'positive_reaction', intensity: 3, description: 'test', impact: 2 }
        ] as HopeEvent[]
      }
      
      const result = await tracker.recordDailyExperience('user-123', 'conn-1', experienceWithEvents)
      
      expect(result.totalHopePoints).toBe(218) // 70 + 80 + 60 + 5 + 3
    })

    it('should set current date for experience', async () => {
      const result = await tracker.recordDailyExperience('user-123', 'conn-1', mockDailyExperience)
      const today = new Date().toISOString().split('T')[0]
      
      expect(result.date).toBe(today)
    })
  })

  describe('recordHopeEvent', () => {
    it('should record hope event with auto-generated id and timestamp', async () => {
      const result = await tracker.recordHopeEvent('user-123', 'conn-1', mockHopeEvent)
      
      expect(result.id).toMatch(/^event_\d+_\d+$/)
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      expect(result.type).toBe('message_received')
      expect(result.intensity).toBe(8)
      expect(result.description).toBe('Got a sweet message from them')
      expect(result.impact).toBe(5)
    })

    it('should handle different event types', async () => {
      const eventTypes: HopeEvent['type'][] = [
        'message_received',
        'positive_reaction', 
        'progress_milestone',
        'ai_encouragement',
        'success_prediction'
      ]

      for (const eventType of eventTypes) {
        const event = { ...mockHopeEvent, type: eventType }
        const result = await tracker.recordHopeEvent('user-123', 'conn-1', event)
        expect(result.type).toBe(eventType)
      }
    })

    it('should handle negative impact events', async () => {
      const negativeEvent = {
        ...mockHopeEvent,
        type: 'progress_milestone' as const,
        intensity: 3,
        impact: -5,
        description: 'They seemed distant today'
      }
      
      const result = await tracker.recordHopeEvent('user-123', 'conn-1', negativeEvent)
      expect(result.impact).toBe(-5)
    })
  })

  describe('calculateHIS', () => {
    it('should calculate HIS score within valid range', () => {
      const recentExperiences: DailyHopeExperience[] = [
        {
          id: 'exp_1',
          userId: 'user-123',
          connectionId: 'conn-1',
          date: '2024-01-01',
          morningHope: 80,
          noonPossibility: 70,
          eveningProgress: 90,
          totalHopePoints: 240,
          experienceEvents: []
        }
      ]
      
      const his = tracker.calculateHIS(mockConnection, recentExperiences, mockMetrics)
      
      expect(his).toBeGreaterThanOrEqual(0)
      expect(his).toBeLessThanOrEqual(100)
      expect(typeof his).toBe('number')
    })

    it('should return higher HIS for better metrics', () => {
      const recentExperiences: DailyHopeExperience[] = [
        {
          id: 'exp_1',
          userId: 'user-123',
          connectionId: 'conn-1',
          date: '2024-01-01',
          morningHope: 90,
          noonPossibility: 95,
          eveningProgress: 85,
          totalHopePoints: 270,
          experienceEvents: []
        }
      ]
      
      const goodMetrics = {
        ...mockMetrics,
        possibilityFrequency: 5,
        progressRealization: 90,
        continuationDesire: 95
      }
      
      const highHIS = tracker.calculateHIS(mockConnection, recentExperiences, goodMetrics)
      const normalHIS = tracker.calculateHIS(mockConnection, [], mockMetrics)
      
      expect(highHIS).toBeGreaterThan(normalHIS)
    })

    it('should handle empty experiences array', () => {
      const his = tracker.calculateHIS(mockConnection, [], mockMetrics)
      
      expect(his).toBeGreaterThanOrEqual(0)
      expect(his).toBeLessThanOrEqual(100)
    })

    it('should handle missing metrics', () => {
      const his = tracker.calculateHIS(mockConnection, [], {})
      
      expect(his).toBeGreaterThanOrEqual(0)
      expect(his).toBeLessThanOrEqual(100)
    })

    it('should cap result at 100', () => {
      const excellentExperiences: DailyHopeExperience[] = Array(10).fill({
        id: 'exp_1',
        userId: 'user-123',
        connectionId: 'conn-1',
        date: '2024-01-01',
        morningHope: 100,
        noonPossibility: 100,
        eveningProgress: 100,
        totalHopePoints: 300,
        experienceEvents: []
      })
      
      const excellentMetrics = {
        his: 100,
        possibilityFrequency: 10,
        progressRealization: 100,
        continuationDesire: 100,
        lifeEnrichment: 100,
        lastUpdated: '2024-01-01T00:00:00Z'
      }
      
      const his = tracker.calculateHIS(mockConnection, excellentExperiences, excellentMetrics)
      expect(his).toBeLessThanOrEqual(100)
      expect(his).toBeGreaterThan(80)
    })
  })

  describe('generateWeeklyHopeReport', () => {
    it('should generate comprehensive weekly report', async () => {
      const report = await tracker.generateWeeklyHopeReport('user-123')
      
      expect(report).toHaveProperty('overallHIS')
      expect(report).toHaveProperty('weeklyTrend')
      expect(report).toHaveProperty('bestConnection')
      expect(report).toHaveProperty('hopeEvents')
      expect(report).toHaveProperty('recommendations')
      
      expect(typeof report.overallHIS).toBe('number')
      expect(report.overallHIS).toBeGreaterThanOrEqual(0)
      expect(report.overallHIS).toBeLessThanOrEqual(100)
      
      expect(['increasing', 'stable', 'decreasing']).toContain(report.weeklyTrend)
      expect(Array.isArray(report.hopeEvents)).toBe(true)
      expect(Array.isArray(report.recommendations)).toBe(true)
    })

    it('should handle user with no connections', async () => {
      const report = await tracker.generateWeeklyHopeReport('new-user')
      
      expect(report.bestConnection).toBeNull()
      expect(report.hopeEvents).toEqual([])
      expect(report.recommendations).toEqual([])
    })

    it('should limit hope events to 10 most recent', async () => {
      const report = await tracker.generateWeeklyHopeReport('user-123')
      
      expect(report.hopeEvents.length).toBeLessThanOrEqual(10)
    })

    it('should return consistent trend value', async () => {
      const report = await tracker.generateWeeklyHopeReport('user-123')
      
      expect(report.weeklyTrend).toBe('stable')
    })
  })

  describe('integration tests', () => {
    it('should record complete daily experience workflow', async () => {
      // Record a daily experience
      const dailyExp = await tracker.recordDailyExperience('user-123', 'conn-1', mockDailyExperience)
      
      // Record some hope events
      const event1 = await tracker.recordHopeEvent('user-123', 'conn-1', mockHopeEvent)
      const event2 = await tracker.recordHopeEvent('user-123', 'conn-1', {
        ...mockHopeEvent,
        type: 'positive_reaction',
        intensity: 6,
        impact: 3
      })
      
      // Calculate HIS
      const his = tracker.calculateHIS(mockConnection, [dailyExp], mockMetrics)
      
      // Generate weekly report
      const report = await tracker.generateWeeklyHopeReport('user-123')
      
      expect(dailyExp.totalHopePoints).toBe(210)
      expect(event1.id).toMatch(/^event_\d+_\d+$/)
      expect(event2.id).toMatch(/^event_\d+_\d+$/)
      expect(his).toBeGreaterThanOrEqual(0)
      expect(report.overallHIS).toBe(65) // Mock value from implementation
    })

    it('should handle multiple experiences in HIS calculation', async () => {
      const experiences: DailyHopeExperience[] = [
        {
          id: 'exp_1',
          userId: 'user-123',
          connectionId: 'conn-1',
          date: '2024-01-01',
          morningHope: 60,
          noonPossibility: 70,
          eveningProgress: 80,
          totalHopePoints: 210,
          experienceEvents: []
        },
        {
          id: 'exp_2',
          userId: 'user-123',
          connectionId: 'conn-1',
          date: '2024-01-02',
          morningHope: 80,
          noonPossibility: 75,
          eveningProgress: 85,
          totalHopePoints: 240,
          experienceEvents: []
        }
      ]
      
      const his = tracker.calculateHIS(mockConnection, experiences, mockMetrics)
      expect(his).toBeGreaterThanOrEqual(0)
      expect(his).toBeLessThanOrEqual(100)
    })
  })

  describe('error handling and edge cases', () => {
    it('should handle extreme intensity values', async () => {
      const extremeEvent = {
        type: 'message_received' as const,
        intensity: 0,
        description: 'No impact event',
        impact: 0
      }
      
      const result = await tracker.recordHopeEvent('user-123', 'conn-1', extremeEvent)
      expect(result.intensity).toBe(0)
      expect(result.impact).toBe(0)
    })

    it('should handle very high intensity values', async () => {
      const highEvent = {
        type: 'success_prediction' as const,
        intensity: 10,
        description: 'Maximum impact event',
        impact: 10
      }
      
      const result = await tracker.recordHopeEvent('user-123', 'conn-1', highEvent)
      expect(result.intensity).toBe(10)
      expect(result.impact).toBe(10)
    })

    it('should handle empty user ID and connection ID', async () => {
      const result = await tracker.recordDailyExperience('', '', mockDailyExperience)
      expect(result.userId).toBe('')
      expect(result.connectionId).toBe('')
    })

    it('should handle connection with missing communication info', () => {
      const minimalConnection = {
        ...mockConnection,
        communication: {}
      }
      
      const his = tracker.calculateHIS(minimalConnection, [], mockMetrics)
      expect(his).toBeGreaterThanOrEqual(0)
      expect(his).toBeLessThanOrEqual(100)
    })

    it('should generate unique IDs for experiences and events', async () => {
      const exp1 = await tracker.recordDailyExperience('user-123', 'conn-1', mockDailyExperience)
      // Add small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1))
      const exp2 = await tracker.recordDailyExperience('user-123', 'conn-2', mockDailyExperience)
      
      const event1 = await tracker.recordHopeEvent('user-123', 'conn-1', mockHopeEvent)
      await new Promise(resolve => setTimeout(resolve, 1))
      const event2 = await tracker.recordHopeEvent('user-123', 'conn-1', mockHopeEvent)
      
      expect(exp1.id).not.toBe(exp2.id)
      expect(event1.id).not.toBe(event2.id)
    })

    it('should handle very large experience arrays', () => {
      const manyExperiences: DailyHopeExperience[] = Array(100).fill({
        id: 'exp_1',
        userId: 'user-123',
        connectionId: 'conn-1',
        date: '2024-01-01',
        morningHope: 50,
        noonPossibility: 50,
        eveningProgress: 50,
        totalHopePoints: 150,
        experienceEvents: []
      })
      
      const his = tracker.calculateHIS(mockConnection, manyExperiences, mockMetrics)
      expect(his).toBeGreaterThanOrEqual(0)
      expect(his).toBeLessThanOrEqual(100)
    })

    it('should handle null possibility frequency gracefully', () => {
      const metricsWithNull = {
        ...mockMetrics,
        possibilityFrequency: undefined
      }
      
      const his = tracker.calculateHIS(mockConnection, [], metricsWithNull)
      expect(his).toBeGreaterThanOrEqual(0)
      expect(his).toBeLessThanOrEqual(100)
    })
  })
})
import { HopeScoreCalculator } from '@/lib/domain/services/HopeScoreCalculator'
import { IStageScoreCalculator } from '@/lib/domain/interfaces/IStageScoreCalculator'
import { ICommunicationScoreCalculator } from '@/lib/domain/interfaces/ICommunicationScoreCalculator'
import { IEmotionalScoreCalculator } from '@/lib/domain/interfaces/IEmotionalScoreCalculator'
import { Connection } from '@/types'
import { HopeMoment } from '@/types/romance'

describe('HopeScoreCalculator (Domain Services)', () => {
  let hopeScoreCalculator: HopeScoreCalculator
  let mockStageScoreCalculator: jest.Mocked<IStageScoreCalculator>
  let mockCommunicationScoreCalculator: jest.Mocked<ICommunicationScoreCalculator>
  let mockEmotionalScoreCalculator: jest.Mocked<IEmotionalScoreCalculator>
  let mockConnection: Connection

  beforeEach(() => {
    mockStageScoreCalculator = {
      calculateStageScore: jest.fn()
    }
    
    mockCommunicationScoreCalculator = {
      calculateCommunicationScore: jest.fn(),
      calculateResponseScore: jest.fn()
    }
    
    mockEmotionalScoreCalculator = {
      calculateEmotionalScore: jest.fn(),
      calculateCommonalityScore: jest.fn()
    }

    hopeScoreCalculator = new HopeScoreCalculator(
      mockStageScoreCalculator,
      mockCommunicationScoreCalculator,
      mockEmotionalScoreCalculator
    )

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
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('calculateHopeScore', () => {
    it('should calculate hope score using all score calculators', () => {
      // Setup mocks
      mockStageScoreCalculator.calculateStageScore.mockReturnValue(25)
      mockCommunicationScoreCalculator.calculateCommunicationScore.mockReturnValue(15)
      mockCommunicationScoreCalculator.calculateResponseScore.mockReturnValue(18)
      mockEmotionalScoreCalculator.calculateCommonalityScore.mockReturnValue(12)
      mockEmotionalScoreCalculator.calculateEmotionalScore.mockReturnValue(10)

      const result = hopeScoreCalculator.calculateHopeScore(mockConnection)

      expect(result).toBe(80) // 25 + 15 + 18 + 12 + 10 = 80
      expect(mockStageScoreCalculator.calculateStageScore).toHaveBeenCalledWith('メッセージ中')
      expect(mockCommunicationScoreCalculator.calculateCommunicationScore).toHaveBeenCalledWith(mockConnection.communication)
      expect(mockCommunicationScoreCalculator.calculateResponseScore).toHaveBeenCalledWith(mockConnection.communication)
      expect(mockEmotionalScoreCalculator.calculateCommonalityScore).toHaveBeenCalledWith(mockConnection.basic_info)
      expect(mockEmotionalScoreCalculator.calculateEmotionalScore).toHaveBeenCalledWith(mockConnection.user_feelings)
    })

    it('should cap the score at 100', () => {
      // Setup mocks to return high values
      mockStageScoreCalculator.calculateStageScore.mockReturnValue(30)
      mockCommunicationScoreCalculator.calculateCommunicationScore.mockReturnValue(30)
      mockCommunicationScoreCalculator.calculateResponseScore.mockReturnValue(30)
      mockEmotionalScoreCalculator.calculateCommonalityScore.mockReturnValue(30)
      mockEmotionalScoreCalculator.calculateEmotionalScore.mockReturnValue(30)

      const result = hopeScoreCalculator.calculateHopeScore(mockConnection)

      expect(result).toBe(100) // Should be capped at 100
    })

    it('should handle zero scores', () => {
      // Setup mocks to return zero
      mockStageScoreCalculator.calculateStageScore.mockReturnValue(0)
      mockCommunicationScoreCalculator.calculateCommunicationScore.mockReturnValue(0)
      mockCommunicationScoreCalculator.calculateResponseScore.mockReturnValue(0)
      mockEmotionalScoreCalculator.calculateCommonalityScore.mockReturnValue(0)
      mockEmotionalScoreCalculator.calculateEmotionalScore.mockReturnValue(0)

      const result = hopeScoreCalculator.calculateHopeScore(mockConnection)

      expect(result).toBe(0)
    })

    it('should round the final score', () => {
      // Setup mocks to return values that need rounding
      mockStageScoreCalculator.calculateStageScore.mockReturnValue(10.7)
      mockCommunicationScoreCalculator.calculateCommunicationScore.mockReturnValue(10.3)
      mockCommunicationScoreCalculator.calculateResponseScore.mockReturnValue(10.2)
      mockEmotionalScoreCalculator.calculateCommonalityScore.mockReturnValue(10.4)
      mockEmotionalScoreCalculator.calculateEmotionalScore.mockReturnValue(10.1)

      const result = hopeScoreCalculator.calculateHopeScore(mockConnection)

      expect(result).toBe(52) // 51.7 rounded to 52
    })

    it('should handle different connection stages', () => {
      mockStageScoreCalculator.calculateStageScore.mockReturnValue(15)
      mockCommunicationScoreCalculator.calculateCommunicationScore.mockReturnValue(10)
      mockCommunicationScoreCalculator.calculateResponseScore.mockReturnValue(10)
      mockEmotionalScoreCalculator.calculateCommonalityScore.mockReturnValue(5)
      mockEmotionalScoreCalculator.calculateEmotionalScore.mockReturnValue(5)

      const connectionWithDifferentStage = {
        ...mockConnection,
        current_stage: 'デート前'
      }

      const result = hopeScoreCalculator.calculateHopeScore(connectionWithDifferentStage)

      expect(result).toBe(45)
      expect(mockStageScoreCalculator.calculateStageScore).toHaveBeenCalledWith('デート前')
    })
  })

  describe('analyzeHopeTrend', () => {
    it('should return stable trend with insufficient data', () => {
      const singleMoment: HopeMoment[] = [
        {
          id: '1',
          connectionId: 'test-1',
          date: '2024-01-01',
          hopeLevel: 50,
          factors: [],
          notes: ''
        }
      ]

      const result = hopeScoreCalculator.analyzeHopeTrend(singleMoment)

      expect(result.trend).toBe('stable')
      expect(result.momentum).toBe(0)
      expect(result.insights).toContain('データが不足しています')
    })

    it('should return stable trend with empty data', () => {
      const result = hopeScoreCalculator.analyzeHopeTrend([])

      expect(result.trend).toBe('stable')
      expect(result.momentum).toBe(0)
      expect(result.insights).toContain('データが不足しています')
    })

    it('should detect increasing trend', () => {
      const increasingMoments: HopeMoment[] = [
        // Older moments (average = 30)
        { id: '1', connectionId: 'test-1', date: '2024-01-01', hopeLevel: 30, factors: [], notes: '' },
        { id: '2', connectionId: 'test-1', date: '2024-01-02', hopeLevel: 30, factors: [], notes: '' },
        { id: '3', connectionId: 'test-1', date: '2024-01-03', hopeLevel: 30, factors: [], notes: '' },
        { id: '4', connectionId: 'test-1', date: '2024-01-04', hopeLevel: 30, factors: [], notes: '' },
        { id: '5', connectionId: 'test-1', date: '2024-01-05', hopeLevel: 30, factors: [], notes: '' },
        // Recent moments (average = 60)
        { id: '6', connectionId: 'test-1', date: '2024-01-06', hopeLevel: 60, factors: [], notes: '' },
        { id: '7', connectionId: 'test-1', date: '2024-01-07', hopeLevel: 60, factors: [], notes: '' },
        { id: '8', connectionId: 'test-1', date: '2024-01-08', hopeLevel: 60, factors: [], notes: '' },
        { id: '9', connectionId: 'test-1', date: '2024-01-09', hopeLevel: 60, factors: [], notes: '' },
        { id: '10', connectionId: 'test-1', date: '2024-01-10', hopeLevel: 60, factors: [], notes: '' }
      ]

      const result = hopeScoreCalculator.analyzeHopeTrend(increasingMoments)

      expect(result.trend).toBe('increasing')
      expect(result.momentum).toBe(100) // ((60-30)/30) * 100 = 100%
      expect(result.insights).toContain('関係が良い方向に進展しています！')
      expect(result.insights).toContain('このペースを維持しましょう')
    })

    it('should detect decreasing trend', () => {
      const decreasingMoments: HopeMoment[] = [
        // Older moments (average = 70)
        { id: '1', connectionId: 'test-1', date: '2024-01-01', hopeLevel: 70, factors: [], notes: '' },
        { id: '2', connectionId: 'test-1', date: '2024-01-02', hopeLevel: 70, factors: [], notes: '' },
        { id: '3', connectionId: 'test-1', date: '2024-01-03', hopeLevel: 70, factors: [], notes: '' },
        { id: '4', connectionId: 'test-1', date: '2024-01-04', hopeLevel: 70, factors: [], notes: '' },
        { id: '5', connectionId: 'test-1', date: '2024-01-05', hopeLevel: 70, factors: [], notes: '' },
        // Recent moments (average = 40)
        { id: '6', connectionId: 'test-1', date: '2024-01-06', hopeLevel: 40, factors: [], notes: '' },
        { id: '7', connectionId: 'test-1', date: '2024-01-07', hopeLevel: 40, factors: [], notes: '' },
        { id: '8', connectionId: 'test-1', date: '2024-01-08', hopeLevel: 40, factors: [], notes: '' },
        { id: '9', connectionId: 'test-1', date: '2024-01-09', hopeLevel: 40, factors: [], notes: '' },
        { id: '10', connectionId: 'test-1', date: '2024-01-10', hopeLevel: 40, factors: [], notes: '' }
      ]

      const result = hopeScoreCalculator.analyzeHopeTrend(decreasingMoments)

      expect(result.trend).toBe('decreasing')
      expect(result.momentum).toBe(-43) // ((40-70)/70) * 100 ≈ -43%
      expect(result.insights).toContain('最近、関係の進展が停滞気味です')
      expect(result.insights).toContain('新しいアプローチを試してみましょう')
    })

    it('should detect stable trend', () => {
      const stableMoments: HopeMoment[] = [
        // Older moments (average = 50)
        { id: '1', connectionId: 'test-1', date: '2024-01-01', hopeLevel: 50, factors: [], notes: '' },
        { id: '2', connectionId: 'test-1', date: '2024-01-02', hopeLevel: 50, factors: [], notes: '' },
        { id: '3', connectionId: 'test-1', date: '2024-01-03', hopeLevel: 50, factors: [], notes: '' },
        { id: '4', connectionId: 'test-1', date: '2024-01-04', hopeLevel: 50, factors: [], notes: '' },
        { id: '5', connectionId: 'test-1', date: '2024-01-05', hopeLevel: 50, factors: [], notes: '' },
        // Recent moments (average = 52)
        { id: '6', connectionId: 'test-1', date: '2024-01-06', hopeLevel: 52, factors: [], notes: '' },
        { id: '7', connectionId: 'test-1', date: '2024-01-07', hopeLevel: 52, factors: [], notes: '' },
        { id: '8', connectionId: 'test-1', date: '2024-01-08', hopeLevel: 52, factors: [], notes: '' },
        { id: '9', connectionId: 'test-1', date: '2024-01-09', hopeLevel: 52, factors: [], notes: '' },
        { id: '10', connectionId: 'test-1', date: '2024-01-10', hopeLevel: 52, factors: [], notes: '' }
      ]

      const result = hopeScoreCalculator.analyzeHopeTrend(stableMoments)

      expect(result.trend).toBe('stable')
      expect(result.momentum).toBe(4) // ((52-50)/50) * 100 = 4%
      expect(result.insights).toContain('関係は安定しています')
      expect(result.insights).toContain('次のステップを検討する良いタイミングかもしれません')
    })

    it('should handle case with fewer than 5 older moments', () => {
      const fewMoments: HopeMoment[] = [
        { id: '1', connectionId: 'test-1', date: '2024-01-01', hopeLevel: 30, factors: [], notes: '' },
        { id: '2', connectionId: 'test-1', date: '2024-01-02', hopeLevel: 40, factors: [], notes: '' },
        { id: '3', connectionId: 'test-1', date: '2024-01-03', hopeLevel: 50, factors: [], notes: '' }
      ]

      const result = hopeScoreCalculator.analyzeHopeTrend(fewMoments)

      expect(result.trend).toBe('stable')
      expect(result.momentum).toBe(0) // No older moments to compare with
      expect(result.insights).toContain('関係は安定しています')
    })
  })

  describe('getHopeBoostingActions', () => {
    it('should return low score actions for scores under 30', () => {
      const actions = hopeScoreCalculator.getHopeBoostingActions(mockConnection, 25)

      expect(actions).toContain('相手のプロフィールを再確認して共通点を見つける')
      expect(actions).toContain('メッセージの頻度を少し増やしてみる')
      expect(actions).toContain('相手の興味のある話題を質問する')
      expect(actions).toHaveLength(3)
    })

    it('should return medium score actions for scores 30-59', () => {
      const actions = hopeScoreCalculator.getHopeBoostingActions(mockConnection, 45)

      expect(actions).toContain('電話やビデオ通話を提案する')
      expect(actions).toContain('具体的なデートプランを考える')
      expect(actions).toContain('より深い話題（将来の夢など）に触れる')
      expect(actions).toHaveLength(3)
    })

    it('should return high score actions for scores 60 and above', () => {
      const actions = hopeScoreCalculator.getHopeBoostingActions(mockConnection, 75)

      expect(actions).toContain('次のステージへの移行を検討する')
      expect(actions).toContain('二人の関係を深める特別な体験を計画する')
      expect(actions).toContain('お互いの価値観について話し合う')
      expect(actions).toHaveLength(3)
    })

    it('should handle edge case scores correctly', () => {
      const actionsAt30 = hopeScoreCalculator.getHopeBoostingActions(mockConnection, 30)
      const actionsAt60 = hopeScoreCalculator.getHopeBoostingActions(mockConnection, 60)

      // Score 30 should get medium actions
      expect(actionsAt30).toContain('電話やビデオ通話を提案する')
      
      // Score 60 should get high actions
      expect(actionsAt60).toContain('次のステージへの移行を検討する')
    })

    it('should handle extreme scores', () => {
      const zeroActions = hopeScoreCalculator.getHopeBoostingActions(mockConnection, 0)
      const maxActions = hopeScoreCalculator.getHopeBoostingActions(mockConnection, 100)

      expect(zeroActions).toHaveLength(3)
      expect(maxActions).toHaveLength(3)
      
      // Zero score should get low actions
      expect(zeroActions).toContain('相手のプロフィールを再確認して共通点を見つける')
      
      // Max score should get high actions
      expect(maxActions).toContain('次のステージへの移行を検討する')
    })

    it('should not modify connection object', () => {
      const originalConnection = JSON.parse(JSON.stringify(mockConnection))
      
      hopeScoreCalculator.getHopeBoostingActions(mockConnection, 50)
      
      expect(mockConnection).toEqual(originalConnection)
    })
  })

  describe('integration scenarios', () => {
    it('should work with realistic calculator implementations', () => {
      // Setup realistic mock implementations
      mockStageScoreCalculator.calculateStageScore.mockImplementation((stage) => {
        const stageScores: Record<string, number> = {
          'マッチング直後': 5,
          'メッセージ中': 10,
          'LINE交換済み': 15,
          'デート前': 20,
          'デート後': 25,
          '交際中': 30
        }
        return stageScores[stage] || 0
      })

      mockCommunicationScoreCalculator.calculateCommunicationScore.mockImplementation((comm) => {
        if (comm.frequency === '毎日') return 15
        if (comm.frequency === '週数回') return 10
        if (comm.frequency === '週1回') return 5
        return 0
      })

      mockCommunicationScoreCalculator.calculateResponseScore.mockImplementation((comm) => {
        if (comm.responseTime === '即レス') return 15
        if (comm.responseTime === '数時間以内') return 10
        if (comm.responseTime === '1日以内') return 5
        return 0
      })

      mockEmotionalScoreCalculator.calculateCommonalityScore.mockImplementation((basic) => {
        return Math.min((basic.hobbies?.length || 0) * 2, 10)
      })

      mockEmotionalScoreCalculator.calculateEmotionalScore.mockImplementation((feelings) => {
        return Math.min((feelings.attractivePoints?.length || 0) * 2, 10)
      })

      const result = hopeScoreCalculator.calculateHopeScore(mockConnection)

      // Expected: stage(10) + comm(15) + response(10) + commonality(4) + emotional(4) = 43
      expect(result).toBe(43)
    })

    it('should maintain consistent behavior across multiple calls', () => {
      mockStageScoreCalculator.calculateStageScore.mockReturnValue(20)
      mockCommunicationScoreCalculator.calculateCommunicationScore.mockReturnValue(15)
      mockCommunicationScoreCalculator.calculateResponseScore.mockReturnValue(15)
      mockEmotionalScoreCalculator.calculateCommonalityScore.mockReturnValue(10)
      mockEmotionalScoreCalculator.calculateEmotionalScore.mockReturnValue(10)

      const result1 = hopeScoreCalculator.calculateHopeScore(mockConnection)
      const result2 = hopeScoreCalculator.calculateHopeScore(mockConnection)
      const result3 = hopeScoreCalculator.calculateHopeScore(mockConnection)

      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
      expect(result1).toBe(70)
    })
  })
})
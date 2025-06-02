import { HopeScoreCalculator } from '@/lib/hopeScoreCalculator'
import { Connection } from '@/types'
import { HopeMoment } from '@/types/romance'

describe('HopeScoreCalculator', () => {
  let calculator: HopeScoreCalculator
  let mockConnection: Connection

  beforeEach(() => {
    calculator = new HopeScoreCalculator()
    mockConnection = {
      id: 'test-1',
      user_id: 'user-123',
      nickname: 'テストさん',
      platform: 'Pairs',
      current_stage: 'メッセージ中',
      basic_info: {
        age: 25,
        occupation: 'エンジニア',
        hobbies: ['映画鑑賞', 'カフェ巡り'],
        location: '東京都'
      },
      communication: {
        frequency: '毎日',
        lastContact: '2024-01-01',
        responseTime: '数時間以内',
        communicationStyle: 'カジュアル'
      },
      user_feelings: {
        expectations: '真剣な交際',
        attractivePoints: ['優しい', '話が面白い'],
        concerns: []
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  })

  describe('calculateHopeScore', () => {
    it('should calculate score for ideal connection', () => {
      const idealConnection: Connection = {
        ...mockConnection,
        current_stage: '交際中',
        communication: {
          ...mockConnection.communication,
          frequency: '毎日',
          responseTime: '即レス'
        },
        basic_info: {
          ...mockConnection.basic_info,
          hobbies: ['映画鑑賞', 'カフェ巡り', '読書']
        },
        user_feelings: {
          ...mockConnection.user_feelings,
          expectations: '真剣な交際',
          attractivePoints: ['優しい', '話が面白い', '価値観が合う']
        }
      }

      const score = calculator.calculateHopeScore(idealConnection)
      expect(score).toBeGreaterThanOrEqual(80)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should calculate low score for ended relationship', () => {
      const endedConnection: Connection = {
        ...mockConnection,
        current_stage: '終了',
        communication: {
          ...mockConnection.communication,
          frequency: '不定期',
          responseTime: '1週間以上'
        },
        basic_info: {
          ...mockConnection.basic_info,
          hobbies: []
        },
        user_feelings: {
          ...mockConnection.user_feelings,
          expectations: 'カジュアルな関係',
          attractivePoints: []
        }
      }

      const score = calculator.calculateHopeScore(endedConnection)
      expect(score).toBe(7) // 終了(0) + 不定期(1) + 1週間以上(0) + location(5) + カジュアルな関係(1) = 7
    })

    it('should calculate appropriate scores for different stages', () => {
      const stages = [
        { stage: 'マッチング直後', expectedBase: 5 },
        { stage: 'メッセージ中', expectedBase: 10 },
        { stage: 'LINE交換済み', expectedBase: 15 },
        { stage: 'デート前', expectedBase: 25 },
        { stage: 'デート後', expectedBase: 20 },
        { stage: '交際中', expectedBase: 30 },
        { stage: '停滞中', expectedBase: 5 },
        { stage: '終了', expectedBase: 0 }
      ]

      stages.forEach(({ stage, expectedBase }) => {
        const connection = {
          ...mockConnection,
          current_stage: stage
        }
        const score = calculator.calculateHopeScore(connection)
        // Score should include the stage base score plus other factors
        expect(score).toBeGreaterThanOrEqual(expectedBase)
      })
    })

    it('should factor in communication frequency', () => {
      const dailyConnection = {
        ...mockConnection,
        communication: { ...mockConnection.communication, frequency: '毎日' }
      }
      const weeklyConnection = {
        ...mockConnection,
        communication: { ...mockConnection.communication, frequency: '週1回' }
      }

      const dailyScore = calculator.calculateHopeScore(dailyConnection)
      const weeklyScore = calculator.calculateHopeScore(weeklyConnection)

      expect(dailyScore).toBeGreaterThan(weeklyScore)
      expect(dailyScore - weeklyScore).toBe(15) // 毎日(20) - 週1回(5) = 15
    })

    it('should factor in response time', () => {
      const quickResponse = {
        ...mockConnection,
        communication: { ...mockConnection.communication, responseTime: '即レス' }
      }
      const slowResponse = {
        ...mockConnection,
        communication: { ...mockConnection.communication, responseTime: '1週間以上' }
      }

      const quickScore = calculator.calculateHopeScore(quickResponse)
      const slowScore = calculator.calculateHopeScore(slowResponse)

      expect(quickScore).toBeGreaterThan(slowScore)
      expect(quickScore - slowScore).toBe(20) // 即レス(20) - 1週間以上(0) = 20
    })

    it('should factor in common interests', () => {
      const manyHobbies = {
        ...mockConnection,
        basic_info: { ...mockConnection.basic_info, hobbies: ['映画', '読書', '料理', 'スポーツ'] }
      }
      const oneHobby = {
        ...mockConnection,
        basic_info: { ...mockConnection.basic_info, hobbies: ['映画'] }
      }

      const manyScore = calculator.calculateHopeScore(manyHobbies)
      const oneScore = calculator.calculateHopeScore(oneHobby)

      expect(manyScore).toBeGreaterThan(oneScore)
      expect(manyScore - oneScore).toBe(7) // min(4*3, 10) - min(1*3, 10) = 10 - 3 = 7
    })

    it('should factor in attractive points', () => {
      const manyAttractive = {
        ...mockConnection,
        user_feelings: {
          ...mockConnection.user_feelings,
          attractivePoints: ['優しい', '話が面白い', 'センスが良い', '価値観が合う']
        }
      }
      const oneAttractive = {
        ...mockConnection,
        user_feelings: {
          ...mockConnection.user_feelings,
          attractivePoints: ['優しい']
        }
      }

      const manyScore = calculator.calculateHopeScore(manyAttractive)
      const oneScore = calculator.calculateHopeScore(oneAttractive)

      expect(manyScore).toBeGreaterThan(oneScore)
      expect(manyScore - oneScore).toBe(7) // min(4*3, 10) - min(1*3, 10) = 10 - 3 = 7
    })

    it('should factor in location proximity', () => {
      const withLocation = {
        ...mockConnection,
        basic_info: { ...mockConnection.basic_info, location: '東京都' }
      }
      const withoutLocation = {
        ...mockConnection,
        basic_info: { ...mockConnection.basic_info, location: undefined }
      }

      const withScore = calculator.calculateHopeScore(withLocation)
      const withoutScore = calculator.calculateHopeScore(withoutLocation)

      expect(withScore).toBeGreaterThan(withoutScore)
      expect(withScore - withoutScore).toBe(5) // location adds 5 points
    })

    it('should factor in expectations', () => {
      const seriousExpectation = {
        ...mockConnection,
        user_feelings: { ...mockConnection.user_feelings, expectations: '真剣な交際' }
      }
      const casualExpectation = {
        ...mockConnection,
        user_feelings: { ...mockConnection.user_feelings, expectations: 'カジュアルな関係' }
      }

      const seriousScore = calculator.calculateHopeScore(seriousExpectation)
      const casualScore = calculator.calculateHopeScore(casualExpectation)

      expect(seriousScore).toBeGreaterThan(casualScore)
      expect(seriousScore - casualScore).toBe(4) // 真剣な交際(5) - カジュアルな関係(1) = 4
    })

    it('should never exceed 100', () => {
      const perfectConnection: Connection = {
        ...mockConnection,
        current_stage: '交際中',
        communication: {
          ...mockConnection.communication,
          frequency: '毎日',
          responseTime: '即レス'
        },
        basic_info: {
          ...mockConnection.basic_info,
          hobbies: Array(10).fill('趣味'), // Many hobbies
          location: '東京都'
        },
        user_feelings: {
          ...mockConnection.user_feelings,
          expectations: '真剣な交際',
          attractivePoints: Array(10).fill('魅力') // Many attractive points
        }
      }

      const score = calculator.calculateHopeScore(perfectConnection)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should handle null/undefined communication properties', () => {
      const nullCommunication = {
        ...mockConnection,
        communication: {
          frequency: undefined,
          responseTime: undefined,
          lastContact: '2024-01-01',
          communicationStyle: 'カジュアル'
        }
      }

      const score = calculator.calculateHopeScore(nullCommunication)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle null/undefined basic_info properties', () => {
      const nullBasicInfo = {
        ...mockConnection,
        basic_info: {
          age: 25,
          occupation: 'エンジニア',
          hobbies: undefined,
          location: undefined
        }
      }

      const score = calculator.calculateHopeScore(nullBasicInfo)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle null/undefined user_feelings properties', () => {
      const nullFeelings = {
        ...mockConnection,
        user_feelings: {
          expectations: undefined,
          attractivePoints: undefined,
          concerns: []
        }
      }

      const score = calculator.calculateHopeScore(nullFeelings)
      expect(score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('analyzeHopeTrend', () => {
    it('should return stable trend with insufficient data', () => {
      const moments: HopeMoment[] = [
        {
          id: '1',
          connectionId: 'test-1',
          date: '2024-01-01',
          hopeLevel: 50,
          factors: [],
          notes: ''
        }
      ]

      const result = calculator.analyzeHopeTrend(moments)
      expect(result.trend).toBe('stable')
      expect(result.momentum).toBe(0)
      expect(result.insights).toContain('データが不足しています')
    })

    it('should detect increasing trend', () => {
      const moments: HopeMoment[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        connectionId: 'test-1',
        date: `2024-01-${i + 1}`,
        hopeLevel: 40 + i * 2, // Increasing from 40 to 58
        factors: [],
        notes: ''
      }))

      const result = calculator.analyzeHopeTrend(moments)
      expect(result.trend).toBe('increasing')
      expect(result.momentum).toBeGreaterThan(10)
      expect(result.insights).toContain('関係が良い方向に進展しています！')
    })

    it('should detect decreasing trend', () => {
      const moments: HopeMoment[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        connectionId: 'test-1',
        date: `2024-01-${i + 1}`,
        hopeLevel: 70 - i * 3, // Decreasing from 70 to 43
        factors: [],
        notes: ''
      }))

      const result = calculator.analyzeHopeTrend(moments)
      expect(result.trend).toBe('decreasing')
      expect(result.momentum).toBeLessThan(-10)
      expect(result.insights).toContain('最近、関係の進展が停滞気味です')
    })

    it('should detect stable trend', () => {
      const moments: HopeMoment[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        connectionId: 'test-1',
        date: `2024-01-${i + 1}`,
        hopeLevel: 50 + (i % 2 ? 2 : -2), // Fluctuating around 50
        factors: [],
        notes: ''
      }))

      const result = calculator.analyzeHopeTrend(moments)
      expect(result.trend).toBe('stable')
      expect(Math.abs(result.momentum)).toBeLessThanOrEqual(10)
      expect(result.insights).toContain('関係は安定しています')
    })

    it('should handle empty moments array', () => {
      const result = calculator.analyzeHopeTrend([])
      expect(result.trend).toBe('stable')
      expect(result.momentum).toBe(0)
      expect(result.insights).toContain('データが不足しています')
    })

    it('should handle single moment', () => {
      const moments: HopeMoment[] = [
        {
          id: '1',
          connectionId: 'test-1',
          date: '2024-01-01',
          hopeLevel: 50,
          factors: [],
          notes: ''
        }
      ]

      const result = calculator.analyzeHopeTrend(moments)
      expect(result.trend).toBe('stable')
      expect(result.momentum).toBe(0)
      expect(result.insights).toContain('データが不足しています')
    })

    it('should calculate momentum correctly', () => {
      // 5 older moments (average = 40), 5 recent moments (average = 60)
      // momentum = ((60 - 40) / 40) * 100 = 50%
      const moments: HopeMoment[] = [
        // Older moments
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `${i}`,
          connectionId: 'test-1',
          date: `2024-01-${i + 1}`,
          hopeLevel: 40,
          factors: [],
          notes: ''
        })),
        // Recent moments
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `${i + 5}`,
          connectionId: 'test-1',
          date: `2024-01-${i + 6}`,
          hopeLevel: 60,
          factors: [],
          notes: ''
        }))
      ]

      const result = calculator.analyzeHopeTrend(moments)
      expect(result.momentum).toBe(50)
      expect(result.trend).toBe('increasing')
    })
  })

  describe('getHopeBoostingActions', () => {
    it('should return actions for low score (< 30)', () => {
      const actions = calculator.getHopeBoostingActions(mockConnection, 25)
      
      expect(actions).toContain('相手のプロフィールを再確認して共通点を見つける')
      expect(actions).toContain('メッセージの頻度を少し増やしてみる')
      expect(actions).toContain('相手の興味のある話題を質問する')
      expect(actions).toHaveLength(3)
    })

    it('should return actions for medium score (30-60)', () => {
      const actions = calculator.getHopeBoostingActions(mockConnection, 45)
      
      expect(actions).toContain('電話やビデオ通話を提案する')
      expect(actions).toContain('具体的なデートプランを考える')
      expect(actions).toContain('より深い話題（将来の夢など）に触れる')
      expect(actions).toHaveLength(3)
    })

    it('should return actions for high score (> 60)', () => {
      const actions = calculator.getHopeBoostingActions(mockConnection, 75)
      
      expect(actions).toContain('次のステージへの移行を検討する')
      expect(actions).toContain('二人の関係を深める特別な体験を計画する')
      expect(actions).toContain('お互いの価値観について話し合う')
      expect(actions).toHaveLength(3)
    })

    it('should return appropriate actions for edge case scores', () => {
      const lowEdge = calculator.getHopeBoostingActions(mockConnection, 30)
      const mediumEdge = calculator.getHopeBoostingActions(mockConnection, 59)
      
      expect(lowEdge).toContain('電話やビデオ通話を提案する') // score = 30 should use medium actions
      expect(mediumEdge).toContain('電話やビデオ通話を提案する') // score = 59 should use medium actions
    })

    it('should handle extreme scores', () => {
      const zeroScore = calculator.getHopeBoostingActions(mockConnection, 0)
      const maxScore = calculator.getHopeBoostingActions(mockConnection, 100)
      
      expect(zeroScore).toHaveLength(3)
      expect(maxScore).toHaveLength(3)
    })
  })
})
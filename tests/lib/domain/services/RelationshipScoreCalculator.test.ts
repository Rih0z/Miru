import { RelationshipScoreCalculator } from '@/lib/domain/services/RelationshipScoreCalculator'
import { Connection } from '@/types'

describe('RelationshipScoreCalculator', () => {
  let calculator: RelationshipScoreCalculator
  let mockConnection: Connection

  beforeEach(() => {
    calculator = new RelationshipScoreCalculator()
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

  describe('calculateRelationshipScore', () => {
    it('should calculate score for healthy relationship', () => {
      const score = calculator.calculateRelationshipScore(mockConnection)
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should return higher score for advanced stage', () => {
      const earlyStageConnection = { ...mockConnection, current_stage: 'マッチング直後' }
      const lateStageConnection = { ...mockConnection, current_stage: '交際中' }

      const earlyScore = calculator.calculateRelationshipScore(earlyStageConnection)
      const lateScore = calculator.calculateRelationshipScore(lateStageConnection)

      expect(lateScore).toBeGreaterThan(earlyScore)
    })

    it('should return higher score for frequent communication', () => {
      const lowFreqConnection = { 
        ...mockConnection, 
        communication: { ...mockConnection.communication, frequency: '月数回' }
      }
      const highFreqConnection = { 
        ...mockConnection, 
        communication: { ...mockConnection.communication, frequency: '毎日' }
      }

      const lowScore = calculator.calculateRelationshipScore(lowFreqConnection)
      const highScore = calculator.calculateRelationshipScore(highFreqConnection)

      expect(highScore).toBeGreaterThan(lowScore)
    })

    it('should return higher score for fast response time', () => {
      const slowResponseConnection = { 
        ...mockConnection, 
        communication: { ...mockConnection.communication, responseTime: '1週間以上' }
      }
      const fastResponseConnection = { 
        ...mockConnection, 
        communication: { ...mockConnection.communication, responseTime: '即レス' }
      }

      const slowScore = calculator.calculateRelationshipScore(slowResponseConnection)
      const fastScore = calculator.calculateRelationshipScore(fastResponseConnection)

      expect(fastScore).toBeGreaterThan(slowScore)
    })

    it('should handle ended relationship', () => {
      const endedConnection = { ...mockConnection, current_stage: '終了' }
      const score = calculator.calculateRelationshipScore(endedConnection)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('calculateAverageScore', () => {
    it('should calculate average score for multiple connections', () => {
      const connections = [
        { ...mockConnection, id: '1' },
        { ...mockConnection, id: '2', current_stage: '交際中' },
        { ...mockConnection, id: '3', current_stage: 'マッチング直後' }
      ]

      const averageScore = calculator.calculateAverageScore(connections)
      expect(averageScore).toBeGreaterThan(0)
      expect(averageScore).toBeLessThanOrEqual(100)
    })

    it('should return 0 for empty connections array', () => {
      const averageScore = calculator.calculateAverageScore([])
      expect(averageScore).toBe(0)
    })

    it('should handle connections with different stages', () => {
      const connections = [
        { ...mockConnection, id: '1', current_stage: 'メッセージ中' },
        { ...mockConnection, id: '2', current_stage: '終了' }
      ]

      const averageScore = calculator.calculateAverageScore(connections)
      expect(averageScore).toBeGreaterThanOrEqual(0)
      expect(averageScore).toBeLessThanOrEqual(100)
    })
  })

  describe('score calculation behavior', () => {
    it('should calculate different scores for different stages', () => {
      const earlyConnection = { ...mockConnection, current_stage: 'マッチング直後' }
      const lateConnection = { ...mockConnection, current_stage: '交際中' }

      const earlyScore = calculator.calculateRelationshipScore(earlyConnection)
      const lateScore = calculator.calculateRelationshipScore(lateConnection)

      expect(lateScore).toBeGreaterThan(earlyScore)
    })

    it('should consider communication frequency', () => {
      const lowFreqConnection = { 
        ...mockConnection, 
        communication: { ...mockConnection.communication, frequency: '月1回' }
      }
      const highFreqConnection = { 
        ...mockConnection, 
        communication: { ...mockConnection.communication, frequency: '毎日' }
      }

      const lowScore = calculator.calculateRelationshipScore(lowFreqConnection)
      const highScore = calculator.calculateRelationshipScore(highFreqConnection)

      expect(highScore).toBeGreaterThanOrEqual(lowScore)
    })

    it('should consider hobbies for compatibility', () => {
      const fewHobbiesConnection = { 
        ...mockConnection, 
        basic_info: { ...mockConnection.basic_info, hobbies: ['映画'] }
      }
      const manyHobbiesConnection = { 
        ...mockConnection, 
        basic_info: { ...mockConnection.basic_info, hobbies: ['映画', 'カフェ', '読書', 'スポーツ'] }
      }

      const fewScore = calculator.calculateRelationshipScore(fewHobbiesConnection)
      const manyScore = calculator.calculateRelationshipScore(manyHobbiesConnection)

      expect(manyScore).toBeGreaterThanOrEqual(fewScore)
    })

    it('should consider attractive points for emotional connection', () => {
      const fewPointsConnection = { 
        ...mockConnection, 
        user_feelings: { ...mockConnection.user_feelings, attractivePoints: ['優しい'] }
      }
      const manyPointsConnection = { 
        ...mockConnection, 
        user_feelings: { ...mockConnection.user_feelings, attractivePoints: ['優しい', '面白い', '誠実', '頼りになる'] }
      }

      const fewScore = calculator.calculateRelationshipScore(fewPointsConnection)
      const manyScore = calculator.calculateRelationshipScore(manyPointsConnection)

      expect(manyScore).toBeGreaterThanOrEqual(fewScore)
    })

    it('should cap score at 100', () => {
      const perfectConnection = {
        ...mockConnection,
        current_stage: '交際中',
        communication: { ...mockConnection.communication, frequency: '毎日', responseTime: '即レス' },
        basic_info: { ...mockConnection.basic_info, hobbies: Array(10).fill('hobby') },
        user_feelings: { ...mockConnection.user_feelings, attractivePoints: Array(10).fill('point') }
      }

      const score = calculator.calculateRelationshipScore(perfectConnection)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('detailed scoring scenarios', () => {
    it('should handle all communication frequency cases', () => {
      const baseConnection = { ...mockConnection, communication: { ...mockConnection.communication } }
      
      // Test '数日に1回'
      const connection1 = { ...baseConnection, communication: { ...baseConnection.communication, frequency: '数日に1回' } }
      const score1 = calculator.calculateRelationshipScore(connection1)
      expect(score1).toBeGreaterThan(0)
      
      // Test '週1回'
      const connection2 = { ...baseConnection, communication: { ...baseConnection.communication, frequency: '週1回' } }
      const score2 = calculator.calculateRelationshipScore(connection2)
      expect(score2).toBeGreaterThan(0)
      
      // Test unknown frequency
      const connection3 = { ...baseConnection, communication: { ...baseConnection.communication, frequency: 'unknown' } }
      const score3 = calculator.calculateRelationshipScore(connection3)
      expect(score3).toBeGreaterThanOrEqual(0)
    })

    it('should handle all response time cases', () => {
      const baseConnection = { ...mockConnection, communication: { ...mockConnection.communication } }
      
      // Test '1日以内'
      const connection1 = { ...baseConnection, communication: { ...baseConnection.communication, responseTime: '1日以内' } }
      const score1 = calculator.calculateRelationshipScore(connection1)
      expect(score1).toBeGreaterThan(0)
      
      // Test '数日以内'
      const connection2 = { ...baseConnection, communication: { ...baseConnection.communication, responseTime: '数日以内' } }
      const score2 = calculator.calculateRelationshipScore(connection2)
      expect(score2).toBeGreaterThan(0)
      
      // Test unknown response time
      const connection3 = { ...baseConnection, communication: { ...baseConnection.communication, responseTime: 'unknown' } }
      const score3 = calculator.calculateRelationshipScore(connection3)
      expect(score3).toBeGreaterThanOrEqual(0)
    })

    it('should handle different expectation types', () => {
      const baseConnection = { ...mockConnection, user_feelings: { ...mockConnection.user_feelings } }
      
      // Test '楽しい関係'
      const connection1 = { ...baseConnection, user_feelings: { ...baseConnection.user_feelings, expectations: '楽しい関係' } }
      const score1 = calculator.calculateRelationshipScore(connection1)
      expect(score1).toBeGreaterThan(0)
      
      // Test '真剣な交際' (already tested but for completeness)
      const connection2 = { ...baseConnection, user_feelings: { ...baseConnection.user_feelings, expectations: '真剣な交際' } }
      const score2 = calculator.calculateRelationshipScore(connection2)
      expect(score2).toBeGreaterThan(score1) // 真剣な交際 should score higher
      
      // Test unknown expectation
      const connection3 = { ...baseConnection, user_feelings: { ...baseConnection.user_feelings, expectations: 'unknown' } }
      const score3 = calculator.calculateRelationshipScore(connection3)
      expect(score3).toBeGreaterThanOrEqual(0)
    })

    it('should handle null communication', () => {
      const connection = { ...mockConnection, communication: null }
      const score = calculator.calculateRelationshipScore(connection)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle undefined communication', () => {
      const connection = { ...mockConnection }
      delete (connection as any).communication
      const score = calculator.calculateRelationshipScore(connection)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle null basic_info', () => {
      const connection = { ...mockConnection, basic_info: null }
      const score = calculator.calculateRelationshipScore(connection)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle basic_info without hobbies', () => {
      const connection = { ...mockConnection, basic_info: { age: 25, occupation: 'Engineer', location: 'Tokyo' } }
      const score = calculator.calculateRelationshipScore(connection)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle null user_feelings', () => {
      const connection = { ...mockConnection, user_feelings: null }
      const score = calculator.calculateRelationshipScore(connection)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle undefined user_feelings', () => {
      const connection = { ...mockConnection }
      delete (connection as any).user_feelings
      const score = calculator.calculateRelationshipScore(connection)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle concerns reducing score', () => {
      const connectionWithConcerns = { 
        ...mockConnection, 
        user_feelings: { 
          ...mockConnection.user_feelings, 
          concerns: ['concern1', 'concern2', 'concern3'] 
        }
      }
      const connectionWithoutConcerns = { 
        ...mockConnection, 
        user_feelings: { 
          ...mockConnection.user_feelings, 
          concerns: [] 
        }
      }
      
      const scoreWith = calculator.calculateRelationshipScore(connectionWithConcerns)
      const scoreWithout = calculator.calculateRelationshipScore(connectionWithoutConcerns)
      
      expect(scoreWithout).toBeGreaterThanOrEqual(scoreWith)
    })

    it('should handle user_feelings without attractivePoints', () => {
      const connection = { 
        ...mockConnection, 
        user_feelings: { 
          expectations: '真剣な交際',
          concerns: []
        }
      }
      const score = calculator.calculateRelationshipScore(connection)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should ensure emotional score never goes below 0', () => {
      const connectionWithManyConcerns = { 
        ...mockConnection, 
        user_feelings: { 
          expectations: undefined,
          attractivePoints: [],
          concerns: ['concern1', 'concern2', 'concern3', 'concern4', 'concern5', 'concern6', 'concern7', 'concern8', 'concern9', 'concern10']
        }
      }
      
      const score = calculator.calculateRelationshipScore(connectionWithManyConcerns)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle unknown stage', () => {
      const connection = { ...mockConnection, current_stage: 'unknown_stage' as any }
      const score = calculator.calculateRelationshipScore(connection)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle all stage types', () => {
      const stages = ['マッチング直後', 'メッセージ中', 'LINE交換済み', 'デート前', 'デート後', '交際中', '停滞中', '終了']
      
      stages.forEach(stage => {
        const connection = { ...mockConnection, current_stage: stage as any }
        const score = calculator.calculateRelationshipScore(connection)
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      })
    })
  })
})
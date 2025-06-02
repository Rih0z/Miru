import { CommunicationScoreCalculator } from '@/lib/domain/services/CommunicationScoreCalculator'

describe('CommunicationScoreCalculator', () => {
  let calculator: CommunicationScoreCalculator

  beforeEach(() => {
    calculator = new CommunicationScoreCalculator()
  })

  describe('calculateCommunicationScore', () => {
    it('should return correct scores for different frequencies', () => {
      const frequencies = [
        { frequency: '毎日', expectedScore: 20 },
        { frequency: '2日に1回', expectedScore: 15 },
        { frequency: '週2-3回', expectedScore: 10 },
        { frequency: '週1回', expectedScore: 5 },
        { frequency: '月数回', expectedScore: 2 },
        { frequency: '不定期', expectedScore: 1 }
      ]

      frequencies.forEach(({ frequency, expectedScore }) => {
        const communication = { frequency }
        const score = calculator.calculateCommunicationScore(communication)
        expect(score).toBe(expectedScore)
      })
    })

    it('should return 0 for unknown frequency', () => {
      const communication = { frequency: '未知の頻度' }
      const score = calculator.calculateCommunicationScore(communication)
      expect(score).toBe(0)
    })

    it('should return 0 for undefined frequency', () => {
      const communication = { frequency: undefined }
      const score = calculator.calculateCommunicationScore(communication)
      expect(score).toBe(0)
    })

    it('should return 0 for null frequency', () => {
      const communication = { frequency: null }
      const score = calculator.calculateCommunicationScore(communication)
      expect(score).toBe(0)
    })

    it('should return 0 for empty communication object', () => {
      const communication = {}
      const score = calculator.calculateCommunicationScore(communication)
      expect(score).toBe(0)
    })

    it('should handle communication object with other properties', () => {
      const communication = {
        frequency: '毎日',
        responseTime: '即レス',
        lastContact: '2024-01-01',
        communicationStyle: 'フレンドリー'
      }
      const score = calculator.calculateCommunicationScore(communication)
      expect(score).toBe(20) // Should only consider frequency
    })

    it('should throw error for null communication object', () => {
      expect(() => {
        calculator.calculateCommunicationScore(null)
      }).toThrow()
    })

    it('should throw error for undefined communication object', () => {
      expect(() => {
        calculator.calculateCommunicationScore(undefined)
      }).toThrow()
    })

    it('should be case sensitive', () => {
      const communication = { frequency: '毎日' } // Correct case
      const communicationWrongCase = { frequency: 'まいにち' } // Different case

      const score = calculator.calculateCommunicationScore(communication)
      const scoreWrongCase = calculator.calculateCommunicationScore(communicationWrongCase)

      expect(score).toBe(20)
      expect(scoreWrongCase).toBe(0)
    })
  })

  describe('calculateResponseScore', () => {
    it('should return correct scores for different response times', () => {
      const responseTimes = [
        { responseTime: '即レス', expectedScore: 20 },
        { responseTime: '数時間以内', expectedScore: 15 },
        { responseTime: '1日以内', expectedScore: 10 },
        { responseTime: '2-3日', expectedScore: 5 },
        { responseTime: '1週間以上', expectedScore: 0 }
      ]

      responseTimes.forEach(({ responseTime, expectedScore }) => {
        const communication = { responseTime }
        const score = calculator.calculateResponseScore(communication)
        expect(score).toBe(expectedScore)
      })
    })

    it('should return 0 for unknown response time', () => {
      const communication = { responseTime: '未知の応答時間' }
      const score = calculator.calculateResponseScore(communication)
      expect(score).toBe(0)
    })

    it('should return 0 for undefined response time', () => {
      const communication = { responseTime: undefined }
      const score = calculator.calculateResponseScore(communication)
      expect(score).toBe(0)
    })

    it('should return 0 for null response time', () => {
      const communication = { responseTime: null }
      const score = calculator.calculateResponseScore(communication)
      expect(score).toBe(0)
    })

    it('should return 0 for empty communication object', () => {
      const communication = {}
      const score = calculator.calculateResponseScore(communication)
      expect(score).toBe(0)
    })

    it('should handle communication object with other properties', () => {
      const communication = {
        frequency: '毎日',
        responseTime: '即レス',
        lastContact: '2024-01-01',
        communicationStyle: 'フレンドリー'
      }
      const score = calculator.calculateResponseScore(communication)
      expect(score).toBe(20) // Should only consider responseTime
    })

    it('should throw error for null communication object', () => {
      expect(() => {
        calculator.calculateResponseScore(null)
      }).toThrow()
    })

    it('should throw error for undefined communication object', () => {
      expect(() => {
        calculator.calculateResponseScore(undefined)
      }).toThrow()
    })

    it('should be case sensitive', () => {
      const communication = { responseTime: '即レス' } // Correct case
      const communicationWrongCase = { responseTime: 'そくれす' } // Different case

      const score = calculator.calculateResponseScore(communication)
      const scoreWrongCase = calculator.calculateResponseScore(communicationWrongCase)

      expect(score).toBe(20)
      expect(scoreWrongCase).toBe(0)
    })
  })

  describe('integration and edge cases', () => {
    it('should maintain consistent behavior across multiple calls', () => {
      const communication = {
        frequency: '毎日',
        responseTime: '即レス'
      }

      const commScore1 = calculator.calculateCommunicationScore(communication)
      const commScore2 = calculator.calculateCommunicationScore(communication)
      const responseScore1 = calculator.calculateResponseScore(communication)
      const responseScore2 = calculator.calculateResponseScore(communication)

      expect(commScore1).toBe(commScore2)
      expect(responseScore1).toBe(responseScore2)
      expect(commScore1).toBe(20)
      expect(responseScore1).toBe(20)
    })

    it('should not modify input objects', () => {
      const originalCommunication = {
        frequency: '毎日',
        responseTime: '即レス'
      }
      const communicationCopy = JSON.parse(JSON.stringify(originalCommunication))

      calculator.calculateCommunicationScore(originalCommunication)
      calculator.calculateResponseScore(originalCommunication)

      expect(originalCommunication).toEqual(communicationCopy)
    })

    it('should handle realistic communication data', () => {
      const realisticCommunication = {
        frequency: '週2-3回',
        lastContact: '2024-01-01T10:30:00Z',
        responseTime: '数時間以内',
        communicationStyle: 'フレンドリー',
        lastMessage: '今度お時間ありますか？',
        messageCount: 25
      }

      const commScore = calculator.calculateCommunicationScore(realisticCommunication)
      const responseScore = calculator.calculateResponseScore(realisticCommunication)

      expect(commScore).toBe(10) // '週2-3回'
      expect(responseScore).toBe(15) // '数時間以内'
    })

    it('should handle empty string values', () => {
      const communication = {
        frequency: '',
        responseTime: ''
      }

      const commScore = calculator.calculateCommunicationScore(communication)
      const responseScore = calculator.calculateResponseScore(communication)

      expect(commScore).toBe(0)
      expect(responseScore).toBe(0)
    })

    it('should handle numeric values as strings', () => {
      const communication = {
        frequency: '123',
        responseTime: '456'
      }

      const commScore = calculator.calculateCommunicationScore(communication)
      const responseScore = calculator.calculateResponseScore(communication)

      expect(commScore).toBe(0)
      expect(responseScore).toBe(0)
    })

    it('should verify all frequency scores are covered', () => {
      const frequencyScores = {
        '毎日': 20,
        '2日に1回': 15,
        '週2-3回': 10,
        '週1回': 5,
        '月数回': 2,
        '不定期': 1
      }

      Object.entries(frequencyScores).forEach(([frequency, expectedScore]) => {
        const communication = { frequency }
        const score = calculator.calculateCommunicationScore(communication)
        expect(score).toBe(expectedScore)
      })
    })

    it('should verify all response time scores are covered', () => {
      const responseTimeScores = {
        '即レス': 20,
        '数時間以内': 15,
        '1日以内': 10,
        '2-3日': 5,
        '1週間以上': 0
      }

      Object.entries(responseTimeScores).forEach(([responseTime, expectedScore]) => {
        const communication = { responseTime }
        const score = calculator.calculateResponseScore(communication)
        expect(score).toBe(expectedScore)
      })
    })

    it('should handle boundary cases', () => {
      // Test the lowest and highest scoring combinations
      const bestCommunication = {
        frequency: '毎日',
        responseTime: '即レス'
      }

      const worstCommunication = {
        frequency: '不定期',
        responseTime: '1週間以上'
      }

      expect(calculator.calculateCommunicationScore(bestCommunication)).toBe(20)
      expect(calculator.calculateResponseScore(bestCommunication)).toBe(20)
      expect(calculator.calculateCommunicationScore(worstCommunication)).toBe(1)
      expect(calculator.calculateResponseScore(worstCommunication)).toBe(0)
    })
  })
})
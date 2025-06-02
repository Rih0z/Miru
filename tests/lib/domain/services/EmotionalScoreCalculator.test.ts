import { EmotionalScoreCalculator } from '@/lib/domain/services/EmotionalScoreCalculator'

describe('EmotionalScoreCalculator', () => {
  let calculator: EmotionalScoreCalculator

  beforeEach(() => {
    calculator = new EmotionalScoreCalculator()
  })

  describe('calculateEmotionalScore', () => {
    it('should calculate score based on attractive points', () => {
      const feelings = {
        attractivePoints: ['優しい', '話が面白い', '価値観が合う'],
        expectations: '真剣な交際'
      }

      const score = calculator.calculateEmotionalScore(feelings)
      
      // 3 attractive points * 3 = 9, plus expectations (5) = 14
      expect(score).toBe(14)
    })

    it('should cap attractive points score at 10', () => {
      const feelings = {
        attractivePoints: ['優しい', '話が面白い', '価値観が合う', '誠実', '頼りになる'], // 5 points * 3 = 15, capped at 10
        expectations: '真剣な交際'
      }

      const score = calculator.calculateEmotionalScore(feelings)
      
      // Attractive points capped at 10, plus expectations (5) = 15 (max)
      expect(score).toBe(15)
    })

    it('should cap total score at 15', () => {
      const feelings = {
        attractivePoints: Array(10).fill('魅力'), // Would be 10 points if not capped
        expectations: '真剣な交際' // 5 points
      }

      const score = calculator.calculateEmotionalScore(feelings)
      
      expect(score).toBe(15) // Should be capped at 15
    })

    it('should handle different expectation types', () => {
      const expectations = [
        { expectation: '真剣な交際', expectedScore: 5 },
        { expectation: '楽しい関係', expectedScore: 4 },
        { expectation: '友達から始めたい', expectedScore: 3 },
        { expectation: 'まだわからない', expectedScore: 2 },
        { expectation: 'カジュアルな関係', expectedScore: 1 }
      ]

      expectations.forEach(({ expectation, expectedScore }) => {
        const feelings = {
          attractivePoints: [],
          expectations: expectation
        }

        const score = calculator.calculateEmotionalScore(feelings)
        expect(score).toBe(expectedScore)
      })
    })

    it('should handle unknown expectation types', () => {
      const feelings = {
        attractivePoints: [],
        expectations: '未知の期待'
      }

      const score = calculator.calculateEmotionalScore(feelings)
      expect(score).toBe(0) // Unknown expectation should return 0
    })

    it('should handle empty attractive points', () => {
      const feelings = {
        attractivePoints: [],
        expectations: '真剣な交際'
      }

      const score = calculator.calculateEmotionalScore(feelings)
      expect(score).toBe(5) // Only expectation score
    })

    it('should handle null attractive points', () => {
      const feelings = {
        attractivePoints: null,
        expectations: '真剣な交際'
      }

      const score = calculator.calculateEmotionalScore(feelings)
      expect(score).toBe(5) // Only expectation score
    })

    it('should handle undefined attractive points', () => {
      const feelings = {
        attractivePoints: undefined,
        expectations: '真剣な交際'
      }

      const score = calculator.calculateEmotionalScore(feelings)
      expect(score).toBe(5) // Only expectation score
    })

    it('should handle missing expectations', () => {
      const feelings = {
        attractivePoints: ['優しい', '面白い']
      }

      const score = calculator.calculateEmotionalScore(feelings)
      expect(score).toBe(6) // 2 attractive points * 3 = 6, no expectation score
    })

    it('should handle completely empty feelings object', () => {
      const feelings = {}

      const score = calculator.calculateEmotionalScore(feelings)
      expect(score).toBe(0)
    })

    it('should throw error for null feelings object', () => {
      expect(() => {
        calculator.calculateEmotionalScore(null)
      }).toThrow()
    })

    it('should throw error for undefined feelings object', () => {
      expect(() => {
        calculator.calculateEmotionalScore(undefined)
      }).toThrow()
    })

    it('should calculate correct scores for various combinations', () => {
      const testCases = [
        {
          feelings: { attractivePoints: ['優しい'], expectations: '真剣な交際' },
          expected: 8 // 1*3 + 5 = 8
        },
        {
          feelings: { attractivePoints: ['優しい', '面白い'], expectations: '楽しい関係' },
          expected: 10 // 2*3 + 4 = 10
        },
        {
          feelings: { attractivePoints: ['優しい', '面白い', '誠実'], expectations: '友達から始めたい' },
          expected: 12 // 3*3 + 3 = 12
        },
        {
          feelings: { attractivePoints: ['優しい', '面白い', '誠実', '頼りになる'], expectations: 'カジュアルな関係' },
          expected: 11 // min(4*3, 10) + 1 = 10 + 1 = 11
        }
      ]

      testCases.forEach(({ feelings, expected }) => {
        const score = calculator.calculateEmotionalScore(feelings)
        expect(score).toBe(expected)
      })
    })
  })

  describe('calculateCommonalityScore', () => {
    it('should calculate score based on hobbies', () => {
      const basicInfo = {
        hobbies: ['映画', 'カフェ巡り', '読書'],
        location: '東京'
      }

      const score = calculator.calculateCommonalityScore(basicInfo)
      
      // 3 hobbies * 3 = 9, plus location (5) = 14
      expect(score).toBe(14)
    })

    it('should cap hobbies score at 10', () => {
      const basicInfo = {
        hobbies: ['映画', 'カフェ巡り', '読書', 'スポーツ', '料理'], // 5 hobbies * 3 = 15, capped at 10
        location: '東京'
      }

      const score = calculator.calculateCommonalityScore(basicInfo)
      
      // Hobbies capped at 10, plus location (5) = 15 (max)
      expect(score).toBe(15)
    })

    it('should cap total score at 15', () => {
      const basicInfo = {
        hobbies: Array(10).fill('趣味'), // Would be 10 points if not capped
        location: '東京' // 5 points
      }

      const score = calculator.calculateCommonalityScore(basicInfo)
      
      expect(score).toBe(15) // Should be capped at 15
    })

    it('should add 5 points for having location', () => {
      const withLocation = {
        hobbies: [],
        location: '東京'
      }

      const withoutLocation = {
        hobbies: []
      }

      const scoreWith = calculator.calculateCommonalityScore(withLocation)
      const scoreWithout = calculator.calculateCommonalityScore(withoutLocation)
      
      expect(scoreWith).toBe(5)
      expect(scoreWithout).toBe(0)
      expect(scoreWith - scoreWithout).toBe(5)
    })

    it('should handle empty hobbies', () => {
      const basicInfo = {
        hobbies: [],
        location: '東京'
      }

      const score = calculator.calculateCommonalityScore(basicInfo)
      expect(score).toBe(5) // Only location score
    })

    it('should handle null hobbies', () => {
      const basicInfo = {
        hobbies: null,
        location: '東京'
      }

      const score = calculator.calculateCommonalityScore(basicInfo)
      expect(score).toBe(5) // Only location score
    })

    it('should handle undefined hobbies', () => {
      const basicInfo = {
        hobbies: undefined,
        location: '東京'
      }

      const score = calculator.calculateCommonalityScore(basicInfo)
      expect(score).toBe(5) // Only location score
    })

    it('should handle missing location', () => {
      const basicInfo = {
        hobbies: ['映画', '読書']
      }

      const score = calculator.calculateCommonalityScore(basicInfo)
      expect(score).toBe(6) // 2 hobbies * 3 = 6, no location score
    })

    it('should handle null location', () => {
      const basicInfo = {
        hobbies: ['映画', '読書'],
        location: null
      }

      const score = calculator.calculateCommonalityScore(basicInfo)
      expect(score).toBe(6) // 2 hobbies * 3 = 6, no location score
    })

    it('should handle undefined location', () => {
      const basicInfo = {
        hobbies: ['映画', '読書'],
        location: undefined
      }

      const score = calculator.calculateCommonalityScore(basicInfo)
      expect(score).toBe(6) // 2 hobbies * 3 = 6, no location score
    })

    it('should handle empty string location', () => {
      const basicInfo = {
        hobbies: ['映画', '読書'],
        location: ''
      }

      const score = calculator.calculateCommonalityScore(basicInfo)
      expect(score).toBe(6) // Empty string should not count as location
    })

    it('should handle completely empty basicInfo object', () => {
      const basicInfo = {}

      const score = calculator.calculateCommonalityScore(basicInfo)
      expect(score).toBe(0)
    })

    it('should throw error for null basicInfo object', () => {
      expect(() => {
        calculator.calculateCommonalityScore(null)
      }).toThrow()
    })

    it('should throw error for undefined basicInfo object', () => {
      expect(() => {
        calculator.calculateCommonalityScore(undefined)
      }).toThrow()
    })

    it('should calculate correct scores for various combinations', () => {
      const testCases = [
        {
          basicInfo: { hobbies: ['映画'], location: '東京' },
          expected: 8 // 1*3 + 5 = 8
        },
        {
          basicInfo: { hobbies: ['映画', '読書'], location: '大阪' },
          expected: 11 // 2*3 + 5 = 11
        },
        {
          basicInfo: { hobbies: ['映画', '読書', '料理'], location: '名古屋' },
          expected: 14 // 3*3 + 5 = 14
        },
        {
          basicInfo: { hobbies: ['映画', '読書', '料理', 'スポーツ'], location: null },
          expected: 10 // min(4*3, 10) = 10, no location = 10
        },
        {
          basicInfo: { hobbies: [], location: '福岡' },
          expected: 5 // 0 + 5 = 5
        }
      ]

      testCases.forEach(({ basicInfo, expected }) => {
        const score = calculator.calculateCommonalityScore(basicInfo)
        expect(score).toBe(expected)
      })
    })
  })

  describe('integration and edge cases', () => {
    it('should maintain consistent behavior across multiple calls', () => {
      const feelings = {
        attractivePoints: ['優しい', '面白い'],
        expectations: '真剣な交際'
      }

      const score1 = calculator.calculateEmotionalScore(feelings)
      const score2 = calculator.calculateEmotionalScore(feelings)
      const score3 = calculator.calculateEmotionalScore(feelings)

      expect(score1).toBe(score2)
      expect(score2).toBe(score3)
      expect(score1).toBe(11) // 2*3 + 5 = 11
    })

    it('should not modify input objects', () => {
      const originalFeelings = {
        attractivePoints: ['優しい', '面白い'],
        expectations: '真剣な交際'
      }
      const feelingsCopy = JSON.parse(JSON.stringify(originalFeelings))

      calculator.calculateEmotionalScore(originalFeelings)

      expect(originalFeelings).toEqual(feelingsCopy)
    })

    it('should handle realistic input data', () => {
      const realisticFeelings = {
        attractivePoints: ['優しそう', '話が合いそう', '価値観が近い', '見た目がタイプ'],
        expectations: '真剣な交際',
        concerns: ['距離が遠い', '忙しそう'] // This should be ignored in scoring
      }

      const realisticBasicInfo = {
        hobbies: ['映画鑑賞', 'カフェ巡り', '読書'],
        location: '東京都渋谷区',
        age: 28,
        occupation: 'エンジニア'
      }

      const emotionalScore = calculator.calculateEmotionalScore(realisticFeelings)
      const commonalityScore = calculator.calculateCommonalityScore(realisticBasicInfo)

      expect(emotionalScore).toBe(15) // min(4*3, 10) + 5 = 15
      expect(commonalityScore).toBe(14) // 3*3 + 5 = 14
    })

    it('should handle extreme cases gracefully', () => {
      // Test with many hobbies and attractive points
      const extremeFeelings = {
        attractivePoints: Array(20).fill('魅力'),
        expectations: '真剣な交際'
      }

      const extremeBasicInfo = {
        hobbies: Array(20).fill('趣味'),
        location: '東京'
      }

      const emotionalScore = calculator.calculateEmotionalScore(extremeFeelings)
      const commonalityScore = calculator.calculateCommonalityScore(extremeBasicInfo)

      expect(emotionalScore).toBe(15) // Should be capped
      expect(commonalityScore).toBe(15) // Should be capped
    })

    it('should handle boundary values correctly', () => {
      // Test exactly at the cap
      const feelingsAtCap = {
        attractivePoints: ['1', '2', '3'], // Exactly 3*3 = 9
        expectations: '真剣な交際' // 5 points
      }

      const basicInfoAtCap = {
        hobbies: ['1', '2', '3'], // Exactly 3*3 = 9
        location: '東京' // 5 points
      }

      const emotionalScore = calculator.calculateEmotionalScore(feelingsAtCap)
      const commonalityScore = calculator.calculateCommonalityScore(basicInfoAtCap)

      expect(emotionalScore).toBe(14) // 9 + 5 = 14
      expect(commonalityScore).toBe(14) // 9 + 5 = 14
    })
  })
})
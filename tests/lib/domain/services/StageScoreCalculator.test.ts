import { StageScoreCalculator } from '@/lib/domain/services/StageScoreCalculator'

describe('StageScoreCalculator', () => {
  let calculator: StageScoreCalculator

  beforeEach(() => {
    calculator = new StageScoreCalculator()
  })

  describe('calculateStageScore', () => {
    it('should return correct scores for all defined stages', () => {
      const stageScores = [
        { stage: 'マッチング直後', expectedScore: 5 },
        { stage: 'メッセージ中', expectedScore: 10 },
        { stage: 'LINE交換済み', expectedScore: 15 },
        { stage: 'デート前', expectedScore: 25 },
        { stage: 'デート後', expectedScore: 20 },
        { stage: '交際中', expectedScore: 30 },
        { stage: '停滞中', expectedScore: 5 },
        { stage: '終了', expectedScore: 0 }
      ]

      stageScores.forEach(({ stage, expectedScore }) => {
        const score = calculator.calculateStageScore(stage)
        expect(score).toBe(expectedScore)
      })
    })

    it('should return 0 for unknown stage', () => {
      const unknownStages = [
        '未知のステージ',
        '存在しないステージ',
        'unknown',
        'invalid_stage'
      ]

      unknownStages.forEach(stage => {
        const score = calculator.calculateStageScore(stage)
        expect(score).toBe(0)
      })
    })

    it('should return 0 for empty string', () => {
      const score = calculator.calculateStageScore('')
      expect(score).toBe(0)
    })

    it('should return 0 for null input', () => {
      const score = calculator.calculateStageScore(null as any)
      expect(score).toBe(0)
    })

    it('should return 0 for undefined input', () => {
      const score = calculator.calculateStageScore(undefined as any)
      expect(score).toBe(0)
    })

    it('should be case sensitive', () => {
      // Test exact case match
      const correctCase = calculator.calculateStageScore('マッチング直後')
      expect(correctCase).toBe(5)

      // Test different cases should return 0
      const wrongCases = [
        'マッチング',
        'まっちんぐ直後',
        'MATCHING直後'
      ]

      wrongCases.forEach(stage => {
        const score = calculator.calculateStageScore(stage)
        expect(score).toBe(0)
      })
    })

    it('should handle stages with leading/trailing whitespace', () => {
      const stagesWithWhitespace = [
        ' マッチング直後',
        'マッチング直後 ',
        ' マッチング直後 ',
        '\tメッセージ中\t',
        '\nLINE交換済み\n'
      ]

      stagesWithWhitespace.forEach(stage => {
        const score = calculator.calculateStageScore(stage)
        expect(score).toBe(0) // Should not match due to whitespace
      })
    })

    it('should return highest score for 交際中', () => {
      const allScores = [
        calculator.calculateStageScore('マッチング直後'),
        calculator.calculateStageScore('メッセージ中'),
        calculator.calculateStageScore('LINE交換済み'),
        calculator.calculateStageScore('デート前'),
        calculator.calculateStageScore('デート後'),
        calculator.calculateStageScore('交際中'),
        calculator.calculateStageScore('停滞中'),
        calculator.calculateStageScore('終了')
      ]

      const maxScore = Math.max(...allScores)
      const 交際中Score = calculator.calculateStageScore('交際中')
      
      expect(交際中Score).toBe(30)
      expect(交際中Score).toBe(maxScore)
    })

    it('should return lowest score for 終了', () => {
      const allScores = [
        calculator.calculateStageScore('マッチング直後'),
        calculator.calculateStageScore('メッセージ中'),
        calculator.calculateStageScore('LINE交換済み'),
        calculator.calculateStageScore('デート前'),
        calculator.calculateStageScore('デート後'),
        calculator.calculateStageScore('交際中'),
        calculator.calculateStageScore('停滞中'),
        calculator.calculateStageScore('終了')
      ]

      const minScore = Math.min(...allScores)
      const 終了Score = calculator.calculateStageScore('終了')
      
      expect(終了Score).toBe(0)
      expect(終了Score).toBe(minScore)
    })

    it('should maintain consistent behavior across multiple calls', () => {
      const stage = 'メッセージ中'
      
      const score1 = calculator.calculateStageScore(stage)
      const score2 = calculator.calculateStageScore(stage)
      const score3 = calculator.calculateStageScore(stage)

      expect(score1).toBe(score2)
      expect(score2).toBe(score3)
      expect(score1).toBe(10)
    })

    it('should handle numeric input as string', () => {
      const numericInputs = ['1', '10', '25', '0', '-1']
      
      numericInputs.forEach(input => {
        const score = calculator.calculateStageScore(input)
        expect(score).toBe(0) // Numeric strings should not match any stage
      })
    })

    it('should handle special characters', () => {
      const specialInputs = [
        '!@#$%^&*()',
        '123456',
        'stage_name',
        'stage-name',
        'stage.name'
      ]
      
      specialInputs.forEach(input => {
        const score = calculator.calculateStageScore(input)
        expect(score).toBe(0)
      })
    })

    it('should verify all stage scores are positive except 終了', () => {
      const stages = [
        'マッチング直後',
        'メッセージ中',
        'LINE交換済み',
        'デート前',
        'デート後',
        '交際中',
        '停滞中'
      ]

      stages.forEach(stage => {
        const score = calculator.calculateStageScore(stage)
        expect(score).toBeGreaterThan(0)
      })

      // 終了 should be 0
      expect(calculator.calculateStageScore('終了')).toBe(0)
    })

    it('should have different scores for different stages', () => {
      const stages = [
        'マッチング直後',
        'メッセージ中',
        'LINE交換済み',
        'デート前',
        'デート後',
        '交際中',
        '停滞中',
        '終了'
      ]

      const scores = stages.map(stage => calculator.calculateStageScore(stage))
      const uniqueScores = [...new Set(scores)]

      // Should have some unique scores (though some stages might have the same score)
      expect(uniqueScores.length).toBeGreaterThan(1)
    })

    it('should handle boundary values correctly', () => {
      // Test the extreme cases
      const highestScoringStage = '交際中'
      const lowestScoringStage = '終了'
      
      expect(calculator.calculateStageScore(highestScoringStage)).toBe(30)
      expect(calculator.calculateStageScore(lowestScoringStage)).toBe(0)
    })

    it('should verify progression logic makes sense', () => {
      // Earlier stages should generally have lower scores than later stages
      // (with some exceptions like デート後 being less than デート前)
      const マッチング直後 = calculator.calculateStageScore('マッチング直後')
      const メッセージ中 = calculator.calculateStageScore('メッセージ中')
      const LINE交換済み = calculator.calculateStageScore('LINE交換済み')
      const 交際中 = calculator.calculateStageScore('交際中')

      expect(マッチング直後).toBeLessThan(メッセージ中)
      expect(メッセージ中).toBeLessThan(LINE交換済み)
      expect(LINE交換済み).toBeLessThan(交際中)
    })

    it('should handle all stage variations consistently', () => {
      // Test that the exact strings work
      const testCases = [
        { input: 'マッチング直後', expected: 5 },
        { input: 'メッセージ中', expected: 10 },
        { input: 'LINE交換済み', expected: 15 },
        { input: 'デート前', expected: 25 },
        { input: 'デート後', expected: 20 },
        { input: '交際中', expected: 30 },
        { input: '停滞中', expected: 5 },
        { input: '終了', expected: 0 }
      ]

      testCases.forEach(({ input, expected }) => {
        const score = calculator.calculateStageScore(input)
        expect(score).toBe(expected)
      })
    })
  })

  describe('integration and edge cases', () => {
    it('should not modify any internal state', () => {
      const stage = 'メッセージ中'
      
      // Call multiple times and verify consistent results
      const results = Array(5).fill(null).map(() => 
        calculator.calculateStageScore(stage)
      )
      
      expect(results.every(result => result === 10)).toBe(true)
    })

    it('should handle rapid successive calls', () => {
      const stages = ['マッチング直後', 'メッセージ中', 'LINE交換済み', 'デート前']
      const expectedScores = [5, 10, 15, 25]
      
      // Rapid successive calls
      for (let i = 0; i < 100; i++) {
        stages.forEach((stage, index) => {
          const score = calculator.calculateStageScore(stage)
          expect(score).toBe(expectedScores[index])
        })
      }
    })

    it('should work with realistic use cases', () => {
      // Simulate a typical relationship progression
      const progression = [
        'マッチング直後',
        'メッセージ中',
        'LINE交換済み',
        'デート前',
        'デート後',
        '交際中'
      ]

      const scores = progression.map(stage => 
        calculator.calculateStageScore(stage)
      )

      // Verify scores increase overall (with デート後 exception)
      expect(scores[0]).toBeLessThan(scores[1]) // マッチング直後 < メッセージ中
      expect(scores[1]).toBeLessThan(scores[2]) // メッセージ中 < LINE交換済み
      expect(scores[2]).toBeLessThan(scores[3]) // LINE交換済み < デート前
      expect(scores[4]).toBeLessThan(scores[5]) // デート後 < 交際中
    })
  })
})
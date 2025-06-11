import { DataImportProcessor } from '@/lib/domain/services/DataImportProcessor'
import { ImportedUserData, ImportedConnection } from '@/types/data-import'
import { Connection, ConnectionStage } from '@/types'

describe('DataImportProcessor', () => {
  let processor: DataImportProcessor

  beforeEach(() => {
    processor = new DataImportProcessor()
  })

  describe('validateImportData', () => {
    it('should validate valid import data', () => {
      const validData = {
        connections: [
          {
            nickname: 'テストさん',
            platform: 'pairs',
            currentStage: 'messaging',
            attractionLevel: 8,
            compatibilityScore: 7,
            communicationScore: 9
          }
        ],
        userProfile: {
          name: 'テストユーザー',
          age: 28,
          interests: ['映画', '旅行']
        },
        importMetadata: {
          source: 'manual',
          version: '1.0',
          timestamp: new Date().toISOString()
        }
      }

      const result = processor.validateImportData(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it('should detect missing connections array', () => {
      const invalidData = {
        userProfile: {},
        importMetadata: {}
      }

      const result = processor.validateImportData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('connections配列が見つかりません')
    })

    it('should detect missing userProfile', () => {
      const invalidData = {
        connections: [],
        importMetadata: {}
      }

      const result = processor.validateImportData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('userProfileオブジェクトが見つかりません')
    })

    it('should detect missing importMetadata', () => {
      const invalidData = {
        connections: [],
        userProfile: {}
      }

      const result = processor.validateImportData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('importMetadataオブジェクトが見つかりません')
    })

    it('should validate connection required fields', () => {
      const invalidData = {
        connections: [
          { platform: 'pairs' }, // missing nickname and currentStage
          { nickname: 'テスト' }, // missing platform and currentStage
          { nickname: 'テスト2', platform: 'tinder' } // missing currentStage
        ],
        userProfile: {},
        importMetadata: {}
      }

      const result = processor.validateImportData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('コネクション1: nicknameが必要です')
      expect(result.errors).toContain('コネクション1: currentStageが必要です')
      expect(result.errors).toContain('コネクション2: platformが必要です')
      expect(result.errors).toContain('コネクション2: currentStageが必要です')
      expect(result.errors).toContain('コネクション3: currentStageが必要です')
    })

    it('should warn about out-of-range scores', () => {
      const data = {
        connections: [
          {
            nickname: 'テスト',
            platform: 'pairs',
            currentStage: 'messaging',
            attractionLevel: 11, // out of range
            compatibilityScore: 0, // out of range
            communicationScore: 15 // out of range
          }
        ],
        userProfile: {},
        importMetadata: {}
      }

      const result = processor.validateImportData(data)
      expect(result.warnings).toContain('コネクション1: attractionLevelは1-10の範囲で設定してください')
      expect(result.warnings).toContain('コネクション1: compatibilityScoreは1-10の範囲で設定してください')
      expect(result.warnings).toContain('コネクション1: communicationScoreは1-10の範囲で設定してください')
    })

    it('should detect invalid dates', () => {
      const data = {
        connections: [
          {
            nickname: 'テスト',
            platform: 'pairs',
            currentStage: 'messaging',
            interactionHistory: {
              firstMessage: 'invalid-date',
              lastMessage: new Date().toISOString()
            }
          }
        ],
        userProfile: {},
        importMetadata: {}
      }

      const result = processor.validateImportData(data)
      expect(result.warnings).toContain('コネクション1: firstMessageの日付形式が無効です')
    })
  })

  describe('convertToMiruFormat', () => {
    const validImportData: ImportedUserData = {
      connections: [
        {
          nickname: 'テストさん',
          platform: 'pairs',
          currentStage: 'messaging' as ConnectionStage,
          attractionLevel: 8,
          compatibilityScore: 7,
          age: 28,
          occupation: 'エンジニア',
          location: '東京',
          hobbies: ['映画', '音楽'],
          messageHistory: [
            { date: '2024-01-01', content: 'こんにちは' },
            { date: '2024-01-02', content: 'よろしくお願いします' }
          ],
          responsePatterns: {
            messageLength: 'medium',
            averageResponseTime: 'within_hours'
          },
          concerns: ['忙しそう'],
          positiveTraits: ['優しい', '面白い']
        }
      ],
      userProfile: {
        name: 'テストユーザー',
        age: 28,
        interests: ['映画', '旅行']
      },
      importMetadata: {
        source: 'manual',
        version: '1.0',
        timestamp: new Date().toISOString()
      }
    }

    it('should convert import data to Miru format', () => {
      const result = processor.convertToMiruFormat(validImportData)
      
      expect(result.connections).toHaveLength(1)
      expect(result.connections[0].nickname).toBe('テストさん')
      expect(result.connections[0].platform).toBe('pairs')
      expect(result.connections[0].basic_info.age).toBe(28)
      expect(result.connections[0].basic_info.occupation).toBe('エンジニア')
      expect(result.connections[0].basic_info.location).toBe('東京')
      expect(result.connections[0].basic_info.hobbies).toEqual(['映画', '音楽'])
      expect(result.connections[0].user_feelings.concerns).toEqual(['忙しそう'])
      expect(result.connections[0].user_feelings.attractivePoints).toEqual(['優しい', '面白い'])
      
      expect(result.dashboardData.totalConnections).toBe(1)
      expect(result.dashboardData.activeConnections).toBe(1) // messaging is active
    })

    it('should handle minimal import data', () => {
      const minimalData: ImportedUserData = {
        connections: [
          {
            nickname: 'ミニマルさん',
            platform: 'tinder',
            currentStage: 'just_matched' as ConnectionStage
          }
        ],
        userProfile: {},
        importMetadata: {
          source: 'ai',
          version: '1.0',
          timestamp: new Date().toISOString()
        }
      }

      const result = processor.processImportedData(minimalData, mockUserId)
      
      expect(result.connections).toHaveLength(1)
      expect(result.connections[0].nickname).toBe('ミニマルさん')
      expect(result.connections[0].communication.score).toBe(5) // default
      expect(result.connections[0].basic_info.attractiveness).toBe(5) // default
    })

    it('should convert interest history data correctly', () => {
      const dataWithInterest: ImportedUserData = {
        connections: [
          {
            nickname: 'テスト',
            platform: 'pairs',
            currentStage: 'messaging' as ConnectionStage,
            interestHistory: {
              peakLevel: 9,
              currentLevel: 7,
              trend: 'decreasing'
            }
          }
        ],
        userProfile: {},
        importMetadata: {
          source: 'manual',
          version: '1.0',
          timestamp: new Date().toISOString()
        }
      }

      const result = processor.processImportedData(dataWithInterest, mockUserId)
      
      expect(result.connections[0].user_feelings.interest_level).toBe(7)
      expect(result.connections[0].user_feelings.motivation_trend).toBe('decreasing')
    })

    it('should process emoji mapping correctly', () => {
      const dataWithEmoji: ImportedUserData = {
        connections: [
          {
            nickname: 'エモジさん',
            platform: 'pairs',
            currentStage: 'before_date' as ConnectionStage,
            emojiMapping: {
              communication: '💬',
              attraction: '💕',
              compatibility: '🎯',
              overall: '😊'
            }
          }
        ],
        userProfile: {},
        importMetadata: {
          source: 'manual',
          version: '1.0',
          timestamp: new Date().toISOString()
        }
      }

      const result = processor.processImportedData(dataWithEmoji, mockUserId)
      
      expect(result.connections[0].basic_info.emoji).toBe('😊')
    })

    it('should generate unique IDs for each connection', () => {
      const multipleConnections: ImportedUserData = {
        connections: [
          { nickname: 'テスト1', platform: 'pairs', currentStage: 'messaging' as ConnectionStage },
          { nickname: 'テスト2', platform: 'tinder', currentStage: 'just_matched' as ConnectionStage },
          { nickname: 'テスト3', platform: 'bumble', currentStage: 'line_exchanged' as ConnectionStage }
        ],
        userProfile: {},
        importMetadata: {
          source: 'manual',
          version: '1.0',
          timestamp: new Date().toISOString()
        }
      }

      const result = processor.processImportedData(multipleConnections, mockUserId)
      
      expect(result.connections).toHaveLength(3)
      const ids = result.connections.map(c => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(3) // all IDs should be unique
    })
  })

  describe('generateConnectionSummary', () => {
    const mockConnections: Connection[] = [
      {
        id: '1',
        user_id: 'user-123',
        nickname: 'アクティブさん',
        platform: 'pairs',
        current_stage: 'messaging',
        basic_info: {
          age: 28,
          location: '東京',
          occupation: 'エンジニア',
          education: '大学卒',
          height: '170cm',
          attractiveness: 8,
          emoji: '😊'
        },
        communication: {
          frequency: 'daily',
          response_time: 'within_hours',
          conversation_depth: 'deep',
          last_contact: new Date().toISOString(),
          score: 9
        },
        user_feelings: {
          interest_level: 9,
          emotional_connection: 8,
          future_potential: 9,
          comfort_level: 8,
          excitement_level: 9,
          anxiety_level: 2,
          motivation_trend: 'increasing',
          notes: []
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: 'user-123',
        nickname: '停滞さん',
        platform: 'tinder',
        current_stage: 'stagnant',
        basic_info: {
          age: 25,
          location: '大阪',
          occupation: 'デザイナー',
          education: '専門学校卒',
          height: '165cm',
          attractiveness: 6,
          emoji: '😐'
        },
        communication: {
          frequency: 'weekly',
          response_time: 'days',
          conversation_depth: 'surface',
          last_contact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          score: 4
        },
        user_feelings: {
          interest_level: 4,
          emotional_connection: 3,
          future_potential: 4,
          comfort_level: 5,
          excitement_level: 3,
          anxiety_level: 6,
          motivation_trend: 'stable',
          notes: []
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    it('should generate comprehensive summary', () => {
      const summary = processor.generateConnectionSummary(mockConnections)

      expect(summary.totalConnections).toBe(2)
      expect(summary.activeConnections).toBe(1) // only アクティブさん
      expect(summary.stagnantConnections).toBe(1) // 停滞さん
      expect(summary.platformBreakdown).toEqual({
        pairs: 1,
        tinder: 1
      })
      expect(summary.stageBreakdown).toEqual({
        messaging: 1,
        stagnant: 1
      })
      expect(summary.averageScores.communication).toBe(6.5) // (9 + 4) / 2
      expect(summary.averageScores.attraction).toBe(7) // (8 + 6) / 2
      expect(summary.averageScores.interest).toBe(6.5) // (9 + 4) / 2
      expect(summary.overallHealth).toBeTruthy()
    })

    it('should handle empty connections', () => {
      const summary = processor.generateConnectionSummary([])

      expect(summary.totalConnections).toBe(0)
      expect(summary.activeConnections).toBe(0)
      expect(summary.stagnantConnections).toBe(0)
      expect(summary.platformBreakdown).toEqual({})
      expect(summary.stageBreakdown).toEqual({})
      expect(summary.averageScores.communication).toBe(0)
      expect(summary.overallHealth).toBe('新しいコネクションを追加してください')
    })

    it('should correctly categorize connections by communication frequency', () => {
      const connections: Connection[] = [
        ...mockConnections,
        {
          ...mockConnections[0],
          id: '3',
          nickname: '毎日さん',
          communication: {
            ...mockConnections[0].communication,
            frequency: 'daily',
            last_contact: new Date().toISOString()
          }
        },
        {
          ...mockConnections[0],
          id: '4',
          nickname: '週一さん',
          communication: {
            ...mockConnections[0].communication,
            frequency: 'weekly',
            last_contact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      ]

      const summary = processor.generateConnectionSummary(connections)
      expect(summary.activeConnections).toBe(2) // daily contacts within 7 days
      expect(summary.stagnantConnections).toBe(2) // including original stagnant + weekly not contacted recently
    })

    it('should provide health recommendations based on data', () => {
      const lowScoreConnections: Connection[] = mockConnections.map(conn => ({
        ...conn,
        communication: { ...conn.communication, score: 3 },
        user_feelings: { ...conn.user_feelings, interest_level: 3 }
      }))

      const summary = processor.generateConnectionSummary(lowScoreConnections)
      expect(summary.overallHealth).toContain('コミュニケーションの改善が必要')
    })
  })

  describe('detectDuplicates', () => {
    const existingConnections: Connection[] = [
      {
        id: '1',
        user_id: 'user-123',
        nickname: '田中さん',
        platform: 'pairs',
        current_stage: 'messaging',
        basic_info: {
          age: 28,
          location: '東京',
          occupation: 'エンジニア',
          education: '大学卒',
          height: '170cm',
          attractiveness: 8,
          emoji: '😊'
        },
        communication: {
          frequency: 'daily',
          response_time: 'within_hours',
          conversation_depth: 'deep',
          last_contact: new Date().toISOString(),
          score: 9
        },
        user_feelings: {
          interest_level: 9,
          emotional_connection: 8,
          future_potential: 9,
          comfort_level: 8,
          excitement_level: 9,
          anxiety_level: 2,
          motivation_trend: 'increasing',
          notes: []
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const importConnections: ImportedConnection[] = [
      {
        nickname: '田中さん',
        platform: 'pairs',
        currentStage: 'line_exchanged' as ConnectionStage
      },
      {
        nickname: '佐藤さん',
        platform: 'tinder',
        currentStage: 'just_matched' as ConnectionStage
      }
    ]

    it('should detect exact nickname and platform matches', () => {
      const duplicates = processor.detectDuplicates(existingConnections, importConnections)
      
      expect(duplicates).toHaveLength(1)
      expect(duplicates[0].importedConnection.nickname).toBe('田中さん')
      expect(duplicates[0].existingConnection.nickname).toBe('田中さん')
      expect(duplicates[0].confidence).toBe('high')
    })

    it('should detect similar nicknames on same platform', () => {
      const similarImports: ImportedConnection[] = [
        {
          nickname: 'たなかさん', // hiragana version
          platform: 'pairs',
          currentStage: 'messaging' as ConnectionStage
        }
      ]

      const duplicates = processor.detectDuplicates(existingConnections, similarImports)
      
      expect(duplicates).toHaveLength(1)
      expect(duplicates[0].confidence).toBe('medium')
    })

    it('should not flag different people as duplicates', () => {
      const differentImports: ImportedConnection[] = [
        {
          nickname: '山田さん',
          platform: 'bumble',
          currentStage: 'just_matched' as ConnectionStage
        }
      ]

      const duplicates = processor.detectDuplicates(existingConnections, differentImports)
      
      expect(duplicates).toHaveLength(0)
    })

    it('should handle empty arrays', () => {
      expect(processor.detectDuplicates([], importConnections)).toHaveLength(0)
      expect(processor.detectDuplicates(existingConnections, [])).toHaveLength(0)
      expect(processor.detectDuplicates([], [])).toHaveLength(0)
    })
  })
})
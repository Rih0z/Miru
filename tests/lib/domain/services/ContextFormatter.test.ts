import { ContextFormatter } from '@/lib/domain/services/ContextFormatter'
import { Connection } from '@/types'

describe('ContextFormatter', () => {
  let formatter: ContextFormatter
  let mockConnection: Connection

  beforeEach(() => {
    formatter = new ContextFormatter()
    
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
        hobbies: ['映画', 'カフェ巡り', '読書']
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

  describe('formatConnectionContext', () => {
    it('should format complete connection context correctly', () => {
      const result = formatter.formatConnectionContext(mockConnection)
      
      // Check that all sections are present
      expect(result).toContain('【相手の情報】')
      expect(result).toContain('【基本情報】')
      expect(result).toContain('【コミュニケーション】')
      expect(result).toContain('【あなたの気持ち】')
      
      // Check specific values
      expect(result).toContain('テストさん')
      expect(result).toContain('TestApp')
      expect(result).toContain('メッセージ中')
      expect(result).toContain('25')
      expect(result).toContain('エンジニア')
      expect(result).toContain('映画、カフェ巡り、読書')
      expect(result).toContain('東京')
      expect(result).toContain('毎日')
      expect(result).toContain('2024-01-01')
      expect(result).toContain('フレンドリー')
      expect(result).toContain('真剣な交際')
      expect(result).toContain('優しい、話が面白い')
      expect(result).toContain('返信が遅い時がある')
    })

    it('should handle missing basic info with 不明', () => {
      const connectionWithMissingInfo = {
        ...mockConnection,
        basic_info: {
          age: undefined,
          occupation: undefined,
          location: undefined,
          hobbies: undefined
        }
      }

      const result = formatter.formatConnectionContext(connectionWithMissingInfo)
      
      expect(result).toContain('年齢: 不明')
      expect(result).toContain('職業: 不明')
      expect(result).toContain('趣味: 不明')
      expect(result).toContain('居住地: 不明')
    })

    it('should handle null basic info values with 不明', () => {
      const connectionWithNullInfo = {
        ...mockConnection,
        basic_info: {
          age: null,
          occupation: null,
          location: null,
          hobbies: null
        }
      }

      const result = formatter.formatConnectionContext(connectionWithNullInfo)
      
      expect(result).toContain('年齢: 不明')
      expect(result).toContain('職業: 不明')
      expect(result).toContain('趣味: 不明')
      expect(result).toContain('居住地: 不明')
    })

    it('should handle empty hobbies array with 不明', () => {
      const connectionWithEmptyHobbies = {
        ...mockConnection,
        basic_info: {
          ...mockConnection.basic_info,
          hobbies: []
        }
      }

      const result = formatter.formatConnectionContext(connectionWithEmptyHobbies)
      
      expect(result).toContain('趣味: 不明')
    })

    it('should handle missing communication info with 不明', () => {
      const connectionWithMissingComm = {
        ...mockConnection,
        communication: {
          frequency: undefined,
          lastContact: undefined,
          responseTime: undefined,
          communicationStyle: undefined
        }
      }

      const result = formatter.formatConnectionContext(connectionWithMissingComm)
      
      expect(result).toContain('頻度: 不明')
      expect(result).toContain('最後の連絡: 不明')
      expect(result).toContain('スタイル: 不明')
    })

    it('should handle null communication values with 不明', () => {
      const connectionWithNullComm = {
        ...mockConnection,
        communication: {
          frequency: null,
          lastContact: null,
          responseTime: null,
          communicationStyle: null
        }
      }

      const result = formatter.formatConnectionContext(connectionWithNullComm)
      
      expect(result).toContain('頻度: 不明')
      expect(result).toContain('最後の連絡: 不明')
      expect(result).toContain('スタイル: 不明')
    })

    it('should handle missing user feelings with 不明', () => {
      const connectionWithMissingFeelings = {
        ...mockConnection,
        user_feelings: {
          expectations: undefined,
          attractivePoints: undefined,
          concerns: undefined
        }
      }

      const result = formatter.formatConnectionContext(connectionWithMissingFeelings)
      
      expect(result).toContain('期待: 不明')
      expect(result).toContain('魅力的な点: 不明')
      expect(result).toContain('不安: 不明')
    })

    it('should handle null user feelings values with 不明', () => {
      const connectionWithNullFeelings = {
        ...mockConnection,
        user_feelings: {
          expectations: null,
          attractivePoints: null,
          concerns: null
        }
      }

      const result = formatter.formatConnectionContext(connectionWithNullFeelings)
      
      expect(result).toContain('期待: 不明')
      expect(result).toContain('魅力的な点: 不明')
      expect(result).toContain('不安: 不明')
    })

    it('should handle empty attractive points array with 不明', () => {
      const connectionWithEmptyAttractive = {
        ...mockConnection,
        user_feelings: {
          ...mockConnection.user_feelings,
          attractivePoints: []
        }
      }

      const result = formatter.formatConnectionContext(connectionWithEmptyAttractive)
      
      expect(result).toContain('魅力的な点: 不明')
    })

    it('should join multiple hobbies with 、', () => {
      const connectionWithManyHobbies = {
        ...mockConnection,
        basic_info: {
          ...mockConnection.basic_info,
          hobbies: ['映画', 'カフェ巡り', '読書', 'スポーツ', '料理']
        }
      }

      const result = formatter.formatConnectionContext(connectionWithManyHobbies)
      
      expect(result).toContain('映画、カフェ巡り、読書、スポーツ、料理')
    })

    it('should join multiple attractive points with 、', () => {
      const connectionWithManyAttractive = {
        ...mockConnection,
        user_feelings: {
          ...mockConnection.user_feelings,
          attractivePoints: ['優しい', '話が面白い', '誠実', '頼りになる', 'センスが良い']
        }
      }

      const result = formatter.formatConnectionContext(connectionWithManyAttractive)
      
      expect(result).toContain('優しい、話が面白い、誠実、頼りになる、センスが良い')
    })

    it('should handle single item arrays correctly', () => {
      const connectionWithSingleItems = {
        ...mockConnection,
        basic_info: {
          ...mockConnection.basic_info,
          hobbies: ['映画']
        },
        user_feelings: {
          ...mockConnection.user_feelings,
          attractivePoints: ['優しい']
        }
      }

      const result = formatter.formatConnectionContext(connectionWithSingleItems)
      
      expect(result).toContain('趣味: 映画')
      expect(result).toContain('魅力的な点: 優しい')
    })

    it('should maintain consistent formatting structure', () => {
      const result = formatter.formatConnectionContext(mockConnection)
      
      // Check that the structure follows the expected pattern
      const lines = result.split('\n').filter(line => line.trim() !== '')
      
      // Should have section headers
      expect(lines.some(line => line.includes('【相手の情報】'))).toBe(true)
      expect(lines.some(line => line.includes('【基本情報】'))).toBe(true)
      expect(lines.some(line => line.includes('【コミュニケーション】'))).toBe(true)
      expect(lines.some(line => line.includes('【あなたの気持ち】'))).toBe(true)
      
      // Should have proper field labels with colons
      expect(result).toContain('- ニックネーム:')
      expect(result).toContain('- 出会った場所:')
      expect(result).toContain('- 現在の関係:')
      expect(result).toContain('- 年齢:')
      expect(result).toContain('- 職業:')
      expect(result).toContain('- 趣味:')
      expect(result).toContain('- 居住地:')
      expect(result).toContain('- 頻度:')
      expect(result).toContain('- 最後の連絡:')
      expect(result).toContain('- スタイル:')
      expect(result).toContain('- 期待:')
      expect(result).toContain('- 不安:')
      expect(result).toContain('- 魅力的な点:')
    })

    it('should not modify the input connection object', () => {
      const originalConnection = JSON.parse(JSON.stringify(mockConnection))
      
      formatter.formatConnectionContext(mockConnection)
      
      expect(mockConnection).toEqual(originalConnection)
    })

    it('should return consistent results for multiple calls', () => {
      const result1 = formatter.formatConnectionContext(mockConnection)
      const result2 = formatter.formatConnectionContext(mockConnection)
      const result3 = formatter.formatConnectionContext(mockConnection)
      
      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
    })

    it('should handle special characters in values', () => {
      const connectionWithSpecialChars = {
        ...mockConnection,
        nickname: 'テスト＆さん！',
        platform: 'Test★App',
        basic_info: {
          ...mockConnection.basic_info,
          occupation: '♪エンジニア♪',
          hobbies: ['映画(洋画)', 'カフェ巡り☕']
        }
      }

      const result = formatter.formatConnectionContext(connectionWithSpecialChars)
      
      expect(result).toContain('テスト＆さん！')
      expect(result).toContain('Test★App')
      expect(result).toContain('♪エンジニア♪')
      expect(result).toContain('映画(洋画)、カフェ巡り☕')
    })

    it('should handle edge case with all missing optional fields', () => {
      const minimalConnection = {
        ...mockConnection,
        basic_info: {},
        communication: {},
        user_feelings: {}
      } as Connection

      const result = formatter.formatConnectionContext(minimalConnection)
      
      // Should still contain all sections and show 不明 for missing values
      expect(result).toContain('【相手の情報】')
      expect(result).toContain('【基本情報】')
      expect(result).toContain('【コミュニケーション】')
      expect(result).toContain('【あなたの気持ち】')
      
      // All optional fields should show 不明
      expect(result).toContain('年齢: 不明')
      expect(result).toContain('職業: 不明')
      expect(result).toContain('趣味: 不明')
      expect(result).toContain('居住地: 不明')
      expect(result).toContain('頻度: 不明')
      expect(result).toContain('最後の連絡: 不明')
      expect(result).toContain('スタイル: 不明')
      expect(result).toContain('期待: 不明')
      expect(result).toContain('不安: 不明')
      expect(result).toContain('魅力的な点: 不明')
    })
  })
})
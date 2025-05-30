import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { ConnectionService } from '@/lib/connectionService'
import { Connection } from '@/types'

describe('ConnectionService', () => {
  let connectionService: ConnectionService
  
  beforeEach(() => {
    connectionService = new ConnectionService()
    jest.clearAllMocks()
  })

  describe('createConnection', () => {
    it('should create a connection with valid data', async () => {
      const connectionData = {
        nickname: 'Aさん',
        platform: 'Pairs',
        current_stage: 'マッチング直後' as const,
        basic_info: { age: 25, occupation: 'エンジニア' },
        communication: { frequency: '毎日' },
        user_feelings: { expectations: '真剣な交際' }
      }

      const result = await connectionService.createConnection('user-123', connectionData)
      
      expect(result).toBeDefined()
      expect(result.nickname).toBe('Aさん')
      expect(result.platform).toBe('Pairs')
      expect(result.current_stage).toBe('マッチング直後')
    })

    it('should throw error when nickname is empty', async () => {
      const connectionData = {
        nickname: '',
        platform: 'Pairs',
        current_stage: 'マッチング直後' as const,
        basic_info: {},
        communication: {},
        user_feelings: {}
      }

      await expect(
        connectionService.createConnection('user-123', connectionData)
      ).rejects.toThrow('ニックネームは必須です')
    })

    it('should throw error when platform is empty', async () => {
      const connectionData = {
        nickname: 'Aさん',
        platform: '',
        current_stage: 'マッチング直後' as const,
        basic_info: {},
        communication: {},
        user_feelings: {}
      }

      await expect(
        connectionService.createConnection('user-123', connectionData)
      ).rejects.toThrow('出会った場所は必須です')
    })
  })

  describe('updateConnectionStage', () => {
    it('should update connection stage', async () => {
      const mockConnection: Connection = {
        id: 'conn-123',
        user_id: 'user-123',
        nickname: 'Aさん',
        platform: 'Pairs',
        current_stage: 'マッチング直後',
        basic_info: {},
        communication: {},
        user_feelings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const result = await connectionService.updateConnectionStage(
        'conn-123',
        'メッセージ中'
      )

      expect(result).toBeDefined()
      expect(result.current_stage).toBe('メッセージ中')
    })

    it('should throw error for invalid stage', async () => {
      await expect(
        connectionService.updateConnectionStage('conn-123', 'invalid-stage' as any)
      ).rejects.toThrow('無効なステージです')
    })
  })

  describe('calculateRelationshipScore', () => {
    it('should calculate score based on stage and progress', () => {
      const connection: Connection = {
        id: 'conn-123',
        user_id: 'user-123',
        nickname: 'Aさん',
        platform: 'Pairs',
        current_stage: 'デート後',
        basic_info: { age: 25 },
        communication: { frequency: '毎日' },
        user_feelings: { expectations: '真剣な交際' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const score = connectionService.calculateRelationshipScore(connection)
      
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should return higher score for more advanced stages', () => {
      const connectionEarly: Connection = {
        id: 'conn-1',
        user_id: 'user-123',
        nickname: 'Aさん',
        platform: 'Pairs',
        current_stage: 'マッチング直後',
        basic_info: {},
        communication: {},
        user_feelings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const connectionAdvanced: Connection = {
        ...connectionEarly,
        id: 'conn-2',
        current_stage: '交際中'
      }

      const scoreEarly = connectionService.calculateRelationshipScore(connectionEarly)
      const scoreAdvanced = connectionService.calculateRelationshipScore(connectionAdvanced)
      
      expect(scoreAdvanced).toBeGreaterThan(scoreEarly)
    })
  })

  describe('getRecommendedAction', () => {
    it('should return appropriate action for マッチング直後', () => {
      const connection: Connection = {
        id: 'conn-123',
        user_id: 'user-123',
        nickname: 'Aさん',
        platform: 'Pairs',
        current_stage: 'マッチング直後',
        basic_info: {},
        communication: {},
        user_feelings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const action = connectionService.getRecommendedAction(connection)
      
      expect(action.title).toContain('最初のメッセージ')
      expect(action.urgency).toBe('high')
    })

    it('should return appropriate action for デート前', () => {
      const connection: Connection = {
        id: 'conn-123',
        user_id: 'user-123',
        nickname: 'Aさん',
        platform: 'Pairs',
        current_stage: 'デート前',
        basic_info: {},
        communication: {},
        user_feelings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const action = connectionService.getRecommendedAction(connection)
      
      expect(action.title).toContain('デート')
      expect(action.urgency).toBe('high')
    })
  })
})
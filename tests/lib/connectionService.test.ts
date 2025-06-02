import { ConnectionService } from '@/lib/connectionService'
import { Connection, DashboardData } from '@/types'
import { db } from '@/lib/supabase'

// Supabaseのモック
jest.mock('@/lib/supabase', () => ({
  db: {
    getUser: jest.fn(),
    createUser: jest.fn(),
    getConnections: jest.fn(),
    createConnection: jest.fn(),
    updateConnection: jest.fn(),
    deleteConnection: jest.fn(),
    getProgress: jest.fn(),
    addProgressEntry: jest.fn(),
    getActionHistory: jest.fn(),
    addActionHistory: jest.fn(),
    savePromptHistory: jest.fn()
  }
}))

describe('ConnectionService', () => {
  let service: ConnectionService
  let mockConnection: Connection

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ConnectionService()
    
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
        responseTime: '数時間以内'
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

  describe('createConnection', () => {
    it('should create a new connection with valid data', async () => {
      const newConnectionData = {
        nickname: '新しい人',
        platform: 'with',
        current_stage: 'マッチング直後' as const,
        basic_info: {},
        communication: {},
        user_feelings: {}
      }

      const expectedConnection = {
        id: 'new-id',
        user_id: 'user-123',
        ...newConnectionData,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      ;(db.createConnection as jest.Mock).mockResolvedValueOnce(expectedConnection)

      const result = await service.createConnection('user-123', newConnectionData)

      expect(db.createConnection).toHaveBeenCalledWith({
        user_id: 'user-123',
        ...newConnectionData
      })
      expect(result).toEqual(expectedConnection)
    })

    it('should throw error when nickname is empty', async () => {
      const invalidData = {
        nickname: '   ',
        platform: 'with',
        current_stage: 'マッチング直後' as const,
        basic_info: {},
        communication: {},
        user_feelings: {}
      }

      await expect(service.createConnection('user-123', invalidData))
        .rejects.toThrow('ニックネームは必須です')
    })

    it('should throw error when platform is empty', async () => {
      const invalidData = {
        nickname: 'テスト',
        platform: '',
        current_stage: 'マッチング直後' as const,
        basic_info: {},
        communication: {},
        user_feelings: {}
      }

      await expect(service.createConnection('user-123', invalidData))
        .rejects.toThrow('出会った場所は必須です')
    })

    it('should throw error when nickname exceeds 50 characters', async () => {
      const invalidData = {
        nickname: 'あ'.repeat(51),
        platform: 'with',
        current_stage: 'マッチング直後' as const,
        basic_info: {},
        communication: {},
        user_feelings: {}
      }

      await expect(service.createConnection('user-123', invalidData))
        .rejects.toThrow('ニックネームは50文字以内で入力してください')
    })

    it('should throw error when platform exceeds 100 characters', async () => {
      const invalidData = {
        nickname: 'テスト',
        platform: 'あ'.repeat(101),
        current_stage: 'マッチング直後' as const,
        basic_info: {},
        communication: {},
        user_feelings: {}
      }

      await expect(service.createConnection('user-123', invalidData))
        .rejects.toThrow('出会った場所は100文字以内で入力してください')
    })

    it('should throw error when dangerous pattern is detected', async () => {
      const invalidData = {
        nickname: '<script>alert("XSS")</script>',
        platform: 'with',
        current_stage: 'マッチング直後' as const,
        basic_info: {},
        communication: {},
        user_feelings: {}
      }

      await expect(service.createConnection('user-123', invalidData))
        .rejects.toThrow('不正な文字列が含まれています')
    })
  })

  describe('updateConnection', () => {
    it('should update connection successfully', async () => {
      const updates = {
        nickname: '更新された名前',
        current_stage: 'デート前' as const,
        platform: 'TestApp'
      }

      const updatedConnection = {
        ...mockConnection,
        ...updates,
        updated_at: '2024-01-02T00:00:00Z'
      }

      ;(db.updateConnection as jest.Mock).mockResolvedValueOnce(updatedConnection)

      const result = await service.updateConnection('test-1', updates)

      expect(db.updateConnection).toHaveBeenCalledWith('test-1', updates)
      expect(result).toEqual(updatedConnection)
    })

    it('should validate updated fields', async () => {
      const updates = {
        nickname: '<script>alert("XSS")</script>',
        platform: 'TestApp'
      }

      await expect(service.updateConnection('test-1', updates))
        .rejects.toThrow('不正な文字列が含まれています')
    })
  })

  describe('deleteConnection', () => {
    it('should delete connection successfully', async () => {
      ;(db.deleteConnection as jest.Mock).mockResolvedValueOnce(undefined)

      await service.deleteConnection('test-1')

      expect(db.deleteConnection).toHaveBeenCalledWith('test-1')
    })
  })

  describe('getUserConnections', () => {
    it('should return user connections', async () => {
      const mockConnections = [mockConnection]
      ;(db.getConnections as jest.Mock).mockResolvedValueOnce(mockConnections)

      const result = await service.getUserConnections('user-123')

      expect(db.getConnections).toHaveBeenCalledWith('user-123')
      expect(result).toEqual(mockConnections)
    })

    it('should return empty array when no connections', async () => {
      ;(db.getConnections as jest.Mock).mockResolvedValueOnce([])

      const result = await service.getUserConnections('user-123')

      expect(result).toEqual([])
    })
  })

  describe('calculateRelationshipScore', () => {
    it('should calculate score correctly', () => {
      const score = service.calculateRelationshipScore(mockConnection)

      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should return higher score for better stage', () => {
      const earlyStage = { ...mockConnection, current_stage: 'マッチング直後' }
      const lateStage = { ...mockConnection, current_stage: '交際中' }

      const earlyScore = service.calculateRelationshipScore(earlyStage)
      const lateScore = service.calculateRelationshipScore(lateStage)

      expect(lateScore).toBeGreaterThan(earlyScore)
    })
  })

  describe('getRecommendedAction', () => {
    it('should return appropriate action for matching stage', () => {
      const connection = { ...mockConnection, current_stage: 'マッチング直後' }
      const action = service.getRecommendedAction(connection)

      expect(action.type).toBe('send_message')
      expect(action.urgency).toBe('high')
      expect(action.connection_id).toBe('test-1')
    })

    it('should return appropriate action for messaging stage', () => {
      const connection = { ...mockConnection, current_stage: 'メッセージ中' }
      const action = service.getRecommendedAction(connection)

      expect(action.type).toBe('deepen_conversation')
      expect(action.urgency).toBe('medium')
    })

    it('should return appropriate action for LINE exchanged stage', () => {
      const connection = { ...mockConnection, current_stage: 'LINE交換済み' }
      const action = service.getRecommendedAction(connection)

      expect(action.type).toBe('plan_date')
      expect(action.urgency).toBe('high')
    })

    it('should return appropriate action for before date stage', () => {
      const connection = { ...mockConnection, current_stage: 'デート前' }
      const action = service.getRecommendedAction(connection)

      expect(action.type).toBe('prepare_date')
      expect(action.urgency).toBe('medium')
    })

    it('should return follow up action for after date stage', () => {
      const connection = { ...mockConnection, current_stage: 'デート後' }
      const action = service.getRecommendedAction(connection)

      expect(action.type).toBe('follow_up')
      expect(action.urgency).toBe('high')
    })

    it('should return maintain action for dating stage', () => {
      const connection = { ...mockConnection, current_stage: '交際中' }
      const action = service.getRecommendedAction(connection)

      expect(action.type).toBe('maintain_relationship')
      expect(action.urgency).toBe('low')
    })

    it('should return revive action for stagnant stage', () => {
      const connection = { ...mockConnection, current_stage: '停滞中' }
      const action = service.getRecommendedAction(connection)

      expect(action.type).toBe('revive_conversation')
      expect(action.urgency).toBe('critical')
    })

    it('should return review action for ended stage', () => {
      const connection = { ...mockConnection, current_stage: '終了' }
      const action = service.getRecommendedAction(connection)

      expect(action.type).toBe('general_advice')
      expect(action.urgency).toBe('medium')
    })

    it('should return default action for unknown stage', () => {
      const connection = { ...mockConnection, current_stage: '不明' as any }
      const action = service.getRecommendedAction(connection)

      expect(action.type).toBe('general_advice')
      expect(action.urgency).toBe('medium')
    })
  })

  describe('getDashboardData', () => {
    it('should return complete dashboard data', async () => {
      const mockConnections = [
        mockConnection,
        { ...mockConnection, id: 'test-2', nickname: '別の人', current_stage: '終了' }
      ]

      ;(db.getConnections as jest.Mock).mockResolvedValueOnce(mockConnections)

      const result = await service.getDashboardData('user-123')

      expect(result.totalConnections).toBe(2)
      expect(result.activeConnections).toBe(1) // 終了を除く
      expect(result.connections).toEqual(mockConnections)
      expect(result.recommendedActions).toBeDefined()
      expect(result.bestConnection).toBeDefined()
      expect(result.averageScore).toBeGreaterThan(0)
    })

    it('should handle empty connections', async () => {
      ;(db.getConnections as jest.Mock).mockResolvedValueOnce([])

      const result = await service.getDashboardData('user-123')

      expect(result.totalConnections).toBe(0)
      expect(result.activeConnections).toBe(0)
      expect(result.connections).toEqual([])
      expect(result.recommendedActions).toEqual([])
      expect(result.bestConnection).toBeNull()
      expect(result.averageScore).toBe(0)
    })

    it('should sort recommended actions by urgency', async () => {
      const mockConnections = [
        { ...mockConnection, id: 'test-1', current_stage: 'マッチング直後' }, // high
        { ...mockConnection, id: 'test-2', current_stage: 'メッセージ中' },  // medium
        { ...mockConnection, id: 'test-3', current_stage: '交際中' },      // low
        { ...mockConnection, id: 'test-4', current_stage: 'デート前' },    // high
      ]

      ;(db.getConnections as jest.Mock).mockResolvedValueOnce(mockConnections)

      const result = await service.getDashboardData('user-123')

      expect(result.recommendedActions[0].urgency).toBe('high')
      expect(result.recommendedActions[1].urgency).toBe('medium')
      expect(result.recommendedActions[2].urgency).toBe('medium')
    })

    it('should find best connection correctly', async () => {
      const mockConnections = [
        { ...mockConnection, id: 'test-1', current_stage: 'マッチング直後' },
        { ...mockConnection, id: 'test-2', current_stage: '交際中' },
        { ...mockConnection, id: 'test-3', current_stage: 'メッセージ中' }
      ]

      ;(db.getConnections as jest.Mock).mockResolvedValueOnce(mockConnections)

      const result = await service.getDashboardData('user-123')

      expect(result.bestConnection?.id).toBe('test-2') // 交際中が最高スコア
    })

    it('should calculate average score correctly', async () => {
      const mockConnections = [
        mockConnection, // スコアが計算される
        { ...mockConnection, id: 'test-2' }
      ]

      ;(db.getConnections as jest.Mock).mockResolvedValueOnce(mockConnections)

      const result = await service.getDashboardData('user-123')

      const expectedScore1 = service.calculateRelationshipScore(mockConnections[0])
      const expectedScore2 = service.calculateRelationshipScore(mockConnections[1])
      const expectedAverage = Math.round((expectedScore1 + expectedScore2) / 2)

      expect(result.averageScore).toBe(expectedAverage)
    })
  })
})
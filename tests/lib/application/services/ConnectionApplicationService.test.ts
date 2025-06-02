import { ConnectionApplicationService } from '@/lib/application/services/ConnectionApplicationService'
import { IConnectionRepository } from '@/lib/domain/interfaces/IConnectionRepository'
import { IScoreCalculator } from '@/lib/domain/interfaces/IScoreCalculator'
import { IActionRecommender } from '@/lib/domain/interfaces/IActionRecommender'
import { IConnectionValidator } from '@/lib/domain/interfaces/IConnectionValidator'
import { Connection } from '@/types'

describe('ConnectionApplicationService', () => {
  let service: ConnectionApplicationService
  let mockRepository: jest.Mocked<IConnectionRepository>
  let mockScoreCalculator: jest.Mocked<IScoreCalculator>
  let mockActionRecommender: jest.Mocked<IActionRecommender>
  let mockValidator: jest.Mocked<IConnectionValidator>
  let mockConnection: Connection

  beforeEach(() => {
    mockRepository = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    mockScoreCalculator = {
      calculateRelationshipScore: jest.fn(),
      calculateAverageScore: jest.fn(),
      calculateStageScore: jest.fn(),
      calculateCommunicationScore: jest.fn(),
      calculateResponseScore: jest.fn(),
      calculateCompatibilityScore: jest.fn(),
      calculateEmotionalScore: jest.fn()
    }

    mockActionRecommender = {
      getRecommendedAction: jest.fn(),
      getRecommendedActions: jest.fn()
    }

    mockValidator = {
      validateConnectionData: jest.fn(),
      sanitizeInput: jest.fn(),
      isValidStage: jest.fn(),
      containsXSS: jest.fn()
    }

    service = new ConnectionApplicationService(
      mockRepository,
      mockScoreCalculator,
      mockActionRecommender,
      mockValidator
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

  describe('getUserConnections', () => {
    it('should fetch connections for a user', async () => {
      const mockConnections = [mockConnection]
      mockRepository.findByUserId.mockResolvedValue(mockConnections)

      const result = await service.getUserConnections('user-123')

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123')
      expect(result).toEqual(mockConnections)
    })

    it('should handle repository errors', async () => {
      mockRepository.findByUserId.mockRejectedValue(new Error('Database error'))

      await expect(service.getUserConnections('user-123'))
        .rejects.toThrow('Database error')
    })
  })


  describe('createConnection', () => {
    it('should create new connection after validation', async () => {
      const connectionData = {
        nickname: 'テストさん',
        platform: 'TestApp',
        current_stage: 'メッセージ中' as const,
        basic_info: {},
        communication: {},
        user_feelings: {}
      }
      
      const sanitizedData = { ...connectionData, nickname: 'テストさん' }
      mockValidator.validateConnectionData.mockReturnValue({ isValid: true, errors: [] })
      mockValidator.sanitizeInput.mockReturnValue(sanitizedData)
      mockRepository.create.mockResolvedValue(mockConnection)

      const result = await service.createConnection('user-123', connectionData)

      expect(mockValidator.validateConnectionData).toHaveBeenCalledWith(connectionData)
      expect(mockValidator.sanitizeInput).toHaveBeenCalledWith(connectionData)
      expect(mockRepository.create).toHaveBeenCalledWith({ ...sanitizedData, user_id: 'user-123' })
      expect(result).toEqual(mockConnection)
    })

    it('should handle validation errors', async () => {
      const connectionData = {
        nickname: '',
        platform: 'TestApp',
        current_stage: 'メッセージ中' as const,
        basic_info: {},
        communication: {},
        user_feelings: {}
      }

      mockValidator.validateConnectionData.mockReturnValue({ 
        isValid: false, 
        errors: ['ニックネームは必須です'] 
      })

      await expect(service.createConnection('user-123', connectionData))
        .rejects.toThrow('ニックネームは必須です')
    })
  })

  describe('updateConnection', () => {
    it('should update connection after validation', async () => {
      const updates = { nickname: '新しい名前' }
      const sanitizedUpdates = { nickname: '新しい名前' }
      
      mockValidator.validateConnectionData.mockReturnValue({ isValid: true, errors: [] })
      mockValidator.sanitizeInput.mockReturnValue(sanitizedUpdates)
      mockRepository.update.mockResolvedValue({ ...mockConnection, ...updates })

      const result = await service.updateConnection('test-1', updates)

      expect(mockValidator.validateConnectionData).toHaveBeenCalledWith(updates)
      expect(mockValidator.sanitizeInput).toHaveBeenCalledWith(updates)
      expect(mockRepository.update).toHaveBeenCalledWith('test-1', sanitizedUpdates)
      expect(result.nickname).toBe('新しい名前')
    })

    it('should handle validation errors during update', async () => {
      const updates = { nickname: '<script>alert("xss")</script>' }
      
      mockValidator.validateConnectionData.mockReturnValue({ 
        isValid: false, 
        errors: ['不正な文字列が含まれています'] 
      })

      await expect(service.updateConnection('test-1', updates))
        .rejects.toThrow('不正な文字列が含まれています')
    })
  })

  describe('deleteConnection', () => {
    it('should delete connection', async () => {
      mockRepository.delete.mockResolvedValue()

      await service.deleteConnection('test-1')

      expect(mockRepository.delete).toHaveBeenCalledWith('test-1')
    })

    it('should handle deletion errors', async () => {
      mockRepository.delete.mockRejectedValue(new Error('Deletion failed'))

      await expect(service.deleteConnection('test-1'))
        .rejects.toThrow('Deletion failed')
    })
  })

  describe('calculateRelationshipScore', () => {
    it('should calculate relationship score', async () => {
      mockScoreCalculator.calculateRelationshipScore.mockReturnValue(75)

      const result = await service.calculateRelationshipScore(mockConnection)

      expect(mockScoreCalculator.calculateRelationshipScore).toHaveBeenCalledWith(mockConnection)
      expect(result).toBe(75)
    })
  })

  describe('getRecommendedAction', () => {
    it('should get recommended action', async () => {
      const mockAction = {
        type: 'message',
        description: 'メッセージを送信する',
        priority: 'high' as const,
        reason: 'しばらく連絡していない'
      }
      
      mockActionRecommender.getRecommendedAction.mockReturnValue(mockAction)

      const result = await service.getRecommendedAction(mockConnection)

      expect(mockActionRecommender.getRecommendedAction).toHaveBeenCalledWith(mockConnection)
      expect(result).toEqual(mockAction)
    })
  })

  describe('getDashboardData', () => {
    it('should return dashboard data', async () => {
      const connections = [
        { ...mockConnection, current_stage: 'メッセージ中' },
        { ...mockConnection, id: 'test-2', current_stage: '交際中' },
        { ...mockConnection, id: 'test-3', current_stage: '終了' }
      ]
      const mockActions = [{ type: 'message', description: 'Send a message' }]
      
      mockRepository.findByUserId.mockResolvedValue(connections)
      mockScoreCalculator.calculateAverageScore.mockReturnValue(65)
      mockScoreCalculator.calculateRelationshipScore.mockReturnValue(75)
      mockActionRecommender.getRecommendedActions.mockReturnValue(mockActions)

      const result = await service.getDashboardData('user-123')

      expect(result.totalConnections).toBe(3)
      expect(result.activeConnections).toBe(2)
      expect(result.averageScore).toBe(65)
      expect(result.recommendedActions).toEqual(mockActions)
      expect(result.bestConnection).toBeDefined()
    })
  })

})
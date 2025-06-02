import { ActionRecommender } from '@/lib/domain/services/ActionRecommender'
import { Connection } from '@/types'

describe('ActionRecommender', () => {
  let recommender: ActionRecommender
  let mockConnection: Connection

  beforeEach(() => {
    recommender = new ActionRecommender()
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

  describe('getRecommendedAction', () => {
    it('should return action for messaging stage', () => {
      const action = recommender.getRecommendedAction(mockConnection)

      expect(action.connection_id).toBe('test-1')
      expect(action.title).toContain('テストさん')
      expect(action.title).toContain('会話を深める')
      expect(action.urgency).toBe('medium')
      expect(action.prompt_type).toBe('deepen_conversation')
    })

    it('should return action for matching stage', () => {
      mockConnection.current_stage = 'マッチング直後'
      const action = recommender.getRecommendedAction(mockConnection)

      expect(action.title).toContain('最初のメッセージ')
      expect(action.urgency).toBe('high')
      expect(action.prompt_type).toBe('first_message')
    })

    it('should return action for LINE exchange stage', () => {
      mockConnection.current_stage = 'LINE交換済み'
      const action = recommender.getRecommendedAction(mockConnection)

      expect(action.title).toContain('LINE')
      expect(action.urgency).toBe('medium')
      expect(action.prompt_type).toBe('build_intimacy')
    })

    it('should return action for date preparation stage', () => {
      mockConnection.current_stage = 'デート前'
      const action = recommender.getRecommendedAction(mockConnection)

      expect(action.title).toContain('デート')
      expect(action.urgency).toBe('high')
      expect(action.prompt_type).toBe('date_preparation')
    })

    it('should return action for after date stage', () => {
      mockConnection.current_stage = 'デート後'
      const action = recommender.getRecommendedAction(mockConnection)

      expect(action.title).toContain('フォロー')
      expect(action.urgency).toBe('high')
      expect(action.prompt_type).toBe('date_followup')
    })

    it('should return action for relationship stage', () => {
      mockConnection.current_stage = '交際中'
      const action = recommender.getRecommendedAction(mockConnection)

      expect(action.title).toContain('関係')
      expect(action.urgency).toBe('low')
      expect(action.prompt_type).toBe('relationship_building')
    })

    it('should return action for stagnant stage', () => {
      mockConnection.current_stage = '停滞中'
      const action = recommender.getRecommendedAction(mockConnection)

      expect(action.title).toContain('関係を再活性化')
      expect(action.urgency).toBe('medium')
      expect(action.prompt_type).toBe('relationship_revival')
    })

    it('should return default action for unknown stage', () => {
      mockConnection.current_stage = 'unknown_stage' as any
      const action = recommender.getRecommendedAction(mockConnection)

      expect(action.title).toContain('関係を分析')
      expect(action.urgency).toBe('medium')
      expect(action.prompt_type).toBe('analyze_situation')
    })

    it('should include connection ID and estimated time', () => {
      const action = recommender.getRecommendedAction(mockConnection)

      expect(action.id).toContain('action-test-1')
      expect(action.connection_id).toBe('test-1')
      expect(action.estimated_time).toBeDefined()
      expect(action.description).toBeDefined()
    })
  })

  describe('getRecommendedActions', () => {
    it('should return actions for multiple connections', () => {
      const connections = [
        mockConnection,
        { ...mockConnection, id: 'test-2', current_stage: 'マッチング直後' as const }
      ]

      const actions = recommender.getRecommendedActions(connections)

      expect(actions).toHaveLength(2)
      expect(actions[0].urgency).toBe('high') // マッチング直後 should be first (higher urgency)
      expect(actions[1].urgency).toBe('medium')
    })

    it('should filter out ended connections', () => {
      const connections = [
        mockConnection,
        { ...mockConnection, id: 'ended', current_stage: '終了' as const }
      ]

      const actions = recommender.getRecommendedActions(connections)

      expect(actions).toHaveLength(1)
      expect(actions[0].connection_id).toBe('test-1')
    })

    it('should sort by urgency priority', () => {
      const connections = [
        { ...mockConnection, id: '1', current_stage: 'メッセージ中' as const },      // medium
        { ...mockConnection, id: '2', current_stage: '停滞中' as const },             // critical
        { ...mockConnection, id: '3', current_stage: 'マッチング直後' as const },    // high
        { ...mockConnection, id: '4', current_stage: '交際中' as const }             // low
      ]

      const actions = recommender.getRecommendedActions(connections)

      expect(actions[0].urgency).toBe('high')      // マッチング直後
      expect(actions[1].urgency).toBe('medium')    // 停滞中
      expect(actions[2].urgency).toBe('medium')    // メッセージ中
      expect(actions[3].urgency).toBe('low')       // 交際中
    })

    it('should limit to maximum 5 actions', () => {
      const connections = Array(10).fill(null).map((_, i) => ({
        ...mockConnection,
        id: `test-${i}`,
        current_stage: 'メッセージ中' as const
      }))

      const actions = recommender.getRecommendedActions(connections)

      expect(actions).toHaveLength(5)
    })

    it('should handle empty connections array', () => {
      const actions = recommender.getRecommendedActions([])

      expect(actions).toHaveLength(0)
    })
  })

  describe('private methods behavior through public interface', () => {
    it('should have correct urgency priority ordering', () => {
      const criticalConnection = { ...mockConnection, id: '1', current_stage: '停滞中' as const }
      const highConnection = { ...mockConnection, id: '2', current_stage: 'マッチング直後' as const }
      const mediumConnection = { ...mockConnection, id: '3', current_stage: 'メッセージ中' as const }
      const lowConnection = { ...mockConnection, id: '4', current_stage: '交際中' as const }

      const connections = [mediumConnection, lowConnection, criticalConnection, highConnection]
      const actions = recommender.getRecommendedActions(connections)

      const urgencies = actions.map(a => a.urgency)
      expect(urgencies).toEqual(['high', 'medium', 'medium', 'low'])
    })

    it('should replace nickname placeholder in titles', () => {
      mockConnection.nickname = '山田さん'
      const action = recommender.getRecommendedAction(mockConnection)

      expect(action.title).toContain('山田さん')
      expect(action.title).not.toContain('{nickname}')
    })

    it('should generate unique action IDs', async () => {
      const action1 = recommender.getRecommendedAction(mockConnection)
      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1))
      const action2 = recommender.getRecommendedAction(mockConnection)

      expect(action1.id).not.toBe(action2.id)
      expect(action1.id).toContain('action-test-1')
      expect(action2.id).toContain('action-test-1')
    })
  })
})
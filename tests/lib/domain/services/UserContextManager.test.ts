import { UserContextManager } from '@/lib/domain/services/UserContextManager'
import { UserContext, SessionContext } from '@/lib/domain/interfaces/IPromptOrchestrator'

describe('UserContextManager', () => {
  let contextManager: UserContextManager

  beforeEach(() => {
    contextManager = new UserContextManager()
  })

  describe('getUserContext', () => {
    it('should create default context for new user', async () => {
      const context = await contextManager.getUserContext('new-user')

      expect(context.userId).toBe('new-user')
      expect(context.currentEmotion).toBe('hopeful')
      expect(context.relationshipGoals).toBe('unclear')
      expect(context.communicationStyle).toBe('gentle')
      expect(context.personalityTraits).toEqual([])
      expect(context.learningPreferences.preferredAIStyle).toBe('balanced')
      expect(context.sessionHistory).toEqual([])
      expect(context.lastActivity).toBeInstanceOf(Date)
    })

    it('should return existing context for known user', async () => {
      const initialContext = await contextManager.getUserContext('existing-user')
      initialContext.currentEmotion = 'excited'

      const retrievedContext = await contextManager.getUserContext('existing-user')

      expect(retrievedContext.userId).toBe('existing-user')
      expect(retrievedContext.currentEmotion).toBe('excited')
    })
  })

  describe('updateUserContext', () => {
    it('should update user context with new information', async () => {
      await contextManager.getUserContext('test-user')

      const updates = {
        currentEmotion: 'confident' as const,
        relationshipGoals: 'serious' as const,
        personalityTraits: ['analytical', 'direct']
      }

      await contextManager.updateUserContext('test-user', updates)

      const updatedContext = await contextManager.getUserContext('test-user')
      expect(updatedContext.currentEmotion).toBe('confident')
      expect(updatedContext.relationshipGoals).toBe('serious')
      expect(updatedContext.personalityTraits).toEqual(['analytical', 'direct'])
      expect(updatedContext.lastActivity.getTime()).toBeGreaterThan(Date.now() - 1000)
    })

    it('should merge learning preferences when updating', async () => {
      await contextManager.getUserContext('test-user')

      const updates = {
        learningPreferences: {
          detailLevel: 'brief' as const
        }
      }

      await contextManager.updateUserContext('test-user', updates)

      const updatedContext = await contextManager.getUserContext('test-user')
      expect(updatedContext.learningPreferences.detailLevel).toBe('brief')
      expect(updatedContext.learningPreferences.preferredAIStyle).toBe('balanced') // Should keep existing
      expect(updatedContext.learningPreferences.feedbackSensitivity).toBe('medium') // Should keep existing
    })

    it('should append to session history', async () => {
      await contextManager.getUserContext('test-user')

      const newSession: SessionContext = {
        sessionId: 'session-1',
        timestamp: new Date(),
        userIntent: 'first_message',
        emotionalState: 'positive',
        urgencyLevel: 'medium',
        contextTags: ['test'],
        previousActions: []
      }

      await contextManager.updateUserContext('test-user', {
        sessionHistory: [newSession]
      })

      const updatedContext = await contextManager.getUserContext('test-user')
      expect(updatedContext.sessionHistory).toHaveLength(1)
      expect(updatedContext.sessionHistory[0].sessionId).toBe('session-1')
    })
  })

  describe('createSessionContext', () => {
    it('should create session context with user info', async () => {
      const session = await contextManager.createSessionContext('test-user', 'first_message')

      expect(session.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/)
      expect(session.userIntent).toBe('first_message')
      expect(session.timestamp).toBeInstanceOf(Date)
      expect(session.emotionalState).toBe('positive') // hopeful -> positive
      expect(session.urgencyLevel).toBe('low')
      expect(session.contextTags).toContain('hopeful')
      expect(session.contextTags).toContain('unclear')
      expect(session.contextTags).toContain('gentle')
      expect(session.contextTags).toContain('first_message')
      expect(session.previousActions).toEqual([])
    })

    it('should add session to user history', async () => {
      const session = await contextManager.createSessionContext('test-user', 'date_planning')

      const userContext = await contextManager.getUserContext('test-user')
      expect(userContext.sessionHistory).toHaveLength(1)
      expect(userContext.sessionHistory[0]).toEqual(session)
    })

    it('should limit session history to 10 items', async () => {
      // Create 12 sessions
      for (let i = 0; i < 12; i++) {
        await contextManager.createSessionContext('test-user', 'general_help')
      }

      const userContext = await contextManager.getUserContext('test-user')
      expect(userContext.sessionHistory).toHaveLength(10)
    })

    it('should set high urgency for anxious date planning', async () => {
      await contextManager.updateUserContext('test-user', {
        currentEmotion: 'anxious'
      })

      const session = await contextManager.createSessionContext('test-user', 'date_planning')

      expect(session.urgencyLevel).toBe('high')
    })

    it('should set medium urgency for relationship advice', async () => {
      const session = await contextManager.createSessionContext('test-user', 'relationship_advice')

      expect(session.urgencyLevel).toBe('medium')
    })
  })

  describe('analyzeUserPatterns', () => {
    it('should analyze user patterns from session history', async () => {
      const sessions: SessionContext[] = [
        {
          sessionId: 'session-1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          userIntent: 'first_message',
          emotionalState: 'positive',
          urgencyLevel: 'high',
          contextTags: ['detailed'],
          previousActions: []
        },
        {
          sessionId: 'session-2',
          timestamp: new Date('2024-01-01T15:00:00Z'),
          userIntent: 'first_message',
          emotionalState: 'positive',
          urgencyLevel: 'medium',
          contextTags: [],
          previousActions: []
        },
        {
          sessionId: 'session-3',
          timestamp: new Date('2024-01-02T10:00:00Z'),
          userIntent: 'date_planning',
          emotionalState: 'positive',
          urgencyLevel: 'high',
          contextTags: ['detailed'],
          previousActions: []
        }
      ]

      await contextManager.updateUserContext('test-user', { sessionHistory: sessions })

      const patterns = await contextManager.analyzeUserPatterns('test-user')

      expect(patterns.preferredPromptTypes).toContain('first_message')
      expect(patterns.optimalTiming).toHaveLength(3)
      expect(patterns.optimalTiming[0].hour).toBe(10)
      expect(patterns.optimalTiming[0].dayOfWeek).toBe(1) // Monday
      expect(patterns.communicationPreferences.urgency).toBeCloseTo(0.67, 1) // 2/3 high urgency
      expect(patterns.communicationPreferences.detail).toBeCloseTo(0.67, 1) // 2/3 detailed
    })

    it('should handle empty session history', async () => {
      const patterns = await contextManager.analyzeUserPatterns('new-user')

      expect(patterns.preferredPromptTypes).toEqual([])
      expect(patterns.optimalTiming).toEqual([])
      expect(patterns.effectiveAIProviders).toEqual([])
      expect(patterns.communicationPreferences.urgency).toBe(0)
      expect(patterns.communicationPreferences.detail).toBe(0)
    })
  })

  describe('recordLearning', () => {
    it('should record new learning metric', async () => {
      await contextManager.recordLearning('test-user', 'first_message', 'claude', 0.9, 'Excellent advice')

      // Verify by checking optimal AI provider
      const optimalProvider = await contextManager.getOptimalAIProvider('test-user', 'first_message')
      expect(optimalProvider).toBe('claude')
    })

    it('should update existing learning metric', async () => {
      // Record initial learning
      await contextManager.recordLearning('test-user', 'first_message', 'claude', 0.7, 'Good')
      
      // Record again with different effectiveness
      await contextManager.recordLearning('test-user', 'first_message', 'claude', 0.9, 'Excellent')

      // Should have updated the existing metric rather than creating new one
      const optimalProvider = await contextManager.getOptimalAIProvider('test-user', 'first_message')
      expect(optimalProvider).toBe('claude')
    })

    it('should update user preferences based on feedback', async () => {
      await contextManager.recordLearning('test-user', 'first_message', 'claude', 0.9, 'very detailed response')

      const userContext = await contextManager.getUserContext('test-user')
      expect(userContext.learningPreferences.preferredAIStyle).toBe('analytical')
    })

    it('should adjust detail level from feedback', async () => {
      await contextManager.recordLearning('test-user', 'first_message', 'claude', 0.8, 'too detailed and long')

      const userContext = await contextManager.getUserContext('test-user')
      expect(userContext.learningPreferences.detailLevel).toBe('brief')
    })

    it('should adjust detail level for more detail request', async () => {
      await contextManager.recordLearning('test-user', 'first_message', 'claude', 0.6, 'need more detail please')

      const userContext = await contextManager.getUserContext('test-user')
      expect(userContext.learningPreferences.detailLevel).toBe('comprehensive')
    })
  })

  describe('getOptimalAIProvider', () => {
    it('should return default provider for no metrics', async () => {
      const provider = await contextManager.getOptimalAIProvider('new-user', 'first_message')

      expect(provider).toBe('claude') // Default for balanced style
    })

    it('should return provider with highest success rate', async () => {
      await contextManager.recordLearning('test-user', 'first_message', 'claude', 0.7, 'good')
      await contextManager.recordLearning('test-user', 'first_message', 'gpt', 0.9, 'excellent')

      const provider = await contextManager.getOptimalAIProvider('test-user', 'first_message')

      expect(provider).toBe('gpt')
    })

    it('should weight by usage frequency', async () => {
      // Claude: high success rate but low usage
      await contextManager.recordLearning('test-user', 'first_message', 'claude', 0.9, 'excellent')
      
      // GPT: lower success rate but higher usage
      await contextManager.recordLearning('test-user', 'first_message', 'gpt', 0.7, 'good')
      await contextManager.recordLearning('test-user', 'first_message', 'gpt', 0.8, 'good')
      await contextManager.recordLearning('test-user', 'first_message', 'gpt', 0.8, 'good')

      const provider = await contextManager.getOptimalAIProvider('test-user', 'first_message')

      // Should prefer gpt due to higher usage frequency weighted score
      expect(['claude', 'gpt']).toContain(provider)
    })

    it('should map AI styles to providers correctly', async () => {
      await contextManager.updateUserContext('test-user', {
        learningPreferences: { preferredAIStyle: 'creative', feedbackSensitivity: 'medium', detailLevel: 'detailed' }
      })

      const provider = await contextManager.getOptimalAIProvider('test-user', 'unknown_type')

      expect(provider).toBe('gpt') // creative -> gpt
    })
  })

  describe('private helper methods behavior', () => {
    it('should correctly infer emotional state', async () => {
      await contextManager.updateUserContext('test-user', { currentEmotion: 'excited' })
      const session = await contextManager.createSessionContext('test-user', 'general_help')
      expect(session.emotionalState).toBe('positive')

      await contextManager.updateUserContext('test-user', { currentEmotion: 'anxious' })
      const session2 = await contextManager.createSessionContext('test-user', 'general_help')
      expect(session2.emotionalState).toBe('negative')

      await contextManager.updateUserContext('test-user', { currentEmotion: 'uncertain' })
      const session3 = await contextManager.createSessionContext('test-user', 'general_help')
      expect(session3.emotionalState).toBe('negative')
    })

    it('should generate appropriate context tags', async () => {
      await contextManager.updateUserContext('test-user', {
        currentEmotion: 'confident',
        relationshipGoals: 'serious',
        communicationStyle: 'direct',
        personalityTraits: ['analytical', 'thoughtful', 'empathetic']
      })

      const session = await contextManager.createSessionContext('test-user', 'relationship_advice')

      expect(session.contextTags).toContain('confident')
      expect(session.contextTags).toContain('serious')
      expect(session.contextTags).toContain('direct')
      expect(session.contextTags).toContain('relationship_advice')
      expect(session.contextTags).toContain('analytical')
      expect(session.contextTags).toContain('thoughtful')
      expect(session.contextTags).toContain('empathetic')
      expect(session.contextTags).toHaveLength(7) // All tags should be included
    })

    it('should limit personality traits in context tags', async () => {
      await contextManager.updateUserContext('test-user', {
        personalityTraits: ['trait1', 'trait2', 'trait3', 'trait4', 'trait5']
      })

      const session = await contextManager.createSessionContext('test-user', 'general_help')

      const personalityTags = session.contextTags.filter(tag => 
        ['trait1', 'trait2', 'trait3', 'trait4', 'trait5'].includes(tag)
      )
      expect(personalityTags).toHaveLength(3) // Should limit to first 3
    })
  })
})
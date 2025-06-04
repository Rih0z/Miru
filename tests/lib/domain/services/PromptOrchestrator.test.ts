import { PromptOrchestrator } from '@/lib/domain/services/PromptOrchestrator'
import { UserContextManager } from '@/lib/domain/services/UserContextManager'
import { IPromptGenerator } from '@/lib/domain/interfaces/IPromptGenerator'
import { 
  UserContext, 
  SessionContext, 
  OrchestratedPrompt,
  AIServiceConfig,
  ActionResult
} from '@/lib/domain/interfaces/IPromptOrchestrator'
import { Connection } from '@/types'

describe('PromptOrchestrator', () => {
  let orchestrator: PromptOrchestrator
  let mockContextManager: jest.Mocked<UserContextManager>
  let mockPromptGenerator: jest.Mocked<IPromptGenerator>
  let mockUserContext: UserContext
  let mockConnection: Connection

  beforeEach(() => {
    mockContextManager = {
      getUserContext: jest.fn(),
      updateUserContext: jest.fn(),
      createSessionContext: jest.fn(),
      analyzeUserPatterns: jest.fn(),
      recordLearning: jest.fn(),
      getOptimalAIProvider: jest.fn()
    } as any

    mockPromptGenerator = {
      generateFirstMessagePrompt: jest.fn(),
      generateConversationPrompt: jest.fn(),
      generateDatePrompt: jest.fn(),
      generateRelationshipPrompt: jest.fn(),
      generateGeneralPrompt: jest.fn(),
      generateContextualPrompt: jest.fn(),
      getPromptTemplate: jest.fn(),
      getAvailablePromptTypes: jest.fn()
    }

    orchestrator = new PromptOrchestrator(mockContextManager, mockPromptGenerator)

    // Set default mock for analyzeUserPatterns
    mockContextManager.analyzeUserPatterns.mockResolvedValue({
      preferredPromptTypes: [],
      optimalTiming: [],
      effectiveAIProviders: [],
      communicationPreferences: { urgency: 0.5, detail: 0.5 }
    })

    mockUserContext = {
      userId: 'user-123',
      currentEmotion: 'hopeful',
      relationshipGoals: 'serious',
      communicationStyle: 'gentle',
      personalityTraits: ['empathetic', 'thoughtful'],
      learningPreferences: {
        preferredAIStyle: 'analytical',
        feedbackSensitivity: 'medium',
        detailLevel: 'detailed'
      },
      sessionHistory: [],
      lastActivity: new Date()
    }

    mockConnection = {
      id: 'conn-123',
      user_id: 'user-123',
      nickname: 'テストさん',
      platform: 'TestApp',
      current_stage: 'メッセージ中',
      basic_info: {
        age: 25,
        occupation: 'エンジニア',
        hobbies: ['映画', 'カフェ巡り']
      },
      communication: {
        frequency: '毎日',
        responseTime: '数時間以内'
      },
      user_feelings: {
        attractivePoints: ['優しい', '面白い'],
        concerns: ['返信が遅い']
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  })

  describe('getUserContext', () => {
    it('should retrieve user context from context manager', async () => {
      mockContextManager.getUserContext.mockResolvedValue(mockUserContext)

      const result = await orchestrator.getUserContext('user-123')

      expect(mockContextManager.getUserContext).toHaveBeenCalledWith('user-123')
      expect(result).toEqual(mockUserContext)
    })
  })

  describe('updateUserContext', () => {
    it('should update user context through context manager', async () => {
      const updates = { currentEmotion: 'excited' as const }

      await orchestrator.updateUserContext('user-123', updates)

      expect(mockContextManager.updateUserContext).toHaveBeenCalledWith('user-123', updates)
    })
  })

  describe('createSessionContext', () => {
    it('should create session context through context manager', async () => {
      const mockSession: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'first_message',
        emotionalState: 'positive',
        urgencyLevel: 'medium',
        contextTags: ['hopeful', 'serious'],
        previousActions: []
      }

      mockContextManager.createSessionContext.mockResolvedValue(mockSession)

      const result = await orchestrator.createSessionContext('user-123', 'first_message')

      expect(mockContextManager.createSessionContext).toHaveBeenCalledWith('user-123', 'first_message')
      expect(result).toEqual(mockSession)
    })
  })

  describe('generatePrompt', () => {
    it('should generate personalized prompt for first message', async () => {
      const sessionContext: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'first_message',
        emotionalState: 'positive',
        urgencyLevel: 'medium',
        contextTags: ['hopeful'],
        previousActions: []
      }

      mockContextManager.getUserContext.mockResolvedValue(mockUserContext)
      mockContextManager.getOptimalAIProvider.mockResolvedValue('claude')
      mockContextManager.analyzeUserPatterns.mockResolvedValue({
        preferredPromptTypes: ['first_message', 'conversation'],
        optimalTiming: [{ hour: 10, dayOfWeek: 1 }],
        effectiveAIProviders: ['claude', 'gpt'],
        communicationPreferences: { urgency: 0.7, detail: 0.6 }
      })
      mockPromptGenerator.generateFirstMessagePrompt.mockReturnValue('Generated first message prompt')

      const result = await orchestrator.generatePrompt(sessionContext, mockConnection)

      expect(result).toMatchObject({
        userId: 'user-123',
        connectionId: 'conn-123',
        aiProvider: 'claude',
        metadata: {
          promptType: 'first_message',
          urgency: 'medium',
          expectedOutputFormat: 'text'
        }
      })
      expect(result.prompt).toContain('Generated first message prompt')
    })

    it('should generate personalized prompt for conversation deepening', async () => {
      const sessionContext: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'conversation_deepening',
        emotionalState: 'positive',
        urgencyLevel: 'low',
        contextTags: [],
        previousActions: []
      }

      mockContextManager.getUserContext.mockResolvedValue(mockUserContext)
      mockContextManager.getOptimalAIProvider.mockResolvedValue('gpt')
      mockContextManager.analyzeUserPatterns.mockResolvedValue({
        preferredPromptTypes: ['conversation_deepening'],
        optimalTiming: [{ hour: 14, dayOfWeek: 2 }],
        effectiveAIProviders: ['gpt', 'claude'],
        communicationPreferences: { urgency: 0.5, detail: 0.8 }
      })
      mockPromptGenerator.generateConversationPrompt.mockReturnValue('Generated conversation prompt')

      const result = await orchestrator.generatePrompt(sessionContext, mockConnection)

      expect(result.aiProvider).toBe('gpt')
      expect(result.metadata.promptType).toBe('conversation_deepening')
      expect(mockPromptGenerator.generateConversationPrompt).toHaveBeenCalledWith(mockConnection, 'claude')
    })

    it('should generate personalized prompt for date planning', async () => {
      const sessionContext: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'date_planning',
        emotionalState: 'positive',
        urgencyLevel: 'high',
        contextTags: [],
        previousActions: []
      }

      mockContextManager.getUserContext.mockResolvedValue(mockUserContext)
      mockContextManager.getOptimalAIProvider.mockResolvedValue('gemini')
      mockContextManager.analyzeUserPatterns.mockResolvedValue({
        preferredPromptTypes: ['date_planning'],
        optimalTiming: [{ hour: 18, dayOfWeek: 5 }],
        effectiveAIProviders: ['gemini', 'claude'],
        communicationPreferences: { urgency: 0.9, detail: 0.7 }
      })
      mockPromptGenerator.generateDatePrompt.mockReturnValue('Generated date prompt')

      const result = await orchestrator.generatePrompt(sessionContext, mockConnection)

      expect(result.metadata.expectedOutputFormat).toBe('structured')
      expect(mockPromptGenerator.generateDatePrompt).toHaveBeenCalled()
    })
  })

  describe('personalizePrompt', () => {
    it('should add emotional context to prompt', async () => {
      const basePrompt = 'Basic dating advice'
      const sessionContext: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'general_help',
        emotionalState: 'positive',
        urgencyLevel: 'low',
        contextTags: [],
        previousActions: []
      }

      const result = await orchestrator.personalizePrompt(basePrompt, mockUserContext, sessionContext)

      expect(result).toContain('hopeful')
      expect(result).toContain(basePrompt)
    })

    it('should adjust communication style', async () => {
      const basePrompt = 'Relationship advice'
      const sessionContext: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'relationship_advice',
        emotionalState: 'neutral',
        urgencyLevel: 'medium',
        contextTags: [],
        previousActions: []
      }

      const result = await orchestrator.personalizePrompt(basePrompt, mockUserContext, sessionContext)

      expect(result).toContain('gentle')
      expect(result).toContain('supportive')
    })

    it('should add personality guidance', async () => {
      const basePrompt = 'Dating tips'
      const sessionContext: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'general_help',
        emotionalState: 'positive',
        urgencyLevel: 'low',
        contextTags: [],
        previousActions: []
      }

      const result = await orchestrator.personalizePrompt(basePrompt, mockUserContext, sessionContext)

      expect(result).toContain('empathetic')
      expect(result).toContain('thoughtful')
    })

    it('should adjust detail level based on preferences', async () => {
      const basePrompt = 'Communication advice'
      const sessionContext: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'general_help',
        emotionalState: 'neutral',
        urgencyLevel: 'medium',
        contextTags: [],
        previousActions: []
      }

      const result = await orchestrator.personalizePrompt(basePrompt, mockUserContext, sessionContext)

      expect(result).toContain('detailed')
      expect(result).toContain('thorough')
    })
  })

  describe('executePrompt', () => {
    it('should execute prompt with AI service configuration', async () => {
      const prompt: OrchestratedPrompt = {
        id: 'prompt-123',
        userId: 'user-123',
        connectionId: 'conn-123',
        aiProvider: 'claude',
        prompt: 'Test prompt',
        metadata: {
          generatedAt: new Date(),
          contextHash: 'hash123',
          promptType: 'first_message',
          urgency: 'medium',
          expectedOutputFormat: 'text'
        },
        personalizationFactors: {
          emotionalTone: 0.7,
          directnessLevel: 0.5,
          creativityLevel: 0.6,
          detailLevel: 0.8
        }
      }

      const aiConfig: AIServiceConfig = {
        provider: 'claude',
        model: 'claude-3-sonnet',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      // Mock the private callAIService method behavior
      jest.spyOn(orchestrator as any, 'callAIService').mockResolvedValue('AI response text')

      const result = await orchestrator.executePrompt(prompt, aiConfig)

      expect(result).toMatchObject({
        promptId: 'prompt-123',
        aiProvider: 'claude',
        response: 'AI response text'
      })
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.processingTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('processAIResponse', () => {
    it('should parse JSON response format', async () => {
      const jsonResponse = '{"advice": "test advice", "action": "send message"}'
      
      const result = await orchestrator.processAIResponse(jsonResponse, 'json')

      expect(result).toEqual({
        advice: 'test advice',
        action: 'send message'
      })
    })

    it('should parse structured response format', async () => {
      const structuredResponse = 'advice: Be yourself\naction: Send a thoughtful message\ntiming: Within 2 hours'
      
      const result = await orchestrator.processAIResponse(structuredResponse, 'structured')

      expect(result.advice).toContain('Be yourself')
      expect(result.recommendedAction).toContain('Send a thoughtful message')
      expect(result.suggestedTiming).toContain('Within 2 hours')
    })

    it('should handle plain text response', async () => {
      const textResponse = 'Simple text advice'
      
      const result = await orchestrator.processAIResponse(textResponse, 'text')

      expect(result).toEqual({ text: 'Simple text advice' })
    })
  })

  describe('recordFeedback', () => {
    it('should record feedback and trigger learning', async () => {
      const mockResult: ActionResult = {
        id: 'result-123',
        promptId: 'prompt-123',
        aiProvider: 'claude',
        response: 'AI response',
        confidence: 0.8,
        processingTime: 1000,
        createdAt: new Date()
      }

      const mockPrompt: OrchestratedPrompt = {
        id: 'prompt-123',
        userId: 'user-123',
        aiProvider: 'claude',
        prompt: 'test',
        metadata: {
          generatedAt: new Date(),
          contextHash: 'hash',
          promptType: 'first_message',
          urgency: 'medium',
          expectedOutputFormat: 'text'
        },
        personalizationFactors: {
          emotionalTone: 0.7,
          directnessLevel: 0.5,
          creativityLevel: 0.6,
          detailLevel: 0.8
        }
      }

      // Set up internal state
      ;(orchestrator as any).executionResults.set('result-123', mockResult)
      ;(orchestrator as any).activePrompts.set('prompt-123', mockPrompt)

      const feedback = {
        userRating: 4,
        effectiveness: 'good' as const,
        notes: 'Very helpful advice'
      }

      await orchestrator.recordFeedback('result-123', feedback)

      expect(mockContextManager.recordLearning).toHaveBeenCalledWith(
        'user-123',
        'first_message',
        'claude',
        0.8,
        'Very helpful advice'
      )
    })
  })

  describe('getOptimalAIProvider', () => {
    it('should delegate to context manager', async () => {
      mockContextManager.getOptimalAIProvider.mockResolvedValue('gpt')

      const result = await orchestrator.getOptimalAIProvider(mockUserContext, 'creative_writing')

      expect(mockContextManager.getOptimalAIProvider).toHaveBeenCalledWith('user-123', 'creative_writing')
      expect(result).toBe('gpt')
    })
  })

  describe('syncContextAcrossAI', () => {
    it('should sync context to multiple AI providers', async () => {
      mockContextManager.getUserContext.mockResolvedValue(mockUserContext)
      
      const providers = ['claude', 'gpt', 'gemini']
      
      await orchestrator.syncContextAcrossAI('user-123', providers)

      expect(mockContextManager.getUserContext).toHaveBeenCalledWith('user-123')
    })
  })

  describe('personalization factors', () => {
    it('should calculate personalization factors correctly', () => {
      const factors = (orchestrator as any).calculatePersonalizationFactors(mockUserContext)

      expect(factors.emotionalTone).toBeGreaterThan(0)
      expect(factors.directnessLevel).toBeGreaterThan(0)
      expect(factors.creativityLevel).toBeGreaterThan(0)
      expect(factors.detailLevel).toBeGreaterThan(0)
      
      expect(factors.emotionalTone).toBeLessThanOrEqual(1)
      expect(factors.directnessLevel).toBeLessThanOrEqual(1)
      expect(factors.creativityLevel).toBeLessThanOrEqual(1)
      expect(factors.detailLevel).toBeLessThanOrEqual(1)
    })
  })

  describe('error handling', () => {
    it('should handle prompt generation errors gracefully', async () => {
      const sessionContext: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'first_message',
        emotionalState: 'positive',
        urgencyLevel: 'medium',
        contextTags: [],
        previousActions: []
      }

      mockContextManager.getUserContext.mockRejectedValue(new Error('Context not found'))

      await expect(orchestrator.generatePrompt(sessionContext, mockConnection))
        .rejects.toThrow('Context not found')
    })

    it('should handle execution errors gracefully', async () => {
      const prompt: OrchestratedPrompt = {
        id: 'prompt-123',
        userId: 'user-123',
        aiProvider: 'claude',
        prompt: 'test',
        metadata: {
          generatedAt: new Date(),
          contextHash: 'hash',
          promptType: 'first_message',
          urgency: 'medium',
          expectedOutputFormat: 'text'
        },
        personalizationFactors: {
          emotionalTone: 0.7,
          directnessLevel: 0.5,
          creativityLevel: 0.6,
          detailLevel: 0.8
        }
      }

      const aiConfig: AIServiceConfig = {
        provider: 'claude',
        model: 'claude-3-sonnet',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      jest.spyOn(orchestrator as any, 'callAIService').mockRejectedValue(new Error('AI service error'))

      await expect(orchestrator.executePrompt(prompt, aiConfig))
        .rejects.toThrow('Failed to execute prompt')
    })

    it('should handle result not found in recordFeedback', async () => {
      const feedback = {
        userRating: 4,
        effectiveness: 'good' as const,
        notes: 'Very helpful advice'
      }

      await expect(orchestrator.recordFeedback('nonexistent-result', feedback))
        .rejects.toThrow('Result nonexistent-result not found')
    })

    it('should handle invalid JSON response gracefully', async () => {
      const invalidJsonResponse = 'invalid json {'
      
      const result = await orchestrator.processAIResponse(invalidJsonResponse, 'json')

      expect(result).toEqual({
        error: 'Invalid JSON response',
        originalText: 'invalid json {'
      })
    })
  })

  describe('structured data processing', () => {
    it('should process structured data when expected format is not text', async () => {
      const prompt: OrchestratedPrompt = {
        id: 'prompt-123',
        userId: 'user-123',
        connectionId: 'conn-123',
        aiProvider: 'claude',
        prompt: 'Test prompt',
        metadata: {
          generatedAt: new Date(),
          contextHash: 'hash123',
          promptType: 'first_message',
          urgency: 'medium',
          expectedOutputFormat: 'structured'
        },
        personalizationFactors: {
          emotionalTone: 0.7,
          directnessLevel: 0.5,
          creativityLevel: 0.6,
          detailLevel: 0.8
        }
      }

      const aiConfig: AIServiceConfig = {
        provider: 'claude',
        model: 'claude-3-sonnet',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      // Mock the private callAIService method
      jest.spyOn(orchestrator as any, 'callAIService').mockResolvedValue('advice: Be yourself\naction: Send message\ntiming: Today')

      const result = await orchestrator.executePrompt(prompt, aiConfig)

      expect(result.structuredData).toBeDefined()
      expect(result.structuredData?.advice).toContain('Be yourself')
      expect(result.structuredData?.recommendedAction).toContain('Send message')
    })
  })

  describe('optimizeForUser', () => {
    it('should optimize user preferences based on patterns', async () => {
      mockContextManager.analyzeUserPatterns.mockResolvedValue({
        preferredPromptTypes: ['first_message'],
        optimalTiming: [{ hour: 10, dayOfWeek: 1 }],
        effectiveAIProviders: ['claude', 'gpt'],
        communicationPreferences: { urgency: 0.5, detail: 0.8 }
      })
      mockContextManager.updateUserContext.mockResolvedValue()

      const result = await orchestrator.optimizeForUser('user-123')

      expect(mockContextManager.analyzeUserPatterns).toHaveBeenCalledWith('user-123')
      expect(mockContextManager.updateUserContext).toHaveBeenCalledWith('user-123', {
        learningPreferences: {
          preferredAIStyle: 'analytical',
          feedbackSensitivity: 'medium',
          detailLevel: 'comprehensive'
        }
      })
      expect(result).toEqual([])
    })
  })

  describe('base prompt fallbacks', () => {
    it('should handle conversation_deepening without connection', async () => {
      const sessionContext: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'conversation_deepening',
        emotionalState: 'positive',
        urgencyLevel: 'medium',
        contextTags: [],
        previousActions: []
      }

      mockContextManager.getUserContext.mockResolvedValue(mockUserContext)
      mockContextManager.getOptimalAIProvider.mockResolvedValue('claude')
      mockContextManager.analyzeUserPatterns.mockResolvedValue({
        preferredPromptTypes: ['conversation_deepening'],
        optimalTiming: [],
        effectiveAIProviders: ['claude'],
        communicationPreferences: { urgency: 0.5, detail: 0.5 }
      })

      const result = await orchestrator.generatePrompt(sessionContext)

      expect(result.prompt).toContain('Please provide advice on deepening conversations in relationships.')
    })

    it('should handle date_planning without connection', async () => {
      const sessionContext: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'date_planning',
        emotionalState: 'positive',
        urgencyLevel: 'medium',
        contextTags: [],
        previousActions: []
      }

      mockContextManager.getUserContext.mockResolvedValue(mockUserContext)
      mockContextManager.getOptimalAIProvider.mockResolvedValue('claude')

      const result = await orchestrator.generatePrompt(sessionContext)

      expect(result.prompt).toContain('Please provide advice on planning a date.')
    })

    it('should handle relationship_advice without connection', async () => {
      const sessionContext: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'relationship_advice',
        emotionalState: 'positive',
        urgencyLevel: 'medium',
        contextTags: [],
        previousActions: []
      }

      mockContextManager.getUserContext.mockResolvedValue(mockUserContext)
      mockContextManager.getOptimalAIProvider.mockResolvedValue('claude')

      const result = await orchestrator.generatePrompt(sessionContext)

      expect(result.prompt).toContain('Please provide general relationship advice.')
    })

    it('should handle default case without connection', async () => {
      const sessionContext: SessionContext = {
        sessionId: 'session-123',
        timestamp: new Date(),
        userIntent: 'unknown_intent' as any,
        emotionalState: 'positive',
        urgencyLevel: 'medium',
        contextTags: [],
        previousActions: []
      }

      mockContextManager.getUserContext.mockResolvedValue(mockUserContext)
      mockContextManager.getOptimalAIProvider.mockResolvedValue('claude')

      const result = await orchestrator.generatePrompt(sessionContext)

      expect(result.prompt).toContain('Please provide helpful relationship guidance.')
    })
  })

  describe('private helper methods', () => {
    it('should map providers to style correctly', () => {
      const mapProvidersToStyle = (orchestrator as any).mapProvidersToStyle

      expect(mapProvidersToStyle(['claude', 'gpt'])).toBe('analytical')
      expect(mapProvidersToStyle(['gpt', 'gemini'])).toBe('creative')
      expect(mapProvidersToStyle(['gemini'])).toBe('balanced')
    })

    it('should infer detail preference correctly', () => {
      const inferDetailPreference = (orchestrator as any).inferDetailPreference

      expect(inferDetailPreference({ detail: 0.8 })).toBe('comprehensive')
      expect(inferDetailPreference({ detail: 0.2 })).toBe('brief')
      expect(inferDetailPreference({ detail: 0.5 })).toBe('detailed')
      expect(inferDetailPreference({})).toBe('detailed')
    })
  })
})
import { 
  IPromptOrchestrator,
  UserContext,
  SessionContext,
  OrchestratedPrompt,
  AIServiceConfig,
  ActionResult,
  LearningMetrics
} from '@/lib/domain/interfaces/IPromptOrchestrator'
import { Connection } from '@/types'
import { UserContextManager } from './UserContextManager'
import { IPromptGenerator } from '@/lib/domain/interfaces/IPromptGenerator'

/**
 * Dynamic Prompt Orchestrator
 * 動的プロンプトオーケストレーター
 * 
 * Core orchestration service that personalizes prompts based on user context,
 * manages AI service interactions, and learns from feedback for continuous optimization
 */
export class PromptOrchestrator implements IPromptOrchestrator {
  private contextManager: UserContextManager
  private promptGenerator: IPromptGenerator
  private activePrompts = new Map<string, OrchestratedPrompt>()
  private executionResults = new Map<string, ActionResult>()

  constructor(
    contextManager: UserContextManager,
    promptGenerator: IPromptGenerator
  ) {
    this.contextManager = contextManager
    this.promptGenerator = promptGenerator
  }

  /**
   * Update user context with new information
   * 新しい情報でユーザーコンテキストを更新
   */
  async updateUserContext(userId: string, updates: Partial<UserContext>): Promise<void> {
    await this.contextManager.updateUserContext(userId, updates)
  }

  /**
   * Retrieve current user context
   * 現在のユーザーコンテキストを取得
   */
  async getUserContext(userId: string): Promise<UserContext> {
    return await this.contextManager.getUserContext(userId)
  }

  /**
   * Create session context for current interaction
   * 現在のインタラクション用のセッションコンテキストを作成
   */
  async createSessionContext(userId: string, intent: string): Promise<SessionContext> {
    return await this.contextManager.createSessionContext(
      userId, 
      intent as SessionContext['userIntent']
    )
  }

  /**
   * Generate personalized, contextual prompt
   * パーソナライズされたコンテキストプロンプトを生成
   */
  async generatePrompt(
    sessionContext: SessionContext, 
    connection?: Connection
  ): Promise<OrchestratedPrompt> {
    const userContext = await this.getUserContext(sessionContext.sessionId.split('_')[0])
    
    // Generate base prompt using existing generator
    const basePrompt = await this.generateBasePrompt(sessionContext, connection)
    
    // Personalize the prompt based on user context
    const personalizedPrompt = await this.personalizePrompt(basePrompt, userContext, sessionContext)
    
    // Create orchestrated prompt with metadata
    const orchestratedPrompt: OrchestratedPrompt = {
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userContext.userId,
      connectionId: connection?.id,
      aiProvider: await this.getOptimalAIProvider(userContext, sessionContext.userIntent),
      prompt: personalizedPrompt,
      metadata: {
        generatedAt: new Date(),
        contextHash: this.generateContextHash(userContext, sessionContext),
        promptType: sessionContext.userIntent,
        urgency: sessionContext.urgencyLevel,
        expectedOutputFormat: this.determineOutputFormat(sessionContext.userIntent)
      },
      personalizationFactors: this.calculatePersonalizationFactors(userContext)
    }

    this.activePrompts.set(orchestratedPrompt.id, orchestratedPrompt)
    return orchestratedPrompt
  }

  /**
   * Personalize base prompt with user-specific context
   * ユーザー固有のコンテキストでベースプロンプトをパーソナライズ
   */
  async personalizePrompt(
    basePrompt: string, 
    userContext: UserContext, 
    sessionContext: SessionContext
  ): Promise<string> {
    let personalizedPrompt = basePrompt

    // Add emotional context
    personalizedPrompt = this.addEmotionalContext(personalizedPrompt, userContext, sessionContext)
    
    // Adjust communication style
    personalizedPrompt = this.adjustCommunicationStyle(personalizedPrompt, userContext)
    
    // Add personality-specific guidance
    personalizedPrompt = this.addPersonalityGuidance(personalizedPrompt, userContext)
    
    // Incorporate learning from past interactions
    personalizedPrompt = await this.incorporateLearnings(personalizedPrompt, userContext, sessionContext)
    
    // Adjust detail level based on preferences
    personalizedPrompt = this.adjustDetailLevel(personalizedPrompt, userContext)

    return personalizedPrompt
  }

  /**
   * Execute prompt with appropriate AI service
   * 適切なAIサービスでプロンプトを実行
   */
  async executePrompt(prompt: OrchestratedPrompt, aiConfig: AIServiceConfig): Promise<ActionResult> {
    const startTime = Date.now()
    
    try {
      // Simulate AI service call (replace with actual implementation)
      const response = await this.callAIService(prompt.prompt, aiConfig)
      
      const result: ActionResult = {
        id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        promptId: prompt.id,
        aiProvider: prompt.aiProvider,
        response: response,
        confidence: this.calculateConfidence(response, prompt),
        processingTime: Date.now() - startTime,
        createdAt: new Date()
      }

      // Process structured data if expected
      if (prompt.metadata.expectedOutputFormat !== 'text') {
        result.structuredData = await this.processAIResponse(
          response, 
          prompt.metadata.expectedOutputFormat
        )
      }

      this.executionResults.set(result.id, result)
      return result
    } catch (error) {
      throw new Error(`Failed to execute prompt: ${error}`)
    }
  }

  /**
   * Process AI response into structured format
   * AI応答を構造化形式に処理
   */
  async processAIResponse(response: string, expectedFormat: string): Promise<Record<string, any>> {
    switch (expectedFormat) {
      case 'json':
        return this.parseJSONResponse(response)
      case 'structured':
        return this.parseStructuredResponse(response)
      default:
        return { text: response }
    }
  }

  /**
   * Record user feedback for learning
   * 学習用のユーザーフィードバックを記録
   */
  async recordFeedback(resultId: string, feedback: ActionResult['feedback']): Promise<void> {
    const result = this.executionResults.get(resultId)
    if (!result) {
      throw new Error(`Result ${resultId} not found`)
    }

    result.feedback = feedback
    
    // Extract prompt information for learning
    const prompt = this.activePrompts.get(result.promptId)
    if (prompt) {
      await this.contextManager.recordLearning(
        prompt.userId,
        prompt.metadata.promptType,
        prompt.aiProvider,
        feedback && feedback.effectiveness === 'excellent' ? 1 : 
        feedback && feedback.effectiveness === 'good' ? 0.8 :
        feedback && feedback.effectiveness === 'average' ? 0.6 : 0.3,
        feedback?.notes || ''
      )
    }
  }

  /**
   * Optimize prompts for specific user
   * 特定のユーザー向けにプロンプトを最適化
   */
  async optimizeForUser(userId: string): Promise<LearningMetrics[]> {
    const patterns = await this.contextManager.analyzeUserPatterns(userId)
    
    // Update user preferences based on analysis
    await this.updateUserContext(userId, {
      learningPreferences: {
        preferredAIStyle: this.mapProvidersToStyle(patterns.effectiveAIProviders),
        feedbackSensitivity: 'medium', // Could be calculated from feedback history
        detailLevel: this.inferDetailPreference(patterns.communicationPreferences)
      }
    })

    // Return learning metrics (would be implemented based on storage)
    return []
  }

  /**
   * Sync context across AI providers
   * AIプロバイダー間でコンテキストを同期
   */
  async syncContextAcrossAI(userId: string, aiProviders: string[]): Promise<void> {
    const userContext = await this.getUserContext(userId)
    
    // Create cross-platform context summary
    const contextSummary = this.createContextSummary(userContext)
    
    // Sync to each provider (implementation would depend on provider APIs)
    for (const provider of aiProviders) {
      await this.syncToProvider(provider, userId, contextSummary)
    }
  }

  /**
   * Get optimal AI provider for user and prompt type
   * ユーザーとプロンプトタイプに最適なAIプロバイダーを取得
   */
  async getOptimalAIProvider(userContext: UserContext, promptType: string): Promise<string> {
    return await this.contextManager.getOptimalAIProvider(userContext.userId, promptType)
  }

  // Private helper methods

  private async generateBasePrompt(sessionContext: SessionContext, connection?: Connection): Promise<string> {
    // Map session intent to prompt generator method
    switch (sessionContext.userIntent) {
      case 'first_message':
        return connection ? 
          this.promptGenerator.generateFirstMessagePrompt(connection, 'claude') :
          this.promptGenerator.generateGeneralPrompt(connection!, 'claude')
      case 'conversation_deepening':
        return connection ? 
          this.promptGenerator.generateConversationPrompt(connection, 'claude') :
          'Please provide advice on deepening conversations in relationships.'
      case 'date_planning':
        return connection ? 
          this.promptGenerator.generateDatePrompt(connection, 'claude') :
          'Please provide advice on planning a date.'
      case 'relationship_advice':
        return connection ? 
          this.promptGenerator.generateRelationshipPrompt(connection, 'claude') :
          'Please provide general relationship advice.'
      default:
        return connection ? 
          this.promptGenerator.generateGeneralPrompt(connection, 'claude') :
          'Please provide helpful relationship guidance.'
    }
  }

  private addEmotionalContext(prompt: string, userContext: UserContext, sessionContext: SessionContext): string {
    const emotionalPrefix = this.getEmotionalPrefix(userContext.currentEmotion, sessionContext.emotionalState)
    return `${emotionalPrefix}\n\n${prompt}`
  }

  private getEmotionalPrefix(emotion: UserContext['currentEmotion'], state: SessionContext['emotionalState']): string {
    const prefixes = {
      excited: "The user is feeling excited and optimistic about their romantic prospects.",
      anxious: "The user is feeling anxious and needs reassuring, gentle guidance.",
      hopeful: "The user is feeling hopeful and looking for positive encouragement.",
      frustrated: "The user is feeling frustrated and needs patient, understanding advice.",
      confident: "The user is feeling confident and ready for direct, actionable advice.",
      uncertain: "The user is feeling uncertain and needs clear, structured guidance."
    }
    
    return prefixes[emotion] || "The user is seeking thoughtful relationship guidance."
  }

  private adjustCommunicationStyle(prompt: string, userContext: UserContext): string {
    const styleAdjustments = {
      direct: "Please be direct and straightforward in your response.",
      gentle: "Please be gentle and supportive in your approach.",
      humorous: "Feel free to include appropriate humor to lighten the mood.",
      formal: "Please maintain a professional and formal tone.",
      emotional: "Please be emotionally supportive and empathetic."
    }

    const adjustment = styleAdjustments[userContext.communicationStyle]
    return adjustment ? `${prompt}\n\n${adjustment}` : prompt
  }

  private addPersonalityGuidance(prompt: string, userContext: UserContext): string {
    if (userContext.personalityTraits.length === 0) return prompt
    
    const personalityContext = `The user has the following personality traits: ${userContext.personalityTraits.join(', ')}. Please tailor your advice accordingly.`
    return `${prompt}\n\n${personalityContext}`
  }

  private async incorporateLearnings(
    prompt: string, 
    userContext: UserContext, 
    sessionContext: SessionContext
  ): Promise<string> {
    // Analyze past successful interactions
    const patterns = await this.contextManager.analyzeUserPatterns(userContext.userId)
    
    if (patterns.preferredPromptTypes.includes(sessionContext.userIntent)) {
      const learningNote = "Based on your past preferences, I'll focus on strategies that have worked well for you before."
      return `${prompt}\n\n${learningNote}`
    }
    
    return prompt
  }

  private adjustDetailLevel(prompt: string, userContext: UserContext): string {
    const detailAdjustments = {
      brief: "Please provide a concise, focused response.",
      detailed: "Please provide a thorough, detailed response with examples.",
      comprehensive: "Please provide a comprehensive response with multiple options and detailed explanations."
    }

    const adjustment = detailAdjustments[userContext.learningPreferences.detailLevel]
    return adjustment ? `${prompt}\n\n${adjustment}` : prompt
  }

  private calculatePersonalizationFactors(userContext: UserContext) {
    return {
      emotionalTone: this.mapEmotionToTone(userContext.currentEmotion),
      directnessLevel: this.mapCommunicationStyleToDirectness(userContext.communicationStyle),
      creativityLevel: userContext.learningPreferences.preferredAIStyle === 'creative' ? 0.8 : 0.5,
      detailLevel: this.mapDetailLevelToNumber(userContext.learningPreferences.detailLevel)
    }
  }

  private mapEmotionToTone(emotion: UserContext['currentEmotion']): number {
    const toneMap = {
      excited: 0.9,
      hopeful: 0.7,
      confident: 0.8,
      uncertain: 0.4,
      anxious: 0.3,
      frustrated: 0.2
    }
    return toneMap[emotion] || 0.5
  }

  private mapCommunicationStyleToDirectness(style: UserContext['communicationStyle']): number {
    const directnessMap = {
      direct: 0.9,
      formal: 0.7,
      gentle: 0.3,
      humorous: 0.5,
      emotional: 0.4
    }
    return directnessMap[style] || 0.5
  }

  private mapDetailLevelToNumber(detailLevel: UserContext['learningPreferences']['detailLevel']): number {
    const detailMap = {
      brief: 0.3,
      detailed: 0.7,
      comprehensive: 0.9
    }
    return detailMap[detailLevel] || 0.5
  }

  private generateContextHash(userContext: UserContext, sessionContext: SessionContext): string {
    const contextString = JSON.stringify({
      emotion: userContext.currentEmotion,
      style: userContext.communicationStyle,
      intent: sessionContext.userIntent,
      urgency: sessionContext.urgencyLevel
    })
    
    // Simple hash function (would use proper crypto hash in production)
    return btoa(contextString).slice(0, 16)
  }

  private determineOutputFormat(intent: string): 'text' | 'json' | 'structured' {
    const structuredIntents = ['date_planning', 'relationship_advice']
    return structuredIntents.includes(intent) ? 'structured' : 'text'
  }

  private calculateConfidence(response: string, prompt: OrchestratedPrompt): number {
    // Simple confidence calculation based on response length and keywords
    const responseLength = response.length
    const hasSpecificAdvice = /specific|concrete|actionable|step|plan/i.test(response)
    
    let confidence = Math.min(responseLength / 500, 1) * 0.7
    if (hasSpecificAdvice) confidence += 0.3
    
    return Math.min(confidence, 1)
  }

  private async callAIService(prompt: string, config: AIServiceConfig): Promise<string> {
    // Simulate AI service call - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `AI response to: ${prompt.substring(0, 50)}...`
  }

  private parseJSONResponse(response: string): Record<string, any> {
    try {
      return JSON.parse(response)
    } catch {
      return { error: 'Invalid JSON response', originalText: response }
    }
  }

  private parseStructuredResponse(response: string): Record<string, any> {
    // Extract structured information from text response
    const advice = response.match(/advice[:：]([^。\n]+)/i)?.[1]?.trim()
    const action = response.match(/action[:：]([^。\n]+)/i)?.[1]?.trim()
    const timing = response.match(/timing[:：]([^。\n]+)/i)?.[1]?.trim()
    
    return {
      advice: advice || response,
      recommendedAction: action,
      suggestedTiming: timing,
      fullResponse: response
    }
  }

  private mapProvidersToStyle(providers: string[]): UserContext['learningPreferences']['preferredAIStyle'] {
    if (providers.includes('claude')) return 'analytical'
    if (providers.includes('gpt')) return 'creative'
    return 'balanced'
  }

  private inferDetailPreference(preferences: Record<string, number>): UserContext['learningPreferences']['detailLevel'] {
    const detailScore = preferences.detail || 0.5
    if (detailScore > 0.7) return 'comprehensive'
    if (detailScore < 0.3) return 'brief'
    return 'detailed'
  }

  private createContextSummary(userContext: UserContext): Record<string, any> {
    return {
      userId: userContext.userId,
      preferences: userContext.learningPreferences,
      currentState: {
        emotion: userContext.currentEmotion,
        goals: userContext.relationshipGoals,
        style: userContext.communicationStyle
      },
      recentActivity: userContext.sessionHistory.slice(-3)
    }
  }

  private async syncToProvider(provider: string, userId: string, contextSummary: Record<string, any>): Promise<void> {
    // Implementation would depend on provider-specific APIs
    console.log(`Syncing context for user ${userId} to ${provider}`, contextSummary)
  }
}
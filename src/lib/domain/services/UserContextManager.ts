import { 
  UserContext, 
  SessionContext, 
  LearningMetrics 
} from '@/lib/domain/interfaces/IPromptOrchestrator'

/**
 * User Context Manager
 * ユーザーコンテキスト管理サービス
 * 
 * Manages personalized user state, preferences, and learning history
 * for dynamic prompt generation and AI orchestration
 */
export class UserContextManager {
  private userContexts = new Map<string, UserContext>()
  private sessionContexts = new Map<string, SessionContext>()
  private learningMetrics = new Map<string, LearningMetrics[]>()

  /**
   * Initialize or retrieve user context
   * ユーザーコンテキストの初期化または取得
   */
  async getUserContext(userId: string): Promise<UserContext> {
    if (this.userContexts.has(userId)) {
      return this.userContexts.get(userId)!
    }

    // Create default context for new user
    const defaultContext: UserContext = {
      userId,
      currentEmotion: 'hopeful',
      relationshipGoals: 'unclear',
      communicationStyle: 'gentle',
      personalityTraits: [],
      learningPreferences: {
        preferredAIStyle: 'balanced',
        feedbackSensitivity: 'medium',
        detailLevel: 'detailed'
      },
      sessionHistory: [],
      lastActivity: new Date()
    }

    this.userContexts.set(userId, defaultContext)
    return defaultContext
  }

  /**
   * Update user context with new information
   * 新しい情報でユーザーコンテキストを更新
   */
  async updateUserContext(userId: string, updates: Partial<UserContext>): Promise<void> {
    const currentContext = await this.getUserContext(userId)
    
    const updatedContext: UserContext = {
      ...currentContext,
      ...updates,
      lastActivity: new Date(),
      // Merge arrays rather than replace
      personalityTraits: updates.personalityTraits || currentContext.personalityTraits,
      sessionHistory: updates.sessionHistory || currentContext.sessionHistory,
      learningPreferences: updates.learningPreferences 
        ? { ...currentContext.learningPreferences, ...updates.learningPreferences }
        : currentContext.learningPreferences
    }

    this.userContexts.set(userId, updatedContext)
  }

  /**
   * Create new session context for current interaction
   * 現在のインタラクション用の新しいセッションコンテキストを作成
   */
  async createSessionContext(
    userId: string, 
    intent: SessionContext['userIntent'],
    connectionId?: string
  ): Promise<SessionContext> {
    const userContext = await this.getUserContext(userId)
    
    const sessionContext: SessionContext = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userIntent: intent,
      emotionalState: this.inferEmotionalState(userContext.currentEmotion),
      urgencyLevel: this.calculateUrgency(intent, userContext),
      contextTags: this.generateContextTags(userContext, intent),
      previousActions: []
    }

    this.sessionContexts.set(sessionContext.sessionId, sessionContext)
    
    // Add to user's session history (keep last 10 sessions)
    userContext.sessionHistory.push(sessionContext)
    if (userContext.sessionHistory.length > 10) {
      userContext.sessionHistory = userContext.sessionHistory.slice(-10)
    }

    // Update last activity time
    userContext.lastActivity = new Date()
    this.userContexts.set(userId, userContext)
    
    return sessionContext
  }

  /**
   * Analyze user patterns for personalization
   * パーソナライゼーション用のユーザーパターン分析
   */
  async analyzeUserPatterns(userId: string): Promise<{
    preferredPromptTypes: string[]
    optimalTiming: { hour: number; dayOfWeek: number }[]
    effectiveAIProviders: string[]
    communicationPreferences: Record<string, number>
  }> {
    const userContext = await this.getUserContext(userId)
    const metrics = this.learningMetrics.get(userId) || []

    // Analyze session history for patterns
    const sessionAnalysis = this.analyzeSessionHistory(userContext.sessionHistory)
    const providerAnalysis = this.analyzeAIProviderEffectiveness(metrics)
    const timingAnalysis = this.analyzeOptimalTiming(userContext.sessionHistory)

    return {
      preferredPromptTypes: sessionAnalysis.frequentIntents,
      optimalTiming: timingAnalysis,
      effectiveAIProviders: providerAnalysis.topProviders,
      communicationPreferences: sessionAnalysis.stylePreferences
    }
  }

  /**
   * Learn from user feedback to improve future interactions
   * ユーザーフィードバックから学習し、将来のインタラクションを改善
   */
  async recordLearning(
    userId: string,
    promptType: string,
    aiProvider: string,
    effectiveness: number,
    userFeedback: string
  ): Promise<void> {
    if (!this.learningMetrics.has(userId)) {
      this.learningMetrics.set(userId, [])
    }

    const metrics = this.learningMetrics.get(userId)!
    const existingMetric = metrics.find(m => 
      m.promptType === promptType && m.aiProvider === aiProvider
    )

    if (existingMetric) {
      // Update existing metric with weighted average
      const totalUsage = existingMetric.usageFrequency + 1
      existingMetric.successRate = (
        (existingMetric.successRate * existingMetric.usageFrequency + effectiveness) / totalUsage
      )
      existingMetric.usageFrequency = totalUsage
      existingMetric.lastUpdated = new Date()
    } else {
      // Create new metric
      metrics.push({
        userId,
        promptType,
        aiProvider,
        successRate: effectiveness,
        averageRating: effectiveness,
        usageFrequency: 1,
        contextSimilarity: 1.0,
        lastUpdated: new Date()
      })
    }

    // Update user preferences based on feedback
    await this.updatePreferencesFromFeedback(userId, promptType, aiProvider, effectiveness, userFeedback)
  }

  /**
   * Get optimal AI provider for specific context
   * 特定のコンテキストに最適なAIプロバイダーを取得
   */
  async getOptimalAIProvider(userId: string, promptType: string): Promise<string> {
    const metrics = this.learningMetrics.get(userId) || []
    const userContext = await this.getUserContext(userId)

    // Filter metrics for this prompt type
    const relevantMetrics = metrics.filter(m => m.promptType === promptType)
    
    if (relevantMetrics.length === 0) {
      // Default to user's preferred AI style
      return this.mapAIStyleToProvider(userContext.learningPreferences.preferredAIStyle)
    }

    // Find provider with highest weighted success rate
    const providerScores = relevantMetrics.reduce((acc, metric) => {
      const score = metric.successRate * Math.log(metric.usageFrequency + 1)
      acc[metric.aiProvider] = (acc[metric.aiProvider] || 0) + score
      return acc
    }, {} as Record<string, number>)

    return Object.entries(providerScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'claude'
  }

  // Private helper methods

  private inferEmotionalState(emotion: UserContext['currentEmotion']): SessionContext['emotionalState'] {
    const positiveEmotions = ['excited', 'hopeful', 'confident']
    const negativeEmotions = ['anxious', 'frustrated', 'uncertain']
    
    if (positiveEmotions.includes(emotion)) return 'positive'
    if (negativeEmotions.includes(emotion)) return 'negative'
    return 'neutral'
  }

  private calculateUrgency(
    intent: SessionContext['userIntent'], 
    userContext: UserContext
  ): SessionContext['urgencyLevel'] {
    // High urgency for time-sensitive situations
    if (intent === 'date_planning' && userContext.currentEmotion === 'anxious') {
      return 'high'
    }
    
    // Medium urgency for relationship advice
    if (intent === 'relationship_advice') {
      return 'medium'
    }
    
    // Low urgency for general help
    return 'low'
  }

  private generateContextTags(userContext: UserContext, intent: string): string[] {
    const tags: string[] = [
      userContext.currentEmotion,
      userContext.relationshipGoals,
      userContext.communicationStyle,
      intent
    ]

    // Add personality traits as tags
    tags.push(...userContext.personalityTraits.slice(0, 3))

    return tags.filter(Boolean)
  }

  private analyzeSessionHistory(sessions: SessionContext[]) {
    if (sessions.length === 0) {
      return {
        frequentIntents: [],
        stylePreferences: {
          urgency: 0,
          detail: 0
        }
      }
    }

    const intentCounts = sessions.reduce((acc, session) => {
      acc[session.userIntent] = (acc[session.userIntent] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const frequentIntents = Object.entries(intentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([intent]) => intent)

    const stylePreferences = {
      urgency: sessions.filter(s => s.urgencyLevel === 'high').length / sessions.length,
      detail: sessions.filter(s => s.contextTags.includes('detailed')).length / sessions.length
    }

    return { frequentIntents, stylePreferences }
  }

  private analyzeAIProviderEffectiveness(metrics: LearningMetrics[]) {
    const providerScores = metrics.reduce((acc, metric) => {
      acc[metric.aiProvider] = (acc[metric.aiProvider] || 0) + metric.successRate
      return acc
    }, {} as Record<string, number>)

    const topProviders = Object.entries(providerScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([provider]) => provider)

    return { topProviders, scores: providerScores }
  }

  private analyzeOptimalTiming(sessions: SessionContext[]) {
    if (sessions.length === 0) {
      return []
    }
    
    return sessions.map(session => ({
      hour: session.timestamp.getUTCHours(),
      dayOfWeek: session.timestamp.getUTCDay()
    }))
  }

  private async updatePreferencesFromFeedback(
    userId: string,
    promptType: string,
    aiProvider: string,
    effectiveness: number,
    feedback: string
  ): Promise<void> {
    const userContext = await this.getUserContext(userId)
    
    // Analyze feedback sentiment and adjust preferences
    if (effectiveness > 0.8) {
      // High effectiveness - reinforce current preferences
      if (aiProvider === 'claude') {
        userContext.learningPreferences.preferredAIStyle = 'analytical'
      } else if (aiProvider === 'gpt') {
        userContext.learningPreferences.preferredAIStyle = 'creative'
      }
    }

    // Adjust detail level based on feedback
    if (feedback.includes('too detailed') || feedback.includes('too long')) {
      userContext.learningPreferences.detailLevel = 'brief'
    } else if (feedback.includes('need more detail') || feedback.includes('too short')) {
      userContext.learningPreferences.detailLevel = 'comprehensive'
    }

    await this.updateUserContext(userId, { learningPreferences: userContext.learningPreferences })
  }

  private mapAIStyleToProvider(style: UserContext['learningPreferences']['preferredAIStyle']): string {
    switch (style) {
      case 'analytical': return 'claude'
      case 'creative': return 'gpt'
      case 'balanced': return 'claude'
      default: return 'claude'
    }
  }
}
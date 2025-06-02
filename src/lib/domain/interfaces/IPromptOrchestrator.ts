import { Connection } from '@/types'

/**
 * User Context for Personalized Prompt Generation
 * ユーザーコンテキスト - パーソナライズされたプロンプト生成のため
 */
export interface UserContext {
  userId: string
  currentEmotion: 'excited' | 'anxious' | 'hopeful' | 'frustrated' | 'confident' | 'uncertain'
  relationshipGoals: 'casual' | 'serious' | 'marriage' | 'friendship' | 'unclear'
  communicationStyle: 'direct' | 'gentle' | 'humorous' | 'formal' | 'emotional'
  personalityTraits: string[]
  learningPreferences: {
    preferredAIStyle: 'analytical' | 'creative' | 'balanced'
    feedbackSensitivity: 'high' | 'medium' | 'low'
    detailLevel: 'brief' | 'detailed' | 'comprehensive'
  }
  sessionHistory: SessionContext[]
  lastActivity: Date
}

/**
 * Session Context for Current Interaction
 * セッションコンテキスト - 現在のインタラクション用
 */
export interface SessionContext {
  sessionId: string
  timestamp: Date
  currentConnection?: Connection
  userIntent: 'first_message' | 'conversation_deepening' | 'date_planning' | 'relationship_advice' | 'general_help'
  emotionalState: 'positive' | 'neutral' | 'negative'
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  contextTags: string[]
  previousActions: ActionResult[]
}

/**
 * AI Service Configuration
 * AIサービス設定
 */
export interface AIServiceConfig {
  provider: 'claude' | 'gpt' | 'gemini' | 'local'
  model: string
  apiKey?: string
  baseUrl?: string
  maxTokens: number
  temperature: number
  customParameters: Record<string, any>
}

/**
 * Orchestrated Prompt for AI Services
 * AIサービス用オーケストレーションプロンプト
 */
export interface OrchestratedPrompt {
  id: string
  userId: string
  connectionId?: string
  aiProvider: string
  prompt: string
  metadata: {
    generatedAt: Date
    contextHash: string
    promptType: string
    urgency: 'low' | 'medium' | 'high' | 'critical'
    expectedOutputFormat: 'text' | 'json' | 'structured'
  }
  personalizationFactors: {
    emotionalTone: number
    directnessLevel: number
    creativityLevel: number
    detailLevel: number
  }
}

/**
 * AI Response Processing Result
 * AI応答処理結果
 */
export interface ActionResult {
  id: string
  promptId: string
  aiProvider: string
  response: string
  structuredData?: Record<string, any>
  confidence: number
  processingTime: number
  feedback?: {
    userRating: number
    effectiveness: 'poor' | 'average' | 'good' | 'excellent'
    notes?: string
  }
  createdAt: Date
}

/**
 * Learning Metrics for System Optimization
 * システム最適化用学習メトリクス
 */
export interface LearningMetrics {
  userId: string
  promptType: string
  aiProvider: string
  successRate: number
  averageRating: number
  usageFrequency: number
  contextSimilarity: number
  lastUpdated: Date
}

/**
 * Prompt Orchestrator Core Interface
 * プロンプトオーケストレーター コアインターフェース
 */
export interface IPromptOrchestrator {
  // Context Management
  updateUserContext(userId: string, updates: Partial<UserContext>): Promise<void>
  getUserContext(userId: string): Promise<UserContext>
  createSessionContext(userId: string, intent: string): Promise<SessionContext>
  
  // Dynamic Prompt Generation
  generatePrompt(sessionContext: SessionContext, connection?: Connection): Promise<OrchestratedPrompt>
  personalizePrompt(basePrompt: string, userContext: UserContext, sessionContext: SessionContext): Promise<string>
  
  // AI Service Orchestration
  executePrompt(prompt: OrchestratedPrompt, aiConfig: AIServiceConfig): Promise<ActionResult>
  processAIResponse(response: string, expectedFormat: string): Promise<Record<string, any>>
  
  // Learning & Optimization
  recordFeedback(resultId: string, feedback: ActionResult['feedback']): Promise<void>
  optimizeForUser(userId: string): Promise<LearningMetrics[]>
  
  // Cross-Platform State Management
  syncContextAcrossAI(userId: string, aiProviders: string[]): Promise<void>
  getOptimalAIProvider(userContext: UserContext, promptType: string): Promise<string>
}

/**
 * Screenshot Processing Interface
 * スクリーンショット処理インターフェース
 */
export interface IScreenshotProcessor {
  processScreenshot(imageData: Blob | string): Promise<ScreenshotAnalysis>
  extractConversationData(analysis: ScreenshotAnalysis): Promise<ConversationData>
  updateConnectionFromScreenshot(connectionId: string, conversationData: ConversationData): Promise<Connection>
}

/**
 * Screenshot Analysis Result
 * スクリーンショット分析結果
 */
export interface ScreenshotAnalysis {
  id: string
  processedAt: Date
  imageMetadata: {
    source: 'ios' | 'android' | 'web' | 'unknown'
    app: 'line' | 'whatsapp' | 'instagram' | 'tinder' | 'bumble' | 'other'
    resolution: { width: number; height: number }
  }
  extractedText: string
  detectedElements: {
    messages: Array<{
      sender: 'user' | 'other'
      content: string
      timestamp?: string
      type: 'text' | 'image' | 'emoji' | 'sticker'
    }>
    uiElements: Array<{
      type: 'button' | 'input' | 'avatar' | 'status'
      text?: string
      position: { x: number; y: number; width: number; height: number }
    }>
  }
  confidence: number
  processingTime: number
}

/**
 * Conversation Data for Context Updates
 * コンテキスト更新用会話データ
 */
export interface ConversationData {
  lastMessage: {
    content: string
    sender: 'user' | 'other'
    timestamp: Date
    sentiment: 'positive' | 'neutral' | 'negative'
  }
  conversationFlow: {
    responseTime: string
    messageFrequency: 'increasing' | 'stable' | 'decreasing'
    topicProgression: string[]
    emotionalTone: string
  }
  contextUpdates: {
    currentStage?: string
    newHobbies?: string[]
    updatedFeelings?: {
      attractivePoints?: string[]
      concerns?: string[]
    }
    communicationChanges?: {
      style?: string
      frequency?: string
      responseTime?: string
    }
  }
}
import { 
  IScreenshotProcessor,
  ScreenshotAnalysis,
  ConversationData 
} from '@/lib/domain/interfaces/IPromptOrchestrator'
import { Connection } from '@/types'
import { AIServiceAdapterManager } from '@/lib/infrastructure/adapters/AIServiceAdapter'

/**
 * Screenshot Processor Service
 * スクリーンショット処理サービス
 * 
 * Processes dating app screenshots to extract conversation data
 * and automatically update connection information
 */
export class ScreenshotProcessor implements IScreenshotProcessor {
  private aiManager: AIServiceAdapterManager
  private visionModel: string = 'gpt-4-vision-preview' // Model with vision capabilities

  constructor(aiManager: AIServiceAdapterManager) {
    this.aiManager = aiManager
  }

  /**
   * Process screenshot and extract conversation data
   * スクリーンショットを処理し、会話データを抽出
   */
  async processScreenshot(imageData: Blob | string): Promise<ScreenshotAnalysis> {
    const startTime = Date.now()
    
    try {
      // Convert image data to base64 if needed
      const base64Image = await this.convertToBase64(imageData)
      
      // Detect source app and platform
      const metadata = await this.detectImageMetadata(base64Image)
      
      // Extract text and UI elements using vision AI
      const extractionResult = await this.extractWithVisionAI(base64Image, metadata)
      
      // Parse extracted content into structured format
      const structuredData = this.parseExtractedContent(extractionResult, metadata)
      
      const analysis: ScreenshotAnalysis = {
        id: `screenshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        processedAt: new Date(),
        imageMetadata: metadata,
        extractedText: extractionResult.text,
        detectedElements: structuredData,
        confidence: extractionResult.confidence,
        processingTime: Date.now() - startTime
      }

      return analysis
    } catch (error) {
      throw new Error(`Screenshot processing failed: ${error}`)
    }
  }

  /**
   * Extract conversation data from screenshot analysis
   * スクリーンショット分析から会話データを抽出
   */
  async extractConversationData(analysis: ScreenshotAnalysis): Promise<ConversationData> {
    const messages = analysis.detectedElements.messages
    
    if (messages.length === 0) {
      throw new Error('No messages found in screenshot')
    }

    // Get the most recent message
    const lastMessage = messages[messages.length - 1]
    
    // Analyze conversation flow
    const conversationFlow = this.analyzeConversationFlow(messages)
    
    // Determine context updates needed
    const contextUpdates = await this.generateContextUpdates(messages, analysis)
    
    return {
      lastMessage: {
        content: lastMessage.content,
        sender: lastMessage.sender,
        timestamp: this.parseTimestamp(lastMessage.timestamp),
        sentiment: await this.analyzeSentiment(lastMessage.content)
      },
      conversationFlow,
      contextUpdates
    }
  }

  /**
   * Update connection based on screenshot data
   * スクリーンショットデータに基づいて接続を更新
   */
  async updateConnectionFromScreenshot(
    connectionId: string, 
    conversationData: ConversationData
  ): Promise<Connection> {
    // This would integrate with your connection repository
    // For now, we'll return a mock updated connection
    
    const updates: Partial<Connection> = {
      updated_at: new Date().toISOString()
    }

    // Update communication data
    if (conversationData.contextUpdates.communicationChanges) {
      updates.communication = {
        ...updates.communication,
        lastContact: conversationData.lastMessage.timestamp.toISOString(),
        frequency: conversationData.contextUpdates.communicationChanges.frequency || updates.communication?.frequency,
        responseTime: conversationData.contextUpdates.communicationChanges.responseTime || updates.communication?.responseTime,
        communicationStyle: conversationData.contextUpdates.communicationChanges.style || updates.communication?.communicationStyle
      }
    }

    // Update stage if detected
    if (conversationData.contextUpdates.currentStage) {
      updates.current_stage = conversationData.contextUpdates.currentStage as any
    }

    // Update hobbies if new ones detected
    if (conversationData.contextUpdates.newHobbies) {
      updates.basic_info = {
        ...updates.basic_info,
        hobbies: [...(updates.basic_info?.hobbies || []), ...conversationData.contextUpdates.newHobbies]
      }
    }

    // Update feelings if detected
    if (conversationData.contextUpdates.updatedFeelings) {
      updates.user_feelings = {
        ...updates.user_feelings,
        attractivePoints: conversationData.contextUpdates.updatedFeelings.attractivePoints || updates.user_feelings?.attractivePoints,
        concerns: conversationData.contextUpdates.updatedFeelings.concerns || updates.user_feelings?.concerns
      }
    }

    // Return mock updated connection (would be actual database update in production)
    return {
      id: connectionId,
      user_id: 'user-123',
      nickname: 'Updated Connection',
      platform: 'Auto-detected',
      current_stage: 'メッセージ中',
      basic_info: {},
      communication: {},
      user_feelings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates
    } as Connection
  }

  // Private helper methods

  private async convertToBase64(imageData: Blob | string): Promise<string> {
    if (typeof imageData === 'string') {
      return imageData
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix if present
        const base64 = result.includes(',') ? result.split(',')[1] : result
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(imageData)
    })
  }

  private async detectImageMetadata(base64Image: string): Promise<ScreenshotAnalysis['imageMetadata']> {
    // Analyze image to detect source and platform
    // This would use computer vision to identify UI patterns
    
    // For demo, return mock metadata
    return {
      source: 'ios',
      app: 'line',
      resolution: { width: 375, height: 812 }
    }
  }

  private async extractWithVisionAI(
    base64Image: string, 
    metadata: ScreenshotAnalysis['imageMetadata']
  ): Promise<{ text: string; confidence: number }> {
    try {
      // Create vision prompt tailored to detected app
      const prompt = this.createVisionPrompt(metadata.app)
      
      // Use vision-capable AI model
      const response = await this.aiManager.generateResponse('gpt', `${prompt}\n\nImage: data:image/jpeg;base64,${base64Image}`)
      
      return {
        text: response.content,
        confidence: 0.85 // Would be calculated based on response quality
      }
    } catch (error) {
      throw new Error(`Vision AI extraction failed: ${error}`)
    }
  }

  private createVisionPrompt(app: string): string {
    const appSpecificInstructions = {
      line: `
        This is a LINE messenger screenshot. Please extract:
        1. All visible messages with sender identification (user vs other)
        2. Timestamps if visible
        3. Message types (text, sticker, emoji, image)
        4. Any UI elements like buttons or status indicators
        
        Format the response as JSON with this structure:
        {
          "messages": [{"sender": "user|other", "content": "text", "timestamp": "if visible", "type": "text|emoji|sticker|image"}],
          "uiElements": [{"type": "button|input|status", "text": "if any", "position": "describe location"}]
        }
      `,
      whatsapp: `
        This is a WhatsApp screenshot. Please extract:
        1. All messages with sender names and content
        2. Timestamps and read receipts
        3. Message status (sent, delivered, read)
        4. Any media messages or voice notes
      `,
      tinder: `
        This is a Tinder conversation screenshot. Please extract:
        1. Messages from both users
        2. Profile information if visible
        3. Match information
        4. Any buttons or action elements
      `,
      other: `
        This appears to be a dating/messaging app screenshot. Please extract:
        1. All visible messages and conversation content
        2. User interface elements
        3. Any timestamps or status information
        4. Profile or contact information if visible
      `
    }

    return appSpecificInstructions[app] || appSpecificInstructions.other
  }

  private parseExtractedContent(
    extractionResult: { text: string; confidence: number },
    metadata: ScreenshotAnalysis['imageMetadata']
  ): ScreenshotAnalysis['detectedElements'] {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(extractionResult.text)
      return {
        messages: parsed.messages || [],
        uiElements: parsed.uiElements || []
      }
    } catch {
      // Fallback to text parsing
      return this.parseTextContent(extractionResult.text, metadata)
    }
  }

  private parseTextContent(
    text: string,
    metadata: ScreenshotAnalysis['imageMetadata']
  ): ScreenshotAnalysis['detectedElements'] {
    const lines = text.split('\n').filter(line => line.trim())
    const messages: ScreenshotAnalysis['detectedElements']['messages'] = []
    const uiElements: ScreenshotAnalysis['detectedElements']['uiElements'] = []

    for (const line of lines) {
      // Simple pattern matching for common message formats
      if (line.includes(':') && !line.includes('Button') && !line.includes('Input')) {
        const [sender, content] = line.split(':').map(s => s.trim())
        messages.push({
          sender: sender.toLowerCase().includes('you') ? 'user' : 'other',
          content: content,
          type: 'text'
        })
      } else if (line.includes('Button') || line.includes('Input')) {
        uiElements.push({
          type: line.toLowerCase().includes('button') ? 'button' : 'input',
          text: line,
          position: { x: 0, y: 0, width: 0, height: 0 }
        })
      }
    }

    return { messages, uiElements }
  }

  private analyzeConversationFlow(
    messages: ScreenshotAnalysis['detectedElements']['messages']
  ): ConversationData['conversationFlow'] {
    if (messages.length === 0) {
      return {
        responseTime: 'unknown',
        messageFrequency: 'stable',
        topicProgression: [],
        emotionalTone: 'neutral'
      }
    }

    // Analyze response patterns
    const userMessages = messages.filter(m => m.sender === 'user')
    const otherMessages = messages.filter(m => m.sender === 'other')
    
    // Determine frequency trend
    const messageFrequency = this.determineFrequencyTrend(messages)
    
    // Extract topic progression
    const topicProgression = this.extractTopics(messages)
    
    // Analyze emotional tone
    const emotionalTone = this.analyzeEmotionalTone(messages)

    return {
      responseTime: 'moderate', // Would be calculated from timestamps
      messageFrequency,
      topicProgression,
      emotionalTone
    }
  }

  private determineFrequencyTrend(
    messages: ScreenshotAnalysis['detectedElements']['messages']
  ): 'increasing' | 'stable' | 'decreasing' {
    // Simple analysis based on message count ratio
    if (messages.length > 10) return 'increasing'
    if (messages.length > 5) return 'stable'
    return 'decreasing'
  }

  private extractTopics(
    messages: ScreenshotAnalysis['detectedElements']['messages']
  ): string[] {
    const topics: string[] = []
    const content = messages.map(m => m.content).join(' ')
    
    // Simple keyword extraction
    if (content.includes('date') || content.includes('meet')) topics.push('dating')
    if (content.includes('hobby') || content.includes('interest')) topics.push('hobbies')
    if (content.includes('work') || content.includes('job')) topics.push('work')
    if (content.includes('movie') || content.includes('music')) topics.push('entertainment')
    
    return topics
  }

  private analyzeEmotionalTone(
    messages: ScreenshotAnalysis['detectedElements']['messages']
  ): string {
    const content = messages.map(m => m.content).join(' ').toLowerCase()
    
    // Simple sentiment analysis
    const positiveWords = ['happy', 'great', 'love', 'awesome', 'good', '😊', '😄', '❤️']
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', '😢', '😞']
    
    const positiveCount = positiveWords.reduce((count, word) => 
      count + (content.split(word).length - 1), 0)
    const negativeCount = negativeWords.reduce((count, word) => 
      count + (content.split(word).length - 1), 0)
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  private async generateContextUpdates(
    messages: ScreenshotAnalysis['detectedElements']['messages'],
    analysis: ScreenshotAnalysis
  ): Promise<ConversationData['contextUpdates']> {
    const content = messages.map(m => m.content).join(' ')
    
    // Use AI to analyze context updates needed
    const prompt = `
      Analyze this conversation and suggest updates to a dating connection profile:
      
      Conversation: ${content}
      
      Please identify:
      1. Any new hobbies or interests mentioned
      2. Changes in communication style or frequency
      3. Relationship stage progression indicators
      4. New attractive points or concerns
      
      Respond in JSON format:
      {
        "currentStage": "stage if changed",
        "newHobbies": ["hobby1", "hobby2"],
        "updatedFeelings": {
          "attractivePoints": ["point1"],
          "concerns": ["concern1"]
        },
        "communicationChanges": {
          "style": "new style",
          "frequency": "new frequency"
        }
      }
    `

    try {
      const response = await this.aiManager.generateResponse('gpt', prompt)
      return JSON.parse(response.content)
    } catch {
      // Return empty updates if analysis fails
      return {}
    }
  }

  private parseTimestamp(timestamp?: string): Date {
    if (!timestamp) return new Date()
    
    try {
      return new Date(timestamp)
    } catch {
      return new Date()
    }
  }

  private async analyzeSentiment(content: string): Promise<'positive' | 'neutral' | 'negative'> {
    // Simple sentiment analysis
    const positiveWords = ['love', 'great', 'awesome', 'happy', 'good', 'nice', 'wonderful']
    const negativeWords = ['hate', 'terrible', 'awful', 'sad', 'bad', 'boring', 'annoying']
    
    const lowerContent = content.toLowerCase()
    const positiveCount = positiveWords.reduce((count, word) => 
      count + (lowerContent.includes(word) ? 1 : 0), 0)
    const negativeCount = negativeWords.reduce((count, word) => 
      count + (lowerContent.includes(word) ? 1 : 0), 0)
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }
}
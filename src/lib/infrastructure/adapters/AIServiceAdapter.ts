import { AIServiceConfig, ActionResult } from '@/lib/domain/interfaces/IPromptOrchestrator'

/**
 * AI Service Response Interface
 * AIサービス応答インターフェース
 */
export interface AIServiceResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  finishReason: 'stop' | 'length' | 'content_filter' | 'error'
  metadata?: Record<string, any>
}

/**
 * Base AI Service Adapter
 * ベースAIサービスアダプター
 */
export abstract class BaseAIServiceAdapter {
  protected config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.config = config
  }

  abstract generateResponse(prompt: string): Promise<AIServiceResponse>
  abstract validateConfig(): boolean
  abstract getProviderName(): string
}

/**
 * Claude (Anthropic) Service Adapter
 * Claude (Anthropic) サービスアダプター
 */
export class ClaudeServiceAdapter extends BaseAIServiceAdapter {
  getProviderName(): string {
    return 'claude'
  }

  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.model)
  }

  async generateResponse(prompt: string): Promise<AIServiceResponse> {
    if (!this.validateConfig()) {
      throw new Error('Claude API key or model not configured')
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          ...this.config.customParameters
        })
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        content: data.content[0].text,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens
        },
        model: data.model,
        finishReason: data.stop_reason === 'end_turn' ? 'stop' : 'error',
        metadata: {
          messageId: data.id,
          role: data.role
        }
      }
    } catch (error) {
      throw new Error(`Failed to generate Claude response: ${error}`)
    }
  }
}

/**
 * OpenAI GPT Service Adapter
 * OpenAI GPT サービスアダプター
 */
export class OpenAIServiceAdapter extends BaseAIServiceAdapter {
  getProviderName(): string {
    return 'gpt'
  }

  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.model)
  }

  async generateResponse(prompt: string): Promise<AIServiceResponse> {
    if (!this.validateConfig()) {
      throw new Error('OpenAI API key or model not configured')
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          ...this.config.customParameters
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        },
        model: data.model,
        finishReason: data.choices[0].finish_reason,
        metadata: {
          messageId: data.id,
          created: data.created
        }
      }
    } catch (error) {
      throw new Error(`Failed to generate OpenAI response: ${error}`)
    }
  }
}

/**
 * Google Gemini Service Adapter
 * Google Gemini サービスアダプター
 */
export class GeminiServiceAdapter extends BaseAIServiceAdapter {
  getProviderName(): string {
    return 'gemini'
  }

  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.model)
  }

  async generateResponse(prompt: string): Promise<AIServiceResponse> {
    if (!this.validateConfig()) {
      throw new Error('Gemini API key or model not configured')
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: this.config.temperature,
              maxOutputTokens: this.config.maxTokens,
              ...this.config.customParameters
            }
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API')
      }

      const candidate = data.candidates[0]
      
      return {
        content: candidate.content.parts[0].text,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0
        },
        model: this.config.model,
        finishReason: candidate.finishReason === 'STOP' ? 'stop' : 'error',
        metadata: {
          safetyRatings: candidate.safetyRatings
        }
      }
    } catch (error) {
      throw new Error(`Failed to generate Gemini response: ${error}`)
    }
  }
}

/**
 * AI Service Adapter Manager
 * AIサービスアダプターマネージャー
 */
export class AIServiceAdapterManager {
  private adapters = new Map<string, BaseAIServiceAdapter>()
  private defaultConfigs = new Map<string, Partial<AIServiceConfig>>()

  constructor() {
    // Set up default configurations
    this.defaultConfigs.set('claude', {
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4000,
      temperature: 0.7
    })

    this.defaultConfigs.set('gpt', {
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7
    })

    this.defaultConfigs.set('gemini', {
      model: 'gemini-pro',
      maxTokens: 4000,
      temperature: 0.7
    })
  }

  /**
   * Register AI service adapter
   * AIサービスアダプターを登録
   */
  registerAdapter(provider: string, config: AIServiceConfig): void {
    const defaultConfig = this.defaultConfigs.get(provider) || {}
    const mergedConfig = { ...defaultConfig, ...config }

    let adapter: BaseAIServiceAdapter

    switch (provider) {
      case 'claude':
        adapter = new ClaudeServiceAdapter(mergedConfig as AIServiceConfig)
        break
      case 'gpt':
        adapter = new OpenAIServiceAdapter(mergedConfig as AIServiceConfig)
        break
      case 'gemini':
        adapter = new GeminiServiceAdapter(mergedConfig as AIServiceConfig)
        break
      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }

    if (!adapter.validateConfig()) {
      throw new Error(`Invalid configuration for ${provider}`)
    }

    this.adapters.set(provider, adapter)
  }

  /**
   * Generate response using specified provider
   * 指定されたプロバイダーを使用して応答を生成
   */
  async generateResponse(provider: string, prompt: string): Promise<AIServiceResponse> {
    const adapter = this.adapters.get(provider)
    if (!adapter) {
      throw new Error(`AI adapter for ${provider} not found. Please register it first.`)
    }

    return await adapter.generateResponse(prompt)
  }

  /**
   * Get available providers
   * 利用可能なプロバイダーを取得
   */
  getAvailableProviders(): string[] {
    return Array.from(this.adapters.keys())
  }

  /**
   * Check if provider is available
   * プロバイダーが利用可能かチェック
   */
  isProviderAvailable(provider: string): boolean {
    return this.adapters.has(provider)
  }

  /**
   * Update adapter configuration
   * アダプター設定を更新
   */
  updateAdapterConfig(provider: string, updates: Partial<AIServiceConfig>): void {
    const adapter = this.adapters.get(provider)
    if (!adapter) {
      throw new Error(`AI adapter for ${provider} not found`)
    }

    // Merge with existing config
    const currentConfig = (adapter as any).config
    const newConfig = { ...currentConfig, ...updates }
    
    // Re-register with updated config
    this.registerAdapter(provider, newConfig)
  }

  /**
   * Test connection to AI service
   * AIサービスへの接続をテスト
   */
  async testConnection(provider: string): Promise<boolean> {
    try {
      const testPrompt = "Hello, this is a test message. Please respond with 'Test successful'."
      const response = await this.generateResponse(provider, testPrompt)
      return response.content.toLowerCase().includes('test successful')
    } catch (error) {
      console.error(`Connection test failed for ${provider}:`, error)
      return false
    }
  }

  /**
   * Get provider health status
   * プロバイダーのヘルス状況を取得
   */
  async getProviderHealth(): Promise<Record<string, { available: boolean; latency?: number; error?: string }>> {
    const health: Record<string, { available: boolean; latency?: number; error?: string }> = {}

    for (const provider of this.getAvailableProviders()) {
      const startTime = Date.now()
      try {
        const isHealthy = await this.testConnection(provider)
        health[provider] = {
          available: isHealthy,
          latency: Date.now() - startTime
        }
      } catch (error) {
        health[provider] = {
          available: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    return health
  }
}

/**
 * Singleton instance for global use
 * グローバル使用用のシングルトンインスタンス
 */
export const aiServiceManager = new AIServiceAdapterManager()
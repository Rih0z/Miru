import { 
  ClaudeServiceAdapter,
  OpenAIServiceAdapter,
  GeminiServiceAdapter,
  AIServiceAdapterManager
} from '@/lib/infrastructure/adapters/AIServiceAdapter'
import { AIServiceConfig } from '@/lib/domain/interfaces/IPromptOrchestrator'

// Mock fetch globally
global.fetch = jest.fn()

describe('AIServiceAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ClaudeServiceAdapter', () => {
    let adapter: ClaudeServiceAdapter
    let config: AIServiceConfig

    beforeEach(() => {
      config = {
        provider: 'claude',
        model: 'claude-3-sonnet-20240229',
        apiKey: 'test-api-key',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }
      adapter = new ClaudeServiceAdapter(config)
    })

    it('should validate configuration correctly', () => {
      expect(adapter.validateConfig()).toBe(true)
      
      const invalidAdapter = new ClaudeServiceAdapter({ ...config, apiKey: undefined })
      expect(invalidAdapter.validateConfig()).toBe(false)
    })

    it('should generate response successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          content: [{ text: 'Claude response text' }],
          usage: {
            input_tokens: 100,
            output_tokens: 200
          },
          model: 'claude-3-sonnet-20240229',
          stop_reason: 'end_turn',
          id: 'msg_123',
          role: 'assistant'
        })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await adapter.generateResponse('Test prompt')

      expect(result).toEqual({
        content: 'Claude response text',
        usage: {
          promptTokens: 100,
          completionTokens: 200,
          totalTokens: 300
        },
        model: 'claude-3-sonnet-20240229',
        finishReason: 'stop',
        metadata: {
          messageId: 'msg_123',
          role: 'assistant'
        }
      })

      expect(global.fetch).toHaveBeenCalledWith('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-api-key',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: 'Test prompt'
            }
          ]
        })
      })
    })

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await expect(adapter.generateResponse('Test prompt'))
        .rejects.toThrow('Claude API error: 400 Bad Request')
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(adapter.generateResponse('Test prompt'))
        .rejects.toThrow('Failed to generate Claude response: Error: Network error')
    })
  })

  describe('OpenAIServiceAdapter', () => {
    let adapter: OpenAIServiceAdapter
    let config: AIServiceConfig

    beforeEach(() => {
      config = {
        provider: 'gpt',
        model: 'gpt-4',
        apiKey: 'test-api-key',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }
      adapter = new OpenAIServiceAdapter(config)
    })

    it('should generate response successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{
            message: { content: 'GPT response text' },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 200,
            total_tokens: 300
          },
          model: 'gpt-4',
          id: 'chatcmpl-123',
          created: 1234567890
        })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await adapter.generateResponse('Test prompt')

      expect(result).toEqual({
        content: 'GPT response text',
        usage: {
          promptTokens: 100,
          completionTokens: 200,
          totalTokens: 300
        },
        model: 'gpt-4',
        finishReason: 'stop',
        metadata: {
          messageId: 'chatcmpl-123',
          created: 1234567890
        }
      })

      expect(global.fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: 'Test prompt'
            }
          ],
          max_tokens: 4000,
          temperature: 0.7
        })
      })
    })
  })

  describe('GeminiServiceAdapter', () => {
    let adapter: GeminiServiceAdapter
    let config: AIServiceConfig

    beforeEach(() => {
      config = {
        provider: 'gemini',
        model: 'gemini-pro',
        apiKey: 'test-api-key',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }
      adapter = new GeminiServiceAdapter(config)
    })

    it('should generate response successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{ text: 'Gemini response text' }]
            },
            finishReason: 'STOP',
            safetyRatings: []
          }],
          usageMetadata: {
            promptTokenCount: 100,
            candidatesTokenCount: 200,
            totalTokenCount: 300
          }
        })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await adapter.generateResponse('Test prompt')

      expect(result).toEqual({
        content: 'Gemini response text',
        usage: {
          promptTokens: 100,
          completionTokens: 200,
          totalTokens: 300
        },
        model: 'gemini-pro',
        finishReason: 'stop',
        metadata: {
          safetyRatings: []
        }
      })
    })

    it('should handle no candidates response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: []
        })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await expect(adapter.generateResponse('Test prompt'))
        .rejects.toThrow('No response from Gemini API')
    })
  })

  describe('AIServiceAdapterManager', () => {
    let manager: AIServiceAdapterManager

    beforeEach(() => {
      manager = new AIServiceAdapterManager()
    })

    it('should register Claude adapter successfully', () => {
      const config: AIServiceConfig = {
        provider: 'claude',
        model: 'claude-3-sonnet-20240229',
        apiKey: 'test-key',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      expect(() => manager.registerAdapter('claude', config)).not.toThrow()
      expect(manager.isProviderAvailable('claude')).toBe(true)
    })

    it('should register GPT adapter successfully', () => {
      const config: AIServiceConfig = {
        provider: 'gpt',
        model: 'gpt-4',
        apiKey: 'test-key',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      expect(() => manager.registerAdapter('gpt', config)).not.toThrow()
      expect(manager.isProviderAvailable('gpt')).toBe(true)
    })

    it('should register Gemini adapter successfully', () => {
      const config: AIServiceConfig = {
        provider: 'gemini',
        model: 'gemini-pro',
        apiKey: 'test-key',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      expect(() => manager.registerAdapter('gemini', config)).not.toThrow()
      expect(manager.isProviderAvailable('gemini')).toBe(true)
    })

    it('should throw error for unsupported provider', () => {
      const config: AIServiceConfig = {
        provider: 'unknown',
        model: 'unknown-model',
        apiKey: 'test-key',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      expect(() => manager.registerAdapter('unknown', config))
        .toThrow('Unsupported AI provider: unknown')
    })

    it('should throw error for invalid configuration', () => {
      const invalidConfig: AIServiceConfig = {
        provider: 'claude',
        model: 'claude-3-sonnet-20240229',
        // Missing apiKey
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      expect(() => manager.registerAdapter('claude', invalidConfig))
        .toThrow('Invalid configuration for claude')
    })

    it('should generate response with registered adapter', async () => {
      const config: AIServiceConfig = {
        provider: 'claude',
        model: 'claude-3-sonnet-20240229',
        apiKey: 'test-key',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      manager.registerAdapter('claude', config)

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          content: [{ text: 'Test response' }],
          usage: { input_tokens: 10, output_tokens: 20 },
          model: 'claude-3-sonnet-20240229',
          stop_reason: 'end_turn',
          id: 'msg_123',
          role: 'assistant'
        })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await manager.generateResponse('claude', 'Test prompt')

      expect(result.content).toBe('Test response')
    })

    it('should throw error for unregistered adapter', async () => {
      await expect(manager.generateResponse('unregistered', 'Test prompt'))
        .rejects.toThrow('AI adapter for unregistered not found. Please register it first.')
    })

    it('should return available providers', () => {
      const config: AIServiceConfig = {
        provider: 'claude',
        model: 'claude-3-sonnet-20240229',
        apiKey: 'test-key',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      manager.registerAdapter('claude', config)
      manager.registerAdapter('gpt', { ...config, provider: 'gpt', model: 'gpt-4' })

      const providers = manager.getAvailableProviders()
      expect(providers).toContain('claude')
      expect(providers).toContain('gpt')
    })

    it('should update adapter configuration', () => {
      const config: AIServiceConfig = {
        provider: 'claude',
        model: 'claude-3-sonnet-20240229',
        apiKey: 'test-key',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      manager.registerAdapter('claude', config)
      
      expect(() => manager.updateAdapterConfig('claude', { temperature: 0.9 }))
        .not.toThrow()
    })

    it('should throw error updating non-existent adapter', () => {
      expect(() => manager.updateAdapterConfig('nonexistent', { temperature: 0.9 }))
        .toThrow('AI adapter for nonexistent not found')
    })

    it('should test connection successfully', async () => {
      const config: AIServiceConfig = {
        provider: 'claude',
        model: 'claude-3-sonnet-20240229',
        apiKey: 'test-key',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      manager.registerAdapter('claude', config)

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          content: [{ text: 'Test successful' }],
          usage: { input_tokens: 10, output_tokens: 20 },
          model: 'claude-3-sonnet-20240229',
          stop_reason: 'end_turn',
          id: 'msg_123',
          role: 'assistant'
        })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const isHealthy = await manager.testConnection('claude')
      expect(isHealthy).toBe(true)
    })

    it('should return provider health status', async () => {
      const config: AIServiceConfig = {
        provider: 'claude',
        model: 'claude-3-sonnet-20240229',
        apiKey: 'test-key',
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      manager.registerAdapter('claude', config)

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          content: [{ text: 'Test successful' }],
          usage: { input_tokens: 10, output_tokens: 20 },
          model: 'claude-3-sonnet-20240229',
          stop_reason: 'end_turn',
          id: 'msg_123',
          role: 'assistant'
        })
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const health = await manager.getProviderHealth()
      
      expect(health).toHaveProperty('claude')
      expect(health.claude.available).toBe(true)
      expect(health.claude.latency).toBeGreaterThanOrEqual(0)
    })
  })
})
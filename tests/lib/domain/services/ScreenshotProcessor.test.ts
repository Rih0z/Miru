import { ScreenshotProcessor } from '@/lib/domain/services/ScreenshotProcessor'
import { AIServiceAdapterManager } from '@/lib/infrastructure/adapters/AIServiceAdapter'
import { ScreenshotAnalysis, ConversationData } from '@/lib/domain/interfaces/IPromptOrchestrator'

// Mock AIServiceAdapterManager
jest.mock('@/lib/infrastructure/adapters/AIServiceAdapter')

describe('ScreenshotProcessor', () => {
  let processor: ScreenshotProcessor
  let mockAIManager: jest.Mocked<AIServiceAdapterManager>

  beforeEach(() => {
    mockAIManager = {
      generateResponse: jest.fn(),
      registerAdapter: jest.fn(),
      getAvailableProviders: jest.fn(),
      isProviderAvailable: jest.fn(),
      updateAdapterConfig: jest.fn(),
      testConnection: jest.fn(),
      getProviderHealth: jest.fn()
    } as any

    processor = new ScreenshotProcessor(mockAIManager)
  })

  describe('processScreenshot', () => {
    it('should process blob image data', async () => {
      const mockBlob = new Blob(['fake image data'], { type: 'image/png' })
      
      // Mock the private methods
      jest.spyOn(processor as any, 'convertToBase64').mockResolvedValue('base64string')
      jest.spyOn(processor as any, 'detectImageMetadata').mockResolvedValue({
        source: 'ios',
        app: 'line',
        resolution: { width: 375, height: 812 }
      })
      jest.spyOn(processor as any, 'extractWithVisionAI').mockResolvedValue({
        text: 'Extracted text content',
        confidence: 0.85
      })
      jest.spyOn(processor as any, 'parseExtractedContent').mockReturnValue({
        messages: [
          { sender: 'user', content: 'Hello', type: 'text' },
          { sender: 'other', content: 'Hi there!', type: 'text' }
        ],
        uiElements: [
          { type: 'button', text: 'Send', position: { x: 0, y: 0, width: 50, height: 30 } }
        ]
      })

      const result = await processor.processScreenshot(mockBlob)

      expect(result.id).toMatch(/^screenshot_\d+_[a-z0-9]+$/)
      expect(result.processedAt).toBeInstanceOf(Date)
      expect(result.imageMetadata.source).toBe('ios')
      expect(result.imageMetadata.app).toBe('line')
      expect(result.extractedText).toBe('Extracted text content')
      expect(result.detectedElements.messages).toHaveLength(2)
      expect(result.detectedElements.uiElements).toHaveLength(1)
      expect(result.confidence).toBe(0.85)
      expect(result.processingTime).toBeGreaterThanOrEqual(0)
    })

    it('should process base64 string data', async () => {
      const base64String = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      
      jest.spyOn(processor as any, 'convertToBase64').mockResolvedValue('base64string')
      jest.spyOn(processor as any, 'detectImageMetadata').mockResolvedValue({
        source: 'android',
        app: 'whatsapp',
        resolution: { width: 360, height: 640 }
      })
      jest.spyOn(processor as any, 'extractWithVisionAI').mockResolvedValue({
        text: 'WhatsApp conversation',
        confidence: 0.9
      })
      jest.spyOn(processor as any, 'parseExtractedContent').mockReturnValue({
        messages: [],
        uiElements: []
      })

      const result = await processor.processScreenshot(base64String)

      expect(result.imageMetadata.source).toBe('android')
      expect(result.imageMetadata.app).toBe('whatsapp')
    })

    it('should handle processing errors', async () => {
      const mockBlob = new Blob(['fake image data'], { type: 'image/png' })
      
      jest.spyOn(processor as any, 'convertToBase64').mockRejectedValue(new Error('Conversion failed'))

      await expect(processor.processScreenshot(mockBlob))
        .rejects.toThrow('Screenshot processing failed: Error: Conversion failed')
    })
  })

  describe('extractConversationData', () => {
    it('should extract conversation data from analysis', async () => {
      const mockAnalysis: ScreenshotAnalysis = {
        id: 'analysis-1',
        processedAt: new Date(),
        imageMetadata: {
          source: 'ios',
          app: 'line',
          resolution: { width: 375, height: 812 }
        },
        extractedText: 'Conversation text',
        detectedElements: {
          messages: [
            { sender: 'user', content: 'Hey! Want to grab coffee?', timestamp: '10:30', type: 'text' },
            { sender: 'other', content: 'Yes! I love coffee ☕', timestamp: '10:32', type: 'text' }
          ],
          uiElements: []
        },
        confidence: 0.85,
        processingTime: 1500
      }

      jest.spyOn(processor as any, 'analyzeConversationFlow').mockReturnValue({
        responseTime: 'fast',
        messageFrequency: 'increasing',
        topicProgression: ['dating', 'hobbies'],
        emotionalTone: 'positive'
      })
      jest.spyOn(processor as any, 'generateContextUpdates').mockResolvedValue({
        currentStage: 'デート前',
        newHobbies: ['coffee'],
        communicationChanges: {
          style: 'friendly',
          frequency: 'daily'
        }
      })
      jest.spyOn(processor as any, 'analyzeSentiment').mockResolvedValue('positive')

      const result = await processor.extractConversationData(mockAnalysis)

      expect(result.lastMessage.content).toBe('Yes! I love coffee ☕')
      expect(result.lastMessage.sender).toBe('other')
      expect(result.lastMessage.sentiment).toBe('positive')
      expect(result.conversationFlow.messageFrequency).toBe('increasing')
      expect(result.conversationFlow.topicProgression).toContain('dating')
      expect(result.contextUpdates.currentStage).toBe('デート前')
      expect(result.contextUpdates.newHobbies).toContain('coffee')
    })

    it('should handle empty messages', async () => {
      const mockAnalysis: ScreenshotAnalysis = {
        id: 'analysis-1',
        processedAt: new Date(),
        imageMetadata: {
          source: 'ios',
          app: 'line',
          resolution: { width: 375, height: 812 }
        },
        extractedText: '',
        detectedElements: {
          messages: [],
          uiElements: []
        },
        confidence: 0.5,
        processingTime: 1000
      }

      await expect(processor.extractConversationData(mockAnalysis))
        .rejects.toThrow('No messages found in screenshot')
    })
  })

  describe('updateConnectionFromScreenshot', () => {
    it('should update connection with conversation data', async () => {
      const mockConversationData: ConversationData = {
        lastMessage: {
          content: 'See you at 7pm!',
          sender: 'other',
          timestamp: new Date(),
          sentiment: 'positive'
        },
        conversationFlow: {
          responseTime: 'fast',
          messageFrequency: 'stable',
          topicProgression: ['dating'],
          emotionalTone: 'positive'
        },
        contextUpdates: {
          currentStage: 'デート前',
          communicationChanges: {
            frequency: '毎日',
            responseTime: '即レス'
          },
          newHobbies: ['restaurant'],
          updatedFeelings: {
            attractivePoints: ['punctual'],
            concerns: []
          }
        }
      }

      const result = await processor.updateConnectionFromScreenshot('conn-123', mockConversationData)

      expect(result.id).toBe('conn-123')
      expect(result.current_stage).toBe('デート前')
      expect(result.communication?.frequency).toBe('毎日')
      expect(result.communication?.responseTime).toBe('即レス')
      expect(result.basic_info?.hobbies).toContain('restaurant')
      expect(result.user_feelings?.attractivePoints).toContain('punctual')
      expect(result.updated_at).toBeDefined()
    })

    it('should handle partial context updates', async () => {
      const mockConversationData: ConversationData = {
        lastMessage: {
          content: 'Thanks!',
          sender: 'other',
          timestamp: new Date(),
          sentiment: 'positive'
        },
        conversationFlow: {
          responseTime: 'moderate',
          messageFrequency: 'stable',
          topicProgression: [],
          emotionalTone: 'neutral'
        },
        contextUpdates: {} // No updates
      }

      const result = await processor.updateConnectionFromScreenshot('conn-456', mockConversationData)

      expect(result.id).toBe('conn-456')
      expect(result.updated_at).toBeDefined()
    })
  })

  describe('private helper methods', () => {
    describe('convertToBase64', () => {
      it('should convert blob to base64', async () => {
        const mockBlob = new Blob(['test'], { type: 'image/png' })
        
        // Mock FileReader
        const mockFileReader = {
          readAsDataURL: jest.fn(),
          result: 'data:image/png;base64,dGVzdA==',
          onload: null,
          onerror: null
        }
        
        // @ts-ignore
        global.FileReader = jest.fn(() => mockFileReader)

        const promise = (processor as any).convertToBase64(mockBlob)
        
        // Simulate successful read
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload(null as any)
          }
        }, 0)

        const result = await promise
        expect(result).toBe('dGVzdA==')
      })

      it('should return string as-is', async () => {
        const base64String = 'already-base64-string'
        const result = await (processor as any).convertToBase64(base64String)
        expect(result).toBe('already-base64-string')
      })
    })

    describe('detectImageMetadata', () => {
      it('should return mock metadata', async () => {
        const result = await (processor as any).detectImageMetadata('base64-image')
        
        expect(result).toEqual({
          source: 'ios',
          app: 'line',
          resolution: { width: 375, height: 812 }
        })
      })
    })

    describe('extractWithVisionAI', () => {
      it('should extract text using AI service', async () => {
        const mockMetadata = { source: 'ios', app: 'line', resolution: { width: 375, height: 812 } }
        
        mockAIManager.generateResponse.mockResolvedValue({
          content: '{"messages": [{"sender": "user", "content": "Hello"}], "uiElements": []}',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
          model: 'gpt-4-vision',
          finishReason: 'stop'
        })

        const result = await (processor as any).extractWithVisionAI('base64-image', mockMetadata)

        expect(result.text).toContain('messages')
        expect(result.confidence).toBe(0.85)
        expect(mockAIManager.generateResponse).toHaveBeenCalledWith('gpt', expect.stringContaining('LINE messenger screenshot'))
      })

      it('should handle AI service errors', async () => {
        const mockMetadata = { source: 'ios', app: 'line', resolution: { width: 375, height: 812 } }
        
        mockAIManager.generateResponse.mockRejectedValue(new Error('AI service error'))

        await expect((processor as any).extractWithVisionAI('base64-image', mockMetadata))
          .rejects.toThrow('Vision AI extraction failed: Error: AI service error')
      })
    })

    describe('parseExtractedContent', () => {
      it('should parse JSON response', () => {
        const extractionResult = {
          text: '{"messages": [{"sender": "user", "content": "Hello", "type": "text"}], "uiElements": [{"type": "button", "text": "Send"}]}',
          confidence: 0.8
        }
        const metadata = { source: 'ios', app: 'line', resolution: { width: 375, height: 812 } }

        const result = (processor as any).parseExtractedContent(extractionResult, metadata)

        expect(result.messages).toHaveLength(1)
        expect(result.messages[0].sender).toBe('user')
        expect(result.messages[0].content).toBe('Hello')
        expect(result.uiElements).toHaveLength(1)
        expect(result.uiElements[0].type).toBe('button')
      })

      it('should fallback to text parsing for invalid JSON', () => {
        const extractionResult = {
          text: 'You: Hello\nThem: Hi there!\nButton: Send',
          confidence: 0.7
        }
        const metadata = { source: 'ios', app: 'line', resolution: { width: 375, height: 812 } }

        jest.spyOn(processor as any, 'parseTextContent').mockReturnValue({
          messages: [
            { sender: 'user', content: 'Hello', type: 'text' },
            { sender: 'other', content: 'Hi there!', type: 'text' }
          ],
          uiElements: [
            { type: 'button', text: 'Send', position: { x: 0, y: 0, width: 0, height: 0 } }
          ]
        })

        const result = (processor as any).parseExtractedContent(extractionResult, metadata)

        expect(result.messages).toHaveLength(2)
        expect(result.uiElements).toHaveLength(1)
      })
    })

    describe('parseTextContent', () => {
      it('should parse text content with message patterns', () => {
        const text = 'You: Hello there!\nThem: Hi back!\nButton: Send Message\nInput: Type here'
        const metadata = { source: 'ios', app: 'line', resolution: { width: 375, height: 812 } }

        const result = (processor as any).parseTextContent(text, metadata)

        expect(result.messages).toHaveLength(2)
        expect(result.messages[0].sender).toBe('user')
        expect(result.messages[0].content).toBe('Hello there!')
        expect(result.messages[1].sender).toBe('other')
        expect(result.messages[1].content).toBe('Hi back!')
        expect(result.uiElements).toHaveLength(2)
        expect(result.uiElements[0].type).toBe('button')
        expect(result.uiElements[1].type).toBe('input')
      })

      it('should handle empty lines and filter them out', () => {
        const text = '\n\nYou: Message\n\n\nThem: Reply\n\n'
        const metadata = { source: 'ios', app: 'line', resolution: { width: 375, height: 812 } }

        const result = (processor as any).parseTextContent(text, metadata)

        expect(result.messages).toHaveLength(2)
      })

      it('should parse UI elements correctly', () => {
        const text = 'Send Button: Click here\nText Input: Enter message\nOther Button: Cancel'
        const metadata = { source: 'ios', app: 'line', resolution: { width: 375, height: 812 } }

        const result = (processor as any).parseTextContent(text, metadata)

        expect(result.uiElements).toHaveLength(3)
        expect(result.uiElements[0].type).toBe('button')
        expect(result.uiElements[1].type).toBe('input')
        expect(result.uiElements[2].type).toBe('button')
      })
    })

    describe('analyzeConversationFlow', () => {
      it('should analyze conversation patterns', () => {
        const messages = [
          { sender: 'user', content: 'Hey, want to watch a movie?', type: 'text' },
          { sender: 'other', content: 'Yes! I love movies', type: 'text' },
          { sender: 'user', content: 'Great! How about tonight?', type: 'text' }
        ]

        const result = (processor as any).analyzeConversationFlow(messages)

        expect(result.responseTime).toBe('moderate')
        expect(result.messageFrequency).toBe('decreasing')
        expect(result.topicProgression).toContain('entertainment')
        expect(result.emotionalTone).toBe('positive')
      })

      it('should handle empty messages', () => {
        const result = (processor as any).analyzeConversationFlow([])

        expect(result.responseTime).toBe('unknown')
        expect(result.messageFrequency).toBe('stable')
        expect(result.topicProgression).toEqual([])
        expect(result.emotionalTone).toBe('neutral')
      })
    })

    describe('analyzeEmotionalTone', () => {
      it('should return negative for negative content', () => {
        const messages = [
          { sender: 'user', content: 'This is terrible and awful 😢', type: 'text' },
          { sender: 'other', content: 'I hate this so much 😞', type: 'text' }
        ]

        const result = (processor as any).analyzeEmotionalTone(messages)

        expect(result).toBe('negative')
      })

      it('should return neutral for balanced content', () => {
        const messages = [
          { sender: 'user', content: 'This is okay I guess', type: 'text' },
          { sender: 'other', content: 'Just a normal conversation', type: 'text' }
        ]

        const result = (processor as any).analyzeEmotionalTone(messages)

        expect(result).toBe('neutral')
      })
    })

    describe('parseTimestamp', () => {
      it('should handle invalid timestamp strings', () => {
        const result = (processor as any).parseTimestamp('invalid-date-string')

        expect(result).toBeInstanceOf(Date)
      })

      it('should handle undefined timestamp', () => {
        const result = (processor as any).parseTimestamp(undefined)

        expect(result).toBeInstanceOf(Date)
      })

      it('should parse valid timestamps', () => {
        const validTimestamp = '2024-01-01T10:00:00Z'
        const result = (processor as any).parseTimestamp(validTimestamp)

        expect(result).toBeInstanceOf(Date)
        expect(result.getFullYear()).toBe(2024)
      })
    })

    describe('analyzeSentiment', () => {
      it('should analyze positive sentiment', async () => {
        const result = await (processor as any).analyzeSentiment('I love this! It\'s awesome and wonderful!')
        expect(result).toBe('positive')
      })

      it('should analyze negative sentiment', async () => {
        const result = await (processor as any).analyzeSentiment('This is terrible and awful. I hate it.')
        expect(result).toBe('negative')
      })

      it('should analyze neutral sentiment', async () => {
        const result = await (processor as any).analyzeSentiment('This is a normal message.')
        expect(result).toBe('neutral')
      })
    })

    describe('generateContextUpdates', () => {
      it('should generate context updates using AI', async () => {
        const messages = [
          { sender: 'user', content: 'I love playing tennis', type: 'text' },
          { sender: 'other', content: 'Me too! We should play sometime', type: 'text' }
        ]
        const analysis = {
          id: 'test',
          processedAt: new Date(),
          imageMetadata: { source: 'ios', app: 'line', resolution: { width: 375, height: 812 } },
          extractedText: 'tennis conversation',
          detectedElements: { messages, uiElements: [] },
          confidence: 0.8,
          processingTime: 1000
        }

        mockAIManager.generateResponse.mockResolvedValue({
          content: '{"newHobbies": ["tennis"], "currentStage": "デート前", "communicationChanges": {"frequency": "毎日"}}',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
          model: 'gpt-4',
          finishReason: 'stop'
        })

        const result = await (processor as any).generateContextUpdates(messages, analysis)

        expect(result.newHobbies).toContain('tennis')
        expect(result.currentStage).toBe('デート前')
        expect(result.communicationChanges?.frequency).toBe('毎日')
      })

      it('should return empty updates on AI failure', async () => {
        const messages = []
        const analysis = {
          id: 'test',
          processedAt: new Date(),
          imageMetadata: { source: 'ios', app: 'line', resolution: { width: 375, height: 812 } },
          extractedText: '',
          detectedElements: { messages, uiElements: [] },
          confidence: 0.8,
          processingTime: 1000
        }

        mockAIManager.generateResponse.mockRejectedValue(new Error('AI failed'))

        const result = await (processor as any).generateContextUpdates(messages, analysis)

        expect(result).toEqual({})
      })
    })
  })
})
import { PromptGenerator } from '@/lib/domain/services/PromptGenerator'
import { IPromptTemplateProvider } from '@/lib/domain/interfaces/IPromptTemplateProvider'
import { IContextFormatter } from '@/lib/domain/interfaces/IContextFormatter'
import { Connection } from '@/types'

describe('PromptGenerator', () => {
  let promptGenerator: PromptGenerator
  let mockTemplateProvider: jest.Mocked<IPromptTemplateProvider>
  let mockContextFormatter: jest.Mocked<IContextFormatter>
  let mockConnection: Connection

  beforeEach(() => {
    mockTemplateProvider = {
      getPromptTemplate: jest.fn(),
      getAvailablePromptTypes: jest.fn()
    }

    mockContextFormatter = {
      formatConnectionContext: jest.fn()
    }

    promptGenerator = new PromptGenerator(mockTemplateProvider, mockContextFormatter)

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

    mockContextFormatter.formatConnectionContext.mockReturnValue('formatted context')
  })

  describe('generateFirstMessagePrompt', () => {
    it('should generate appropriate prompt for Claude', () => {
      const prompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'claude')
      
      expect(prompt).toContain('慎重に分析して')
      expect(prompt).toContain('formatted context')
      expect(mockContextFormatter.formatConnectionContext).toHaveBeenCalledWith(mockConnection)
    })

    it('should generate appropriate prompt for GPT', () => {
      const prompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'gpt')
      
      expect(prompt).toContain('創造的なアイデア')
      expect(prompt).toContain(mockConnection.nickname)
    })

    it('should generate appropriate prompt for Gemini', () => {
      const prompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'gemini')
      
      expect(prompt).toContain('データに基づいた')
      expect(prompt).toContain('統計的観点')
    })
  })

  describe('generateDateInvitationPrompt', () => {
    it('should generate appropriate prompt for Claude', () => {
      const prompt = promptGenerator.generateDateInvitationPrompt(mockConnection, 'claude')
      
      expect(prompt).toContain('戦略を慎重に分析')
      expect(prompt).toContain(mockConnection.current_stage)
    })

    it('should generate appropriate prompt for GPT', () => {
      const prompt = promptGenerator.generateDateInvitationPrompt(mockConnection, 'gpt')
      
      expect(prompt).toContain('素敵なデート')
      expect(prompt).toContain('わくわくする')
    })

    it('should generate appropriate prompt for Gemini', () => {
      const prompt = promptGenerator.generateDateInvitationPrompt(mockConnection, 'gemini')
      
      expect(prompt).toContain('成功確率を最大化')
      expect(prompt).toContain('定量的な分析')
    })
  })

  describe('generateProgressAnalysisPrompt', () => {
    it('should generate appropriate prompt for Claude', () => {
      const prompt = promptGenerator.generateProgressAnalysisPrompt(mockConnection, 'claude')
      
      expect(prompt).toContain('現状分析と今後の戦略')
      expect(prompt).toContain('客観的で建設的')
    })

    it('should generate appropriate prompt for GPT', () => {
      const prompt = promptGenerator.generateProgressAnalysisPrompt(mockConnection, 'gpt')
      
      expect(prompt).toContain('もっと素敵に')
      expect(prompt).toContain('前向きで希望')
    })

    it('should generate appropriate prompt for Gemini', () => {
      const prompt = promptGenerator.generateProgressAnalysisPrompt(mockConnection, 'gemini')
      
      expect(prompt).toContain('定量的に分析')
      expect(prompt).toContain('数値とデータ')
    })
  })

  describe('generateContextualPrompt', () => {
    it('should route to first message prompt', () => {
      const prompt = promptGenerator.generateContextualPrompt('first_message', mockConnection, 'claude')
      expect(prompt).toContain('慎重に分析して')
    })

    it('should route to date invitation prompt', () => {
      const prompt = promptGenerator.generateContextualPrompt('date_invitation', mockConnection, 'claude')
      expect(prompt).toContain('戦略を慎重に分析')
    })

    it('should route to progress analysis prompt', () => {
      const prompt = promptGenerator.generateContextualPrompt('progress_analysis', mockConnection, 'claude')
      expect(prompt).toContain('現状分析と今後の戦略')
    })

    it('should route to relationship advice prompt', () => {
      const prompt = promptGenerator.generateContextualPrompt('relationship_advice', mockConnection, 'claude')
      expect(prompt).toContain('アドバイスをください')
    })

    it('should throw error for unknown prompt type', () => {
      expect(() => {
        promptGenerator.generateContextualPrompt('unknown', mockConnection, 'claude')
      }).toThrow('Unknown prompt type: unknown')
    })
  })

  describe('generateConversationPrompt', () => {
    it('should generate appropriate conversation prompt', () => {
      const prompt = promptGenerator.generateConversationPrompt(mockConnection, 'claude')
      
      expect(prompt).toContain('会話を深める')
      expect(mockContextFormatter.formatConnectionContext).toHaveBeenCalledWith(mockConnection)
    })
  })

  describe('generateDatePrompt', () => {
    it('should generate appropriate date prompt', () => {
      const prompt = promptGenerator.generateDatePrompt(mockConnection, 'claude')
      
      expect(prompt).toContain('デートの準備')
      expect(mockContextFormatter.formatConnectionContext).toHaveBeenCalledWith(mockConnection)
    })
  })

  describe('generateRelationshipPrompt', () => {
    it('should generate appropriate relationship prompt', () => {
      const prompt = promptGenerator.generateRelationshipPrompt(mockConnection, 'claude')
      
      expect(prompt).toContain('関係をより深める')
      expect(mockContextFormatter.formatConnectionContext).toHaveBeenCalledWith(mockConnection)
    })
  })

  describe('generateGeneralPrompt', () => {
    it('should generate appropriate general prompt', () => {
      const prompt = promptGenerator.generateGeneralPrompt(mockConnection, 'claude')
      
      expect(prompt).toContain('恋愛関係の相談')
      expect(mockContextFormatter.formatConnectionContext).toHaveBeenCalledWith(mockConnection)
    })
  })

  describe('getPromptTemplate', () => {
    it('should delegate to template provider', () => {
      const mockTemplate = { id: 'test', category: 'test', title: 'Test', description: 'Test', template: 'test', ai_types: ['claude'] }
      mockTemplateProvider.getPromptTemplate.mockReturnValue(mockTemplate)

      const result = promptGenerator.getPromptTemplate('test')

      expect(mockTemplateProvider.getPromptTemplate).toHaveBeenCalledWith('test')
      expect(result).toBe(mockTemplate)
    })
  })

  describe('getAvailablePromptTypes', () => {
    it('should delegate to template provider', () => {
      const mockTypes = ['first_message', 'date_invitation']
      mockTemplateProvider.getAvailablePromptTypes.mockReturnValue(mockTypes)

      const result = promptGenerator.getAvailablePromptTypes()

      expect(mockTemplateProvider.getAvailablePromptTypes).toHaveBeenCalled()
      expect(result).toBe(mockTypes)
    })
  })
})
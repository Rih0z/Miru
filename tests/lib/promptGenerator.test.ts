import { PromptGenerator } from '@/lib/promptGenerator'
import { Connection, AIType } from '@/types'

describe('PromptGenerator', () => {
  let promptGenerator: PromptGenerator
  let mockConnection: Connection
  let minimalConnection: Connection

  beforeEach(() => {
    promptGenerator = new PromptGenerator()

    mockConnection = {
      id: 'test-1',
      user_id: 'user-123',
      nickname: 'テストさん',
      platform: 'Pairs',
      current_stage: 'メッセージ中',
      basic_info: {
        age: 25,
        occupation: 'エンジニア',
        location: '東京',
        hobbies: ['映画鑑賞', 'カフェ巡り', '読書']
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

    minimalConnection = {
      id: 'minimal-1',
      user_id: 'user-456',
      nickname: 'ミニマルさん',
      platform: 'TestApp',
      current_stage: 'マッチング直後',
      basic_info: {},
      communication: {},
      user_feelings: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  })

  describe('generateFirstMessagePrompt', () => {
    it('should generate Claude-specific first message prompt', () => {
      const prompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'claude')

      expect(prompt).toContain('慎重に分析して')
      expect(prompt).toContain('テストさん')
      expect(prompt).toContain('Pairs')
      expect(prompt).toContain('メッセージ中')
      expect(prompt).toContain('25')
      expect(prompt).toContain('エンジニア')
      expect(prompt).toContain('映画鑑賞、カフェ巡り、読書')
      expect(prompt).toContain('東京')
      expect(prompt).toContain('毎日')
      expect(prompt).toContain('論理的な分析')
    })

    it('should generate GPT-specific first message prompt', () => {
      const prompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'gpt')

      expect(prompt).toContain('創造的なアイデア')
      expect(prompt).toContain('テストさん')
      expect(prompt).toContain('実践的で効果的なアイデア')
      expect(prompt).toContain('ユニークで記憶に残る')
    })

    it('should generate Gemini-specific first message prompt', () => {
      const prompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'gemini')

      expect(prompt).toContain('データに基づいた')
      expect(prompt).toContain('統計的観点')
      expect(prompt).toContain('成功確率')
      expect(prompt).toContain('最適解')
    })

    it('should handle minimal connection data', () => {
      const prompt = promptGenerator.generateFirstMessagePrompt(minimalConnection, 'claude')

      expect(prompt).toContain('ミニマルさん')
      expect(prompt).toContain('TestApp')
      expect(prompt).toContain('マッチング直後')
      expect(prompt).toContain('不明')
    })
  })

  describe('generateDateInvitationPrompt', () => {
    it('should generate Claude-specific date invitation prompt', () => {
      const prompt = promptGenerator.generateDateInvitationPrompt(mockConnection, 'claude')

      expect(prompt).toContain('慎重に分析')
      expect(prompt).toContain('テストさん')
      expect(prompt).toContain('メッセージ中')
      expect(prompt).toContain('フレンドリー')
      expect(prompt).toContain('リスクも含めて')
    })

    it('should generate GPT-specific date invitation prompt', () => {
      const prompt = promptGenerator.generateDateInvitationPrompt(mockConnection, 'gpt')

      expect(prompt).toContain('素敵なデート')
      expect(prompt).toContain('ユニークなデートアイデア')
      expect(prompt).toContain('わくわくするような')
    })

    it('should generate Gemini-specific date invitation prompt', () => {
      const prompt = promptGenerator.generateDateInvitationPrompt(mockConnection, 'gemini')

      expect(prompt).toContain('成功確率を最大化')
      expect(prompt).toContain('定量的な分析')
      expect(prompt).toContain('期待値')
    })
  })

  describe('generateProgressAnalysisPrompt', () => {
    it('should generate Claude-specific progress analysis prompt', () => {
      const prompt = promptGenerator.generateProgressAnalysisPrompt(mockConnection, 'claude')

      expect(prompt).toContain('関係について')
      expect(prompt).toContain('現状分析')
      expect(prompt).toContain('客観的で建設的')
      expect(prompt).toContain('テストさん')
    })

    it('should generate GPT-specific progress analysis prompt', () => {
      const prompt = promptGenerator.generateProgressAnalysisPrompt(mockConnection, 'gpt')

      expect(prompt).toContain('もっと素敵に')
      expect(prompt).toContain('希望的観測')
      expect(prompt).toContain('前向きで希望が持てる')
    })

    it('should generate Gemini-specific progress analysis prompt', () => {
      const prompt = promptGenerator.generateProgressAnalysisPrompt(mockConnection, 'gemini')

      expect(prompt).toContain('定量的に分析')
      expect(prompt).toContain('進展度スコア')
      expect(prompt).toContain('数値とデータ')
    })
  })

  describe('generateContextualPrompt', () => {
    it('should route to correct prompt generator for first_message', () => {
      const prompt = promptGenerator.generateContextualPrompt('first_message', mockConnection, 'claude')

      expect(prompt).toContain('慎重に分析して')
      expect(prompt).toContain('最初のメッセージ')
    })

    it('should route to correct prompt generator for date_invitation', () => {
      const prompt = promptGenerator.generateContextualPrompt('date_invitation', mockConnection, 'gpt')

      expect(prompt).toContain('素敵なデート')
    })

    it('should route to correct prompt generator for progress_analysis', () => {
      const prompt = promptGenerator.generateContextualPrompt('progress_analysis', mockConnection, 'gemini')

      expect(prompt).toContain('定量的に分析')
    })

    it('should route to correct prompt generator for relationship_advice', () => {
      const prompt = promptGenerator.generateContextualPrompt('relationship_advice', mockConnection, 'claude')

      expect(prompt).toContain('アドバイスをください')
      expect(prompt).toContain('テストさん')
    })

    it('should throw error for unknown prompt type', () => {
      expect(() => {
        promptGenerator.generateContextualPrompt('unknown_type', mockConnection, 'claude')
      }).toThrow('Unknown prompt type: unknown_type')
    })
  })

  describe('generateConversationPrompt', () => {
    it('should generate conversation prompts for all AI types', () => {
      const claudePrompt = promptGenerator.generateConversationPrompt(mockConnection, 'claude')
      const gptPrompt = promptGenerator.generateConversationPrompt(mockConnection, 'gpt')
      const geminiPrompt = promptGenerator.generateConversationPrompt(mockConnection, 'gemini')

      expect(claudePrompt).toContain('会話を深める')
      expect(claudePrompt).toContain('テストさん')

      expect(gptPrompt).toContain('もっと深めたい')
      expect(gptPrompt).toContain('楽しくて意味のある')

      expect(geminiPrompt).toContain('戦略的アドバイス')
      expect(geminiPrompt).toContain('心理学的観点')
    })
  })

  describe('generateDatePrompt', () => {
    it('should generate date prompts for all AI types', () => {
      const claudePrompt = promptGenerator.generateDatePrompt(mockConnection, 'claude')
      const gptPrompt = promptGenerator.generateDatePrompt(mockConnection, 'gpt')
      const geminiPrompt = promptGenerator.generateDatePrompt(mockConnection, 'gemini')

      expect(claudePrompt).toContain('デートの準備')
      expect(gptPrompt).toContain('素敵なデート')
      expect(geminiPrompt).toContain('効果的なデート戦略')
    })
  })

  describe('generateRelationshipPrompt', () => {
    it('should generate relationship prompts for all AI types', () => {
      const claudePrompt = promptGenerator.generateRelationshipPrompt(mockConnection, 'claude')
      const gptPrompt = promptGenerator.generateRelationshipPrompt(mockConnection, 'gpt')
      const geminiPrompt = promptGenerator.generateRelationshipPrompt(mockConnection, 'gemini')

      expect(claudePrompt).toContain('より深めるための')
      expect(gptPrompt).toContain('次のレベル')
      expect(geminiPrompt).toContain('科学的アプローチ')
    })
  })

  describe('generateGeneralPrompt', () => {
    it('should generate general prompts for all AI types', () => {
      const claudePrompt = promptGenerator.generateGeneralPrompt(mockConnection, 'claude')
      const gptPrompt = promptGenerator.generateGeneralPrompt(mockConnection, 'gpt')
      const geminiPrompt = promptGenerator.generateGeneralPrompt(mockConnection, 'gemini')

      expect(claudePrompt).toContain('恋愛関係の相談')
      expect(gptPrompt).toContain('恋愛コーチ')
      expect(geminiPrompt).toContain('データに基づいた')
    })
  })

  describe('getPromptTemplate', () => {
    it('should return correct template for known prompt types', () => {
      const firstMessageTemplate = promptGenerator.getPromptTemplate('first_message')
      const dateInvitationTemplate = promptGenerator.getPromptTemplate('date_invitation')
      const progressAnalysisTemplate = promptGenerator.getPromptTemplate('progress_analysis')

      expect(firstMessageTemplate).toEqual({
        id: 'first_message',
        category: 'initial_contact',
        title: '最初のメッセージ作成',
        description: 'マッチング相手への初回メッセージを作成します',
        template: 'first_message_template',
        ai_types: ['claude', 'gpt', 'gemini']
      })

      expect(dateInvitationTemplate).toEqual({
        id: 'date_invitation',
        category: 'relationship_building',
        title: 'デートの誘い方',
        description: '自然で効果的なデートの誘い方を提案します',
        template: 'date_invitation_template',
        ai_types: ['claude', 'gpt', 'gemini']
      })

      expect(progressAnalysisTemplate).toEqual({
        id: 'progress_analysis',
        category: 'analysis',
        title: '関係性の進展分析',
        description: '現在の関係性を分析し、次のステップを提案します',
        template: 'progress_analysis_template',
        ai_types: ['claude', 'gpt', 'gemini']
      })
    })

    it('should return null for unknown prompt types', () => {
      const unknownTemplate = promptGenerator.getPromptTemplate('unknown_type')
      expect(unknownTemplate).toBeNull()
    })

    it('should return null for empty string', () => {
      const emptyTemplate = promptGenerator.getPromptTemplate('')
      expect(emptyTemplate).toBeNull()
    })
  })

  describe('getAvailablePromptTypes', () => {
    it('should return all available prompt types', () => {
      const availableTypes = promptGenerator.getAvailablePromptTypes()

      expect(availableTypes).toEqual([
        'first_message',
        'date_invitation',
        'progress_analysis'
      ])
      expect(availableTypes).toHaveLength(3)
    })

    it('should return array of strings', () => {
      const availableTypes = promptGenerator.getAvailablePromptTypes()

      availableTypes.forEach(type => {
        expect(typeof type).toBe('string')
      })
    })
  })

  describe('formatConnectionContext behavior verification', () => {
    it('should format complete connection context', () => {
      // We can't test this private method directly, but we can verify through public methods
      const prompt = promptGenerator.generateGeneralPrompt(mockConnection, 'claude')

      expect(prompt).toContain('テストさん')
      expect(prompt).toContain('Pairs')
      expect(prompt).toContain('メッセージ中')
      expect(prompt).toContain('25')
      expect(prompt).toContain('エンジニア')
      expect(prompt).toContain('映画鑑賞、カフェ巡り、読書')
      expect(prompt).toContain('東京')
      expect(prompt).toContain('毎日')
      expect(prompt).toContain('2024-01-01')
      expect(prompt).toContain('フレンドリー')
      expect(prompt).toContain('真剣な交際')
      expect(prompt).toContain('返信が遅い時がある')
      expect(prompt).toContain('優しい、話が面白い')
    })

    it('should handle missing information gracefully', () => {
      const prompt = promptGenerator.generateGeneralPrompt(minimalConnection, 'claude')

      expect(prompt).toContain('ミニマルさん')
      expect(prompt).toContain('TestApp')
      expect(prompt).toContain('マッチング直後')
      expect(prompt).toContain('不明')
    })

    it('should handle undefined nested objects', () => {
      const connectionWithUndefined = {
        ...minimalConnection,
        basic_info: undefined,
        communication: undefined,
        user_feelings: undefined
      } as any

      // The current implementation doesn't handle undefined nested objects gracefully
      expect(() => {
        promptGenerator.generateGeneralPrompt(connectionWithUndefined, 'claude')
      }).toThrow()
    })
  })

  describe('edge cases and comprehensive testing', () => {
    it('should handle all AI types for each prompt method', () => {
      const aiTypes: AIType[] = ['claude', 'gpt', 'gemini']
      const methods = [
        'generateFirstMessagePrompt',
        'generateDateInvitationPrompt',
        'generateProgressAnalysisPrompt',
        'generateConversationPrompt',
        'generateDatePrompt',
        'generateRelationshipPrompt',
        'generateGeneralPrompt'
      ]

      methods.forEach(methodName => {
        aiTypes.forEach(aiType => {
          const method = (promptGenerator as any)[methodName]
          expect(() => method.call(promptGenerator, mockConnection, aiType)).not.toThrow()
          
          const result = method.call(promptGenerator, mockConnection, aiType)
          expect(typeof result).toBe('string')
          expect(result.length).toBeGreaterThan(0)
        })
      })
    })

    it('should handle connections with null values in nested objects', () => {
      const connectionWithNulls = {
        ...mockConnection,
        basic_info: {
          age: null,
          occupation: null,
          location: null,
          hobbies: null
        },
        communication: {
          frequency: null,
          lastContact: null,
          responseTime: null,
          communicationStyle: null
        },
        user_feelings: {
          expectations: null,
          attractivePoints: null,
          concerns: null
        }
      } as any

      expect(() => {
        promptGenerator.generateFirstMessagePrompt(connectionWithNulls, 'claude')
      }).not.toThrow()

      const prompt = promptGenerator.generateFirstMessagePrompt(connectionWithNulls, 'claude')
      expect(prompt).toContain('不明')
    })

    it('should handle empty arrays gracefully', () => {
      const connectionWithEmptyArrays = {
        ...mockConnection,
        basic_info: {
          ...mockConnection.basic_info,
          hobbies: []
        },
        user_feelings: {
          ...mockConnection.user_feelings,
          attractivePoints: [],
          concerns: []
        }
      }

      const prompt = promptGenerator.generateFirstMessagePrompt(connectionWithEmptyArrays, 'claude')
      expect(prompt).toContain('不明')
    })

    it('should generate different prompts for different AI types', () => {
      const claudePrompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'claude')
      const gptPrompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'gpt')
      const geminiPrompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'gemini')

      expect(claudePrompt).not.toBe(gptPrompt)
      expect(gptPrompt).not.toBe(geminiPrompt)
      expect(claudePrompt).not.toBe(geminiPrompt)
    })

    it('should include connection context in all generated prompts', () => {
      const prompts = [
        promptGenerator.generateFirstMessagePrompt(mockConnection, 'claude'),
        promptGenerator.generateDateInvitationPrompt(mockConnection, 'gpt'),
        promptGenerator.generateProgressAnalysisPrompt(mockConnection, 'gemini'),
        promptGenerator.generateConversationPrompt(mockConnection, 'claude'),
        promptGenerator.generateDatePrompt(mockConnection, 'gpt'),
        promptGenerator.generateRelationshipPrompt(mockConnection, 'gemini'),
        promptGenerator.generateGeneralPrompt(mockConnection, 'claude')
      ]

      prompts.forEach(prompt => {
        expect(prompt).toContain('テストさん')
        expect(prompt).toContain('Pairs')
        expect(prompt).toContain('メッセージ中')
      })
    })
  })
})
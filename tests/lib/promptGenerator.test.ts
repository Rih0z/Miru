import { describe, it, expect, beforeEach } from '@jest/globals'
import { PromptGenerator } from '@/lib/promptGenerator'
import { Connection, AIType } from '@/types'

describe('PromptGenerator', () => {
  let promptGenerator: PromptGenerator
  let mockConnection: Connection

  beforeEach(() => {
    promptGenerator = new PromptGenerator()
    mockConnection = {
      id: 'conn-123',
      user_id: 'user-123',
      nickname: 'Aさん',
      platform: 'Pairs',
      current_stage: 'マッチング直後',
      basic_info: {
        age: 25,
        occupation: 'エンジニア',
        hobbies: ['読書', '映画鑑賞']
      },
      communication: {
        frequency: '毎日',
        lastContact: '2024-05-29',
        communicationStyle: 'フレンドリー'
      },
      user_feelings: {
        expectations: '真剣な交際',
        concerns: '年齢差',
        attractivePoints: ['優しい', '話が合う']
      },
      created_at: '2024-05-29T00:00:00Z',
      updated_at: '2024-05-29T00:00:00Z'
    }
  })

  describe('generateFirstMessagePrompt', () => {
    it('should generate appropriate first message prompt for Claude', () => {
      const prompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'claude')
      
      expect(prompt).toContain('Aさん')
      expect(prompt).toContain('Pairs')
      expect(prompt).toContain('エンジニア')
      expect(prompt).toContain('読書')
      expect(prompt).toContain('映画鑑賞')
      expect(prompt).toContain('慎重に分析')
    })

    it('should generate appropriate first message prompt for GPT', () => {
      const prompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'gpt')
      
      expect(prompt).toContain('Aさん')
      expect(prompt).toContain('創造的なアイデア')
      expect(prompt).toContain('3パターン')
    })

    it('should generate appropriate first message prompt for Gemini', () => {
      const prompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'gemini')
      
      expect(prompt).toContain('Aさん')
      expect(prompt).toContain('データに基づいた')
      expect(prompt).toContain('成功確率')
    })
  })

  describe('generateDateInvitationPrompt', () => {
    beforeEach(() => {
      mockConnection.current_stage = 'LINE交換済み'
    })

    it('should generate date invitation prompt with connection context', () => {
      const prompt = promptGenerator.generateDateInvitationPrompt(mockConnection, 'claude')
      
      expect(prompt).toContain('デート')
      expect(prompt).toContain('Aさん')
      expect(prompt).toContain('読書')
      expect(prompt).toContain('映画鑑賞')
    })

    it('should include timing analysis for date invitation', () => {
      const prompt = promptGenerator.generateDateInvitationPrompt(mockConnection, 'gemini')
      
      expect(prompt).toContain('デート誘い成功の最適タイミング')
      expect(prompt).toContain('成功確率')
    })
  })

  describe('generateProgressAnalysisPrompt', () => {
    it('should generate progress analysis prompt with relationship history', () => {
      const prompt = promptGenerator.generateProgressAnalysisPrompt(mockConnection, 'claude')
      
      expect(prompt).toContain('現状分析と今後の戦略')
      expect(prompt).toContain('Aさん')
      expect(prompt).toContain('マッチング直後')
      expect(prompt).toContain('真剣な交際')
    })

    it('should include hope score analysis', () => {
      const prompt = promptGenerator.generateProgressAnalysisPrompt(mockConnection, 'gemini')
      
      expect(prompt).toContain('関係の進展度')
      expect(prompt).toContain('付き合える可能性')
    })
  })

  describe('generateContextualPrompt', () => {
    it('should generate contextual prompt based on stage and AI type', () => {
      const prompt = promptGenerator.generateContextualPrompt(
        'relationship_advice',
        mockConnection,
        'claude'
      )
      
      expect(prompt).toBeDefined()
      expect(typeof prompt).toBe('string')
      expect(prompt.length).toBeGreaterThan(100)
    })

    it('should throw error for unknown prompt type', () => {
      expect(() => {
        promptGenerator.generateContextualPrompt(
          'unknown_type',
          mockConnection,
          'claude'
        )
      }).toThrow('Unknown prompt type')
    })
  })

  describe('getPromptTemplate', () => {
    it('should return template for valid prompt type', () => {
      const template = promptGenerator.getPromptTemplate('first_message')
      
      expect(template).toBeDefined()
      expect(template.title).toBeDefined()
      expect(template.description).toBeDefined()
    })

    it('should return null for invalid prompt type', () => {
      const template = promptGenerator.getPromptTemplate('invalid_type')
      
      expect(template).toBeNull()
    })
  })

  describe('AI-specific prompt variations', () => {
    it('should generate different prompts for different AI types', () => {
      const claudePrompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'claude')
      const gptPrompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'gpt')
      const geminiPrompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'gemini')
      
      expect(claudePrompt).not.toBe(gptPrompt)
      expect(gptPrompt).not.toBe(geminiPrompt)
      expect(claudePrompt).not.toBe(geminiPrompt)
    })

    it('should maintain consistent context across AI types', () => {
      const claudePrompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'claude')
      const gptPrompt = promptGenerator.generateFirstMessagePrompt(mockConnection, 'gpt')
      
      // Both should contain the connection details
      expect(claudePrompt).toContain('Aさん')
      expect(gptPrompt).toContain('Aさん')
      
      expect(claudePrompt).toContain('エンジニア')
      expect(gptPrompt).toContain('エンジニア')
    })
  })
})
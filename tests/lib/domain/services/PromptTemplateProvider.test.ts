import { PromptTemplateProvider } from '@/lib/domain/services/PromptTemplateProvider'

describe('PromptTemplateProvider', () => {
  let provider: PromptTemplateProvider

  beforeEach(() => {
    provider = new PromptTemplateProvider()
  })

  describe('getPromptTemplate', () => {
    it('should return correct template for first_message', () => {
      const template = provider.getPromptTemplate('first_message')

      expect(template).toEqual({
        id: 'first_message',
        category: 'initial_contact',
        title: '最初のメッセージ作成',
        description: 'マッチング相手への初回メッセージを作成します',
        template: 'first_message_template',
        ai_types: ['claude', 'gpt', 'gemini']
      })
    })

    it('should return correct template for date_invitation', () => {
      const template = provider.getPromptTemplate('date_invitation')

      expect(template).toEqual({
        id: 'date_invitation',
        category: 'relationship_building',
        title: 'デートの誘い方',
        description: '自然で効果的なデートの誘い方を提案します',
        template: 'date_invitation_template',
        ai_types: ['claude', 'gpt', 'gemini']
      })
    })

    it('should return correct template for progress_analysis', () => {
      const template = provider.getPromptTemplate('progress_analysis')

      expect(template).toEqual({
        id: 'progress_analysis',
        category: 'analysis',
        title: '関係性の進展分析',
        description: '現在の関係性を分析し、次のステップを提案します',
        template: 'progress_analysis_template',
        ai_types: ['claude', 'gpt', 'gemini']
      })
    })

    it('should return null for non-existent template', () => {
      const template = provider.getPromptTemplate('non_existent_template')

      expect(template).toBeNull()
    })

    it('should return null for empty string', () => {
      const template = provider.getPromptTemplate('')

      expect(template).toBeNull()
    })

    it('should return null for undefined template type', () => {
      const template = provider.getPromptTemplate(undefined as any)

      expect(template).toBeNull()
    })

    it('should handle case sensitive template types', () => {
      const template = provider.getPromptTemplate('FIRST_MESSAGE')

      expect(template).toBeNull()
    })
  })

  describe('getAvailablePromptTypes', () => {
    it('should return all available prompt types', () => {
      const types = provider.getAvailablePromptTypes()

      expect(types).toEqual(['first_message', 'date_invitation', 'progress_analysis'])
      expect(types).toHaveLength(3)
    })

    it('should return array with correct length', () => {
      const types = provider.getAvailablePromptTypes()

      expect(Array.isArray(types)).toBe(true)
      expect(types.length).toBeGreaterThan(0)
    })

    it('should return consistent results on multiple calls', () => {
      const types1 = provider.getAvailablePromptTypes()
      const types2 = provider.getAvailablePromptTypes()

      expect(types1).toEqual(types2)
    })

    it('should return immutable array (not affecting internal state)', () => {
      const types = provider.getAvailablePromptTypes()
      const originalLength = types.length
      
      types.push('new_type')
      
      const typesAgain = provider.getAvailablePromptTypes()
      expect(typesAgain).toHaveLength(originalLength)
      expect(typesAgain).not.toContain('new_type')
    })
  })

  describe('template structure validation', () => {
    it('should ensure all templates have required properties', () => {
      const types = provider.getAvailablePromptTypes()

      types.forEach(type => {
        const template = provider.getPromptTemplate(type)
        
        expect(template).toHaveProperty('id')
        expect(template).toHaveProperty('category')
        expect(template).toHaveProperty('title')
        expect(template).toHaveProperty('description')
        expect(template).toHaveProperty('template')
        expect(template).toHaveProperty('ai_types')
        
        expect(typeof template!.id).toBe('string')
        expect(typeof template!.category).toBe('string')
        expect(typeof template!.title).toBe('string')
        expect(typeof template!.description).toBe('string')
        expect(typeof template!.template).toBe('string')
        expect(Array.isArray(template!.ai_types)).toBe(true)
      })
    })

    it('should ensure all templates have non-empty properties', () => {
      const types = provider.getAvailablePromptTypes()

      types.forEach(type => {
        const template = provider.getPromptTemplate(type)
        
        expect(template!.id.length).toBeGreaterThan(0)
        expect(template!.category.length).toBeGreaterThan(0)
        expect(template!.title.length).toBeGreaterThan(0)
        expect(template!.description.length).toBeGreaterThan(0)
        expect(template!.template.length).toBeGreaterThan(0)
        expect(template!.ai_types.length).toBeGreaterThan(0)
      })
    })

    it('should ensure template id matches the prompt type', () => {
      const types = provider.getAvailablePromptTypes()

      types.forEach(type => {
        const template = provider.getPromptTemplate(type)
        expect(template!.id).toBe(type)
      })
    })

    it('should ensure all templates support common AI types', () => {
      const types = provider.getAvailablePromptTypes()

      types.forEach(type => {
        const template = provider.getPromptTemplate(type)
        
        expect(template!.ai_types).toContain('claude')
        expect(template!.ai_types).toContain('gpt')
        expect(template!.ai_types).toContain('gemini')
      })
    })
  })

  describe('consistency and immutability', () => {
    it('should return direct references to template objects', () => {
      const template = provider.getPromptTemplate('first_message')
      const originalTitle = template!.title
      
      template!.title = 'Modified Title'
      
      const templateAgain = provider.getPromptTemplate('first_message')
      expect(templateAgain!.title).toBe('Modified Title')
      
      // Restore original title for other tests
      template!.title = originalTitle
    })

    it('should return the same reference for same template type', () => {
      const template1 = provider.getPromptTemplate('first_message')
      const template2 = provider.getPromptTemplate('first_message')

      expect(template1).toBe(template2)
    })
  })
})
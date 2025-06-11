import { DataImportPromptGenerator } from '@/lib/domain/services/DataImportPromptGenerator'
import { DataImportPromptConfig } from '@/types/data-import'

describe('DataImportPromptGenerator', () => {
  let generator: DataImportPromptGenerator

  beforeEach(() => {
    generator = new DataImportPromptGenerator()
  })

  describe('generateMainPrompt', () => {
    it('should generate main prompt with required fields', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['basic_profile', 'current_connections'],
        includeScreenshots: true,
        platforms: ['pairs', 'tinder'],
        language: 'ja'
      }

      const result = generator.generateMainPrompt(config)
      
      expect(result.id).toMatch(/^import_\d+$/)
      expect(result.title).toBe('Miru恋愛状況データインポート')
      expect(result.fullPrompt).toContain('恋愛コーチングAIアシスタント')
      expect(result.fullPrompt).toContain('JSON形式')
      expect(result.steps).toBeDefined()
      expect(result.expectedOutputSchema).toBeDefined()
      expect(result.estimatedTime).toBe('15-30分')
    })

    it('should include screenshot instructions when enabled', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['dating_apps'],
        includeScreenshots: true,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generateMainPrompt(config)
      
      expect(result.fullPrompt).toContain('スクリーンショット')
      expect(result.fullPrompt).toContain('📸')
    })

    it('should exclude screenshots when disabled', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['basic_profile'],
        includeScreenshots: false,
        platforms: ['tinder'],
        language: 'ja'
      }

      const result = generator.generateMainPrompt(config)
      
      expect(result.fullPrompt).not.toContain('**重要**: 各項目で指示がある場合は、関連するスクリーンショット')
    })

    it('should filter steps based on focus areas', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['basic_profile', 'current_connections'],
        includeScreenshots: false,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generateMainPrompt(config)
      
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps.some(step => step.id === 'basic_profile')).toBe(true)
      expect(result.steps.some(step => step.id === 'current_connections')).toBe(true)
    })

    it('should include required steps even if not in focus areas', () => {
      const config: DataImportPromptConfig = {
        focusAreas: [],
        includeScreenshots: false,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generateMainPrompt(config)
      
      // Required steps should always be included
      const requiredSteps = result.steps.filter(step => step.required)
      expect(requiredSteps.length).toBeGreaterThan(0)
    })
  })

  describe('generatePlatformSpecificPrompt', () => {
    it('should generate Gemini-specific prompt', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['basic_profile'],
        includeScreenshots: true,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generatePlatformSpecificPrompt('gemini', config)
      
      expect(result).toContain('Google Gemini向け指示')
      expect(result).toContain('Gemini（Bard）')
      expect(result).toContain('画像分析')
      expect(result).toContain('恋愛コーチングAIアシスタント')
      expect(result).toContain('Miru AI恋愛オーケストレーションシステム')
    })

    it('should generate Claude-specific prompt', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['basic_profile'],
        includeScreenshots: false,
        platforms: ['tinder'],
        language: 'ja'
      }

      const result = generator.generatePlatformSpecificPrompt('claude', config)
      
      expect(result).toContain('Claude向け指示')
      expect(result).toContain('Claude（Anthropic）')
      expect(result).toContain('対話形式')
      expect(result).toContain('恋愛コーチングAIアシスタント')
    })

    it('should generate ChatGPT-specific prompt', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['basic_profile'],
        includeScreenshots: true,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generatePlatformSpecificPrompt('chatgpt', config)
      
      expect(result).toContain('ChatGPT向け指示')
      expect(result).toContain('ChatGPT（OpenAI）')
      expect(result).toContain('ChatGPT-4Vision')
      expect(result).toContain('恋愛コーチングAIアシスタント')
    })

    it('should include timestamp in generated prompt', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['basic_profile'],
        includeScreenshots: false,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generatePlatformSpecificPrompt('gemini', config)
      
      expect(result).toContain('生成時刻')
      expect(result).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/) // Date format
    })
  })

  describe('output schema validation', () => {
    it('should provide valid JSON schema', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['basic_profile'],
        includeScreenshots: false,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generateMainPrompt(config)
      const schema = result.expectedOutputSchema
      
      expect(schema.type).toBe('object')
      expect(schema.required).toContain('connections')
      expect(schema.required).toContain('userProfile')
      expect(schema.required).toContain('importMetadata')
      
      expect(schema.properties.connections.type).toBe('array')
      expect(schema.properties.userProfile.type).toBe('object')
      expect(schema.properties.importMetadata.type).toBe('object')
    })

    it('should validate connection stage enum values', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['basic_profile'],
        includeScreenshots: false,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generateMainPrompt(config)
      const connectionSchema = result.expectedOutputSchema.properties.connections.items
      
      expect(connectionSchema.properties.currentStage.enum).toEqual([
        'matching', 'chatting', 'planning_date', 'dating', 'relationship', 'complicated', 'ended'
      ])
    })

    it('should validate score ranges', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['basic_profile'],
        includeScreenshots: false,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generateMainPrompt(config)
      const connectionSchema = result.expectedOutputSchema.properties.connections.items
      
      expect(connectionSchema.properties.attractionLevel.minimum).toBe(1)
      expect(connectionSchema.properties.attractionLevel.maximum).toBe(10)
      expect(connectionSchema.properties.compatibilityScore.minimum).toBe(1)
      expect(connectionSchema.properties.compatibilityScore.maximum).toBe(10)
      expect(connectionSchema.properties.communicationScore.minimum).toBe(1)
      expect(connectionSchema.properties.communicationScore.maximum).toBe(10)
    })
  })

  describe('step configuration', () => {
    it('should include all available step types', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['basic_profile', 'dating_apps', 'current_connections', 'communication_analysis', 'meeting_history', 'feelings_assessment', 'goals_concerns'],
        includeScreenshots: true,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generateMainPrompt(config)
      
      expect(result.steps.some(step => step.id === 'basic_profile')).toBe(true)
      expect(result.steps.some(step => step.id === 'dating_apps')).toBe(true)
      expect(result.steps.some(step => step.id === 'current_connections')).toBe(true)
      expect(result.steps.some(step => step.id === 'communication_analysis')).toBe(true)
      expect(result.steps.some(step => step.id === 'meeting_history')).toBe(true)
      expect(result.steps.some(step => step.id === 'feelings_assessment')).toBe(true)
      expect(result.steps.some(step => step.id === 'goals_concerns')).toBe(true)
    })

    it('should mark required steps correctly', () => {
      const config: DataImportPromptConfig = {
        focusAreas: [],
        includeScreenshots: false,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generateMainPrompt(config)
      const requiredSteps = result.steps.filter(step => step.required)
      
      expect(requiredSteps.length).toBeGreaterThan(0)
      expect(requiredSteps.some(step => step.id === 'basic_profile')).toBe(true)
      expect(requiredSteps.some(step => step.id === 'current_connections')).toBe(true)
      expect(requiredSteps.some(step => step.id === 'feelings_assessment')).toBe(true)
    })

    it('should include examples for each step', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['basic_profile', 'current_connections'],
        includeScreenshots: false,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generateMainPrompt(config)
      
      result.steps.forEach(step => {
        expect(step.examples).toBeDefined()
        expect(Array.isArray(step.examples)).toBe(true)
      })
    })

    it('should include screenshot instructions for relevant steps', () => {
      const config: DataImportPromptConfig = {
        focusAreas: ['dating_apps', 'current_connections'],
        includeScreenshots: true,
        platforms: ['pairs'],
        language: 'ja'
      }

      const result = generator.generateMainPrompt(config)
      const stepsWithScreenshots = result.steps.filter(step => step.screenshotInstructions)
      
      expect(stepsWithScreenshots.length).toBeGreaterThan(0)
      expect(stepsWithScreenshots.some(step => step.id === 'dating_apps')).toBe(true)
      expect(stepsWithScreenshots.some(step => step.id === 'current_connections')).toBe(true)
    })
  })
})
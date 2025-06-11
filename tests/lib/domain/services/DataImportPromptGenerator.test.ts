import { DataImportPromptGenerator } from '@/lib/domain/services/DataImportPromptGenerator'
import { ImportContext, ImportPlatform, ImportedUserData } from '@/types/data-import'

describe('DataImportPromptGenerator', () => {
  let generator: DataImportPromptGenerator

  beforeEach(() => {
    generator = new DataImportPromptGenerator()
  })

  describe('generateSystemPrompt', () => {
    it('should generate system prompt for pairs platform', () => {
      const context: ImportContext = {
        platform: 'pairs' as ImportPlatform,
        dataType: 'screenshot',
        language: 'ja'
      }

      const prompt = generator.generateSystemPrompt(context)
      
      expect(prompt).toContain('あなたはPairsの恋愛データ分析専門のAIアシスタント')
      expect(prompt).toContain('スクリーンショット')
      expect(prompt).toContain('プライバシー')
      expect(prompt).toContain('JSON形式')
    })

    it('should generate system prompt for tinder platform', () => {
      const context: ImportContext = {
        platform: 'tinder' as ImportPlatform,
        dataType: 'text',
        language: 'ja'
      }

      const prompt = generator.generateSystemPrompt(context)
      
      expect(prompt).toContain('あなたはTinderの恋愛データ分析専門のAIアシスタント')
      expect(prompt).toContain('テキスト')
    })

    it('should generate system prompt for manual platform', () => {
      const context: ImportContext = {
        platform: 'manual' as ImportPlatform,
        dataType: 'structured',
        language: 'ja'
      }

      const prompt = generator.generateSystemPrompt(context)
      
      expect(prompt).toContain('恋愛データ分析専門のAIアシスタント')
      expect(prompt).toContain('構造化データ')
    })

    it('should generate system prompt in English', () => {
      const context: ImportContext = {
        platform: 'pairs' as ImportPlatform,
        dataType: 'screenshot',
        language: 'en'
      }

      const prompt = generator.generateSystemPrompt(context)
      
      expect(prompt).toContain('You are an AI assistant specializing in analyzing Pairs dating data')
      expect(prompt).toContain('screenshot')
      expect(prompt).toContain('privacy')
      expect(prompt).toContain('JSON format')
    })
  })

  describe('generateExtractionPrompt', () => {
    it('should generate extraction prompt for screenshot', () => {
      const screenshotData = 'base64-encoded-image-data'
      const context: ImportContext = {
        platform: 'pairs' as ImportPlatform,
        dataType: 'screenshot',
        language: 'ja'
      }

      const prompt = generator.generateExtractionPrompt(screenshotData, context)
      
      expect(prompt).toContain('このスクリーンショットから')
      expect(prompt).toContain('Pairsアプリ')
      expect(prompt).toContain('connections')
      expect(prompt).toContain('userProfile')
      expect(prompt).toContain('importMetadata')
    })

    it('should generate extraction prompt for text data', () => {
      const textData = 'マッチした人: 田中さん、28歳、エンジニア'
      const context: ImportContext = {
        platform: 'tinder' as ImportPlatform,
        dataType: 'text',
        language: 'ja'
      }

      const prompt = generator.generateExtractionPrompt(textData, context)
      
      expect(prompt).toContain('このテキストデータから')
      expect(prompt).toContain('Tinderアプリ')
      expect(prompt).toContain(textData)
    })

    it('should generate extraction prompt with additional context', () => {
      const data = 'some-data'
      const context: ImportContext = {
        platform: 'bumble' as ImportPlatform,
        dataType: 'screenshot',
        language: 'ja',
        additionalContext: '特に年齢と職業に注目してください'
      }

      const prompt = generator.generateExtractionPrompt(data, context)
      
      expect(prompt).toContain('追加コンテキスト: 特に年齢と職業に注目してください')
    })

    it('should generate extraction prompt in English', () => {
      const data = 'screenshot-data'
      const context: ImportContext = {
        platform: 'pairs' as ImportPlatform,
        dataType: 'screenshot',
        language: 'en'
      }

      const prompt = generator.generateExtractionPrompt(data, context)
      
      expect(prompt).toContain('Extract the following information from this screenshot')
      expect(prompt).toContain('Pairs app')
    })
  })

  describe('generateValidationPrompt', () => {
    const mockExtractedData: ImportedUserData = {
      connections: [
        {
          nickname: '田中さん',
          platform: 'pairs',
          currentStage: 'messaging',
          attractionLevel: 8
        }
      ],
      userProfile: {
        name: 'テストユーザー',
        age: 30
      },
      importMetadata: {
        source: 'screenshot',
        version: '1.0',
        timestamp: new Date().toISOString()
      }
    }

    it('should generate validation prompt in Japanese', () => {
      const prompt = generator.generateValidationPrompt(mockExtractedData, 'ja')
      
      expect(prompt).toContain('以下の抽出されたデータを検証し、改善してください')
      expect(prompt).toContain('データの完全性')
      expect(prompt).toContain('一貫性')
      expect(prompt).toContain('現実性')
      expect(prompt).toContain(JSON.stringify(mockExtractedData, null, 2))
    })

    it('should generate validation prompt in English', () => {
      const prompt = generator.generateValidationPrompt(mockExtractedData, 'en')
      
      expect(prompt).toContain('Please validate and improve the following extracted data')
      expect(prompt).toContain('Data completeness')
      expect(prompt).toContain('Consistency')
      expect(prompt).toContain('Realism')
    })
  })

  describe('generateEnrichmentPrompt', () => {
    const mockData: ImportedUserData = {
      connections: [
        {
          nickname: '佐藤さん',
          platform: 'tinder',
          currentStage: 'just_matched',
          attractionLevel: 7,
          notes: ['趣味が合いそう', '返信が早い']
        }
      ],
      userProfile: {
        name: 'ユーザー',
        interests: ['映画', '旅行']
      },
      importMetadata: {
        source: 'manual',
        version: '1.0',
        timestamp: new Date().toISOString()
      }
    }

    it('should generate enrichment prompt based on user preferences', () => {
      const userPreferences = {
        focusAreas: ['communication', 'compatibility'],
        importGoals: ['better_conversations', 'find_serious_relationship']
      }

      const prompt = generator.generateEnrichmentPrompt(mockData, userPreferences, 'ja')
      
      expect(prompt).toContain('ユーザーの好みに基づいてデータを強化')
      expect(prompt).toContain('communication')
      expect(prompt).toContain('compatibility')
      expect(prompt).toContain('better_conversations')
      expect(prompt).toContain('find_serious_relationship')
      expect(prompt).toContain('コミュニケーション')
      expect(prompt).toContain('相性')
    })

    it('should generate enrichment prompt without preferences', () => {
      const prompt = generator.generateEnrichmentPrompt(mockData, undefined, 'ja')
      
      expect(prompt).toContain('以下のデータを分析し')
      expect(prompt).toContain('アドバイス')
      expect(prompt).toContain('各コネクションの詳細分析')
    })

    it('should generate enrichment prompt in English', () => {
      const userPreferences = {
        focusAreas: ['emotional_connection'],
        importGoals: ['long_term_relationship']
      }

      const prompt = generator.generateEnrichmentPrompt(mockData, userPreferences, 'en')
      
      expect(prompt).toContain('enhance this data based on user preferences')
      expect(prompt).toContain('emotional_connection')
      expect(prompt).toContain('long_term_relationship')
      expect(prompt).toContain('Emotional Connection')
    })
  })

  describe('generateSummaryPrompt', () => {
    const completeData: ImportedUserData = {
      connections: [
        {
          nickname: '高橋さん',
          platform: 'pairs',
          currentStage: 'before_date',
          attractionLevel: 9,
          compatibilityScore: 8,
          communicationScore: 9,
          interactionHistory: {
            firstMessage: '2024-01-01T00:00:00Z',
            lastMessage: '2024-01-15T00:00:00Z',
            messageCount: 50
          }
        },
        {
          nickname: '山田さん',
          platform: 'tinder',
          currentStage: 'messaging',
          attractionLevel: 6,
          compatibilityScore: 7,
          communicationScore: 5
        }
      ],
      userProfile: {
        name: 'テストユーザー',
        age: 28,
        interests: ['スポーツ', '料理', '映画'],
        preferences: {
          communicationStyle: 'thoughtful',
          relationshipGoal: 'serious'
        }
      },
      importMetadata: {
        source: 'screenshot',
        version: '1.0',
        timestamp: new Date().toISOString(),
        extractedAt: new Date().toISOString()
      }
    }

    it('should generate comprehensive summary in Japanese', () => {
      const summary = generator.generateSummaryPrompt(completeData, 'ja')
      
      expect(summary).toContain('インポートデータサマリー')
      expect(summary).toContain('コネクション数: 2')
      expect(summary).toContain('プラットフォーム')
      expect(summary).toContain('pairs: 1')
      expect(summary).toContain('tinder: 1')
      expect(summary).toContain('最も有望なコネクション')
      expect(summary).toContain('高橋さん')
      expect(summary).toContain('平均スコア')
      expect(summary).toContain('魅力度: 7.5')
      expect(summary).toContain('相性: 7.5')
      expect(summary).toContain('コミュニケーション: 7')
    })

    it('should generate summary in English', () => {
      const summary = generator.generateSummaryPrompt(completeData, 'en')
      
      expect(summary).toContain('Import Data Summary')
      expect(summary).toContain('Number of connections: 2')
      expect(summary).toContain('Platform distribution')
      expect(summary).toContain('Most promising connection')
      expect(summary).toContain('Average scores')
      expect(summary).toContain('Attraction: 7.5')
    })

    it('should handle empty connections', () => {
      const emptyData: ImportedUserData = {
        connections: [],
        userProfile: {},
        importMetadata: {
          source: 'manual',
          version: '1.0',
          timestamp: new Date().toISOString()
        }
      }

      const summary = generator.generateSummaryPrompt(emptyData, 'ja')
      
      expect(summary).toContain('コネクション数: 0')
      expect(summary).toContain('プラットフォーム分布: なし')
      expect(summary).toContain('最も有望なコネクション: なし')
      expect(summary).toContain('平均スコア: N/A')
    })

    it('should include user profile summary when available', () => {
      const summary = generator.generateSummaryPrompt(completeData, 'ja')
      
      expect(summary).toContain('ユーザープロフィール')
      expect(summary).toContain('年齢: 28')
      expect(summary).toContain('興味: スポーツ, 料理, 映画')
      expect(summary).toContain('コミュニケーションスタイル: thoughtful')
      expect(summary).toContain('関係目標: serious')
    })
  })

  describe('generateErrorRecoveryPrompt', () => {
    it('should generate recovery prompt for parsing error', () => {
      const error = new Error('JSON parsing failed: Unexpected token')
      const originalData = '{ invalid json'
      const context: ImportContext = {
        platform: 'pairs' as ImportPlatform,
        dataType: 'text',
        language: 'ja'
      }

      const prompt = generator.generateErrorRecoveryPrompt(error, originalData, context)
      
      expect(prompt).toContain('データ抽出中にエラーが発生しました')
      expect(prompt).toContain('JSON parsing failed')
      expect(prompt).toContain('元のデータ')
      expect(prompt).toContain(originalData)
      expect(prompt).toContain('有効なJSON形式で')
    })

    it('should generate recovery prompt in English', () => {
      const error = new Error('Missing required field: nickname')
      const originalData = 'Some data'
      const context: ImportContext = {
        platform: 'tinder' as ImportPlatform,
        dataType: 'screenshot',
        language: 'en'
      }

      const prompt = generator.generateErrorRecoveryPrompt(error, originalData, context)
      
      expect(prompt).toContain('An error occurred during data extraction')
      expect(prompt).toContain('Missing required field')
      expect(prompt).toContain('Please try again')
      expect(prompt).toContain('valid JSON format')
    })
  })
})
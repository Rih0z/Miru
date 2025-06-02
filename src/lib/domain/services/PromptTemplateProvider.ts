import { PromptTemplate } from '@/types'
import { IPromptTemplateProvider } from '../interfaces/IPromptTemplateProvider'

export class PromptTemplateProvider implements IPromptTemplateProvider {
  private readonly promptTemplates: Record<string, PromptTemplate> = {
    first_message: {
      id: 'first_message',
      category: 'initial_contact',
      title: '最初のメッセージ作成',
      description: 'マッチング相手への初回メッセージを作成します',
      template: 'first_message_template',
      ai_types: ['claude', 'gpt', 'gemini']
    },
    date_invitation: {
      id: 'date_invitation',
      category: 'relationship_building',
      title: 'デートの誘い方',
      description: '自然で効果的なデートの誘い方を提案します',
      template: 'date_invitation_template',
      ai_types: ['claude', 'gpt', 'gemini']
    },
    progress_analysis: {
      id: 'progress_analysis',
      category: 'analysis',
      title: '関係性の進展分析',
      description: '現在の関係性を分析し、次のステップを提案します',
      template: 'progress_analysis_template',
      ai_types: ['claude', 'gpt', 'gemini']
    }
  }

  getPromptTemplate(promptType: string): PromptTemplate | null {
    return this.promptTemplates[promptType] || null
  }

  getAvailablePromptTypes(): string[] {
    return Object.keys(this.promptTemplates)
  }
}
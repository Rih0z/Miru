import { Connection, AIType, PromptTemplate } from '@/types'

export interface IPromptGenerator {
  generateFirstMessagePrompt(connection: Connection, aiType: AIType): string
  generateDateInvitationPrompt(connection: Connection, aiType: AIType): string
  generateProgressAnalysisPrompt(connection: Connection, aiType: AIType): string
  generateContextualPrompt(promptType: string, connection: Connection, aiType: AIType): string
  generateConversationPrompt(connection: Connection, aiType: AIType): string
  generateDatePrompt(connection: Connection, aiType: AIType): string
  generateRelationshipPrompt(connection: Connection, aiType: AIType): string
  generateGeneralPrompt(connection: Connection, aiType: AIType): string
  getPromptTemplate(promptType: string): PromptTemplate | null
  getAvailablePromptTypes(): string[]
}
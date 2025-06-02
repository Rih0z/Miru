import { PromptTemplate } from '@/types'

export interface IPromptTemplateProvider {
  getPromptTemplate(promptType: string): PromptTemplate | null
  getAvailablePromptTypes(): string[]
}
import { IConnectionRepository } from '@/lib/domain/interfaces/IConnectionRepository'
import { IScoreCalculator } from '@/lib/domain/interfaces/IScoreCalculator'
import { IActionRecommender } from '@/lib/domain/interfaces/IActionRecommender'
import { IConnectionValidator } from '@/lib/domain/interfaces/IConnectionValidator'
import { IHopeScoreCalculator } from '@/lib/domain/interfaces/IHopeScoreCalculator'
import { IStageScoreCalculator } from '@/lib/domain/interfaces/IStageScoreCalculator'
import { ICommunicationScoreCalculator } from '@/lib/domain/interfaces/ICommunicationScoreCalculator'
import { IEmotionalScoreCalculator } from '@/lib/domain/interfaces/IEmotionalScoreCalculator'
import { IPromptGenerator } from '@/lib/domain/interfaces/IPromptGenerator'
import { IPromptTemplateProvider } from '@/lib/domain/interfaces/IPromptTemplateProvider'
import { IContextFormatter } from '@/lib/domain/interfaces/IContextFormatter'
import { IPromptOrchestrator, IScreenshotProcessor } from '@/lib/domain/interfaces/IPromptOrchestrator'

import { SupabaseConnectionRepository } from '@/lib/infrastructure/repositories/SupabaseConnectionRepository'
import { RelationshipScoreCalculator } from '@/lib/domain/services/RelationshipScoreCalculator'
import { ActionRecommender } from '@/lib/domain/services/ActionRecommender'
import { ConnectionValidator } from '@/lib/domain/services/ConnectionValidator'
import { HopeScoreCalculator } from '@/lib/domain/services/HopeScoreCalculator'
import { StageScoreCalculator } from '@/lib/domain/services/StageScoreCalculator'
import { CommunicationScoreCalculator } from '@/lib/domain/services/CommunicationScoreCalculator'
import { EmotionalScoreCalculator } from '@/lib/domain/services/EmotionalScoreCalculator'
import { PromptGenerator } from '@/lib/domain/services/PromptGenerator'
import { PromptTemplateProvider } from '@/lib/domain/services/PromptTemplateProvider'
import { ContextFormatter } from '@/lib/domain/services/ContextFormatter'
import { ConnectionApplicationService } from '@/lib/application/services/ConnectionApplicationService'

// New Orchestration Services
import { UserContextManager } from '@/lib/domain/services/UserContextManager'
import { PromptOrchestrator } from '@/lib/domain/services/PromptOrchestrator'
import { ScreenshotProcessor } from '@/lib/domain/services/ScreenshotProcessor'
import { aiServiceManager } from '@/lib/infrastructure/adapters/AIServiceAdapter'

/**
 * Dependency Injection Container
 * 依存性注入コンテナ - Inversion of Control (IoC)
 */
export class DIContainer {
  private static instance: DIContainer
  private services = new Map<string, any>()

  private constructor() {
    this.registerServices()
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  private registerServices(): void {
    // Infrastructure Layer
    this.services.set('IConnectionRepository', new SupabaseConnectionRepository())
    
    // Domain Services - Score Calculators
    this.services.set('IStageScoreCalculator', new StageScoreCalculator())
    this.services.set('ICommunicationScoreCalculator', new CommunicationScoreCalculator())
    this.services.set('IEmotionalScoreCalculator', new EmotionalScoreCalculator())
    this.services.set('IHopeScoreCalculator', new HopeScoreCalculator(
      this.get<IStageScoreCalculator>('IStageScoreCalculator'),
      this.get<ICommunicationScoreCalculator>('ICommunicationScoreCalculator'),
      this.get<IEmotionalScoreCalculator>('IEmotionalScoreCalculator')
    ))
    
    // Domain Services - Prompt Generation
    this.services.set('IPromptTemplateProvider', new PromptTemplateProvider())
    this.services.set('IContextFormatter', new ContextFormatter())
    this.services.set('IPromptGenerator', new PromptGenerator(
      this.get<IPromptTemplateProvider>('IPromptTemplateProvider'),
      this.get<IContextFormatter>('IContextFormatter')
    ))
    
    // Domain Services - Other
    this.services.set('IScoreCalculator', new RelationshipScoreCalculator())
    this.services.set('IActionRecommender', new ActionRecommender())
    this.services.set('IConnectionValidator', new ConnectionValidator())
    
    // Orchestration Services
    this.services.set('UserContextManager', new UserContextManager())
    this.services.set('IPromptOrchestrator', new PromptOrchestrator(
      this.get<UserContextManager>('UserContextManager'),
      this.get<IPromptGenerator>('IPromptGenerator')
    ))
    this.services.set('IScreenshotProcessor', new ScreenshotProcessor(aiServiceManager))
    
    // Application Services
    this.services.set('ConnectionApplicationService', new ConnectionApplicationService(
      this.get<IConnectionRepository>('IConnectionRepository'),
      this.get<IScoreCalculator>('IScoreCalculator'),
      this.get<IActionRecommender>('IActionRecommender'),
      this.get<IConnectionValidator>('IConnectionValidator')
    ))
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName)
    if (!service) {
      throw new Error(`Service ${serviceName} not found`)
    }
    return service
  }

  // Factory methods for easy access
  getConnectionService(): ConnectionApplicationService {
    return this.get<ConnectionApplicationService>('ConnectionApplicationService')
  }

  getHopeScoreCalculator(): IHopeScoreCalculator {
    return this.get<IHopeScoreCalculator>('IHopeScoreCalculator')
  }

  getPromptGenerator(): IPromptGenerator {
    return this.get<IPromptGenerator>('IPromptGenerator')
  }

  // New Orchestration Factory Methods
  getPromptOrchestrator(): IPromptOrchestrator {
    return this.get<IPromptOrchestrator>('IPromptOrchestrator')
  }

  getUserContextManager(): UserContextManager {
    return this.get<UserContextManager>('UserContextManager')
  }

  getScreenshotProcessor(): IScreenshotProcessor {
    return this.get<IScreenshotProcessor>('IScreenshotProcessor')
  }
}
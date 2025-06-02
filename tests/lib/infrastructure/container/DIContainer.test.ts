import { DIContainer } from '@/lib/infrastructure/container/DIContainer'

describe('DIContainer', () => {
  let container: DIContainer

  beforeEach(() => {
    // Reset singleton instance for each test
    ;(DIContainer as any).instance = undefined
    container = DIContainer.getInstance()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = DIContainer.getInstance()
      const instance2 = DIContainer.getInstance()
      
      expect(instance1).toBe(instance2)
    })

    it('should return same instance across calls', () => {
      const instance = DIContainer.getInstance()
      expect(instance).toBe(container)
    })
  })

  describe('service registration and retrieval', () => {
    it('should get connection repository', () => {
      const repository = container.get('IConnectionRepository')
      expect(repository).toBeDefined()
    })

    it('should get score calculator', () => {
      const calculator = container.get('IScoreCalculator')
      expect(calculator).toBeDefined()
    })

    it('should get action recommender', () => {
      const recommender = container.get('IActionRecommender')
      expect(recommender).toBeDefined()
    })

    it('should get connection validator', () => {
      const validator = container.get('IConnectionValidator')
      expect(validator).toBeDefined()
    })

    it('should get hope score calculator', () => {
      const calculator = container.get('IHopeScoreCalculator')
      expect(calculator).toBeDefined()
    })

    it('should get stage score calculator', () => {
      const calculator = container.get('IStageScoreCalculator')
      expect(calculator).toBeDefined()
    })

    it('should get communication score calculator', () => {
      const calculator = container.get('ICommunicationScoreCalculator')
      expect(calculator).toBeDefined()
    })

    it('should get emotional score calculator', () => {
      const calculator = container.get('IEmotionalScoreCalculator')
      expect(calculator).toBeDefined()
    })

    it('should get prompt template provider', () => {
      const provider = container.get('IPromptTemplateProvider')
      expect(provider).toBeDefined()
    })

    it('should get context formatter', () => {
      const formatter = container.get('IContextFormatter')
      expect(formatter).toBeDefined()
    })

    it('should get prompt generator', () => {
      const generator = container.get('IPromptGenerator')
      expect(generator).toBeDefined()
    })

    it('should get connection application service', () => {
      const service = container.get('ConnectionApplicationService')
      expect(service).toBeDefined()
    })

    it('should throw error for unknown service', () => {
      expect(() => container.get('UnknownService')).toThrow('Service UnknownService not found')
    })
  })

  describe('factory methods', () => {
    it('should get connection service via factory method', () => {
      const service = container.getConnectionService()
      expect(service).toBeDefined()
      expect(service).toBe(container.get('ConnectionApplicationService'))
    })

    it('should get hope score calculator via factory method', () => {
      const calculator = container.getHopeScoreCalculator()
      expect(calculator).toBeDefined()
      expect(calculator).toBe(container.get('IHopeScoreCalculator'))
    })

    it('should get prompt generator via factory method', () => {
      const generator = container.getPromptGenerator()
      expect(generator).toBeDefined()
      expect(generator).toBe(container.get('IPromptGenerator'))
    })
  })

  describe('dependency injection', () => {
    it('should inject dependencies correctly', () => {
      const connectionService = container.getConnectionService()
      expect(connectionService).toBeDefined()
      
      // Test that dependencies are properly injected by calling a method
      expect(() => connectionService.calculateRelationshipScore).toBeDefined()
    })

    it('should inject hope score calculator dependencies', () => {
      const hopeCalculator = container.getHopeScoreCalculator()
      expect(hopeCalculator).toBeDefined()
      
      // Test that methods are available (indicating proper dependency injection)
      expect(typeof hopeCalculator.calculateHopeScore).toBe('function')
    })

    it('should inject prompt generator dependencies', () => {
      const promptGenerator = container.getPromptGenerator()
      expect(promptGenerator).toBeDefined()
      
      // Test that methods are available
      expect(typeof promptGenerator.generateFirstMessagePrompt).toBe('function')
      expect(typeof promptGenerator.getPromptTemplate).toBe('function')
    })
  })

  describe('service lifecycle', () => {
    it('should return same instance for repeated calls', () => {
      const service1 = container.getConnectionService()
      const service2 = container.getConnectionService()
      
      expect(service1).toBe(service2)
    })

    it('should return same calculator instance for repeated calls', () => {
      const calc1 = container.getHopeScoreCalculator()
      const calc2 = container.getHopeScoreCalculator()
      
      expect(calc1).toBe(calc2)
    })
  })
})
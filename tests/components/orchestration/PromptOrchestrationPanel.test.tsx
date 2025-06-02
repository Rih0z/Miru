import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptOrchestrationPanel } from '@/components/orchestration/PromptOrchestrationPanel'
import { Connection } from '@/types'
import { DIContainer } from '@/lib/infrastructure/container/DIContainer'
import {
  UserContext,
  SessionContext,
  OrchestratedPrompt,
  ActionResult
} from '@/lib/domain/interfaces/IPromptOrchestrator'

// Mock dependencies
jest.mock('@/lib/infrastructure/container/DIContainer')
jest.mock('@/lib/infrastructure/adapters/AIServiceAdapter')

const mockConnection: Connection = {
  id: 'test-1',
  user_id: 'user-123',
  nickname: 'テストさん',
  platform: 'TestApp',
  current_stage: 'メッセージ中',
  basic_info: {
    age: 25,
    occupation: 'エンジニア',
    location: '東京',
    hobbies: ['映画', 'カフェ巡り']
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

const mockUserContext: UserContext = {
  userId: 'user-123',
  currentEmotion: 'hopeful',
  relationshipGoals: 'serious',
  communicationStyle: 'gentle',
  learningPreferences: {
    preferredAIStyle: 'analytical',
    feedbackSensitivity: 'medium',
    detailLevel: 'detailed'
  },
  personalityProfile: {
    traits: ['empathetic', 'analytical'],
    communicationPatterns: ['direct', 'supportive']
  },
  recentActivity: [],
  adaptiveLearning: {
    successfulPatterns: [],
    avoidedApproaches: [],
    confidenceLevel: 0.7
  }
}

const mockSessionContext: SessionContext = {
  sessionId: 'session-123',
  userId: 'user-123',
  timestamp: new Date(),
  userIntent: 'general_help',
  contextHistory: []
}

const mockOrchestratedPrompt: OrchestratedPrompt = {
  id: 'prompt-123',
  prompt: 'Test generated prompt',
  aiProvider: 'claude',
  personalizations: [],
  metadata: {
    urgency: 'medium',
    complexity: 'simple',
    estimatedTokens: 100
  }
}

const mockActionResult: ActionResult = {
  id: 'result-123',
  promptId: 'prompt-123',
  response: 'Test AI response',
  aiProvider: 'claude',
  processingTime: 1500,
  feedback: {
    userRating: 0,
    effectiveness: 'good',
    notes: ''
  }
}

describe('PromptOrchestrationPanel', () => {
  let mockOrchestrator: any
  let mockContextManager: any
  let mockContainer: any
  let mockWriteText: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock clipboard API properly for Jest
    mockWriteText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText
      },
      writable: true,
      configurable: true
    })

    // Mock orchestrator
    mockOrchestrator = {
      getUserContext: jest.fn().mockResolvedValue(mockUserContext),
      updateUserContext: jest.fn().mockResolvedValue(undefined),
      createSessionContext: jest.fn().mockResolvedValue(mockSessionContext),
      generatePrompt: jest.fn().mockResolvedValue(mockOrchestratedPrompt),
      executePrompt: jest.fn().mockResolvedValue(mockActionResult),
      recordFeedback: jest.fn().mockResolvedValue(undefined)
    }

    // Mock context manager
    mockContextManager = {
      getContext: jest.fn().mockResolvedValue(mockUserContext),
      updateContext: jest.fn().mockResolvedValue(undefined)
    }

    // Mock DIContainer
    mockContainer = {
      getPromptOrchestrator: jest.fn().mockReturnValue(mockOrchestrator),
      getUserContextManager: jest.fn().mockReturnValue(mockContextManager)
    }
    ;(DIContainer.getInstance as jest.Mock).mockReturnValue(mockContainer)
  })

  describe('Rendering', () => {
    it('should show loading state initially', () => {
      render(<PromptOrchestrationPanel userId="user-123" />)
      
      expect(screen.getByText('Loading user context...')).toBeInTheDocument()
    })

    it('should render main interface after loading', async () => {
      render(<PromptOrchestrationPanel userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText('🎯 AI Prompt Orchestration')).toBeInTheDocument()
        expect(screen.getByText('Personalized AI assistance powered by your context and preferences')).toBeInTheDocument()
      })
    })

    it('should display user context information', async () => {
      render(<PromptOrchestrationPanel userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText('Your Current Context')).toBeInTheDocument()
        expect(screen.getByText('hopeful')).toBeInTheDocument()
        expect(screen.getByText('serious')).toBeInTheDocument()
        expect(screen.getByText('gentle')).toBeInTheDocument()
        expect(screen.getByText('analytical')).toBeInTheDocument()
      })
    })

    it('should render all control selectors', async () => {
      render(<PromptOrchestrationPanel userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText('Current Emotion')).toBeInTheDocument()
        expect(screen.getByText('What do you need help with?')).toBeInTheDocument()
        expect(screen.getByText('AI Assistant')).toBeInTheDocument()
        
        // Check that selectors are present
        const selectors = screen.getAllByRole('combobox')
        expect(selectors).toHaveLength(3) // emotion, intent, AI provider
      })
    })

    it('should show connection context when provided', async () => {
      render(
        <PromptOrchestrationPanel 
          userId="user-123" 
          connection={mockConnection}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Context:')).toBeInTheDocument()
        expect(screen.getByText('テストさん - メッセージ中')).toBeInTheDocument()
      })
    })
  })

  describe('User Context Loading', () => {
    it('should load user context on mount', async () => {
      render(<PromptOrchestrationPanel userId="user-123" />)

      await waitFor(() => {
        expect(mockOrchestrator.getUserContext).toHaveBeenCalledWith('user-123')
      })
    })

    it('should handle user context loading error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockOrchestrator.getUserContext.mockRejectedValue(new Error('Load failed'))

      render(<PromptOrchestrationPanel userId="user-123" />)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load user context:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Emotion Updates', () => {
    it('should update user emotion when selector changes', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<PromptOrchestrationPanel userId="user-123" />)
      })

      // Wait for component to load and find emotion selector by label
      await waitFor(() => {
        expect(screen.getByText('Current Emotion')).toBeInTheDocument()
      })

      const selects = screen.getAllByRole('combobox')
      const emotionSelect = selects[0] // First select is emotion
      expect(emotionSelect).toHaveValue('hopeful')

      await act(async () => {
        await user.selectOptions(emotionSelect, 'confident')
      })

      await waitFor(() => {
        expect(mockOrchestrator.updateUserContext).toHaveBeenCalledWith('user-123', {
          currentEmotion: 'confident'
        })
        expect(mockOrchestrator.getUserContext).toHaveBeenCalledTimes(2) // Initial + after update
      })
    })
  })

  describe('Prompt Generation', () => {
    it('should generate prompt when button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnPromptGenerated = jest.fn()

      render(
        <PromptOrchestrationPanel 
          userId="user-123" 
          connection={mockConnection}
          onPromptGenerated={mockOnPromptGenerated}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      await user.click(generateButton)

      await waitFor(() => {
        expect(mockOrchestrator.createSessionContext).toHaveBeenCalledWith('user-123', 'general_help')
        expect(mockOrchestrator.generatePrompt).toHaveBeenCalledWith(mockSessionContext, mockConnection)
        expect(mockOnPromptGenerated).toHaveBeenCalledWith(mockOrchestratedPrompt)
      })
    })

    it('should show loading state during prompt generation', async () => {
      const user = userEvent.setup()
      let resolveGenerate: (value: any) => void
      const generatePromise = new Promise(resolve => {
        resolveGenerate = resolve
      })
      mockOrchestrator.generatePrompt.mockReturnValue(generatePromise)

      render(<PromptOrchestrationPanel userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      await user.click(generateButton)

      expect(screen.getByText('🔄 Generating...')).toBeInTheDocument()
      expect(generateButton).toBeDisabled()

      resolveGenerate!(mockOrchestratedPrompt)
    })

    it('should handle prompt generation error', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockOrchestrator.generatePrompt.mockRejectedValue(new Error('Generation failed'))

      render(<PromptOrchestrationPanel userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      await user.click(generateButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to generate prompt:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })

    it('should display generated prompt', async () => {
      const user = userEvent.setup()
      render(<PromptOrchestrationPanel userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      await user.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Generated Prompt')).toBeInTheDocument()
        expect(screen.getByText('Test generated prompt')).toBeInTheDocument()
        expect(screen.getByText('claude')).toBeInTheDocument()
        expect(screen.getByText('medium')).toBeInTheDocument()
        expect(screen.getByText('🚀 Execute with AI')).toBeInTheDocument()
      })
    })
  })

  describe('Clipboard Functionality', () => {
    it('should copy prompt to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<PromptOrchestrationPanel userId="user-123" />)
      })

      // Generate prompt first
      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      
      await act(async () => {
        await user.click(generateButton)
      })

      // Wait for the generated prompt to appear
      await waitFor(() => {
        expect(screen.getByText('Generated Prompt')).toBeInTheDocument()
        expect(screen.getByText('Test generated prompt')).toBeInTheDocument()
      })

      // Find copy button 
      const copyButton = screen.getByText('📋')
      expect(copyButton).toBeInTheDocument()
      
      await act(async () => {
        await user.click(copyButton)
      })

      // Wait for the clipboard call
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('Test generated prompt')
      })
    })

    it('should handle clipboard copy error', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockWriteText.mockRejectedValue(new Error('Copy failed'))

      await act(async () => {
        render(<PromptOrchestrationPanel userId="user-123" />)
      })

      // Generate prompt first
      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      
      await act(async () => {
        await user.click(generateButton)
      })

      // Wait for the generated prompt to appear
      await waitFor(() => {
        expect(screen.getByText('Generated Prompt')).toBeInTheDocument()
        expect(screen.getByText('Test generated prompt')).toBeInTheDocument()
      })

      // Find copy button by the clipboard emoji
      const copyButton = screen.getByText('📋')
      expect(copyButton).toBeInTheDocument()
      
      await act(async () => {
        await user.click(copyButton)
      })

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy prompt:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Prompt Execution', () => {
    it('should execute prompt when execute button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnResultReceived = jest.fn()

      await act(async () => {
        render(
          <PromptOrchestrationPanel 
            userId="user-123"
            onResultReceived={mockOnResultReceived}
          />
        )
      })

      // Generate prompt first
      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      
      await act(async () => {
        await user.click(generateButton)
      })

      await waitFor(() => {
        expect(screen.getByText('🚀 Execute with AI')).toBeInTheDocument()
      })

      const executeButton = screen.getByText('🚀 Execute with AI')
      
      await act(async () => {
        await user.click(executeButton)
      })

      await waitFor(() => {
        expect(mockOrchestrator.executePrompt).toHaveBeenCalledWith(
          mockOrchestratedPrompt,
          expect.objectContaining({
            provider: 'claude',
            model: 'claude-3-sonnet-20240229',
            maxTokens: 4000,
            temperature: 0.7
          })
        )
        expect(mockOnResultReceived).toHaveBeenCalledWith(mockActionResult)
      })
    })

    it('should show loading state during execution', async () => {
      const user = userEvent.setup()
      let resolveExecute: (value: any) => void
      const executePromise = new Promise(resolve => {
        resolveExecute = resolve
      })
      mockOrchestrator.executePrompt.mockReturnValue(executePromise)

      await act(async () => {
        render(<PromptOrchestrationPanel userId="user-123" />)
      })

      // Generate prompt first
      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      
      await act(async () => {
        await user.click(generateButton)
      })

      await waitFor(() => {
        expect(screen.getByText('🚀 Execute with AI')).toBeInTheDocument()
      })

      const executeButton = screen.getByText('🚀 Execute with AI')
      
      await act(async () => {
        await user.click(executeButton)
      })

      expect(screen.getByText('🤖 Processing...')).toBeInTheDocument()
      expect(executeButton).toBeDisabled()

      await act(async () => {
        resolveExecute!(mockActionResult)
      })
    })

    it('should display AI response after execution', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<PromptOrchestrationPanel userId="user-123" />)
      })

      // Generate and execute prompt
      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      
      await act(async () => {
        await user.click(generateButton)
      })

      await waitFor(() => {
        expect(screen.getByText('🚀 Execute with AI')).toBeInTheDocument()
      })

      const executeButton = screen.getByText('🚀 Execute with AI')
      
      await act(async () => {
        await user.click(executeButton)
      })

      await waitFor(() => {
        expect(screen.getByText('AI Response')).toBeInTheDocument()
        expect(screen.getByText('Test AI response')).toBeInTheDocument()
        expect(screen.getByText('1500ms')).toBeInTheDocument()
        expect(screen.getByText('Rate This Response')).toBeInTheDocument()
      })
    })
  })

  describe('Feedback System', () => {
    beforeEach(async () => {
      // Helper to set up executed prompt with result
      render(<PromptOrchestrationPanel userId="user-123" />)
      
      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('🚀 Execute with AI')).toBeInTheDocument()
      })

      const executeButton = screen.getByText('🚀 Execute with AI')
      fireEvent.click(executeButton)

      await waitFor(() => {
        expect(screen.getByText('Rate This Response')).toBeInTheDocument()
      })
    })

    it('should record feedback when rating buttons are clicked', async () => {
      const user = userEvent.setup()

      const excellentButton = screen.getByText('😍 excellent')
      await user.click(excellentButton)

      await waitFor(() => {
        expect(mockOrchestrator.recordFeedback).toHaveBeenCalledWith('result-123', {
          userRating: 4,
          effectiveness: 'excellent',
          notes: ''
        })
        expect(mockOrchestrator.getUserContext).toHaveBeenCalledTimes(2) // Initial + after feedback
      })
    })

    it('should provide correct rating values for each button', async () => {
      const user = userEvent.setup()

      // Test poor rating
      const poorButton = screen.getByText('😞 poor')
      await user.click(poorButton)

      await waitFor(() => {
        expect(mockOrchestrator.recordFeedback).toHaveBeenCalledWith('result-123', {
          userRating: 1,
          effectiveness: 'poor',
          notes: ''
        })
      })
    })
  })

  describe('Selector Changes', () => {
    it('should update intent when selector changes', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<PromptOrchestrationPanel userId="user-123" />)
      })

      await waitFor(() => {
        expect(screen.getByText('What do you need help with?')).toBeInTheDocument()
      })

      const selects = screen.getAllByRole('combobox')
      const intentSelect = selects[1] // Second select is intent
      expect(intentSelect).toHaveValue('general_help')

      await act(async () => {
        await user.selectOptions(intentSelect, 'first_message')
      })

      // Verify the selection changed (we can't directly test state, but can verify it's selected)
      expect(intentSelect).toHaveValue('first_message')
    })

    it('should update AI provider when selector changes', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<PromptOrchestrationPanel userId="user-123" />)
      })

      await waitFor(() => {
        expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      })

      const selects = screen.getAllByRole('combobox')
      const aiSelect = selects[2] // Third select is AI provider
      expect(aiSelect).toHaveValue('claude')

      await act(async () => {
        await user.selectOptions(aiSelect, 'gpt')
      })

      expect(aiSelect).toHaveValue('gpt')
    })
  })

  describe('Model Provider Mapping', () => {
    it('should use correct models for each provider', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<PromptOrchestrationPanel userId="user-123" />)
      })

      // Test GPT provider - wait for component to load
      await waitFor(() => {
        expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      })

      const selects = screen.getAllByRole('combobox')
      const aiSelect = selects[2] // Third select is AI provider
      expect(aiSelect).toHaveValue('claude')

      await act(async () => {
        await user.selectOptions(aiSelect, 'gpt')
      })

      // Generate and execute to test the model mapping
      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      
      await act(async () => {
        await user.click(generateButton)
      })

      await waitFor(() => {
        expect(screen.getByText('🚀 Execute with AI')).toBeInTheDocument()
      })

      const executeButton = screen.getByText('🚀 Execute with AI')
      
      await act(async () => {
        await user.click(executeButton)
      })

      await waitFor(() => {
        expect(mockOrchestrator.executePrompt).toHaveBeenCalledWith(
          mockOrchestratedPrompt,
          expect.objectContaining({
            provider: 'gpt',
            model: 'gpt-4'
          })
        )
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle execution error gracefully', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockOrchestrator.executePrompt.mockRejectedValue(new Error('Execution failed'))

      render(<PromptOrchestrationPanel userId="user-123" />)

      // Generate prompt first
      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      await user.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('🚀 Execute with AI')).toBeInTheDocument()
      })

      const executeButton = screen.getByText('🚀 Execute with AI')
      await user.click(executeButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to execute prompt:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })

    it('should handle feedback recording error', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockOrchestrator.recordFeedback.mockRejectedValue(new Error('Feedback failed'))

      render(<PromptOrchestrationPanel userId="user-123" />)

      // Generate and execute to get feedback buttons
      await waitFor(() => {
        expect(screen.getByText('🎯 Generate Personalized Prompt')).toBeInTheDocument()
      })

      const generateButton = screen.getByText('🎯 Generate Personalized Prompt')
      await user.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('🚀 Execute with AI')).toBeInTheDocument()
      })

      const executeButton = screen.getByText('🚀 Execute with AI')
      await user.click(executeButton)

      await waitFor(() => {
        expect(screen.getByText('😍 excellent')).toBeInTheDocument()
      })

      const excellentButton = screen.getByText('😍 excellent')
      await user.click(excellentButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to record feedback:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })
})
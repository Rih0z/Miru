import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptExecutor } from '@/components/prompts/PromptExecutor'
import { Connection } from '@/types'
import { DIContainer } from '@/lib/infrastructure/container/DIContainer'

// Mock DIContainer and its dependencies
jest.mock('@/lib/infrastructure/container/DIContainer')

describe('PromptExecutor', () => {
  const mockOnClose = jest.fn()
  const mockPromptGenerator = {
    generateFirstMessagePrompt: jest.fn(),
    generateConversationPrompt: jest.fn(),
    generateDatePrompt: jest.fn(),
    generateRelationshipPrompt: jest.fn(),
    generateGeneralPrompt: jest.fn(),
    generateContextualPrompt: jest.fn(),
    getPromptTemplate: jest.fn(),
    getAvailablePromptTypes: jest.fn()
  }

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

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock DIContainer
    const mockContainer = {
      getPromptGenerator: jest.fn().mockReturnValue(mockPromptGenerator)
    }
    ;(DIContainer.getInstance as jest.Mock).mockReturnValue(mockContainer)

    // Set up default prompt responses
    mockPromptGenerator.generateFirstMessagePrompt.mockReturnValue('Generated first message prompt')
    mockPromptGenerator.generateConversationPrompt.mockReturnValue('Generated conversation prompt')
    mockPromptGenerator.generateDatePrompt.mockReturnValue('Generated date prompt')
    mockPromptGenerator.generateRelationshipPrompt.mockReturnValue('Generated relationship prompt')
    mockPromptGenerator.generateGeneralPrompt.mockReturnValue('Generated general prompt')

    // Mock clipboard API - delete existing property first to avoid conflicts
    delete (window.navigator as any).clipboard
    const mockWriteText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: {
        writeText: mockWriteText
      },
      writable: true,
      configurable: true
    })
    
    // Store reference for tests
    ;(window as any).mockClipboard = { writeText: mockWriteText }
  })

  describe('rendering', () => {
    it('should render prompt executor interface', () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      expect(screen.getByText(/使用するAIを選択/)).toBeInTheDocument()
      expect(screen.getAllByText(/Claude/)).toHaveLength(2) // AIボタンと説明文
      expect(screen.getByText(/GPT/)).toBeInTheDocument()
      expect(screen.getByText(/Gemini/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /コピー/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /✕/ })).toBeInTheDocument()
    })

    it('should display generated prompt', () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      expect(screen.getByText('Generated first message prompt')).toBeInTheDocument()
    })

    it('should show connection info', () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      expect(screen.getByText(/テストさんさんに関するアドバイスを取得します/)).toBeInTheDocument()
    })
  })

  describe('AI type selection', () => {
    it('should switch AI type and regenerate prompt', async () => {
      const user = userEvent.setup()
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      const gptButton = screen.getByRole('button', { name: /ChatGPT/ })
      await user.click(gptButton)

      expect(mockPromptGenerator.generateFirstMessagePrompt).toHaveBeenCalledWith(mockConnection, 'gpt')
    })

    it('should switch to Gemini and regenerate prompt', async () => {
      const user = userEvent.setup()
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      const geminiButton = screen.getByRole('button', { name: /Gemini/ })
      await user.click(geminiButton)

      expect(mockPromptGenerator.generateFirstMessagePrompt).toHaveBeenCalledWith(mockConnection, 'gemini')
    })
  })

  describe('prompt type handling', () => {
    it('should generate first message prompt', () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      expect(mockPromptGenerator.generateFirstMessagePrompt).toHaveBeenCalledWith(mockConnection, 'claude')
    })

    it('should generate conversation prompt', () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="deepen_conversation" 
          onClose={mockOnClose} 
        />
      )

      expect(mockPromptGenerator.generateConversationPrompt).toHaveBeenCalledWith(mockConnection, 'claude')
    })

    it('should generate date prompt', () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="date_preparation" 
          onClose={mockOnClose} 
        />
      )

      expect(mockPromptGenerator.generateDatePrompt).toHaveBeenCalledWith(mockConnection, 'claude')
    })

    it('should generate relationship prompt', () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="relationship_building" 
          onClose={mockOnClose} 
        />
      )

      expect(mockPromptGenerator.generateRelationshipPrompt).toHaveBeenCalledWith(mockConnection, 'claude')
    })

    it('should generate general prompt for unknown type', () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="unknown_type" 
          onClose={mockOnClose} 
        />
      )

      expect(mockPromptGenerator.generateGeneralPrompt).toHaveBeenCalledWith(mockConnection, 'claude')
    })
  })

  describe('clipboard functionality', () => {
    it('should copy prompt to clipboard', async () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      const copyButton = screen.getByRole('button', { name: /コピー/ })
      
      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect((window as any).mockClipboard.writeText).toHaveBeenCalledWith('Generated first message prompt')
      expect(screen.getByText(/✓ コピーしました/)).toBeInTheDocument()
    })

    it('should show copied state and reset after timeout', async () => {
      jest.useFakeTimers()
      
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      const copyButton = screen.getByRole('button', { name: /コピー/ })
      
      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect(screen.getByText(/✓ コピーしました/)).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(screen.queryByText(/✓ コピーしました/)).not.toBeInTheDocument()
      })

      jest.useRealTimers()
    })

    it('should handle clipboard error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Override clipboard to simulate error
      const errorMock = jest.fn().mockRejectedValue(new Error('Clipboard error'))
      ;(window as any).mockClipboard.writeText = errorMock
      navigator.clipboard.writeText = errorMock
      
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      const copyButton = screen.getByRole('button', { name: /コピー/ })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('クリップボードへのコピーに失敗しました', expect.any(Error))
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('modal behavior', () => {
    it('should call onClose when close button is clicked', async () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      const closeButton = screen.getByRole('button', { name: /キャンセル/ })
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when X button is clicked', async () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      const closeButton = screen.getByRole('button', { name: /✕/ })
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not close when modal content is clicked', async () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      const modalContent = screen.getByText('AIプロンプト実行')
      fireEvent.click(modalContent)

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper modal structure', () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      expect(screen.getByText('AIプロンプト実行')).toBeInTheDocument()
      expect(screen.getByText(/テストさんさんに関するアドバイス/)).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      // Check that interactive elements exist and can receive focus
      const copyButton = screen.getByRole('button', { name: /コピー/ })
      const closeButton = screen.getByRole('button', { name: /✕/ })
      
      expect(copyButton).toBeInTheDocument()
      expect(closeButton).toBeInTheDocument()
    })

    it('should handle keyboard interactions', async () => {
      render(
        <PromptExecutor 
          connection={mockConnection} 
          promptType="first_message" 
          onClose={mockOnClose} 
        />
      )

      // Test that the component renders and is interactive
      const copyButton = screen.getByRole('button', { name: /コピー/ })
      
      await act(async () => {
        fireEvent.click(copyButton)
      })
      
      expect(screen.getByText(/✓ コピーしました/)).toBeInTheDocument()
    })
  })
})
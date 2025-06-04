import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ScreenshotUpload } from '@/components/orchestration/ScreenshotUpload'
import { DIContainer } from '@/lib/infrastructure/container/DIContainer'
import { ScreenshotAnalysis, ConversationData } from '@/lib/domain/interfaces/IPromptOrchestrator'

// Mock react-dropzone
const mockUseDropzone = jest.fn()
jest.mock('react-dropzone', () => ({
  useDropzone: (config: any) => mockUseDropzone(config)
}))

// Mock DIContainer
const mockScreenshotProcessor = {
  processScreenshot: jest.fn(),
  extractConversationData: jest.fn(),
  updateConnectionFromScreenshot: jest.fn()
}

jest.mock('@/lib/infrastructure/container/DIContainer', () => ({
  DIContainer: {
    getInstance: () => ({
      getScreenshotProcessor: () => mockScreenshotProcessor
    })
  }
}))

// Mock URL.createObjectURL
const mockCreateObjectURL = jest.fn()
global.URL.createObjectURL = mockCreateObjectURL

describe('ScreenshotUpload', () => {
  const mockOnAnalysisComplete = jest.fn()
  const mockOnConnectionUpdated = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateObjectURL.mockReturnValue('mock-image-url')
    
    // Default dropzone mock
    mockUseDropzone.mockReturnValue({
      getRootProps: () => ({ 'data-testid': 'dropzone' }),
      getInputProps: () => ({ 'data-testid': 'file-input' }),
      isDragActive: false
    })
  })

  it('renders initial upload area', () => {
    render(<ScreenshotUpload />)
    
    expect(screen.getByText('Drop your dating app screenshot here')).toBeInTheDocument()
    expect(screen.getByText('or click to browse files')).toBeInTheDocument()
    expect(screen.getByText('Supports LINE, WhatsApp, Tinder, Bumble, and other messaging apps')).toBeInTheDocument()
    expect(screen.getByText('📱')).toBeInTheDocument()
  })

  it('shows drag active state', () => {
    mockUseDropzone.mockReturnValue({
      getRootProps: () => ({ 'data-testid': 'dropzone' }),
      getInputProps: () => ({ 'data-testid': 'file-input' }),
      isDragActive: true
    })

    render(<ScreenshotUpload />)
    
    // Component should respond to drag active state
    expect(mockUseDropzone).toHaveBeenCalledWith(
      expect.objectContaining({
        accept: {
          'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
        },
        maxFiles: 1,
        disabled: false
      })
    )
  })

  it('configures dropzone correctly', () => {
    render(<ScreenshotUpload />)
    
    expect(mockUseDropzone).toHaveBeenCalledWith(
      expect.objectContaining({
        onDrop: expect.any(Function),
        accept: {
          'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
        },
        maxFiles: 1,
        disabled: false
      })
    )
  })

  it('processes file upload successfully', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
    const mockAnalysis: ScreenshotAnalysis = {
      imageMetadata: {
        app: 'LINE',
        source: 'mobile',
        timestamp: '2023-01-01T00:00:00Z',
        quality: 'high'
      },
      detectedElements: {
        messages: [
          {
            id: '1',
            content: 'Hello!',
            sender: 'user',
            timestamp: '2023-01-01T00:00:00Z'
          }
        ],
        userInterface: {
          inputField: true,
          sendButton: true,
          profileInfo: false
        }
      },
      confidence: 0.95,
      rawText: 'Hello!'
    }

    const mockConversationData: ConversationData = {
      lastMessage: {
        content: 'Hello!',
        sender: 'user',
        timestamp: '2023-01-01T00:00:00Z',
        sentiment: 'positive'
      },
      conversationFlow: {
        messageFrequency: 'daily',
        emotionalTone: 'positive',
        topicProgression: ['greeting']
      },
      contextUpdates: {
        currentStage: 'メッセージ中'
      }
    }

    mockScreenshotProcessor.processScreenshot.mockResolvedValue(mockAnalysis)
    mockScreenshotProcessor.extractConversationData.mockResolvedValue(mockConversationData)

    let onDropCallback: Function
    mockUseDropzone.mockImplementation((config: any) => {
      onDropCallback = config.onDrop
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false
      }
    })

    render(
      <ScreenshotUpload 
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    )

    // Trigger file drop
    await onDropCallback!([mockFile])

    await waitFor(() => {
      expect(mockScreenshotProcessor.processScreenshot).toHaveBeenCalledWith(mockFile)
      expect(mockScreenshotProcessor.extractConversationData).toHaveBeenCalledWith(mockAnalysis)
      expect(mockOnAnalysisComplete).toHaveBeenCalledWith(mockAnalysis, mockConversationData)
    })

    // Check if analysis results are displayed
    expect(screen.getByText('📊 Analysis Results')).toBeInTheDocument()
    expect(screen.getByText('LINE')).toBeInTheDocument()
    expect(screen.getByText('95.0%')).toBeInTheDocument()
    expect(screen.getByText('💬 Extracted Messages')).toBeInTheDocument()
    expect(screen.getAllByText('Hello!')).toHaveLength(2) // Once in extracted messages, once in conversation data
  })

  it('handles file processing error', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
    const errorMessage = 'Failed to process image'

    mockScreenshotProcessor.processScreenshot.mockRejectedValue(new Error(errorMessage))

    let onDropCallback: Function
    mockUseDropzone.mockImplementation((config: any) => {
      onDropCallback = config.onDrop
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false
      }
    })

    render(<ScreenshotUpload />)

    // Trigger file drop
    await onDropCallback!([mockFile])

    await waitFor(() => {
      expect(screen.getByText('Processing Error')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('shows processing state during upload', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
    
    // Make processScreenshot hang to test loading state
    let resolveProcessing: Function
    mockScreenshotProcessor.processScreenshot.mockReturnValue(
      new Promise((resolve) => { resolveProcessing = resolve })
    )

    let onDropCallback: Function
    mockUseDropzone.mockImplementation((config: any) => {
      onDropCallback = config.onDrop
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false
      }
    })

    render(<ScreenshotUpload />)

    // Trigger file drop
    onDropCallback!([mockFile])

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText('🤖 Processing screenshot with AI...')).toBeInTheDocument()
      expect(screen.getByText('Analyzing conversation patterns and extracting data')).toBeInTheDocument()
    })

    // Clean up
    resolveProcessing({})
  })

  it('updates connection when connectionId provided', async () => {
    const connectionId = 'test-connection-id'
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
    const mockAnalysis: ScreenshotAnalysis = {
      imageMetadata: {
        app: 'LINE',
        source: 'mobile',
        timestamp: '2023-01-01T00:00:00Z',
        quality: 'high'
      },
      detectedElements: {
        messages: [],
        userInterface: {
          inputField: true,
          sendButton: true,
          profileInfo: false
        }
      },
      confidence: 0.95,
      rawText: ''
    }

    const mockConversationData: ConversationData = {
      lastMessage: {
        content: 'Hello!',
        sender: 'user',
        timestamp: '2023-01-01T00:00:00Z',
        sentiment: 'positive'
      },
      conversationFlow: {
        messageFrequency: 'daily',
        emotionalTone: 'positive',
        topicProgression: []
      },
      contextUpdates: {}
    }

    const mockUpdatedConnection = {
      id: connectionId,
      nickname: 'Test User',
      current_stage: 'メッセージ中'
    }

    mockScreenshotProcessor.processScreenshot.mockResolvedValue(mockAnalysis)
    mockScreenshotProcessor.extractConversationData.mockResolvedValue(mockConversationData)
    mockScreenshotProcessor.updateConnectionFromScreenshot.mockResolvedValue(mockUpdatedConnection)

    let onDropCallback: Function
    mockUseDropzone.mockImplementation((config: any) => {
      onDropCallback = config.onDrop
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false
      }
    })

    render(
      <ScreenshotUpload 
        connectionId={connectionId}
        onConnectionUpdated={mockOnConnectionUpdated}
      />
    )

    // Trigger file drop
    await onDropCallback!([mockFile])

    await waitFor(() => {
      expect(mockScreenshotProcessor.updateConnectionFromScreenshot).toHaveBeenCalledWith(
        connectionId,
        mockConversationData
      )
      expect(mockOnConnectionUpdated).toHaveBeenCalledWith(mockUpdatedConnection)
    })
  })

  it('displays uploaded image preview', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
    const mockImageUrl = 'mock-blob-url'
    mockCreateObjectURL.mockReturnValue(mockImageUrl)

    mockScreenshotProcessor.processScreenshot.mockResolvedValue({
      imageMetadata: { app: 'LINE', source: 'mobile', timestamp: '', quality: 'high' },
      detectedElements: { messages: [], userInterface: { inputField: true, sendButton: true, profileInfo: false } },
      confidence: 0.95,
      rawText: ''
    })
    mockScreenshotProcessor.extractConversationData.mockResolvedValue({
      lastMessage: { content: '', sender: 'user', timestamp: '', sentiment: 'neutral' },
      conversationFlow: { messageFrequency: 'daily', emotionalTone: 'neutral', topicProgression: [] },
      contextUpdates: {}
    })

    let onDropCallback: Function
    mockUseDropzone.mockImplementation((config: any) => {
      onDropCallback = config.onDrop
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false
      }
    })

    render(<ScreenshotUpload />)

    // Trigger file drop
    await onDropCallback!([mockFile])

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockFile)
      expect(screen.getByText('Uploaded Screenshot')).toBeInTheDocument()
      expect(screen.getByAltText('Uploaded screenshot')).toBeInTheDocument()
      expect(screen.getByAltText('Uploaded screenshot')).toHaveAttribute('src', mockImageUrl)
    })
  })

  it('resets state when reset button clicked', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })

    mockScreenshotProcessor.processScreenshot.mockResolvedValue({
      imageMetadata: { app: 'LINE', source: 'mobile', timestamp: '', quality: 'high' },
      detectedElements: { messages: [], userInterface: { inputField: true, sendButton: true, profileInfo: false } },
      confidence: 0.95,
      rawText: ''
    })
    mockScreenshotProcessor.extractConversationData.mockResolvedValue({
      lastMessage: { content: '', sender: 'user', timestamp: '', sentiment: 'neutral' },
      conversationFlow: { messageFrequency: 'daily', emotionalTone: 'neutral', topicProgression: [] },
      contextUpdates: {}
    })

    let onDropCallback: Function
    mockUseDropzone.mockImplementation((config: any) => {
      onDropCallback = config.onDrop
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false
      }
    })

    render(<ScreenshotUpload />)

    // Trigger file drop
    await onDropCallback!([mockFile])

    await waitFor(() => {
      expect(screen.getByText('📊 Analysis Results')).toBeInTheDocument()
    })

    // Click reset button
    const resetButton = screen.getByText('Upload Another Screenshot')
    fireEvent.click(resetButton)

    // Check that analysis results are no longer displayed
    expect(screen.queryByText('📊 Analysis Results')).not.toBeInTheDocument()
    expect(screen.queryByText('Uploaded Screenshot')).not.toBeInTheDocument()
  })

  it('disables dropzone during processing', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
    
    // Make processScreenshot hang to test disabled state
    let resolveProcessing: Function
    mockScreenshotProcessor.processScreenshot.mockReturnValue(
      new Promise((resolve) => { resolveProcessing = resolve })
    )

    let onDropCallback: Function
    let latestConfig: any
    mockUseDropzone.mockImplementation((config: any) => {
      latestConfig = config
      onDropCallback = config.onDrop
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false
      }
    })

    const { rerender } = render(<ScreenshotUpload />)

    // Initially should not be disabled
    expect(latestConfig.disabled).toBe(false)

    // Trigger file drop
    onDropCallback!([mockFile])

    // Force re-render to see updated disabled state
    rerender(<ScreenshotUpload />)

    await waitFor(() => {
      expect(latestConfig.disabled).toBe(true)
    })

    // Clean up
    resolveProcessing({})
  })

  it('handles no file dropped', async () => {
    let onDropCallback: Function
    mockUseDropzone.mockImplementation((config: any) => {
      onDropCallback = config.onDrop
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false
      }
    })

    render(<ScreenshotUpload />)

    // Trigger drop with no files
    await onDropCallback!([])

    // Should not process anything
    expect(mockScreenshotProcessor.processScreenshot).not.toHaveBeenCalled()
  })

  it('displays conversation data insights', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
    const mockAnalysis: ScreenshotAnalysis = {
      imageMetadata: { app: 'LINE', source: 'mobile', timestamp: '', quality: 'high' },
      detectedElements: { messages: [], userInterface: { inputField: true, sendButton: true, profileInfo: false } },
      confidence: 0.95,
      rawText: ''
    }

    const mockConversationData: ConversationData = {
      lastMessage: {
        content: 'How was your day?',
        sender: 'other',
        timestamp: '2023-01-01T00:00:00Z',
        sentiment: 'positive'
      },
      conversationFlow: {
        messageFrequency: 'daily',
        emotionalTone: 'warm',
        topicProgression: ['casual', 'personal']
      },
      contextUpdates: {
        currentStage: 'LINE交換済み',
        newHobbies: ['music', 'travel'],
        communicationChanges: {
          style: 'more intimate'
        }
      }
    }

    mockScreenshotProcessor.processScreenshot.mockResolvedValue(mockAnalysis)
    mockScreenshotProcessor.extractConversationData.mockResolvedValue(mockConversationData)

    let onDropCallback: Function
    mockUseDropzone.mockImplementation((config: any) => {
      onDropCallback = config.onDrop
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false
      }
    })

    render(<ScreenshotUpload />)

    // Trigger file drop
    await onDropCallback!([mockFile])

    await waitFor(() => {
      // Check smart insights section
      expect(screen.getByText('🎯 Smart Insights')).toBeInTheDocument()
      
      // Check last message details
      expect(screen.getByText('How was your day?')).toBeInTheDocument()
      expect(screen.getByText('Them')).toBeInTheDocument()
      expect(screen.getByText('positive')).toBeInTheDocument()
      
      // Check conversation flow
      expect(screen.getByText('daily')).toBeInTheDocument()
      expect(screen.getByText('warm')).toBeInTheDocument()
      expect(screen.getByText('casual')).toBeInTheDocument()
      expect(screen.getByText('personal')).toBeInTheDocument()
      
      // Check suggested updates
      expect(screen.getByText('📝 Suggested Profile Updates')).toBeInTheDocument()
      expect(screen.getByText('LINE交換済み')).toBeInTheDocument()
      expect(screen.getByText('music, travel')).toBeInTheDocument()
      expect(screen.getByText('more intimate')).toBeInTheDocument()
    })
  })
})
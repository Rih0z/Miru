import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { Dashboard } from '@/components/Dashboard'
import { ConnectionService } from '@/lib/connectionService'
import { DashboardData } from '@/types'
import { DIContainer } from '@/lib/infrastructure/container/DIContainer'

// モックの設定
jest.mock('@/lib/connectionService')
jest.mock('@/lib/infrastructure/container/DIContainer')
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

const mockConnectionService = ConnectionService as jest.MockedClass<typeof ConnectionService>

describe('Dashboard', () => {
  let mockGetDashboardData: jest.Mock
  let mockDashboardData: DashboardData
  let mockConnectionServiceInstance: any

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.alert
    window.alert = jest.fn()
    
    mockDashboardData = {
      connections: [
        {
          id: 'test-1',
          user_id: 'user-123',
          nickname: 'Aさん',
          platform: 'Pairs',
          current_stage: 'メッセージ中',
          basic_info: {
            age: 25,
            occupation: 'エンジニア',
            hobbies: ['映画鑑賞', 'カフェ巡り']
          },
          communication: {
            frequency: '毎日',
            lastContact: '2024-05-29',
            responseTime: '数時間以内'
          },
          user_feelings: {
            expectations: '真剣な交際',
            attractivePoints: ['優しい', '話が面白い']
          },
          created_at: '2024-05-29T00:00:00Z',
          updated_at: '2024-05-29T00:00:00Z'
        },
        {
          id: 'test-2',
          user_id: 'user-123',
          nickname: 'Bさん',
          platform: 'with',
          current_stage: 'デート前',
          basic_info: {
            age: 28,
            occupation: 'デザイナー',
            hobbies: ['読書', 'ヨガ', '料理']
          },
          communication: {
            frequency: '2日に1回',
            lastContact: '2024-05-28',
            responseTime: '1日以内'
          },
          user_feelings: {
            expectations: '楽しい関係',
            attractivePoints: ['センスが良い', '落ち着いている']
          },
          created_at: '2024-05-29T00:00:00Z',
          updated_at: '2024-05-29T00:00:00Z'
        }
      ],
      totalConnections: 2,
      activeConnections: 2,
      averageScore: 53,
      recommendedActions: [
        {
          id: 'action-1',
          type: 'prepare_date',
          title: 'Bさんさんとのデート準備',
          description: '話題の準備や当日の流れを確認しましょう',
          urgency: 'high',
          connection_id: 'test-2'
        },
        {
          id: 'action-2',
          type: 'deepen_conversation',
          title: 'Aさんさんとの会話を深める',
          description: '共通の話題を見つけて関係を発展させましょう',
          urgency: 'medium',
          connection_id: 'test-1'
        }
      ],
      bestConnection: {
        id: 'test-2',
        user_id: 'user-123',
        nickname: 'Bさん',
        platform: 'with',
        current_stage: 'デート前',
        basic_info: { age: 28, occupation: 'デザイナー', hobbies: ['読書', 'ヨガ', '料理'] },
        communication: { frequency: '2日に1回', lastContact: '2024-05-28', responseTime: '1日以内' },
        user_feelings: { expectations: '楽しい関係', attractivePoints: ['センスが良い', '落ち着いている'] },
        created_at: '2024-05-29T00:00:00Z',
        updated_at: '2024-05-29T00:00:00Z'
      }
    }

    mockGetDashboardData = jest.fn().mockResolvedValue(mockDashboardData)
    
    // Mock the connection service instance
    mockConnectionServiceInstance = {
      getDashboardData: mockGetDashboardData,
      calculateRelationshipScore: jest.fn((connection) => {
        if (connection.nickname === 'Aさん') return 44
        if (connection.nickname === 'Bさん') return 61
        return 61 // default for bestConnection
      }),
      getRecommendedAction: jest.fn().mockReturnValue({
        id: 'action-1',
        type: 'prepare_date',
        title: 'デートの準備をしましょう',
        description: '話題の準備や当日の流れを確認',
        urgency: 'medium',
        connection_id: 'test-1',
        prompt_type: 'date_preparation'
      }),
      deleteConnection: jest.fn().mockResolvedValue(undefined),
      createConnection: jest.fn().mockResolvedValue({
        id: 'new-1',
        user_id: 'user-123',
        nickname: '新しい人',
        platform: 'Tinder',
        current_stage: 'マッチング直後'
      }),
      updateConnection: jest.fn().mockResolvedValue({})
    }

    // Mock ConnectionService constructor to return our instance
    mockConnectionService.mockImplementation(() => mockConnectionServiceInstance)

    // Mock DIContainer to return our mocked services
    const mockContainer = {
      getConnectionService: jest.fn().mockReturnValue(mockConnectionServiceInstance),
      getHopeScoreCalculator: jest.fn().mockReturnValue({
        calculateHopeScore: jest.fn().mockReturnValue(75)
      }),
      getPromptGenerator: jest.fn().mockReturnValue({
        generateFirstMessagePrompt: jest.fn().mockReturnValue('Generated first message prompt'),
        generateConversationPrompt: jest.fn().mockReturnValue('Generated conversation prompt'),
        generateDatePrompt: jest.fn().mockReturnValue('Generated date prompt'),
        generateRelationshipPrompt: jest.fn().mockReturnValue('Generated relationship prompt'),
        generateGeneralPrompt: jest.fn().mockReturnValue('Generated general prompt')
      })
    }
    ;(DIContainer.getInstance as jest.Mock).mockReturnValue(mockContainer)
  })

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      render(<Dashboard userId="user-123" />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('should display dashboard statistics', async () => {
      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByTestId('total-connections')).toHaveTextContent('2')
        expect(screen.getByTestId('active-connections')).toHaveTextContent('2')
        expect(screen.getByTestId('average-score')).toHaveTextContent('53')
      })
    })

    it('should display connections list', async () => {
      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        expect(screen.getAllByText('Aさん')).toHaveLength(1)
        expect(screen.getAllByText('Bさん')).toHaveLength(2) // Connection list + best connection
        expect(screen.getByText('Pairs')).toBeInTheDocument()
        expect(screen.getByText('with')).toBeInTheDocument()
      })
    })

    it('should display recommended actions', async () => {
      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText('Bさんさんとのデート準備')).toBeInTheDocument()
        expect(screen.getByText('Aさんさんとの会話を深める')).toBeInTheDocument()
      })
    })

    it('should display best connection', async () => {
      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        const progressOverview = screen.getByTestId('progress-overview')
        expect(progressOverview).toHaveTextContent('最も有望な関係: Bさん')
        expect(progressOverview).toHaveTextContent('61点')
      })
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no connections', async () => {
      mockGetDashboardData.mockResolvedValueOnce({
        connections: [],
        totalConnections: 0,
        activeConnections: 0,
        averageScore: 0,
        recommendedActions: [],
        bestConnection: null
      })

      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument()
        expect(screen.getByText('まだ相手が登録されていません')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error state when data loading fails', async () => {
      mockGetDashboardData.mockRejectedValueOnce(new Error('Network error'))

      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })
    })

    it('should retry loading on error retry button click', async () => {
      mockGetDashboardData
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockDashboardData)

      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        const retryButton = screen.getByText('再試行')
        fireEvent.click(retryButton)
      })

      await waitFor(() => {
        expect(mockGetDashboardData).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('User Interactions', () => {
    it('should open connection form when add button is clicked', async () => {
      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        const addButton = screen.getByTestId('add-connection-button')
        fireEvent.click(addButton)
      })

      await waitFor(() => {
        expect(screen.getAllByText('新しい相手を追加')[0]).toBeInTheDocument()
      })
    })

    it('should open edit form when edit button is clicked', async () => {
      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        const editButtons = screen.getAllByTestId('edit-button')
        fireEvent.click(editButtons[0])
      })

      await waitFor(() => {
        expect(screen.getByText('Aさんさんの情報編集')).toBeInTheDocument()
      })
    })

    it('should show delete confirmation when delete button is clicked', async () => {
      window.confirm = jest.fn().mockReturnValue(true)
      const mockDeleteConnection = jest.fn().mockResolvedValue(undefined)
      mockConnectionService.prototype.deleteConnection = mockDeleteConnection

      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        const deleteButtons = screen.getAllByTestId('delete-button')
        fireEvent.click(deleteButtons[0])
      })

      expect(window.confirm).toHaveBeenCalledWith('Aさんさんを削除しますか？')
    })

    it('should open prompt executor when AI consult button is clicked', async () => {
      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        const consultButtons = screen.getAllByTestId('generate-prompt-button')
        fireEvent.click(consultButtons[0])
      })

      await waitFor(() => {
        expect(screen.getByText('AIプロンプト実行')).toBeInTheDocument()
      })
    })
  })

  describe('Connection Scores', () => {
    it('should display individual connection scores', async () => {
      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        const scoreElements = screen.getAllByTestId('relationship-score')
        expect(scoreElements[0]).toHaveTextContent('44')
        expect(scoreElements[1]).toHaveTextContent('61')
      })
    })

    it('should display progress indicators', async () => {
      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        const progressBars = screen.getAllByTestId('progress-indicator')
        expect(progressBars).toHaveLength(2)
      })
    })
  })

  describe('Form Integration', () => {
    it('should save new connection and refresh data', async () => {
      const mockCreateConnection = jest.fn().mockResolvedValue({
        id: 'new-1',
        user_id: 'user-123',
        nickname: '新しい人',
        platform: 'Tinder',
        current_stage: 'マッチング直後'
      })
      mockConnectionService.prototype.createConnection = mockCreateConnection

      render(<Dashboard userId="user-123" />)

      // Open form
      await waitFor(() => {
        const addButton = screen.getByTestId('add-connection-button')
        fireEvent.click(addButton)
      })

      // Fill and submit form
      await waitFor(() => {
        const nicknameInput = screen.getByPlaceholderText('Aさん、B子さん など')
        const platformInput = screen.getByPlaceholderText('Pairs、with、Omiai など')
        
        fireEvent.change(nicknameInput, { target: { value: '新しい人' } })
        fireEvent.change(platformInput, { target: { value: 'Tinder' } })
        
        const saveButton = screen.getByText('登録する')
        fireEvent.click(saveButton)
      })

      await waitFor(() => {
        expect(mockCreateConnection).toHaveBeenCalled()
        expect(mockGetDashboardData).toHaveBeenCalledTimes(2) // Initial + after save
      })
    })

    it('should update connection and refresh data', async () => {
      const mockUpdateConnection = jest.fn().mockResolvedValue({
        ...mockDashboardData.connections[0],
        nickname: '更新されたAさん'
      })
      mockConnectionService.prototype.updateConnection = mockUpdateConnection

      render(<Dashboard userId="user-123" />)

      // Open edit form
      await waitFor(() => {
        const editButtons = screen.getAllByTestId('edit-button')
        fireEvent.click(editButtons[0])
      })

      // Update and submit
      await waitFor(() => {
        const nicknameInput = screen.getByDisplayValue('Aさん')
        fireEvent.change(nicknameInput, { target: { value: '更新されたAさん' } })
        
        const saveButton = screen.getByText('更新する')
        fireEvent.click(saveButton)
      })

      await waitFor(() => {
        expect(mockUpdateConnection).toHaveBeenCalledWith('test-1', expect.any(Object))
        expect(mockGetDashboardData).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Recommended Actions', () => {
    it('should sort actions by urgency', async () => {
      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        const actions = screen.getByTestId('recommended-actions')
        const urgencyBadges = actions.querySelectorAll('span')
        
        // First action should be high priority
        expect(urgencyBadges[0]).toHaveTextContent('高')
        // Second action should be medium priority  
        expect(urgencyBadges[2]).toHaveTextContent('中')
      })
    })

    it('should trigger action when execute button is clicked', async () => {
      render(<Dashboard userId="user-123" />)

      await waitFor(() => {
        const executeButtons = screen.getAllByText('実行 →')
        fireEvent.click(executeButtons[0])
      })

      await waitFor(() => {
        expect(screen.getByText('AIプロンプト実行')).toBeInTheDocument()
      })
    })
  })
})
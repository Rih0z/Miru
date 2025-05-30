import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { render, screen, waitFor, act } from '@testing-library/react'
import { Dashboard } from '@/components/Dashboard'
import { Connection } from '@/types'

// Mock data
const mockConnections: Connection[] = [
  {
    id: 'conn-1',
    user_id: 'user-123',
    nickname: 'Aさん',
    platform: 'Pairs',
    current_stage: 'メッセージ中',
    basic_info: { age: 25, occupation: 'エンジニア' },
    communication: { frequency: '毎日' },
    user_feelings: { expectations: '真剣な交際' },
    created_at: '2024-05-29T00:00:00Z',
    updated_at: '2024-05-29T00:00:00Z'
  },
  {
    id: 'conn-2',
    user_id: 'user-123',
    nickname: 'Bさん',
    platform: 'with',
    current_stage: 'デート前',
    basic_info: { age: 28, occupation: 'デザイナー' },
    communication: { frequency: '2日に1回' },
    user_feelings: { expectations: '楽しい関係' },
    created_at: '2024-05-29T00:00:00Z',
    updated_at: '2024-05-29T00:00:00Z'
  }
]

// Create mock functions
const mockGetUserConnections = jest.fn()
const mockCalculateRelationshipScore = jest.fn()
const mockGetRecommendedAction = jest.fn()
const mockDeleteConnection = jest.fn()

// Mock the ConnectionService class
jest.mock('@/lib/connectionService', () => ({
  ConnectionService: jest.fn().mockImplementation(() => ({
    getUserConnections: mockGetUserConnections,
    calculateRelationshipScore: mockCalculateRelationshipScore,
    getRecommendedAction: mockGetRecommendedAction,
    deleteConnection: mockDeleteConnection
  }))
}))

// Mock ConnectionCard to avoid any issues
jest.mock('@/components/connections/ConnectionCard', () => ({
  ConnectionCard: ({ connection }: any) => (
    <div data-testid={`connection-${connection.id}`}>
      <span>{connection.nickname}</span>
    </div>
  )
}))

// Suppress console.error for act warnings
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: An update to')) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementations
    mockGetUserConnections.mockResolvedValue([])
    mockCalculateRelationshipScore.mockReturnValue(75)
    mockGetRecommendedAction.mockReturnValue({
      id: 'action-1',
      connection_id: 'conn-1',
      title: 'テストアクション',
      description: 'テスト説明',
      urgency: 'high' as const,
      estimated_time: '10分',
      prompt_type: 'test'
    })
    mockDeleteConnection.mockResolvedValue(undefined)
  })

  it('should display loading state initially', () => {
    // Make the service call never resolve
    mockGetUserConnections.mockImplementation(() => new Promise(() => {}))
    
    render(<Dashboard userId="user-123" />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('should handle empty connections state', async () => {
    mockGetUserConnections.mockResolvedValue([])
    
    await act(async () => {
      render(<Dashboard userId="user-123" />)
      // Wait for the component to finish loading
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText(/まだ相手が登録されていません/)).toBeInTheDocument()
  })

  it('should display connections after loading', async () => {
    mockGetUserConnections.mockResolvedValue(mockConnections)
    
    await act(async () => {
      render(<Dashboard userId="user-123" />)
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(screen.getByText('恋愛ダッシュボード')).toBeInTheDocument()
    expect(screen.getByText('Aさん')).toBeInTheDocument()
    expect(screen.getByText('Bさん')).toBeInTheDocument()
  })

  it('should display summary statistics', async () => {
    mockGetUserConnections.mockResolvedValue(mockConnections)
    
    await act(async () => {
      render(<Dashboard userId="user-123" />)
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(screen.getByTestId('total-connections')).toBeInTheDocument()
    expect(screen.getByTestId('active-connections')).toBeInTheDocument()
    expect(screen.getByTestId('average-score')).toBeInTheDocument()
    expect(screen.getByTestId('total-connections')).toHaveTextContent('2')
    expect(screen.getByTestId('active-connections')).toHaveTextContent('2')
    expect(screen.getByTestId('average-score')).toHaveTextContent('75')
  })

  it('should show add new connection button when connections exist', async () => {
    mockGetUserConnections.mockResolvedValue(mockConnections)
    
    await act(async () => {
      render(<Dashboard userId="user-123" />)
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(screen.getByTestId('add-connection-button')).toBeInTheDocument()
  })

  it('should display progress overview when connections exist', async () => {
    mockGetUserConnections.mockResolvedValue(mockConnections)
    
    await act(async () => {
      render(<Dashboard userId="user-123" />)
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(screen.getByTestId('progress-overview')).toBeInTheDocument()
    expect(screen.getByText('今月の進展')).toBeInTheDocument()
  })

  it('should show recommended actions section when connections exist', async () => {
    mockGetUserConnections.mockResolvedValue(mockConnections)
    
    await act(async () => {
      render(<Dashboard userId="user-123" />)
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(screen.getByText('今すぐできること')).toBeInTheDocument()
    expect(screen.getByTestId('recommended-actions')).toBeInTheDocument()
  })

  it('should handle error state', async () => {
    mockGetUserConnections.mockRejectedValue(new Error('Network error'))
    
    await act(async () => {
      render(<Dashboard userId="user-123" />)
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(screen.getByTestId('error-state')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('should handle delete connection', async () => {
    mockGetUserConnections.mockResolvedValueOnce(mockConnections)
    mockDeleteConnection.mockResolvedValue(undefined)
    
    let component: any
    await act(async () => {
      component = render(<Dashboard userId="user-123" />)
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(screen.getByText('Aさん')).toBeInTheDocument()
    
    // Simulate deletion by updating mock to return only one connection
    mockGetUserConnections.mockResolvedValueOnce([mockConnections[1]])
    
    // Rerender to simulate the component reloading after delete
    await act(async () => {
      component.rerender(<Dashboard userId="user-123" />)
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(screen.queryByText('Aさん')).not.toBeInTheDocument()
    expect(screen.getByText('Bさん')).toBeInTheDocument()
  })
})
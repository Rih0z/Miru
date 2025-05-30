import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen, waitFor, act } from '@testing-library/react'
import { Dashboard } from '@/components/Dashboard'
import { Connection } from '@/types'

// Mock the ConnectionService
const mockGetUserConnections = jest.fn()
const mockCalculateRelationshipScore = jest.fn()
const mockGetRecommendedAction = jest.fn()
const mockDeleteConnection = jest.fn()

jest.mock('@/lib/connectionService', () => ({
  ConnectionService: jest.fn().mockImplementation(() => ({
    getUserConnections: mockGetUserConnections,
    calculateRelationshipScore: mockCalculateRelationshipScore,
    getRecommendedAction: mockGetRecommendedAction,
    deleteConnection: mockDeleteConnection
  }))
}))

describe('Dashboard', () => {
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

  beforeEach(() => {
    jest.clearAllMocks()
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
  })

  it('should display loading state initially', () => {
    mockGetUserConnections.mockImplementation(() => new Promise(() => {})) // never resolves
    
    render(<Dashboard userId="user-123" />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('should handle empty connections state', async () => {
    await act(async () => {
      mockGetUserConnections.mockResolvedValue([])
      render(<Dashboard userId="user-123" />)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText(/まだ相手が登録されていません/)).toBeInTheDocument()
    })
  })

  it('should display connections after loading', async () => {
    await act(async () => {
      mockGetUserConnections.mockResolvedValue(mockConnections)
      render(<Dashboard userId="user-123" />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('恋愛ダッシュボード')).toBeInTheDocument()
      expect(screen.getByText('Aさん')).toBeInTheDocument()
      expect(screen.getByText('Bさん')).toBeInTheDocument()
    })
  })

  it('should display summary statistics', async () => {
    await act(async () => {
      mockGetUserConnections.mockResolvedValue(mockConnections)
      render(<Dashboard userId="user-123" />)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('total-connections')).toBeInTheDocument()
      expect(screen.getByTestId('active-connections')).toBeInTheDocument()
      expect(screen.getByTestId('average-score')).toBeInTheDocument()
    })
  })

  it('should show add new connection button', async () => {
    await act(async () => {
      mockGetUserConnections.mockResolvedValue([])
      render(<Dashboard userId="user-123" />)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('add-connection-button')).toBeInTheDocument()
    })
  })

  it('should display progress overview when connections exist', async () => {
    await act(async () => {
      mockGetUserConnections.mockResolvedValue(mockConnections)
      render(<Dashboard userId="user-123" />)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('progress-overview')).toBeInTheDocument()
    })
  })

  it('should show recommended actions section when connections exist', async () => {
    await act(async () => {
      mockGetUserConnections.mockResolvedValue(mockConnections)
      render(<Dashboard userId="user-123" />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('今すぐできること')).toBeInTheDocument()
      expect(screen.getByTestId('recommended-actions')).toBeInTheDocument()
    })
  })

  it('should handle error state', async () => {
    await act(async () => {
      mockGetUserConnections.mockRejectedValue(new Error('Network error'))
      render(<Dashboard userId="user-123" />)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
    })
  })
})
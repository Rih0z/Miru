import { describe, it, expect } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConnectionCard } from '@/components/connections/ConnectionCard'
import { Connection } from '@/types'

describe('ConnectionCard', () => {
  const mockConnection: Connection = {
    id: 'conn-123',
    user_id: 'user-123',
    nickname: 'Aさん',
    platform: 'Pairs',
    current_stage: 'メッセージ中',
    basic_info: {
      age: 25,
      occupation: 'エンジニア',
      hobbies: ['読書', '映画鑑賞']
    },
    communication: {
      frequency: '毎日',
      lastContact: '2024-05-29',
      communicationStyle: 'フレンドリー'
    },
    user_feelings: {
      expectations: '真剣な交際',
      concerns: '年齢差',
      attractivePoints: ['優しい', '話が合う']
    },
    created_at: '2024-05-29T00:00:00Z',
    updated_at: '2024-05-29T00:00:00Z'
  }

  const mockProps = {
    connection: mockConnection,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onGeneratePrompt: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render connection basic information', () => {
    render(<ConnectionCard {...mockProps} />)
    
    expect(screen.getByText(/Aさん/)).toBeInTheDocument()
    expect(screen.getByText('Pairs')).toBeInTheDocument()
    expect(screen.getByText('メッセージ中')).toBeInTheDocument()
    expect(screen.getByText('エンジニア')).toBeInTheDocument()
  })

  it('should display relationship score badge', () => {
    render(<ConnectionCard {...mockProps} />)
    
    // スコアバッジが表示されることを確認
    expect(screen.getByTestId('relationship-score')).toBeInTheDocument()
  })

  it('should show recommended action', () => {
    render(<ConnectionCard {...mockProps} />)
    
    expect(screen.getByText('推奨アクション')).toBeInTheDocument()
    expect(screen.getByTestId('recommended-action')).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    render(<ConnectionCard {...mockProps} />)
    
    const editButton = screen.getByTestId('edit-button')
    fireEvent.click(editButton)
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockConnection)
  })

  it('should call onDelete when delete button is clicked', () => {
    render(<ConnectionCard {...mockProps} />)
    
    const deleteButton = screen.getByTestId('delete-button')
    fireEvent.click(deleteButton)
    
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockConnection.id)
  })

  it('should call onGeneratePrompt when prompt button is clicked', () => {
    render(<ConnectionCard {...mockProps} />)
    
    const promptButton = screen.getByTestId('generate-prompt-button')
    fireEvent.click(promptButton)
    
    expect(mockProps.onGeneratePrompt).toHaveBeenCalledWith(mockConnection.id)
  })

  it('should display progress indicator based on stage', () => {
    render(<ConnectionCard {...mockProps} />)
    
    expect(screen.getByTestId('progress-indicator')).toBeInTheDocument()
  })

  it('should show last contact information', () => {
    render(<ConnectionCard {...mockProps} />)
    
    expect(screen.getByText(/最後の連絡/)).toBeInTheDocument()
    expect(screen.getByText('2024-05-29')).toBeInTheDocument()
  })

  it('should display hobbies when available', () => {
    render(<ConnectionCard {...mockProps} />)
    
    expect(screen.getByText('読書')).toBeInTheDocument()
    expect(screen.getByText('映画鑑賞')).toBeInTheDocument()
  })

  it('should handle connection without hobbies gracefully', () => {
    const connectionWithoutHobbies = {
      ...mockConnection,
      basic_info: { ...mockConnection.basic_info, hobbies: undefined }
    }
    
    render(<ConnectionCard connection={connectionWithoutHobbies} {...mockProps} />)
    
    expect(screen.getByText(/Aさん/)).toBeInTheDocument()
    // ホビーがなくてもエラーにならないことを確認
  })
})
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConnectionForm } from '@/components/connections/ConnectionForm'
import { Connection } from '@/types'

describe('ConnectionForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

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
  })

  describe('rendering', () => {
    it('should render form with default values', () => {
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      expect(screen.getByPlaceholderText(/Aさん、B子さん/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Pairs、with、Omiai/)).toBeInTheDocument()
      expect(screen.getByDisplayValue('マッチング直後')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /登録する/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /キャンセル/ })).toBeInTheDocument()
    })

    it('should render form with initial data', () => {
      render(
        <ConnectionForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
          initialData={mockConnection} 
        />
      )

      expect(screen.getByDisplayValue('テストさん')).toBeInTheDocument()
      expect(screen.getByDisplayValue('TestApp')).toBeInTheDocument()
      expect(screen.getByDisplayValue('エンジニア')).toBeInTheDocument()
      expect(screen.getByDisplayValue('東京')).toBeInTheDocument()
      expect(screen.getByDisplayValue('25')).toBeInTheDocument()
    })

    it('should render all stage options', () => {
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      expect(screen.getByRole('option', { name: 'マッチング直後' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'メッセージ中' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'LINE交換済み' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'デート前' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'デート後' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '交際中' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '停滞中' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '終了' })).toBeInTheDocument()
    })
  })

  describe('form interactions', () => {
    it('should update nickname field', async () => {
      const user = userEvent.setup()
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const nicknameInput = screen.getByPlaceholderText(/Aさん、B子さん/)
      await user.type(nicknameInput, 'テストユーザー')

      expect(nicknameInput).toHaveValue('テストユーザー')
    })

    it('should update platform field', async () => {
      const user = userEvent.setup()
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const platformInput = screen.getByPlaceholderText(/Pairs、with、Omiai/)
      await user.type(platformInput, 'Tinder')

      expect(platformInput).toHaveValue('Tinder')
    })

    it('should update stage selection', async () => {
      const user = userEvent.setup()
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const stageSelect = screen.getByDisplayValue('マッチング直後')
      await user.selectOptions(stageSelect, 'メッセージ中')

      expect(stageSelect).toHaveValue('メッセージ中')
    })

    it('should update age field', async () => {
      const user = userEvent.setup()
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const ageInput = screen.getByPlaceholderText('25')
      await user.type(ageInput, '30')

      expect(ageInput).toHaveValue(30)
    })

    it('should add new hobby', async () => {
      const user = userEvent.setup()
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const hobbyInput = screen.getByPlaceholderText(/映画鑑賞、カフェ巡り/)
      const addButton = screen.getAllByRole('button', { name: /追加/ })[0]

      await user.type(hobbyInput, '読書')
      await user.click(addButton)

      expect(screen.getByText('読書')).toBeInTheDocument()
      expect(hobbyInput).toHaveValue('')
    })

    it('should remove hobby', async () => {
      const user = userEvent.setup()
      render(
        <ConnectionForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
          initialData={mockConnection} 
        />
      )

      const removeButton = screen.getAllByText('×')[0]
      await user.click(removeButton)

      expect(screen.queryByText('映画')).not.toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should call onSubmit with form data', async () => {
      const user = userEvent.setup()
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const nicknameInput = screen.getByPlaceholderText(/Aさん、B子さん/)
      const platformInput = screen.getByPlaceholderText(/Pairs、with、Omiai/)
      const submitButton = screen.getByRole('button', { name: /登録する/ })

      await user.type(nicknameInput, 'テストユーザー')
      await user.type(platformInput, 'TestApp')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith({
        nickname: 'テストユーザー',
        platform: 'TestApp',
        current_stage: 'マッチング直後',
        basic_info: {
          age: undefined,
          occupation: '',
          location: '',
          hobbies: []
        },
        communication: {
          frequency: '',
          lastContact: '',
          responseTime: ''
        },
        user_feelings: {
          expectations: '',
          attractivePoints: [],
          concerns: []
        }
      })
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const cancelButton = screen.getByRole('button', { name: /キャンセル/ })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    it('should require nickname', async () => {
      const user = userEvent.setup()
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const submitButton = screen.getByRole('button', { name: /登録する/ })
      await user.click(submitButton)

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should require platform', async () => {
      const user = userEvent.setup()
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const nicknameInput = screen.getByPlaceholderText(/Aさん、B子さん/)
      const submitButton = screen.getByRole('button', { name: /登録する/ })

      await user.type(nicknameInput, 'テストユーザー')
      await user.click(submitButton)

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('dynamic lists', () => {
    it('should add and remove attractive points', async () => {
      const user = userEvent.setup()
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      // Add attractive point
      const attractivePointInput = screen.getByPlaceholderText(/優しい、話が面白い/)
      const addButton = screen.getAllByRole('button', { name: /追加/ })[1]

      await user.type(attractivePointInput, '面白い')
      await user.click(addButton)

      expect(screen.getByText('面白い')).toBeInTheDocument()
      expect(attractivePointInput).toHaveValue('')
    })

    it('should add and remove concerns', async () => {
      const user = userEvent.setup()
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      // Add concern
      const concernInput = screen.getByPlaceholderText(/返信が遅い、価値観の違い/)
      const addButton = screen.getAllByRole('button', { name: /追加/ })[2]

      await user.type(concernInput, '返信が遅い')
      await user.click(addButton)

      expect(screen.getByText('返信が遅い')).toBeInTheDocument()
      expect(concernInput).toHaveValue('')
    })
  })

  describe('accessibility', () => {
    it('should have proper form labels', () => {
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      expect(screen.getByPlaceholderText(/Aさん、B子さん/)).toHaveAttribute('required')
      expect(screen.getByPlaceholderText(/Pairs、with、Omiai/)).toHaveAttribute('required')
      expect(screen.getByDisplayValue('マッチング直後')).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<ConnectionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const nicknameInput = screen.getByPlaceholderText(/Aさん、B子さん/)
      const platformInput = screen.getByPlaceholderText(/Pairs、with、Omiai/)

      await user.tab()
      expect(nicknameInput).toHaveFocus()

      await user.tab()
      expect(platformInput).toHaveFocus()
    })
  })
})
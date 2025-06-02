import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '@/app/page'

// モックの設定
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn()
}))

jest.mock('@/components/Dashboard', () => ({
  Dashboard: ({ userId }: { userId: string }) => <div data-testid="dashboard">Dashboard for {userId}</div>
}))

jest.mock('@/components/auth/AuthModal', () => ({
  AuthModal: ({ isOpen, onClose, onAuthSuccess }: any) => 
    isOpen ? (
      <div data-testid="auth-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onAuthSuccess}>Auth Success</button>
      </div>
    ) : null
}))

jest.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>
}))

import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>

describe('Home Component', () => {
  const mockT = jest.fn((key: string) => key)

  beforeEach(() => {
    mockUseTranslations.mockReturnValue(mockT)
    jest.clearAllMocks()
  })

  it('shows loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    })

    render(<Home />)

    expect(screen.getByText('common.loading')).toBeInTheDocument()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows authentication UI when user is not logged in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    })

    render(<Home />)

    expect(screen.getByText('app.title')).toBeInTheDocument()
    expect(screen.getByText('app.description')).toBeInTheDocument()
    expect(screen.getByText('auth.loginButton')).toBeInTheDocument()
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
  })

  it('opens auth modal when login button is clicked', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    })

    render(<Home />)

    const loginButton = screen.getByText('auth.loginButton')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    })
  })

  it('closes auth modal when close button is clicked', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    })

    render(<Home />)

    // Open modal
    const loginButton = screen.getByText('auth.loginButton')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    })

    // Close modal
    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
    })
  })

  it('shows dashboard when user is authenticated', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    })

    render(<Home />)

    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    expect(screen.getByText('Dashboard for user-123')).toBeInTheDocument()
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
  })

  it('renders language switcher in all states', () => {
    // Test when not authenticated
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    })

    const { rerender } = render(<Home />)
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()

    // Test when authenticated
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    })

    rerender(<Home />)
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
  })

  it('handles authentication success correctly', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    })

    render(<Home />)

    // Open modal
    const loginButton = screen.getByText('auth.loginButton')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    })

    // Simulate auth success
    const authSuccessButton = screen.getByText('Auth Success')
    fireEvent.click(authSuccessButton)

    await waitFor(() => {
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
    })
  })
})
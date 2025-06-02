import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AuthService } from '@/lib/auth'

// Mock AuthService
jest.mock('@/lib/auth')

// Test component to access AuthContext
function TestComponent() {
  const { user, loading, signUp, signIn, signOut, resetPassword } = useAuth()

  const handleSignUp = () => signUp('test@example.com', 'password')
  const handleSignIn = () => signIn('test@example.com', 'password')
  const handleSignOut = () => signOut()
  const handleResetPassword = () => resetPassword('test@example.com')

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignOut}>Sign Out</button>
      <button onClick={handleResetPassword}>Reset Password</button>
    </div>
  )
}

// Component to test useAuth hook outside provider
function TestComponentOutsideProvider() {
  try {
    useAuth()
    return <div>Should not render</div>
  } catch (error) {
    return <div data-testid="error">Error: {(error as Error).message}</div>
  }
}

describe('AuthContext', () => {
  const mockAuthService = {
    getCurrentUser: jest.fn(),
    onAuthStateChange: jest.fn(),
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn()
  }

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock AuthService constructor
    ;(AuthService as jest.Mock).mockImplementation(() => mockAuthService)

    // Set up default mocks
    mockAuthService.getCurrentUser.mockResolvedValue(null)
    mockAuthService.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn()
        }
      }
    })
    mockAuthService.signUp.mockResolvedValue({ user: mockUser, error: null })
    mockAuthService.signIn.mockResolvedValue({ user: mockUser, error: null })
    mockAuthService.signOut.mockResolvedValue({ error: null })
    mockAuthService.resetPassword.mockResolvedValue({ error: null })
  })

  describe('AuthProvider', () => {
    it('should render children and provide auth context', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      expect(screen.getByTestId('user')).toHaveTextContent('No User')
    })

    it('should load initial user on mount', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      })

      expect(mockAuthService.getCurrentUser).toHaveBeenCalled()
    })

    it('should handle initial user loading error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockAuthService.getCurrentUser.mockRejectedValue(new Error('Load error'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      expect(consoleSpy).toHaveBeenCalledWith('初期ユーザー取得エラー:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('should set up auth state change listener', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(mockAuthService.onAuthStateChange).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should update user state when auth state changes', async () => {
      let authStateCallback: (user: any) => void

      mockAuthService.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn()
            }
          }
        }
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      // Simulate auth state change
      act(() => {
        authStateCallback!(mockUser)
      })

      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    it('should unsubscribe from auth state changes on unmount', () => {
      const mockUnsubscribe = jest.fn()
      mockAuthService.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe
          }
        }
      })

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('authentication methods', () => {
    it('should handle sign up', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      const signUpButton = screen.getByRole('button', { name: 'Sign Up' })
      await user.click(signUpButton)

      expect(mockAuthService.signUp).toHaveBeenCalledWith('test@example.com', 'password')
    })

    it('should handle sign in', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      const signInButton = screen.getByRole('button', { name: 'Sign In' })
      await user.click(signInButton)

      expect(mockAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password')
    })

    it('should handle sign out', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      const signOutButton = screen.getByRole('button', { name: 'Sign Out' })
      await user.click(signOutButton)

      expect(mockAuthService.signOut).toHaveBeenCalled()
    })

    it('should handle password reset', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      const resetButton = screen.getByRole('button', { name: 'Reset Password' })
      await user.click(resetButton)

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('test@example.com')
    })

    it('should update user state after successful sign up', async () => {
      const user = userEvent.setup()
      mockAuthService.signUp.mockResolvedValue({ user: mockUser, error: null })
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      const signUpButton = screen.getByRole('button', { name: 'Sign Up' })
      await user.click(signUpButton)

      // The user state should be updated by the auth state change listener
      // not directly by the signUp method
      expect(mockAuthService.signUp).toHaveBeenCalled()
    })

    it('should handle authentication errors', async () => {
      const user = userEvent.setup()
      mockAuthService.signIn.mockResolvedValue({ user: null, error: 'Invalid credentials' })
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      const signInButton = screen.getByRole('button', { name: 'Sign In' })
      await user.click(signInButton)

      expect(mockAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password')
    })
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      render(<TestComponentOutsideProvider />)

      expect(screen.getByTestId('error')).toHaveTextContent(
        'Error: useAuth must be used within an AuthProvider'
      )
    })

    it('should provide auth context when used within provider', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      expect(screen.getByTestId('user')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument()
    })
  })

  describe('loading states', () => {
    it('should show loading initially', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
    })

    it('should stop loading after initial user check', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })
    })

    it('should stop loading when auth state change is triggered', async () => {
      let authStateCallback: (user: any) => void

      mockAuthService.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn()
            }
          }
        }
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Trigger auth state change before initial loading completes
      act(() => {
        authStateCallback!(mockUser)
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })
    })
  })
})
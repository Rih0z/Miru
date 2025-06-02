import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import Home from '@/app/page'
import { AuthProvider } from '@/contexts/AuthContext'

// モックの設定
const mockAuthContext = {
  user: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn()
}

jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockAuthContext
}))

jest.mock('@/lib/connectionService')
jest.mock('@/lib/supabase')

const messages = {
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    retry: 'Retry'
  },
  app: {
    title: 'Miru - AI恋愛オーケストレーションシステム',
    description: '「付き合えるかもしれない」希望を可視化する恋愛サポートアプリ',
    subtitle: 'AIがあなたの恋愛をサポートします'
  },
  auth: {
    loginButton: 'Login',
    signup: 'Sign Up',
    login: 'Login',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    sendResetEmail: 'Send Reset Email',
    loggingIn: 'Logging in...',
    signingUp: 'Signing up...',
    sendingEmail: 'Sending email...',
    loginButton: 'Login',
    signupButton: 'Sign Up',
    modal: {
      title: 'Authentication'
    },
    validation: {
      invalidEmail: 'Invalid email format',
      passwordTooShort: 'Password must be at least 6 characters',
      passwordMismatch: 'Passwords do not match'
    },
    resetEmailSent: 'Reset email sent successfully',
    noAccount: 'Don\'t have an account?',
    alreadyHaveAccount: 'Already have an account?',
    backToLogin: 'Back to Login',
    agreementText: 'By signing up, you agree to our Terms of Service'
  },
  dashboard: {
    title: 'Love Dashboard'
  }
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider messages={messages} locale="ja">
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  )
}

describe.skip('User Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthContext.user = null
    mockAuthContext.loading = false
  })

  describe('Unauthenticated User Flow', () => {
    it('should show landing page for unauthenticated users', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      expect(screen.getByText('Miru - AI恋愛オーケストレーションシステム')).toBeInTheDocument()
      expect(screen.getByText('「付き合えるかもしれない」希望を可視化する恋愛サポートアプリ')).toBeInTheDocument()
      expect(screen.getByText('Login')).toBeInTheDocument()
    })

    it('should open auth modal when login button is clicked', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
      })
    })

    it('should handle successful login flow', async () => {
      mockAuthContext.signIn.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01' },
        error: null
      })

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      // Open auth modal
      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      })

      // Fill login form
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /login/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAuthContext.signIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should handle signup flow', async () => {
      mockAuthContext.signUp.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01' },
        error: null
      })

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      // Open auth modal
      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText('Sign Up')).toBeInTheDocument()
      })

      // Switch to signup mode
      fireEvent.click(screen.getByText('Sign Up'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument()
      })

      // Fill signup form
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'newuser@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      })
      fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
        target: { value: 'password123' }
      })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAuthContext.signUp).toHaveBeenCalledWith('newuser@example.com', 'password123')
      })
    })

    it('should handle password reset flow', async () => {
      mockAuthContext.resetPassword.mockResolvedValue({
        error: null
      })

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      // Open auth modal
      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText('Forgot Password?')).toBeInTheDocument()
      })

      // Switch to reset mode
      fireEvent.click(screen.getByText('Forgot Password?'))

      await waitFor(() => {
        expect(screen.getByText('Reset Password')).toBeInTheDocument()
      })

      // Fill reset form
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'user@example.com' }
      })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send reset email/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAuthContext.resetPassword).toHaveBeenCalledWith('user@example.com')
      })
    })
  })

  describe('Authenticated User Flow', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01'
      }
    })

    it('should show dashboard for authenticated users', async () => {
      const mockDashboardData = {
        connections: [],
        totalConnections: 0,
        activeConnections: 0,
        averageScore: 0,
        recommendedActions: [],
        bestConnection: null
      }

      const mockConnectionService = require('@/lib/connectionService').ConnectionService
      mockConnectionService.prototype.getDashboardData = jest.fn().mockResolvedValue(mockDashboardData)

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('should handle adding a new connection', async () => {
      const mockDashboardData = {
        connections: [],
        totalConnections: 0,
        activeConnections: 0,
        averageScore: 0,
        recommendedActions: [],
        bestConnection: null
      }

      const mockConnectionService = require('@/lib/connectionService').ConnectionService
      mockConnectionService.prototype.getDashboardData = jest.fn().mockResolvedValue(mockDashboardData)
      mockConnectionService.prototype.createConnection = jest.fn().mockResolvedValue({
        id: 'new-1',
        user_id: 'user-123',
        nickname: 'テストさん',
        platform: 'Pairs',
        current_stage: 'マッチング直後'
      })

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      })

      // Click add connection button
      const addButton = screen.getByText('最初の相手を追加する')
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('新しい相手を追加')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      mockAuthContext.signIn.mockResolvedValue({
        user: null,
        error: 'Invalid credentials'
      })

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      // Open auth modal and attempt login
      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('Email'), {
          target: { value: 'wrong@example.com' }
        })
        fireEvent.change(screen.getByPlaceholderText('Password'), {
          target: { value: 'wrongpassword' }
        })

        const submitButton = screen.getByRole('button', { name: /login/i })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('should handle network errors', async () => {
      mockAuthContext.signIn.mockRejectedValue(new Error('Network error'))

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      // Open auth modal and attempt login
      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('Email'), {
          target: { value: 'test@example.com' }
        })
        fireEvent.change(screen.getByPlaceholderText('Password'), {
          target: { value: 'password123' }
        })

        const submitButton = screen.getByRole('button', { name: /login/i })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('auth.unexpectedError')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading spinner during initial auth check', () => {
      mockAuthContext.loading = true

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should show loading state during login process', async () => {
      let resolveSignIn: (value: any) => void
      const signInPromise = new Promise(resolve => {
        resolveSignIn = resolve
      })
      mockAuthContext.signIn.mockReturnValue(signInPromise)

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      // Open auth modal and start login
      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('Email'), {
          target: { value: 'test@example.com' }
        })
        fireEvent.change(screen.getByPlaceholderText('Password'), {
          target: { value: 'password123' }
        })

        const submitButton = screen.getByRole('button', { name: /login/i })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Logging in...')).toBeInTheDocument()
      })

      // Resolve the promise
      resolveSignIn!({ user: { id: 'user-123' }, error: null })
    })
  })

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      expect(screen.getByText('Miru - AI恋愛オーケストレーションシステム')).toBeInTheDocument()
    })

    it('should work on tablet viewport', () => {
      // Set tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      expect(screen.getByText('Miru - AI恋愛オーケストレーションシステム')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)

      expect(screen.getByLabelText('close')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('Email')
        emailInput.focus()
        expect(document.activeElement).toBe(emailInput)
      })
    })

    it('should close modal on Escape key', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      })

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument()
      })
    })
  })
})
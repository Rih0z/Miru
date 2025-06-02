import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/contexts/AuthContext'

// モックの設定
jest.mock('@/contexts/AuthContext')
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.login': 'ログイン',
      'auth.signup': 'サインアップ',
      'auth.createAccount': 'アカウント作成',
      'auth.resetPassword': 'パスワードリセット',
      'auth.email': 'メールアドレス',
      'auth.password': 'パスワード',
      'auth.confirmPassword': 'パスワード確認',
      'auth.loginButton': 'ログインする',
      'auth.signupButton': 'サインアップする',
      'auth.sendResetEmail': 'リセットメール送信',
      'auth.forgotPassword': 'パスワードを忘れた方',
      'auth.loggingIn': 'ログイン中...',
      'auth.signingUp': 'サインアップ中...',
      'auth.sendingEmail': 'メール送信中...',
      'auth.noAccount': 'アカウントをお持ちでない方？',
      'auth.alreadyHaveAccount': '既にアカウントをお持ちの方？',
      'auth.backToLogin': 'ログインに戻る',
      'auth.agreementText': 'サインアップすることで利用規約に同意します',
      'auth.modal.title': '認証',
      'auth.validation.invalidEmail': 'メールアドレスの形式が正しくありません',
      'auth.validation.passwordTooShort': 'パスワードは6文字以上である必要があります',
      'auth.validation.passwordMismatch': 'パスワードが一致しません',
      'auth.resetEmailSent': 'リセットメールを送信しました',
      'auth.confirmationEmailSent': '確認メールを送信しました',
      'auth.unexpectedError': '予期しないエラーが発生しました'
    }
    return translations[key] || key
  }
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('AuthModal', () => {
  const mockOnClose = jest.fn()
  const mockOnAuthSuccess = jest.fn()
  
  const mockAuthContext = {
    user: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue(mockAuthContext)
  })

  describe('Rendering', () => {
    it('should render login form by default', () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      expect(screen.getByText('ログイン')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('メールアドレス')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('パスワード')).toBeInTheDocument()
      expect(screen.getByText('ログインする')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(
        <AuthModal 
          isOpen={false} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      expect(screen.queryByText('ログイン')).not.toBeInTheDocument()
    })

    it('should switch to signup mode when signup tab is clicked', () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.click(screen.getByText('サインアップ'))

      expect(screen.getByText('アカウント作成')).toBeInTheDocument()
      expect(screen.getByText('サインアップする')).toBeInTheDocument()
    })

    it('should switch to password reset mode when forgot password is clicked', () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.click(screen.getByText('パスワードを忘れた方'))

      expect(screen.getByText('パスワードリセット')).toBeInTheDocument()
      expect(screen.getByText('リセットメール送信')).toBeInTheDocument()
    })
  })

  describe('Login Flow', () => {
    it('should handle successful login', async () => {
      mockAuthContext.signIn.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01' },
        error: null
      })

      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.change(screen.getByPlaceholderText('メールアドレス'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('パスワード'), {
        target: { value: 'password123' }
      })

      fireEvent.click(screen.getByText('ログインする'))

      await waitFor(() => {
        expect(mockAuthContext.signIn).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(mockOnAuthSuccess).toHaveBeenCalled()
      })
    })

    it('should handle login error', async () => {
      mockAuthContext.signIn.mockResolvedValue({
        user: null,
        error: 'Invalid credentials'
      })

      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.change(screen.getByPlaceholderText('メールアドレス'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('パスワード'), {
        target: { value: 'wrongpassword' }
      })

      fireEvent.click(screen.getByText('ログインする'))

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      const { container } = render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      const form = container.querySelector('form')!
      const emailInput = screen.getByPlaceholderText('メールアドレス')
      const passwordInput = screen.getByPlaceholderText('パスワード')

      fireEvent.change(emailInput, {
        target: { value: 'invalid-email' }
      })
      fireEvent.change(passwordInput, {
        target: { value: 'password123' }
      })

      // Directly submit the form to bypass HTML5 validation
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('メールアドレスの形式が正しくありません')).toBeInTheDocument()
      })
    })

    it('should validate password length', async () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.change(screen.getByPlaceholderText('メールアドレス'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('パスワード'), {
        target: { value: '123' }
      })

      fireEvent.click(screen.getByText('ログインする'))

      await waitFor(() => {
        expect(screen.getByText('パスワードは6文字以上である必要があります')).toBeInTheDocument()
      })
    })
  })

  describe('Signup Flow', () => {
    it('should handle successful signup', async () => {
      mockAuthContext.signUp.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01' },
        error: null
      })

      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.click(screen.getByText('サインアップ'))

      fireEvent.change(screen.getByPlaceholderText('メールアドレス'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('パスワード'), {
        target: { value: 'password123' }
      })
      fireEvent.change(screen.getByPlaceholderText('パスワード確認'), {
        target: { value: 'password123' }
      })

      fireEvent.click(screen.getByText('サインアップする'))

      await waitFor(() => {
        expect(mockAuthContext.signUp).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(screen.getByText('確認メールを送信しました')).toBeInTheDocument()
      })
    })

    it('should handle signup error', async () => {
      mockAuthContext.signUp.mockResolvedValue({
        user: null,
        error: 'Email already registered'
      })

      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.click(screen.getByText('サインアップ'))

      fireEvent.change(screen.getByPlaceholderText('メールアドレス'), {
        target: { value: 'existing@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('パスワード'), {
        target: { value: 'password123' }
      })
      fireEvent.change(screen.getByPlaceholderText('パスワード確認'), {
        target: { value: 'password123' }
      })

      fireEvent.click(screen.getByText('サインアップする'))

      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument()
      })
    })
  })

  describe('Password Reset Flow', () => {
    it('should handle successful password reset request', async () => {
      mockAuthContext.resetPassword.mockResolvedValue({
        error: null
      })

      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.click(screen.getByText('パスワードを忘れた方'))

      fireEvent.change(screen.getByPlaceholderText('メールアドレス'), {
        target: { value: 'test@example.com' }
      })

      fireEvent.click(screen.getByText('リセットメール送信'))

      await waitFor(() => {
        expect(mockAuthContext.resetPassword).toHaveBeenCalledWith('test@example.com')
        expect(screen.getByText('リセットメールを送信しました')).toBeInTheDocument()
      })
    })

    it('should handle password reset error', async () => {
      mockAuthContext.resetPassword.mockResolvedValue({
        error: 'User not found'
      })

      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.click(screen.getByText('パスワードを忘れた方'))

      fireEvent.change(screen.getByPlaceholderText('メールアドレス'), {
        target: { value: 'notfound@example.com' }
      })

      fireEvent.click(screen.getByText('リセットメール送信'))

      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state during login', async () => {
      let resolveSignIn: (value: any) => void
      const signInPromise = new Promise(resolve => {
        resolveSignIn = resolve
      })
      mockAuthContext.signIn.mockReturnValue(signInPromise)

      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.change(screen.getByPlaceholderText('メールアドレス'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('パスワード'), {
        target: { value: 'password123' }
      })

      fireEvent.click(screen.getByText('ログインする'))

      expect(screen.getByText('ログイン中...')).toBeInTheDocument()

      resolveSignIn!({ user: { id: 'user-123' }, error: null })
    })

    it('should disable form during loading', async () => {
      let resolveSignIn: (value: any) => void
      const signInPromise = new Promise(resolve => {
        resolveSignIn = resolve
      })
      mockAuthContext.signIn.mockReturnValue(signInPromise)

      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      // Fill in valid form data first
      fireEvent.change(screen.getByPlaceholderText('メールアドレス'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('パスワード'), {
        target: { value: 'password123' }
      })

      fireEvent.click(screen.getByText('ログインする'))

      expect(screen.getByPlaceholderText('メールアドレス')).toBeDisabled()
      expect(screen.getByPlaceholderText('パスワード')).toBeDisabled()
      expect(screen.getByText('ログイン中...')).toBeDisabled()

      resolveSignIn!({ user: { id: 'user-123' }, error: null })
    })
  })

  describe('UI Interactions', () => {
    it('should close modal when close button is clicked', () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.click(screen.getByLabelText('close'))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close modal when backdrop is clicked', () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.click(screen.getByTestId('modal-backdrop'))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not close modal when content is clicked', () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.click(screen.getByTestId('modal-content'))

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should toggle password visibility', () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      const passwordInput = screen.getByPlaceholderText('パスワード')
      const toggleButton = screen.getByLabelText('toggle-password-visibility')

      expect(passwordInput).toHaveAttribute('type', 'password')

      fireEvent.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'text')

      fireEvent.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      expect(screen.getByLabelText('認証')).toBeInTheDocument()
      expect(screen.getByLabelText('close')).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      const emailInput = screen.getByPlaceholderText('メールアドレス')
      const passwordInput = screen.getByPlaceholderText('パスワード')
      
      // Test that elements are focusable
      emailInput.focus()
      expect(document.activeElement).toBe(emailInput)

      passwordInput.focus()
      expect(document.activeElement).toBe(passwordInput)
    })

    it('should close modal on Escape key', () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onAuthSuccess={mockOnAuthSuccess} 
        />
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
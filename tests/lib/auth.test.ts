// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => {
  const mockAuth = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
  }
  
  return {
    createClient: jest.fn(() => ({
      auth: mockAuth
    })),
    __mockAuth: mockAuth // Export for test access
  }
})

// Mock the global window object
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000'
  },
  writable: true
})

// Import after mocking
import { AuthService } from '@/lib/auth'

describe('AuthService', () => {
  let authService: AuthService
  let mockAuth: any
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Get the mock auth object
    const supabaseMock = require('@supabase/supabase-js')
    mockAuth = supabaseMock.__mockAuth
    
    // Reset all mock functions
    Object.values(mockAuth).forEach((mock: jest.Mock) => mock.mockReset())
    
    // Reset environment variables
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
    }
    
    authService = new AuthService()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      }

      mockAuth.signUp.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.signUp('test@example.com', 'password123')

      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback'
        }
      })

      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z'
        },
        error: null
      })
    })

    it('should handle sign up error with translation', async () => {
      mockAuth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'User already registered' }
      })

      const result = await authService.signUp('existing@example.com', 'password123')

      expect(result).toEqual({
        user: null,
        error: 'このメールアドレスは既に登録されています'
      })
    })

    it('should handle network error', async () => {
      mockAuth.signUp.mockRejectedValueOnce(new Error('Network error'))

      const result = await authService.signUp('test@example.com', 'password123')

      expect(result).toEqual({
        user: null,
        error: 'ネットワークエラーが発生しました'
      })
    })

    it('should handle case where user data is returned but user is null', async () => {
      mockAuth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: null
      })

      const result = await authService.signUp('test@example.com', 'password123')

      expect(result).toEqual({
        user: null,
        error: 'アカウント作成に失敗しました'
      })
    })
  })

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      }

      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.signIn('test@example.com', 'password123')

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z'
        },
        error: null
      })
    })

    it('should handle invalid credentials', async () => {
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid login credentials' }
      })

      const result = await authService.signIn('test@example.com', 'wrongpassword')

      expect(result).toEqual({
        user: null,
        error: 'メールアドレスまたはパスワードが間違っています'
      })
    })

    it('should handle network error during sign in', async () => {
      mockAuth.signInWithPassword.mockRejectedValueOnce(new Error('Network error'))

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result).toEqual({
        user: null,
        error: 'ネットワークエラーが発生しました'
      })
    })

    it('should handle case where user data is returned but user is null', async () => {
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: null
      })

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result).toEqual({
        user: null,
        error: 'ログインに失敗しました'
      })
    })
  })

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockAuth.signOut.mockResolvedValueOnce({
        error: null
      })

      const result = await authService.signOut()

      expect(mockAuth.signOut).toHaveBeenCalled()
      expect(result).toEqual({ error: null })
    })

    it('should handle sign out error with translation', async () => {
      mockAuth.signOut.mockResolvedValueOnce({
        error: { message: 'Too many requests' }
      })

      const result = await authService.signOut()

      expect(result).toEqual({ error: 'リクエストが多すぎます。しばらく時間をおいてからお試しください' })
    })

    it('should handle network error during sign out', async () => {
      mockAuth.signOut.mockRejectedValueOnce(new Error('Network error'))

      const result = await authService.signOut()

      expect(result).toEqual({ error: 'ログアウトに失敗しました' })
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      }

      mockAuth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(mockAuth.getUser).toHaveBeenCalled()
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      })
    })

    it('should return null when not authenticated', async () => {
      mockAuth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(result).toBeNull()
    })

    it('should return null on error', async () => {
      mockAuth.getUser.mockRejectedValueOnce(new Error('Auth error'))

      const result = await authService.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      const mockCallback = jest.fn()
      const mockUnsubscribe = jest.fn()

      mockAuth.onAuthStateChange.mockReturnValueOnce({
        data: { subscription: { unsubscribe: mockUnsubscribe } }
      })

      const result = authService.onAuthStateChange(mockCallback)

      expect(mockAuth.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function)
      )
      expect(result.data.subscription.unsubscribe).toBe(mockUnsubscribe)
    })

    it('should call callback with user when auth state changes', () => {
      const mockCallback = jest.fn()
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      }

      mockAuth.onAuthStateChange.mockImplementationOnce((cb) => {
        // Simulate auth state change
        cb('SIGNED_IN', { user: mockUser })
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      authService.onAuthStateChange(mockCallback)

      expect(mockCallback).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      })
    })

    it('should call callback with null when user signs out', () => {
      const mockCallback = jest.fn()

      mockAuth.onAuthStateChange.mockImplementationOnce((cb) => {
        // Simulate sign out
        cb('SIGNED_OUT', null)
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      authService.onAuthStateChange(mockCallback)

      expect(mockCallback).toHaveBeenCalledWith(null)
    })

    it('should call callback with null when session has no user', () => {
      const mockCallback = jest.fn()

      mockAuth.onAuthStateChange.mockImplementationOnce((cb) => {
        // Simulate session without user
        cb('TOKEN_REFRESHED', { user: null })
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      authService.onAuthStateChange(mockCallback)

      expect(mockCallback).toHaveBeenCalledWith(null)
    })
  })

  describe('resetPassword', () => {
    it('should successfully send reset password email', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValueOnce({
        error: null
      })

      const result = await authService.resetPassword('test@example.com')

      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'http://localhost:3000/auth/reset-password'
        }
      )
      expect(result).toEqual({ error: null })
    })

    it('should handle reset password error with translation', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValueOnce({
        error: { message: 'Email rate limit exceeded' }
      })

      const result = await authService.resetPassword('test@example.com')

      expect(result).toEqual({ error: 'メール送信の制限に達しました。しばらく時間をおいてからお試しください' })
    })

    it('should handle network error during reset password', async () => {
      mockAuth.resetPasswordForEmail.mockRejectedValueOnce(new Error('Network error'))

      const result = await authService.resetPassword('test@example.com')

      expect(result).toEqual({ error: 'パスワードリセットに失敗しました' })
    })
  })

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      mockAuth.updateUser.mockResolvedValueOnce({
        error: null
      })

      const result = await authService.updatePassword('newpassword123')

      expect(mockAuth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123'
      })
      expect(result).toEqual({ error: null })
    })

    it('should handle update password error with translation', async () => {
      mockAuth.updateUser.mockResolvedValueOnce({
        error: { message: 'Password should be at least 6 characters' }
      })

      const result = await authService.updatePassword('short')

      expect(result).toEqual({ error: 'パスワードは6文字以上で入力してください' })
    })

    it('should handle network error during password update', async () => {
      mockAuth.updateUser.mockRejectedValueOnce(new Error('Network error'))

      const result = await authService.updatePassword('newpassword123')

      expect(result).toEqual({ error: 'パスワード更新に失敗しました' })
    })
  })

  describe('translateError', () => {
    it('should translate all known error messages to Japanese', () => {
      const authServiceInstance = new AuthService()
      const errorMap = {
        'Invalid login credentials': 'メールアドレスまたはパスワードが間違っています',
        'Email not confirmed': 'メールアドレスが確認されていません。確認メールをご確認ください',
        'User already registered': 'このメールアドレスは既に登録されています',
        'Password should be at least 6 characters': 'パスワードは6文字以上で入力してください',
        'Invalid email': 'メールアドレスの形式が正しくありません',
        'Signup requires a valid password': 'パスワードを入力してください',
        'Email rate limit exceeded': 'メール送信の制限に達しました。しばらく時間をおいてからお試しください',
        'Too many requests': 'リクエストが多すぎます。しばらく時間をおいてからお試しください'
      }

      Object.entries(errorMap).forEach(([english, japanese]) => {
        const translated = (authServiceInstance as any).translateError(english)
        expect(translated).toBe(japanese)
      })
    })

    it('should return original message for unknown errors', () => {
      const authServiceInstance = new AuthService()
      const unknownError = 'Some unknown error message'
      const translated = (authServiceInstance as any).translateError(unknownError)
      expect(translated).toBe(unknownError)
    })
  })

  describe('supabaseAuth not configured scenarios', () => {
    beforeEach(() => {
      // Clear environment variables to simulate unconfigured state
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_SUPABASE_URL: '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ''
      }
      
      // Need to mock the module again to reflect the environment change
      jest.resetModules()
    })

    it('should handle signUp when supabaseAuth is not configured', async () => {
      // Re-import with new environment
      const { AuthService } = require('@/lib/auth')
      const service = new AuthService()
      
      const result = await service.signUp('test@example.com', 'password123')
      
      expect(result).toEqual({
        user: null,
        error: 'Authentication service is not configured'
      })
    })

    it('should handle signIn when supabaseAuth is not configured', async () => {
      const { AuthService } = require('@/lib/auth')
      const service = new AuthService()
      
      const result = await service.signIn('test@example.com', 'password123')
      
      expect(result).toEqual({
        user: null,
        error: 'Authentication service is not configured'
      })
    })

    it('should handle signOut when supabaseAuth is not configured', async () => {
      const { AuthService } = require('@/lib/auth')
      const service = new AuthService()
      
      const result = await service.signOut()
      
      expect(result).toEqual({
        error: 'Authentication service is not configured'
      })
    })

    it('should handle getCurrentUser when supabaseAuth is not configured', async () => {
      const { AuthService } = require('@/lib/auth')
      const service = new AuthService()
      
      const result = await service.getCurrentUser()
      
      expect(result).toBeNull()
    })

    it('should handle resetPassword when supabaseAuth is not configured', async () => {
      const { AuthService } = require('@/lib/auth')
      const service = new AuthService()
      
      const result = await service.resetPassword('test@example.com')
      
      expect(result).toEqual({
        error: 'Authentication service is not configured'
      })
    })

    it('should handle updatePassword when supabaseAuth is not configured', async () => {
      const { AuthService } = require('@/lib/auth')
      const service = new AuthService()
      
      const result = await service.updatePassword('newpassword123')
      
      expect(result).toEqual({
        error: 'Authentication service is not configured'
      })
    })

    it('should handle onAuthStateChange when supabaseAuth is not configured', () => {
      const { AuthService } = require('@/lib/auth')
      const service = new AuthService()
      const mockCallback = jest.fn()
      
      const result = service.onAuthStateChange(mockCallback)
      
      expect(result.data.subscription.unsubscribe).toBeInstanceOf(Function)
      expect(result.data.subscription.unsubscribe()).toBeUndefined()
    })
  })
})
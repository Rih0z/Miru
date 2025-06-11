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
        error: 'そのメールアドレスは既に登録されています'
      })
    })

    it('should handle browser environment check', async () => {
      // Mock window being undefined
      const originalWindow = global.window
      delete (global as any).window

      const result = await authService.signUp('test@example.com', 'password123')

      expect(result).toEqual({
        user: null,
        error: 'ブラウザ環境が必要です'
      })

      // Restore window
      global.window = originalWindow
    })

    it('should handle network errors', async () => {
      mockAuth.signUp.mockRejectedValueOnce(new Error('Network error'))

      const result = await authService.signUp('test@example.com', 'password123')

      expect(result.user).toBeNull()
      expect(result.error).toContain('エラーが発生しました')
    })

    it('should handle missing user data in response', async () => {
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

    it('should handle sign in errors', async () => {
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid login credentials' }
      })

      const result = await authService.signIn('test@example.com', 'wrongpassword')

      expect(result).toEqual({
        user: null,
        error: 'メールアドレスまたはパスワードが正しくありません'
      })
    })

    it('should handle browser environment check for sign in', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result).toEqual({
        user: null,
        error: 'ブラウザ環境が必要です'
      })

      global.window = originalWindow
    })

    it('should handle network errors in sign in', async () => {
      mockAuth.signInWithPassword.mockRejectedValueOnce(new Error('Network error'))

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result.user).toBeNull()
      expect(result.error).toContain('エラーが発生しました')
    })

    it('should handle missing user in sign in response', async () => {
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: null
      })

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result).toEqual({
        user: null,
        error: 'サインインに失敗しました'
      })
    })
  })

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockAuth.signOut.mockResolvedValueOnce({ error: null })

      const result = await authService.signOut()

      expect(mockAuth.signOut).toHaveBeenCalled()
      expect(result).toEqual({ error: null })
    })

    it('should handle sign out errors', async () => {
      mockAuth.signOut.mockResolvedValueOnce({
        error: { message: 'Sign out failed' }
      })

      const result = await authService.signOut()

      expect(result).toEqual({
        error: 'サインアウトに失敗しました'
      })
    })

    it('should handle browser environment check for sign out', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = await authService.signOut()

      expect(result).toEqual({
        error: 'ブラウザ環境が必要です'
      })

      global.window = originalWindow
    })

    it('should handle network errors in sign out', async () => {
      mockAuth.signOut.mockRejectedValueOnce(new Error('Network error'))

      const result = await authService.signOut()

      expect(result.error).toContain('エラーが発生しました')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
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

      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z'
        },
        error: null
      })
    })

    it('should handle get user errors', async () => {
      mockAuth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'User not found' }
      })

      const result = await authService.getCurrentUser()

      expect(result).toEqual({
        user: null,
        error: 'ユーザー情報の取得に失敗しました'
      })
    })

    it('should handle browser environment check for getCurrentUser', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = await authService.getCurrentUser()

      expect(result).toEqual({
        user: null,
        error: 'ブラウザ環境が必要です'
      })

      global.window = originalWindow
    })

    it('should handle network errors in getCurrentUser', async () => {
      mockAuth.getUser.mockRejectedValueOnce(new Error('Network error'))

      const result = await authService.getCurrentUser()

      expect(result.user).toBeNull()
      expect(result.error).toContain('エラーが発生しました')
    })
  })

  describe('translateError', () => {
    it('should translate error messages correctly', () => {
      const authServiceInstance = authService as any

      expect(authServiceInstance.translateError('User already registered')).toBe('そのメールアドレスは既に登録されています')
      expect(authServiceInstance.translateError('Invalid login credentials')).toBe('メールアドレスまたはパスワードが正しくありません')
      expect(authServiceInstance.translateError('Password should be at least 6 characters')).toBe('パスワードは6文字以上で入力してください')
      expect(authServiceInstance.translateError('Unable to validate email address: invalid format')).toBe('メールアドレスの形式が正しくありません')
      expect(authServiceInstance.translateError('Unknown error')).toBe('Unknown error')
    })
  })

  describe('validation methods', () => {
    it('should validate email format', () => {
      const authServiceInstance = authService as any

      expect(authServiceInstance.validateEmail('valid@example.com')).toBe(true)
      expect(authServiceInstance.validateEmail('invalid-email')).toBe(false)
      expect(authServiceInstance.validateEmail('')).toBe(false)
      expect(authServiceInstance.validateEmail('test@')).toBe(false)
      expect(authServiceInstance.validateEmail('@example.com')).toBe(false)
    })

    it('should validate password strength', () => {
      const authServiceInstance = authService as any

      expect(authServiceInstance.validatePassword('password123')).toBe(true)
      expect(authServiceInstance.validatePassword('12345')).toBe(false) // too short
      expect(authServiceInstance.validatePassword('')).toBe(false)
    })
  })

  describe('demo mode', () => {
    beforeEach(() => {
      // Remove environment variables to trigger demo mode
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined
      }
      authService = new AuthService()
    })

    it('should handle demo mode sign up', async () => {
      const result = await authService.signUp('demo@example.com', 'password123')

      expect(result.user).toBeTruthy()
      expect(result.user?.email).toBe('demo@example.com')
      expect(result.user?.id).toContain('demo-')
      expect(result.error).toBeNull()
    })

    it('should validate email in demo mode', async () => {
      const result = await authService.signUp('invalid-email', 'password123')

      expect(result.user).toBeNull()
      expect(result.error).toBe('メールアドレスの形式が正しくありません')
    })

    it('should validate password in demo mode', async () => {
      const result = await authService.signUp('test@example.com', '123')

      expect(result.user).toBeNull()
      expect(result.error).toBe('パスワードは6文字以上で入力してください')
    })
  })
})
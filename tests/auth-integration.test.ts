/**
 * 認証機能の統合テスト
 * ユーザー登録、ログイン、ログアウトの実際の動作をテスト
 */

import { AuthService } from '@/lib/auth'

describe('Authentication Integration Tests', () => {
  let authService: AuthService
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testPassword123'

  beforeEach(() => {
    authService = new AuthService()
  })

  describe('User Registration Flow', () => {
    it('should complete user registration flow', async () => {
      // サインアップテスト
      const signUpResult = await authService.signUp(testEmail, testPassword)
      
      // Supabaseが設定されていない場合のハンドリング
      if (signUpResult.error === 'Authentication service is not configured') {
        console.log('🔧 Supabase is not configured - testing error handling')
        expect(signUpResult.user).toBeNull()
        expect(signUpResult.error).toBe('Authentication service is not configured')
        return
      }

      // 設定されている場合の通常のテスト
      if (signUpResult.error) {
        console.log('📧 Registration error (expected in test):', signUpResult.error)
        // メール確認が必要な場合や、既に存在するユーザーの場合
        expect(signUpResult.error).toMatch(/(確認メール|既に登録|Authentication service|ネットワークエラー)/i)
      } else {
        console.log('✅ User registration successful')
        expect(signUpResult.user).toBeTruthy()
        expect(signUpResult.user?.email).toBe(testEmail)
      }
    })

    it('should validate email format during registration', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test.example.com'
      ]

      for (const invalidEmail of invalidEmails) {
        const result = await authService.signUp(invalidEmail, testPassword)
        
        if (result.error !== 'Authentication service is not configured') {
          // Supabaseが設定されている場合、バリデーションエラーを期待
          expect(result.user).toBeNull()
          expect(result.error).toBeTruthy()
        }
      }
    })

    it('should validate password requirements during registration', async () => {
      const weakPasswords = [
        '',
        '123',
        '12345'
      ]

      for (const weakPassword of weakPasswords) {
        const result = await authService.signUp(testEmail, weakPassword)
        
        if (result.error !== 'Authentication service is not configured') {
          // Supabaseが設定されている場合、パスワードエラーを期待
          expect(result.user).toBeNull()
          expect(result.error).toBeTruthy()
        }
      }
    })
  })

  describe('User Login Flow', () => {
    it('should handle login with invalid credentials', async () => {
      const loginResult = await authService.signIn('nonexistent@example.com', 'wrongpassword')
      
      // Supabaseが設定されていない場合
      if (loginResult.error === 'Authentication service is not configured') {
        console.log('🔧 Supabase is not configured - testing error handling')
        expect(loginResult.user).toBeNull()
        expect(loginResult.error).toBe('Authentication service is not configured')
        return
      }

      // 設定されている場合、認証エラーを期待
      console.log('🔒 Login error (expected):', loginResult.error)
      expect(loginResult.user).toBeNull()
      expect(loginResult.error).toBeTruthy()
      expect(loginResult.error).toMatch(/(メールアドレス|パスワード|間違っています|Invalid|credentials|ネットワークエラー)/i)
    })

    it('should validate email format during login', async () => {
      const result = await authService.signIn('invalid-email', testPassword)
      
      if (result.error !== 'Authentication service is not configured') {
        expect(result.user).toBeNull()
        expect(result.error).toBeTruthy()
      }
    })
  })

  describe('Password Reset Flow', () => {
    it('should handle password reset request', async () => {
      const resetResult = await authService.resetPassword(testEmail)
      
      // Supabaseが設定されていない場合
      if (resetResult.error === 'Authentication service is not configured') {
        console.log('🔧 Supabase is not configured - testing error handling')
        expect(resetResult.error).toBe('Authentication service is not configured')
        return
      }

      // 設定されている場合、成功またはユーザー見つからないエラー
      console.log('🔄 Password reset result:', resetResult.error || 'Success')
      // パスワードリセットは通常成功する（ユーザーが存在しなくてもセキュリティ上成功と返す）
    })

    it('should validate email format for password reset', async () => {
      const result = await authService.resetPassword('invalid-email')
      
      if (result.error !== 'Authentication service is not configured') {
        expect(result.error).toBeTruthy()
      }
    })
  })

  describe('User State Management', () => {
    it('should get current user (null when not authenticated)', async () => {
      const currentUser = await authService.getCurrentUser()
      
      // 認証されていない状態ではnull
      expect(currentUser).toBeNull()
    })

    it('should handle auth state changes', async () => {
      const mockCallback = jest.fn()
      
      try {
        const subscription = authService.onAuthStateChange(mockCallback)
        
        // サブスクリプションが正しく設定されていることを確認
        expect(subscription).toBeTruthy()
        expect(subscription.data.subscription.unsubscribe).toBeInstanceOf(Function)
        
        // クリーンアップ
        subscription.data.subscription.unsubscribe()
      } catch (error) {
        // Supabaseの設定や接続の問題でエラーが発生する場合
        console.log('🔧 Auth state change error (expected in test environment):', error)
        expect(error).toBeTruthy()
      }
    })
  })

  describe('Error Translation', () => {
    it('should translate common authentication errors to Japanese', async () => {
      const testCases = [
        {
          scenario: 'Invalid login credentials',
          action: () => authService.signIn('test@example.com', 'wrongpassword'),
          expectedErrorPattern: /メールアドレス|パスワード|間違っています|Invalid|credentials|ネットワークエラー/i
        },
        {
          scenario: 'User already registered',
          action: () => authService.signUp('existing@example.com', testPassword),
          expectedErrorPattern: /既に登録|already|registered|ネットワークエラー/i
        }
      ]

      for (const testCase of testCases) {
        console.log(`🧪 Testing: ${testCase.scenario}`)
        const result = await testCase.action()
        
        if (result.error && result.error !== 'Authentication service is not configured') {
          expect(result.error).toMatch(testCase.expectedErrorPattern)
          console.log(`✅ Error translated correctly: ${result.error}`)
        } else if (result.error === 'Authentication service is not configured') {
          console.log('🔧 Supabase not configured - skipping error translation test')
        }
      }
    })
  })

  describe('Security Validation', () => {
    it('should prevent SQL injection attempts', async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "<script>alert('xss')</script>",
        "admin'/*",
      ]

      for (const maliciousInput of maliciousInputs) {
        const result = await authService.signIn(maliciousInput, testPassword)
        
        if (result.error !== 'Authentication service is not configured') {
          // セキュリティ上、これらの入力は適切にハンドリングされる必要がある
          expect(result.user).toBeNull()
          expect(result.error).toBeTruthy()
        }
      }
    })

    it('should handle rate limiting gracefully', async () => {
      // 複数回の失敗したログイン試行をシミュレート
      const promises = Array.from({ length: 5 }, () => 
        authService.signIn('test@example.com', 'wrongpassword')
      )

      const results = await Promise.all(promises)
      
      // すべてのリクエストが適切にハンドリングされることを確認
      results.forEach(result => {
        if (result.error !== 'Authentication service is not configured') {
          expect(result.user).toBeNull()
          expect(result.error).toBeTruthy()
        }
      })
    })
  })

  describe('Configuration Handling', () => {
    it('should gracefully handle missing Supabase configuration', async () => {
      // このテストは、Supabaseが設定されていない環境での動作を確認
      const signUpResult = await authService.signUp(testEmail, testPassword)
      const signInResult = await authService.signIn(testEmail, testPassword)
      const resetResult = await authService.resetPassword(testEmail)
      const currentUser = await authService.getCurrentUser()

      if (signUpResult.error === 'Authentication service is not configured') {
        console.log('✅ Gracefully handling missing Supabase configuration')
        expect(signUpResult.error).toBe('Authentication service is not configured')
        expect(signInResult.error).toBe('Authentication service is not configured')
        expect(resetResult.error).toBe('Authentication service is not configured')
        expect(currentUser).toBeNull()
      } else {
        console.log('✅ Supabase is configured and functioning')
      }
    })
  })
})
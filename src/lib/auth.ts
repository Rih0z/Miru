import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// デモモード判定（実際のSupabaseプロジェクトかどうかをチェック）
const isValidSupabaseUrl = supabaseUrl.includes('.supabase.co') && supabaseUrl !== 'https://xyzxyzxyzxyzxyzxyz.supabase.co'
const isValidSupabaseKey = supabaseAnonKey.startsWith('eyJ') && !supabaseAnonKey.includes('demo')

export const supabaseAuth = (isValidSupabaseUrl && isValidSupabaseKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

export interface AuthUser {
  id: string
  email: string
  created_at: string
}

export class AuthService {
  
  /**
   * メールアドレスでサインアップ
   */
  async signUp(email: string, password: string): Promise<{ user: AuthUser | null, error: string | null }> {
    try {
      if (!supabaseAuth) {
        // デモモード: ローカルストレージを使用
        if (typeof window !== 'undefined') {
          // 入力検証
          if (!email || !password) {
            return { user: null, error: 'メールアドレスとパスワードを入力してください' }
          }
          
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(email)) {
            return { user: null, error: 'メールアドレスの形式が正しくありません' }
          }
          
          const existingUsers = JSON.parse(localStorage.getItem('demo-users') || '[]')
          
          // メールアドレスの重複チェック
          if (existingUsers.find((u: any) => u.email === email)) {
            return { user: null, error: 'このメールアドレスは既に登録されています' }
          }
          
          // パスワードの検証
          if (password.length < 6) {
            return { user: null, error: 'パスワードは6文字以上で入力してください' }
          }
          
          const newUser: AuthUser = {
            id: 'demo-' + Date.now(),
            email: email,
            created_at: new Date().toISOString()
          }
          
          existingUsers.push({ ...newUser, password })
          localStorage.setItem('demo-users', JSON.stringify(existingUsers))
          localStorage.setItem('demo-current-user', JSON.stringify(newUser))
          
          console.log('デモモード: ユーザー登録完了', newUser)
          return { user: newUser, error: null }
        }
        return { user: null, error: 'ブラウザ環境が必要です' }
      }
      const { data, error } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { user: null, error: this.translateError(error.message) }
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at
          },
          error: null
        }
      }

      return { user: null, error: 'アカウント作成に失敗しました' }
    } catch (err: any) {
      console.error('SignUp error:', err)
      return { user: null, error: `エラーが発生しました: ${err.message || 'ネットワークエラー'}` }
    }
  }

  /**
   * メールアドレスでサインイン
   */
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null, error: string | null }> {
    try {
      if (!supabaseAuth) {
        // デモモード: ローカルストレージを使用
        if (typeof window !== 'undefined') {
          const existingUsers = JSON.parse(localStorage.getItem('demo-users') || '[]')
          const user = existingUsers.find((u: any) => u.email === email && u.password === password)
          
          if (!user) {
            return { user: null, error: 'メールアドレスまたはパスワードが間違っています' }
          }
          
          const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          }
          
          localStorage.setItem('demo-current-user', JSON.stringify(authUser))
          return { user: authUser, error: null }
        }
        return { user: null, error: 'Authentication service is not configured' }
      }
      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, error: this.translateError(error.message) }
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at
          },
          error: null
        }
      }

      return { user: null, error: 'ログインに失敗しました' }
    } catch (err) {
      return { user: null, error: 'ネットワークエラーが発生しました' }
    }
  }

  /**
   * サインアウト
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      if (!supabaseAuth) {
        // デモモード: ローカルストレージをクリア
        if (typeof window !== 'undefined') {
          localStorage.removeItem('demo-current-user')
          return { error: null }
        }
        return { error: 'Authentication service is not configured' }
      }
      const { error } = await supabaseAuth.auth.signOut()
      if (error) {
        return { error: this.translateError(error.message) }
      }
      return { error: null }
    } catch (err) {
      return { error: 'ログアウトに失敗しました' }
    }
  }

  /**
   * 現在のユーザー情報を取得
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      if (!supabaseAuth) {
        // デモモード: ローカルストレージから取得
        if (typeof window !== 'undefined') {
          const currentUser = localStorage.getItem('demo-current-user')
          return currentUser ? JSON.parse(currentUser) : null
        }
        return null
      }
      const { data: { user } } = await supabaseAuth.auth.getUser()
      
      if (user) {
        return {
          id: user.id,
          email: user.email!,
          created_at: user.created_at
        }
      }
      
      return null
    } catch (err) {
      return null
    }
  }

  /**
   * 認証状態の変化を監視
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!supabaseAuth) {
      // デモモード: 初期状態を確認
      if (typeof window !== 'undefined') {
        const currentUser = localStorage.getItem('demo-current-user')
        callback(currentUser ? JSON.parse(currentUser) : null)
      }
      // Return a no-op unsubscribe function
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
    return supabaseAuth.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at
        })
      } else {
        callback(null)
      }
    })
  }

  /**
   * パスワードリセット
   */
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      if (!supabaseAuth) {
        return { error: 'Authentication service is not configured' }
      }
      const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        return { error: this.translateError(error.message) }
      }

      return { error: null }
    } catch (err) {
      return { error: 'パスワードリセットに失敗しました' }
    }
  }

  /**
   * パスワード更新
   */
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      if (!supabaseAuth) {
        return { error: 'Authentication service is not configured' }
      }
      const { error } = await supabaseAuth.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { error: this.translateError(error.message) }
      }

      return { error: null }
    } catch (err) {
      return { error: 'パスワード更新に失敗しました' }
    }
  }

  /**
   * エラーメッセージを日本語に翻訳
   */
  private translateError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'メールアドレスまたはパスワードが間違っています',
      'Email not confirmed': 'メールアドレスが確認されていません。確認メールをご確認ください',
      'User already registered': 'このメールアドレスは既に登録されています',
      'Password should be at least 6 characters': 'パスワードは6文字以上で入力してください',
      'Invalid email': 'メールアドレスの形式が正しくありません',
      'Signup requires a valid password': 'パスワードを入力してください',
      'Email rate limit exceeded': 'メール送信の制限に達しました。しばらく時間をおいてからお試しください',
      'Too many requests': 'リクエストが多すぎます。しばらく時間をおいてからお試しください'
    }

    return errorMap[errorMessage] || errorMessage
  }
}
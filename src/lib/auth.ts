import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabaseAuth = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

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
        return { user: null, error: 'Authentication service is not configured' }
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
    } catch (err) {
      return { user: null, error: 'ネットワークエラーが発生しました' }
    }
  }

  /**
   * メールアドレスでサインイン
   */
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null, error: string | null }> {
    try {
      if (!supabaseAuth) {
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
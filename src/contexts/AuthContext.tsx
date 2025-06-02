'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ user: AuthUser | null, error: string | null }>
  signIn: (email: string, password: string) => Promise<{ user: AuthUser | null, error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const authService = new AuthService()

  useEffect(() => {
    // 初期ユーザー状態を取得
    const getInitialUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('初期ユーザー取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // 認証状態の変化を監視
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const result = await authService.signUp(email, password)
    if (result.user) {
      setUser(result.user)
    }
    return result
  }

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password)
    if (result.user) {
      setUser(result.user)
    }
    return result
  }

  const signOut = async () => {
    const result = await authService.signOut()
    if (!result.error) {
      setUser(null)
    }
    return result
  }

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email)
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
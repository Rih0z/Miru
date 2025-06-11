'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { GlassCard } from '../ui/GlassCard'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ErrorState } from '../ui/ErrorState'
import { HeroText, Body, Caption } from '../ui/Typography'
import { RippleButton } from '../ui/MicroInteractions'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2,
  ArrowLeft,
  Shield,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: () => void
}

type AuthMode = 'login' | 'signup' | 'reset'

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const t = useTranslations()
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // ログインエラーメッセージの翻訳
  const translateLoginError = (error: string): string => {
    if (error.includes('メールアドレスまたはパスワードが間違っています') || 
        error.includes('Invalid login credentials')) {
      return t('auth.errors.invalidCredentials')
    }
    if (error.includes('User not found') || error.includes('ユーザーが見つかりません')) {
      return t('auth.errors.userNotFound')
    }
    if (error.includes('Wrong password') || error.includes('パスワードが間違っています')) {
      return t('auth.errors.wrongPassword')
    }
    if (error.includes('Too many requests') || error.includes('リクエストが多すぎます')) {
      return t('auth.errors.tooManyRequests')
    }
    if (error.includes('Email not confirmed') || error.includes('メールアドレスが確認されていません')) {
      return 'メールアドレスが確認されていません。受信メールボックスをご確認ください'
    }
    if (error.includes('Network') || error.includes('ネットワーク')) {
      return t('auth.errors.networkError')
    }
    // デフォルトのログインエラーメッセージ
    return t('auth.errors.invalidCredentials')
  }

  // サインアップエラーメッセージの翻訳
  const translateSignupError = (error: string): string => {
    if (error.includes('User already registered') || error.includes('既に登録されています')) {
      return t('auth.errors.emailAlreadyExists')
    }
    if (error.includes('Password should be at least') || error.includes('パスワードは6文字以上')) {
      return t('auth.errors.weakPassword')
    }
    if (error.includes('Email rate limit') || error.includes('メール送信の制限')) {
      return t('auth.errors.tooManyRequests')
    }
    if (error.includes('Invalid email') || error.includes('メールアドレスの形式')) {
      return t('auth.validation.invalidEmail')
    }
    if (error.includes('Network') || error.includes('ネットワーク')) {
      return t('auth.errors.networkError')
    }
    return error
  }

  // パスワードリセットエラーメッセージの翻訳
  const translateResetError = (error: string): string => {
    if (error.includes('User not found') || error.includes('ユーザーが見つかりません')) {
      return t('auth.errors.userNotFound')
    }
    if (error.includes('Email rate limit') || error.includes('メール送信の制限')) {
      return t('auth.errors.tooManyRequests')
    }
    if (error.includes('Invalid email') || error.includes('メールアドレスの形式')) {
      return t('auth.validation.invalidEmail')
    }
    if (error.includes('Network') || error.includes('ネットワーク')) {
      return t('auth.errors.networkError')
    }
    return error
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    // バリデーション
    if (!validateEmail(email)) {
      setError(t('auth.validation.invalidEmail'))
      setIsLoading(false)
      return
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError(t('auth.validation.passwordMismatch'))
      setIsLoading(false)
      return
    }

    if (password.length < 6 && mode !== 'reset') {
      setError(t('auth.validation.passwordTooShort'))
      setIsLoading(false)
      return
    }

    try {
      if (mode === 'login') {
        const { user, error } = await signIn(email, password)
        if (error) {
          // より具体的なエラーメッセージを表示
          setError(translateLoginError(error))
        } else if (user) {
          onAuthSuccess()
          onClose()
        }
      } else if (mode === 'signup') {
        const { user, error } = await signUp(email, password)
        if (error) {
          setError(translateSignupError(error))
        } else {
          setMessage(t('auth.confirmationEmailSent'))
          setMode('login')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setError(translateResetError(error))
        } else {
          setMessage(t('auth.resetEmailSent'))
          setMode('login')
        }
      }
    } catch (err) {
      setError(t('auth.errors.networkError'))
    }

    setIsLoading(false)
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setMessage('')
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getAuthIcon = () => {
    switch (mode) {
      case 'login': return <User className="w-5 h-5" />
      case 'signup': return <Shield className="w-5 h-5" />
      case 'reset': return <Mail className="w-5 h-5" />
      default: return <User className="w-5 h-5" />
    }
  }

  const getAuthTitle = () => {
    switch (mode) {
      case 'login': return t('auth.login')
      case 'signup': return t('auth.createAccount')
      case 'reset': return t('auth.resetPassword')
      default: return t('auth.login')
    }
  }

  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      variant="glass"
      size="md"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-ai-gradient flex items-center justify-center text-white shadow-lg">
            {getAuthIcon()}
          </div>
          <HeroText className="text-2xl">
            {getAuthTitle()}
          </HeroText>
          <Body className="text-text-secondary">
            {mode === 'login' && 'おかえりなさい！アカウントにログインしてください'}
            {mode === 'signup' && '新しいアカウントを作成して、恋愛の旅を始めましょう'}
            {mode === 'reset' && 'パスワードをリセットするためのメールをお送りします'}
          </Body>
        </div>

        {/* Error State */}
        {error && (
          <GlassCard variant="danger" className="border border-accent-error/20">
            <div className="flex items-start gap-3 p-4">
              <div className="w-8 h-8 rounded-xl bg-accent-error/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-accent-error" />
              </div>
              <div className="flex-1">
                <Body className="font-medium text-accent-error mb-1">
                  {mode === 'login' ? 'ログインエラー' : 
                   mode === 'signup' ? 'アカウント作成エラー' : 
                   'パスワードリセットエラー'}
                </Body>
                <Caption className="text-accent-error/80">{error}</Caption>
                {mode === 'login' && error.includes('メールアドレスまたはパスワードが正しくありません') && (
                  <div className="mt-2 space-y-1">
                    <Caption className="text-accent-error/70">• メールアドレスに間違いがないか確認してください</Caption>
                    <Caption className="text-accent-error/70">• パスワードの大文字・小文字をご確認ください</Caption>
                    <Caption className="text-accent-error/70">• パスワードを忘れた場合は下のリンクをクリックしてください</Caption>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        {/* Success State */}
        {message && (
          <GlassCard variant="success" className="border border-accent-success/20">
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 rounded-xl bg-accent-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-accent-success" />
              </div>
              <Caption className="text-accent-success font-medium">{message}</Caption>
            </div>
          </GlassCard>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-2">
            <Caption className="font-medium text-text-primary flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {t('auth.email')}
            </Caption>
            <div className="relative">
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary',
                  'disabled:bg-glass-10 disabled:text-text-muted',
                  'placeholder:text-text-muted text-text-primary'
                )}
                placeholder="例: your@email.com"
              />
            </div>
          </div>

          {/* Password Input */}
          {mode !== 'reset' && (
            <div className="space-y-2">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {t('auth.password')}
              </Caption>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    'w-full px-4 py-3 pr-12 rounded-xl transition-all duration-200',
                    'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                    'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary',
                    'disabled:bg-glass-10 disabled:text-text-muted',
                    'placeholder:text-text-muted text-text-primary'
                  )}
                  placeholder="6文字以上のパスワード"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    'absolute inset-y-0 right-0 pr-3 flex items-center',
                    'text-text-muted hover:text-text-primary transition-colors',
                    'focus:outline-none focus:text-accent-primary'
                  )}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password Input */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {t('auth.confirmPassword')}
              </Caption>
              <input
                type="password"
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary',
                  'disabled:bg-glass-10 disabled:text-text-muted',
                  'placeholder:text-text-muted text-text-primary'
                )}
                placeholder="パスワードを再入力してください"
              />
            </div>
          )}

          {/* Submit Button */}
          <RippleButton
            type="submit"
            disabled={isLoading}
            variant="primary"
            size="lg"
            className="w-full min-h-[48px]"
            glow
            icon={isLoading ? <LoadingSpinner size="sm" className="w-4 h-4" /> : undefined}
          >
            {isLoading ? (
              mode === 'login' ? t('auth.loggingIn') :
              mode === 'signup' ? t('auth.signingUp') :
              t('auth.sendingEmail')
            ) : (
              mode === 'login' ? t('auth.loginButton') :
              mode === 'signup' ? t('auth.signupButton') :
              t('auth.sendResetEmail')
            )}
          </RippleButton>
        </form>

        {/* Mode Switching */}
        <div className="space-y-4 text-center">
          {mode === 'login' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Caption className="text-text-muted">{t('auth.noAccount')}</Caption>
                <button
                  onClick={() => switchMode('signup')}
                  className="text-accent-primary hover:text-accent-primary/80 font-medium transition-colors underline"
                >
                  {t('auth.signup')}
                </button>
              </div>
              <button
                onClick={() => switchMode('reset')}
                className="text-accent-info hover:text-accent-info/80 font-medium transition-colors underline"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <div className="flex items-center justify-center gap-2">
              <Caption className="text-text-muted">{t('auth.alreadyHaveAccount')}</Caption>
              <button
                onClick={() => switchMode('login')}
                className="text-accent-primary hover:text-accent-primary/80 font-medium transition-colors underline"
              >
                {t('auth.login')}
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <Button
              onClick={() => switchMode('login')}
              variant="ghost"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              className="mx-auto"
            >
              {t('auth.backToLogin')}
            </Button>
          )}
        </div>

        {/* Agreement */}
        <div className="pt-4 border-t border-glass-20">
          <Caption className="text-text-muted text-center">
            {t('auth.agreementText')}
          </Caption>
        </div>
      </div>
    </Modal>
  )
}
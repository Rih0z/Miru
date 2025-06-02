'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'

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
          setError(error)
        } else if (user) {
          onAuthSuccess()
          onClose()
        }
      } else if (mode === 'signup') {
        const { user, error } = await signUp(email, password)
        if (error) {
          setError(error)
        } else {
          setMessage(t('auth.confirmationEmailSent'))
          setMode('login')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error)
        } else {
          setMessage(t('auth.resetEmailSent'))
          setMode('login')
        }
      }
    } catch (err) {
      setError(t('auth.unexpectedError'))
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

  return (
    <div 
      data-testid="modal-backdrop"
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        data-testid="modal-content"
        className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 
            aria-label={t('auth.modal.title')}
            className="text-xl sm:text-2xl font-bold"
          >
            {mode === 'login' && t('auth.login')}
            {mode === 'signup' && t('auth.createAccount')}
            {mode === 'reset' && t('auth.resetPassword')}
          </h2>
          <button
            aria-label="close"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 active:text-gray-800 touch-manipulation p-2 -m-2"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email')}
            </label>
            <input
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-base sm:text-sm"
              placeholder={t('auth.email')}
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-3 sm:py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-base sm:text-sm"
                  placeholder={t('auth.password')}
                />
                <button
                  type="button"
                  aria-label="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 active:text-gray-800 touch-manipulation"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-base sm:text-sm"
                placeholder={t('auth.confirmPassword')}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 sm:py-2 px-4 rounded-md font-medium touch-manipulation min-h-[44px] sm:min-h-[auto] ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
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
          </button>
        </form>

        <div className="mt-4 sm:mt-6 space-y-2 text-center text-sm">
          {mode === 'login' && (
            <>
              <p>
                {t('auth.noAccount')}{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-blue-600 hover:text-blue-800 active:text-blue-900 underline touch-manipulation"
                >
                  {t('auth.signup')}
                </button>
              </p>
              <p>
                <button
                  onClick={() => switchMode('reset')}
                  className="text-blue-600 hover:text-blue-800 active:text-blue-900 underline touch-manipulation"
                >
                  {t('auth.forgotPassword')}
                </button>
              </p>
            </>
          )}

          {mode === 'signup' && (
            <p>
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-blue-600 hover:text-blue-800 active:text-blue-900 underline touch-manipulation"
              >
                {t('auth.login')}
              </button>
            </p>
          )}

          {mode === 'reset' && (
            <p>
              <button
                onClick={() => switchMode('login')}
                className="text-blue-600 hover:text-blue-800 active:text-blue-900 underline touch-manipulation"
              >
                {t('auth.backToLogin')}
              </button>
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {t('auth.agreementText')}
          </p>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Dashboard } from '@/components/Dashboard'
import { AuthModal } from '@/components/auth/AuthModal'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'

export default function Home() {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const t = useTranslations()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {t('app.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('app.description')}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg"
              >
                {t('auth.loginButton')}
              </button>
              <p className="text-sm text-gray-500">
                {t('app.subtitle')}
              </p>
            </div>
          </div>
        </div>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => setShowAuthModal(false)}
        />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="container mx-auto px-4 py-8">
        <Dashboard userId={user.id} />
      </div>
    </main>
  )
}
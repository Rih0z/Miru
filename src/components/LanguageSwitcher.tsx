'use client'

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { setUserLocale } from '@/lib/locale'

export function LanguageSwitcher() {
  const t = useTranslations('language')
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const handleLocaleChange = (newLocale: 'ja' | 'en') => {
    startTransition(() => {
      setUserLocale(newLocale)
      setIsOpen(false)
      // ページをリロードして言語を適用
      window.location.reload()
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title={t('switch')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span>{locale === 'ja' ? '日本語' : 'English'}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50">
          <button
            onClick={() => handleLocaleChange('ja')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
              locale === 'ja' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
          >
            {t('japanese')}
          </button>
          <button
            onClick={() => handleLocaleChange('en')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
              locale === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
          >
            {t('english')}
          </button>
        </div>
      )}
    </div>
  )
}
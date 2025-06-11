'use client'

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { setUserLocale } from '@/lib/locale'
import { GlassCard } from './ui/GlassCard'
import { Button } from './ui/Button'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        variant="ghost"
        size="sm"
        className={cn(
          'flex items-center gap-2 transition-all duration-200',
          isOpen && 'bg-glass-10'
        )}
        title={t('switch')}
      >
        {isPending ? (
          <LoadingSpinner size="sm" className="w-4 h-4" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {locale === 'ja' ? '日本語' : 'English'}
        </span>
        <ChevronDown 
          className={cn(
            'w-3 h-3 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-bg-primary/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 z-50 animate-scale-in">
            <GlassCard variant="prominent" blur="medium" className="p-2">
              <div className="space-y-1">
                <button
                  onClick={() => handleLocaleChange('ja')}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg',
                    'transition-all duration-200 hover:bg-glass-10',
                    locale === 'ja' 
                      ? 'bg-accent-primary/10 text-accent-primary font-medium'
                      : 'text-text-primary hover:text-text-primary'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">🇯🇵</span>
                    {t('japanese')}
                  </span>
                  {locale === 'ja' && (
                    <Check className="w-4 h-4 text-accent-primary" />
                  )}
                </button>
                
                <button
                  onClick={() => handleLocaleChange('en')}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg',
                    'transition-all duration-200 hover:bg-glass-10',
                    locale === 'en'
                      ? 'bg-accent-primary/10 text-accent-primary font-medium'
                      : 'text-text-primary hover:text-text-primary'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">🇺🇸</span>
                    {t('english')}
                  </span>
                  {locale === 'en' && (
                    <Check className="w-4 h-4 text-accent-primary" />
                  )}
                </button>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  )
}
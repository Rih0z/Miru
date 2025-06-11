'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Heart, Sparkles, Loader2, Brain, Zap } from 'lucide-react'
import { AILoadingIndicator } from './AIProgress'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  submessage?: string
  variant?: 'default' | 'heart' | 'sparkle' | 'ai' | 'brutal'
  fullScreen?: boolean
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  submessage,
  variant = 'default',
  fullScreen = false,
  className
}) => {
  const sizeConfig = {
    sm: { spinner: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' },
    md: { spinner: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-base' },
    lg: { spinner: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-lg' },
    xl: { spinner: 'w-20 h-20', icon: 'w-10 h-10', text: 'text-xl' }
  }

  const config = sizeConfig[size]

  // Different loading variants
  const spinnerContent = () => {
    switch (variant) {
      case 'heart':
        return (
          <div className="relative">
            <div className={cn(
              config.spinner,
              'rounded-full border-4 border-glass-20 border-t-accent-primary animate-spin'
            )} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className={cn(config.icon, 'text-accent-primary animate-pulse')} />
            </div>
          </div>
        )

      case 'sparkle':
        return (
          <div className="relative">
            <Sparkles className={cn(config.spinner, 'text-accent-secondary animate-spin')} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-accent-secondary rounded-full animate-ping" />
            </div>
          </div>
        )

      case 'ai':
        return <AILoadingIndicator size={size === 'xl' ? 'lg' : size} message={message} submessage={submessage} />

      case 'brutal':
        return (
          <div className="relative">
            <div className={cn(
              config.spinner,
              'bg-accent-warning border-3 border-black shadow-brutal-md animate-spin',
              'rounded-lg'
            )}>
              <Zap className={cn(config.icon, 'text-black mx-auto mt-2')} />
            </div>
          </div>
        )

      default:
        return (
          <Loader2 className={cn(config.spinner, 'text-accent-primary animate-spin')} />
        )
    }
  }

  const loadingContent = (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      {spinnerContent()}
      
      {(message || submessage) && variant !== 'ai' && (
        <div className="text-center space-y-2 max-w-sm">
          {message && (
            <p className={cn(
              'font-bold text-text-primary',
              config.text,
              variant === 'brutal' && 'uppercase'
            )}>
              {variant === 'heart' || variant === 'sparkle' ? (
                <span className="ai-text-gradient">{message}</span>
              ) : (
                message
              )}
            </p>
          )}
          {submessage && (
            <p className={cn('text-text-secondary', config.text === 'text-xl' ? 'text-lg' : 'text-sm')}>
              {submessage}
            </p>
          )}
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-bg-primary/90 backdrop-blur-medium',
        'animate-fade-in'
      )}>
        <div className="animate-scale-in">
          {loadingContent}
        </div>
      </div>
    )
  }

  return loadingContent
}

// Skeleton Loader Component
export const SkeletonLoader: React.FC<{
  lines?: number
  className?: string
}> = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton h-4 rounded',
            i === lines - 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  )
}

// Page Loading Component
export const PageLoader: React.FC<{
  message?: string
}> = ({ message = 'ページを読み込んでいます...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner
        variant="ai"
        size="lg"
        message={message}
        submessage="もう少しお待ちください"
      />
    </div>
  )
}

// Inline Loading Component
export const InlineLoader: React.FC<{
  className?: string
}> = ({ className }) => {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">読み込み中...</span>
    </span>
  )
}
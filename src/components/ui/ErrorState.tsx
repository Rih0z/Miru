'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, RefreshCw, Home, Bug, Zap } from 'lucide-react'
import { Button } from './Button'
import { GlassCard } from './GlassCard'
import { GradientText } from './Typography'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  onGoHome?: () => void
  variant?: 'default' | 'danger' | 'warning' | '404' | 'brutal'
  className?: string
  icon?: React.ReactNode
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'エラーが発生しました',
  message = '申し訳ございません。予期しないエラーが発生しました。',
  onRetry,
  onGoHome,
  variant = 'default',
  className,
  icon
}) => {
  const variantConfig = {
    default: {
      icon: <AlertTriangle className="w-16 h-16 text-accent-error" />,
      color: 'text-accent-error',
      bgColor: 'bg-accent-error/10'
    },
    danger: {
      icon: <Bug className="w-16 h-16 text-accent-error" />,
      color: 'text-accent-error',
      bgColor: 'bg-accent-error/10'
    },
    warning: {
      icon: <AlertTriangle className="w-16 h-16 text-accent-warning" />,
      color: 'text-accent-warning',
      bgColor: 'bg-accent-warning/10'
    },
    '404': {
      icon: (
        <div className="text-hero font-black text-accent-primary">
          404
        </div>
      ),
      color: 'text-accent-primary',
      bgColor: 'bg-accent-primary/10'
    },
    brutal: {
      icon: <Zap className="w-16 h-16 text-black" />,
      color: 'text-black',
      bgColor: 'bg-accent-warning'
    }
  }

  const config = variantConfig[variant]

  const content = (
    <div className="text-center space-y-6 p-8">
      {/* Icon */}
      <div className="flex justify-center">
        <div className={cn(
          'w-24 h-24 rounded-full flex items-center justify-center',
          config.bgColor,
          variant === 'brutal' && 'border-3 border-black shadow-brutal-md'
        )}>
          {icon || config.icon}
        </div>
      </div>

      {/* Text */}
      <div className="space-y-2 max-w-md mx-auto">
        <h2 className={cn(
          'text-2xl font-bold',
          variant === 'brutal' ? 'uppercase' : '',
          config.color
        )}>
          {variant === 'brutal' ? (
            title
          ) : (
            <GradientText>{title}</GradientText>
          )}
        </h2>
        <p className="text-text-secondary">
          {message}
        </p>
      </div>

      {/* Actions */}
      {(onRetry || onGoHome) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant={variant === 'brutal' ? 'brutal' : 'primary'}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              もう一度試す
            </Button>
          )}
          {onGoHome && (
            <Button
              onClick={onGoHome}
              variant="secondary"
              icon={<Home className="w-4 h-4" />}
            >
              ホームに戻る
            </Button>
          )}
        </div>
      )}
    </div>
  )

  if (variant === 'brutal') {
    return (
      <div className={cn('brutal-card max-w-lg mx-auto', className)}>
        {content}
      </div>
    )
  }

  return (
    <GlassCard
      variant="prominent"
      className={cn('max-w-lg mx-auto', className)}
    >
      {content}
    </GlassCard>
  )
}

// 404 Error Page Component
export const Error404: React.FC<{
  onGoHome?: () => void
}> = ({ onGoHome }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorState
        variant="404"
        title="ページが見つかりません"
        message="お探しのページは存在しないか、移動した可能性があります。"
        onGoHome={onGoHome}
      />
    </div>
  )
}

// Network Error Component
export const NetworkError: React.FC<{
  onRetry?: () => void
}> = ({ onRetry }) => {
  return (
    <ErrorState
      variant="warning"
      title="ネットワークエラー"
      message="インターネット接続を確認してください。"
      onRetry={onRetry}
    />
  )
}

// Permission Error Component
export const PermissionError: React.FC<{
  onGoHome?: () => void
}> = ({ onGoHome }) => {
  return (
    <ErrorState
      variant="danger"
      title="アクセス権限がありません"
      message="このページを表示する権限がありません。"
      onGoHome={onGoHome}
    />
  )
}
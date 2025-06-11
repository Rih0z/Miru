'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Heart, Plus, Download, Search, Users } from 'lucide-react'
import { Button } from './Button'
import { GlassCard } from './GlassCard'
import { HeroText, Body } from './Typography'
import { Spatial3DCard } from './Spatial3D'

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  }
  variant?: 'default' | 'search' | 'brutal' | '3d'
  fullScreen?: boolean
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '恋愛の旅を始めましょう',
  description = 'MiruがAIの力で素晴らしいコネクションを発見し、意味のある関係を築くお手伝いをします',
  icon: IconComponent = Heart,
  primaryAction,
  secondaryAction,
  variant = 'default',
  fullScreen = true,
  className
}) => {
  const variantConfig = {
    default: {
      iconBg: 'bg-accent-primary/10',
      iconColor: 'text-accent-primary',
      container: 'glass'
    },
    search: {
      iconBg: 'bg-accent-info/10',
      iconColor: 'text-accent-info',
      container: 'glass'
    },
    brutal: {
      iconBg: 'bg-accent-warning',
      iconColor: 'text-black',
      container: 'brutal'
    },
    '3d': {
      iconBg: 'bg-ai-gradient',
      iconColor: 'text-white',
      container: '3d'
    }
  }

  const config = variantConfig[variant]

  const renderIcon = () => {
    if (React.isValidElement(IconComponent)) {
      return IconComponent
    }
    
    const Icon = IconComponent as React.ComponentType<{ className?: string }>
    return <Icon className={cn('w-16 h-16', config.iconColor)} />
  }

  const content = (
    <div className="text-center space-y-8 p-8 lg:p-12">
      {/* Icon */}
      <div className="flex justify-center">
        <div className={cn(
          'w-32 h-32 rounded-full flex items-center justify-center',
          'animate-scale-in',
          config.iconBg,
          variant === 'brutal' && 'border-3 border-black shadow-brutal-lg',
          variant === '3d' && 'shadow-xl'
        )}>
          {renderIcon()}
        </div>
      </div>

      {/* Text */}
      <div className="space-y-4 max-w-lg mx-auto">
        <HeroText 
          className={cn(
            'animate-slide-up',
            variant === 'brutal' ? 'uppercase text-black' : 'ai-text-gradient'
          )}
        >
          {title}
        </HeroText>
        
        {description && (
          <Body className="text-text-secondary animate-slide-up">
            {description}
          </Body>
        )}
      </div>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          {primaryAction && (
            <Button
              variant={variant === 'brutal' ? 'brutal' : 'primary'}
              onClick={primaryAction.onClick}
              glow={variant === '3d'}
            >
              {primaryAction.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              variant="secondary"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )

  const renderContent = () => {
    if (variant === '3d') {
      return (
        <Spatial3DCard depth="deep" rotateOnHover floatAnimation>
          <GlassCard variant="prominent" className="w-full max-w-2xl mx-auto">
            {content}
          </GlassCard>
        </Spatial3DCard>
      )
    }

    if (variant === 'brutal') {
      return (
        <div className="brutal-card w-full max-w-2xl mx-auto">
          {content}
        </div>
      )
    }

    return (
      <GlassCard 
        variant="prominent" 
        className="w-full max-w-2xl mx-auto"
        hover="spotlight"
      >
        {content}
      </GlassCard>
    )
  }

  if (fullScreen) {
    return (
      <div className={cn(
        'min-h-screen flex items-center justify-center p-4',
        'animate-fade-in',
        className
      )}>
        {renderContent()}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      {renderContent()}
    </div>
  )
}

// Specialized Empty States
export const SearchEmptyState: React.FC<Omit<EmptyStateProps, 'variant' | 'icon'>> = (props) => (
  <EmptyState
    variant="search"
    icon={Search}
    title="結果が見つかりませんでした"
    description="検索条件を変更してもう一度お試しください"
    {...props}
  />
)

export const ConnectionsEmptyState: React.FC<Omit<EmptyStateProps, 'variant' | 'icon'>> = (props) => (
  <EmptyState
    variant="default"
    icon={Users}
    title="まだコネクションがありません"
    description="新しい出会いを探して、素敵なコネクションを築きましょう"
    {...props}
  />
)

export const Error404EmptyState: React.FC<Omit<EmptyStateProps, 'variant' | 'icon'>> = (props) => (
  <EmptyState
    variant="brutal"
    icon={Download}
    title="ページが見つかりません"
    description="お探しのページは存在しないか、移動した可能性があります"
    {...props}
  />
)
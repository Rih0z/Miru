'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { AIProgressBar, AILoadingIndicator } from './AIProgress'
import { Heart, Zap, Target, TrendingUp } from 'lucide-react'

export interface ProgressBarProps {
  progress: number // 0-100
  className?: string
  showLabel?: boolean
  label?: string
  variant?: 'default' | 'gradient' | 'brutal' | 'glass' | 'ai'
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showPercentage?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showLabel = false,
  label,
  variant = 'default',
  animated = true,
  size = 'md',
  showIcon = false,
  showPercentage = true
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress))
  
  // Size configurations
  const sizeConfig = {
    sm: { height: 'h-2', text: 'text-xs', icon: 'w-3 h-3' },
    md: { height: 'h-3', text: 'text-sm', icon: 'w-4 h-4' },
    lg: { height: 'h-4', text: 'text-base', icon: 'w-5 h-5' }
  }

  const config = sizeConfig[size]

  // Progress status and styling
  const getProgressStatus = () => {
    if (clampedProgress >= 80) return { status: 'excellent', color: 'accent-success', icon: TrendingUp }
    if (clampedProgress >= 60) return { status: 'good', color: 'accent-info', icon: Target }
    if (clampedProgress >= 30) return { status: 'fair', color: 'accent-warning', icon: Heart }
    return { status: 'low', color: 'accent-error', icon: Zap }
  }

  const statusInfo = getProgressStatus()
  const StatusIcon = statusInfo.icon

  // Variant-specific styling
  const getProgressBarClasses = () => {
    const baseClasses = cn(
      'relative overflow-hidden rounded-full transition-all duration-300',
      config.height,
      !animated && 'transition-none'
    )

    switch (variant) {
      case 'gradient':
        return cn(baseClasses, 'bg-glass-10 border border-glass-20')
      case 'brutal':
        return cn(baseClasses, 'bg-bg-secondary border-2 border-black shadow-brutal-sm rounded-none')
      case 'glass':
        return cn(baseClasses, 'bg-glass-5 backdrop-blur-sm border border-glass-10')
      case 'ai':
        return <AIProgressBar 
          progress={clampedProgress} 
          variant="gradient" 
          className={className}
          animated={animated}
        />
      default:
        return cn(baseClasses, 'bg-bg-secondary')
    }
  }

  const getProgressFillClasses = () => {
    const baseClasses = cn(
      'h-full transition-all duration-500 ease-out',
      !animated && 'transition-none'
    )

    switch (variant) {
      case 'gradient':
        return cn(baseClasses, 'bg-ai-gradient')
      case 'brutal':
        return cn(baseClasses, `bg-${statusInfo.color} border-r-2 border-black`)
      case 'glass':
        return cn(baseClasses, `bg-${statusInfo.color}/70 backdrop-blur-sm`)
      default:
        return cn(baseClasses, `bg-${statusInfo.color}`)
    }
  }

  // Return AI variant directly if selected
  if (variant === 'ai') {
    return (
      <div className={cn('space-y-2', className)}>
        {showLabel && (
          <div className="flex justify-between items-center">
            <span className={cn('font-medium text-text-primary', config.text)}>
              {label || 'AI分析進度'}
            </span>
            {showPercentage && (
              <span className={cn('font-bold ai-text-gradient flex items-center gap-1', config.text)}>
                {showIcon && <StatusIcon className={config.icon} />}
                {clampedProgress}%
              </span>
            )}
          </div>
        )}
        <AIProgressBar 
          progress={clampedProgress} 
          variant="gradient" 
          animated={animated}
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className={cn('font-medium text-text-primary', config.text)}>
            {label || '進展度'}
          </span>
          {showPercentage && (
            <span className={cn(
              'font-bold flex items-center gap-1',
              config.text,
              variant === 'brutal' ? 'text-black uppercase' : `text-${statusInfo.color}`
            )}>
              {showIcon && <StatusIcon className={config.icon} />}
              {clampedProgress}%
            </span>
          )}
        </div>
      )}
      
      <div className={getProgressBarClasses()}>
        <div 
          className={getProgressFillClasses()}
          style={{ width: `${clampedProgress}%` }}
        >
          {variant === 'gradient' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
        
        {/* Progress indicator dot for glass variant */}
        {variant === 'glass' && clampedProgress > 0 && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg transition-all duration-500"
            style={{ left: `calc(${clampedProgress}% - 4px)` }}
          />
        )}
      </div>
    </div>
  )
}

// Specialized Progress Components
export const RelationshipProgress: React.FC<Omit<ProgressBarProps, 'variant' | 'label'>> = (props) => (
  <ProgressBar
    variant="gradient"
    label="関係の進展度"
    showIcon
    {...props}
  />
)

export const AIAnalysisProgress: React.FC<Omit<ProgressBarProps, 'variant' | 'label'>> = (props) => (
  <ProgressBar
    variant="ai"
    label="AI分析進度"
    showIcon
    {...props}
  />
)

export const MatchProgress: React.FC<Omit<ProgressBarProps, 'variant' | 'label'>> = (props) => (
  <ProgressBar
    variant="glass"
    label="マッチ度"
    showIcon
    {...props}
  />
)

export const TaskProgress: React.FC<Omit<ProgressBarProps, 'variant' | 'label'>> = (props) => (
  <ProgressBar
    variant="brutal"
    label="タスク進捗"
    showIcon
    {...props}
  />
)
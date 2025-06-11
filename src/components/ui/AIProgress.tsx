'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface AIProgressProps {
  progress: number // 0-100
  label?: string
  sublabel?: string
  showPercentage?: boolean
  variant?: 'default' | 'gradient' | 'pulse' | 'striped'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const AIProgress: React.FC<AIProgressProps> = ({
  progress,
  label,
  sublabel,
  showPercentage = true,
  variant = 'gradient',
  size = 'md',
  className,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const variantClasses = {
    default: 'bg-accent-primary',
    gradient: 'bg-ai-gradient',
    pulse: 'bg-accent-primary animate-pulse',
    striped: 'bg-accent-primary ai-progress-striped',
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-baseline mb-2">
          <div>
            {label && (
              <span className="text-sm font-medium text-text-primary">
                {label}
              </span>
            )}
            {sublabel && (
              <span className="text-xs text-text-secondary ml-2">
                {sublabel}
              </span>
            )}
          </div>
          {showPercentage && (
            <span className="text-sm font-mono text-accent-primary">
              {clampedProgress}%
            </span>
          )}
        </div>
      )}
      
      <div className={cn(
        'relative overflow-hidden rounded-full',
        'bg-glass-10',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            'transition-all duration-slow ease-out',
            variantClasses[variant]
          )}
          style={{ width: `${clampedProgress}%` }}
        >
          {variant === 'gradient' && (
            <div className="absolute inset-0 bg-white/20 animate-ai-pulse" />
          )}
        </div>
      </div>
    </div>
  )
}

// AI Loading Indicator
export const AILoadingIndicator: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  message?: string
  submessage?: string
  className?: string
}> = ({ size = 'md', message, submessage, className }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Outer ring */}
        <div className="absolute inset-0 border-2 border-glass-20 rounded-full" />
        
        {/* Spinning ring */}
        <div className="absolute inset-0 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        
        {/* Center pulse */}
        <div className="absolute inset-2 bg-accent-primary/20 rounded-full animate-pulse" />
        
        {/* Center dot */}
        <div className="absolute inset-1/3 bg-accent-primary rounded-full" />
      </div>
      
      {message && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-text-primary">
            {message}
          </span>
          {submessage && (
            <span className="text-xs text-text-secondary">
              {submessage}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// AI Status Badge
export const AIStatusBadge: React.FC<{
  status: 'idle' | 'processing' | 'success' | 'error'
  message?: string
  className?: string
}> = ({ status, message, className }) => {
  const statusConfig = {
    idle: {
      color: 'text-text-secondary',
      bg: 'bg-glass-10',
      icon: '○',
    },
    processing: {
      color: 'text-accent-info',
      bg: 'bg-accent-info/10',
      icon: '◐',
      animate: true,
    },
    success: {
      color: 'text-accent-success',
      bg: 'bg-accent-success/10',
      icon: '●',
    },
    error: {
      color: 'text-accent-error',
      bg: 'bg-accent-error/10',
      icon: '×',
    },
  }

  const config = statusConfig[status]

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1 rounded-full',
      config.bg,
      className
    )}>
      <span className={cn(
        'text-lg',
        config.color,
        config.animate && 'animate-spin'
      )}>
        {config.icon}
      </span>
      {message && (
        <span className={cn('text-xs font-medium', config.color)}>
          {message}
        </span>
      )}
    </div>
  )
}

// AI Metric Card
export const AIMetricCard: React.FC<{
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}> = ({ label, value, change, trend, className }) => {
  return (
    <div className={cn(
      'glass-card p-4 space-y-2',
      'border-l-4 border-accent-primary',
      className
    )}>
      <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-text-primary">
          {value}
        </span>
        {change !== undefined && (
          <span className={cn(
            'text-sm font-medium',
            trend === 'up' ? 'text-accent-success' : 
            trend === 'down' ? 'text-accent-error' : 
            'text-text-secondary'
          )}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  )
}
'use client'

import React from 'react'

export interface ProgressBarProps {
  progress: number // 0-100
  className?: string
  showLabel?: boolean
  label?: string
  variant?: 'kawaii' | 'magical'
  animated?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showLabel = false,
  label,
  variant = 'kawaii',
  animated = true
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress))
  
  const getProgressColor = () => {
    if (clampedProgress >= 75) return 'var(--temp-hot)'
    if (clampedProgress >= 40) return 'var(--temp-warm)'
    return 'var(--temp-cool)'
  }

  const getProgressEmoji = () => {
    if (clampedProgress >= 75) return '🔥'
    if (clampedProgress >= 40) return '😊'
    return '🧊'
  }

  return (
    <div className={`progress-kawaii ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || '進展度'}
          </span>
          <span className="text-sm font-bold text-kawaii-gradient flex items-center gap-1">
            {getProgressEmoji()} {clampedProgress}%
          </span>
        </div>
      )}
      
      <div className="progress-kawaii">
        <div 
          className={`progress-kawaii-fill ${animated ? '' : 'transition-none'}`}
          style={{ 
            width: `${clampedProgress}%`,
            background: variant === 'magical' ? 'var(--gradient-magical)' : getProgressColor()
          }}
        />
      </div>
    </div>
  )
}
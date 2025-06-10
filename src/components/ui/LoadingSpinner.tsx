'use client'

import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'base' | 'lg'
  message?: string
  submessage?: string
  variant?: 'kawaii' | 'magical'
  fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'base',
  message = '恋愛の魔法を分析中...',
  submessage = '素敵な出会いを見つけています',
  variant = 'kawaii',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    base: 'w-12 h-12',
    lg: 'w-20 h-20'
  }

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} spinner-kawaii`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${size === 'lg' ? 'text-2xl' : size === 'base' ? 'text-xl' : 'text-base'} animate-heartbeat`}>
            {variant === 'magical' ? '🌟' : '💕'}
          </span>
        </div>
      </div>
      
      {(message || submessage) && (
        <div className="text-center space-y-2">
          {message && (
            <p className={`font-bold text-kawaii-gradient animate-kawaii-pulse ${
              size === 'lg' ? 'text-xl' : size === 'base' ? 'text-lg' : 'text-base'
            }`}>
              {message}
            </p>
          )}
          {submessage && (
            <p className="text-pink-600 font-medium flex items-center justify-center gap-2">
              <span>🌟</span> {submessage} <span>🌟</span>
            </p>
          )}
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-kawaii-dream flex items-center justify-center">
        <div className="animate-bounceIn">
          {spinnerContent}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-bounceIn">
        {spinnerContent}
      </div>
    </div>
  )
}
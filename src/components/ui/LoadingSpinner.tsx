'use client'

import React from 'react'
import { Heart, Sparkles, Loader } from 'lucide-react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'base' | 'lg'
  message?: string
  submessage?: string
  variant?: 'heart' | 'sparkle' | 'spinner'
  fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'base',
  message = 'Analyzing love connections...',
  submessage = 'Finding your perfect match',
  variant = 'heart',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    base: 'w-12 h-12',
    lg: 'w-20 h-20'
  }

  const getIcon = () => {
    switch (variant) {
      case 'heart': return Heart
      case 'sparkle': return Sparkles
      case 'spinner': return Loader
      default: return Heart
    }
  }

  const IconComponent = getIcon()

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <IconComponent className={`${size === 'lg' ? 'w-8 h-8' : size === 'base' ? 'w-6 h-6' : 'w-4 h-4'} text-pink-500`} />
        </div>
      </div>
      
      {(message || submessage) && (
        <div className="text-center space-y-2">
          {message && (
            <p className={`font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent animate-pulse ${
              size === 'lg' ? 'text-xl' : size === 'base' ? 'text-lg' : 'text-base'
            }`}>
              {message}
            </p>
          )}
          {submessage && (
            <p className="text-pink-600 font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {submessage}
              <Sparkles className="w-4 h-4" />
            </p>
          )}
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
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
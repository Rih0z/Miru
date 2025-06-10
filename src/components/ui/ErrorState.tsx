'use client'

import React from 'react'
import { Button } from './Button'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  type?: 'error' | 'warning' | 'info'
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'ちょっとした問題が起きちゃいました',
  message,
  onRetry,
  type = 'error',
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error': return '😢'
      case 'warning': return '😯'
      case 'info': return '💭'
      default: return '😢'
    }
  }

  const getIconBg = () => {
    switch (type) {
      case 'error': return 'bg-red-50'
      case 'warning': return 'bg-yellow-50'
      case 'info': return 'bg-blue-50'
      default: return 'bg-kawaii-soft'
    }
  }

  return (
    <div className={`card-kawaii max-w-md mx-auto text-center py-12 animate-bounceIn ${className}`}>
      <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl ${getIconBg()} flex items-center justify-center animate-wiggle`}>
        <span className="text-4xl">{getIcon()}</span>
      </div>
      
      <h3 className="text-2xl font-bold text-kawaii-gradient mb-4">
        {title}
      </h3>
      
      {message && (
        <p className="text-red-600 mb-8 leading-relaxed font-medium">
          {message}
        </p>
      )}
      
      {onRetry && (
        <Button
          variant="primary"
          size="lg"
          onClick={onRetry}
          icon="💕"
          sparkle
          className="animate-heartbeat"
        >
          もう一度試してみる
        </Button>
      )}
    </div>
  )
}
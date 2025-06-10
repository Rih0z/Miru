'use client'

import React from 'react'
import { AlertCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react'
import { Button } from './Button'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  type?: 'error' | 'warning' | 'info'
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something minor happened',
  message,
  onRetry,
  type = 'error',
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error': return AlertCircle
      case 'warning': return AlertTriangle
      case 'info': return Info
      default: return AlertCircle
    }
  }

  const getIconBg = () => {
    switch (type) {
      case 'error': return 'bg-red-50'
      case 'warning': return 'bg-yellow-50'
      case 'info': return 'bg-blue-50'
      default: return 'bg-red-50'
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'error': return 'text-red-500'
      case 'warning': return 'text-yellow-500'
      case 'info': return 'text-blue-500'
      default: return 'text-red-500'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'error': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      case 'info': return 'text-blue-600'
      default: return 'text-red-600'
    }
  }

  const IconComponent = getIcon()

  return (
    <div className={`bg-white rounded-3xl shadow-lg max-w-md mx-auto text-center py-12 px-8 animate-bounceIn ${className}`}>
      <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl ${getIconBg()} flex items-center justify-center`}>
        <IconComponent className={`w-10 h-10 ${getIconColor()}`} />
      </div>
      
      <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-4">
        {title}
      </h3>
      
      {message && (
        <p className={`${getTextColor()} mb-8 leading-relaxed font-medium`}>
          {message}
        </p>
      )}
      
      {onRetry && (
        <Button
          variant="primary"
          size="lg"
          onClick={onRetry}
          icon={RefreshCw}
          className="animate-pulse"
        >
          Try Again
        </Button>
      )}
    </div>
  )
}
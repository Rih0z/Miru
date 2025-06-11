'use client'

import React from 'react'
import { Heart, Plus, Download } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '恋愛の旅を始めましょう',
  description = 'MiruがAIの力で素晴らしいコネクションを発見し、意味のある関係を築くお手伝いをします',
  icon: IconComponent = Heart,
  primaryAction,
  secondaryAction,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-white rounded-3xl shadow-xl max-w-2xl mx-auto text-center py-16 px-8 animate-fadeIn relative overflow-hidden">
        {/* Main icon */}
        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-pink-100 flex items-center justify-center animate-pulse relative">
          <IconComponent className="w-16 h-16 text-pink-500" />
          <div className="absolute inset-0 rounded-full border-4 border-pink-200 animate-pulse" />
        </div>
        
        {/* Title */}
        <h3 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-6">
          {title}
        </h3>
        
        {/* Description */}
        {description && (
          <p className="text-gray-700 text-lg mb-8 leading-relaxed max-w-md mx-auto">
            {description}
          </p>
        )}
        
        {/* Action buttons */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primaryAction && (
              <Button
                variant="primary"
                size="lg"
                onClick={primaryAction.onClick}
                icon={primaryAction.icon || Plus}
                className="animate-pulse"
              >
                {primaryAction.label}
              </Button>
            )}
            
            {secondaryAction && (
              <Button
                variant="secondary"
                size="lg"
                onClick={secondaryAction.onClick}
                icon={secondaryAction.icon || Download}
                className="animate-pulse"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import React from 'react'
import { Button } from './Button'

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: string
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: string
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: string
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '新しい恋愛の魔法を始めましょう ✨',
  description = 'あなたの素敵な出会いをMiruがサポートします',
  icon = '💕',
  primaryAction,
  secondaryAction,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-kawaii-dream flex items-center justify-center p-4 ${className}`}>
      <div className="card-kawaii-magical max-w-2xl mx-auto text-center py-16 animate-bounceIn relative overflow-hidden">
        {/* デコレーション */}
        <div className="absolute top-4 right-4 animate-sparkle text-3xl">✨</div>
        <div className="absolute top-8 left-8 animate-float text-2xl">🌸</div>
        
        {/* メインアイコン */}
        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-kawaii-romantic flex items-center justify-center animate-heartbeat relative">
          <span className="text-6xl">{icon}</span>
          <div className="absolute inset-0 rounded-full border-4 border-pink-200 animate-pulse" />
        </div>
        
        {/* タイトル */}
        <h3 className="text-4xl font-bold text-kawaii-gradient mb-6 animate-float">
          {title}
        </h3>
        
        {/* 説明 */}
        {description && (
          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            {description}
          </p>
        )}
        
        {/* アクションボタン */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primaryAction && (
              <Button
                variant="primary"
                size="lg"
                onClick={primaryAction.onClick}
                icon={primaryAction.icon || '➕'}
                sparkle
                className="animate-kawaii-pulse"
              >
                {primaryAction.label}
              </Button>
            )}
            
            {secondaryAction && (
              <Button
                variant="secondary"
                size="lg"
                onClick={secondaryAction.onClick}
                icon={secondaryAction.icon || '📥'}
                sparkle
                className="animate-kawaii-pulse"
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
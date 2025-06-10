'use client'

import React from 'react'

export interface CardProps {
  variant?: 'kawaii' | 'magical' | 'soft' | 'romantic'
  children: React.ReactNode
  className?: string
  hover?: boolean
  sparkle?: boolean
  heartDecoration?: boolean
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  variant = 'kawaii',
  children,
  className = '',
  hover = false,
  sparkle = false,
  heartDecoration = false,
  onClick
}) => {
  const baseClasses = 'relative overflow-hidden transition-all duration-300'
  
  const variantClasses = {
    kawaii: 'card-kawaii',
    magical: 'card-kawaii-magical',
    soft: 'card-kawaii-soft',
    romantic: 'card-kawaii-romantic'
  }
  
  const interactionClasses = [
    hover ? 'hover-kawaii cursor-pointer' : '',
    sparkle ? 'sparkle-decoration' : '',
    heartDecoration ? 'heart-decoration' : '',
    onClick ? 'cursor-pointer' : ''
  ].filter(Boolean).join(' ')
  
  return (
    <div
      onClick={onClick}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${interactionClasses}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  )
}
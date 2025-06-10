'use client'

import React from 'react'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'magical' | 'soft'
  size?: 'sm' | 'base' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  icon?: string
  sparkle?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'base',
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  icon,
  sparkle = false
}) => {
  const baseClasses = 'font-bold transition-all duration-300 relative inline-flex items-center justify-center gap-2 touch-target'
  
  const variantClasses = {
    primary: 'btn-kawaii hover-kawaii',
    secondary: 'btn-kawaii-secondary hover-bounce',
    magical: 'badge-kawaii-magical hover-kawaii text-white',
    soft: 'badge-kawaii-soft hover-bounce'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    base: 'px-6 py-3 text-base rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  }
  
  const sparkleClasses = sparkle ? 'hover-sparkle' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${sparkleClasses}
        ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `.trim()}
    >
      {icon && (
        <span className={variant === 'primary' ? 'animate-heartbeat' : ''}>
          {icon}
        </span>
      )}
      {children}
    </button>
  )
}
'use client'

import React from 'react'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'base' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'base',
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  iconPosition = 'left'
}) => {
  const baseClasses = 'font-semibold transition-all duration-300 relative inline-flex items-center justify-center gap-2 touch-target focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 hover:shadow-lg hover:scale-105',
    secondary: 'bg-white text-pink-600 border-2 border-pink-200 hover:bg-pink-50 hover:border-pink-300 hover:scale-102',
    outline: 'bg-transparent text-pink-600 border-2 border-pink-500 hover:bg-pink-50 hover:shadow-md',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    base: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl'
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''}
      `.trim()}
      aria-disabled={disabled}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4" />
      )}
    </button>
  )
}
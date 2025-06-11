'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useRipple } from './MicroInteractions'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'brutal' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  ripple?: boolean
  glow?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'left',
    ripple = true,
    glow = false,
    children,
    disabled,
    onClick,
    ...props
  }, ref) => {
    const { createRipple, RippleContainer } = useRipple()
    const isDisabled = disabled || isLoading

    // Variant styles - Modern 2024-2025 design
    const variantClasses = {
      primary: cn(
        'bg-accent-primary text-bg-primary',
        'hover:bg-accent-primary/90 hover:shadow-lg hover:-translate-y-0.5',
        'active:translate-y-0'
      ),
      secondary: cn(
        'bg-glass-10 backdrop-blur-medium text-text-primary',
        'border border-glass-border',
        'hover:bg-glass-20 hover:shadow-md hover:-translate-y-0.5',
        'active:translate-y-0'
      ),
      ghost: cn(
        'bg-transparent text-text-primary',
        'hover:bg-glass-5 hover:text-accent-primary',
        'active:bg-glass-10'
      ),
      brutal: cn(
        'bg-accent-secondary text-bg-primary',
        'border-3 border-black shadow-brutal-md',
        'hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5',
        'active:shadow-brutal-sm active:translate-x-1 active:translate-y-1',
        'font-black uppercase tracking-wider'
      ),
      glass: cn(
        'glass text-text-primary',
        'hover:bg-glass-20 hover:shadow-lg hover:-translate-y-0.5',
        'active:translate-y-0'
      ),
    }

    // Size styles
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-xl',
      xl: 'px-10 py-5 text-xl rounded-2xl',
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && ripple) {
        createRipple(e)
      }
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'relative font-semibold transition-all duration-normal',
          'inline-flex items-center justify-center gap-2',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-accent-primary focus-visible:ring-offset-2',
          'focus-visible:ring-offset-bg-primary',
          'overflow-hidden',
          
          // Variant styles
          variantClasses[variant],
          
          // Size styles
          sizeClasses[size],
          
          // Glow effect
          glow && 'shadow-glow hover:shadow-glow-lg',
          
          // Disabled state
          isDisabled && 'opacity-50 cursor-not-allowed hover:transform-none active:transform-none',
          
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {/* Loading overlay */}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit">
            <Loader2 className="animate-spin" size={16} />
          </span>
        )}
        
        {/* Button content */}
        <span className={cn(
          'inline-flex items-center justify-center gap-2',
          isLoading && 'invisible'
        )}>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </span>
        
        {/* Ripple effect container */}
        {ripple && <RippleContainer />}
      </button>
    )
  }
)

Button.displayName = 'Button'
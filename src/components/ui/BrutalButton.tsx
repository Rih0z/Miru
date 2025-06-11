'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const BrutalButton = React.forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ 
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props
  }, ref) => {
    const variantClasses = {
      primary: 'bg-accent-primary text-bg-primary hover:shadow-brutal-lg',
      secondary: 'bg-accent-secondary text-bg-primary hover:shadow-brutal-lg',
      danger: 'bg-accent-error text-white hover:shadow-brutal-lg',
      success: 'bg-accent-success text-bg-primary hover:shadow-brutal-lg',
      warning: 'bg-accent-warning text-bg-primary hover:shadow-brutal-lg',
    }

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm shadow-brutal-sm hover:shadow-brutal-md',
      md: 'px-6 py-3 text-base shadow-brutal-md hover:shadow-brutal-lg',
      lg: 'px-8 py-4 text-lg shadow-brutal-lg hover:shadow-brutal-xl',
      xl: 'px-10 py-5 text-xl shadow-brutal-xl hover:shadow-brutal-xl',
    }

    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'relative font-black uppercase tracking-wider',
          'border-3 border-black transition-all duration-instant',
          'active:translate-x-1 active:translate-y-1',
          'active:shadow-brutal-sm',
          'hover:-translate-x-0.5 hover:-translate-y-0.5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2',
          
          // Variant & Size
          variantClasses[variant],
          sizeClasses[size],
          
          // Disabled state
          isDisabled && 'opacity-50 cursor-not-allowed hover:transform-none active:transform-none',
          
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        <span className={cn(
          'flex items-center justify-center gap-2',
          isLoading && 'opacity-0'
        )}>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </span>
        
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </span>
        )}
      </button>
    )
  }
)

BrutalButton.displayName = 'BrutalButton'

// Variant shortcuts
export const BrutalPrimaryButton: React.FC<Omit<BrutalButtonProps, 'variant'>> = (props) => (
  <BrutalButton variant="primary" {...props} />
)

export const BrutalSecondaryButton: React.FC<Omit<BrutalButtonProps, 'variant'>> = (props) => (
  <BrutalButton variant="secondary" {...props} />
)

export const BrutalDangerButton: React.FC<Omit<BrutalButtonProps, 'variant'>> = (props) => (
  <BrutalButton variant="danger" {...props} />
)

// Icon Button
export const BrutalIconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<BrutalButtonProps, 'children'> & { 'aria-label': string }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16',
  }

  return (
    <BrutalButton
      ref={ref}
      className={cn(sizeClasses[size], 'p-0', className)}
      size={size}
      {...props}
    />
  )
})

BrutalIconButton.displayName = 'BrutalIconButton'
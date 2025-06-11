'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'subtle' | 'default' | 'prominent' | 'floating'
  blur?: 'light' | 'medium' | 'heavy'
  hover?: boolean
  children: React.ReactNode
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className,
    variant = 'default',
    blur = 'medium',
    hover = true,
    children,
    ...props
  }, ref) => {
    const variantClasses = {
      subtle: 'bg-glass-5',
      default: 'bg-glass-10',
      prominent: 'bg-glass-20',
      floating: 'bg-glass-15 shadow-xl',
    }

    const blurClasses = {
      light: 'backdrop-blur-light',
      medium: 'backdrop-blur-medium',
      heavy: 'backdrop-blur-heavy',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-glass-border',
          'transition-all duration-normal',
          variantClasses[variant],
          blurClasses[blur],
          hover && 'hover:shadow-lg hover:bg-glass-15 hover:-translate-y-0.5',
          'p-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

// Specialized Glass Components
export const GlassPanel: React.FC<GlassCardProps> = ({ children, className, ...props }) => (
  <GlassCard
    variant="subtle"
    className={cn('p-4 md:p-6', className)}
    {...props}
  >
    {children}
  </GlassCard>
)

export const GlassModal: React.FC<GlassCardProps> = ({ children, className, ...props }) => (
  <GlassCard
    variant="prominent"
    blur="heavy"
    className={cn('p-8 max-w-2xl mx-auto', className)}
    {...props}
  >
    {children}
  </GlassCard>
)

export const GlassNav: React.FC<GlassCardProps> = ({ children, className, ...props }) => (
  <div
    className={cn(
      'glass-subtle border-b border-glass-border',
      'sticky top-0 z-40',
      'px-4 md:px-8 py-4',
      className
    )}
    {...props}
  >
    {children}
  </div>
)
'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Spatial3DCard, Tilt3D } from './Spatial3D'
import { Spotlight } from './MicroInteractions'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'brutal' | 'elevated' | 'flat' | 'gradient'
  hover?: 'lift' | 'glow' | '3d' | 'spotlight' | 'none'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  as3D?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className,
    variant = 'glass',
    hover = 'lift',
    padding = 'md',
    interactive = false,
    as3D = false,
    children,
    onClick,
    ...props
  }, ref) => {
    // Variant styles
    const variantClasses = {
      glass: 'glass-card',
      brutal: 'brutal-card',
      elevated: cn(
        'bg-bg-elevated border border-glass-border',
        'shadow-lg'
      ),
      flat: 'bg-bg-secondary border border-glass-border',
      gradient: cn(
        'bg-ai-gradient text-white',
        'shadow-xl'
      ),
    }

    // Padding styles
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    }

    // Hover effects
    const hoverClasses = {
      lift: 'hover:shadow-xl hover:-translate-y-1',
      glow: 'hover:shadow-glow',
      '3d': '', // Handled by 3D wrapper
      spotlight: '', // Handled by Spotlight wrapper
      none: '',
    }

    // Base card styles
    const cardContent = (
      <div
        ref={!as3D ? ref : undefined}
        className={cn(
          'relative rounded-2xl transition-all duration-normal',
          variantClasses[variant],
          paddingClasses[padding],
          hover !== '3d' && hover !== 'spotlight' && hoverClasses[hover],
          interactive && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        data-interactive={interactive}
        {...props}
      >
        {children}
      </div>
    )

    // Apply special wrappers based on hover type
    if (hover === '3d' || as3D) {
      return (
        <Spatial3DCard
          ref={ref}
          depth="medium"
          rotateOnHover
          className={className}
        >
          {cardContent}
        </Spatial3DCard>
      )
    }

    if (hover === 'spotlight') {
      return (
        <Spotlight className={className}>
          {cardContent}
        </Spotlight>
      )
    }

    return cardContent
  }
)

Card.displayName = 'Card'

// Specialized card variants
export const GlassCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="glass" {...props} />
)

export const BrutalCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="brutal" {...props} />
)

export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="elevated" {...props} />
)

// Feature Card with gradient
export const FeatureCard: React.FC<CardProps & {
  icon?: React.ReactNode
  title: string
  description?: string
}> = ({ icon, title, description, children, className, ...props }) => (
  <Card
    variant="glass"
    hover="3d"
    className={cn('space-y-4', className)}
    {...props}
  >
    {icon && (
      <div className="w-12 h-12 rounded-xl bg-ai-gradient flex items-center justify-center text-white">
        {icon}
      </div>
    )}
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-text-primary">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary">{description}</p>
      )}
    </div>
    {children}
  </Card>
)

// Metric Card
export const MetricCard: React.FC<CardProps & {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  change?: string
  icon?: React.ReactNode
}> = ({ label, value, trend, change, icon, className, ...props }) => (
  <Card
    variant="glass"
    hover="lift"
    className={cn('flex items-center justify-between', className)}
    {...props}
  >
    <div className="space-y-1">
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className="text-2xl font-black text-text-primary">{value}</p>
      {change && (
        <p className={cn(
          'text-xs font-medium',
          trend === 'up' ? 'text-accent-success' : 
          trend === 'down' ? 'text-accent-error' : 
          'text-text-secondary'
        )}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {change}
        </p>
      )}
    </div>
    {icon && (
      <div className="w-12 h-12 rounded-xl bg-glass-10 flex items-center justify-center">
        {icon}
      </div>
    )}
  </Card>
)
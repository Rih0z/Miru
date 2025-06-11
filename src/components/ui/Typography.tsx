'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// Base Typography Props
interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements
  variant?: 'hero' | 'display' | 'heading' | 'subheading' | 'body' | 'caption'
  gradient?: boolean
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
}

// Typography Component
export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ 
    as: Component = 'p',
    variant = 'body',
    gradient = false,
    weight,
    className,
    children,
    ...props
  }, ref) => {
    const variantClasses = {
      hero: 'text-hero font-black leading-none tracking-tight',
      display: 'text-4xl font-extrabold leading-tight tracking-tight',
      heading: 'text-2xl font-bold leading-tight',
      subheading: 'text-lg font-semibold leading-snug',
      body: 'text-base font-regular leading-relaxed',
      caption: 'text-sm font-medium leading-normal text-text-secondary',
    }

    const weightClasses = {
      light: 'font-light',
      regular: 'font-regular',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      black: 'font-black',
    }

    return React.createElement(
      Component,
      {
        ref,
        className: cn(
          variantClasses[variant],
          weight && weightClasses[weight],
          gradient && 'ai-text-gradient',
          className
        ),
        ...props
      },
      children
    )
  }
)

Typography.displayName = 'Typography'

// Specialized Typography Components
export const HeroText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography as="h1" variant="hero" {...props} />
)

export const DisplayText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography as="h2" variant="display" {...props} />
)

export const Heading: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography as="h3" variant="heading" {...props} />
)

export const Subheading: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography as="h4" variant="subheading" {...props} />
)

export const Body: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography as="p" variant="body" {...props} />
)

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography as="span" variant="caption" {...props} />
)

// Gradient Text
export const GradientText: React.FC<{
  children: React.ReactNode
  className?: string
  from?: string
  to?: string
  via?: string
}> = ({ children, className, from = 'accent-primary', to = 'accent-secondary', via }) => {
  const gradientStyle = via
    ? `linear-gradient(135deg, var(--${from}) 0%, var(--${via}) 50%, var(--${to}) 100%)`
    : `linear-gradient(135deg, var(--${from}) 0%, var(--${to}) 100%)`

  return (
    <span
      className={cn('inline-block', className)}
      style={{
        background: gradientStyle,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
  )
}

// Animated Text
export const AnimatedText: React.FC<{
  children: string
  className?: string
  delay?: number
  stagger?: number
}> = ({ children, className, delay = 0, stagger = 50 }) => {
  const words = children.split(' ')

  return (
    <span className={cn('inline-flex flex-wrap gap-1', className)}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block animate-slide-up opacity-0"
          style={{
            animationDelay: `${delay + i * stagger}ms`,
            animationFillMode: 'forwards',
          }}
        >
          {word}
        </span>
      ))}
    </span>
  )
}

// Typewriter Effect
export const TypewriterText: React.FC<{
  text: string
  className?: string
  speed?: number
  onComplete?: () => void
}> = ({ text, className, speed = 50, onComplete }) => {
  const [displayedText, setDisplayedText] = React.useState('')
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return (
    <span className={className}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

// Highlighted Text
export const HighlightedText: React.FC<{
  children: React.ReactNode
  className?: string
  color?: 'primary' | 'secondary' | 'warning' | 'success'
}> = ({ children, className, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-accent-primary/20 border-accent-primary',
    secondary: 'bg-accent-secondary/20 border-accent-secondary',
    warning: 'bg-accent-warning/20 border-accent-warning',
    success: 'bg-accent-success/20 border-accent-success',
  }

  return (
    <mark className={cn(
      'px-1 py-0.5 rounded border-b-2',
      colorClasses[color],
      className
    )}>
      {children}
    </mark>
  )
}

// Code Block
export const CodeBlock: React.FC<{
  children: string
  language?: string
  className?: string
}> = ({ children, language, className }) => {
  return (
    <pre className={cn(
      'glass-card p-4 rounded-xl overflow-x-auto',
      'font-mono text-sm',
      className
    )}>
      <code className={`language-${language || 'plaintext'}`}>
        {children}
      </code>
    </pre>
  )
}

// Inline Code
export const InlineCode: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <code className={cn(
      'px-1.5 py-0.5 rounded',
      'bg-glass-10 text-accent-primary',
      'font-mono text-sm',
      className
    )}>
      {children}
    </code>
  )
}
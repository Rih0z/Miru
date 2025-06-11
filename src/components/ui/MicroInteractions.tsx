'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Ripple Effect Hook
export const useRipple = () => {
  const [ripples, setRipples] = useState<Array<{
    x: number
    y: number
    id: number
    size: number
  }>>([])

  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget
    const rect = element.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    const id = Date.now()

    setRipples(prev => [...prev, { x, y, id, size }])

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id))
    }, 600)
  }

  const RippleContainer = () => (
    <>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/20 pointer-events-none animate-scale-in"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </>
  )

  return { createRipple, RippleContainer }
}

// Interactive Button with Ripple
export const InteractiveButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost'
  }
> = ({ children, className, variant = 'primary', onClick, ...props }) => {
  const { createRipple, RippleContainer } = useRipple()
  const [isPressed, setIsPressed] = useState(false)

  const variantClasses = {
    primary: 'bg-accent-primary text-bg-primary hover:bg-accent-primary/90',
    secondary: 'bg-glass-10 text-text-primary hover:bg-glass-20',
    ghost: 'bg-transparent text-text-primary hover:bg-glass-5',
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e)
    onClick?.(e)
  }

  return (
    <button
      className={cn(
        'relative overflow-hidden px-6 py-3 rounded-xl',
        'font-medium transition-all duration-normal',
        'active:scale-95',
        variantClasses[variant],
        isPressed && 'scale-95',
        className
      )}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      {...props}
    >
      {children}
      <RippleContainer />
    </button>
  )
}

// Hover Card with Magnetic Effect
export const MagneticCard: React.FC<{
  children: React.ReactNode
  className?: string
  strength?: number
}> = ({ children, className, strength = 0.3 }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    setTransform({
      x: x * strength,
      y: y * strength,
    })
  }

  const handleMouseLeave = () => {
    setTransform({ x: 0, y: 0 })
  }

  return (
    <div
      ref={cardRef}
      className={cn('relative transition-transform duration-normal ease-out', className)}
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

// Hover Reveal Effect
export const HoverReveal: React.FC<{
  children: React.ReactNode
  reveal: React.ReactNode
  className?: string
}> = ({ children, reveal, className }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        'transition-all duration-normal',
        isHovered && 'opacity-0 scale-95'
      )}>
        {children}
      </div>
      <div className={cn(
        'absolute inset-0 transition-all duration-normal',
        !isHovered && 'opacity-0 scale-105'
      )}>
        {reveal}
      </div>
    </div>
  )
}

// Spotlight Effect
export const Spotlight: React.FC<{
  children: React.ReactNode
  className?: string
  color?: string
}> = ({ children, className, color = 'rgba(255, 107, 107, 0.1)' }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 animate-fade-in"
          style={{
            background: `radial-gradient(circle 200px at ${position.x}px ${position.y}px, ${color}, transparent)`,
          }}
        />
      )}
    </div>
  )
}

// Skeleton Loading
export const Skeleton: React.FC<{
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}> = ({ className, variant = 'rectangular' }) => {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div
      className={cn(
        'skeleton',
        variantClasses[variant],
        variant === 'circular' && 'aspect-square',
        className
      )}
    />
  )
}

// Pulse Dot
export const PulseDot: React.FC<{
  color?: 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ color = 'primary', size = 'md', className }) => {
  const colorClasses = {
    primary: 'bg-accent-primary',
    success: 'bg-accent-success',
    warning: 'bg-accent-warning',
    error: 'bg-accent-error',
  }

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'rounded-full',
        colorClasses[color],
        sizeClasses[size]
      )} />
      <div className={cn(
        'absolute inset-0 rounded-full animate-pulse opacity-75',
        colorClasses[color],
        sizeClasses[size]
      )} />
      <div className={cn(
        'absolute inset-0 rounded-full animate-ping',
        colorClasses[color],
        sizeClasses[size]
      )} />
    </div>
  )
}
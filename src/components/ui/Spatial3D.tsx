'use client'

import React, { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Spatial3DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  depth?: 'shallow' | 'medium' | 'deep'
  rotateOnHover?: boolean
  floatAnimation?: boolean
  children: React.ReactNode
}

export const Spatial3DCard = React.forwardRef<HTMLDivElement, Spatial3DCardProps>(
  ({ 
    className,
    depth = 'medium',
    rotateOnHover = true,
    floatAnimation = false,
    children,
    onMouseMove,
    onMouseLeave,
    ...props
  }, ref) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 })
    const cardRef = useRef<HTMLDivElement>(null)

    const depthConfig = {
      shallow: { perspective: 800, maxRotation: 5 },
      medium: { perspective: 1000, maxRotation: 10 },
      deep: { perspective: 1200, maxRotation: 15 }
    }

    const config = depthConfig[depth]

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!rotateOnHover || !cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      setRotation({
        x: (y - 0.5) * config.maxRotation,
        y: (x - 0.5) * -config.maxRotation
      })

      onMouseMove?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setRotation({ x: 0, y: 0 })
      onMouseLeave?.(e)
    }

    return (
      <div
        ref={ref}
        className={cn('relative preserve-3d', className)}
        style={{ perspective: `${config.perspective}px` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <div
          ref={cardRef}
          className={cn(
            'relative transform-gpu transition-transform duration-normal ease-spring',
            floatAnimation && 'animate-float-3d'
          )}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
          
          {/* 3D Shadow */}
          <div 
            className="absolute inset-0 -z-10 bg-black/20 blur-xl rounded-2xl"
            style={{
              transform: 'translateZ(-20px) scale(0.95)'
            }}
          />
          
          {/* Depth layers */}
          <div 
            className="absolute inset-0 -z-20 glass-subtle rounded-2xl"
            style={{
              transform: 'translateZ(-40px) scale(0.9)'
            }}
          />
        </div>
      </div>
    )
  }
)

Spatial3DCard.displayName = 'Spatial3DCard'

// 3D Flip Card
export const Flip3DCard: React.FC<{
  front: React.ReactNode
  back: React.ReactNode
  className?: string
  flipOnHover?: boolean
}> = ({ front, back, className, flipOnHover = false }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className={cn(
        'relative w-full h-full preserve-3d perspective-1000',
        className
      )}
      onMouseEnter={() => flipOnHover && setIsFlipped(true)}
      onMouseLeave={() => flipOnHover && setIsFlipped(false)}
      onClick={() => !flipOnHover && setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-slow ease-spring preserve-3d',
          isFlipped && 'rotate-y-180'
        )}
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Front face */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{
            backfaceVisibility: 'hidden'
          }}
        >
          {front}
        </div>
        
        {/* Back face */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {back}
        </div>
      </div>
    </div>
  )
}

// 3D Parallax Container
export const Parallax3D: React.FC<{
  children: React.ReactNode
  className?: string
  layers?: number
}> = ({ children, className, layers = 3 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2

      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden preserve-3d', className)}
      style={{ perspective: '1000px' }}
    >
      {React.Children.map(children, (child, index) => {
        const depth = (index + 1) / layers
        const translateX = mousePosition.x * 20 * depth
        const translateY = mousePosition.y * 20 * depth

        return (
          <div
            className="absolute inset-0"
            style={{
              transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${index * 10}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            {child}
          </div>
        )
      })}
    </div>
  )
}

// 3D Tilt Effect
export const Tilt3D: React.FC<{
  children: React.ReactNode
  className?: string
  maxTilt?: number
  scale?: number
}> = ({ children, className, maxTilt = 20, scale = 1.05 }) => {
  const [transform, setTransform] = useState('')
  const tiltRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltRef.current) return

    const rect = tiltRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const tiltX = (y - 0.5) * maxTilt
    const tiltY = (0.5 - x) * maxTilt

    setTransform(`perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`)
  }

  const handleMouseLeave = () => {
    setTransform('')
  }

  return (
    <div
      ref={tiltRef}
      className={cn('transition-transform duration-normal ease-out', className)}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
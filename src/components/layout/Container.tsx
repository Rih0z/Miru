'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  wide?: boolean
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '', 
  wide = false 
}) => {
  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      wide ? 'max-w-7xl' : 'max-w-6xl',
      className
    )}>
      {children}
    </div>
  )
}
'use client'

import React from 'react'

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
    <div className={`${wide ? 'container-wide' : 'container'} ${className}`}>
      {children}
    </div>
  )
}
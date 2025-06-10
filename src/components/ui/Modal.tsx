'use client'

import React, { useEffect } from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
  showCloseButton?: boolean
  variant?: 'kawaii' | 'magical'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  showCloseButton = true,
  variant = 'kawaii'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const cardClass = variant === 'magical' ? 'card-kawaii-magical' : 'card-kawaii'

  return (
    <div 
      className="modal-overlay animate-fadeIn"
      onClick={handleBackdropClick}
      data-testid="modal-content"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className={`${cardClass} max-w-md w-full mx-4 animate-bounceIn ${className}`}>
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center mb-6">
            {title && (
              <h2 id="modal-title" className="text-2xl font-bold text-kawaii-gradient">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-kawaii-soft flex items-center justify-center hover-bounce text-lg transition-all"
                aria-label="モーダルを閉じる"
              >
                ✕
              </button>
            )}
          </div>
        )}
        
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  )
}
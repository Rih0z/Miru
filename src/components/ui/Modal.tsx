'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { BrutalButton } from './BrutalButton'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  variant?: 'glass' | 'brutal' | 'minimal'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  showCloseButton = true,
  variant = 'glass',
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle body scroll lock
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

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, closeOnEscape])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    firstElement?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  }

  // Variant styles
  const variantStyles = {
    glass: 'bg-bg-primary/80',
    brutal: 'bg-bg-primary',
    minimal: 'bg-bg-primary/95',
  }

  const modalContent = (
    <div className={cn(
      'w-full mx-auto p-6',
      sizeClasses[size],
      className
    )}>
      {/* Header */}
      {(title || showCloseButton) && (
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {title && (
              <h2 id="modal-title" className="text-2xl font-bold text-text-primary">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-text-secondary mt-1">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className={cn(
                'ml-4 p-2 rounded-lg transition-all',
                'hover:bg-glass-10 hover:scale-110',
                'focus:outline-none focus:ring-2 focus:ring-accent-primary'
              )}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  )

  return (
    <div 
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'animate-fade-in',
        variantStyles[variant]
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      data-testid="modal-content"
    >
      <div
        ref={modalRef}
        className="animate-scale-in"
      >
        {variant === 'glass' && (
          <GlassCard
            variant="prominent"
            blur="heavy"
            className="w-full"
          >
            {modalContent}
          </GlassCard>
        )}
        
        {variant === 'brutal' && (
          <div className="brutal-card w-full">
            {modalContent}
          </div>
        )}
        
        {variant === 'minimal' && (
          <div className="bg-bg-primary rounded-2xl shadow-2xl w-full">
            {modalContent}
          </div>
        )}
      </div>
    </div>
  )
}

// Alert Dialog variant
export const AlertDialog: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '確認',
  cancelText = 'キャンセル',
  variant = 'danger',
}) => {
  const variantColors = {
    danger: 'accent-error',
    warning: 'accent-warning',
    info: 'accent-info',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      
      variant="glass"
    >
      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 rounded-xl bg-glass-10 hover:bg-glass-20 transition-all"
        >
          {cancelText}
        </button>
        <BrutalButton
          onClick={onConfirm}
          variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary'}
          className="flex-1"
        >
          {confirmText}
        </BrutalButton>
      </div>
    </Modal>
  )
}
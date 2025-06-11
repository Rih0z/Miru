import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date with Japanese locale
export function formatDate(date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const optionsMap = {
    short: { month: 'numeric', day: 'numeric' } as const,
    medium: { year: 'numeric', month: 'short', day: 'numeric' } as const,
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' } as const
  }
  
  const options: Intl.DateTimeFormatOptions = optionsMap[format]
  
  return new Intl.DateTimeFormat('ja-JP', options).format(d)
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  if (hours < 24) return `${hours}時間前`
  if (days < 7) return `${days}日前`
  if (days < 30) return `${Math.floor(days / 7)}週間前`
  if (days < 365) return `${Math.floor(days / 30)}ヶ月前`
  
  return `${Math.floor(days / 365)}年前`
}

// Clamp number between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Generate random ID
export function generateId(prefix?: string): string {
  const id = Math.random().toString(36).substring(2, 9)
  return prefix ? `${prefix}-${id}` : id
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Check if running on client
export const isClient = typeof window !== 'undefined'

// Check if running on server
export const isServer = !isClient

// Check if device is mobile
export function isMobile(): boolean {
  if (!isClient) return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Check if device supports touch
export function isTouch(): boolean {
  if (!isClient) return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Local storage helpers with error handling
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (!isClient) return defaultValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (!isClient) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.error(`Failed to save ${key} to localStorage`)
    }
  },
  
  remove: (key: string): void => {
    if (!isClient) return
    try {
      window.localStorage.removeItem(key)
    } catch {
      console.error(`Failed to remove ${key} from localStorage`)
    }
  }
}
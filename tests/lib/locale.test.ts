import { getUserLocale, setUserLocale, Locale } from '@/lib/locale'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

describe('locale', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
  })

  describe('getUserLocale', () => {
    it('should return default locale when localStorage is empty', () => {
      const locale = getUserLocale()
      expect(locale).toBe('ja')
      expect(localStorageMock.getItem).toHaveBeenCalledWith('locale')
    })

    it('should return stored locale when valid locale exists in localStorage', () => {
      localStorageMock.setItem('locale', 'en')

      const locale = getUserLocale()
      expect(locale).toBe('en')
      expect(localStorageMock.getItem).toHaveBeenCalledWith('locale')
    })

    it('should return default locale when invalid locale exists in localStorage', () => {
      localStorageMock.setItem('locale', 'fr') // French is not supported

      const locale = getUserLocale()
      expect(locale).toBe('ja') // Should fallback to default
      expect(localStorageMock.getItem).toHaveBeenCalledWith('locale')
    })

    it('should return ja for valid ja locale', () => {
      localStorageMock.setItem('locale', 'ja')

      const locale = getUserLocale()
      expect(locale).toBe('ja')
    })

    it('should return en for valid en locale', () => {
      localStorageMock.setItem('locale', 'en')

      const locale = getUserLocale()
      expect(locale).toBe('en')
    })

    it('should handle empty string in localStorage', () => {
      localStorageMock.setItem('locale', '')

      const locale = getUserLocale()
      expect(locale).toBe('ja') // Should fallback to default
    })

    it('should return default locale when window is undefined (SSR)', () => {
      // Mock server-side rendering scenario
      const originalWindow = global.window
      
      // @ts-ignore
      delete global.window

      const locale = getUserLocale()
      expect(locale).toBe('ja')

      // Restore window
      global.window = originalWindow
    })
  })

  describe('setUserLocale', () => {
    it('should set valid ja locale in localStorage', () => {
      setUserLocale('ja')

      expect(localStorageMock.setItem).toHaveBeenCalledWith('locale', 'ja')
    })

    it('should set valid en locale in localStorage', () => {
      setUserLocale('en')

      expect(localStorageMock.setItem).toHaveBeenCalledWith('locale', 'en')
    })

    it('should not set locale when window is undefined (SSR)', () => {
      const originalWindow = global.window
      
      // @ts-ignore
      delete global.window

      setUserLocale('en')

      expect(localStorageMock.setItem).not.toHaveBeenCalled()

      // Restore window
      global.window = originalWindow
    })

    it('should handle localStorage setItem errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage is full')
      })

      expect(() => setUserLocale('en')).toThrow('localStorage is full')
    })
  })

  describe('Locale type', () => {
    it('should accept valid locale values', () => {
      const validLocales: Locale[] = ['ja', 'en']
      
      validLocales.forEach(locale => {
        expect(['ja', 'en']).toContain(locale)
      })
    })
  })

  describe('integration tests', () => {
    it('should persist and retrieve locale correctly', () => {
      // Set a locale
      setUserLocale('en')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('locale', 'en')

      // Retrieve the locale
      const locale = getUserLocale()
      expect(locale).toBe('en')
    })

    it('should handle locale switching', () => {
      // Start with ja
      setUserLocale('ja')
      expect(getUserLocale()).toBe('ja')

      // Switch to en
      setUserLocale('en')
      expect(getUserLocale()).toBe('en')

      // Switch back to ja
      setUserLocale('ja')
      expect(getUserLocale()).toBe('ja')
    })

    it('should handle full workflow in browser environment', () => {
      // Initial state - no locale set
      expect(getUserLocale()).toBe('ja') // Default

      // User sets locale to English
      setUserLocale('en')
      expect(getUserLocale()).toBe('en')

      // User switches back to Japanese
      setUserLocale('ja')
      expect(getUserLocale()).toBe('ja')
    })

    it('should validate locale values', () => {
      // Set valid locales
      setUserLocale('ja')
      expect(getUserLocale()).toBe('ja')

      setUserLocale('en')
      expect(getUserLocale()).toBe('en')

      // Manually set invalid locale in localStorage
      localStorageMock.setItem('locale', 'invalid')
      expect(getUserLocale()).toBe('ja') // Should fallback
    })
  })

  describe('edge cases', () => {
    it('should handle case sensitivity', () => {
      localStorageMock.setItem('locale', 'EN') // Wrong case
      expect(getUserLocale()).toBe('ja') // Should fallback

      localStorageMock.setItem('locale', 'JA') // Wrong case  
      expect(getUserLocale()).toBe('ja') // Should fallback
    })

    it('should handle whitespace in stored locale', () => {
      localStorageMock.setItem('locale', ' en ') // With spaces
      expect(getUserLocale()).toBe('ja') // Should fallback

      localStorageMock.setItem('locale', 'en\n') // With newline
      expect(getUserLocale()).toBe('ja') // Should fallback
    })

    it('should handle null/undefined values from localStorage', () => {
      // Mock getItem to return null
      localStorageMock.getItem.mockReturnValueOnce(null)
      expect(getUserLocale()).toBe('ja')

      // Mock getItem to return undefined
      localStorageMock.getItem.mockReturnValueOnce(undefined as any)
      expect(getUserLocale()).toBe('ja')
    })
  })
})
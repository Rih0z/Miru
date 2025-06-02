const defaultLocale = 'ja'
const locales = ['ja', 'en'] as const

export type Locale = typeof locales[number]

export function getUserLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale
  }
  
  const locale = localStorage.getItem('locale')
  
  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale
  }
  
  return defaultLocale
}

export function setUserLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale)
  }
}
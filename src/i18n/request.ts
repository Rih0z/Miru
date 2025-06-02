import { getRequestConfig } from 'next-intl/server'
import { getUserLocale } from '@/lib/locale'

export default getRequestConfig(async () => {
  const locale = getUserLocale()

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})
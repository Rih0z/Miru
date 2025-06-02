import { getUserLocale } from '@/lib/locale'

// モックの設定
jest.mock('next-intl/server', () => ({
  getRequestConfig: jest.fn((configFn) => configFn)
}))

jest.mock('@/lib/locale', () => ({
  getUserLocale: jest.fn()
}))

// メッセージファイルのモック
jest.mock('../../messages/ja.json', () => ({
  "app": {
    "title": "Miru",
    "description": "恋愛オーケストレーションAI"
  },
  "auth": {
    "loginButton": "ログイン"
  }
}), { virtual: true })

jest.mock('../../messages/en.json', () => ({
  "app": {
    "title": "Miru", 
    "description": "Romance Orchestration AI"
  },
  "auth": {
    "loginButton": "Login"
  }
}), { virtual: true })

const mockGetUserLocale = getUserLocale as jest.MockedFunction<typeof getUserLocale>

describe('i18n request configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns configuration with Japanese locale and messages', async () => {
    mockGetUserLocale.mockReturnValue('ja')

    // 設定関数をインポートして実行
    const configFunction = (await import('@/i18n/request')).default
    const config = await configFunction()

    expect(config.locale).toBe('ja')
    expect(config.messages).toEqual({
      "app": {
        "title": "Miru",
        "description": "恋愛オーケストレーションAI"
      },
      "auth": {
        "loginButton": "ログイン"
      }
    })
  })

  it('returns configuration with English locale and messages', async () => {
    mockGetUserLocale.mockReturnValue('en')

    const configFunction = (await import('@/i18n/request')).default
    const config = await configFunction()

    expect(config.locale).toBe('en')
    expect(config.messages).toEqual({
      "app": {
        "title": "Miru",
        "description": "Romance Orchestration AI"
      },
      "auth": {
        "loginButton": "Login"
      }
    })
  })

  it('calls getUserLocale to determine locale', async () => {
    mockGetUserLocale.mockReturnValue('ja')

    const configFunction = (await import('@/i18n/request')).default
    await configFunction()

    expect(mockGetUserLocale).toHaveBeenCalled()
  })

  it('dynamically imports correct message file based on locale', async () => {
    // Test for Japanese
    mockGetUserLocale.mockReturnValue('ja')
    const configFunction = (await import('@/i18n/request')).default
    const jaConfig = await configFunction()
    
    expect(jaConfig.messages).toHaveProperty('app.title', 'Miru')
    expect(jaConfig.messages).toHaveProperty('auth.loginButton', 'ログイン')

    // Test for English (without resetting modules)
    mockGetUserLocale.mockReturnValue('en')
    const enConfig = await configFunction()
    
    expect(enConfig.messages).toHaveProperty('app.title', 'Miru')
    expect(enConfig.messages).toHaveProperty('auth.loginButton', 'Login')
  })

  it('handles locale changes correctly', async () => {
    const configFunction = (await import('@/i18n/request')).default
    
    // First call with Japanese
    mockGetUserLocale.mockReturnValue('ja')
    const config1 = await configFunction()
    expect(config1.locale).toBe('ja')

    // Second call with English
    mockGetUserLocale.mockReturnValue('en')
    const config2 = await configFunction()
    expect(config2.locale).toBe('en')

    expect(getUserLocale).toHaveBeenCalledTimes(2)
  })

  it('returns consistent structure for different locales', async () => {
    const configFunction = (await import('@/i18n/request')).default
    const locales = ['ja', 'en']
    
    for (const locale of locales) {
      mockGetUserLocale.mockReturnValue(locale)
      
      const config = await configFunction()
      
      expect(config).toHaveProperty('locale', locale)
      expect(config).toHaveProperty('messages')
      expect(typeof config.messages).toBe('object')
      expect(config.messages).not.toBeNull()
    }
  })
})
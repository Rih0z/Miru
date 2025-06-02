import { render } from '@testing-library/react'
import RootLayout from '@/app/layout'

// モックの設定
jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({
    className: 'mocked-inter-font'
  }))
}))

jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="auth-provider">{children}</div>
}))

jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children, messages, locale }: any) => 
    <div data-testid="intl-provider" data-locale={locale} data-messages={JSON.stringify(messages)}>
      {children}
    </div>
}))

jest.mock('next-intl/server', () => ({
  getLocale: jest.fn(),
  getMessages: jest.fn()
}))

jest.mock('@/lib/locale', () => ({
  getUserLocale: jest.fn(() => 'ja')
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

describe('RootLayout', () => {
  it('renders children within providers', async () => {
    const TestChild = () => <div data-testid="test-child">Test Content</div>

    const { findByTestId } = render(
      await RootLayout({ children: <TestChild /> })
    )

    // Check that providers are rendered
    expect(await findByTestId('auth-provider')).toBeInTheDocument()
    expect(await findByTestId('intl-provider')).toBeInTheDocument()
    expect(await findByTestId('test-child')).toBeInTheDocument()
  })

  it('sets correct language attribute on html element', async () => {
    const TestChild = () => <div>Test</div>

    const result = render(
      await RootLayout({ children: <TestChild /> })
    )

    const htmlElement = result.container.querySelector('html')
    expect(htmlElement).toHaveAttribute('lang', 'ja')
  })

  it('applies correct font class to body', async () => {
    const TestChild = () => <div>Test</div>

    const result = render(
      await RootLayout({ children: <TestChild /> })
    )

    const bodyElement = result.container.querySelector('body')
    expect(bodyElement).toHaveClass('mocked-inter-font')
  })

  it('provides correct locale and messages to NextIntlClientProvider', async () => {
    const TestChild = () => <div>Test</div>

    const { findByTestId } = render(
      await RootLayout({ children: <TestChild /> })
    )

    const intlProvider = await findByTestId('intl-provider')
    expect(intlProvider).toHaveAttribute('data-locale', 'ja')
    
    // Check that messages are provided
    const messagesAttr = intlProvider.getAttribute('data-messages')
    expect(messagesAttr).toBeTruthy()
    
    if (messagesAttr) {
      const messages = JSON.parse(messagesAttr)
      expect(messages).toHaveProperty('app')
      expect(messages).toHaveProperty('auth')
    }
  })

  it('maintains proper nesting order of providers', async () => {
    const TestChild = () => <div data-testid="test-child">Test</div>

    const { findByTestId } = render(
      await RootLayout({ children: <TestChild /> })
    )

    const intlProvider = await findByTestId('intl-provider')
    const authProvider = await findByTestId('auth-provider')
    const testChild = await findByTestId('test-child')

    // NextIntlClientProvider should contain AuthProvider
    expect(intlProvider).toContainElement(authProvider)
    
    // AuthProvider should contain the children
    expect(authProvider).toContainElement(testChild)
  })

  it('renders with proper HTML structure', async () => {
    const TestChild = () => <div>Test Content</div>

    const result = render(
      await RootLayout({ children: <TestChild /> })
    )

    // Check basic HTML structure
    expect(result.container.querySelector('html')).toBeInTheDocument()
    expect(result.container.querySelector('body')).toBeInTheDocument()
  })
})
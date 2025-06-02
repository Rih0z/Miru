import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

// モックの設定
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
  useLocale: jest.fn()
}))

jest.mock('@/lib/locale', () => ({
  setUserLocale: jest.fn()
}))

// React hooksをモック
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: () => [false, jest.fn((fn) => fn())]
}))

import { useTranslations, useLocale } from 'next-intl'
import { setUserLocale } from '@/lib/locale'

const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>
const mockUseLocale = useLocale as jest.MockedFunction<typeof useLocale>
const mockSetUserLocale = setUserLocale as jest.MockedFunction<typeof setUserLocale>

// window.location.reloadをモック
const mockReload = jest.fn()
Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload
  },
  writable: true
})

describe('LanguageSwitcher', () => {
  const mockT = jest.fn((key: string) => {
    const translations: Record<string, string> = {
      'switch': 'Switch Language',
      'japanese': '日本語',
      'english': 'English'
    }
    return translations[key] || key
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTranslations.mockReturnValue(mockT)
    mockUseLocale.mockReturnValue('ja')
    mockReload.mockClear()
  })

  it('renders language switcher button with current locale', () => {
    render(<LanguageSwitcher />)

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('日本語')).toBeInTheDocument()
  })

  it('shows English when locale is en', () => {
    mockUseLocale.mockReturnValue('en')

    render(<LanguageSwitcher />)

    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('opens dropdown when button is clicked', () => {
    render(<LanguageSwitcher />)

    const switchButton = screen.getByRole('button')
    fireEvent.click(switchButton)

    expect(screen.getAllByText('日本語')).toHaveLength(2) // One in button, one in dropdown
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('closes dropdown when button is clicked again', () => {
    render(<LanguageSwitcher />)

    const switchButton = screen.getByRole('button')
    
    // Open dropdown
    fireEvent.click(switchButton)
    expect(screen.getAllByText('日本語')).toHaveLength(2) // One in button, one in dropdown

    // Close dropdown
    fireEvent.click(switchButton)
    expect(screen.getAllByText('日本語')).toHaveLength(1) // Only in button
  })

  it('changes locale to Japanese when Japanese option is clicked', async () => {
    mockUseLocale.mockReturnValue('en') // Start with English
    
    render(<LanguageSwitcher />)

    // Open dropdown
    const switchButton = screen.getByRole('button')
    fireEvent.click(switchButton)

    // Click Japanese option (second button in the list)
    const buttons = screen.getAllByRole('button')
    const japaneseOption = buttons[1] // Dropdown buttons
    fireEvent.click(japaneseOption)

    expect(mockSetUserLocale).toHaveBeenCalledWith('ja')
    await waitFor(() => {
      expect(mockReload).toHaveBeenCalled()
    })
  })

  it('changes locale to English when English option is clicked', async () => {
    mockUseLocale.mockReturnValue('ja') // Start with Japanese
    
    render(<LanguageSwitcher />)

    // Open dropdown
    const switchButton = screen.getByRole('button')
    fireEvent.click(switchButton)

    // Click English option (third button in the list)
    const buttons = screen.getAllByRole('button')
    const englishOption = buttons[2] // Dropdown buttons
    fireEvent.click(englishOption)

    expect(mockSetUserLocale).toHaveBeenCalledWith('en')
    await waitFor(() => {
      expect(mockReload).toHaveBeenCalled()
    })
  })

  it('highlights current locale in dropdown', () => {
    mockUseLocale.mockReturnValue('ja')
    
    render(<LanguageSwitcher />)

    // Open dropdown
    const switchButton = screen.getByRole('button')
    fireEvent.click(switchButton)

    const buttons = screen.getAllByRole('button')
    const japaneseOption = buttons[1] // Second button (Japanese)
    const englishOption = buttons[2] // Third button (English)

    // Japanese should be highlighted (have blue classes)
    expect(japaneseOption).toHaveClass('bg-blue-50', 'text-blue-600')
    
    // English should not be highlighted
    expect(englishOption).toHaveClass('text-gray-700')
    expect(englishOption).not.toHaveClass('bg-blue-50', 'text-blue-600')
  })

  it('shows correct arrow rotation when dropdown is open/closed', () => {
    render(<LanguageSwitcher />)

    const switchButton = screen.getByRole('button')
    const arrows = switchButton.querySelectorAll('svg')
    const dropdownArrow = arrows[1] // Second SVG is the dropdown arrow

    // Initially closed
    expect(dropdownArrow).not.toHaveClass('rotate-180')

    // Open dropdown
    fireEvent.click(switchButton)
    expect(dropdownArrow).toHaveClass('rotate-180')

    // Close dropdown
    fireEvent.click(switchButton)
    expect(dropdownArrow).not.toHaveClass('rotate-180')
  })

  it('does not show dropdown initially', () => {
    render(<LanguageSwitcher />)

    // Only one instance of each text (in the button, not in dropdown)
    expect(screen.getAllByText('日本語')).toHaveLength(1)
    expect(screen.queryByText('English')).not.toBeInTheDocument()
  })

  it('calls useTranslations with language namespace', () => {
    render(<LanguageSwitcher />)

    expect(mockUseTranslations).toHaveBeenCalledWith('language')
  })

  it('calls setUserLocale and reloads page when locale changes', async () => {
    render(<LanguageSwitcher />)

    // Open dropdown
    const switchButton = screen.getByRole('button')
    fireEvent.click(switchButton)

    // Click English option
    const buttons = screen.getAllByRole('button')
    const englishOption = buttons[2] // Third button (English)
    fireEvent.click(englishOption)

    expect(mockSetUserLocale).toHaveBeenCalledWith('en')
    await waitFor(() => {
      expect(mockReload).toHaveBeenCalled()
    })
  })
})
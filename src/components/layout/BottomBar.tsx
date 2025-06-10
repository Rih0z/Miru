'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Thermometer, Download, Bot, Settings } from 'lucide-react'

interface TabItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  path: string
}

const tabs: TabItem[] = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/' },
  { id: 'temperature', icon: Thermometer, label: 'Temperature', path: '/temperature' },
  { id: 'import', icon: Download, label: 'Import', path: '/import' },
  { id: 'ai', icon: Bot, label: 'AI Analysis', path: '/ai' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' }
]

export const BottomBar: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()

  const handleTabClick = (tab: TabItem) => {
    router.push(tab.path)
  }

  const isActive = (tab: TabItem) => {
    if (tab.path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(tab.path)
  }

  return (
    <div className="bg-white border-t-2 border-pink-200 shadow-lg safe-bottom">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const active = isActive(tab)
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl min-w-0 flex-1 
                transition-all duration-300 touch-target hover-bounce
                ${active 
                  ? 'bg-pink-50 text-pink-600 scale-105 animate-pulse' 
                  : 'text-gray-500 hover:text-pink-600 hover:bg-pink-25'
                }
              `}
              aria-label={tab.label}
            >
              <IconComponent className={`w-5 h-5 mb-1 ${active ? 'animate-pulse' : ''}`} />
              <span className={`text-xs font-medium leading-tight ${active ? 'text-pink-600 font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
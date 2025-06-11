'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Thermometer, Download, Bot, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TabItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  path: string
}

const tabs: TabItem[] = [
  { id: 'dashboard', icon: Home, label: 'ホーム', path: '/' },
  { id: 'temperature', icon: Thermometer, label: '温度', path: '/temperature' },
  { id: 'import', icon: Download, label: 'インポート', path: '/import' },
  { id: 'ai', icon: Bot, label: 'AI分析', path: '/ai' },
  { id: 'settings', icon: Settings, label: '設定', path: '/settings' }
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
    <div className="bg-glass-5 backdrop-blur-heavy border-t border-glass-20 shadow-xl safe-bottom">
      <div className="flex justify-around items-center py-2 px-4">
        {tabs.map((tab) => {
          const active = isActive(tab)
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-2xl min-w-0 flex-1',
                'transition-all duration-300 group relative overflow-hidden',
                active 
                  ? 'bg-ai-gradient text-white scale-105 shadow-lg' 
                  : 'text-text-muted hover:text-text-primary hover:bg-glass-10'
              )}
              aria-label={tab.label}
            >
              {/* Active background effect */}
              {active && (
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl" />
              )}
              
              <IconComponent className={cn(
                'w-5 h-5 mb-1 relative z-10 transition-transform',
                active ? 'animate-bounce' : 'group-hover:scale-110'
              )} />
              
              <span className={cn(
                'text-xs font-medium leading-tight relative z-10',
                active ? 'text-white font-bold' : 'group-hover:font-medium'
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
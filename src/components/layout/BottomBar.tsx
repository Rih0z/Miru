'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface TabItem {
  id: string
  icon: string
  label: string
  path: string
}

const tabs: TabItem[] = [
  { id: 'dashboard', icon: '🏠', label: 'ホーム', path: '/' },
  { id: 'temperature', icon: '🌡️', label: '温度', path: '/temperature' },
  { id: 'import', icon: '📥', label: 'インポート', path: '/import' },
  { id: 'ai', icon: '🤖', label: 'AI分析', path: '/ai' },
  { id: 'settings', icon: '⚙️', label: '設定', path: '/settings' }
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
    <div className="bg-white border-t-2 border-kawaii-pink shadow-lg safe-bottom">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const active = isActive(tab)
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl min-w-0 flex-1 
                transition-all duration-300 touch-target hover-bounce
                ${active 
                  ? 'bg-kawaii-soft text-primary scale-105 animate-kawaii-pulse' 
                  : 'text-gray-500 hover:text-primary hover:bg-kawaii-cream'
                }
              `}
            >
              <span className={`text-xl mb-1 ${active ? 'animate-heartbeat' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-xs font-medium leading-tight ${active ? 'text-kawaii-glow' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
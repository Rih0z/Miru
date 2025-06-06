'use client'

import { Dashboard } from '@/components/Dashboard'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function Home() {
  // ログイン機能を一時的に無効化 - プロンプト機能のみ提供
  const demoUserId = 'demo-user-001'

  return (
    <main className="min-h-screen">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <Dashboard userId={demoUserId} />
    </main>
  )
}
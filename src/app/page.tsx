'use client'

import { Dashboard } from '@/components/Dashboard'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function Home() {
  const demoUserId = 'demo-user-001'

  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <Dashboard userId={demoUserId} />
    </>
  )
}
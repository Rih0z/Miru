'use client'

import { Dashboard } from '@/components/Dashboard'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Dashboard userId="demo-user" />
      </div>
    </main>
  )
}
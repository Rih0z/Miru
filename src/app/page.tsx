import { Dashboard } from '@/components/Dashboard'

export default function Home() {
  // TODO: 実際の認証システムからuserIdを取得
  const userId = 'demo-user-123'

  return (
    <div>
      <Dashboard userId={userId} />
    </div>
  )
}
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Connection, DashboardData } from '@/types'
import { DIContainer } from '@/lib/infrastructure/container/DIContainer'
import { ConnectionCard } from './connections/ConnectionCard'
import { ConnectionForm } from './connections/ConnectionForm'
import { PromptExecutor } from './prompts/PromptExecutor'
import { DataImportModal } from './data-import/DataImportModal'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { ErrorState } from './ui/ErrorState'
import { EmptyState } from './ui/EmptyState'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Modal } from './ui/Modal'

interface DashboardProps {
  userId: string
}

export function Dashboard({ userId }: DashboardProps) {
  const connectionService = useMemo(() => DIContainer.getInstance().getConnectionService(), [])
  
  const [connections, setConnections] = useState<Connection[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showConnectionForm, setShowConnectionForm] = useState(false)
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null)
  const [showPromptExecutor, setShowPromptExecutor] = useState<{
    connection: Connection
    promptType: string
  } | null>(null)
  const [showDataImportModal, setShowDataImportModal] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [userId, connectionService])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowSparkle(true)
      setTimeout(() => setShowSparkle(false), 1000)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await connectionService.getDashboardData(userId)
      setConnections(data.connections)
      setDashboardData(data)
    } catch (error) {
      console.error('ダッシュボードデータの読み込みに失敗:', error)
      setError('ダッシュボードデータの読み込みに失敗しました')
      setConnections([])
      setDashboardData({
        connections: [],
        totalConnections: 0,
        activeConnections: 0,
        averageScore: 0,
        recommendedActions: [],
        bestConnection: null
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditConnection = (connection: Connection) => {
    setEditingConnection(connection)
    setShowConnectionForm(true)
  }

  const handleDeleteConnection = async (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId)
    const confirmDelete = confirm(`${connection?.nickname}さんを削除しますか？`)
    
    if (!confirmDelete) return

    try {
      await connectionService.deleteConnection(connectionId)
      setConnections(prev => prev.filter(c => c.id !== connectionId))
      await loadDashboardData()
    } catch (err) {
      setError('削除に失敗しました')
    }
  }

  const handleGeneratePrompt = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId)
    if (connection) {
      const action = connectionService.getRecommendedAction(connection)
      setShowPromptExecutor({
        connection,
        promptType: action.prompt_type
      })
    }
  }

  const handleAddConnection = () => {
    setEditingConnection(null)
    setShowConnectionForm(true)
  }

  const handleFormSubmit = async (data: Partial<Connection>) => {
    try {
      if (editingConnection) {
        await connectionService.updateConnection(editingConnection.id, data)
        setConnections(prev => prev.map(c => 
          c.id === editingConnection.id ? { ...c, ...data } : c
        ))
        alert('相手情報を更新しました ✨')
      } else {
        const newConnection = await connectionService.createConnection(userId, data as any)
        setConnections(prev => [...prev, newConnection])
        alert('新しい相手を追加しました 💕')
      }
      setShowConnectionForm(false)
      setEditingConnection(null)
    } catch (error) {
      alert('エラーが発生しました: ' + (error as Error).message)
    }
  }

  const handleFormCancel = () => {
    setShowConnectionForm(false)
    setEditingConnection(null)
  }

  const handleDataImportComplete = async (importedConnections: Connection[]) => {
    try {
      const updatedConnections = [...connections, ...importedConnections]
      setConnections(updatedConnections)
      await loadDashboardData()
      setShowDataImportModal(false)
      alert(`${importedConnections.length}件のコネクションがインポートされました！✨`)
    } catch (error) {
      console.error('インポート完了処理エラー:', error)
      alert('インポート完了処理でエラーが発生しました')
    }
  }

  if (loading) {
    return (
      <LoadingSpinner 
        fullScreen 
        message="恋愛の魔法を分析中..."
        submessage="素敵な出会いを見つけています"
        variant="magical"
        size="lg"
      />
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorState
          title="ちょっとした問題が起きちゃいました"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    )
  }

  if (!dashboardData || connections.length === 0) {
    return (
      <EmptyState
        title="新しい恋愛の魔法を始めましょう ✨"
        description="Miruと一緒に素敵な恋愛ストーリーを紡いでいきましょう！気になる運命の人の情報を追加して、愛に満ちた成功への魔法の道筋を見つけましょう 💕"
        icon="💕"
        primaryAction={{
          label: "手動で追加する",
          onClick: handleAddConnection,
          icon: "➕"
        }}
        secondaryAction={{
          label: "AIで一括インポート",
          onClick: () => setShowDataImportModal(true),
          icon: "📥"
        }}
      />
    )
  }

  return (
    <div className="space-y-8 py-8">
      {/* スパークルエフェクト */}
      {showSparkle && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10 text-2xl animate-sparkle">✨</div>
          <div className="absolute top-40 right-20 text-xl animate-sparkle delay-100">💕</div>
          <div className="absolute bottom-20 left-1/2 text-2xl animate-sparkle delay-200">🌸</div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-kawaii-gradient animate-float">
            🌸💕 恋愛ダッシュボード ✨
          </h1>
          <p className="text-gray-700 text-lg font-medium">
            あなたの素敵な恋愛を応援するMiruの魔法のインサイト 🪄
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleAddConnection}
            icon="➕"
            sparkle
          >
            <span className="hidden sm:inline">手動で追加</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowDataImportModal(true)}
            icon="📥"
            sparkle
          >
            <span className="hidden sm:inline">AIインポート</span>
          </Button>
        </div>
      </div>

      {/* サマリー統計 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="kawaii" hover className="animate-bounceIn">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-3xl bg-kawaii-romantic flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
              <span className="text-3xl animate-kawaii-pulse">👥</span>
            </div>
            <div className="ml-5 flex-1">
              <p className="text-sm font-semibold text-kawaii-gradient">出会った運命の人</p>
              <div className="flex items-baseline">
                <p className="text-4xl font-extrabold text-kawaii-glow">
                  {dashboardData.totalConnections}
                </p>
                <p className="ml-2 text-sm text-pink-400 font-medium">人 💕</p>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="magical" hover className="animate-bounceIn">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-3xl bg-kawaii-lavender flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
              <span className="text-3xl animate-kawaii-pulse">📈</span>
            </div>
            <div className="ml-5 flex-1">
              <p className="text-sm font-semibold text-kawaii-gradient">進展中の関係</p>
              <div className="flex items-baseline">
                <p className="text-4xl font-extrabold text-kawaii-glow">
                  {dashboardData.activeConnections}
                </p>
                <p className="ml-2 text-sm text-purple-400 font-medium">件 ✨</p>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="soft" hover className="animate-bounceIn">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-3xl bg-kawaii-mint flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
              <span className="text-3xl animate-kawaii-pulse">⭐</span>
            </div>
            <div className="ml-5 flex-1">
              <p className="text-sm font-semibold text-kawaii-gradient">愛情スコア平均</p>
              <div className="flex items-baseline">
                <p className="text-4xl font-extrabold text-kawaii-glow">
                  {dashboardData.averageScore || 0}
                </p>
                <p className="ml-2 text-sm text-yellow-400 font-medium">点 🌟</p>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="romantic" hover className="animate-bounceIn">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-3xl bg-kawaii-peach flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
              <span className="text-3xl animate-heartbeat">💖</span>
            </div>
            <div className="ml-5 flex-1">
              <p className="text-sm font-semibold text-kawaii-gradient">最も有望な関係</p>
              <div className="flex items-baseline">
                <p className="text-4xl font-extrabold text-kawaii-glow">
                  {dashboardData.bestConnection ? '💕' : '-'}
                </p>
                <p className="ml-2 text-sm text-green-400 font-medium">💫</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 最も有望な関係 */}
      {dashboardData.bestConnection && (
        <Card variant="magical" className="animate-fadeIn">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-gradient-primary rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-kawaii-gradient">✨ 最も輝いている関係 ✨</h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-kawaii-cream rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold animate-heartbeat">
                {dashboardData.bestConnection.nickname[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-kawaii-gradient">{dashboardData.bestConnection.nickname}さん</h3>
                <p className="text-sm text-gray-600">愛情度: {connectionService.calculateRelationshipScore(dashboardData.bestConnection)}点</p>
              </div>
            </div>
            <span className="text-3xl animate-sparkle">💖</span>
          </div>
        </Card>
      )}

      {/* 相手一覧 */}
      <div>
        <h2 className="text-xl font-bold text-kawaii-gradient mb-6 animate-float">
          🌸 あなたの運命の人たち 🌸
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection, index) => (
            <div key={connection.id} className="animate-bounceIn" style={{ animationDelay: `${index * 100}ms` }}>
              <ConnectionCard
                connection={connection}
                onEdit={handleEditConnection}
                onDelete={handleDeleteConnection}
                onGeneratePrompt={handleGeneratePrompt}
              />
            </div>
          ))}
        </div>
      </div>

      {/* モーダル */}
      <Modal
        isOpen={showConnectionForm}
        onClose={handleFormCancel}
        title={editingConnection ? `${editingConnection.nickname}さんの情報編集` : '新しい相手を追加'}
        variant="kawaii"
        className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <ConnectionForm
          initialData={editingConnection || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>

      {showPromptExecutor && (
        <PromptExecutor
          connection={showPromptExecutor.connection}
          promptType={showPromptExecutor.promptType}
          onClose={() => setShowPromptExecutor(null)}
        />
      )}

      {showDataImportModal && (
        <DataImportModal
          isOpen={showDataImportModal}
          onClose={() => setShowDataImportModal(false)}
          onImportComplete={handleDataImportComplete}
          userId={userId}
        />
      )}
    </div>
  )
}
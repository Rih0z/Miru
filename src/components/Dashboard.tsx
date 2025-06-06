'use client'

import { useState, useEffect, useMemo } from 'react'
import { Connection, DashboardData } from '@/types'
import { DIContainer } from '@/lib/infrastructure/container/DIContainer'
import { ConnectionCard } from './connections/ConnectionCard'
import { ConnectionForm } from './connections/ConnectionForm'
import { PromptExecutor } from './prompts/PromptExecutor'
import { DataImportModal } from './data-import/DataImportModal'

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

  useEffect(() => {
    loadDashboardData()
  }, [userId, connectionService])

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

  // 温度スコア計算
  const getTemperatureClass = (score: number) => {
    if (score >= 75) return 'badge-hot'
    if (score >= 40) return 'badge-warm'
    return 'badge-cool'
  }

  const getTemperatureEmoji = (score: number) => {
    if (score >= 75) return '🔥'
    if (score >= 40) return '🌟'
    return '❄️'
  }

  if (loading) {
    return (
      <div className="kawaii-page">
        <div className="kawaii-container">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center animate-kawaii-bounce">
              <div className="kawaii-loading mx-auto mb-6"></div>
              <div className="animate-kawaii-float">
                <h2 className="title-kawaii">恋愛の魔法を準備中... ✨</h2>
                <p className="kawaii-text text-xl">
                  <span className="animate-kawaii-heartbeat inline-block">💕</span>
                  素敵な出会いを分析しています
                  <span className="animate-kawaii-heartbeat inline-block">💕</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="kawaii-page">
        <div className="kawaii-container">
          <div className="flex items-center justify-center min-h-screen">
            <div className="card-kawaii max-w-md text-center animate-kawaii-bounce">
              <div className="kawaii-decoration mb-6">
                <span className="text-6xl animate-kawaii-float">😢</span>
              </div>
              <h3 className="kawaii-subtitle">何か問題が起きました</h3>
              <p className="kawaii-text mb-6">{error}</p>
              <button
                onClick={loadDashboardData}
                className="btn-kawaii"
              >
                <span className="animate-kawaii-heartbeat">💕</span>
                もう一度試す
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData || connections.length === 0) {
    return (
      <div className="kawaii-page">
        <div className="kawaii-container">
          <div className="flex items-center justify-center min-h-screen">
            <div className="card-kawaii max-w-2xl text-center animate-kawaii-bounce relative">
              <div className="absolute top-4 right-4 animate-kawaii-sparkle text-3xl">✨</div>
              <div className="absolute top-8 left-8 animate-kawaii-float text-2xl">🌸</div>
              
              <div className="kawaii-heart-decoration mb-8">
                <span className="text-8xl">💕</span>
              </div>
              
              <h1 className="title-kawaii text-5xl mb-6 animate-kawaii-float">
                新しい恋愛の魔法を始めましょう ✨
              </h1>
              
              <p className="kawaii-text text-xl mb-8 leading-relaxed">
                🌟 Miruと一緒に素敵な恋愛ストーリーを紡いでいきましょう 🌟<br />
                気になる運命の人の情報を追加して、愛に満ちた成功への魔法の道筋を見つけましょう！
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <button
                  onClick={handleAddConnection}
                  className="btn-kawaii animate-kawaii-float"
                >
                  <span>➕</span> 手動で追加する
                </button>
                <button
                  onClick={() => setShowDataImportModal(true)}
                  className="btn-kawaii bg-temp-warm hover-kawaii"
                >
                  <span>📥</span> AIで一括インポート
                </button>
              </div>
              
              <p className="kawaii-text text-sm">
                💡 AIインポートなら、既存の恋愛アプリの状況を簡単に取り込めます
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="kawaii-page">
      <div className="kawaii-container space-y-8">
        {/* Kawaii ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="animate-kawaii-slide-in">
            <h1 className="title-kawaii text-4xl animate-kawaii-float">
              🌸💕 恋愛ダッシュボード ✨
            </h1>
            <p className="kawaii-text text-lg">
              あなたの素敵な恋愛を応援するMiruの魔法のインサイト 🪄
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 animate-kawaii-slide-in">
            <button
              onClick={handleAddConnection}
              className="btn-kawaii hover-kawaii"
            >
              <span className="text-lg">➕</span>
              <span className="hidden sm:inline">手動で追加</span>
              <span className="sm:hidden">追加</span>
            </button>
            <button
              onClick={() => setShowDataImportModal(true)}
              className="btn-kawaii bg-temp-warm hover-kawaii"
            >
              <span className="text-lg">📥</span>
              <span className="hidden sm:inline">AIインポート</span>
              <span className="sm:hidden">インポート</span>
            </button>
          </div>
        </div>

        {/* Kawaii サマリー統計 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card-kawaii hover-kawaii animate-kawaii-bounce">
            <div className="flex items-center">
              <div className="kawaii-decoration mr-4">
                <span className="text-4xl animate-kawaii-heartbeat">👥</span>
              </div>
              <div>
                <p className="kawaii-text text-sm font-semibold mb-1">出会った運命の人</p>
                <div className="flex items-baseline">
                  <span className="title-kawaii text-3xl">{dashboardData.totalConnections}</span>
                  <span className="kawaii-text ml-2">人 💕</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-kawaii hover-kawaii animate-kawaii-bounce" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center">
              <div className="kawaii-star-decoration mr-4">
                <span className="text-4xl animate-kawaii-sparkle">🌟</span>
              </div>
              <div>
                <p className="kawaii-text text-sm font-semibold mb-1">進展中の関係</p>
                <div className="flex items-baseline">
                  <span className="title-kawaii text-3xl">{dashboardData.activeConnections}</span>
                  <span className="kawaii-text ml-2">進行中 ✨</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-kawaii hover-kawaii sm:col-span-2 lg:col-span-1 animate-kawaii-bounce" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center">
              <div className="kawaii-heart-decoration mr-4">
                <span className="text-4xl">💖</span>
              </div>
              <div>
                <p className="kawaii-text text-sm font-semibold mb-1">愛情スコア平均</p>
                <div className="flex items-baseline">
                  <span className="title-kawaii text-3xl">{dashboardData.averageScore || 0}</span>
                  <span className="kawaii-text ml-2">点 💕</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ベストコネクション */}
        {dashboardData.bestConnection && (
          <div className="card-kawaii animate-kawaii-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl animate-kawaii-sparkle">👑</span>
              <h2 className="kawaii-subtitle">最も輝いている関係</h2>
            </div>
            <div className="flex items-center justify-between p-6 bg-gradient-romantic rounded-kawaii-xl">
              <div>
                <h3 className="title-kawaii text-2xl mb-2">{dashboardData.bestConnection.nickname}さん</h3>
                <span className={`badge-kawaii ${getTemperatureClass(connectionService.calculateRelationshipScore(dashboardData.bestConnection))}`}>
                  {getTemperatureEmoji(connectionService.calculateRelationshipScore(dashboardData.bestConnection))}
                  愛情度: {connectionService.calculateRelationshipScore(dashboardData.bestConnection)}点
                </span>
              </div>
              <div className="kawaii-heart-decoration">
                <span className="text-6xl">💕</span>
              </div>
            </div>
          </div>
        )}

        {/* 推奨アクション */}
        <div className="card-kawaii animate-kawaii-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl animate-kawaii-float">🪄</span>
            <h2 className="kawaii-subtitle">今すぐできる魔法のアクション</h2>
          </div>
          <div className="space-y-4">
            {dashboardData.recommendedActions.map((action, index) => (
              <div
                key={action.id}
                className="p-6 bg-gradient-romantic rounded-kawaii-xl hover-kawaii animate-kawaii-slide-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="kawaii-subtitle text-xl mb-2">{action.title}</h3>
                    <p className="kawaii-text">{action.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge-kawaii ${
                      action.urgency === 'critical' ? 'badge-hot' :
                      action.urgency === 'high' ? 'badge-warm' :
                      action.urgency === 'medium' ? 'badge-cool' :
                      'badge-kawaii'
                    }`}>
                      {action.urgency === 'critical' ? '💝 超緊急' :
                       action.urgency === 'high' ? '💖 高優先' :
                       action.urgency === 'medium' ? '💕 中優先' : '🤍 低優先'}
                    </span>
                    <button
                      onClick={() => handleGeneratePrompt(action.connection_id)}
                      className="btn-kawaii bg-temp-cool hover-kawaii"
                    >
                      <span className="animate-kawaii-sparkle">💫</span> 実行する
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 相手一覧 */}
        <div className="animate-kawaii-fade-in">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-3xl animate-kawaii-heartbeat">💖</span>
            <h2 className="kawaii-subtitle">あなたの運命の人たち</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection, index) => (
              <div 
                key={connection.id} 
                className="animate-kawaii-bounce" 
                style={{animationDelay: `${index * 0.1}s`}}
              >
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
      </div>

      {/* モーダル */}
      {showConnectionForm && (
        <div className="kawaii-modal-backdrop animate-kawaii-fade-in">
          <div className="modal-kawaii max-w-4xl hover-kawaii">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl animate-kawaii-sparkle">✨</span>
                <h2 className="kawaii-subtitle">
                  {editingConnection ? `${editingConnection.nickname}さんの情報編集` : '新しい相手を追加'}
                </h2>
              </div>
              <ConnectionForm
                initialData={editingConnection || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>
      )}

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
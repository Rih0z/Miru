'use client'

import { useState, useEffect, useMemo } from 'react'
import { Connection, DashboardData } from '@/types'
import { DIContainer } from '@/lib/infrastructure/container/DIContainer'
import { ConnectionCard } from './connections/ConnectionCard'
import { ConnectionForm } from './connections/ConnectionForm'
import { PromptExecutor } from './prompts/PromptExecutor'
import { DataImportModal } from './data-import/DataImportModal'
import { Heart, Users, TrendingUp, Star, Plus, Sparkles } from 'lucide-react'

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

  // スパークルエフェクト
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
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">恋愛の魔法を準備中...</h2>
          <p className="text-gray-600 mt-2">素敵な出会いを分析しています ✨</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <div className="text-6xl mb-4">😢</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">何か問題が起きました</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            もう一度試す
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData || connections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-2xl text-center shadow-xl">
          <div className="w-24 h-24 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-white" size={48} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            新しい恋愛の魔法を始めましょう
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Miruと一緒に素敵な恋愛ストーリーを紡いでいきましょう<br />
            気になる運命の人の情報を追加して、愛に満ちた成功への魔法の道筋を見つけましょう！
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleAddConnection}
              className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              手動で追加する
            </button>
            <button
              onClick={() => setShowDataImportModal(true)}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              AIで一括インポート
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            💡 AIインポートなら、既存の恋愛アプリの状況を簡単に取り込めます
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* スパークルエフェクト */}
      {showSparkle && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10 text-2xl animate-sparkle">✨</div>
          <div className="absolute top-40 right-20 text-xl animate-sparkle delay-100">💕</div>
          <div className="absolute bottom-20 left-1/2 text-2xl animate-sparkle delay-200">🌸</div>
        </div>
      )}

      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Miru
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddConnection}
                className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">手動で追加</span>
              </button>
              <button
                onClick={() => setShowDataImportModal(true)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-gray-200 flex items-center gap-2"
              >
                <Sparkles size={16} />
                <span className="hidden sm:inline">AIインポート</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-pink-500" size={24} />
              <span className="text-2xl font-bold text-pink-600">{dashboardData.totalConnections}</span>
            </div>
            <p className="text-gray-700 font-medium">出会った運命の人</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-purple-500" size={24} />
              <span className="text-2xl font-bold text-purple-600">{dashboardData.activeConnections}</span>
            </div>
            <p className="text-gray-700 font-medium">進展中の関係</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <Star className="text-yellow-500" size={24} />
              <span className="text-2xl font-bold text-yellow-600">{dashboardData.averageScore || 0}</span>
            </div>
            <p className="text-gray-700 font-medium">愛情スコア平均</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <Heart className="text-green-500" size={24} />
              <span className="text-2xl font-bold text-green-600">
                {dashboardData.bestConnection ? '💕' : '-'}
              </span>
            </div>
            <p className="text-gray-700 font-medium">最も有望な関係</p>
          </div>
        </div>

        {/* 最も有望な関係 */}
        {dashboardData.bestConnection && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-bold text-gray-800">最も輝いている関係</h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  {dashboardData.bestConnection.nickname[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{dashboardData.bestConnection.nickname}さん</h3>
                  <p className="text-sm text-gray-600">愛情度: {connectionService.calculateRelationshipScore(dashboardData.bestConnection)}点</p>
                </div>
              </div>
              <Heart className="text-pink-400 animate-pulse" size={32} />
            </div>
          </div>
        )}

        {/* 相手一覧 */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">あなたの運命の人たち</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onEdit={handleEditConnection}
                onDelete={handleDeleteConnection}
                onGeneratePrompt={handleGeneratePrompt}
              />
            ))}
          </div>
        </div>
      </main>

      {/* モーダル */}
      {showConnectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingConnection ? `${editingConnection.nickname}さんの情報編集` : '新しい相手を追加'}
              </h2>
              <button 
                onClick={handleFormCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ConnectionForm
              initialData={editingConnection || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
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
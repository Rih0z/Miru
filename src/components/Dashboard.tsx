'use client'

import { useState, useEffect, useMemo } from 'react'
import { Connection, DashboardData, RecommendedAction } from '@/types'
import { DIContainer } from '@/lib/infrastructure/container/DIContainer'
import { ConnectionCard } from './connections/ConnectionCard'
import { ConnectionForm } from './connections/ConnectionForm'
import { PromptExecutor } from './prompts/PromptExecutor'

interface DashboardProps {
  userId: string
}

export function Dashboard({ userId }: DashboardProps) {
  const connectionService = useMemo(() => DIContainer.getInstance().getConnectionService(), [])
  const hopeScoreCalculator = useMemo(() => DIContainer.getInstance().getHopeScoreCalculator(), [])
  
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
      // エラー時は空のデータで初期化
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
      // データを再読み込み
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
        // 編集モード
        const updatedConnection = await connectionService.updateConnection(editingConnection.id, data)
        setConnections(prev => prev.map(c => 
          c.id === editingConnection.id ? { ...c, ...data } : c
        ))
        alert('相手情報を更新しました')
      } else {
        // 新規追加モード
        const newConnection = await connectionService.createConnection(userId, data as any)
        setConnections(prev => [...prev, newConnection])
        alert('新しい相手を追加しました')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div data-testid="loading-spinner" className="mx-auto animate-spin rounded-full h-12 w-12 border-4 border-transparent gradient-primary"></div>
          <p className="text-gray-600 font-medium">恋愛の可能性を分析中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div data-testid="error-state" className="card max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">一時的な問題が発生しています</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
        <button
          onClick={() => loadDashboardData()}
          className="px-6 py-3 gradient-primary text-white font-semibold rounded-xl hover-lift transition-all"
        >
          再試行
        </button>
      </div>
    )
  }

  if (!dashboardData || connections.length === 0) {
    return (
      <div data-testid="empty-state" className="card max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center animate-heartbeat">
          <svg className="h-10 w-10 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold gradient-text mb-4">新しい恋愛ストーリーを始めましょう</h3>
        <p className="text-gray-600 mb-8 leading-relaxed text-lg">
          Miruと一緒に素敵な出会いをサポートしていきます。<br />
          気になる相手の情報を追加して、成功への道筋を見つけましょう！
        </p>
        <button
          onClick={handleAddConnection}
          className="px-8 py-4 gradient-primary text-white font-semibold rounded-xl hover-lift transition-all shadow-primary text-lg"
        >
          ✨ 最初の相手を追加する
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container space-y-8 py-8">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text">💕 恋愛ダッシュボード</h1>
            <p className="text-gray-600 text-lg">あなたの恋愛を成功に導くMiruのインサイト</p>
          </div>
          <button
            data-testid="add-connection-button"
            onClick={handleAddConnection}
            className="gradient-primary text-white px-6 py-3 rounded-xl hover-lift transition-all flex items-center gap-3 touch-manipulation min-h-[48px] w-full sm:w-auto justify-center font-semibold shadow-primary"
          >
            <span className="text-xl">+</span>
            <span className="hidden sm:inline">新しい相手を追加</span>
            <span className="sm:hidden">追加</span>
          </button>
        </div>

        {/* サマリー統計 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card hover-glow group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 flex-1">
                <p className="text-sm font-medium text-gray-600">総相手数</p>
                <div className="flex items-baseline">
                  <p data-testid="total-connections" className="text-3xl font-bold text-gray-900">
                    {dashboardData.totalConnections}
                  </p>
                  <p className="ml-2 text-sm text-gray-500">人</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-glow group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 flex-1">
                <p className="text-sm font-medium text-gray-600">アクティブな関係</p>
                <div className="flex items-baseline">
                  <p data-testid="active-connections" className="text-3xl font-bold text-gray-900">
                    {dashboardData.activeConnections}
                  </p>
                  <p className="ml-2 text-sm text-gray-500">進行中</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-glow group sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 flex-1">
                <p className="text-sm font-medium text-gray-600">平均スコア</p>
                <div className="flex items-baseline">
                  <p data-testid="average-score" className="text-3xl font-bold text-gray-900">
                    {dashboardData.averageScore || 0}
                  </p>
                  <p className="ml-2 text-sm text-gray-500">点</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* プログレス概要 */}
        <div data-testid="progress-overview" className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">今月の進展</h2>
          </div>
          <div className="space-y-6">
            {dashboardData.bestConnection && (
              <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 font-medium mb-2">🏆 最も有望な関係</p>
                    <p className="text-xl font-bold text-gray-900">{dashboardData.bestConnection.nickname}さん</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extrabold gradient-text">
                      {connectionService.calculateRelationshipScore(dashboardData.bestConnection)}
                    </div>
                    <p className="text-sm text-gray-600">スコア</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 推奨アクション */}
        <div data-testid="recommended-actions" className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">今すぐできること</h2>
          </div>
          <div className="space-y-4">
            {dashboardData.recommendedActions.map((action) => (
              <div
                key={action.id}
                className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{action.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{action.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      action.urgency === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                      action.urgency === 'high' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      action.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {action.urgency === 'critical' ? '🚨 緊急' :
                       action.urgency === 'high' ? '⚡ 高' :
                       action.urgency === 'medium' ? '⭐ 中' : '✅ 低'}
                    </span>
                    <button
                      onClick={() => handleGeneratePrompt(action.connection_id)}
                      className="gradient-primary text-white px-4 py-2 rounded-lg font-medium hover-lift transition-all touch-manipulation"
                    >
                      実行 →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 相手一覧 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">💖 あなたの恋愛相手</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>

      {/* モーダル */}
      {showConnectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="card max-w-4xl w-full max-h-[95vh] overflow-y-auto hover-lift">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingConnection ? `${editingConnection.nickname}さんの情報編集` : '✨ 新しい相手を追加'}
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
    </div>
  )
}
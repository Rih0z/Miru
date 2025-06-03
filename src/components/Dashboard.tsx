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
      <div className="min-h-screen bg-kawaii-dream flex items-center justify-center">
        <div className="text-center space-y-6 animate-bounceIn">
          <div className="relative">
            <div data-testid="loading-spinner" className="mx-auto w-20 h-20 rounded-full gradient-primary animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl animate-heartbeat">💕</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-kawaii-gradient animate-kawaii-pulse">恋愛の魔法を分析中...</p>
            <p className="text-pink-600 font-medium">✨ 素敵な出会いを見つけています ✨</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-kawaii-dream flex items-center justify-center p-4">
        <div data-testid="error-state" className="card-kawaii max-w-md mx-auto text-center py-12 animate-bounceIn">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-kawaii-soft flex items-center justify-center animate-wiggle">
            <span className="text-4xl">😢</span>
          </div>
          <h3 className="text-2xl font-bold text-kawaii-gradient mb-4">ちょっとした問題が起きちゃいました</h3>
          <p className="text-pink-600 mb-8 leading-relaxed font-medium">{error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="btn-kawaii px-8 py-4 text-lg hover-sparkle"
          >
            <span className="animate-heartbeat">💖</span> もう一度試してみる
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData || connections.length === 0) {
    return (
      <div className="min-h-screen bg-kawaii-dream flex items-center justify-center p-4">
        <div data-testid="empty-state" className="card-kawaii-magical max-w-2xl mx-auto text-center py-16 animate-bounceIn relative overflow-hidden">
          <div className="absolute top-4 right-4 animate-sparkle text-3xl">✨</div>
          <div className="absolute top-8 left-8 animate-float text-2xl">🌸</div>
          
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-kawaii-romantic flex items-center justify-center animate-heartbeat relative">
            <span className="text-6xl">💕</span>
            <div className="absolute inset-0 rounded-full border-4 border-pink-200 animate-pulse"></div>
          </div>
          
          <h3 className="text-4xl font-bold text-kawaii-gradient mb-6 animate-float">
            新しい恋愛の魔法を始めましょう ✨
          </h3>
          
          <div className="space-y-4 mb-10">
            <p className="text-pink-700 text-xl leading-relaxed font-medium">
              🌟 Miruと一緒に素敵な恋愛ストーリーを紡いでいきましょう 🌟
            </p>
            <p className="text-pink-600 text-lg leading-relaxed">
              気になる運命の人の情報を追加して、<br />
              愛に満ちた成功への魔法の道筋を見つけましょう！
            </p>
          </div>
          
          <button
            onClick={handleAddConnection}
            className="btn-kawaii px-12 py-6 text-xl hover-sparkle relative animate-kawaii-pulse"
          >
            <span className="animate-heartbeat">💖</span> 最初の運命の人を追加する <span className="animate-sparkle">✨</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-kawaii-dream">
      <div className="container space-y-8 py-8">
        {/* Kawaii ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-kawaii-gradient animate-float">
              🌸💕 恋愛ダッシュボード ✨
            </h1>
            <p className="text-gray-700 text-lg font-medium">
              あなたの素敵な恋愛を応援するMiruの魔法のインサイト 🪄
            </p>
          </div>
          <button
            data-testid="add-connection-button"
            onClick={handleAddConnection}
            className="btn-kawaii flex items-center gap-3 touch-manipulation min-h-[48px] w-full sm:w-auto justify-center hover-sparkle relative"
          >
            <span className="text-xl animate-heartbeat">💖</span>
            <span className="hidden sm:inline">新しい運命の人を追加</span>
            <span className="sm:hidden">追加</span>
          </button>
        </div>

        {/* Kawaii サマリー統計 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card-kawaii hover-kawaii group animate-bounceIn">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-3xl bg-kawaii-romantic flex items-center justify-center group-hover:scale-110 transition-transform animate-float heart-decoration">
                  <span className="text-3xl animate-kawaii-pulse">👥</span>
                </div>
              </div>
              <div className="ml-5 flex-1">
                <p className="text-sm font-semibold text-kawaii-gradient">出会った運命の人</p>
                <div className="flex items-baseline">
                  <p data-testid="total-connections" className="text-4xl font-extrabold text-kawaii-glow">
                    {dashboardData.totalConnections}
                  </p>
                  <p className="ml-2 text-sm text-pink-400 font-medium">人 💕</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-kawaii hover-kawaii group animate-bounceIn" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-3xl bg-kawaii-magical flex items-center justify-center group-hover:scale-110 transition-transform animate-float sparkle-decoration">
                  <span className="text-3xl animate-kawaii-pulse">🌟</span>
                </div>
              </div>
              <div className="ml-5 flex-1">
                <p className="text-sm font-semibold text-kawaii-gradient">進展中の関係</p>
                <div className="flex items-baseline">
                  <p data-testid="active-connections" className="text-4xl font-extrabold text-kawaii-glow">
                    {dashboardData.activeConnections}
                  </p>
                  <p className="ml-2 text-sm text-purple-400 font-medium">進行中 ✨</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-kawaii hover-kawaii group sm:col-span-2 lg:col-span-1 animate-bounceIn" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-3xl bg-kawaii-soft flex items-center justify-center group-hover:scale-110 transition-transform animate-float">
                  <span className="text-3xl animate-heartbeat">💖</span>
                </div>
              </div>
              <div className="ml-5 flex-1">
                <p className="text-sm font-semibold text-kawaii-gradient">愛情スコア平均</p>
                <div className="flex items-baseline">
                  <p data-testid="average-score" className="text-4xl font-extrabold text-kawaii-glow">
                    {dashboardData.averageScore || 0}
                  </p>
                  <p className="ml-2 text-sm text-pink-400 font-medium">点 💕</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kawaii プログレス概要 */}
        <div data-testid="progress-overview" className="card-kawaii-magical animate-fadeIn">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-kawaii-magical flex items-center justify-center animate-float">
              <span className="text-2xl animate-sparkle">📈</span>
            </div>
            <h2 className="text-3xl font-bold text-kawaii-gradient">今月の魔法の進展 ✨</h2>
          </div>
          <div className="space-y-8">
            {dashboardData.bestConnection && (
              <div className="p-6 bg-kawaii-romantic rounded-3xl border-2 border-pink-200 relative overflow-hidden hover-kawaii">
                <div className="absolute top-2 right-2 animate-sparkle text-2xl">✨</div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-600 font-bold mb-3 text-lg">👑 最も輝いている関係</p>
                    <p className="text-2xl font-extrabold text-kawaii-gradient">{dashboardData.bestConnection.nickname}さん 💕</p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-extrabold text-kawaii-glow animate-heartbeat">
                      {connectionService.calculateRelationshipScore(dashboardData.bestConnection)}
                    </div>
                    <p className="text-sm text-pink-500 font-semibold">愛情スコア 💖</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kawaii 推奨アクション */}
        <div data-testid="recommended-actions" className="card-kawaii animate-fadeIn">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-kawaii-soft flex items-center justify-center animate-wiggle">
              <span className="text-2xl">🪄</span>
            </div>
            <h2 className="text-3xl font-bold text-kawaii-gradient">今すぐできる魔法のアクション ✨</h2>
          </div>
          <div className="space-y-6">
            {dashboardData.recommendedActions.map((action, index) => (
              <div
                key={action.id}
                className="p-6 bg-kawaii-romantic rounded-2xl border-2 border-pink-100 hover-kawaii relative overflow-hidden animate-slideInRight"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="absolute top-2 right-2 animate-sparkle text-lg">
                  {action.urgency === 'critical' ? '🚨' :
                   action.urgency === 'high' ? '⚡' :
                   action.urgency === 'medium' ? '⭐' : '✨'}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-kawaii-gradient text-xl mb-3">{action.title}</h3>
                    <p className="text-gray-700 leading-relaxed font-medium">{action.description}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`badge-kawaii ${
                      action.urgency === 'critical' ? 'bg-gradient-to-r from-red-400 to-pink-400' :
                      action.urgency === 'high' ? 'bg-gradient-to-r from-orange-400 to-pink-400' :
                      action.urgency === 'medium' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                      'bg-gradient-to-r from-green-400 to-mint-400'
                    }`}>
                      {action.urgency === 'critical' ? '💝 超緊急' :
                       action.urgency === 'high' ? '💖 高優先' :
                       action.urgency === 'medium' ? '💕 中優先' : '🤍 低優先'}
                    </span>
                    <button
                      onClick={() => handleGeneratePrompt(action.connection_id)}
                      className="btn-kawaii-secondary hover-sparkle relative"
                    >
                      <span className="animate-heartbeat">💫</span> 実行する
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kawaii 相手一覧 */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-kawaii-dream flex items-center justify-center animate-float heart-decoration">
              <span className="text-2xl animate-heartbeat">💕</span>
            </div>
            <h2 className="text-3xl font-bold text-kawaii-gradient">💖 あなたの運命の人たち ✨</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection, index) => (
              <div 
                key={connection.id} 
                className="animate-bounceIn" 
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
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Connection, DashboardData, RecommendedAction } from '@/types'
import { ConnectionService } from '@/lib/connectionService'
import { ConnectionCard } from './connections/ConnectionCard'

interface DashboardProps {
  userId: string
}

export function Dashboard({ userId }: DashboardProps) {
  // Check if we're in demo mode - simplified for static generation
  const isDemoMode = true // Always use demo mode for static export
  
  const connectionService = useMemo(() => new ConnectionService(), [])
  
  // Initialize with demo data immediately for static export
  const demoConnections = useMemo(() => [
    {
      id: 'demo-1',
      user_id: userId,
      nickname: 'Aさん',
      platform: 'Pairs',
      current_stage: 'メッセージ中' as const,
      basic_info: { 
        age: 25, 
        occupation: 'エンジニア',
        hobbies: ['映画鑑賞', 'カフェ巡り']
      },
      communication: { 
        frequency: '毎日',
        lastContact: '2024-05-29',
        responseTime: '数時間以内'
      },
      user_feelings: { 
        expectations: '真剣な交際',
        attractivePoints: ['優しい', '話が面白い']
      },
      created_at: '2024-05-29T00:00:00Z',
      updated_at: '2024-05-29T00:00:00Z'
    },
    {
      id: 'demo-2',
      user_id: userId,
      nickname: 'Bさん',
      platform: 'with',
      current_stage: 'デート前' as const,
      basic_info: { 
        age: 28, 
        occupation: 'デザイナー',
        hobbies: ['読書', 'ヨガ', '料理']
      },
      communication: { 
        frequency: '2日に1回',
        lastContact: '2024-05-28',
        responseTime: '1日以内'
      },
      user_feelings: { 
        expectations: '楽しい関係',
        attractivePoints: ['センスが良い', '落ち着いている']
      },
      created_at: '2024-05-29T00:00:00Z',
      updated_at: '2024-05-29T00:00:00Z'
    }
  ], [userId])

  const initialDashboardData = useMemo(() => {
    const totalConnections = demoConnections.length
    const activeConnections = demoConnections.filter(
      conn => !['終了', '停滞中'].includes(conn.current_stage)
    ).length
    
    const scores = demoConnections.map(conn => 
      connectionService.calculateRelationshipScore(conn)
    )
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0
    
    const recommendedActions = demoConnections
      .filter(conn => !['終了'].includes(conn.current_stage))
      .map(conn => connectionService.getRecommendedAction(conn))
      .sort((a, b) => {
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
      })
      .slice(0, 3)

    const bestConnection = demoConnections.length > 0
      ? demoConnections.reduce((best, current) => {
          const currentScore = connectionService.calculateRelationshipScore(current)
          const bestScore = connectionService.calculateRelationshipScore(best)
          return currentScore > bestScore ? current : best
        })
      : null

    return {
      connections: demoConnections,
      totalConnections,
      activeConnections,
      recommendedActions,
      progressSummary: {
        overall_hope_score: averageScore,
        weekly_progress: 0,
        milestones_this_month: 0,
        best_connection: bestConnection ? {
          nickname: bestConnection.nickname,
          score: connectionService.calculateRelationshipScore(bestConnection)
        } : { nickname: '', score: 0 }
      }
    }
  }, [demoConnections, connectionService])
  
  const [isLoading, setIsLoading] = useState(!isDemoMode) // Start loaded if demo mode
  const [error, setError] = useState<string | null>(null)
  const [connections, setConnections] = useState<Connection[]>(isDemoMode ? demoConnections : [])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(isDemoMode ? initialDashboardData : null)

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, load data immediately without async call
      loadDemoData()
    } else {
      loadDashboardData()
    }
  }, [userId, connectionService, isDemoMode])

  const loadDemoData = () => {
    // Demo data - same as in supabase.ts but loaded synchronously
    const demoConnections = [
      {
        id: 'demo-1',
        user_id: userId,
        nickname: 'Aさん',
        platform: 'Pairs',
        current_stage: 'メッセージ中' as const,
        basic_info: { 
          age: 25, 
          occupation: 'エンジニア',
          hobbies: ['映画鑑賞', 'カフェ巡り']
        },
        communication: { 
          frequency: '毎日',
          lastContact: '2024-05-29',
          responseTime: '数時間以内'
        },
        user_feelings: { 
          expectations: '真剣な交際',
          attractivePoints: ['優しい', '話が面白い']
        },
        created_at: '2024-05-29T00:00:00Z',
        updated_at: '2024-05-29T00:00:00Z'
      },
      {
        id: 'demo-2',
        user_id: userId,
        nickname: 'Bさん',
        platform: 'with',
        current_stage: 'デート前' as const,
        basic_info: { 
          age: 28, 
          occupation: 'デザイナー',
          hobbies: ['読書', 'ヨガ', '料理']
        },
        communication: { 
          frequency: '2日に1回',
          lastContact: '2024-05-28',
          responseTime: '1日以内'
        },
        user_feelings: { 
          expectations: '楽しい関係',
          attractivePoints: ['センスが良い', '落ち着いている']
        },
        created_at: '2024-05-29T00:00:00Z',
        updated_at: '2024-05-29T00:00:00Z'
      }
    ]

    setConnections(demoConnections)
    
    // Calculate dashboard data synchronously
    const totalConnections = demoConnections.length
    const activeConnections = demoConnections.filter(
      conn => !['終了', '停滞中'].includes(conn.current_stage)
    ).length
    
    const scores = demoConnections.map(conn => 
      connectionService.calculateRelationshipScore(conn)
    )
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0
    
    const recommendedActions = demoConnections
      .filter(conn => !['終了'].includes(conn.current_stage))
      .map(conn => connectionService.getRecommendedAction(conn))
      .sort((a, b) => {
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
      })
      .slice(0, 3)

    const bestConnection = demoConnections.length > 0
      ? demoConnections.reduce((best, current) => {
          const currentScore = connectionService.calculateRelationshipScore(current)
          const bestScore = connectionService.calculateRelationshipScore(best)
          return currentScore > bestScore ? current : best
        })
      : null

    setDashboardData({
      connections: demoConnections,
      totalConnections,
      activeConnections,
      recommendedActions,
      progressSummary: {
        overall_hope_score: averageScore,
        weekly_progress: 0,
        milestones_this_month: 0,
        best_connection: bestConnection ? {
          nickname: bestConnection.nickname,
          score: connectionService.calculateRelationshipScore(bestConnection)
        } : { nickname: '', score: 0 }
      }
    })
    
    setIsLoading(false)
  }

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const userConnections = await connectionService.getUserConnections(userId)
      setConnections(userConnections)
      
      // ダッシュボードデータを計算
      const totalConnections = userConnections.length
      const activeConnections = userConnections.filter(
        conn => !['終了', '停滞中'].includes(conn.current_stage)
      ).length
      
      const scores = userConnections.map(conn => 
        connectionService.calculateRelationshipScore(conn)
      )
      const averageScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0
      
      const recommendedActions = userConnections
        .filter(conn => !['終了'].includes(conn.current_stage))
        .map(conn => connectionService.getRecommendedAction(conn))
        .sort((a, b) => {
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
        })
        .slice(0, 3) // 上位3つの推奨アクション

      const bestConnection = userConnections.length > 0
        ? userConnections.reduce((best, current) => {
            const currentScore = connectionService.calculateRelationshipScore(current)
            const bestScore = connectionService.calculateRelationshipScore(best)
            return currentScore > bestScore ? current : best
          })
        : null

      const newDashboardData = {
        connections: userConnections,
        totalConnections,
        activeConnections,
        recommendedActions,
        progressSummary: {
          overall_hope_score: averageScore,
          weekly_progress: 0, // TODO: 実装
          milestones_this_month: 0, // TODO: 実装
          best_connection: bestConnection ? {
            nickname: bestConnection.nickname,
            score: connectionService.calculateRelationshipScore(bestConnection)
          } : { nickname: '', score: 0 }
        }
      }
      
      setDashboardData(newDashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditConnection = (connection: Connection) => {
    alert(`${connection.nickname}さんの編集機能（開発中）\n\n現在のステージ: ${connection.current_stage}\nスコア: ${connectionService.calculateRelationshipScore(connection)}点`)
    console.log('Edit connection:', connection)
  }

  const handleDeleteConnection = async (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId)
    const confirmDelete = confirm(`${connection?.nickname}さんを削除しますか？`)
    
    if (!confirmDelete) return

    try {
      await connectionService.deleteConnection(connectionId)
      // デモモードでは実際には削除されないので、UIでシミュレート
      setConnections(prev => prev.filter(c => c.id !== connectionId))
      alert('削除しました（デモモード）')
    } catch (err) {
      setError('削除に失敗しました')
    }
  }

  const handleGeneratePrompt = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId)
    if (connection) {
      const action = connectionService.getRecommendedAction(connection)
      alert(`AIプロンプト生成（開発中）\n\n${action.title}\n\n${action.description}\n\n実装予定: ${action.prompt_type}`)
    }
    console.log('Generate prompt for:', connectionId)
  }

  const handleAddConnection = () => {
    alert('新しい相手の追加機能（開発中）\n\n実装予定:\n- 相手情報の入力フォーム\n- プロフィール画像のアップロード\n- マッチングアプリ連携')
    console.log('Add new connection')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div data-testid="error-state" className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">エラーが発生しました</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          再試行
        </button>
      </div>
    )
  }

  if (!dashboardData || connections.length === 0) {
    return (
      <div data-testid="empty-state" className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">まだ相手が登録されていません</h3>
        <p className="text-gray-600 mb-6">
          新しい相手を追加して、恋愛のサポートを始めましょう！
        </p>
        <button
          onClick={handleAddConnection}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          最初の相手を追加する
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">恋愛ダッシュボード</h1>
        <button
          data-testid="add-connection-button"
          onClick={handleAddConnection}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          新しい相手を追加
        </button>
      </div>

      {/* サマリー統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総相手数</p>
              <p data-testid="total-connections" className="text-2xl font-bold text-gray-900">
                {dashboardData.totalConnections}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブな関係</p>
              <p data-testid="active-connections" className="text-2xl font-bold text-gray-900">
                {dashboardData.activeConnections}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均スコア</p>
              <p data-testid="average-score" className="text-2xl font-bold text-gray-900">
                {dashboardData.progressSummary.overall_hope_score}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* プログレス概要 */}
      <div data-testid="progress-overview" className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">今月の進展</h2>
        <div className="space-y-4">
          {dashboardData.progressSummary.best_connection.nickname && (
            <div>
              <p className="text-sm text-gray-600">
                最も有望な関係: <span className="font-medium">{dashboardData.progressSummary.best_connection.nickname}</span>
                <span className="ml-2 text-blue-600 font-bold">
                  {dashboardData.progressSummary.best_connection.score}点
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 推奨アクション */}
      <div data-testid="recommended-actions" className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">今すぐできること</h2>
        <div className="space-y-3">
          {dashboardData.recommendedActions.map((action) => (
            <div
              key={action.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  action.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                  action.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                  action.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {action.urgency === 'critical' ? '緊急' :
                   action.urgency === 'high' ? '高' :
                   action.urgency === 'medium' ? '中' : '低'}
                </span>
                <button
                  onClick={() => handleGeneratePrompt(action.connection_id)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  実行 →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 相手一覧 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">相手一覧</h2>
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
    </div>
  )
}
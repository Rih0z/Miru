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
import { GlassCard } from './ui/GlassCard'
import { Modal } from './ui/Modal'
import { HeroText, Body } from './ui/Typography'
import { Spatial3DCard } from './ui/Spatial3D'
import { RippleButton } from './ui/MicroInteractions'
import { Heart, Plus, Download, Users, TrendingUp, Star, Sparkles, Activity, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [activeStatCard, setActiveStatCard] = useState<number | null>(null)

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
        alert('相手情報を更新しました')
      } else {
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

  const handleDataImportComplete = async (importedConnections: Connection[]) => {
    try {
      const updatedConnections = [...connections, ...importedConnections]
      setConnections(updatedConnections)
      await loadDashboardData()
      setShowDataImportModal(false)
      alert(`${importedConnections.length}件のコネクションがインポートされました！`)
    } catch (error) {
      console.error('インポート完了処理エラー:', error)
      alert('インポート完了処理でエラーが発生しました')
    }
  }

  if (loading) {
    return (
      <LoadingSpinner 
        fullScreen 
        message="恋愛コネクションを分析中..."
        submessage="あなたの理想のマッチを見つけています"
        variant="ai"
        
      />
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorState
          title="ちょっとした問題が発生しました"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    )
  }

  if (!dashboardData || connections.length === 0) {
    return (
      <EmptyState
        title="恋愛の旅を始めましょう"
        description="MiruがAIの力で素晴らしいコネクションを発見し、意味のある関係を築くお手伝いをします"
        
        primaryAction={{
          label: "手動で追加",
          onClick: handleAddConnection,
          icon: Plus
        }}
        secondaryAction={{
          label: "AI一括インポート",
          onClick: () => setShowDataImportModal(true),
          icon: Download
        }}
      />
    )
  }

  return (
    <div className="space-y-8 py-8 relative">
      {/* Ambient Effects */}
      {showSparkle && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10">
            <Sparkles className="w-6 h-6 text-accent-secondary animate-pulse" />
          </div>
          <div className="absolute top-40 right-20">
            <Heart className="w-5 h-5 text-accent-primary animate-pulse" />
          </div>
          <div className="absolute bottom-20 left-1/2">
            <Sparkles className="w-6 h-6 text-accent-info animate-pulse" />
          </div>
        </div>
      )}

      {/* Header */}
      <GlassCard variant="subtle" className="animate-slide-down">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6">
          <div className="space-y-3">
            <HeroText className="animate-fade-in">
              恋愛ダッシュボード
            </HeroText>
            <Body className="text-text-secondary">
              AIによる恋愛インサイト
            </Body>
          </div>
          
          <div className="flex gap-3">
            <RippleButton
              variant="primary"
              onClick={handleAddConnection}
              className="animate-slide-right flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">手動で追加</span>
            </RippleButton>
            <Button
              variant="secondary"
              onClick={() => setShowDataImportModal(true)}
              className="animate-slide-right flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">AIインポート</span>
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Spatial3DCard 
          depth="medium" 
          rotateOnHover 
          className={cn(
            "animate-scale-in cursor-pointer transition-all duration-300",
            activeStatCard === 0 && "scale-105"
          )}
          onMouseEnter={() => setActiveStatCard(0)}
          onMouseLeave={() => setActiveStatCard(null)}
        >
          <GlassCard variant="prominent" hover={true} className="h-full">
            <div className="flex items-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-accent-primary" />
              </div>
              <div className="ml-5 flex-1">
                <p className="text-sm font-semibold ai-text-gradient">コネクション</p>
                <div className="flex items-baseline">
                  <p className="text-4xl font-black text-text-primary">
                    {dashboardData.totalConnections}
                  </p>
                  <p className="ml-2 text-sm text-accent-primary font-medium">人</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </Spatial3DCard>

        <Spatial3DCard 
          depth="medium" 
          rotateOnHover 
          className={cn(
            "animate-scale-in cursor-pointer transition-all duration-300",
            activeStatCard === 1 && "scale-105"
          )}
          style={{ animationDelay: '100ms' }}
          onMouseEnter={() => setActiveStatCard(1)}
          onMouseLeave={() => setActiveStatCard(null)}
        >
          <GlassCard variant="prominent" hover={true} className="h-full">
            <div className="flex items-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-accent-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8 text-accent-success" />
              </div>
              <div className="ml-5 flex-1">
                <p className="text-sm font-semibold ai-text-gradient">アクティブ</p>
                <div className="flex items-baseline">
                  <p className="text-4xl font-black text-text-primary">
                    {dashboardData.activeConnections}
                  </p>
                  <p className="ml-2 text-sm text-accent-success font-medium">関係</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </Spatial3DCard>

        <Spatial3DCard 
          depth="medium" 
          rotateOnHover 
          className={cn(
            "animate-scale-in cursor-pointer transition-all duration-300",
            activeStatCard === 2 && "scale-105"
          )}
          style={{ animationDelay: '200ms' }}
          onMouseEnter={() => setActiveStatCard(2)}
          onMouseLeave={() => setActiveStatCard(null)}
        >
          <GlassCard variant="prominent" hover={true} className="h-full">
            <div className="flex items-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-accent-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-accent-warning" />
              </div>
              <div className="ml-5 flex-1">
                <p className="text-sm font-semibold ai-text-gradient">平均スコア</p>
                <div className="flex items-baseline">
                  <p className="text-4xl font-black text-text-primary">
                    {dashboardData.averageScore || 0}
                  </p>
                  <p className="ml-2 text-sm text-accent-warning font-medium">ポイント</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </Spatial3DCard>

        <Spatial3DCard 
          depth="medium" 
          rotateOnHover 
          className={cn(
            "animate-scale-in cursor-pointer transition-all duration-300",
            activeStatCard === 3 && "scale-105"
          )}
          style={{ animationDelay: '300ms' }}
          onMouseEnter={() => setActiveStatCard(3)}
          onMouseLeave={() => setActiveStatCard(null)}
        >
          <GlassCard variant="prominent" hover={true} className="h-full">
            <div className="flex items-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-accent-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-accent-secondary" />
              </div>
              <div className="ml-5 flex-1">
                <p className="text-sm font-semibold ai-text-gradient">ベストマッチ</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-black text-text-primary">
                    {dashboardData.bestConnection ? '発見' : 'なし'}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </Spatial3DCard>
      </div>

      {/* Best Connection */}
      {dashboardData.bestConnection && (
        <Spatial3DCard depth="deep" rotateOnHover floatAnimation className="animate-slide-up">
          <GlassCard variant="prominent" blur="heavy" className="relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6 p-6 pb-0">
              <div className="w-3 h-3 bg-ai-gradient rounded-full animate-pulse"></div>
              <h2 className="text-xl font-bold ai-text-gradient">
                最も有望なコネクション
              </h2>
            </div>
            <div className="flex items-center justify-between p-6 pt-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-ai-gradient rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                  {dashboardData.bestConnection.nickname[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-1">{dashboardData.bestConnection.nickname}</h3>
                  <p className="text-sm text-text-secondary">
                    スコア: <span className="font-bold text-accent-primary">{connectionService.calculateRelationshipScore(dashboardData.bestConnection)}</span> ポイント
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-8 h-8 text-accent-primary animate-pulse" />
                <Sparkles className="w-6 h-6 text-accent-secondary animate-spin-slow" />
              </div>
            </div>
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-ai-gradient opacity-5 pointer-events-none" />
          </GlassCard>
        </Spatial3DCard>
      )}

      {/* Connections List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-ai-gradient rounded-full" />
          <h2 className="text-2xl font-bold ai-text-gradient">
            あなたのコネクション
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection, index) => (
            <div 
              key={connection.id} 
              className="animate-scale-in" 
              style={{ animationDelay: `${index * 100}ms` }}
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

      {/* Modals */}
      <Modal
        isOpen={showConnectionForm}
        onClose={handleFormCancel}
        title={editingConnection ? `${editingConnection.nickname}を編集` : '新しいコネクションを追加'}
        variant="glass"
        
        className="max-h-[80vh] overflow-y-auto"
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
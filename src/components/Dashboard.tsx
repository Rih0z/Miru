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
import { Heart, Plus, Download, Users, TrendingUp, Star, Sparkles } from 'lucide-react'

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
        message="Analyzing love connections..."
        submessage="Finding your perfect match"
        variant="heart"
        size="lg"
      />
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorState
          title="Something minor happened"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    )
  }

  if (!dashboardData || connections.length === 0) {
    return (
      <EmptyState
        title="Start Your Love Journey"
        description="Let Miru help you discover amazing connections and build meaningful relationships with AI-powered insights"
        icon={Heart}
        primaryAction={{
          label: "Add Manually",
          onClick: handleAddConnection,
          icon: Plus
        }}
        secondaryAction={{
          label: "AI Bulk Import",
          onClick: () => setShowDataImportModal(true),
          icon: Download
        }}
      />
    )
  }

  return (
    <div className="space-y-8 py-8">
      {/* Sparkle effects */}
      {showSparkle && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10">
            <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
          </div>
          <div className="absolute top-40 right-20">
            <Heart className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div className="absolute bottom-20 left-1/2">
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Love Dashboard
          </h1>
          <p className="text-gray-700 text-lg font-medium">
            Your romantic insights powered by AI
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleAddConnection}
            icon={Plus}
          >
            <span className="hidden sm:inline">Add Manually</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowDataImportModal(true)}
            icon={Download}
          >
            <span className="hidden sm:inline">AI Import</span>
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="kawaii" hover className="animate-bounceIn">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-3xl bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-pink-500" />
            </div>
            <div className="ml-5 flex-1">
              <p className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Connections</p>
              <div className="flex items-baseline">
                <p className="text-4xl font-extrabold text-gray-800">
                  {dashboardData.totalConnections}
                </p>
                <p className="ml-2 text-sm text-pink-400 font-medium">people</p>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="magical" hover className="animate-bounceIn">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-3xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <div className="ml-5 flex-1">
              <p className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Active</p>
              <div className="flex items-baseline">
                <p className="text-4xl font-extrabold text-gray-800">
                  {dashboardData.activeConnections}
                </p>
                <p className="ml-2 text-sm text-purple-400 font-medium">relationships</p>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="soft" hover className="animate-bounceIn">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-3xl bg-yellow-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="ml-5 flex-1">
              <p className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Average Score</p>
              <div className="flex items-baseline">
                <p className="text-4xl font-extrabold text-gray-800">
                  {dashboardData.averageScore || 0}
                </p>
                <p className="ml-2 text-sm text-yellow-400 font-medium">points</p>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="romantic" hover className="animate-bounceIn">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-3xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8 text-green-500" />
            </div>
            <div className="ml-5 flex-1">
              <p className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Best Match</p>
              <div className="flex items-baseline">
                <p className="text-4xl font-extrabold text-gray-800">
                  {dashboardData.bestConnection ? 'Found' : 'None'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Best Connection */}
      {dashboardData.bestConnection && (
        <Card variant="magical" className="animate-fadeIn">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Most Promising Connection
            </h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {dashboardData.bestConnection.nickname[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{dashboardData.bestConnection.nickname}</h3>
                <p className="text-sm text-gray-600">Score: {connectionService.calculateRelationshipScore(dashboardData.bestConnection)} points</p>
              </div>
            </div>
            <Heart className="w-8 h-8 text-pink-500 animate-pulse" />
          </div>
        </Card>
      )}

      {/* Connections List */}
      <div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-6">
          Your Connections
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

      {/* Modals */}
      <Modal
        isOpen={showConnectionForm}
        onClose={handleFormCancel}
        title={editingConnection ? `Edit ${editingConnection.nickname}` : 'Add New Connection'}
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
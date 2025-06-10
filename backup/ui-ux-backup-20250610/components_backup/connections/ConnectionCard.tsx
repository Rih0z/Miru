'use client'

import React, { useMemo } from 'react'
import { Connection } from '@/types'
import { ConnectionService } from '@/lib/connectionService'
import { 
  Calendar, 
  AlertCircle, 
  ChevronRight, 
  Zap, 
  Target,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  Lightbulb
} from 'lucide-react'

interface ConnectionCardProps {
  connection: Connection
  onEdit: (connection: Connection) => void
  onDelete: (connectionId: string) => void
  onGeneratePrompt: (connectionId: string) => void
}

export function ConnectionCard({ 
  connection, 
  onEdit, 
  onDelete, 
  onGeneratePrompt 
}: ConnectionCardProps) {
  const connectionService = useMemo(() => new ConnectionService(), [])
  const score = useMemo(() => connectionService.calculateRelationshipScore(connection), [connection, connectionService])
  const recommendedAction = useMemo(() => connectionService.getRecommendedAction(connection), [connection, connectionService])

  // ステージプログレス計算
  const getProgressWidth = (stage: string) => {
    const progress: Record<string, number> = {
      'マッチング直後': 14,
      'メッセージ中': 28,
      'LINE交換済み': 42,
      'デート前': 56,
      'デート後': 70,
      '交際中': 85,
      '停滞中': 20,
      '終了': 100
    }
    return progress[stage] || 0
  }

  // ステージカラー
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'マッチング直後': 'purple',
      'メッセージ中': 'blue',
      'LINE交換済み': 'green',
      'デート前': 'yellow',
      'デート後': 'pink',
      '交際中': 'pink',
      '停滞中': 'gray',
      '終了': 'gray'
    }
    return colors[stage] || 'gray'
  }

  const stageColor = getStageColor(connection.current_stage)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
            {connection.nickname[0]}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{connection.nickname}さん</h3>
            <p className="text-sm text-gray-600">{connection.platform}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(connection)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="編集"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(connection.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="削除"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* ステージとスコア */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${stageColor}-100 text-${stageColor}-700`}>
          {connection.current_stage}
        </span>
        <div className="flex items-center gap-2">
          <Target className="text-purple-500" size={16} />
          <span className="text-sm font-semibold text-gray-700">愛情度: {score}点</span>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="mb-4">
        <div className="relative">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500"
              style={{ width: `${getProgressWidth(connection.current_stage)}%` }}
            />
          </div>
          {/* 目盛り */}
          <div className="absolute top-0 left-0 w-full h-3 flex justify-between px-1">
            {[20, 40, 60, 80].map(mark => (
              <div key={mark} className="w-0.5 h-full bg-white" style={{ marginLeft: `${mark}%` }} />
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>出会い</span>
          <span>恋愛成就</span>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="space-y-2 mb-4">
        {connection.basic_info.age && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} className="text-gray-400" />
            <span>{connection.basic_info.age}歳</span>
          </div>
        )}
        {connection.basic_info.occupation && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target size={14} className="text-gray-400" />
            <span>{connection.basic_info.occupation}</span>
          </div>
        )}
        {connection.communication.lastContact && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={14} className="text-gray-400" />
            <span>最終連絡: {connection.communication.lastContact}</span>
          </div>
        )}
      </div>

      {/* 趣味タグ */}
      {connection.basic_info.hobbies && connection.basic_info.hobbies.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {connection.basic_info.hobbies.map((hobby, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 推奨アクション */}
      <div className="mb-4">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-purple-500" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-800">{recommendedAction.title}</p>
              <p className="text-xs text-gray-600">{recommendedAction.description}</p>
            </div>
          </div>
          <ChevronRight className="text-purple-600" size={20} />
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button
          onClick={() => onGeneratePrompt(connection.id)}
          className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
        >
          <Lightbulb size={16} />
          AIプロンプト生成
        </button>
        <button
          onClick={() => onEdit(connection)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium transition-all duration-300 hover:bg-gray-200"
        >
          詳細
        </button>
      </div>
    </div>
  )
}
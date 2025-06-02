'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Connection } from '@/types'
import { ConnectionService } from '@/lib/connectionService'

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
  
  // Calculate score immediately for static export
  const calculatedScore = useMemo(() => 
    connectionService.calculateRelationshipScore(connection), 
    [connection, connectionService]
  )
  
  const [score, setScore] = useState<number>(calculatedScore)

  // スコアを計算 (fallback for non-static environments)
  useEffect(() => {
    const newScore = connectionService.calculateRelationshipScore(connection)
    setScore(newScore)
  }, [connection, connectionService])

  // 推奨アクションを取得
  const recommendedAction = useMemo(() => 
    connectionService.getRecommendedAction(connection), 
    [connection, connectionService]
  )

  // ステージに応じた色を決定
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'マッチング直後': 'bg-blue-100 text-blue-800',
      'メッセージ中': 'bg-green-100 text-green-800',
      'LINE交換済み': 'bg-yellow-100 text-yellow-800',
      'デート前': 'bg-purple-100 text-purple-800',
      'デート後': 'bg-pink-100 text-pink-800',
      '交際中': 'bg-red-100 text-red-800',
      '停滞中': 'bg-gray-100 text-gray-800',
      '終了': 'bg-gray-100 text-gray-500'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  // プログレスバーの幅を計算
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

  return (
    <div className="card hover-glow group animate-fadeIn">
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-start mb-5">
        <div className="min-w-0 flex-1 mr-3">
          <h3 className="text-xl font-bold text-gray-900 truncate mb-1">{connection.nickname}</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <p className="text-sm text-gray-600">{connection.platform}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            data-testid="edit-button"
            onClick={() => onEdit(connection)}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-all flex items-center justify-center touch-manipulation group-hover:scale-110"
            title="編集"
          >
            ✏️
          </button>
          <button
            data-testid="delete-button"
            onClick={() => onDelete(connection.id)}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all flex items-center justify-center touch-manipulation group-hover:scale-110"
            title="削除"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* ステージバッジとスコア */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStageColor(connection.current_stage)} border shadow-sm`}>
          {connection.current_stage}
        </span>
        <div 
          data-testid="relationship-score"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-100"
        >
          <span className="text-sm text-gray-600">💖 スコア</span>
          <span className="font-bold text-xl gradient-text">{score}</span>
        </div>
      </div>

      {/* プログレス表示 */}
      <div data-testid="progress-indicator" className="mb-5">
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <div 
            className="gradient-primary h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${getProgressWidth(connection.current_stage)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>出会い</span>
          <span>恋愛成就</span>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="mb-5 bg-gray-50 rounded-xl p-4 space-y-3">
        {connection.basic_info.age && (
          <div className="flex items-center gap-2">
            <span className="text-lg">🎂</span>
            <span className="text-sm text-gray-600 font-medium">{connection.basic_info.age}歳</span>
          </div>
        )}
        {connection.basic_info.occupation && (
          <div className="flex items-center gap-2">
            <span className="text-lg">💼</span>
            <span className="text-sm text-gray-600 font-medium">{connection.basic_info.occupation}</span>
          </div>
        )}
        {connection.communication.lastContact && (
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <span className="text-sm text-gray-600 font-medium">{connection.communication.lastContact}</span>
          </div>
        )}
      </div>

      {/* 趣味タグ */}
      {connection.basic_info.hobbies && connection.basic_info.hobbies.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">共通の話題</h4>
          <div className="flex flex-wrap gap-2">
            {connection.basic_info.hobbies.map((hobby, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200"
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 推奨アクション */}
      <div data-testid="recommended-action" className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💡</span>
          <h4 className="text-sm font-semibold text-blue-900">次のステップ</h4>
        </div>
        <p className="text-sm text-blue-800 font-medium mb-1">{recommendedAction.title}</p>
        <p className="text-xs text-blue-600 line-clamp-2">{recommendedAction.description}</p>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          data-testid="generate-prompt-button"
          onClick={() => onGeneratePrompt(connection.id)}
          className="flex-1 gradient-primary text-white py-3 px-4 rounded-xl font-semibold hover-lift transition-all touch-manipulation shadow-primary"
        >
          🤖 AIに相談する
        </button>
        <button
          onClick={() => onEdit(connection)}
          className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all font-semibold text-gray-700 touch-manipulation sm:flex-shrink-0"
        >
          📝 詳細
        </button>
      </div>
    </div>
  )
}
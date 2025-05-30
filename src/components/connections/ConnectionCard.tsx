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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{connection.nickname}</h3>
          <p className="text-sm text-gray-600">{connection.platform}</p>
        </div>
        <div className="flex gap-2">
          <button
            data-testid="edit-button"
            onClick={() => onEdit(connection)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="編集"
          >
            ✏️
          </button>
          <button
            data-testid="delete-button"
            onClick={() => onDelete(connection.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="削除"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* ステージバッジとスコア */}
      <div className="flex justify-between items-center mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(connection.current_stage)}`}>
          {connection.current_stage}
        </span>
        <div 
          data-testid="relationship-score"
          className="flex items-center gap-2"
        >
          <span className="text-sm text-gray-600">スコア</span>
          <span className="font-bold text-lg text-blue-600">{score}</span>
        </div>
      </div>

      {/* プログレス表示 */}
      <div data-testid="progress-indicator" className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressWidth(connection.current_stage)}%` }}
          ></div>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="mb-4 space-y-2">
        {connection.basic_info.age && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">年齢:</span> {connection.basic_info.age}歳
          </p>
        )}
        {connection.basic_info.occupation && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">職業:</span> {connection.basic_info.occupation}
          </p>
        )}
        {connection.communication.lastContact && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">最後の連絡:</span> {connection.communication.lastContact}
          </p>
        )}
      </div>

      {/* 趣味タグ */}
      {connection.basic_info.hobbies && connection.basic_info.hobbies.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {connection.basic_info.hobbies.map((hobby, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 推奨アクション */}
      <div data-testid="recommended-action" className="mb-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-1">推奨アクション</h4>
        <p className="text-sm text-blue-800">{recommendedAction.title}</p>
        <p className="text-xs text-blue-600 mt-1">{recommendedAction.description}</p>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-2">
        <button
          data-testid="generate-prompt-button"
          onClick={() => onGeneratePrompt(connection.id)}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          AIに相談する
        </button>
        <button
          onClick={() => onEdit(connection)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          詳細
        </button>
      </div>
    </div>
  )
}
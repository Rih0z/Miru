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
    <div className="card-kawaii hover-kawaii group animate-fadeIn relative overflow-hidden">
      {/* Kawaii デコレーション */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-kawaii-soft rounded-bl-3xl opacity-30"></div>
      <div className="absolute -top-2 -right-2 text-2xl animate-sparkle">✨</div>
      
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="min-w-0 flex-1 mr-3">
          <h3 className="text-2xl font-bold text-kawaii-gradient truncate mb-2">{connection.nickname}さん 💕</h3>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-kawaii-pink animate-kawaii-pulse"></span>
            <p className="text-sm text-pink-600 font-medium">{connection.platform} ✨</p>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            data-testid="edit-button"
            onClick={() => onEdit(connection)}
            className="w-12 h-12 rounded-2xl bg-kawaii-soft hover:bg-kawaii-pink text-pink-600 hover:text-white transition-all flex items-center justify-center touch-manipulation group-hover:scale-110 hover-bounce"
            title="編集"
          >
            <span className="text-lg">✏️</span>
          </button>
          <button
            data-testid="delete-button"
            onClick={() => onDelete(connection.id)}
            className="w-12 h-12 rounded-2xl bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-600 transition-all flex items-center justify-center touch-manipulation group-hover:scale-110 hover-bounce"
            title="削除"
          >
            <span className="text-lg">🗑️</span>
          </button>
        </div>
      </div>

      {/* Kawaii ステージバッジとスコア */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <span className="badge-kawaii-magical text-white font-bold px-6 py-3 text-base">
          💝 {connection.current_stage}
        </span>
        <div 
          data-testid="relationship-score"
          className="flex items-center gap-3 bg-kawaii-romantic px-6 py-3 rounded-2xl border-2 border-pink-200 hover-kawaii"
        >
          <span className="text-sm text-pink-600 font-bold">💖 愛情スコア</span>
          <span className="font-extrabold text-2xl text-kawaii-gradient animate-heartbeat">{score}</span>
        </div>
      </div>

      {/* Kawaii プログレス表示 */}
      <div data-testid="progress-indicator" className="mb-6">
        <div className="w-full bg-pink-100 rounded-full h-4 shadow-inner relative overflow-hidden">
          <div 
            className="gradient-primary h-4 rounded-full transition-all duration-700 shadow-kawaii-glow relative"
            style={{ width: `${getProgressWidth(connection.current_stage)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between mt-3 text-sm text-pink-500 font-medium">
          <span>💕 出会い</span>
          <span>💖 恋愛成就</span>
        </div>
      </div>

      {/* Kawaii 基本情報 */}
      <div className="mb-6 bg-kawaii-soft rounded-2xl p-5 space-y-4 border border-pink-100">
        {connection.basic_info.age && (
          <div className="flex items-center gap-3">
            <span className="text-xl animate-float">🎂</span>
            <span className="text-base text-pink-700 font-semibold">{connection.basic_info.age}歳の素敵な人</span>
          </div>
        )}
        {connection.basic_info.occupation && (
          <div className="flex items-center gap-3">
            <span className="text-xl animate-float">💼</span>
            <span className="text-base text-pink-700 font-semibold">{connection.basic_info.occupation}</span>
          </div>
        )}
        {connection.communication.lastContact && (
          <div className="flex items-center gap-3">
            <span className="text-xl animate-heartbeat">💬</span>
            <span className="text-base text-pink-700 font-semibold">最後のお話: {connection.communication.lastContact}</span>
          </div>
        )}
      </div>

      {/* Kawaii 趣味タグ */}
      {connection.basic_info.hobbies && connection.basic_info.hobbies.length > 0 && (
        <div className="mb-6">
          <h4 className="text-base font-bold text-kawaii-gradient mb-4">💫 共通の魔法の話題</h4>
          <div className="flex flex-wrap gap-3">
            {connection.basic_info.hobbies.map((hobby, index) => (
              <span
                key={index}
                className="badge-kawaii-soft hover-kawaii px-4 py-2 text-sm animate-bounceIn"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                ✨ {hobby}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Kawaii 推奨アクション */}
      <div data-testid="recommended-action" className="mb-6 p-5 bg-kawaii-magical rounded-2xl border-2 border-purple-200 hover-kawaii relative overflow-hidden">
        <div className="absolute top-2 right-2 animate-sparkle text-lg">🌟</div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl animate-wiggle">🪄</span>
          <h4 className="text-base font-bold text-kawaii-gradient">次の魔法のステップ</h4>
        </div>
        <p className="text-base text-purple-800 font-bold mb-2">💫 {recommendedAction.title}</p>
        <p className="text-sm text-purple-700 line-clamp-2 font-medium">{recommendedAction.description}</p>
      </div>

      {/* Kawaii アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          data-testid="generate-prompt-button"
          onClick={() => onGeneratePrompt(connection.id)}
          className="flex-1 btn-kawaii hover-sparkle relative py-4 px-6 text-lg"
        >
          <span className="animate-heartbeat">🤖</span> AIの魔法で相談する ✨
        </button>
        <button
          onClick={() => onEdit(connection)}
          className="px-6 py-4 bg-white border-2 border-pink-200 rounded-2xl hover:border-pink-300 hover:bg-pink-50 transition-all font-bold text-pink-600 touch-manipulation sm:flex-shrink-0 hover-bounce"
        >
          <span className="animate-float">📝</span> 詳細を見る
        </button>
      </div>
    </div>
  )
}
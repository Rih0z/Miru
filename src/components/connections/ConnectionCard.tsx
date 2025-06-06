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
  
  const calculatedScore = useMemo(() => 
    connectionService.calculateRelationshipScore(connection), 
    [connection, connectionService]
  )
  
  const [score, setScore] = useState<number>(calculatedScore)

  useEffect(() => {
    const newScore = connectionService.calculateRelationshipScore(connection)
    setScore(newScore)
  }, [connection, connectionService])

  const recommendedAction = useMemo(() => 
    connectionService.getRecommendedAction(connection), 
    [connection, connectionService]
  )

  // 温度スコア計算
  const getTemperatureClass = (score: number) => {
    if (score >= 75) return 'badge-hot'
    if (score >= 40) return 'badge-warm'
    return 'badge-cool'
  }

  const getTemperatureEmoji = (score: number) => {
    if (score >= 75) return '🔥'
    if (score >= 40) return '🌟'
    return '❄️'
  }

  const getStageEmoji = (stage: string) => {
    const stageEmojis: Record<string, string> = {
      'マッチング直後': '✨',
      'メッセージ中': '💬',
      'LINE交換済み': '📱',
      'デート前': '💕',
      'デート後': '💖',
      '交際中': '💝',
      '停滞中': '⏸️',
      '終了': '💔'
    }
    return stageEmojis[stage] || '💫'
  }

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
    <div className="card-kawaii hover-kawaii animate-kawaii-fade-in relative overflow-hidden">
      {/* 装飾要素 */}
      <div className="absolute top-4 right-4 animate-kawaii-sparkle text-2xl">✨</div>
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-romantic rounded-full opacity-30"></div>
      
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="min-w-0 flex-1 mr-3">
          <h3 className="title-kawaii text-2xl mb-2 animate-kawaii-float">{connection.nickname}さん</h3>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-gradient-dreamy animate-kawaii-heartbeat"></span>
            <p className="kawaii-text text-sm font-medium">{connection.platform}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onEdit(connection)}
            className="w-12 h-12 rounded-kawaii bg-gradient-romantic hover:bg-gradient-magical transition-all flex items-center justify-center hover-kawaii"
            title="編集"
          >
            <span className="text-lg">✏️</span>
          </button>
          <button
            onClick={() => onDelete(connection.id)}
            className="w-12 h-12 rounded-kawaii bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-600 transition-all flex items-center justify-center hover-kawaii"
            title="削除"
          >
            <span className="text-lg">🗑️</span>
          </button>
        </div>
      </div>

      {/* ステージとスコア */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <span className="badge-kawaii flex items-center gap-2 px-4 py-2">
          <span className="animate-kawaii-float">{getStageEmoji(connection.current_stage)}</span>
          {connection.current_stage}
        </span>
        <div className={`badge-kawaii ${getTemperatureClass(score)} flex items-center gap-2 px-4 py-2`}>
          <span className="animate-kawaii-heartbeat">{getTemperatureEmoji(score)}</span>
          愛情度: {score}点
        </div>
      </div>

      {/* プログレス表示 */}
      <div className="mb-6">
        <div className="progress-kawaii">
          <div 
            className="h-full bg-gradient-dreamy rounded-full transition-all duration-700 relative"
            style={{ width: `${getProgressWidth(connection.current_stage)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-kawaii-float"></div>
          </div>
        </div>
        <div className="flex justify-between mt-3 text-sm kawaii-text">
          <span>💕 出会い</span>
          <span>💖 恋愛成就</span>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="mb-6 p-4 bg-gradient-romantic rounded-kawaii-xl space-y-3">
        {connection.basic_info.age && (
          <div className="flex items-center gap-3">
            <span className="text-xl animate-kawaii-float">🎂</span>
            <span className="kawaii-text font-semibold">{connection.basic_info.age}歳の素敵な人</span>
          </div>
        )}
        {connection.basic_info.occupation && (
          <div className="flex items-center gap-3">
            <span className="text-xl animate-kawaii-float">💼</span>
            <span className="kawaii-text font-semibold">{connection.basic_info.occupation}</span>
          </div>
        )}
        {connection.communication.lastContact && (
          <div className="flex items-center gap-3">
            <span className="text-xl animate-kawaii-heartbeat">💬</span>
            <span className="kawaii-text font-semibold">最後のお話: {connection.communication.lastContact}</span>
          </div>
        )}
      </div>

      {/* 趣味タグ */}
      {connection.basic_info.hobbies && connection.basic_info.hobbies.length > 0 && (
        <div className="mb-6">
          <h4 className="kawaii-subtitle text-base mb-3 flex items-center gap-2">
            <span className="animate-kawaii-sparkle">💫</span>
            共通の魔法の話題
          </h4>
          <div className="flex flex-wrap gap-2">
            {connection.basic_info.hobbies.map((hobby, index) => (
              <span
                key={index}
                className="badge-kawaii text-xs px-3 py-1 animate-kawaii-bounce"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                ✨ {hobby}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 推奨アクション */}
      <div className="mb-6 p-4 bg-gradient-magical rounded-kawaii-xl hover-kawaii relative overflow-hidden">
        <div className="absolute top-2 right-2 animate-kawaii-sparkle text-lg">🌟</div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl animate-kawaii-float">🪄</span>
          <h4 className="kawaii-subtitle text-base">次の魔法のステップ</h4>
        </div>
        <p className="kawaii-text font-bold mb-2 flex items-center gap-2">
          <span className="animate-kawaii-sparkle">💫</span>
          {recommendedAction.title}
        </p>
        <p className="kawaii-text text-sm line-clamp-2">{recommendedAction.description}</p>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onGeneratePrompt(connection.id)}
          className="flex-1 btn-kawaii hover-kawaii"
        >
          <span className="animate-kawaii-heartbeat">🤖</span> 
          AIの魔法で相談する
        </button>
        <button
          onClick={() => onEdit(connection)}
          className="btn-kawaii bg-temp-warm hover-kawaii"
        >
          <span className="animate-kawaii-float">📝</span> 
          詳細
        </button>
      </div>

      {/* 装飾ハート */}
      <div className="absolute -bottom-4 -left-4 text-6xl opacity-10 animate-kawaii-heartbeat pointer-events-none">
        💕
      </div>
    </div>
  )
}
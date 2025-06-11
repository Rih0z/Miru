'use client'

import React, { useMemo } from 'react'
import { Connection } from '@/types'
import { ConnectionService } from '@/lib/connectionService'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { BrutalButton } from '../ui/BrutalButton'
import { RelationshipProgress } from '../ui/ProgressBar'
import { Spatial3DCard } from '../ui/Spatial3D'
import { RippleButton } from '../ui/MicroInteractions'
import { Body, Caption } from '../ui/Typography'
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
  Lightbulb,
  Heart,
  Sparkles,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

  // ステージスタイリング（モダンデザイン対応）
  const getStageConfig = (stage: string) => {
    const configs: Record<string, { variant: string; icon: React.ReactNode }> = {
      'マッチング直後': { variant: 'accent-secondary', icon: <Sparkles className="w-3 h-3" /> },
      'メッセージ中': { variant: 'accent-info', icon: <Target className="w-3 h-3" /> },
      'LINE交換済み': { variant: 'accent-success', icon: <CheckCircle2 className="w-3 h-3" /> },
      'デート前': { variant: 'accent-warning', icon: <Clock className="w-3 h-3" /> },
      'デート後': { variant: 'accent-primary', icon: <Heart className="w-3 h-3" /> },
      '交際中': { variant: 'accent-primary', icon: <Star className="w-3 h-3" /> },
      '停滞中': { variant: 'text-muted', icon: <Zap className="w-3 h-3" /> },
      '終了': { variant: 'text-muted', icon: <AlertCircle className="w-3 h-3" /> }
    }
    return configs[stage] || { variant: 'text-muted', icon: <Target className="w-3 h-3" /> }
  }

  const stageConfig = getStageConfig(connection.current_stage)

  return (
    <Spatial3DCard depth="medium" rotateOnHover className="h-full">
      <GlassCard 
        variant="prominent" 
        hover={true} 
        className="h-full flex flex-col"
      >
        <div className="p-6 flex-1">
          {/* ヘッダー */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-ai-gradient rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                {connection.nickname[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">{connection.nickname}さん</h3>
                <Caption className="text-text-secondary">{connection.platform}</Caption>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(connection)}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  'text-text-muted hover:text-accent-info hover:bg-accent-info/10',
                  'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent-info'
                )}
                title="編集"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(connection.id)}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  'text-text-muted hover:text-accent-error hover:bg-accent-error/10',
                  'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent-error'
                )}
                title="削除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* ステージとスコア */}
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-xl',
              'border border-glass-20 bg-glass-5 backdrop-blur-sm'
            )}>
              <span className={`text-${stageConfig.variant}`}>
                {stageConfig.icon}
              </span>
              <Caption className={`font-medium text-${stageConfig.variant}`}>
                {connection.current_stage}
              </Caption>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                <Target className="text-accent-primary" size={12} />
              </div>
              <Caption className="font-bold ai-text-gradient">
                愛情度: {score}点
              </Caption>
            </div>
          </div>

          {/* プログレスバー */}
          <div className="mb-4">
            <RelationshipProgress 
              progress={getProgressWidth(connection.current_stage)}
              showLabel
              
              showPercentage={false}
              className="mb-2"
            />
            <div className="flex justify-between">
              <Caption className="text-text-muted">出会い</Caption>
              <Caption className="text-text-muted">恋愛成就</Caption>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="space-y-2 mb-4">
            {connection.basic_info.age && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-glass-10 flex items-center justify-center">
                  <Calendar size={12} className="text-text-muted" />
                </div>
                <Caption className="text-text-secondary">{connection.basic_info.age}歳</Caption>
              </div>
            )}
            {connection.basic_info.occupation && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-glass-10 flex items-center justify-center">
                  <Target size={12} className="text-text-muted" />
                </div>
                <Caption className="text-text-secondary">{connection.basic_info.occupation}</Caption>
              </div>
            )}
            {connection.communication.lastContact && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-glass-10 flex items-center justify-center">
                  <Clock size={12} className="text-text-muted" />
                </div>
                <Caption className="text-text-secondary">最終連絡: {connection.communication.lastContact}</Caption>
              </div>
            )}
          </div>

          {/* 趣味タグ */}
          {connection.basic_info.hobbies && connection.basic_info.hobbies.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {connection.basic_info.hobbies.slice(0, 3).map((hobby, index) => (
                  <div
                    key={index}
                    className={cn(
                      'px-3 py-1 rounded-xl text-xs font-medium',
                      'bg-accent-secondary/10 text-accent-secondary',
                      'border border-accent-secondary/20'
                    )}
                  >
                    {hobby}
                  </div>
                ))}
                {connection.basic_info.hobbies.length > 3 && (
                  <div className="px-3 py-1 rounded-xl text-xs font-medium bg-glass-10 text-text-muted border border-glass-20">
                    +{connection.basic_info.hobbies.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 推奨アクション */}
          <div className="mb-6">
            <div className={cn(
              'flex items-center justify-between p-3 rounded-xl',
              'bg-glass-5 border border-glass-20 backdrop-blur-sm',
              'hover:bg-glass-10 transition-all duration-200'
            )}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent-warning/10 flex items-center justify-center">
                  <Lightbulb className="text-accent-warning" size={16} />
                </div>
                <div>
                  <Body className="font-medium text-text-primary text-sm">{recommendedAction.title}</Body>
                  <Caption className="text-text-muted">{recommendedAction.description}</Caption>
                </div>
              </div>
              <ChevronRight className="text-accent-primary" size={16} />
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 mt-auto">
            <RippleButton
              onClick={() => onGeneratePrompt(connection.id)}
              variant="primary"
              className="flex-1 flex items-center gap-2"
            >
              <Lightbulb size={14} />
              AIプロンプト
            </RippleButton>
            <Button
              onClick={() => onEdit(connection)}
              variant="ghost"
              
              className="px-4"
            >
              詳細
            </Button>
          </div>
        </div>
      </GlassCard>
    </Spatial3DCard>
  )
}
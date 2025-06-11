'use client'

import React, { useState } from 'react'
import { Connection, ConnectionStage } from '@/types'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { RippleButton } from '../ui/MicroInteractions'
import { HeroText, Body, Caption } from '../ui/Typography'
import { 
  User, 
  MessageCircle, 
  Heart, 
  Plus, 
  X, 
  Calendar,
  Briefcase,
  MapPin,
  Clock,
  Star,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConnectionFormProps {
  onSubmit: (data: Partial<Connection>) => void
  onCancel: () => void
  initialData?: Connection
}

export function ConnectionForm({ onSubmit, onCancel, initialData }: ConnectionFormProps) {
  const [formData, setFormData] = useState({
    nickname: initialData?.nickname || '',
    platform: initialData?.platform || '',
    current_stage: initialData?.current_stage || 'マッチング直後' as ConnectionStage,
    basic_info: {
      age: initialData?.basic_info?.age || undefined,
      occupation: initialData?.basic_info?.occupation || '',
      location: initialData?.basic_info?.location || '',
      hobbies: initialData?.basic_info?.hobbies || []
    },
    communication: {
      frequency: initialData?.communication?.frequency || '',
      lastContact: initialData?.communication?.lastContact || '',
      responseTime: initialData?.communication?.responseTime || ''
    },
    user_feelings: {
      expectations: initialData?.user_feelings?.expectations || '',
      attractivePoints: initialData?.user_feelings?.attractivePoints || [],
      concerns: initialData?.user_feelings?.concerns || []
    }
  })

  const [newHobby, setNewHobby] = useState('')
  const [newAttractivePoint, setNewAttractivePoint] = useState('')
  const [newConcern, setNewConcern] = useState('')

  const stages: ConnectionStage[] = [
    'マッチング直後',
    'メッセージ中',
    'LINE交換済み',
    'デート前',
    'デート後',
    '交際中',
    '停滞中',
    '終了'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addHobby = () => {
    if (newHobby.trim()) {
      setFormData({
        ...formData,
        basic_info: {
          ...formData.basic_info,
          hobbies: [...formData.basic_info.hobbies, newHobby.trim()]
        }
      })
      setNewHobby('')
    }
  }

  const removeHobby = (index: number) => {
    setFormData({
      ...formData,
      basic_info: {
        ...formData.basic_info,
        hobbies: formData.basic_info.hobbies.filter((_, i) => i !== index)
      }
    })
  }

  const addAttractivePoint = () => {
    if (newAttractivePoint.trim()) {
      setFormData({
        ...formData,
        user_feelings: {
          ...formData.user_feelings,
          attractivePoints: [...formData.user_feelings.attractivePoints, newAttractivePoint.trim()]
        }
      })
      setNewAttractivePoint('')
    }
  }

  const addConcern = () => {
    if (newConcern.trim()) {
      setFormData({
        ...formData,
        user_feelings: {
          ...formData.user_feelings,
          concerns: [...formData.user_feelings.concerns, newConcern.trim()]
        }
      })
      setNewConcern('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 基本情報セクション */}
      <GlassCard variant="prominent" className="animate-slide-up">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-ai-gradient flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <HeroText className="text-xl">基本情報</HeroText>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <User className="w-4 h-4" />
                ニックネーム *
              </Caption>
              <input
                type="text"
                required
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary',
                  'hover:border-glass-30 placeholder:text-text-muted text-text-primary'
                )}
                placeholder="Aさん、B子さん など"
              />
            </div>

            <div className="space-y-3">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <Heart className="w-4 h-4" />
                出会った場所 *
              </Caption>
              <input
                type="text"
                required
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary',
                  'hover:border-glass-30 placeholder:text-text-muted text-text-primary'
                )}
                placeholder="Pairs、with、Omiai など"
              />
            </div>

            <div className="space-y-3">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <Star className="w-4 h-4" />
                現在のステージ *
              </Caption>
              <select
                value={formData.current_stage}
                onChange={(e) => setFormData({ ...formData, current_stage: e.target.value as ConnectionStage })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary',
                  'hover:border-glass-30 text-text-primary'
                )}
              >
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                年齢
              </Caption>
              <input
                type="number"
                value={formData.basic_info.age || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  basic_info: { ...formData.basic_info, age: e.target.value ? parseInt(e.target.value) : undefined }
                })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary',
                  'hover:border-glass-30 placeholder:text-text-muted text-text-primary'
                )}
                placeholder="25"
              />
            </div>

            <div className="space-y-3">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                職業
              </Caption>
              <input
                type="text"
                value={formData.basic_info.occupation}
                onChange={(e) => setFormData({
                  ...formData,
                  basic_info: { ...formData.basic_info, occupation: e.target.value }
                })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary',
                  'hover:border-glass-30 placeholder:text-text-muted text-text-primary'
                )}
                placeholder="エンジニア、デザイナー など"
              />
            </div>

            <div className="space-y-3">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                居住地
              </Caption>
              <input
                type="text"
                value={formData.basic_info.location || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  basic_info: { ...formData.basic_info, location: e.target.value }
                })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary',
                  'hover:border-glass-30 placeholder:text-text-muted text-text-primary'
                )}
                placeholder="東京都、大阪府 など"
              />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Caption className="font-medium text-text-primary">
              趣味・興味
            </Caption>
            <div className="flex gap-3">
              <input
                type="text"
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-secondary focus:border-accent-secondary',
                  'hover:border-glass-30 placeholder:text-text-muted text-text-primary'
                )}
                placeholder="映画鑑賞、カフェ巡り など"
              />
              <Button
                type="button"
                onClick={addHobby}
                variant="secondary"
                
                
              >
                追加
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {formData.basic_info.hobbies.map((hobby, index) => (
                <div
                  key={index}
                  className={cn(
                    'px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2',
                    'bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20'
                  )}
                >
                  {hobby}
                  <button
                    type="button"
                    onClick={() => removeHobby(index)}
                    className="text-accent-secondary/70 hover:text-accent-error transition-colors p-1 -m-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* コミュニケーションセクション */}
      <GlassCard variant="prominent" className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-accent-info/20 flex items-center justify-center border border-accent-info/30">
              <MessageCircle className="w-5 h-5 text-accent-info" />
            </div>
            <HeroText className="text-xl ai-text-gradient">コミュニケーション状況</HeroText>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <Clock className="w-4 h-4" />
                連絡頻度
              </Caption>
              <select
                value={formData.communication.frequency}
                onChange={(e) => setFormData({
                  ...formData,
                  communication: { ...formData.communication, frequency: e.target.value }
                })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-info focus:border-accent-info',
                  'hover:border-glass-30 text-text-primary'
                )}
              >
                <option value="">選択してください</option>
                <option value="毎日">毎日</option>
                <option value="2日に1回">2日に1回</option>
                <option value="週2-3回">週2-3回</option>
                <option value="週1回">週1回</option>
                <option value="月数回">月数回</option>
                <option value="不定期">不定期</option>
              </select>
            </div>

            <div className="space-y-3">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                最後の連絡
              </Caption>
              <input
                type="date"
                value={formData.communication.lastContact}
                onChange={(e) => setFormData({
                  ...formData,
                  communication: { ...formData.communication, lastContact: e.target.value }
                })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-info focus:border-accent-info',
                  'hover:border-glass-30 text-text-primary'
                )}
              />
            </div>

            <div className="space-y-3">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                返信速度
              </Caption>
              <select
                value={formData.communication.responseTime}
                onChange={(e) => setFormData({
                  ...formData,
                  communication: { ...formData.communication, responseTime: e.target.value }
                })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-info focus:border-accent-info',
                  'hover:border-glass-30 text-text-primary'
                )}
              >
                <option value="">選択してください</option>
                <option value="即レス">即レス</option>
                <option value="数時間以内">数時間以内</option>
                <option value="1日以内">1日以内</option>
                <option value="2-3日">2-3日</option>
                <option value="1週間以上">1週間以上</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 気持ちセクション */}
      <GlassCard variant="prominent" className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-accent-primary/20 flex items-center justify-center border border-accent-primary/30">
              <Heart className="w-5 h-5 text-accent-primary" />
            </div>
            <HeroText className="text-xl ai-text-gradient">あなたの気持ち</HeroText>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-3">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <Heart className="w-4 h-4" />
                関係性への期待
              </Caption>
              <select
                value={formData.user_feelings.expectations}
                onChange={(e) => setFormData({
                  ...formData,
                  user_feelings: { ...formData.user_feelings, expectations: e.target.value }
                })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl transition-all duration-200',
                  'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary',
                  'hover:border-glass-30 text-text-primary'
                )}
              >
                <option value="">選択してください</option>
                <option value="真剣な交際">真剣な交際</option>
                <option value="楽しい関係">楽しい関係</option>
                <option value="友達から始めたい">友達から始めたい</option>
                <option value="まだわからない">まだわからない</option>
                <option value="カジュアルな関係">カジュアルな関係</option>
              </select>
            </div>

            <div className="space-y-4">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <Star className="w-4 h-4" />
                魅力を感じるポイント
              </Caption>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newAttractivePoint}
                  onChange={(e) => setNewAttractivePoint(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttractivePoint())}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-xl transition-all duration-200',
                    'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                    'focus:outline-none focus:ring-2 focus:ring-accent-success focus:border-accent-success',
                    'hover:border-glass-30 placeholder:text-text-muted text-text-primary'
                  )}
                  placeholder="優しい、話が面白い など"
                />
                <Button
                  type="button"
                  onClick={addAttractivePoint}
                  variant="secondary"
                  
                  
                >
                  追加
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                {formData.user_feelings.attractivePoints.map((point, index) => (
                  <div
                    key={index}
                    className={cn(
                      'px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2',
                      'bg-accent-success/10 text-accent-success border border-accent-success/20'
                    )}
                  >
                    <Star className="w-3 h-3" /> {point}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        user_feelings: {
                          ...formData.user_feelings,
                          attractivePoints: formData.user_feelings.attractivePoints.filter((_, i) => i !== index)
                        }
                      })}
                      className="text-accent-success/70 hover:text-accent-error transition-colors p-1 -m-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Caption className="font-medium text-text-primary flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                気になる点・不安
              </Caption>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newConcern}
                  onChange={(e) => setNewConcern(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConcern())}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-xl transition-all duration-200',
                    'bg-glass-5 border border-glass-20 backdrop-blur-sm',
                    'focus:outline-none focus:ring-2 focus:ring-accent-warning focus:border-accent-warning',
                    'hover:border-glass-30 placeholder:text-text-muted text-text-primary'
                  )}
                  placeholder="返信が遅い、価値観の違い など"
                />
                <Button
                  type="button"
                  onClick={addConcern}
                  variant="secondary"
                  
                  
                >
                  追加
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                {formData.user_feelings.concerns?.map((concern, index) => (
                  <div
                    key={index}
                    className={cn(
                      'px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2',
                      'bg-accent-warning/10 text-accent-warning border border-accent-warning/20'
                    )}
                  >
                    <AlertTriangle className="w-3 h-3" /> {concern}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        user_feelings: {
                          ...formData.user_feelings,
                          concerns: formData.user_feelings.concerns?.filter((_, i) => i !== index) || []
                        }
                      })}
                      className="text-accent-warning/70 hover:text-accent-error transition-colors p-1 -m-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          
          className="px-8 order-2 sm:order-1"
        >
          キャンセル
        </Button>
        <RippleButton
          type="submit"
          variant="primary"
          className="px-8 py-3 order-1 sm:order-2 flex items-center gap-2"
        >
          {initialData ? <Star className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {initialData ? '更新する' : '登録する'}
        </RippleButton>
      </div>
    </form>
  )
}
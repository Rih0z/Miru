'use client'

import React, { useState } from 'react'
import { Connection, ConnectionStage } from '@/types'

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
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div className="card hover-glow animate-fadeIn">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold gradient-text">基本情報</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ニックネーム *
            </label>
            <input
              type="text"
              required
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-all text-base hover:border-gray-300"
              placeholder="Aさん、B子さん など"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              出会った場所 *
            </label>
            <input
              type="text"
              required
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-all text-base hover:border-gray-300"
              placeholder="Pairs、with、Omiai など"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              現在のステージ *
            </label>
            <select
              value={formData.current_stage}
              onChange={(e) => setFormData({ ...formData, current_stage: e.target.value as ConnectionStage })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-all text-base hover:border-gray-300 bg-white"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              年齢
            </label>
            <input
              type="number"
              value={formData.basic_info.age || ''}
              onChange={(e) => setFormData({
                ...formData,
                basic_info: { ...formData.basic_info, age: e.target.value ? parseInt(e.target.value) : undefined }
              })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-all text-base hover:border-gray-300"
              placeholder="25"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              職業
            </label>
            <input
              type="text"
              value={formData.basic_info.occupation}
              onChange={(e) => setFormData({
                ...formData,
                basic_info: { ...formData.basic_info, occupation: e.target.value }
              })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-all text-base hover:border-gray-300"
              placeholder="エンジニア、デザイナー など"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              居住地
            </label>
            <input
              type="text"
              value={formData.basic_info.location || ''}
              onChange={(e) => setFormData({
                ...formData,
                basic_info: { ...formData.basic_info, location: e.target.value }
              })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-all text-base hover:border-gray-300"
              placeholder="東京都、大阪府 など"
            />
          </div>
        </div>

        <div className="mt-6 sm:mt-8 space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            趣味・興味
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-all text-base hover:border-gray-300"
              placeholder="映画鑑賞、カフェ巡り など"
            />
            <button
              type="button"
              onClick={addHobby}
              className="px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover-lift transition-all touch-manipulation whitespace-nowrap shadow-primary"
            >
              追加
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {formData.basic_info.hobbies.map((hobby, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200 flex items-center gap-2"
              >
                {hobby}
                <button
                  type="button"
                  onClick={() => removeHobby(index)}
                  className="text-purple-600 hover:text-red-500 active:text-red-700 touch-manipulation p-1 -m-1 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card hover-glow animate-fadeIn">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg gradient-secondary flex items-center justify-center">
            <span className="text-lg">💬</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold gradient-text">コミュニケーション状況</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              連絡頻度
            </label>
            <select
              value={formData.communication.frequency}
              onChange={(e) => setFormData({
                ...formData,
                communication: { ...formData.communication, frequency: e.target.value }
              })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary-400 transition-all text-base hover:border-gray-300 bg-white"
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

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              最後の連絡
            </label>
            <input
              type="date"
              value={formData.communication.lastContact}
              onChange={(e) => setFormData({
                ...formData,
                communication: { ...formData.communication, lastContact: e.target.value }
              })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary-400 transition-all text-base hover:border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              返信速度
            </label>
            <select
              value={formData.communication.responseTime}
              onChange={(e) => setFormData({
                ...formData,
                communication: { ...formData.communication, responseTime: e.target.value }
              })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary-400 transition-all text-base hover:border-gray-300 bg-white"
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

      <div className="card hover-glow animate-fadeIn">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center">
            <span className="text-lg">💖</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold gradient-text">あなたの気持ち</h2>
        </div>
        
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              関係性への期待
            </label>
            <select
              value={formData.user_feelings.expectations}
              onChange={(e) => setFormData({
                ...formData,
                user_feelings: { ...formData.user_feelings, expectations: e.target.value }
              })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-success-400 transition-all text-base hover:border-gray-300 bg-white"
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
            <label className="block text-sm font-semibold text-gray-700">
              魅力を感じるポイント
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={newAttractivePoint}
                onChange={(e) => setNewAttractivePoint(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttractivePoint())}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-success-400 transition-all text-base hover:border-gray-300"
                placeholder="優しい、話が面白い など"
              />
              <button
                type="button"
                onClick={addAttractivePoint}
                className="px-6 py-3 gradient-success text-white rounded-xl font-semibold hover-lift transition-all touch-manipulation whitespace-nowrap shadow-success"
              >
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {formData.user_feelings.attractivePoints.map((point, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-medium border border-green-200 flex items-center gap-2"
                >
                  ✨ {point}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      user_feelings: {
                        ...formData.user_feelings,
                        attractivePoints: formData.user_feelings.attractivePoints.filter((_, i) => i !== index)
                      }
                    })}
                    className="text-green-600 hover:text-red-500 touch-manipulation p-1 -m-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              気になる点・不安
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={newConcern}
                onChange={(e) => setNewConcern(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConcern())}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-caution transition-all text-base hover:border-gray-300"
                placeholder="返信が遅い、価値観の違い など"
              />
              <button
                type="button"
                onClick={addConcern}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover-lift transition-all touch-manipulation whitespace-nowrap"
              >
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {formData.user_feelings.concerns?.map((concern, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 rounded-full text-sm font-medium border border-orange-200 flex items-center gap-2"
                >
                  ⚠️ {concern}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      user_feelings: {
                        ...formData.user_feelings,
                        concerns: formData.user_feelings.concerns?.filter((_, i) => i !== index) || []
                      }
                    })}
                    className="text-orange-600 hover:text-red-500 active:text-red-700 touch-manipulation p-1 -m-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-4 sm:gap-6 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-all font-semibold text-gray-700 touch-manipulation order-2 sm:order-1 min-h-[48px] hover-lift"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-8 py-3 gradient-primary text-white rounded-xl font-bold hover-lift transition-all touch-manipulation order-1 sm:order-2 min-h-[48px] shadow-primary"
        >
          {initialData ? '✨ 更新する' : '💫 登録する'}
        </button>
      </div>
    </form>
  )
}
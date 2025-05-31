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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">基本情報</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ニックネーム *
            </label>
            <input
              type="text"
              required
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Aさん、B子さん など"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              出会った場所 *
            </label>
            <input
              type="text"
              required
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pairs、with、Omiai など"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              現在のステージ *
            </label>
            <select
              value={formData.current_stage}
              onChange={(e) => setFormData({ ...formData, current_stage: e.target.value as ConnectionStage })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              年齢
            </label>
            <input
              type="number"
              value={formData.basic_info.age || ''}
              onChange={(e) => setFormData({
                ...formData,
                basic_info: { ...formData.basic_info, age: e.target.value ? parseInt(e.target.value) : undefined }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              職業
            </label>
            <input
              type="text"
              value={formData.basic_info.occupation}
              onChange={(e) => setFormData({
                ...formData,
                basic_info: { ...formData.basic_info, occupation: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="エンジニア、デザイナー など"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              居住地
            </label>
            <input
              type="text"
              value={formData.basic_info.location || ''}
              onChange={(e) => setFormData({
                ...formData,
                basic_info: { ...formData.basic_info, location: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="東京都、大阪府 など"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            趣味・興味
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="映画鑑賞、カフェ巡り など"
            />
            <button
              type="button"
              onClick={addHobby}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              追加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.basic_info.hobbies.map((hobby, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
              >
                {hobby}
                <button
                  type="button"
                  onClick={() => removeHobby(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">コミュニケーション状況</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              連絡頻度
            </label>
            <select
              value={formData.communication.frequency}
              onChange={(e) => setFormData({
                ...formData,
                communication: { ...formData.communication, frequency: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最後の連絡
            </label>
            <input
              type="date"
              value={formData.communication.lastContact}
              onChange={(e) => setFormData({
                ...formData,
                communication: { ...formData.communication, lastContact: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              返信速度
            </label>
            <select
              value={formData.communication.responseTime}
              onChange={(e) => setFormData({
                ...formData,
                communication: { ...formData.communication, responseTime: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">あなたの気持ち</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              関係性への期待
            </label>
            <select
              value={formData.user_feelings.expectations}
              onChange={(e) => setFormData({
                ...formData,
                user_feelings: { ...formData.user_feelings, expectations: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              <option value="真剣な交際">真剣な交際</option>
              <option value="楽しい関係">楽しい関係</option>
              <option value="友達から始めたい">友達から始めたい</option>
              <option value="まだわからない">まだわからない</option>
              <option value="カジュアルな関係">カジュアルな関係</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              魅力を感じるポイント
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAttractivePoint}
                onChange={(e) => setNewAttractivePoint(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttractivePoint())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="優しい、話が面白い など"
              />
              <button
                type="button"
                onClick={addAttractivePoint}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.user_feelings.attractivePoints.map((point, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                >
                  {point}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      user_feelings: {
                        ...formData.user_feelings,
                        attractivePoints: formData.user_feelings.attractivePoints.filter((_, i) => i !== index)
                      }
                    })}
                    className="text-green-600 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              気になる点・不安
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newConcern}
                onChange={(e) => setNewConcern(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConcern())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="返信が遅い、価値観の違い など"
              />
              <button
                type="button"
                onClick={addConcern}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.user_feelings.concerns?.map((concern, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-2"
                >
                  {concern}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      user_feelings: {
                        ...formData.user_feelings,
                        concerns: formData.user_feelings.concerns?.filter((_, i) => i !== index) || []
                      }
                    })}
                    className="text-yellow-600 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {initialData ? '更新する' : '登録する'}
        </button>
      </div>
    </form>
  )
}
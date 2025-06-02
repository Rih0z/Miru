'use client'

import React, { useState, useMemo } from 'react'
import { Connection } from '@/types'
import { DIContainer } from '@/lib/infrastructure/container/DIContainer'

interface PromptExecutorProps {
  connection: Connection
  promptType: string
  onClose: () => void
}

type AIType = 'claude' | 'gpt' | 'gemini'

export function PromptExecutor({ connection, promptType, onClose }: PromptExecutorProps) {
  const [selectedAI, setSelectedAI] = useState<AIType>('claude')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [copied, setCopied] = useState(false)

  const promptGenerator = useMemo(() => DIContainer.getInstance().getPromptGenerator(), [])

  // プロンプト生成
  React.useEffect(() => {
    const prompt = generatePromptForType(promptType, selectedAI)
    setGeneratedPrompt(prompt)
  }, [promptType, selectedAI, connection])

  const generatePromptForType = (type: string, ai: AIType): string => {
    switch (type) {
      case 'first_message':
        return promptGenerator.generateFirstMessagePrompt(connection, ai)
      case 'deepen_conversation':
        return promptGenerator.generateConversationPrompt(connection, ai)
      case 'date_preparation':
        return promptGenerator.generateDatePrompt(connection, ai)
      case 'relationship_building':
        return promptGenerator.generateRelationshipPrompt(connection, ai)
      default:
        return promptGenerator.generateGeneralPrompt(connection, ai)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました', err)
    }
  }

  const handleAIResponse = () => {
    // ここでAIからの返答を処理
    // 実際の実装では、保存やアクション履歴への追加を行う
    alert('AIからの回答を保存しました')
    onClose()
  }

  const aiProviders = [
    { id: 'claude' as AIType, name: 'Claude', icon: '🤖', description: '慎重で分析的なアドバイス' },
    { id: 'gpt' as AIType, name: 'ChatGPT', icon: '💬', description: 'クリエイティブで多様な提案' },
    { id: 'gemini' as AIType, name: 'Gemini', icon: '✨', description: 'データに基づく実践的なアドバイス' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
      <div className="card max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden hover-lift shadow-2xl">
        <div className="p-6 sm:p-8 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold gradient-text">AIプロンプト実行</h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {connection.nickname}さんに関するアドバイスを取得します
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-all flex items-center justify-center touch-manipulation hover-lift"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-280px)] custom-scrollbar space-y-8">
          {/* AI選択 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-secondary flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold gradient-text">使用するAIを選択</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {aiProviders.map((ai) => (
                <button
                  key={ai.id}
                  onClick={() => setSelectedAI(ai.id)}
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition-all touch-manipulation hover-lift text-left ${
                    selectedAI === ai.id
                      ? 'border-primary-400 bg-gradient-to-br from-primary-50 to-orange-50 shadow-primary'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl mb-3">{ai.icon}</div>
                  <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-2">{ai.name}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{ai.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 生成されたプロンプト */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center">
                  <span className="text-lg">📝</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold gradient-text">生成されたプロンプト</h3>
              </div>
              <button
                onClick={copyToClipboard}
                className={`px-6 py-3 rounded-xl font-semibold transition-all touch-manipulation hover-lift ${
                  copied
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-success'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? '✓ コピーしました' : '📋 コピー'}
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
              <pre className="whitespace-pre-wrap text-sm overflow-x-auto leading-relaxed">{generatedPrompt}</pre>
            </div>
          </div>

          {/* 実行手順 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-secondary flex items-center justify-center">
                <span className="text-lg">🚀</span>
              </div>
              <h4 className="text-lg font-bold text-blue-900">実行手順</h4>
            </div>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2">
              <li>上記のプロンプトをコピー</li>
              <li>{selectedAI === 'claude' ? 'Claude' : selectedAI === 'gpt' ? 'ChatGPT' : 'Gemini'}を開く</li>
              <li>プロンプトを貼り付けて実行</li>
              <li>得られた回答を下記に貼り付け</li>
            </ol>
          </div>

          {/* AIからの回答入力 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-lg text-white">🤔</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold gradient-text">AIからの回答</h3>
            </div>
            <textarea
              value={aiResponse}
              onChange={(e) => setAiResponse(e.target.value)}
              placeholder="AIから得られた回答を貼り付けてください..."
              className="w-full h-48 sm:h-64 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400 transition-all text-base leading-relaxed bg-white hover:border-gray-300"
            />
          </div>

          {/* アクションプラン */}
          {aiResponse && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center">
                  <span className="text-lg">⚡</span>
                </div>
                <h4 className="text-lg font-bold text-green-900">次のアクション</h4>
              </div>
              <p className="text-sm text-green-800 mb-4 leading-relaxed">
                AIのアドバイスに基づいて、以下のアクションを実行しましょう：
              </p>
              <ul className="list-disc list-inside text-sm text-green-700 space-y-2">
                <li>メッセージの送信タイミングを検討</li>
                <li>提案された話題を準備</li>
                <li>相手の反応を観察して記録</li>
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-col sm:flex-row justify-end gap-4 sm:gap-6">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-semibold text-gray-700 touch-manipulation order-2 sm:order-1 min-h-[48px] hover-lift"
            >
              キャンセル
            </button>
            <button
              onClick={handleAIResponse}
              disabled={!aiResponse}
              className={`px-8 py-3 rounded-xl font-bold transition-all touch-manipulation order-1 sm:order-2 min-h-[48px] ${
                aiResponse
                  ? 'gradient-primary text-white hover-lift shadow-primary'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {aiResponse ? '✨ 保存して完了' : '💭 回答を入力してください'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
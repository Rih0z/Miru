'use client'

import React, { useState, useMemo } from 'react'
import { Connection } from '@/types'
import { DIContainer } from '@/lib/infrastructure/container/DIContainer'
import { X, Copy, Check, Sparkles, Target, Zap, FileText } from 'lucide-react'

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">AIプロンプト実行</h2>
              <p className="text-gray-600">
                {connection.nickname}さんに関するアドバイスを取得します
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {/* AI選択 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Target size={20} className="text-purple-500" />
              使用するAIを選択
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {aiProviders.map((ai) => (
                <button
                  key={ai.id}
                  onClick={() => setSelectedAI(ai.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedAI === ai.id
                      ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{ai.icon}</div>
                  <h4 className="font-bold text-gray-800 mb-1">{ai.name}</h4>
                  <p className="text-sm text-gray-600">{ai.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 生成されたプロンプト */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-purple-500" />
                生成されたプロンプト
              </h3>
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    コピーしました
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    コピー
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <pre className="whitespace-pre-wrap text-sm">{generatedPrompt}</pre>
            </div>
          </div>

          {/* 実行手順 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Zap size={20} className="text-purple-500" />
              実行手順
            </h4>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
              <li>上記のプロンプトをコピー</li>
              <li>{selectedAI === 'claude' ? 'Claude' : selectedAI === 'gpt' ? 'ChatGPT' : 'Gemini'}を開く</li>
              <li>プロンプトを貼り付けて実行</li>
              <li>得られた回答を下記に貼り付け</li>
            </ol>
          </div>

          {/* AIからの回答入力 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">AIからの回答</h3>
            <textarea
              value={aiResponse}
              onChange={(e) => setAiResponse(e.target.value)}
              placeholder="AIから得られた回答を貼り付けてください..."
              className="w-full h-48 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          {/* アクションプラン */}
          {aiResponse && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <Sparkles size={20} />
                次のアクション
              </h4>
              <p className="text-sm text-green-700 mb-3">
                AIのアドバイスに基づいて、以下のアクションを実行しましょう：
              </p>
              <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                <li>メッセージの送信タイミングを検討</li>
                <li>提案された話題を準備</li>
                <li>相手の反応を観察して記録</li>
              </ul>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            onClick={onClose}
            variant="ghost"
            size="lg"
            className="px-8"
          >
            キャンセル
          </Button>
          <RippleButton
            onClick={handleAIResponse}
            disabled={!aiResponse || isExecuting}
            variant="primary"
            size="lg"
            className="px-8"
            icon={isExecuting ? <LoadingSpinner size="sm" className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            glow
          >
            {isExecuting ? '保存中...' : '保存して完了'}
          </RippleButton>
        </div>
      </div>
    </Modal>
  )
}
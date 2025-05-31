'use client'

import React, { useState } from 'react'
import { Connection } from '@/types'
import { PromptGenerator } from '@/lib/promptGenerator'

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

  const promptGenerator = new PromptGenerator()

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">AIプロンプト実行</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {connection.nickname}さんに関するアドバイスを取得します
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* AI選択 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">使用するAIを選択</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiProviders.map((ai) => (
                <button
                  key={ai.id}
                  onClick={() => setSelectedAI(ai.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedAI === ai.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{ai.icon}</div>
                  <h4 className="font-semibold">{ai.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{ai.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 生成されたプロンプト */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">生成されたプロンプト</h3>
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg transition-all ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? '✓ コピーしました' : 'コピー'}
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{generatedPrompt}</pre>
            </div>
          </div>

          {/* 実行手順 */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">実行手順</h4>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>上記のプロンプトをコピー</li>
              <li>{selectedAI === 'claude' ? 'Claude' : selectedAI === 'gpt' ? 'ChatGPT' : 'Gemini'}を開く</li>
              <li>プロンプトを貼り付けて実行</li>
              <li>得られた回答を下記に貼り付け</li>
            </ol>
          </div>

          {/* AIからの回答入力 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">AIからの回答</h3>
            <textarea
              value={aiResponse}
              onChange={(e) => setAiResponse(e.target.value)}
              placeholder="AIから得られた回答を貼り付けてください..."
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* アクションプラン */}
          {aiResponse && (
            <div className="mb-6 bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">次のアクション</h4>
              <p className="text-sm text-green-800">
                AIのアドバイスに基づいて、以下のアクションを実行しましょう：
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-green-700 space-y-1">
                <li>メッセージの送信タイミングを検討</li>
                <li>提案された話題を準備</li>
                <li>相手の反応を観察して記録</li>
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-white"
            >
              キャンセル
            </button>
            <button
              onClick={handleAIResponse}
              disabled={!aiResponse}
              className={`px-6 py-2 rounded-lg ${
                aiResponse
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              保存して完了
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
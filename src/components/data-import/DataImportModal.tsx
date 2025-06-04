'use client'

import React, { useState } from 'react'
import { FiX, FiDownload, FiUpload, FiCopy, FiCheck, FiAlertTriangle, FiExternalLink, FiTarget, FiSettings, FiZap } from 'react-icons/fi'
import { DataImportPromptGenerator } from '@/lib/domain/services/DataImportPromptGenerator'
import { DataImportProcessor } from '@/lib/domain/services/DataImportProcessor'
import { DataImportPromptConfig, ImportedUserData } from '@/types/data-import'
import { Connection } from '@/types'

interface DataImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: (connections: Connection[]) => void
  userId: string
}

type ImportStep = 'config' | 'prompt' | 'import' | 'review' | 'complete'

export function DataImportModal({ isOpen, onClose, onImportComplete, userId }: DataImportModalProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('config')
  const [config, setConfig] = useState<DataImportPromptConfig>({
    userId,
    includeScreenshots: true,
    targetApps: ['Tinder', 'Pairs', 'Omiai', 'Bumble'],
    focusAreas: ['basic_info', 'communication', 'feelings', 'goals']
  })
  
  const [selectedPlatform, setSelectedPlatform] = useState<'gemini' | 'claude' | 'chatgpt'>('gemini')
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [importedData, setImportedData] = useState<ImportedUserData | null>(null)
  const [jsonInput, setJsonInput] = useState('')
  const [validationResult, setValidationResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const promptGenerator = new DataImportPromptGenerator()
  const dataProcessor = new DataImportProcessor()

  if (!isOpen) return null

  const handleGeneratePrompt = () => {
    const prompt = promptGenerator.generatePlatformSpecificPrompt(selectedPlatform, config)
    setGeneratedPrompt(prompt)
    setCurrentStep('prompt')
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    } catch (err) {
      console.error('コピーに失敗しました:', err)
    }
  }

  const handleProceedToImport = () => {
    setCurrentStep('import')
  }

  const handleProcessJson = () => {
    try {
      setIsProcessing(true)
      
      const parsedData = JSON.parse(jsonInput)
      const validation = dataProcessor.validateImportData(parsedData)
      setValidationResult(validation)
      
      if (validation.isValid) {
        setImportedData(parsedData)
        setCurrentStep('review')
      }
      
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: ['JSONの形式が正しくありません。正しいJSON形式で入力してください。'],
        warnings: []
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmImport = () => {
    if (!importedData) return
    
    setIsProcessing(true)
    try {
      const { connections } = dataProcessor.convertToMiruFormat(importedData)
      onImportComplete(connections)
      setCurrentStep('complete')
    } catch (error) {
      console.error('インポート処理に失敗しました:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const renderConfigStep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <FiSettings className="text-2xl text-pink-600" />
        <h3 className="text-xl font-bold text-gray-800">データインポート設定</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            使用するAIプラットフォーム
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'gemini', name: 'Google Gemini', icon: '🤖' },
              { id: 'claude', name: 'Anthropic Claude', icon: '🧠' },
              { id: 'chatgpt', name: 'OpenAI ChatGPT', icon: '💬' }
            ].map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id as any)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  selectedPlatform === platform.id
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{platform.icon}</div>
                <div className="text-xs font-medium">{platform.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分析対象のアプリ
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Tinder', 'Pairs', 'Omiai', 'Bumble', 'with', 'タップル', 'ゼクシィ縁結び', 'その他'].map((app) => (
              <label key={app} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.targetApps.includes(app)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setConfig(prev => ({
                        ...prev,
                        targetApps: [...prev.targetApps, app]
                      }))
                    } else {
                      setConfig(prev => ({
                        ...prev,
                        targetApps: prev.targetApps.filter(a => a !== app)
                      }))
                    }
                  }}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">{app}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.includeScreenshots}
              onChange={(e) => setConfig(prev => ({ ...prev, includeScreenshots: e.target.checked }))}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">スクリーンショットの提供指示を含める</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            プライバシーに配慮した画像分析で、より詳細な状況把握が可能になります
          </p>
        </div>
      </div>

      <button
        onClick={handleGeneratePrompt}
        className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2"
      >
        <FiTarget />
        <span>プロンプトを生成する</span>
      </button>
    </div>
  )

  const renderPromptStep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <FiDownload className="text-2xl text-pink-600" />
        <h3 className="text-xl font-bold text-gray-800">プロンプトの使用方法</h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center space-x-2">
          <FiExternalLink />
          <span>手順</span>
        </h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>下のプロンプトをコピーします</li>
          <li>{selectedPlatform === 'gemini' ? 'Google Gemini' : selectedPlatform === 'claude' ? 'Claude' : 'ChatGPT'}を開きます</li>
          <li>コピーしたプロンプトを貼り付けて送信します</li>
          <li>AIの質問に従って、あなたの恋愛状況を詳しく入力します</li>
          <li>すべて完了したら「完了した」と伝えます</li>
          <li>出力されたJSONを次のステップで入力します</li>
        </ol>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          生成されたプロンプト ({selectedPlatform}用)
        </label>
        <textarea
          value={generatedPrompt}
          readOnly
          className="w-full h-64 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono resize-none"
          placeholder="プロンプトが生成されます..."
        />
        <button
          onClick={handleCopyPrompt}
          className="absolute top-8 right-2 p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          title="プロンプトをコピー"
        >
          {copiedPrompt ? <FiCheck className="text-green-600" /> : <FiCopy className="text-gray-600" />}
        </button>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setCurrentStep('config')}
          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
        >
          戻る
        </button>
        <button
          onClick={handleProceedToImport}
          className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2"
        >
          <FiUpload />
          <span>JSONを入力する</span>
        </button>
      </div>
    </div>
  )

  const renderImportStep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <FiUpload className="text-2xl text-pink-600" />
        <h3 className="text-xl font-bold text-gray-800">JSONデータの入力</h3>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2 flex items-center space-x-2">
          <FiAlertTriangle />
          <span>注意事項</span>
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>AIが出力したJSONデータをそのまま貼り付けてください</li>
          <li>```json と ``` の部分は含めないでください</li>
          <li>個人情報が含まれている場合は、事前に確認してください</li>
        </ul>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AIから出力されたJSONデータ
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full h-64 p-3 border border-gray-300 rounded-lg text-sm font-mono resize-none"
          placeholder="AIから出力されたJSONデータをここに貼り付けてください..."
        />
      </div>

      {validationResult && (
        <div className={`border rounded-lg p-4 ${
          validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h4 className={`font-medium mb-2 ${
            validationResult.isValid ? 'text-green-800' : 'text-red-800'
          }`}>
            {validationResult.isValid ? '✅ データ検証成功' : '❌ データ検証エラー'}
          </h4>
          
          {validationResult.errors.length > 0 && (
            <div className="mb-2">
              <p className="text-sm text-red-700 font-medium">エラー:</p>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {validationResult.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {validationResult.warnings.length > 0 && (
            <div>
              <p className="text-sm text-yellow-700 font-medium">警告:</p>
              <ul className="text-sm text-yellow-600 list-disc list-inside">
                {validationResult.warnings.map((warning: string, index: number) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => setCurrentStep('prompt')}
          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
        >
          戻る
        </button>
        <button
          onClick={handleProcessJson}
          disabled={!jsonInput.trim() || isProcessing}
          className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>処理中...</span>
            </>
          ) : (
            <>
              <FiZap />
              <span>データを処理する</span>
            </>
          )}
        </button>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <FiCheck className="text-2xl text-pink-600" />
        <h3 className="text-xl font-bold text-gray-800">インポート内容の確認</h3>
      </div>

      {importedData && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">📊 インポート概要</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">コネクション数:</span>
                <span className="font-medium ml-2">{importedData.connections.length}人</span>
              </div>
              <div>
                <span className="text-green-700">データ完全性:</span>
                <span className="font-medium ml-2">{importedData.importMetadata.completeness}%</span>
              </div>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-3">
            {importedData.connections.map((conn, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-800">{conn.nickname}</h5>
                    <p className="text-sm text-gray-600">{conn.platform} • {conn.currentStage}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>魅力度: {conn.attractionLevel || 'N/A'}/10</div>
                    <div>相性: {conn.compatibilityScore || 'N/A'}/10</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => setCurrentStep('import')}
          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
        >
          戻る
        </button>
        <button
          onClick={handleConfirmImport}
          disabled={isProcessing}
          className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>インポート中...</span>
            </>
          ) : (
            <>
              <FiCheck />
              <span>インポートを確定する</span>
            </>
          )}
        </button>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <FiCheck className="text-3xl text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">インポート完了！</h3>
        <p className="text-gray-600">
          恋愛状況データが正常にインポートされました。<br />
          ダッシュボードで新しい情報を確認できます。
        </p>
      </div>

      <button
        onClick={onClose}
        className="bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors"
      >
        完了
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">データインポート</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        <div className="p-6">
          {currentStep === 'config' && renderConfigStep()}
          {currentStep === 'prompt' && renderPromptStep()}
          {currentStep === 'import' && renderImportStep()}
          {currentStep === 'review' && renderReviewStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>
      </div>
    </div>
  )
}
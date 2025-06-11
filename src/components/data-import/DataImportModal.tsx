'use client'

import React, { useState } from 'react'
import { DataImportPromptGenerator } from '@/lib/domain/services/DataImportPromptGenerator'
import { DataImportProcessor } from '@/lib/domain/services/DataImportProcessor'
import { DataImportPromptConfig, ImportedUserData } from '@/types/data-import'
import { Connection } from '@/types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { GlassCard } from '../ui/GlassCard'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { RippleButton } from '../ui/MicroInteractions'
import { HeroText, Body, Caption } from '../ui/Typography'
import { 
  Settings, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  Copy, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Users,
  Brain,
  MessageSquare,
  Zap,
  Star,
  Heart,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-ai-gradient flex items-center justify-center shadow-lg">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <HeroText className="text-xl">データインポート設定</HeroText>
        <Body className="text-text-secondary">
          AIの力を使って、既存の恋愛データを簡単にインポートできます
        </Body>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Caption className="font-medium text-text-primary flex items-center gap-2">
            <Brain className="w-4 h-4" />
            使用するAIプラットフォーム
          </Caption>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'gemini', name: 'Google Gemini', icon: Brain },
              { id: 'claude', name: 'Anthropic Claude', icon: Users },
              { id: 'chatgpt', name: 'OpenAI ChatGPT', icon: MessageSquare }
            ].map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id as any)}
                className={cn(
                  'p-4 rounded-xl text-center transition-all duration-200 border',
                  selectedPlatform === platform.id
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary shadow-lg'
                    : 'border-glass-20 bg-glass-5 hover:border-glass-30 hover:bg-glass-10 text-text-primary'
                )}
              >
                <platform.icon className="w-6 h-6 mx-auto mb-2" />
                <Caption className="font-medium">{platform.name}</Caption>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Caption className="font-medium text-text-primary flex items-center gap-2">
            <Heart className="w-4 h-4" />
            分析対象のアプリ
          </Caption>
          <div className="grid grid-cols-2 gap-3">
            {['Tinder', 'Pairs', 'Omiai', 'Bumble', 'with', 'タップル', 'ゼクシィ縁結び', 'その他'].map((app) => (
              <label key={app} className="flex items-center gap-3 p-3 rounded-xl border border-glass-20 hover:border-glass-30 transition-colors cursor-pointer">
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
                  className="rounded border-glass-30 text-accent-primary focus:ring-accent-primary bg-glass-5"
                />
                <Caption className="text-text-primary">{app}</Caption>
              </label>
            ))}
          </div>
        </div>

        <GlassCard variant="subtle" className="p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.includeScreenshots}
              onChange={(e) => setConfig(prev => ({ ...prev, includeScreenshots: e.target.checked }))}
              className="mt-0.5 rounded border-glass-30 text-accent-primary focus:ring-accent-primary bg-glass-5"
            />
            <div>
              <Caption className="font-medium text-text-primary mb-1">
                スクリーンショットの提供指示を含める
              </Caption>
              <Caption className="text-text-muted">
                プライバシーに配慮した画像分析で、より詳細な状況把握が可能になります
              </Caption>
            </div>
          </label>
        </GlassCard>
      </div>

      <RippleButton
        onClick={handleGeneratePrompt}
        variant="primary"
        size="lg"
        className="w-full"
        icon={<Target className="w-5 h-5" />}
        glow
      >
        プロンプトを生成する
      </RippleButton>
    </div>
  )

  const renderPromptStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-info/20 flex items-center justify-center border border-accent-info/30">
          <Download className="w-8 h-8 text-accent-info" />
        </div>
        <HeroText className="text-xl ai-text-gradient">プロンプトの使用方法</HeroText>
      </div>

      <GlassCard variant="info" className="border border-accent-info/20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-accent-info/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-accent-info" />
            </div>
            <Body className="font-medium text-accent-info">手順</Body>
          </div>
          <ol className="space-y-2 text-accent-info/80 list-decimal list-inside">
            <Caption>1. 下のプロンプトをコピーします</Caption>
            <Caption>2. {selectedPlatform === 'gemini' ? 'Google Gemini' : selectedPlatform === 'claude' ? 'Claude' : 'ChatGPT'}を開きます</Caption>
            <Caption>3. コピーしたプロンプトを貼り付けて送信します</Caption>
            <Caption>4. AIの質問に従って、あなたの恋愛状況を詳しく入力します</Caption>
            <Caption>5. すべて完了したら「完了した」と伝えます</Caption>
            <Caption>6. 出力されたJSONを次のステップで入力します</Caption>
          </ol>
        </div>
      </GlassCard>

      <div className="space-y-3">
        <Caption className="font-medium text-text-primary">
          生成されたプロンプト ({selectedPlatform}用)
        </Caption>
        <div className="relative">
          <textarea
            value={generatedPrompt}
            readOnly
            className={cn(
              'w-full h-64 p-4 rounded-xl font-mono text-sm resize-none',
              'bg-glass-5 border border-glass-20 text-text-primary',
              'focus:outline-none focus:ring-2 focus:ring-accent-primary'
            )}
            placeholder="プロンプトが生成されます..."
          />
          <Button
            onClick={handleCopyPrompt}
            variant={copiedPrompt ? "success" : "ghost"}
            size="sm"
            className="absolute top-3 right-3"
            icon={copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {copiedPrompt ? 'コピー済み' : 'コピー'}
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => setCurrentStep('config')}
          variant="ghost"
          size="lg"
          className="flex-1"
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          戻る
        </Button>
        <RippleButton
          onClick={handleProceedToImport}
          variant="primary"
          size="lg"
          className="flex-1"
          icon={<Upload className="w-4 h-4" />}
        >
          JSONを入力する
        </RippleButton>
      </div>
    </div>
  )

  const renderImportStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-warning/20 flex items-center justify-center border border-accent-warning/30">
          <Upload className="w-8 h-8 text-accent-warning" />
        </div>
        <HeroText className="text-xl ai-text-gradient">JSONデータの入力</HeroText>
      </div>

      <GlassCard variant="warning" className="border border-accent-warning/20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-accent-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-accent-warning" />
            </div>
            <Body className="font-medium text-accent-warning">注意事項</Body>
          </div>
          <ul className="space-y-2 text-accent-warning/80 list-disc list-inside">
            <Caption>AIが出力したJSONデータをそのまま貼り付けてください</Caption>
            <Caption>```json と ``` の部分は含めないでください</Caption>
            <Caption>個人情報が含まれている場合は、事前に確認してください</Caption>
          </ul>
        </div>
      </GlassCard>

      <div className="space-y-3">
        <Caption className="font-medium text-text-primary">
          AIから出力されたJSONデータ
        </Caption>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className={cn(
            'w-full h-64 p-4 rounded-xl font-mono text-sm resize-none',
            'bg-glass-5 border border-glass-20 text-text-primary',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary',
            'placeholder:text-text-muted'
          )}
          placeholder="AIから出力されたJSONデータをここに貼り付けてください..."
        />
      </div>

      {validationResult && (
        <GlassCard 
          variant={validationResult.isValid ? 'success' : 'danger'} 
          className={cn(
            'border',
            validationResult.isValid ? 'border-accent-success/20' : 'border-accent-error/20'
          )}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center',
                validationResult.isValid 
                  ? 'bg-accent-success/10' 
                  : 'bg-accent-error/10'
              )}>
                {validationResult.isValid ? (
                  <CheckCircle className="w-4 h-4 text-accent-success" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-accent-error" />
                )}
              </div>
              <Body className={cn(
                'font-medium',
                validationResult.isValid ? 'text-accent-success' : 'text-accent-error'
              )}>
                {validationResult.isValid ? 'データ検証成功' : 'データ検証エラー'}
              </Body>
            </div>
            
            {validationResult.errors.length > 0 && (
              <div className="mb-4">
                <Caption className="text-accent-error font-medium mb-2">エラー:</Caption>
                <ul className="space-y-1 text-accent-error/80 list-disc list-inside">
                  {validationResult.errors.map((error: string, index: number) => (
                    <Caption key={index}>{error}</Caption>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResult.warnings.length > 0 && (
              <div>
                <Caption className="text-accent-warning font-medium mb-2">警告:</Caption>
                <ul className="space-y-1 text-accent-warning/80 list-disc list-inside">
                  {validationResult.warnings.map((warning: string, index: number) => (
                    <Caption key={index}>{warning}</Caption>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      <div className="flex gap-4">
        <Button
          onClick={() => setCurrentStep('prompt')}
          variant="ghost"
          size="lg"
          className="flex-1"
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          戻る
        </Button>
        <RippleButton
          onClick={handleProcessJson}
          disabled={!jsonInput.trim() || isProcessing}
          variant="primary"
          size="lg"
          className="flex-1"
          icon={isProcessing ? <LoadingSpinner size="sm" className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
        >
          {isProcessing ? '処理中...' : 'データを処理する'}
        </RippleButton>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-success/20 flex items-center justify-center border border-accent-success/30">
          <CheckCircle className="w-8 h-8 text-accent-success" />
        </div>
        <HeroText className="text-xl ai-text-gradient">インポート内容の確認</HeroText>
      </div>

      {importedData && (
        <div className="space-y-6">
          <GlassCard variant="success" className="border border-accent-success/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-accent-success/10 flex items-center justify-center">
                  <Star className="w-4 h-4 text-accent-success" />
                </div>
                <Body className="font-medium text-accent-success">インポート概要</Body>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent-success" />
                  <Caption className="text-accent-success/80">コネクション数:</Caption>
                  <Body className="font-bold text-accent-success">{importedData.connections.length}人</Body>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent-success" />
                  <Caption className="text-accent-success/80">データ完全性:</Caption>
                  <Body className="font-bold text-accent-success">{importedData.importMetadata.completeness}%</Body>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="max-h-64 overflow-y-auto space-y-3">
            {importedData.connections.map((conn, index) => (
              <GlassCard key={index} variant="subtle" className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ai-gradient flex items-center justify-center text-white font-bold text-sm">
                      {conn.nickname[0]}
                    </div>
                    <div>
                      <Body className="font-medium text-text-primary">{conn.nickname}</Body>
                      <Caption className="text-text-secondary">{conn.platform} • {conn.currentStage}</Caption>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-accent-primary" />
                      <Caption className="text-text-secondary">{conn.attractionLevel || 'N/A'}/10</Caption>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-accent-secondary" />
                      <Caption className="text-text-secondary">{conn.compatibilityScore || 'N/A'}/10</Caption>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          onClick={() => setCurrentStep('import')}
          variant="ghost"
          size="lg"
          className="flex-1"
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          戻る
        </Button>
        <RippleButton
          onClick={handleConfirmImport}
          disabled={isProcessing}
          variant="success"
          size="lg"
          className="flex-1"
          icon={isProcessing ? <LoadingSpinner size="sm" className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          glow
        >
          {isProcessing ? 'インポート中...' : 'インポートを確定する'}
        </RippleButton>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-ai-gradient rounded-2xl flex items-center justify-center mx-auto shadow-xl animate-scale-in">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <div className="space-y-2">
          <HeroText className="text-2xl ai-text-gradient animate-slide-up">
            インポート完了！
          </HeroText>
          <Body className="text-text-secondary max-w-md mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
            恋愛状況データが正常にインポートされました。
            ダッシュボードで新しい情報を確認できます。
          </Body>
        </div>
      </div>

      <RippleButton
        onClick={onClose}
        variant="primary"
        size="lg"
        className="px-8 animate-slide-up"
        style={{ animationDelay: '200ms' }}
        glow
      >
        完了
      </RippleButton>
    </div>
  )

  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      variant="glass"
      size="xl"
      title="データインポート"
      closeOnBackdrop={currentStep === 'complete'}
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {[
            { step: 'config', icon: Settings, label: '設定' },
            { step: 'prompt', icon: Download, label: 'プロンプト' },
            { step: 'import', icon: Upload, label: 'インポート' },
            { step: 'review', icon: CheckCircle, label: '確認' },
            { step: 'complete', icon: Star, label: '完了' }
          ].map((item, index) => {
            const isActive = currentStep === item.step
            const isCompleted = [
              'config', 'prompt', 'import', 'review', 'complete'
            ].indexOf(currentStep) > index
            
            return (
              <div key={item.step} className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                  isCompleted || isActive 
                    ? 'bg-accent-primary text-white' 
                    : 'bg-glass-10 text-text-muted'
                )}>
                  <item.icon className="w-4 h-4" />
                </div>
                {index < 4 && (
                  <div className={cn(
                    'w-8 h-0.5 mx-1 transition-colors',
                    isCompleted ? 'bg-accent-primary' : 'bg-glass-20'
                  )} />
                )}
              </div>
            )
          })}
        </div>

        {currentStep === 'config' && renderConfigStep()}
        {currentStep === 'prompt' && renderPromptStep()}
        {currentStep === 'import' && renderImportStep()}
        {currentStep === 'review' && renderReviewStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </div>
    </Modal>
  )
}
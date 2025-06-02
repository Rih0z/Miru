'use client'

import React, { useState, useEffect } from 'react'
import { Connection } from '@/types'
import { DIContainer } from '@/lib/infrastructure/container/DIContainer'
import { 
  UserContext, 
  SessionContext, 
  OrchestratedPrompt, 
  ActionResult,
  AIServiceConfig
} from '@/lib/domain/interfaces/IPromptOrchestrator'
import { aiServiceManager } from '@/lib/infrastructure/adapters/AIServiceAdapter'

interface PromptOrchestrationPanelProps {
  connection?: Connection
  userId: string
  onPromptGenerated?: (prompt: OrchestratedPrompt) => void
  onResultReceived?: (result: ActionResult) => void
}

export function PromptOrchestrationPanel({
  connection,
  userId,
  onPromptGenerated,
  onResultReceived
}: PromptOrchestrationPanelProps) {
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [currentSession, setCurrentSession] = useState<SessionContext | null>(null)
  const [generatedPrompt, setGeneratedPrompt] = useState<OrchestratedPrompt | null>(null)
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIntent, setSelectedIntent] = useState<SessionContext['userIntent']>('general_help')
  const [selectedAI, setSelectedAI] = useState<string>('claude')
  const [userEmotion, setUserEmotion] = useState<UserContext['currentEmotion']>('hopeful')

  const orchestrator = DIContainer.getInstance().getPromptOrchestrator()
  const contextManager = DIContainer.getInstance().getUserContextManager()

  useEffect(() => {
    loadUserContext()
  }, [userId])

  const loadUserContext = async () => {
    try {
      const context = await orchestrator.getUserContext(userId)
      setUserContext(context)
    } catch (error) {
      console.error('Failed to load user context:', error)
    }
  }

  const updateUserEmotion = async (emotion: UserContext['currentEmotion']) => {
    if (!userContext) return
    
    setUserEmotion(emotion)
    await orchestrator.updateUserContext(userId, { currentEmotion: emotion })
    await loadUserContext()
  }

  const generatePrompt = async () => {
    if (!userContext) return

    setIsLoading(true)
    try {
      // Create session context
      const sessionContext = await orchestrator.createSessionContext(userId, selectedIntent)
      setCurrentSession(sessionContext)

      // Generate personalized prompt
      const prompt = await orchestrator.generatePrompt(sessionContext, connection)
      setGeneratedPrompt(prompt)
      
      if (onPromptGenerated) {
        onPromptGenerated(prompt)
      }
    } catch (error) {
      console.error('Failed to generate prompt:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const executePrompt = async () => {
    if (!generatedPrompt) return

    setIsLoading(true)
    try {
      // Set up AI service configuration
      const aiConfig: AIServiceConfig = {
        provider: selectedAI as any,
        model: getModelForProvider(selectedAI),
        maxTokens: 4000,
        temperature: 0.7,
        customParameters: {}
      }

      // Execute prompt
      const result = await orchestrator.executePrompt(generatedPrompt, aiConfig)
      setResult(result)
      
      if (onResultReceived) {
        onResultReceived(result)
      }
    } catch (error) {
      console.error('Failed to execute prompt:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const provideFeedback = async (rating: number, effectiveness: ActionResult['feedback']['effectiveness'], notes: string) => {
    if (!result) return

    try {
      await orchestrator.recordFeedback(result.id, {
        userRating: rating,
        effectiveness,
        notes
      })
      
      // Reload user context to see learning updates
      await loadUserContext()
    } catch (error) {
      console.error('Failed to record feedback:', error)
    }
  }

  const copyPromptToClipboard = async () => {
    if (!generatedPrompt) return
    
    try {
      await navigator.clipboard.writeText(generatedPrompt.prompt)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy prompt:', error)
    }
  }

  const getModelForProvider = (provider: string): string => {
    switch (provider) {
      case 'claude': return 'claude-3-sonnet-20240229'
      case 'gpt': return 'gpt-4'
      case 'gemini': return 'gemini-pro'
      default: return 'claude-3-sonnet-20240229'
    }
  }

  if (!userContext) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Loading user context...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          🎯 AI Prompt Orchestration
        </h2>
        <p className="text-gray-600 mt-1">
          Personalized AI assistance powered by your context and preferences
        </p>
      </div>

      {/* User Context Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Your Current Context</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Emotion:</span>
            <div className="font-medium">{userContext.currentEmotion}</div>
          </div>
          <div>
            <span className="text-gray-600">Goals:</span>
            <div className="font-medium">{userContext.relationshipGoals}</div>
          </div>
          <div>
            <span className="text-gray-600">Style:</span>
            <div className="font-medium">{userContext.communicationStyle}</div>
          </div>
          <div>
            <span className="text-gray-600">AI Preference:</span>
            <div className="font-medium">{userContext.learningPreferences.preferredAIStyle}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Emotion Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Emotion
          </label>
          <select
            value={userEmotion}
            onChange={(e) => updateUserEmotion(e.target.value as UserContext['currentEmotion'])}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="excited">😆 Excited</option>
            <option value="hopeful">😊 Hopeful</option>
            <option value="confident">😎 Confident</option>
            <option value="uncertain">🤔 Uncertain</option>
            <option value="anxious">😰 Anxious</option>
            <option value="frustrated">😤 Frustrated</option>
          </select>
        </div>

        {/* Intent Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What do you need help with?
          </label>
          <select
            value={selectedIntent}
            onChange={(e) => setSelectedIntent(e.target.value as SessionContext['userIntent'])}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="first_message">💬 First Message</option>
            <option value="conversation_deepening">🗣️ Deepen Conversation</option>
            <option value="date_planning">📅 Plan a Date</option>
            <option value="relationship_advice">💕 Relationship Advice</option>
            <option value="general_help">🤝 General Help</option>
          </select>
        </div>

        {/* AI Provider Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Assistant
          </label>
          <select
            value={selectedAI}
            onChange={(e) => setSelectedAI(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="claude">🧠 Claude (Analytical)</option>
            <option value="gpt">✨ GPT (Creative)</option>
            <option value="gemini">⚖️ Gemini (Balanced)</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={generatePrompt}
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '🔄 Generating...' : '🎯 Generate Personalized Prompt'}
        </button>
        
        {generatedPrompt && (
          <button
            onClick={copyPromptToClipboard}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            title="Copy prompt to clipboard"
          >
            📋
          </button>
        )}
      </div>

      {/* Generated Prompt Display */}
      {generatedPrompt && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-blue-900">Generated Prompt</h3>
            <div className="flex gap-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {generatedPrompt.aiProvider}
              </span>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {generatedPrompt.metadata.urgency}
              </span>
            </div>
          </div>
          <div className="bg-white border rounded p-3 text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {generatedPrompt.prompt}
          </div>
          <button
            onClick={executePrompt}
            disabled={isLoading}
            className="mt-3 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? '🤖 Processing...' : '🚀 Execute with AI'}
          </button>
        </div>
      )}

      {/* AI Result Display */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-green-900">AI Response</h3>
            <div className="flex gap-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {result.aiProvider}
              </span>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {result.processingTime}ms
              </span>
            </div>
          </div>
          <div className="bg-white border rounded p-3 text-sm max-h-48 overflow-y-auto">
            {result.response}
          </div>
          
          {/* Feedback Section */}
          <div className="mt-4 pt-3 border-t border-green-200">
            <h4 className="text-sm font-medium text-green-900 mb-2">Rate This Response</h4>
            <div className="flex gap-2">
              {(['poor', 'average', 'good', 'excellent'] as const).map((rating) => (
                <button
                  key={rating}
                  onClick={() => provideFeedback(
                    rating === 'poor' ? 1 : rating === 'average' ? 2 : rating === 'good' ? 3 : 4,
                    rating,
                    ''
                  )}
                  className="px-3 py-1 text-xs border border-green-300 rounded hover:bg-green-100"
                >
                  {rating === 'poor' ? '😞' : rating === 'average' ? '😐' : rating === 'good' ? '😊' : '😍'} {rating}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Connection Info */}
      {connection && (
        <div className="text-sm text-gray-600 border-t pt-4">
          <strong>Context:</strong> {connection.nickname} - {connection.current_stage}
        </div>
      )}
    </div>
  )
}
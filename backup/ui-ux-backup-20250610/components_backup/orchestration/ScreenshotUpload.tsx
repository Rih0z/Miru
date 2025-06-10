'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Connection } from '@/types'
import { DIContainer } from '@/lib/infrastructure/container/DIContainer'
import { ScreenshotAnalysis, ConversationData } from '@/lib/domain/interfaces/IPromptOrchestrator'

interface ScreenshotUploadProps {
  connectionId?: string
  onAnalysisComplete?: (analysis: ScreenshotAnalysis, conversationData: ConversationData) => void
  onConnectionUpdated?: (connection: Connection) => void
}

export function ScreenshotUpload({
  connectionId,
  onAnalysisComplete,
  onConnectionUpdated
}: ScreenshotUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysis, setAnalysis] = useState<ScreenshotAnalysis | null>(null)
  const [conversationData, setConversationData] = useState<ConversationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const screenshotProcessor = DIContainer.getInstance().getScreenshotProcessor()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsProcessing(true)
    setError(null)
    
    try {
      // Display uploaded image
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)

      // Process screenshot
      const analysis = await screenshotProcessor.processScreenshot(file)
      setAnalysis(analysis)

      // Extract conversation data
      const conversationData = await screenshotProcessor.extractConversationData(analysis)
      setConversationData(conversationData)

      // Update connection if ID provided
      if (connectionId) {
        const updatedConnection = await screenshotProcessor.updateConnectionFromScreenshot(
          connectionId,
          conversationData
        )
        if (onConnectionUpdated) {
          onConnectionUpdated(updatedConnection)
        }
      }

      // Notify parent component
      if (onAnalysisComplete) {
        onAnalysisComplete(analysis, conversationData)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process screenshot')
    } finally {
      setIsProcessing(false)
    }
  }, [connectionId, onAnalysisComplete, onConnectionUpdated, screenshotProcessor])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    disabled: isProcessing
  })

  const reset = () => {
    setAnalysis(null)
    setConversationData(null)
    setError(null)
    setUploadedImage(null)
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="space-y-2">
            <div className="animate-spin mx-auto w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="text-gray-600">🤖 Processing screenshot with AI...</p>
            <p className="text-sm text-gray-500">Analyzing conversation patterns and extracting data</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📱</div>
            <p className="text-lg font-medium text-gray-900">
              Drop your dating app screenshot here
            </p>
            <p className="text-gray-600">
              or click to browse files
            </p>
            <p className="text-sm text-gray-500">
              Supports LINE, WhatsApp, Tinder, Bumble, and other messaging apps
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400 text-xl">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Processing Error
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Image Preview */}
      {uploadedImage && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Uploaded Screenshot</h3>
          <div className="flex justify-center">
            <img 
              src={uploadedImage} 
              alt="Uploaded screenshot" 
              className="max-h-64 rounded border shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-3">📊 Analysis Results</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <span className="text-blue-700 font-medium">App Detected:</span>
              <div className="text-blue-900">{analysis.imageMetadata.app}</div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Platform:</span>
              <div className="text-blue-900">{analysis.imageMetadata.source}</div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Messages Found:</span>
              <div className="text-blue-900">{analysis.detectedElements.messages.length}</div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Confidence:</span>
              <div className="text-blue-900">{(analysis.confidence * 100).toFixed(1)}%</div>
            </div>
          </div>

          {/* Extracted Messages */}
          {analysis.detectedElements.messages.length > 0 && (
            <div className="bg-white rounded border p-3">
              <h4 className="font-medium text-gray-900 mb-2">💬 Extracted Messages</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {analysis.detectedElements.messages.slice(-5).map((message, index) => (
                  <div key={index} className={`text-sm p-2 rounded ${
                    message.sender === 'user' 
                      ? 'bg-blue-100 text-blue-900 ml-8' 
                      : 'bg-gray-100 text-gray-900 mr-8'
                  }`}>
                    <span className="font-medium">
                      {message.sender === 'user' ? 'You' : 'Them'}:
                    </span>
                    <span className="ml-2">{message.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conversation Data */}
      {conversationData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-3">🎯 Smart Insights</h3>
          
          {/* Last Message Analysis */}
          <div className="bg-white rounded border p-3 mb-3">
            <h4 className="font-medium text-gray-900 mb-2">Latest Message</h4>
            <div className="text-sm">
              <p className="mb-1">
                <span className="font-medium">From:</span> {
                  conversationData.lastMessage.sender === 'user' ? 'You' : 'Them'
                }
              </p>
              <p className="mb-1">
                <span className="font-medium">Content:</span> {conversationData.lastMessage.content}
              </p>
              <p className="mb-1">
                <span className="font-medium">Sentiment:</span> 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  conversationData.lastMessage.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                  conversationData.lastMessage.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {conversationData.lastMessage.sentiment}
                </span>
              </p>
            </div>
          </div>

          {/* Conversation Flow */}
          <div className="bg-white rounded border p-3 mb-3">
            <h4 className="font-medium text-gray-900 mb-2">Conversation Flow</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Frequency:</span>
                <div className="font-medium">{conversationData.conversationFlow.messageFrequency}</div>
              </div>
              <div>
                <span className="text-gray-600">Emotional Tone:</span>
                <div className="font-medium">{conversationData.conversationFlow.emotionalTone}</div>
              </div>
            </div>
            {conversationData.conversationFlow.topicProgression.length > 0 && (
              <div className="mt-2">
                <span className="text-gray-600">Topics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {conversationData.conversationFlow.topicProgression.map((topic, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggested Updates */}
          {Object.keys(conversationData.contextUpdates).length > 0 && (
            <div className="bg-white rounded border p-3">
              <h4 className="font-medium text-gray-900 mb-2">📝 Suggested Profile Updates</h4>
              <div className="text-sm space-y-1">
                {conversationData.contextUpdates.currentStage && (
                  <p>• Update stage to: <strong>{conversationData.contextUpdates.currentStage}</strong></p>
                )}
                {conversationData.contextUpdates.newHobbies && conversationData.contextUpdates.newHobbies.length > 0 && (
                  <p>• Add hobbies: <strong>{conversationData.contextUpdates.newHobbies.join(', ')}</strong></p>
                )}
                {conversationData.contextUpdates.communicationChanges && (
                  <p>• Communication style: <strong>{
                    conversationData.contextUpdates.communicationChanges.style || 'Updated'
                  }</strong></p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reset Button */}
      {(analysis || error) && (
        <div className="flex justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Upload Another Screenshot
          </button>
        </div>
      )}
    </div>
  )
}
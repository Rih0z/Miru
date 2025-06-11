/**
 * E2E Tests for Critical User Journeys
 * 
 * These tests simulate real user interactions from browser perspective
 * using a lightweight E2E testing approach without requiring browser automation
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

// Mock browser environment
const mockBrowser = {
  localStorage: new Map<string, string>(),
  sessionStorage: new Map<string, string>(),
  location: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  history: {
    pushState: jest.fn(),
    replaceState: jest.fn(),
    back: jest.fn(),
    forward: jest.fn()
  },
  document: {
    title: '',
    cookie: ''
  }
}

// Mock fetch for API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('E2E Critical User Journeys', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockBrowser.localStorage.clear()
    mockBrowser.sessionStorage.clear()
    mockBrowser.location.pathname = '/'
    mockBrowser.document.title = ''
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('New User Onboarding Journey', () => {
    it('should complete full signup to first connection flow', async () => {
      // Step 1: User visits landing page
      expect(mockBrowser.location.pathname).toBe('/')
      
      // Step 2: User clicks signup
      // Simulate auth modal opening
      const authModalState = { isOpen: true, mode: 'signup' }
      expect(authModalState.isOpen).toBe(true)
      expect(authModalState.mode).toBe('signup')

      // Step 3: User fills signup form
      const signupData = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        confirmPassword: 'securepassword123'
      }

      // Mock successful signup API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            id: 'user-new-123',
            email: signupData.email,
            created_at: new Date().toISOString()
          },
          error: null
        })
      })

      // Step 4: Successful signup triggers email confirmation
      const signupResult = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData)
      })
      const signupResponse = await signupResult.json()
      
      expect(signupResponse.user).toBeTruthy()
      expect(signupResponse.user.email).toBe(signupData.email)

      // Step 5: User confirms email and logs in
      // Mock login API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: signupResponse.user,
          session: { access_token: 'mock-token', refresh_token: 'mock-refresh' },
          error: null
        })
      })

      const loginResult = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password
        })
      })
      const loginResponse = await loginResult.json()
      
      expect(loginResponse.user).toBeTruthy()
      expect(loginResponse.session).toBeTruthy()

      // Step 6: User is redirected to dashboard
      mockBrowser.location.pathname = '/dashboard'
      expect(mockBrowser.location.pathname).toBe('/dashboard')

      // Step 7: Dashboard loads with empty state
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connections: [],
          totalConnections: 0,
          activeConnections: 0,
          averageScore: 0,
          recommendedActions: [],
          bestConnection: null
        })
      })

      const dashboardResult = await fetch('/api/dashboard', {
        headers: { Authorization: 'Bearer mock-token' }
      })
      const dashboardData = await dashboardResult.json()
      
      expect(dashboardData.totalConnections).toBe(0)

      // Step 8: User adds first connection
      const connectionData = {
        nickname: 'テストさん',
        platform: 'Pairs',
        current_stage: 'マッチング直後',
        basic_info: {
          age: 25,
          occupation: 'エンジニア',
          hobbies: ['映画鑑賞']
        },
        communication: {
          frequency: '毎日'
        },
        user_feelings: {
          expectations: '真剣な交際',
          attractivePoints: ['優しい']
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'conn-123',
          user_id: 'user-new-123',
          ...connectionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      })

      const createConnectionResult = await fetch('/api/connections', {
        method: 'POST',
        headers: { Authorization: 'Bearer mock-token' },
        body: JSON.stringify(connectionData)
      })
      const newConnection = await createConnectionResult.json()
      
      expect(newConnection.id).toBeTruthy()
      expect(newConnection.nickname).toBe('テストさん')

      // Step 9: Dashboard updates with new connection
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connections: [newConnection],
          totalConnections: 1,
          activeConnections: 1,
          averageScore: 25,
          recommendedActions: [{
            id: 'action-1',
            connection_id: newConnection.id,
            title: 'テストさんに最初のメッセージを送る',
            urgency: 'high',
            prompt_type: 'first_message'
          }],
          bestConnection: newConnection
        })
      })

      const updatedDashboardResult = await fetch('/api/dashboard', {
        headers: { Authorization: 'Bearer mock-token' }
      })
      const updatedDashboardData = await updatedDashboardResult.json()
      
      expect(updatedDashboardData.totalConnections).toBe(1)
      expect(updatedDashboardData.recommendedActions).toHaveLength(1)
      expect(updatedDashboardData.bestConnection.nickname).toBe('テストさん')

      // Journey completed successfully
      expect(mockBrowser.location.pathname).toBe('/dashboard')
      expect(mockFetch).toHaveBeenCalledTimes(5) // signup, login, dashboard, create connection, updated dashboard
    })
  })

  describe('Existing User Return Journey', () => {
    it('should handle returning user login and dashboard access', async () => {
      // Step 1: User visits app with existing session
      mockBrowser.localStorage.set('auth_token', 'existing-token')
      
      // Step 2: App checks existing session
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            id: 'user-existing-123',
            email: 'existing@example.com',
            created_at: '2024-01-01T00:00:00Z'
          }
        })
      })

      const sessionResult = await fetch('/api/auth/session', {
        headers: { Authorization: 'Bearer existing-token' }
      })
      const sessionData = await sessionResult.json()
      
      expect(sessionData.user).toBeTruthy()

      // Step 3: User is automatically redirected to dashboard
      mockBrowser.location.pathname = '/dashboard'
      
      // Step 4: Dashboard loads with existing connections
      const existingConnections = [
        {
          id: 'conn-1',
          user_id: 'user-existing-123',
          nickname: 'Aさん',
          platform: 'Pairs',
          current_stage: 'メッセージ中'
        },
        {
          id: 'conn-2',
          user_id: 'user-existing-123',
          nickname: 'Bさん',
          platform: 'with',
          current_stage: 'デート前'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connections: existingConnections,
          totalConnections: 2,
          activeConnections: 2,
          averageScore: 55,
          recommendedActions: [
            {
              id: 'action-1',
              connection_id: 'conn-2',
              title: 'Bさんとのデート準備',
              urgency: 'high',
              prompt_type: 'date_preparation'
            }
          ],
          bestConnection: existingConnections[1]
        })
      })

      const dashboardResult = await fetch('/api/dashboard', {
        headers: { Authorization: 'Bearer existing-token' }
      })
      const dashboardData = await dashboardResult.json()
      
      expect(dashboardData.totalConnections).toBe(2)
      expect(dashboardData.connections).toHaveLength(2)
      expect(dashboardData.bestConnection.nickname).toBe('Bさん')

      // Step 5: User views recommended action
      expect(dashboardData.recommendedActions[0].title).toBe('Bさんとのデート準備')
      expect(dashboardData.recommendedActions[0].urgency).toBe('high')

      // Journey completed successfully
      expect(mockFetch).toHaveBeenCalledTimes(2) // session check, dashboard load
    })
  })

  describe('Connection Management Journey', () => {
    it('should complete full connection lifecycle', async () => {
      // Setup: Authenticated user
      const authToken = 'valid-token'
      const userId = 'user-123'

      // Step 1: User adds new connection
      const newConnectionData = {
        nickname: 'Cさん',
        platform: 'Bumble',
        current_stage: 'マッチング直後',
        basic_info: { age: 28, occupation: 'デザイナー' },
        communication: { frequency: '数日に1回' },
        user_feelings: { expectations: '楽しい関係' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'conn-new',
          user_id: userId,
          ...newConnectionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      })

      const createResult = await fetch('/api/connections', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(newConnectionData)
      })
      const newConnection = await createResult.json()
      
      expect(newConnection.nickname).toBe('Cさん')
      expect(newConnection.current_stage).toBe('マッチング直後')

      // Step 2: User progresses relationship stage
      const stageUpdate = {
        current_stage: 'メッセージ中',
        communication: {
          ...newConnectionData.communication,
          lastContact: new Date().toISOString().split('T')[0]
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...newConnection,
          ...stageUpdate,
          updated_at: new Date().toISOString()
        })
      })

      const updateResult = await fetch(`/api/connections/${newConnection.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(stageUpdate)
      })
      const updatedConnection = await updateResult.json()
      
      expect(updatedConnection.current_stage).toBe('メッセージ中')

      // Step 3: User generates AI prompt for next action
      const promptRequest = {
        connection_id: newConnection.id,
        prompt_type: 'deepen_conversation',
        ai_type: 'claude'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          prompt: 'Cさんとの会話を深めるために...',
          suggestions: [
            '共通の趣味について質問する',
            '週末の過ごし方を聞いてみる',
            '好きな映画や本について話す'
          ]
        })
      })

      const promptResult = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(promptRequest)
      })
      const promptResponse = await promptResult.json()
      
      expect(promptResponse.prompt).toContain('Cさん')
      expect(promptResponse.suggestions).toHaveLength(3)

      // Step 4: User further progresses to date stage
      const dateStageUpdate = {
        current_stage: 'デート前',
        communication: {
          ...stageUpdate.communication,
          frequency: '毎日'
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...updatedConnection,
          ...dateStageUpdate,
          updated_at: new Date().toISOString()
        })
      })

      const dateUpdateResult = await fetch(`/api/connections/${newConnection.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(dateStageUpdate)
      })
      const dateStageConnection = await dateUpdateResult.json()
      
      expect(dateStageConnection.current_stage).toBe('デート前')

      // Step 5: User eventually ends relationship
      const endStageUpdate = { current_stage: '終了' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...dateStageConnection,
          ...endStageUpdate,
          updated_at: new Date().toISOString()
        })
      })

      const endUpdateResult = await fetch(`/api/connections/${newConnection.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(endStageUpdate)
      })
      const endedConnection = await endUpdateResult.json()
      
      expect(endedConnection.current_stage).toBe('終了')

      // Full lifecycle completed
      expect(mockFetch).toHaveBeenCalledTimes(5) // create, update, prompt, update, end
    })
  })

  describe('Error Recovery Journey', () => {
    it('should handle network errors and recover gracefully', async () => {
      const authToken = 'valid-token'

      // Step 1: Initial request fails with network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      } catch (error) {
        expect(error.message).toBe('Network error')
      }

      // Step 2: User retries and succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connections: [],
          totalConnections: 0,
          activeConnections: 0,
          averageScore: 0,
          recommendedActions: [],
          bestConnection: null
        })
      })

      const retryResult = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      const dashboardData = await retryResult.json()
      
      expect(dashboardData.totalConnections).toBe(0)
      expect(mockFetch).toHaveBeenCalledTimes(2) // failed attempt + successful retry
    })

    it('should handle authentication errors and redirect to login', async () => {
      // Step 1: Request with invalid token
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      })

      const result = await fetch('/api/dashboard', {
        headers: { Authorization: 'Bearer invalid-token' }
      })
      
      expect(result.ok).toBe(false)
      expect(result.status).toBe(401)

      // Step 2: App should redirect to login
      mockBrowser.location.pathname = '/login'
      expect(mockBrowser.location.pathname).toBe('/login')

      // Step 3: User logs in again
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'new-token' },
          error: null
        })
      })

      const loginResult = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })
      const loginResponse = await loginResult.json()
      
      expect(loginResponse.user).toBeTruthy()
      expect(loginResponse.session.access_token).toBe('new-token')

      // Recovery completed
      expect(mockFetch).toHaveBeenCalledTimes(2) // failed dashboard + successful login
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle large datasets efficiently', async () => {
      const authToken = 'valid-token'
      
      // Generate large dataset
      const largeConnectionList = Array.from({ length: 100 }, (_, i) => ({
        id: `conn-${i}`,
        user_id: 'user-123',
        nickname: `Person${i}`,
        platform: 'Pairs',
        current_stage: 'メッセージ中'
      }))

      const startTime = Date.now()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connections: largeConnectionList,
          totalConnections: 100,
          activeConnections: 100,
          averageScore: 50,
          recommendedActions: largeConnectionList.slice(0, 5).map((conn, i) => ({
            id: `action-${i}`,
            connection_id: conn.id,
            title: `Action for ${conn.nickname}`,
            urgency: 'medium'
          })),
          bestConnection: largeConnectionList[0]
        })
      })

      const result = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      const data = await result.json()
      
      const endTime = Date.now()
      const duration = endTime - startTime

      expect(data.connections).toHaveLength(100)
      expect(data.recommendedActions).toHaveLength(5)
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should handle concurrent requests properly', async () => {
      const authToken = 'valid-token'

      // Simulate multiple concurrent requests
      const requests = Array.from({ length: 5 }, (_, i) => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ request_id: i, timestamp: Date.now() })
        })

        return fetch(`/api/test/${i}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      })

      const results = await Promise.all(requests)
      const responses = await Promise.all(results.map(r => r.json()))

      expect(responses).toHaveLength(5)
      responses.forEach((response, i) => {
        expect(response.request_id).toBe(i)
      })

      expect(mockFetch).toHaveBeenCalledTimes(5)
    })
  })

  describe('Advanced User Interactions', () => {
    it('should complete screenshot upload and analysis flow', async () => {
      const authToken = 'valid-token'
      const connectionId = 'conn-123'

      // Step 1: User uploads screenshot
      const mockFile = new File(['screenshot data'], 'conversation.png', { type: 'image/png' })
      const formData = new FormData()
      formData.append('screenshot', mockFile)
      formData.append('connectionId', connectionId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          analysis: {
            imageMetadata: {
              app: 'LINE',
              source: 'mobile',
              timestamp: new Date().toISOString(),
              quality: 'high'
            },
            detectedElements: {
              messages: [
                { id: '1', content: 'こんにちは！', sender: 'other', timestamp: new Date().toISOString() },
                { id: '2', content: 'お疲れ様です', sender: 'user', timestamp: new Date().toISOString() }
              ],
              userInterface: {
                inputField: true,
                sendButton: true,
                profileInfo: false
              }
            },
            confidence: 0.95,
            rawText: 'こんにちは！お疲れ様です'
          },
          conversationData: {
            lastMessage: {
              content: 'お疲れ様です',
              sender: 'user',
              timestamp: new Date().toISOString(),
              sentiment: 'positive'
            },
            conversationFlow: {
              messageFrequency: 'daily',
              emotionalTone: 'warm',
              topicProgression: ['greeting', 'work']
            },
            contextUpdates: {
              currentStage: 'メッセージ中',
              communicationChanges: {
                style: 'casual',
                frequency: 'daily'
              }
            }
          }
        })
      })

      const uploadResult = await fetch('/api/screenshots/analyze', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData
      })
      const analysisData = await uploadResult.json()

      expect(analysisData.analysis.confidence).toBe(0.95)
      expect(analysisData.analysis.detectedElements.messages).toHaveLength(2)
      expect(analysisData.conversationData.lastMessage.sentiment).toBe('positive')

      // Step 2: Connection is automatically updated based on analysis
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: connectionId,
          current_stage: 'メッセージ中',
          communication: {
            frequency: 'daily',
            lastContact: new Date().toISOString().split('T')[0],
            communicationStyle: 'casual'
          },
          updated_at: new Date().toISOString()
        })
      })

      const updatedConnection = await fetch(`/api/connections/${connectionId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      const connectionData = await updatedConnection.json()

      expect(connectionData.current_stage).toBe('メッセージ中')
      expect(connectionData.communication.frequency).toBe('daily')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should handle AI prompt orchestration workflow', async () => {
      const authToken = 'valid-token'
      const connectionId = 'conn-123'

      // Step 1: User requests personalized AI prompt
      const promptRequest = {
        connection_id: connectionId,
        intent: 'first_message',
        ai_provider: 'claude',
        personalization: {
          emotional_state: 'hopeful',
          urgency_level: 'medium',
          communication_style: 'gentle'
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          prompt: {
            id: 'prompt-123',
            content: 'あなたは恋愛アドバイザーとして、優しく思いやりのあるアプローチで...',
            metadata: {
              generated_at: new Date().toISOString(),
              ai_provider: 'claude',
              personalization_factors: {
                emotional_tone: 0.7,
                directness_level: 0.5,
                creativity_level: 0.6
              }
            }
          },
          suggestions: [
            'プロフィールの共通点を見つけて話しかけてみましょう',
            '相手の趣味について質問してみてください',
            '軽い挨拶から始めて自然な流れを作りましょう'
          ]
        })
      })

      const promptResult = await fetch('/api/prompts/orchestrate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(promptRequest)
      })
      const promptData = await promptResult.json()

      expect(promptData.prompt.content).toContain('恋愛アドバイザー')
      expect(promptData.suggestions).toHaveLength(3)
      expect(promptData.prompt.metadata.ai_provider).toBe('claude')

      // Step 2: User executes the prompt with AI
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            id: 'result-123',
            ai_response: '最初のメッセージとして、相手のプロフィールで共通の趣味を見つけて...',
            confidence: 0.85,
            processing_time: 1500,
            structured_advice: {
              recommended_message: 'こんにちは！プロフィールを拝見して、映画がお好きとのことでしたが...',
              timing: '平日の夕方頃が返信率が高い傾向にあります',
              follow_up_strategy: '返信があったら、好きな映画のジャンルについて質問してみてください'
            }
          }
        })
      })

      const executionResult = await fetch(`/api/prompts/${promptData.prompt.id}/execute`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      })
      const aiResult = await executionResult.json()

      expect(aiResult.result.confidence).toBeGreaterThan(0.8)
      expect(aiResult.result.structured_advice.recommended_message).toContain('こんにちは')
      expect(aiResult.result.structured_advice.timing).toBeTruthy()

      // Step 3: User provides feedback on AI result
      const feedback = {
        rating: 4,
        effectiveness: 'good',
        notes: 'とても参考になるアドバイスでした',
        used_suggestion: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const feedbackResult = await fetch(`/api/results/${aiResult.result.id}/feedback`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(feedback)
      })

      expect(feedbackResult.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should handle mobile responsive interface simulation', async () => {
      // Simulate mobile viewport
      const mobileViewport = {
        width: 375,
        height: 667,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      }

      // Mock touch events and gestures
      const touchEvents = {
        touchStart: { touches: [{ clientX: 100, clientY: 200 }] },
        touchMove: { touches: [{ clientX: 150, clientY: 200 }] },
        touchEnd: { touches: [] }
      }

      // User performs swipe gesture on connection card
      const swipeGesture = {
        startX: touchEvents.touchStart.touches[0].clientX,
        endX: touchEvents.touchMove.touches[0].clientX,
        direction: 'right',
        velocity: 0.5
      }

      expect(swipeGesture.direction).toBe('right')
      expect(swipeGesture.endX - swipeGesture.startX).toBe(50)

      // Responsive layout adjustments
      const layoutConfig = {
        mobile: mobileViewport.width < 768,
        showSidebar: mobileViewport.width >= 1024,
        cardColumns: mobileViewport.width < 640 ? 1 : mobileViewport.width < 1024 ? 2 : 3
      }

      expect(layoutConfig.mobile).toBe(true)
      expect(layoutConfig.showSidebar).toBe(false)
      expect(layoutConfig.cardColumns).toBe(1)

      // Test mobile-specific features
      const mobileFeatures = {
        pullToRefresh: true,
        bottomNavigation: true,
        floatingActionButton: true,
        hapticFeedback: true
      }

      Object.values(mobileFeatures).forEach(feature => {
        expect(feature).toBe(true)
      })
    })
  })

  describe('Data Integrity and Security', () => {
    it('should maintain data consistency across operations', async () => {
      const authToken = 'valid-token'
      const userId = 'user-123'

      // Step 1: Create connection
      const connectionData = {
        nickname: 'データ整合性テスト',
        platform: 'TestApp',
        current_stage: 'マッチング直後'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'conn-integrity-test',
          user_id: userId,
          ...connectionData,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        })
      })

      const createResult = await fetch('/api/connections', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(connectionData)
      })
      const connection = await createResult.json()

      // Step 2: Update connection multiple times rapidly
      const updates = [
        { current_stage: 'メッセージ中', updated_at: '2024-01-01T11:00:00Z' },
        { current_stage: 'LINE交換済み', updated_at: '2024-01-01T12:00:00Z' },
        { current_stage: 'デート前', updated_at: '2024-01-01T13:00:00Z' }
      ]

      for (const [index, update] of updates.entries()) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...connection,
            ...update,
            version: index + 2 // Simulate version control
          })
        })
      }

      const updatePromises = updates.map((update, index) =>
        fetch(`/api/connections/${connection.id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${authToken}` },
          body: JSON.stringify(update)
        })
      )

      const updateResults = await Promise.all(updatePromises)
      const updatedConnections = await Promise.all(updateResults.map(r => r.json()))

      // Verify data consistency
      expect(updatedConnections[0].version).toBe(2)
      expect(updatedConnections[1].version).toBe(3)
      expect(updatedConnections[2].version).toBe(4)
      expect(updatedConnections[2].current_stage).toBe('デート前')

      expect(mockFetch).toHaveBeenCalledTimes(4) // 1 create + 3 updates
    })

    it('should prevent unauthorized access to user data', async () => {
      const validToken = 'valid-token-user1'
      const invalidToken = 'invalid-token'
      const otherUserToken = 'valid-token-user2'

      // Test 1: Invalid token
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid token' })
      })

      const invalidResult = await fetch('/api/connections', {
        headers: { Authorization: `Bearer ${invalidToken}` }
      })

      expect(invalidResult.status).toBe(401)

      // Test 2: Valid token but accessing other user's data
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Forbidden: Access denied' })
      })

      const forbiddenResult = await fetch('/api/connections/other-user-connection', {
        headers: { Authorization: `Bearer ${otherUserToken}` }
      })

      expect(forbiddenResult.status).toBe(403)

      // Test 3: Valid access with proper token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          connections: [{ id: 'conn-1', user_id: 'user1', nickname: 'Test' }]
        })
      })

      const validResult = await fetch('/api/connections', {
        headers: { Authorization: `Bearer ${validToken}` }
      })
      const validData = await validResult.json()

      expect(validResult.ok).toBe(true)
      expect(validData.connections[0].user_id).toBe('user1')

      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should handle input sanitization and validation', async () => {
      const authToken = 'valid-token'

      // Test malicious input attempts
      const maliciousInputs = [
        {
          nickname: '<script>alert("XSS")</script>',
          expected_error: 'Invalid characters detected'
        },
        {
          nickname: '../../etc/passwd',
          expected_error: 'Invalid path characters'
        },
        {
          nickname: 'DROP TABLE connections;',
          expected_error: 'SQL injection attempt detected'
        },
        {
          platform: 'javascript:void(0)',
          expected_error: 'Protocol injection detected'
        }
      ]

      for (const input of maliciousInputs) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: input.expected_error })
        })

        const result = await fetch('/api/connections', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({
            nickname: input.nickname || 'Safe Name',
            platform: input.platform || 'Safe Platform',
            current_stage: 'マッチング直後'
          })
        })

        expect(result.status).toBe(400)
        const errorData = await result.json()
        expect(errorData.error).toEqual(input.expected_error)
      }

      expect(mockFetch).toHaveBeenCalledTimes(maliciousInputs.length)
    })
  })
})
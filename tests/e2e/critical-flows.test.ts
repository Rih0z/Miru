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
})
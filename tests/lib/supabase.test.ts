// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => {
  const mockFrom = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  }

  const mockSupabaseClient = {
    from: jest.fn(() => mockFrom),
  }

  return {
    createClient: jest.fn(() => mockSupabaseClient),
    __mockClient: mockSupabaseClient,
    __mockFrom: mockFrom
  }
})

// Mock console methods
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation()
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()
const mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation()

describe('Supabase Module', () => {
  let mockSupabaseClient: any
  let mockFrom: any
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    
    // Reset environment variables
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      NODE_ENV: 'test'
    }
    
    // Get mocked objects after reset
    const supabaseMock = require('@supabase/supabase-js')
    mockSupabaseClient = supabaseMock.__mockClient
    mockFrom = supabaseMock.__mockFrom
    
    // Reset all mock functions and ensure they return 'this' for chaining
    mockSupabaseClient.from.mockReturnValue(mockFrom)
    Object.keys(mockFrom).forEach((key) => {
      if (typeof mockFrom[key] === 'function') {
        mockFrom[key].mockReturnThis()
      }
    })
  })

  afterEach(() => {
    process.env = originalEnv
    mockConsoleWarn.mockClear()
    mockConsoleError.mockClear()
    mockConsoleInfo.mockClear()
  })

  afterAll(() => {
    mockConsoleWarn.mockRestore()
    mockConsoleError.mockRestore()
    mockConsoleInfo.mockRestore()
  })

  describe('Module initialization', () => {
    it('should create supabase client when environment variables are set', () => {
      const { supabase } = require('@/lib/supabase')
      const { createClient } = require('@supabase/supabase-js')
      
      expect(createClient).toHaveBeenCalledWith('https://test.supabase.co', 'test-anon-key', expect.objectContaining({
        auth: { persistSession: false }
      }))
      expect(supabase).toBeDefined()
    })

    it('should set supabase to null when environment variables are missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''
      jest.resetModules()
      
      const { supabase } = require('@/lib/supabase')
      expect(supabase).toBeNull()
    })

    it('should warn when supabase is required but not configured', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''
      process.env.NODE_ENV = 'production'
      
      // Mock window object to simulate browser environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true
      })
      
      jest.resetModules()
      require('@/lib/supabase')
      
      expect(mockConsoleInfo).toHaveBeenCalledWith(
        '🎯 Miruはデモモードで動作しています。Supabaseを設定するとフル機能が利用できます。'
      )
      
      // Clean up
      delete (global as any).window
    })
  })

  describe('User operations', () => {
    let db: any

    beforeEach(() => {
      const supabaseModule = require('@/lib/supabase')
      db = supabaseModule.db
    })

    describe('getUser', () => {
      it('should successfully get user by id', async () => {
        const mockUser = { id: 'user-123', email: 'test@example.com' }
        mockFrom.single.mockResolvedValueOnce({ data: mockUser, error: null })

        const result = await db.getUser('user-123')

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('users')
        expect(mockFrom.select).toHaveBeenCalledWith('*')
        expect(mockFrom.eq).toHaveBeenCalledWith('id', 'user-123')
        expect(mockFrom.single).toHaveBeenCalled()
        expect(result).toEqual(mockUser)
      })

      it('should throw error when supabase is not configured', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = ''
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''
        jest.resetModules()
        const { db } = require('@/lib/supabase')

        await expect(db.getUser('user-123')).rejects.toThrow('Supabase is not configured')
      })

      it('should throw error when database operation fails', async () => {
        const mockError = { message: 'Database error' }
        mockFrom.single.mockResolvedValueOnce({ data: null, error: mockError })

        await expect(db.getUser('user-123')).rejects.toEqual(mockError)
      })
    })

    describe('createUser', () => {
      it('should successfully create a new user', async () => {
        const newUser = { email: 'test@example.com', name: 'Test User' }
        const createdUser = { id: 'user-123', ...newUser }
        mockFrom.single.mockResolvedValueOnce({ data: createdUser, error: null })

        const result = await db.createUser(newUser)

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('users')
        expect(mockFrom.insert).toHaveBeenCalledWith(newUser)
        expect(mockFrom.select).toHaveBeenCalled()
        expect(mockFrom.single).toHaveBeenCalled()
        expect(result).toEqual(createdUser)
      })

      it('should throw error when supabase is not configured', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = ''
        jest.resetModules()
        const { db } = require('@/lib/supabase')

        await expect(db.createUser({})).rejects.toThrow('Supabase is not configured')
      })

      it('should throw error when user creation fails', async () => {
        const mockError = { message: 'User creation failed' }
        mockFrom.single.mockResolvedValueOnce({ data: null, error: mockError })

        await expect(db.createUser({})).rejects.toEqual(mockError)
      })
    })
  })

  describe('Connection operations', () => {
    let db: any

    beforeEach(() => {
      const supabaseModule = require('@/lib/supabase')
      db = supabaseModule.db
    })

    describe('getConnections', () => {
      it('should successfully get connections for a user', async () => {
        const mockConnections = [
          { id: 'conn-1', user_id: 'user-123', nickname: 'Test1' },
          { id: 'conn-2', user_id: 'user-123', nickname: 'Test2' }
        ]
        mockFrom.order.mockResolvedValueOnce({ data: mockConnections, error: null })

        const result = await db.getConnections('user-123')

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('connections')
        expect(mockFrom.select).toHaveBeenCalledWith('*')
        expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123')
        expect(mockFrom.order).toHaveBeenCalledWith('updated_at', { ascending: false })
        expect(result).toEqual(mockConnections)
      })

      it('should return empty array when supabase is not configured', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = ''
        jest.resetModules()
        const { db } = require('@/lib/supabase')

        const result = await db.getConnections('user-123')
        
        expect(mockConsoleWarn).toHaveBeenCalledWith('Supabase not configured, returning empty array')
        expect(result).toEqual([])
      })

      it('should return empty array and log error when database operation fails', async () => {
        const mockError = { message: 'Database error' }
        mockFrom.order.mockResolvedValueOnce({ data: null, error: mockError })

        const result = await db.getConnections('user-123')

        expect(mockConsoleError).toHaveBeenCalledWith('Error fetching connections:', mockError)
        expect(result).toEqual([])
      })

      it('should return empty array when data is null', async () => {
        mockFrom.order.mockResolvedValueOnce({ data: null, error: null })

        const result = await db.getConnections('user-123')

        expect(result).toEqual([])
      })

      it('should handle exceptions and return empty array', async () => {
        mockFrom.order.mockRejectedValueOnce(new Error('Network error'))

        const result = await db.getConnections('user-123')

        expect(mockConsoleError).toHaveBeenCalledWith('Failed to fetch connections:', expect.any(Error))
        expect(result).toEqual([])
      })
    })

    describe('createConnection', () => {
      it('should successfully create a new connection', async () => {
        const newConnection = { user_id: 'user-123', nickname: 'Test', platform: 'App' }
        const createdConnection = { id: 'conn-123', ...newConnection }
        mockFrom.single.mockResolvedValueOnce({ data: createdConnection, error: null })

        const result = await db.createConnection(newConnection)

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('connections')
        expect(mockFrom.insert).toHaveBeenCalledWith({
          ...newConnection,
          created_at: expect.any(String),
          updated_at: expect.any(String)
        })
        expect(mockFrom.select).toHaveBeenCalled()
        expect(mockFrom.single).toHaveBeenCalled()
        expect(result).toEqual(createdConnection)
      })

      it('should throw error when supabase is not configured', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = ''
        jest.resetModules()
        const { db } = require('@/lib/supabase')

        await expect(db.createConnection({})).rejects.toThrow('Supabase is not configured')
      })

      it('should throw error when connection creation fails', async () => {
        const mockError = { message: 'Connection creation failed' }
        mockFrom.single.mockResolvedValueOnce({ data: null, error: mockError })

        await expect(db.createConnection({})).rejects.toEqual(mockError)
      })
    })

    describe('updateConnection', () => {
      it('should successfully update a connection', async () => {
        const updates = { nickname: 'Updated Name' }
        const updatedConnection = { id: 'conn-123', ...updates }
        mockFrom.single.mockResolvedValueOnce({ data: updatedConnection, error: null })

        const result = await db.updateConnection('conn-123', updates)

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('connections')
        expect(mockFrom.update).toHaveBeenCalledWith({
          ...updates,
          updated_at: expect.any(String)
        })
        expect(mockFrom.eq).toHaveBeenCalledWith('id', 'conn-123')
        expect(mockFrom.select).toHaveBeenCalled()
        expect(mockFrom.single).toHaveBeenCalled()
        expect(result).toEqual(updatedConnection)
      })

      it('should throw error when supabase is not configured', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = ''
        jest.resetModules()
        const { db } = require('@/lib/supabase')

        await expect(db.updateConnection('conn-123', {})).rejects.toThrow('Supabase is not configured')
      })

      it('should throw error when connection update fails', async () => {
        const mockError = { message: 'Connection update failed' }
        mockFrom.single.mockResolvedValueOnce({ data: null, error: mockError })

        await expect(db.updateConnection('conn-123', {})).rejects.toEqual(mockError)
      })
    })

    describe('deleteConnection', () => {
      it('should successfully delete a connection', async () => {
        mockFrom.eq.mockResolvedValueOnce({ error: null })

        await db.deleteConnection('conn-123')

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('connections')
        expect(mockFrom.delete).toHaveBeenCalled()
        expect(mockFrom.eq).toHaveBeenCalledWith('id', 'conn-123')
      })

      it('should throw error when supabase is not configured', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = ''
        jest.resetModules()
        const { db } = require('@/lib/supabase')

        await expect(db.deleteConnection('conn-123')).rejects.toThrow('Supabase is not configured')
      })

      it('should throw error when connection deletion fails', async () => {
        const mockError = { message: 'Connection deletion failed' }
        mockFrom.eq.mockResolvedValueOnce({ error: mockError })

        await expect(db.deleteConnection('conn-123')).rejects.toEqual(mockError)
      })
    })
  })

  describe('Progress tracking operations', () => {
    let db: any

    beforeEach(() => {
      const supabaseModule = require('@/lib/supabase')
      db = supabaseModule.db
    })

    describe('getProgress', () => {
      it('should successfully get progress for a connection', async () => {
        const mockProgress = [
          { id: 'prog-1', connection_id: 'conn-123', hope_score: 75 }
        ]
        mockFrom.order.mockResolvedValueOnce({ data: mockProgress, error: null })

        const result = await db.getProgress('conn-123')

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('progress_tracking')
        expect(mockFrom.select).toHaveBeenCalledWith('*')
        expect(mockFrom.eq).toHaveBeenCalledWith('connection_id', 'conn-123')
        expect(mockFrom.order).toHaveBeenCalledWith('recorded_at', { ascending: false })
        expect(result).toEqual(mockProgress)
      })

      it('should return empty array when data is null', async () => {
        mockFrom.order.mockResolvedValueOnce({ data: null, error: null })

        const result = await db.getProgress('conn-123')

        expect(result).toEqual([])
      })

      it('should throw error when supabase is not configured', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = ''
        jest.resetModules()
        const { db } = require('@/lib/supabase')

        await expect(db.getProgress('conn-123')).rejects.toThrow('Supabase is not configured')
      })

      it('should throw error when progress fetch fails', async () => {
        const mockError = { message: 'Progress fetch failed' }
        mockFrom.order.mockResolvedValueOnce({ data: null, error: mockError })

        await expect(db.getProgress('conn-123')).rejects.toEqual(mockError)
      })
    })

    describe('addProgressEntry', () => {
      it('should successfully add a progress entry', async () => {
        const newProgress = { connection_id: 'conn-123', hope_score: 80 }
        const addedProgress = { id: 'prog-123', ...newProgress }
        mockFrom.single.mockResolvedValueOnce({ data: addedProgress, error: null })

        const result = await db.addProgressEntry(newProgress)

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('progress_tracking')
        expect(mockFrom.insert).toHaveBeenCalledWith(newProgress)
        expect(mockFrom.select).toHaveBeenCalled()
        expect(mockFrom.single).toHaveBeenCalled()
        expect(result).toEqual(addedProgress)
      })

      it('should throw error when supabase is not configured', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = ''
        jest.resetModules()
        const { db } = require('@/lib/supabase')

        await expect(db.addProgressEntry({})).rejects.toThrow('Supabase is not configured')
      })

      it('should throw error when progress entry addition fails', async () => {
        const mockError = { message: 'Progress entry addition failed' }
        mockFrom.single.mockResolvedValueOnce({ data: null, error: mockError })

        await expect(db.addProgressEntry({})).rejects.toEqual(mockError)
      })
    })
  })

  describe('Action history operations', () => {
    let db: any

    beforeEach(() => {
      const supabaseModule = require('@/lib/supabase')
      db = supabaseModule.db
    })

    describe('getActionHistory', () => {
      it('should successfully get action history for a connection', async () => {
        const mockHistory = [
          { id: 'action-1', connection_id: 'conn-123', action_type: 'message_sent' }
        ]
        mockFrom.order.mockResolvedValueOnce({ data: mockHistory, error: null })

        const result = await db.getActionHistory('conn-123')

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('action_history')
        expect(mockFrom.select).toHaveBeenCalledWith('*')
        expect(mockFrom.eq).toHaveBeenCalledWith('connection_id', 'conn-123')
        expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false })
        expect(result).toEqual(mockHistory)
      })

      it('should return empty array when data is null', async () => {
        mockFrom.order.mockResolvedValueOnce({ data: null, error: null })

        const result = await db.getActionHistory('conn-123')

        expect(result).toEqual([])
      })

      it('should throw error when supabase is not configured', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = ''
        jest.resetModules()
        const { db } = require('@/lib/supabase')

        await expect(db.getActionHistory('conn-123')).rejects.toThrow('Supabase is not configured')
      })

      it('should throw error when action history fetch fails', async () => {
        const mockError = { message: 'Action history fetch failed' }
        mockFrom.order.mockResolvedValueOnce({ data: null, error: mockError })

        await expect(db.getActionHistory('conn-123')).rejects.toEqual(mockError)
      })
    })

    describe('addActionHistory', () => {
      it('should successfully add action history', async () => {
        const newAction = { connection_id: 'conn-123', action_type: 'message_sent' }
        const addedAction = { id: 'action-123', ...newAction }
        mockFrom.single.mockResolvedValueOnce({ data: addedAction, error: null })

        const result = await db.addActionHistory(newAction)

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('action_history')
        expect(mockFrom.insert).toHaveBeenCalledWith(newAction)
        expect(mockFrom.select).toHaveBeenCalled()
        expect(mockFrom.single).toHaveBeenCalled()
        expect(result).toEqual(addedAction)
      })

      it('should throw error when supabase is not configured', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = ''
        jest.resetModules()
        const { db } = require('@/lib/supabase')

        await expect(db.addActionHistory({})).rejects.toThrow('Supabase is not configured')
      })

      it('should throw error when action history addition fails', async () => {
        const mockError = { message: 'Action history addition failed' }
        mockFrom.single.mockResolvedValueOnce({ data: null, error: mockError })

        await expect(db.addActionHistory({})).rejects.toEqual(mockError)
      })
    })
  })

  describe('Prompt history operations', () => {
    let db: any

    beforeEach(() => {
      const supabaseModule = require('@/lib/supabase')
      db = supabaseModule.db
    })

    describe('savePromptHistory', () => {
      it('should successfully save prompt history', async () => {
        const newPrompt = { 
          connection_id: 'conn-123', 
          prompt_type: 'conversation',
          ai_type: 'gpt-4',
          prompt_content: 'Test prompt'
        }
        const savedPrompt = { id: 'prompt-123', ...newPrompt }
        mockFrom.single.mockResolvedValueOnce({ data: savedPrompt, error: null })

        const result = await db.savePromptHistory(newPrompt)

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('prompt_history')
        expect(mockFrom.insert).toHaveBeenCalledWith(newPrompt)
        expect(mockFrom.select).toHaveBeenCalled()
        expect(mockFrom.single).toHaveBeenCalled()
        expect(result).toEqual(savedPrompt)
      })

      it('should throw error when supabase is not configured', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = ''
        jest.resetModules()
        const { db } = require('@/lib/supabase')

        await expect(db.savePromptHistory({})).rejects.toThrow('Supabase is not configured')
      })

      it('should throw error when prompt history save fails', async () => {
        const mockError = { message: 'Prompt history save failed' }
        mockFrom.single.mockResolvedValueOnce({ data: null, error: mockError })

        await expect(db.savePromptHistory({})).rejects.toEqual(mockError)
      })
    })
  })

  describe('SQL schema export', () => {
    it('should export createTables SQL string', () => {
      const { createTables } = require('@/lib/supabase')
      
      expect(typeof createTables).toBe('string')
      expect(createTables).toContain('CREATE TABLE IF NOT EXISTS users')
      expect(createTables).toContain('CREATE TABLE IF NOT EXISTS connections')
      expect(createTables).toContain('CREATE TABLE IF NOT EXISTS progress_tracking')
      expect(createTables).toContain('CREATE TABLE IF NOT EXISTS action_history')
      expect(createTables).toContain('CREATE TABLE IF NOT EXISTS prompt_history')
      expect(createTables).toContain('CREATE INDEX IF NOT EXISTS')
    })
  })
})
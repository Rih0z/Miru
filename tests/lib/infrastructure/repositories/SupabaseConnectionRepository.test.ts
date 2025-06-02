import { SupabaseConnectionRepository } from '@/lib/infrastructure/repositories/SupabaseConnectionRepository'
import { supabase } from '@/lib/supabase'
import { Connection } from '@/types'

// Supabaseクライアントをモック
jest.mock('@/lib/supabase', () => {
  const mockFrom = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  }

  return {
    supabase: {
      from: jest.fn(() => mockFrom),
    },
    __mockFrom: mockFrom
  }
})

describe('SupabaseConnectionRepository', () => {
  let repository: SupabaseConnectionRepository
  let mockSupabaseQuery: any

  beforeEach(() => {
    repository = new SupabaseConnectionRepository()
    
    // Get the mock object
    const supabaseMock = require('@/lib/supabase')
    mockSupabaseQuery = supabaseMock.__mockFrom
    
    // Reset all mock functions
    Object.values(mockSupabaseQuery).forEach((mock: any) => {
      if (typeof mock === 'function' && mock.mockReset) {
        mock.mockReset()
        mock.mockReturnThis()
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findByUserId', () => {
    it('should fetch connections for a user', async () => {
      const mockConnections = [
        { id: '1', user_id: 'user-123', nickname: 'Test 1' },
        { id: '2', user_id: 'user-123', nickname: 'Test 2' }
      ]
      mockSupabaseQuery.order.mockResolvedValueOnce({ data: mockConnections, error: null })

      const result = await repository.findByUserId('user-123')

      expect(supabase.from).toHaveBeenCalledWith('connections')
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(mockSupabaseQuery.order).toHaveBeenCalledWith('updated_at', { ascending: false })
      expect(result).toEqual(mockConnections)
    })

    it('should throw error on database error', async () => {
      mockSupabaseQuery.order.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Database error' } 
      })

      await expect(repository.findByUserId('user-123'))
        .rejects.toThrow('データベースエラー: Database error')
    })
  })

  describe('findById', () => {
    it('should fetch connection by id', async () => {
      const mockConnection = { id: '1', user_id: 'user-123', nickname: 'Test' }
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: mockConnection, error: null })

      const result = await repository.findById('1')

      expect(supabase.from).toHaveBeenCalledWith('connections')
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(mockSupabaseQuery.single).toHaveBeenCalled()
      expect(result).toEqual(mockConnection)
    })

    it('should return null when connection not found', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116' } 
      })

      const result = await repository.findById('nonexistent')
      expect(result).toBeNull()
    })

    it('should throw error on database error', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Database error', code: 'OTHER' } 
      })

      await expect(repository.findById('1'))
        .rejects.toThrow('データベースエラー: Database error')
    })
  })

  describe('create', () => {
    it('should create new connection', async () => {
      const connectionData = {
        user_id: 'user-123',
        nickname: 'Test',
        platform: 'TestApp',
        current_stage: 'メッセージ中' as const,
        basic_info: {},
        communication: {},
        user_feelings: {}
      }
      const mockCreatedConnection = { id: '1', ...connectionData }
      mockSupabaseQuery.single.mockResolvedValueOnce({ 
        data: mockCreatedConnection, 
        error: null 
      })

      const result = await repository.create(connectionData)

      expect(supabase.from).toHaveBeenCalledWith('connections')
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith(connectionData)
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseQuery.single).toHaveBeenCalled()
      expect(result).toEqual(mockCreatedConnection)
    })

    it('should throw error on creation failure', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Creation failed' } 
      })

      await expect(repository.create({
        user_id: 'user-123',
        nickname: 'Test',
        platform: 'TestApp',
        current_stage: 'メッセージ中',
        basic_info: {},
        communication: {},
        user_feelings: {}
      })).rejects.toThrow('データベースエラー: Creation failed')
    })
  })

  describe('update', () => {
    it('should update connection', async () => {
      const updates = { nickname: 'Updated Name' }
      const mockUpdatedConnection = { id: '1', nickname: 'Updated Name' }
      mockSupabaseQuery.single.mockResolvedValueOnce({ 
        data: mockUpdatedConnection, 
        error: null 
      })

      const result = await repository.update('1', updates)

      expect(supabase.from).toHaveBeenCalledWith('connections')
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(String)
      })
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseQuery.single).toHaveBeenCalled()
      expect(result).toEqual(mockUpdatedConnection)
    })

    it('should throw error on update failure', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Update failed' } 
      })

      await expect(repository.update('1', { nickname: 'Test' }))
        .rejects.toThrow('データベースエラー: Update failed')
    })
  })

  describe('delete', () => {
    it('should delete connection', async () => {
      mockSupabaseQuery.eq.mockResolvedValueOnce({ error: null })

      await repository.delete('1')

      expect(supabase.from).toHaveBeenCalledWith('connections')
      expect(mockSupabaseQuery.delete).toHaveBeenCalled()
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', '1')
    })

    it('should throw error on deletion failure', async () => {
      mockSupabaseQuery.eq.mockResolvedValueOnce({ 
        error: { message: 'Deletion failed' } 
      })

      await expect(repository.delete('1'))
        .rejects.toThrow('データベースエラー: Deletion failed')
    })
  })
})
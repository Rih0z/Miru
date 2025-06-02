import { UserService, UserProfile } from '@/lib/userService'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  }
}))

// Mock console methods
const consoleSpy = {
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {})
}

describe('UserService', () => {
  let userService: UserService
  let mockSupabaseQuery: any
  let mockUserProfile: UserProfile
  let mockUser: User
  let originalSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    consoleSpy.warn.mockClear()
    consoleSpy.error.mockClear()

    // Store original supabase
    originalSupabase = (require('@/lib/supabase') as any).supabase

    userService = new UserService()

    mockUserProfile = {
      id: 'user-123',
      email: 'test@example.com',
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
      }
    } as User

    // Reset the mock to have a clean slate
    mockSupabaseQuery = {
      select: jest.fn(() => mockSupabaseQuery),
      eq: jest.fn(() => mockSupabaseQuery),
      single: jest.fn(),
      insert: jest.fn(() => mockSupabaseQuery),
      update: jest.fn(() => mockSupabaseQuery),
      delete: jest.fn(() => mockSupabaseQuery)
    }

    // Ensure supabase is properly mocked
    ;(require('@/lib/supabase') as any).supabase = {
      from: jest.fn().mockReturnValue(mockSupabaseQuery)
    }
  })

  afterEach(() => {
    // Restore original supabase after each test
    ;(require('@/lib/supabase') as any).supabase = originalSupabase
  })

  afterAll(() => {
    consoleSpy.warn.mockRestore()
    consoleSpy.error.mockRestore()
  })

  describe('getUserProfile', () => {
    it('should return user profile when found', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockUserProfile,
        error: null
      })

      const result = await userService.getUserProfile('user-123')

      expect(result).toEqual(mockUserProfile)
      expect((require('@/lib/supabase') as any).supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'user-123')
      expect(mockSupabaseQuery.single).toHaveBeenCalled()
    })

    it('should return null when user not found', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found', code: 'PGRST116' }
      })

      const result = await userService.getUserProfile('nonexistent-user')

      expect(result).toBeNull()
      expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching user profile:', { message: 'User not found', code: 'PGRST116' })
    })

    it('should return null when supabase is not configured', async () => {
      // Mock supabase as null
      ;(require('@/lib/supabase') as any).supabase = null

      const result = await userService.getUserProfile('user-123')

      expect(result).toBeNull()
      expect(consoleSpy.warn).toHaveBeenCalledWith('Supabase not configured')
    })

    it('should handle database errors gracefully', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection error', code: 'CONNECTION_ERROR' }
      })

      const result = await userService.getUserProfile('user-123')

      expect(result).toBeNull()
      expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching user profile:', { message: 'Database connection error', code: 'CONNECTION_ERROR' })
    })

    it('should handle thrown exceptions', async () => {
      mockSupabaseQuery.single.mockRejectedValue(new Error('Network error'))

      const result = await userService.getUserProfile('user-123')

      expect(result).toBeNull()
      expect(consoleSpy.error).toHaveBeenCalledWith('Failed to fetch user profile:', new Error('Network error'))
    })
  })

  describe('createUserProfile', () => {
    it('should create user profile successfully', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockUserProfile,
        error: null
      })

      const result = await userService.createUserProfile(mockUser)

      expect(result).toEqual(mockUserProfile)
      expect((require('@/lib/supabase') as any).supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
      })
      expect(mockSupabaseQuery.select).toHaveBeenCalled()
      expect(mockSupabaseQuery.single).toHaveBeenCalled()
    })

    it('should handle user without metadata', async () => {
      const userWithoutMetadata = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {}
      } as User

      mockSupabaseQuery.single.mockResolvedValue({
        data: { ...mockUserProfile, full_name: null, avatar_url: null },
        error: null
      })

      const result = await userService.createUserProfile(userWithoutMetadata)

      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        full_name: null,
        avatar_url: null
      })
      expect(result).toBeDefined()
    })

    it('should throw error when supabase is not configured', async () => {
      ;(require('@/lib/supabase') as any).supabase = null

      await expect(userService.createUserProfile(mockUser))
        .rejects.toThrow('Supabase is not configured')
    })

    it('should return null on database error', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Duplicate key violation', code: '23505' }
      })

      const result = await userService.createUserProfile(mockUser)

      expect(result).toBeNull()
      expect(consoleSpy.error).toHaveBeenCalledWith('Error creating user profile:', { message: 'Duplicate key violation', code: '23505' })
    })

    it('should handle thrown exceptions', async () => {
      mockSupabaseQuery.single.mockRejectedValue(new Error('Network error'))

      const result = await userService.createUserProfile(mockUser)

      expect(result).toBeNull()
      expect(consoleSpy.error).toHaveBeenCalledWith('Failed to create user profile:', new Error('Network error'))
    })
  })

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updates = { full_name: 'Updated Name', avatar_url: 'https://example.com/new-avatar.jpg' }
      const updatedProfile = { ...mockUserProfile, ...updates }

      mockSupabaseQuery.single.mockResolvedValue({
        data: updatedProfile,
        error: null
      })

      const result = await userService.updateUserProfile('user-123', updates)

      expect(result).toEqual(updatedProfile)
      expect((require('@/lib/supabase') as any).supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(String)
      })
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'user-123')
      expect(mockSupabaseQuery.select).toHaveBeenCalled()
      expect(mockSupabaseQuery.single).toHaveBeenCalled()
    })

    it('should update only provided fields', async () => {
      const updates = { full_name: 'New Name' }

      mockSupabaseQuery.single.mockResolvedValue({
        data: { ...mockUserProfile, full_name: 'New Name' },
        error: null
      })

      await userService.updateUserProfile('user-123', updates)

      expect(mockSupabaseQuery.update).toHaveBeenCalledWith({
        full_name: 'New Name',
        updated_at: expect.any(String)
      })
    })

    it('should throw error when supabase is not configured', async () => {
      ;(require('@/lib/supabase') as any).supabase = null

      await expect(userService.updateUserProfile('user-123', { full_name: 'Test' }))
        .rejects.toThrow('Supabase is not configured')
    })

    it('should return null on database error', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found', code: 'PGRST116' }
      })

      const result = await userService.updateUserProfile('user-123', { full_name: 'Test' })

      expect(result).toBeNull()
      expect(consoleSpy.error).toHaveBeenCalledWith('Error updating user profile:', { message: 'User not found', code: 'PGRST116' })
    })

    it('should handle thrown exceptions', async () => {
      mockSupabaseQuery.single.mockRejectedValue(new Error('Network error'))

      const result = await userService.updateUserProfile('user-123', { full_name: 'Test' })

      expect(result).toBeNull()
      expect(consoleSpy.error).toHaveBeenCalledWith('Failed to update user profile:', new Error('Network error'))
    })

    it('should include updated_at timestamp', async () => {
      const beforeUpdate = Date.now()
      
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockUserProfile,
        error: null
      })

      await userService.updateUserProfile('user-123', { full_name: 'Test' })

      const afterUpdate = Date.now()
      const updateCall = mockSupabaseQuery.update.mock.calls[0][0]
      const updatedAt = new Date(updateCall.updated_at).getTime()

      expect(updatedAt).toBeGreaterThanOrEqual(beforeUpdate)
      expect(updatedAt).toBeLessThanOrEqual(afterUpdate)
    })
  })

  describe('checkUserExists', () => {
    it('should return true when user exists', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockUserProfile,
        error: null
      })

      const result = await userService.checkUserExists('user-123')

      expect(result).toBe(true)
    })

    it('should return false when user does not exist', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found', code: 'PGRST116' }
      })

      const result = await userService.checkUserExists('nonexistent-user')

      expect(result).toBe(false)
    })

    it('should return false on any error', async () => {
      mockSupabaseQuery.single.mockRejectedValue(new Error('Database error'))

      const result = await userService.checkUserExists('user-123')

      expect(result).toBe(false)
    })
  })

  describe('deleteUserAccount', () => {
    it('should delete user account successfully', async () => {
      mockSupabaseQuery.eq.mockResolvedValue({
        error: null
      })

      const result = await userService.deleteUserAccount('user-123')

      expect(result).toEqual({ success: true })
      expect((require('@/lib/supabase') as any).supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseQuery.delete).toHaveBeenCalled()
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'user-123')
    })

    it('should return error when supabase is not configured', async () => {
      ;(require('@/lib/supabase') as any).supabase = null

      const result = await userService.deleteUserAccount('user-123')

      expect(result).toEqual({
        success: false,
        error: 'Supabase is not configured'
      })
    })

    it('should handle database error', async () => {
      mockSupabaseQuery.eq.mockResolvedValue({
        error: { message: 'Foreign key constraint violation', code: '23503' }
      })

      const result = await userService.deleteUserAccount('user-123')

      expect(result).toEqual({
        success: false,
        error: 'Foreign key constraint violation'
      })
    })

    it('should handle thrown exceptions with Error objects', async () => {
      mockSupabaseQuery.eq.mockRejectedValue(new Error('Network connection failed'))

      const result = await userService.deleteUserAccount('user-123')

      expect(result).toEqual({
        success: false,
        error: 'Network connection failed'
      })
    })

    it('should handle thrown exceptions with non-Error objects', async () => {
      mockSupabaseQuery.eq.mockRejectedValue('String error')

      const result = await userService.deleteUserAccount('user-123')

      expect(result).toEqual({
        success: false,
        error: 'Unknown error'
      })
    })

    it('should handle null error gracefully', async () => {
      mockSupabaseQuery.eq.mockRejectedValue(null)

      const result = await userService.deleteUserAccount('user-123')

      expect(result).toEqual({
        success: false,
        error: 'Unknown error'
      })
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete user lifecycle', async () => {
      // Create user
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: mockUserProfile,
        error: null
      })

      const created = await userService.createUserProfile(mockUser)
      expect(created).toEqual(mockUserProfile)

      // Check user exists
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: mockUserProfile,
        error: null
      })

      const exists = await userService.checkUserExists('user-123')
      expect(exists).toBe(true)

      // Update user
      const updates = { full_name: 'Updated Name' }
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: { ...mockUserProfile, ...updates },
        error: null
      })

      const updated = await userService.updateUserProfile('user-123', updates)
      expect(updated?.full_name).toBe('Updated Name')

      // Delete user
      mockSupabaseQuery.eq.mockResolvedValueOnce({
        error: null
      })

      const deleted = await userService.deleteUserAccount('user-123')
      expect(deleted.success).toBe(true)
    })

    it('should handle user creation with minimal data', async () => {
      const minimalUser = {
        id: 'user-minimal',
        email: 'minimal@example.com'
      } as User

      mockSupabaseQuery.single.mockResolvedValue({
        data: {
          id: 'user-minimal',
          email: 'minimal@example.com',
          full_name: null,
          avatar_url: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        error: null
      })

      const result = await userService.createUserProfile(minimalUser)

      expect(result).toBeDefined()
      expect(result?.email).toBe('minimal@example.com')
      expect(result?.full_name).toBeNull()
      expect(result?.avatar_url).toBeNull()
    })
  })
})
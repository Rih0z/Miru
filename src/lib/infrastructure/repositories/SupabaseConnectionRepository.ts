import { Connection } from '@/types'
import { IConnectionRepository } from '@/lib/domain/interfaces/IConnectionRepository'
import { supabase } from '@/lib/supabase'

/**
 * Supabase Connection Repository Implementation
 * Supabaseを使用したデータアクセス層の実装
 */
export class SupabaseConnectionRepository implements IConnectionRepository {
  
  async findByUserId(userId: string): Promise<Connection[]> {
    // デモユーザーの場合は空配列を返す（ConnectionServiceでデモデータが提供される）
    if (userId === 'demo-user-001') {
      return []
    }
    
    if (!supabase) {
      console.warn('Supabase is not configured - returning empty array')
      return []
    }
    
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`データベースエラー: ${error.message}`)
      }
      
      return data || []
    } catch (error) {
      console.error('Failed to fetch from Supabase:', error)
      // デモモードとして空配列を返す
      return []
    }
  }

  async findById(id: string): Promise<Connection | null> {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`データベースエラー: ${error.message}`)
    }
    
    return data
  }

  async create(connectionData: Omit<Connection, 'id' | 'created_at' | 'updated_at'>): Promise<Connection> {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    
    const { data, error } = await supabase
      .from('connections')
      .insert(connectionData)
      .select('*')
      .single()

    if (error) {
      throw new Error(`データベースエラー: ${error.message}`)
    }
    
    return data
  }

  async update(id: string, updates: Partial<Connection>): Promise<Connection> {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    
    const { data, error } = await supabase
      .from('connections')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      throw new Error(`データベースエラー: ${error.message}`)
    }
    
    return data
  }

  async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`データベースエラー: ${error.message}`)
    }
  }
}
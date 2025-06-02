import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export class UserService {
  /**
   * ユーザープロファイルを取得
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!supabase) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      return null
    }
  }

  /**
   * ユーザープロファイルを作成
   */
  async createUserProfile(user: User): Promise<UserProfile | null> {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }

    try {
      const profileData = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Failed to create user profile:', err)
      return null
    }
  }

  /**
   * ユーザープロファイルを更新
   */
  async updateUserProfile(
    userId: string, 
    updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>
  ): Promise<UserProfile | null> {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Failed to update user profile:', err)
      return null
    }
  }

  /**
   * ユーザーが存在するかチェック（プロファイル存在確認）
   */
  async checkUserExists(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId)
    return profile !== null
  }

  /**
   * ユーザーアカウントを削除
   */
  async deleteUserAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured' }
    }

    try {
      // プロファイルを削除（関連データは外部キー制約により自動削除）
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        return { success: false, error: profileError.message }
      }

      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }
  }
}
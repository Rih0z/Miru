import { Connection, ConnectionStage } from '@/types'

/**
 * Connection Repository Interface
 * データアクセス層の責任を定義
 */
export interface IConnectionRepository {
  findByUserId(userId: string): Promise<Connection[]>
  findById(id: string): Promise<Connection | null>
  create(connectionData: Omit<Connection, 'id' | 'created_at' | 'updated_at'>): Promise<Connection>
  update(id: string, updates: Partial<Connection>): Promise<Connection>
  delete(id: string): Promise<void>
}
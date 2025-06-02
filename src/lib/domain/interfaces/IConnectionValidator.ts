import { Connection } from '@/types'

/**
 * Connection Validator Interface
 * 接続データ検証の責任を定義
 */
export interface IConnectionValidator {
  validateConnectionData(data: Partial<Connection>): ValidationResult
  sanitizeInput(data: any): any
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}
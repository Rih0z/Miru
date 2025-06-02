import { IConnectionValidator, ValidationResult } from '@/lib/domain/interfaces/IConnectionValidator'

/**
 * Connection Validator
 * 接続データの検証とサニタイゼーション
 */
export class ConnectionValidator implements IConnectionValidator {
  
  validateConnectionData(data: any): ValidationResult {
    const errors: string[] = []

    // 必須フィールドの検証
    if (!data.nickname?.trim()) {
      errors.push('ニックネームは必須です')
    }
    
    if (!data.platform?.trim()) {
      errors.push('出会った場所は必須です')
    }

    // 文字列長制限の検証
    if (data.nickname?.trim().length > 50) {
      errors.push('ニックネームは50文字以内で入力してください')
    }

    if (data.platform?.trim().length > 100) {
      errors.push('出会った場所は100文字以内で入力してください')
    }

    // セキュリティ検証
    if (this.containsDangerousContent(data.nickname) || this.containsDangerousContent(data.platform)) {
      errors.push('不正な文字列が含まれています')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  sanitizeInput(data: any): any {
    if (!data) return data

    const sanitized = { ...data }

    // 文字列フィールドのトリムとサニタイゼーション
    if (sanitized.nickname) {
      sanitized.nickname = this.sanitizeString(sanitized.nickname)
    }
    
    if (sanitized.platform) {
      sanitized.platform = this.sanitizeString(sanitized.platform)
    }

    return sanitized
  }

  private containsDangerousContent(str: string): boolean {
    if (!str) return false
    
    const dangerousPattern = /<script|javascript:|data:|vbscript:|on\w+\s*=/i
    return dangerousPattern.test(str)
  }

  private sanitizeString(str: string): string {
    if (!str) return str
    
    return str
      .trim()
      .replace(/[<>]/g, '') // HTMLタグの除去
      .replace(/javascript:/gi, '') // JavaScript URLの除去
      .replace(/data:/gi, '') // Data URLの除去
  }
}
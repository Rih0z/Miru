import { ImportedUserData, ImportedConnection } from '@/types/data-import'
import { Connection, DashboardData, ConnectionStage } from '@/types'

export class DataImportProcessor {
  
  /**
   * インポートされたJSONデータを検証
   */
  validateImportData(jsonData: any): { isValid: boolean, errors: string[], warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []
    
    // 必須フィールドの確認
    if (!jsonData.connections || !Array.isArray(jsonData.connections)) {
      errors.push('connections配列が見つかりません')
    }
    
    if (!jsonData.userProfile || typeof jsonData.userProfile !== 'object') {
      errors.push('userProfileオブジェクトが見つかりません')
    }
    
    if (!jsonData.importMetadata || typeof jsonData.importMetadata !== 'object') {
      errors.push('importMetadataオブジェクトが見つかりません')
    }
    
    // コネクションデータの検証
    if (jsonData.connections && Array.isArray(jsonData.connections)) {
      jsonData.connections.forEach((conn: any, index: number) => {
        if (!conn.nickname) {
          errors.push(`コネクション${index + 1}: nicknameが必要です`)
        }
        if (!conn.platform) {
          errors.push(`コネクション${index + 1}: platformが必要です`)
        }
        if (!conn.currentStage) {
          errors.push(`コネクション${index + 1}: currentStageが必要です`)
        }
        
        // 数値範囲の確認
        const scoreFields = ['attractionLevel', 'compatibilityScore', 'communicationScore']
        scoreFields.forEach(field => {
          if (conn[field] !== undefined && (conn[field] < 1 || conn[field] > 10)) {
            warnings.push(`コネクション${index + 1}: ${field}は1-10の範囲で設定してください`)
          }
        })
      })
    }
    
    // ユーザープロフィールの検証
    if (jsonData.userProfile) {
      if (!jsonData.userProfile.age || typeof jsonData.userProfile.age !== 'number') {
        warnings.push('ユーザープロフィール: 年齢が設定されていません')
      }
      if (!jsonData.userProfile.occupation) {
        warnings.push('ユーザープロフィール: 職業が設定されていません')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  /**
   * インポートデータをMiru形式に変換
   */
  convertToMiruFormat(importData: ImportedUserData): {
    connections: Connection[]
    dashboardData: Partial<DashboardData>
  } {
    const connections: Connection[] = importData.connections.map((conn) => this.convertConnection(conn))
    
    const dashboardData: Partial<DashboardData> = {
      connections,
      totalConnections: connections.length,
      activeConnections: connections.filter(c => 
        ['メッセージ中', 'デート前', 'デート後', '交際中'].includes(c.current_stage)
      ).length,
      averageScore: this.calculateAverageHopeScore(connections),
      recommendedActions: this.generateRecommendedActions(connections),
      bestConnection: this.findBestConnection(connections)
    }
    
    return { connections, dashboardData }
  }
  
  /**
   * インポートされたコネクションをMiru形式に変換
   */
  private convertConnection(imported: ImportedConnection): Connection {
    const connection: Connection = {
      id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'current_user', // 実際のユーザーIDに置き換える
      nickname: imported.nickname,
      platform: imported.platform,
      current_stage: this.mapConnectionStage(imported.currentStage),
      
      basic_info: {
        age: imported.age,
        occupation: imported.occupation,
        location: imported.location,
        hobbies: imported.hobbies || []
      },
      
      communication: {
        frequency: this.determineMessageFrequency(imported.messageHistory),
        lastContact: imported.messageHistory?.length > 0 ? 
          imported.messageHistory[imported.messageHistory.length - 1].date : 
          undefined,
        communicationStyle: imported.responsePatterns?.messageLength || 'medium',
        responseTime: imported.responsePatterns?.averageResponseTime || 'unknown'
      },
      
      user_feelings: {
        expectations: `魅力度: ${imported.attractionLevel || 5}/10, 相性: ${imported.compatibilityScore || 5}/10`,
        concerns: imported.concerns || [],
        attractivePoints: imported.positiveTraits || []
      },
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    return connection
  }
  
  /**
   * メッセージ頻度を判定
   */
  private determineMessageFrequency(messageHistory: any[]): string {
    if (!messageHistory || messageHistory.length === 0) return 'unknown'
    
    const days = this.calculateDateRange(messageHistory)
    const messagesPerDay = messageHistory.length / days
    
    if (messagesPerDay >= 5) return 'very_frequent'
    if (messagesPerDay >= 2) return 'frequent'
    if (messagesPerDay >= 1) return 'daily'
    if (messagesPerDay >= 0.5) return 'every_few_days'
    return 'weekly_or_less'
  }
  
  /**
   * 話題を抽出
   */
  private extractTopics(messageHistory: any[]): string[] {
    if (!messageHistory || messageHistory.length === 0) return []
    
    const commonTopics = [
      '仕事', '趣味', '食べ物', '映画', '音楽', '旅行', '運動', 
      'ペット', '家族', '友人', '休日', '将来', '好きなもの'
    ]
    
    const content = messageHistory.map(m => m.content).join(' ')
    return commonTopics.filter(topic => 
      content.includes(topic) || content.includes(topic.toLowerCase())
    )
  }
  
  /**
   * 日付範囲を計算
   */
  private calculateDateRange(messageHistory: any[]): number {
    if (!messageHistory || messageHistory.length < 2) return 1
    
    const dates = messageHistory.map(m => new Date(m.date)).sort((a, b) => a.getTime() - b.getTime())
    const firstDate = dates[0]
    const lastDate = dates[dates.length - 1]
    
    return Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)))
  }
  
  /**
   * 関係性ポテンシャルを評価
   */
  private assessRelationshipPotential(imported: ImportedConnection): number {
    const attraction = imported.attractionLevel || 5
    const compatibility = imported.compatibilityScore || 5
    const communication = imported.communicationScore || 5
    const hope = imported.userFeelings?.hopefulness || 5
    
    return Math.round((attraction + compatibility + communication + hope) / 4)
  }
  
  /**
   * 平均希望スコアを計算
   */
  private calculateAverageHopeScore(connections: Connection[]): number {
    if (connections.length === 0) return 0
    
    // UserFeelingsには数値スコアがないため、仮の計算をする
    // 実際の実装では、より適切なスコア計算方法を使用する
    return Math.min(8, Math.max(3, connections.length * 2)) // 仮の計算
  }
  
  /**
   * 最近のアクティビティを生成
   */
  private generateRecentActivity(connections: Connection[]): any[] {
    return connections
      .filter(conn => conn.communication.lastContact)
      .sort((a, b) => {
        const dateA = new Date(a.communication.lastContact || 0)
        const dateB = new Date(b.communication.lastContact || 0)
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, 5)
      .map(conn => ({
        id: conn.id,
        type: 'message',
        description: `${conn.nickname}との最近の連絡`,
        timestamp: conn.communication.lastContact,
        connection_id: conn.id
      }))
  }
  
  /**
   * 推奨アクションを生成
   */
  private generateRecommendedActions(connections: Connection[]): any[] {
    return connections
      .filter(conn => 
        ['メッセージ中', 'デート前'].includes(conn.current_stage)
      )
      .map(conn => ({
        id: `action_${conn.id}`,
        connection_id: conn.id,
        title: this.generateActionTitle(conn),
        description: this.suggestNextAction(conn),
        urgency: this.determinePriority(conn),
        estimated_time: '15分',
        type: 'conversation'
      }))
  }
  
  /**
   * アクションタイトルを生成
   */
  private generateActionTitle(connection: Connection): string {
    const stage = connection.current_stage
    const daysSinceLastMessage = this.daysSinceLastMessage(connection)
    
    if (stage === 'メッセージ中' && daysSinceLastMessage > 2) {
      return 'メッセージを送る'
    }
    
    if (stage === 'メッセージ中' && daysSinceLastMessage < 7) {
      return 'デートに誘う'
    }
    
    if (stage === 'デート前') {
      return 'デート詳細を決める'
    }
    
    return '関係を進展させる'
  }
  
  /**
   * 最高のコネクションを見つける
   */
  private findBestConnection(connections: Connection[]): Connection | null {
    if (connections.length === 0) return null
    
    // UserFeelingsには数値フィールドがないため、attractivePointsの数で判定する
    return connections.reduce((best, current) => {
      const bestScore = best.user_feelings.attractivePoints?.length || 0
      const currentScore = current.user_feelings.attractivePoints?.length || 0
      
      return currentScore > bestScore ? current : best
    })
  }
  
  /**
   * 次のアクションを提案
   */
  private suggestNextAction(connection: Connection): string {
    const stage = connection.current_stage
    const daysSinceLastMessage = this.daysSinceLastMessage(connection)
    
    if (stage === 'メッセージ中' && daysSinceLastMessage > 2) {
      return `${connection.nickname}にメッセージを送る`
    }
    
    if (stage === 'メッセージ中' && daysSinceLastMessage < 7) {
      return `${connection.nickname}とのデートを計画する`
    }
    
    if (stage === 'デート前') {
      return `${connection.nickname}とのデート詳細を決める`
    }
    
    return `${connection.nickname}との関係を進展させる`
  }
  
  /**
   * 優先度を決定
   */
  private determinePriority(connection: Connection): 'high' | 'medium' | 'low' {
    // UserFeelingsには数値フィールドがないため、attractivePointsの数で判定
    const attractivePointsCount = connection.user_feelings.attractivePoints?.length || 0
    const concernsCount = connection.user_feelings.concerns?.length || 0
    
    // 魅力ポイントが多く、懸念が少ない場合は高優先度
    const score = attractivePointsCount - concernsCount
    
    if (score >= 3) return 'high'
    if (score >= 1) return 'medium'
    return 'low'
  }
  
  /**
   * 最後のメッセージからの日数を計算
   */
  private daysSinceLastMessage(connection: Connection): number {
    const lastContact = connection.communication.lastContact
    if (!lastContact) return 999
    
    const lastDate = new Date(lastContact)
    const now = new Date()
    
    return Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
  }
  
  /**
   * 英語のステージを日本語のConnectionStageにマッピング
   */
  private mapConnectionStage(englishStage: string): ConnectionStage {
    const stageMapping: Record<string, ConnectionStage> = {
      'just_matched': 'マッチング直後',
      'matching': 'マッチング直後',
      'chatting': 'メッセージ中',
      'messaging': 'メッセージ中', 
      'planning_date': 'デート前',
      'before_date': 'デート前',
      'dating': 'デート後',
      'relationship': '交際中',
      'complicated': '停滞中',
      'ended': '終了'
    }
    
    return stageMapping[englishStage] || 'メッセージ中'
  }
  
  /**
   * データの重複を検出
   */
  detectDuplicates(existingConnections: Connection[], importConnections: ImportedConnection[]): Array<{
    importedConnection: ImportedConnection,
    existingConnection: Connection,
    confidence: 'high' | 'medium' | 'low'
  }> {
    const duplicates = []
    
    for (const importConn of importConnections) {
      for (const existingConn of existingConnections) {
        // 完全一致
        if (importConn.nickname === existingConn.nickname && 
            importConn.platform === existingConn.platform) {
          duplicates.push({
            importedConnection: importConn,
            existingConnection: existingConn,
            confidence: 'high' as const
          })
        }
        // 類似性チェック（ひらがな・カタカナ変換など）
        else if (importConn.platform === existingConn.platform &&
                 this.isSimilarName(importConn.nickname, existingConn.nickname)) {
          duplicates.push({
            importedConnection: importConn,
            existingConnection: existingConn,
            confidence: 'medium' as const
          })
        }
      }
    }
    
    return duplicates
  }
  
  /**
   * 名前の類似性をチェック
   */
  private isSimilarName(name1: string, name2: string): boolean {
    // 簡単な類似性チェック（ひらがな・カタカナ・漢字の変換）
    const normalize = (name: string) => name.toLowerCase().trim()
    const n1 = normalize(name1)
    const n2 = normalize(name2)
    
    // 文字列の編集距離が小さい場合は類似とみなす
    // より柔軟な類似性判定
    const distance = this.levenshteinDistance(n1, n2)
    const maxLength = Math.max(n1.length, n2.length)
    return distance <= Math.max(1, Math.floor(maxLength * 0.3))
  }
  
  /**
   * レーベンシュタイン距離を計算
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }
  
  /**
   * コネクションサマリーを生成
   */
  generateConnectionSummary(connections: Connection[]): {
    totalConnections: number
    activeConnections: number
    stagnantConnections: number
    platformBreakdown: Record<string, number>
    stageBreakdown: Record<string, number>
    averageScores: {
      communication: number
      attraction: number
      interest: number
    }
    overallHealth: string
  } {
    if (connections.length === 0) {
      return {
        totalConnections: 0,
        activeConnections: 0,
        stagnantConnections: 0,
        platformBreakdown: {},
        stageBreakdown: {},
        averageScores: {
          communication: 0,
          attraction: 0,
          interest: 0
        },
        overallHealth: '新しいコネクションを追加してください'
      }
    }
    
    const activeStages = ['メッセージ中', 'デート前', 'デート後', '交際中']
    const activeConnections = connections.filter(c => activeStages.includes(c.current_stage)).length
    const stagnantConnections = connections.filter(c => c.current_stage === '停滞中').length
    
    // プラットフォーム別集計
    const platformBreakdown: Record<string, number> = {}
    connections.forEach(c => {
      platformBreakdown[c.platform] = (platformBreakdown[c.platform] || 0) + 1
    })
    
    // ステージ別集計
    const stageBreakdown: Record<string, number> = {}
    connections.forEach(c => {
      stageBreakdown[c.current_stage] = (stageBreakdown[c.current_stage] || 0) + 1
    })
    
    // 平均スコア計算（推定値）
    const communicationSum = connections.reduce((sum, c) => {
      // 頻度に基づいてスコアを推定
      const frequency = c.communication?.frequency || 'unknown'
      let score = 5
      if (frequency === '毎日') score = 9
      else if (frequency === '数日に1回') score = 7
      else if (frequency === '週1回') score = 5
      else if (frequency === '週1回未満') score = 3
      return sum + score
    }, 0)
    
    const attractionSum = connections.reduce((sum, c) => {
      // 魅力的なポイントの数に基づいて推定
      const pointsCount = c.user_feelings?.attractivePoints?.length || 0
      const score = Math.min(10, Math.max(1, pointsCount + 3))
      return sum + score
    }, 0)
    
    const interestSum = connections.reduce((sum, c) => {
      // ステージに基づいて興味レベルを推定
      let score = 5
      if (c.current_stage === '交際中') score = 10
      else if (c.current_stage === 'デート後') score = 8
      else if (c.current_stage === 'デート前') score = 7
      else if (c.current_stage === 'メッセージ中') score = 6
      else if (c.current_stage === '停滞中') score = 3
      else if (c.current_stage === '終了') score = 1
      return sum + score
    }, 0)
    
    const averageScores = {
      communication: Math.round(communicationSum / connections.length * 10) / 10,
      attraction: Math.round(attractionSum / connections.length * 10) / 10,
      interest: Math.round(interestSum / connections.length * 10) / 10
    }
    
    // 全体的な健康度評価
    let overallHealth = '良好'
    if (averageScores.communication < 4 || averageScores.interest < 4) {
      overallHealth = 'コミュニケーションの改善が必要です'
    } else if (stagnantConnections > activeConnections) {
      overallHealth = '停滞中のコネクションが多すぎます'
    }
    
    return {
      totalConnections: connections.length,
      activeConnections,
      stagnantConnections,
      platformBreakdown,
      stageBreakdown,
      averageScores,
      overallHealth
    }
  }
}
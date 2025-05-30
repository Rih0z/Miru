import { Connection, ConnectionStage, RecommendedAction } from '@/types'
import { db } from './supabase'

export class ConnectionService {
  /**
   * 新しい相手を作成
   */
  async createConnection(
    userId: string,
    connectionData: Omit<Connection, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Connection> {
    // 入力値検証とサニタイゼーション
    if (!connectionData.nickname?.trim()) {
      throw new Error('ニックネームは必須です')
    }
    
    if (!connectionData.platform?.trim()) {
      throw new Error('出会った場所は必須です')
    }

    // XSS対策：文字列の長さ制限
    if (connectionData.nickname.trim().length > 50) {
      throw new Error('ニックネームは50文字以内で入力してください')
    }

    if (connectionData.platform.trim().length > 100) {
      throw new Error('出会った場所は100文字以内で入力してください')
    }

    // 危険な文字列パターンのチェック
    const dangerousPattern = /<script|javascript:|data:|vbscript:/i
    if (dangerousPattern.test(connectionData.nickname) || dangerousPattern.test(connectionData.platform)) {
      throw new Error('不正な文字列が含まれています')
    }

    const connection = {
      user_id: userId,
      ...connectionData,
    }

    return await db.createConnection(connection)
  }

  /**
   * 関係ステージを更新
   */
  async updateConnectionStage(
    connectionId: string,
    newStage: ConnectionStage
  ): Promise<Connection> {
    const validStages: ConnectionStage[] = [
      'マッチング直後',
      'メッセージ中',
      'LINE交換済み',
      'デート前',
      'デート後',
      '交際中',
      '停滞中',
      '終了'
    ]

    if (!validStages.includes(newStage)) {
      throw new Error('無効なステージです')
    }

    return await db.updateConnection(connectionId, {
      current_stage: newStage
    })
  }

  /**
   * 関係性スコアを計算
   */
  calculateRelationshipScore(connection: Connection): number {
    let score = 0

    // ステージによる基本スコア
    const stageScores = {
      'マッチング直後': 10,
      'メッセージ中': 25,
      'LINE交換済み': 40,
      'デート前': 55,
      'デート後': 70,
      '交際中': 90,
      '停滞中': 20,
      '終了': 0
    }

    score += stageScores[connection.current_stage] || 0

    // コミュニケーション頻度による加点
    if (connection.communication.frequency === '毎日') {
      score += 15
    } else if (connection.communication.frequency === '数日に1回') {
      score += 10
    } else if (connection.communication.frequency === '週1回') {
      score += 5
    }

    // 共通点による加点
    if (connection.basic_info.hobbies && connection.basic_info.hobbies.length > 0) {
      score += connection.basic_info.hobbies.length * 2
    }

    // 100を上限とする
    return Math.min(score, 100)
  }

  /**
   * 推奨アクションを取得
   */
  getRecommendedAction(connection: Connection): RecommendedAction {
    const actions = {
      'マッチング直後': {
        title: `${connection.nickname}さんに最初のメッセージを送る`,
        description: 'プロフィールを参考に自然な挨拶を送りましょう',
        urgency: 'high' as const,
        estimated_time: '10分',
        prompt_type: 'first_message'
      },
      'メッセージ中': {
        title: `${connection.nickname}さんとの会話を深める`,
        description: '共通の話題を見つけて関係を発展させましょう',
        urgency: 'medium' as const,
        estimated_time: '15分',
        prompt_type: 'deepen_conversation'
      },
      'LINE交換済み': {
        title: `${connection.nickname}さんとLINEでの関係を築く`,
        description: 'より親密な会話を心がけましょう',
        urgency: 'medium' as const,
        estimated_time: '20分',
        prompt_type: 'build_intimacy'
      },
      'デート前': {
        title: `${connection.nickname}さんとのデート準備`,
        description: '話題の準備や当日の流れを確認しましょう',
        urgency: 'high' as const,
        estimated_time: '30分',
        prompt_type: 'date_preparation'
      },
      'デート後': {
        title: `${connection.nickname}さんとのデートのフォローアップ`,
        description: 'お礼のメッセージと次回の提案を考えましょう',
        urgency: 'high' as const,
        estimated_time: '15分',
        prompt_type: 'date_followup'
      },
      '交際中': {
        title: `${connection.nickname}さんとの関係をさらに深める`,
        description: '長期的な関係構築を目指しましょう',
        urgency: 'low' as const,
        estimated_time: '25分',
        prompt_type: 'relationship_building'
      },
      '停滞中': {
        title: `${connection.nickname}さんとの関係を再活性化`,
        description: '新しいアプローチで関係を復活させましょう',
        urgency: 'medium' as const,
        estimated_time: '20分',
        prompt_type: 'relationship_revival'
      },
      '終了': {
        title: '次の出会いに向けて準備',
        description: '経験を活かして新しい関係を始めましょう',
        urgency: 'low' as const,
        estimated_time: '10分',
        prompt_type: 'new_beginning'
      }
    }

    const action = actions[connection.current_stage]
    
    return {
      id: `action-${connection.id}-${Date.now()}`,
      connection_id: connection.id,
      ...action
    }
  }

  /**
   * すべての相手を取得
   */
  async getUserConnections(userId: string): Promise<Connection[]> {
    return await db.getConnections(userId)
  }

  /**
   * 相手を削除
   */
  async deleteConnection(connectionId: string): Promise<void> {
    await db.deleteConnection(connectionId)
  }
}
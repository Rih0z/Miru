import { Connection, RecommendedAction } from '@/types'
import { IActionRecommender } from '@/lib/domain/interfaces/IActionRecommender'

/**
 * Action Recommender
 * 推奨アクションの生成
 */
export class ActionRecommender implements IActionRecommender {
  private static counter = 0
  
  getRecommendedAction(connection: Connection): RecommendedAction {
    const actionMap = this.getActionMapping()
    const action = actionMap[connection.current_stage] || actionMap.default
    
    return {
      id: `action-${connection.id}-${Date.now()}-${++ActionRecommender.counter}`,
      connection_id: connection.id,
      title: action.title.replace('{nickname}', connection.nickname),
      description: action.description,
      urgency: action.urgency,
      estimated_time: action.estimated_time,
      prompt_type: action.prompt_type,
      type: action.type
    }
  }

  getRecommendedActions(connections: Connection[]): RecommendedAction[] {
    return connections
      .filter(c => c.current_stage !== '終了')
      .map(connection => this.getRecommendedAction(connection))
      .sort((a, b) => this.getUrgencyPriority(b.urgency) - this.getUrgencyPriority(a.urgency))
      .slice(0, 5) // 最大5件まで
  }

  private getActionMapping() {
    return {
      'マッチング直後': {
        title: '{nickname}さんに最初のメッセージを送る',
        description: 'プロフィールを参考に自然な挨拶を送りましょう',
        urgency: 'high' as const,
        estimated_time: '10分',
        prompt_type: 'first_message',
        type: 'send_message'
      },
      'メッセージ中': {
        title: '{nickname}さんとの会話を深める',
        description: '共通の話題を見つけて関係を発展させましょう',
        urgency: 'medium' as const,
        estimated_time: '15分',
        prompt_type: 'deepen_conversation',
        type: 'deepen_conversation'
      },
      'LINE交換済み': {
        title: '{nickname}さんとLINEでの関係を築く',
        description: 'より親密な会話を心がけましょう',
        urgency: 'medium' as const,
        estimated_time: '20分',
        prompt_type: 'build_intimacy',
        type: 'plan_date'
      },
      'デート前': {
        title: '{nickname}さんとのデート準備',
        description: '話題の準備や当日の流れを確認しましょう',
        urgency: 'high' as const,
        estimated_time: '30分',
        prompt_type: 'date_preparation',
        type: 'prepare_date'
      },
      'デート後': {
        title: '{nickname}さんとのデートのフォローアップ',
        description: 'お礼のメッセージと次回の提案を考えましょう',
        urgency: 'high' as const,
        estimated_time: '15分',
        prompt_type: 'date_followup',
        type: 'follow_up'
      },
      '交際中': {
        title: '{nickname}さんとの関係をさらに深める',
        description: '長期的な関係構築を目指しましょう',
        urgency: 'low' as const,
        estimated_time: '25分',
        prompt_type: 'relationship_building',
        type: 'maintain_relationship'
      },
      '停滞中': {
        title: '{nickname}さんとの関係を再活性化',
        description: '新しいアプローチで関係を復活させましょう',
        urgency: 'medium' as const,
        estimated_time: '20分',
        prompt_type: 'relationship_revival',
        type: 'revive_conversation'
      },
      '終了': {
        title: '次の出会いに向けて準備',
        description: '経験を活かして新しい関係を始めましょう',
        urgency: 'low' as const,
        estimated_time: '10分',
        prompt_type: 'new_beginning',
        type: 'general_advice'
      },
      default: {
        title: '{nickname}さんとの関係を分析',
        description: '現在の状況を整理しましょう',
        urgency: 'medium' as const,
        estimated_time: '15分',
        prompt_type: 'analyze_situation',
        type: 'general_advice'
      }
    }
  }

  private getUrgencyPriority(urgency: string): number {
    const priorityMap: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    }
    return priorityMap[urgency] || 0
  }
}
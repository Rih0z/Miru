import { Connection } from '@/types'
import { IContextFormatter } from '../interfaces/IContextFormatter'

export class ContextFormatter implements IContextFormatter {
  formatConnectionContext(connection: Connection): string {
    return `
【相手の情報】
- ニックネーム: ${connection.nickname}
- 出会った場所: ${connection.platform}
- 現在の関係: ${connection.current_stage}

【基本情報】
- 年齢: ${connection.basic_info.age || '不明'}
- 職業: ${connection.basic_info.occupation || '不明'}
- 趣味: ${connection.basic_info.hobbies?.join('、') || '不明'}
- 居住地: ${connection.basic_info.location || '不明'}

【コミュニケーション】
- 頻度: ${connection.communication.frequency || '不明'}
- 最後の連絡: ${connection.communication.lastContact || '不明'}
- スタイル: ${connection.communication.communicationStyle || '不明'}

【あなたの気持ち】
- 期待: ${connection.user_feelings.expectations || '不明'}
- 不安: ${connection.user_feelings.concerns || '不明'}
- 魅力的な点: ${connection.user_feelings.attractivePoints?.join('、') || '不明'}
`
  }
}
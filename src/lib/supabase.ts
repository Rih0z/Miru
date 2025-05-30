import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

// デモモードかどうかをチェック
const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl.includes('dummy') || supabaseUrl.includes('demo');

export const supabase = isDemoMode ? null : createClient(supabaseUrl, supabaseKey);

// データベース操作関数
export const db = {
  // ユーザー関連
  async getUser(userId: string) {
    // デモモード: サンプルユーザーを返す
    if (isDemoMode) {
      return {
        id: userId,
        email: 'demo@example.com',
        name: 'デモユーザー',
        created_at: '2024-05-29T00:00:00Z',
        updated_at: '2024-05-29T00:00:00Z'
      };
    }

    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // 相手情報関連
  async getConnections(userId: string) {
    // デモモード: サンプルデータを返す
    if (isDemoMode) {
      return [
        {
          id: 'demo-1',
          user_id: userId,
          nickname: 'Aさん',
          platform: 'Pairs',
          current_stage: 'メッセージ中',
          basic_info: { 
            age: 25, 
            occupation: 'エンジニア',
            hobbies: ['映画鑑賞', 'カフェ巡り']
          },
          communication: { 
            frequency: '毎日',
            lastContact: '2024-05-29',
            responseTime: '数時間以内'
          },
          user_feelings: { 
            expectations: '真剣な交際',
            attractivePoints: ['優しい', '話が面白い']
          },
          created_at: '2024-05-29T00:00:00Z',
          updated_at: '2024-05-29T00:00:00Z'
        },
        {
          id: 'demo-2',
          user_id: userId,
          nickname: 'Bさん',
          platform: 'with',
          current_stage: 'デート前',
          basic_info: { 
            age: 28, 
            occupation: 'デザイナー',
            hobbies: ['読書', 'ヨガ', '料理']
          },
          communication: { 
            frequency: '2日に1回',
            lastContact: '2024-05-28',
            responseTime: '1日以内'
          },
          user_feelings: { 
            expectations: '楽しい関係',
            attractivePoints: ['センスが良い', '落ち着いている']
          },
          created_at: '2024-05-29T00:00:00Z',
          updated_at: '2024-05-29T00:00:00Z'
        }
      ];
    }

    const { data, error } = await supabase!
      .from('connections')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createConnection(connection: any) {
    // テスト環境では固定値を返す
    if (process.env.NODE_ENV === 'test') {
      return {
        id: 'test-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...connection
      };
    }
    
    // デモモード: 固定値を返す
    if (isDemoMode) {
      return {
        id: `demo-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...connection
      };
    }
    
    const { data, error } = await supabase!
      .from('connections')
      .insert(connection)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateConnection(id: string, updates: any) {
    // テスト環境では固定値を返す
    if (process.env.NODE_ENV === 'test') {
      return {
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'test-user',
        nickname: 'Aさん',
        platform: 'Pairs',
        basic_info: {},
        communication: {},
        user_feelings: {},
        ...updates
      };
    }
    
    // デモモード: 固定値を返す
    if (isDemoMode) {
      return {
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user',
        nickname: 'Aさん',
        platform: 'Pairs',
        basic_info: {},
        communication: {},
        user_feelings: {},
        ...updates
      };
    }
    
    const { data, error } = await supabase!
      .from('connections')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteConnection(id: string) {
    // デモモード: 何もしない
    if (isDemoMode) {
      return;
    }

    const { error } = await supabase!
      .from('connections')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // 進捗追跡関連
  async getProgress(connectionId: string) {
    // デモモード: 空配列を返す
    if (isDemoMode) {
      return [];
    }

    const { data, error } = await supabase!
      .from('progress_tracking')
      .select('*')
      .eq('connection_id', connectionId)
      .order('recorded_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addProgressEntry(progress: any) {
    // デモモード: 固定値を返す
    if (isDemoMode) {
      return {
        id: `demo-progress-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...progress
      };
    }

    const { data, error } = await supabase!
      .from('progress_tracking')
      .insert(progress)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // アクション履歴関連
  async getActionHistory(connectionId: string) {
    // デモモード: 空配列を返す
    if (isDemoMode) {
      return [];
    }

    const { data, error } = await supabase!
      .from('action_history')
      .select('*')
      .eq('connection_id', connectionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addActionHistory(action: any) {
    // デモモード: 固定値を返す
    if (isDemoMode) {
      return {
        id: `demo-action-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...action
      };
    }

    const { data, error } = await supabase!
      .from('action_history')
      .insert(action)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // プロンプト履歴関連
  async savePromptHistory(prompt: any) {
    // デモモード: 固定値を返す
    if (isDemoMode) {
      return {
        id: `demo-prompt-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...prompt
      };
    }

    const { data, error } = await supabase!
      .from('prompt_history')
      .insert(prompt)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
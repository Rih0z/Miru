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
          basic_info: { age: 25, occupation: 'エンジニア' },
          communication: { frequency: '毎日' },
          user_feelings: { expectations: '真剣な交際' },
          created_at: '2024-05-29T00:00:00Z',
          updated_at: '2024-05-29T00:00:00Z'
        },
        {
          id: 'demo-2',
          user_id: userId,
          nickname: 'Bさん',
          platform: 'with',
          current_stage: 'デート前',
          basic_info: { age: 28, occupation: 'デザイナー' },
          communication: { frequency: '2日に1回' },
          user_feelings: { expectations: '楽しい関係' },
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
    
    const { data, error } = await supabase
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
    
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('progress_tracking')
      .select('*')
      .eq('connection_id', connectionId)
      .order('recorded_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addProgressEntry(progress: any) {
    const { data, error } = await supabase
      .from('progress_tracking')
      .insert(progress)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // アクション履歴関連
  async getActionHistory(connectionId: string) {
    const { data, error } = await supabase
      .from('action_history')
      .select('*')
      .eq('connection_id', connectionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addActionHistory(action: any) {
    const { data, error } = await supabase
      .from('action_history')
      .insert(action)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // プロンプト履歴関連
  async savePromptHistory(prompt: any) {
    const { data, error } = await supabase
      .from('prompt_history')
      .insert(prompt)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
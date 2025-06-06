import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabaseクライアントの作成（設定されていない場合はnull）
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    }) 
  : null;

// デモモードの判定
export const isDemoMode = !supabase;

if (isDemoMode && typeof window !== 'undefined') {
  console.info('🎯 Miruはデモモードで動作しています。Supabaseを設定するとフル機能が利用できます。');
}

// データベース操作関数
export const db = {
  // ユーザー関連
  async getUser(userId: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createUser(user: any) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 相手情報関連
  async getConnections(userId: string) {
    if (!supabase) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching connections:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Failed to fetch connections:', err);
      return [];
    }
  },

  async createConnection(connection: any) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }
    
    const { data, error } = await supabase
      .from('connections')
      .insert({
        ...connection,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateConnection(id: string, updates: any) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }
    
    const { data, error } = await supabase
      .from('connections')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteConnection(id: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // 進捗追跡関連
  async getProgress(connectionId: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }
    const { data, error } = await supabase
      .from('progress_tracking')
      .select('*')
      .eq('connection_id', connectionId)
      .order('recorded_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addProgressEntry(progress: any) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }
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
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }
    const { data, error } = await supabase
      .from('action_history')
      .select('*')
      .eq('connection_id', connectionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addActionHistory(action: any) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }
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
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }
    const { data, error } = await supabase
      .from('prompt_history')
      .insert(prompt)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// テーブル作成SQL（初期化用）
export const createTables = `
-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 恋愛関係テーブル
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  platform TEXT NOT NULL,
  current_stage TEXT NOT NULL,
  basic_info JSONB DEFAULT '{}',
  communication JSONB DEFAULT '{}',
  user_feelings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 進捗追跡テーブル
CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  hope_score INTEGER NOT NULL,
  stage_before TEXT,
  stage_after TEXT,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- アクション履歴テーブル
CREATE TABLE IF NOT EXISTS action_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_details JSONB DEFAULT '{}',
  result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プロンプト履歴テーブル
CREATE TABLE IF NOT EXISTS prompt_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL,
  ai_type TEXT NOT NULL,
  prompt_content TEXT NOT NULL,
  response_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_connection_id ON progress_tracking(connection_id);
CREATE INDEX IF NOT EXISTS idx_action_history_connection_id ON action_history(connection_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_connection_id ON prompt_history(connection_id);
`;
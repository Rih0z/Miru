-- Miru恋愛サポートアプリ データベーススキーマ
-- Supabaseで実行する初期化SQL

-- 1. ユーザーテーブル（auth.usersテーブルの拡張）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 恋愛関係テーブル
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nickname TEXT NOT NULL,
  platform TEXT NOT NULL,
  current_stage TEXT NOT NULL DEFAULT 'マッチング直後',
  basic_info JSONB DEFAULT '{
    "age": null,
    "occupation": null,
    "hobbies": [],
    "location": null
  }',
  communication JSONB DEFAULT '{
    "frequency": null,
    "lastContact": null,
    "communicationStyle": null,
    "responseTime": null
  }',
  user_feelings JSONB DEFAULT '{
    "expectations": null,
    "concerns": [],
    "attractivePoints": []
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 進捗追跡テーブル
CREATE TABLE IF NOT EXISTS public.progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE NOT NULL,
  distance_level INTEGER CHECK (distance_level >= 1 AND distance_level <= 5) DEFAULT 1,
  hope_score INTEGER CHECK (hope_score >= 0 AND hope_score <= 100) DEFAULT 0,
  milestone TEXT,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. アクション履歴テーブル
CREATE TABLE IF NOT EXISTS public.action_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  action_detail JSONB DEFAULT '{}',
  result JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. プロンプト履歴テーブル
CREATE TABLE IF NOT EXISTS public.prompt_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE NOT NULL,
  prompt_type TEXT NOT NULL,
  ai_type TEXT NOT NULL CHECK (ai_type IN ('claude', 'gpt', 'gemini')),
  prompt_content TEXT NOT NULL,
  response_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 希望体験メトリクス テーブル
CREATE TABLE IF NOT EXISTS public.hope_experience_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE,
  his INTEGER CHECK (his >= 0 AND his <= 100) DEFAULT 50,
  possibility_frequency DECIMAL DEFAULT 0,
  progress_realization INTEGER CHECK (progress_realization >= 0 AND progress_realization <= 100) DEFAULT 50,
  continuation_desire INTEGER CHECK (continuation_desire >= 0 AND continuation_desire <= 100) DEFAULT 50,
  life_enrichment INTEGER CHECK (life_enrichment >= 0 AND life_enrichment <= 100) DEFAULT 50,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 日次希望体験テーブル
CREATE TABLE IF NOT EXISTS public.daily_hope_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  morning_hope INTEGER CHECK (morning_hope >= 0 AND morning_hope <= 100) DEFAULT 0,
  noon_possibility INTEGER CHECK (noon_possibility >= 0 AND noon_possibility <= 100) DEFAULT 0,
  evening_progress INTEGER CHECK (evening_progress >= 0 AND evening_progress <= 100) DEFAULT 0,
  total_hope_points INTEGER DEFAULT 0,
  experience_events JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON public.connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_current_stage ON public.connections(current_stage);
CREATE INDEX IF NOT EXISTS idx_progress_connection_id ON public.progress_tracking(connection_id);
CREATE INDEX IF NOT EXISTS idx_progress_recorded_at ON public.progress_tracking(recorded_at);
CREATE INDEX IF NOT EXISTS idx_action_history_connection_id ON public.action_history(connection_id);
CREATE INDEX IF NOT EXISTS idx_action_history_created_at ON public.action_history(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_history_connection_id ON public.prompt_history(connection_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_created_at ON public.prompt_history(created_at);
CREATE INDEX IF NOT EXISTS idx_hope_metrics_user_id ON public.hope_experience_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_hope_metrics_connection_id ON public.hope_experience_metrics(connection_id);
CREATE INDEX IF NOT EXISTS idx_daily_hope_user_id ON public.daily_hope_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_hope_date ON public.daily_hope_experience(date);

-- RLS (Row Level Security) 設定
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hope_experience_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_hope_experience ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー設定

-- プロファイル用ポリシー
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 接続用ポリシー
CREATE POLICY "Users can view own connections" ON public.connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections" ON public.connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections" ON public.connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections" ON public.connections
  FOR DELETE USING (auth.uid() = user_id);

-- 進捗追跡用ポリシー
CREATE POLICY "Users can view own progress" ON public.progress_tracking
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.connections WHERE id = connection_id)
  );

CREATE POLICY "Users can insert own progress" ON public.progress_tracking
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.connections WHERE id = connection_id)
  );

-- アクション履歴用ポリシー
CREATE POLICY "Users can view own action history" ON public.action_history
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.connections WHERE id = connection_id)
  );

CREATE POLICY "Users can insert own action history" ON public.action_history
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.connections WHERE id = connection_id)
  );

-- プロンプト履歴用ポリシー
CREATE POLICY "Users can view own prompt history" ON public.prompt_history
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.connections WHERE id = connection_id)
  );

CREATE POLICY "Users can insert own prompt history" ON public.prompt_history
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.connections WHERE id = connection_id)
  );

-- 希望体験メトリクス用ポリシー
CREATE POLICY "Users can view own hope metrics" ON public.hope_experience_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hope metrics" ON public.hope_experience_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hope metrics" ON public.hope_experience_metrics
  FOR UPDATE USING (auth.uid() = user_id);

-- 日次希望体験用ポリシー
CREATE POLICY "Users can view own daily hope" ON public.daily_hope_experience
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily hope" ON public.daily_hope_experience
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily hope" ON public.daily_hope_experience
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザー作成時に自動的にプロファイルを作成するトリガー関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- ユーザー作成トリガー
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- updated_at自動更新トリガー関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- updated_at自動更新トリガー
CREATE TRIGGER handle_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
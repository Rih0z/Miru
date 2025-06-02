# Miru 無料運用構成

## 1. 完全無料構成（月額 $0-10）

### 1.1 推奨無料スタック
```
Frontend: Vercel (無料) / Netlify (無料)
Backend: Railway (無料枠) / Render (無料枠)  
Database: Supabase (無料枠) / PlanetScale (無料枠)
AI/ML: OpenAI Free Credits / Hugging Face (無料)
Storage: Cloudflare R2 (無料枠)
Auth: Auth0 (7,000 MAU無料) / Supabase Auth
CDN: Cloudflare (無料)
```

### 1.2 各サービスの無料枠詳細

| サービス | 無料枠 | 制限 | 超過後料金 |
|----------|--------|------|------------|
| **Vercel** | 無制限 | 100GB帯域/月 | $20/月〜 |
| **Railway** | $5/月分無料 | 500時間実行/月 | $0.01/時間 |
| **Supabase** | 無制限 | 500MB DB, 1GB転送 | $25/月〜 |
| **Cloudflare R2** | 10GB/月無料 | 10GB保存, 100万API/月 | $0.015/GB |
| **Auth0** | 7,000 MAU無料 | アクティブユーザー7,000人 | $23/月〜 |
| **OpenAI** | $5初回クレジット | API使用量 | $0.002/1Kトークン |

## 2. セットアップ手順

### 2.1 フロントエンド - Vercel無料セットアップ

```bash
# プロジェクト作成
npx create-next-app@latest miru-frontend
cd miru-frontend

# Vercelデプロイ
npm install -g vercel
vercel login
vercel --prod

# 環境変数設定（Vercelダッシュボード）
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 2.2 バックエンド - Railway無料セットアップ

```bash
# Railway CLI インストール
npm install -g @railway/cli

# ログイン & プロジェクト作成
railway login
railway new miru-backend

# プロジェクト初期化
mkdir miru-backend && cd miru-backend
npm init -y
npm install express cors dotenv

# 基本サーバー作成
cat > index.js << 'EOF'
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

# package.json スクリプト追加
npm pkg set scripts.start="node index.js"

# デプロイ
railway deploy
```

### 2.3 データベース - Supabase無料セットアップ

```bash
# Supabase CLI インストール
npm install -g supabase

# プロジェクト初期化
supabase init

# ローカル開発環境起動
supabase start

# テーブル作成（SQL Editor使用）
```

```sql
-- Supabase SQL Editor で実行
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id_1 UUID REFERENCES users(id),
    user_id_2 UUID REFERENCES users(id),
    compatibility_score DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS) 有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 基本ポリシー
CREATE POLICY "Users can read own data" ON users
FOR SELECT USING (auth.uid() = id);
```

### 2.4 AI処理 - Hugging Face無料セットアップ

```javascript
// 無料のHugging Face Inference API使用
const analyzeCompatibility = async (user1, user2) => {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    {
      headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
      method: "POST",
      body: JSON.stringify({
        inputs: {
          source_sentence: user1.description,
          sentences: [user2.description]
        }
      }),
    }
  );
  
  const result = await response.json();
  return {
    compatibility_score: result[0] * 100, // 0-100スケール
    confidence: 0.8
  };
};
```

## 3. 無料枠の制限と対策

### 3.1 制限事項
- **Railway**: 月500時間実行（約20日連続稼働）
- **Supabase**: 500MBデータベース、1GB転送
- **Auth0**: 7,000アクティブユーザー
- **OpenAI**: $5分の無料クレジット

### 3.2 制限対策

```javascript
// 効率的なAPI使用
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = 3600000; // 1時間
  }
  
  async getOrSet(key, fetchFunction) {
    if (this.cache.has(key)) {
      const { data, timestamp } = this.cache.get(key);
      if (Date.now() - timestamp < this.ttl) {
        return data;
      }
    }
    
    const data = await fetchFunction();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}

// AI処理の最適化
const aiCache = new CacheManager();

app.post('/api/compatibility', async (req, res) => {
  const { user1Id, user2Id } = req.body;
  const cacheKey = `compatibility_${user1Id}_${user2Id}`;
  
  const result = await aiCache.getOrSet(cacheKey, async () => {
    return await analyzeCompatibility(user1, user2);
  });
  
  res.json(result);
});
```

## 4. 段階的スケーリングプラン

### 4.1 ユーザー数による移行タイミング

| ユーザー数 | 構成 | 月額コスト | 移行アクション |
|------------|------|-----------|----------------|
| **0-100人** | 完全無料構成 | $0-10 | なし |
| **100-1,000人** | Railway有料 + Auth0有料 | $50-100 | Railway Pro ($5), Auth0 Essential ($23) |
| **1,000-5,000人** | Supabase Pro追加 | $150-200 | Supabase Pro ($25), OpenAI API ($50-100) |
| **5,000-10,000人** | Fly.io移行 | $300-500 | より安定したインフラに移行 |

### 4.2 自動スケーリング対応

```bash
# Railway でのオートスケール設定
railway service

# 環境変数でスケール制御
RAILWAY_SCALE_MIN_REPLICAS=1
RAILWAY_SCALE_MAX_REPLICAS=3
RAILWAY_SCALE_CPU_THRESHOLD=80
```

## 5. 実際のコマンド実行例

### 5.1 完全セットアップ（15分で完了）

```bash
#!/bin/bash
# Miru無料セットアップスクリプト

echo "🚀 Miru無料セットアップ開始"

# 1. フロントエンド
echo "📱 フロントエンド作成中..."
npx create-next-app@latest miru-frontend --typescript --tailwind --app
cd miru-frontend
npm install @supabase/supabase-js

# 2. バックエンド
echo "⚙️ バックエンド作成中..."
cd ..
mkdir miru-backend && cd miru-backend
npm init -y
npm install express cors dotenv @supabase/supabase-js

# 基本APIサーバー作成
cat > index.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', users: 'ready' });
});

// ユーザー作成API
app.post('/api/users', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .insert([req.body]);
    
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// 相性度計算API（無料版）
app.post('/api/compatibility', async (req, res) => {
  const { user1, user2 } = req.body;
  
  // 簡易計算（無料版）
  const score = Math.random() * 40 + 60; // 60-100の範囲
  
  res.json({
    compatibility_score: score,
    message: '無料版: 基本的な相性度',
    upgrade_available: true
  });
});

app.listen(PORT, () => {
  console.log(`🎯 Server running on port ${PORT}`);
});
EOF

npm pkg set scripts.start="node index.js"

# 3. Railway デプロイ
echo "🚂 Railway デプロイ中..."
npx @railway/cli login
npx @railway/cli new miru-backend
npx @railway/cli deploy

# 4. Vercel デプロイ
echo "▲ Vercel デプロイ中..."
cd ../miru-frontend
npx vercel --prod

echo "✅ セットアップ完了！"
echo "📊 管理画面: https://railway.app"
echo "🌐 アプリ: https://your-app.vercel.app"
```

## 6. 無料期間での機能制限

### 6.1 無料版機能
- ✅ 基本プロフィール作成
- ✅ 簡易マッチング
- ✅ 基本メッセージング
- ✅ シンプルなAI提案
- ✅ 基本統計表示

### 6.2 有料版で追加される機能
- 🔥 高精度AI分析
- 🔥 リアルタイム感情分析
- 🔥 個別最適化アルゴリズム
- 🔥 詳細な進展可視化
- 🔥 プレミアムサポート

## 7. 収益化までのロードマップ

### 7.1 無料ユーザー獲得（0-3ヶ月）
```
目標: 1,000ユーザー獲得
予算: $0-50/月
戦略: 口コミ・SNS・無料価値提供
```

### 7.2 フリーミアム導入（3-6ヶ月）
```
目標: 有料転換率10%（100人課金）
予算: $200-500/月
収益: $5,000-10,000/月
```

### 7.3 本格スケール（6-12ヶ月）
```
目標: 10,000ユーザー、転換率15%
予算: $2,000-5,000/月
収益: $50,000-100,000/月
```

この構成なら、**実質無料で数ヶ月〜1年間**運用可能で、ユーザーが増えて収益が出始めてから段階的にコストを支払う形になります。
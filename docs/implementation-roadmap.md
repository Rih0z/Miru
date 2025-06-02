# Miru 実装ロードマップ

## 1. 実装フェーズ概要

### Phase 1: MVP開発（3ヶ月）
**目標**: 基本的な「可能性実感」体験の提供
**予算**: $2,000-5,000/月
**チーム**: 5-8名

### Phase 2: β版展開（3ヶ月）  
**目標**: 毎日の希望体験の実現
**予算**: $5,000-15,000/月
**チーム**: 8-12名

### Phase 3: 正式版（6ヶ月）
**目標**: 確信への成長体験
**予算**: $15,000-30,000/月
**チーム**: 12-18名

## 2. 推奨技術スタック・実装順序

### 2.1 Phase 1: MVP（推奨構成）

#### インフラ
```bash
# Fly.io セットアップ
fly auth login
fly launch --name miru-api --region nrt

# Cloudflare Pages（フロントエンド）
wrangler pages project create miru-frontend

# Railway Database（開発用）
railway login
railway new miru-db
railway add postgresql
```

#### バックエンド構成
```
Node.js + Express + TypeScript
├── src/
│   ├── routes/          # API routes
│   ├── models/          # データモデル
│   ├── services/        # ビジネスロジック
│   ├── ai/              # AI処理
│   └── utils/           # ユーティリティ
├── prisma/              # ORM
├── docker/              # コンテナ設定
└── scripts/             # デプロイスクリプト
```

#### フロントエンド構成  
```
React Native + Expo
├── src/
│   ├── screens/         # 画面コンポーネント
│   ├── components/      # 共通コンポーネント
│   ├── store/           # Redux Toolkit
│   ├── services/        # API連携
│   └── utils/           # ユーティリティ
├── assets/              # 画像・フォント
└── app.config.js        # Expo設定
```

### 2.2 必要最小限の機能実装

#### Week 1-2: 基盤構築
```bash
# プロジェクト初期化
npx create-expo-app miru-mobile --template
cd miru-mobile
npm install @reduxjs/toolkit react-redux

# バックエンド初期化
mkdir miru-backend && cd miru-backend
npm init -y
npm install express typescript prisma @prisma/client
npx prisma init
```

#### Week 3-4: 認証・プロフィール
- Firebase Auth integration
- 基本プロフィール登録
- 写真アップロード（Cloudflare R2）

#### Week 5-6: マッチング基礎
- 簡易相性度計算
- マッチング候補表示
- いいね機能

#### Week 7-8: メッセージング
- リアルタイムチャット（Socket.io）
- 基本的なAI提案（GPT-4 API）

#### Week 9-10: 体験価値測定
- HIS（希望実感スコア）記録
- 基本的な進展可視化

#### Week 11-12: テスト・リリース
- E2Eテスト
- パフォーマンステスト
- App Store申請

## 3. AI/ML実装戦略

### 3.1 Phase 1: 基本AI（外部API活用）

```typescript
// 基本的な相性度計算
class BasicCompatibilityService {
  async calculateCompatibility(user1: UserProfile, user2: UserProfile) {
    // OpenAI GPT-4での簡易分析
    const prompt = `
      ユーザー1: ${JSON.stringify(user1.interests)}
      ユーザー2: ${JSON.stringify(user2.interests)}
      相性度を0-100で評価し、理由も含めて回答してください。
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    
    return this.parseCompatibilityScore(response.choices[0].message.content);
  }
}
```

### 3.2 Phase 2: カスタムAI（Modal活用）

```python
# Modal でのカスタムAI処理
import modal

stub = modal.Stub("miru-ai")

@stub.function(
    image=modal.Image.debian_slim().pip_install(
        "transformers", "torch", "sentence-transformers"
    ),
    gpu=modal.gpu.T4()
)
def analyze_compatibility(user1_data, user2_data):
    from sentence_transformers import SentenceTransformer
    
    model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
    
    # 特徴量抽出
    user1_embedding = model.encode(user1_data['description'])
    user2_embedding = model.encode(user2_data['description'])
    
    # コサイン類似度計算
    similarity = cosine_similarity([user1_embedding], [user2_embedding])[0][0]
    
    return {
        'compatibility_score': float(similarity),
        'confidence': 0.85
    }
```

## 4. データベース実装

### 4.1 Prisma Schema設計

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  phone       String?
  profile     Json
  preferences Json
  personality Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // リレーション
  sentMatches     Match[] @relation("UserSentMatches")
  receivedMatches Match[] @relation("UserReceivedMatches")
  sentMessages    Message[] @relation("MessageSender")
  metrics         ExperienceMetric[]
  
  @@map("users")
}

model Match {
  id                String   @id @default(uuid())
  userId1           String
  userId2           String
  compatibilityScore Float
  status            String   @default("pending")
  matchedAt         DateTime @default(now())
  
  user1 User @relation("UserSentMatches", fields: [userId1], references: [id])
  user2 User @relation("UserReceivedMatches", fields: [userId2], references: [id])
  
  messages          Message[]
  progressRecords   RelationshipProgress[]
  
  @@unique([userId1, userId2])
  @@map("matches")
}

model Message {
  id          String   @id @default(uuid())
  matchId     String
  senderId    String
  content     String
  sentiment   Float?
  aiAnalysis  Json?
  createdAt   DateTime @default(now())
  
  match  Match @relation(fields: [matchId], references: [id])
  sender User  @relation("MessageSender", fields: [senderId], references: [id])
  
  @@map("messages")
}

model RelationshipProgress {
  id           String   @id @default(uuid())
  matchId      String
  stage        String   // interest, trust, intimacy, conviction, dating
  progressScore Int
  aiAnalysis   Json?
  updatedAt    DateTime @default(now())
  
  match Match @relation(fields: [matchId], references: [id])
  
  @@map("relationship_progress")
}

model ExperienceMetric {
  id                    String   @id @default(uuid())
  userId                String
  hisScore              Int      // Hope Realization Score (0-100)
  dailyHopeMoments      Int      @default(0)
  progressFeeling       Float
  continuationMotivation Float
  measuredAt            DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  
  @@map("experience_metrics")
}
```

### 4.2 データベースマイグレーション

```bash
# 初期マイグレーション
npx prisma migrate dev --name init

# 本番デプロイ
npx prisma migrate deploy

# シード作成
npx prisma db seed
```

## 5. デプロイメント自動化

### 5.1 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd miru-backend
          npm ci
          
      - name: Run tests
        run: |
          cd miru-backend
          npm test
          
      - name: Type check
        run: |
          cd miru-backend
          npm run type-check

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Fly.io
        uses: superfly/flyctl-actions/setup-flyctl@master
        
      - name: Deploy to Fly.io
        run: |
          cd miru-backend
          flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Build
        run: |
          cd miru-frontend
          npm ci
          npm run build
          
      - name: Deploy to Cloudflare Pages
        run: |
          cd miru-frontend
          npx wrangler pages publish dist
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### 5.2 環境設定

```bash
# 環境変数設定
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set OPENAI_API_KEY="sk-..."
fly secrets set FIREBASE_CONFIG='{"apiKey":"..."}'
fly secrets set CLOUDFLARE_R2_ACCESS_KEY="..."

# ヘルスチェック設定
fly status
fly logs
```

## 6. 監視・分析実装

### 6.1 基本監視

```typescript
// 基本メトリクス収集
class MetricsService {
  async recordUserAction(userId: string, action: string, metadata?: any) {
    await prisma.userAction.create({
      data: {
        userId,
        action,
        metadata,
        timestamp: new Date()
      }
    });
    
    // リアルタイム分析
    await this.analyzeUserBehavior(userId, action);
  }
  
  async recordHISScore(userId: string, score: number, context?: string) {
    await prisma.experienceMetric.create({
      data: {
        userId,
        hisScore: score,
        context,
        measuredAt: new Date()
      }
    });
    
    // アラート確認
    if (score < 50) {
      await this.triggerLowHISAlert(userId);
    }
  }
}
```

### 6.2 分析ダッシュボード

```typescript
// 管理者ダッシュボード API
app.get('/admin/metrics', async (req, res) => {
  const metrics = await Promise.all([
    // 体験価値指標
    prisma.experienceMetric.aggregate({
      _avg: { hisScore: true },
      where: { measuredAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    }),
    
    // アクティブユーザー数
    prisma.user.count({
      where: { lastLoginAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    }),
    
    // マッチング成功率
    prisma.match.aggregate({
      _count: { id: true },
      where: { status: 'matched', matchedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    })
  ]);
  
  res.json({
    avgHISScore: metrics[0]._avg.hisScore,
    dailyActiveUsers: metrics[1],
    weeklyMatches: metrics[2]._count.id
  });
});
```

## 7. コスト最適化実装

### 7.1 効率的なAI処理

```typescript
// AI処理のキャッシュ活用
class AIService {
  private cache = new Map();
  
  async getCompatibilityScore(user1Id: string, user2Id: string) {
    const cacheKey = `compatibility:${user1Id}:${user2Id}`;
    
    // キャッシュ確認
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Modal API呼び出し（高コスト）
    const result = await this.callModalAPI(user1Id, user2Id);
    
    // 1時間キャッシュ
    this.cache.set(cacheKey, result);
    setTimeout(() => this.cache.delete(cacheKey), 3600000);
    
    return result;
  }
}
```

### 7.2 段階的スケーリング

```bash
# 負荷に応じた自動スケーリング
fly scale count 2-10  # 最小2台、最大10台

# 高負荷時のみGPU利用
if [ "$CURRENT_LOAD" -gt 80 ]; then
  modal deploy ai_service_gpu.py
else
  modal deploy ai_service_cpu.py  
fi
```

## 8. セキュリティ実装

### 8.1 基本セキュリティ

```typescript
// データ暗号化
class SecurityService {
  async encryptSensitiveData(data: any) {
    const crypto = require('crypto');
    const key = process.env.ENCRYPTION_KEY;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return { encrypted, iv: iv.toString('hex') };
  }
  
  async hashPersonalInfo(info: string) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(info).digest('hex');
  }
}
```

## 9. 成功指標とKPI実装

### 9.1 重要指標の測定

```typescript
class KPIService {
  async calculateHISMetrics(userId: string, period: 'day' | 'week' | 'month') {
    const startDate = this.getStartDate(period);
    
    const metrics = await prisma.experienceMetric.findMany({
      where: {
        userId,
        measuredAt: { gte: startDate }
      },
      orderBy: { measuredAt: 'desc' }
    });
    
    return {
      averageHIS: metrics.reduce((sum, m) => sum + m.hisScore, 0) / metrics.length,
      trend: this.calculateTrend(metrics),
      hopeEventsCount: metrics.reduce((sum, m) => sum + m.dailyHopeMoments, 0)
    };
  }
  
  async getRetentionRate(cohortDate: Date) {
    const cohortUsers = await prisma.user.count({
      where: { createdAt: { gte: cohortDate, lt: new Date(cohortDate.getTime() + 24 * 60 * 60 * 1000) } }
    });
    
    const activeUsers = await prisma.user.count({
      where: {
        createdAt: { gte: cohortDate, lt: new Date(cohortDate.getTime() + 24 * 60 * 60 * 1000) },
        lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });
    
    return (activeUsers / cohortUsers) * 100;
  }
}
```

## 10. 実装チェックリスト

### Phase 1 MVP完了基準
- [ ] ユーザー登録・認証
- [ ] 基本プロフィール作成
- [ ] 相性度表示（外部AI）
- [ ] マッチング・いいね機能
- [ ] 基本メッセージング
- [ ] HISスコア記録
- [ ] モバイルアプリ（iOS/Android）
- [ ] 管理画面基礎
- [ ] 基本監視・ログ
- [ ] App Store公開

### Phase 2 β版完了基準
- [ ] カスタムAI実装（Modal）
- [ ] 高度な相性分析
- [ ] 関係進展可視化
- [ ] AIメッセージ提案
- [ ] プッシュ通知
- [ ] 決済機能（Stripe）
- [ ] A/Bテスト機能
- [ ] 詳細分析ダッシュボード
- [ ] パフォーマンス最適化
- [ ] 1,000人ベータテスト

この実装ロードマップに従うことで、体験価値に焦点を当てたMiruシステムを効率的に構築できます。
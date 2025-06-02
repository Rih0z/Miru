# Miru 恋愛サポートAIシステム設計書

## 1. システム概要

### 1.1 目的
「付き合えるかもしれない」という希望と可能性を科学的に提供する恋愛支援AIプラットフォーム

### 1.2 主要機能
- 相性度リアルタイム分析
- 関係進展可視化
- AIによる最適化コミュニケーション提案
- 感情状態モニタリング
- 成功予測アルゴリズム

### 1.3 ターゲット
25-40歳の真剣な交際を求める独身男女（日本国内）

## 2. システムアーキテクチャ

### 2.1 全体構成
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                       │
├─────────────────────────────────────────────────────────────┤
│ React Native App      │ Web Dashboard    │ Admin Panel      │
│ (iOS/Android)         │ (PWA)           │ (Management)     │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                          │
├─────────────────────────────────────────────────────────────┤
│ • Authentication & Authorization                            │
│ • Rate Limiting & Throttling                               │
│ • Request/Response Logging                                 │
│ • API Versioning                                           │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Microservices Layer                       │
├─────────────────────────────────────────────────────────────┤
│ User Service    │ Matching     │ AI Coaching  │ Analytics   │
│ • Profile Mgmt  │ Service      │ Service      │ Service     │
│ • Auth          │ • Algorithm  │ • NLP        │ • Insights  │
│ • Preferences   │ • Scoring    │ • Prediction │ • Reports   │
│                 │              │              │             │
│ Communication   │ Notification │ Content      │ Payment     │
│ Service         │ Service      │ Service      │ Service     │
│ • Messaging     │ • Push       │ • Moderation │ • Billing   │
│ • Chat Analysis │ • Email      │ • Safety     │ • Stripe    │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                           │
├─────────────────────────────────────────────────────────────┤
│ PostgreSQL      │ Redis Cache  │ MongoDB      │ S3 Storage  │
│ • User Data     │ • Sessions   │ • Logs       │ • Media     │
│ • Transactions  │ • Real-time  │ • Analytics  │ • Backups   │
│ • Relationships │ • Temp Data  │ • ML Data    │ • Static    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 AI/ML Pipeline
```
┌─────────────────────────────────────────────────────────────┐
│                      AI/ML Services                         │
├─────────────────────────────────────────────────────────────┤
│ NLP Processing  │ Sentiment     │ Compatibility │ Prediction │
│ • Text Analysis │ Analysis      │ Algorithm     │ Engine     │
│ • Intent Recog  │ • Emotion     │ • Scoring     │ • Success  │
│ • Response Gen  │ • Mood Track  │ • Matching    │ • Timing   │
│                 │               │               │            │
│ Model Training  │ Data Pipeline │ Feature Eng   │ Validation │
│ • Continuous    │ • ETL         │ • Processing  │ • A/B Test │
│ • Feedback Loop │ • Real-time   │ • Selection   │ • Metrics  │
└─────────────────────────────────────────────────────────────┘
```

## 3. 技術スタック

### 3.1 フロントエンド
- **モバイルアプリ**: React Native (iOS/Android)
- **Webアプリ**: React + TypeScript + PWA
- **管理画面**: React + Material-UI
- **状態管理**: Redux Toolkit + RTK Query
- **UI**: Native Base + Styled Components

### 3.2 バックエンド
- **API**: Node.js + Express + TypeScript
- **認証**: Auth0 / Firebase Auth
- **API Gateway**: Kong / AWS API Gateway
- **WebSocket**: Socket.io
- **ファイル処理**: Multer + Sharp

### 3.3 AI/ML
- **主要フレームワーク**: Python + FastAPI
- **NLP**: Transformers + BERT (日本語特化)
- **ML**: scikit-learn + TensorFlow
- **リアルタイム推論**: TensorFlow Serving
- **特徴量管理**: MLflow

### 3.4 データベース
- **メインDB**: PostgreSQL 14+
- **キャッシュ**: Redis 7+
- **ドキュメント**: MongoDB 6+
- **検索**: Elasticsearch 8+
- **ファイル**: AWS S3 / CloudFlare R2

### 3.5 インフラ
- **コンテナ**: Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **監視**: Prometheus + Grafana
- **ログ**: ELK Stack
- **セキュリティ**: HashiCorp Vault

## 4. データベース設計

### 4.1 主要テーブル構造

```sql
-- ユーザー情報
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    profile_data JSONB NOT NULL,
    preferences JSONB NOT NULL,
    personality_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active'
);

-- マッチング情報
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID REFERENCES users(id),
    user_id_2 UUID REFERENCES users(id),
    compatibility_score DECIMAL(5,4),
    match_algorithm VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    matched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id_1, user_id_2)
);

-- 関係進展状況
CREATE TABLE relationship_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id),
    stage VARCHAR(30), -- interest, trust, intimacy, conviction, dating
    progress_score INTEGER CHECK (progress_score >= 0 AND progress_score <= 100),
    ai_analysis JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- メッセージ分析
CREATE TABLE message_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id),
    sender_id UUID REFERENCES users(id),
    message_content TEXT,
    sentiment_score DECIMAL(3,2),
    emotion_data JSONB,
    ai_insights JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI推奨アクション
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    match_id UUID REFERENCES matches(id),
    recommendation_type VARCHAR(50),
    content JSONB,
    success_probability DECIMAL(5,4),
    executed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 体験価値指標
CREATE TABLE experience_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    his_score INTEGER CHECK (his_score >= 0 AND his_score <= 100), -- Hope Realization Score
    daily_hope_moments INTEGER DEFAULT 0,
    progress_feeling DECIMAL(3,2),
    continuation_motivation DECIMAL(3,2),
    measured_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Redis データ構造

```
# セッション管理
session:{user_id} -> {
    "active": true,
    "last_activity": timestamp,
    "device_info": {...}
}

# リアルタイム通知
notifications:{user_id} -> [
    {
        "type": "match_update",
        "content": {...},
        "timestamp": timestamp
    }
]

# AI処理キャッシュ
ai_cache:{user_id}:{analysis_type} -> {
    "result": {...},
    "ttl": 3600
}

# マッチング候補
match_candidates:{user_id} -> [
    {
        "candidate_id": "uuid",
        "score": 0.85,
        "cached_at": timestamp
    }
]
```

## 5. API設計

### 5.1 認証・ユーザー管理

```typescript
// ユーザー登録
POST /api/v1/auth/register
{
    "email": "user@example.com",
    "password": "secure_password",
    "profile": {
        "name": "田中太郎",
        "age": 28,
        "gender": "male",
        "location": "東京都"
    }
}

// プロファイル更新
PUT /api/v1/users/profile
{
    "basic_info": {...},
    "preferences": {...},
    "personality": {...}
}

// 個性診断結果
POST /api/v1/users/personality-assessment
{
    "answers": [...],
    "assessment_type": "big5"
}
```

### 5.2 マッチング・相性分析

```typescript
// 相性度取得
GET /api/v1/matches/{user_id}/compatibility
Response: {
    "compatibility_score": 0.78,
    "breakdown": {
        "personality": 0.85,
        "values": 0.71,
        "lifestyle": 0.80
    },
    "success_probability": 0.73
}

// マッチング候補取得
GET /api/v1/matches/candidates?limit=10
Response: {
    "candidates": [
        {
            "user_id": "uuid",
            "compatibility_score": 0.89,
            "preview_data": {...}
        }
    ]
}
```

### 5.3 AI コーチング

```typescript
// メッセージ提案
POST /api/v1/ai/message-suggestions
{
    "match_id": "uuid",
    "context": "first_message",
    "conversation_history": [...]
}
Response: {
    "suggestions": [
        {
            "content": "こんにちは！プロフィールの旅行の写真、とても素敵ですね。",
            "tone": "friendly",
            "success_probability": 0.82
        }
    ]
}

// 関係進展分析
GET /api/v1/ai/relationship-analysis/{match_id}
Response: {
    "current_stage": "trust",
    "progress_score": 65,
    "next_milestone": "plan_first_date",
    "recommendations": [...]
}
```

### 5.4 体験価値測定

```typescript
// 希望実感スコア記録
POST /api/v1/experience/his-score
{
    "score": 75,
    "context": "received_positive_response",
    "match_id": "uuid"
}

// 毎日の体験価値レポート
GET /api/v1/experience/daily-report
Response: {
    "his_average": 72,
    "hope_moments_count": 4,
    "progress_highlights": [...],
    "motivational_insights": [...]
}
```

## 6. AI/MLコンポーネント設計

### 6.1 相性分析アルゴリズム

```python
class CompatibilityAnalyzer:
    def __init__(self):
        self.personality_model = PersonalityMatchModel()
        self.values_model = ValuesAlignmentModel()
        self.lifestyle_model = LifestyleCompatibilityModel()
        
    def calculate_compatibility(self, user1_data, user2_data):
        personality_score = self.personality_model.predict(user1_data, user2_data)
        values_score = self.values_model.predict(user1_data, user2_data)
        lifestyle_score = self.lifestyle_model.predict(user1_data, user2_data)
        
        # 重み付き平均
        overall_score = (
            personality_score * 0.4 +
            values_score * 0.35 +
            lifestyle_score * 0.25
        )
        
        return {
            'overall': overall_score,
            'breakdown': {
                'personality': personality_score,
                'values': values_score,
                'lifestyle': lifestyle_score
            }
        }
```

### 6.2 感情分析エンジン

```python
class EmotionAnalysisEngine:
    def __init__(self):
        self.bert_model = AutoModel.from_pretrained('cl-tohoku/bert-base-japanese')
        self.emotion_classifier = EmotionClassifier()
        
    def analyze_message(self, text, context=None):
        # BERT特徴量抽出
        features = self.extract_features(text)
        
        # 感情分類
        emotions = self.emotion_classifier.predict(features)
        
        # 文脈考慮
        if context:
            emotions = self.adjust_for_context(emotions, context)
            
        return {
            'sentiment_score': emotions['sentiment'],
            'emotion_breakdown': emotions['categories'],
            'confidence': emotions['confidence']
        }
```

### 6.3 成功予測モデル

```python
class RelationshipSuccessPredictor:
    def __init__(self):
        self.feature_extractor = FeatureExtractor()
        self.gradient_boosting_model = LGBMRegressor()
        
    def predict_success_probability(self, match_data, interaction_history):
        features = self.feature_extractor.extract(match_data, interaction_history)
        
        # 成功確率予測
        probability = self.gradient_boosting_model.predict(features)
        
        # 時系列考慮
        time_weighted_probability = self.apply_time_decay(probability, interaction_history)
        
        return {
            'success_probability': time_weighted_probability,
            'confidence_interval': self.calculate_confidence(features),
            'key_factors': self.get_feature_importance(features)
        }
```

## 7. セキュリティ設計

### 7.1 データ保護
- **暗号化**: AES-256-GCM（保存時）、TLS 1.3（転送時）
- **個人情報仮名化**: SHA-256ハッシュ化
- **データ最小化**: 必要最小限のデータのみ収集・保存
- **削除機能**: GDPR準拠の完全削除機能

### 7.2 認証・認可
- **多要素認証**: SMS/Email + Biometric
- **OAuth 2.0 + OpenID Connect**
- **JWT with Refresh Token**
- **ゼロトラスト・アーキテクチャ**

### 7.3 API セキュリティ
- **Rate Limiting**: ユーザー毎・エンドポイント毎
- **Input Validation**: スキーマベース検証
- **OWASP対策**: SQL Injection, XSS, CSRF対策
- **API Gateway**: Kong with Security Plugins

## 8. 監視・運用

### 8.1 監視指標

```yaml
# システム監視
system_metrics:
  - cpu_usage
  - memory_usage
  - disk_io
  - network_latency
  - response_time

# ビジネス監視
business_metrics:
  - daily_active_users
  - match_success_rate
  - his_score_average
  - retention_rate
  - conversation_continuation_rate

# AI/ML監視
ml_metrics:
  - model_accuracy
  - prediction_drift
  - inference_latency
  - feature_importance_changes
```

### 8.2 ログ設計

```json
{
  "timestamp": "2025-05-29T10:30:00Z",
  "level": "INFO",
  "service": "ai-coaching",
  "user_id": "hashed_user_id",
  "action": "message_suggestion_generated",
  "metadata": {
    "match_id": "uuid",
    "suggestion_type": "conversation_starter",
    "success_probability": 0.82,
    "processing_time_ms": 150
  }
}
```

## 9. スケーラビリティ設計

### 9.1 水平スケーリング戦略
- **Microservices**: 独立したスケーリング
- **Container Orchestration**: Kubernetes with HPA
- **Database Sharding**: ユーザーIDベース
- **CDN**: CloudFlare for static assets

### 9.2 負荷分散
- **API Gateway**: Kong with load balancing
- **Database**: Read Replicas + Connection Pooling
- **Cache**: Redis Cluster
- **Message Queue**: Apache Kafka for async processing

## 10. 開発・デプロイメント

### 10.1 開発環境
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://localhost:5432/miru_dev
    
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: miru_dev
      POSTGRES_PASSWORD: dev_password
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
      
  ai_service:
    build: ./ai-service
    ports:
      - "8000:8000"
    volumes:
      - ./models:/app/models
```

### 10.2 CI/CD パイプライン
```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm test
          python -m pytest ai-service/tests/
          
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Security scan
        run: |
          npm audit
          safety check
          
  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          kubectl apply -f k8s/
```

## 11. パフォーマンス要件

### 11.1 レスポンス時間目標
- **API レスポンス**: < 200ms (95パーセンタイル)
- **AI 推論**: < 500ms
- **ページ読み込み**: < 2秒
- **リアルタイム通知**: < 100ms

### 11.2 スループット目標
- **同時接続ユーザー**: 100,000人
- **API リクエスト**: 10,000 RPS
- **メッセージ処理**: 1,000 messages/sec
- **AI 分析**: 500 analyses/sec

## 12. 災害復旧・事業継続

### 12.1 バックアップ戦略
- **データベース**: 毎日自動バックアップ + PITR
- **ファイル**: 地理的分散レプリケーション
- **設定**: Infrastructure as Code (Terraform)

### 12.2 障害対応
- **自動復旧**: ヘルスチェック + 自動再起動
- **フェイルオーバー**: Multi-AZ 配置
- **RTO**: 15分以内
- **RPO**: 1時間以内

この設計書は、Miruの本質的な価値である「付き合えるかもしれない」という体験を技術的に実現するための包括的な設計となっています。
# ビール特化プロンプトオーケストレーションシステム

## 1. システム概要

ビールに関する情報収集、選択、体験記録を支援するプロンプト提供システム。ユーザーのビールの好みや状況を把握し、ChatGPTやClaudeで使える最適なプロンプトを提供。

## 2. コア機能

### 2.1 ビールコンテキスト管理

```typescript
interface BeerContext {
    // ユーザーのビール情報
    userId: string;
    
    // 好みプロファイル
    preferences: {
        favoriteStyles: string[];      // IPA, ピルスナー, スタウト等
        flavorProfile: {
            bitterness: number;        // 1-10 (苦味耐性)
            sweetness: number;         // 1-10 (甘味好み)
            sourness: number;          // 1-10 (酸味好み)
            richness: number;          // 1-10 (濃厚さ好み)
        };
        alcoholTolerance: 'low' | 'medium' | 'high';
        avoidIngredients: string[];    // アレルギー等
    };
    
    // 飲酒履歴
    history: {
        triedBeers: Beer[];
        ratings: BeerRating[];
        favoriteBreweries: string[];
        visitedBars: Bar[];
    };
    
    // 現在の状況
    currentState: {
        mood: string;                  // 気分
        occasion: string;              // 飲む機会（自宅、バー、パーティー等）
        budget: number;                // 予算
        availability: string;          // 地域・入手可能性
    };
    
    // 目標
    goals: {
        explorationGoals: string[];    // 試したいスタイル
        knowledgeGoals: string[];      // 学びたいこと
        experienceGoals: string[];     // 体験したいこと
    };
}
```

### 2.2 ビール専用プロンプト生成

```typescript
class BeerPromptGenerator {
    
    // ビール選択プロンプト
    generateBeerSelectionPrompt(context: BeerContext): string {
        return `
私のビールの好み：
- 好きなスタイル: ${context.preferences.favoriteStyles.join(', ')}
- 苦味耐性: ${context.preferences.flavorProfile.bitterness}/10
- 好みの濃さ: ${context.preferences.flavorProfile.richness}/10
${context.preferences.avoidIngredients.length > 0 ? `- 避けたい原材料: ${context.preferences.avoidIngredients.join(', ')}` : ''}

現在の状況：
- 気分: ${context.currentState.mood}
- 機会: ${context.currentState.occasion}
- 予算: ${context.currentState.budget}円
- 場所: ${context.currentState.availability}

最近飲んで良かったビール：
${this.formatRecentFavorites(context.history)}

上記の情報を踏まえて、今の私に最適なビールを3-5本推薦してください。
それぞれについて、なぜおすすめなのか、味の特徴、入手方法も教えてください。
`;
    }
    
    // ビアバー訪問プロンプト
    generateBeerBarPrompt(context: BeerContext, location: string): string {
        return `
${location}周辺のビアバーを訪問したいと考えています。

私のビール嗜好：
${this.formatPreferences(context.preferences)}

希望条件：
- 予算: ${context.currentState.budget}円/人
- 雰囲気: ${context.currentState.mood}な感じ
- 試したいスタイル: ${context.goals.explorationGoals.join(', ')}

以下の点を含めて、おすすめのビアバーを教えてください：
1. 店名と場所
2. ビールのラインナップ特徴
3. 私の好みに合いそうな具体的なビール
4. 料理のおすすめ
5. 訪問のベストタイミング
`;
    }
    
    // ビール知識学習プロンプト
    generateBeerLearningPrompt(context: BeerContext, topic: string): string {
        const prompts = {
            brewing: `
ビール醸造について学びたいです。
私の現在の知識レベル: ${this.assessKnowledgeLevel(context)}
特に興味があるスタイル: ${context.preferences.favoriteStyles.join(', ')}

以下について、初心者にも分かりやすく説明してください：
1. 基本的な醸造プロセス
2. ${context.preferences.favoriteStyles[0]}の特徴的な製法
3. 自宅でも理解できる味の違いの要因
4. 次に試すべきビールの選び方
`,
            tasting: `
ビールのテイスティング方法を学びたいです。

よく飲むビール: ${this.formatFrequentBeers(context.history)}
苦手な表現: 専門用語が多すぎるもの

以下を含めて、実践的なテイスティング方法を教えてください：
1. 五感を使った評価方法
2. 私がよく飲むビールで練習する方法
3. 味の違いを言語化するコツ
4. テイスティングノートの付け方
`
        };
        
        return prompts[topic] || this.generateGenericLearningPrompt(context, topic);
    }
    
    // ビール体験記録プロンプト
    generateBeerLoggingPrompt(beerName: string): string {
        return `
今飲んだビール「${beerName}」について、以下の観点から記録を作成してください：

外観：
- 色: [入力してください]
- 泡: [入力してください]
- 透明度: [入力してください]

香り：
- 第一印象: [入力してください]
- 具体的な香り: [入力してください]

味わい：
- 最初の印象: [入力してください]
- 中盤の味: [入力してください]
- 後味: [入力してください]
- 苦味: [1-10で評価]
- 甘味: [1-10で評価]

総合評価：
- 点数: [1-10]
- また飲みたいか: [はい/いいえ]
- おすすめシチュエーション: [入力してください]

この情報を構造化されたJSON形式でまとめてください。
`;
    }
}
```

### 2.3 データインポート用プロンプト

```typescript
class BeerDataImportPrompts {
    
    // Untappdプロフィール解析プロンプト
    generateUntappdAnalysisPrompt(): string {
        return `
私のUntappdプロフィールとチェックイン履歴のスクリーンショットから、ビールの好みと傾向を詳細に分析してください。

抽出・分析してほしい情報：

1. **飲酒履歴の統計**
   - 総チェックイン数とユニークビール数
   - 最もチェックインしているビアスタイル（上位5つ）
   - 平均評価スコアと評価の分布
   - チェックイン頻度（週/月あたり）

2. **ブルワリーの好み**
   - 最も頻繁にチェックインしているブルワリー（上位10）
   - 高評価を付けているブルワリーの特徴
   - 国別・地域別の傾向

3. **ビアスタイルの詳細分析**
   - 各スタイルごとの平均評価
   - 季節ごとの飲酒傾向
   - 苦味（IBU）、アルコール度数（ABV）の好み範囲
   - 避けているスタイル（低評価パターン）

4. **レビューコメントの分析**
   - よく使うフレーバー表現
   - ポジティブ/ネガティブなキーワード
   - 重視している要素（香り、味、のど越しなど）

5. **探索パターン**
   - 新しいビールを試す頻度
   - 同じビールを繰り返し飲む傾向
   - 限定ビールやコラボビールへの関心度

以下のJSON形式で構造化してください：
{
  "statistics": {
    "total_checkins": 数値,
    "unique_beers": 数値,
    "avg_rating": 数値,
    "checkin_frequency": "週X回"
  },
  "style_preferences": {
    "top_styles": [
      {"style": "IPA", "count": 数値, "avg_rating": 数値},
      ...
    ],
    "ibu_preference": "X-Y",
    "abv_preference": "X%-Y%"
  },
  "brewery_preferences": {
    "top_breweries": [
      {"name": "ブルワリー名", "checkins": 数値, "avg_rating": 数値},
      ...
    ],
    "geographic_preference": ["国/地域"],
    "brewery_size_preference": "マイクロ/中規模/大手"
  },
  "flavor_profile": {
    "preferred_flavors": ["ホップ", "シトラス", ...],
    "avoided_flavors": ["スモーク", ...],
    "texture_preference": "ライト/ミディアム/フル"
  },
  "exploration_behavior": {
    "new_beer_ratio": "X%",
    "repeat_favorites": ["ビール名", ...],
    "limited_edition_interest": "高/中/低"
  },
  "insights": [
    "ホップフォワードなビールを好む傾向",
    "地元のマイクロブルワリーを積極的に開拓",
    ...
  ]
}
`;
    }
    
    // Instagram投稿解析プロンプト
    generateInstagramBeerAnalysisPrompt(): string {
        return `
私のInstagramのビール関連投稿（写真とキャプション）から、ビールの好みとライフスタイルを分析してください。

分析項目：

1. **投稿パターン**
   - ビール投稿の頻度
   - 投稿する曜日・時間帯の傾向
   - 場所（自宅/バー/ブルワリー/屋外）

2. **ビジュアル分析**（写真から読み取れる情報）
   - ビールのスタイル（色、泡、グラスの形状）
   - 飲んでいる環境・シチュエーション
   - 一緒に写っている料理やおつまみ

3. **キャプション分析**
   - 使用しているハッシュタグ
   - ビールの説明で使う表現
   - 感情表現（楽しい、リラックス、発見など）
   - メンションしているブルワリーや店舗

4. **ソーシャル要素**
   - 誰と飲んでいるか（一人/友人/パートナー）
   - ビールイベントへの参加
   - ビアバーやブルワリー訪問の頻度

5. **ライフスタイル分析**
   - ビールを楽しむタイミング
   - ペアリングの好み
   - 特別な日のビール選択

JSON形式での出力：
{
  "posting_patterns": {
    "frequency": "週X回",
    "typical_timing": ["金曜夜", "週末午後"],
    "locations": {
      "home": X%,
      "bars": X%,
      "breweries": X%,
      "outdoor": X%
    }
  },
  "visual_analysis": {
    "common_styles": ["ペールエール", "IPA", ...],
    "glassware": ["パイント", "チューリップ", ...],
    "settings": ["カジュアル", "おしゃれ", ...]
  },
  "caption_insights": {
    "common_hashtags": ["#craftbeer", "#地ビール", ...],
    "flavor_vocabulary": ["フルーティー", "ホッピー", ...],
    "emotion_expressions": ["最高", "癒し", ...]
  },
  "social_context": {
    "drinking_companions": "主に友人と",
    "event_participation": "月1-2回",
    "brewery_visits": "積極的"
  },
  "lifestyle_insights": [
    "週末のリラックスタイムにクラフトビール",
    "料理とのペアリングを重視",
    "新しいブルワリー開拓が趣味"
  ]
}
`;
    }
    
    // ビールレビューサイト統合解析プロンプト
    generateMultiPlatformAnalysisPrompt(): string {
        return `
複数のプラットフォーム（Untappd、RateBeer、BeerAdvocate、個人ブログ等）での私のビールレビューを統合的に分析してください。

分析の観点：

1. **レビュースタイルの違い**
   - 各プラットフォームでの評価傾向の差
   - 詳細度の違い（短評vs長文レビュー）
   - 専門用語の使用頻度

2. **一貫している好み**
   - すべてのプラットフォームで高評価のスタイル/ブルワリー
   - 共通して言及される好みの要素
   - 避けている要素

3. **ビール探索方法**
   - 新しいビールの発見経路
   - 推薦や評判を参考にする度合い
   - 冒険的な選択vs安全な選択

4. **知識レベルと成長**
   - ビール用語の理解度
   - テイスティング能力の向上
   - 興味の広がり（初期→現在）

5. **購買行動の示唆**
   - 価格感度
   - 入手困難なビールへの執着度
   - まとめ買いやセラーリングの傾向

統合分析結果：
{
  "cross_platform_consistency": {
    "rating_variance": "プラットフォーム間の評価の一貫性",
    "common_favorites": ["一貫して高評価のビール/ブルワリー"],
    "universal_preferences": ["すべてで言及される好み"]
  },
  "review_behavior": {
    "detail_level": {
      "untappd": "簡潔",
      "ratebeer": "詳細",
      "blog": "エッセイ風"
    },
    "vocabulary_sophistication": "初級/中級/上級"
  },
  "discovery_patterns": {
    "sources": ["店員推薦", "SNS", "評価サイト"],
    "risk_taking": "保守的/バランス型/冒険的",
    "brand_loyalty": "高/中/低"
  },
  "evolution": {
    "initial_preferences": ["最初の頃の好み"],
    "current_preferences": ["現在の好み"],
    "knowledge_growth": "顕著な成長が見られる"
  },
  "purchasing_insights": {
    "price_sensitivity": "価格重視/品質重視/バランス型",
    "rarity_seeking": "限定品への関心度",
    "storage_behavior": "即飲み/セラーリング"
  },
  "composite_profile": {
    "summary": "ホップ系を中心に幅広く探索する中級者",
    "next_recommendations": ["次に試すべきスタイル/ブルワリー"],
    "growth_opportunities": ["さらに深めるべき領域"]
  }
}
`;
    }
    
    // ビール探索行動分析プロンプト
    generateBeerSearchBehaviorPrompt(): string {
        return `
私のビール関連の検索履歴、保存した記事、ブックマーク、フォローしているアカウントなどから、どのようにビールを探しているか分析してください。

分析項目：

1. **情報源の傾向**
   - よく参照するウェブサイト/アプリ
   - フォローしているビール関連アカウント
   - 信頼している情報源

2. **検索パターン**
   - よく検索するキーワード
   - 検索する状況（新しい店、旅行先、イベント前など）
   - 事前リサーチの深さ

3. **意思決定プロセス**
   - 重視する情報（評価、説明、画像など）
   - 決め手となる要因
   - 却下する理由

4. **ブルワリーへの関心**
   - フォローしているブルワリー
   - ブルワリーのストーリーへの関心度
   - 地元vs海外ブルワリーの比率

出力形式：
{
  "information_sources": {
    "primary": ["Untappd", "Instagram"],
    "trusted_accounts": ["@craftbeerjp", ...],
    "reference_sites": ["ビール図鑑", ...]
  },
  "search_patterns": {
    "common_queries": ["IPA 新作", "〇〇駅 クラフトビール"],
    "search_triggers": ["週末の予定", "新規開拓"],
    "research_depth": "徹底的/適度/最小限"
  },
  "decision_factors": {
    "important": ["スタイル", "ABV", "評価"],
    "moderate": ["価格", "入手性"],
    "low": ["パッケージデザイン"]
  },
  "brewery_interests": {
    "following": ["ブルワリー名リスト"],
    "preference_type": "ストーリー重視/品質重視/トレンド重視",
    "geographic_interest": "ローカル重視/グローバル探索"
  }
}
`;
    }
    
    // ビール画像履歴の包括的解析プロンプト
    generateBeerPhotoHistoryAnalysisPrompt(): string {
        return `
私が撮影・保存したビールの画像履歴（スマートフォンのカメラロール、Googleフォト、iCloud写真など）から、ビールの好みと飲酒パターンを包括的に分析してください。

画像から読み取ってほしい情報：

1. **ビール自体の視覚情報**
   - ビールの色（ゴールド/アンバー/ブラウン/ブラック）
   - 泡の状態（高さ、きめ細かさ、持続性）
   - グラスの種類（パイント/チューリップ/ヴァイツェン/スニフター等）
   - 透明度（クリア/ヘイジー/濁り）
   - 量（フル/半分/少量）

2. **ラベル・パッケージ情報**
   - ブルワリー名
   - ビール名
   - スタイル表記
   - ABV（アルコール度数）
   - 缶/瓶のデザイン傾向

3. **飲んでいる環境**
   - 場所（自宅/バー/レストラン/屋外/イベント）
   - 時間帯（昼/夕方/夜）の推定
   - 季節感（服装、背景から推測）
   - 同席者の有無

4. **一緒に写っているもの**
   - 料理・おつまみの種類
   - 複数のビール（飲み比べ）
   - ビールフライト
   - グラウラーやクラウラー

5. **時系列での変化**
   - 最も古い画像と最新の画像の比較
   - スタイルの変遷
   - グラスウェアへのこだわりの変化
   - 撮影頻度の推移

6. **特殊なパターン**
   - 限定ビールの割合
   - 同じビールの繰り返し登場
   - 特定のブルワリーへの偏り
   - 旅行先でのビール

分析結果のJSON形式：
{
  "photo_statistics": {
    "total_photos": 数値,
    "date_range": "YYYY-MM-DD to YYYY-MM-DD",
    "frequency": "週X枚",
    "peak_periods": ["時期"]
  },
  "beer_characteristics": {
    "color_distribution": {
      "golden": X%,
      "amber": X%,
      "brown": X%,
      "black": X%
    },
    "clarity_preference": "クリア寄り/ヘイジー寄り",
    "common_styles": ["IPA", "Stout", ...],
    "abv_range": "X%-Y%が中心"
  },
  "consumption_patterns": {
    "primary_locations": {
      "home": X%,
      "bars": X%,
      "restaurants": X%,
      "breweries": X%,
      "outdoor": X%
    },
    "social_context": "ソロ多め/グループ多め",
    "food_pairing": ["よく一緒に写る料理"],
    "seasonal_trends": {
      "spring": ["軽めのスタイル"],
      "summer": ["ホッピーなビール"],
      "fall": ["アンバー系"],
      "winter": ["高ABV、ダーク系"]
    }
  },
  "brewery_insights": {
    "most_photographed": ["ブルワリー名（回数）"],
    "geographic_diversity": "ローカル中心/国内広範/国際的",
    "brewery_loyalty": ["リピート率の高いブルワリー"]
  },
  "evolution_timeline": {
    "early_phase": "ラガー中心の大手ビール",
    "exploration_phase": "クラフトビールへの移行",
    "current_phase": "特定スタイルへの深化",
    "sophistication_indicators": [
      "グラスウェアの適切な使用",
      "専門的なスタイルの増加",
      "限定品の割合上昇"
    ]
  },
  "unique_insights": [
    "IPA系を中心に、季節で濃淡を使い分ける",
    "地元ブルワリーへの強いロイヤリティ",
    "料理とのペアリングを重視する傾向",
    "特別な日には高ABVのバレルエイジドを選ぶ"
  ],
  "recommendations": {
    "unexplored_styles": ["まだ試していないが好みに合いそうなスタイル"],
    "next_breweries": ["訪問すべきブルワリー"],
    "seasonal_suggestions": ["今の季節におすすめ"]
  }
}

注意：プライバシーに配慮し、人物の顔や個人情報は分析対象外としてください。
`;
    }
}
```

## 3. 実際の使用フロー

### 3.1 今飲むビールを選ぶ

```typescript
// ユーザーの現在の状況入力
const currentSituation = {
    mood: "リラックスしたい",
    occasion: "自宅で夕食後",
    budget: 500,
    availability: "近所のコンビニ"
};

// プロンプト生成
const prompt = generator.generateBeerSelectionPrompt(userContext);

// → ユーザーがChatGPT/Claudeにコピペ
// → AIからの推薦を受け取る
// → 結果をアプリに保存（オプション）
```

### 3.2 ビアバー訪問計画

```typescript
// 訪問予定入力
const visitPlan = {
    location: "渋谷",
    date: "今週末",
    purpose: "新しいIPAを試したい"
};

// プロンプト生成
const prompt = generator.generateBeerBarPrompt(userContext, visitPlan.location);

// → ユーザーが実行
// → おすすめバーリストを取得
// → 訪問後に体験を記録
```

## 4. シンプルなUI設計

```typescript
// メイン画面
interface MainScreen {
    quickActions: [
        { icon: "🍺", label: "今飲むビールを選ぶ", action: "selectBeer" },
        { icon: "📍", label: "ビアバーを探す", action: "findBar" },
        { icon: "📝", label: "飲んだビールを記録", action: "logBeer" },
        { icon: "📚", label: "ビールについて学ぶ", action: "learnBeer" }
    ];
    
    recentPrompts: PromptHistory[];
    beerStats: {
        totalTried: number;
        favoriteStyle: string;
        thisMonthCount: number;
    };
}

// プロンプト表示画面
interface PromptDisplay {
    title: string;
    prompt: string;  // コピー可能なテキスト
    copyButton: boolean;
    instructions: string[];
    importBackButton: boolean;
}
```

## 5. データベース（シンプル版）

```sql
-- ユーザーのビールコンテキスト
CREATE TABLE beer_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    preferences JSONB NOT NULL DEFAULT '{}',
    history JSONB NOT NULL DEFAULT '[]',
    current_state JSONB NOT NULL DEFAULT '{}',
    goals JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ビール記録
CREATE TABLE beer_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES beer_contexts(user_id),
    beer_name VARCHAR(200) NOT NULL,
    brewery VARCHAR(200),
    style VARCHAR(100),
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    notes TEXT,
    location VARCHAR(200),
    price INTEGER,
    logged_at TIMESTAMP DEFAULT NOW()
);

-- 生成されたプロンプト履歴
CREATE TABLE prompt_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES beer_contexts(user_id),
    prompt_type VARCHAR(50),
    prompt_content TEXT,
    used_count INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 6. MVP実装（超シンプル版）

```typescript
// Cloudflare Worker（API）
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
        // プロンプト生成エンドポイント
        if (url.pathname === '/api/generate-prompt') {
            const { userId, promptType, params } = await request.json();
            
            // ユーザーコンテキスト取得
            const context = await getUserContext(env.DB, userId);
            
            // プロンプト生成
            const prompt = generatePrompt(promptType, context, params);
            
            return Response.json({ prompt });
        }
        
        // ビール記録エンドポイント
        if (url.pathname === '/api/log-beer') {
            const { userId, beerLog } = await request.json();
            
            await saveBeerLog(env.DB, userId, beerLog);
            await updateUserContext(env.DB, userId, beerLog);
            
            return Response.json({ success: true });
        }
    }
};
```

これで、**ビールに特化した**シンプルなプロンプトオーケストレーションシステムの設計ができました！
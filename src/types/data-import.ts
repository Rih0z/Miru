export interface DataImportPromptConfig {
  userId: string
  includeScreenshots: boolean
  targetApps: string[]
  focusAreas: ('basic_info' | 'communication' | 'feelings' | 'timeline' | 'goals')[]
}

export interface ImportedUserData {
  connections: ImportedConnection[]
  userProfile: ImportedUserProfile
  overallGoals: string[]
  importMetadata: ImportMetadata
}

export interface ImportedConnection {
  nickname: string
  realName?: string
  age?: number
  platform: string
  profileUrl?: string
  photos?: string[]
  
  // 基本情報
  occupation?: string
  location?: string
  education?: string
  hobbies: string[]
  interests: string[]
  
  // コミュニケーション履歴
  firstContact: {
    date: string
    method: 'app_message' | 'like' | 'super_like' | 'match'
    content?: string
  }
  
  messageHistory: {
    date: string
    sender: 'user' | 'them'
    content: string
    platform: string
    attachments?: string[]
  }[]
  
  meetingHistory: {
    date: string
    type: 'first_date' | 'casual_meet' | 'formal_date' | 'activity'
    location?: string
    duration?: string
    outcome: 'positive' | 'neutral' | 'negative'
    notes: string
  }[]
  
  // 現在の状況
  currentStage: 'matching' | 'chatting' | 'planning_date' | 'dating' | 'relationship' | 'complicated' | 'ended'
  lastInteraction: {
    date: string
    type: 'message' | 'date' | 'call' | 'social_media'
    content: string
  }
  
  responsePatterns: {
    averageResponseTime: string
    messageLength: 'short' | 'medium' | 'long'
    emoji_usage: 'none' | 'minimal' | 'moderate' | 'frequent'
    initiationFrequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'always'
  }
  
  // ユーザーの感情と評価
  attractionLevel: number // 1-10
  compatibilityScore: number // 1-10
  communicationScore: number // 1-10
  
  positiveTraits: string[]
  concerningTraits: string[]
  
  userFeelings: {
    excitement: number // 1-10
    anxiety: number // 1-10
    confidence: number // 1-10
    hopefulness: number // 1-10
  }
  
  // 目標と次のステップ
  personalGoals: string[]
  idealNextSteps: string[]
  concerns: string[]
  
  // プラットフォーム固有データ
  platformSpecific: {
    [key: string]: any
  }
}

export interface ImportedUserProfile {
  age: number
  gender: string
  location: string
  occupation: string
  education?: string
  
  relationshipGoals: ('casual' | 'serious' | 'marriage' | 'friendship' | 'unsure')[]
  datingExperience: 'beginner' | 'some_experience' | 'experienced' | 'very_experienced'
  
  personalityTraits: string[]
  hobbies: string[]
  dealBreakers: string[]
  
  currentApps: {
    appName: string
    accountStatus: 'active' | 'paused' | 'inactive'
    premiumFeatures: boolean
    dailyUsage: string
    successRate: number
  }[]
  
  communicationStyle: {
    preferredFirstMessage: string
    responseSpeed: 'immediate' | 'within_hour' | 'same_day' | 'next_day' | 'when_convenient'
    conversationDepth: 'light' | 'moderate' | 'deep'
    humorStyle: string[]
  }
}

export interface ImportMetadata {
  importDate: string
  dataSource: 'gemini' | 'claude' | 'chatgpt' | 'manual'
  completeness: number // 0-100
  screenshotsProvided: boolean
  appsAnalyzed: string[]
  timeRange: {
    from: string
    to: string
  }
  userConfirmed: boolean
}

export interface PromptStep {
  id: string
  title: string
  description: string
  required: boolean
  examples: string[]
  screenshotInstructions?: string
}

export interface GeneratedPrompt {
  id: string
  title: string
  fullPrompt: string
  steps: PromptStep[]
  expectedOutputSchema: any
  estimatedTime: string
}
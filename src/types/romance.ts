// 恋愛コンテキスト管理の型定義

export interface RomanceContext {
  userId: string;
  
  // 自分自身の情報
  selfProfile: {
    basicInfo: {
      age: number;
      gender: string;
      location: string;
      occupation: string;
    };
    personality: {
      traits: string[];
      communicationStyle: string;
      loveLanguage: string[];
      attachmentStyle: string;
    };
    lifestyle: {
      hobbies: string[];
      values: string[];
      lifeGoals: string[];
      dailyRoutine: string;
    };
    relationshipHistory: {
      pastExperiences: string[];
      lessons: string[];
      patterns: string[];
    };
  };
  
  // 現在の恋愛状況
  currentSituation: {
    status: 'searching' | 'talking' | 'dating' | 'exclusive';
    activeConnections: RomanceConnection[];
    challengesAndConcerns: string[];
    hopefulMoments: HopeMoment[];
  };
  
  // 理想と目標
  desiresAndGoals: {
    idealPartner: {
      mustHaves: string[];
      niceToHaves: string[];
      dealBreakers: string[];
    };
    relationshipGoals: {
      shortTerm: string[];
      longTerm: string[];
      relationshipStyle: string;
    };
  };
  
  // 体験価値の記録
  experienceTracking: {
    hisScore: number; // Hope Implementation Score
    progressMilestones: Milestone[];
    positiveExperiences: Experience[];
    growthAreas: string[];
  };
}

export interface RomanceConnection {
  personId: string;
  nickname: string; // プライバシー保護
  platform: string; // 出会った場所
  currentStage: 'initial' | 'conversation' | 'firstDate' | 'dating' | 'exclusive';
  compatibility: {
    perceivedScore: number;
    positiveFactors: string[];
    concerns: string[];
  };
  interactionHistory: {
    firstContact: Date;
    significantMoments: Moment[];
    lastInteraction: Date;
  };
  // 感情的な要素
  feelings: {
    excitement: number; // 1-10
    anxiety: number; // 1-10
    hopefulness: number; // 1-10
  };
  nextSteps: {
    planned: string[];
    suggested: string[];
    timeline: string;
  };
}

export interface HopeMoment {
  date: Date;
  description: string;
  connectionId?: string;
  hopeLevel: number; // 1-10
  category: 'message' | 'date' | 'milestone' | 'realization';
}

export interface Milestone {
  id: string;
  date: Date;
  type: 'first_message' | 'phone_call' | 'first_date' | 'exclusive' | 'custom';
  description: string;
  connectionId: string;
  impact: 'low' | 'medium' | 'high';
}

export interface Experience {
  id: string;
  date: Date;
  type: 'success' | 'learning' | 'growth';
  description: string;
  lesson?: string;
  connectionId?: string;
}

export interface Moment {
  date: Date;
  type: 'message' | 'call' | 'date' | 'milestone';
  description: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  significance: number; // 1-10
}